<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('gradedCourses.title') }}</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('gradedCourses.subtitle') }}</p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-800 shadow-sm hover:bg-primary-50"
            @click="router.push('/graded-courses/new')"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ $t('gradedCourses.addCourse') }}
          </button>
        </div>
      </section>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('gradedCourses.listHeading') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('gradedCourses.coursesCount', { count: filteredCourses.length }) }}
              </p>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div class="relative min-w-[12rem] flex-1 sm:max-w-xs">
                <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                  <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <input
                  id="graded-search"
                  v-model="searchQuery"
                  type="text"
                  :placeholder="$t('courseManagement.searchPlaceholder')"
                  class="block w-full rounded-lg border border-gray-300 py-2 ps-9 pe-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <select
                v-model="selectedStatus"
                class="block min-w-[9rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="">{{ $t('courseManagement.allStatuses') }}</option>
                <option value="active">{{ $t('courseManagement.active') }}</option>
                <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
              </select>
              <select
                v-model="selectedAggregation"
                class="block min-w-[9rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="">{{ $t('gradedCourses.allAggregations') }}</option>
                <option value="average">{{ $t('gradedCourses.aggregationAverage') }}</option>
                <option value="sum">{{ $t('gradedCourses.aggregationSum') }}</option>
              </select>
              <ListViewModeToggle v-model="viewMode" />
            </div>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ courses.length }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('gradedCourses.statTotal') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ activeCount }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseManagement.active') }}</div>
          </div>
          <div class="rounded-xl bg-slate-50/80 px-3 py-3 text-center ring-1 ring-slate-200/80">
            <div class="text-xl font-bold tabular-nums text-slate-700">{{ inactiveCount }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseManagement.inactive') }}</div>
          </div>
          <div class="rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100">
            <div class="text-xl font-bold tabular-nums text-teal-700">{{ averageSemesters }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('gradedCourses.statAvgSemesters') }}</div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="filteredCourses.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="course in filteredCourses"
                :key="course.id"
                class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                @click="viewCourse(course)"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 opacity-80"
                  :class="course.is_active ? 'bg-gradient-to-r from-primary-500 to-teal-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'"
                  aria-hidden="true"
                />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      :class="course.is_active ? 'bg-primary-100 text-primary-800' : 'bg-slate-100 text-slate-500'"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <h3 class="line-clamp-2 font-semibold leading-snug text-gray-900">
                            {{ course.name || course.title }}
                          </h3>
                          <div class="mt-2 flex flex-wrap gap-1.5">
                            <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                              {{ $t('gradedCourses.gradedKindLabel') }}
                            </span>
                            <span
                              v-if="course.academicYear?.year"
                              class="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-100"
                            >
                              {{ course.academicYear.year }}
                            </span>
                            <span
                              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                              :class="getCourseStatusBadge(course)"
                            >
                              {{ course.is_active ? $t('courseManagement.active') : $t('courseManagement.inactive') }}
                            </span>
                            <span class="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 ring-1 ring-teal-100">
                              {{
                                course.graded_scheme?.aggregation_method === 'average'
                                  ? $t('gradedCourses.aggregationAverage')
                                  : $t('gradedCourses.aggregationSum')
                              }}
                            </span>
                          </div>
                        </div>
                        <div class="relative shrink-0">
                          <button
                            type="button"
                            class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            :title="$t('common.actions')"
                            @click.stop="toggleCourseActions(course.id)"
                          >
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </button>
                          <div
                            v-if="activeDropdown === course.id"
                            class="absolute end-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg"
                            @click.stop
                          >
                            <div class="py-1">
                              <button
                                type="button"
                                class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                @click="viewCourse(course)"
                              >
                                {{ $t('gradedCourses.openCourse') }}
                              </button>
                              <button
                                type="button"
                                class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                @click="editCourse(course)"
                              >
                                {{ $t('courseManagement.editCourse') }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {{ course.description || $t('courseManagement.noDescription') }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                    <div class="rounded-lg bg-gray-50 px-2 py-2 text-center ring-1 ring-gray-100">
                      <div class="text-base font-bold tabular-nums text-gray-900">
                        {{ course.graded_scheme?.semesters?.length ?? 0 }}
                      </div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('gradedCourses.semestersCountLabel') }}</div>
                    </div>
                    <div class="rounded-lg bg-gray-50 px-2 py-2 text-center ring-1 ring-gray-100">
                      <div class="text-base font-bold tabular-nums text-gray-900">{{ totalCriteria(course) }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('gradedCourses.criteria') }}</div>
                    </div>
                    <div class="rounded-lg bg-gray-50 px-2 py-2 text-center ring-1 ring-gray-100">
                      <div class="text-base font-bold tabular-nums text-gray-900">
                        {{ course.graded_scheme?.total_marks ?? '—' }}
                      </div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('gradedCourses.marks') }}</div>
                    </div>
                  </div>
                </div>
                <div class="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
                  <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                    {{ $t('gradedCourses.openCourse') }}
                    <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('gradedCourses.courseName') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('gradedCourses.semestersCountLabel') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('gradedCourses.criteria') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('gradedCourses.aggregation') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('gradedCourses.statusLabel') }}</th>
                    <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
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
                      <div class="font-medium text-gray-900">{{ course.name || course.title }}</div>
                      <div class="mt-0.5 line-clamp-1 text-xs text-gray-500">
                        {{ course.description || $t('courseManagement.noDescription') }}
                      </div>
                    </td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">
                      {{ course.graded_scheme?.semesters?.length ?? 0 }}
                    </td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">{{ totalCriteria(course) }}</td>
                    <td class="px-4 py-3 text-gray-700">
                      {{
                        course.graded_scheme?.aggregation_method === 'average'
                          ? $t('gradedCourses.aggregationAverage')
                          : $t('gradedCourses.aggregationSum')
                      }}
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        :class="getCourseStatusBadge(course)"
                      >
                        {{ course.is_active ? $t('courseManagement.active') : $t('courseManagement.inactive') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-end" @click.stop>
                      <button
                        type="button"
                        class="text-sm font-semibold text-primary-700 hover:text-primary-900"
                        @click="editCourse(course)"
                      >
                        {{ $t('common.edit') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'empty-' + slot"
              class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <template v-if="slot === 1">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('gradedCourses.noCourses') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('gradedCourses.noCoursesHint') }}</p>
                <button
                  type="button"
                  class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                  @click="router.push('/graded-courses/new')"
                >
                  {{ $t('gradedCourses.addCourse') }}
                </button>
              </template>
              <template v-else>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import gradedAssessmentService, {
  type GradedCourseWithScheme,
} from '@/services/graded-assessment.service'

const { locale } = useI18n()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

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

const activeCount = computed(() => courses.value.filter((c) => c.is_active).length)
const inactiveCount = computed(() => courses.value.filter((c) => !c.is_active).length)
const averageSemesters = computed(() => {
  if (!courses.value.length) return 0
  const total = courses.value.reduce(
    (sum, c) => sum + (c.graded_scheme?.semesters?.length ?? 0),
    0,
  )
  return Math.round((total / courses.value.length) * 10) / 10
})

function totalCriteria(c: GradedCourseWithScheme): number {
  const sems = c.graded_scheme?.semesters ?? []
  return sems.reduce((acc, s) => acc + (s.criteria?.length ?? 0), 0)
}

function getCourseStatusBadge(course: GradedCourseWithScheme): string {
  return course.is_active
    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20'
    : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/15'
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
