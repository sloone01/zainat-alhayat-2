import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimpleHealthController } from './health/simple-health.controller';
import { DebugModule } from './debug/debug.module';

// Entities
import { User } from './entities/user.entity';
import { School } from './entities/school.entity';
import { Room } from './entities/room.entity';
import { Student } from './entities/student.entity';
import { Staff } from './entities/staff.entity';
import { Parent } from './entities/parent.entity';
import { Activity } from './entities/activity.entity';
import { Reminder } from './entities/reminder.entity';
import { Group } from './entities/group.entity';
import { Course } from './entities/course.entity';
import { Phase } from './entities/phase.entity';
import { Milestone } from './entities/milestone.entity';
import { Schedule } from './entities/schedule.entity';
import { Attendance } from './entities/attendance.entity';
import { StudentProgress } from './entities/student-progress.entity';
import { ClassSettings } from './entities/class-settings.entity';
import { AcademicYear } from './entities/academic-year.entity';
import { Semester } from './entities/semester.entity';
import { WeeklySessionPlan } from './entities/weekly-session-plan.entity';

// Services
import { UserService } from './services/user.service';
import { StudentService } from './services/student.service';
import { ParentService } from './services/parent.service';
import { GroupService } from './services/group.service';
import { CourseService } from './services/course.service';
import { PhaseService } from './services/phase.service';
import { MilestoneService } from './services/milestone.service';
import { ScheduleService } from './services/schedule.service';
import { AttendanceService } from './services/attendance.service';
import { StudentProgressService } from './services/student-progress.service';
import { ClassSettingsService } from './services/class-settings.service';
import { AcademicYearService } from './services/academic-year.service';
import { SemesterService } from './services/semester.service';
import { FileUploadService } from './services/file-upload.service';
import { StatisticsService } from './services/statistics.service';
import { WeeklySessionPlanService } from './services/weekly-session-plan.service';

// Controllers
import { UserController } from './controllers/user.controller';
import { StudentController } from './controllers/student.controller';
import { ParentController } from './controllers/parent.controller';
import { GroupController } from './controllers/group.controller';
import { CourseController } from './controllers/course.controller';
import { PhaseController } from './controllers/phase.controller';
import { MilestoneController } from './controllers/milestone.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { StudentProgressController } from './controllers/student-progress.controller';
import { ClassSettingsController } from './controllers/class-settings.controller';
import { AcademicYearController } from './controllers/academic-year.controller';
import { SemesterController } from './controllers/semester.controller';
import { FileUploadController } from './controllers/file-upload.controller';
import { StatisticsController } from './controllers/statistics.controller';
import { WeeklySessionPlanController } from './controllers/weekly-session-plan.controller';

// Auth Module
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DebugModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      School,
      Room,
      Student,
      Staff,
      Parent,
      Activity,
      Reminder,
      Group,
      Course,
      Phase,
      Milestone,
      Schedule,
      Attendance,
      StudentProgress,
      ClassSettings,
      AcademicYear,
      Semester,
      WeeklySessionPlan,
    ]),
    AuthModule,
  ],
  controllers: [
    AppController,
    SimpleHealthController,
    UserController,
    StudentController,
    ParentController,
    GroupController,
    CourseController,
    PhaseController,
    MilestoneController,
    ScheduleController,
    AttendanceController,
    StudentProgressController,
    ClassSettingsController,
    AcademicYearController,
    SemesterController,
    FileUploadController,
    StatisticsController,
    WeeklySessionPlanController,
  ],
  providers: [
    AppService,
    UserService,
    StudentService,
    ParentService,
    GroupService,
    CourseService,
    PhaseService,
    MilestoneService,
    ScheduleService,
    AttendanceService,
    StudentProgressService,
    ClassSettingsService,
    AcademicYearService,
    SemesterService,
    FileUploadService,
    StatisticsService,
    WeeklySessionPlanService,
  ],
})
export class AppModule {}
