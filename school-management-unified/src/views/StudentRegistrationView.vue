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
        mode="staff"
        :school-id="schoolId"
        @next="handleNext"
        @draft-loaded="onDraftLoaded"
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
import { getErrorMessage } from '@/utils/error-reporting'
import { isNotFutureDate } from '@/utils/validation'
import {
  createEmptyStaffIntakeForm,
  hasCompleteStudentIdentity,
  mapStaffIntakeToDraftParentsRequest,
  mapStaffIntakeToDraftRequest,
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
/** Persisted after step 1 Next; finalized to active on last submit. */
const draftStudentId = ref<string | null>(null)
const draftSaving = ref(false)

const onDraftLoaded = (id: string | null) => {
  draftStudentId.value = id
}

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

const handleNext = async () => {
  const step = currentStep.value
  const student = formData.value.student

  if (step === 1) {
    if (
      !hasCompleteStudentIdentity(student) ||
      !student.idNumber.trim() ||
      !student.gender ||
      !student.nationality.trim() ||
      !student.dateOfBirth
    ) {
      feedback.error(t('students.validationFillRequired'), t('students.validationErrorTitle'))
      return
    }
    if (!isNotFutureDate(student.dateOfBirth)) {
      feedback.error(t('validation.dateOfBirthFuture'), t('students.validationErrorTitle'))
      return
    }
    try {
      const lookup = await studentService.lookupByCivilId(student.idNumber)
      if (lookup.already_registered) {
        feedback.error(t('enrollment.civilIdAlreadyRegistered'), t('students.validationErrorTitle'))
        return
      }
      if (
        lookup.registration_in_progress_elsewhere ||
        (lookup.status === 'draft' && !lookup.same_school)
      ) {
        feedback.error(t('enrollment.civilIdDraftElsewhere'), t('students.validationErrorTitle'))
        return
      }
      if (lookup.status === 'draft' && lookup.same_school && lookup.student?.id) {
        draftStudentId.value = lookup.student.id
      }
    } catch {
      // Backend save will still enforce uniqueness.
    }
  }

  if (step >= 1 && step <= 5) {
    if (!draftStudentId.value && step > 1) {
      feedback.error(t('students.registerFailedMessage'), t('students.registerFailedTitle'))
      return
    }
    draftSaving.value = true
    try {
      if (step === 1 || step === 2 || step === 3 || step === 5) {
        const draft = await studentService.saveRegisterDraft(
          await mapStaffIntakeToDraftRequest({
            form: formData.value,
            draftStudentId: draftStudentId.value,
          }),
        )
        draftStudentId.value = draft.id
      }
      if (step === 4) {
        if (!draftStudentId.value) {
          feedback.error(t('students.registerFailedMessage'), t('students.registerFailedTitle'))
          return
        }
        const parentsPayload = mapStaffIntakeToDraftParentsRequest({
          form: formData.value,
          draftStudentId: draftStudentId.value,
        })
        if (!parentsPayload.parents.length) {
          feedback.error(t('students.registerErrorParentRequired'), t('students.validationErrorTitle'))
          return
        }
        await studentService.saveRegisterDraftParents(parentsPayload)
      }
    } catch (error: unknown) {
      feedback.error(apiErrorMessage(error), t('students.registerFailedTitle'))
      return
    } finally {
      draftSaving.value = false
    }
  }

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
  const status = (error as { response?: { status?: number } })?.response?.status
  const raw = getErrorMessage(error, '')
  const msg = raw.trim()

  if (/Date of birth cannot be in the future/i.test(msg)) {
    return t('validation.dateOfBirthFuture')
  }
  if (/Invalid date of birth/i.test(msg)) {
    return t('validation.dateOfBirthFuture')
  }
  if (/Another student already has this civil ID/i.test(msg) || /This civil ID is already registered/i.test(msg)) {
    return t('students.registerErrorCivilIdTakenStudent')
  }
  if (/Registration for this civil ID is already in progress at another school/i.test(msg)) {
    return t('students.registerErrorCivilIdDraftElsewhere')
  }
  if (/Another user already has this civil ID/i.test(msg)) {
    return t('students.registerErrorCivilIdTakenUser')
  }
  if (/at full capacity/i.test(msg)) {
    return t('students.registerErrorGroupFull')
  }
  if (/no fee level/i.test(msg)) {
    return t('students.registerErrorGroupNoLevel')
  }
  if (/Group with ID .+ not found/i.test(msg)) {
    return t('students.registerErrorGroupNotFound')
  }
  if (/A parent is required/i.test(msg)) {
    return t('students.registerErrorParentRequired')
  }
  if (/Parent Arabic and English/i.test(msg)) {
    return t('students.registerErrorParentNames')
  }
  if (/Parent email is required/i.test(msg)) {
    return t('students.registerErrorParentEmail')
  }
  if (/Student Arabic and English/i.test(msg)) {
    return t('students.registerErrorStudentNames')
  }
  if (/Arabic and English first, second, third, and family/i.test(msg) || /second name, third name, and tribe/i.test(msg)) {
    return t('students.registerErrorStudentIdentity')
  }
  if (/Student email is required/i.test(msg)) {
    return t('students.registerErrorStudentEmail')
  }
  if (/column .+ does not exist/i.test(msg)) {
    return t('students.registerErrorDatabaseSchema')
  }
  if (/username or email already exists/i.test(msg) || /already uses this email/i.test(msg)) {
    return t('students.registerErrorEmailTaken')
  }
  if (/PARENT_EXISTS/i.test(msg)) {
    return t('students.registerErrorParentExists')
  }
  if (status === 403 || /^Not allowed$/i.test(msg) || /Forbidden/i.test(msg)) {
    return t('students.registerErrorForbidden')
  }
  // Axios default when the body had no usable message
  if (!msg || /^Request failed with status code \d+$/i.test(msg)) {
    return t('students.registerFailedMessage')
  }
  return msg
}

const registerStudent = async () => {
  const student = formData.value.student
  if (!hasCompleteStudentIdentity(student) || !student.idNumber.trim() || !student.gender || !student.nationality.trim() || !student.dateOfBirth) {
    progressState.value = 'error'
    progressTitle.value = t('students.validationErrorTitle')
    progressMessage.value = t('students.validationFillRequired')
    showProgressDialog.value = true
    return
  }
  if (!isNotFutureDate(student.dateOfBirth)) {
    progressState.value = 'error'
    progressTitle.value = t('students.validationErrorTitle')
    progressMessage.value = t('validation.dateOfBirthFuture')
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
    // Re-validate civil ID before final submit (registered / draft elsewhere).
    const lookup = await studentService.lookupByCivilId(student.idNumber)
    if (lookup.already_registered) {
      progressState.value = 'error'
      progressTitle.value = t('students.validationErrorTitle')
      progressMessage.value = t('enrollment.civilIdAlreadyRegistered')
      showProgressDialog.value = true
      return
    }
    if (
      lookup.registration_in_progress_elsewhere ||
      (lookup.status === 'draft' && !lookup.same_school)
    ) {
      progressState.value = 'error'
      progressTitle.value = t('students.validationErrorTitle')
      progressMessage.value = t('enrollment.civilIdDraftElsewhere')
      showProgressDialog.value = true
      return
    }

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
        draftStudentId: draftStudentId.value,
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
