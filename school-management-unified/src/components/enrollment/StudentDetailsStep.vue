<template>
  <div class="space-y-6 lg:space-y-8">
    <!-- Section Header -->
    <div v-if="!compact" class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.student') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.studentDetailsDescription') }}</p>
    </div>

    <!-- Photo (centered, like the edit page) -->
    <div class="mb-6 flex flex-col items-center gap-1.5">
      <div class="relative">
        <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-primary-50 to-teal-50 shadow-sm ring-1 ring-primary-100">
          <img v-if="photoPreview" :src="photoPreview" alt="" class="h-full w-full object-cover">
          <svg v-else class="h-9 w-9 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <label class="absolute -bottom-1 -end-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition hover:bg-primary-700">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input ref="photoInput" type="file" accept="image/*" @change="handlePhotoUpload" class="hidden">
        </label>
        <button v-if="photoPreview" type="button" class="absolute -top-1 -start-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600" @click="removePhoto">×</button>
      </div>
      <p class="text-[11px] text-gray-400">4 × 6</p>
    </div>

    <!-- Fields (2-column grid, like the edit page) -->
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.firstNameAr') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.first_name_ar" type="text" required dir="rtl" lang="ar" class="fk-field" data-demo="first-name-ar">
        <p v-if="fieldErrors.first_name_ar" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.first_name_ar) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.firstNameEn') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.first_name_en" type="text" required dir="ltr" lang="en" class="fk-field" :class="fieldErrors.first_name_en ? 'border-red-300' : ''" data-demo="first-name-en">
        <p v-if="fieldErrors.first_name_en" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.first_name_en) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.lastNameAr') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.last_name_ar" type="text" required dir="rtl" lang="ar" class="fk-field" :class="fieldErrors.last_name_ar ? 'border-red-300' : ''" data-demo="last-name-ar">
        <p v-if="fieldErrors.last_name_ar" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.last_name_ar) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.lastNameEn') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.last_name_en" type="text" required dir="ltr" lang="en" class="fk-field" :class="fieldErrors.last_name_en ? 'border-red-300' : ''" data-demo="last-name-en">
        <p v-if="fieldErrors.last_name_en" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.last_name_en) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.tribe') }}</label>
        <input v-model="localData.tribe" type="text" class="fk-field" :placeholder="$t('enrollment.tribePlaceholder')">
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.idNumber') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.idNumber" type="text" required dir="ltr" class="fk-field" :class="fieldErrors.idNumber ? 'border-red-300' : ''" data-demo="id-number" :placeholder="$t('enrollment.idNumberPlaceholder')">
        <p v-if="fieldErrors.idNumber" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.idNumber) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.gender') }} <span class="text-red-500">*</span></label>
        <div class="flex h-10 items-center gap-6" :class="{ 'space-x-reverse': isRTL }">
          <label class="flex cursor-pointer items-center gap-2">
            <input v-model="localData.gender" type="radio" value="male" data-demo="gender-male" class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500">
            <span class="text-sm text-gray-700">{{ $t('enrollment.male') }}</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input v-model="localData.gender" type="radio" value="female" class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500">
            <span class="text-sm text-gray-700">{{ $t('enrollment.female') }}</span>
          </label>
        </div>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.nationality') }} <span class="text-red-500">*</span></label>
        <select v-model="localData.nationality" required class="fk-field" data-demo="nationality">
          <option value="">{{ $t('enrollment.selectNationality') }}</option>
          <option v-for="n in NATIONALITIES" :key="n.en" :value="n.en">{{ locale === 'ar' ? n.ar : n.en }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.religion') }}</label>
        <input v-model="localData.religion" type="text" class="fk-field" :placeholder="$t('enrollment.religionPlaceholder')">
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.dateOfBirth') }} <span class="text-red-500">*</span></label>
        <input :value="localData.dateOfBirth instanceof Date ? localData.dateOfBirth.toISOString().split('T')[0] : localData.dateOfBirth" @input="handleDateChange" type="date" required class="fk-field" data-demo="dob">
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.ageAtStart') }}</label>
        <input :value="localData.age ? `${localData.age} سنوات` : ''" type="text" readonly class="fk-field cursor-not-allowed bg-gray-100 text-gray-600" :placeholder="$t('enrollment.ageCalculated')">
      </div>
    </div>

    <WizardStepNav
      v-if="compact"
      hide-back
      :disabled="!isValid"
      @next="handleNext"
    />

    <!-- Navigation Buttons -->
    <div v-else class="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
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
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'
import { NATIONALITIES, normaliseNationality } from '@/utils/nationalities'
import { isArabicName, isEnglishName, isIdNumber, type ValidationKey } from '@/utils/validation'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    modelValue: {
      fullName: string
      first_name_ar: string
      first_name_en: string
      last_name_ar: string
      last_name_en: string
      tribe: string
      idNumber: string
      gender: string
      nationality: string
      religion: string
      dateOfBirth: Date | string | null
      age: number | null
      hasSiblings: boolean
      photo: File | string | null
    }
  }>(),
  { compact: false },
)

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
// Saved nationalities may be free text or Arabic; map them onto the dropdown options.
localData.value.nationality = normaliseNationality(localData.value.nationality)

watch(
  () => [
    localData.value.first_name_ar,
    localData.value.last_name_ar,
    localData.value.first_name_en,
    localData.value.last_name_en,
  ],
  () => {
    localData.value.fullName =
      `${localData.value.first_name_ar} ${localData.value.last_name_ar}`.trim() ||
      `${localData.value.first_name_en} ${localData.value.last_name_en}`.trim()
  },
)

// Watch for changes and emit updates
watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// Field-level validation messages (shown once the field has text)
const fieldErrors = computed(() => {
  const d = localData.value
  const out: Record<string, ValidationKey | ''> = {}
  out.first_name_ar = d.first_name_ar?.trim() && !isArabicName(d.first_name_ar) ? 'validation.arabicOnly' : ''
  out.last_name_ar = d.last_name_ar?.trim() && !isArabicName(d.last_name_ar) ? 'validation.arabicOnly' : ''
  out.first_name_en = d.first_name_en?.trim() && !isEnglishName(d.first_name_en) ? 'validation.englishOnly' : ''
  out.last_name_en = d.last_name_en?.trim() && !isEnglishName(d.last_name_en) ? 'validation.englishOnly' : ''
  out.idNumber = d.idNumber?.trim() && !isIdNumber(d.idNumber) ? 'validation.idInvalid' : ''
  return out
})
const hasFieldErrors = computed(() => Object.values(fieldErrors.value).some(Boolean))

// Validation
const isValid = computed(() => {
  if (hasFieldErrors.value) return false
  return !!(
    localData.value.first_name_ar?.trim() &&
    localData.value.first_name_en?.trim() &&
    localData.value.last_name_ar?.trim() &&
    localData.value.last_name_en?.trim() &&
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

const setPhotoPreview = (photo: File | string | null) => {
  if (!photo) {
    photoPreview.value = null
    return
  }
  if (typeof photo === 'string') {
    photoPreview.value = photo
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(photo)
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

setPhotoPreview(props.modelValue.photo)

// Calculate age on component mount if dateOfBirth exists
if (props.modelValue.dateOfBirth) {
  calculateAge()
}
</script>