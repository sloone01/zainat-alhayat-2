<template>
  <DashboardLayout :sidebar-desktop="sidebarDesktopMode">
    <div class="space-y-6 pb-10" :dir="isRtl ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('attendanceManagement.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('attendanceManagement.description') }}</p>
        </div>
      </section>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label for="group-select" class="block text-sm font-semibold text-gray-900">
                  {{ $t('attendanceManagement.selectGroup') }}
                </label>
                <select
                  id="group-select"
                  v-model="selectedGroupId"
                  :disabled="loading"
                  class="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:bg-gray-100"
                  @change="onGroupChange"
                >
                  <option value="">{{ loading ? $t('attendanceManagement.loadingGroups') : $t('attendanceManagement.selectGroupPlaceholder') }}</option>
                  <option v-for="group in groups" :key="group.id" :value="group.id">
                    {{ group.name }} — {{ group.description?.trim() ? group.description : $t('attendanceManagement.noGroupDescription') }}
                  </option>
                </select>
              </div>
              <div>
                <label for="date-select" class="block text-sm font-semibold text-gray-900">
                  {{ $t('attendanceManagement.selectDate') }}
                </label>
                <input
                  id="date-select"
                  v-model="selectedDate"
                  type="date"
                  :max="today"
                  class="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  @change="onDateChange"
                />
              </div>
            </div>

            <div v-if="selectedGroup" class="flex flex-wrap items-center gap-2">
              <span class="hidden text-xs text-gray-500 sm:inline">{{ $t('attendanceManagement.exportMenu') }}</span>
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                @click="exportAttendanceWord"
              >
                {{ $t('attendanceManagement.exportAsWord') }}
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
                @click="printAttendance"
              >
                {{ $t('attendanceManagement.exportAsPdf') }}
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
                @click="exportAttendance"
              >
                {{ $t('attendanceManagement.exportAsExcel') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedGroup" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-3 lg:grid-cols-5">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ attendanceStats.totalStudents }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('attendanceManagement.totalStudents') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ attendanceStats.presentStudents }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('attendanceManagement.presentStudents') }}</div>
          </div>
          <div class="rounded-xl bg-red-50/70 px-3 py-3 text-center ring-1 ring-red-100">
            <div class="text-xl font-bold tabular-nums text-red-700">{{ attendanceStats.absentStudents }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('attendanceManagement.absentStudents') }}</div>
          </div>
          <div class="rounded-xl bg-sky-50/70 px-3 py-3 text-center ring-1 ring-sky-100">
            <div class="text-xl font-bold tabular-nums text-sky-700">{{ attendanceStats.attendanceRate }}%</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('attendanceManagement.attendanceRate') }}</div>
          </div>
          <div class="col-span-2 rounded-xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-100 sm:col-span-1 lg:col-span-1">
            <div class="truncate text-sm font-semibold text-slate-800" :title="supervisorDisplayName">{{ supervisorDisplayName }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('attendanceManagement.supervisor') }}</div>
          </div>
        </div>

        <div v-if="isAttendanceAlreadyTaken" class="border-b border-amber-100 bg-amber-50 px-6 py-4">
          <div class="flex gap-3">
            <svg class="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-amber-900">
                {{ $t('attendanceManagement.messages.attendanceAlreadyTakenTitle') }}
              </h3>
              <p class="mt-1 text-sm text-amber-800">
                {{ $t('attendanceManagement.messages.attendanceAlreadyTakenBody', { date: formatDate(selectedDate) }) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!selectedGroup"
        class="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-6 py-16 text-center"
      >
        <h3 class="text-base font-semibold text-gray-900">{{ $t('attendanceManagement.messages.selectGroupFirst') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ $t('attendanceManagement.selectGroupPlaceholder') }}</p>
      </div>

      <div
        v-else-if="loading"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-16 text-gray-500"
      >
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <div
        v-else-if="filteredStudents.length === 0"
        class="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-6 py-16 text-center"
      >
        <h3 class="text-base font-semibold text-gray-900">{{ $t('attendanceManagement.messages.noStudentsInGroup') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ selectedGroup.name }}</p>
      </div>

      <div
        v-else
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
      >
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/60 via-white to-teal-50/40 px-6 py-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ $t('attendanceManagement.todayAttendance') }} — {{ selectedGroup.name }}
              </h2>
              <p class="mt-0.5 text-xs text-gray-500">
                {{ $t('attendanceManagement.attendanceDate') }}: {{ formatDate(selectedDate) }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                @click="markAllPresent"
              >
                {{ $t('attendanceManagement.actions.markAllPresent') }}
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                @click="markAllAbsent"
              >
                {{ $t('attendanceManagement.actions.markAllAbsent') }}
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                @click="resetAttendance"
              >
                {{ $t('attendanceManagement.actions.resetAttendance') }}
              </button>
            </div>
          </div>
        </div>

        <div class="hidden overflow-x-auto md:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {{ $t('attendanceManagement.studentName') }}
                </th>
                <th class="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {{ $t('attendanceManagement.statusColumn') }}
                </th>
                <th class="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {{ $t('attendanceManagement.notes') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-primary-50/20">
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {{ student.name.charAt(0) }}
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm font-semibold text-gray-900">{{ student.name }}</div>
                      <div class="text-xs text-gray-500">{{ student.studentId }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-center">
                  <div class="flex flex-wrap justify-center gap-1.5">
                    <button
                      v-for="status in attendanceStatuses"
                      :key="status.value"
                      type="button"
                      :class="[
                        'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                        getAttendanceStatus(student.id) === status.value
                          ? status.activeClass
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      ]"
                      @click="updateAttendance(student.id, status.value)"
                    >
                      {{ $t(`attendanceManagement.status.${status.value}`) }}
                    </button>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <input
                    v-model="attendanceNotes[student.id]"
                    type="text"
                    :placeholder="$t('attendanceManagement.notes')"
                    class="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="divide-y divide-gray-100 md:hidden">
          <div v-for="student in filteredStudents" :key="student.id" class="p-4">
            <div class="mb-3 flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {{ student.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900">{{ student.name }}</div>
                <div class="text-xs text-gray-500">{{ student.studentId }}</div>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600">{{ $t('attendanceManagement.statusColumn') }}</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="status in attendanceStatuses"
                    :key="status.value"
                    type="button"
                    :class="[
                      'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                      getAttendanceStatus(student.id) === status.value
                        ? status.activeClass
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]"
                    @click="updateAttendance(student.id, status.value)"
                  >
                    {{ $t(`attendanceManagement.status.${status.value}`) }}
                  </button>
                </div>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600">{{ $t('attendanceManagement.notes') }}</label>
                <input
                  v-model="attendanceNotes[student.id]"
                  type="text"
                  :placeholder="$t('attendanceManagement.notes')"
                  class="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 bg-gray-50/80 px-6 py-4">
          <div class="flex justify-end">
            <button
              type="button"
              :disabled="!hasChanges || saving || !selectedGroupId"
              class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              @click="saveAttendance"
            >
              <svg v-if="!saving" class="me-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <svg v-else class="me-2 h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{
                saving
                  ? $t('attendanceManagement.saving')
                  : isAttendanceAlreadyTaken
                    ? $t('attendanceManagement.actions.updateAttendance')
                    : $t('attendanceManagement.actions.saveAttendance')
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { attendanceService } from '@/services/attendance.service'
import { studentService } from '@/services/student.service'
import { groupService } from '@/services/group.service'
import { scheduleService } from '@/services/schedule.service'
import { settingsService } from '@/services/settings.service'
import { authService } from '@/services'
import * as XLSX from 'xlsx'

const { t, locale } = useI18n()
const route = useRoute()

/** Legacy shell: same attendance UI, collapsible desktop sidebar (see `/attendance/collapsible-layout`). */
const sidebarDesktopMode = computed<'pinned' | 'collapsible'>(() =>
  route.path === '/attendance/collapsible-layout' ? 'collapsible' : 'pinned'
)

const isRtl = computed(() => locale.value === 'ar')

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeFilenameSegment(name: string): string {
  return String(name || 'group')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .trim()
    .slice(0, 80) || 'group'
}

/** Online-class automation used to write these into `attendances.notes`; keep daily remarks teacher-only in UI */
function stripOnlineSessionMirrorNotes(notes: string): string {
  let s = String(notes)
    .replace(/Online session \(auto-present\)/gi, '')
    .replace(/Online session \(auto-absent\)/gi, '')
  s = s.replace(/\s*;\s*/g, ';').replace(/^;+|;+$/g, '').trim()
  return s
}

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

const supervisorDisplayName = computed(() => {
  const u = currentUser.value
  if (!u) return '—'
  const fn = String(u.firstName ?? u.first_name ?? '').trim()
  const ln = String(u.lastName ?? u.last_name ?? '').trim()
  const full = `${fn} ${ln}`.trim()
  return full || String(u.email ?? '').trim() || '—'
})

// Get current user info
const getCurrentUser = async () => {
  try {
    const u = authService.getStoredUser()
    if (u) {
      currentUser.value = u
      return
    }
    currentUser.value = null
  } catch (error) {
    console.error('Error getting current user:', error)
    currentUser.value = null
  }
}

// Load groups based on user role and system settings
const loadGroups = async () => {
  try {
    loading.value = true

    // Get system settings to determine access control
    const systemSettings = await settingsService.getStructuredSettings()

    if (currentUser.value?.role === 'teacher' && currentUser.value?.id) {
      groups.value = await scheduleService.getGroupsForTeacher(currentUser.value.id)
    } else if (currentUser.value?.role === 'admin') {
      groups.value = await groupService.getAll()
    } else if (systemSettings.attendance.allowAllUsersToTakeAttendance) {
      groups.value = await groupService.getAll()
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
      if (record.notes != null && record.notes !== '' && (!hasCurrentData || !attendanceNotes.value[record.student_id])) {
        attendanceNotes.value[record.student_id] = stripOnlineSessionMirrorNotes(record.notes)
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
    alert(t('attendanceManagement.messages.selectGroupBeforeSave'))
    return
  }

  if (Object.keys(attendanceData.value).length === 0) {
    alert(t('attendanceManagement.messages.markAtLeastOneStudent'))
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

    alert(t('attendanceManagement.messages.attendanceSaved'))

  } catch (error) {
    console.error('Error saving attendance:', error)
    alert(t('attendanceManagement.messages.saveAttendanceFailed'))
  } finally {
    saving.value = false
  }
}

const getAttendanceStatus = (studentId: string) => {
  return attendanceData.value[studentId] || ''
}

function attendanceStatusLabel(studentId: string): string {
  const code = getAttendanceStatus(studentId)
  return code ? t(`attendanceManagement.status.${code}`) : '—'
}

function buildExportHeaders(): string[] {
  return [
    t('attendanceManagement.studentName'),
    t('attendanceManagement.studentIdShort'),
    t('attendanceManagement.statusColumn'),
    t('attendanceManagement.notes'),
  ]
}

function buildStudentExportRows(): (string | number)[][] {
  return filteredStudents.value.map((student) => [
    student.name,
    student.studentId,
    attendanceStatusLabel(student.id),
    attendanceNotes.value[student.id] || '',
  ])
}

function buildSummaryLabelValueRows(): (string | number)[][] {
  return [
    [t('attendanceManagement.totalStudents'), String(attendanceStats.value.totalStudents)],
    [t('attendanceManagement.presentStudents'), String(attendanceStats.value.presentStudents)],
    [t('attendanceManagement.absentStudents'), String(attendanceStats.value.absentStudents)],
    [t('attendanceManagement.attendanceRate'), `${attendanceStats.value.attendanceRate}%`],
    [],
    [t('attendanceManagement.attendanceDate'), formatDate(selectedDate.value)],
    [t('common.group'), selectedGroup.value!.name],
    [],
  ]
}

function applyRtlToExcel(wb: XLSX.WorkBook, ws: XLSX.WorkSheet, rtl: boolean) {
  if (!rtl) return
  ;(ws as XLSX.WorkSheet & { '!views'?: { RTL?: boolean }[] })['!views'] = [{ RTL: true }]
  wb.Workbook = { ...(wb.Workbook || {}), Views: [{ RTL: true }] }
}

function buildAttendancePdfInnerHtml(supervisor: string): string {
  const stats = attendanceStats.value
  const rtl = isRtl.value
  const ta = rtl ? 'right' : 'left'
  const tableRows = filteredStudents.value
    .map((student) => {
      const statusLabel = attendanceStatusLabel(student.id)
      const notes = attendanceNotes.value[student.id] || ''
      return `<tr>
        <td>${escapeHtml(student.name)}</td>
        <td>${escapeHtml(String(student.studentId))}</td>
        <td>${escapeHtml(statusLabel)}</td>
        <td>${escapeHtml(notes)}</td>
      </tr>`
    })
    .join('')

  return `
    <style>
      * { box-sizing: border-box; }
      .wrap { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #111827; }
      h1 { font-size: 18px; margin: 0 0 12px; font-weight: 700; text-align: ${ta}; }
      .meta { font-size: 13px; color: #374151; margin-bottom: 16px; line-height: 1.55; text-align: ${ta}; }
      .meta strong { color: #111827; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
      .card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; text-align: center; background: #f9fafb; }
      .card .n { font-size: 18px; font-weight: 700; color: #0f766e; }
      .card .l { font-size: 10px; color: #6b7280; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: ${ta}; }
      th { background: #f3f4f6; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #4b5563; }
      tr:nth-child(even) td { background: #fafafa; }
    </style>
    <div class="wrap">
      <h1>${escapeHtml(t('attendanceManagement.title'))}</h1>
      <div class="meta">
        <div><strong>${escapeHtml(t('common.group'))}</strong>: ${escapeHtml(selectedGroup.value!.name)}</div>
        <div><strong>${escapeHtml(t('attendanceManagement.attendanceDate'))}</strong>: ${escapeHtml(formatDate(selectedDate.value))}</div>
        <div><strong>${escapeHtml(t('attendanceManagement.supervisor'))}</strong>: ${escapeHtml(supervisor)}</div>
      </div>
      <div class="grid">
        <div class="card"><div class="n">${stats.totalStudents}</div><div class="l">${escapeHtml(t('attendanceManagement.totalStudents'))}</div></div>
        <div class="card"><div class="n">${stats.presentStudents}</div><div class="l">${escapeHtml(t('attendanceManagement.presentStudents'))}</div></div>
        <div class="card"><div class="n">${stats.absentStudents}</div><div class="l">${escapeHtml(t('attendanceManagement.absentStudents'))}</div></div>
        <div class="card"><div class="n">${stats.attendanceRate}%</div><div class="l">${escapeHtml(t('attendanceManagement.attendanceRate'))}</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t('attendanceManagement.studentName'))}</th>
            <th>${escapeHtml(t('attendanceManagement.studentIdShort'))}</th>
            <th>${escapeHtml(t('attendanceManagement.statusColumn'))}</th>
            <th>${escapeHtml(t('attendanceManagement.notes'))}</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `
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
  if (!selectedGroup.value) {
    alert(t('attendanceManagement.messages.selectGroupFirst'))
    return
  }
  if (filteredStudents.value.length === 0) {
    alert(t('attendanceManagement.messages.noStudentsInGroup'))
    return
  }

  const summaryRows = [...buildSummaryLabelValueRows(), buildExportHeaders(), ...buildStudentExportRows()]

  const ws = XLSX.utils.aoa_to_sheet(summaryRows)
  const wb = XLSX.utils.book_new()
  applyRtlToExcel(wb, ws, isRtl.value)
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance')

  const fname = `attendance_${sanitizeFilenameSegment(selectedGroup.value.name)}_${selectedDate.value}.xlsx`
  XLSX.writeFile(wb, fname)
}

const exportAttendanceWord = () => {
  if (!selectedGroup.value) {
    alert(t('attendanceManagement.messages.selectGroupFirst'))
    return
  }
  if (filteredStudents.value.length === 0) {
    alert(t('attendanceManagement.messages.noStudentsInGroup'))
    return
  }

  const supervisor =
    `${currentUser.value?.firstName || ''} ${currentUser.value?.lastName || ''}`.trim() || '—'
  const inner = buildAttendancePdfInnerHtml(supervisor)
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="${locale.value}" dir="${isRtl.value ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${escapeHtml(t('attendanceManagement.title'))}</title></head><body>${inner}</body></html>`
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attendance_${sanitizeFilenameSegment(selectedGroup.value.name)}_${selectedDate.value}.doc`
  a.click()
  URL.revokeObjectURL(url)
}

const printAttendance = async () => {
  if (!selectedGroup.value) {
    alert(t('attendanceManagement.messages.selectGroupFirst'))
    return
  }
  if (filteredStudents.value.length === 0) {
    alert(t('attendanceManagement.messages.noStudentsInGroup'))
    return
  }

  const supervisor =
    `${currentUser.value?.firstName || ''} ${currentUser.value?.lastName || ''}`.trim() || '—'

  const host = document.createElement('div')
  host.setAttribute('dir', isRtl.value ? 'rtl' : 'ltr')
  host.style.cssText =
    'position:fixed;left:-12000px;top:0;width:794px;padding:20px;background:#ffffff;z-index:-1;'
  host.innerHTML = buildAttendancePdfInnerHtml(supervisor)
  document.body.appendChild(host)

  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  try {
    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width

    let heightLeft = imgH
    let y = 0
    pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
    heightLeft -= pageH

    while (heightLeft > 0) {
      y -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
      heightLeft -= pageH
    }

    const fname = `attendance_${sanitizeFilenameSegment(selectedGroup.value.name)}_${selectedDate.value}.pdf`
    pdf.save(fname)
  } catch (e) {
    console.error('PDF export failed:', e)
    alert(t('attendanceManagement.messages.pdfExportFailed'))
  } finally {
    host.remove()
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T12:00:00')
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return date.toLocaleDateString(loc, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

