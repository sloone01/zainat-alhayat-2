<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm ring-1 ring-black/[0.02]">
        <h1 class="text-xl font-bold text-gray-900">{{ $t('courseEnrollment.title') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ $t('courseEnrollment.subtitle') }}</p>
      </div>

      <div v-if="flash" class="rounded-lg border p-3 text-sm" :class="flashOk ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800'">
        {{ flash }}
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-1">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('courseEnrollment.selectCourse') }}</label>
          <select
            v-model="selectedCourseId"
            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">{{ $t('courseEnrollment.chooseCourse') }}</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ courseLabel(c) }}</option>
          </select>
          <p v-if="selectedCourseId && courseFeeHint" class="mt-2 text-xs text-gray-600">{{ courseFeeHint }}</p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div class="border-b border-gray-100 px-4 py-3">
            <h2 class="text-base font-semibold text-gray-900">{{ $t('courseEnrollment.enrolledStudents') }}</h2>
          </div>
          <div v-if="!selectedCourseId" class="p-8 text-center text-sm text-gray-500">{{ $t('courseEnrollment.pickCourseFirst') }}</div>
          <div v-else-if="loadingEnrollments" class="flex justify-center py-12">
            <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          </div>
          <div v-else-if="!enrollments.length" class="p-8 text-center text-sm text-gray-500">{{ $t('courseEnrollment.noEnrollments') }}</div>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="row in enrollments" :key="row.id" class="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p class="font-medium text-gray-900">{{ row.student?.firstName }} {{ row.student?.lastName }}</p>
                <p class="text-xs text-gray-500 tabular-nums">
                  {{ formatMoney(Number(row.payment?.base_total_amount || 0), row.payment?.currency || 'OMR') }}
                </p>
              </div>
              <button
                v-if="row.status === 'active'"
                type="button"
                class="text-xs font-semibold text-red-600 hover:text-red-800"
                @click="dropEnrollment(row.id)"
              >
                {{ $t('courseEnrollment.drop') }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="selectedCourseId" class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-base font-semibold text-gray-900">{{ $t('courseEnrollment.addStudents') }}</h2>
          <input
            v-model="studentSearch"
            type="search"
            class="w-full sm:max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm"
            :placeholder="$t('studentPayments.searchPlaceholder')"
          />
        </div>
        <div class="max-h-72 overflow-y-auto p-3 space-y-1">
          <label
            v-for="s in filteredStudents"
            :key="s.id"
            class="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <input v-model="selectedStudentIds" type="checkbox" :value="s.id" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span class="text-sm text-gray-900">{{ s.firstName }} {{ s.lastName }}</span>
          </label>
        </div>
        <div class="border-t border-gray-100 px-4 py-3 flex justify-end">
          <button
            type="button"
            class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            :disabled="!selectedStudentIds.length || enrolling"
            @click="submitEnroll"
          >
            {{ enrolling ? $t('common.loading') : $t('courseEnrollment.enrollSelected') }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService, courseService, studentService } from '@/services'
import courseEnrollmentService, {
  type CourseEnrollmentRow,
  type EnrollableCourseRow,
} from '@/services/course-enrollment.service'
import type { Course } from '@/services/course.service'
import type { Student } from '@/services/student.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

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

const enrolledStudentIds = computed(() => new Set(enrollments.value.filter((e) => e.status === 'active').map((e) => e.student_id)))

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

const courseFeeHint = computed(() => {
  const row = enrollableByCourse.value.get(selectedCourseId.value)
  if (!row) return t('courseEnrollment.noFeeProfile')
  return t('courseEnrollment.courseFeeTotal', {
    amount: formatMoney(row.base_total, row.currency),
  })
})

function courseLabel(c: Course) {
  return c.name || c.title || c.id
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
