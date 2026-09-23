<template>
  <div class="space-y-6 lg:space-y-8">
    <!-- Section Header -->
    <div v-if="!compact" class="text-center max-w-2xl mx-auto">
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
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            >
            <label for="allergies" :class="compact ? 'text-xs font-medium text-gray-600' : 'text-lg font-semibold text-gray-900'">
              {{ $t('enrollment.allergies') }}
            </label>
          </div>
          <textarea
            v-if="localData.allergies"
            v-model="localData.allergiesDetails"
            class="fk-field"
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
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            >
            <label for="seizures" :class="compact ? 'text-xs font-medium text-gray-600' : 'text-lg font-semibold text-gray-900'">
              {{ $t('enrollment.seizures') }}
            </label>
          </div>
          <textarea
            v-if="localData.seizures"
            v-model="localData.seizuresDetails"
            class="fk-field"
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
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            >
            <label for="surgeries" :class="compact ? 'text-xs font-medium text-gray-600' : 'text-lg font-semibold text-gray-900'">
              {{ $t('enrollment.surgeries') }}
            </label>
          </div>
          <textarea
            v-if="localData.surgeries"
            v-model="localData.surgeriesDetails"
            class="fk-field"
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
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            >
            <label for="chronicDiseases" :class="compact ? 'text-xs font-medium text-gray-600' : 'text-lg font-semibold text-gray-900'">
              {{ $t('enrollment.chronicDiseases') }}
            </label>
          </div>
          <textarea
            v-if="localData.chronicDiseases"
            v-model="localData.chronicDiseasesDetails"
            class="fk-field"
            rows="3"
            :placeholder="$t('enrollment.chronicDiseasesPlaceholder')"
          ></textarea>
        </div>
      </div>

      <!-- Other Health Information -->
      <div class="space-y-4">
        <label class="mb-1.5 block text-xs font-medium text-gray-600">
          {{ $t('enrollment.otherHealthInfo') }}
        </label>
        <textarea
          v-model="localData.other"
          class="fk-field"
          rows="4"
          :placeholder="$t('enrollment.otherHealthPlaceholder')"
        ></textarea>
      </div>

      <!-- Medical Reports Upload -->
      <div
        class="rounded-xl border p-6"
        :class="compact
          ? 'border-gray-200 bg-white'
          : 'border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50'"
      >
        <div class="mb-4 flex items-center space-x-3">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg"
            :class="compact ? 'bg-primary-100 text-primary-700' : 'bg-blue-600 text-white'"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-gray-900" :class="{ 'text-lg': !compact }">{{ $t('enrollment.medicalReports') }}</h3>
        </div>

        <!-- Upload Area (click or drop) -->
        <label
          class="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors"
          :class="isDragging
            ? 'border-primary-400 bg-primary-50/70'
            : 'border-gray-200 bg-gray-50/60 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleReportsDrop"
        >
          <span class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 transition-transform group-hover:scale-105">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </span>
          <span class="text-sm font-semibold text-primary-700">{{ $t('enrollment.uploadReports') }}</span>
          <span class="max-w-sm text-xs text-gray-500">{{ $t('enrollment.medicalReportsDescription') }}</span>
          <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">PDF · JPG · PNG</span>
          <input
            ref="reportsInput"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            @change="handleReportsUpload"
            class="hidden"
          >
        </label>
        <p class="mt-2 text-xs text-gray-500">{{ $t('enrollment.reportsOptional') }}</p>
        <p v-if="reportError" class="mt-2 text-xs font-medium text-red-600" role="alert">{{ reportError }}</p>

        <!-- Uploaded Files List -->
        <div v-if="localData.medicalReports.length > 0" class="mt-4 space-y-2">
          <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('enrollment.uploadedFiles') }}</h4>
          <ul class="space-y-2">
            <li
              v-for="(file, index) in localData.medicalReports"
              :key="index"
              class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <div class="min-w-0 flex-1 text-start">
                <p class="truncate text-sm font-medium text-gray-900">{{ fileLabel(file) }}</p>
                <p v-if="fileSize(file)" class="text-xs text-gray-500">{{ fileSize(file) }}</p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                :aria-label="$t('common.remove')"
                @click="removeReport(index)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <WizardStepNav
      v-if="compact"
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
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'

const props = withDefaults(
  defineProps<{
    compact?: boolean
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
      medicalReports: (File | string)[]
    }
  }>(),
  { compact: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { locale, t } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
const reportsInput = ref<HTMLInputElement>()

// Local copy of the data
const localData = ref({ ...props.modelValue })

// Watch for changes and emit updates
watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

const reportError = ref('')

// File upload handling
const isDragging = ref(false)

const addFiles = (files: File[]) => {
  const allowed = /\.(pdf|jpe?g|png)$/i
  const accepted: File[] = []
  reportError.value = ''
  for (const file of files) {
    if (!allowed.test(file.name)) {
      reportError.value = t('validation.fileTypeInvalid')
    } else if (file.size > 5 * 1024 * 1024) {
      reportError.value = t('validation.fileTooLarge')
    } else {
      accepted.push(file)
    }
  }
  if (accepted.length > 0) {
    localData.value.medicalReports = [...localData.value.medicalReports, ...accepted]
  }
}

const handleReportsUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  addFiles(Array.from(target.files || []))
  target.value = ''
}

const handleReportsDrop = (event: DragEvent) => {
  isDragging.value = false
  addFiles(Array.from(event.dataTransfer?.files || []))
}

const removeReport = (index: number) => {
  localData.value.medicalReports.splice(index, 1)
}

const fileLabel = (file: File | string): string =>
  typeof file === 'string' ? file.split('/').pop() || file : file.name

const fileSize = (file: File | string): string => {
  if (typeof file === 'string') return ''
  const kb = file.size / 1024
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

const handleNext = () => {
  emit('next')
}
</script>