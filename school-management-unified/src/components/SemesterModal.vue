<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ semester ? $t('settings.editSemester') : $t('settings.addSemester') }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ $t('settings.forYear') }}: {{ year?.name }}
            </p>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveSemester" class="mt-6 space-y-6">
          <!-- Semester Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('settings.semesterTitle') }} *
            </label>
            <input
              v-model="formData.title"
              type="text"
              required
              :placeholder="$t('settings.semesterTitlePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('settings.startDate') }} *
              </label>
              <input
                v-model="formData.startDate"
                type="date"
                required
                :min="year?.startDate"
                :max="year?.endDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('settings.endDate') }} *
              </label>
              <input
                v-model="formData.endDate"
                type="date"
                required
                :min="year?.startDate"
                :max="year?.endDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Year Date Range Info -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {{ $t('settings.yearDateRange') }}: 
                {{ formatDate(year?.startDate) }} - {{ formatDate(year?.endDate) }}
              </span>
            </div>
          </div>

          <!-- Info Box -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">{{ $t('settings.semesterInfo') }}</h3>
                <div class="mt-2 text-sm text-green-700">
                  <ul class="list-disc list-inside space-y-1">
                    <li>{{ $t('settings.semesterInfoLine1') }}</li>
                    <li>{{ $t('settings.semesterInfoLine2') }}</li>
                    <li>{{ $t('settings.semesterInfoLine3') }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
            >
              {{ semester ? $t('common.save') : $t('common.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// Props
const props = defineProps<{
  show: boolean
  semester?: any
  year?: any
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [semesterData: any]
}>()

// Form data
const formData = ref({
  title: '',
  startDate: '',
  endDate: ''
})

// Watch for semester prop changes
watch(() => props.semester, (newSemester) => {
  if (newSemester) {
    formData.value = {
      title: newSemester.title || '',
      startDate: newSemester.startDate || '',
      endDate: newSemester.endDate || ''
    }
  } else {
    // Reset form for new semester
    formData.value = {
      title: '',
      startDate: '',
      endDate: ''
    }
  }
}, { immediate: true })

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const closeModal = () => {
  emit('close')
}

const saveSemester = () => {
  // Validate dates
  if (new Date(formData.value.startDate) >= new Date(formData.value.endDate)) {
    alert(t('settings.invalidDateRange'))
    return
  }

  // Validate dates are within year range
  const yearStart = new Date(props.year?.startDate)
  const yearEnd = new Date(props.year?.endDate)
  const semesterStart = new Date(formData.value.startDate)
  const semesterEnd = new Date(formData.value.endDate)

  if (semesterStart < yearStart || semesterEnd > yearEnd) {
    alert(t('settings.semesterOutsideYearRange'))
    return
  }

  emit('save', { ...formData.value })
}
</script>

