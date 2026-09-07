<template>
  <FikrDialog
    :show="show"
    plain-footer
    :title="year ? $t('settings.editYear') : $t('settings.addYear')"
    @close="closeModal"
  >
    <form id="year-form" class="fk-form" @submit.prevent="saveYear">
      <div class="fk-form__section">
        <div class="fk-form__row">
          <label class="fk-flabel"><span>
            {{ $t('settings.yearName') }} *</span></label>
          <input
            v-model="formData.name"
            type="text"
            required
            :placeholder="$t('settings.yearNamePlaceholder')"
            class="fk-field"
          >
        </div>

        <div class="fk-form__grid">
          <div class="fk-form__row">
            <label class="fk-flabel"><span>
              {{ $t('settings.startDate') }} *</span></label>
            <input
              v-model="formData.startDate"
              type="date"
              required
              lang="ar-OM-u-ca-gregory"
              class="fk-field"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel"><span>
              {{ $t('settings.endDate') }} *</span></label>
            <input
              v-model="formData.endDate"
              type="date"
              required
              lang="ar-OM-u-ca-gregory"
              class="fk-field"
            >
          </div>
        </div>

        <label v-if="!year || !(year.isActive || year.is_active)" class="fk-check">
          <input
            id="setAsActive"
            v-model="formData.setAsActive"
            type="checkbox"
            
          >
          {{ $t('settings.setAsActiveYear') }}
        </label>
      </div>
    </form>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="closeModal">{{ $t('common.cancel') }}</button>
      <button
        type="submit"
        form="year-form"
        class="fk-btn fk-btn--primary"
      >
        {{ year ? $t('common.save') : $t('common.create') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import FikrDialog from '@/components/FikrDialog.vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  show: boolean
  year?: any
}>()

const emit = defineEmits<{
  close: []
  save: [yearData: any]
}>()

const formData = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  setAsActive: false
})

watch(() => props.year, (newYear) => {
  if (newYear) {
    formData.value = {
      name: newYear.name || newYear.year || '',
      description: newYear.description || '',
      startDate: newYear.startDate || newYear.start_date || '',
      endDate: newYear.endDate || newYear.end_date || '',
      setAsActive: false
    }
  } else {
    formData.value = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      setAsActive: false
    }
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

const saveYear = () => {
  if (new Date(formData.value.startDate) >= new Date(formData.value.endDate)) {
    alert(t('settings.invalidDateRange'))
    return
  }

  emit('save', { ...formData.value })
}
</script>
