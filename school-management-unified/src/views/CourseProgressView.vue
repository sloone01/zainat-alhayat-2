<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="course.title"
        :subtitle="`${course.groupName} - ${$t('progressTracking.courseProgress')}`"
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

      <!-- Course Statistics -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.totalStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.totalStudents') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.completedStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.completedStudents') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.inProgressStudents }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.inProgressStudents') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2H9m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ course.milestones.length }}</p>
              <p class="text-sm text-gray-600">{{ $t('progressTracking.totalMilestones') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                aria-hidden="true"
              />
            </button>
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
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                      <span class="text-xs text-gray-400">{{ $t('progressTracking.targetWeek') }} {{ milestone.targetWeek }}</span>
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
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-indigo-700">{{ getStudentInitials(student.name) }}</span>
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
                          class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          :style="{ width: `${getStudentProgress(student.id)}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      @click="openStudentNotes(student)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  >
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-indigo-700">{{ getStudentInitials(student.name) }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                    <div class="text-sm text-gray-500">{{ student.studentId }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">{{ getStudentProgress(student.id) }}%</div>
                  <div class="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
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
                  @click="openStudentNotes(student)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {{ $t('progressTracking.actions.addNotes') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Students State -->
        <div v-if="filteredStudents.length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('progressTracking.messages.noStudentsFound') }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ $t('progressTracking.description') }}</p>
        </div>
      </div>
      </div>
      </section>

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
import MilestoneStatusButton from '@/components/MilestoneStatusButton.vue'
import StudentNotesModal from '@/components/StudentNotesModal.vue'
import { progressService } from '@/services/progress.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const route = useRoute()
const router = useRouter()

// Reactive data
const courseId = ref(route.params.id)
const selectedStudentFilter = ref('all')
const selectedMilestoneFilter = ref('all')
const searchQuery = ref('')
const showFilters = ref(false)

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
const selectedStudents = ref<number[]>([])
const selectAll = ref(false)
const showNotesModal = ref(false)
const selectedStudent = ref(null)

// Mock data - in real implementation, this would come from API
const course = ref({
  id: 1,
  title: 'تعلم الحروف العربية',
  groupName: 'مجموعة الورود (2-3 سنوات)',
  groupId: 1,
  totalStudents: 12,
  completedStudents: 3,
  inProgressStudents: 7,
  notStartedStudents: 2,
  overallProgress: 38,
  milestones: [
    {
      id: 1,
      title: 'تعلم الحروف الأساسية',
      description: 'تعلم الحروف من أ إلى ج',
      type: 'assessment',
      targetWeek: 1,
      estimatedDuration: 45,
      difficulty: 'beginner',
      points: 10,
      isRequired: true,
      allowLateSubmission: false,
      enablePeerReview: false
    },
    {
      id: 2,
      title: 'كتابة الحروف',
      description: 'تدريب على كتابة الحروف',
      type: 'activity',
      targetWeek: 2,
      estimatedDuration: 60,
      difficulty: 'beginner',
      points: 15,
      isRequired: true,
      allowLateSubmission: true,
      enablePeerReview: false
    },
    {
      id: 3,
      title: 'قراءة الكلمات البسيطة',
      description: 'قراءة كلمات من 3 حروف',
      type: 'project',
      targetWeek: 3,
      estimatedDuration: 30,
      difficulty: 'intermediate',
      points: 20,
      isRequired: true,
      allowLateSubmission: false,
      enablePeerReview: true
    },
    {
      id: 4,
      title: 'تمييز الأصوات',
      description: 'تمييز أصوات الحروف',
      type: 'assessment',
      targetWeek: 4,
      estimatedDuration: 30,
      difficulty: 'beginner',
      points: 10,
      isRequired: false,
      allowLateSubmission: true,
      enablePeerReview: false
    }
  ]
})

const students = ref([
  {
    id: 1,
    name: 'سارة أحمد الرواحي',
    studentId: 'ST001',
    progress: {
      1: { status: 'completed', notes: 'أداء ممتاز', completedDate: '2025-09-01' },
      2: { status: 'inProgress', notes: '', completedDate: null },
      3: { status: 'notStarted', notes: '', completedDate: null },
      4: { status: 'notStarted', notes: '', completedDate: null }
    }
  },
  {
    id: 2,
    name: 'محمد علي السالمي',
    studentId: 'ST002',
    progress: {
      1: { status: 'completed', notes: 'جيد جداً', completedDate: '2025-09-02' },
      2: { status: 'completed', notes: 'يحتاج تحسين', completedDate: '2025-09-03' },
      3: { status: 'inProgress', notes: '', completedDate: null },
      4: { status: 'notStarted', notes: '', completedDate: null }
    }
  },
  {
    id: 3,
    name: 'فاطمة خالد البلوشي',
    studentId: 'ST003',
    progress: {
      1: { status: 'completed', notes: 'ممتاز', completedDate: '2025-09-01' },
      2: { status: 'completed', notes: 'أداء رائع', completedDate: '2025-09-02' },
      3: { status: 'completed', notes: 'مبدعة', completedDate: '2025-09-04' },
      4: { status: 'inProgress', notes: '', completedDate: null }
    }
  },
  {
    id: 4,
    name: 'عبدالله سعيد الحارثي',
    studentId: 'ST004',
    progress: {
      1: { status: 'skipped', notes: 'غائب', completedDate: null },
      2: { status: 'notStarted', notes: '', completedDate: null },
      3: { status: 'notStarted', notes: '', completedDate: null },
      4: { status: 'notStarted', notes: '', completedDate: null }
    }
  },
  {
    id: 5,
    name: 'مريم يوسف العبري',
    studentId: 'ST005',
    progress: {
      1: { status: 'completed', notes: 'جيد', completedDate: '2025-09-03' },
      2: { status: 'needsReview', notes: 'يحتاج مراجعة', completedDate: null },
      3: { status: 'notStarted', notes: '', completedDate: null },
      4: { status: 'notStarted', notes: '', completedDate: null }
    }
  }
])

// Computed properties
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
  
  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(student => 
      student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // Filter by student status
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

// Methods
const getStudentInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const getStudentMilestoneStatus = (studentId: number, milestoneId: number) => {
  const student = students.value.find(s => s.id === studentId)
  return student?.progress[milestoneId]?.status || 'notStarted'
}

const getStudentProgressData = (studentId: number, milestoneId: number) => {
  const student = students.value.find(s => s.id === studentId)
  const progress = student?.progress[milestoneId]

  return {
    startDate: progress?.startedDate || '',
    endDate: progress?.completedDate || '',
    remarks: progress?.notes || ''
  }
}

const getStudentProgress = (studentId: number) => {
  const student = students.value.find(s => s.id === studentId)
  if (!student) return 0
  
  const totalMilestones = course.value.milestones.length
  const completedMilestones = Object.values(student.progress).filter(p => p.status === 'completed').length
  
  return Math.round((completedMilestones / totalMilestones) * 100)
}

const hasStudentNeedsAttention = (studentId: number) => {
  const student = students.value.find(s => s.id === studentId)
  if (!student) return false
  
  return Object.values(student.progress).some(p => p.status === 'needsReview' || p.status === 'skipped')
}

const updateMilestoneStatus = async (data: {
  studentId: number
  milestoneId: number
  status: string
  startDate?: string
  endDate?: string
  remarks?: string
}) => {
  try {
    // Save to database first
    const savedProgress = await progressService.saveMilestoneProgress({
      studentId: data.studentId,
      courseId: course.value.id,
      milestoneId: data.milestoneId,
      status: data.status,
      teacherNotes: data.remarks,
      startDate: data.startDate,
      endDate: data.endDate,
      updatedBy: 1 // Default Staff ID - TODO: Implement proper Staff ID lookup
    })

    console.log('✅ Progress saved to database:', savedProgress)

    // Update local state
    const student = students.value.find(s => s.id === data.studentId)
    if (student) {
      if (!student.progress[data.milestoneId]) {
        student.progress[data.milestoneId] = {
          status: 'notStarted',
          notes: '',
          completedDate: null,
          startedDate: null
        }
      }

      student.progress[data.milestoneId].status = data.status

      // Handle different status types
      if (data.status === 'completed') {
        student.progress[data.milestoneId].startedDate = data.startDate || null
        student.progress[data.milestoneId].completedDate = data.endDate || new Date().toISOString().split('T')[0]
        student.progress[data.milestoneId].notes = data.remarks || ''
      } else if (data.status === 'postponed') {
        student.progress[data.milestoneId].notes = data.remarks || ''
        student.progress[data.milestoneId].completedDate = null
      } else if (data.status === 'notStarted') {
        student.progress[data.milestoneId].startedDate = null
        student.progress[data.milestoneId].completedDate = null
        student.progress[data.milestoneId].notes = ''
      } else {
        student.progress[data.milestoneId].completedDate = null
      }
    }
  } catch (error) {
    console.error('❌ Error saving progress to database:', error)
    alert(`خطأ في حفظ التقدم: ${error.message || 'حدث خطأ غير متوقع'}`)
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

const saveStudentNotes = (data: { studentId: number, milestoneId: number, notes: string }) => {
  const student = students.value.find(s => s.id === data.studentId)
  if (student && student.progress[data.milestoneId]) {
    student.progress[data.milestoneId].notes = data.notes
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
          status: 'completed'
        })
      })
    })
    selectedStudents.value = []
    selectAll.value = false
  }
}

const saveAllProgress = async () => {
  try {
    console.log('🔄 Saving all progress to database...')

    let savedCount = 0
    let errorCount = 0

    // Save progress for all students
    for (const student of students.value) {
      for (const milestoneId in student.progress) {
        const progress = student.progress[milestoneId]

        if (progress.status !== 'notStarted') {
          try {
            await progressService.saveMilestoneProgress({
              studentId: student.id,
              courseId: course.value.id,
              milestoneId: parseInt(milestoneId),
              status: progress.status,
              teacherNotes: progress.notes,
              startDate: progress.startedDate,
              endDate: progress.completedDate,
              updatedBy: 1 // Default Staff ID - TODO: Implement proper Staff ID lookup
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
      alert(`✅ تم حفظ ${savedCount} سجل تقدم بنجاح`)
    } else {
      alert(`⚠️ تم حفظ ${savedCount} سجل، فشل في حفظ ${errorCount} سجل`)
    }

    console.log(`✅ Saved ${savedCount} progress records, ${errorCount} errors`)

  } catch (error) {
    console.error('❌ Error saving all progress:', error)
    alert(`خطأ في حفظ التقدم: ${error.message || 'حدث خطأ غير متوقع'}`)
  }
}

const exportProgress = () => {
  console.log('Exporting course progress...')
}

const printReport = () => {
  console.log('Printing course progress report...')
}

const goBack = () => {
  router.push('/progress')
}

const loadCourseData = () => {
  // In real implementation, load course data from API based on courseId
  console.log('Loading course data for ID:', courseId.value)
}

// Load existing progress from database
const loadExistingProgress = async () => {
  try {
    console.log('🔄 Loading existing progress from database...')

    // Load progress for this course
    const progressRecords = await progressService.getProgressByCourse(course.value.id)

    if (progressRecords && progressRecords.length > 0) {
      // Update student progress with database data
      progressRecords.forEach(record => {
        const student = students.value.find(s => s.id === record.student_id)
        if (student) {
          if (!student.progress[record.milestone_id]) {
            student.progress[record.milestone_id] = {
              status: 'notStarted',
              notes: '',
              completedDate: null,
              startedDate: null
            }
          }

          student.progress[record.milestone_id] = {
            status: record.status,
            notes: record.teacher_notes || '',
            completedDate: record.completed_date,
            startedDate: record.started_date
          }
        }
      })

      console.log(`✅ Loaded ${progressRecords.length} progress records for course`)
    }

  } catch (error) {
    console.error('❌ Error loading existing progress:', error)
  }
}

onMounted(async () => {
  loadCourseData()

  // Load existing progress from database
  await loadExistingProgress()
})
</script>

