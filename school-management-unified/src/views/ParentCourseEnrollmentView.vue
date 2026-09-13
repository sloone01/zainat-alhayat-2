<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('courseEnrollment.parentTitle')" />

      <div v-if="loadingChildren" class="flex items-center justify-center gap-3 py-12">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="childrenError" class="fk-card">
        <div class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center">
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-800">{{ childrenError }}</p>
          <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadChildren">{{ $t('common.retry') }}</button>
        </div>
      </div>

      <div v-else-if="!children.length" class="fk-card">
        <div class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center">
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-800">{{ $t('parent.noChildren') }}</p>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div v-if="children.length > 1" class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title truncate">{{ $t('parent.myChildren') }}</h2>
          </header>
          <div class="flex flex-wrap gap-2 p-4 sm:p-6">
            <button
              v-for="c in children"
              :key="c.id"
              type="button"
              class="inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
              :class="selectedChildId === c.id
                ? 'border-primary-500 bg-primary-50 font-semibold text-primary-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200'"
              @click="selectChild(c.id)"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                :class="selectedChildId === c.id ? 'bg-primary-600' : 'bg-gray-400'"
              >
                {{ initials(c) }}
              </span>
              <span class="truncate">{{ c.firstName }} {{ c.lastName }}</span>
            </button>
          </div>
        </div>

        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('courseEnrollment.availableCourses') }}</h2>
              <p class="fk-card__meta">{{ selectedChildName }}</p>
            </div>
            <div class="flex shrink-0 flex-nowrap items-center gap-2">
              <button
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="!selectedCourseIds.length || enrolling"
                @click="submitEnroll"
              >
                {{ enrolling ? $t('common.loading') : $t('courseEnrollment.enrollCourses') }}
              </button>
            </div>
          </header>

          <div v-if="loadingCourses" class="flex flex-col items-center justify-center gap-3 py-16">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm text-gray-600">{{ $t('parent.loading') }}</span>
          </div>

          <div v-else-if="coursesError" class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-800">{{ coursesError }}</p>
            <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadCourses">{{ $t('common.retry') }}</button>
          </div>

          <div v-else-if="!courses.length" class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('courseEnrollment.noCoursesAvailable') }}</h3>
          </div>

          <div v-else class="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            <button
              v-for="row in courses"
              :key="row.course.id"
              type="button"
              class="group relative flex flex-col rounded-xl border bg-white p-4 text-start shadow-sm transition-colors"
              :class="courseCardClass(row)"
              :disabled="row.already_enrolled"
              :aria-pressed="isSelected(row.course.id)"
              @click="toggleCourse(row)"
            >
              <div class="flex items-start gap-3">
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  :class="row.already_enrolled
                    ? 'bg-gray-100 text-gray-500'
                    : isSelected(row.course.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-100 text-primary-800'"
                >
                  {{ courseInitials(row) }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-semibold text-gray-900">{{ row.course.name || row.course.title }}</p>
                  <p class="mt-1 text-sm font-semibold tabular-nums text-gray-800">
                    {{ formatMoney(row.base_total, row.currency) }}
                  </p>
                </div>
              </div>
              <div class="mt-3">
                <span
                  v-if="row.already_enrolled"
                  class="fk-chip fk-chip--green"
                >
                  {{ $t('courseEnrollment.alreadyEnrolled') }}
                </span>
                <span
                  v-else
                  class="fk-chip"
                  :class="isSelected(row.course.id) ? 'fk-chip--teal' : 'fk-chip--outline'"
                >
                  {{ $t('courseEnrollment.courseFeesBadge') }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { useFeedback } from '@/composables/useFeedback'
import { parentService } from '@/services/parent.service'
import courseEnrollmentService, { type EnrollableCourseRow } from '@/services/course-enrollment.service'

const { locale, t } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

interface ChildRow {
  id: string
  firstName: string
  lastName: string
}

const children = ref<ChildRow[]>([])
const selectedChildId = ref<string | null>(null)
const courses = ref<EnrollableCourseRow[]>([])
const selectedCourseIds = ref<string[]>([])
const loadingChildren = ref(true)
const loadingCourses = ref(false)
const enrolling = ref(false)
const childrenError = ref('')
const coursesError = ref('')

const selectedChildName = computed(() => {
  const child = children.value.find((c) => c.id === selectedChildId.value)
  return child ? `${child.firstName} ${child.lastName}`.trim() : ''
})

function initials(c: ChildRow) {
  const a = (c.firstName || '').trim().charAt(0)
  const b = (c.lastName || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

function courseInitials(row: EnrollableCourseRow) {
  const name = (row.course.name || row.course.title || '').trim()
  return name.slice(0, 1).toUpperCase() || '?'
}

function isSelected(id: string) {
  return selectedCourseIds.value.includes(id)
}

function courseCardClass(row: EnrollableCourseRow) {
  if (row.already_enrolled) return 'cursor-default border-gray-200 bg-gray-50/70 opacity-80'
  if (isSelected(row.course.id)) return 'border-primary-500 bg-primary-50/70 ring-2 ring-primary-500/25'
  return 'border-gray-200 hover:border-primary-200 hover:bg-primary-50/40'
}

function formatMoney(n: number, curr: string) {
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
      style: 'currency',
      currency: curr || 'OMR',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(n)
  } catch {
    return `${Number(n || 0).toFixed(3)} ${curr || 'OMR'}`
  }
}

function apiMessage(e: unknown): string {
  const err = e as { response?: { status?: number; data?: { message?: string | string[] } } }
  const raw = err.response?.data?.message
  return Array.isArray(raw) ? raw.filter(Boolean).join(' ') : typeof raw === 'string' ? raw : ''
}

function localizedLoadError(e: unknown, fallbackKey: string) {
  const msg = apiMessage(e)
  const status = (e as { response?: { status?: number } })?.response?.status
  if (msg === 'COURSE_ENROLLMENT_NO_FEE_PROFILE' || msg === 'COURSE_ENROLLMENT_ZERO_FEES') {
    return t('courseEnrollment.errorNoFeeProfile')
  }
  if (msg === 'COURSE_ENROLLMENT_CAPACITY_FULL') return t('courseEnrollment.errorCapacity')
  if (status === 403 || msg.includes('School context') || msg.includes('linked students')) {
    return t('courseEnrollment.loadFailed')
  }
  return t(fallbackKey)
}

async function loadChildren() {
  loadingChildren.value = true
  childrenError.value = ''
  try {
    const dash = await parentService.getMyDashboardData()
    children.value = (dash?.children ?? []).map((c: ChildRow) => ({ ...c, id: String(c.id) }))
    if (children.value.length && !selectedChildId.value) {
      selectedChildId.value = children.value[0].id
    }
  } catch (e) {
    childrenError.value = localizedLoadError(e, 'parent.error')
  } finally {
    loadingChildren.value = false
  }
}

async function loadCourses() {
  if (!selectedChildId.value) return
  loadingCourses.value = true
  coursesError.value = ''
  selectedCourseIds.value = []
  try {
    courses.value = await courseEnrollmentService.listEnrollableCourses(undefined, selectedChildId.value)
  } catch (e) {
    courses.value = []
    coursesError.value = localizedLoadError(e, 'courseEnrollment.loadFailed')
  } finally {
    loadingCourses.value = false
  }
}

function selectChild(id: string) {
  selectedChildId.value = id
}

function toggleCourse(row: EnrollableCourseRow) {
  if (row.already_enrolled) return
  const id = row.course.id
  selectedCourseIds.value = isSelected(id)
    ? selectedCourseIds.value.filter((x) => x !== id)
    : [...selectedCourseIds.value, id]
}

async function submitEnroll() {
  if (!selectedChildId.value || !selectedCourseIds.value.length) return
  enrolling.value = true
  try {
    const res = await courseEnrollmentService.enrollStudentInCourses(
      selectedChildId.value,
      selectedCourseIds.value,
    )
    const ok = res.results.filter((r) => r.status === 'enrolled').length
    feedback.success(t('courseEnrollment.parentEnrollSuccess', { count: ok }))
    selectedCourseIds.value = []
    await loadCourses()
  } catch (e: unknown) {
    feedback.error(localizedLoadError(e, 'courseEnrollment.enrollFailed'), t('common.error'))
  } finally {
    enrolling.value = false
  }
}

watch(selectedChildId, (id) => {
  if (id) loadCourses()
})

onMounted(() => {
  loadChildren()
})
</script>
