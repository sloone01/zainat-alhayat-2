<template>
  <div class="space-y-6 lg:space-y-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Parent IDs -->
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <label class="mb-1.5 block text-xs font-medium text-gray-600">
          {{ $t('enrollment.parentIdDocuments') }} <span class="text-red-500">*</span>
        </label>
        <label
          class="group mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-6 text-center transition-colors"
          :class="draggingParent
            ? 'border-primary-400 bg-primary-50/70'
            : 'border-gray-200 bg-gray-50/60 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="draggingParent = true"
          @dragleave.prevent="draggingParent = false"
          @drop.prevent="onDropParent"
        >
          <span class="text-sm font-semibold text-primary-700">{{ $t('enrollment.uploadDocuments') }}</span>
          <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">PDF · JPG · PNG</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            class="hidden"
            @change="onPickParent"
          >
        </label>
        <p v-if="errors.parent" class="mt-2 text-xs font-medium text-red-600" role="alert">{{ errors.parent }}</p>
        <ul v-if="localData.parentIdDocuments.length" class="mt-3 space-y-2">
          <li
            v-for="(file, index) in localData.parentIdDocuments"
            :key="`parent-${index}`"
            class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
          >
            <div class="min-w-0 flex-1 text-start">
              <p class="truncate text-sm font-medium text-gray-900">{{ fileLabel(file) }}</p>
              <p v-if="fileSize(file)" class="text-xs text-gray-500">{{ fileSize(file) }}</p>
            </div>
            <button type="button" class="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600" :aria-label="$t('common.remove')" @click="localData.parentIdDocuments.splice(index, 1)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </li>
        </ul>
      </div>

      <!-- Birth certificate -->
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <label class="mb-1.5 block text-xs font-medium text-gray-600">
          {{ $t('enrollment.birthCertificate') }} <span class="text-red-500">*</span>
        </label>
        <label
          class="group mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-6 text-center transition-colors"
          :class="draggingBirth
            ? 'border-primary-400 bg-primary-50/70'
            : 'border-gray-200 bg-gray-50/60 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="draggingBirth = true"
          @dragleave.prevent="draggingBirth = false"
          @drop.prevent="onDropBirth"
        >
          <span class="text-sm font-semibold text-primary-700">{{ $t('enrollment.uploadDocuments') }}</span>
          <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">PDF · JPG · PNG</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="onPickBirth">
        </label>
        <p v-if="errors.birth" class="mt-2 text-xs font-medium text-red-600" role="alert">{{ errors.birth }}</p>
        <div v-if="localData.birthCertificate" class="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
          <div class="min-w-0 flex-1 text-start">
            <p class="truncate text-sm font-medium text-gray-900">{{ fileLabel(localData.birthCertificate) }}</p>
            <p v-if="fileSize(localData.birthCertificate)" class="text-xs text-gray-500">{{ fileSize(localData.birthCertificate) }}</p>
          </div>
          <button type="button" class="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600" :aria-label="$t('common.remove')" @click="localData.birthCertificate = null">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <!-- Child ID -->
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <label class="mb-1.5 block text-xs font-medium text-gray-600">
          {{ $t('enrollment.childIdDocument') }} <span class="text-red-500">*</span>
        </label>
        <label
          class="group mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-6 text-center transition-colors"
          :class="draggingChild
            ? 'border-primary-400 bg-primary-50/70'
            : 'border-gray-200 bg-gray-50/60 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="draggingChild = true"
          @dragleave.prevent="draggingChild = false"
          @drop.prevent="onDropChild"
        >
          <span class="text-sm font-semibold text-primary-700">{{ $t('enrollment.uploadDocuments') }}</span>
          <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">PDF · JPG · PNG</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="onPickChild">
        </label>
        <p v-if="errors.child" class="mt-2 text-xs font-medium text-red-600" role="alert">{{ errors.child }}</p>
        <div v-if="localData.childIdDocument" class="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
          <div class="min-w-0 flex-1 text-start">
            <p class="truncate text-sm font-medium text-gray-900">{{ fileLabel(localData.childIdDocument) }}</p>
            <p v-if="fileSize(localData.childIdDocument)" class="text-xs text-gray-500">{{ fileSize(localData.childIdDocument) }}</p>
          </div>
          <button type="button" class="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600" :aria-label="$t('common.remove')" @click="localData.childIdDocument = null">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </div>

    <WizardStepNav
      v-if="compact"
      :disabled="!isValid"
      @next="handleNext"
      @back="$emit('back')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'

export type EnrollmentDocumentsModel = {
  parentIdDocuments: (File | string)[]
  birthCertificate: File | string | null
  childIdDocument: File | string | null
}

const props = withDefaults(
  defineProps<{
    compact?: boolean
    modelValue: EnrollmentDocumentsModel
  }>(),
  { compact: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: EnrollmentDocumentsModel): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { t } = useI18n()
const localData = ref<EnrollmentDocumentsModel>({
  parentIdDocuments: [...(props.modelValue.parentIdDocuments || [])],
  birthCertificate: props.modelValue.birthCertificate || null,
  childIdDocument: props.modelValue.childIdDocument || null,
})

watch(localData, (v) => emit('update:modelValue', { ...v, parentIdDocuments: [...v.parentIdDocuments] }), { deep: true })

const draggingParent = ref(false)
const draggingBirth = ref(false)
const draggingChild = ref(false)
const errors = ref({ parent: '', birth: '', child: '' })

const isValid = computed(
  () =>
    localData.value.parentIdDocuments.length > 0 &&
    !!localData.value.birthCertificate &&
    !!localData.value.childIdDocument,
)

const allowed = /\.(pdf|jpe?g|png)$/i
const maxBytes = 5 * 1024 * 1024

function validateFile(file: File): string {
  if (!allowed.test(file.name)) return t('validation.fileTypeInvalid')
  if (file.size > maxBytes) return t('validation.fileTooLarge')
  return ''
}

function acceptMany(files: File[]): File[] {
  const out: File[] = []
  for (const file of files) {
    const err = validateFile(file)
    if (err) {
      errors.value.parent = err
      continue
    }
    out.push(file)
  }
  return out
}

function acceptOne(files: File[], slot: 'birth' | 'child'): File | null {
  const file = files[0]
  if (!file) return null
  const err = validateFile(file)
  if (err) {
    errors.value[slot] = err
    return null
  }
  errors.value[slot] = ''
  return file
}

function onPickParent(e: Event) {
  const input = e.target as HTMLInputElement
  errors.value.parent = ''
  const accepted = acceptMany(Array.from(input.files || []))
  if (accepted.length) localData.value.parentIdDocuments = [...localData.value.parentIdDocuments, ...accepted]
  input.value = ''
}
function onDropParent(e: DragEvent) {
  draggingParent.value = false
  errors.value.parent = ''
  const accepted = acceptMany(Array.from(e.dataTransfer?.files || []))
  if (accepted.length) localData.value.parentIdDocuments = [...localData.value.parentIdDocuments, ...accepted]
}

function onPickBirth(e: Event) {
  const input = e.target as HTMLInputElement
  const file = acceptOne(Array.from(input.files || []), 'birth')
  if (file) localData.value.birthCertificate = file
  input.value = ''
}
function onDropBirth(e: DragEvent) {
  draggingBirth.value = false
  const file = acceptOne(Array.from(e.dataTransfer?.files || []), 'birth')
  if (file) localData.value.birthCertificate = file
}

function onPickChild(e: Event) {
  const input = e.target as HTMLInputElement
  const file = acceptOne(Array.from(input.files || []), 'child')
  if (file) localData.value.childIdDocument = file
  input.value = ''
}
function onDropChild(e: DragEvent) {
  draggingChild.value = false
  const file = acceptOne(Array.from(e.dataTransfer?.files || []), 'child')
  if (file) localData.value.childIdDocument = file
}

const fileLabel = (file: File | string): string => {
  if (typeof file !== 'string') return file.name
  if (file.startsWith('data:')) {
    const mime = file.slice(5, file.indexOf(';')) || ''
    if (mime.includes('pdf')) return 'document.pdf'
    if (mime.includes('png')) return 'document.png'
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'document.jpg'
    return 'document'
  }
  return file.split('/').pop() || file
}

const fileSize = (file: File | string): string => {
  if (typeof file === 'string') return ''
  const kb = file.size / 1024
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

const handleNext = () => {
  if (!isValid.value) {
    if (!localData.value.parentIdDocuments.length) errors.value.parent = t('enrollment.documentsRequired')
    if (!localData.value.birthCertificate) errors.value.birth = t('enrollment.documentsRequired')
    if (!localData.value.childIdDocument) errors.value.child = t('enrollment.documentsRequired')
    return
  }
  emit('next')
}
</script>
