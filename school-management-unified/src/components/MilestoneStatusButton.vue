<template>
  <div class="relative">
    <!-- Status Button -->
    <button
      @click="toggleDropdown"
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

    <!-- Dropdown Menu -->
    <div
      v-if="showDropdown"
      class="absolute z-50 mt-3 w-56 rounded-xl shadow-xl bg-white ring-1 ring-gray-200 focus:outline-none border border-gray-100"
      :class="dropdownPosition"
    >
      <!-- Status Options -->
      <div class="p-2" role="menu">
        <div class="mb-3">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-1">
            {{ $t('progressTracking.updateStatus') }}
          </h4>
        </div>
        <button
          v-for="statusOption in statusOptions"
          :key="statusOption.value"
          @click="updateStatus(statusOption.value)"
          :class="[
            'group flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 mb-1',
            status === statusOption.value 
              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
          ]"
          role="menuitem"
        >
          <div 
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200',
              status === statusOption.value ? statusOption.activeBg : statusOption.bg
            ]"
          >
            <component 
              :is="statusOption.icon" 
              :class="[
                'w-4 h-4',
                status === statusOption.value ? statusOption.activeColor : statusOption.color
              ]" 
            />
          </div>
          <div class="flex-1 text-left">
            <div class="font-medium">{{ $t(`progressTracking.status.${statusOption.value}`) }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ statusOption.description }}</div>
          </div>
          <div v-if="status === statusOption.value" class="ml-2">
            <svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
      
      <!-- Notes Section -->
      <div class="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('progressTracking.teacherNotes') }}
        </label>
        <textarea
          v-model="localNotes"
          rows="2"
          class="w-full text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          :placeholder="$t('progressTracking.actions.addNotes')"
        ></textarea>
        <div class="flex justify-end mt-2 space-x-2">
          <button
            @click="cancelEdit"
            class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="saveNotes"
            class="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="showDropdown"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
interface Props {
  studentId: number
  milestoneId: number
  status: string
  notes?: string
  size?: 'normal' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'notStarted',
  notes: '',
  size: 'normal'
})

// Emits
const emit = defineEmits<{
  updateStatus: [data: { studentId: number, milestoneId: number, status: string, notes?: string }]
}>()

const { t } = useI18n()

// Reactive data
const showDropdown = ref(false)
const localNotes = ref(props.notes || '')
const dropdownPosition = ref('left-0')

// Status options with ico// Status options with enhanced design
const statusOptions = [
  {
    value: 'notStarted',
    icon: 'CircleIcon',
    color: 'text-gray-400',
    activeColor: 'text-gray-600',
    bg: 'bg-gray-50',
    activeBg: 'bg-gray-100',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    hoverColor: 'hover:bg-gray-200',
    description: 'لم يبدأ الطالب بعد'
  },
  {
    value: 'inProgress',
    icon: 'ClockIcon',
    color: 'text-blue-400',
    activeColor: 'text-blue-600',
    bg: 'bg-blue-50',
    activeBg: 'bg-blue-100',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    hoverColor: 'hover:bg-blue-200',
    description: 'الطالب يعمل على هذا المعلم'
  },
  {
    value: 'completed',
    icon: 'CheckCircleIcon',
    color: 'text-green-400',
    activeColor: 'text-green-600',
    bg: 'bg-green-50',
    activeBg: 'bg-green-100',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    hoverColor: 'hover:bg-green-200',
    description: 'تم إكمال المعلم بنجاح'
  },
  {
    value: 'skipped',
    icon: 'ForwardIcon',
    color: 'text-yellow-400',
    activeColor: 'text-yellow-600',
    bg: 'bg-yellow-50',
    activeBg: 'bg-yellow-100',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    hoverColor: 'hover:bg-yellow-200',
    description: 'تم تخطي المعلم مؤقتاً'
  },
  {
    value: 'needsReview',
    icon: 'ExclamationTriangleIcon',
    color: 'text-orange-400',
    activeColor: 'text-orange-600',
    bg: 'bg-orange-50',
    activeBg: 'bg-orange-100',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    hoverColor: 'hover:bg-orange-200',
    description: 'يحتاج إلى مراجعة إضافية'
  }
]

// Computed properties
const currentStatusOption = computed(() => {
  return statusOptions.find(option => option.value === props.status) || statusOptions[0]
})

const getStatusClasses = () => {
  const option = currentStatusOption.value
  return `${option.bgColor} ${option.borderColor} ${option.hoverColor} focus:ring-${option.color.split('-')[1]}-500`
}

const getStatusTitle = () => {
  return t(`progressTracking.status.${props.status}`)
}

const getStatusIcon = () => {
  return currentStatusOption.value.icon
}

// Methods
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    localNotes.value = props.notes || ''
    // Calculate dropdown position to avoid going off-screen
    calculateDropdownPosition()
  }
}

const closeDropdown = () => {
  showDropdown.value = false
}

const calculateDropdownPosition = () => {
  // Simple positioning - in a real app, you'd calculate based on viewport
  dropdownPosition.value = 'left-0'
}

const updateStatus = (newStatus: string) => {
  emit('updateStatus', {
    studentId: props.studentId,
    milestoneId: props.milestoneId,
    status: newStatus,
    notes: localNotes.value
  })
  closeDropdown()
}

const saveNotes = () => {
  emit('updateStatus', {
    studentId: props.studentId,
    milestoneId: props.milestoneId,
    status: props.status,
    notes: localNotes.value
  })
  closeDropdown()
}

const cancelEdit = () => {
  localNotes.value = props.notes || ''
  closeDropdown()
}

// Handle click outside
const handleClickOutside = (event: Event) => {
  if (showDropdown.value && !(event.target as Element).closest('.relative')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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

const ForwardIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
    </svg>
  `
}

const ExclamationTriangleIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
    </svg>
  `
}
</script>

<style scoped>
/* Additional styles for better visual feedback */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus ring colors for different statuses */
.focus\:ring-gray-500:focus {
  --tw-ring-color: rgb(107 114 128 / 0.5);
}

.focus\:ring-blue-500:focus {
  --tw-ring-color: rgb(59 130 246 / 0.5);
}

.focus\:ring-green-500:focus {
  --tw-ring-color: rgb(34 197 94 / 0.5);
}

.focus\:ring-yellow-500:focus {
  --tw-ring-color: rgb(234 179 8 / 0.5);
}

.focus\:ring-orange-500:focus {
  --tw-ring-color: rgb(249 115 22 / 0.5);
}
</style>

