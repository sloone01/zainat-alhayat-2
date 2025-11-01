<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('attendanceManagement.title') }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ $t('attendanceManagement.description') }}</p>
        </div>
        <div class="flex items-center gap-3" v-if="selectedGroup">
          <button
            @click="exportAttendance"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {{ $t('attendanceManagement.actions.exportAttendance') }}
          </button>
          <button
            @click="printAttendance"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            {{ $t('attendanceManagement.actions.printAttendance') }}
          </button>
        </div>
      </div>

      <!-- Group and Date Selection -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Group Selection -->
          <div>
            <label for="group-select" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('attendanceManagement.selectGroup') }}
            </label>
            <select
              id="group-select"
              v-model="selectedGroupId"
              @change="onGroupChange"
              :disabled="loading"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
            >
              <option value="">{{ loading ? 'Loading groups...' : $t('attendanceManagement.selectGroupPlaceholder') }}</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }} - {{ group.description || 'No description' }}
              </option>
            </select>
          </div>

          <!-- Date Selection -->
          <div>
            <label for="date-select" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('attendanceManagement.selectDate') }}
            </label>
            <input
              id="date-select"
              v-model="selectedDate"
              type="date"
              :max="today"
              @change="onDateChange"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <!-- Group Info -->
        <div v-if="selectedGroup" class="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ attendanceStats.totalStudents }}</div>
            <div class="text-xs text-gray-500">{{ $t('attendanceManagement.totalStudents') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ attendanceStats.presentStudents }}</div>
            <div class="text-xs text-gray-500">{{ $t('attendanceManagement.presentStudents') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ attendanceStats.absentStudents }}</div>
            <div class="text-xs text-gray-500">{{ $t('attendanceManagement.absentStudents') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ attendanceStats.attendanceRate }}%</div>
            <div class="text-xs text-gray-500">{{ $t('attendanceManagement.attendanceRate') }}</div>
          </div>
          <div class="text-center">
            <div class="text-sm font-medium text-gray-900">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
            <div class="text-xs text-gray-500">{{ $t('attendanceManagement.supervisor') }}</div>
          </div>
        </div>

        <!-- Attendance Status Warning -->
        <div v-if="isAttendanceAlreadyTaken" class="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                Attendance Already Taken
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>Attendance has already been recorded for this group on {{ formatDate(selectedDate) }}. You can update the existing records if needed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Group Selected State -->
      <div v-if="!selectedGroup" class="bg-white shadow rounded-lg p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ $t('attendanceManagement.messages.selectGroupFirst') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ $t('attendanceManagement.selectGroupPlaceholder') }}</p>
      </div>

      <!-- Attendance Table -->
      <div v-if="selectedGroup && filteredStudents.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-medium text-gray-900">
              {{ $t('attendanceManagement.todayAttendance') }} - {{ selectedGroup.name }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ $t('attendanceManagement.attendanceDate') }}: {{ formatDate(selectedDate) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="markAllPresent"
              class="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {{ $t('attendanceManagement.actions.markAllPresent') }}
            </button>
            <button
              @click="markAllAbsent"
              class="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {{ $t('attendanceManagement.actions.markAllAbsent') }}
            </button>
            <button
              @click="resetAttendance"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {{ $t('attendanceManagement.actions.resetAttendance') }}
            </button>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('attendanceManagement.studentName') }}
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('attendanceManagement.status') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('attendanceManagement.notes') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-purple-600">
                          {{ student.name.charAt(0) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                      <div class="text-sm text-gray-500">{{ student.studentId }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      v-for="status in attendanceStatuses"
                      :key="status.value"
                      @click="updateAttendance(student.id, status.value)"
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200',
                        getAttendanceStatus(student.id) === status.value
                          ? status.activeClass
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      ]"
                    >
                      {{ $t(`attendanceManagement.status.${status.value}`) }}
                    </button>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    v-model="attendanceNotes[student.id]"
                    type="text"
                    :placeholder="$t('attendanceManagement.notes')"
                    class="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden">
          <div v-for="student in filteredStudents" :key="student.id" class="border-b border-gray-200 p-4">
            <div class="flex items-center mb-3">
              <div class="flex-shrink-0 h-10 w-10">
                <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-purple-600">
                    {{ student.name.charAt(0) }}
                  </span>
                </div>
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                <div class="text-sm text-gray-500">{{ student.studentId }}</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  {{ $t('attendanceManagement.status') }}
                </label>
                <div class="flex gap-2">
                  <button
                    v-for="status in attendanceStatuses"
                    :key="status.value"
                    @click="updateAttendance(student.id, status.value)"
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200',
                      getAttendanceStatus(student.id) === status.value
                        ? status.activeClass
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]"
                  >
                    {{ $t(`attendanceManagement.status.${status.value}`) }}
                  </button>
                </div>
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  {{ $t('attendanceManagement.notes') }}
                </label>
                <input
                  v-model="attendanceNotes[student.id]"
                  type="text"
                  :placeholder="$t('attendanceManagement.notes')"
                  class="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-end">
            <button
              @click="saveAttendance"
              :disabled="!hasChanges || saving || !selectedGroupId"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg v-if="!saving" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <svg v-else class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Saving...' : (isAttendanceAlreadyTaken ? 'Update Attendance' : $t('attendanceManagement.actions.saveAttendance')) }}
            </button>
          </div>
        </div>
      </div>

      <!-- No Students State -->
      <div v-else-if="selectedGroup && filteredStudents.length === 0" class="bg-white shadow rounded-lg p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ $t('attendanceManagement.messages.noStudentsInGroup') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ selectedGroup.name }}</p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { attendanceService } from '@/services/attendance.service'
import { studentService } from '@/services/student.service'
import { groupService } from '@/services/group.service'
import { userService } from '@/services/user.service'
import { settingsService } from '@/services/settings.service'

const { t } = useI18n()

// Reactive data
const selectedGroupId = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const attendanceData = ref<Record<string, string>>({})
const attendanceNotes = ref<Record<string, string>>({})
const loading = ref(false)
const saving = ref(false)

// Data from APIs
const groups = ref<any[]>([])
const students = ref<any[]>([])
const existingAttendance = ref<any[]>([])
const currentUser = ref<any>(null)

// Get current user info
const getCurrentUser = async () => {
  try {
    // Get current user from authentication service
    // For now, using system admin as default user
    currentUser.value = {
      id: 'bd306529-6a0f-4e42-9dce-3928af367e94',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator'
    }
  } catch (error) {
    console.error('Error getting current user:', error)
  }
}

// Load groups based on user role and system settings
const loadGroups = async () => {
  try {
    loading.value = true

    // Get system settings to determine access control
    const systemSettings = await settingsService.getStructuredSettings()

    if (systemSettings.attendance.allowAllUsersToTakeAttendance || currentUser.value?.role === 'admin') {
      // Allow all users to see all groups (based on settings or admin role)
      const allGroups = await groupService.getAll()
      groups.value = allGroups
    } else if (currentUser.value?.role === 'teacher') {
      // Teacher can only see groups they supervise (when setting is disabled)
      const teacherGroups = await attendanceService.getTeacherGroups(currentUser.value.id)
      groups.value = teacherGroups
    } else {
      groups.value = []
    }

    console.log('Groups loaded:', groups.value.length, 'Allow all users:', systemSettings.attendance.allowAllUsersToTakeAttendance)
  } catch (error) {
    console.error('Error loading groups:', error)
    // Show error message instead of using mock data
    groups.value = []
  } finally {
    loading.value = false
  }
}

// Load students for selected group
const loadStudents = async (groupId: string) => {
  try {
    loading.value = true
    const groupStudents = await studentService.getByGroup(groupId)
    students.value = groupStudents.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      user: student.user
    }))
    console.log('Students loaded:', students.value.length)
  } catch (error) {
    console.error('Error loading students:', error)
    students.value = []
  } finally {
    loading.value = false
  }
}

// Load existing attendance for the selected date and group
const loadExistingAttendance = async (groupId: string, date: string) => {
  try {
    const attendance = await attendanceService.getByGroup(groupId, date)
    existingAttendance.value = attendance

    // Only populate attendance data from existing records if no current data exists
    // This prevents clearing user's current edits when reloading after save
    const hasCurrentData = Object.keys(attendanceData.value).length > 0

    if (!hasCurrentData) {
      attendanceData.value = {}
      attendanceNotes.value = {}
    }

    attendance.forEach(record => {
      // Only set if no current value exists (preserves user edits)
      if (!hasCurrentData || !attendanceData.value[record.student_id]) {
        attendanceData.value[record.student_id] = record.status
      }
      if (record.notes && (!hasCurrentData || !attendanceNotes.value[record.student_id])) {
        attendanceNotes.value[record.student_id] = record.notes
      }
    })

    console.log('Existing attendance loaded:', attendance.length, 'records')
  } catch (error) {
    console.error('Error loading existing attendance:', error)
    existingAttendance.value = []
    // Only clear data if no current edits exist
    if (Object.keys(attendanceData.value).length === 0) {
      attendanceData.value = {}
      attendanceNotes.value = {}
    }
  }
}

// Students will be loaded from API when group is selected

const attendanceStatuses = [
  { value: 'present', activeClass: 'bg-green-100 text-green-800' },
  { value: 'absent', activeClass: 'bg-red-100 text-red-800' },
  { value: 'late', activeClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'excused', activeClass: 'bg-blue-100 text-blue-800' }
]

// Computed properties
const today = computed(() => new Date().toISOString().split('T')[0])

const selectedGroup = computed(() => {
  return groups.value.find(group => group.id === selectedGroupId.value)
})

const filteredStudents = computed(() => {
  return students.value
})

const attendanceStats = computed(() => {
  const total = filteredStudents.value.length
  const present = Object.values(attendanceData.value).filter(status => status === 'present').length
  const absent = Object.values(attendanceData.value).filter(status => status === 'absent').length
  const late = Object.values(attendanceData.value).filter(status => status === 'late').length
  const excused = Object.values(attendanceData.value).filter(status => status === 'excused').length
  const rate = total > 0 ? Math.round((present / total) * 100) : 0

  return {
    totalStudents: total,
    presentStudents: present,
    absentStudents: absent,
    lateStudents: late,
    excusedStudents: excused,
    attendanceRate: rate
  }
})

const hasChanges = computed(() => {
  return Object.keys(attendanceData.value).length > 0
})

const isAttendanceAlreadyTaken = computed(() => {
  return existingAttendance.value.length > 0
})

// Methods
const onGroupChange = async () => {
  if (!selectedGroupId.value) {
    students.value = []
    attendanceData.value = {}
    attendanceNotes.value = {}
    return
  }

  // Load students for the selected group
  await loadStudents(selectedGroupId.value)

  // Load existing attendance for the selected date
  await loadExistingAttendance(selectedGroupId.value, selectedDate.value)
}

const onDateChange = async () => {
  if (!selectedGroupId.value) return

  // Clear current attendance data when changing dates
  attendanceData.value = {}
  attendanceNotes.value = {}

  // Load existing attendance for the new date
  await loadExistingAttendance(selectedGroupId.value, selectedDate.value)
}

// Save attendance records
const saveAttendance = async () => {
  if (!selectedGroupId.value || !currentUser.value) {
    alert('Please select a group first')
    return
  }

  if (Object.keys(attendanceData.value).length === 0) {
    alert('Please mark attendance for at least one student')
    return
  }

  try {
    saving.value = true

    // Prepare bulk attendance data
    const attendances = Object.entries(attendanceData.value).map(([studentId, status]) => ({
      student_id: studentId, // Keep as UUID string, don't convert to integer
      status: status,
      notes: attendanceNotes.value[studentId] || '',
      is_excused: status === 'excused'
    }))

    const bulkData = {
      attendance_date: selectedDate.value,
      group_id: selectedGroupId.value,
      // recorded_by: currentUser.value.id, // Commented out since we don't have staff table setup
      attendances: attendances
    }

    console.log('Saving attendance:', bulkData)

    await attendanceService.createBulk(bulkData)

    // Reload existing attendance to show saved data without clearing current form data
    await loadExistingAttendance(selectedGroupId.value, selectedDate.value)

    alert('Attendance saved successfully!')

  } catch (error) {
    console.error('Error saving attendance:', error)
    alert('Failed to save attendance. Please try again.')
  } finally {
    saving.value = false
  }
}

const getAttendanceStatus = (studentId: string) => {
  return attendanceData.value[studentId] || ''
}

const updateAttendance = (studentId: string, status: string) => {
  if (attendanceData.value[studentId] === status) {
    // If clicking the same status, remove it (toggle off)
    delete attendanceData.value[studentId]
  } else {
    // Set new status
    attendanceData.value[studentId] = status
  }
}

const markAllPresent = () => {
  filteredStudents.value.forEach(student => {
    attendanceData.value[student.id] = 'present'
  })
}

const markAllAbsent = () => {
  filteredStudents.value.forEach(student => {
    attendanceData.value[student.id] = 'absent'
  })
}

const resetAttendance = () => {
  attendanceData.value = {}
  attendanceNotes.value = {}
}

const exportAttendance = () => {
  // Export functionality
  console.log('Exporting attendance for group:', selectedGroup.value?.name)
}

const printAttendance = () => {
  // Print functionality
  window.print()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-OM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  // Initialize current user and load groups
  await getCurrentUser()
  await loadGroups()

  // Set default group if available
  if (groups.value.length > 0) {
    selectedGroupId.value = groups.value[0].id
    await onGroupChange()
  }
})
</script>

