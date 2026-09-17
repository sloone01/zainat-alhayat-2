<template>
  <DashboardLayout>
    <div class="fk-page">
      <FikrPageHeader
        :title="$t('progressTracking.teacherDashboard')"
        :subtitle="$t('progressTracking.description')"
      />
      <div class="flex flex-wrap gap-2">
        <button type="button" class="fk-btn fk-btn--mist" @click="exportProgress">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ $t('progressTracking.actions.exportProgress') }}
        </button>
        <button type="button" class="fk-btn fk-btn--navy" @click="printReport">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {{ $t('progressTracking.actions.printReport') }}
        </button>
      </div>

      <!-- Quick Stats: mist stat tiles, one navy accent for the pending callout (mock 6b) -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div class="flex flex-col gap-5 rounded-2xl bg-fikr-mist p-4 sm:p-5">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-primary-700" aria-hidden="true">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <p class="fk-display text-[28px] font-bold leading-9 tabular-nums text-navy-800">{{ completedStudents }}</p>
            <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ $t('progressTracking.completedStudents') }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-5 rounded-2xl bg-fikr-mist p-4 sm:p-5">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <p class="fk-display text-[28px] font-bold leading-9 tabular-nums text-navy-800">{{ inProgressStudents }}</p>
            <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ $t('progressTracking.inProgressStudents') }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-5 rounded-2xl bg-fikr-mist p-4 sm:p-5">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </span>
          <div>
            <p class="fk-display text-[28px] font-bold leading-9 tabular-nums text-navy-800" dir="ltr">{{ overallProgress }}%</p>
            <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ $t('progressTracking.overallProgress') }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-5 rounded-2xl bg-navy-800 p-4 text-white sm:p-5">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-fikr-link-on-dark" aria-hidden="true">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </span>
          <div>
            <p class="fk-display text-[28px] font-bold leading-9 tabular-nums text-white">{{ needsAttentionStudents }}</p>
            <p class="mt-0.5 text-xs leading-5 text-white/70">{{ $t('progressTracking.filters.needsAttentionOnly') }}</p>
          </div>
        </div>
      </div>

      <!-- Courses Section -->
      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-display truncate text-xl font-bold leading-7 text-navy-800">{{ $t('progressTracking.myCourses') }}</h2>
            <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ $t('progressTracking.description') }}</p>
          </div>
        </header>

        <div class="p-5 sm:p-6">
          <!-- No Courses State -->
          <div v-if="teacherCourses.length === 0" class="py-16 text-center">
            <div class="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-fikr-mist text-navy-800">
              <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-navy-800">{{ $t('progressTracking.messages.noCoursesAssigned') }}</h3>
            <p class="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-fikr-ink-muted">{{ $t('progressTracking.description') }}</p>
          </div>

          <!-- Courses Grid -->
          <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="course in teacherCourses"
              :key="course.id"
              class="group cursor-pointer rounded-2xl bg-fikr-mist p-5 transition-colors duration-200 hover:bg-fikr-surface-high"
              @click="viewCourseProgress(course)"
            >
              <!-- Course Header -->
              <div class="mb-4 flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <h3 class="text-base font-medium leading-6 text-navy-800">
                    {{ course.title }}
                  </h3>
                  <p class="mt-1 text-sm leading-5 text-fikr-ink-muted">{{ course.groupName }}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <span class="fk-pill" :class="getStatusClass(course.status)">
                      {{ $t(`courseManagement.status.${course.status}`) }}
                    </span>
                  </div>
                </div>
                <div class="shrink-0 text-end">
                  <div class="fk-display text-2xl font-bold leading-8 tabular-nums text-navy-800" dir="ltr">{{ course.overallProgress }}%</div>
                  <div class="text-xs leading-5 text-fikr-ink-muted">{{ $t('progressTracking.overallProgress') }}</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-white">
                  <div
                    class="h-1.5 rounded-full bg-primary-500 transition-all duration-300"
                    :style="{ width: `${course.overallProgress}%` }"
                  ></div>
                </div>
              </div>

              <!-- Course Stats -->
              <div class="mb-4 grid grid-cols-2 gap-3">
                <div class="rounded-lg bg-white p-3 text-center">
                  <div class="text-lg font-medium tabular-nums text-navy-800">{{ course.totalStudents }}</div>
                  <div class="text-xs leading-5 text-fikr-ink-muted">{{ $t('progressTracking.totalStudents') }}</div>
                </div>
                <div class="rounded-lg bg-white p-3 text-center">
                  <div class="text-lg font-medium tabular-nums text-navy-800">{{ course.totalMilestones }}</div>
                  <div class="text-xs leading-5 text-fikr-ink-muted">{{ $t('progressTracking.totalMilestones') }}</div>
                </div>
              </div>

              <!-- Student Progress Summary -->
              <div class="mb-4 space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-fikr-ink-muted">{{ $t('progressTracking.completedStudents') }}</span>
                  <div class="flex items-center gap-2">
                    <span class="font-medium tabular-nums text-navy-800">{{ course.completedStudents }}</span>
                    <div class="h-2 w-2 rounded-full bg-primary-500"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-fikr-ink-muted">{{ $t('progressTracking.inProgressStudents') }}</span>
                  <div class="flex items-center gap-2">
                    <span class="font-medium tabular-nums text-navy-800">{{ course.inProgressStudents }}</span>
                    <div class="h-2 w-2 rounded-full bg-navy-800"></div>
                  </div>
                </div>
              </div>

              <!-- Last Activity -->
              <div class="flex items-center justify-between border-t border-fikr-hairline pt-4">
                <div class="text-xs leading-5 text-fikr-ink-muted">
                  {{ $t('progressTracking.lastActivity') }}: {{ formatDate(course.lastActivity) }}
                </div>
                <span class="inline-flex items-center gap-1 text-sm font-medium text-navy-800 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                  {{ $t('progressTracking.actions.viewDetails') }}
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'

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
/** FIKR pill mapping: teal = active, navy solid = inactive/urgent, neutral = white on mist. */
const getStatusClass = (status: string) => {
  const classes = {
    active: 'fk-pill--teal',
    draft: 'bg-white text-fikr-ink-muted',
    published: 'fk-pill--outline',
    inactive: 'fk-pill--navy'
  }
  return classes[status as keyof typeof classes] || 'bg-white text-fikr-ink-muted'
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
