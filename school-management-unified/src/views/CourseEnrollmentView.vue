<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('courseEnrollment.title')"
        :subtitle="$t('courseEnrollment.subtitle')"
      />

      <div
        v-if="flash"
        class="fk-alert"
        :class="flashOk ? 'fk-alert--ok' : 'fk-alert--error'"
        role="status"
      >
        {{ flash }}
      </div>

      <!-- Course picker -->
      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('courseEnrollment.selectCourse') }}</h2>
            <p class="fk-card__meta">{{ $t('courseEnrollment.selectCourseHint') }}</p>
          </div>
        </header>
        <div class="p-6">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="sm:col-span-2 lg:col-span-1">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="enrollment-course">
                {{ $t('courseEnrollment.selectCourse') }}
              </label>
              <select
                id="enrollment-course"
                v-model="selectedCourseId"
                class="fk-field"
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
      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('courseEnrollment.enrolledStudents') }}</h2>
            <p class="fk-card__meta">
              <template v-if="!selectedCourseId">{{ $t('courseEnrollment.pickCourseFirst') }}</template>
              <template v-else-if="!loadingEnrollments">
                {{ $t('courseEnrollment.enrolledCount', { count: enrollments.length }) }}
              </template>
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <ListViewModeToggle v-if="selectedCourseId && enrollments.length" v-model="viewMode" />
          </div>
        </header>

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
          <div
            v-if="!selectedCourseId"
            class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('courseEnrollment.pickCourseFirst') }}</h3>
          </div>

          <div v-else-if="loadingEnrollments" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="enrollments.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KanbanCard
                v-for="row in paginatedEnrollments"
                :key="row.id"
                :title="`${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim()"
                :description="formatMoney(Number(row.payment?.base_total_amount || 0), row.payment?.currency || 'OMR')"
              >
                <template #tags>
                  <KanbanTag dot="emerald">{{ $t('courseEnrollment.statusActive') }}</KanbanTag>
                </template>
                <template #avatars>
                  <KanbanAvatar :initials="studentInitials(row)" />
                </template>
                <button
                  v-if="row.status === 'active'"
                  type="button"
                  class="text-sm font-semibold text-red-600 hover:text-red-800"
                  @click="dropEnrollment(row.id)"
                >
                  {{ $t('courseEnrollment.drop') }}
                </button>
              </KanbanCard>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
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
                  <tr v-for="row in paginatedEnrollments" :key="'list-' + row.id" class="hover:bg-primary-50/20">
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

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="enrollments.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div
            v-else
            class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('courseEnrollment.noEnrollments') }}</h3>
            <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ $t('courseEnrollment.noEnrollmentsHint') }}</p>
          </div>
        </div>
      </section>

      <!-- Add students -->
      <section
        v-if="selectedCourseId"
        class="fk-card"
      >
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('courseEnrollment.addStudents') }}</h2>
            <p class="fk-card__meta">
              {{ $t('courseEnrollment.availableCount', { count: filteredStudents.length }) }}
            </p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrToolbarSearch
              v-model="studentSearch"
              id="course-student-search"
              :placeholder="$t('studentPayments.searchPlaceholder')"
              :aria-label="$t('common.search')"
            />
          </div>
        </header>

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
            class="fk-btn fk-btn--primary"
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
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanAvatar from '@/components/ui/kanban-avatar.vue'
import FikrToolbarSearch from '@/components/FikrToolbarSearch.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import courseEnrollmentService, {
  type CourseEnrollmentRow,
  type CourseEnrollmentStudentRow,
  type EnrollableCourseRow,
} from '@/services/course-enrollment.service'
import FikrLoader from '@/components/FikrLoader.vue'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const courses = ref<EnrollableCourseRow['course'][]>([])
const enrollableByCourse = ref<Map<string, EnrollableCourseRow>>(new Map())
const selectedCourseId = ref('')
const enrollments = ref<CourseEnrollmentRow[]>([])
const {
  currentPage,
  paginatedItems: paginatedEnrollments,
  totalPages,
  goToPage,
} = useClientPagination(enrollments)

const students = ref<CourseEnrollmentStudentRow[]>([])
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

function courseLabel(c: EnrollableCourseRow['course']) {
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
  const enrollable = await courseEnrollmentService.listEnrollableCourses()
  enrollableByCourse.value = new Map(enrollable.map((r) => [r.course.id, r]))
  courses.value = enrollable.map((r) => r.course)
}

async function loadStudents() {
  students.value = await courseEnrollmentService.listAvailableStudents()
}

async function loadEnrollments() {
  if (!selectedCourseId.value) {
    enrollments.value = []
    return
  }
  loadingEnrollments.value = true
  try {
    enrollments.value = await courseEnrollmentService.list({
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
  currentPage.value = 1
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
