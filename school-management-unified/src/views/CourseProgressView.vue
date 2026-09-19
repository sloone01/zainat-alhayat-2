<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="course.title || $t('progressTracking.courseProgress')"
        :subtitle="course.groupName
          ? `${course.groupName} - ${$t('progressTracking.courseProgress')}`
          : $t('progressTracking.courseProgress')"
      >
        <template #leading>
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('common.back')"
            @click="goBack"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </template>
      </FikrPageHeader>

      <div v-if="loading" class="flex justify-center py-16">
        <FikrLoader />
      </div>

      <template v-else>
      <!-- Course Statistics -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-6">
        <div class="fk-card p-5 sm:p-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100">
              <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.totalStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.totalStudents') }}</p>
            </div>
          </div>
        </div>

        <div class="fk-card p-5 sm:p-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.completedStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.completedStudents') }}</p>
            </div>
          </div>
        </div>

        <div class="fk-card p-5 sm:p-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <svg class="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.inProgressStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.inProgressStudents') }}</p>
            </div>
          </div>
        </div>

        <div class="fk-card p-5 sm:p-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2H9m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.milestones.length }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.totalMilestones') }}</p>
            </div>
          </div>
        </div>

        <div class="fk-card p-5 sm:p-6 col-span-2 lg:col-span-1">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-100">
              <svg class="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.overallProgress }}%</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.overallProgress') }}</p>
            </div>
          </div>
        </div>
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('progressTracking.courseProgress') }}</h2>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <button type="button" class="fk-btn fk-btn--pearl" @click="exportProgress">
              {{ $t('progressTracking.actions.exportProgress') }}
            </button>
            <button type="button" class="fk-btn fk-btn--pearl" @click="printReport">
              {{ $t('progressTracking.actions.printReport') }}
            </button>
            <button
              type="button"
              class="fk-btn fk-btn--pearl"
              :disabled="selectedStudents.length === 0"
              @click="bulkMarkCompleted"
            >
              {{ $t('progressTracking.actions.bulkUpdate') }}
            </button>
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              @click="saveAllProgress"
            >
              {{ $t('progressTracking.actions.saveProgress') }}
            </button>
          </div>
        </header>

      <!-- Progress Table -->
      <div class="p-4 sm:p-6">
      <div class="overflow-visible">
        <!-- Desktop View -->
        <div class="hidden lg:block">
          <div class="fk-table-wrap overflow-visible">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      v-model="selectAll"
                      @change="toggleSelectAll"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    >
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('progressTracking.studentName') }}
                  </th>
                  <th
                    v-for="milestone in filteredMilestones"
                    :key="milestone.id"
                    class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                  >
                    <div class="flex flex-col items-center space-y-1">
                      <span class="truncate max-w-[100px]" :title="milestone.title">{{ milestone.title }}</span>
                      <span v-if="milestone.targetWeek" class="text-xs text-gray-400">{{ $t('progressTracking.targetWeek') }} {{ milestone.targetWeek }}</span>
                      <span v-if="milestone.isRequired" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {{ $t('progressTracking.isRequired') }}
                      </span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('progressTracking.overallProgress') }}
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('progressTracking.actions.updateProgress') }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="student in filteredStudents"
                  :key="student.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      v-model="selectedStudents"
                      :value="student.id"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                          <span class="text-sm font-medium text-primary-800">{{ getStudentInitials(student.name) }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                        <div class="text-sm text-gray-500">{{ student.studentId }}</div>
                      </div>
                    </div>
                  </td>
                  <td
                    v-for="milestone in filteredMilestones"
                    :key="`${student.id}-${milestone.id}`"
                    class="px-3 py-4 whitespace-nowrap text-center"
                  >
                    <MilestoneStatusButton
                      :student-id="student.id"
                      :milestone-id="milestone.id"
                      :status="getStudentMilestoneStatus(student.id, milestone.id)"
                      :student-name="student.name"
                      :milestone-name="milestone.title"
                      :progress-data="getStudentProgressData(student.id, milestone.id)"
                      @update-status="updateMilestoneStatus"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex flex-col items-center space-y-2">
                      <span class="text-sm font-medium text-gray-900">{{ getStudentProgress(student.id) }}%</span>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          class="h-2 rounded-full bg-primary-500 transition-all duration-300"
                          :style="{ width: `${getStudentProgress(student.id)}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      @click="openStudentNotes(student)"
                      class="fk-btn fk-btn--pearl text-xs"
                    >
                      {{ $t('progressTracking.actions.addNotes') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile View -->
        <div class="lg:hidden">
          <div class="space-y-4 p-4">
            <div
              v-for="student in filteredStudents"
              :key="student.id"
              class="bg-gray-50 rounded-lg p-4 space-y-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    v-model="selectedStudents"
                    :value="student.id"
                    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  >
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                    <span class="text-sm font-medium text-primary-800">{{ getStudentInitials(student.name) }}</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                    <div class="text-sm text-gray-500">{{ student.studentId }}</div>
                  </div>
                </div>
                <div class="text-end">
                  <div class="text-sm font-medium text-gray-900">{{ getStudentProgress(student.id) }}%</div>
                  <div class="mt-1 h-2 w-20 rounded-full bg-gray-200">
                    <div
                      class="h-2 rounded-full bg-primary-500 transition-all duration-300"
                      :style="{ width: `${getStudentProgress(student.id)}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="milestone in filteredMilestones"
                  :key="`mobile-${student.id}-${milestone.id}`"
                  class="bg-white rounded-lg p-3"
                >
                  <div class="text-xs font-medium text-gray-700 mb-2 truncate">{{ milestone.title }}</div>
                  <MilestoneStatusButton
                    :student-id="student.id"
                    :milestone-id="milestone.id"
                    :status="getStudentMilestoneStatus(student.id, milestone.id)"
                    :student-name="student.name"
                    :milestone-name="milestone.title"
                    :progress-data="getStudentProgressData(student.id, milestone.id)"
                    @update-status="updateMilestoneStatus"
                    size="small"
                  />
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl text-xs"
                  @click="openStudentNotes(student)"
                >
                  {{ $t('progressTracking.actions.addNotes') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Students State -->
        <div v-if="filteredStudents.length === 0" class="px-6 py-16 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-gray-800">{{ $t('progressTracking.messages.noStudentsFound') }}</h3>
          <p class="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">{{ $t('progressTracking.description') }}</p>
        </div>
      </div>
      </div>
      </section>
      </template>

      <div
        v-if="showFilters"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('common.filter')"
      >
        <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
        <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
          <div class="fk-drawer__header items-start">
            <div>
              <h3 class="fk-form__title">{{ $t('common.filter') }}</h3>
            </div>
            <button
              type="button"
              class="fk-modal__close"
              :aria-label="$t('common.close')"
              @click="showFilters = false"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="fk-drawer__body">
            <div class="fk-form__row">
              <label class="fk-flabel" for="progress-student-filter"><span>{{ $t('progressTracking.filters.filterStudents') }}</span></label>
              <select id="progress-student-filter" v-model="selectedStudentFilter" class="fk-field">
                <option value="all">{{ $t('progressTracking.filters.allStudents') }}</option>
                <option value="completed">{{ $t('progressTracking.filters.completedOnly') }}</option>
                <option value="inProgress">{{ $t('progressTracking.filters.inProgressOnly') }}</option>
                <option value="notStarted">{{ $t('progressTracking.filters.notStartedOnly') }}</option>
                <option value="needsAttention">{{ $t('progressTracking.filters.needsAttentionOnly') }}</option>
              </select>
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="progress-milestone-filter"><span>{{ $t('progressTracking.filters.allMilestones') }}</span></label>
              <select id="progress-milestone-filter" v-model="selectedMilestoneFilter" class="fk-field">
                <option value="all">{{ $t('progressTracking.filters.allMilestones') }}</option>
                <option value="required">{{ $t('progressTracking.filters.requiredOnly') }}</option>
                <option value="optional">{{ $t('progressTracking.filters.optionalOnly') }}</option>
              </select>
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="progress-search"><span>{{ $t('common.search') }}</span></label>
              <input
                id="progress-search"
                v-model="searchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('progressTracking.studentName')"
              >
            </div>
          </div>
          <div class="px-4 pb-4">
            <div class="flex items-center justify-end gap-2">
              <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
              <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Student Notes Modal -->
    <StudentNotesModal
      v-if="showNotesModal"
      :student="selectedStudent"
      :course="course"
      @close="closeNotesModal"
      @save="saveStudentNotes"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import MilestoneStatusButton from '@/components/MilestoneStatusButton.vue'
import StudentNotesModal from '@/components/StudentNotesModal.vue'
import { progressService } from '@/services/progress.service'
import { courseService } from '@/services/course.service'
import { courseEnrollmentService } from '@/services/course-enrollment.service'
import { useFeedback } from '@/composables/useFeedback'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const route = useRoute()
const router = useRouter()
const { error: showError, success: showSuccess } = useFeedback()

const courseId = computed(() => String(route.params.id || ''))
const selectedStudentFilter = ref('all')
const selectedMilestoneFilter = ref('all')
const searchQuery = ref('')
const showFilters = ref(false)
const loading = ref(true)

const hasActiveFilters = computed(() =>
  selectedStudentFilter.value !== 'all' ||
  selectedMilestoneFilter.value !== 'all' ||
  searchQuery.value.trim().length > 0,
)

function clearFilters() {
  selectedStudentFilter.value = 'all'
  selectedMilestoneFilter.value = 'all'
  searchQuery.value = ''
}

const selectedStudents = ref<Array<string | number>>([])
const selectAll = ref(false)
const showNotesModal = ref(false)
const selectedStudent = ref(null)

type MilestoneRow = {
  id: string | number
  title: string
  description?: string
  type?: string
  targetWeek?: number | null
  estimatedDuration?: number
  difficulty?: string
  points?: number
  isRequired: boolean
  allowLateSubmission?: boolean
  enablePeerReview?: boolean
  order?: number
}

type ProgressCell = {
  status: string
  notes: string
  completedDate: string | null
  startedDate: string | null
}

type StudentRow = {
  id: string | number
  name: string
  studentId: string
  progress: Record<string, ProgressCell>
}

const course = ref({
  id: '' as string | number,
  title: '',
  groupName: '',
  groupId: '' as string | number | '',
  totalStudents: 0,
  completedStudents: 0,
  inProgressStudents: 0,
  notStartedStudents: 0,
  overallProgress: 0,
  milestones: [] as MilestoneRow[],
})

const students = ref<StudentRow[]>([])

function normalizeUiStatus(status?: string | null): string {
  if (!status || status === 'not_started') return 'notStarted'
  if (status === 'in_progress') return 'inProgress'
  if (status === 'needs_review') return 'needsReview'
  return status
}

function toApiStatus(status: string): string {
  if (status === 'notStarted') return 'not_started'
  if (status === 'inProgress') return 'in_progress'
  if (status === 'needsReview') return 'needs_review'
  return status
}

function emptyProgressMap(milestones: MilestoneRow[]): Record<string, ProgressCell> {
  const progress: Record<string, ProgressCell> = {}
  for (const m of milestones) {
    progress[String(m.id)] = {
      status: 'notStarted',
      notes: '',
      completedDate: null,
      startedDate: null,
    }
  }
  return progress
}

function recomputeCourseStats() {
  const milestoneCount = course.value.milestones.length
  let completedStudents = 0
  let inProgressStudents = 0
  let notStartedStudents = 0
  let progressSum = 0

  for (const student of students.value) {
    const pct = getStudentProgress(student.id)
    progressSum += pct
    if (pct >= 100 && milestoneCount > 0) completedStudents += 1
    else if (pct > 0) inProgressStudents += 1
    else notStartedStudents += 1
  }

  course.value.totalStudents = students.value.length
  course.value.completedStudents = completedStudents
  course.value.inProgressStudents = inProgressStudents
  course.value.notStartedStudents = notStartedStudents
  course.value.overallProgress = students.value.length
    ? Math.round(progressSum / students.value.length)
    : 0
}

const filteredMilestones = computed(() => {
  let milestones = course.value.milestones

  if (selectedMilestoneFilter.value === 'required') {
    milestones = milestones.filter(m => m.isRequired)
  } else if (selectedMilestoneFilter.value === 'optional') {
    milestones = milestones.filter(m => !m.isRequired)
  }

  return milestones
})

const filteredStudents = computed(() => {
  let filtered = students.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student =>
      student.name.toLowerCase().includes(q) ||
      String(student.studentId || '').toLowerCase().includes(q),
    )
  }

  if (selectedStudentFilter.value !== 'all') {
    filtered = filtered.filter(student => {
      const progress = getStudentProgress(student.id)
      switch (selectedStudentFilter.value) {
        case 'completed':
          return progress === 100
        case 'inProgress':
          return progress > 0 && progress < 100
        case 'notStarted':
          return progress === 0
        case 'needsAttention':
          return hasStudentNeedsAttention(student.id)
        default:
          return true
      }
    })
  }

  return filtered
})

const getStudentInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const getStudentMilestoneStatus = (studentId: string | number, milestoneId: string | number) => {
  const student = students.value.find(s => s.id === studentId)
  return student?.progress[String(milestoneId)]?.status || 'notStarted'
}

const getStudentProgressData = (studentId: string | number, milestoneId: string | number) => {
  const student = students.value.find(s => s.id === studentId)
  const progress = student?.progress[String(milestoneId)]

  return {
    startDate: progress?.startedDate || '',
    endDate: progress?.completedDate || '',
    remarks: progress?.notes || '',
  }
}

const getStudentProgress = (studentId: string | number) => {
  const student = students.value.find(s => s.id === studentId)
  if (!student) return 0

  const totalMilestones = course.value.milestones.length
  if (totalMilestones === 0) return 0

  const completedMilestones = Object.values(student.progress).filter(p => p.status === 'completed').length
  return Math.round((completedMilestones / totalMilestones) * 100)
}

const hasStudentNeedsAttention = (studentId: string | number) => {
  const student = students.value.find(s => s.id === studentId)
  if (!student) return false

  return Object.values(student.progress).some(p =>
    p.status === 'needsReview' || p.status === 'postponed' || p.status === 'skipped',
  )
}

const updateMilestoneStatus = async (data: {
  studentId: string | number
  milestoneId: string | number
  status: string
  startDate?: string
  endDate?: string
  remarks?: string
}) => {
  try {
    const savedProgress = await progressService.saveMilestoneProgress({
      studentId: String(data.studentId),
      courseId: String(course.value.id),
      milestoneId: String(data.milestoneId),
      status: toApiStatus(data.status),
      teacherNotes: data.remarks,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    const student = students.value.find(s => s.id === data.studentId)
    if (student) {
      const key = String(data.milestoneId)
      if (!student.progress[key]) {
        student.progress[key] = {
          status: 'notStarted',
          notes: '',
          completedDate: null,
          startedDate: null,
        }
      }

      student.progress[key].status = normalizeUiStatus(data.status)

      if (data.status === 'completed') {
        student.progress[key].startedDate = data.startDate || null
        student.progress[key].completedDate = data.endDate || new Date().toISOString().split('T')[0]
        student.progress[key].notes = data.remarks || ''
      } else if (data.status === 'postponed') {
        student.progress[key].notes = data.remarks || ''
        student.progress[key].completedDate = null
      } else if (data.status === 'notStarted' || data.status === 'not_started') {
        student.progress[key].startedDate = null
        student.progress[key].completedDate = null
        student.progress[key].notes = ''
      } else {
        student.progress[key].completedDate = null
        if (data.remarks) student.progress[key].notes = data.remarks
      }

      if (savedProgress?.started_date) student.progress[key].startedDate = savedProgress.started_date
      if (savedProgress?.completed_date) student.progress[key].completedDate = savedProgress.completed_date
    }

    recomputeCourseStats()
  } catch (error: any) {
    console.error('Error saving progress to database:', error)
    showError(error?.message || t('common.error'))
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedStudents.value = filteredStudents.value.map(s => s.id)
  } else {
    selectedStudents.value = []
  }
}

const openStudentNotes = (student: any) => {
  selectedStudent.value = student
  showNotesModal.value = true
}

const closeNotesModal = () => {
  showNotesModal.value = false
  selectedStudent.value = null
}

const saveStudentNotes = (data: { studentId: string | number; milestoneId: string | number; notes: string }) => {
  const student = students.value.find(s => s.id === data.studentId)
  if (student && student.progress[String(data.milestoneId)]) {
    student.progress[String(data.milestoneId)].notes = data.notes
  }
  closeNotesModal()
}

const bulkMarkCompleted = () => {
  if (selectedStudents.value.length === 0) return

  if (confirm(t('progressTracking.messages.confirmBulkUpdate'))) {
    selectedStudents.value.forEach(studentId => {
      filteredMilestones.value.forEach(milestone => {
        updateMilestoneStatus({
          studentId,
          milestoneId: milestone.id,
          status: 'completed',
        })
      })
    })
    selectedStudents.value = []
    selectAll.value = false
  }
}

const saveAllProgress = async () => {
  try {
    let savedCount = 0
    let errorCount = 0

    for (const student of students.value) {
      for (const milestoneId in student.progress) {
        const progress = student.progress[milestoneId]

        if (progress.status !== 'notStarted') {
          try {
            await progressService.saveMilestoneProgress({
              studentId: String(student.id),
              courseId: String(course.value.id),
              milestoneId: String(milestoneId),
              status: toApiStatus(progress.status),
              teacherNotes: progress.notes,
              startDate: progress.startedDate || undefined,
              endDate: progress.completedDate || undefined,
            })
            savedCount++
          } catch (error) {
            console.error(`Error saving progress for student ${student.name}, milestone ${milestoneId}:`, error)
            errorCount++
          }
        }
      }
    }

    if (errorCount === 0) {
      showSuccess(t('common.savedSuccessfully'))
    } else {
      showError(`${savedCount} / ${errorCount}`)
    }
  } catch (error: any) {
    console.error('Error saving all progress:', error)
    showError(error?.message || t('common.error'))
  }
}

const exportProgress = () => {}
const printReport = () => {}

const goBack = () => {
  router.push('/progress')
}

async function loadCourseData() {
  loading.value = true
  try {
    const id = courseId.value
    if (!id) {
      course.value = {
        id: '',
        title: '',
        groupName: '',
        groupId: '',
        totalStudents: 0,
        completedStudents: 0,
        inProgressStudents: 0,
        notStartedStudents: 0,
        overallProgress: 0,
        milestones: [],
      }
      students.value = []
      return
    }

    const [courseInfo, milestonesRaw, enrollments] = await Promise.all([
      courseService.getCourseById(id),
      courseService.getMilestonesByCourse(id),
      courseEnrollmentService.list({ course_id: id, status: 'active' }),
    ])

    const milestones: MilestoneRow[] = (milestonesRaw || [])
      .slice()
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .map((m: any) => ({
        id: m.id,
        title: m.name || m.title || '',
        description: m.description || '',
        type: m.type,
        targetWeek: m.target_week ?? m.targetWeek ?? null,
        estimatedDuration: m.estimated_duration ?? m.estimatedDuration,
        difficulty: m.difficulty,
        points: m.points,
        isRequired: !!(m.isRequired ?? m.is_required),
        allowLateSubmission: m.allowLateSubmission ?? m.allow_late_submission,
        enablePeerReview: m.enablePeerReview ?? m.enable_peer_review,
        order: m.order,
      }))

    const groupName =
      (typeof route.query.groupName === 'string' && route.query.groupName) ||
      ''

    course.value = {
      id: courseInfo.id,
      title: courseInfo.name || courseInfo.title || '',
      groupName,
      groupId: typeof route.query.groupId === 'string' ? route.query.groupId : '',
      totalStudents: 0,
      completedStudents: 0,
      inProgressStudents: 0,
      notStartedStudents: 0,
      overallProgress: 0,
      milestones,
    }

    const enrollmentStudents: StudentRow[] = (enrollments || []).map((row: any) => {
      const s = row.student
      const first = s?.firstName || s?.first_name || ''
      const last = s?.lastName || s?.last_name || ''
      const name = `${first} ${last}`.trim() || String(row.student_id)
      return {
        id: row.student_id || s?.id,
        name,
        studentId: s?.studentId || s?.student_id || String(row.student_id || ''),
        progress: emptyProgressMap(milestones),
      }
    })

    const byId = new Map<string, StudentRow>()
    for (const s of enrollmentStudents) {
      if (s.id != null) byId.set(String(s.id), s)
    }
    students.value = Array.from(byId.values())

    await loadExistingProgress()
    recomputeCourseStats()
  } catch (error: any) {
    console.error('Error loading course progress:', error)
    students.value = []
    course.value.milestones = []
    recomputeCourseStats()
    showError(error?.message || t('common.error'))
  } finally {
    loading.value = false
  }
}

const loadExistingProgress = async () => {
  try {
    const progressRecords = await progressService.getProgressByCourse(String(course.value.id))

    if (!progressRecords?.length) return

    for (const record of progressRecords) {
      const sid = record.student_id
      let student = students.value.find(s => String(s.id) === String(sid))
      if (!student) {
        const first = (record as any).student?.firstName || (record as any).student?.first_name || ''
        const last = (record as any).student?.lastName || (record as any).student?.last_name || ''
        student = {
          id: sid,
          name: `${first} ${last}`.trim() || String(sid),
          studentId: (record as any).student?.studentId || String(sid),
          progress: emptyProgressMap(course.value.milestones),
        }
        students.value.push(student)
      }

      const key = String(record.milestone_id)
      student.progress[key] = {
        status: normalizeUiStatus(record.status),
        notes: record.teacher_notes || '',
        completedDate: record.completed_date || null,
        startedDate: record.started_date || null,
      }
    }
  } catch (error) {
    console.error('Error loading existing progress:', error)
  }
}

onMounted(async () => {
  await loadCourseData()
})
</script>

