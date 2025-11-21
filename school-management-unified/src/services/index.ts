// Export all services
export { default as authService } from './auth.service'
export { default as userService } from './user.service'
export { default as studentService } from './student.service'
export { default as groupService } from './group.service'
export { default as courseService } from './course.service'
export { default as statisticsService } from './statistics.service'
export { default as academicYearService } from './academic-year.service'
export { default as semesterService } from './semester.service'
export { default as classSettingsService } from './class-settings.service'
export { default as scheduleService } from './schedule.service'
export { settingsService } from './settings.service'
export { default as weeklySessionPlanService } from './weekly-session-plan.service'
export { default as progressService } from './progress.service'
export { default as apiClient } from './api'

// Export types
export type { User, AuthResponse, LoginRequest, RegisterRequest } from './auth.service'
export type { User as UserType, CreateUserRequest, UpdateUserRequest } from './user.service'
export type { Student, CreateStudentRequest, UpdateStudentRequest } from './student.service'
export type { Group, CreateGroupRequest, UpdateGroupRequest } from './group.service'
export type { Course, Phase, Milestone, CreateCourseRequest, UpdateCourseRequest } from './course.service'
export type { DashboardStats, StudentProgressStats, AttendanceStats, CourseStats } from './statistics.service'
export type {
  AcademicYear,
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
  AcademicYearStatistics
} from './academic-year.service'
export type {
  CreateSemesterDto,
  UpdateSemesterDto,
  SemesterStatistics,
  SemesterValidation
} from './semester.service'
export type {
  ClassSettings,
  CreateClassSettingsDto,
  UpdateClassSettingsDto,
  TimeSlotData,
  TimeSlot
} from './class-settings.service'
export type {
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest
} from './schedule.service'
export type {
  SystemSetting,
  CreateSettingRequest,
  UpdateSettingRequest,
  SystemSettings,
  AttendanceSettings,
  UserPermissionSettings
} from './settings.service'
export type {
  WeeklySessionPlan,
  CreateWeeklySessionPlanDto,
  UpdateWeeklySessionPlanDto,
  GroupWeeklyPlanning
} from './weekly-session-plan.service'
export type {
  StudentProgress,
  CreateProgressDto,
  UpdateProgressDto,
  BulkProgressUpdateDto
} from './progress.service'
export type { ApiResponse } from './api'

