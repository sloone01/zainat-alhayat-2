<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40" @click="closeModal">
    <div class="relative mx-auto mt-16 w-11/12 max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg" @click.stop>
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ semester ? $t('settings.editSemester') : $t('settings.addSemester') }}
          </h3>
          <p v-if="yearLabel" class="mt-1 text-sm text-gray-500">
            {{ $t('settings.semestersForYear', { year: yearLabel }) }}
          </p>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600"
          @click="closeModal"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form class="mt-5 space-y-5" @submit.prevent="saveSemester">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('settings.semesterTitle') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.title"
            type="text"
            required
            :placeholder="$t('settings.semesterTitlePlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('settings.startDate') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.startDate"
            type="date"
            required
            lang="ar-OM-u-ca-gregory"
            :min="yearStart"
            :max="yearEnd"
            class="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('settings.endDate') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.endDate"
            type="date"
            required
            lang="ar-OM-u-ca-gregory"
            :min="yearStart"
            :max="yearEnd"
            class="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-200 pt-5">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="closeModal"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            {{ semester ? $t('common.save') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
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
