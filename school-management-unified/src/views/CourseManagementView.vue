<template>
  <DashboardLayout>
    <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('courseManagement.title') }}</h1>
        <p class="mt-1 text-sm text-gray-500">{{ $t('courseManagement.description') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="exportCourses"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {{ $t('courseManagement.exportCourse') }}
        </button>
        <button
          @click="showCourseModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {{ $t('courseManagement.addCourse') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <label for="search" class="sr-only">{{ $t('courseManagement.searchPlaceholder') }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              :placeholder="$t('courseManagement.searchPlaceholder')"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status-filter" class="sr-only">{{ $t('courseManagement.allStatuses') }}</label>
          <select
            id="status-filter"
            v-model="selectedStatus"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">{{ $t('courseManagement.allStatuses') }}</option>
            <option value="active">{{ $t('courseManagement.active') }}</option>
            <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
            <option value="draft">{{ $t('courseManagement.draft') }}</option>
            <option value="published">{{ $t('courseManagement.published') }}</option>
            <option value="archived">{{ $t('courseManagement.archived') }}</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <label for="category-filter" class="sr-only">{{ $t('courseManagement.allCategories') }}</label>
          <select
            id="category-filter"
            v-model="selectedCategory"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">{{ $t('courseManagement.allCategories') }}</option>
            <option value="language">{{ $t('courseManagement.language') }}</option>
            <option value="mathematics">{{ $t('courseManagement.mathematics') }}</option>
            <option value="science">{{ $t('courseManagement.science') }}</option>
            <option value="art">{{ $t('courseManagement.art') }}</option>
            <option value="music">{{ $t('courseManagement.music') }}</option>
            <option value="physicalEducation">{{ $t('courseManagement.physicalEducation') }}</option>
            <option value="socialStudies">{{ $t('courseManagement.socialStudies') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Courses List -->
    <div class="bg-white shadow rounded-lg">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ $t('courseManagement.title') }}
            <span class="ml-2 text-sm font-normal text-gray-500">
              ({{ filteredCourses.length }} {{ filteredCourses.length === 1 ? $t('courseManagement.courseTitle') : $t('courseManagement.title') }})
            </span>
          </h3>
        </div>
      </div>

      <!-- Courses Grid -->
      <div v-if="filteredCourses.length > 0" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            @click="viewCourse(course)"
          >
            <!-- Course Header -->
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <div
                      :class="[
                        'w-3 h-3 rounded-full',
                        getCourseStatusColor(course.status)
                      ]"
                    ></div>
                    <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {{ course.category ? $t(`courseManagement.${course.category}`) : $t('courseManagement.general') }}
                    </span>
                    <span v-if="course.academicYear" class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {{ course.academicYear.year }}
                    </span>
                  </div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ course.title }}</h4>
                  <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ course.description }}</p>
                </div>
                
                <!-- Actions Dropdown -->
                <div class="relative">
                  <button
                    @click.stop="toggleCourseActions(course.id)"
                    class="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    :title="$t('courseManagement.courseActions')"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>

                  <!-- Dropdown Menu -->
                  <div
                    v-if="activeDropdown === course.id"
                    class="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                    @click.stop
                  >
                    <div class="py-1">
                      <button
                        @click="editCourse(course)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {{ $t('courseManagement.editCourse') }}
                      </button>
                      <button
                        @click="duplicateCourse(course)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {{ $t('courseManagement.duplicateCourse') }}
                      </button>
                      <button
                        v-if="course.status === 'draft'"
                        @click="publishCourse(course)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {{ $t('courseManagement.publishCourse') }}
                      </button>
                      <button
                        v-if="course.status !== 'archived'"
                        @click="archiveCourse(course)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {{ $t('courseManagement.archiveCourse') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Course Stats -->
              <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900">{{ course.phases?.length || 0 }}</div>
                  <div class="text-xs text-gray-500">{{ $t('courseManagement.phases') }}</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900">{{ getTotalMilestones(course) }}</div>
                  <div class="text-xs text-gray-500">{{ $t('courseManagement.milestones') }}</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900">{{ course.totalDuration || 0 }}</div>
                  <div class="text-xs text-gray-500">{{ $t('courseManagement.weeks') }}</div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="mt-4">
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
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('courseManagement.noCourses') }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ $t('courseManagement.noCoursesDescription') }}</p>
        <div class="mt-6">
          <button
            @click="showCourseModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {{ $t('courseManagement.createFirstCourse') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Course Modal -->
    <CourseModal
      v-if="showCourseModal"
      :course="selectedCourse"
      @close="closeCourseModal"
      @save="saveCourse"
    />

    <!-- Progress Dialog -->
    <ProgressDialog
      :show="showProgressDialog"
      :state="progressState"
      :title="progressTitle"
      :message="progressMessage"
      :error-message="errorMessage"
      @close="showProgressDialog = false"
    />
  </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CourseModal from '@/components/CourseModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import courseService, { type Course } from '@/services/course.service'

const { t } = useI18n()
const router = useRouter()

// Reactive data
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const showCourseModal = ref(false)
const selectedCourse = ref(null)
const activeDropdown = ref(null)
const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const errorMessage = ref('')

// Courses data from API
const courses = ref<Course[]>([])
const loading = ref(false)

// Load courses from API
const loadCourses = async () => {
  loading.value = true
  try {
    console.log('Loading courses from API...')
    const coursesData = await courseService.getAllCourses()
    // Map backend fields to frontend fields
    courses.value = coursesData.map(course => ({
      ...course,
      title: course.name || course.title,
      status: course.is_active ? 'active' : 'inactive',
      category: course.category || 'general'
    }))
    console.log('Courses loaded and mapped:', courses.value)
  } catch (error) {
    console.error('Error loading courses:', error)
    // Show error message to user instead of using mock data
    errorMessage.value = 'Failed to load courses. Please try again.'
    courses.value = []
  } finally {
    loading.value = false
  }
}




// Computed properties
const filteredCourses = computed(() => {
  let filtered = courses.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(course => course.status === selectedStatus.value)
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(course => course.category === selectedCategory.value)
  }

  return filtered
})

// Methods
const getCourseStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    draft: 'bg-yellow-500',
    published: 'bg-blue-500',
    archived: 'bg-red-500'
  }
  return colors[status] || 'bg-gray-400'
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

const getTotalMilestones = (course: any) => {
  return course.phases?.reduce((total: number, phase: any) => {
    return total + (phase.milestones?.length || 0)
  }, 0) || 0
}

const toggleCourseActions = (courseId) => {
  activeDropdown.value = activeDropdown.value === courseId ? null : courseId
}

const viewCourse = (course: any) => {
  router.push(`/courses/${course.id}`)
}

const editCourse = (course: any) => {
  selectedCourse.value = course
  showCourseModal.value = true
  activeDropdown.value = null
}

const duplicateCourse = (course: any) => {
  // Create a copy of the course with a new ID
  const newCourse = {
    ...course,
    id: Date.now(),
    title: `${course.title} (نسخة)`,
    status: 'draft',
    createdDate: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0]
  }
  courses.value.push(newCourse)
  activeDropdown.value = null
}

const publishCourse = (course: any) => {
  const index = courses.value.findIndex(c => c.id === course.id)
  if (index !== -1) {
    courses.value[index].status = 'published'
    courses.value[index].lastModified = new Date().toISOString().split('T')[0]
  }
  activeDropdown.value = null
}

const archiveCourse = (course: any) => {
  const index = courses.value.findIndex(c => c.id === course.id)
  if (index !== -1) {
    courses.value[index].status = 'archived'
    courses.value[index].lastModified = new Date().toISOString().split('T')[0]
  }
  activeDropdown.value = null
}

const exportCourses = () => {
  // Export functionality - would typically generate CSV/Excel
  console.log('Exporting courses...')
}

const closeCourseModal = () => {
  showCourseModal.value = false
  selectedCourse.value = null
}

const saveCourse = async (courseData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = selectedCourse.value ? 'تحديث المقرر' : 'إنشاء مقرر جديد'
  progressMessage.value = selectedCourse.value ? 'جاري تحديث بيانات المقرر...' : 'جاري إنشاء المقرر الجديد...'
  
  try {
    console.log('Course save started:', courseData)
    console.log('courseData keys:', Object.keys(courseData))
    console.log('courseData.title:', courseData.title)
    console.log('courseData.name:', courseData.name)
    
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
      materials_needed: courseData.materialsNeeded,
      school_id: 1
    }
    
    console.log('Transformed data for API:', transformedData)
    
    if (selectedCourse.value) {
      // Edit existing course
      console.log('Updating course with ID:', selectedCourse.value.id)
      const updatedCourse = await courseService.updateCourse(selectedCourse.value.id, transformedData)
      console.log('Course updated successfully:', updatedCourse)
      
      // Update local courses array
      const index = courses.value.findIndex(c => c.id === selectedCourse.value.id)
      if (index !== -1) {
        // Map backend fields to frontend fields
        courses.value[index] = {
          ...updatedCourse,
          title: updatedCourse.name || updatedCourse.title
        }
      }
      progressMessage.value = 'تم تحديث المقرر بنجاح!'
    } else {
      // Add new course
      console.log('Creating new course')
      const newCourse = await courseService.createCourse(transformedData)
      console.log('Course created successfully:', newCourse)
      
      // Create phases if they exist
      if (courseData.phases && courseData.phases.length > 0) {
        console.log('Creating phases for course:', courseData.phases)
        progressMessage.value = 'جاري إنشاء المراحل...'
        
        for (let i = 0; i < courseData.phases.length; i++) {
          const phase = courseData.phases[i]
          const phaseData = {
            name: phase.title || phase.name,
            description: phase.description,
            order: i + 1,
            courseId: newCourse.id
          }
          console.log('Creating phase:', phaseData)
          await courseService.createPhase(phaseData)
        }
        console.log('All phases created successfully')
      }
      
      // Add to local courses array
      // Map backend fields to frontend fields
      const frontendCourse = {
        ...newCourse,
        title: newCourse.name || newCourse.title,
        phases: courseData.phases || []
      }
      courses.value.push(frontendCourse)
      progressMessage.value = 'تم إنشاء المقرر والمراحل بنجاح!'
    }
    
    progressState.value = 'success'
    
    setTimeout(() => {
      showProgressDialog.value = false
      closeCourseModal()
    }, 1500)
    
  } catch (err: any) {
    console.error('Error saving course:', err)
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'
    
    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  if (activeDropdown.value && !(event.target as Element).closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadCourses()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

