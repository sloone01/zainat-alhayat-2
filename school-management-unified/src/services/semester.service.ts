import { BaseApiService } from './api'
import type { Semester } from './academic-year.service'

export interface CreateSemesterDto {
  title: string
  start_date: string
  end_date: string
  academic_year_id: string
  description?: string
  is_active?: boolean
}

export interface UpdateSemesterDto {
  title?: string
  start_date?: string
  end_date?: string
  description?: string
  is_active?: boolean
}

export interface SemesterStatistics {
  total: number
  active: number
  current: Semester | null
  upcoming: Semester | null
  past: number
}

export interface SemesterValidation {
  isValid: boolean
  issues: string[]
}

class SemesterService extends BaseApiService {
  private basePath = '/semesters'

  async getAll(academicYearId?: string): Promise<Semester[]> {
    return this.get<Semester[]>(this.basePath, { academicYearId })
  }

  async getByAcademicYear(academicYearId: string): Promise<Semester[]> {
    return this.get<Semester[]>(`${this.basePath}/academic-year/${academicYearId}`)
  }

  async getCurrent(academicYearId?: string): Promise<Semester | null> {
    return this.get<Semester | null>(`${this.basePath}/current`, { academicYearId })
  }

  async getById(id: string): Promise<Semester> {
    return this.get<Semester>(`${this.basePath}/${id}`)
  }

  async create(data: CreateSemesterDto): Promise<Semester> {
    return this.post<Semester>(this.basePath, data)
  }

  async update(id: string, data: UpdateSemesterDto): Promise<Semester> {
    return this.patch<Semester>(`${this.basePath}/${id}`, data)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.basePath}/${id}`)
  }

  async validateOrder(academicYearId: string): Promise<SemesterValidation> {
    return this.get<SemesterValidation>(`${this.basePath}/academic-year/${academicYearId}/validate`)
  }

  async getStatistics(academicYearId?: string): Promise<SemesterStatistics> {
    return this.get<SemesterStatistics>(`${this.basePath}/statistics`, { academicYearId })
  }
}

export const semesterService = new SemesterService()
export default semesterService