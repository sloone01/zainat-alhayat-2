<template>
  <div class="space-y-6 lg:space-y-8">
    <!-- Section Header -->
    <div class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.student') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.studentDetailsDescription') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <!-- Photo Upload Section -->
      <div class="lg:col-span-1 order-2 lg:order-1">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100">
          <div class="inline-flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('enrollment.studentPhoto') }}</h3>

          <!-- Photo Preview -->
          <div class="relative mb-6">
            <div
              class="w-40 h-40 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-white overflow-hidden shadow-sm transition-all duration-300"
              :class="{ 'border-primary-500 shadow-primary-100': photoPreview }"
            >
              <img
                v-if="photoPreview"
                :src="photoPreview"
                alt="Student Photo"
                class="w-full h-full object-cover rounded-xl"
              >
              <div v-else class="text-center p-4">
                <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-xs text-gray-500 leading-relaxed">4 × 6 صورة شخصية</p>
              </div>
            </div>

            <!-- Remove button -->
            <button
              v-if="photoPreview"
              @click="removePhoto"
              class="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
            >
              ×
            </button>
          </div>

          <!-- Upload Button -->
          <label class="cursor-pointer inline-flex items-center px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium">
            <svg class="w-4 h-4" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('enrollment.uploadPhoto') }}
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              @change="handlePhotoUpload"
              class="hidden"
            >
          </label>
          <p class="text-xs text-gray-500 mt-3 leading-relaxed">{{ $t('enrollment.photoOptional') }}</p>
        </div>
      </div>

      <!-- Form Fields -->
      <div class="lg:col-span-2 order-1 lg:order-2">
        <div class="space-y-6 lg:space-y-8">
          <!-- Full Name -->
          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.fullName') }}
            </label>
            <input
              v-model="localData.fullName"
              type="text"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-lg"
              :placeholder="$t('enrollment.fullNamePlaceholder')"
            >
          </div>

          <!-- Tribe and ID Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">
                {{ $t('enrollment.tribe') }}
              </label>
              <input
                v-model="localData.tribe"
                type="text"
                class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                :placeholder="$t('enrollment.tribePlaceholder')"
              >
            </div>
            <div class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <span class="text-red-500 mr-1">*</span>
                {{ $t('enrollment.idNumber') }}
              </label>
              <input
                v-model="localData.idNumber"
                type="text"
                required
                class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                :placeholder="$t('enrollment.idNumberPlaceholder')"
              >
            </div>
          </div>

          <!-- Gender and Nationality Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div class="space-y-3">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <span class="text-red-500 mr-1">*</span>
                {{ $t('enrollment.gender') }}
              </label>
              <div class="flex space-x-6" :class="{ 'space-x-reverse': isRTL }">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="localData.gender"
                    type="radio"
                    value="male"
                    class="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                  >
                  <span class="text-gray-700 font-medium" :class="{ 'ml-3': !isRTL, 'mr-3': isRTL }">{{ $t('enrollment.male') }}</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="localData.gender"
                    type="radio"
                    value="female"
                    class="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                  >
                  <span class="text-gray-700 font-medium" :class="{ 'ml-3': !isRTL, 'mr-3': isRTL }">{{ $t('enrollment.female') }}</span>
                </label>
              </div>
            </div>
            <div class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <span class="text-red-500 mr-1">*</span>
                {{ $t('enrollment.nationality') }}
              </label>
              <input
                v-model="localData.nationality"
                type="text"
                required
                class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                :placeholder="$t('enrollment.nationalityPlaceholder')"
              >
            </div>
          </div>

          <!-- Religion -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.religion') }}
            </label>
            <input
              v-model="localData.religion"
              type="text"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.religionPlaceholder')"
            >
          </div>

          <!-- Date of Birth and Age Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <span class="text-red-500 mr-1">*</span>
                {{ $t('enrollment.dateOfBirth') }}
              </label>
              <input
                :value="localData.dateOfBirth instanceof Date ? localData.dateOfBirth.toISOString().split('T')[0] : localData.dateOfBirth"
                @input="handleDateChange"
                type="date"
                required
                class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              >
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">
                {{ $t('enrollment.ageAtStart') }}
              </label>
              <input
                :value="localData.age ? `${localData.age} سنوات` : ''"
                type="text"
                readonly
                class="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                :placeholder="$t('enrollment.ageCalculated')"
              >
            </div>
          </div>

          <!-- Has Siblings -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <label class="flex items-start cursor-pointer">
              <input
                v-model="localData.hasSiblings"
                type="checkbox"
                class="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
              >
              <span class="text-sm font-medium text-gray-700 leading-relaxed" :class="{ 'ml-3': !isRTL, 'mr-3': isRTL }">{{ $t('enrollment.hasSiblings') }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
      <button
        disabled
        class="order-2 sm:order-1 px-6 py-3 text-gray-400 bg-gray-200 rounded-xl cursor-not-allowed font-medium"
      >
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
    fullName: string
    tribe: string
    idNumber: string
    gender: string
    nationality: string
    religion: string
    dateOfBirth: Date | null
    age: number | null
    hasSiblings: boolean
    photo: File | null
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'next'): void
}>()

const { locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
const photoInput = ref<HTMLInputElement>()
const photoPreview = ref<string | null>(null)

// Local copy of the data
const localData = ref({ ...props.modelValue })

// Watch for changes and emit updates
watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// Validation
const isValid = computed(() => {
  return !!(
    localData.value.fullName &&
    localData.value.idNumber &&
    localData.value.gender &&
    localData.value.nationality &&
    localData.value.dateOfBirth
  )
})

// Photo upload handling
const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    localData.value.photo = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  localData.value.photo = null
  photoPreview.value = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

// Date change handler
const handleDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const dateString = target.value
  if (dateString) {
    localData.value.dateOfBirth = new Date(dateString)
    calculateAge()
  }
}

// Age calculation
const calculateAge = () => {
  if (localData.value.dateOfBirth) {
    const birthDate = new Date(localData.value.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    let actualAge = age
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge = age - 1
    }

    // Store the numeric age for backend validation
    localData.value.age = actualAge
  }
}

const handleNext = () => {
  if (isValid.value) {
    emit('next')
  }
}

// Initialize photo preview if photo exists
if (props.modelValue.photo) {
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(props.modelValue.photo)
}

// Calculate age on component mount if dateOfBirth exists
if (props.modelValue.dateOfBirth) {
  calculateAge()
}
</script>