<template>
  <DashboardLayout>
    <EnrollmentWizardChrome
      :title="$t('students.registerStudent')"
      :subtitle="$t('students.registerSubtitle')"
      :steps="steps"
      :current-step="currentStep"
    >
      <StudentDetailsStep
        v-if="currentStep === 1"
        v-model="formData.student"
        compact
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
      />

      <HealthInfoStep
        v-else-if="currentStep === 3"
        v-model="formData.health"
        compact
        @next="handleNext"
        @back="handleBack"
      />

      <div v-else-if="currentStep === 4" class="space-y-6">
        <!-- Linking an existing parent is handled inside the guardian card's own
             "+" pop-up (civil ID lookup) — same as the student edit page's parents
             tab. No separate search-existing-guardian step here. -->
        <GuardianInfoStep
          v-model="formData.guardian"
          compact
          @next="handleNext"
          @back="handleBack"
        />
      </div>

      <AddressInfoStep
        v-else-if="currentStep === 5"
        v-model="formData.address"
        compact
        @next="handleNext"
        @back="handleBack"
      />

      <div v-else-if="currentStep === 6" class="space-y-6">
        <div class="space-y-3">
          <label
            for="createStudentUser"
            class="flex cursor-pointer items-start gap-2.5 rounded-xl border border-primary-100 bg-primary-50/60 px-3 py-2.5"
          >
            <input
              id="createStudentUser"
              v-model="createStudentUser"
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            >
            <span class="min-w-0 leading-snug">
              <span class="text-sm font-medium text-primary-900">{{ $t('students.createStudentUserAccount') }}</span>
              <span class="mt-0.5 block text-xs text-primary-800/80">{{ $t('students.createStudentUserAccountNote') }}</span>
            </span>
          </label>
          <div v-if="createStudentUser">
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-student-email">
              {{ $t('students.studentLoginEmail') }} *
            </label>
            <input
              id="reg-student-email"
              v-model="studentEmail"
              type="email"
              required
              class="reg-input"
              :placeholder="$t('students.studentLoginEmailPlaceholder')"
            >
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-5">
          <h3 class="mb-4 text-sm font-semibold text-gray-900">{{ $t('students.registrationSummary') }}</h3>
          <div class="space-y-2 text-sm text-gray-700">
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.firstNameAr') }}:</span>
              {{ formData.student.first_name_ar || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('students.firstNameEn') }}:</span>
              {{ formData.student.first_name_en || '—' }}
            </p>
            <p>
              <span class="font-medium text-gray-900">{{ $t('enrollment.steps.guardian') }}:</span>
              {{ guardianSummary }}
            </p>
            <p v-if="selectedGroup">
              <span class="font-medium text-gray-900">{{ $t('students.groupAssignment') }}:</span>
              {{ selectedGroup.name }}
            </p>
          </div>
        </div>

        <WizardStepNav
          :disabled="!selectedGroup"
          :next-label="$t('students.registerStudent')"
          hide-next-chevron
          @back="handleBack"
          @next="registerStudent"
        >
          <template #icon>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </WizardStepNav>
      </div>
    </EnrollmentWizardChrome>

    <ProgressDialog
      :show="showProgressDialog"
      :state="progressState"
      :title="progressTitle"
      :message="progressMessage"
      @close="showProgressDialog = false"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFeedback } from '@/composables/useFeedback'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import EnrollmentWizardChrome from '@/components/enrollment/EnrollmentWizardChrome.vue'
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'
import StudentDetailsStep from '@/components/enrollment/StudentDetailsStep.vue'
import AcademicInfoStep from '@/components/enrollment/AcademicInfoStep.vue'
import HealthInfoStep from '@/components/enrollment/HealthInfoStep.vue'
import GuardianInfoStep from '@/components/enrollment/GuardianInfoStep.vue'
import AddressInfoStep from '@/components/enrollment/AddressInfoStep.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { studentService } from '@/services/student.service'
import { groupService } from '@/services/group.service'
import { getStoredSchoolId } from '@/utils/auth-token'
import {
  createEmptyStaffIntakeForm,
  hasCompleteBilingualName,
  mapStaffIntakeToRegisterRequest,
} from '@/components/enrollment/staffIntake'

const { t } = useI18n()
const feedback = useFeedback()
const router = useRouter()
const schoolId = computed(() => getStoredSchoolId() || '')

const currentStep = ref(1)
const createStudentUser = ref(false)
const studentEmail = ref('')
const availableGroups = ref<any[]>([])
const formData = ref(createEmptyStaffIntakeForm())
const selectedGroup = computed(
  () => availableGroups.value.find((g) => g.id === formData.value.academic.groupId) || null,
)

const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')

const steps = computed(() => [
  { key: 'student', shortTitle: t('students.stepShortStudent'), title: t('enrollment.steps.student'), description: t('enrollment.studentDetailsDescription') },
  { key: 'academic', shortTitle: t('students.stepShortAcademic'), title: t('students.stepTitleAcademic'), description: t('students.stepDescAcademic') },
  { key: 'health', shortTitle: t('students.stepShortHealth'), title: t('enrollment.steps.health'), description: t('enrollment.healthDescription') },
  { key: 'guardian', shortTitle: t('students.stepShortGuardian'), title: t('enrollment.steps.guardian'), description: t('enrollment.guardianDescription') },
  { key: 'address', shortTitle: t('students.stepShortAddress'), title: t('enrollment.steps.address'), description: t('enrollment.addressDescription') },
  { key: 'review', shortTitle: t('students.stepShortReview'), title: t('enrollment.steps.review'), description: t('enrollment.reviewDescription') },
])

const guardianSummary = computed(() => {
  const g = formData.value.guardian
  if (g.type === 'mother') return g.motherInfo.fullName || '—'
  return g.fatherInfo.fullName || '—'
})

const handleNext = () => {
  if (currentStep.value < 6) currentStep.value++
}

const handleBack = () => {
  if (currentStep.value > 1) currentStep.value--
}

const loadAvailableGroups = async () => {
  try {
    const groups = await groupService.getActive(schoolId.value)
    const groupsWithCapacity = await Promise.all(
      groups.map(async (group) => {
        try {
          const capacityInfo = await groupService.getGroupCapacity(group.id)
          return {
            ...group,
            currentStudents: capacityInfo.currentStudents || 0,
            ageGroup: formatGroupAgeRangeLabel(
              group.age_range_min,
              group.age_range_max,
              t('groupManagement.years'),
            ),
          }
        } catch {
          return {
            ...group,
            currentStudents: 0,
            ageGroup: formatGroupAgeRangeLabel(
              group.age_range_min,
              group.age_range_max,
              t('groupManagement.years'),
            ),
          }
        }
      }),
    )
    availableGroups.value = groupsWithCapacity
  } catch (error) {
    console.error('Error loading groups:', error)
    availableGroups.value = []
  }
}

function apiErrorMessage(error: unknown): string {
  const axiosMsg = (error as { response?: { data?: { message?: string | string[] } } })?.response
    ?.data?.message
  if (Array.isArray(axiosMsg) && axiosMsg.length) return String(axiosMsg[0])
  if (typeof axiosMsg === 'string' && axiosMsg.trim()) return axiosMsg
  if (error instanceof Error && error.message) return error.message
  return t('students.registerFailedMessage')
}

const registerStudent = async () => {
  const student = formData.value.student
  if (!hasCompleteBilingualName(student) || !student.idNumber.trim() || !student.gender || !student.nationality.trim() || !student.dateOfBirth) {
    progressState.value = 'error'
    progressTitle.value = t('students.validationErrorTitle')
    progressMessage.value = t('students.validationFillRequired')
    showProgressDialog.value = true
    return
  }
  if (!selectedGroup.value) {
    progressState.value = 'error'
    progressTitle.value = t('students.validationErrorTitle')
    progressMessage.value = t('students.validationSelectGroup')
    showProgressDialog.value = true
    return
  }
  if (createStudentUser.value && !studentEmail.value.trim()) {
    progressState.value = 'error'
    progressTitle.value = t('students.validationErrorTitle')
    progressMessage.value = t('students.validationStudentEmail')
    showProgressDialog.value = true
    return
  }
  try {
    showProgressDialog.value = true
    progressState.value = 'loading'
    progressTitle.value = t('students.registeringTitle')
    progressMessage.value = t('students.registeringMessage')

    const created = await studentService.registerInApp(
      await mapStaffIntakeToRegisterRequest({
        form: formData.value,
        groupId: selectedGroup.value.id,
        selectedParent: null,
        createParentUser: true,
        createStudentUser: createStudentUser.value,
        studentEmail: studentEmail.value,
      }),
    )

    // Medical reports are attached to the new student record (kept in the database).
    const reports = (formData.value.health.medicalReports || []).filter((f): f is File => f instanceof File)
    let reportsFailed = 0
    for (const file of reports) {
      try {
        await studentService.uploadMedicalReport(created.id, file)
      } catch {
        reportsFailed += 1
      }
    }
    if (reportsFailed) feedback.error(t('students.medicalReportsPartial', { count: reportsFailed }))

    progressState.value = 'success'
    progressTitle.value = t('students.registerSuccessTitle')
    progressMessage.value = t('students.registerSuccessMessage', {
      name: student.fullName.trim(),
    })

    setTimeout(() => {
      showProgressDialog.value = false
      router.push('/students')
    }, 2000)
  } catch (error: unknown) {
    console.error('Registration failed:', error)
    progressState.value = 'error'
    progressTitle.value = t('students.registerFailedTitle')
    progressMessage.value = apiErrorMessage(error)
  }
}

onMounted(async () => {
  await loadAvailableGroups()
})
</script>
