<template>
  <DashboardLayout>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between py-4 lg:py-6">
            <div class="flex items-center space-x-3 sm:space-x-4" :class="{ 'space-x-reverse': isRTL }">
              <img src="/zlogo.jpeg" alt="Zinat Al-Haya Kindergarten" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm">
              <div>
                <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{{ $t('enrollment.editTitle') }}</h1>
                <p class="text-xs sm:text-sm text-gray-600 hidden sm:block">{{ $t('enrollment.editSubtitle') }}</p>
              </div>
            </div>
            <router-link
              to="/enrollments"
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
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-500">{{ $t('common.loading') }}</p>
          </div>

          <!-- Step 1: Student Details -->
          <div v-else-if="currentStep === 1">
            <StudentDetailsStep
              v-model="formData.student"
              @next="handleNext"
              @back="handleBack"
            />
          </div>

          <!-- Step 2: Academic Information -->
          <div v-else-if="currentStep === 2">
            <AcademicInfoStep
              v-model="formData.academic"
              @next="handleNext"
              @back="handleBack"
            />
          </div>

          <!-- Step 3: Health Information -->
          <div v-else-if="currentStep === 3">
            <HealthInfoStep
              v-model="formData.health"
              @next="handleNext"
              @back="handleBack"
            />
          </div>

          <!-- Step 4: Guardian Information -->
          <div v-else-if="currentStep === 4">
            <GuardianInfoStep
              v-model="formData.guardian"
              @next="handleNext"
              @back="handleBack"
            />
          </div>

          <!-- Step 5: Address Information -->
          <div v-else-if="currentStep === 5">
            <AddressInfoStep
              v-model="formData.address"
              @next="handleNext"
              @back="handleBack"
            />
          </div>

          <!-- Step 6: Review & Update -->
          <div v-else-if="currentStep === 6">
            <ReviewSubmitStep
              :formData="formData"
              :isEditing="true"
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
          <p class="text-gray-900 font-medium">{{ $t('enrollment.updating') }}</p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { enrollmentService, type EnrollmentFormData } from '@/services/enrollment.service'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Components
import StudentDetailsStep from '@/components/enrollment/StudentDetailsStep.vue'
import AcademicInfoStep from '@/components/enrollment/AcademicInfoStep.vue'
import HealthInfoStep from '@/components/enrollment/HealthInfoStep.vue'
import GuardianInfoStep from '@/components/enrollment/GuardianInfoStep.vue'
import AddressInfoStep from '@/components/enrollment/AddressInfoStep.vue'
import ReviewSubmitStep from '@/components/enrollment/ReviewSubmitStep.vue'

const { locale } = useI18n()
const router = useRouter()
const route = useRoute()

const isRTL = computed(() => locale.value === 'ar')
const enrollmentId = route.params.id as string

// Form state
const currentStep = ref(1)
const totalSteps = 6
const loading = ref(true)
const isSubmitting = ref(false)

// Steps configuration
const steps = [
  { label: 'enrollment.steps.student' },
  { label: 'enrollment.steps.academic' },
  { label: 'enrollment.steps.health' },
  { label: 'enrollment.steps.guardian' },
  { label: 'enrollment.steps.address' },
  { label: 'enrollment.steps.review' }
]

// Form data - initialize with empty structure
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
    enrollmentStatus: 'new',
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
    type: 'father',
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
    housingType: 'house'
  }
})

// Load existing enrollment data
const loadEnrollmentData = async () => {
  try {
    loading.value = true
    const enrollment = await enrollmentService.getEnrollment(enrollmentId)

    // Map the enrollment data back to form structure
    formData.value = {
      student: {
        fullName: enrollment.fullName || '',
        tribe: enrollment.tribe || '',
        idNumber: enrollment.idNumber || '',
        gender: enrollment.gender || 'male',
        nationality: enrollment.nationality || '',
        religion: enrollment.religion || '',
        dateOfBirth: enrollment.dateOfBirth ? new Date(enrollment.dateOfBirth) : null,
        age: enrollment.age || null,
        hasSiblings: enrollment.hasSiblings || false,
        photo: null // Photo will need special handling
      },
      academic: {
        enrollmentStatus: enrollment.enrollmentStatus || 'new',
        gradeLevel: enrollment.gradeLevel || '',
        previousSchool: enrollment.previousSchool || ''
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
        medicalReports: enrollment.medicalReports || []
      },
      guardian: {
        type: enrollment.guardianType || 'father',
        fatherInfo: {
          fullName: enrollment.fatherFullName || '',
          tribe: enrollment.fatherTribe || '',
          workplace: enrollment.fatherWorkplace || '',
          workPhone: enrollment.fatherWorkPhone || '',
          mobile: enrollment.fatherMobile || '',
          email: enrollment.fatherEmail || '',
          maritalStatus: enrollment.fatherMaritalStatus || ''
        },
        motherInfo: {
          fullName: enrollment.motherFullName || '',
          tribe: enrollment.motherTribe || '',
          workplace: enrollment.motherWorkplace || '',
          workPhone: enrollment.motherWorkPhone || '',
          mobile: enrollment.motherMobile || '',
          email: enrollment.motherEmail || '',
          maritalStatus: enrollment.motherMaritalStatus || ''
        },
        otherInfo: {
          organizationName: enrollment.organizationName || '',
          phone: enrollment.organizationPhone || '',
          responsiblePerson: enrollment.responsiblePerson || '',
          responsiblePhone: enrollment.responsiblePhone || ''
        },
        emergencyContact: {
          fullName: enrollment.emergencyContactName || '',
          tribe: enrollment.emergencyContactTribe || '',
          workplace: enrollment.emergencyContactWorkplace || '',
          workPhone: enrollment.emergencyContactWorkPhone || '',
          mobile: enrollment.emergencyContactMobile || '',
          relationship: enrollment.emergencyContactRelationship || ''
        }
      },
      address: {
        area: enrollment.area || '',
        village: enrollment.village || '',
        landmark: enrollment.landmark || '',
        streetNumber: enrollment.streetNumber || '',
        alleyNumber: enrollment.alleyNumber || '',
        buildingNumber: enrollment.buildingNumber || '',
        housingType: enrollment.housingType || 'house'
      }
    }
  } catch (error) {
    console.error('Failed to load enrollment data:', error)
    // Redirect back to enrollments list if loading fails
    router.push('/enrollments')
  } finally {
    loading.value = false
  }
}

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

// Submit handler
const handleSubmit = async () => {
  try {
    isSubmitting.value = true

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

    console.log('Updating enrollment data:', enrollmentData)

    // Update the enrollment
    const result = await enrollmentService.updateEnrollment(enrollmentId, enrollmentData)

    console.log('Enrollment updated successfully:', result)

    // Redirect back to enrollments list
    router.push({
      path: '/enrollments',
      query: { updated: 'success', id: result.id }
    })

  } catch (error) {
    console.error('Enrollment update failed:', error)

    // Show error message to user
    alert(`حدث خطأ أثناء تحديث البيانات: ${error.message || 'خطأ غير معروف'}`)
  } finally {
    isSubmitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadEnrollmentData()
})
</script>

<style scoped>
/* Add any specific styles here */
</style>