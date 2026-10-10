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
            <label for="periodsPerDay" class="fk-flabel"><span>{{ $t('classSettings.startTimes.periodsPerDay') }} *</span></label>
            <input id="periodsPerDay" v-model.number="formData.periodsPerDay" type="number" min="1" max="20" class="fk-field" required>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between gap-3 rounded-lg bg-fikr-pearl px-3.5 py-3 ring-1 ring-fikr-hairline">
          <span class="text-sm text-fikr-ink-muted">
            {{ $t('classSettings.startTimes.endTime') }}
            <span class="ms-1 text-xs text-fikr-ink-soft">({{ $t('classSettings.startTimes.autoCalculated') }})</span>
          </span>
          <span class="text-sm font-semibold tabular-nums text-navy-800" dir="ltr">{{ computedEndTime }}</span>
        </div>
        <p v-if="!props.defaultDuration" class="mt-2 text-xs text-fikr-ink-soft">
          {{ $t('classSettings.durations.defaultRequired') }}
        </p>
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
  /** Default class-period length (minutes) — drives the auto-calculated end time. */
  defaultDuration?: number
}>()

const emit = defineEmits<{
  close: []
  save: [startTimesData: any]
}>()

const formData = ref({
  schoolStartTime: '07:30',
  firstClassTime: '08:00',
  periodsPerDay: 6,
  breakTimes: [] as { name: string; startTime: string; duration: number }[],
})

function timeToMinutes(hhmm: string): number {
  const [h, m] = String(hhmm || '00:00').split(':').map((n) => Number(n) || 0)
  return h * 60 + m
}
function minutesToTime(total: number): string {
  const clamped = Math.max(0, Math.min(total, 24 * 60 - 1))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** End of day = first class + all periods + every break. Mirrors SettingsView's derivation. */
const computedEndTime = computed(() => {
  const dur = Number(props.defaultDuration) || 0
  const periods = Number(formData.value.periodsPerDay) || 0
  if (!dur || !periods) return '—'
  const breaksTotal = formData.value.breakTimes.reduce((s, b) => s + (Number(b.duration) || 0), 0)
  return minutesToTime(timeToMinutes(formData.value.firstClassTime) + periods * dur + breaksTotal)
})

const isFormValid = computed(() => {
  return !!formData.value.schoolStartTime &&
         !!formData.value.firstClassTime &&
         Number(formData.value.periodsPerDay) > 0 &&
         !timeValidationWarning.value
})

const timeValidationWarning = computed(() => {
  const schoolStart = timeToMinutes(formData.value.schoolStartTime)
  const firstClass = timeToMinutes(formData.value.firstClassTime)

  if (firstClass <= schoolStart) {
    return t('classSettings.validation.timeConflict') + ': ' + t('classSettings.startTimes.firstClassTime')
  }

  for (const breakTime of formData.value.breakTimes) {
    if (breakTime.startTime) {
      const breakStart = timeToMinutes(breakTime.startTime)
      if (breakStart <= firstClass) {
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

  return rows
}

const saveStartTimes = () => {
  if (!isFormValid.value) return

  const lunchName = t('classSettings.startTimes.lunchTime')
  const lunchRow = formData.value.breakTimes.find((row) => row.name === lunchName && row.startTime)

  emit('save', {
    schoolStartTime: formData.value.schoolStartTime,
    firstClassTime: formData.value.firstClassTime,
    periodsPerDay: Number(formData.value.periodsPerDay) || 1,
    breakTimes: formData.value.breakTimes.filter((row) => row.startTime && Number(row.duration) > 0),
    lunchTime: lunchRow?.startTime || '',
    lunchDuration: lunchRow?.duration || 0,
    schoolEndTime: computedEndTime.value,
    updatedAt: new Date().toISOString()
  })
}

onMounted(() => {
  if (props.startTimes) {
    formData.value = {
      schoolStartTime: props.startTimes.schoolStartTime || '07:30',
      firstClassTime: props.startTimes.firstClassTime || '08:00',
      periodsPerDay: Number(props.startTimes.periodsPerDay) > 0 ? Number(props.startTimes.periodsPerDay) : 6,
      breakTimes: mergeLunchIntoBreaks(
        props.startTimes.breakTimes,
        props.startTimes.lunchTime,
        props.startTimes.lunchDuration
      ),
    }
  }
})
</script>
