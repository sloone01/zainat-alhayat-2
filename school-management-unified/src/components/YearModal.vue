<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ year ? $t('settings.editYear') : $t('settings.addYear') }}
          </h3>
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
        <form @submit.prevent="saveYear" class="mt-6 space-y-6">
          <!-- Year Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('settings.yearName') }} *
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              :placeholder="$t('settings.yearNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('settings.description') }}
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              :placeholder="$t('settings.descriptionPlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            ></textarea>
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Active Year Option -->
          <div v-if="!year || !year.isActive" class="flex items-center">
            <input
              v-model="formData.setAsActive"
              type="checkbox"
              id="setAsActive"
              class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label for="setAsActive" class="ml-2 block text-sm text-gray-700">
              {{ $t('settings.setAsActiveYear') }}
            </label>
          </div>

          <!-- Info Box -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">{{ $t('settings.yearInfo') }}</h3>
                <div class="mt-2 text-sm text-blue-700">
                  <ul class="list-disc list-inside space-y-1">
                    <li>{{ $t('settings.yearInfoLine1') }}</li>
                    <li>{{ $t('settings.yearInfoLine2') }}</li>
                    <li>{{ $t('settings.yearInfoLine3') }}</li>
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
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
            >
              {{ year ? $t('common.save') : $t('common.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const props = defineProps<{
  show: boolean
  year?: any
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [yearData: any]
}>()

// Form data
const formData = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  setAsActive: false
})

// Watch for year prop changes
watch(() => props.year, (newYear) => {
  if (newYear) {
    formData.value = {
      name: newYear.name || '',
      description: newYear.description || '',
      startDate: newYear.startDate || '',
      endDate: newYear.endDate || '',
      setAsActive: false
    }
  } else {
    // Reset form for new year
    formData.value = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      setAsActive: false
    }
  }
}, { immediate: true })

// Methods
const closeModal = () => {
  emit('close')
}

const saveYear = () => {
  // Validate dates
  if (new Date(formData.value.startDate) >= new Date(formData.value.endDate)) {
    alert(t('settings.invalidDateRange'))
    return
  }

  emit('save', { ...formData.value })
}
</script>

