<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ $t('settings.systemSettings') }}</h1>
            <p class="text-gray-600 mt-1">{{ $t('settings.systemSettingsDescription') }}</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="resetToDefaults"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ $t('settings.resetToDefaults') }}
            </button>
            <button
              @click="saveSettings"
              :disabled="saving"
              class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
            >
              <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Attendance Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('settings.attendanceSettings') }}</h2>
          </div>

          <div class="space-y-4">
            <!-- Allow All Users to Take Attendance -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('settings.allowAllUsersToTakeAttendance') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('settings.allowAllUsersToTakeAttendanceDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.attendance.allowAllUsersToTakeAttendance"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Require Supervisor Approval -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('settings.requireSupervisorApproval') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('settings.requireSupervisorApprovalDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.attendance.requireSupervisorApproval"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Allow Retroactive Attendance -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('settings.allowRetroactiveAttendance') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('settings.allowRetroactiveAttendanceDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.attendance.allowRetroactiveAttendance"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Max Retroactive Days -->
            <div v-if="settings.attendance.allowRetroactiveAttendance">
              <label class="text-sm font-medium text-gray-900">{{ $t('settings.maxRetroactiveDays') }}</label>
              <input
                type="number"
                v-model.number="settings.attendance.maxRetroactiveDays"
                min="1"
                max="30"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>
          </div>
        </div>

        <!-- User Permissions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('settings.userPermissions') }}</h2>
          </div>

          <div class="space-y-4">
            <!-- Teachers Can View All Groups -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('settings.teacherCanViewAllGroups') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('settings.teacherCanViewAllGroupsDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.userPermissions.teacherCanViewAllGroups"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Parents Can View Other Students -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('settings.parentCanViewOtherStudents') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('settings.parentCanViewOtherStudentsDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.userPermissions.parentCanViewOtherStudents"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Admin Requires Two-Factor Auth -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('settings.adminRequiresTwoFactorAuth') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('settings.adminRequiresTwoFactorAuthDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.userPermissions.adminRequiresTwoFactorAuth"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- School Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('settings.schoolInfo') }}</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-900">{{ $t('common.name') }}</label>
              <input
                type="text"
                v-model="settings.schoolInfo.name"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>

            <div>
              <label class="text-sm font-medium text-gray-900">{{ $t('students.address') }}</label>
              <input
                type="text"
                v-model="settings.schoolInfo.address"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-900">{{ $t('students.phone') }}</label>
                <input
                  type="tel"
                  v-model="settings.schoolInfo.phone"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="text-sm font-medium text-gray-900">{{ $t('students.email') }}</label>
                <input
                  type="email"
                  v-model="settings.schoolInfo.email"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-900">Website</label>
              <input
                type="url"
                v-model="settings.schoolInfo.website"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>
          </div>
        </div>

        <!-- Academic Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('settings.academic') }}</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-900">Current Academic Year</label>
              <input
                type="text"
                v-model="settings.academic.currentAcademicYear"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-900">Term Start Date</label>
                <input
                  type="date"
                  v-model="settings.academic.termStartDate"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="text-sm font-medium text-gray-900">Term End Date</label>
                <input
                  type="date"
                  v-model="settings.academic.termEndDate"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { settingsService, type SystemSettings } from '@/services/settings.service'

const { locale } = useI18n()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const settings = ref<SystemSettings>({
  attendance: {
    allowAllUsersToTakeAttendance: true,
    requireSupervisorApproval: false,
    allowRetroactiveAttendance: true,
    maxRetroactiveDays: 7
  },
  userPermissions: {
    teacherCanViewAllGroups: true,
    parentCanViewOtherStudents: false,
    adminRequiresTwoFactorAuth: false
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
})

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Methods
const loadSettings = async () => {
  try {
    loading.value = true
    const loadedSettings = await settingsService.getStructuredSettings()
    settings.value = loadedSettings
  } catch (error) {
    console.error('Error loading settings:', error)
    // Keep default settings if loading fails
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  try {
    saving.value = true
    
    // Convert structured settings to flat array for API
    const settingsToUpdate: { key: string; value: any }[] = []
    
    Object.entries(settings.value).forEach(([category, categorySettings]) => {
      Object.entries(categorySettings).forEach(([key, value]) => {
        settingsToUpdate.push({
          key: `${category}.${key}`,
          value: value
        })
      })
    })

    await settingsService.bulkUpdate(settingsToUpdate)
    
    // Show success message
    alert('Settings saved successfully!')
    
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Failed to save settings. Please try again.')
  } finally {
    saving.value = false
  }
}

const resetToDefaults = async () => {
  if (confirm('Are you sure you want to reset all settings to their default values?')) {
    try {
      await settingsService.initializeDefaultSettings()
      await loadSettings()
      alert('Settings reset to defaults successfully!')
    } catch (error) {
      console.error('Error resetting settings:', error)
      alert('Failed to reset settings. Please try again.')
    }
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>
