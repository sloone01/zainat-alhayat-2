<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('gradedMarksGrid.title')"
        :subtitle="marksHeaderSubtitle"
      />

      <!-- Step 1: groups -->
      <section v-if="!selectedGroup" class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('progressTracking.selectGroup') }}</h2>
            <p v-if="!loadingGroups" class="fk-card__meta">
              {{ $t('progressTracking.groupsCount', { count: groupsTotal }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>
        <div class="p-6">
          <div v-if="loadingGroups" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>
          <div v-else-if="groupsTotal && isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KanbanCard
              v-for="group in paginatedGroups"
              :key="group.id"
              as="button"
              :title="group.name"
              @click="selectGroup(group)"
            >
              <template #tags>
                <KanbanTag v-if="group.ageGroup" dot="primary">{{ group.ageGroup }}</KanbanTag>
              </template>
              <template #meta>
                <KanbanMeta icon="users">{{ group.studentsCount }} {{ $t('progressTracking.students') }}</KanbanMeta>
                <KanbanMeta icon="check">{{ group.gradedCoursesCount }} {{ $t('gradedMarksGrid.gradedCourses') }}</KanbanMeta>
              </template>
            </KanbanCard>
          </div>
          <div v-else-if="groupsTotal" class="overflow-visible">
            <table class="fk-feetable min-w-full">
              <thead>
                <tr>
                  <th>{{ $t('progressTracking.groupName') }}</th>
                  <th>{{ $t('progressTracking.students') }}</th>
                  <th>{{ $t('gradedMarksGrid.gradedCourses') }}</th>
                  <th class="!text-end">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="group in paginatedGroups"
                  :key="'list-' + group.id"
                  class="cursor-pointer hover:bg-fikr-pearl"
                  @click="selectGroup(group)"
                >
                  <td class="font-medium">{{ group.name }}</td>
                  <td class="tabular-nums">{{ group.studentsCount }}</td>
                  <td class="tabular-nums">{{ group.gradedCoursesCount }}</td>
                  <td class="text-end font-semibold text-primary-700">{{ $t('common.open') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-16 text-center text-sm text-gray-500">{{ $t('progressTracking.noGroups') }}</div>
          <FikrPagination
            :page="groupsPage"
            :pages="groupsTotalPages"
            :show="!loadingGroups && groupsTotal > 0"
            @update:page="goToGroupsPage"
          />
        </div>
      </section>

      <!-- Step 2: graded courses -->
      <section v-else-if="selectedGroup && !selectedCourse" class="fk-elev p-0">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="flex min-w-0 items-center gap-3">
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
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('gradedMarksGrid.selectCourse') }}</h2>
              <p class="fk-card__meta">{{ selectedGroup.name }}</p>
            </div>
          </div>
          <button type="button" class="text-sm font-medium text-primary-700 hover:text-primary-900" @click="selectedGroup = null">
            {{ $t('progressTracking.changeGroup') }}
          </button>
        </div>
        <div class="p-6">
          <div v-if="loadingCourses" class="flex justify-center py-12">
            <FikrLoader />
          </div>
          <div v-else-if="!coursesTotal" class="flex min-h-[12rem] flex-col items-center justify-center px-6 py-12 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.26 10.147a60.438 60.438 0 0016.48 0M4.26 10.147l-.955 4.605M4.26 10.147l4.605-.955M19.74 10.147l.955 4.605M19.74 10.147l-4.605-.955M12 4.5v15" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-800">{{ $t('gradedMarksGrid.noGradedCourses') }}</p>
          </div>
          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KanbanCard
              v-for="course in paginatedCourses"
              :key="course.id"
              as="button"
              :title="course.title"
              @click="selectCourse(course)"
            >
              <template #tags>
                <KanbanTag dot="primary">{{ $t('gradedCourses.title') }}</KanbanTag>
                <KanbanTag v-if="course.criteriaCount != null">
                  {{ course.criteriaCount }} {{ $t('gradedCourses.criteria') }}
                </KanbanTag>
              </template>
              <template #meta>
                <KanbanMeta icon="calendar">{{ course.time }} · {{ formatDay(course.day) }}</KanbanMeta>
              </template>
            </KanbanCard>
          </div>
          <FikrPagination
            :page="coursesPage"
            :pages="coursesTotalPages"
            :show="!loadingCourses && coursesTotal > 0"
            @update:page="goToCoursesPage"
          />
        </div>
      </section>

      <!-- Step 3: marks grid — students × criteria -->
      <div v-else class="space-y-4 sm:space-y-6">
        <div class="fk-elev p-0">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="flex min-w-0 items-center gap-3">
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
              <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ selectedCourse?.title }}</h2>
              <p class="fk-card__meta">{{ selectedGroup?.name }}</p>
              <p v-if="gridData" class="mt-1 text-xs text-gray-500">
                <template v-if="gridData.active_semester">
                  {{ $t('gradedMarksGrid.activeSemester') }}:
                  {{ gridData.active_semester.title }}
                  ·
                </template>
                {{ $t('gradedMarksGrid.courseTotalMarks') }}: {{ gridData.total_marks }}
                · {{ $t('gradedMarksGrid.enterByCriteria') }}
              </p>
              </div>
            </div>
            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="savingMarks || loadingGrid || !gridData?.criteria?.length"
                @click="saveMarks"
              >
                {{ savingMarks ? $t('gradedMarksGrid.saving') : $t('gradedMarksGrid.saveMarks') }}
              </button>
            </div>
          </header>
          <div v-if="gridError" class="px-5 py-3 sm:px-6">
            <p class="fk-alert fk-alert--error">{{ gridError }}</p>
          </div>
        </div>

        <div v-if="loadingGrid" class="flex justify-center rounded-2xl border border-gray-200/80 bg-white py-16">
          <FikrLoader />
        </div>

        <div
          v-else-if="gridData && !gridData.active_semester"
          class="fk-card px-6 py-12 text-center"
        >
          <p class="text-sm font-semibold text-gray-800">{{ $t('gradedMarksGrid.noActiveSemester') }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ $t('gradedMarksGrid.noActiveSemesterHint') }}</p>
        </div>

        <div
          v-else-if="gridData && !gridData.criteria?.length"
          class="fk-card px-6 py-12 text-center"
        >
          <p class="text-sm font-semibold text-gray-800">{{ $t('gradedMarksGrid.noCriteriaForActiveSemester') }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ $t('gradedMarksGrid.noCriteriaForActiveSemesterHint') }}</p>
        </div>

        <div v-else-if="gridData" class="fk-elev overflow-visible p-0">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">
                {{
                  gridData.active_semester?.title
                    || $t('gradedMarksGrid.enterByCriteria')
                }}
              </h2>
              <p class="fk-card__meta">
                {{ gradedTotal }} · {{ $t('common.students') }}
              </p>
            </div>
          </header>
          <div class="p-6">
          <!-- Mobile -->
          <div class="block sm:hidden divide-y divide-gray-100">
            <div v-for="student in paginatedStudents" :key="student.id" class="p-4">
              <div class="mb-3 flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                  <span class="text-sm font-medium text-primary-800">{{ student.name.charAt(0) }}</span>
                </div>
                <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(group, semKey) in criteriaBySemester"
                  :key="`m-${student.id}-${semKey}`"
                  class="rounded-lg border border-gray-100 bg-gray-50/60 p-3"
                >
                  <div class="mb-2 text-xs font-semibold text-gray-700">{{ group.title }}</div>
                  <div class="space-y-2">
                    <div v-for="c in group.criteria" :key="c.id" class="flex items-center gap-2">
                      <label class="min-w-0 flex-1 truncate text-xs text-gray-600" :title="c.label">
                        {{ c.label }}
                        <span class="text-gray-400">({{ c.max_marks }})</span>
                      </label>
                      <input
                        :value="marksLocal[markKey(student.id, c.id)] || ''"
                        type="text"
                        inputmode="decimal"
                        class="fk-field fk-field--sm w-20 shrink-0 text-center tabular-nums"
                        :placeholder="`0–${c.max_marks}`"
                        :aria-label="`${student.name} — ${c.label}`"
                        @input="onMarkInput(student.id, c.id, ($event.target as HTMLInputElement).value)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop -->
          <div class="hidden overflow-x-auto sm:block">
            <table class="w-full min-w-max text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    rowspan="2"
                    class="sticky start-0 z-20 min-w-[160px] border-b border-gray-200 bg-gray-50 px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {{ $t('progressTracking.studentName') }}
                  </th>
                  <th
                    v-for="(group, semKey) in criteriaBySemester"
                    :key="'sem-' + semKey"
                    :colspan="group.criteria.length"
                    class="border-b border-l border-gray-200 px-2 py-2 text-center text-xs font-semibold text-gray-700"
                  >
                    {{ group.title }}
                  </th>
                  <th rowspan="2" class="border-b border-l border-gray-200 bg-emerald-50/80 px-3 py-3 text-center text-xs font-semibold text-emerald-800">
                    {{ $t('gradedMarksGrid.total') }}
                  </th>
                </tr>
                <tr>
                  <th
                    v-for="c in gridData.criteria"
                    :key="c.id"
                    class="min-w-[96px] border-b border-l border-gray-200 px-2 py-2 text-center text-[11px] font-medium text-gray-600"
                    :title="c.label"
                  >
                    <div class="mx-auto max-w-[110px] truncate">{{ c.label }}</div>
                    <div class="mt-0.5 text-[10px] font-normal text-gray-400">/ {{ c.max_marks }}</div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="student in paginatedStudents" :key="student.id" class="hover:bg-primary-50/20">
                  <td class="sticky start-0 z-10 whitespace-nowrap border-r border-gray-100 bg-white px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                        <span class="text-sm font-medium text-primary-800">{{ student.name.charAt(0) }}</span>
                      </div>
                      <span class="font-medium text-gray-900">{{ student.name }}</span>
                    </div>
                  </td>
                  <td
                    v-for="c in gridData.criteria"
                    :key="`${student.id}-${c.id}`"
                    class="border-l border-gray-50 px-2 py-2 text-center"
                  >
                    <input
                      :value="marksLocal[markKey(student.id, c.id)] || ''"
                      type="text"
                      inputmode="decimal"
                      class="fk-field fk-field--sm mx-auto max-w-[88px] text-center tabular-nums"
                      :placeholder="'—'"
                      :aria-label="`${student.name} — ${c.label}`"
                      @input="onMarkInput(student.id, c.id, ($event.target as HTMLInputElement).value)"
                    />
                  </td>
                  <td class="border-l border-emerald-100 bg-emerald-50/40 px-3 py-2 text-center font-semibold tabular-nums text-emerald-900">
                    {{ rowTotal(student.id) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="!gradedTotal"
            class="flex min-h-[12rem] flex-col items-center justify-center px-6 py-12 text-center"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-800">{{ $t('gradedMarksGrid.noStudents') }}</p>
          </div>

          <FikrPagination
            :page="gradedPage"
            :pages="gradedTotalPages"
            :show="gradedTotal > 0"
            @update:page="goToGradedPage"
          />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFeedback } from '@/composables/useFeedback'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { useServerPagination } from '@/composables/useServerPagination'
import { useListViewMode } from '@/composables/useListViewMode'
import authService from '@/services/auth.service'
import gradedCriterionMarksService, {
  type CriterionMarksGridData,
} from '@/services/graded-criterion-marks.service'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const currentUser = ref(authService.getStoredUser())
const schoolId = computed(() => String(currentUser.value?.school_id ?? ''))

type GroupRow = {
  id: string
  name: string
  ageGroup: string
  studentsCount: number
  gradedCoursesCount: number
}

const selectedGroup = ref<GroupRow | null>(null)
const {
  items: paginatedGroups,
  total: groupsTotal,
  loading: loadingGroups,
  currentPage: groupsPage,
  totalPages: groupsTotalPages,
  goToPage: goToGroupsPage,
} = useServerPagination<GroupRow, { school_id: string }>(
  async (params) => {
    const page = await gradedCriterionMarksService.listGroups({
      schoolId: params.school_id,
      page: params.page,
      limit: params.limit,
    })
    return {
      ...page,
      items: (page.items || []).map((group) => ({
        id: group.id,
        name: group.name,
        ageGroup: formatGroupAgeRangeLabel(
          group.age_range_min,
          group.age_range_max,
          t('groupManagement.years'),
        ),
        studentsCount: group.studentsCount,
        gradedCoursesCount: group.gradedCoursesCount,
      })),
    }
  },
  { filters: () => ({ school_id: schoolId.value }) },
)

type CourseRow = {
  id: string
  title: string
  time: string
  day: string
  criteriaCount: number | null
}

const selectedCourse = ref<CourseRow | null>(null)
const {
  items: paginatedCourses,
  total: coursesTotal,
  loading: loadingCourses,
  currentPage: coursesPage,
  totalPages: coursesTotalPages,
  goToPage: goToCoursesPage,
} = useServerPagination<CourseRow, { school_id: string; group_id: string }>(
  (params) =>
    gradedCriterionMarksService.listGroupCourses({
      schoolId: params.school_id,
      groupId: params.group_id,
      page: params.page,
      limit: params.limit,
    }),
  {
    filters: () => ({
      school_id: schoolId.value,
      group_id: selectedGroup.value?.id || '',
    }),
    enabled: () => Boolean(selectedGroup.value?.id),
  },
)

const gridData = ref<CriterionMarksGridData | null>(null)
const marksLocal = ref<Record<string, string>>({})
/** Edits kept across student pages so save does not clear marks off the current page. */
const dirtyMarks = ref<Record<string, string>>({})
const serverMarks = ref<Record<string, string | null>>({})
const gridError = ref('')
const savingMarks = ref(false)
let gridRequest = 0

const {
  items: paginatedStudents,
  total: gradedTotal,
  loading: loadingGrid,
  currentPage: gradedPage,
  totalPages: gradedTotalPages,
  goToPage: goToGradedPage,
  reload: reloadMarksGrid,
} = useServerPagination<CriterionMarksGridData['students'][number], { school_id: string; group_id: string; course_id: string }>(
  async (params) => {
    const seq = ++gridRequest
    const data = await gradedCriterionMarksService.getGrid({
      schoolId: params.school_id,
      groupId: params.group_id,
      courseId: params.course_id,
      page: params.page,
      limit: params.limit,
    })
    if (seq !== gridRequest) {
      return { items: [], total: 0, page: params.page, limit: params.limit, pages: 1 }
    }
    gridData.value = data
    serverMarks.value = { ...serverMarks.value, ...(data.marks || {}) }
    const next: Record<string, string> = {}
    for (const student of data.students || []) {
      for (const criterion of data.criteria || []) {
        const key = markKey(student.id, criterion.id)
        const dirty = dirtyMarks.value[key]
        const saved = data.marks?.[key]
        next[key] = dirty != null ? dirty : saved == null || saved === '' ? '' : String(saved)
      }
    }
    marksLocal.value = next
    const students = data.items ?? data.students ?? []
    return {
      items: students,
      total: data.total ?? students.length,
      page: data.page ?? params.page,
      limit: data.limit ?? params.limit,
      pages: data.pages ?? 1,
    }
  },
  {
    filters: () => ({
      school_id: schoolId.value,
      group_id: selectedGroup.value?.id || '',
      course_id: selectedCourse.value?.id || '',
    }),
    enabled: () => Boolean(selectedGroup.value?.id && selectedCourse.value?.id),
    onError: (err) => {
      gridData.value = null
      gridError.value = apiErrorText(err, t('gradedMarksGrid.loadFailed'))
    },
  },
)

const marksHeaderSubtitle = computed(() => {
  if (!selectedGroup.value) return t('gradedMarksGrid.selectGroup')
  if (!selectedCourse.value) return `${selectedGroup.value.name} — ${t('gradedMarksGrid.selectCourse')}`
  return `${selectedGroup.value.name} — ${selectedCourse.value.title}`
})

const criteriaBySemester = computed(() => {
  const map: Record<string, { title: string; criteria: CriterionMarksGridData['criteria'] }> = {}
  if (!gridData.value) return map
  for (const c of gridData.value.criteria) {
    const key = String(c.semester_index)
    if (!map[key]) {
      const label =
        c.semester_title ||
        `${t('gradedMarksGrid.semester')} ${c.semester_index + 1}`
      map[key] = { title: label, criteria: [] }
    }
    map[key].criteria.push(c)
  }
  return map
})

function markKey(studentId: string, criterionId: string) {
  return `${studentId}:::${criterionId}`
}

function parseMarkInput(raw: string): number | null {
  const s = String(raw ?? '').trim()
  if (!s) return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function rowTotal(studentId: string): string {
  if (!gridData.value) return '—'
  let sum = 0
  let any = false
  for (const c of gridData.value.criteria) {
    const n = parseMarkInput(marksLocal.value[markKey(studentId, c.id)] ?? '')
    if (n != null) {
      sum += n
      any = true
    }
  }
  return any ? String(Math.round(sum * 100) / 100) : '—'
}

function formatDay(day: string) {
  const key = `scheduleManagement.days.${String(day || '').toLowerCase()}`
  const tr = t(key)
  return tr === key ? day : tr
}

function resetGrid() {
  gridData.value = null
  marksLocal.value = {}
  dirtyMarks.value = {}
  serverMarks.value = {}
  gridError.value = ''
}

function selectGroup(group: GroupRow) {
  resetGrid()
  selectedCourse.value = null
  selectedGroup.value = group
}

function selectCourse(course: CourseRow) {
  resetGrid()
  selectedCourse.value = course
}

function goBack() {
  if (selectedCourse.value) {
    selectedCourse.value = null
    resetGrid()
    return
  }
  if (selectedGroup.value) {
    selectedGroup.value = null
  }
}

function onMarkInput(studentId: string, criterionId: string, value: string) {
  const key = markKey(studentId, criterionId)
  marksLocal.value = { ...marksLocal.value, [key]: value }
  dirtyMarks.value = { ...dirtyMarks.value, [key]: value }
}

function apiErrorText(error: unknown, fallback: string): string {
  const ax = error as { response?: { data?: { message?: string | string[] } } }
  const raw = ax.response?.data?.message
  if (Array.isArray(raw)) {
    const text = raw.map((part) => String(part)).filter(Boolean).join(' ')
    if (text) return text
  } else if (typeof raw === 'string' && raw.trim()) {
    return raw.trim()
  }
  return fallback
}

function storedMark(studentId: string, criterionId: string): number | null {
  const raw = serverMarks.value[markKey(studentId, criterionId)]
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

async function saveMarks() {
  if (!selectedGroup.value || !selectedCourse.value || !gridData.value) return
  savingMarks.value = true
  gridError.value = ''
  try {
    const criteriaById = new Map(gridData.value.criteria.map((criterion) => [criterion.id, criterion]))
    const entries: { student_id: string; graded_criterion_id: string; mark: number | null }[] = []
    for (const [key, raw] of Object.entries(dirtyMarks.value)) {
      const splitAt = key.indexOf(':::')
      if (splitAt < 0) continue
      const studentId = key.slice(0, splitAt)
      const criterionId = key.slice(splitAt + 3)
      const criterion = criteriaById.get(criterionId)
      const next = parseMarkInput(raw)
      if (criterion) {
        const maxMarks = Number(criterion.max_marks)
        if (next != null && (next < 0 || next > maxMarks + 0.001)) {
          gridError.value = t('gradedMarksGrid.markOutOfRange', { label: criterion.label, max: criterion.max_marks })
          return
        }
      }
      const prev = storedMark(studentId, criterionId)
      if (next === prev) continue
      entries.push({
        student_id: studentId,
        graded_criterion_id: criterionId,
        mark: next,
      })
    }
    if (entries.length) {
      await gradedCriterionMarksService.saveGrid(schoolId.value, {
        group_id: selectedGroup.value.id,
        course_id: selectedCourse.value.id,
        entries,
      })
    }
    feedback.saved(t('gradedMarksGrid.savedOk'))
    dirtyMarks.value = {}
    serverMarks.value = {}
    await reloadMarksGrid()
  } catch (e: unknown) {
    gridError.value = apiErrorText(e, t('gradedMarksGrid.saveFailed'))
  } finally {
    savingMarks.value = false
  }
}
</script>
