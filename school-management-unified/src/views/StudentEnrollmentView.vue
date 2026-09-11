<template>
  <div
    class="enrollment-branded min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
    :dir="isRTL ? 'rtl' : 'ltr'"
    :style="brandStyle"
  >
    <div class="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <FikrPageHeader
        :title="schoolMeta?.name || $t('enrollment.title')"
        :subtitle="$t('enrollment.subtitle')"
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
              class="h-16 w-16 shrink-0 rounded-2xl border border-white/20 bg-white object-contain p-1.5 shadow-sm sm:h-20 sm:w-20"
            />
            <div
              v-else-if="schoolMeta"
              class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-base font-bold text-white ring-1 ring-white/25 sm:h-20 sm:w-20 sm:text-lg"
              aria-hidden="true"
            >
              {{ schoolInitials }}
            </div>
          </div>
        </template>
      </FikrPageHeader>
    </div>

    <div v-if="schoolResolveError" class="mx-auto mt-4 max-w-6xl px-4 sm:px-6 lg:px-8">
      <p class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ schoolResolveError }}
      </p>
    </div>

    <!-- Progress Bar -->
    <div class="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <!-- Mobile Progress -->
        <div class="flex items-center justify-between mb-4 lg:hidden">
          <span class="text-sm font-medium text-gray-900">{{ $t('enrollment.step') }} {{ currentStep }}</span>
          <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {{ Math.round((currentStep / totalSteps) * 100) }}%
          </span>
        </div>

        <!-- Desktop Progress -->
        <div class="hidden lg:flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4" :class="{ 'space-x-reverse': isRTL }">
            <span class="text-lg font-medium text-gray-900">{{ $t('enrollment.step') }} {{ currentStep }} {{ $t('enrollment.of') }} {{ totalSteps }}</span>
          </div>
          <div class="flex-1 mx-8">
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="enroll-progress-fill h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
              ></div>
            </div>
          </div>
          <div class="text-lg font-semibold enroll-primary-text">
            {{ Math.round((currentStep / totalSteps) * 100) }}%
          </div>
        </div>

        <!-- Mobile Simple Progress Bar -->
        <div class="lg:hidden mb-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="enroll-progress-fill h-2 rounded-full transition-all duration-500"
              :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Step Labels -->
        <div class="grid grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-4">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex flex-col items-center text-center"
            :class="{
              'opacity-50': index + 1 > currentStep,
              'hidden lg:flex': index >= 4
            }"
          >
            <div
              class="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all duration-300 shadow-sm"
              :class="[
                index + 1 < currentStep
                  ? 'enroll-step-done text-white'
                  : index + 1 === currentStep
                  ? 'enroll-step-active text-white ring-2 ring-offset-1'
                  : 'bg-gray-200 text-gray-600'
              ]"
            >
              <svg
                v-if="index + 1 < currentStep"
                class="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="text-xs lg:text-sm">{{ index + 1 }}</span>
            </div>
            <span class="text-xs lg:text-sm font-medium text-gray-900 px-1 leading-tight">{{ $t(step.label) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <div class="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
        <!-- Step 1: Student Details -->
        <div v-if="currentStep === 1">
          <StudentDetailsStep
            v-model="formData.student"
            @next="handleNext"
            @back="handleBack"
          />
        </div>

        <!-- Step 2: Academic Information -->
        <div v-if="currentStep === 2">
          <AcademicInfoStep
            v-model="formData.academic"
            @next="handleNext"
            @back="handleBack"
          />
        </div>

        <!-- Step 3: Health Information -->
        <div v-if="currentStep === 3">
          <HealthInfoStep
            v-model="formData.health"
            @next="handleNext"
            @back="handleBack"
          />
        </div>

        <!-- Step 4: Guardian Information -->
        <div v-if="currentStep === 4">
          <GuardianInfoStep
            v-model="formData.guardian"
            @next="handleNext"
            @back="handleBack"
          />
        </div>

        <!-- Step 5: Address Information -->
        <div v-if="currentStep === 5">
          <AddressInfoStep
            v-model="formData.address"
            @next="handleNext"
            @back="handleBack"
          />
        </div>

        <!-- Step 6: Review & Submit -->
        <div v-if="currentStep === 6">
          <ReviewSubmitStep
            :formData="formData"
            @submit="handleSubmit"
            @back="handleBack"
          />
        </div>
      </div>
    </main>

    <!-- Loading Overlay -->
    <div v-if="isSubmitting" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 enroll-spinner mx-auto mb-4"></div>
        <p class="text-gray-900 font-medium">{{ $t('enrollment.submitting') }}</p>
      </div>
    </div>

    <!-- Success Dialog -->
    <div v-if="showSuccessDialog" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-8 text-center max-w-md mx-4 shadow-2xl">
        <!-- Success Icon -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <!-- Success Message -->
        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('enrollment.success.title') }}</h2>
        <p class="text-gray-600 mb-8 leading-relaxed">{{ $t('enrollment.success.message') }}</p>

        <!-- OK Button -->
        <button
          @click="handleSuccessOk"
          class="w-full enroll-primary-btn text-white py-3 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
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
import { isSchoolIdUuid } from '@/utils/auth-token'
import { mediaUrl } from '@/utils/thawaniCheckout'
import FikrPageHeader from '@/components/FikrPageHeader.vue'

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Components
import StudentDetailsStep from '@/components/enrollment/StudentDetailsStep.vue'
import AcademicInfoStep from '@/components/enrollment/AcademicInfoStep.vue'
import HealthInfoStep from '@/components/enrollment/HealthInfoStep.vue'
import GuardianInfoStep from '@/components/enrollment/GuardianInfoStep.vue'
import AddressInfoStep from '@/components/enrollment/AddressInfoStep.vue'
import ReviewSubmitStep from '@/components/enrollment/ReviewSubmitStep.vue'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()

const isRTL = computed(() => locale.value === 'ar')

const schoolId = ref('')
const schoolMeta = ref<SchoolLandingMeta | null>(null)
const schoolResolveError = ref('')

const schoolLogoSrc = computed(() => {
  const fromConfig = mediaUrl(schoolMeta.value?.logo_url)
  if (fromConfig) return fromConfig
  // Bundled fallback used by school chrome until a logo is uploaded in Settings.
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

// Form state
const currentStep = ref(1)
const totalSteps = 6
const isSubmitting = ref(false)
const showSuccessDialog = ref(false)

// Steps configuration
const steps = [
  { label: 'enrollment.steps.student' },
  { label: 'enrollment.steps.academic' },
  { label: 'enrollment.steps.health' },
  { label: 'enrollment.steps.guardian' },
  { label: 'enrollment.steps.address' },
  { label: 'enrollment.steps.review' }
]

// Form data - empty for fresh start
const formData = ref({
  student: {
    fullName: '',
    first_name_ar: '',
    first_name_en: '',
    last_name_ar: '',
    last_name_en: '',
    tribe: '',
    idNumber: '',
    gender: 'male',
    nationality: '',
    religion: '',
    dateOfBirth: null,
    age: null,
    hasSiblings: false,
    photo: null
  },
  academic: {
    enrollmentStatus: 'new', // 'new' or 'transfer'
    gradeLevel: '',
    previousSchool: ''
  },
  health: {
    allergies: false,
    allergiesDetails: '',
    seizures: false,
    seizuresDetails: '',
    surgeries: false,
    surgeriesDetails: '',
    chronicDiseases: false,
    chronicDiseasesDetails: '',
    other: '',
    medicalReports: []
  },
  guardian: {
    type: 'father', // 'father', 'mother', 'other'
    fatherInfo: {
      fullName: '',
      first_name_ar: '',
      first_name_en: '',
      last_name_ar: '',
      last_name_en: '',
      civil_id: '',
      tribe: '',
      workplace: '',
      workPhone: '',
      mobile: '',
      email: '',
      maritalStatus: ''
    },
    motherInfo: {
      fullName: '',
      first_name_ar: '',
      first_name_en: '',
      last_name_ar: '',
      last_name_en: '',
      civil_id: '',
      tribe: '',
      workplace: '',
      workPhone: '',
      mobile: '',
      email: '',
      maritalStatus: ''
    },
    otherInfo: {
      organizationName: '',
      phone: '',
      responsiblePerson: '',
      responsiblePhone: ''
    },
    emergencyContact: {
      fullName: '',
      tribe: '',
      workplace: '',
      workPhone: '',
      mobile: '',
      relationship: ''
    }
  },
  address: {
    area: '',
    village: '',
    landmark: '',
    streetNumber: '',
    alleyNumber: '',
    buildingNumber: '',
    housingType: 'house' // 'house' or 'apartment'
  }
})

// Navigation methods
const handleNext = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Email validation function
const validateEmail = (email: string): boolean => {
  if (!email) return true // Empty email is allowed
  return emailRegex.test(email)
}

// Submit handler
const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    if (!schoolId.value || !isSchoolIdUuid(schoolId.value)) {
      window.alert(t('enrollment.schoolRequired'))
      isSubmitting.value = false
      return
    }

    // Validate emails before submission
    const fatherEmail = formData.value.guardian.fatherInfo.email
    const motherEmail = formData.value.guardian.motherInfo.email

    if (fatherEmail && !validateEmail(fatherEmail)) {
      alert('البريد الإلكتروني للأب غير صحيح')
      isSubmitting.value = false
      return
    }

    if (motherEmail && !validateEmail(motherEmail)) {
      alert('البريد الإلكتروني للأم غير صحيح')
      isSubmitting.value = false
      return
    }

    // Prepare the data for submission with proper date formatting
    const enrollmentData: EnrollmentFormData = {
      school_id: schoolId.value,
      student: {
        ...formData.value.student,
        dateOfBirth: formData.value.student.dateOfBirth instanceof Date
          ? formData.value.student.dateOfBirth.toISOString().split('T')[0]
          : formData.value.student.dateOfBirth
      },
      academic: formData.value.academic,
      health: formData.value.health,
      guardian: formData.value.guardian,
      address: formData.value.address
    }

    // Submit to the API
    const result = await enrollmentService.submitEnrollment(enrollmentData)

    console.log('Enrollment submitted successfully:', result)

    // Show success dialog instead of immediate redirect
    showSuccessDialog.value = true

  } catch (error) {
    console.error('Enrollment submission failed:', error)

    // Show error message to user
    alert(`حدث خطأ أثناء إرسال الطلب: ${error.message || 'خطأ غير معروف'}`)
  } finally {
    isSubmitting.value = false
  }
}

// Handle success dialog OK button
const handleSuccessOk = () => {
  showSuccessDialog.value = false
  router.push(backToSchoolPath.value)
}

async function resolveSchoolId() {
  schoolResolveError.value = ''
  schoolMeta.value = null
  const fromQuery = typeof route.query.school_id === 'string' ? route.query.school_id.trim() : ''
  if (!fromQuery || !isSchoolIdUuid(fromQuery)) {
    schoolId.value = ''
    schoolResolveError.value = t('enrollment.schoolRequired')
    return
  }
  schoolId.value = fromQuery
  try {
    schoolMeta.value = await schoolLandingService.getSchoolMetaById(fromQuery)
  } catch (e) {
    console.error(e)
    schoolMeta.value = null
    schoolResolveError.value = t('enrollment.schoolRequired')
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
.enroll-progress-fill {
  background-image: linear-gradient(to right, var(--brand-primary), var(--brand-accent));
}
.enroll-primary-text {
  color: var(--brand-primary);
}
.enroll-step-done {
  background-color: var(--brand-accent);
}
.enroll-step-active {
  background-color: var(--brand-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary) 35%, white);
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
.enrollment-branded :deep(.text-primary-600),
.enrollment-branded :deep(.text-primary-700) {
  color: var(--brand-primary) !important;
}
.enrollment-branded :deep(.border-primary-600),
.enrollment-branded :deep(.border-primary-500) {
  border-color: var(--brand-primary) !important;
}
.enrollment-branded :deep(.from-primary-600) {
  --tw-gradient-from: var(--brand-primary) var(--tw-gradient-from-position);
}
.enrollment-branded :deep(.to-emerald-500),
.enrollment-branded :deep(.via-primary-500) {
  --tw-gradient-to: var(--brand-accent) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--brand-accent), var(--tw-gradient-to);
}
</style>