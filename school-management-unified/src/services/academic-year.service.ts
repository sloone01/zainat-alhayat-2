import { BaseApiService } from './api'

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

export interface CreateAcademicYearDto {
  year: string
  start_date: string
  end_date: string
  description?: string
  is_active?: boolean
  school_id: number
}

export interface UpdateAcademicYearDto {
  year?: string
  start_date?: string
  end_date?: string
  description?: string
  is_active?: boolean
}

export interface AcademicYearStatistics {
  total: number
  active: number
  current: AcademicYear | null
  upcoming: AcademicYear | null
}

class AcademicYearService extends BaseApiService {
  private basePath = '/academic-years'

  async getAll(schoolId?: number): Promise<AcademicYear[]> {
    return this.get<AcademicYear[]>(this.basePath, { schoolId })
  }

  async getActive(schoolId?: number): Promise<AcademicYear | null> {
    return this.get<AcademicYear | null>(`${this.basePath}/active`, { schoolId })
  }

  async getById(id: string): Promise<AcademicYear> {
    return this.get<AcademicYear>(`${this.basePath}/${id}`)
  }

  async create(data: CreateAcademicYearDto): Promise<AcademicYear> {
    return this.post<AcademicYear>(this.basePath, data)
  }

  async update(id: string, data: UpdateAcademicYearDto): Promise<AcademicYear> {
    return this.patch<AcademicYear>(`${this.basePath}/${id}`, data)
  }

  async activate(id: string): Promise<AcademicYear> {
    return this.patch<AcademicYear>(`${this.basePath}/${id}/activate`)
  }

  async archive(id: string): Promise<AcademicYear> {
    return this.patch<AcademicYear>(`${this.basePath}/${id}/archive`)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.basePath}/${id}`)
  }

  async getStatistics(schoolId?: number): Promise<AcademicYearStatistics> {
    return this.get<AcademicYearStatistics>(`${this.basePath}/statistics`, { schoolId })
  }
}

export const academicYearService = new AcademicYearService()
export default academicYearService