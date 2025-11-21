<template>
  <DashboardLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ $t('scheduleManagement.title') }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ $t('scheduleManagement.description') }}</p>
        </div>
        <div class="flex items-center gap-3" v-if="selectedGroup">
          <button
            @click="exportSchedule"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {{ $t('scheduleManagement.actions.exportSchedule') }}
          </button>
          <button
            @click="printSchedule"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            {{ $t('scheduleManagement.actions.printSchedule') }}
          </button>
        </div>
      </div>

      <!-- Group Selection -->
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex-1">
            <label for="group-select" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('scheduleManagement.selectGroup') }}
            </label>
            <select
              id="group-select"
              v-model="selectedGroupId"
              @change="onGroupChange"
              class="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="">{{ $t('scheduleManagement.selectGroupPlaceholder') }}</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }} ({{ group.ageRange }}) - {{ group.currentStudents }}/{{ group.capacity }} {{ $t('groupManagement.students') }}
              </option>
            </select>
          </div>

          <!-- Schedule Statistics -->
          <div v-if="selectedGroup" class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:w-auto w-full">
            <div class="text-center">
              <div class="text-xl font-bold text-primary-600">{{ scheduleStats.totalClasses }}</div>
              <div class="text-xs text-gray-500">{{ $t('scheduleManagement.statistics.totalClasses') }}</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-primary-600">{{ scheduleStats.totalHours }}</div>
              <div class="text-xs text-gray-500">{{ $t('scheduleManagement.statistics.totalHours') }}</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-primary-600">{{ scheduleStats.activeTeachers }}</div>
              <div class="text-xs text-gray-500">{{ $t('scheduleManagement.statistics.activeTeachers') }}</div>
            </div>
            <div class="text-center">
              <div class="text-xl font-bold text-primary-600">{{ scheduleStats.utilizationRate }}%</div>
              <div class="text-xs text-gray-500">{{ $t('scheduleManagement.statistics.utilizationRate') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Group Selected State -->
      <div v-if="!selectedGroup" class="bg-white shadow rounded-lg p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 002.25 2.25v7.5m-18 0h18" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ $t('scheduleManagement.noGroupSelected') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ $t('scheduleManagement.noGroupSelectedDescription') }}</p>
      </div>

      <!-- Weekly Schedule -->
      <div v-if="selectedGroup" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">
            {{ $t('scheduleManagement.weeklySchedule') }} - {{ selectedGroup.name }}
          </h2>
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
                    <div class="bg-primary-100 border border-primary-200 rounded-lg p-3 text-left hover:bg-primary-200 transition-colors duration-200 cursor-pointer"
                         @click="editClass(getClassForTimeAndDay(timeSlot.time, day.key))">
                      <div class="text-sm font-medium text-primary-900">
                        {{ getCourseName(getClassForTimeAndDay(timeSlot.time, day.key).subject) }}
                      </div>
                      <div class="text-xs text-primary-700 mt-1">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher }}
                      </div>
                      <div class="text-xs text-primary-600 mt-1">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key).room }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-purple-300 transition-colors duration-200 cursor-pointer"
                       @click="addClass(timeSlot.time, day.key)">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Schedule (Column Layout) -->
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
                       class="bg-purple-100 border border-purple-200 rounded-lg p-3 cursor-pointer hover:bg-purple-200 transition-colors duration-200"
                       @click="editClass(getClassForTimeAndDay(timeSlot.time, day.key))">
                    <div class="text-sm font-medium text-purple-900">
                      {{ getCourseName(getClassForTimeAndDay(timeSlot.time, day.key).subject) }}
                    </div>
                    <div class="text-xs text-purple-700 mt-1">
                      {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher }} • {{ getClassForTimeAndDay(timeSlot.time, day.key).room }}
                    </div>
                  </div>
                  <div v-else
                       class="h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-300 transition-colors duration-200"
                       @click="addClass(timeSlot.time, day.key)">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- No classes message for mobile -->
              <div v-if="!getDayClasses(day.key).length" class="text-center py-8 text-gray-500">
                <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 002.25 2.25v7.5m-18 0h18" />
                </svg>
                <p class="text-sm">{{ $t('scheduleManagement.noClassesScheduled') }}</p>
                <p class="text-xs mt-1">{{ $t('scheduleManagement.noClassesDescription') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Class Modal -->
    <ClassModal
      v-if="showClassModal"
      :class="selectedClass"
      :group="selectedGroup"
      :day="selectedDay"
      :time="selectedTime"
      :teachers="teachers"
      :courses="courses"
      :rooms="rooms"
      @close="closeClassModal"
      @save="saveClass"
      @delete="deleteClass"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ClassModal from '@/components/ClassModal.vue'
import { courseService } from '@/services/course.service'
import userService from '@/services/user.service'
import { scheduleService } from '@/services/schedule.service'
import { groupService } from '@/services/group.service'

const { t } = useI18n()

// Reactive data
const selectedGroupId = ref('')
const showClassModal = ref(false)
const selectedClass = ref(null)
const selectedDay = ref('')
const selectedTime = ref('')

// Groups data from API
const groups = ref([])

// Additional data for API
const teachers = ref([])
const rooms = ref([])
const courses = ref([])
const loading = ref(false)

// Fetch groups from API
const fetchGroups = async () => {
  try {
    loading.value = true
    const groupsData = await groupService.getActive(1) // school_id = 1

    if (groupsData && Array.isArray(groupsData)) {
      groups.value = groupsData.map(group => ({
        id: group.id,
        name: group.name,
        ageRange: group.age_range_min && group.age_range_max
          ? `${group.age_range_min}-${group.age_range_max} سنوات`
          : 'غير محدد',
        currentStudents: group.students ? group.students.length : 0,
        capacity: group.capacity,
        academicYear: group.academicYear?.year || '2024-2025',
        description: group.description
      }))
      console.log('Groups loaded:', groups.value.length)

      if (groups.value.length === 0) {
        console.warn('No groups found in database')
      }
    } else {
      groups.value = []
      console.error('Invalid groups data received from API')
    }
  } catch (error) {
    console.error('Database error fetching groups:', error)
    groups.value = []

    // Log specific error messages
    if (error.message && error.message.includes('does not exist')) {
      console.error('Database tables not found. Please run database migrations.')
    } else if (error.message && error.message.includes('connect')) {
      console.error('Cannot connect to database. Please check database connection.')
    } else {
      console.error(`Database error: ${error.message || 'Failed to load groups'}`)
    }
  } finally {
    loading.value = false
  }
}

// Fetch teachers from API
const fetchTeachers = async () => {
  try {
    loading.value = true
    const teachersData = await userService.getUsersByRole('teacher')
    teachers.value = teachersData.map(teacher => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      name: `${teacher.firstName} ${teacher.lastName}`,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      isActive: teacher.isActive
    }))
    console.log('Teachers loaded:', teachers.value.length)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    // Show error message instead of using mock data
    teachers.value = []
  } finally {
    loading.value = false
  }
}

// Fetch courses from API
const fetchCourses = async () => {
  try {
    loading.value = true
    const coursesData = await courseService.getAllCourses(1) // school_id = 1
    courses.value = coursesData.filter(course => course.is_active).map(course => ({
      id: course.id,
      name: course.name,
      description: course.description,
      colorCode: course.color_code,
      icon: course.icon,
      ageGroupMin: course.age_group_min,
      ageGroupMax: course.age_group_max
    }))
    console.log('Courses loaded:', courses.value.length)
  } catch (error) {
    console.error('Error fetching courses:', error)
    // Show error message instead of using mock data
    courses.value = []
  } finally {
    loading.value = false
  }
}

// Fetch rooms from API (using constant values as requested)
const fetchRooms = async () => {
  try {
    // Using constant room values as requested
    rooms.value = [
      { id: 1, name: 'قاعة 1', capacity: 25 },
      { id: 2, name: 'قاعة 2', capacity: 20 },
      { id: 3, name: 'قاعة الفنون', capacity: 15 }
    ]
    console.log('Rooms loaded (constant values):', rooms.value.length)
  } catch (error) {
    console.error('Error in fetchRooms:', error)
    rooms.value = []
  }
}

// Schedule data from API
const schedules = ref({})

// Fetch schedules for a specific group
const fetchSchedules = async (groupId: string) => {
  try {
    loading.value = true
    const schedulesData = await scheduleService.getSchedulesByGroup(groupId)
    schedules.value[groupId] = schedulesData.map((schedule: any) => ({
      id: schedule.id,
      day: schedule.day_of_week,
      startTime: schedule.start_time.substring(0, 5), // Convert "09:00:00" to "09:00"
      endTime: schedule.end_time.substring(0, 5), // Convert "09:45:00" to "09:45"
      subject: schedule.course?.name || schedule.subject || 'عام',
      teacher: schedule.teacher?.firstName ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}` : 'غير محدد',
      room: schedule.room?.name || 'غير محدد',
      notes: schedule.notes || '',
      courseId: schedule.course_id,
      teacherId: schedule.teacher_id,
      groupId: schedule.group_id
    }))
    console.log(`Schedules loaded for group ${groupId}:`, schedules.value[groupId].length)
    console.log('Sample schedule:', schedules.value[groupId][0])
  } catch (error) {
    console.error('Error fetching schedules:', error)
    // Show error message instead of using mock data
    schedules.value[groupId] = []
  } finally {
    loading.value = false
  }
}

// Week days configuration
const weekDays = [
  { key: 'sunday', name: 'الأحد' },
  { key: 'monday', name: 'الاثنين' },
  { key: 'tuesday', name: 'الثلاثاء' },
  { key: 'wednesday', name: 'الأربعاء' },
  { key: 'thursday', name: 'الخميس' }
]

// Default time slots for the schedule grid (8 rows as requested)
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

// Time slots configuration - now dynamic based on settings
const timeSlots = ref([...defaultTimeSlots])

// Load settings from localStorage or API
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

// Initialize data on component mount
onMounted(async () => {
  loadClassSettings()
  await Promise.all([
    fetchGroups(),
    fetchTeachers(),
    fetchCourses(),
    fetchRooms()
  ])
})

// Watch for settings changes from other components
const updateTimeSlots = (newSlots: any[]) => {
  timeSlots.value = newSlots.map(slot => ({ time: slot.startTime }))
  // Save to localStorage for persistence
  try {
    localStorage.setItem('classSettings', JSON.stringify({ timeSlots: newSlots }))
  } catch (error) {
    console.warn('Failed to save class settings:', error)
  }
}

// Computed properties
const selectedGroup = computed(() => {
  return groups.value.find(group => group.id === selectedGroupId.value)
})

const currentSchedule = computed(() => {
  return selectedGroupId.value ? schedules.value[selectedGroupId.value] || [] : []
})

const scheduleStats = computed(() => {
  const schedule = currentSchedule.value
  const totalClasses = schedule.length
  const totalHours = schedule.reduce((sum, cls) => {
    const start = new Date(`2000-01-01 ${cls.startTime}`)
    const end = new Date(`2000-01-01 ${cls.endTime}`)
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }, 0)
  const uniqueTeachers = new Set(schedule.map(cls => cls.teacher)).size
  const utilizationRate = Math.round((totalClasses / (weekDays.length * timeSlots.length)) * 100)

  return {
    totalClasses,
    totalHours: Math.round(totalHours * 10) / 10,
    activeTeachers: uniqueTeachers,
    utilizationRate
  }
})

// Methods
const onGroupChange = async () => {
  // Reset any selected class when group changes
  selectedClass.value = null

  // Fetch schedules for the selected group
  if (selectedGroupId.value) {
    console.log('Group changed to:', selectedGroupId.value)
    await fetchSchedules(selectedGroupId.value)
    console.log('Selected group:', selectedGroup.value?.name)
    console.log('Current schedule after fetch:', currentSchedule.value)
  }
}

const getClassForTimeAndDay = (time: string, day: string) => {
  const match = currentSchedule.value.find(cls =>
    cls.startTime === time && cls.day === day
  )
  // Debug logging
  if (currentSchedule.value.length > 0 && !match) {
    console.log(`No match for ${time} on ${day}. Available schedules:`, currentSchedule.value.map(s => `${s.startTime} on ${s.day}`))
  }
  return match
}

const getDayClasses = (day: string) => {
  return currentSchedule.value.filter(cls => cls.day === day)
}

const getCourseName = (courseId: string) => {
  const course = courses.value.find(c => c.id === courseId)
  return course ? course.name : courseId
}

const addClass = (time: string, day: string) => {
  selectedClass.value = null
  selectedTime.value = time
  selectedDay.value = day
  showClassModal.value = true
}

const editClass = (classItem: any) => {
  selectedClass.value = classItem
  selectedTime.value = classItem.startTime
  selectedDay.value = classItem.day
  showClassModal.value = true
}

const closeClassModal = () => {
  showClassModal.value = false
  selectedClass.value = null
  selectedTime.value = ''
  selectedDay.value = ''
}

const saveClass = async (classData: any) => {
  const groupId = selectedGroupId.value
  if (!schedules.value[groupId]) {
    schedules.value[groupId] = []
  }

  try {
    loading.value = true
    // Find teacher ID from teacher name (firstName + lastName)
    const teacher = teachers.value.find(t => {
      const fullName = `${t.firstName} ${t.lastName}`
      return fullName === classData.teacher || t.id === classData.teacher
    })

    // Calculate duration in minutes
    const startTime = new Date(`2000-01-01 ${classData.startTime}`)
    const endTime = new Date(`2000-01-01 ${classData.endTime}`)
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)

    // Find course ID from subject name
    const course = courses.value.find(c => c.name === classData.subject || c.id === classData.subject)
    console.log('Found course:', course)

    const scheduleData = {
      day_of_week: classData.day,
      start_time: classData.startTime,
      end_time: classData.endTime,
      duration_minutes: durationMinutes,
      notes: classData.notes || '',
      group_id: groupId,
      course_id: course?.id || null,
      teacher_id: teacher?.id || null,
      room_id: null // since we made room a text field
    }

    console.log('Schedule data to be sent:', scheduleData)

    if (selectedClass.value) {
      // Edit existing class
      await scheduleService.updateSchedule(selectedClass.value.id, scheduleData)
      // Reload schedules to get populated relations (teacher names, course names)
      await fetchSchedules(groupId)
    } else {
      // Add new class
      await scheduleService.createSchedule(scheduleData)
      // Reload schedules to get populated relations (teacher names, course names)
      await fetchSchedules(groupId)
    }

    console.log('Schedule saved successfully')
  } catch (error) {
    console.error('Error saving schedule:', error)
    alert('Error saving schedule. Please try again.')
  } finally {
    loading.value = false
  }

  closeClassModal()
}

const deleteClass = async (classItem: any) => {
  const groupId = selectedGroupId.value

  try {
    loading.value = true
    await scheduleService.deleteSchedule(classItem.id)

    // Remove from local state
    const index = schedules.value[groupId].findIndex(cls => cls.id === classItem.id)
    if (index !== -1) {
      schedules.value[groupId].splice(index, 1)
    }

    console.log('Schedule deleted successfully')
  } catch (error) {
    console.error('Error deleting schedule:', error)
    alert('Error deleting schedule. Please try again.')
  } finally {
    loading.value = false
  }

  closeClassModal()
}

const exportSchedule = () => {
  // Export functionality
  console.log('Exporting schedule for group:', selectedGroup.value?.name)
}

const printSchedule = () => {
  // Print functionality
  window.print()
}

onMounted(() => {
  // Load class settings first
  loadClassSettings()

  // Initialize with first group if available
  if (groups.value.length > 0) {
    selectedGroupId.value = groups.value[0].id.toString()
  }
})
</script>

<style scoped>
.class-card {
  min-height: 4rem;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>

