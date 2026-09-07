<template>
  <FikrDialog
    :show="true"
    plain-footer
    :title="isEditing ? $t('classSettings.durations.editDuration') : $t('classSettings.durations.addDuration')"
    @close="closeModal"
  >
    <form id="duration-form" class="fk-form" @submit.prevent="saveDuration">
      <div class="fk-form__section">
        <div class="fk-form__row">
          <label for="durationName" class="fk-flabel"><span>{{ $t('classSettings.durations.durationName') }} *</span></label>
          <input
            id="durationName"
            v-model="formData.name"
            type="text"
            class="fk-field"
            :placeholder="$t('classSettings.durations.examples.standard')"
            required
          >
          <p v-if="errors.name" class="text-xs text-red-600">{{ errors.name }}</p>
        </div>

        <div class="fk-form__row">
          <label for="durationMinutes" class="fk-flabel"><span>{{ $t('classSettings.durations.durationLabel') }} *</span></label>
          <div class="fk-field-wrap">
            <input
              id="durationMinutes"
              v-model.number="formData.minutes"
              type="number"
              min="1"
              max="480"
              class="fk-field"
              placeholder="45"
              required
            >
            <div class="fk-field-wrap__icon text-sm">{{ $t('common.minutes') }}</div>
          </div>
          <p v-if="errors.minutes" class="text-xs text-red-600">{{ errors.minutes }}</p>
        </div>

        <label class="fk-check">
          <input id="isDefault" v-model="formData.isDefault" type="checkbox">
          {{ $t('classSettings.durations.setAsDefault') }}
        </label>
      </div>
    </form>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="closeModal">{{ $t('classSettings.actions.cancel') }}</button>
      <button type="submit" form="duration-form" class="fk-btn fk-btn--primary" :disabled="!isFormValid">
        {{ isEditing ? $t('common.save') : $t('common.create') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import FikrDialog from '@/components/FikrDialog.vue'
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
