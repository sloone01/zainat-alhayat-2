import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';

export interface CreateAttendanceDto {
  attendance_date: Date;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  reason?: string;
  is_excused?: boolean;
  student_id: string;
  group_id: string;
  recorded_by?: number;
}

export interface UpdateAttendanceDto {
  status?: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  reason?: string;
  is_excused?: boolean;
}

export interface BulkAttendanceDto {
  attendance_date: Date;
  group_id: string;
  recorded_by?: number;
  attendances: {
    student_id: string;
    status: string;
    check_in_time?: string;
    check_out_time?: string;
    notes?: string;
    reason?: string;
    is_excused?: boolean;
  }[];
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async bulkCreate(bulkAttendanceDto: BulkAttendanceDto): Promise<Attendance[]> {
    const results: Attendance[] = [];

    for (const attendanceData of bulkAttendanceDto.attendances) {
      // Check if attendance already exists for this student on this date
      const existingAttendance = await this.attendanceRepository.findOne({
        where: {
          student_id: attendanceData.student_id,
          attendance_date: bulkAttendanceDto.attendance_date,
          group_id: bulkAttendanceDto.group_id,
        },
      });

      if (existingAttendance) {
        // Update existing record
        Object.assign(existingAttendance, {
          status: attendanceData.status,
          check_in_time: attendanceData.check_in_time,
          check_out_time: attendanceData.check_out_time,
          notes: attendanceData.notes,
          reason: attendanceData.reason,
          is_excused: attendanceData.is_excused,
          recorded_by: bulkAttendanceDto.recorded_by,
        });
        const updatedRecord = await this.attendanceRepository.save(existingAttendance);
        results.push(updatedRecord);
      } else {
        // Create new record
        const newAttendance = this.attendanceRepository.create({
          ...attendanceData,
          attendance_date: bulkAttendanceDto.attendance_date,
          group_id: bulkAttendanceDto.group_id,
          recorded_by: bulkAttendanceDto.recorded_by,
        });
        const savedRecord = await this.attendanceRepository.save(newAttendance);
        results.push(savedRecord);
      }
    }

    return results;
  }

  async findAll(): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      relations: ['student', 'group', 'recorder'],
      order: { attendance_date: 'DESC', created_at: 'DESC' },
    });
  }

  async findByGroup(groupId: string, date?: Date): Promise<Attendance[]> {
    const whereCondition: any = { group_id: groupId };
    
    if (date) {
      whereCondition.attendance_date = date;
    }

    return await this.attendanceRepository.find({
      where: whereCondition,
      relations: ['student', 'recorder'],
      order: { attendance_date: 'DESC', student: { first_name: 'ASC' } },
    });
  }

  async findByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    let whereCondition: any = { student_id: studentId };

    if (startDate && endDate) {
      whereCondition.attendance_date = Between(startDate, endDate);
    }

    return await this.attendanceRepository.find({
      where: whereCondition,
      relations: ['group', 'recorder'],
      order: { attendance_date: 'DESC' },
    });
  }

  async findByDate(date: Date): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      where: { attendance_date: date },
      relations: ['student', 'group', 'recorder'],
      order: { group: { name: 'ASC' }, student: { first_name: 'ASC' } },
    });
  }

  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['student', 'group', 'recorder'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async getAttendanceStatistics(groupId: string, startDate: Date, endDate: Date): Promise<any> {
    const attendances = await this.attendanceRepository.find({
      where: {
        group_id: groupId,
        attendance_date: Between(startDate, endDate),
      },
      relations: ['student'],
    });

    const stats = {
      total_records: attendances.length,
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      late: attendances.filter(a => a.status === 'late').length,
      excused: attendances.filter(a => a.is_excused).length,
      attendance_rate: 0,
    };

    if (stats.total_records > 0) {
      stats.attendance_rate = ((stats.present + stats.late) / stats.total_records) * 100;
    }

    return stats;
  }

  async getStudentAttendanceRate(studentId: string, startDate: Date, endDate: Date): Promise<any> {
    const attendances = await this.attendanceRepository.find({
      where: {
        student_id: studentId,
        attendance_date: Between(startDate, endDate),
      },
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentDays = attendances.filter(a => a.status === 'absent').length;
    const excusedDays = attendances.filter(a => a.is_excused).length;

    return {
      student_id: studentId,
      total_days: totalDays,
      present_days: presentDays,
      absent_days: absentDays,
      excused_days: excusedDays,
      attendance_rate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
      unexcused_absences: absentDays - excusedDays,
    };
  }

  async getDailyAttendanceReport(date: Date): Promise<any> {
    const attendances = await this.attendanceRepository.find({
      where: { attendance_date: date },
      relations: ['student', 'group'],
    });

    const groupedByGroup = attendances.reduce((acc, attendance) => {
      const groupName = attendance.group.name;
      if (!acc[groupName]) {
        acc[groupName] = {
          group_id: attendance.group_id,
          group_name: groupName,
          total_students: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          students: [],
        };
      }

      acc[groupName].total_students++;
      acc[groupName].students.push({
        student_id: attendance.student_id,
        student_name: `${attendance.student.first_name} ${attendance.student.family_name}`,
        status: attendance.status,
        check_in_time: attendance.check_in_time,
        is_excused: attendance.is_excused,
        notes: attendance.notes,
      });

      // Count by status
      if (attendance.status === 'present') acc[groupName].present++;
      else if (attendance.status === 'absent') acc[groupName].absent++;
      else if (attendance.status === 'late') acc[groupName].late++;
      
      if (attendance.is_excused) acc[groupName].excused++;

      return acc;
    }, {});

    return {
      date: date,
      groups: Object.values(groupedByGroup),
      summary: {
        total_students: attendances.length,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length,
        excused: attendances.filter(a => a.is_excused).length,
      },
    };
  }

  async checkExistingAttendance(studentId: string, date: Date): Promise<Attendance | null> {
    return await this.attendanceRepository.findOne({
      where: {
        student_id: studentId,
        attendance_date: date,
      },
    });
  }
}

