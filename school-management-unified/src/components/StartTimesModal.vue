<template>
  <FikrDialog
    :show="true"
    size="md"
    plain-footer
    :title="$t('classSettings.startTimes.title')"
    @close="closeModal"
  >
    <form id="start-times-form" class="fk-form" @submit.prevent="saveStartTimes">
      <div class="fk-form__section">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="fk-form__row">
            <label for="schoolStartTime" class="fk-flabel"><span>{{ $t('classSettings.startTimes.schoolStartTime') }} *</span></label>
            <input id="schoolStartTime" v-model="formData.schoolStartTime" type="time" class="fk-field" required>
          </div>
          <div class="fk-form__row">
            <label for="firstClassTime" class="fk-flabel"><span>{{ $t('classSettings.startTimes.firstClassTime') }} *</span></label>
            <input id="firstClassTime" v-model="formData.firstClassTime" type="time" class="fk-field" required>
          </div>
          <div class="fk-form__row">
            <label for="schoolEndTime" class="fk-flabel"><span>{{ $t('classSettings.startTimes.endTime') }} *</span></label>
            <input id="schoolEndTime" v-model="formData.schoolEndTime" type="time" class="fk-field" required>
          </div>
        </div>
      </div>

      <div class="fk-form__section">
        <div class="flex items-center justify-between gap-3">
          <span class="fk-flabel"><span>{{ $t('classSettings.startTimes.breakTimes') }}</span></span>
          <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="addBreakTime">
            + {{ $t('common.add') }}
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="(breakTime, index) in formData.breakTimes"
            :key="index"
            class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-lg bg-fikr-pearl p-2 ring-1 ring-fikr-hairline"
          >
            <input v-model="breakTime.name" type="text" :placeholder="$t('common.name')" class="fk-field fk-field--sm bg-white">
            <input v-model="breakTime.startTime" type="time" class="fk-field fk-field--sm w-32 bg-white">
            <input
              v-model.number="breakTime.duration"
              type="number"
              min="5"
              max="180"
              :placeholder="$t('common.minutes')"
              class="fk-field fk-field--sm w-24 bg-white"
            >
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full text-fikr-ink-soft hover:bg-red-50 hover:text-red-600"
              :aria-label="$t('common.remove')"
              @click="removeBreakTime(index)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p v-if="!formData.breakTimes.length" class="rounded-lg bg-fikr-surface-low px-3.5 py-3 text-sm text-fikr-ink-soft">
            {{ $t('classSettings.startTimes.breakTimesEmpty') }}
          </p>
        </div>

        <div v-if="timeValidationWarning" class="fk-note fk-note--warn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{{ timeValidationWarning }}</span>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="closeModal">{{ $t('classSettings.actions.cancel') }}</button>
      <button type="submit" form="start-times-form" class="fk-btn fk-btn--primary" :disabled="!isFormValid">
        {{ $t('common.save') }}
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
  startTimes?: any
}>()

const emit = defineEmits<{
  close: []
  save: [startTimesData: any]
}>()

const defaultBreakTimes = () => [
  { name: t('classSettings.durations.examples.break'), startTime: '10:00', duration: 15 },
  { name: t('classSettings.startTimes.lunchTime'), startTime: '12:00', duration: 45 }
]

const formData = ref({
  schoolStartTime: '07:30',
  firstClassTime: '08:00',
  breakTimes: defaultBreakTimes(),
  schoolEndTime: '15:00'
})

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

  for (const breakTime of formData.value.breakTimes) {
    if (breakTime.startTime) {
      const breakStart = new Date(`2000-01-01 ${breakTime.startTime}`)
      if (breakStart <= firstClass || breakStart >= schoolEnd) {
        return t('classSettings.validation.timeConflict') + ': ' + (breakTime.name || t('classSettings.startTimes.breakTimes'))
      }
    }
  }

  return ''
})

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

const mergeLunchIntoBreaks = (breakTimes: any[], lunchTime?: string, lunchDuration?: number) => {
  const rows = [...(breakTimes || [])]
  const lunchName = t('classSettings.startTimes.lunchTime')
  const hasLunchRow = rows.some((row) =>
    row?.name === lunchName || (lunchTime && row?.startTime === lunchTime)
  )

  if (lunchTime && lunchDuration && !hasLunchRow) {
    rows.push({
      name: lunchName,
      startTime: lunchTime,
      duration: lunchDuration
    })
  }

  return rows.length ? rows : defaultBreakTimes()
}

const saveStartTimes = () => {
  if (!isFormValid.value) return

  const lunchName = t('classSettings.startTimes.lunchTime')
  const lunchRow = formData.value.breakTimes.find((row) => row.name === lunchName && row.startTime)

  emit('save', {
    schoolStartTime: formData.value.schoolStartTime,
    firstClassTime: formData.value.firstClassTime,
    breakTimes: formData.value.breakTimes.filter((row) => row.name && row.startTime),
    lunchTime: lunchRow?.startTime || '',
    lunchDuration: lunchRow?.duration || 0,
    schoolEndTime: formData.value.schoolEndTime,
    updatedAt: new Date().toISOString()
  })
}

onMounted(() => {
  if (props.startTimes) {
    formData.value = {
      schoolStartTime: props.startTimes.schoolStartTime || '07:30',
      firstClassTime: props.startTimes.firstClassTime || '08:00',
      breakTimes: mergeLunchIntoBreaks(
        props.startTimes.breakTimes,
        props.startTimes.lunchTime,
        props.startTimes.lunchDuration
      ),
      schoolEndTime: props.startTimes.schoolEndTime || '15:00'
    }
  }
})
</script>
