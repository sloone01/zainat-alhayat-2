<template>
  <div class="space-y-6 lg:space-y-8">
    <!-- Section Header -->
    <div v-if="!compact" class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.address') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.addressDescription') }}</p>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Address Information -->
      <div
        class="space-y-6 rounded-xl border p-6"
        :class="compact
          ? 'border-gray-200 bg-white'
          : 'border-green-100 bg-gradient-to-br from-green-50 to-emerald-50'"
      >
        <h3 class="flex items-center text-sm font-semibold text-gray-900" :class="{ 'text-xl': !compact }">
          <svg
            class="mr-3 h-5 w-5"
            :class="compact ? 'text-primary-600' : 'text-green-600'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {{ $t('enrollment.addressInfo') }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div class="space-y-2">
            <label class="mb-1.5 flex items-center text-xs font-medium text-gray-600">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.area') }}
            </label>
            <input
              v-model="localData.area"
              type="text"
              required
              class="fk-field"
              :placeholder="$t('enrollment.areaPlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="mb-1.5 flex items-center text-xs font-medium text-gray-600">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.village') }}
            </label>
            <input
              v-model="localData.village"
              type="text"
              required
              class="fk-field"
              :placeholder="$t('enrollment.villagePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="mb-1.5 block text-xs font-medium text-gray-600">
              {{ $t('enrollment.landmark') }}
            </label>
            <input
              v-model="localData.landmark"
              type="text"
              class="fk-field"
              :placeholder="$t('enrollment.landmarkPlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="mb-1.5 block text-xs font-medium text-gray-600">
              {{ $t('enrollment.streetNumber') }}
            </label>
            <input
              v-model="localData.streetNumber"
              type="text"
              class="fk-field"
              :placeholder="$t('enrollment.streetNumberPlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="mb-1.5 block text-xs font-medium text-gray-600">
              {{ $t('enrollment.alleyNumber') }}
            </label>
            <input
              v-model="localData.alleyNumber"
              type="text"
              class="fk-field"
              :placeholder="$t('enrollment.alleyNumberPlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="mb-1.5 block text-xs font-medium text-gray-600">
              {{ $t('enrollment.buildingNumber') }}
            </label>
            <input
              v-model="localData.buildingNumber"
              type="text"
              class="fk-field"
              :placeholder="$t('enrollment.buildingNumberPlaceholder')"
            >
          </div>
        </div>

        <!-- Housing Type -->
        <div class="space-y-4">
          <label class="mb-1.5 flex items-center text-xs font-medium text-gray-600">
            <span class="text-red-500 mr-1">*</span>
            {{ $t('enrollment.housingType') }}
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="relative cursor-pointer">
              <input
                v-model="localData.housingType"
                type="radio"
                value="house"
                class="peer sr-only"
              >
              <div
                class="rounded-xl border-2 border-gray-200 bg-white p-4 text-center transition-all duration-200 hover:border-gray-300"
                :class="compact
                  ? 'peer-checked:border-primary-600 peer-checked:bg-primary-50'
                  : 'peer-checked:border-green-600 peer-checked:bg-green-50'"
              >
                <div
                  class="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                  :class="compact ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900">{{ $t('enrollment.house') }}</h3>
              </div>
            </label>

            <label class="relative cursor-pointer">
              <input
                v-model="localData.housingType"
                type="radio"
                value="apartment"
                class="peer sr-only"
              >
              <div
                class="rounded-xl border-2 border-gray-200 bg-white p-4 text-center transition-all duration-200 hover:border-gray-300"
                :class="compact
                  ? 'peer-checked:border-primary-600 peer-checked:bg-primary-50'
                  : 'peer-checked:border-green-600 peer-checked:bg-green-50'"
              >
                <div
                  class="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                  :class="compact ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900">{{ $t('enrollment.apartment') }}</h3>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Documents and responsibilities (no hardcoded fee amounts) -->
      <div v-if="!compact" class="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <!-- Required Documents -->
        <div class="space-y-4">
          <h4 class="font-semibold text-gray-900 text-lg">{{ $t('enrollment.requiredDocuments') }}</h4>
          <div class="bg-white rounded-lg p-4 border">
            <div class="space-y-3 text-sm">
              <div class="flex items-start space-x-2" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                </svg>
                <span class="text-gray-700">{{ $t('enrollment.doc1') }}</span>
              </div>
              <div class="flex items-start space-x-2" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                </svg>
                <span class="text-gray-700">{{ $t('enrollment.doc2') }}</span>
              </div>
              <div class="flex items-start space-x-2" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                </svg>
                <span class="text-gray-700">{{ $t('enrollment.doc3') }}</span>
              </div>
              <div class="flex items-start space-x-2" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                </svg>
                <span class="text-gray-700">{{ $t('enrollment.doc4') }}</span>
              </div>
              <div class="flex items-start space-x-2" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                </svg>
                <span class="text-gray-700">{{ $t('enrollment.doc5') }}</span>
              </div>
              <div class="flex items-start space-x-2" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                </svg>
                <span class="text-gray-700">{{ $t('enrollment.doc6') }}</span>
              </div>
              <div class="flex items-start space-x-2" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                </svg>
                <span class="text-gray-700">{{ $t('enrollment.doc7') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- School Responsibilities -->
        <div v-if="schoolItems.length" class="space-y-4">
          <h4 class="font-semibold text-gray-900 text-lg">{{ $t('enrollment.schoolResponsibilities') }}</h4>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="space-y-3 text-sm text-gray-700">
              <div
                v-for="item in schoolItems"
                :key="item.id"
                class="flex items-start space-x-2"
                :class="{ 'space-x-reverse': isRTL }"
              >
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                </svg>
                <span>{{ displayText(item) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Parent Responsibilities -->
        <div v-if="parentItems.length" class="space-y-4">
          <h4 class="font-semibold text-gray-900 text-lg">{{ $t('enrollment.parentResponsibilities') }}</h4>
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="space-y-3 text-sm text-gray-700">
              <div
                v-for="item in parentItems"
                :key="item.id"
                class="flex items-start space-x-2"
                :class="{ 'space-x-reverse': isRTL }"
              >
                <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{{ displayText(item) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <WizardStepNav
      v-if="compact"
      :disabled="!isValid"
      @next="handleNext"
      @back="$emit('back')"
    />

    <!-- Navigation Buttons -->
    <div v-else class="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
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
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'
import {
  enrollmentResponsibilityService,
  responsibilityDisplayText,
  type EnrollmentResponsibilityItem,
} from '@/services/enrollment-responsibility.service'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    schoolId?: string
    modelValue: {
      area: string
      village: string
      landmark: string
      streetNumber: string
      alleyNumber: string
      buildingNumber: string
      housingType: string
    }
  }>(),
  { compact: false, schoolId: '' },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
const schoolItems = ref<EnrollmentResponsibilityItem[]>([])
const parentItems = ref<EnrollmentResponsibilityItem[]>([])

function displayText(item: EnrollmentResponsibilityItem) {
  return responsibilityDisplayText(item, locale.value)
}

async function loadResponsibilities(schoolId: string) {
  if (!schoolId || props.compact) {
    schoolItems.value = []
    parentItems.value = []
    return
  }
  try {
    const data = await enrollmentResponsibilityService.listPublic(schoolId)
    schoolItems.value = data.school ?? []
    parentItems.value = data.parent ?? []
  } catch (e) {
    console.error(e)
    schoolItems.value = []
    parentItems.value = []
  }
}

watch(
  () => props.schoolId,
  (id) => {
    void loadResponsibilities(id || '')
  },
  { immediate: true },
)

// Local copy of the data
const localData = ref({ ...props.modelValue })

// Watch for changes and emit updates
watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// Validation
const isValid = computed(() => {
  return !!(
    localData.value.area &&
    localData.value.village &&
    localData.value.housingType
  )
})

const handleNext = () => {
  if (isValid.value) {
    emit('next')
  }
}
</script>