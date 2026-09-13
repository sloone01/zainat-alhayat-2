<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('reports.gradedStudentTitle')"
        :subtitle="$t('reports.gradedStudentDesc')"
      >
        <template #leading>
          <router-link
            to="/reports/academic"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('reports.backToReports')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ report?.student_name || $t('reports.gradedStudentTitle') }}</h2>
            <p v-if="report" class="fk-card__meta">
              {{ $t('reports.coursesWithMarks', { count: report.courses.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              :disabled="!studentId || loading"
              @click="loadReport"
            >
              {{ loading ? $t('common.loading') : $t('reports.runReport') }}
            </button>
          </div>
        </header>

        <div v-if="report" class="space-y-4 p-4 sm:p-6">

        <div
          v-for="course in report.courses"
          :key="course.course_id"
          class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm"
        >
          <div class="flex flex-col gap-2 border-b border-gray-100 bg-gradient-to-r from-primary-50/60 to-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="font-semibold text-gray-900">{{ course.course_name }}</h3>
              <p class="text-xs text-gray-500">
                {{ $t('gradedMarksGrid.courseTotalMarks') }}: {{ course.total_marks }}
              </p>
            </div>
            <div class="rounded-xl bg-emerald-50 px-4 py-2 text-center ring-1 ring-emerald-100">
              <div class="text-xs font-medium text-emerald-700">{{ $t('reports.calculatedScore') }}</div>
              <div class="text-lg font-bold tabular-nums text-emerald-900">
                {{ course.course_score }} / {{ course.course_max }}
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th class="px-4 py-2 text-start font-semibold">{{ $t('gradedCourses.criteria') }}</th>
                  <th class="px-4 py-2 text-start font-semibold">{{ $t('gradedMarksGrid.semester') }}</th>
                  <th class="px-4 py-2 text-center font-semibold">{{ $t('gradedMarksGrid.mark') }}</th>
                  <th class="px-4 py-2 text-center font-semibold">{{ $t('gradedCourses.pointsShortLabel') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="c in course.criteria" :key="c.id">
                  <td class="px-4 py-2 text-gray-900">{{ c.label }}</td>
                  <td class="px-4 py-2 text-gray-600">{{ c.semester_index + 1 }}</td>
                  <td class="px-4 py-2 text-center tabular-nums">{{ c.mark == null ? '—' : c.mark }}</td>
                  <td class="px-4 py-2 text-center tabular-nums text-gray-500">{{ c.max_marks }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="course.semester_scores.length" class="border-t border-gray-100 bg-gray-50/70 px-6 py-3">
            <div class="flex flex-wrap gap-3 text-xs text-gray-700">
              <span
                v-for="sem in course.semester_scores"
                :key="sem.semester_index"
                class="rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-gray-200"
              >
                {{ sem.title || `${$t('gradedMarksGrid.semester')} ${sem.semester_index + 1}` }}:
                <strong class="tabular-nums">{{ sem.score }}/{{ sem.max }}</strong>
              </span>
            </div>
          </div>
        </div>

        <div v-if="!report.courses.length" class="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500">
          {{ $t('reports.noGradedMarksYet') }}
        </div>
        </div>
      </section>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('common.filter')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('common.filter') }}</h3>
          </div>
          <button
            type="button"
            class="fk-modal__close"
            :aria-label="$t('common.close')"
            @click="showFilters = false"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="fk-drawer__body">
          <div class="fk-form__row">
            <label class="fk-flabel" for="student-report-student"><span>{{ $t('reports.selectStudent') }}</span></label>
            <select id="student-report-student" v-model="studentId" class="fk-field">
              <option value="">{{ $t('common.select') }}</option>
              <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { studentService } from '@/services/student.service'
import authService from '@/services/auth.service'
import gradedCriterionMarksService, {
  type StudentMarksReport,
} from '@/services/graded-criterion-marks.service'

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const schoolId = computed(() => authService.getStoredUser()?.school_id ?? 1)

const students = ref<{ id: string; name: string }[]>([])
const studentId = ref('')
const loading = ref(false)
const error = ref('')
const report = ref<StudentMarksReport | null>(null)
const showFilters = ref(false)

const hasActiveFilters = computed(() => Boolean(studentId.value))

function clearFilters() {
  studentId.value = ''
}

async function loadStudents() {
  const all = await studentService.getAll()
  students.value = all
    .map((s) => ({
      id: s.id,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function loadReport() {
  if (!studentId.value) return
  loading.value = true
  error.value = ''
  try {
    report.value = await gradedCriterionMarksService.studentReport({
      schoolId: schoolId.value,
      studentId: studentId.value,
    })
  } catch (e: unknown) {
    report.value = null
    error.value = (e as { message?: string })?.message || 'Failed to load report'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadStudents()
})
</script>
