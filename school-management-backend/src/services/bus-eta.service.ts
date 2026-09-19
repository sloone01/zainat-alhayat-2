import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusArrivalEtaAlert } from '../entities/bus-arrival-eta-alert.entity';
import { Bus } from '../entities/bus.entity';
import { StudentService } from './student.service';
import { BusMovementService, type BusTripType } from './bus-movement.service';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import {
  orderStopsWithEta,
  shouldAlertApproaching,
  type EtaStopResult,
} from '../common/geo/bus-eta';

export type BusEtaSnapshot = {
  bus_id: string;
  trip_type: BusTripType;
  trip_date: string;
  stops: Array<{
    student_id: string;
    first_name: string;
    last_name: string;
    pickup_lat: number;
    pickup_lng: number;
    distance_m: number;
    eta_minutes: number;
    sequence: number;
  }>;
  next: {
    student_id: string;
    first_name: string;
    last_name: string;
    eta_minutes: number;
    sequence: number;
  } | null;
};

@Injectable()
export class BusEtaService {
  private readonly logger = new Logger(BusEtaService.name);

  constructor(
    @InjectRepository(BusArrivalEtaAlert)
    private readonly alertRepo: Repository<BusArrivalEtaAlert>,
    private readonly studentService: StudentService,
    private readonly busMovementService: BusMovementService,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
  ) {}

  private todayLocalDate(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async computeForBus(
    bus: Bus,
    opts: { tripType?: BusTripType; tripDate?: string } = {},
  ): Promise<BusEtaSnapshot | null> {
    if (bus.last_lat == null || bus.last_lng == null) return null;
    const tripType: BusTripType = opts.tripType === 'return' ? 'return' : 'going';
    const tripDate = opts.tripDate || this.todayLocalDate();

    const [students, movements] = await Promise.all([
      this.studentService.findByBusWithPickup(bus.id),
      this.busMovementService.findForBus(bus.id, {
        date: tripDate,
        tripType,
        limit: 800,
      }),
    ]);

    const lastByStudent = new Map<string, 'boarded' | 'dropped_off'>();
    // movements are DESC — first seen is the latest event for that student
    for (const m of movements) {
      const sid = String(m.student_id);
      if (!lastByStudent.has(sid)) {
        lastByStudent.set(sid, m.event_type);
      }
    }

    const candidates = students.filter((s) => {
      const lat = s.pickup_lat == null ? null : Number(s.pickup_lat);
      const lng = s.pickup_lng == null ? null : Number(s.pickup_lng);
      if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return false;
      }
      const last = lastByStudent.get(String(s.id));
      if (tripType === 'going') {
        // Still waiting for pickup
        return !last;
      }
      // Return: headed to drop-off (home = pickup point) while still onboard
      return last === 'boarded';
    });

    const ordered = orderStopsWithEta(
      Number(bus.last_lat),
      Number(bus.last_lng),
      candidates.map((s) => ({
        studentId: String(s.id),
        lat: Number(s.pickup_lat),
        lng: Number(s.pickup_lng),
      })),
    );

    const byId = new Map(candidates.map((s) => [String(s.id), s]));
    const stops = ordered.map((o: EtaStopResult) => {
      const s = byId.get(o.studentId)!;
      return {
        student_id: o.studentId,
        first_name: s.firstName,
        last_name: s.lastName,
        pickup_lat: o.lat,
        pickup_lng: o.lng,
        distance_m: o.distance_m,
        eta_minutes: o.eta_minutes,
        sequence: o.sequence,
      };
    });

    const next = stops[0]
      ? {
          student_id: stops[0].student_id,
          first_name: stops[0].first_name,
          last_name: stops[0].last_name,
          eta_minutes: stops[0].eta_minutes,
          sequence: stops[0].sequence,
        }
      : null;

    return {
      bus_id: bus.id,
      trip_type: tripType,
      trip_date: tripDate,
      stops,
      next,
    };
  }

  /** After a live GPS fix: recompute ETAs and push parents for the next stop in the 3–5 min window. */
  async afterPositionUpdate(
    bus: Bus,
    opts: { tripType?: BusTripType; tripDate?: string } = {},
  ): Promise<BusEtaSnapshot | null> {
    const snapshot = await this.computeForBus(bus, opts);
    if (!snapshot?.next) return snapshot;

    const next = snapshot.stops[0];
    if (!next || !shouldAlertApproaching(next.eta_minutes)) {
      return snapshot;
    }

    try {
      const existing = await this.alertRepo.findOne({
        where: {
          bus_id: bus.id,
          student_id: next.student_id,
          trip_date: snapshot.trip_date,
          trip_type: snapshot.trip_type,
        },
      });
      if (existing) return snapshot;

      const { schoolId, studentName, recipients } = await this.audience.parentsOfStudent(
        next.student_id,
      );
      if (!recipients.length) return snapshot;

      await this.alertRepo.save(
        this.alertRepo.create({
          bus_id: bus.id,
          student_id: next.student_id,
          trip_date: snapshot.trip_date,
          trip_type: snapshot.trip_type,
          eta_minutes: next.eta_minutes,
        }),
      );

      void this.notifications
        .notifySafe({
          schoolId,
          templateKey: NOTIFICATION_TEMPLATE_KEYS.BUS_APPROACHING,
          locale: 'ar',
          variables: {
            studentName,
            recipientName: recipients[0]?.name || 'ولي الأمر',
            etaMinutes: String(next.eta_minutes),
            busTitle: bus.title || '',
          },
          recipients,
          channels: ['push', 'sms'],
          pushData: {
            route: '/parent/dashboard',
            templateKey: NOTIFICATION_TEMPLATE_KEYS.BUS_APPROACHING,
            busId: bus.id,
            studentId: next.student_id,
            etaMinutes: String(next.eta_minutes),
          },
        })
        .catch((err) => {
          this.logger.warn(
            `bus approaching notify failed: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
    } catch (err) {
      this.logger.warn(
        `bus approaching alert skipped: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return snapshot;
  }
}
