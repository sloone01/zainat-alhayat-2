<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          {{ isEditing ? $t('classSettings.durations.editDuration') : $t('classSettings.durations.addDuration') }}
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
        <form @submit.prevent="saveDuration" class="space-y-6">
          <!-- Duration Name -->
          <div>
            <label for="durationName" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('classSettings.durations.durationName') }} <span class="text-red-500">*</span>
            </label>
            <input
              id="durationName"
              v-model="formData.name"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('classSettings.durations.examples.standard')"
              required
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Duration in Minutes -->
          <div>
            <label for="durationMinutes" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('classSettings.durations.durationLabel') }} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="durationMinutes"
                v-model.number="formData.minutes"
                type="number"
                min="1"
                max="480"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="45"
                required
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 text-sm">{{ $t('common.minutes') }}</span>
              </div>
            </div>
            <p v-if="errors.minutes" class="mt-1 text-sm text-red-600">{{ errors.minutes }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ $t('classSettings.validation.durationMax') }}</p>
          </div>

          <!-- Quick Duration Presets -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('common.quickSelect') }}
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                v-for="preset in durationPresets"
                :key="preset.minutes"
                @click="selectPreset(preset)"
                type="button"
                class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <div class="text-center">
                  <p class="font-medium">{{ preset.minutes }}{{ $t('common.minutes') }}</p>
                  <p class="text-xs text-gray-500">{{ preset.name }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Set as Default -->
          <div class="flex items-center">
            <input
              id="isDefault"
              v-model="formData.isDefault"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isDefault" class="ml-2 block text-sm text-gray-900">
              {{ $t('classSettings.durations.setAsDefault') }}
            </label>
          </div>
          <p class="text-xs text-gray-500 -mt-2">
            {{ $t('classSettings.durations.setAsDefault') }} {{ $t('common.description') }}
          </p>

          <!-- Color Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('common.color') }}
            </label>
            <div class="flex gap-2">
              <button
                v-for="color in colorOptions"
                :key="color.value"
                @click="formData.color = color.value"
                type="button"
                :class="[
                  'w-8 h-8 rounded-full border-2 transition-all duration-200',
                  formData.color === color.value 
                    ? 'border-gray-800 scale-110' 
                    : 'border-gray-300 hover:border-gray-400'
                ]"
                :style="{ backgroundColor: color.hex }"
                :title="color.name"
              ></button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row sm:justify-between gap-3 pt-6 border-t border-gray-200">
            <!-- Delete Button (only for editing) -->
            <div>
              <button
                v-if="isEditing"
                @click="confirmDelete"
                type="button"
                class="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {{ $t('classSettings.durations.deleteDuration') }}
              </button>
            </div>

            <!-- Save and Cancel Buttons -->
            <div class="flex gap-3">
              <button
                @click="closeModal"
                type="button"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {{ $t('classSettings.actions.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="!isFormValid"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {{ $t('classSettings.actions.save') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60" @click="cancelDelete">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">{{ $t('common.confirmDelete') }}</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">{{ $t('classSettings.durations.deleteDuration') }} {{ $t('common.confirmDeleteMessage') }}</p>
        </div>
        <div class="flex gap-3 justify-center mt-4">
          <button
            @click="cancelDelete"
            class="px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="deleteDuration"
            class="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
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
  duration?: any
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [durationData: any]
  delete: [durationData: any]
}>()

// Reactive data
const formData = ref({
  name: '',
  minutes: 45,
  isDefault: false,
  color: 'blue'
})

const errors = ref({
  name: '',
  minutes: ''
})

const showDeleteConfirm = ref(false)

// Duration presets
const durationPresets = [
  { minutes: 30, name: t('classSettings.durations.examples.short') },
  { minutes: 45, name: t('classSettings.durations.examples.standard') },
  { minutes: 60, name: t('classSettings.durations.examples.long') },
  { minutes: 15, name: t('classSettings.durations.examples.break') },
  { minutes: 90, name: t('classSettings.durations.examples.lunch') },
  { minutes: 20, name: t('common.activity') }
]

// Color options
const colorOptions = [
  { value: 'blue', hex: '#3B82F6', name: 'Blue' },
  { value: 'green', hex: '#10B981', name: 'Green' },
  { value: 'purple', hex: '#8B5CF6', name: 'Purple' },
  { value: 'pink', hex: '#EC4899', name: 'Pink' },
  { value: 'yellow', hex: '#F59E0B', name: 'Yellow' },
  { value: 'red', hex: '#EF4444', name: 'Red' },
  { value: 'indigo', hex: '#6366F1', name: 'Indigo' },
  { value: 'gray', hex: '#6B7280', name: 'Gray' }
]

// Computed properties
const isEditing = computed(() => !!props.duration)

const isFormValid = computed(() => {
  return formData.value.name.trim() && 
         formData.value.minutes > 0 && 
         formData.value.minutes <= 480 &&
         !Object.values(errors.value).some(error => error)
})

// Methods
const closeModal = () => {
  emit('close')
}

const selectPreset = (preset: any) => {
  formData.value.minutes = preset.minutes
  if (!formData.value.name.trim()) {
    formData.value.name = preset.name
  }
}

const validateForm = () => {
  errors.value = {
    name: '',
    minutes: ''
  }

  if (!formData.value.name.trim()) {
    errors.value.name = t('classSettings.validation.nameRequired')
  }

  if (!formData.value.minutes || formData.value.minutes <= 0) {
    errors.value.minutes = t('classSettings.validation.durationMin')
  } else if (formData.value.minutes > 480) {
    errors.value.minutes = t('classSettings.validation.durationMax')
  }

  return !Object.values(errors.value).some(error => error)
}

const saveDuration = () => {
  if (!validateForm()) return

  const durationData = {
    id: props.duration?.id || Date.now().toString(),
    name: formData.value.name.trim(),
    minutes: formData.value.minutes,
    isDefault: formData.value.isDefault,
    color: formData.value.color,
    createdAt: props.duration?.createdAt || new Date().toISOString()
  }

  emit('save', durationData)
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deleteDuration = () => {
  emit('delete', props.duration)
  showDeleteConfirm.value = false
}

// Initialize form data
onMounted(() => {
  if (props.duration) {
    formData.value = {
      name: props.duration.name,
      minutes: props.duration.minutes,
      isDefault: props.duration.isDefault || false,
      color: props.duration.color || 'blue'
    }
  }
})
</script>

<style scoped>
/* Custom styles for the modal */
.z-60 {
  z-index: 60;
}
</style>

