<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ $t('enrollmentManagement.enrollmentDetails') }}</h1>
              <p class="mt-1 text-sm text-gray-500" v-if="enrollment">
                {{ $t('enrollmentManagement.submittedOn') }}: {{ formatDate(enrollment.createdAt) }}
              </p>
            </div>
            <div class="flex space-x-3" :class="isRTL ? 'space-x-reverse' : ''">
              <!-- Back Button -->
              <router-link
                to="/enrollments"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500"
              >
                <svg :class="isRTL ? 'ml-2' : 'mr-2'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
                </svg>
                {{ $t('common.back') }}
              </router-link>

              <!-- Edit Button -->
              <button
                @click="editEnrollment"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
              >
                <svg :class="isRTL ? 'ml-2' : 'mr-2'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {{ $t('enrollmentManagement.edit') }}
              </button>

              <!-- Print Word Document Button -->
              <button
                @click="printWordDocument"
                :disabled="printingDoc"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg v-if="printingDoc" :class="isRTL ? 'ml-2' : 'mr-2'" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else :class="isRTL ? 'ml-2' : 'mr-2'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {{ printingDoc ? $t('common.printing') : $t('enrollmentManagement.print') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-500">{{ $t('common.loading') }}</p>
      </div>

      <!-- Enrollment Details -->
      <div v-else-if="enrollment" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Student Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.studentInformation') }}</h3>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.fullName') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fullName }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.gender') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.gender}`) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.age') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.age || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.tribe') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.tribe || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.nationality') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.nationality || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.religion') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.religion || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.dateOfBirth') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.dateOfBirth ? formatDate(enrollment.dateOfBirth) : '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.hasSiblings') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.hasSiblings ? 'yes' : 'no'}`) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.academicInformation') }}</h3>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.enrollmentType') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.enrollmentStatus}`) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.gradeLevel') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.gradeLevel || '-' }}</dd>
                </div>
                <div v-if="enrollment.previousSchool" class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.previousSchool') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.previousSchool }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Health Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.healthInformation') }}</h3>
              <div class="space-y-4">
                <div v-if="enrollment.allergies" class="p-3 bg-yellow-50 rounded-md">
                  <h4 class="text-sm font-medium text-yellow-800">{{ $t('enrollmentManagement.allergies') }}</h4>
                  <p class="mt-1 text-sm text-yellow-700">{{ enrollment.allergiesDetails || $t('enrollmentManagement.yes') }}</p>
                </div>

                <div v-if="enrollment.chronicDiseases" class="p-3 bg-red-50 rounded-md">
                  <h4 class="text-sm font-medium text-red-800">{{ $t('enrollmentManagement.chronicDiseases') }}</h4>
                  <p class="mt-1 text-sm text-red-700">{{ enrollment.chronicDiseasesDetails || $t('enrollmentManagement.yes') }}</p>
                </div>

                <div v-if="enrollment.surgeries" class="p-3 bg-orange-50 rounded-md">
                  <h4 class="text-sm font-medium text-orange-800">{{ $t('enrollmentManagement.surgeries') }}</h4>
                  <p class="mt-1 text-sm text-orange-700">{{ enrollment.surgeriesDetails || $t('enrollmentManagement.yes') }}</p>
                </div>

                <div v-if="enrollment.seizures" class="p-3 bg-purple-50 rounded-md">
                  <h4 class="text-sm font-medium text-purple-800">{{ $t('enrollmentManagement.seizures') }}</h4>
                  <p class="mt-1 text-sm text-purple-700">{{ enrollment.seizuresDetails || $t('enrollmentManagement.yes') }}</p>
                </div>

                <div v-if="enrollment.otherHealthInfo" class="p-3 bg-blue-50 rounded-md">
                  <h4 class="text-sm font-medium text-blue-800">{{ $t('enrollmentManagement.otherHealthInfo') }}</h4>
                  <p class="mt-1 text-sm text-blue-700">{{ enrollment.otherHealthInfo }}</p>
                </div>

                <div v-if="!enrollment.allergies && !enrollment.chronicDiseases && !enrollment.surgeries && !enrollment.seizures && !enrollment.otherHealthInfo" class="p-3 bg-green-50 rounded-md">
                  <p class="text-sm text-green-700">لا توجد مشاكل صحية مسجلة</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Guardian Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.guardianInformation') }}</h3>

              <!-- Guardian Type -->
              <div class="mb-6">
                <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.guardianType') }}</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.guardianType}`) }}</dd>
              </div>

              <!-- Father Information -->
              <div v-if="enrollment.fatherFullName" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('enrollmentManagement.fatherInfo') }}</h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.fullName') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherFullName }}</dd>
                  </div>
                  <div v-if="enrollment.fatherTribe">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.tribe') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherTribe }}</dd>
                  </div>
                  <div v-if="enrollment.fatherMobile">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.mobile') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherMobile }}</dd>
                  </div>
                  <div v-if="enrollment.fatherEmail">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.email') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherEmail }}</dd>
                  </div>
                  <div v-if="enrollment.fatherWorkplace" class="sm:col-span-2">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.workplace') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherWorkplace }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Mother Information -->
              <div v-if="enrollment.motherFullName" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('enrollmentManagement.motherInfo') }}</h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.fullName') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherFullName }}</dd>
                  </div>
                  <div v-if="enrollment.motherTribe">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.tribe') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherTribe }}</dd>
                  </div>
                  <div v-if="enrollment.motherMobile">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.mobile') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherMobile }}</dd>
                  </div>
                  <div v-if="enrollment.motherEmail">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.email') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherEmail }}</dd>
                  </div>
                  <div v-if="enrollment.motherWorkplace" class="sm:col-span-2">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.workplace') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherWorkplace }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Emergency Contact -->
              <div v-if="enrollment.emergencyContactName">
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('enrollmentManagement.emergencyContact') }}</h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.fullName') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.emergencyContactName }}</dd>
                  </div>
                  <div v-if="enrollment.emergencyContactRelationship">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.relationship') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.emergencyContactRelationship }}</dd>
                  </div>
                  <div v-if="enrollment.emergencyContactMobile">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.mobile') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.emergencyContactMobile }}</dd>
                  </div>
                  <div v-if="enrollment.emergencyContactWorkplace">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.workplace') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.emergencyContactWorkplace }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.addressInformation') }}</h3>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div v-if="enrollment.area">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.area') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.area }}</dd>
                </div>
                <div v-if="enrollment.village">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.village') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.village }}</dd>
                </div>
                <div v-if="enrollment.landmark" class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.landmark') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.landmark }}</dd>
                </div>
                <div v-if="enrollment.streetNumber">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.streetNumber') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.streetNumber }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.housingType') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.housingType}`) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status Card -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.applicationStatus') }}</h3>

              <div class="space-y-4">
                <!-- Current Status -->
                <div>
                  <span :class="getStatusClass(enrollment.status)" class="inline-flex px-3 py-1 text-sm font-semibold rounded-full">
                    {{ $t(`enrollmentManagement.${enrollment.status}`) }}
                  </span>
                </div>

                <!-- Notes -->
                <div v-if="enrollment.notes">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.notes') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{ enrollment.notes }}</dd>
                </div>

                <!-- Action Buttons -->
                <div v-if="enrollment.status === 'pending'" class="space-y-2">
                  <button
                    @click="approveEnrollment"
                    class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                  >
                    {{ $t('enrollmentManagement.approve') }}
                  </button>
                  <button
                    @click="rejectEnrollment"
                    class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                  >
                    {{ $t('enrollmentManagement.reject') }}
                  </button>
                </div>

              </div>
            </div>
          </div>

          <!-- Quick Info -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">معلومات سريعة</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">رقم الطلب</dt>
                  <dd class="mt-1 text-sm text-gray-900 font-mono">{{ enrollment.id.slice(-8).toUpperCase() }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">تاريخ التقديم</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(enrollment.createdAt) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">آخر تحديث</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(enrollment.updatedAt) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">خطأ في تحميل البيانات</h3>
        <p class="mt-1 text-sm text-gray-500">لم يتم العثور على طلب التسجيل المطلوب</p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { enrollmentService } from '@/services/enrollment.service'
import type { Enrollment } from '@/services/enrollment.service'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()

// Reactive data
const enrollment = ref<Enrollment | null>(null)
const loading = ref(false)
const error = ref(false)
const printingDoc = ref(false)

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Methods
const loadEnrollment = async () => {
  try {
    loading.value = true
    error.value = false
    const id = route.params.id as string
    enrollment.value = await enrollmentService.getEnrollment(id)
  } catch (err) {
    console.error('Failed to load enrollment:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'enrolled':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-AE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const editEnrollment = () => {
  const id = route.params.id as string
  router.push(`/enrollments/${id}/edit`)
}

const printWordDocument = async () => {
  if (!enrollment.value) return

  try {
    printingDoc.value = true
    const response = await enrollmentService.downloadDocument(enrollment.value.id)

    // Create a blob from the response
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })

    // Create a temporary URL
    const url = window.URL.createObjectURL(blob)

    // Open in new window/tab and trigger print
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
        // Clean up the URL after printing
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          printWindow.close()
        }, 1000)
      }
    } else {
      // Fallback: download the document if popup blocked
      const a = document.createElement('a')
      a.href = url
      a.download = `enrollment-form-${enrollment.value.id}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }

  } catch (error) {
    console.error('Failed to print document:', error)
    alert('خطأ في طباعة المستند')
  } finally {
    printingDoc.value = false
  }
}

const approveEnrollment = async () => {
  if (!enrollment.value) return

  try {
    await enrollmentService.approveEnrollment(enrollment.value.id)
    await loadEnrollment() // Refresh
    alert('تم قبول الطلب بنجاح')
  } catch (error) {
    console.error('Failed to approve enrollment:', error)
    alert('خطأ في قبول الطلب')
  }
}

const rejectEnrollment = async () => {
  if (!enrollment.value) return

  const notes = prompt(t('enrollmentManagement.addNotes'))
  if (notes !== null) {
    try {
      await enrollmentService.rejectEnrollment(enrollment.value.id, notes)
      await loadEnrollment() // Refresh
      alert('تم رفض الطلب')
    } catch (error) {
      console.error('Failed to reject enrollment:', error)
      alert('خطأ في رفض الطلب')
    }
  }
}

// Lifecycle
onMounted(() => {
  loadEnrollment()
})
</script>