<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header (aligned with /courses) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('gradedCourses.title') }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ $t('gradedCourses.subtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            @click="exportGradedCourses"
          >
            <svg class="h-4 w-4 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {{ $t('courseManagement.exportCourse') }}
          </button>
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            @click="router.push('/graded-courses/new')"
          >
            <svg class="h-4 w-4 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {{ $t('gradedCourses.addCourse') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>

      <template v-else>
        <!-- Filters (same shell as /courses) -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <label for="graded-search" class="sr-only">{{ $t('courseManagement.searchPlaceholder') }}</label>
              <div class="relative">
                <div class="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <input
                  id="graded-search"
                  v-model="searchQuery"
                  type="text"
                  :placeholder="$t('courseManagement.searchPlaceholder')"
                  class="block w-full ps-10 pe-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div>
              <label for="graded-status" class="sr-only">{{ $t('courseManagement.allStatuses') }}</label>
              <select
                id="graded-status"
                v-model="selectedStatus"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">{{ $t('courseManagement.allStatuses') }}</option>
                <option value="active">{{ $t('courseManagement.active') }}</option>
                <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
              </select>
            </div>
            <div>
              <label for="graded-aggregation" class="sr-only">{{ $t('gradedCourses.allAggregations') }}</label>
              <select
                id="graded-aggregation"
                v-model="selectedAggregation"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">{{ $t('gradedCourses.allAggregations') }}</option>
                <option value="average">{{ $t('gradedCourses.aggregationAverage') }}</option>
                <option value="sum">{{ $t('gradedCourses.aggregationSum') }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- List shell + course-style cards -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                {{ $t('gradedCourses.title') }}
                <span class="ms-2 text-sm font-normal text-gray-500">
                  ({{ filteredCourses.length }}
                  {{
                    filteredCourses.length === 1
                      ? $t('gradedCourses.courseSingular')
                      : $t('gradedCourses.coursePlural')
                  }})
                </span>
              </h3>
            </div>
          </div>

          <div v-if="filteredCourses.length > 0" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="course in filteredCourses"
                :key="course.id"
                class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                @click="viewCourse(course)"
              >
                <div class="p-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <div
                          :class="['w-3 h-3 rounded-full', getCourseStatusColor(course)]"
                        />
                        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {{ $t('gradedCourses.gradedKindLabel') }}
                        </span>
                        <span
                          v-if="course.academicYear?.year"
                          class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full"
                        >
                          {{ course.academicYear.year }}
                        </span>
                      </div>
                      <h4 class="text-lg font-semibold text-gray-900 mb-2">
                        {{ course.name || course.title }}
                      </h4>
                      <p class="text-sm text-gray-600 mb-4 line-clamp-2">
                        {{ course.description || $t('courseManagement.noDescription') }}
                      </p>
                    </div>
                    <div class="relative">
                      <button
                        type="button"
                        class="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        :title="$t('courseManagement.courseActions')"
                        @click.stop="toggleCourseActions(course.id)"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>
                      <div
                        v-if="activeDropdown === course.id"
                        class="absolute end-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                        @click.stop
                      >
                        <div class="py-1">
                          <button
                            type="button"
                            class="block w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            @click="viewCourse(course)"
                          >
                            {{ $t('gradedCourses.openCourse') }}
                          </button>
                          <button
                            type="button"
                            class="block w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            @click="editCourse(course)"
                          >
                            {{ $t('courseManagement.editCourse') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div class="text-center">
                      <div class="text-lg font-semibold text-gray-900">
                        {{ course.graded_scheme?.semesters?.length ?? 0 }}
                      </div>
                      <div class="text-xs text-gray-500">{{ $t('gradedCourses.semestersCountLabel') }}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-lg font-semibold text-gray-900">{{ totalCriteria(course) }}</div>
                      <div class="text-xs text-gray-500">{{ $t('gradedCourses.criteria') }}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-lg font-semibold text-gray-900">
                        {{ course.graded_scheme?.total_marks ?? '—' }}
                      </div>
                      <div class="text-xs text-gray-500">{{ $t('gradedCourses.totalMarks') }}</div>
                    </div>
                  </div>

                  <div class="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getCourseStatusBadge(course),
                      ]"
                    >
                      {{ course.is_active ? $t('courseManagement.active') : $t('courseManagement.inactive') }}
                    </span>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {{
                        course.graded_scheme?.aggregation_method === 'average'
                          ? $t('gradedCourses.aggregationAverage')
                          : $t('gradedCourses.aggregationSum')
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('gradedCourses.noCourses') }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ $t('gradedCourses.noCoursesHint') }}</p>
            <div class="mt-6">
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                @click="router.push('/graded-courses/new')"
              >
                <svg class="h-4 w-4 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {{ $t('gradedCourses.addCourse') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import gradedAssessmentService, {
  type GradedCourseWithScheme,
} from '@/services/graded-assessment.service'

const { locale } = useI18n()
const router = useRouter()

const isRTL = computed(() => locale.value === 'ar')

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    return null
  }
})

const schoolId = computed(() => Number(currentUser.value?.school_id || 1))

const loading = ref(true)
const courses = ref<GradedCourseWithScheme[]>([])
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedAggregation = ref('')
const activeDropdown = ref<string | null>(null)

const filteredCourses = computed(() => {
  let list = courses.value
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((c) => {
      const name = (c.name || c.title || '').toLowerCase()
      const desc = (c.description || '').toLowerCase()
      return name.includes(q) || desc.includes(q)
    })
  }
  if (selectedStatus.value === 'active') {
    list = list.filter((c) => c.is_active)
  } else if (selectedStatus.value === 'inactive') {
    list = list.filter((c) => !c.is_active)
  }
  if (selectedAggregation.value) {
    list = list.filter(
      (c) => (c.graded_scheme?.aggregation_method || '') === selectedAggregation.value,
    )
  }
  return list
})

function totalCriteria(c: GradedCourseWithScheme): number {
  const sems = c.graded_scheme?.semesters ?? []
  return sems.reduce((acc, s) => acc + (s.criteria?.length ?? 0), 0)
}

function getCourseStatusColor(course: GradedCourseWithScheme): string {
  return course.is_active ? 'bg-green-500' : 'bg-gray-400'
}

function getCourseStatusBadge(course: GradedCourseWithScheme): string {
  return course.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
}

function toggleCourseActions(courseId: string) {
  activeDropdown.value = activeDropdown.value === courseId ? null : courseId
}

function viewCourse(course: GradedCourseWithScheme) {
  activeDropdown.value = null
  router.push(`/graded-courses/${course.id}/edit`)
}

function editCourse(course: GradedCourseWithScheme) {
  activeDropdown.value = null
  router.push(`/graded-courses/${course.id}/edit`)
}

function exportGradedCourses() {
  console.log('Export graded courses')
}

function handleClickOutside(event: Event) {
  if (activeDropdown.value && !(event.target as Element).closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  loading.value = true
  try {
    courses.value = await gradedAssessmentService.list(schoolId.value)
  } catch (e) {
    console.error(e)
    courses.value = []
  } finally {
    loading.value = false
  }
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
