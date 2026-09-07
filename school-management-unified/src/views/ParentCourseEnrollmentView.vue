<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('courseEnrollment.parentTitle')"
        :subtitle="$t('courseEnrollment.parentSubtitle')"
      />

      <div v-if="flash" :class="flashOk ? 'rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900' : 'fk-alert fk-alert--error'">
        {{ flash }}
      </div>

      <div v-if="loadingChildren" class="flex justify-center py-12">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>

      <template v-else>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in children"
            :key="c.id"
            type="button"
            class="rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition"
            :class="selectedChildId === c.id ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-gray-200 bg-white text-gray-800 hover:border-teal-200'"
            @click="selectChild(c.id)"
          >
            {{ c.firstName }} {{ c.lastName }}
          </button>
        </div>

        <div v-if="selectedChildId" class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('courseEnrollment.availableCourses') }}</h2>
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

          <div v-if="loadingCourses" class="flex justify-center py-12">
            <span class="h-8 w-8 animate-spin rounded-full border-2 border-teal-300 border-t-teal-600" />
          </div>
          <p v-else-if="!courses.length" class="p-8 text-center text-sm text-gray-500">{{ $t('courseEnrollment.noCoursesAvailable') }}</p>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="row in courses" :key="row.course.id" class="flex items-start gap-3 px-4 py-4">
              <input
                v-model="selectedCourseIds"
                type="checkbox"
                :value="row.course.id"
                :disabled="row.already_enrolled"
                class="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-40"
              />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900">{{ row.course.name || row.course.title }}</p>
                <p class="text-sm text-gray-600 tabular-nums mt-0.5">
                  {{ formatMoney(row.base_total, row.currency) }}
                </p>
                <p v-if="row.already_enrolled" class="text-xs font-medium text-teal-700 mt-1">{{ $t('courseEnrollment.alreadyEnrolled') }}</p>
              </div>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { authService } from '@/services'
import { parentService } from '@/services/parent.service'
import courseEnrollmentService, { type EnrollableCourseRow } from '@/services/course-enrollment.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

interface ChildRow {
  id: string
  firstName: string
  lastName: string
}

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const children = ref<ChildRow[]>([])
const selectedChildId = ref<string | null>(null)
const courses = ref<EnrollableCourseRow[]>([])
const selectedCourseIds = ref<string[]>([])
const loadingChildren = ref(true)
const loadingCourses = ref(false)
const enrolling = ref(false)
const flash = ref('')
const flashOk = ref(true)

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

async function loadChildren() {
  loadingChildren.value = true
  try {
    const dash = await parentService.getMyDashboardData()
    children.value = (dash?.children ?? []).map((c: ChildRow) => ({ ...c, id: String(c.id) }))
    if (children.value.length && !selectedChildId.value) {
      selectedChildId.value = children.value[0].id
    }
  } finally {
    loadingChildren.value = false
  }
}

async function loadCourses() {
  if (!selectedChildId.value) return
  loadingCourses.value = true
  selectedCourseIds.value = []
  try {
    courses.value = await courseEnrollmentService.listEnrollableCourses(schoolId.value, selectedChildId.value)
  } finally {
    loadingCourses.value = false
  }
}

function selectChild(id: string) {
  selectedChildId.value = id
}

async function submitEnroll() {
  if (!selectedChildId.value || !selectedCourseIds.value.length) return
  enrolling.value = true
  flash.value = ''
  try {
    const res = await courseEnrollmentService.enrollStudentInCourses(
      selectedChildId.value,
      selectedCourseIds.value,
    )
    const ok = res.results.filter((r) => r.status === 'enrolled').length
    flashOk.value = true
    flash.value = t('courseEnrollment.parentEnrollSuccess', { count: ok })
    selectedCourseIds.value = []
    await loadCourses()
  } catch (e: unknown) {
    flashOk.value = false
    const err = e as { response?: { data?: { message?: string } } }
    const msg = err?.response?.data?.message || ''
    if (msg === 'COURSE_ENROLLMENT_NO_FEE_PROFILE') {
      flash.value = t('courseEnrollment.errorNoFeeProfile')
    } else if (msg === 'COURSE_ENROLLMENT_CAPACITY_FULL') {
      flash.value = t('courseEnrollment.errorCapacity')
    } else {
      flash.value = msg || t('courseEnrollment.enrollFailed')
    }
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
