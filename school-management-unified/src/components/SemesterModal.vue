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
              :min="endDateMin"
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
import { toCalendarInputDate } from '@/utils/calendar-date'

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
const yearStart = computed(() => toCalendarInputDate(props.year?.start_date || props.year?.startDate))
const endDateMin = computed(() => formData.value.startDate || yearStart.value)

watch(() => props.semester, (newSemester) => {
  if (newSemester) {
    formData.value = {
      title: newSemester.title || '',
      startDate: toCalendarInputDate(newSemester.startDate || newSemester.start_date),
      endDate: toCalendarInputDate(newSemester.endDate || newSemester.end_date)
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
  if (!formData.value.startDate || !formData.value.endDate || formData.value.startDate >= formData.value.endDate) {
    alert(t('settings.invalidDateRange'))
    return
  }
  if (yearStart.value && formData.value.startDate < yearStart.value) {
    alert(t('settings.semesterOutsideYearRange'))
    return
  }

  emit('save', { ...formData.value })
}
</script>
