<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          {{ $t('classSettings.startTimes.title') }}
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="mt-6">
        <form @submit.prevent="saveStartTimes" class="space-y-6">
          <!-- School Start Time -->
          <div>
            <label for="schoolStartTime" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('classSettings.startTimes.schoolStartTime') }} <span class="text-red-500">*</span>
            </label>
            <input
              id="schoolStartTime"
              v-model="formData.schoolStartTime"
              type="time"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
            <p class="mt-1 text-xs text-gray-500">{{ $t('classSettings.startTimes.schoolStartTime') }} {{ $t('common.description') }}</p>
          </div>

          <!-- First Class Time -->
          <div>
            <label for="firstClassTime" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('classSettings.startTimes.firstClassTime') }} <span class="text-red-500">*</span>
            </label>
            <input
              id="firstClassTime"
              v-model="formData.firstClassTime"
              type="time"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
            <p class="mt-1 text-xs text-gray-500">{{ $t('classSettings.startTimes.firstClassTime') }} {{ $t('common.description') }}</p>
          </div>

          <!-- Break Times -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="block text-sm font-medium text-gray-700">
                {{ $t('classSettings.startTimes.breakTimes') }}
              </label>
              <button
                @click="addBreakTime"
                type="button"
                class="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ $t('common.add') }}
              </button>
            </div>
            
            <div class="space-y-3">
              <div
                v-for="(breakTime, index) in formData.breakTimes"
                :key="index"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-1">
                  <input
                    v-model="breakTime.name"
                    type="text"
                    :placeholder="$t('common.name')"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div class="flex-1">
                  <input
                    v-model="breakTime.startTime"
                    type="time"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div class="flex-1">
                  <input
                    v-model.number="breakTime.duration"
                    type="number"
                    min="5"
                    max="60"
                    :placeholder="$t('common.minutes')"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <button
                  @click="removeBreakTime(index)"
                  type="button"
                  class="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-500">{{ $t('classSettings.startTimes.breakTimes') }} {{ $t('common.description') }}</p>
          </div>

          <!-- Lunch Time -->
          <div>
            <label for="lunchTime" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('classSettings.startTimes.lunchTime') }}
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                id="lunchTime"
                v-model="formData.lunchTime"
                type="time"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              <input
                v-model.number="formData.lunchDuration"
                type="number"
                min="15"
                max="120"
                :placeholder="$t('common.minutes')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">{{ $t('classSettings.startTimes.lunchTime') }} {{ $t('common.description') }}</p>
          </div>

          <!-- School End Time -->
          <div>
            <label for="schoolEndTime" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('classSettings.startTimes.endTime') }} <span class="text-red-500">*</span>
            </label>
            <input
              id="schoolEndTime"
              v-model="formData.schoolEndTime"
              type="time"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
            <p class="mt-1 text-xs text-gray-500">{{ $t('classSettings.startTimes.endTime') }} {{ $t('common.description') }}</p>
          </div>

          <!-- Quick Presets -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('common.quickSelect') }}
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                v-for="preset in timePresets"
                :key="preset.name"
                @click="applyPreset(preset)"
                type="button"
                class="p-3 text-left border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ preset.name }}</p>
                  <p class="text-sm text-gray-600">{{ preset.schoolStart }} - {{ preset.schoolEnd }}</p>
                  <p class="text-xs text-gray-500">{{ preset.description }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Time Validation Warning -->
          <div v-if="timeValidationWarning" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">{{ $t('common.warning') }}</h3>
                <p class="mt-1 text-sm text-yellow-700">{{ timeValidationWarning }}</p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              @click="closeModal"
              type="button"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              {{ $t('classSettings.actions.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="!isFormValid"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {{ $t('classSettings.actions.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const props = defineProps<{
  startTimes?: any
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [startTimesData: any]
}>()

// Reactive data
const formData = ref({
  schoolStartTime: '07:30',
  firstClassTime: '08:00',
  breakTimes: [
    { name: 'استراحة الصباح', startTime: '10:00', duration: 15 },
    { name: 'استراحة الظهر', startTime: '12:30', duration: 20 }
  ],
  lunchTime: '12:00',
  lunchDuration: 45,
  schoolEndTime: '15:00'
})

// Time presets
const timePresets = [
  {
    name: 'الدوام الصباحي',
    description: 'دوام صباحي تقليدي',
    schoolStart: '07:30',
    firstClass: '08:00',
    schoolEnd: '13:00'
  },
  {
    name: 'الدوام المطول',
    description: 'دوام كامل مع وقت غداء',
    schoolStart: '07:30',
    firstClass: '08:00',
    schoolEnd: '15:00'
  },
  {
    name: 'الدوام المسائي',
    description: 'دوام مسائي',
    schoolStart: '13:00',
    firstClass: '13:30',
    schoolEnd: '18:00'
  },
  {
    name: 'الدوام المرن',
    description: 'دوام مرن قصير',
    schoolStart: '08:00',
    firstClass: '08:30',
    schoolEnd: '14:00'
  }
]

// Computed properties
const isFormValid = computed(() => {
  return formData.value.schoolStartTime && 
         formData.value.firstClassTime && 
         formData.value.schoolEndTime &&
         !timeValidationWarning.value
})

const timeValidationWarning = computed(() => {
  const schoolStart = new Date(`2000-01-01 ${formData.value.schoolStartTime}`)
  const firstClass = new Date(`2000-01-01 ${formData.value.firstClassTime}`)
  const schoolEnd = new Date(`2000-01-01 ${formData.value.schoolEndTime}`)

  if (firstClass <= schoolStart) {
    return t('classSettings.validation.timeConflict') + ': ' + t('classSettings.startTimes.firstClassTime')
  }

  if (schoolEnd <= firstClass) {
    return t('classSettings.validation.timeConflict') + ': ' + t('classSettings.startTimes.endTime')
  }

  // Check break times
  for (const breakTime of formData.value.breakTimes) {
    if (breakTime.startTime) {
      const breakStart = new Date(`2000-01-01 ${breakTime.startTime}`)
      if (breakStart <= firstClass || breakStart >= schoolEnd) {
        return t('classSettings.validation.timeConflict') + ': ' + breakTime.name
      }
    }
  }

  // Check lunch time
  if (formData.value.lunchTime) {
    const lunchStart = new Date(`2000-01-01 ${formData.value.lunchTime}`)
    if (lunchStart <= firstClass || lunchStart >= schoolEnd) {
      return t('classSettings.validation.timeConflict') + ': ' + t('classSettings.startTimes.lunchTime')
    }
  }

  return ''
})

// Methods
const closeModal = () => {
  emit('close')
}

const addBreakTime = () => {
  formData.value.breakTimes.push({
    name: '',
    startTime: '',
    duration: 15
  })
}

const removeBreakTime = (index: number) => {
  formData.value.breakTimes.splice(index, 1)
}

const applyPreset = (preset: any) => {
  formData.value.schoolStartTime = preset.schoolStart
  formData.value.firstClassTime = preset.firstClass
  formData.value.schoolEndTime = preset.schoolEnd
  
  // Reset break times for preset
  if (preset.name === 'الدوام الصباحي') {
    formData.value.breakTimes = [
      { name: 'استراحة الصباح', startTime: '10:00', duration: 15 }
    ]
    formData.value.lunchTime = ''
    formData.value.lunchDuration = 0
  } else if (preset.name === 'الدوام المطول') {
    formData.value.breakTimes = [
      { name: 'استراحة الصباح', startTime: '10:00', duration: 15 },
      { name: 'استراحة الظهر', startTime: '14:00', duration: 15 }
    ]
    formData.value.lunchTime = '12:00'
    formData.value.lunchDuration = 45
  }
}

const saveStartTimes = () => {
  if (!isFormValid.value) return

  const startTimesData = {
    schoolStartTime: formData.value.schoolStartTime,
    firstClassTime: formData.value.firstClassTime,
    breakTimes: formData.value.breakTimes.filter(bt => bt.name && bt.startTime),
    lunchTime: formData.value.lunchTime,
    lunchDuration: formData.value.lunchDuration,
    schoolEndTime: formData.value.schoolEndTime,
    updatedAt: new Date().toISOString()
  }

  emit('save', startTimesData)
}

// Initialize form data
onMounted(() => {
  if (props.startTimes) {
    formData.value = {
      schoolStartTime: props.startTimes.schoolStartTime || '07:30',
      firstClassTime: props.startTimes.firstClassTime || '08:00',
      breakTimes: props.startTimes.breakTimes || [
        { name: 'استراحة الصباح', startTime: '10:00', duration: 15 },
        { name: 'استراحة الظهر', startTime: '12:30', duration: 20 }
      ],
      lunchTime: props.startTimes.lunchTime || '12:00',
      lunchDuration: props.startTimes.lunchDuration || 45,
      schoolEndTime: props.startTimes.schoolEndTime || '15:00'
    }
  }
})
</script>

<style scoped>
/* Custom styles for the modal */
</style>

