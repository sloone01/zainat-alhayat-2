<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('weeklySessionPlans.title') }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              {{ $t('weeklySessionPlans.description') }}
            </p>
          </div>
          <div class="mt-4 sm:mt-0 flex space-x-3">
            <button
              v-if="selectedGroup && hasAnyTasks"
              @click="copyFromPreviousWeek"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {{ $t('weeklySessionPlans.copyFromPreviousWeek') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Group Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('weeklySessionPlans.selectGroup') }}
            </label>
            <select
              v-model="selectedGroupId"
              @change="onGroupChange"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{{ $t('weeklySessionPlans.selectGroupPlaceholder') }}</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>

          <!-- Week Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('weeklySessionPlans.selectWeek') }}
            </label>
            <div class="flex items-center space-x-2">
              <button
                @click="previousWeek"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ←
              </button>
              <input
                v-model="selectedWeekStart"
                @change="onWeekChange"
                type="date"
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                @click="nextWeek"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                →
              </button>
              <button
                @click="goToCurrentWeek"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {{ $t('weeklySessionPlans.currentWeek') }}
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              {{ $t('weeklySessionPlans.weekOf') }} {{ formatWeekRange(selectedWeekStart) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-if="!selectedGroup" class="bg-white shadow rounded-lg p-12 text-center">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ $t('weeklySessionPlans.noGroupSelected') }}
        </h3>
        <p class="text-gray-500">
          {{ $t('weeklySessionPlans.noGroupSelectedDescription') }}
        </p>
      </div>

      <!-- Schedule Grid -->
      <div v-else-if="currentSchedule.length === 0" class="bg-white shadow rounded-lg p-12 text-center">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ $t('scheduleManagement.noClassesScheduled') }}
        </h3>
        <p class="text-gray-500">
          {{ $t('scheduleManagement.noClassesDescription') }}
        </p>
      </div>

      <!-- Weekly Schedule Grid -->
      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">
            {{ $t('scheduleManagement.weeklySchedule') }} - {{ selectedGroup.name }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ $t('weeklySessionPlans.weekOf') }} {{ formatWeekRange(selectedWeekStart) }}
          </p>
        </div>

        <!-- Desktop Schedule Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  {{ $t('common.time') }}
                </th>
                <th v-for="day in weekDays" :key="day.key" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t(`scheduleManagement.days.${day.key}`) }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="timeSlot in timeSlots" :key="timeSlot.time" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ timeSlot.time }}
                </td>
                <td v-for="day in weekDays" :key="`${timeSlot.time}-${day.key}`" class="px-2 py-4 text-center relative">
                  <div v-if="getClassForTimeAndDay(timeSlot.time, day.key)" class="class-card">
                    <div
                      :class="[
                        'border rounded-lg p-3 text-left transition-colors duration-200 cursor-pointer',
                        getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) > 0
                          ? 'bg-green-100 border-green-200 hover:bg-green-200'
                          : 'bg-primary-100 border-primary-200 hover:bg-primary-200'
                      ]"
                      @click="openTaskModal(getClassForTimeAndDay(timeSlot.time, day.key))"
                    >
                      <div class="text-sm font-medium text-gray-900">
                        {{ getCourseName(getClassForTimeAndDay(timeSlot.time, day.key).course_id) }}
                      </div>
                      <div class="text-xs text-gray-700 mt-1">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher }}
                      </div>
                      <div v-if="getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) > 0" class="text-xs text-green-700 mt-1 font-medium">
                        {{ getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) }} {{ $t('weeklySessionPlans.tasks') }}
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
                         'border rounded-lg p-3 cursor-pointer transition-colors duration-200',
                         getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) > 0
                           ? 'bg-green-100 border-green-200 hover:bg-green-200'
                           : 'bg-primary-100 border-primary-200 hover:bg-primary-200'
                       ]"
                       @click="openTaskModal(getClassForTimeAndDay(timeSlot.time, day.key))"
                  >
                    <div class="text-sm font-medium text-gray-900">
                      {{ getCourseName(getClassForTimeAndDay(timeSlot.time, day.key).course_id) }}
                    </div>
                    <div class="text-xs text-gray-700 mt-1">
                      {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher }}
                    </div>
                    <div v-if="getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) > 0" class="text-xs text-green-700 mt-1 font-medium">
                      {{ getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key).schedule_id) }} {{ $t('weeklySessionPlans.tasks') }}
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
    </div>

    <!-- Task Management Modal -->
    <WeeklySessionPlanModal
      :show="showCreateModal"
      :schedule="selectedSchedule"
      :group-id="selectedGroupId"
      :week-start-date="selectedWeekStart"
      :existing-tasks="selectedSchedule ? (tasksBySchedule[selectedSchedule.id] || []) : []"
      @close="closeModal"
      @save="savePlan"
      @delete="deleteTask"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import WeeklySessionPlanModal from '../components/WeeklySessionPlanModal.vue'
import {
  weeklySessionPlanService,
  groupService,
  scheduleService,
  courseService,
  userService,
  type WeeklySessionPlan,
  type Group,
  type Schedule,
  type Course
} from '../services'

// Define teacher type
interface Teacher {
  id: string
  first_name: string
  last_name: string
}

const { t } = useI18n()

// Reactive data
const groups = ref<Group[]>([])
const schedules = ref<Schedule[]>([])
const weeklyPlans = ref<WeeklySessionPlan[]>([])
const courses = ref<Course[]>([])
const teachers = ref<Teacher[]>([])
const selectedGroupId = ref<string>('')
const selectedWeekStart = ref<string>('')
const loading = ref(false)
const showCreateModal = ref(false)
const selectedSchedule = ref<Schedule | null>(null)

// Week days configuration (same as ScheduleManagementView)
const weekDays = [
  { key: 'sunday', name: 'الأحد' },
  { key: 'monday', name: 'الإثنين' },
  { key: 'tuesday', name: 'الثلاثاء' },
  { key: 'wednesday', name: 'الأربعاء' },
  { key: 'thursday', name: 'الخميس' },
  { key: 'friday', name: 'الجمعة' },
  { key: 'saturday', name: 'السبت' }
]

// Default time slots (same as ScheduleManagementView)
const defaultTimeSlots = [
  { time: '08:00' },
  { time: '08:45' },
  { time: '09:30' },
  { time: '10:15' },
  { time: '11:00' },
  { time: '11:45' },
  { time: '12:30' },
  { time: '13:15' }
]

// Time slots configuration - dynamic based on settings
const timeSlots = ref([...defaultTimeSlots])

// Current schedule data (like ScheduleManagementView)
const currentSchedule = ref<any[]>([])

// Computed properties
const selectedGroup = computed(() =>
  groups.value.find(g => g.id === selectedGroupId.value)
)

const hasAnyTasks = computed(() => weeklyPlans.value.length > 0)

// Group tasks by schedule_id for quick lookup
const tasksBySchedule = computed(() => {
  const grouped: Record<string, WeeklySessionPlan[]> = {}
  weeklyPlans.value.forEach(plan => {
    if (!grouped[plan.schedule_id]) {
      grouped[plan.schedule_id] = []
    }
    grouped[plan.schedule_id].push(plan)
  })
  return grouped
})

// Load settings from localStorage (same as ScheduleManagementView)
const loadClassSettings = () => {
  try {
    const savedSettings = localStorage.getItem('classSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.timeSlots && settings.timeSlots.length > 0) {
        timeSlots.value = settings.timeSlots.map((slot: any) => ({ time: slot.startTime }))
      }
    }
  } catch (error) {
    console.warn('Failed to load class settings:', error)
  }
}

// Initialize with current week
onMounted(async () => {
  selectedWeekStart.value = weeklySessionPlanService.getCurrentWeekStartDate()
  loadClassSettings()
  await Promise.all([
    loadGroups(),
    loadCourses(),
    loadTeachers()
  ])
})

// Methods
const loadGroups = async () => {
  console.log('Loading groups...')
  try {
    const result = await groupService.getActive(1) // Use getActive with schoolId = 1 like other views
    console.log('Groups loaded:', result)
    groups.value = result
    console.log('Groups set to reactive value:', groups.value)
  } catch (error) {
    console.error('Failed to load groups:', error)
    alert('Failed to load groups: ' + error.message)
  }
}

const loadCourses = async () => {
  console.log('Loading courses...')
  try {
    const result = await courseService.getAllCourses() // Use getAllCourses like other views
    console.log('Courses loaded:', result)
    courses.value = result
  } catch (error) {
    console.error('Failed to load courses:', error)
  }
}

const loadTeachers = async () => {
  console.log('Loading teachers...')
  try {
    const users = await userService.getByRole('teacher')
    console.log('Teachers loaded:', users)
    teachers.value = users
  } catch (error) {
    console.error('Failed to load teachers:', error)
  }
}

const loadSchedules = async () => {
  if (!selectedGroupId.value) {
    schedules.value = []
    currentSchedule.value = []
    return
  }

  try {
    schedules.value = await scheduleService.getSchedulesByGroup(selectedGroupId.value)

    // Transform schedules to match ScheduleManagementView format
    currentSchedule.value = schedules.value.map(schedule => ({
      id: schedule.id,
      day: schedule.day_of_week.toLowerCase(),
      startTime: schedule.start_time.substring(0, 5), // "08:00:00" -> "08:00"
      endTime: schedule.end_time.substring(0, 5),
      subject: schedule.course_id,
      teacher: getTeacherName(schedule.teacher_id),
      room: schedule.room_id ? `Room ${schedule.room_id}` : 'TBD',
      course_id: schedule.course_id,
      teacher_id: schedule.teacher_id,
      schedule_id: schedule.id
    }))

    console.log('Loaded schedules:', currentSchedule.value)
  } catch (error) {
    console.error('Failed to load schedules:', error)
    schedules.value = []
    currentSchedule.value = []
  }
}

const loadWeeklyPlans = async () => {
  if (!selectedGroupId.value || !selectedWeekStart.value) {
    weeklyPlans.value = []
    return
  }

  loading.value = true
  try {
    weeklyPlans.value = await weeklySessionPlanService.getAll(
      selectedGroupId.value,
      selectedWeekStart.value
    )
  } catch (error) {
    console.error('Failed to load weekly plans:', error)
    weeklyPlans.value = []
  } finally {
    loading.value = false
  }
}

const onGroupChange = async () => {
  await Promise.all([
    loadSchedules(),
    loadWeeklyPlans()
  ])
}

const onWeekChange = () => {
  loadWeeklyPlans()
}

const previousWeek = () => {
  const currentDate = new Date(selectedWeekStart.value)
  currentDate.setDate(currentDate.getDate() - 7)
  selectedWeekStart.value = currentDate.toISOString().split('T')[0]
  loadWeeklyPlans()
}

const nextWeek = () => {
  const currentDate = new Date(selectedWeekStart.value)
  currentDate.setDate(currentDate.getDate() + 7)
  selectedWeekStart.value = currentDate.toISOString().split('T')[0]
  loadWeeklyPlans()
}

const goToCurrentWeek = () => {
  selectedWeekStart.value = weeklySessionPlanService.getCurrentWeekStartDate()
  loadWeeklyPlans()
}

const formatWeekRange = (weekStart: string) => {
  return weeklySessionPlanService.formatWeekRange(weekStart)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Schedule grid helper methods (same as ScheduleManagementView)
const getClassForTimeAndDay = (time: string, day: string) => {
  const match = currentSchedule.value.find(cls =>
    cls.startTime === time && cls.day === day
  )
  return match
}

const getTaskCount = (scheduleId: string) => {
  return tasksBySchedule.value[scheduleId]?.length || 0
}

const getCourseName = (courseId: string) => {
  const course = courses.value.find(c => c.id === courseId)
  return course?.name || 'Unknown Course'
}

const getTeacherName = (teacherId: string) => {
  const teacher = teachers.value.find(t => t.id === teacherId)
  return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher'
}

const openTaskModal = (classData: any) => {
  // Find the original schedule data
  const schedule = schedules.value.find(s => s.id === classData.schedule_id)
  if (schedule) {
    selectedSchedule.value = schedule
    showCreateModal.value = true
  }
}

const copyFromPreviousWeek = async () => {
  if (!selectedWeekStart.value) return

  loading.value = true
  try {
    await weeklySessionPlanService.copyFromPreviousWeek(selectedWeekStart.value)
    await loadWeeklyPlans()
  } catch (error) {
    console.error('Failed to copy from previous week:', error)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  selectedSchedule.value = null
}

const savePlan = async (tasksData: any[]) => {
  console.log('Saving plans with data:', tasksData)

  if (!Array.isArray(tasksData)) {
    console.error('Expected array of tasks, received:', tasksData)
    alert('Invalid data format')
    return
  }

  try {
    // Save all tasks sequentially
    const results = []
    for (const taskData of tasksData) {
      console.log('Saving individual task:', taskData)
      const result = await weeklySessionPlanService.create(taskData)
      results.push(result)
      console.log('Task saved successfully:', result)
    }

    console.log('All tasks saved successfully:', results)
    await loadWeeklyPlans()
    console.log('Weekly plans reloaded')

    // Close modal after saving all tasks
    closeModal()
  } catch (error) {
    console.error('Failed to save task:', error)
    alert('Failed to save task: ' + error.message)
  }
}

const deleteTask = async (taskId: string) => {
  console.log('Deleting task:', taskId)

  try {
    await weeklySessionPlanService.delete(taskId)
    console.log('Task deleted successfully')
    await loadWeeklyPlans()
    console.log('Weekly plans reloaded after deletion')
  } catch (error) {
    console.error('Failed to delete task:', error)
    alert('Failed to delete task: ' + error.message)
  }
}

const buildDescription = (data: any) => {
  let description = data.description || ''

  if (data.objectives && data.objectives.length > 0) {
    description += '\n\nObjectives:\n' + data.objectives.map((obj: string) => `• ${obj}`).join('\n')
  }

  if (data.activities && data.activities.length > 0) {
    description += '\n\nActivities:\n'
    data.activities.forEach((activity: any) => {
      description += `\n${activity.day}: ${activity.title}\n`
      description += `  Description: ${activity.description}\n`
      description += `  Duration: ${activity.duration} minutes\n`
      if (activity.materials && activity.materials.length > 0) {
        description += `  Materials: ${activity.materials.join(', ')}\n`
      }
    })
  }

  if (data.notes) {
    description += '\n\nNotes:\n' + data.notes
  }

  return description.trim()
}


</script>
