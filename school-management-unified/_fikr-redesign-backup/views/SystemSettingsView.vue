<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative max-w-2xl">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
            {{ $t('systemSettings.eyebrow') }}
          </p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('systemSettings.systemSettings') }}</h1>
          <p class="mt-2 text-sm text-slate-200/95">{{ $t('systemSettings.subtitle') }}</p>
        </div>
      </section>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <ul class="divide-y divide-gray-100">
          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.paymentAllowAdjustLabel') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('systemSettings.paymentAllowAdjustDesc') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="paymentAllowAdjust" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.installmentDueDayLabel') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('systemSettings.installmentDueDayDesc') }}</p>
            </div>
            <input
              id="installment-due-day"
              v-model="installmentDueDayInput"
              type="number"
              min="1"
              max="31"
              class="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              :placeholder="$t('systemSettings.installmentDueDayLast')"
            >
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.allowAllUsersToTakeAttendance') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('systemSettings.allowAllUsersToTakeAttendanceDesc') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="settings.attendance.allowAllUsersToTakeAttendance" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.requireSupervisorApproval') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('systemSettings.requireSupervisorApprovalDesc') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="settings.attendance.requireSupervisorApproval" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.allowRetroactiveAttendance') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('systemSettings.allowRetroactiveAttendanceDesc') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="settings.attendance.allowRetroactiveAttendance" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li v-if="settings.attendance.allowRetroactiveAttendance" class="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.maxRetroactiveDays') }}</p>
            </div>
            <input
              v-model.number="settings.attendance.maxRetroactiveDays"
              type="number"
              min="1"
              max="30"
              class="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.teacherCanViewAllGroups') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('systemSettings.teacherCanViewAllGroupsDesc') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="settings.userPermissions.teacherCanViewAllGroups" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.parentCanViewOtherStudents') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('systemSettings.parentCanViewOtherStudentsDesc') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="settings.userPermissions.parentCanViewOtherStudents" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('systemSettings.adminRequiresTwoFactorAuth') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('systemSettings.adminRequiresTwoFactorAuthDesc') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="settings.userPermissions.adminRequiresTwoFactorAuth" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="bg-gray-50 px-6 py-2.5">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('progressSettings.title') }}</p>
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('progressSettings.lessonAccess.restrictToAssignedTeacher') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('progressSettings.lessonAccess.restrictDescription') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="progressSettings.restrictLessonsToAssignedTeacher" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('progressSettings.lessonAccess.allowAllTeachers') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('progressSettings.lessonAccess.allowAllDescription') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="progressSettings.allowAllTeachersAccessToLessons" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('progressSettings.lessonSource.useSchedule') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('progressSettings.lessonSource.useScheduleDescription') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="progressSettings.loadLessonsFromSchedule" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>

          <li class="flex items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ $t('progressSettings.lessonSource.showOnlyTodayLessons') }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ $t('progressSettings.lessonSource.showOnlyTodayDescription') }}</p>
            </div>
            <label class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input v-model="progressSettings.showOnlyTodayLessons" type="checkbox" class="peer sr-only">
              <span class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 rtl:peer-checked:after:-translate-x-full"></span>
            </label>
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3">
        <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
        <p v-else-if="saveOk" class="text-sm text-emerald-700">{{ saveOk }}</p>
        <button
          type="button"
          :disabled="saving"
          class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          @click="saveAll"
        >
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { settingsService, type SystemSettings } from '@/services/settings.service'
import { authService } from '@/services'
import paymentConfigService from '@/services/payment-config.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const saving = ref(false)
const saveError = ref('')
const saveOk = ref('')
const settings = ref<SystemSettings>({
  attendance: {
    allowAllUsersToTakeAttendance: true,
    requireSupervisorApproval: false,
    allowRetroactiveAttendance: true,
    maxRetroactiveDays: 7,
  },
  userPermissions: {
    teacherCanViewAllGroups: true,
    parentCanViewOtherStudents: false,
    adminRequiresTwoFactorAuth: false,
  },
  schoolInfo: {
    name: 'زهرة الحياة للأطفال',
    address: 'مسقط، سلطنة عمان',
    phone: '+968 1234 5678',
    email: 'info@zahratalhayat.om',
    website: 'www.zahratalhayat.om',
  },
  academic: {
    currentAcademicYear: '2024-2025',
    termStartDate: '2024-09-01',
    termEndDate: '2025-06-30',
  },
})

const paymentAllowAdjust = ref(false)
const installmentDueDayInput = ref('')
const progressSettings = ref({
  restrictLessonsToAssignedTeacher: false,
  allowAllTeachersAccessToLessons: true,
  loadLessonsFromSchedule: true,
  showOnlyTodayLessons: false,
})

async function loadSettings() {
  try {
    settings.value = await settingsService.getStructuredSettings()
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

async function loadPaymentFlags() {
  try {
    const sid = Number(authService.getStoredUser()?.school_id) || 1
    const f = await paymentConfigService.getSchoolFlags(sid)
    paymentAllowAdjust.value = !!f.allow_admin_adjust_student_total
    installmentDueDayInput.value = f.installment_due_day != null ? String(f.installment_due_day) : ''
  } catch {
    paymentAllowAdjust.value = false
    installmentDueDayInput.value = ''
  }
}

function loadProgressSettings() {
  try {
    const saved = localStorage.getItem('progressSettings')
    if (!saved) return
    progressSettings.value = {
      ...progressSettings.value,
      ...JSON.parse(saved),
    }
  } catch (error) {
    console.warn('Failed to load progress settings:', error)
  }
}

async function saveAll() {
  saving.value = true
  saveError.value = ''
  saveOk.value = ''
  try {
    const settingsToUpdate: { key: string; value: unknown }[] = []
    ;(['attendance', 'userPermissions'] as const).forEach((category) => {
      Object.entries(settings.value[category]).forEach(([key, value]) => {
        settingsToUpdate.push({ key: `${category}.${key}`, value })
      })
    })
    await settingsService.bulkUpdate(settingsToUpdate)

    const sid = Number(authService.getStoredUser()?.school_id) || 1
    const raw = installmentDueDayInput.value.trim()
    const dueDay = raw === '' ? null : Number(raw)
    const f = await paymentConfigService.updateSchoolFlags(sid, {
      allow_admin_adjust_student_total: paymentAllowAdjust.value,
      installment_due_day: dueDay,
    })
    paymentAllowAdjust.value = !!f.allow_admin_adjust_student_total
    installmentDueDayInput.value = f.installment_due_day != null ? String(f.installment_due_day) : ''

    localStorage.setItem('progressSettings', JSON.stringify(progressSettings.value))
    saveOk.value = t('common.savedSuccessfully')
  } catch (error) {
    console.error(error)
    saveError.value = t('systemSettings.paymentFlagsSaveError')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadSettings()
  void loadPaymentFlags()
  loadProgressSettings()
})
</script>
