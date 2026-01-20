<template>
  <div class="space-y-6 lg:space-y-8" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Section Header -->
    <div class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.review') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.reviewDescription') }}</p>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Application Summary -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div class="flex items-center space-x-3 mb-6" :class="{ 'space-x-reverse': isRTL }">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">{{ $t('enrollment.applicationSummary') }}</h3>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Student Information -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ $t('enrollment.steps.student') }}
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.fullName') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.student.fullName || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.tribe') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.student.tribe || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.idNumber') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.student.idNumber || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.gender') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.student.gender ? $t(`enrollment.${formData.student.gender}`) : $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.nationality') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.student.nationality || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.religion') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.student.religion || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.dateOfBirth') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.student.dateOfBirth || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.hasSiblings') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.student.hasSiblings ? $t('common.yes') : $t('common.no') }}</span>
              </div>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {{ $t('enrollment.steps.academic') }}
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.enrollmentStatus') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.academic.enrollmentStatus ? $t(`enrollment.${formData.academic.enrollmentStatus}Student`) : $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.gradeLevel') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.academic.gradeLevel ? $t(`enrollment.${formData.academic.gradeLevel}`) : $t('common.notSpecified') }}</span>
              </div>
              <div v-if="formData.academic.enrollmentStatus === 'transfer'" class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.previousSchool') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.academic.previousSchool || $t('common.notSpecified') }}</span>
              </div>
            </div>
          </div>

          <!-- Health Information -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {{ $t('enrollment.steps.health') }}
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.allergies') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.health.allergies ? $t('common.yes') : $t('common.no') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.seizures') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.health.seizures ? $t('common.yes') : $t('common.no') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.surgeries') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.health.surgeries ? $t('common.yes') : $t('common.no') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.chronicDiseases') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.health.chronicDiseases ? $t('common.yes') : $t('common.no') }}</span>
              </div>
              <div v-if="formData.health.medicalReports.length > 0" class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.medicalReports') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.health.medicalReports.length }} {{ $t('enrollment.uploadedFiles') }}</span>
              </div>
            </div>
          </div>

          <!-- Guardian Information -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ $t('enrollment.steps.guardian') }}
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.guardianType') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.guardian.type ? $t(`enrollment.${formData.guardian.type}`) : $t('common.notSpecified') }}</span>
              </div>
              <div v-if="formData.guardian.type === 'father'" class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.fatherNamePlaceholder') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.fatherInfo.fullName || $t('common.notSpecified') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.mobile') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.fatherInfo.mobile || $t('common.notSpecified') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.email') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.fatherInfo.email || $t('common.notSpecified') }}</span>
                </div>
              </div>
              <div v-if="formData.guardian.type === 'mother'" class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.motherNamePlaceholder') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.motherInfo.fullName || $t('common.notSpecified') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.mobile') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.motherInfo.mobile || $t('common.notSpecified') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.email') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.motherInfo.email || $t('common.notSpecified') }}</span>
                </div>
              </div>
              <div v-if="formData.guardian.type === 'other'" class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.organizationName') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.otherInfo.organizationName || $t('common.notSpecified') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.responsiblePerson') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.otherInfo.responsiblePerson || $t('common.notSpecified') }}</span>
                </div>
              </div>
              <div class="border-t pt-3 mt-3">
                <div class="text-sm text-gray-600 mb-2">{{ $t('enrollment.emergencyContact') }}:</div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.emergencyContactName') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.emergencyContact.fullName || $t('common.notSpecified') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.relationship') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.emergencyContact.relationship || $t('common.notSpecified') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('enrollment.mobile') }}:</span>
                  <span class="font-medium text-gray-900">{{ formData.guardian.emergencyContact.mobile || $t('common.notSpecified') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="bg-white rounded-lg p-6 shadow-sm lg:col-span-2">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ $t('enrollment.steps.address') }}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.area') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.address.area || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.village') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.address.village || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.landmark') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.address.landmark || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.housingType') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.address.housingType ? $t(`enrollment.${formData.address.housingType}`) : $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.streetNumber') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.address.streetNumber || $t('common.notSpecified') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('enrollment.alleyNumber') }}:</span>
                <span class="font-medium text-gray-900">{{ formData.address.alleyNumber || $t('common.notSpecified') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div class="flex items-start space-x-3 mb-4" :class="{ 'space-x-reverse': isRTL }">
          <div class="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h4 class="text-lg font-semibold text-amber-900">{{ $t('enrollment.termsAndResponsibilities') }}</h4>
        </div>

        <div class="bg-white rounded-lg p-4 mb-6">
          <div class="space-y-3 text-sm text-gray-700">
            <div v-for="i in 6" :key="i" class="flex items-start space-x-2" :class="{ 'space-x-reverse': isRTL }">
              <span class="text-amber-600 font-medium">{{ i }}.</span>
              <span>{{ $t(`enrollment.term${i}`) }}</span>
            </div>
          </div>
        </div>

        <label class="flex items-start space-x-3 cursor-pointer" :class="{ 'space-x-reverse': isRTL }">
          <input
            v-model="acceptTerms"
            type="checkbox"
            class="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 mt-1 flex-shrink-0"
          >
          <span class="text-amber-900 font-medium leading-relaxed">
            {{ $t('enrollment.acceptTerms') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
      <button
        @click="$emit('back')"
        class="order-2 sm:order-1 px-6 py-3 text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 font-medium transition-colors"
      >
        <svg class="w-5 h-5 inline" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
        </svg>
        {{ $t('common.back') }}
      </button>
      <button
        @click="handleSubmit"
        :disabled="!acceptTerms"
        class="order-1 sm:order-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
      >
        <svg class="w-5 h-5 inline" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ $t('enrollment.submitApplication') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  formData: any
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'back'): void
}>()

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const acceptTerms = ref(false)

const handleSubmit = () => {
  if (acceptTerms.value) {
    emit('submit')
  }
}
</script>