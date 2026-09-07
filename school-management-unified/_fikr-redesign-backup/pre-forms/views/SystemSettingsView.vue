<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :eyebrow="$t('systemSettings.eyebrow')"
        :title="$t('systemSettings.systemSettings')"
        :subtitle="$t('systemSettings.subtitle')"
      />

      <div class="fk-grid--2 items-start">
        <section class="fk-card">
          <header class="fk-card__header">
            <h2 class="fk-card__title">{{ $t('systemSettings.paymentOptionsTitle') }}</h2>
          </header>
          <ul class="divide-y divide-fikr-hairline">
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.paymentAllowAdjustLabel') }}</p>
                <p class="fk-setting__desc">{{ $t('systemSettings.paymentAllowAdjustDesc') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="paymentAllowAdjust" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.installmentDueDayLabel') }}</p>
                <p class="fk-setting__desc">{{ $t('systemSettings.installmentDueDayDesc') }}</p>
              </div>
              <input
                id="installment-due-day"
                v-model="installmentDueDayInput"
                type="number"
                min="1"
                max="31"
                class="fk-input w-24 text-center"
                :placeholder="$t('systemSettings.installmentDueDayLast')"
              >
            </li>
          </ul>
        </section>
        <section class="fk-card">
          <header class="fk-card__header">
            <h2 class="fk-card__title">{{ $t('systemSettings.attendanceSettings') }}</h2>
          </header>
          <ul class="divide-y divide-fikr-hairline">
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.allowAllUsersToTakeAttendance') }}</p>
                <p class="fk-setting__desc">{{ $t('systemSettings.allowAllUsersToTakeAttendanceDesc') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="settings.attendance.allowAllUsersToTakeAttendance" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.requireSupervisorApproval') }}</p>
                <p class="fk-setting__desc">{{ $t('systemSettings.requireSupervisorApprovalDesc') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="settings.attendance.requireSupervisorApproval" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.allowRetroactiveAttendance') }}</p>
                <p class="fk-setting__desc">{{ $t('systemSettings.allowRetroactiveAttendanceDesc') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="settings.attendance.allowRetroactiveAttendance" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li v-if="settings.attendance.allowRetroactiveAttendance" class="fk-setting bg-fikr-pearl">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.maxRetroactiveDays') }}</p>
              </div>
              <input
                v-model.number="settings.attendance.maxRetroactiveDays"
                type="number"
                min="1"
                max="30"
                class="fk-input w-24 text-center"
              >
            </li>
          </ul>
        </section>
        <section class="fk-card">
          <header class="fk-card__header">
            <h2 class="fk-card__title">{{ $t('systemSettings.userPermissions') }}</h2>
          </header>
          <ul class="divide-y divide-fikr-hairline">
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.teacherCanViewAllGroups') }}</p>
                <p class="fk-setting__desc">{{ $t('systemSettings.teacherCanViewAllGroupsDesc') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="settings.userPermissions.teacherCanViewAllGroups" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.parentCanViewOtherStudents') }}</p>
                <p class="fk-setting__desc">{{ $t('systemSettings.parentCanViewOtherStudentsDesc') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="settings.userPermissions.parentCanViewOtherStudents" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('systemSettings.adminRequiresTwoFactorAuth') }}</p>
                <p class="fk-setting__desc">{{ $t('systemSettings.adminRequiresTwoFactorAuthDesc') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="settings.userPermissions.adminRequiresTwoFactorAuth" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
          </ul>
        </section>
        <section class="fk-card">
          <header class="fk-card__header">
            <h2 class="fk-card__title">{{ $t('progressSettings.title') }}</h2>
          </header>
          <ul class="divide-y divide-fikr-hairline">
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('progressSettings.lessonAccess.restrictToAssignedTeacher') }}</p>
                <p class="fk-setting__desc">{{ $t('progressSettings.lessonAccess.restrictDescription') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="progressSettings.restrictLessonsToAssignedTeacher" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('progressSettings.lessonAccess.allowAllTeachers') }}</p>
                <p class="fk-setting__desc">{{ $t('progressSettings.lessonAccess.allowAllDescription') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="progressSettings.allowAllTeachersAccessToLessons" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('progressSettings.lessonSource.useSchedule') }}</p>
                <p class="fk-setting__desc">{{ $t('progressSettings.lessonSource.useScheduleDescription') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="progressSettings.loadLessonsFromSchedule" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
            <li class="fk-setting">
              <div class="min-w-0 flex-1">
                <p class="fk-setting__label">{{ $t('progressSettings.lessonSource.showOnlyTodayLessons') }}</p>
                <p class="fk-setting__desc">{{ $t('progressSettings.lessonSource.showOnlyTodayDescription') }}</p>
              </div>
              <label class="fk-switch">
                <input v-model="progressSettings.showOnlyTodayLessons" type="checkbox" class="peer sr-only">
                <span class="fk-switch__track"></span>
              </label>
            </li>
          </ul>
        </section>
      </div>

      <!-- sticky glass action bar (DESIGN.md: floating action bars use backdrop blur) -->
      <div class="sticky bottom-0 z-20 -mx-3 border-t border-fikr-hairline bg-white/80 px-3 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-3">
          <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
          <p v-else-if="saveOk" class="text-sm text-emerald-700">{{ saveOk }}</p>
          <button type="button" :disabled="saving" class="fk-btn fk-btn--primary px-6" @click="saveAll">
            {{ saving ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
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
