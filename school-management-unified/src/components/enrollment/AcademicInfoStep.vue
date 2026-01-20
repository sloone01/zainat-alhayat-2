<template>
  <div class="space-y-6 lg:space-y-8">
    <!-- Section Header -->
    <div class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.academic') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.academicDescription') }}</p>
    </div>

    <div class="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <!-- Enrollment Status -->
      <div class="space-y-4">
        <label class="flex items-center text-sm font-semibold text-gray-700">
          <span class="text-red-500 mr-1">*</span>
          {{ $t('enrollment.enrollmentStatus') }}
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="relative cursor-pointer">
            <input
              v-model="localData.enrollmentStatus"
              type="radio"
              value="new"
              class="peer sr-only"
            >
            <div class="p-6 bg-white border-2 border-gray-200 rounded-xl peer-checked:border-primary-600 peer-checked:bg-primary-50 transition-all duration-200 hover:border-gray-300">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center peer-checked:bg-primary-100">
                  <svg class="w-5 h-5 text-green-600 peer-checked:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ $t('enrollment.newStudent') }}</h3>
                  <p class="text-sm text-gray-600">{{ $t('enrollment.newStudentDesc') }}</p>
                </div>
              </div>
            </div>
          </label>

          <label class="relative cursor-pointer">
            <input
              v-model="localData.enrollmentStatus"
              type="radio"
              value="transfer"
              class="peer sr-only"
            >
            <div class="p-6 bg-white border-2 border-gray-200 rounded-xl peer-checked:border-primary-600 peer-checked:bg-primary-50 transition-all duration-200 hover:border-gray-300">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center peer-checked:bg-primary-100">
                  <svg class="w-5 h-5 text-blue-600 peer-checked:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ $t('enrollment.transferStudent') }}</h3>
                  <p class="text-sm text-gray-600">{{ $t('enrollment.transferStudentDesc') }}</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Grade Level -->
      <div class="space-y-2">
        <label class="flex items-center text-sm font-semibold text-gray-700">
          <span class="text-red-500 mr-1">*</span>
          {{ $t('enrollment.gradeLevel') }}
        </label>
        <select
          v-model="localData.gradeLevel"
          required
          class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-lg"
        >
          <option value="">{{ $t('enrollment.selectGrade') }}</option>
          <option value="nursery">{{ $t('enrollment.nursery') }}</option>
          <option value="kg1">{{ $t('enrollment.kg1') }}</option>
          <option value="kg2">{{ $t('enrollment.kg2') }}</option>
          <option value="preschool">{{ $t('enrollment.preschool') }}</option>
        </select>
      </div>

      <!-- Previous School (if transfer) -->
      <div v-if="localData.enrollmentStatus === 'transfer'" class="space-y-2">
        <label class="flex items-center text-sm font-semibold text-gray-700">
          <span class="text-red-500 mr-1">*</span>
          {{ $t('enrollment.previousSchool') }}
        </label>
        <input
          v-model="localData.previousSchool"
          type="text"
          :required="localData.enrollmentStatus === 'transfer'"
          class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-lg"
          :placeholder="$t('enrollment.previousSchoolPlaceholder')"
        >
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
        :disabled="!isValid"
        class="order-1 sm:order-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
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
    enrollmentStatus: string
    gradeLevel: string
    previousSchool: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

// Local copy of the data
const localData = ref({ ...props.modelValue })

// Watch for changes and emit updates
watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// Validation
const isValid = computed(() => {
  const hasRequiredFields = !!(localData.value.enrollmentStatus && localData.value.gradeLevel)

  if (localData.value.enrollmentStatus === 'transfer') {
    return hasRequiredFields && !!localData.value.previousSchool
  }

  return hasRequiredFields
})

const handleNext = () => {
  if (isValid.value) {
    emit('next')
  }
}
</script>