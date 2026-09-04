<template>
  <DashboardLayout>
    <!-- Header (aligned with /progress teacher dashboard) -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div class="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse">
          <div class="bg-white/20 p-2 sm:p-3 rounded-full">
            <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 8a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 13.586V10z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold">{{ $t('gradedMarksGrid.title') }}</h1>
            <p v-if="!selectedGroup" class="text-primary-100 text-sm sm:text-base">{{ $t('gradedMarksGrid.selectGroup') }}</p>
            <p v-else-if="!selectedCourse" class="text-primary-100 text-sm sm:text-base">{{ selectedGroup.name }} — {{ $t('gradedMarksGrid.selectCourse') }}</p>
            <p v-else-if="!selectedCriterion" class="text-primary-100 text-sm sm:text-base">{{ selectedGroup.name }} — {{ selectedCourse.title }}</p>
            <p v-else class="text-primary-100 text-sm sm:text-base">
              {{ selectedGroup.name }} — {{ selectedCourse.title }} — {{ selectedCriterion.label }}
            </p>
          </div>
        </div>
        <div v-if="selectedGroup && (selectedCourse || selectedCriterion)" class="flex space-x-2 rtl:space-x-reverse">
          <button type="button" class="bg-white/20 hover:bg-white/30 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base" @click="goBack">
            {{ $t('common.back') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Step 1: groups -->
    <div v-if="!selectedGroup" class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4">{{ $t('progressTracking.selectGroup') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div
          v-for="group in teacherGroups"
          :key="group.id"
          class="group relative overflow-hidden border-2 border-gray-200 hover:border-primary-500 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white to-gray-50"
          @click="selectGroup(group)"
        >
          <div class="absolute inset-0 opacity-5 bg-gradient-to-br from-primary-500 to-primary-600" />
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3 rtl:space-x-reverse">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 text-base sm:text-lg">{{ group.name }}</h3>
                  <span v-if="group.ageGroup" class="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full mt-1">{{ group.ageGroup }}</span>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/70 rounded-lg p-3 border border-gray-100">
                <p class="text-lg font-bold text-gray-800">{{ group.studentsCount }}</p>
                <p class="text-xs text-gray-600">{{ $t('progressTracking.students') }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-gray-100">
                <p class="text-lg font-bold text-gray-800">{{ group.gradedCoursesCount }}</p>
                <p class="text-xs text-gray-600">{{ $t('gradedMarksGrid.gradedCourses') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: graded courses on timetable -->
    <div v-else-if="selectedGroup && !selectedCourse" class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800">{{ $t('gradedMarksGrid.selectCourse') }}</h2>
        <button type="button" class="text-primary-600 hover:text-primary-800 text-sm" @click="selectedGroup = null">
          {{ $t('progressTracking.changeGroup') }}
        </button>
      </div>
      <div v-if="loadingCourses" class="flex justify-center py-12">
        <div class="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full" />
      </div>
      <div v-else-if="!groupGradedCourses.length" class="text-center py-12 text-gray-500">
        {{ $t('gradedMarksGrid.noGradedCourses') }}
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div
          v-for="course in groupGradedCourses"
          :key="course.id"
          class="group border-2 border-gray-200 hover:border-primary-500 rounded-xl p-4 sm:p-6 cursor-pointer transition-all hover:shadow-xl bg-gradient-to-br from-white via-gray-50 to-white"
          @click="selectCourse(course)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3 rtl:space-x-reverse">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800 text-base sm:text-lg">{{ course.title }}</h3>
                <span class="text-xs text-gray-500">{{ course.time }} · {{ formatDay(course.day) }}</span>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">{{ $t('gradedCourses.title') }}</span>
            <span v-if="course.criteriaCount != null" class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {{ course.criteriaCount }} {{ $t('gradedCourses.criteria') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: criteria -->
    <div v-else-if="selectedGroup && selectedCourse && !selectedCriterion" class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800">{{ $t('gradedMarksGrid.selectCriterion') }}</h2>
        <button type="button" class="text-primary-600 hover:text-primary-800 text-sm" @click="selectedCourse = null">
          {{ $t('gradedMarksGrid.changeCourse') }}
        </button>
      </div>
      <div v-if="loadingCriteria" class="flex justify-center py-12">
        <div class="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full" />
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div
          v-for="c in criteriaList"
          :key="c.id"
          class="border-2 border-gray-200 hover:border-primary-500 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
          @click="selectCriterion(c)"
        >
          <h3 class="font-semibold text-gray-900">{{ c.label }}</h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('gradedMarksGrid.semester') }} {{ c.semester_index + 1 }}
            <span v-if="c.semester_title">— {{ c.semester_title }}</span>
          </p>
          <p class="text-sm text-gray-600 mt-2">{{ $t('gradedCourses.pointsShortLabel') }}: {{ c.max_marks }}</p>
        </div>
      </div>
    </div>

    <!-- Step 4: marks grid -->
    <div v-else class="space-y-4 sm:space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ gridMeta.criterion_label }}</h2>
            <p class="text-sm text-gray-600">{{ selectedGroup.name }} · {{ selectedCourse.title }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ $t('gradedCourses.pointsShortLabel') }} ({{ $t('gradedMarksGrid.criterionWeight') }}): {{ gridMeta.criterion_max_marks }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="text-primary-600 hover:text-primary-800 text-sm"
              @click="selectedCriterion = null; gridData = null; marksLocal = {}"
            >
              {{ $t('gradedMarksGrid.changeCriterion') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="savingMarks"
              @click="saveMarks"
            >
              {{ savingMarks ? $t('gradedMarksGrid.saving') : $t('gradedMarksGrid.saveMarks') }}
            </button>
          </div>
        </div>
        <p v-if="gridError" class="mt-3 text-sm text-red-600">{{ gridError }}</p>
      </div>

      <div v-if="loadingGrid" class="bg-white rounded-lg shadow-sm p-12 flex justify-center">
        <div class="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full" />
      </div>

      <div v-else-if="gridData" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Mobile -->
        <div class="block sm:hidden divide-y divide-gray-200">
          <div v-for="student in gridData.students" :key="student.id" class="p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                <span class="text-sm font-medium text-primary-800">{{ student.name.charAt(0) }}</span>
              </div>
              <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
            </div>
            <div class="grid grid-cols-1 gap-2">
              <div v-for="task in gridData.tasks" :key="task.id" class="flex items-center gap-2">
                <label class="text-xs text-gray-600 flex-1 min-w-0 truncate" :title="taskLabel(task)">{{ taskLabel(task) }}</label>
                <input
                  v-model="marksLocal[markKey(student.id, task.id)]"
                  type="number"
                  step="0.01"
                  class="w-24 shrink-0 rounded-md border border-gray-300 px-2 py-1 text-sm text-center"
                  placeholder="—"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[140px]">
                  {{ $t('progressTracking.studentName') }}
                </th>
                <th
                  v-for="task in gridData.tasks"
                  :key="task.id"
                  class="px-2 py-3 text-center text-xs font-medium text-gray-500 border-l border-gray-200 min-w-[100px]"
                >
                  <div class="truncate max-w-[120px]" :title="taskLabel(task)">{{ taskLabel(task) }}</div>
                  <div v-if="task.due_date" class="text-[10px] text-gray-400 font-normal mt-0.5">{{ task.due_date }}</div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="student in gridData.students" :key="student.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                      <span class="text-sm font-medium text-primary-800">{{ student.name.charAt(0) }}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ student.name }}</span>
                  </div>
                </td>
                <td v-for="task in gridData.tasks" :key="`${student.id}-${task.id}`" class="px-2 py-2 text-center border-l border-gray-100">
                  <input
                    v-model="marksLocal[markKey(student.id, task.id)]"
                    type="number"
                    step="0.01"
                    class="w-full max-w-[96px] mx-auto rounded-md border border-gray-300 px-2 py-1.5 text-sm text-center"
                    placeholder="—"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { scheduleService } from '@/services/schedule.service'
import authService from '@/services/auth.service'
import { groupService } from '@/services/group.service'
import gradedAssessmentService from '@/services/graded-assessment.service'
import gradedCriterionTaskService, { type MarksGridData } from '@/services/graded-criterion-task.service'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'

const { t } = useI18n()

const currentUser = ref<ReturnType<typeof authService.getStoredUser>>(null)
const schoolId = computed(() => currentUser.value?.school_id ?? 1)

const teacherGroups = ref<
  Array<{
    id: string
    name: string
    ageGroup: string
    studentsCount: number
    gradedCoursesCount: number
  }>
>([])

const selectedGroup = ref<(typeof teacherGroups.value)[0] | null>(null)
const groupGradedCourses = ref<
  Array<{
    id: string
    title: string
    time: string
    day: string
    criteriaCount: number | null
  }>
>([])
const loadingCourses = ref(false)

const selectedCourse = ref<(typeof groupGradedCourses.value)[0] | null>(null)
const criteriaList = ref<
  Array<{
    id: string
    label: string
    max_marks: string
    semester_index: number
    semester_title: string | null
  }>
>([])
const loadingCriteria = ref(false)

const selectedCriterion = ref<(typeof criteriaList.value)[0] | null>(null)

const gridData = ref<MarksGridData | null>(null)
const gridMeta = computed(() => gridData.value || { criterion_label: '', criterion_max_marks: '' })
const marksLocal = ref<Record<string, string>>({})
const loadingGrid = ref(false)
const gridError = ref('')
const savingMarks = ref(false)

function markKey(studentId: string, taskId: string) {
  return `${studentId}:::${taskId}`
}

function taskLabel(task: { description: string | null; sort_order: number }) {
  const d = (task.description || '').trim()
  if (d) return d
  return `${t('gradedMarksGrid.task')} ${task.sort_order + 1}`
}

function formatDay(day: string) {
  const key = `scheduleManagement.days.${String(day || '').toLowerCase()}`
  const tr = t(key)
  return tr === key ? day : tr
}

const mapGroupToRow = (group: { id: string; name: string; age_range_min?: number; age_range_max?: number; students?: unknown[] }) => ({
  id: group.id,
  name: group.name,
  ageGroup: formatGroupAgeRangeLabel(group.age_range_min, group.age_range_max, t('groupManagement.years')),
  studentsCount: group.students ? group.students.length : 0,
  gradedCoursesCount: 0,
})

async function loadGroups() {
  currentUser.value = authService.getStoredUser()
  if (!currentUser.value) {
    teacherGroups.value = []
    return
  }
  try {
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
  }
}

async function countGradedCoursesForGroup(groupId: string): Promise<number> {
  const schedules = await scheduleService.getSchedulesByGroup(groupId)
  let rows = schedules.filter((s) => s.course_id && s.course?.course_kind === 'graded')
  if (currentUser.value?.role === 'teacher' && currentUser.value?.id) {
    rows = rows.filter((s) => s.teacher_id === currentUser.value!.id)
  }
  return new Set(rows.map((s) => s.course_id)).size
}

async function selectGroup(group: (typeof teacherGroups.value)[0]) {
  selectedGroup.value = group
  loadingCourses.value = true
  gridError.value = ''
  try {
    const schedules = await scheduleService.getSchedulesByGroup(group.id)
    let rows = schedules.filter((s) => s.course_id && s.course?.course_kind === 'graded')
    if (currentUser.value?.role === 'teacher' && currentUser.value?.id) {
      rows = rows.filter((s) => s.teacher_id === currentUser.value.id)
    }
    const map = new Map<string, { id: string; title: string; time: string; day: string; criteriaCount: number | null }>()
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
          const n =
            g.graded_scheme?.semesters?.reduce((acc, sem) => acc + (sem.criteria?.length || 0), 0) ?? 0
          c.criteriaCount = n
        } catch {
          c.criteriaCount = 0
        }
      }),
    )
  } finally {
    loadingCourses.value = false
  }
}

async function selectCourse(course: (typeof groupGradedCourses.value)[0]) {
  selectedCourse.value = course
  loadingCriteria.value = true
  criteriaList.value = []
  try {
    const g = await gradedAssessmentService.getByCourseId(course.id, schoolId.value)
    const list: (typeof criteriaList.value)[0][] = []
    for (const sem of g.graded_scheme?.semesters || []) {
      for (const c of sem.criteria || []) {
        list.push({
          id: c.id,
          label: c.label,
          max_marks: c.max_marks,
          semester_index: sem.semester_index,
          semester_title: sem.title,
        })
      }
    }
    criteriaList.value = list
  } finally {
    loadingCriteria.value = false
  }
}

async function selectCriterion(c: (typeof criteriaList.value)[0]) {
  selectedCriterion.value = c
}

async function loadMarksGrid() {
  if (!selectedGroup.value || !selectedCourse.value || !selectedCriterion.value) return
  loadingGrid.value = true
  gridError.value = ''
  try {
    const data = await gradedCriterionTaskService.getMarksGrid({
      schoolId: schoolId.value,
      groupId: selectedGroup.value.id,
      courseId: selectedCourse.value.id,
      gradedCriterionId: selectedCriterion.value.id,
    })
    gridData.value = data
    const next: Record<string, string> = { ...data.marks }
    for (const s of data.students) {
      for (const tk of data.tasks) {
        const k = markKey(s.id, tk.id)
        if (next[k] === undefined || next[k] === null) next[k] = ''
        else next[k] = String(next[k])
      }
    }
    marksLocal.value = next
  } catch (e: unknown) {
    gridData.value = null
    const err = e as { message?: string }
    gridError.value = err?.message || t('gradedMarksGrid.loadFailed')
  } finally {
    loadingGrid.value = false
  }
}

watch(
  () => selectedCriterion.value?.id,
  (id) => {
    if (id) void loadMarksGrid()
  },
)

function goBack() {
  if (selectedCriterion.value) {
    selectedCriterion.value = null
    gridData.value = null
    marksLocal.value = {}
    gridError.value = ''
    return
  }
  if (selectedCourse.value) {
    selectedCourse.value = null
    criteriaList.value = []
    return
  }
  if (selectedGroup.value) {
    selectedGroup.value = null
    groupGradedCourses.value = []
  }
}

function parseMarkInput(raw: string): number | null {
  const s = String(raw ?? '').trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

async function saveMarks() {
  if (!selectedGroup.value || !selectedCourse.value || !selectedCriterion.value || !gridData.value) return
  savingMarks.value = true
  gridError.value = ''
  try {
    const entries: Array<{ student_id: string; graded_criterion_teacher_task_id: string; mark: number | null }> = []
    for (const s of gridData.value.students) {
      for (const tk of gridData.value.tasks) {
        const v = marksLocal.value[markKey(s.id, tk.id)] ?? ''
        entries.push({
          student_id: s.id,
          graded_criterion_teacher_task_id: tk.id,
          mark: parseMarkInput(v),
        })
      }
    }
    await gradedCriterionTaskService.saveMarksGrid(schoolId.value, {
      group_id: selectedGroup.value.id,
      course_id: selectedCourse.value.id,
      graded_criterion_id: selectedCriterion.value.id,
      entries,
    })
    await loadMarksGrid()
  } catch (e: unknown) {
    const err = e as { message?: string }
    gridError.value = err?.message || t('gradedMarksGrid.saveFailed')
  } finally {
    savingMarks.value = false
  }
}

void loadGroups()
</script>
