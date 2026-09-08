<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('gradedMarksGrid.title')"
        :subtitle="marksHeaderSubtitle"
      >
        <template v-if="selectedGroup" #leading>
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

      <!-- Step 1: groups -->
      <div v-if="!selectedGroup" class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('progressTracking.selectGroup') }}</h2>
            <p v-if="!loadingGroups" class="fk-card__meta">
              {{ $t('progressTracking.groupsCount', { count: teacherGroups.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>
        <div class="p-6">
          <div v-if="loadingGroups" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>
          <div v-else-if="teacherGroups.length && isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="group in teacherGroups"
              :key="group.id"
              type="button"
              class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-start shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              @click="selectGroup(group)"
            >
              <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" />
              <div class="flex flex-1 flex-col p-5">
                <div class="flex items-start gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900 group-hover:text-primary-800">{{ group.name }}</h3>
                    <span
                      v-if="group.ageGroup"
                      class="mt-1.5 inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 ring-1 ring-teal-100"
                    >{{ group.ageGroup }}</span>
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 ring-1 ring-sky-100">
                    <span class="tabular-nums text-sm">{{ group.studentsCount }}</span>
                    {{ $t('progressTracking.students') }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    <span class="tabular-nums text-sm">{{ group.gradedCoursesCount }}</span>
                    {{ $t('gradedMarksGrid.gradedCourses') }}
                  </span>
                </div>
              </div>
              <div class="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
                <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                  {{ $t('progressTracking.openGroup') }}
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          </div>
          <div v-else-if="teacherGroups.length" class="overflow-x-auto rounded-xl border border-gray-200/80">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.groupName') }}</th>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.students') }}</th>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('gradedMarksGrid.gradedCourses') }}</th>
                  <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="group in teacherGroups"
                  :key="'list-' + group.id"
                  class="cursor-pointer hover:bg-primary-50/20"
                  @click="selectGroup(group)"
                >
                  <td class="px-4 py-3 font-medium text-gray-900">{{ group.name }}</td>
                  <td class="px-4 py-3 tabular-nums">{{ group.studentsCount }}</td>
                  <td class="px-4 py-3 tabular-nums">{{ group.gradedCoursesCount }}</td>
                  <td class="px-4 py-3 text-end text-primary-700 font-semibold">{{ $t('common.open') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-16 text-center text-sm text-gray-500">{{ $t('progressTracking.noGroups') }}</div>
        </div>
      </div>

      <!-- Step 2: graded courses -->
      <div v-else-if="selectedGroup && !selectedCourse" class="fk-card">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('gradedMarksGrid.selectCourse') }}</h2>
            <p class="fk-card__meta">{{ selectedGroup.name }}</p>
          </div>
          <button type="button" class="text-sm font-medium text-primary-700 hover:text-primary-900" @click="selectedGroup = null">
            {{ $t('progressTracking.changeGroup') }}
          </button>
        </div>
        <div class="p-6">
          <div v-if="loadingCourses" class="flex justify-center py-12">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
          <div v-else-if="!groupGradedCourses.length" class="flex min-h-[12rem] flex-col items-center justify-center px-6 py-12 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.26 10.147a60.438 60.438 0 0016.48 0M4.26 10.147l-.955 4.605M4.26 10.147l4.605-.955M19.74 10.147l.955 4.605M19.74 10.147l-4.605-.955M12 4.5v15" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-800">{{ $t('gradedMarksGrid.noGradedCourses') }}</p>
          </div>
          <div v-else class="grid gap-4 sm:grid-cols-2">
            <button
              v-for="course in groupGradedCourses"
              :key="course.id"
              type="button"
              class="group rounded-2xl border border-gray-200/80 bg-white p-5 text-start shadow-sm transition hover:border-primary-200 hover:shadow-md"
              @click="selectCourse(course)"
            >
              <h3 class="font-semibold text-gray-900 group-hover:text-primary-800">{{ course.title }}</h3>
              <p class="mt-1 text-xs text-gray-500">{{ course.time }} · {{ formatDay(course.day) }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800 ring-1 ring-primary-100">
                  {{ $t('gradedCourses.title') }}
                </span>
                <span v-if="course.criteriaCount != null" class="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-100">
                  {{ course.criteriaCount }} {{ $t('gradedCourses.criteria') }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: marks grid — students × criteria -->
      <div v-else class="space-y-4 sm:space-y-6">
        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ selectedCourse?.title }}</h2>
              <p class="fk-card__meta">{{ selectedGroup?.name }}</p>
              <p v-if="gridData" class="mt-1 text-xs text-gray-500">
                {{ $t('gradedMarksGrid.courseTotalMarks') }}: {{ gridData.total_marks }}
                · {{ $t('gradedMarksGrid.enterByCriteria') }}
              </p>
            </div>
            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <button type="button" class="text-sm font-medium text-primary-700 hover:text-primary-900" @click="selectedCourse = null; resetGrid()">
                {{ $t('gradedMarksGrid.changeCourse') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="savingMarks || loadingGrid"
                @click="saveMarks"
              >
                {{ savingMarks ? $t('gradedMarksGrid.saving') : $t('gradedMarksGrid.saveMarks') }}
              </button>
            </div>
          </header>
          <div v-if="gridError || saveOk" class="px-5 py-3 sm:px-6">
            <p v-if="gridError" class="fk-alert fk-alert--error">{{ gridError }}</p>
            <p v-if="saveOk" class="text-sm text-emerald-700">{{ $t('gradedMarksGrid.savedOk') }}</p>
          </div>
        </div>

        <div v-if="loadingGrid" class="flex justify-center rounded-2xl border border-gray-200/80 bg-white py-16">
          <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>

        <div v-else-if="gridData" class="fk-card overflow-visible">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('gradedMarksGrid.enterByCriteria') }}</h2>
              <p class="fk-card__meta">
                {{ gridData.students?.length || 0 }} · {{ $t('common.students') }}
              </p>
            </div>
          </header>
          <!-- Mobile -->
          <div class="block sm:hidden divide-y divide-gray-100">
            <div v-for="student in gridData.students" :key="student.id" class="p-4">
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
                        v-model="marksLocal[markKey(student.id, c.id)]"
                        type="text"
                        inputmode="decimal"
                        class="fk-field fk-field--sm w-20 shrink-0 text-center tabular-nums"
                        :placeholder="`0–${c.max_marks}`"
                        :aria-label="`${student.name} — ${c.label}`"
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
                <tr v-for="student in gridData.students" :key="student.id" class="hover:bg-primary-50/20">
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
                      v-model="marksLocal[markKey(student.id, c.id)]"
                      type="text"
                      inputmode="decimal"
                      class="fk-field fk-field--sm mx-auto max-w-[88px] text-center tabular-nums"
                      :placeholder="'—'"
                      :aria-label="`${student.name} — ${c.label}`"
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
            v-if="!gridData.students.length"
            class="flex min-h-[12rem] flex-col items-center justify-center px-6 py-12 text-center"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-800">{{ $t('gradedMarksGrid.noStudents') }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { scheduleService } from '@/services/schedule.service'
import authService from '@/services/auth.service'
import { groupService } from '@/services/group.service'
import gradedAssessmentService from '@/services/graded-assessment.service'
import gradedCriterionMarksService, {
  type CriterionMarksGridData,
} from '@/services/graded-criterion-marks.service'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const currentUser = ref(authService.getStoredUser())
const schoolId = computed(() => currentUser.value?.school_id ?? 1)
const loadingGroups = ref(false)

type GroupRow = {
  id: string
  name: string
  ageGroup: string
  studentsCount: number
  gradedCoursesCount: number
}

const teacherGroups = ref<GroupRow[]>([])
const selectedGroup = ref<GroupRow | null>(null)

type CourseRow = {
  id: string
  title: string
  time: string
  day: string
  criteriaCount: number | null
}

const groupGradedCourses = ref<CourseRow[]>([])
const loadingCourses = ref(false)
const selectedCourse = ref<CourseRow | null>(null)

const gridData = ref<CriterionMarksGridData | null>(null)
const marksLocal = ref<Record<string, string>>({})
const loadingGrid = ref(false)
const gridError = ref('')
const savingMarks = ref(false)
const saveOk = ref(false)

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
  gridError.value = ''
  saveOk.value = false
}

const mapGroupToRow = (group: {
  id: string
  name: string
  age_range_min?: number
  age_range_max?: number
  students?: unknown[]
}): GroupRow => ({
  id: group.id,
  name: group.name,
  ageGroup: formatGroupAgeRangeLabel(
    group.age_range_min,
    group.age_range_max,
    t('groupManagement.years'),
  ),
  studentsCount: group.students ? group.students.length : 0,
  gradedCoursesCount: 0,
})

async function countGradedCoursesForGroup(groupId: string): Promise<number> {
  const schedules = await scheduleService.getSchedulesByGroup(groupId)
  let rows = schedules.filter((s) => s.course_id && s.course?.course_kind === 'graded')
  if (currentUser.value?.role === 'teacher' && currentUser.value?.id) {
    rows = rows.filter((s) => s.teacher_id === currentUser.value!.id)
  }
  return new Set(rows.map((s) => s.course_id)).size
}

async function loadGroups() {
  currentUser.value = authService.getStoredUser()
  loadingGroups.value = true
  try {
    if (!currentUser.value) {
      teacherGroups.value = []
      return
    }
    if (currentUser.value.role === 'admin') {
      const all = await groupService.getAll()
      teacherGroups.value = all.map(mapGroupToRow)
    } else if (currentUser.value.role === 'teacher' && currentUser.value.id) {
      const assigned = await scheduleService.getGroupsForTeacher(currentUser.value.id)
      teacherGroups.value = assigned.map(mapGroupToRow)
    } else {
      teacherGroups.value = []
    }
    await Promise.all(
      teacherGroups.value.map(async (row) => {
        row.gradedCoursesCount = await countGradedCoursesForGroup(row.id)
      }),
    )
  } catch {
    teacherGroups.value = []
  } finally {
    loadingGroups.value = false
  }
}

async function selectGroup(group: GroupRow) {
  selectedGroup.value = group
  selectedCourse.value = null
  resetGrid()
  loadingCourses.value = true
  try {
    const schedules = await scheduleService.getSchedulesByGroup(group.id)
    let rows = schedules.filter((s) => s.course_id && s.course?.course_kind === 'graded')
    if (currentUser.value?.role === 'teacher' && currentUser.value?.id) {
      rows = rows.filter((s) => s.teacher_id === currentUser.value!.id)
    }
    const map = new Map<string, CourseRow>()
    for (const s of rows) {
      const cid = s.course_id as string
      if (map.has(cid)) continue
      map.set(cid, {
        id: cid,
        title: s.course?.name || s.course?.title || 'Course',
        time: `${s.start_time} – ${s.end_time}`,
        day: s.day_of_week,
        criteriaCount: null,
      })
    }
    groupGradedCourses.value = [...map.values()]
    await Promise.all(
      groupGradedCourses.value.map(async (c) => {
        try {
          const g = await gradedAssessmentService.getByCourseId(c.id, schoolId.value)
          c.criteriaCount =
            g.graded_scheme?.semesters?.reduce(
              (acc, sem) => acc + (sem.criteria?.length || 0),
              0,
            ) ?? 0
        } catch {
          c.criteriaCount = 0
        }
      }),
    )
  } finally {
    loadingCourses.value = false
  }
}

async function selectCourse(course: CourseRow) {
  selectedCourse.value = course
  await loadMarksGrid()
}

async function loadMarksGrid() {
  if (!selectedGroup.value || !selectedCourse.value) return
  loadingGrid.value = true
  gridError.value = ''
  saveOk.value = false
  try {
    const data = await gradedCriterionMarksService.getGrid({
      schoolId: schoolId.value,
      groupId: selectedGroup.value.id,
      courseId: selectedCourse.value.id,
    })
    gridData.value = data
    const next: Record<string, string> = {}
    for (const s of data.students) {
      for (const c of data.criteria) {
        const k = markKey(s.id, c.id)
        const v = data.marks[k]
        next[k] = v == null || v === '' ? '' : String(v)
      }
    }
    marksLocal.value = next
  } catch (e: unknown) {
    gridData.value = null
    gridError.value = (e as { message?: string })?.message || t('gradedMarksGrid.loadFailed')
  } finally {
    loadingGrid.value = false
  }
}

watch(
  () => [selectedCourse.value?.id, selectedGroup.value?.id],
  () => {
    if (selectedCourse.value && selectedGroup.value) void loadMarksGrid()
  },
)

function goBack() {
  if (selectedCourse.value) {
    selectedCourse.value = null
    resetGrid()
    return
  }
  if (selectedGroup.value) {
    selectedGroup.value = null
    groupGradedCourses.value = []
  }
}

async function saveMarks() {
  if (!selectedGroup.value || !selectedCourse.value || !gridData.value) return
  savingMarks.value = true
  gridError.value = ''
  saveOk.value = false
  try {
    const entries = []
    for (const s of gridData.value.students) {
      for (const c of gridData.value.criteria) {
        entries.push({
          student_id: s.id,
          graded_criterion_id: c.id,
          mark: parseMarkInput(marksLocal.value[markKey(s.id, c.id)] ?? ''),
        })
      }
    }
    await gradedCriterionMarksService.saveGrid(schoolId.value, {
      group_id: selectedGroup.value.id,
      course_id: selectedCourse.value.id,
      entries,
    })
    saveOk.value = true
    await loadMarksGrid()
  } catch (e: unknown) {
    gridError.value = (e as { message?: string })?.message || t('gradedMarksGrid.saveFailed')
  } finally {
    savingMarks.value = false
  }
}

void loadGroups()
</script>
