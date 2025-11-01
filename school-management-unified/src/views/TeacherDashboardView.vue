<template>
  <DashboardLayout>
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold">{{ $t('progressTracking.teacherDashboard') }}</h1>
              <p class="text-indigo-100 mt-2">{{ currentTeacher.name }} - {{ currentTeacher.subject }}</p>
              <p class="text-indigo-200 text-sm">{{ $t('progressTracking.description') }}</p>
            </div>
          </div>
          <div class="flex space-x-4">
            <button
              @click="exportProgress"
              class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ $t('progressTracking.actions.exportProgress') }}</span>
            </button>
            <button
              @click="printReport"
              class="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>{{ $t('progressTracking.actions.printReport') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ completedStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.completedStudents') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ inProgressStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.inProgressStudents') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ overallProgress }}%</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.overallProgress') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ needsAttentionStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.filters.needsAttentionOnly') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Courses Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('progressTracking.myCourses') }}</h2>
              <p class="text-gray-600 mt-1">{{ $t('progressTracking.description') }}</p>
            </div>
          </div>
        </div>

        <div class="p-6">
          <!-- No Courses State -->
          <div v-if="teacherCourses.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('progressTracking.messages.noCoursesAssigned') }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ $t('progressTracking.description') }}</p>
          </div>

          <!-- Courses Grid -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="course in teacherCourses"
              :key="course.id"
              class="group bg-gray-50 hover:bg-white border border-gray-200 hover:border-indigo-200 rounded-xl p-6 transition-all duration-200 hover:shadow-lg cursor-pointer"
              @click="viewCourseProgress(course)"
            >
              <!-- Course Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {{ course.title }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">{{ course.groupName }}</p>
                  <div class="flex items-center space-x-2 mt-2">
                    <span 
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ $t(`courseManagement.status.${course.status}`) }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-indigo-600">{{ course.overallProgress }}%</div>
                  <div class="text-xs text-gray-500">{{ $t('progressTracking.overallProgress') }}</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${course.overallProgress}%` }"
                  ></div>
                </div>
              </div>

              <!-- Course Stats -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <div class="text-lg font-semibold text-gray-900">{{ course.totalStudents }}</div>
                  <div class="text-xs text-gray-600">{{ $t('progressTracking.totalStudents') }}</div>
                </div>
                <div class="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <div class="text-lg font-semibold text-gray-900">{{ course.totalMilestones }}</div>
                  <div class="text-xs text-gray-600">{{ $t('progressTracking.totalMilestones') }}</div>
                </div>
              </div>

              <!-- Student Progress Summary -->
              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{{ $t('progressTracking.completedStudents') }}</span>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-green-600">{{ course.completedStudents }}</span>
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{{ $t('progressTracking.inProgressStudents') }}</span>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-blue-600">{{ course.inProgressStudents }}</span>
                    <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <!-- Last Activity -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <div class="text-xs text-gray-500">
                  {{ $t('progressTracking.lastActivity') }}: {{ formatDate(course.lastActivity) }}
                </div>
                <button class="text-indigo-600 hover:text-indigo-700 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                  {{ $t('progressTracking.actions.viewDetails') }}
                  <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const { t } = useI18n()
const router = useRouter()

// Reactive data
const currentTeacher = ref({
  id: 1,
  name: 'أ. فاطمة أحمد',
  subject: 'اللغة العربية',
  email: 'fatima.ahmed@zahratalhayat.om'
})

const teacherCourses = ref([
  {
    id: 1,
    title: 'تعلم الحروف العربية',
    groupName: 'مجموعة الورود (2-3 سنوات)',
    groupId: 1,
    status: 'active',
    totalStudents: 12,
    completedStudents: 3,
    inProgressStudents: 7,
    notStartedStudents: 2,
    totalMilestones: 8,
    completedMilestones: 3,
    overallProgress: 38,
    lastActivity: '2025-09-04T10:30:00Z',
    schedule: {
      day: 'sunday',
      startTime: '08:45',
      endTime: '09:30'
    }
  },
  {
    id: 2,
    title: 'الأرقام والعد',
    groupName: 'مجموعة النجوم (3-4 سنوات)',
    groupId: 2,
    status: 'active',
    totalStudents: 15,
    completedStudents: 8,
    inProgressStudents: 5,
    notStartedStudents: 2,
    totalMilestones: 6,
    completedMilestones: 4,
    overallProgress: 67,
    lastActivity: '2025-09-03T14:15:00Z',
    schedule: {
      day: 'monday',
      startTime: '10:00',
      endTime: '10:45'
    }
  },
  {
    id: 3,
    title: 'القراءة التفاعلية',
    groupName: 'مجموعة القمر (4-5 سنوات)',
    groupId: 3,
    status: 'active',
    totalStudents: 18,
    completedStudents: 12,
    inProgressStudents: 4,
    notStartedStudents: 2,
    totalMilestones: 10,
    completedMilestones: 7,
    overallProgress: 70,
    lastActivity: '2025-09-04T09:00:00Z',
    schedule: {
      day: 'tuesday',
      startTime: '11:15',
      endTime: '12:00'
    }
  }
])

// Computed properties
const totalStudents = computed(() => {
  return teacherCourses.value.reduce((total, course) => total + course.totalStudents, 0)
})

const completedStudents = computed(() => {
  return teacherCourses.value.reduce((total, course) => total + course.completedStudents, 0)
})

const inProgressStudents = computed(() => {
  return teacherCourses.value.reduce((total, course) => total + course.inProgressStudents, 0)
})

const notStartedStudents = computed(() => {
  return teacherCourses.value.reduce((total, course) => total + course.notStartedStudents, 0)
})

const needsAttentionStudents = computed(() => {
  // Students who are behind or need review
  return teacherCourses.value.reduce((total, course) => {
    return total + Math.floor(course.totalStudents * 0.1) // Assume 10% need attention
  }, 0)
})

const overallProgress = computed(() => {
  if (teacherCourses.value.length === 0) return 0
  const totalProgress = teacherCourses.value.reduce((total, course) => total + course.overallProgress, 0)
  return Math.round(totalProgress / teacherCourses.value.length)
})

// Methods
const getStatusClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    inactive: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-OM', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewCourseProgress = (course: any) => {
  router.push(`/progress/course/${course.id}`)
}

const exportProgress = () => {
  // Export functionality
  console.log('Exporting progress for all courses')
}

const printReport = () => {
  // Print functionality
  console.log('Printing teacher progress report')
}

// Load teacher courses from timetable
const loadTeacherCourses = () => {
  // In real implementation, this would:
  // 1. Get current teacher ID from auth
  // 2. Query timetable for courses assigned to this teacher
  // 3. Get course details and student progress
  // 4. Calculate statistics
  
  console.log('Loading teacher courses from timetable...')
}

onMounted(() => {
  loadTeacherCourses()
})
</script>

