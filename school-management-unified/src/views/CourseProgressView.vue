<template>
  <DashboardLayout>
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <button
              @click="goBack"
              class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-lg transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 class="text-3xl font-bold">{{ course.title }}</h1>
              <p class="text-blue-100 mt-2">{{ course.groupName }} - {{ $t('progressTracking.courseProgress') }}</p>
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
              class="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>{{ $t('progressTracking.actions.printReport') }}</span>
            </button>
          </div>
        </div>
      </div>

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

      <!-- Filters and Actions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <!-- Student Filter -->
            <div class="min-w-0 flex-1 sm:flex-none sm:w-48">
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('progressTracking.filters.filterStudents') }}</label>
              <select
                v-model="selectedStudentFilter"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">{{ $t('progressTracking.filters.allStudents') }}</option>
                <option value="completed">{{ $t('progressTracking.filters.completedOnly') }}</option>
                <option value="inProgress">{{ $t('progressTracking.filters.inProgressOnly') }}</option>
                <option value="notStarted">{{ $t('progressTracking.filters.notStartedOnly') }}</option>
                <option value="needsAttention">{{ $t('progressTracking.filters.needsAttentionOnly') }}</option>
              </select>
            </div>

            <!-- Milestone Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('progressTracking.filters.allMilestones') }}</label>
              <select
                v-model="selectedMilestoneFilter"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">{{ $t('progressTracking.filters.allMilestones') }}</option>
                <option value="required">{{ $t('progressTracking.filters.requiredOnly') }}</option>
                <option value="optional">{{ $t('progressTracking.filters.optionalOnly') }}</option>
              </select>
            </div>

            <!-- Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.search') }}</label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="$t('progressTracking.studentName')"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Bulk Actions -->
          <div class="flex space-x-3">
            <button
              @click="bulkMarkCompleted"
              :disabled="selectedStudents.length === 0"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('progressTracking.actions.bulkUpdate') }}
            </button>
            <button
              @click="saveAllProgress"
              class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {{ $t('progressTracking.actions.saveProgress') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Desktop View -->
        <div class="hidden lg:block">
          <div class="overflow-x-auto">
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
import MilestoneStatusButton from '@/components/MilestoneStatusButton.vue'
import StudentNotesModal from '@/components/StudentNotesModal.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Reactive data
const courseId = ref(route.params.id)
const selectedStudentFilter = ref('all')
const selectedMilestoneFilter = ref('all')
const searchQuery = ref('')
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

const updateMilestoneStatus = (data: {
  studentId: number
  milestoneId: number
  status: string
  startDate?: string
  endDate?: string
  remarks?: string
}) => {
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

const saveAllProgress = () => {
  // Save all progress to backend
  console.log('Saving all progress...')
  // Show success message
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

onMounted(() => {
  loadCourseData()
})
</script>

