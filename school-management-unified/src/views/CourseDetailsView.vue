<template>
  <DashboardLayout>
    <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
    </div>

    <!-- Course Not Found -->
    <div v-else-if="!course" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('courseManagement.courseNotFound') }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ $t('courseManagement.courseNotFoundDescription') }}</p>
      <div class="mt-6">
        <router-link
          to="/courses"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
        >
          {{ $t('common.back') }}
        </router-link>
      </div>
    </div>

    <!-- Course Details -->
    <div v-else>
      <!-- Header -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <router-link
                to="/courses"
                class="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </router-link>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ course.title }}</h1>
                <div class="flex items-center gap-4 mt-1">
                  <span class="text-sm text-gray-500">{{ $t(`courseManagement.${course.category}`) }}</span>
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getCourseStatusBadge(course.status)
                    ]"
                  >
                    {{ $t(`courseManagement.${course.status}`) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button
                @click="editCourse"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                {{ $t('courseManagement.editCourse') }}
              </button>
              <button
                @click="addPhase"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {{ $t('courseManagement.addPhase') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Course Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('courseManagement.courseOverview') }}</h3>
            <p class="text-gray-700 leading-relaxed">{{ course.description || $t('courseManagement.noDescription') }}</p>
          </div>

          <!-- Phase Timeline -->
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-900">{{ $t('courseManagement.phaseTimeline') }}</h3>
              <span class="text-sm text-gray-500">
                {{ course.phases?.length || 0 }} {{ $t('courseManagement.phases') }}
              </span>
            </div>

            <!-- Timeline -->
            <div v-if="course.phases && course.phases.length > 0" class="space-y-6">
              <div
                v-for="(phase, index) in course.phases"
                :key="phase.id"
                class="relative"
              >
                <!-- Timeline Line -->
                <div
                  v-if="index < course.phases.length - 1"
                  class="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"
                ></div>

                <!-- Phase Card -->
                <div class="flex items-start gap-4">
                  <!-- Phase Number -->
                  <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-purple-600">{{ index + 1 }}</span>
                  </div>

                  <!-- Phase Content -->
                  <div class="flex-1 bg-gray-50 rounded-lg p-4">
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h4 class="text-md font-medium text-gray-900">{{ phase.title }}</h4>
                        <p class="text-sm text-gray-600 mt-1">{{ phase.description }}</p>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">{{ phase.duration }} {{ $t('courseManagement.weeks') }}</span>
                        <button
                          @click="editPhase(phase)"
                          class="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Milestones -->
                    <div v-if="phase.milestones && phase.milestones.length > 0" class="mt-4">
                      <h5 class="text-sm font-medium text-gray-700 mb-2">{{ $t('courseManagement.milestones') }}</h5>
                      <div class="space-y-2">
                        <div
                          v-for="milestone in phase.milestones"
                          :key="milestone.id"
                          class="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                        >
                          <div class="flex items-center gap-3">
                            <div
                              :class="[
                                'w-2 h-2 rounded-full',
                                getMilestoneTypeColor(milestone.type)
                              ]"
                            ></div>
                            <div>
                              <span class="text-sm font-medium text-gray-900">{{ milestone.title }}</span>
                              <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs text-gray-500">{{ $t(`courseManagement.${milestone.type}`) }}</span>
                                <span class="text-xs text-gray-400">•</span>
                                <span class="text-xs text-gray-500">{{ $t('courseManagement.targetWeek') }} {{ milestone.targetWeek }}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            @click="editMilestone(milestone, phase)"
                            class="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Add Milestone Button -->
                    <button
                      @click="addMilestone(phase)"
                      class="mt-3 inline-flex items-center px-3 py-1.5 border border-dashed border-gray-300 text-xs font-medium rounded text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors duration-200"
                    >
                      <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {{ $t('courseManagement.addMilestone') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('courseManagement.noPhases') }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ $t('courseManagement.noPhasesDescription') }}</p>
              <div class="mt-4">
                <button
                  @click="addPhase"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  {{ $t('courseManagement.createFirstPhase') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Course Stats -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('courseManagement.courseInfo') }}</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ $t('courseManagement.totalDuration') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ course.totalDuration || 0 }} {{ $t('courseManagement.weeks') }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ $t('courseManagement.totalPhases') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ course.phases?.length || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ $t('courseManagement.totalMilestones') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ getTotalMilestones() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ $t('courseManagement.createdDate') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(course.createdDate) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ $t('courseManagement.lastModified') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ formatDate(course.lastModified) }}</span>
              </div>
            </div>
          </div>

          <!-- Course Settings -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('courseManagement.courseSettings') }}</h3>
            <div class="space-y-4">
              <div v-if="course.targetAgeGroup" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ $t('courseManagement.targetAgeGroup') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ course.targetAgeGroup }} {{ $t('groupManagement.years') }}</span>
              </div>
              <div v-if="course.difficultyLevel" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ $t('courseManagement.difficultyLevel') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ $t(`courseManagement.${course.difficultyLevel}`) }}</span>
              </div>
              <div v-if="course.maxStudents" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ $t('courseManagement.maxStudents') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ course.maxStudents }}</span>
              </div>
            </div>

            <!-- Course Actions -->
            <div class="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <button
                v-if="course.status === 'draft'"
                @click="publishCourse"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                {{ $t('courseManagement.publishCourse') }}
              </button>
              <button
                @click="duplicateCourse"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {{ $t('courseManagement.duplicateCourse') }}
              </button>
              <button
                @click="exportCourse"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {{ $t('courseManagement.exportCourse') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <CourseModal
        v-if="showCourseModal"
        :course="course"
        @close="showCourseModal = false"
        @save="updateCourse"
      />

      <PhaseModal
        v-if="showPhaseModal"
        :phase="selectedPhase"
        :course-id="course.id"
        @close="closePhaseModal"
        @save="savePhase"
      />

      <MilestoneModal
        v-if="showMilestoneModal"
        :milestone="selectedMilestone"
        :phase-id="selectedPhase?.id"
        :max-week="selectedPhase?.duration"
        @close="closeMilestoneModal"
        @save="saveMilestone"
      />
    </div>
  </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CourseModal from '@/components/CourseModal.vue'
import PhaseModal from '@/components/PhaseModal.vue'
import MilestoneModal from '@/components/MilestoneModal.vue'
import courseService from '@/services/course.service'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Reactive data
const loading = ref(true)
const course = ref(null)
const showCourseModal = ref(false)
const showPhaseModal = ref(false)
const showMilestoneModal = ref(false)
const selectedPhase = ref(null)
const selectedMilestone = ref(null)

// Mock data - replace with API calls
const mockCourses = [
  {
    id: 1,
    title: 'أساسيات اللغة العربية',
    description: 'تعلم أساسيات القراءة والكتابة في اللغة العربية للأطفال من سن 4-6 سنوات. يشمل هذا المقرر تعلم الحروف الأساسية، تكوين الكلمات، وقراءة الجمل البسيطة.',
    category: 'language',
    status: 'published',
    totalDuration: 12,
    targetAgeGroup: '4-6',
    difficultyLevel: 'beginner',
    maxStudents: 25,
    createdDate: '2024-01-15',
    lastModified: '2024-02-20',
    phases: [
      {
        id: 1,
        title: 'الحروف الأساسية',
        description: 'تعلم الحروف العربية الأساسية من أ إلى ي',
        duration: 4,
        order: 1,
        milestones: [
          { id: 1, title: 'تعرف على الحروف أ-ج', type: 'assessment', targetWeek: 1, description: 'تقييم معرفة الطفل بالحروف الأساسية الأولى' },
          { id: 2, title: 'كتابة الحروف أ-ج', type: 'activity', targetWeek: 2, description: 'نشاط عملي لكتابة الحروف' }
        ]
      },
      {
        id: 2,
        title: 'تكوين الكلمات',
        description: 'تعلم تكوين كلمات بسيطة من الحروف المتعلمة',
        duration: 4,
        order: 2,
        milestones: [
          { id: 3, title: 'قراءة كلمات بسيطة', type: 'assessment', targetWeek: 6, description: 'تقييم قدرة الطفل على قراءة كلمات مكونة من 3-4 حروف' },
          { id: 4, title: 'مشروع الكلمات المصورة', type: 'project', targetWeek: 8, description: 'إنشاء كتيب صور مع كلمات' }
        ]
      },
      {
        id: 3,
        title: 'الجمل البسيطة',
        description: 'تعلم قراءة وكتابة جمل بسيطة مكونة من كلمتين أو ثلاث',
        duration: 4,
        order: 3,
        milestones: [
          { id: 5, title: 'قراءة جمل قصيرة', type: 'assessment', targetWeek: 10, description: 'تقييم قراءة جمل مكونة من 2-3 كلمات' },
          { id: 6, title: 'عرض تقديمي للقراءة', type: 'presentation', targetWeek: 12, description: 'عرض أمام الزملاء لقراءة قصة قصيرة' }
        ]
      }
    ]
  }
]

// Methods
const loadCourse = async () => {
  loading.value = true
  try {
    const courseId = route.params.id as string
    console.log('Loading course with ID:', courseId)
    
    const courseData = await courseService.getCourseById(courseId)
    console.log('Loaded course data:', courseData)
    
    // Map backend fields to frontend fields for display
    course.value = {
      ...courseData,
      title: courseData.name || courseData.title,
      category: courseData.category || 'general',
      status: courseData.is_active ? 'active' : 'inactive',
      createdDate: courseData.created_at,
      lastModified: courseData.updated_at,
      totalDuration: courseData.estimated_duration_weeks || 
        courseData.phases?.reduce((total, phase) => total + (phase.duration_weeks || 0), 0) || 0,
      phases: courseData.phases?.map(phase => ({
        ...phase,
        title: phase.name || phase.title,
        duration: phase.duration_weeks || phase.duration,
        milestones: phase.milestones?.map(milestone => ({
          ...milestone,
          title: milestone.name || milestone.title
        })) || []
      })) || []
    }
    
    console.log('Mapped course for display:', course.value)
  } catch (error) {
    console.error('Error loading course:', error)
    course.value = null
  } finally {
    loading.value = false
  }
}

const getCourseStatusBadge = (status: string) => {
  const badges = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-blue-100 text-blue-800',
    archived: 'bg-red-100 text-red-800'
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

const getMilestoneTypeColor = (type: string) => {
  const colors = {
    assessment: 'bg-blue-500',
    project: 'bg-green-500',
    activity: 'bg-yellow-500',
    presentation: 'bg-purple-500',
    exam: 'bg-red-500',
    assignment: 'bg-indigo-500'
  }
  return colors[type] || 'bg-gray-500'
}

const getTotalMilestones = () => {
  return course.value?.phases?.reduce((total, phase) => {
    return total + (phase.milestones?.length || 0)
  }, 0) || 0
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-SA')
}

const editCourse = () => {
  showCourseModal.value = true
}

const updateCourse = async (courseData: any) => {
  try {
    console.log('Updating course:', course.value.id, courseData)

    // Transform courseData to match backend schema
    const transformedData = {
      name: courseData.title || courseData.name,
      description: courseData.description,
      age_group_min: parseInt(courseData.ageGroupMin) || undefined,
      age_group_max: parseInt(courseData.ageGroupMax) || undefined,
      is_active: courseData.status === 'active' || courseData.isActive !== false,
      color_code: courseData.colorCode,
      icon: courseData.icon,
      send_notifications: courseData.sendNotifications !== undefined ? courseData.sendNotifications : true,
      estimated_duration_weeks: parseInt(courseData.estimatedDurationWeeks) || undefined,
      learning_objectives: courseData.learningObjectives,
      prerequisites: courseData.prerequisites,
      materials_needed: courseData.materialsNeeded
    }

    const updatedCourse = await courseService.updateCourse(course.value.id, transformedData)
    console.log('Course updated successfully:', updatedCourse)

    // Update local state
    Object.assign(course.value, {
      ...updatedCourse,
      title: updatedCourse.name || updatedCourse.title,
      status: updatedCourse.is_active ? 'active' : 'inactive',
      createdDate: updatedCourse.created_at,
      lastModified: updatedCourse.updated_at
    })

    showCourseModal.value = false
  } catch (error) {
    console.error('Error updating course:', error)
    alert('حدث خطأ أثناء تحديث المقرر. يرجى المحاولة مرة أخرى.')
  }
}

const addPhase = () => {
  selectedPhase.value = null
  showPhaseModal.value = true
}

const editPhase = (phase: any) => {
  selectedPhase.value = phase
  showPhaseModal.value = true
}

const closePhaseModal = () => {
  showPhaseModal.value = false
  selectedPhase.value = null
}

const savePhase = async (phaseData: any) => {
  try {
    if (selectedPhase.value) {
      // Edit existing phase
      console.log('Updating phase:', selectedPhase.value.id, phaseData)

      // Transform data for API
      const updateData = {
        name: phaseData.title || phaseData.name,
        description: phaseData.description,
        order: selectedPhase.value.order
      }

      const updatedPhase = await courseService.updatePhase(selectedPhase.value.id, updateData)
      console.log('Phase updated successfully:', updatedPhase)

      // Update local state
      const index = course.value.phases.findIndex(p => p.id === selectedPhase.value.id)
      if (index !== -1) {
        course.value.phases[index] = {
          ...course.value.phases[index],
          ...updatedPhase,
          title: updatedPhase.name || updatedPhase.title,
          duration: updatedPhase.duration_weeks || updatedPhase.duration
        }
      }
    } else {
      // Add new phase
      console.log('Creating new phase for course:', course.value.id)

      const createData = {
        name: phaseData.title || phaseData.name,
        description: phaseData.description,
        order: (course.value.phases?.length || 0) + 1,
        courseId: course.value.id
      }

      const newPhase = await courseService.createPhase(createData)
      console.log('Phase created successfully:', newPhase)

      // Add to local state
      const frontendPhase = {
        ...newPhase,
        title: newPhase.name || newPhase.title,
        duration: newPhase.duration_weeks || newPhase.duration,
        milestones: []
      }

      if (!course.value.phases) {
        course.value.phases = []
      }
      course.value.phases.push(frontendPhase)
    }

    // Recalculate total duration
    course.value.totalDuration = course.value.phases.reduce((total, phase) => {
      return total + (phase.duration || 0)
    }, 0)

    closePhaseModal()
  } catch (error) {
    console.error('Error saving phase:', error)
    alert('حدث خطأ أثناء حفظ المرحلة. يرجى المحاولة مرة أخرى.')
  }
}

const addMilestone = (phase: any) => {
  selectedPhase.value = phase
  selectedMilestone.value = null
  showMilestoneModal.value = true
}

const editMilestone = (milestone: any, phase: any) => {
  selectedPhase.value = phase
  selectedMilestone.value = milestone
  showMilestoneModal.value = true
}

const closeMilestoneModal = () => {
  showMilestoneModal.value = false
  selectedMilestone.value = null
  selectedPhase.value = null
}

const saveMilestone = async (milestoneData: any) => {
  try {
    const phaseIndex = course.value.phases.findIndex(p => p.id === selectedPhase.value.id)
    if (phaseIndex === -1) {
      console.error('Phase not found:', selectedPhase.value.id)
      return
    }

    if (selectedMilestone.value) {
      // Edit existing milestone
      console.log('Updating milestone:', selectedMilestone.value.id, milestoneData)

      const updateData = {
        name: milestoneData.title || milestoneData.name,
        description: milestoneData.description,
        order: selectedMilestone.value.order || 1,
        isRequired: milestoneData.isRequired || false,
        points: milestoneData.points
      }

      const updatedMilestone = await courseService.updateMilestone(selectedMilestone.value.id, updateData)
      console.log('Milestone updated successfully:', updatedMilestone)

      // Update local state
      const milestoneIndex = course.value.phases[phaseIndex].milestones.findIndex(m => m.id === selectedMilestone.value.id)
      if (milestoneIndex !== -1) {
        course.value.phases[phaseIndex].milestones[milestoneIndex] = {
          ...course.value.phases[phaseIndex].milestones[milestoneIndex],
          ...updatedMilestone,
          title: updatedMilestone.name || updatedMilestone.title
        }
      }
    } else {
      // Add new milestone
      console.log('Creating new milestone for phase:', selectedPhase.value.id)

      const createData = {
        name: milestoneData.title || milestoneData.name,
        description: milestoneData.description,
        order: (course.value.phases[phaseIndex].milestones?.length || 0) + 1,
        phaseId: selectedPhase.value.id,
        isRequired: milestoneData.isRequired || false,
        points: milestoneData.points
      }

      const newMilestone = await courseService.createMilestone(createData)
      console.log('Milestone created successfully:', newMilestone)

      // Add to local state
      const frontendMilestone = {
        ...newMilestone,
        title: newMilestone.name || newMilestone.title,
        targetWeek: milestoneData.targetWeek || 1
      }

      if (!course.value.phases[phaseIndex].milestones) {
        course.value.phases[phaseIndex].milestones = []
      }
      course.value.phases[phaseIndex].milestones.push(frontendMilestone)
    }

    // Sort milestones by order
    course.value.phases[phaseIndex].milestones.sort((a, b) => (a.order || 0) - (b.order || 0))

    closeMilestoneModal()
  } catch (error) {
    console.error('Error saving milestone:', error)
    alert('حدث خطأ أثناء حفظ المعلم. يرجى المحاولة مرة أخرى.')
  }
}

const publishCourse = async () => {
  try {
    console.log('Publishing course:', course.value.id)

    const updateData = {
      is_active: true
    }

    const updatedCourse = await courseService.updateCourse(course.value.id, updateData)
    console.log('Course published successfully:', updatedCourse)

    // Update local state
    course.value.status = 'published'
    course.value.lastModified = updatedCourse.updated_at || new Date().toISOString().split('T')[0]
  } catch (error) {
    console.error('Error publishing course:', error)
    alert('حدث خطأ أثناء نشر المقرر. يرجى المحاولة مرة أخرى.')
  }
}

const duplicateCourse = () => {
  router.push('/courses')
}

const exportCourse = () => {
  // Export functionality
  console.log('Exporting course...')
}

// Initialize
onMounted(() => {
  loadCourse()
})
</script>

<style scoped>
/* Custom timeline styles */
.timeline-line {
  background: linear-gradient(to bottom, #e5e7eb 0%, #e5e7eb 50%, transparent 50%);
}
</style>

