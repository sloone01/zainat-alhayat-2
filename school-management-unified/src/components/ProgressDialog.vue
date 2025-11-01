<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full" :class="isRTL ? 'text-right' : 'text-left'">
        
        <!-- Loading State -->
        <div v-if="state === 'loading'" class="bg-white px-6 pt-6 pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left" :class="isRTL ? 'sm:mr-4 sm:ml-0 sm:text-right' : 'sm:ml-4 sm:text-left'">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ title || $t('common.loading') }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ message }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="state === 'success'" class="bg-white px-6 pt-6 pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left" :class="isRTL ? 'sm:mr-4 sm:ml-0 sm:text-right' : 'sm:ml-4 sm:text-left'">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ successTitle || $t('common.success') }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ successMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="state === 'error'" class="bg-white px-6 pt-6 pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left" :class="isRTL ? 'sm:mr-4 sm:ml-0 sm:text-right' : 'sm:ml-4 sm:text-left'">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ errorTitle || $t('common.error') }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer - Only show for success/error states -->
        <div v-if="state !== 'loading'" class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleClose"
            type="button"
            :class="[
              'w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200',
              state === 'success' 
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
              isRTL ? 'sm:mr-3 sm:ml-0' : 'sm:ml-3'
            ]"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// Props
const props = defineProps<{
  show: boolean
  state: 'loading' | 'success' | 'error'
  title?: string
  message?: string
  successTitle?: string
  successMessage?: string
  errorTitle?: string
  errorMessage?: string
  autoClose?: boolean
  autoCloseDelay?: number
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Methods
const handleClose = () => {
  emit('close')
}

// Auto close functionality for success state
watch(() => [props.state, props.show], ([newState, newShow]) => {
  if (newState === 'success' && newShow && props.autoClose) {
    setTimeout(() => {
      handleClose()
    }, props.autoCloseDelay || 2000)
  }
})
</script>