import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusMovementLog } from '../entities/bus-movement-log.entity';
import { Student } from '../entities/student.entity';
import { BusService } from './bus.service';

export type BusMovementEventType = 'boarded' | 'dropped_off';

/** Going = to school (join trip). Return = back home (return trip). */
export type BusTripType = 'going' | 'return';

@Injectable()
export class BusMovementService {
  constructor(
    @InjectRepository(BusMovementLog)
    private logRepository: Repository<BusMovementLog>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private busService: BusService,
  ) {}

  private async assertStudentOnBus(
    busId: string,
    studentId: string,
  ): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['buses'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    const onBus = student.buses?.some((b) => b.id === busId);
    if (!onBus) {
      throw new BadRequestException(
        'Student is not assigned to this bus. Assign them on Transportation or Students first.',
      );
    }
  }

  private parseTripDate(tripDate: string): string {
    if (!tripDate || !/^\d{4}-\d{2}-\d{2}$/.test(tripDate)) {
      throw new BadRequestException(
        'tripDate is required (YYYY-MM-DD) for bus movements.',
      );
    }
    return tripDate;
  }

  private parseTripType(tripType: string | undefined): BusTripType {
    if (tripType !== 'going' && tripType !== 'return') {
      throw new BadRequestException('tripType must be going or return.');
    }
    return tripType;
  }

  private async findLastLogForDayTrip(
    busId: string,
    studentId: string,
    tripDate: string,
    tripType: BusTripType,
  ): Promise<BusMovementLog | null> {
    const row = await this.logRepository.findOne({
      where: {
        bus_id: busId,
        student_id: studentId,
        tripDate,
        tripType,
      },
      order: { logged_at: 'DESC' },
    });
    return row ?? null;
  }

  /**
   * One cycle per student per bus per day per trip: board once, then drop once.
   */
  private assertEventFollowsSequence(
    last: BusMovementLog | null,
    eventType: BusMovementEventType,
  ): void {
    if (eventType === 'boarded') {
      if (last?.event_type === 'boarded') {
        throw new BadRequestException(
          'This student already boarded for this trip on this date. Drop them off before recording another boarding.',
        );
      }
      if (last?.event_type === 'dropped_off') {
        throw new BadRequestException(
          'This trip is already completed for this student on this date.',
        );
      }
      return;
    }
    // dropped_off
    if (!last || last.event_type !== 'boarded') {
      throw new BadRequestException(
        'Record boarding first; a student can only be dropped off after they have boarded for this trip.',
      );
    }
  }

  private assertBulkAllowed(
    tripType: BusTripType,
    eventType: BusMovementEventType,
  ): void {
    const okGoingBulk =
      tripType === 'going' && eventType === 'dropped_off';
    const okReturnBulk =
      tripType === 'return' && eventType === 'boarded';
    if (!okGoingBulk && !okReturnBulk) {
      throw new BadRequestException(
        'Bulk actions are limited to: going trip — drop-off at school only; return trip — boarding only.',
      );
    }
  }

  async logMovement(
    busId: string,
    studentId: string,
    eventType: BusMovementEventType,
    tripType: BusTripType,
    tripDate: string,
    loggedByUserId?: string | null,
  ): Promise<BusMovementLog> {
    const tt = this.parseTripType(tripType);
    const d = this.parseTripDate(tripDate);
    await this.busService.findOne(busId);
    await this.assertStudentOnBus(busId, studentId);

    const last = await this.findLastLogForDayTrip(
      busId,
      studentId,
      d,
      tt,
    );
    this.assertEventFollowsSequence(last, eventType);

    const row = this.logRepository.create({
      bus_id: busId,
      student_id: studentId,
      event_type: eventType,
      tripType: tt,
      tripDate: d,
      logged_by_user_id: loggedByUserId ?? null,
    });
    return this.logRepository.save(row);
  }

  async logBulk(
    busId: string,
    studentIds: string[],
    eventType: BusMovementEventType,
    tripType: BusTripType,
    tripDate: string,
    loggedByUserId?: string | null,
  ): Promise<BusMovementLog[]> {
    if (!studentIds?.length) {
      throw new BadRequestException('No students selected');
    }
    const tt = this.parseTripType(tripType);
    this.assertBulkAllowed(tt, eventType);

    const d = this.parseTripDate(tripDate);
    await this.busService.findOne(busId);
    const unique = [...new Set(studentIds)];

    const pending: { studentId: string }[] = [];
    for (const studentId of unique) {
      await this.assertStudentOnBus(busId, studentId);
      const last = await this.findLastLogForDayTrip(
        busId,
        studentId,
        d,
        tt,
      );
      try {
        this.assertEventFollowsSequence(last, eventType);
      } catch (e) {
        const msg =
          e instanceof BadRequestException
            ? e.message
            : 'Invalid movement sequence';
        throw new BadRequestException(
          `Student ${studentId.slice(0, 8)}…: ${msg}`,
        );
      }
      pending.push({ studentId });
    }

    const out: BusMovementLog[] = [];
    await this.logRepository.manager.transaction(async (em) => {
      const repo = em.getRepository(BusMovementLog);
      for (const { studentId } of pending) {
        const row = repo.create({
          bus_id: busId,
          student_id: studentId,
          event_type: eventType,
          tripType: tt,
          tripDate: d,
          logged_by_user_id: loggedByUserId ?? null,
        });
        out.push(await repo.save(row));
      }
    });
    return out;
  }

  async findForBus(
    busId: string,
    options?: { date?: string; tripType?: BusTripType; limit?: number },
  ): Promise<BusMovementLog[]> {
    await this.busService.findOne(busId);
    const qb = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.student', 'student')
      .where('log.bus_id = :busId', { busId })
      .orderBy('log.logged_at', 'DESC')
      .take(options?.limit ?? 500);

    if (options?.date) {
      qb.andWhere('log.tripDate = :tripDate', { tripDate: options.date });
    }
    if (options?.tripType) {
      qb.andWhere('log.tripType = :tripType', { tripType: options.tripType });
    }

    return qb.getMany();
  }
}
