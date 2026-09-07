<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40" @click="closeModal">
    <div class="relative mx-auto mt-16 w-11/12 max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg" @click.stop>
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ grade ? $t('systemSettings.editGrade') : $t('systemSettings.addGrade') }}
        </h3>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600"
          :aria-label="$t('common.cancel')"
          @click="closeModal"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form class="mt-5 space-y-5" @submit.prevent="saveGrade">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('systemSettings.gradeNameAr') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.nameAr"
            type="text"
            required
            :placeholder="$t('systemSettings.gradeNameArPlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('systemSettings.gradeNameEn') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.nameEn"
            type="text"
            required
            :placeholder="$t('systemSettings.gradeNameEnPlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('systemSettings.gradeCode') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.code"
            type="text"
            required
            :placeholder="$t('systemSettings.gradeCodePlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          >
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-900">
            {{ $t('systemSettings.description') }}
          </label>
          <input
            v-model="formData.description"
            type="text"
            :placeholder="$t('systemSettings.gradeDescriptionPlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
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
            :disabled="!isFormValid"
            class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ grade ? $t('common.save') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CreateGradeData, Grade } from '@/services/grade.service'

const props = defineProps<{
  show: boolean
  grade?: Grade | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: CreateGradeData]
}>()

const formData = ref({
  nameEn: '',
  nameAr: '',
  code: '',
  description: '',
})

const isFormValid = computed(() =>
  formData.value.nameEn.trim() !== ''
  && formData.value.nameAr.trim() !== ''
  && formData.value.code.trim() !== '',
)

function emptyForm() {
  return {
    nameEn: '',
    nameAr: '',
    code: '',
    description: '',
  }
}

watch(
  [() => props.show, () => props.grade?.id],
  () => {
    if (!props.show) return
    if (props.grade) {
      formData.value = {
        nameEn: props.grade.nameEn || '',
        nameAr: props.grade.nameAr || '',
        code: props.grade.code || '',
        description: props.grade.description || '',
      }
    } else {
      formData.value = emptyForm()
    }
  },
  { immediate: true },
)

function closeModal() {
  emit('close')
}

function saveGrade() {
  if (!isFormValid.value) return
  emit('save', {
    nameEn: formData.value.nameEn.trim(),
    nameAr: formData.value.nameAr.trim(),
    code: formData.value.code.trim(),
    description: formData.value.description.trim(),
    displayOrder: props.grade?.displayOrder ?? 1,
  })
}
</script>
