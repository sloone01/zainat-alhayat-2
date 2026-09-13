<template>
  <DashboardLayout>
    <EnrollmentWizardChrome
      :title="$t('enrollment.editTitle')"
      :subtitle="$t('enrollment.editSubtitle')"
      :steps="steps"
      :current-step="currentStep"
    >
      <template #leading>
        <router-link
          to="/enrollments"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
          :aria-label="$t('common.back')"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
      </template>

      <div v-if="loading" class="py-8 text-center">
        <svg class="mx-auto h-8 w-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-500">{{ $t('common.loading') }}</p>
      </div>

      <StudentDetailsStep
        v-else-if="currentStep === 1"
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
      <GuardianInfoStep
        v-else-if="currentStep === 4"
        v-model="formData.guardian"
        compact
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
      <PaymentPlanStep
        v-else-if="currentStep === 6"
        v-model="selectedPlanId"
        :school-id="schoolId"
        :grade-level="formData.academic.gradeLevel"
        @next="handleNext"
        @back="handleBack"
      />
      <ReviewSubmitStep
        v-else-if="currentStep === 7"
        :form-data="formData"
        compact
        is-editing
        @submit="handleSubmit"
        @back="handleBack"
      />
    </EnrollmentWizardChrome>

    <div v-if="isSubmitting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="rounded-lg bg-white p-6 text-center">
        <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
        <p class="font-medium text-gray-900">{{ $t('enrollment.updating') }}</p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { enrollmentService } from '@/services/enrollment.service'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import EnrollmentWizardChrome from '@/components/enrollment/EnrollmentWizardChrome.vue'
import StudentDetailsStep from '@/components/enrollment/StudentDetailsStep.vue'
import AcademicInfoStep from '@/components/enrollment/AcademicInfoStep.vue'
import HealthInfoStep from '@/components/enrollment/HealthInfoStep.vue'
import GuardianInfoStep from '@/components/enrollment/GuardianInfoStep.vue'
import AddressInfoStep from '@/components/enrollment/AddressInfoStep.vue'
import PaymentPlanStep from '@/components/enrollment/PaymentPlanStep.vue'
import ReviewSubmitStep from '@/components/enrollment/ReviewSubmitStep.vue'
import { createEmptyStaffIntakeForm, fileToDataUrl, formatStaffIntakeDate, splitFullName } from '@/components/enrollment/staffIntake'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const enrollmentId = route.params.id as string
const currentStep = ref(1)
const totalSteps = 7
const loading = ref(true)
const isSubmitting = ref(false)
const formData = ref(createEmptyStaffIntakeForm())
const schoolId = ref('')
const selectedPlanId = ref<string | null>(null)

const steps = computed(() => [
  { key: 'student', shortTitle: t('enrollment.steps.student'), title: t('enrollment.steps.student'), description: t('enrollment.studentDetailsDescription') },
  { key: 'academic', shortTitle: t('enrollment.steps.academic'), title: t('enrollment.steps.academic'), description: t('enrollment.academicDescription') },
  { key: 'health', shortTitle: t('enrollment.steps.health'), title: t('enrollment.steps.health'), description: t('enrollment.healthDescription') },
  { key: 'guardian', shortTitle: t('enrollment.steps.guardian'), title: t('enrollment.steps.guardian'), description: t('enrollment.guardianDescription') },
  { key: 'address', shortTitle: t('enrollment.steps.address'), title: t('enrollment.steps.address'), description: t('enrollment.addressDescription') },
  { key: 'payment', shortTitle: t('enrollment.steps.payment'), title: t('enrollment.steps.payment'), description: t('enrollment.paymentPlanDescription') },
  { key: 'review', shortTitle: t('students.stepShortReview'), title: t('enrollment.steps.review'), description: t('enrollment.reviewDescription') },
])

const loadEnrollmentData = async () => {
  try {
    loading.value = true
    const enrollment = await enrollmentService.getEnrollment(enrollmentId)
    schoolId.value = enrollment.school_id || ''
    selectedPlanId.value = enrollment.installment_plan_id || null
    const studentNames = splitFullName(enrollment.fullName || '')
    const fatherNames = splitFullName(enrollment.fatherFullName || '')
    const motherNames = splitFullName(enrollment.motherFullName || '')
    formData.value = {
      student: {
        fullName: enrollment.fullName || '',
        first_name_ar: studentNames.firstName,
        first_name_en: studentNames.firstName,
        last_name_ar: studentNames.lastName,
        last_name_en: studentNames.lastName,
        tribe: enrollment.tribe || '',
        idNumber: enrollment.idNumber || '',
        gender: enrollment.gender || 'male',
        nationality: enrollment.nationality || '',
        religion: enrollment.religion || '',
        dateOfBirth: enrollment.dateOfBirth ? new Date(enrollment.dateOfBirth) : null,
        age: enrollment.age || null,
        hasSiblings: enrollment.hasSiblings || false,
        photo: enrollment.photo || null,
      },
      academic: {
        enrollmentStatus: enrollment.enrollmentStatus || 'new',
        gradeLevel: enrollment.gradeLevel || '',
        previousSchool: enrollment.previousSchool || '',
      },
      health: {
        allergies: enrollment.allergies || false,
        allergiesDetails: enrollment.allergiesDetails || '',
        seizures: enrollment.seizures || false,
        seizuresDetails: enrollment.seizuresDetails || '',
        surgeries: enrollment.surgeries || false,
        surgeriesDetails: enrollment.surgeriesDetails || '',
        chronicDiseases: enrollment.chronicDiseases || false,
        chronicDiseasesDetails: enrollment.chronicDiseasesDetails || '',
        other: enrollment.otherHealthInfo || '',
        medicalReports: enrollment.medicalReports || [],
      },
      guardian: {
        type: enrollment.guardianType || 'father',
        fatherInfo: {
          fullName: enrollment.fatherFullName || '',
          first_name_ar: fatherNames.firstName,
          first_name_en: fatherNames.firstName,
          last_name_ar: fatherNames.lastName,
          last_name_en: fatherNames.lastName,
          civil_id: '',
          tribe: enrollment.fatherTribe || '',
          workplace: enrollment.fatherWorkplace || '',
          workPhone: enrollment.fatherWorkPhone || '',
          mobile: enrollment.fatherMobile || '',
          email: enrollment.fatherEmail || '',
          maritalStatus: enrollment.fatherMaritalStatus || '',
        },
        motherInfo: {
          fullName: enrollment.motherFullName || '',
          first_name_ar: motherNames.firstName,
          first_name_en: motherNames.firstName,
          last_name_ar: motherNames.lastName,
          last_name_en: motherNames.lastName,
          civil_id: '',
          tribe: enrollment.motherTribe || '',
          workplace: enrollment.motherWorkplace || '',
          workPhone: enrollment.motherWorkPhone || '',
          mobile: enrollment.motherMobile || '',
          email: enrollment.motherEmail || '',
          maritalStatus: enrollment.motherMaritalStatus || '',
        },
        otherInfo: {
          organizationName: enrollment.organizationName || '',
          phone: enrollment.organizationPhone || '',
          responsiblePerson: enrollment.responsiblePerson || '',
          responsiblePhone: enrollment.responsiblePhone || '',
        },
        emergencyContact: {
          fullName: enrollment.emergencyContactName || '',
          tribe: enrollment.emergencyContactTribe || '',
          workplace: enrollment.emergencyContactWorkplace || '',
          workPhone: enrollment.emergencyContactWorkPhone || '',
          mobile: enrollment.emergencyContactMobile || '',
          relationship: enrollment.emergencyContactRelationship || '',
        },
      },
      address: {
        area: enrollment.area || '',
        village: enrollment.village || '',
        landmark: enrollment.landmark || '',
        streetNumber: enrollment.streetNumber || '',
        alleyNumber: enrollment.alleyNumber || '',
        buildingNumber: enrollment.buildingNumber || '',
        housingType: enrollment.housingType || 'house',
      },
    }
  } catch (error) {
    console.error('Failed to load enrollment data:', error)
    router.push('/enrollments')
  } finally {
    loading.value = false
  }
}

const handleNext = () => {
  if (currentStep.value === 6 && !selectedPlanId.value) return
  if (currentStep.value < totalSteps) currentStep.value++
}

const handleBack = () => {
  if (currentStep.value > 1) currentStep.value--
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    const photo = await fileToDataUrl(formData.value.student.photo)
    const result = await enrollmentService.updateEnrollment(enrollmentId, {
      student: {
        ...formData.value.student,
        dateOfBirth: formatStaffIntakeDate(formData.value.student.dateOfBirth) || null,
        photo: photo ?? null,
      },
      academic: formData.value.academic,
      health: formData.value.health,
      guardian: formData.value.guardian,
      address: formData.value.address,
      installment_plan_id: selectedPlanId.value,
    })
    router.push({
      path: '/enrollments',
      query: { updated: 'success', id: result.id },
    })
  } catch (error: unknown) {
    console.error('Enrollment update failed:', error)
    const message = error instanceof Error ? error.message : ''
    alert(t('enrollment.updateFailed', { message }))
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadEnrollmentData()
})
</script>
