<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div class="max-w-2xl">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
              {{ $t('courseManagement.eyebrow') }}
            </p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {{ $t('courseManagement.title') }}
            </h1>
            <p class="mt-2 text-sm text-slate-200/95">
              {{ $t('courseManagement.subtitle') }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              @click="exportCourses"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {{ $t('courseManagement.exportCourse') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-primary-800 shadow-sm transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              @click="router.push('/courses/new')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('courseManagement.addCourse') }}
            </button>
          </div>
        </div>
      </section>

      <div
        v-if="errorMessage && !loading"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm"
      >
        {{ errorMessage }}
      </div>

      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div class="sm:col-span-2 lg:col-span-1">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="courses-search">
                  {{ $t('common.search') }}
                </label>
                <div class="relative">
                  <svg
                    class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    id="courses-search"
                    v-model="searchQuery"
                    type="search"
                    class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pe-3 ps-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    :placeholder="$t('courseManagement.searchPlaceholder')"
                  >
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="courses-status">
                  {{ $t('courseManagement.status') }}
                </label>
                <select
                  id="courses-status"
                  v-model="selectedStatus"
                  class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">{{ $t('courseManagement.allStatuses') }}</option>
                  <option value="active">{{ $t('courseManagement.active') }}</option>
                  <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
                  <option value="draft">{{ $t('courseManagement.draft') }}</option>
                  <option value="published">{{ $t('courseManagement.published') }}</option>
                  <option value="archived">{{ $t('courseManagement.archived') }}</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="courses-category">
                  {{ $t('courseManagement.category') }}
                </label>
                <select
                  id="courses-category"
                  v-model="selectedCategory"
                  class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ courses.length }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseManagement.stats.total') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ statusCounts.active }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseManagement.stats.active') }}</div>
          </div>
          <div class="rounded-xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-200">
            <div class="text-xl font-bold tabular-nums text-slate-700">{{ statusCounts.inactive }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseManagement.stats.inactive') }}</div>
          </div>
          <div class="rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100">
            <div class="text-xl font-bold tabular-nums text-teal-700">{{ totalPhases }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseManagement.stats.phases') }}</div>
          </div>
        </div>

        <div class="px-6 py-5">
          <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="mt-3 text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="filteredCourses.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900">{{ $t('courseManagement.noCourses') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-gray-500">{{ $t('courseManagement.noCoursesDescription') }}</p>
            <button
              type="button"
              class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              @click="router.push('/courses/new')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('courseManagement.createFirstCourse') }}
            </button>
          </div>

          <template v-else>
            <div class="mb-4 flex items-center justify-between gap-3">
              <h2 class="text-sm font-semibold text-gray-900">{{ $t('courseManagement.listHeading') }}</h2>
              <p class="text-xs font-medium text-gray-500">
                {{ $t('courseManagement.coursesCount', { count: filteredCourses.length }) }}
              </p>
            </div>

            <!-- Cards -->
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="course in filteredCourses"
                :key="course.id"
                class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md"
                @click="viewCourse(course)"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          :class="getCourseStatusBadge(course.status)"
                        >
                          {{ $t(`courseManagement.${course.status}`) }}
                        </span>
                        <span class="text-[11px] font-medium text-gray-500">
                          {{ course.category ? $t(`courseManagement.${course.category}`) : $t('courseManagement.general') }}
                        </span>
                        <span
                          v-if="course.academicYear"
                          class="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800 ring-1 ring-primary-100"
                        >
                          {{ course.academicYear.year }}
                        </span>
                      </div>
                      <h3 class="truncate text-base font-semibold text-gray-900">{{ course.title }}</h3>
                      <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ course.description }}</p>
                    </div>
                    <div class="relative shrink-0">
                      <button
                        type="button"
                        class="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        :aria-label="$t('courseManagement.courseActions')"
                        @click.stop="toggleCourseActions(course.id)"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      <div
                        v-if="activeDropdown === course.id"
                        class="absolute end-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                        @click.stop
                      >
                        <button
                          type="button"
                          class="flex w-full px-3 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
                          @click="editCourse(course)"
                        >
                          {{ $t('courseManagement.editCourse') }}
                        </button>
                        <button
                          type="button"
                          class="flex w-full px-3 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
                          @click="duplicateCourse(course)"
                        >
                          {{ $t('courseManagement.duplicateCourse') }}
                        </button>
                        <button
                          v-if="course.status === 'draft'"
                          type="button"
                          class="flex w-full px-3 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
                          @click="publishCourse(course)"
                        >
                          {{ $t('courseManagement.publishCourse') }}
                        </button>
                        <button
                          v-if="course.status !== 'archived'"
                          type="button"
                          class="flex w-full px-3 py-2 text-start text-sm text-red-700 hover:bg-red-50"
                          @click="archiveCourse(course)"
                        >
                          {{ $t('courseManagement.archiveCourse') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-gray-50/80 p-3 ring-1 ring-gray-100">
                    <div class="text-center">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ course.phases?.length || 0 }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('courseManagement.phases') }}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ getTotalMilestones(course) }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('courseManagement.milestones') }}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ course.totalDuration || 0 }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('courseManagement.weeks') }}</div>
                    </div>
                  </div>
                </div>
                <div class="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                    {{ $t('courseManagement.openCourse') }}
                    <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </article>
            </div>

            <!-- List -->
            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.courseTitle') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.category') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.status') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.phases') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.milestones') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="course in filteredCourses"
                    :key="'list-' + course.id"
                    class="cursor-pointer hover:bg-primary-50/20"
                    @click="viewCourse(course)"
                  >
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ course.title }}</div>
                      <div v-if="course.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ course.description }}</div>
                    </td>
                    <td class="px-4 py-3 text-gray-700">
                      {{ course.category ? $t(`courseManagement.${course.category}`) : $t('courseManagement.general') }}
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        :class="getCourseStatusBadge(course.status)"
                      >
                        {{ $t(`courseManagement.${course.status}`) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">{{ course.phases?.length || 0 }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">{{ getTotalMilestones(course) }}</td>
                    <td class="px-4 py-3 text-end">
                      <div class="relative inline-block" @click.stop>
                        <button
                          type="button"
                          class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          :aria-label="$t('courseManagement.courseActions')"
                          @click="toggleCourseActions(course.id)"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        <div
                          v-if="activeDropdown === course.id"
                          class="absolute end-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                        >
                          <button
                            type="button"
                            class="flex w-full px-3 py-2 text-start text-sm text-gray-700 hover:bg-primary-50"
                            @click="editCourse(course)"
                          >
                            {{ $t('courseManagement.editCourse') }}
                          </button>
                          <button
                            type="button"
                            class="flex w-full px-3 py-2 text-start text-sm text-gray-700 hover:bg-primary-50"
                            @click="duplicateCourse(course)"
                          >
                            {{ $t('courseManagement.duplicateCourse') }}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </section>

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
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import courseService, { type Course } from '@/services/course.service'

const { t } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    return null
  }
})

const schoolId = computed(() => Number(currentUser.value?.school_id || 1))

const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const activeDropdown = ref<string | number | null>(null)
const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const errorMessage = ref('')

const courses = ref<Course[]>([])
const loading = ref(false)

const statusCounts = computed(() => {
  let active = 0
  let inactive = 0
  for (const c of courses.value) {
    if (c.status === 'active' || c.status === 'published') active += 1
    else if (c.status === 'inactive' || c.status === 'draft' || c.status === 'archived') inactive += 1
  }
  return { active, inactive }
})

const totalPhases = computed(() =>
  courses.value.reduce((sum, c) => sum + (c.phases?.length || 0), 0),
)

const loadCourses = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await courseService.getAllCourses(schoolId.value, 'milestone')

    if (response && Array.isArray(response)) {
      courses.value = response.map((course) => ({
        ...course,
        title: course.name || course.title,
        status: course.is_active ? 'active' : 'inactive',
        category: course.category || 'general',
      }))
    } else {
      courses.value = []
      errorMessage.value = 'Database connection error. Please check your database setup.'
    }
  } catch (error: unknown) {
    courses.value = []
    const err = error as Error
    if (err.message?.includes('does not exist')) {
      errorMessage.value = 'Database tables not found. Please run database migrations.'
    } else if (err.message?.includes('connect')) {
      errorMessage.value = 'Cannot connect to database. Please check database connection.'
    } else {
      errorMessage.value = `Database error: ${err.message || t('courseManagement.loadError')}`
    }
  } finally {
    loading.value = false
  }
}

const filteredCourses = computed(() => {
  let filtered = courses.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        (course.description || '').toLowerCase().includes(query),
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((course) => course.status === selectedStatus.value)
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((course) => course.category === selectedCategory.value)
  }

  return filtered
})

const getCourseStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-100 text-slate-700',
    draft: 'bg-amber-100 text-amber-900',
    published: 'bg-primary-100 text-primary-800',
    archived: 'bg-red-100 text-red-800',
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

const getTotalMilestones = (course: Course) => {
  return (
    course.phases?.reduce((total, phase) => {
      return total + (phase.milestones?.length || 0)
    }, 0) || 0
  )
}

const toggleCourseActions = (courseId: string | number) => {
  activeDropdown.value = activeDropdown.value === courseId ? null : courseId
}

const viewCourse = (course: Course) => {
  router.push(`/courses/${course.id}`)
}

const editCourse = (course: Course) => {
  router.push(`/courses/${course.id}/edit`)
  activeDropdown.value = null
}

const duplicateCourse = (course: Course) => {
  const newCourse = {
    ...course,
    id: Date.now(),
    title: `${course.title} (نسخة)`,
    status: 'draft',
    createdDate: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0],
  }
  courses.value.push(newCourse as Course)
  activeDropdown.value = null
}

const publishCourse = (course: Course) => {
  const index = courses.value.findIndex((c) => c.id === course.id)
  if (index !== -1) {
    courses.value[index].status = 'published'
    courses.value[index].lastModified = new Date().toISOString().split('T')[0]
  }
  activeDropdown.value = null
}

const archiveCourse = (course: Course) => {
  const index = courses.value.findIndex((c) => c.id === course.id)
  if (index !== -1) {
    courses.value[index].status = 'archived'
    courses.value[index].lastModified = new Date().toISOString().split('T')[0]
  }
  activeDropdown.value = null
}

const exportCourses = () => {
  console.log('Exporting courses...')
}

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
