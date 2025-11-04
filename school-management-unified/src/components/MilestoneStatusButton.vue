<template>
  <div class="relative">
    <!-- Status Button -->
    <button
      @click="openModal"
      :class="[
        'group inline-flex items-center justify-center rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 active:scale-95',
        getStatusClasses(),
        size === 'small' ? 'w-10 h-10' : 'w-12 h-12',
        'shadow-sm hover:shadow-md'
      ]"
      :title="getStatusTitle()"
    >
      <component
        :is="getStatusIcon()"
        :class="[
          size === 'small' ? 'w-5 h-5' : 'w-6 h-6',
          'transition-transform duration-200 group-hover:scale-110'
        ]"
      />
    </button>

    <!-- Progress Modal -->
    <StudentProgressModal
      :show="showModal"
      :student-id="studentId"
      :milestone-id="milestoneId"
      :student-name="studentName"
      :milestone-name="milestoneName"
      :current-status="status"
      :current-data="currentProgressData"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import StudentProgressModal from './StudentProgressModal.vue'

// Props
interface Props {
  studentId: number
  milestoneId: number
  status: string
  studentName?: string
  milestoneName?: string
  progressData?: {
    startDate?: string
    endDate?: string
    remarks?: string
  }
  size?: 'normal' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'notStarted',
  studentName: '',
  milestoneName: '',
  progressData: () => ({}),
  size: 'normal'
})

// Emits
const emit = defineEmits<{
  updateStatus: [data: {
    studentId: number
    milestoneId: number
    status: string
    startDate?: string
    endDate?: string
    remarks?: string
  }]
}>()

const { t } = useI18n()

// Reactive data
const showModal = ref(false)

// Status options with enhanced design
const statusOptions = [
  {
    value: 'notStarted',
    icon: 'CircleIcon',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    hoverColor: 'hover:bg-gray-200'
  },
  {
    value: 'postponed',
    icon: 'ClockIcon',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    hoverColor: 'hover:bg-yellow-200'
  },
  {
    value: 'completed',
    icon: 'CheckCircleIcon',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    hoverColor: 'hover:bg-green-200'
  }
]

// Computed properties
const currentStatusOption = computed(() => {
  return statusOptions.find(option => option.value === props.status) || statusOptions[0]
})

const currentProgressData = computed(() => {
  return props.progressData || {}
})

const getStatusClasses = () => {
  const option = currentStatusOption.value
  return `${option.bgColor} ${option.borderColor} ${option.hoverColor} focus:ring-blue-500`
}

const getStatusTitle = () => {
  return t(`progressTracking.status.${props.status}`)
}

const getStatusIcon = () => {
  return currentStatusOption.value.icon
}

// Methods
const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSave = (data: any) => {
  emit('updateStatus', data)
  closeModal()
}

// Icon components (simplified SVG icons)
const CircleIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
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

const CheckCircleIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  `
}
</script>

