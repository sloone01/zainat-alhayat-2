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
                />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="graded-course-level">
                  {{ $t('gradedCourses.courseLevel') }} <span class="text-red-500">*</span>
                </label>
                <select id="graded-course-level" v-model="levelId" class="fk-field" required>
                  <option disabled value="">{{ $t('gradedCourses.selectCourseLevel') }}</option>
                  <option v-for="lv in levels" :key="lv.id" :value="lv.id">
                    {{ lv.code }} — {{ lv.name }}
                  </option>
                </select>
                <p v-if="!levels.length" class="mt-1 text-xs text-amber-800">
                  {{ $t('gradedCourses.noCourseLevels') }}
                </p>
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
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="grid items-end gap-5 sm:grid-cols-3">
              <div>
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
              <fieldset class="sm:col-span-2">
                <legend class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('gradedCourses.aggregation') }}</legend>
                <div class="grid grid-cols-2 gap-2">
                  <label
                    class="flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors"
                    :class="aggregation === 'average'
                      ? 'border-primary-300 bg-primary-50 text-primary-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'"
                  >
                    <input v-model="aggregation" type="radio" value="average" class="sr-only" />
                    {{ $t('gradedCourses.aggregationAverage') }}
                  </label>
                  <label
                    class="flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors"
                    :class="aggregation === 'sum'
                      ? 'border-primary-300 bg-primary-50 text-primary-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'"
                  >
                    <input v-model="aggregation" type="radio" value="sum" class="sr-only" />
                    {{ $t('gradedCourses.aggregationSum') }}
                  </label>
                </div>
              </fieldset>
            </div>
          </div>
        </section>

        <!-- Semesters (from school calendar config — not editable here) -->
        <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
          <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <div class="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('gradedCourses.semestersSection') }}</h2>
                </div>
              </div>
            </div>

            <!-- Sum mode: criteria across all semesters must total course total_marks -->
            <div v-if="aggregation === 'sum' && semesters.length" class="mt-4 space-y-1.5 border-t border-gray-100/80 pt-4">
              <div class="flex items-center justify-between gap-2 text-[11px] font-medium">
                <span class="text-gray-600">{{ $t('gradedCourses.combinedSumLabel') }}</span>
                <span
                  class="tabular-nums"
                  :class="combinedSumOk ? 'text-emerald-700' : 'text-amber-800'"
                >
                  {{ combinedSemesterSum.toFixed(2) }} / {{ Number(totalMarks) || 0 }}
                  <template v-if="combinedSumOk"> · {{ $t('gradedCourses.sumOk') }}</template>
                  <template v-else-if="combinedSumRemainder > 0">
                    · {{ $t('gradedCourses.pointsRemaining', { n: combinedSumRemainder.toFixed(2) }) }}
                  </template>
                  <template v-else>
                    · {{ $t('gradedCourses.pointsOver', { n: Math.abs(combinedSumRemainder).toFixed(2) }) }}
                  </template>
                </span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="combinedSumProgressClass"
                  :style="{ width: `${combinedSumProgressPct}%` }"
                />
              </div>
            </div>
          </div>

          <div
            v-if="!semesters.length"
            class="px-6 py-10 text-center"
          >
            <p class="text-sm font-semibold text-gray-800">{{ $t('gradedCourses.noConfigSemesters') }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ $t('gradedCourses.noConfigSemestersHint') }}</p>
          </div>

          <div v-else class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
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
                      <p class="truncate text-sm font-semibold text-gray-900">
                        {{ semesterDisplayTitle(si) }}
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

                <!-- Average: ready status + progress inside each semester card -->
                <div v-if="aggregation === 'average'" class="mt-3">
                  <div class="mb-1 flex items-center justify-between gap-2 text-[11px] font-medium">
                    <span class="text-gray-500">{{ $t('gradedCourses.averageReadyLabel') }}</span>
                    <span
                      class="tabular-nums"
                      :class="semesterOk(si) ? 'text-emerald-700' : 'text-amber-800'"
                    >
                      <template v-if="semesterOk(si)">{{ $t('gradedCourses.averageReadyOk') }}</template>
                      <template v-else>{{ $t('gradedCourses.averageReadyHint') }}</template>
                    </span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      :class="averageSemesterProgressClass(si)"
                      :style="{ width: `${averageSemesterProgressPct(si)}%` }"
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
          v-if="formOk"
          class="fk-alert fk-alert--ok"
          role="status"
        >
          {{ formOk }}
        </div>

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
            class="fk-btn fk-btn--pearl"
            :disabled="submitting || !canSaveDraft"
            @click="submit(true)"
          >
            {{ submitting && savingAsDraft ? $t('gradedCourses.savingDraft') : $t('gradedCourses.saveDraft') }}
          </button>
          <button
            type="button"
            class="fk-btn fk-btn--primary"
            :disabled="submitting || !canSubmit"
            @click="submit(false)"
          >
            {{
              submitting && !savingAsDraft
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
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import gradedAssessmentService, {
  type GradedCourseWithScheme,
} from '@/services/graded-assessment.service'
import { paymentConfigService, type SchoolPaymentLevel } from '@/services/payment-config.service'
import { academicYearService } from '@/services/academic-year.service'
import { getStoredSchoolId } from '@/utils/auth-token'

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

const schoolId = computed(
  () => getStoredSchoolId() || String(currentUser.value?.school_id || ''),
)

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
const levelId = ref('')
const levels = ref<SchoolPaymentLevel[]>([])
const totalMarks = ref(100)
const aggregation = ref<'sum' | 'average'>('average')
/** Titles from active academic year (school settings) — fixed shell for the form. */
const configSemesterTitles = ref<string[]>([])
const semesters = ref<SemesterDraft[]>([])

const submitting = ref(false)
const savingAsDraft = ref(false)
const formError = ref('')
const formOk = ref('')

function emptyCriterion(): CriterionDraft {
  return { label: '', max_marks: 0 }
}

function configTitleAt(si: number): string {
  return (configSemesterTitles.value[si] || '').trim()
}

/** Rebuild semester cards from school config; keep existing criteria by index when possible. */
function applyConfigSemesterShell(preserveCriteria = true) {
  const prev = preserveCriteria ? semesters.value : []
  semesters.value = configSemesterTitles.value.map((title, i) => ({
    title,
    criteria:
      prev[i]?.criteria?.length
        ? prev[i].criteria.map((c) => ({ ...c }))
        : [emptyCriterion()],
  }))
}

function applyLoadedCourse(data: GradedCourseWithScheme) {
  courseName.value = (data.name || data.title || '').trim()
  courseDescription.value = (data.description || '').trim()
  const scheme = data.graded_scheme
  if (!scheme) {
    formError.value = t('gradedCourses.loadFailed')
    return
  }
  levelId.value = String(data.level_id || '')
  totalMarks.value = Number(scheme.total_marks)
  aggregation.value = scheme.aggregation_method === 'average' ? 'average' : 'sum'
  const sems = [...(scheme.semesters || [])].sort(
    (a, b) => (a.semester_index ?? 0) - (b.semester_index ?? 0),
  )
  // Shell stays from school config; merge saved criteria by semester index.
  applyConfigSemesterShell(false)
  for (let si = 0; si < semesters.value.length; si++) {
    const s = sems[si]
    if (!s) continue
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

function semesterDisplayTitle(si: number): string {
  return configTitleAt(si) || `${t('gradedCourses.semester')} ${si + 1}`
}

function round2(x: number): number {
  return Math.round(x * 100) / 100
}

const marksTarget = computed(() => {
  const n = Number(totalMarks.value)
  return Number.isFinite(n) && n > 0 ? n : 0
})

function labelledCriteria(si: number): CriterionDraft[] {
  return (semesters.value[si]?.criteria ?? []).filter((c) => c.label.trim())
}

function semesterSum(si: number): number {
  return round2(labelledCriteria(si).reduce((s, r) => s + Number(r.max_marks || 0), 0))
}

function semesterOk(si: number): boolean {
  const rows = labelledCriteria(si)
  if (rows.length === 0) return false
  if (rows.some((r) => !(Number(r.max_marks) > 0))) return false
  // Sum mode: course total is shared across semesters; per-semester equality is not required.
  return true
}

function averageSemesterProgressPct(si: number): number {
  const rows = semesters.value[si]?.criteria ?? []
  if (rows.length === 0) return 0
  if (semesterOk(si)) return 100
  const ready = rows.filter((r) => r.label.trim() && Number(r.max_marks) > 0).length
  return Math.min(100, (ready / rows.length) * 100)
}

function averageSemesterProgressClass(si: number): string {
  if (semesterOk(si)) return 'bg-emerald-500'
  const pct = averageSemesterProgressPct(si)
  if (pct <= 0) return 'bg-primary-400'
  if (pct >= 70) return 'bg-amber-400'
  return 'bg-primary-400'
}

/** Sum of labelled criteria across ALL semesters. Target is course total only (never × semester count). */
const combinedSemesterSum = computed(() =>
  round2(semesters.value.reduce((acc, _, si) => acc + semesterSum(si), 0)),
)

const combinedSumTarget = computed(() => {
  const n = Number(totalMarks.value)
  return Number.isFinite(n) && n > 0 ? n : 0
})

const combinedSumRemainder = computed(() =>
  round2(combinedSumTarget.value - combinedSemesterSum.value),
)

const combinedSumOk = computed(() => {
  if (!(combinedSumTarget.value > 0)) return false
  if (!semesters.value.length) return false
  if (!semesters.value.every((_, si) => semesterOk(si))) return false
  return Math.abs(combinedSemesterSum.value - combinedSumTarget.value) <= 0.02
})

const combinedSumProgressPct = computed(() => {
  if (!(combinedSumTarget.value > 0)) return 0
  return Math.min(100, (combinedSemesterSum.value / combinedSumTarget.value) * 100)
})

const combinedSumProgressClass = computed(() => {
  const sum = combinedSemesterSum.value
  const target = combinedSumTarget.value
  if (!(target > 0)) return 'bg-primary-400'
  if (Math.abs(sum - target) <= 0.02 && semesters.value.every((_, si) => semesterOk(si))) {
    return 'bg-emerald-500'
  }
  if (sum > target) return 'bg-rose-500'
  if (sum >= target * 0.7) return 'bg-amber-400'
  return 'bg-primary-400'
})

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

const canSaveDraft = computed(() => Boolean(courseName.value.trim()))

const canSubmit = computed(() => {
  if (!canSaveDraft.value) return false
  if (!levelId.value) return false
  if (!(marksTarget.value > 0)) return false
  if (!semesters.value.length) return false
  for (let i = 0; i < semesters.value.length; i++) {
    if (!semesterOk(i)) return false
  }
  if (aggregation.value === 'sum' && !combinedSumOk.value) return false
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
    title: configTitleAt(si),
    criteria: first.criteria.map((c) => ({ ...c })),
  }
}

function clearSameAsFirst(si: number) {
  semesters.value[si] = {
    title: configTitleAt(si),
    criteria: [emptyCriterion()],
  }
}

/** Toggle “same as semester 1”: copy when off, reset to blank criteria when on. */
function toggleSameAsFirst(si: number) {
  if (criteriaMatchFirst(si)) clearSameAsFirst(si)
  else copyFromFirst(si)
}

async function submit(asDraft = false) {
  formError.value = ''
  formOk.value = ''
  if (!courseName.value.trim()) {
    formError.value = t('gradedCourses.validationName')
    return
  }
  if (!asDraft) {
    if (!levelId.value) {
      formError.value = t('gradedCourses.validationLevel')
      return
    }
    if (!semesters.value.length) {
      formError.value = t('gradedCourses.noConfigSemesters')
      return
    }
    for (let i = 0; i < semesters.value.length; i++) {
      if (!semesterOk(i)) {
        formError.value = t('gradedCourses.validationSemesters')
        return
      }
    }
    if (aggregation.value === 'sum' && !combinedSumOk.value) {
      formError.value = t('gradedCourses.validationSemesters')
      return
    }
  }

  submitting.value = true
  savingAsDraft.value = asDraft
  try {
    const payload = {
      name: courseName.value.trim(),
      description: courseDescription.value.trim() || undefined,
      level_id: levelId.value || undefined,
      save_as_draft: asDraft,
      total_marks: Number(totalMarks.value) || 100,
      aggregation_method: aggregation.value,
      semesters: semesters.value.map((s, si) => {
        const criteria = s.criteria
          .filter((c) => asDraft || c.label.trim())
          .map((c) => ({
            label: c.label.trim(),
            max_marks: Number(c.max_marks) || 0,
          }))
        return {
          title: configTitleAt(si) || s.title.trim() || undefined,
          criteria: criteria.length ? criteria : [{ label: '', max_marks: 0 }],
        }
      }),
    }
    if (courseId.value) {
      await gradedAssessmentService.update(courseId.value, schoolId.value, payload)
    } else {
      const created = await gradedAssessmentService.create({
        school_id: schoolId.value,
        ...payload,
      })
      if (asDraft && created?.id) {
        await router.replace(`/graded-courses/${created.id}/edit`)
        formOk.value = t('gradedCourses.draftSaved')
        return
      }
    }
    if (asDraft) {
      formOk.value = t('gradedCourses.draftSaved')
      return
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
    savingAsDraft.value = false
  }
}

async function loadLevels() {
  const sid = schoolId.value
  if (!sid) {
    levels.value = []
    return
  }
  try {
    levels.value = (await paymentConfigService.listLevels(sid)).filter((lv) => lv.is_active !== false)
  } catch (e) {
    console.error(e)
    levels.value = []
  }
}

async function loadConfigSemesters() {
  const sid = schoolId.value
  if (!sid) {
    configSemesterTitles.value = []
    applyConfigSemesterShell(false)
    return
  }
  try {
    const year = await academicYearService.getActive(sid)
    const list = [...(year?.semesters || [])].sort((a, b) =>
      String(a.start_date || '').localeCompare(String(b.start_date || '')),
    )
    configSemesterTitles.value = list.map((s) => (s.title || '').trim()).filter(Boolean)
  } catch (e) {
    console.error(e)
    configSemesterTitles.value = []
  }
  applyConfigSemesterShell(false)
}

onMounted(async () => {
  initialLoading.value = true
  formError.value = ''
  try {
    await Promise.all([loadLevels(), loadConfigSemesters()])
    if (!courseId.value) return
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

