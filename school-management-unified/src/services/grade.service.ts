import api from './api'

export interface Grade {
  id: string
  nameEn: string
  nameAr: string
  code: string
  displayOrder: number
  isActive: boolean
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateGradeData {
  nameEn: string
  nameAr: string
  code: string
  displayOrder: number
  isActive?: boolean
  description?: string
}

export interface UpdateGradeData {
  nameEn?: string
  nameAr?: string
  code?: string
  displayOrder?: number
  isActive?: boolean
  description?: string
}

export const gradeService = {
  async getAll(): Promise<Grade[]> {
    const response = await api.get('/grades')
    return response.data.data
  },

  async getActive(): Promise<Grade[]> {
    const response = await api.get('/grades/active')
    return response.data.data
  },

  async getById(id: string): Promise<Grade> {
    const response = await api.get(`/grades/${id}`)
    return response.data.data
  },

  async create(data: CreateGradeData): Promise<Grade> {
    const response = await api.post('/grades', data)
    return response.data.data
  },

  async update(id: string, data: UpdateGradeData): Promise<Grade> {
    const response = await api.patch(`/grades/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/grades/${id}`)
  },

  async reorder(gradeIds: string[]): Promise<Grade[]> {
    const response = await api.post('/grades/reorder', { gradeIds })
    return response.data.data
  },

  async initializeDefaults(): Promise<void> {
    await api.post('/grades/initialize-defaults')
  }
}