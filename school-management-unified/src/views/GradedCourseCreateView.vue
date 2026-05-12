<template>
  <DashboardLayout>
    <div
      class="graded-course-create max-w-7xl mx-auto space-y-8 pb-16 px-4 sm:px-6 text-[15px] leading-relaxed text-gray-700"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <header class="border-b border-gray-100 pb-8">
        <button
          type="button"
          class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          @click="router.push('/graded-courses')"
        >
          <svg class="h-4 w-4 shrink-0 text-gray-400 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          {{ $t('gradedCourses.backToList') }}
        </button>
        <h1 class="text-2xl font-semibold tracking-tight text-gray-900">
          {{ isEditMode ? $t('gradedCourses.editGradedCourse') : $t('gradedCourses.addCourse') }}
        </h1>
      </header>

      <div v-if="initialLoading" class="flex justify-center py-24">
        <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-purple-600" role="status" aria-busy="true" />
      </div>

      <template v-else>
      <!-- Course (dashboard-style panel) -->
      <section class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm space-y-5">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ $t('gradedCourses.courseSection') }}
        </h2>
        <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
          <div class="min-w-0 flex-1">
            <label class="stat-metric-card__label mb-1.5 block">{{ $t('gradedCourses.courseName') }}</label>
            <input
              v-model="courseName"
              type="text"
              class="graded-input"
              :placeholder="$t('gradedCourses.courseNamePlaceholder')"
            />
          </div>
          <div class="w-full shrink-0 sm:w-36">
            <label class="stat-metric-card__label mb-1.5 block">{{ $t('gradedCourses.semesterCount') }}</label>
            <select v-model.number="semesterCount" class="graded-input">
              <option v-for="n in 3" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="stat-metric-card__label mb-1.5 block">{{ $t('courseManagement.courseDescription') }}</label>
          <textarea
            v-model="courseDescription"
            rows="3"
            class="graded-input min-h-[5rem] resize-y"
            :placeholder="$t('courseManagement.courseDescriptionPlaceholder')"
          />
        </div>
      </section>

      <!-- Assessment -->
      <section class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm space-y-6">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ $t('gradedCourses.assessmentSection') }}
        </h2>
        <div class="max-w-xs">
          <label class="stat-metric-card__label mb-1.5 block">{{ $t('gradedCourses.totalMarks') }}</label>
          <input
            v-model.number="totalMarks"
            type="number"
            min="0.01"
            step="0.01"
            class="graded-input tabular-nums"
          />
        </div>

        <fieldset>
          <legend class="stat-metric-card__label mb-3 block">{{ $t('gradedCourses.aggregation') }}</legend>
          <div class="grid gap-3 sm:grid-cols-2">
            <label
              class="relative flex cursor-pointer rounded-2xl border p-4 shadow-sm transition-all duration-300"
              :class="aggregation === 'sum'
                ? 'border-purple-200/80 bg-purple-50/50 hover:border-purple-200'
                : 'border-gray-200/80 bg-white hover:border-gray-300/80 hover:shadow-md'"
            >
              <input v-model="aggregation" type="radio" value="sum" class="sr-only" />
              <div>
                <span class="block text-sm font-semibold text-gray-900">{{ $t('gradedCourses.aggregationSum') }}</span>
                <span class="mt-1 block text-xs font-normal leading-relaxed text-gray-500">{{ $t('gradedCourses.aggregationSumHint') }}</span>
              </div>
            </label>
            <label
              class="relative flex cursor-pointer rounded-2xl border p-4 shadow-sm transition-all duration-300"
              :class="aggregation === 'average'
                ? 'border-purple-200/80 bg-purple-50/50 hover:border-purple-200'
                : 'border-gray-200/80 bg-white hover:border-gray-300/80 hover:shadow-md'"
            >
              <input v-model="aggregation" type="radio" value="average" class="sr-only" />
              <div>
                <span class="block text-sm font-semibold text-gray-900">{{ $t('gradedCourses.aggregationAverage') }}</span>
                <span class="mt-1 block text-xs font-normal leading-relaxed text-gray-500">{{ $t('gradedCourses.aggregationAverageHint') }}</span>
              </div>
            </label>
          </div>
        </fieldset>
      </section>

      <!-- Semesters — match dashboard stat-metric calm cards -->
      <section class="space-y-6">
        <div>
          <h2 class="text-lg font-semibold tracking-tight text-gray-900">
            {{ $t('gradedCourses.semestersSection') }}
          </h2>
          <p class="mt-1.5 max-w-3xl text-sm leading-relaxed text-gray-500">
            {{ $t('gradedCourses.semestersSectionHint') }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4 lg:gap-5">
          <article
            v-for="(sem, si) in semesters"
            :key="si"
            class="stat-metric-card flex min-w-0 h-full flex-col !p-0 transition-all duration-300 hover:shadow-md"
            :class="semesterTopAccentClass(si)"
          >
            <header class="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-start gap-3">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold tracking-tight text-white shadow-md ring-4 ring-gray-50 tabular-nums"
                  :class="semesterIconClass(si)"
                  aria-hidden="true"
                >
                  {{ si + 1 }}
                </div>
                <div class="min-w-0 pt-0.5">
                  <p class="text-base font-semibold text-gray-900">
                    {{ $t('gradedCourses.semester') }} {{ si + 1 }}
                  </p>
                  <p class="stat-metric-card__hint mt-0.5 text-gray-500">
                    {{ $t('gradedCourses.criteriaRowHint') }}
                  </p>
                </div>
              </div>
              <button
                v-if="si > 0"
                type="button"
                class="group inline-flex max-w-full items-center gap-1.5 self-start rounded-lg border border-gray-200/70 bg-gray-50/80 px-2 py-1 text-[10px] font-medium leading-snug text-gray-600 transition-colors hover:border-violet-200 hover:bg-violet-50/70 hover:text-violet-800 sm:self-auto"
                @click="copyFromFirst(si)"
              >
                <span
                  class="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-violet-600 shadow-sm group-hover:border-violet-300"
                  aria-hidden="true"
                >
                  <svg class="h-2.5 w-2.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <span class="text-start">{{ $t('gradedCourses.sameAsFirstSemester') }}</span>
              </button>
            </header>

            <div class="flex flex-1 flex-col gap-4 px-5 py-5">
              <ul class="flex flex-col gap-2" role="list">
                <li
                  v-for="(row, ri) in sem.criteria"
                  :key="ri"
                  class="flex flex-col gap-4 rounded-xl border border-gray-100/90 bg-white/60 p-4 transition-colors hover:bg-white/90 sm:flex-row sm:items-end sm:gap-3"
                >
                  <div class="min-w-0 flex-1">
                    <input
                      v-model="row.label"
                      type="text"
                      class="graded-input-criterion"
                      :aria-label="$t('gradedCourses.criterionLabel')"
                    />
                  </div>
                  <div class="flex shrink-0 items-end gap-2">
                    <div class="flex flex-col gap-1">
                      <label class="block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        {{ $t('gradedCourses.pointsShortLabel') }}
                      </label>
                      <input
                        v-model.number="row.max_marks"
                        type="number"
                        min="0"
                        step="0.01"
                        inputmode="decimal"
                        class="graded-input-points"
                      />
                    </div>
                    <button
                      type="button"
                      class="flex h-11 w-10 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-25"
                      :disabled="sem.criteria.length <= 1"
                      :title="$t('gradedCourses.removeCriterion')"
                      @click="removeCriterion(si, ri)"
                    >
                      <span class="sr-only">{{ $t('gradedCourses.removeCriterion') }}</span>
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </li>
              </ul>

              <div class="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 self-start rounded-full border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-purple-200 hover:bg-purple-50/40 hover:text-purple-800"
                  @click="addCriterion(si)"
                >
                  <svg class="h-4 w-4 text-purple-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {{ $t('gradedCourses.addCriterion') }}
                </button>
                <p
                  class="self-start text-lg font-semibold tabular-nums tracking-tight text-gray-900 sm:self-auto sm:text-end"
                  role="status"
                  :aria-label="`${$t('gradedCourses.currentSumAria')}: ${semesterSum(si).toFixed(2)}`"
                >
                  {{ semesterSum(si).toFixed(2) }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div
        v-if="formError"
        class="rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-900"
        role="alert"
      >
        {{ formError }}
      </div>

      <div class="sticky bottom-0 -mx-4 flex justify-end border-t border-gray-200/80 bg-gray-50/90 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45"
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

/** Match dashboard metric cards: colored top accent + icon gradient per column */
const SEMESTER_TOP_ACCENTS = [
  'border-t-violet-500 text-violet-600',
  'border-t-emerald-500 text-emerald-600',
  'border-t-amber-500 text-amber-600',
] as const

const SEMESTER_ICON_GRADIENTS = [
  'bg-gradient-to-br from-violet-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-amber-500 to-orange-500',
] as const

function semesterTopAccentClass(si: number): string {
  const accent = SEMESTER_TOP_ACCENTS[Math.min(si, SEMESTER_TOP_ACCENTS.length - 1)]
  return `!border-t-4 ${accent}`
}

function semesterIconClass(si: number): string {
  return SEMESTER_ICON_GRADIENTS[Math.min(si, SEMESTER_ICON_GRADIENTS.length - 1)]
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

function semesterOk(si: number): boolean {
  return Math.abs(semesterSum(si) - 100) <= 0.02
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

<style scoped>
.graded-course-create :deep(input.graded-input),
.graded-course-create :deep(select.graded-input) {
  @apply box-border block h-11 w-full rounded-md border border-gray-200/90 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400;
  @apply transition-[border-color,box-shadow] duration-200;
  @apply focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:ring-offset-0;
}

.graded-course-create :deep(textarea.graded-input) {
  @apply block w-full rounded-md border border-gray-200/90 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400;
  @apply transition-[border-color,box-shadow] duration-200;
  @apply focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:ring-offset-0;
}

/* Criterion + points: same height (h-11), different widths, modest rounding */
.graded-course-create :deep(.graded-input-criterion) {
  @apply box-border block h-11 w-full min-w-0 rounded-md border border-gray-200/85 bg-white px-3 text-base font-medium text-gray-900 placeholder:text-gray-400;
  @apply transition-[border-color,box-shadow,background-color] duration-200;
  @apply focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:ring-offset-0;
}

.graded-course-create :deep(.graded-input-points) {
  @apply box-border h-11 w-[4rem] min-w-[4rem] max-w-[4rem] shrink-0 rounded-md border border-gray-200/85 bg-white px-1.5 text-center text-sm font-semibold tabular-nums text-gray-900;
  @apply transition-[border-color,box-shadow,background-color] duration-200;
  @apply focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:ring-offset-0;
  -moz-appearance: textfield;
}

.graded-course-create :deep(.graded-input-points::-webkit-outer-spin-button),
.graded-course-create :deep(.graded-input-points::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
