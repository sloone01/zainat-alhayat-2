<template>
  <DashboardLayout>
    <EnrollmentWizardChrome
      :title="$t('students.editStudentTitle')"
      :subtitle="headerSubtitle"
      :steps="steps"
      :current-step="currentStep"
    >
      <template #leading>
        <router-link
          to="/students"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
          :aria-label="$t('students.backToStudentManagement')"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
      </template>

      <div
        v-if="pageLoading"
        class="flex flex-col items-center justify-center gap-3 py-12 text-gray-500"
      >
        <FikrLoader />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <StudentDetailsStep
        v-else-if="currentStep === 1"
        v-model="formData.student"
        compact
        mode="staff"
        :school-id="schoolId"
        :existing-student-id="studentId"
        @next="handleNext"
      />

      <AcademicInfoStep
        v-else-if="currentStep === 2"
        v-model="formData.academic"
        :school-id="schoolId"
        compact
        require-group
        @next="handleNext"
        @back="handleBack"
      >
        <template #after>
          <div class="space-y-2">
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-bus">
              {{ $t('studentManagement.selectBus') }}
            </label>
            <select id="edit-bus" v-model="selectedBusId" class="fk-field max-w-lg">
              <option value="">{{ $t('students.noBusOptional') }}</option>
              <option v-for="b in buses" :key="b.id" :value="b.id">{{ b.title }}</option>
            </select>
          </div>
        </template>
      </AcademicInfoStep>

      <HealthInfoStep
        v-else-if="currentStep === 3"
        v-model="formData.health"
        compact
        @next="handleNext"
        @back="handleBack"
      />

      <GuardianInfoStep
        v-else-if="currentStep === 4"
        v-model="formData.guardian"
        compact
        edit-mode
        :student-civil-id="formData.student.idNumber"
        @next="handleNext"
        @back="handleBack"
      />

      <AddressInfoStep
        v-else-if="currentStep === 5"
        v-model="formData.address"
        compact
        @next="handleNext"
        @back="handleBack"
      />

      <div v-else-if="currentStep === 6" class="space-y-6">
        <div class="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-5">
          <h3 class="mb-4 text-sm font-semibold text-gray-900">{{ $t('students.registrationSummary') }}</h3>
          <div class="space-y-2 text-sm text-gray-700">
            <p>
              <span class="font-medium text-gray-900">{{ $t('enrollment.idNumber') }}:</span>
              {{ formData.student.idNumber || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.firstNameAr') }}:</span>
              {{ formData.student.first_name_ar || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.secondNameAr') }}:</span>
              {{ formData.student.secondName || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.thirdNameAr') }}:</span>
              {{ formData.student.thirdName || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.lastNameAr') }}:</span>
              {{ formData.student.last_name_ar || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.firstNameEn') }}:</span>
              {{ formData.student.first_name_en || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.secondNameEn') }}:</span>
              {{ formData.student.secondNameEn || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.thirdNameEn') }}:</span>
              {{ formData.student.thirdNameEn || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.lastNameEn') }}:</span>
              {{ formData.student.last_name_en || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('enrollment.steps.guardian') }}:</span>
              {{ guardianSummary }}
            </p>
            <p v-if="formData.academic.groupId">
              <span class="font-medium text-gray-900">{{ $t('students.groupAssignment') }}:</span>
              {{ groupLabel }}
            </p>
          </div>
        </div>

        <WizardStepNav
          :disabled="saving || !formData.academic.groupId"
          :next-label="saving ? $t('common.saving') : $t('common.save')"
          hide-next-chevron
          @back="handleBack"
          @next="saveAll"
        >
          <template #icon>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </template>
        </WizardStepNav>
      </div>
    </EnrollmentWizardChrome>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import EnrollmentWizardChrome from '@/components/enrollment/EnrollmentWizardChrome.vue'
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'
import StudentDetailsStep from '@/components/enrollment/StudentDetailsStep.vue'
import AcademicInfoStep from '@/components/enrollment/AcademicInfoStep.vue'
import HealthInfoStep from '@/components/enrollment/HealthInfoStep.vue'
import GuardianInfoStep from '@/components/enrollment/GuardianInfoStep.vue'
import AddressInfoStep from '@/components/enrollment/AddressInfoStep.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { useFeedback } from '@/composables/useFeedback'
import { getStoredSchoolId } from '@/utils/auth-token'
import { isNotFutureDate } from '@/utils/validation'
import { personFullName } from '@/utils/person-name'
import { normaliseNationality } from '@/utils/nationalities'
import { studentService, type Student } from '@/services/student.service'
import { busService, type Bus } from '@/services/bus.service'
import { groupService } from '@/services/group.service'
import { parentService, type Parent } from '@/services/parent.service'
import {
  applyStudentToStaffIntakeForm,
  createEmptyStaffIntakeForm,
  hasCompleteBilingualName,
  hasCompleteStudentIdentity,
  mapStaffIntakeToStudentUpdate,
  splitFullName,
  type StaffIntakeForm,
} from '@/components/enrollment/staffIntake'

const { t, locale } = useI18n()
const feedback = useFeedback()
const route = useRoute()
const router = useRouter()

const studentId = computed(() => String(route.params.id || ''))
const schoolId = computed(() => getStoredSchoolId() || '')

const pageLoading = ref(true)
const saving = ref(false)
const currentStep = ref(1)
const student = ref<Student | null>(null)
const formData = ref<StaffIntakeForm>(createEmptyStaffIntakeForm())
const buses = ref<Bus[]>([])
const selectedBusId = ref('')
const currentBusId = ref('')
const groupNameById = ref<Record<string, string>>({})

const steps = computed(() => [
  { key: 'student', shortTitle: t('students.stepShortStudent'), title: t('enrollment.steps.student'), description: t('enrollment.studentDetailsDescription') },
  { key: 'academic', shortTitle: t('students.stepShortAcademic'), title: t('students.stepTitleAcademic'), description: t('students.stepDescAcademic') },
  { key: 'health', shortTitle: t('students.stepShortHealth'), title: t('enrollment.steps.health'), description: t('enrollment.healthDescription') },
  { key: 'guardian', shortTitle: t('students.stepShortGuardian'), title: t('enrollment.steps.guardian'), description: t('enrollment.guardianDescription') },
  { key: 'address', shortTitle: t('students.stepShortAddress'), title: t('enrollment.steps.address'), description: t('enrollment.addressDescription') },
  { key: 'review', shortTitle: t('students.stepShortReview'), title: t('enrollment.steps.review'), description: t('enrollment.reviewDescription') },
])

const headerSubtitle = computed(() => {
  if (!student.value) return t('students.editStudentSubtitle')
  return personFullName(student.value, locale.value) || t('students.editStudentSubtitle')
})

const guardianSummary = computed(() => {
  const g = formData.value.guardian
  if (g.type === 'mother') return g.motherInfo.fullName || '—'
  if (g.type === 'other') return g.otherInfo.responsiblePerson || g.otherInfo.organizationName || '—'
  return g.fatherInfo.fullName || '—'
})

const groupLabel = computed(() => {
  const id = formData.value.academic.groupId
  return groupNameById.value[id] || id || '—'
})

async function persistStudentFields() {
  if (!studentId.value) return
  const patch = await mapStaffIntakeToStudentUpdate(formData.value)
  const updated = await studentService.update(studentId.value, patch as any)
  student.value = updated
  formData.value.student.nationality = normaliseNationality(formData.value.student.nationality)
}

async function persistGroupAndBus() {
  if (!studentId.value) return
  const groupId = formData.value.academic.groupId
  if (groupId) {
    await studentService.assignToGroup(studentId.value, groupId, { replaceExistingGroups: true })
  }
  if (selectedBusId.value !== currentBusId.value) {
    if (!selectedBusId.value) {
      if (currentBusId.value) {
        await studentService.removeFromBus(studentId.value, currentBusId.value)
      }
    } else {
      await studentService.assignToBus(studentId.value, selectedBusId.value)
    }
    currentBusId.value = selectedBusId.value
  }
}

async function persistMedicalReports() {
  if (!studentId.value) return
  const files = (formData.value.health.medicalReports || []).filter((f): f is File => f instanceof File)
  for (const file of files) {
    try {
      await studentService.uploadMedicalReport(studentId.value, file)
    } catch {
      // Keep going; toast on final save if needed
    }
  }
  formData.value.health.medicalReports = formData.value.health.medicalReports.filter(
    (f) => typeof f === 'string',
  )
}

async function persistGuardians() {
  if (!studentId.value) return
  const linked = ((student.value?.parents || []) as Parent[])
  const g = formData.value.guardian

  async function ensureParent(
    relationship: 'father' | 'mother' | 'guardian',
    payload: Parameters<typeof parentService.create>[0],
    match: (p: Parent) => boolean,
  ) {
    const existing = linked.find(match)
    if (existing) {
      await parentService.update(existing.id, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        first_name_ar: payload.first_name_ar,
        first_name_en: payload.first_name_en,
        last_name_ar: payload.last_name_ar,
        last_name_en: payload.last_name_en,
        civil_id: payload.civil_id,
        phone: payload.phone,
        email: payload.email,
        tribe: payload.tribe,
        workplace: payload.workplace,
        workPhone: payload.workPhone,
        maritalStatus: payload.maritalStatus,
        organizationName: payload.organizationName,
        responsiblePerson: payload.responsiblePerson,
        responsiblePhone: payload.responsiblePhone,
      })
      return
    }
    await parentService.create({
      ...payload,
      studentIds: [studentId.value],
      relationship,
      createLogin: false,
    })
  }

  for (const role of ['father', 'mother'] as const) {
    const info = role === 'father' ? g.fatherInfo : g.motherInfo
    if (!hasCompleteBilingualName(info)) continue
    await ensureParent(
      role,
      {
        firstName: info.first_name_ar.trim() || info.first_name_en.trim(),
        lastName: info.last_name_ar.trim() || info.last_name_en.trim(),
        first_name_ar: info.first_name_ar.trim(),
        first_name_en: info.first_name_en.trim(),
        last_name_ar: info.last_name_ar.trim(),
        last_name_en: info.last_name_en.trim(),
        civil_id: info.civil_id.trim() || undefined,
        phone: info.mobile.trim() || undefined,
        email: info.email.trim() || undefined,
        tribe: info.tribe.trim() || undefined,
        workplace: info.workplace.trim() || undefined,
        workPhone: info.workPhone.trim() || undefined,
        maritalStatus: info.maritalStatus.trim() || undefined,
      },
      (p) =>
        p.relationship === role ||
        (!!info.civil_id.trim() && p.civil_id === info.civil_id.trim()),
    )
  }

  const org = g.otherInfo
  if (g.type === 'other' && (org.organizationName.trim() || org.responsiblePerson.trim())) {
    const nameParts = splitFullName(org.responsiblePerson)
    await ensureParent(
      'guardian',
      {
        firstName: nameParts.firstName,
        lastName: org.organizationName.trim() || nameParts.lastName,
        phone: org.phone.trim() || undefined,
        organizationName: org.organizationName.trim() || undefined,
        responsiblePerson: org.responsiblePerson.trim() || undefined,
        responsiblePhone: org.responsiblePhone.trim() || undefined,
      },
      (p) => p.relationship === 'guardian',
    )
  }

  const refreshed = await studentService.getById(studentId.value)
  student.value = refreshed
}

const handleBack = () => {
  if (currentStep.value > 1) currentStep.value--
}

const handleNext = async () => {
  const step = currentStep.value
  const s = formData.value.student

  if (step === 1) {
    if (
      !hasCompleteStudentIdentity(s) ||
      !s.idNumber.trim() ||
      !s.gender ||
      !s.nationality.trim() ||
      !s.dateOfBirth
    ) {
      feedback.error(t('students.validationFillRequired'), t('students.validationErrorTitle'))
      return
    }
    if (!isNotFutureDate(s.dateOfBirth)) {
      feedback.error(t('validation.dateOfBirthFuture'), t('students.validationErrorTitle'))
      return
    }
  }

  saving.value = true
  try {
    if (step === 1 || step === 2 || step === 3 || step === 5) {
      await persistStudentFields()
    }
    if (step === 2) {
      await persistGroupAndBus()
    }
    if (step === 3) {
      await persistMedicalReports()
    }
    if (step === 4) {
      await persistStudentFields()
      await persistGuardians()
    }
    if (currentStep.value < 6) currentStep.value++
  } catch (e) {
    console.error(e)
    feedback.error(t('students.saveFailedMessage'), t('students.registerFailedTitle'))
  } finally {
    saving.value = false
  }
}

const saveAll = async () => {
  if (!formData.value.academic.groupId) {
    feedback.error(t('students.validationSelectGroup'), t('students.validationErrorTitle'))
    return
  }
  saving.value = true
  try {
    await persistStudentFields()
    await persistGroupAndBus()
    await persistMedicalReports()
    await persistGuardians()
    feedback.success(t('students.saveStudentSuccess'), t('students.saveSuccessTitle'))
    setTimeout(() => {
      router.push('/students')
    }, 800)
  } catch (e) {
    console.error(e)
    feedback.error(t('students.saveFailedMessage'), t('students.registerFailedTitle'))
  } finally {
    saving.value = false
  }
}

async function loadPage() {
  pageLoading.value = true
  try {
    const [s, b, groups] = await Promise.all([
      studentService.getById(studentId.value),
      busService.getAll(schoolId.value),
      groupService.getActive(schoolId.value).catch(() => []),
    ])
    student.value = s
    buses.value = b || []
    groupNameById.value = Object.fromEntries(
      (groups || []).map((g: { id: string; name?: string; title?: string }) => [
        String(g.id),
        g.name || g.title || String(g.id),
      ]),
    )
    formData.value = applyStudentToStaffIntakeForm(s, createEmptyStaffIntakeForm())
    formData.value.student.nationality = normaliseNationality(formData.value.student.nationality)
    currentBusId.value = s.buses?.[0]?.id || ''
    selectedBusId.value = currentBusId.value

    // Prefill medical report names for display
    try {
      const reports = await studentService.listMedicalReports(studentId.value)
      formData.value.health.medicalReports = reports.map((r) => r.filename || r.id)
    } catch {
      /* optional */
    }
  } catch (e) {
    console.error(e)
    feedback.error(t('students.saveFailedMessage'), t('students.registerFailedTitle'))
    router.push('/students')
  } finally {
    pageLoading.value = false
  }
}

onMounted(loadPage)
</script>
