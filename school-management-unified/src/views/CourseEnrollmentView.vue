<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('courseEnrollment.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('courseEnrollment.subtitle') }}</p>
        </div>
      </section>

      <div
        v-if="flash"
        class="rounded-xl border px-4 py-3 text-sm shadow-sm"
        :class="flashOk ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800'"
        role="status"
      >
        {{ flash }}
      </div>

      <!-- Course picker -->
      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
          <div class="flex items-start gap-3">
            <div class="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-sm font-semibold text-gray-900">{{ $t('courseEnrollment.selectCourse') }}</h2>
              <p class="mt-0.5 text-xs text-gray-500">{{ $t('courseEnrollment.selectCourseHint') }}</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="sm:col-span-2 lg:col-span-1">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="enrollment-course">
                {{ $t('courseEnrollment.selectCourse') }}
              </label>
              <select
                id="enrollment-course"
                v-model="selectedCourseId"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">{{ $t('courseEnrollment.chooseCourse') }}</option>
                <option v-for="c in courses" :key="c.id" :value="c.id">{{ courseLabel(c) }}</option>
              </select>
            </div>
            <div
              v-if="selectedCourseId"
              class="rounded-xl bg-teal-50/80 px-4 py-3 ring-1 ring-teal-100 sm:col-span-2 lg:col-span-2"
            >
              <p class="text-xs font-semibold uppercase tracking-wide text-teal-800">{{ $t('courseEnrollment.courseFees') }}</p>
              <p class="mt-1 text-sm font-medium text-teal-900">{{ courseFeeHint }}</p>
            </div>
          </div>
          <div v-if="!courses.length" class="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
            {{ $t('courseEnrollment.noCoursesAvailable') }}
          </div>
        </div>
      </section>

      <!-- Enrolled students -->
      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('courseEnrollment.enrolledStudents') }}</h2>
              <p class="mt-0.5 text-xs text-gray-500">
                <template v-if="!selectedCourseId">{{ $t('courseEnrollment.pickCourseFirst') }}</template>
                <template v-else-if="!loadingEnrollments">
                  {{ $t('courseEnrollment.enrolledCount', { count: enrollments.length }) }}
                </template>
              </p>
            </div>
            <ListViewModeToggle v-if="selectedCourseId && enrollments.length" v-model="viewMode" />
          </div>
        </div>

        <div
          v-if="selectedCourseId && !loadingEnrollments"
          class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-3"
        >
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ enrollments.length }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseEnrollment.statEnrolled') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ availableStudentCount }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseEnrollment.statAvailable') }}</div>
          </div>
          <div class="col-span-2 rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100 sm:col-span-1">
            <div class="text-sm font-bold tabular-nums text-teal-800 sm:text-base">{{ selectedFeeDisplay }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('courseEnrollment.courseFeesBadge') }}</div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="!selectedCourseId" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'pick-' + slot"
              class="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <template v-if="slot === 1">
                <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p class="text-sm font-semibold text-gray-800">{{ $t('courseEnrollment.pickCourseFirst') }}</p>
              </template>
              <template v-else>
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-2 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </template>
            </div>
          </div>

          <div v-else-if="loadingEnrollments" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="enrollments.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="row in enrollments"
                :key="row.id"
                class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-800">
                      {{ studentInitials(row) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">
                        {{ row.student?.firstName }} {{ row.student?.lastName }}
                      </h3>
                      <p class="mt-1 text-xs tabular-nums text-gray-500">
                        {{ formatMoney(Number(row.payment?.base_total_amount || 0), row.payment?.currency || 'OMR') }}
                      </p>
                      <span class="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                        {{ $t('courseEnrollment.statusActive') }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="row.status === 'active'" class="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
                  <button
                    type="button"
                    class="text-sm font-semibold text-red-600 hover:text-red-800"
                    @click="dropEnrollment(row.id)"
                  >
                    {{ $t('courseEnrollment.drop') }}
                  </button>
                </div>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('courseEnrollment.studentCol') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('courseEnrollment.feeCol') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('courseEnrollment.statusCol') }}</th>
                    <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in enrollments" :key="'list-' + row.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">
                      {{ row.student?.firstName }} {{ row.student?.lastName }}
                    </td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">
                      {{ formatMoney(Number(row.payment?.base_total_amount || 0), row.payment?.currency || 'OMR') }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                        {{ $t('courseEnrollment.statusActive') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-end">
                      <button
                        v-if="row.status === 'active'"
                        type="button"
                        class="text-sm font-semibold text-red-600 hover:text-red-800"
                        @click="dropEnrollment(row.id)"
                      >
                        {{ $t('courseEnrollment.drop') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-6 py-14 text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('courseEnrollment.noEnrollments') }}</h3>
            <p class="mx-auto mt-1 max-w-sm text-xs text-gray-500">{{ $t('courseEnrollment.noEnrollmentsHint') }}</p>
          </div>
        </div>
      </section>

      <!-- Add students -->
      <section
        v-if="selectedCourseId"
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
      >
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-sm font-semibold text-gray-900">{{ $t('courseEnrollment.addStudents') }}</h2>
              <p class="mt-0.5 text-xs text-gray-500">
                {{ $t('courseEnrollment.availableCount', { count: filteredStudents.length }) }}
              </p>
            </div>
            <input
              v-model="studentSearch"
              type="search"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:max-w-xs"
              :placeholder="$t('studentPayments.searchPlaceholder')"
            />
          </div>
        </div>

        <div v-if="filteredStudents.length" class="max-h-80 overflow-y-auto p-4">
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label
              v-for="s in filteredStudents"
              :key="s.id"
              class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-3 py-2.5 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
              :class="selectedStudentIds.includes(s.id) ? 'border-primary-300 bg-primary-50/60 ring-1 ring-primary-200/80' : ''"
            >
              <input
                v-model="selectedStudentIds"
                type="checkbox"
                :value="s.id"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-700">
                {{ s.firstName.charAt(0) }}{{ s.lastName.charAt(0) }}
              </span>
              <span class="min-w-0 truncate text-sm font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</span>
            </label>
          </div>
        </div>
        <div v-else class="px-6 py-10 text-center text-sm text-gray-500">
          {{ $t('courseEnrollment.noStudentsToAdd') }}
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <p class="text-xs text-gray-500">
            {{ $t('courseEnrollment.selectedCount', { count: selectedStudentIds.length }) }}
          </p>
          <button
            type="button"
            class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!selectedStudentIds.length || enrolling"
            @click="submitEnroll"
          >
            {{ enrolling ? $t('common.loading') : $t('courseEnrollment.enrollSelected') }}
          </button>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { authService, courseService, studentService } from '@/services'
import courseEnrollmentService, {
  type CourseEnrollmentRow,
  type EnrollableCourseRow,
} from '@/services/course-enrollment.service'
import type { Course } from '@/services/course.service'
import type { Student } from '@/services/student.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const courses = ref<Course[]>([])
const enrollableByCourse = ref<Map<string, EnrollableCourseRow>>(new Map())
const selectedCourseId = ref('')
const enrollments = ref<CourseEnrollmentRow[]>([])
const students = ref<Student[]>([])
const selectedStudentIds = ref<string[]>([])
const studentSearch = ref('')
const loadingEnrollments = ref(false)
const enrolling = ref(false)
const flash = ref('')
const flashOk = ref(true)

const enrolledStudentIds = computed(
  () => new Set(enrollments.value.filter((e) => e.status === 'active').map((e) => e.student_id)),
)

const filteredStudents = computed(() => {
  const q = studentSearch.value.trim().toLowerCase()
  return students.value
    .filter((s) => !enrolledStudentIds.value.has(s.id))
    .filter((s) => {
      if (!q) return true
      const name = `${s.firstName} ${s.lastName}`.toLowerCase()
      return name.includes(q)
    })
})

const availableStudentCount = computed(() => filteredStudents.value.length)

const courseFeeHint = computed(() => {
  const row = enrollableByCourse.value.get(selectedCourseId.value)
  if (!row) return t('courseEnrollment.noFeeProfile')
  return t('courseEnrollment.courseFeeTotal', {
    amount: formatMoney(row.base_total, row.currency),
  })
})

const selectedFeeDisplay = computed(() => {
  const row = enrollableByCourse.value.get(selectedCourseId.value)
  if (!row) return '—'
  return formatMoney(row.base_total, row.currency)
})

function courseLabel(c: Course) {
  return c.name || c.title || c.id
}

function studentInitials(row: CourseEnrollmentRow) {
  const f = row.student?.firstName?.charAt(0) || ''
  const l = row.student?.lastName?.charAt(0) || ''
  return `${f}${l}` || '?'
}

function formatMoney(n: number, curr: string) {
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
      style: 'currency',
      currency: curr || 'OMR',
    }).format(n)
  } catch {
    return `${n.toFixed(2)} ${curr}`
  }
}

async function loadCourses() {
  const all = await courseService.getAllCourses(schoolId.value)
  courses.value = all.filter((c) => c.is_active !== false && Number(c.school_id) === schoolId.value)
  const enrollable = await courseEnrollmentService.listEnrollableCourses(schoolId.value)
  enrollableByCourse.value = new Map(enrollable.map((r) => [r.course.id, r]))
  courses.value = courses.value.filter((c) => enrollableByCourse.value.has(c.id))
}

async function loadStudents() {
  const all = await studentService.getAll()
  students.value = all.filter((s) => !s.school_id || Number(s.school_id) === schoolId.value)
}

async function loadEnrollments() {
  if (!selectedCourseId.value) {
    enrollments.value = []
    return
  }
  loadingEnrollments.value = true
  try {
    enrollments.value = await courseEnrollmentService.list({
      school_id: schoolId.value,
      course_id: selectedCourseId.value,
      status: 'active',
    })
  } finally {
    loadingEnrollments.value = false
  }
}

async function submitEnroll() {
  if (!selectedCourseId.value || !selectedStudentIds.value.length) return
  enrolling.value = true
  flash.value = ''
  try {
    const res = await courseEnrollmentService.enrollStudentsToCourse(
      selectedCourseId.value,
      selectedStudentIds.value,
    )
    const ok = res.results.filter((r) => r.status === 'enrolled').length
    const skipped = res.results.filter((r) => r.status === 'skipped').length
    const err = res.results.filter((r) => r.status === 'error').length
    flashOk.value = err === 0
    flash.value = t('courseEnrollment.enrollResult', { ok, skipped, err })
    selectedStudentIds.value = []
    await loadEnrollments()
  } catch (e: unknown) {
    flashOk.value = false
    const err = e as { response?: { data?: { message?: string } } }
    flash.value = err?.response?.data?.message || t('courseEnrollment.enrollFailed')
  } finally {
    enrolling.value = false
  }
}

async function dropEnrollment(id: string) {
  if (!window.confirm(t('courseEnrollment.dropConfirm'))) return
  try {
    await courseEnrollmentService.drop(id)
    await loadEnrollments()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    window.alert(err?.response?.data?.message || t('courseEnrollment.dropFailed'))
  }
}

watch(selectedCourseId, () => {
  selectedStudentIds.value = []
  loadEnrollments()
})

onMounted(async () => {
  try {
    await Promise.all([loadCourses(), loadStudents()])
  } catch {
    flashOk.value = false
    flash.value = t('courseEnrollment.loadFailed')
  }
})
</script>
