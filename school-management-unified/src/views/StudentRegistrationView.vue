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
        compact
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
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('students.linkExistingGuardian') }}</h3>
              <p class="mt-0.5 text-xs text-gray-500">{{ $t('students.linkExistingGuardianHint') }}</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              @click="showParentSearch = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {{ $t('students.searchInParentDatabase') }}
            </button>
          </div>

          <div v-if="selectedParent" class="max-w-md">
            <ParentPickerCard
              :parent="selectedParent"
              variant="selected"
              @change="showParentSearch = true"
              @remove="clearParentSelection"
            />
          </div>
        </div>

        <label
          v-if="!selectedParent && formData.guardian.type !== 'other'"
          for="createParentUser"
          class="flex cursor-pointer items-start gap-2.5 rounded-xl border border-primary-100 bg-primary-50/60 px-3 py-2.5"
        >
          <input
            id="createParentUser"
            v-model="createParentUser"
            type="checkbox"
            class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          >
          <span class="min-w-0 leading-snug">
            <span class="text-sm font-medium text-primary-900">{{ $t('students.createUserAccount') }}</span>
            <span class="mt-0.5 block text-xs text-primary-800/80">{{ $t('students.createUserAccountNote') }}</span>
          </span>
        </label>

        <GuardianInfoStep
          :key="selectedParent?.id ?? 'new-guardian'"
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
        <div>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">{{ $t('students.selectGroup') }}</h3>
          <div
            v-if="availableGroups.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center"
          >
            <p class="text-sm font-medium text-gray-700">{{ $t('students.noGroupsAvailable') }}</p>
          </div>
          <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="group in availableGroups"
              :key="group.id"
              type="button"
              class="rounded-xl border p-4 text-start transition"
              :class="[
                selectedGroup?.id === group.id
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200'
                  : group.capacity <= group.currentStudents
                    ? 'cursor-not-allowed border-red-200 bg-red-50/60'
                    : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50/30',
              ]"
              :disabled="group.capacity <= group.currentStudents"
              @click="selectGroup(group)"
            >
              <div class="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h4 class="font-semibold text-gray-900">{{ group.name }}</h4>
                  <p v-if="group.ageGroup" class="text-sm text-gray-600">{{ group.ageGroup }}</p>
                </div>
                <span
                  class="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                  :class="selectedGroup?.id === group.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'"
                  aria-hidden="true"
                />
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">{{ $t('students.capacity') }}:</span>
                <span
                  class="font-medium tabular-nums"
                  :class="group.currentStudents >= group.capacity ? 'text-red-600' : 'text-gray-900'"
                >
                  {{ group.currentStudents }}/{{ group.capacity }}
                </span>
              </div>
            </button>
          </div>
        </div>

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
            <p><span class="font-medium text-gray-900">{{ $t('enrollment.fullName') }}:</span> {{ formData.student.fullName || '—' }}</p>
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

    <ParentSearchModal
      v-if="showParentSearch"
      :show="showParentSearch"
      @close="showParentSearch = false"
      @select="selectParentFromSearch"
    />

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
import ParentSearchModal from '@/components/ParentSearchModal.vue'
import ParentPickerCard from '@/components/ParentPickerCard.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { studentService } from '@/services/student.service'
import { groupService } from '@/services/group.service'
import { type Parent } from '@/services/parent.service'
import {
  applyParentToGuardian,
  createEmptyStaffIntakeForm,
  mapStaffIntakeToRegisterRequest,
} from '@/components/enrollment/staffIntake'

const { t } = useI18n()
const router = useRouter()

const currentStep = ref(1)
const showParentSearch = ref(false)
const createParentUser = ref(false)
const createStudentUser = ref(false)
const studentEmail = ref('')
const selectedParent = ref<Parent | null>(null)
const selectedGroup = ref<any>(null)
const availableGroups = ref<any[]>([])
const formData = ref(createEmptyStaffIntakeForm())

const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')

const steps = computed(() => [
  { key: 'student', shortTitle: t('students.stepShortStudent'), title: t('enrollment.steps.student'), description: t('enrollment.studentDetailsDescription') },
  { key: 'academic', shortTitle: t('students.stepShortAcademic'), title: t('enrollment.steps.academic'), description: t('enrollment.academicDescription') },
  { key: 'health', shortTitle: t('students.stepShortHealth'), title: t('enrollment.steps.health'), description: t('enrollment.healthDescription') },
  { key: 'guardian', shortTitle: t('students.stepShortGuardian'), title: t('enrollment.steps.guardian'), description: t('enrollment.guardianDescription') },
  { key: 'address', shortTitle: t('students.stepShortAddress'), title: t('enrollment.steps.address'), description: t('enrollment.addressDescription') },
  { key: 'group', shortTitle: t('students.stepShortGroup'), title: t('students.groupAssignment'), description: t('students.groupAssignmentDescription') },
])

const guardianSummary = computed(() => {
  if (selectedParent.value) {
    return `${selectedParent.value.firstName ?? ''} ${selectedParent.value.lastName ?? ''}`.trim()
  }
  const g = formData.value.guardian
  if (g.type === 'mother') return g.motherInfo.fullName || '—'
  if (g.type === 'other') return g.otherInfo.responsiblePerson || g.otherInfo.organizationName || '—'
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
    const groups = await groupService.getActive(1)
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

function clearParentSelection() {
  selectedParent.value = null
}

const selectParentFromSearch = (parent: Parent) => {
  selectedParent.value = parent
  formData.value.guardian = applyParentToGuardian(formData.value.guardian, parent)
  createParentUser.value = false
  showParentSearch.value = false
}

const selectGroup = (group: any) => {
  if (group.currentStudents < group.capacity) {
    selectedGroup.value = group
  }
}

const registerStudent = async () => {
  const student = formData.value.student
  if (!student.fullName.trim() || !student.idNumber.trim() || !student.gender || !student.nationality.trim() || !student.dateOfBirth) {
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
  if (createParentUser.value && !selectedParent.value) {
    const info =
      formData.value.guardian.type === 'mother'
        ? formData.value.guardian.motherInfo
        : formData.value.guardian.fatherInfo
    if (formData.value.guardian.type !== 'other' && !info.email.trim()) {
      progressState.value = 'error'
      progressTitle.value = t('students.validationErrorTitle')
      progressMessage.value = t('students.validationParentDetails')
      showProgressDialog.value = true
      return
    }
  }

  try {
    showProgressDialog.value = true
    progressState.value = 'loading'
    progressTitle.value = t('students.registeringTitle')
    progressMessage.value = t('students.registeringMessage')

    await studentService.registerInApp(
      await mapStaffIntakeToRegisterRequest({
        form: formData.value,
        groupId: selectedGroup.value.id,
        selectedParent: selectedParent.value,
        createParentUser: createParentUser.value,
        createStudentUser: createStudentUser.value,
        studentEmail: studentEmail.value,
      }),
    )

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
