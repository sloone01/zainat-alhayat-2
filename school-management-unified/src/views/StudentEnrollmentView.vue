<template>
  <div
    class="enrollment-branded min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
    :dir="isRTL ? 'rtl' : 'ltr'"
    :style="brandStyle"
  >
    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <EnrollmentWizardChrome
        :title="schoolMeta?.name || $t('enrollment.title')"
        :subtitle="$t('enrollment.subtitle')"
        :steps="steps"
        :current-step="currentStep"
      >
        <template #leading>
          <div class="flex items-center gap-3">
            <router-link
              :to="backToSchoolPath"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              :aria-label="$t('common.back')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <img
              v-if="schoolLogoSrc"
              :src="schoolLogoSrc"
              :alt="schoolMeta?.name || ''"
              class="h-12 w-12 shrink-0 rounded-xl border border-white/20 bg-white object-contain p-1 shadow-sm sm:h-14 sm:w-14"
            />
            <div
              v-else-if="schoolMeta"
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white ring-1 ring-white/25 sm:h-14 sm:w-14 sm:text-base"
              aria-hidden="true"
            >
              {{ schoolInitials }}
            </div>
          </div>
        </template>

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
          :school-id="schoolId"
          compact
          @submit="handleSubmit"
          @back="handleBack"
        />
      </EnrollmentWizardChrome>
    </div>

    <div v-if="isSubmitting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="rounded-lg bg-white p-6 text-center">
        <div class="enroll-spinner mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
        <p class="font-medium text-gray-900">{{ $t('enrollment.submitting') }}</p>
      </div>
    </div>

    <div v-if="showSuccessDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="mb-4 text-2xl font-bold text-gray-900">{{ $t('enrollment.success.title') }}</h2>
        <p class="mb-8 leading-relaxed text-gray-600">{{ $t('enrollment.success.message') }}</p>
        <button
          type="button"
          class="enroll-primary-btn w-full rounded-lg px-6 py-3 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          @click="handleSuccessOk"
        >
          {{ $t('common.ok') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { enrollmentService, type EnrollmentFormData } from '@/services/enrollment.service'
import { schoolLandingService, type SchoolLandingMeta } from '@/services/school-landing.service'
import { useFeedback } from '@/composables/useFeedback'
import { isSchoolIdUuid } from '@/utils/auth-token'
import { mediaUrl } from '@/utils/thawaniCheckout'
import { createEmptyStaffIntakeForm } from '@/components/enrollment/staffIntake'
import EnrollmentWizardChrome from '@/components/enrollment/EnrollmentWizardChrome.vue'
import StudentDetailsStep from '@/components/enrollment/StudentDetailsStep.vue'
import AcademicInfoStep from '@/components/enrollment/AcademicInfoStep.vue'
import HealthInfoStep from '@/components/enrollment/HealthInfoStep.vue'
import GuardianInfoStep from '@/components/enrollment/GuardianInfoStep.vue'
import AddressInfoStep from '@/components/enrollment/AddressInfoStep.vue'
import PaymentPlanStep from '@/components/enrollment/PaymentPlanStep.vue'
import ReviewSubmitStep from '@/components/enrollment/ReviewSubmitStep.vue'

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const feedback = useFeedback()

const isRTL = computed(() => locale.value === 'ar')

const schoolId = ref('')
const schoolMeta = ref<SchoolLandingMeta | null>(null)

const schoolLogoSrc = computed(() => {
  const fromConfig = mediaUrl(schoolMeta.value?.logo_url)
  if (fromConfig) return fromConfig
  return schoolMeta.value ? '/zlogo.jpeg' : ''
})

const brandStyle = computed(() => {
  const primary = schoolMeta.value?.brand_primary_color?.trim()
  const accent = schoolMeta.value?.brand_accent_color?.trim()
  if (!primary && !accent) return undefined
  return {
    '--brand-primary': primary || '#0d9488',
    '--brand-accent': accent || primary || '#10b981',
  } as Record<string, string>
})

const schoolInitials = computed(() => {
  const name = schoolMeta.value?.name?.trim() || ''
  if (!name) return '?'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase()
})

const backToSchoolPath = computed(() => {
  const slug = schoolMeta.value?.landing_slug?.trim()
  return slug ? `/s/${slug}` : '/'
})

const currentStep = ref(1)
const totalSteps = 7
const isSubmitting = ref(false)
const showSuccessDialog = ref(false)
const formData = ref(createEmptyStaffIntakeForm())
const selectedPlanId = ref<string | null>(null)

const steps = computed(() => [
  {
    key: 'student',
    shortTitle: t('students.stepShortStudent'),
    title: t('enrollment.steps.student'),
    description: t('enrollment.studentDetailsDescription'),
  },
  {
    key: 'academic',
    shortTitle: t('students.stepShortAcademic'),
    title: t('enrollment.steps.academic'),
    description: t('enrollment.academicDescription'),
  },
  {
    key: 'health',
    shortTitle: t('students.stepShortHealth'),
    title: t('enrollment.steps.health'),
    description: t('enrollment.healthDescription'),
  },
  {
    key: 'guardian',
    shortTitle: t('students.stepShortGuardian'),
    title: t('enrollment.steps.guardian'),
    description: t('enrollment.guardianDescription'),
  },
  {
    key: 'address',
    shortTitle: t('students.stepShortAddress'),
    title: t('enrollment.steps.address'),
    description: t('enrollment.addressDescription'),
  },
  {
    key: 'payment',
    shortTitle: t('students.stepShortPayment'),
    title: t('enrollment.steps.payment'),
    description: t('enrollment.paymentPlanDescription'),
  },
  {
    key: 'review',
    shortTitle: t('students.stepShortReview'),
    title: t('enrollment.steps.review'),
    description: t('enrollment.reviewDescription'),
  },
])

const handleNext = () => {
  if (currentStep.value < totalSteps) currentStep.value++
}

const handleBack = () => {
  if (currentStep.value > 1) currentStep.value--
}

const validateEmail = (email: string): boolean => {
  if (!email) return true
  return emailRegex.test(email)
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    if (!schoolId.value || !isSchoolIdUuid(schoolId.value)) {
      feedback.error(t('enrollment.schoolRequired'))
      isSubmitting.value = false
      return
    }

    if (!selectedPlanId.value) {
      feedback.error(t('enrollment.selectInstallmentPlanRequired'))
      isSubmitting.value = false
      return
    }

    const fatherEmail = formData.value.guardian.fatherInfo.email
    const motherEmail = formData.value.guardian.motherInfo.email

    if (fatherEmail && !validateEmail(fatherEmail)) {
      feedback.error(t('enrollment.invalidFatherEmail'))
      isSubmitting.value = false
      return
    }

    if (motherEmail && !validateEmail(motherEmail)) {
      feedback.error(t('enrollment.invalidMotherEmail'))
      isSubmitting.value = false
      return
    }

    const enrollmentData: EnrollmentFormData = {
      school_id: schoolId.value,
      installment_plan_id: selectedPlanId.value,
      student: {
        ...formData.value.student,
        dateOfBirth:
          formData.value.student.dateOfBirth instanceof Date
            ? formData.value.student.dateOfBirth.toISOString().split('T')[0]
            : formData.value.student.dateOfBirth,
      },
      academic: formData.value.academic,
      health: formData.value.health,
      guardian: formData.value.guardian,
      address: formData.value.address,
    }

    await enrollmentService.submitEnrollment(enrollmentData)
    showSuccessDialog.value = true
  } catch (error: unknown) {
    console.error('Enrollment submission failed:', error)
    const message = error instanceof Error ? error.message : t('enrollment.submitError')
    feedback.error(message)
  } finally {
    isSubmitting.value = false
  }
}

const handleSuccessOk = () => {
  showSuccessDialog.value = false
  router.push(backToSchoolPath.value)
}

async function resolveSchoolId() {
  schoolMeta.value = null
  const fromQuery = typeof route.query.school_id === 'string' ? route.query.school_id.trim() : ''
  if (!fromQuery || !isSchoolIdUuid(fromQuery)) {
    schoolId.value = ''
    feedback.error(t('enrollment.schoolRequired'))
    return
  }
  schoolId.value = fromQuery
  try {
    schoolMeta.value = await schoolLandingService.getSchoolMetaById(fromQuery)
  } catch (e) {
    console.error(e)
    schoolMeta.value = null
    // Valid school_id is kept — branding failed; form can still submit.
    feedback.error(t('enrollment.schoolMetaLoadError'))
  }
}

onMounted(() => {
  void resolveSchoolId()
})
</script>

<style scoped>
.enrollment-branded {
  --brand-primary: #0d9488;
  --brand-accent: #10b981;
}
.enroll-spinner {
  border-bottom-color: var(--brand-primary);
}
.enroll-primary-btn {
  background-color: var(--brand-primary);
}
.enroll-primary-btn:hover {
  filter: brightness(0.92);
}
.enroll-primary-btn:focus {
  --tw-ring-color: var(--brand-primary);
}
.enrollment-branded :deep(.bg-primary-600),
.enrollment-branded :deep(.bg-primary-500) {
  background-color: var(--brand-primary) !important;
}
.enrollment-branded :deep(.from-primary-600) {
  --tw-gradient-from: var(--brand-primary) var(--tw-gradient-from-position) !important;
}
.enrollment-branded :deep(.to-primary-700),
.enrollment-branded :deep(.to-primary-600) {
  --tw-gradient-to: var(--brand-accent) var(--tw-gradient-to-position) !important;
}
.enrollment-branded :deep(.text-primary-600),
.enrollment-branded :deep(.text-primary-700),
.enrollment-branded :deep(.text-primary-800) {
  color: var(--brand-primary) !important;
}
.enrollment-branded :deep(.border-primary-500),
.enrollment-branded :deep(.border-primary-600),
.enrollment-branded :deep(.ring-primary-100),
.enrollment-branded :deep(.ring-primary-500\/40) {
  --tw-ring-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}
</style>
