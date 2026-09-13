<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40" @click="closeModal">
    <div class="relative mx-auto mt-12 w-11/12 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg" @click.stop>
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ $t('classSettings.startTimes.title') }}
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

      <form class="mt-5 space-y-5" @submit.prevent="saveStartTimes">
        <div>
          <label for="schoolStartTime" class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('classSettings.startTimes.schoolStartTime') }} <span class="text-red-500">*</span>
          </label>
          <input
            id="schoolStartTime"
            v-model="formData.schoolStartTime"
            type="time"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            required
          >
        </div>

        <div>
          <label for="firstClassTime" class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('classSettings.startTimes.firstClassTime') }} <span class="text-red-500">*</span>
          </label>
          <input
            id="firstClassTime"
            v-model="formData.firstClassTime"
            type="time"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            required
          >
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between gap-3">
            <label class="text-sm font-medium text-gray-900">
              {{ $t('classSettings.startTimes.breakTimes') }}
            </label>
            <button
              type="button"
              class="text-sm font-medium text-primary-700 hover:text-primary-800"
              @click="addBreakTime"
            >
              {{ $t('common.add') }}
            </button>
          </div>
          <div class="overflow-visible rounded-md border border-gray-200">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th class="px-3 py-2 text-start">{{ $t('common.name') }}</th>
                  <th class="px-3 py-2 text-start">{{ $t('common.time') }}</th>
                  <th class="px-3 py-2 text-start">{{ $t('common.minutes') }}</th>
                  <th class="px-3 py-2 text-end">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(breakTime, index) in formData.breakTimes" :key="index">
                  <td class="px-3 py-2">
                    <input
                      v-model="breakTime.name"
                      type="text"
                      :placeholder="$t('common.name')"
                      class="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    >
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model="breakTime.startTime"
                      type="time"
                      class="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-right text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    >
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model.number="breakTime.duration"
                      type="number"
                      min="5"
                      max="180"
                      :placeholder="$t('common.minutes')"
                      class="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    >
                  </td>
                  <td class="px-3 py-2 text-end">
                    <button
                      type="button"
                      class="p-1.5 text-gray-400 hover:text-red-600"
                      :aria-label="$t('common.remove')"
                      @click="removeBreakTime(index)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="!formData.breakTimes.length">
                  <td colspan="4" class="px-3 py-3 text-sm text-gray-500">
                    {{ $t('classSettings.startTimes.breakTimesEmpty') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <label for="schoolEndTime" class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('classSettings.startTimes.endTime') }} <span class="text-red-500">*</span>
          </label>
          <input
            id="schoolEndTime"
            v-model="formData.schoolEndTime"
            type="time"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            required
          >
        </div>

        <div v-if="timeValidationWarning" class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {{ timeValidationWarning }}
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
            {{ $t('common.save') }}
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
