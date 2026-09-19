import { BaseApiService } from './api'

export interface SystemSetting {
  id: string
  key: string
  value: string | boolean | number
  type: 'string' | 'boolean' | 'number' | 'json'
  category: string
  title: string
  description: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface CreateSettingRequest {
  key: string
  value: string | boolean | number
  type: 'string' | 'boolean' | 'number' | 'json'
  category: string
  title: string
  description: string
  is_public?: boolean
}

export interface UpdateSettingRequest {
  value: string | boolean | number
  title?: string
  description?: string
  is_public?: boolean
}

export interface AttendanceSettings {
  allowAllUsersToTakeAttendance: boolean
  requireSupervisorApproval: boolean
  allowRetroactiveAttendance: boolean
  maxRetroactiveDays: number
  /** once_a_day (default) | session_based */
  mode: 'once_a_day' | 'session_based'
}

export interface UserPermissionSettings {
  teacherCanViewAllGroups: boolean
  adminRequiresTwoFactorAuth: boolean
}

export interface ChatReviewSettings {
  adminReviewEnabled: boolean
}

export interface SystemSettings {
  attendance: AttendanceSettings
  userPermissions: UserPermissionSettings
  chat: ChatReviewSettings
  schoolInfo: {
    name: string
    address: string
    phone: string
    email: string
    website: string
  }
  academic: {
    currentAcademicYear: string
    termStartDate: string
    termEndDate: string
  }
}

class SettingsService extends BaseApiService {
  // Get all settings
  async getAll(): Promise<SystemSetting[]> {
    return this.get<SystemSetting[]>('/settings')
  }

  // Get settings by category
  async getByCategory(category: string): Promise<SystemSetting[]> {
    return this.get<SystemSetting[]>(`/settings/category/${category}`)
  }

  // Get a specific setting by key
  async getByKey(key: string): Promise<SystemSetting> {
    return this.get<SystemSetting>(`/settings/key/${key}`)
  }

  // Get structured settings for frontend use
  async getStructuredSettings(): Promise<SystemSettings> {
    try {
      const settings = await this.getAll()
      
      // Convert flat settings array to structured object
      const structured: any = {
        attendance: {},
        userPermissions: {},
        chat: {},
        schoolInfo: {},
        academic: {}
      }

      settings.forEach(setting => {
        if (setting.key === 'userPermissions.parentCanViewOtherStudents') return
        const [category, subKey] = setting.key.split('.')
        if (structured[category]) {
          structured[category][subKey] = setting.value
        }
      })

      // Never surface retired parent-visibility flag (even if still in an old response)
      if (structured.userPermissions) {
        delete structured.userPermissions.parentCanViewOtherStudents
      }

      if (!structured.attendance.mode) {
        structured.attendance.mode = 'once_a_day'
      }

      return structured as SystemSettings
    } catch (error) {
      // Return default settings if API fails
      return this.getDefaultSettings()
    }
  }

  // Create a new setting
  async create(settingData: CreateSettingRequest): Promise<SystemSetting> {
    return this.post<SystemSetting>('/settings', settingData)
  }

  // Update a setting
  async update(key: string, settingData: UpdateSettingRequest): Promise<SystemSetting> {
    return this.patch<SystemSetting>(`/settings/key/${key}`, settingData)
  }

  // Delete a setting
  async deleteSetting(key: string): Promise<void> {
    await super.delete<void>(`/settings/key/${encodeURIComponent(key)}`)
  }

  // Bulk update settings
  async bulkUpdate(settings: { key: string; value: any }[]): Promise<SystemSetting[]> {
    return this.post<SystemSetting[]>('/settings/bulk', { settings })
  }

  // Get default settings (fallback when API is not available)
  private getDefaultSettings(): SystemSettings {
    return {
      attendance: {
        allowAllUsersToTakeAttendance: true, // Default to true for development
        requireSupervisorApproval: false,
        allowRetroactiveAttendance: true,
        maxRetroactiveDays: 7,
        mode: 'once_a_day',
      },
      userPermissions: {
        teacherCanViewAllGroups: true, // Default to true for development
        adminRequiresTwoFactorAuth: false
      },
      chat: {
        adminReviewEnabled: false,
      },
      schoolInfo: {
        name: 'زهرة الحياة للأطفال',
        address: 'مسقط، سلطنة عمان',
        phone: '+968 1234 5678',
        email: 'info@zahratalhayat.om',
        website: 'www.zahratalhayat.om'
      },
      academic: {
        currentAcademicYear: '2024-2025',
        termStartDate: '2024-09-01',
        termEndDate: '2025-06-30'
      }
    }
  }

  // Initialize default settings (for first-time setup)
  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = this.getDefaultSettings()
    const settingsToCreate: CreateSettingRequest[] = []

    // Convert structured settings to flat array
    Object.entries(defaultSettings).forEach(([category, categorySettings]) => {
      Object.entries(categorySettings).forEach(([key, value]) => {
        settingsToCreate.push({
          key: `${category}.${key}`,
          value: value,
          type: typeof value as any,
          category: category,
          title: this.getSettingTitle(category, key),
          description: this.getSettingDescription(category, key),
          is_public: category === 'schoolInfo'
        })
      })
    })

    // Create settings in bulk
    try {
      await this.bulkUpdate(settingsToCreate.map(s => ({ key: s.key, value: s.value })))
    } catch (error) {
      console.warn('Could not initialize settings via API, using local defaults')
    }
  }

  private getSettingTitle(category: string, key: string): string {
    const titles: Record<string, Record<string, string>> = {
      attendance: {
        allowAllUsersToTakeAttendance: 'Allow All Users to Take Attendance',
        requireSupervisorApproval: 'Require Supervisor Approval',
        allowRetroactiveAttendance: 'Allow Retroactive Attendance',
        maxRetroactiveDays: 'Max Retroactive Days',
        mode: 'Attendance Mode',
      },
      userPermissions: {
        teacherCanViewAllGroups: 'Teachers Can View All Groups',
        adminRequiresTwoFactorAuth: 'Admin Requires Two-Factor Auth'
      },
      chat: {
        adminReviewEnabled: 'Administrators can review conversations',
      },
      schoolInfo: {
        name: 'School Name',
        address: 'School Address',
        phone: 'Phone Number',
        email: 'Email Address',
        website: 'Website'
      },
      academic: {
        currentAcademicYear: 'Current Academic Year',
        termStartDate: 'Term Start Date',
        termEndDate: 'Term End Date'
      }
    }
    return titles[category]?.[key] || key
  }

  private getSettingDescription(category: string, key: string): string {
    const descriptions: Record<string, Record<string, string>> = {
      attendance: {
        allowAllUsersToTakeAttendance: 'When enabled, all users can take attendance for any group. When disabled, only supervisors can take attendance for their assigned groups.',
        requireSupervisorApproval: 'Require supervisor approval before attendance is finalized',
        allowRetroactiveAttendance: 'Allow users to mark attendance for past dates',
        maxRetroactiveDays: 'Maximum number of days in the past that attendance can be marked',
        mode: 'once_a_day or session_based',
      },
      userPermissions: {
        teacherCanViewAllGroups: 'Allow teachers to view and manage all groups, not just their assigned ones',
        adminRequiresTwoFactorAuth: 'Require administrators to use two-factor authentication'
      },
      chat: {
        adminReviewEnabled: 'New messages are visible to administrators for audit. Messages sent while this is off stay hidden.',
      },
    }
    return descriptions[category]?.[key] || ''
  }
}

export const settingsService = new SettingsService()
