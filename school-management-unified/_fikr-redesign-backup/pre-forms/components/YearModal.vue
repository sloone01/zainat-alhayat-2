<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40" @click="closeModal">
    <div class="relative mx-auto mt-16 w-11/12 max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg" @click.stop>
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ year ? $t('settings.editYear') : $t('settings.addYear') }}
        </h3>
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

      <form class="mt-5 space-y-5" @submit.prevent="saveYear">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('settings.yearName') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            :placeholder="$t('settings.yearNamePlaceholder')"
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
            class="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
        </div>

        <label v-if="!year || !(year.isActive || year.is_active)" class="flex items-center gap-2 text-sm text-gray-900">
          <input
            id="setAsActive"
            v-model="formData.setAsActive"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          >
          {{ $t('settings.setAsActiveYear') }}
        </label>

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
            {{ year ? $t('common.save') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
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
