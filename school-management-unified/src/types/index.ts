// Common types for the application

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  duration: number
}

export interface ClassSchedule {
  day: string
  timeSlot: string
  startTime: string
  endTime: string
  subject: string
  teacher: string
  room: string
  notes: string
  recurring?: boolean
}

export interface CourseFormData {
  id?: number
  title: string
  description: string
  category: string
  status: string
  duration?: number
  milestones: Milestone[]
}

export interface PhaseFormData {
  id?: number
  title: string
  description: string
  duration?: number
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  name: string
  title: string
  description?: string
  order: number
  isRequired: boolean
  points?: number
  phaseId: string
  createdAt: Date
  updatedAt: Date
  progress?: any[]
  type?: string
  targetWeek?: number
}

export interface Parent {
  id: string
  firstName: string
  secondName?: string
  thirdName?: string
  familyName: string
  email: string
  mobile: string
  hasUserAccount: boolean
  children: {
    id: string
    name: string
    group: string
  }[]
  matchScore?: number
}

export interface Group {
  id: string
  name: string
  description?: string
  age_range_min?: number
  age_range_max?: number
  capacity: number
  is_active: boolean
  school_id: number
  color?: string
  status?: string
  studentCount?: number
  teacherCount?: number
  currentStudents?: number
  ageGroup?: string
  academicYear?: any
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  name: string
  fullName?: string
  email: string
  phone?: string
  isActive: boolean
  subject?: string
}

export interface Subject {
  id: string
  name: string
  description?: string
  colorCode?: string
  icon?: string
  ageGroupMin?: number
  ageGroupMax?: number
}

export interface Room {
  id: number
  name: string
  capacity: number
  description?: string
  colorCode?: string
}

export interface User {
  id: string
  username?: string
  email: string
  firstName: string
  lastName: string
  fullName?: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  roles?: string
  phone?: string
  mobile?: string
  address?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AcademicYear {
  id: string
  year: string
  start_date: string
  end_date: string
  is_active: boolean
  school_id: number
  description?: string
  created_at: string
  updated_at: string
  status?: string
  semesters?: Semester[]
}

export interface Semester {
  id: string
  title: string
  start_date: string
  end_date: string
  academic_year_id: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoadingState {
  state: 'loading' | 'success' | 'error'
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  count?: number
}

// Schedule related types
export interface ScheduleData {
  [day: string]: ClassSchedule[]
}

export interface CreateScheduleRequest {
  day_of_week: string
  start_time: string
  end_time: string
  duration_minutes: number
  subject: string
  notes?: string
  group_id: string
  course_id?: string
  teacher_id?: string
  room_id?: number
}

export interface UpdateScheduleRequest extends CreateScheduleRequest {}

// Progress related types
export interface StudentProgressData {
  studentId: number
  milestoneId: number
  status: string
  notes?: string
}

export interface ProgressStatus {
  status: string
  notes: string
  completedDate: string | null
}

export interface StudentProgressMap {
  [milestoneId: number]: ProgressStatus
}
