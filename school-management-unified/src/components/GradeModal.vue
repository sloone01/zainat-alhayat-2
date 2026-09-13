<template>
  <FikrDialog
    :show="show"
    plain-footer
    :title="grade ? $t('systemSettings.editGrade') : $t('systemSettings.addGrade')"
    @close="closeModal"
  >
    <form id="grade-form" class="fk-form" @submit.prevent="saveGrade">
      <div class="fk-form__section">
        <div class="fk-form__row">
          <label class="fk-flabel"><span>
            {{ $t('systemSettings.gradeNameAr') }} *</span></label>
          <input
            v-model="formData.nameAr"
            type="text"
            required
            :placeholder="$t('systemSettings.gradeNameArPlaceholder')"
            class="fk-field"
          >
        </div>
        <div class="fk-form__row">
          <label class="fk-flabel"><span>
            {{ $t('systemSettings.gradeNameEn') }} *</span></label>
          <input
            v-model="formData.nameEn"
            type="text"
            required
            :placeholder="$t('systemSettings.gradeNameEnPlaceholder')"
            class="fk-field"
          >
        </div>
        <div class="fk-form__row">
          <label class="fk-flabel"><span>
            {{ $t('systemSettings.gradeCode') }} *</span></label>
          <input
            v-model="formData.code"
            type="text"
            required
            :placeholder="$t('systemSettings.gradeCodePlaceholder')"
            class="fk-field"
          >
        </div>
        <div class="fk-form__row">
          <label class="fk-flabel"><span>
            {{ $t('systemSettings.description') }}</span></label>
          <input
            v-model="formData.description"
            type="text"
            :placeholder="$t('systemSettings.gradeDescriptionPlaceholder')"
            class="fk-field"
          >
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="closeModal">{{ $t('common.cancel') }}</button>
      <button
        type="submit"
        form="grade-form"
        class="fk-btn fk-btn--primary"
        :disabled="!isFormValid"
      >
        {{ grade ? $t('common.save') : $t('common.create') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import FikrDialog from '@/components/FikrDialog.vue'
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
