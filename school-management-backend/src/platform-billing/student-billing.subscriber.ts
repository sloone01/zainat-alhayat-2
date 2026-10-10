import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Student } from '../entities/student.entity';
import { PlatformBillingService } from './platform-billing.service';

/** Students becoming active may push the school past what its period was billed for. */
@Injectable()
export class StudentBillingSubscriber implements EntitySubscriberInterface<Student> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    private readonly billing: PlatformBillingService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Student;
  }

  afterInsert(event: InsertEvent<Student>) {
    const s = event.entity;
    if (s?.status === 'active' && s.school_id) {
      this.billing.scheduleProrationCheck(s.school_id);
    }
  }

  afterUpdate(event: UpdateEvent<Student>) {
    const s = event.entity as Partial<Student> | undefined;
    const before = event.databaseEntity as Student | undefined;
    const schoolId = s?.school_id ?? before?.school_id;
    if (!schoolId || s?.status !== 'active') return;
    if (before?.status === 'active' && before.school_id === schoolId) return;
    this.billing.scheduleProrationCheck(schoolId);
  }
}
