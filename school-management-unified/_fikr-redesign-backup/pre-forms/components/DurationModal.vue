<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40" @click="closeModal">
    <div class="relative mx-auto mt-16 w-11/12 max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg" @click.stop>
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEditing ? $t('classSettings.durations.editDuration') : $t('classSettings.durations.addDuration') }}
        </h3>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600"
          @click="closeModal"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form class="mt-5 space-y-5" @submit.prevent="saveDuration">
        <div>
          <label for="durationName" class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('classSettings.durations.durationName') }} <span class="text-red-500">*</span>
          </label>
          <input
            id="durationName"
            v-model="formData.name"
            type="text"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            :placeholder="$t('classSettings.durations.examples.standard')"
            required
          >
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>

        <div>
          <label for="durationMinutes" class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('classSettings.durations.durationLabel') }} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              id="durationMinutes"
              v-model.number="formData.minutes"
              type="number"
              min="1"
              max="480"
              class="block w-full rounded-md border border-gray-300 py-2 ps-3 pe-16 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              placeholder="45"
              required
            >
            <div class="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
              <span class="text-sm text-gray-500">{{ $t('common.minutes') }}</span>
            </div>
          </div>
          <p v-if="errors.minutes" class="mt-1 text-sm text-red-600">{{ errors.minutes }}</p>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm text-gray-900">
            <input
              id="isDefault"
              v-model="formData.isDefault"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            >
            {{ $t('classSettings.durations.setAsDefault') }}
          </label>
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-200 pt-5">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="closeModal"
          >
            {{ $t('classSettings.actions.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ isEditing ? $t('common.save') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  duration?: any
}>()

const emit = defineEmits<{
  close: []
  save: [durationData: any]
}>()

const formData = ref({
  name: '',
  minutes: 45,
  isDefault: false,
  color: 'gray'
})

const errors = ref({
  name: '',
  minutes: ''
})

const isEditing = computed(() => !!props.duration)

const isFormValid = computed(() => {
  return formData.value.name.trim() &&
         formData.value.minutes > 0 &&
         formData.value.minutes <= 480 &&
         !Object.values(errors.value).some(error => error)
})

const closeModal = () => {
  emit('close')
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

onMounted(() => {
  if (props.duration) {
    formData.value = {
      name: props.duration.name,
      minutes: props.duration.minutes,
      isDefault: props.duration.isDefault || false,
      color: props.duration.color || 'gray'
    }
  }
})
</script>
