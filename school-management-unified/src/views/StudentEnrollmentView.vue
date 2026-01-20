<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-4 lg:py-6">
          <div class="flex items-center space-x-3 sm:space-x-4" :class="{ 'space-x-reverse': isRTL }">
            <img src="/zlogo.jpeg" alt="Zinat Al-Haya Kindergarten" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm">
            <div>
              <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{{ $t('enrollment.title') }}</h1>
              <p class="text-xs sm:text-sm text-gray-600 hidden sm:block">{{ $t('enrollment.subtitle') }}</p>
            </div>
          </div>
          <router-link
            to="/"
            class="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <svg class="w-4 h-4" :class="{ 'mr-1': !isRTL, 'ml-1': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
            </svg>
            {{ $t('common.back') }}
          </router-link>
        </div>
      </div>
    </header>

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
                class="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
              ></div>
            </div>
          </div>
          <div class="text-lg font-semibold text-primary-600">
            {{ Math.round((currentStep / totalSteps) * 100) }}%
          </div>
        </div>

        <!-- Mobile Simple Progress Bar -->
        <div class="lg:hidden mb-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
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
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : index + 1 === currentStep
                  ? 'bg-primary-600 text-white shadow-primary-200 ring-2 ring-primary-200'
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
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
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
          class="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {{ $t('common.ok') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { enrollmentService, type EnrollmentFormData } from '@/services/enrollment.service'

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Components
import StudentDetailsStep from '@/components/enrollment/StudentDetailsStep.vue'
import AcademicInfoStep from '@/components/enrollment/AcademicInfoStep.vue'
import HealthInfoStep from '@/components/enrollment/HealthInfoStep.vue'
import GuardianInfoStep from '@/components/enrollment/GuardianInfoStep.vue'
import AddressInfoStep from '@/components/enrollment/AddressInfoStep.vue'
import ReviewSubmitStep from '@/components/enrollment/ReviewSubmitStep.vue'

const { locale } = useI18n()
const router = useRouter()

const isRTL = computed(() => locale.value === 'ar')

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
      tribe: '',
      workplace: '',
      workPhone: '',
      mobile: '',
      email: '',
      maritalStatus: ''
    },
    motherInfo: {
      fullName: '',
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

    console.log('Submitting enrollment data:', enrollmentData)
    console.log('dateOfBirth format:', enrollmentData.student.dateOfBirth, 'type:', typeof enrollmentData.student.dateOfBirth)
    console.log('age format:', enrollmentData.student.age, 'type:', typeof enrollmentData.student.age)

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
  router.push('/')
}
</script>

<style scoped>
/* Add any specific styles here */
</style>