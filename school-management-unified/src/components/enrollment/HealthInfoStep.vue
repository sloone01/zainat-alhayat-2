<template>
  <div class="space-y-6 lg:space-y-8">
    <!-- Section Header -->
    <div class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.health') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.healthDescription') }}</p>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Health Conditions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <!-- Allergies -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <input
              v-model="localData.allergies"
              type="checkbox"
              id="allergies"
              class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            >
            <label for="allergies" class="text-lg font-semibold text-gray-900">
              {{ $t('enrollment.allergies') }}
            </label>
          </div>
          <textarea
            v-if="localData.allergies"
            v-model="localData.allergiesDetails"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            rows="3"
            :placeholder="$t('enrollment.allergiesPlaceholder')"
          ></textarea>
        </div>

        <!-- Seizures -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <input
              v-model="localData.seizures"
              type="checkbox"
              id="seizures"
              class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            >
            <label for="seizures" class="text-lg font-semibold text-gray-900">
              {{ $t('enrollment.seizures') }}
            </label>
          </div>
          <textarea
            v-if="localData.seizures"
            v-model="localData.seizuresDetails"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            rows="3"
            :placeholder="$t('enrollment.seizuresPlaceholder')"
          ></textarea>
        </div>

        <!-- Surgeries -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <input
              v-model="localData.surgeries"
              type="checkbox"
              id="surgeries"
              class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            >
            <label for="surgeries" class="text-lg font-semibold text-gray-900">
              {{ $t('enrollment.surgeries') }}
            </label>
          </div>
          <textarea
            v-if="localData.surgeries"
            v-model="localData.surgeriesDetails"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            rows="3"
            :placeholder="$t('enrollment.surgeriesPlaceholder')"
          ></textarea>
        </div>

        <!-- Chronic Diseases -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <input
              v-model="localData.chronicDiseases"
              type="checkbox"
              id="chronicDiseases"
              class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            >
            <label for="chronicDiseases" class="text-lg font-semibold text-gray-900">
              {{ $t('enrollment.chronicDiseases') }}
            </label>
          </div>
          <textarea
            v-if="localData.chronicDiseases"
            v-model="localData.chronicDiseasesDetails"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            rows="3"
            :placeholder="$t('enrollment.chronicDiseasesPlaceholder')"
          ></textarea>
        </div>
      </div>

      <!-- Other Health Information -->
      <div class="space-y-4">
        <label class="block text-lg font-semibold text-gray-900">
          {{ $t('enrollment.otherHealthInfo') }}
        </label>
        <textarea
          v-model="localData.other"
          class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
          rows="4"
          :placeholder="$t('enrollment.otherHealthPlaceholder')"
        ></textarea>
      </div>

      <!-- Medical Reports Upload -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('enrollment.medicalReports') }}</h3>
        </div>

        <!-- Upload Area -->
        <div class="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
          <svg class="w-12 h-12 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-gray-600 mb-4">{{ $t('enrollment.medicalReportsDescription') }}</p>
          <label class="cursor-pointer inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            <svg class="w-4 h-4" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('enrollment.uploadReports') }}
            <input
              ref="reportsInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              @change="handleReportsUpload"
              class="hidden"
            >
          </label>
          <p class="text-xs text-gray-500 mt-2">{{ $t('enrollment.reportsOptional') }}</p>
        </div>

        <!-- Uploaded Files List -->
        <div v-if="localData.medicalReports.length > 0" class="mt-4 space-y-2">
          <h4 class="font-medium text-gray-900">{{ $t('enrollment.uploadedFiles') }}:</h4>
          <div class="space-y-2">
            <div
              v-for="(file, index) in localData.medicalReports"
              :key="index"
              class="flex items-center justify-between bg-white p-3 rounded-lg border"
            >
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm text-gray-700">{{ file.name }}</span>
              </div>
              <button
                @click="removeReport(index)"
                class="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                {{ $t('common.remove') }}
              </button>
            </div>
          </div>
        </div>
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
        @click="handleNext"
        class="order-1 sm:order-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
      >
        {{ $t('common.next') }}
        <svg class="w-5 h-5 inline" :class="{ 'ml-2': !isRTL, 'mr-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: {
    allergies: boolean
    allergiesDetails: string
    seizures: boolean
    seizuresDetails: string
    surgeries: boolean
    surgeriesDetails: string
    chronicDiseases: boolean
    chronicDiseasesDetails: string
    other: string
    medicalReports: File[]
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
const reportsInput = ref<HTMLInputElement>()

// Local copy of the data
const localData = ref({ ...props.modelValue })

// Watch for changes and emit updates
watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// File upload handling
const handleReportsUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length > 0) {
    localData.value.medicalReports = [...localData.value.medicalReports, ...files]
  }
}

const removeReport = (index: number) => {
  localData.value.medicalReports.splice(index, 1)
}

const handleNext = () => {
  emit('next')
}
</script>