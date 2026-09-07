<template>
  <FikrDialog
    :show="show"
    plain-footer
    :title="semester ? $t('settings.editSemester') : $t('settings.addSemester')"
    @close="closeModal"
  >
    <form id="semester-form" class="fk-form" @submit.prevent="saveSemester">
      <div class="fk-form__section">
        <div class="fk-form__row">
          <label class="fk-flabel"><span>
            {{ $t('settings.semesterTitle') }} *</span></label>
          <input
            v-model="formData.title"
            type="text"
            required
            :placeholder="$t('settings.semesterTitlePlaceholder')"
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
              :min="yearStart"
              :max="yearEnd"
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
              :min="yearStart"
              :max="yearEnd"
              class="fk-field"
            >
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="closeModal">{{ $t('common.cancel') }}</button>
      <button
        type="submit"
        form="semester-form"
        class="fk-btn fk-btn--primary"
      >
        {{ semester ? $t('common.save') : $t('common.create') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import FikrDialog from '@/components/FikrDialog.vue'
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  show: boolean
  semester?: any
  year?: any
}>()

const emit = defineEmits<{
  close: []
  save: [semesterData: any]
}>()

const formData = ref({
  title: '',
  startDate: '',
  endDate: ''
})

const yearLabel = computed(() => props.year?.year || props.year?.name || '')
const yearStart = computed(() => (props.year?.start_date || props.year?.startDate || '').slice(0, 10))
const yearEnd = computed(() => (props.year?.end_date || props.year?.endDate || '').slice(0, 10))

watch(() => props.semester, (newSemester) => {
  if (newSemester) {
    formData.value = {
      title: newSemester.title || '',
      startDate: (newSemester.startDate || newSemester.start_date || '').slice(0, 10),
      endDate: (newSemester.endDate || newSemester.end_date || '').slice(0, 10)
    }
  } else {
    formData.value = {
      title: '',
      startDate: '',
      endDate: ''
    }
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

const saveSemester = () => {
  if (new Date(formData.value.startDate) >= new Date(formData.value.endDate)) {
    alert(t('settings.invalidDateRange'))
    return
  }

  emit('save', { ...formData.value })
}
</script>
