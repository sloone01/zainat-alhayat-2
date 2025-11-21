<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('teacherWeeklySessions.title') }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              {{ $t('teacherWeeklySessions.description') }}
            </p>
          </div>
          <div class="mt-4 sm:mt-0">
            <button
              @click="refreshTasks"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ loading ? $t('common.loading') : $t('common.refresh') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Group Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('common.group') }}
            </label>
            <select
              v-model="selectedGroupId"
              @change="onGroupChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{{ $t('common.selectGroup') }}</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>

          <!-- Week Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('teacherWeeklySessions.selectWeek') }}
            </label>
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                @click="previousWeek"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <input
                v-model="selectedWeekStart"
                @change="onWeekChange"
                type="date"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                @click="nextWeek"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Current Week Display -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('teacherWeeklySessions.weekOf') }}
            </label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
              {{ formatWeekRange(selectedWeekStart) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div v-if="selectedGroupId" class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('teacherWeeklySessions.weekProgress') }}</h2>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">{{ $t('teacherWeeklySessions.completionProgress') }}</span>
            <span class="text-sm text-gray-500">{{ progressStats.completed }} / {{ progressStats.total }} {{ $t('common.tasks') }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-green-600 h-3 rounded-full transition-all duration-300 ease-in-out"
              :style="{ width: progressStats.percentage + '%' }"
            ></div>
          </div>
          <div class="text-right mt-1">
            <span class="text-sm font-medium text-green-600">{{ progressStats.percentage }}%</span>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ progressStats.total }}</div>
            <div class="text-sm text-blue-800">{{ $t('teacherWeeklySessions.totalTasks') }}</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ progressStats.completed }}</div>
            <div class="text-sm text-green-800">{{ $t('teacherWeeklySessions.completedTasks') }}</div>
          </div>
          <div class="text-center p-3 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ progressStats.pending }}</div>
            <div class="text-sm text-yellow-800">{{ $t('teacherWeeklySessions.pendingTasks') }}</div>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ progressStats.sessions }}</div>
            <div class="text-sm text-purple-800">{{ $t('teacherWeeklySessions.totalSessions') }}</div>
          </div>
        </div>
      </div>

      <!-- Schedule Grid -->
      <div v-if="selectedGroupId" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('teacherWeeklySessions.weeklySchedule') }}</h2>
            <div class="text-sm text-gray-500">
              {{ $t('teacherWeeklySessions.clickToManageTasks') }}
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Desktop Schedule Grid -->
        <div v-else class="hidden lg:block overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('common.time') }}
                </th>
                <th v-for="day in weekDays" :key="day.key" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t(`scheduleManagement.days.${day.key}`) }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="timeSlot in timeSlots" :key="timeSlot.time">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ timeSlot.time }}
                </td>
                <td v-for="day in weekDays" :key="`${timeSlot.time}-${day.key}`" class="px-2 py-4 text-center relative">
                  <div v-if="getClassForTimeAndDay(timeSlot.time, day.key)" class="class-card">
                    <div
                      :class="[
                        'border rounded-lg p-3 text-left transition-colors duration-200 cursor-pointer relative',
                        getSessionStatusClass(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id)
                      ]"
                      @click="openTaskModal(getClassForTimeAndDay(timeSlot.time, day.key))"
                    >
                      <!-- Progress indicator -->
                      <div v-if="getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) > 0"
                           class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                           :class="getProgressIndicatorClass(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id)">
                        {{ getCompletedTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) }}
                      </div>

                      <div class="text-sm font-medium text-gray-900">
                        {{ getCourseName(getClassForTimeAndDay(timeSlot.time, day.key).course_id) }}
                      </div>
                      <div class="text-xs text-gray-700 mt-1">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher }}
                      </div>
                      <div v-if="getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) > 0" class="text-xs mt-2">
                        <div class="flex items-center justify-between">
                          <span class="font-medium">{{ getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) }} {{ $t('common.tasks') }}</span>
                          <span class="text-xs" :class="getTaskProgressTextClass(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id)">
                            {{ getTaskProgressText(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) }}
                          </span>
                        </div>
                        <!-- Mini progress bar -->
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            class="h-1.5 rounded-full transition-all duration-300"
                            :class="getProgressBarClass(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id)"
                            :style="{ width: getTaskProgressPercentage(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                    <span class="text-xs text-gray-400">{{ $t('scheduleManagement.noClassesScheduled') }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Schedule -->
        <div class="lg:hidden">
          <div v-for="day in weekDays" :key="day.key" class="border-b border-gray-200 last:border-b-0">
            <div class="bg-gray-50 px-6 py-3">
              <h3 class="text-sm font-medium text-gray-900">{{ $t(`scheduleManagement.days.${day.key}`) }}</h3>
            </div>
            <div class="p-4 space-y-3">
              <div v-for="timeSlot in timeSlots" :key="timeSlot.time" class="flex items-center gap-3">
                <div class="w-16 text-sm font-medium text-gray-500">
                  {{ timeSlot.time }}
                </div>
                <div class="flex-1">
                  <div v-if="getClassForTimeAndDay(timeSlot.time, day.key)"
                       :class="[
                         'border rounded-lg p-3 cursor-pointer transition-colors duration-200 relative',
                         getSessionStatusClass(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id)
                       ]"
                       @click="openTaskModal(getClassForTimeAndDay(timeSlot.time, day.key))"
                  >
                    <!-- Progress indicator -->
                    <div v-if="getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) > 0"
                         class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                         :class="getProgressIndicatorClass(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id)">
                      {{ getCompletedTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) }}
                    </div>

                    <div class="text-sm font-medium text-gray-900">
                      {{ getCourseName(getClassForTimeAndDay(timeSlot.time, day.key).course_id) }}
                    </div>
                    <div class="text-xs text-gray-700 mt-1">
                      {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher }}
                    </div>
                    <div v-if="getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) > 0" class="text-xs mt-2">
                      <div class="flex items-center justify-between">
                        <span class="font-medium">{{ getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) }} {{ $t('common.tasks') }}</span>
                        <span class="text-xs" :class="getTaskProgressTextClass(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id)">
                          {{ getTaskProgressText(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) }}
                        </span>
                      </div>
                      <!-- Mini progress bar -->
                      <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          class="h-1 rounded-full transition-all duration-300"
                          :class="getProgressBarClass(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id)"
                          :style="{ width: getTaskProgressPercentage(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                    <span class="text-xs text-gray-400">{{ $t('scheduleManagement.noClassesScheduled') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Group Selected State -->
      <div v-else class="bg-white shadow rounded-lg p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('common.selectGroup') }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ $t('teacherWeeklySessions.noSessionsFoundDescription') }}</p>
      </div>
    </div>

    <!-- Task Completion Modal (Read-only with completion options) -->
    <TaskCompletionModal
      :show="showTaskModal"
      :schedule="selectedSchedule"
      :group-id="selectedGroupId"
      :week-start-date="selectedWeekStart"
      :existing-tasks="selectedSchedule ? (tasksBySchedule[selectedSchedule.id] || []) : []"
      :courses="courses"
      :groups="groups"
      @close="closeTaskModal"
      @complete="openCompletionForm"
      @postpone="postponeTask"
      @viewDetails="openDetailsModal"
    />

    <!-- Task Completion Form -->
    <TaskCompletionForm
      :show="showCompletionForm"
      :task="selectedTask"
      @close="closeCompletionForm"
      @submit="submitTaskCompletion"
    />

    <!-- Task Details Modal -->
    <TaskDetailsModal
      :show="showDetailsModal"
      :task="selectedTaskForDetails"
      @close="closeDetailsModal"
    />

  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import TaskCompletionModal from '@/components/TaskCompletionModal.vue'
import TaskCompletionForm from '@/components/TaskCompletionForm.vue'
import TaskDetailsModal from '@/components/TaskDetailsModal.vue'
import { scheduleService } from '@/services/schedule.service'
import { weeklySessionPlanService } from '@/services/weekly-session-plan.service'
import { groupService } from '@/services/group.service'
import { courseService } from '@/services/course.service'
import { settingsService } from '@/services/settings.service'
import { authService } from '@/services/auth.service'
import { sessionMediaService } from '@/services/session-media.service'
import type { User } from '@/services/user.service'

const { t } = useI18n()

// Helper functions (defined first)
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  const weekStart = new Date(d.setDate(diff))
  return weekStart.toISOString().split('T')[0]
}

// Reactive data
const loading = ref(false)
const selectedWeekStart = ref(getWeekStart(new Date()))
const selectedGroupId = ref('')
const groups = ref([])
const schedules = ref([])
const currentSchedule = ref([]) // Transformed schedules for grid display
const courses = ref([])
const teachers = ref<User[]>([])
const tasksBySchedule = ref({})
const currentUser = ref(null)
const allowAllTeachersAccess = ref(true)
const showTaskModal = ref(false)
const showCompletionForm = ref(false)
const showDetailsModal = ref(false)
const selectedSchedule = ref(null)
const selectedTask = ref(null)
const selectedTaskForDetails = ref(null)

// Week days configuration
const weekDays = [
  { key: 'sunday', name: 'الأحد' },
  { key: 'monday', name: 'الاثنين' },
  { key: 'tuesday', name: 'الثلاثاء' },
  { key: 'wednesday', name: 'الأربعاء' },
  { key: 'thursday', name: 'الخميس' },
  { key: 'friday', name: 'الجمعة' },
  { key: 'saturday', name: 'السبت' }
]

// Time slots (you can make this dynamic based on your needs)
const timeSlots = ref([
  { time: '08:00' },
  { time: '09:00' },
  { time: '10:00' },
  { time: '11:00' },
  { time: '12:00' },
  { time: '13:00' },
  { time: '14:00' },
  { time: '15:00' },
  { time: '16:00' }
])

// Helper methods
const formatWeekRange = (weekStart: string): string => {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return `${start.toLocaleDateString('ar-SA')} - ${end.toLocaleDateString('ar-SA')}`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

// Helper function to get storage key
const getStorageKey = (): string => {
  return `tasks_${selectedGroupId.value}_${selectedWeekStart.value}`
}

const getCourseName = (courseId: string): string => {
  // First try to find in the schedule data (which includes course objects)
  const schedule = schedules.value.find(s => s.course_id === courseId)
  if (schedule && schedule.course) {
    return schedule.course.name || schedule.course.title || 'مقرر غير معروف'
  }

  // Fallback to courses array
  const course = courses.value.find(c => c.id === courseId)
  return course ? (course.name_ar || course.name) : 'مقرر غير معروف'
}

const getClassForTimeAndDay = (time: string, day: string) => {
  const match = currentSchedule.value.find(cls =>
    cls.startTime === time && cls.day === day
  )
  return match
}

const getTeacherName = (teacherId: string): string => {
  // First try to find in the schedule data (which includes teacher objects)
  const schedule = schedules.value.find(s => s.teacher_id === teacherId)
  if (schedule && schedule.teacher) {
    return `${schedule.teacher.firstName} ${schedule.teacher.lastName}` || schedule.teacher.username || 'معلم غير معروف'
  }

  // Fallback to teachers array
  const teacher = teachers.value.find(t => t.id === teacherId)
  return teacher ? (teacher.fullName || `${teacher.firstName} ${teacher.lastName}`) : 'معلم غير معروف'
}

const getTaskCount = (scheduleId: string): number => {
  return tasksBySchedule.value[scheduleId]?.length || 0
}

const getCompletedTaskCount = (scheduleId: string): number => {
  const tasks = tasksBySchedule.value[scheduleId] || []
  return tasks.filter(task => task.is_completed).length
}

const getTaskProgressPercentage = (scheduleId: string): number => {
  const tasks = tasksBySchedule.value[scheduleId] || []
  if (tasks.length === 0) return 0
  const completed = tasks.filter(task => task.is_completed).length
  return Math.round((completed / tasks.length) * 100)
}

const getTaskProgressText = (scheduleId: string): string => {
  const tasks = tasksBySchedule.value[scheduleId] || []
  const completed = tasks.filter(task => task.is_completed).length
  const total = tasks.length

  if (total === 0) return ''
  if (completed === total) return 'مكتمل'
  if (completed === 0) return 'لم يبدأ'
  return `${completed}/${total}`
}

const getSessionStatusClass = (scheduleId: string): string => {
  const tasks = tasksBySchedule.value[scheduleId] || []
  const completed = tasks.filter(task => task.is_completed).length
  const total = tasks.length

  if (total === 0) return 'bg-gray-100 border-gray-200 hover:bg-gray-200'
  if (completed === total) return 'bg-green-100 border-green-200 hover:bg-green-200'
  if (completed > 0) return 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200'
  return 'bg-blue-100 border-blue-200 hover:bg-blue-200'
}

const getProgressIndicatorClass = (scheduleId: string): string => {
  const tasks = tasksBySchedule.value[scheduleId] || []
  const completed = tasks.filter(task => task.is_completed).length
  const total = tasks.length

  if (completed === total) return 'bg-green-500'
  if (completed > 0) return 'bg-yellow-500'
  return 'bg-blue-500'
}

const getTaskProgressTextClass = (scheduleId: string): string => {
  const tasks = tasksBySchedule.value[scheduleId] || []
  const completed = tasks.filter(task => task.is_completed).length
  const total = tasks.length

  if (completed === total) return 'text-green-600 font-medium'
  if (completed > 0) return 'text-yellow-600 font-medium'
  return 'text-blue-600'
}

const getProgressBarClass = (scheduleId: string): string => {
  const tasks = tasksBySchedule.value[scheduleId] || []
  const completed = tasks.filter(task => task.is_completed).length
  const total = tasks.length

  if (completed === total) return 'bg-green-500'
  if (completed > 0) return 'bg-yellow-500'
  return 'bg-blue-500'
}

// Progress statistics
const progressStats = computed(() => {
  let totalTasks = 0
  let completedTasks = 0
  let pendingTasks = 0
  let totalSessions = 0

  // Count tasks across all schedules
  Object.values(tasksBySchedule.value).forEach(tasks => {
    totalSessions++
    totalTasks += tasks.length
    tasks.forEach(task => {
      if (task.is_completed) {
        completedTasks++
      } else {
        pendingTasks++
      }
    })
  })

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    sessions: totalSessions,
    percentage
  }
})

// Main methods
const getCurrentUser = async () => {
  try {
    currentUser.value = authService.getStoredUser()
    console.log('✅ Current user loaded:', currentUser.value)
  } catch (error) {
    console.error('❌ Error getting current user:', error)
    currentUser.value = null
  }
}

const loadSettings = async () => {
  try {
    const settings = await settingsService.getAll()
    const teacherAccessSetting = settings.find(s => s.key === 'allowAllTeachersAccessToLessons')
    allowAllTeachersAccess.value = teacherAccessSetting ? teacherAccessSetting.value === 'true' : true
    console.log('✅ Settings loaded, allowAllTeachersAccess:', allowAllTeachersAccess.value)
  } catch (error) {
    console.error('❌ Error loading settings:', error)
    allowAllTeachersAccess.value = true
  }
}

const loadGroups = async () => {
  try {
    console.log('🔄 Loading groups...')
    console.log('👤 Current user:', currentUser.value)
    console.log('🔧 Allow all teachers access:', allowAllTeachersAccess.value)

    try {
      if (allowAllTeachersAccess.value || currentUser.value?.role === 'admin') {
        // Load all groups
        console.log('📋 Loading all groups (permission enabled)')
        groups.value = await groupService.getAll()
      } else {
        // Load only teacher's assigned groups (through schedules)
        console.log('👨‍🏫 Loading teacher-specific groups')
        const teacherSchedules = await scheduleService.getSchedulesByTeacher(currentUser.value.id)
        const groupIds = [...new Set(teacherSchedules.map(s => s.group_id))]
        groups.value = await Promise.all(groupIds.map(id => groupService.getById(id)))
      }
    } catch (apiError) {
      console.warn('⚠️ API error, using mock groups for testing:', apiError)

      // Mock groups for testing with Arabic names
      groups.value = [
        { id: 'group-1', name: 'مجموعة الأطفال أ', name_ar: 'مجموعة الأطفال أ', description: 'المجموعة الصباحية' },
        { id: 'group-2', name: 'مجموعة الأطفال ب', name_ar: 'مجموعة الأطفال ب', description: 'المجموعة المسائية' },
        { id: 'group-3', name: 'مجموعة الأطفال ج', name_ar: 'مجموعة الأطفال ج', description: 'المجموعة المتقدمة' }
      ]
    }

    console.log('✅ Groups loaded:', groups.value.length)
    console.log('📋 Groups data:', groups.value)
  } catch (error) {
    console.error('❌ Error loading groups:', error)
    groups.value = []
  }
}

const loadSchedulesAndCourses = async () => {
  if (!selectedGroupId.value) {
    schedules.value = []
    currentSchedule.value = []
    courses.value = []
    return
  }

  try {
    console.log('🔄 Loading schedules for group:', selectedGroupId.value)

    // Try to load real data first
    try {
      schedules.value = await scheduleService.getSchedulesByGroup(selectedGroupId.value)

      // Filter by teacher if needed (but only if permission is disabled)
      if (!allowAllTeachersAccess.value && currentUser.value?.role !== 'admin') {
        schedules.value = schedules.value.filter(s => s.teacher_id === currentUser.value.id)
      }

      console.log('✅ Raw schedules loaded:', schedules.value.length)
      console.log('📋 Raw schedules data:', schedules.value)

      // Extract courses and teachers from schedule data
      extractCoursesAndTeachersFromSchedules()

    } catch (apiError) {
      console.error('❌ Error loading schedules:', apiError)
      schedules.value = []
      courses.value = []
      teachers.value = []
    }

    // Transform schedules to match ScheduleManagementView format (same as WeeklySessionPlanView)
    currentSchedule.value = schedules.value.map(schedule => ({
      id: schedule.id,
      day: schedule.day_of_week.toLowerCase(),
      startTime: schedule.start_time.substring(0, 5), // "08:00:00" -> "08:00"
      endTime: schedule.end_time.substring(0, 5),
      subject: schedule.course_id,
      teacher: getTeacherName(schedule.teacher_id || ''),
      room: schedule.room_id ? `Room ${schedule.room_id}` : 'TBD',
      course_id: schedule.course_id,
      teacher_id: schedule.teacher_id,
      schedule_id: schedule.id
    }))

    console.log('✅ Transformed schedules:', currentSchedule.value)

    // Load courses and teachers if not already loaded (for real API)
    if (courses.value.length === 0) {
      try {
        const courseIds = [...new Set(schedules.value.map(s => s.course_id))]
        courses.value = await Promise.all(courseIds.map(id => courseService.getById(id)))

        // For teachers, we'll use the teacher info from the schedule relations if available
        // or create placeholder data
        const teacherIds = [...new Set(schedules.value.map(s => s.teacher_id).filter(Boolean))]
        teachers.value = teacherIds.map(id => {
          const scheduleWithTeacher = schedules.value.find(s => s.teacher_id === id && s.teacher)
          if (scheduleWithTeacher && scheduleWithTeacher.teacher) {
            return scheduleWithTeacher.teacher
          }
          return { id, first_name: 'Unknown', last_name: 'Teacher' }
        })
      } catch (courseError) {
        console.warn('⚠️ Error loading courses/teachers, using existing mock data')
      }
    }

    console.log('✅ Courses loaded:', courses.value.length)
    console.log('✅ Teachers loaded:', teachers.value.length)

    // Load tasks for these schedules
    await loadTasks()

  } catch (error) {
    console.error('❌ Error loading schedules and courses:', error)
    schedules.value = []
    currentSchedule.value = []
    courses.value = []
    teachers.value = []
  }
}

// Extract courses and teachers from schedule data (they're already included)
const extractCoursesAndTeachersFromSchedules = () => {
  try {
    console.log('🔄 Extracting courses and teachers from schedule data')

    // Extract unique courses from schedules
    const uniqueCourses = new Map()
    const uniqueTeachers = new Map()

    schedules.value.forEach(schedule => {
      // Extract course if available
      if (schedule.course && !uniqueCourses.has(schedule.course.id)) {
        uniqueCourses.set(schedule.course.id, schedule.course)
      }

      // Extract teacher if available
      if (schedule.teacher && !uniqueTeachers.has(schedule.teacher.id)) {
        uniqueTeachers.set(schedule.teacher.id, schedule.teacher)
      }
    })

    // Update arrays
    courses.value = Array.from(uniqueCourses.values())
    teachers.value = Array.from(uniqueTeachers.values())

    console.log('✅ Extracted courses:', courses.value.length)
    console.log('✅ Extracted teachers:', teachers.value.length)
    console.log('📋 Courses data:', courses.value)
    console.log('📋 Teachers data:', teachers.value)

  } catch (error) {
    console.error('❌ Error extracting courses and teachers:', error)
  }
}

const loadTasks = async (forceReload = false) => {
  if (!selectedGroupId.value || !selectedWeekStart.value) {
    console.warn('⚠️ Cannot load tasks: missing group ID or week start date')
    return
  }

  try {
    console.log('🔄 Loading tasks for group:', selectedGroupId.value, 'week:', selectedWeekStart.value)

    // Try to load from localStorage first (unless forced reload)
    if (!forceReload) {
      const storedTasks = localStorage.getItem(getStorageKey())

      if (storedTasks) {
        console.log('📦 Loading tasks from localStorage')
        tasksBySchedule.value = JSON.parse(storedTasks)
        return
      }
    }

    tasksBySchedule.value = {}

    // Load all tasks for the group and week in one API call
    try {
      console.log(`🔄 Loading all tasks for group ${selectedGroupId.value}, week ${selectedWeekStart.value}`)
      console.log(`🔄 Available schedules:`, schedules.value.map(s => ({ id: s.id, course: s.course?.name })))

      const allTasks = await weeklySessionPlanService.getAll(selectedGroupId.value, selectedWeekStart.value)
      console.log(`✅ Loaded ${allTasks.length} total tasks from API`)
      console.log('📋 All tasks data:', allTasks)

      if (allTasks.length === 0) {
        console.warn('⚠️ No tasks found for this group and week')
      }

      // Group tasks by schedule_id
      for (const schedule of schedules.value) {
        const scheduleTasks = allTasks.filter(task => {
          const matches = task.schedule_id === schedule.id
          console.log(`🔍 Task ${task.id} (schedule_id: ${task.schedule_id}) ${matches ? '✅ matches' : '❌ does not match'} schedule ${schedule.id}`)
          return matches
        })
        tasksBySchedule.value[schedule.id] = scheduleTasks
        console.log(`✅ Schedule ${schedule.id} (${schedule.course?.name || 'Unknown Course'}): ${scheduleTasks.length} tasks`)

        if (scheduleTasks.length > 0) {
          console.log(`📋 Tasks for schedule ${schedule.id}:`, scheduleTasks.map(t => ({ id: t.id, title: t.task_title })))
        }
      }

      // Check for orphaned tasks (tasks without matching schedules)
      const orphanedTasks = allTasks.filter(task =>
        !schedules.value.some(schedule => schedule.id === task.schedule_id)
      )
      if (orphanedTasks.length > 0) {
        console.warn('⚠️ Found orphaned tasks (no matching schedule):', orphanedTasks)
      }

    } catch (error) {
      console.error(`❌ Error loading tasks from API:`, error)
      console.error('Error details:', error.response?.data || error.message)
      // Initialize empty arrays for all schedules
      for (const schedule of schedules.value) {
        tasksBySchedule.value[schedule.id] = []
      }
    }

    // Save to localStorage
    localStorage.setItem(getStorageKey(), JSON.stringify(tasksBySchedule.value))

    console.log('✅ Tasks loaded for', Object.keys(tasksBySchedule.value).length, 'schedules')
    console.log('📋 Final tasks by schedule:', tasksBySchedule.value)
  } catch (error) {
    console.error('❌ Error loading tasks:', error)
    tasksBySchedule.value = {}
  }
}

// Event handlers
const onGroupChange = async () => {
  console.log('🔄 Group changed to:', selectedGroupId.value)
  await loadSchedulesAndCourses()
  // Force reload tasks when group changes
  if (selectedGroupId.value) {
    await loadTasks(true)
  }
}

const onWeekChange = async () => {
  console.log('🔄 Week changed to:', selectedWeekStart.value)
  if (selectedGroupId.value) {
    // Force reload tasks when week changes
    await loadTasks(true)
  }
}

const previousWeek = () => {
  const currentWeek = new Date(selectedWeekStart.value)
  currentWeek.setDate(currentWeek.getDate() - 7)
  selectedWeekStart.value = currentWeek.toISOString().split('T')[0]
  onWeekChange()
}

const nextWeek = () => {
  const currentWeek = new Date(selectedWeekStart.value)
  currentWeek.setDate(currentWeek.getDate() + 7)
  selectedWeekStart.value = currentWeek.toISOString().split('T')[0]
  onWeekChange()
}

const refreshTasks = async () => {
  console.log('🔄 Manual refresh requested')
  if (selectedGroupId.value) {
    loading.value = true
    try {
      // Clear localStorage cache
      localStorage.removeItem(getStorageKey())
      // Force reload tasks
      await loadTasks(true)
    } finally {
      loading.value = false
    }
  }
}



// Task modal handlers
const openTaskModal = (classData: any) => {
  // Find the original schedule data
  const schedule = schedules.value.find(s => s.id === classData.schedule_id)
  if (schedule) {
    selectedSchedule.value = schedule
    showTaskModal.value = true
  }
}

const closeTaskModal = () => {
  selectedSchedule.value = null
  showTaskModal.value = false
}

// Task completion handlers
const openCompletionForm = (taskId: string) => {
  // Find the task
  const allTasks = Object.values(tasksBySchedule.value).flat()
  const task = allTasks.find(t => t.id === taskId)
  if (task) {
    selectedTask.value = task
    showCompletionForm.value = true
  }
}

const closeCompletionForm = () => {
  selectedTask.value = null
  showCompletionForm.value = false
}

// Task details modal handlers
const openDetailsModal = (task: any) => {
  selectedTaskForDetails.value = task
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  selectedTaskForDetails.value = null
  showDetailsModal.value = false
}

const submitTaskCompletion = async (description: string, files: File[]) => {
  if (!selectedTask.value) return

  try {
    console.log('🔄 Starting task completion process:', selectedTask.value.id)
    console.log('📝 Description:', description)
    console.log('📁 Files:', files.length)

    // Handle file uploads FIRST if any
    if (files.length > 0) {
      console.log('📁 Uploading files to database...')
      // FIXED: Since authentication is disabled, always use the first teacher
      const uploadUserId = '0f851929-30b0-4b1c-8f64-779bd03dae03' // موزة معلمة (first user from DB)

      console.log('📁 Uploading', files.length, 'files for user:', uploadUserId)

      try {
        console.log('📁 Uploading files to database...')

        // Use the actual task ID for the session plan
        const uploadedMedia = await sessionMediaService.uploadMultipleFiles(
          selectedTask.value.id,
          files,
          uploadUserId
        )

        console.log('✅ Files uploaded successfully to database:', uploadedMedia)

        // Update task with uploaded media info from database
        selectedTask.value.media = uploadedMedia.map(media => ({
          id: media.id.toString(),
          file_name: media.file_name,
          file_type: media.file_type,
          file_size: media.file_size,
          file_url: media.file_path,
          uploaded_at: media.uploaded_at,
          mime_type: media.mime_type
        }))

      } catch (uploadError) {
        console.error('❌ Error uploading files to database:', uploadError)
        console.error('Upload error details:', uploadError.response?.data || uploadError.message)

        // Show specific error message
        const errorMessage = uploadError.response?.data?.message || uploadError.message
        alert('❌ فشل في رفع الملفات: ' + errorMessage)

        // Don't continue with completion if file upload fails
        return
      }
    }

    // Now complete the task (after successful file upload)
    console.log('💾 Saving task completion to backend...')
    const completionData = {
      is_completed: true,
      completion_notes: description
    }

    const updatedTask = await weeklySessionPlanService.update(selectedTask.value.id, completionData)
    console.log('✅ Task completion saved to backend:', updatedTask)

    // Update the task in local state with the response from backend
    selectedTask.value.is_completed = true
    selectedTask.value.completion_description = description
    selectedTask.value.completion_notes = description
    selectedTask.value.completed_at = updatedTask.completion_date || updatedTask.completed_at || new Date().toISOString()
    selectedTask.value.completed_by = '0f851929-30b0-4b1c-8f64-779bd03dae03' // Fixed user ID

    // Clear localStorage cache to force reload from backend
    localStorage.removeItem(getStorageKey())

    // Reload tasks from backend to get the latest data
    await loadTasks(true)

    // Debug: Log the updated task data
    console.log('🔍 Updated task after completion:', selectedTask.value)
    console.log('🔍 Task completion_description:', selectedTask.value.completion_description)
    console.log('🔍 Task completion_notes:', selectedTask.value.completion_notes)
    console.log('🔍 Task media:', selectedTask.value.media)

    alert('✅ تم إكمال المهمة بنجاح!')
    closeCompletionForm()

  } catch (error) {
    console.error('❌ Error completing task:', error)
    console.error('Error details:', error.response?.data || error.message)
    alert('❌ حدث خطأ في إكمال المهمة: ' + (error.response?.data?.message || error.message))
  }
}

const postponeTask = async (taskId: string, reason: string) => {
  try {
    console.log('⏸️ Postponing task:', taskId)
    console.log('📝 Reason:', reason)

    // Save postponement to backend API
    const postponeData = {
      is_completed: false,
      completion_notes: `تم التأجيل: ${reason}`
    }

    console.log('💾 Saving postponement to backend...')
    const updatedTask = await weeklySessionPlanService.update(taskId, postponeData)
    console.log('✅ Task postponement saved to backend:', updatedTask)

    // Find and update the task in local state
    const allTasks = Object.values(tasksBySchedule.value).flat()
    const task = allTasks.find(t => t.id === taskId)
    if (task) {
      task.is_completed = false
      task.status = 'postponed'
      task.postponement_reason = reason
      task.postponed_at = new Date().toISOString()
      task.completion_notes = `تم التأجيل: ${reason}`
    }

    // Clear localStorage cache to force reload from backend
    localStorage.removeItem(getStorageKey())

    // Reload tasks from backend to get the latest data
    await loadTasks(true)

    alert('⏸️ تم تأجيل المهمة')

  } catch (error) {
    console.error('❌ Error postponing task:', error)
    console.error('Error details:', error.response?.data || error.message)
    alert('❌ حدث خطأ في تأجيل المهمة: ' + (error.response?.data?.message || error.message))
  }
}



// Lifecycle hooks
onMounted(async () => {
  console.log('🔄 TeacherWeeklySessionsView mounted')

  try {
    await getCurrentUser()
    await loadSettings()
    await loadGroups()
  } catch (error) {
    console.error('❌ Error in onMounted:', error)
  }
})



</script>



<style scoped>
/* Custom styles for RTL support */
.rtl\:space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}

/* Smooth transitions for dropdowns */
.relative > div {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar for mobile */
@media (max-width: 768px) {
  .overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  .overflow-x-auto::-webkit-scrollbar {
    height: 4px;
  }

  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
}
</style>
