<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" 
           :class="isRTL ? 'text-right' : 'text-left'">
        
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ $t('progressTracking.modal.updateProgress') }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ studentName }} - {{ milestoneName }}
                </p>
              </div>
            </div>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-6">
          <!-- Status Selection -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-800 mb-3" :class="isRTL ? 'text-right' : 'text-left'">
              {{ $t('progressTracking.modal.selectStatus') }}
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="status in statusOptions"
                :key="status.value"
                @click="selectedStatus = status.value"
                :class="[
                  'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200',
                  selectedStatus === status.value 
                    ? `${status.selectedBg} ${status.selectedBorder} ${status.selectedText}` 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                ]"
              >
                <component :is="status.icon" :class="[
                  'w-8 h-8 mb-2',
                  selectedStatus === status.value ? status.selectedIconColor : 'text-gray-400'
                ]" />
                <span class="text-sm font-medium">{{ $t(`progressTracking.status.${status.value}`) }}</span>
              </button>
            </div>
          </div>

          <!-- Dynamic Fields Based on Status -->
          <div v-if="selectedStatus === 'completed'" class="space-y-4">
            <!-- Start Date -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('progressTracking.modal.startDate') }}
              </label>
              <input
                v-model="formData.startDate"
                type="date"
                :dir="isRTL ? 'rtl' : 'ltr'"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
            </div>

            <!-- End Date -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('progressTracking.modal.endDate') }}
              </label>
              <input
                v-model="formData.endDate"
                type="date"
                :dir="isRTL ? 'rtl' : 'ltr'"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
            </div>

            <!-- Remarks for Completed -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('progressTracking.modal.remarks') }}
              </label>
              <textarea
                v-model="formData.remarks"
                rows="3"
                :dir="isRTL ? 'rtl' : 'ltr'"
                :placeholder="$t('progressTracking.modal.remarksPlaceholder')"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                :class="isRTL ? 'text-right' : 'text-left'"
              ></textarea>
            </div>
          </div>

          <div v-else-if="selectedStatus === 'postponed'" class="space-y-4">
            <!-- Remarks for Postponed -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('progressTracking.modal.remarks') }}
              </label>
              <textarea
                v-model="formData.remarks"
                rows="4"
                :dir="isRTL ? 'rtl' : 'ltr'"
                :placeholder="$t('progressTracking.modal.postponedRemarksPlaceholder')"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                :class="isRTL ? 'text-right' : 'text-left'"
              ></textarea>
            </div>
          </div>

          <div v-else-if="selectedStatus === 'notStarted'" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
              </svg>
            </div>
            <p class="text-gray-600">{{ $t('progressTracking.modal.notStartedMessage') }}</p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex justify-end space-x-3" :class="isRTL ? 'space-x-reverse' : ''">
            <button
              @click="$emit('close')"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="saveProgress"
              :disabled="loading"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" :class="isRTL ? 'ml-2' : 'mr-2'"></span>
              {{ loading ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// Props
interface Props {
  show: boolean
  studentId: number
  milestoneId: number
  studentName: string
  milestoneName: string
  currentStatus?: string
  currentData?: {
    startDate?: string
    endDate?: string
    remarks?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  currentStatus: 'notStarted',
  currentData: () => ({})
})

// Emits
const emit = defineEmits<{
  close: []
  save: [data: {
    studentId: number
    milestoneId: number
    status: string
    startDate?: string
    endDate?: string
    remarks?: string
  }]
}>()

// Reactive data
const loading = ref(false)
const selectedStatus = ref(props.currentStatus)
const formData = ref({
  startDate: props.currentData?.startDate || '',
  endDate: props.currentData?.endDate || '',
  remarks: props.currentData?.remarks || ''
})

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Status options
const statusOptions = [
  {
    value: 'completed',
    icon: 'CheckCircleIcon',
    selectedBg: 'bg-green-50',
    selectedBorder: 'border-green-500',
    selectedText: 'text-green-700',
    selectedIconColor: 'text-green-600'
  },
  {
    value: 'postponed',
    icon: 'ClockIcon',
    selectedBg: 'bg-yellow-50',
    selectedBorder: 'border-yellow-500',
    selectedText: 'text-yellow-700',
    selectedIconColor: 'text-yellow-600'
  },
  {
    value: 'notStarted',
    icon: 'CircleIcon',
    selectedBg: 'bg-gray-50',
    selectedBorder: 'border-gray-500',
    selectedText: 'text-gray-700',
    selectedIconColor: 'text-gray-600'
  }
]

// Watch for prop changes
watch(() => props.currentStatus, (newStatus) => {
  selectedStatus.value = newStatus
})

watch(() => props.currentData, (newData) => {
  formData.value = {
    startDate: newData?.startDate || '',
    endDate: newData?.endDate || '',
    remarks: newData?.remarks || ''
  }
})

// Reset form when status changes
watch(selectedStatus, (newStatus) => {
  if (newStatus === 'notStarted') {
    formData.value = {
      startDate: '',
      endDate: '',
      remarks: ''
    }
  }
})

// Methods
const saveProgress = async () => {
  loading.value = true

  try {
    const saveData = {
      studentId: props.studentId,
      milestoneId: props.milestoneId,
      status: selectedStatus.value
    }

    // Add conditional fields based on status
    if (selectedStatus.value === 'completed') {
      saveData.startDate = formData.value.startDate
      saveData.endDate = formData.value.endDate
      saveData.remarks = formData.value.remarks
    } else if (selectedStatus.value === 'postponed') {
      saveData.remarks = formData.value.remarks
    }

    emit('save', saveData)
  } finally {
    loading.value = false
  }
}

// Icon components
const CheckCircleIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  `
}

const ClockIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
      <polyline points="12,6 12,12 16,14" stroke-width="2"/>
    </svg>
  `
}

const CircleIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
    </svg>
  `
}
</script>
