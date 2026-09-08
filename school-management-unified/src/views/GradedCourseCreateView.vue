<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="isEditMode ? $t('gradedCourses.editGradedCourse') : $t('gradedCourses.addCourse')"
        :subtitle="isEditMode ? $t('gradedCourses.editSubtitle') : $t('gradedCourses.createSubtitle')"
      />

      <div v-if="initialLoading" class="flex flex-col items-center justify-center gap-3 py-24 text-gray-500">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <template v-else>
        <!-- Course details -->
        <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
          <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
            <div class="flex items-start gap-3">
              <div class="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">{{ $t('gradedCourses.courseSection') }}</h2>
                <p class="mt-0.5 text-xs text-gray-500">{{ $t('gradedCourses.courseSectionHint') }}</p>
              </div>
            </div>
          </div>
          <div class="space-y-5 p-6">
            <div class="grid gap-5 sm:grid-cols-3">
              <div class="sm:col-span-2">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="graded-course-name">
                  {{ $t('gradedCourses.courseName') }}
                </label>
                <input
                  id="graded-course-name"
                  v-model="courseName"
                  type="text"
                  class="fk-field"
                  :placeholder="$t('gradedCourses.courseNamePlaceholder')"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="graded-semester-count">
                  {{ $t('gradedCourses.semesterCount') }}
                </label>
                <select id="graded-semester-count" v-model.number="semesterCount" class="fk-field">
                  <option v-for="n in 3" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="graded-course-desc">
                {{ $t('courseManagement.courseDescription') }}
              </label>
              <textarea
                id="graded-course-desc"
                v-model="courseDescription"
                rows="3"
                class="fk-field min-h-[5rem] resize-y"
                :placeholder="$t('courseManagement.courseDescriptionPlaceholder')"
              />
            </div>
          </div>
        </section>

        <!-- Assessment -->
        <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
          <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
            <div class="flex items-start gap-3">
              <div class="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">{{ $t('gradedCourses.assessmentSection') }}</h2>
                <p class="mt-0.5 text-xs text-gray-500">{{ $t('gradedCourses.assessmentSectionHint') }}</p>
              </div>
            </div>
          </div>
          <div class="space-y-6 p-6">
            <div class="max-w-xs">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="graded-total-marks">
                {{ $t('gradedCourses.totalMarks') }}
              </label>
              <input
                id="graded-total-marks"
                v-model.number="totalMarks"
                type="number"
                min="0.01"
                step="0.01"
                class="fk-field tabular-nums"
              />
            </div>

            <fieldset>
              <legend class="mb-3 block text-xs font-medium text-gray-600">{{ $t('gradedCourses.aggregation') }}</legend>
              <div class="grid gap-3 sm:grid-cols-2">
                <label
                  class="relative flex cursor-pointer rounded-2xl border p-4 shadow-sm transition-all"
                  :class="aggregation === 'sum'
                    ? 'border-primary-300 bg-primary-50/60 ring-1 ring-primary-200/80'
                    : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-md'"
                >
                  <input v-model="aggregation" type="radio" value="sum" class="sr-only" />
                  <div class="flex gap-3">
                    <span
                      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                      :class="aggregation === 'sum' ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'"
                      aria-hidden="true"
                    >
                      <span v-if="aggregation === 'sum'" class="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <div>
                      <span class="block text-sm font-semibold text-gray-900">{{ $t('gradedCourses.aggregationSum') }}</span>
                      <span class="mt-1 block text-xs leading-relaxed text-gray-500">{{ $t('gradedCourses.aggregationSumHint') }}</span>
                    </div>
                  </div>
                </label>
                <label
                  class="relative flex cursor-pointer rounded-2xl border p-4 shadow-sm transition-all"
                  :class="aggregation === 'average'
                    ? 'border-primary-300 bg-primary-50/60 ring-1 ring-primary-200/80'
                    : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-md'"
                >
                  <input v-model="aggregation" type="radio" value="average" class="sr-only" />
                  <div class="flex gap-3">
                    <span
                      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                      :class="aggregation === 'average' ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'"
                      aria-hidden="true"
                    >
                      <span v-if="aggregation === 'average'" class="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <div>
                      <span class="block text-sm font-semibold text-gray-900">{{ $t('gradedCourses.aggregationAverage') }}</span>
                      <span class="mt-1 block text-xs leading-relaxed text-gray-500">{{ $t('gradedCourses.aggregationAverageHint') }}</span>
                    </div>
                  </div>
                </label>
              </div>
            </fieldset>
          </div>
        </section>

        <!-- Semesters -->
        <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
          <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <div class="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('gradedCourses.semestersSection') }}</h2>
                  <p class="mt-0.5 max-w-2xl text-xs text-gray-500">{{ $t('gradedCourses.semestersSectionHint') }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(sem, si) in semesters"
                  :key="'chip-' + si"
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ring-1 ring-inset"
                  :class="semesterOk(si)
                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/20'
                    : 'bg-amber-50 text-amber-900 ring-amber-600/20'"
                >
                  {{ $t('gradedCourses.semester') }} {{ si + 1 }}:
                  {{ semesterSum(si).toFixed(0) }}/100
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <article
              v-for="(sem, si) in semesters"
              :key="si"
              class="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
              :class="semesterOk(si) ? 'border-emerald-200/80' : 'border-gray-200/80'"
            >
              <header class="border-b border-gray-100 px-4 py-3" :class="semesterHeaderTint(si)">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start gap-2.5">
                    <div
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm tabular-nums"
                      :class="semesterIconClass(si)"
                      aria-hidden="true"
                    >
                      {{ si + 1 }}
                    </div>
                    <div class="min-w-0 pt-0.5">
                      <p class="text-sm font-semibold text-gray-900">
                        {{ $t('gradedCourses.semester') }} {{ si + 1 }}
                      </p>
                      <p class="mt-0.5 text-xs text-gray-500">{{ $t('gradedCourses.criteriaRowHint') }}</p>
                    </div>
                  </div>
                  <button
                    v-if="si > 0"
                    type="button"
                    class="inline-flex max-w-[9.5rem] items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-semibold leading-snug transition-colors"
                    :class="criteriaMatchFirst(si)
                      ? 'border-primary-200 bg-primary-50 text-primary-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50/70 hover:text-primary-800'"
                    :aria-pressed="criteriaMatchFirst(si)"
                    :aria-label="
                      criteriaMatchFirst(si)
                        ? $t('gradedCourses.clearSameAsFirstSemester')
                        : $t('gradedCourses.sameAsFirstSemester')
                    "
                    @click="toggleSameAsFirst(si)"
                  >
                    <span
                      class="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                      :class="criteriaMatchFirst(si) ? 'border-primary-500 bg-primary-600 text-white' : 'border-gray-300 bg-white text-transparent'"
                      aria-hidden="true"
                    >
                      <svg class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                    <span class="text-start">{{ $t('gradedCourses.sameAsFirstSemester') }}</span>
                  </button>
                </div>

                <div class="mt-3">
                  <div class="mb-1 flex items-center justify-between gap-2 text-[11px] font-medium">
                    <span class="text-gray-500">{{ $t('gradedCourses.currentSum') }}</span>
                    <span
                      class="tabular-nums"
                      :class="semesterOk(si) ? 'text-emerald-700' : 'text-amber-800'"
                    >
                      {{ semesterSum(si).toFixed(2) }} / 100
                      <template v-if="semesterOk(si)"> · {{ $t('gradedCourses.sumOk') }}</template>
                      <template v-else-if="semesterRemainder(si) > 0">
                        · {{ $t('gradedCourses.pointsRemaining', { n: semesterRemainder(si).toFixed(2) }) }}
                      </template>
                      <template v-else>
                        · {{ $t('gradedCourses.pointsOver', { n: Math.abs(semesterRemainder(si)).toFixed(2) }) }}
                      </template>
                    </span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      :class="semesterProgressClass(si)"
                      :style="{ width: `${Math.min(100, semesterSum(si))}%` }"
                    />
                  </div>
                </div>
              </header>

              <div class="flex min-h-0 flex-1 flex-col">
                <div class="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/70 px-3 py-2">
                  <span class="text-xs font-semibold text-gray-700">{{ $t('gradedCourses.criteria') }}</span>
                  <button
                    type="button"
                    class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                    :aria-label="$t('gradedCourses.addCriterion')"
                    @click="addCriterion(si)"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>

                <div class="divide-y divide-gray-100" role="list">
                  <div
                    v-for="(row, ri) in sem.criteria"
                    :key="ri"
                    class="grid grid-cols-[minmax(0,1fr)_4.25rem_1.75rem] items-center gap-x-2 px-3 py-1.5"
                    role="listitem"
                  >
                    <input
                      v-model="row.label"
                      type="text"
                      class="fk-field fk-field--sm min-w-0"
                      :placeholder="$t('gradedCourses.criterionPlaceholder')"
                      :aria-label="$t('gradedCourses.criterionLabel')"
                    >
                    <input
                      v-model.number="row.max_marks"
                      type="number"
                      min="0"
                      step="0.01"
                      inputmode="decimal"
                      class="fk-field fk-field--sm w-full text-center tabular-nums"
                      :aria-label="$t('gradedCourses.pointsShortLabel')"
                    >
                    <button
                      type="button"
                      class="inline-flex h-8 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-25"
                      :disabled="sem.criteria.length <= 1"
                      :title="$t('gradedCourses.removeCriterion')"
                      :aria-label="$t('gradedCourses.removeCriterion')"
                      @click="removeCriterion(si, ri)"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <div
          v-if="formError"
          class="fk-alert fk-alert--error"
          role="alert"
        >
          {{ formError }}
        </div>

        <div class="sticky bottom-3 z-20 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-gray-200/80 bg-white/95 px-4 py-3 shadow-lg shadow-gray-900/5 ring-1 ring-black/[0.03] backdrop-blur-sm sm:px-5">
          <p v-if="!canSubmit" class="me-auto text-xs text-gray-500">
            {{ $t('gradedCourses.submitBlockedHint') }}
          </p>
          <router-link
            to="/graded-courses"
            class="fk-btn fk-btn--pearl"
          >
            {{ $t('common.cancel') }}
          </router-link>
          <button
            type="button"
            class="fk-btn fk-btn--primary"
            :disabled="submitting || !canSubmit"
            @click="submit"
          >
            {{
              submitting
                ? $t('gradedCourses.saving')
                : isEditMode
                  ? $t('gradedCourses.saveChanges')
                  : $t('gradedCourses.submit')
            }}
          </button>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import gradedAssessmentService, {
  type GradedCourseWithScheme,
} from '@/services/graded-assessment.service'

type CriterionDraft = { label: string; max_marks: number }
type SemesterDraft = { title: string; criteria: CriterionDraft[] }

const { locale, t } = useI18n()
const router = useRouter()
const route = useRoute()

const isRTL = computed(() => locale.value === 'ar')

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    return null
  }
})

const schoolId = computed(() => Number(currentUser.value?.school_id || 1))

const courseId = computed(() => {
  const p = route.params.courseId
  return typeof p === 'string' && p.length > 0 ? p : ''
})
const isEditMode = computed(() => Boolean(courseId.value))

const initialLoading = ref(false)

const SEMESTER_ICON_GRADIENTS = [
  'bg-gradient-to-br from-primary-500 to-teal-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-amber-500 to-orange-500',
] as const

const SEMESTER_HEADER_TINTS = [
  'bg-gradient-to-br from-primary-50/80 to-white',
  'bg-gradient-to-br from-emerald-50/80 to-white',
  'bg-gradient-to-br from-amber-50/70 to-white',
] as const

function semesterIconClass(si: number): string {
  return SEMESTER_ICON_GRADIENTS[Math.min(si, SEMESTER_ICON_GRADIENTS.length - 1)]
}

function semesterHeaderTint(si: number): string {
  return SEMESTER_HEADER_TINTS[Math.min(si, SEMESTER_HEADER_TINTS.length - 1)]
}

const courseName = ref('')
const courseDescription = ref('')
const totalMarks = ref(100)
const aggregation = ref<'sum' | 'average'>('sum')
const semesterCount = ref(2)
const semesters = ref<SemesterDraft[]>([])

const submitting = ref(false)
const formError = ref('')

function applyLoadedCourse(data: GradedCourseWithScheme) {
  courseName.value = (data.name || data.title || '').trim()
  courseDescription.value = (data.description || '').trim()
  const scheme = data.graded_scheme
  if (!scheme) {
    formError.value = t('gradedCourses.loadFailed')
    return
  }
  totalMarks.value = Number(scheme.total_marks)
  aggregation.value = scheme.aggregation_method === 'average' ? 'average' : 'sum'
  const sems = [...(scheme.semesters || [])].sort(
    (a, b) => (a.semester_index ?? 0) - (b.semester_index ?? 0),
  )
  const n = Math.min(3, Math.max(1, sems.length))
  semesterCount.value = n
  resizeSemesters(n)
  for (let si = 0; si < n; si++) {
    const s = sems[si]
    if (!s) continue
    semesters.value[si].title = (s.title || '').trim()
    const crits = s.criteria || []
    semesters.value[si].criteria =
      crits.length > 0
        ? crits.map((c) => ({
            label: (c.label || '').trim(),
            max_marks: Number(c.max_marks),
          }))
        : [emptyCriterion()]
  }
}

function emptyCriterion(): CriterionDraft {
  return { label: '', max_marks: 0 }
}

function emptySemester(): SemesterDraft {
  return { title: '', criteria: [emptyCriterion()] }
}

function resizeSemesters(n: number) {
  while (semesters.value.length < n) {
    semesters.value.push(emptySemester())
  }
  while (semesters.value.length > n) {
    semesters.value.pop()
  }
}

watch(
  semesterCount,
  (n) => {
    resizeSemesters(n)
  },
  { immediate: true },
)

function round2(x: number): number {
  return Math.round(x * 100) / 100
}

function semesterSum(si: number): number {
  const rows = semesters.value[si]?.criteria ?? []
  return round2(rows.reduce((s, r) => s + Number(r.max_marks || 0), 0))
}

function semesterRemainder(si: number): number {
  return round2(100 - semesterSum(si))
}

function semesterOk(si: number): boolean {
  return Math.abs(semesterSum(si) - 100) <= 0.02
}

function semesterProgressClass(si: number): string {
  const sum = semesterSum(si)
  if (Math.abs(sum - 100) <= 0.02) return 'bg-emerald-500'
  if (sum > 100) return 'bg-rose-500'
  if (sum >= 70) return 'bg-amber-400'
  return 'bg-primary-400'
}

function criteriaMatchFirst(si: number): boolean {
  const first = semesters.value[0]
  const other = semesters.value[si]
  if (!first || !other || si === 0) return false
  if (first.criteria.length !== other.criteria.length) return false
  return first.criteria.every((c, i) => {
    const o = other.criteria[i]
    return (
      c.label.trim() === o.label.trim() &&
      Math.abs(Number(c.max_marks) - Number(o.max_marks)) < 0.001
    )
  })
}

const canSubmit = computed(() => {
  if (!courseName.value.trim()) return false
  if (!totalMarks.value || totalMarks.value <= 0) return false
  for (let i = 0; i < semesters.value.length; i++) {
    if (!semesterOk(i)) return false
    const labelled = semesters.value[i].criteria.some((c) => c.label.trim())
    if (!labelled) return false
  }
  return true
})

function addCriterion(si: number) {
  semesters.value[si].criteria.push(emptyCriterion())
}

function removeCriterion(si: number, ri: number) {
  if (semesters.value[si].criteria.length <= 1) return
  semesters.value[si].criteria.splice(ri, 1)
}

function copyFromFirst(si: number) {
  const first = semesters.value[0]
  if (!first) return
  semesters.value[si] = {
    title: '',
    criteria: first.criteria.map((c) => ({ ...c })),
  }
}

function clearSameAsFirst(si: number) {
  semesters.value[si] = emptySemester()
}

/** Toggle “same as semester 1”: copy when off, reset to blank criteria when on. */
function toggleSameAsFirst(si: number) {
  if (criteriaMatchFirst(si)) clearSameAsFirst(si)
  else copyFromFirst(si)
}

async function submit() {
  formError.value = ''
  if (!courseName.value.trim()) {
    formError.value = t('gradedCourses.validationName')
    return
  }
  for (let i = 0; i < semesters.value.length; i++) {
    if (!semesterOk(i)) {
      formError.value = t('gradedCourses.validationSemesters')
      return
    }
  }

  submitting.value = true
  try {
    const payload = {
      name: courseName.value.trim(),
      description: courseDescription.value.trim() || undefined,
      total_marks: Number(totalMarks.value),
      aggregation_method: aggregation.value,
      semesters: semesters.value.map((s) => ({
        title: s.title.trim() || undefined,
        criteria: s.criteria
          .filter((c) => c.label.trim())
          .map((c) => ({
            label: c.label.trim(),
            max_marks: Number(c.max_marks),
          })),
      })),
    }
    if (courseId.value) {
      await gradedAssessmentService.update(courseId.value, schoolId.value, payload)
    } else {
      await gradedAssessmentService.create({
        school_id: schoolId.value,
        ...payload,
      })
    }
    await router.push('/graded-courses')
  } catch (e: unknown) {
    const msg =
      e && typeof e === 'object' && 'message' in e
        ? String((e as Error).message)
        : t('gradedCourses.saveFailed')
    formError.value = msg
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (!courseId.value) return
  initialLoading.value = true
  formError.value = ''
  try {
    const data = await gradedAssessmentService.getByCourseId(courseId.value, schoolId.value)
    applyLoadedCourse(data)
  } catch (e) {
    console.error(e)
    formError.value = t('gradedCourses.loadFailed')
  } finally {
    initialLoading.value = false
  }
})
</script>

