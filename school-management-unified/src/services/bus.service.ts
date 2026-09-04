import { BaseApiService } from './api'

export interface Bus {
  id: string
  title: string
  driverName: string
  capacity: number
  driverContacts?: string | null
  school_id: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  students?: { id: string; firstName: string; lastName: string }[]
}

export interface CreateBusRequest {
  title: string
  driverName: string
  capacity: number
  driverContacts?: string
  school_id: number
  is_active?: boolean
}

export interface UpdateBusRequest {
  title?: string
  driverName?: string
  capacity?: number
  driverContacts?: string
  is_active?: boolean
}

export type BusMovementEventType = 'boarded' | 'dropped_off'

/** To school (join trip) vs home (return trip). */
export type BusTripType = 'going' | 'return'

export interface BusMovementLog {
  id: string
  bus_id: string
  student_id: string
  event_type: BusMovementEventType
  tripType?: BusTripType
  tripDate?: string
  logged_at: string
  logged_by_user_id?: string | null
  student?: { id: string; firstName: string; lastName: string }
}

class BusService extends BaseApiService {
  async getAll(schoolId?: number, activeOnly?: boolean): Promise<Bus[]> {
    const params: Record<string, string | number | boolean> = {}
    if (schoolId !== undefined) params.school_id = schoolId
    if (activeOnly === true) params.is_active = true
    return this.get<Bus[]>('/buses', params)
  }

  async getById(id: string): Promise<Bus> {
    return this.get<Bus>(`/buses/${id}`)
  }

  /** Roster: students linked via `student_buses` (same source as transportation). */
  async getStudentsOnBus(busId: string): Promise<{ id: string; firstName: string; lastName: string }[]> {
    return this.get<{ id: string; firstName: string; lastName: string }[]>(`/buses/${busId}/students`)
  }

  async create(body: CreateBusRequest): Promise<Bus> {
    return this.post<Bus>('/buses', body)
  }

  async update(id: string, body: UpdateBusRequest): Promise<Bus> {
    return this.patch<Bus>(`/buses/${id}`, body)
  }

  async deleteBus(id: string): Promise<void> {
    await this.delete(`/buses/${id}`)
  }

  async listMovements(
    busId: string,
    params?: { date?: string; limit?: number; tripType?: BusTripType },
  ): Promise<BusMovementLog[]> {
    const q: Record<string, string | number> = {}
    if (params?.date) q.date = params.date
    if (params?.limit != null) q.limit = params.limit
    if (params?.tripType) q.tripType = params.tripType
    return this.get<BusMovementLog[]>(`/buses/${busId}/movements`, q)
  }

  async logMovement(
    busId: string,
    studentId: string,
    eventType: BusMovementEventType,
    tripType: BusTripType,
    tripDate: string,
  ): Promise<BusMovementLog> {
    return this.post<BusMovementLog>(`/buses/${busId}/movements`, {
      studentId,
      eventType,
      tripType,
      tripDate,
    })
  }

  async logMovementsBulk(
    busId: string,
    studentIds: string[],
    eventType: BusMovementEventType,
    tripType: BusTripType,
    tripDate: string,
  ): Promise<BusMovementLog[]> {
    return this.post<BusMovementLog[]>(`/buses/${busId}/movements/bulk`, {
      studentIds,
      eventType,
      tripType,
      tripDate,
    })
  }
}

export const busService = new BusService()
export default busService
