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
            : uploading
              ? 'pointer-events-none opacity-60 border-gray-200 bg-gray-50/60'
              : 'border-gray-200 bg-gray-50/60 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="draggingParent = true"
          @dragleave.prevent="draggingParent = false"
          @drop.prevent="onDropParent"
        >
          <span class="text-sm font-semibold text-primary-700">
            {{ uploading ? $t('common.loading') : $t('enrollment.uploadDocuments') }}
          </span>
          <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">PDF · JPG · PNG</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            multiple
            class="hidden"
            :disabled="uploading"
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
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
              :aria-label="$t('common.remove')"
              :disabled="uploading"
              @click="localData.parentIdDocuments.splice(index, 1)"
            >
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
            : uploading
              ? 'pointer-events-none opacity-60 border-gray-200 bg-gray-50/60'
              : 'border-gray-200 bg-gray-50/60 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="draggingBirth = true"
          @dragleave.prevent="draggingBirth = false"
          @drop.prevent="onDropBirth"
        >
          <span class="text-sm font-semibold text-primary-700">
            {{ uploading ? $t('common.loading') : $t('enrollment.uploadDocuments') }}
          </span>
          <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">PDF · JPG · PNG</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="hidden" :disabled="uploading" @change="onPickBirth">
        </label>
        <p v-if="errors.birth" class="mt-2 text-xs font-medium text-red-600" role="alert">{{ errors.birth }}</p>
        <div v-if="localData.birthCertificate" class="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
          <div class="min-w-0 flex-1 text-start">
            <p class="truncate text-sm font-medium text-gray-900">{{ fileLabel(localData.birthCertificate) }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
            :aria-label="$t('common.remove')"
            :disabled="uploading"
            @click="localData.birthCertificate = null"
          >
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
            : uploading
              ? 'pointer-events-none opacity-60 border-gray-200 bg-gray-50/60'
              : 'border-gray-200 bg-gray-50/60 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="draggingChild = true"
          @dragleave.prevent="draggingChild = false"
          @drop.prevent="onDropChild"
        >
          <span class="text-sm font-semibold text-primary-700">
            {{ uploading ? $t('common.loading') : $t('enrollment.uploadDocuments') }}
          </span>
          <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">PDF · JPG · PNG</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="hidden" :disabled="uploading" @change="onPickChild">
        </label>
        <p v-if="errors.child" class="mt-2 text-xs font-medium text-red-600" role="alert">{{ errors.child }}</p>
        <div v-if="localData.childIdDocument" class="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
          <div class="min-w-0 flex-1 text-start">
            <p class="truncate text-sm font-medium text-gray-900">{{ fileLabel(localData.childIdDocument) }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
            :aria-label="$t('common.remove')"
            :disabled="uploading"
            @click="localData.childIdDocument = null"
          >
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
import enrollmentService from '@/services/enrollment.service'
import attachmentService from '@/services/attachment.service'

export type EnrollmentDocumentsModel = {
  /** Attachment download paths from AttachmentStorage (GCS). */
  parentIdDocuments: string[]
  birthCertificate: string | null
  childIdDocument: string | null
}

const props = withDefaults(
  defineProps<{
    compact?: boolean
    /** `public` = outer wizard (no JWT); `staff` = authenticated edit. */
    variant?: 'public' | 'staff'
    schoolId?: string
    modelValue: EnrollmentDocumentsModel
  }>(),
  { compact: false, variant: 'public', schoolId: '' },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: EnrollmentDocumentsModel): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { t } = useI18n()
const localData = ref<EnrollmentDocumentsModel>({
  parentIdDocuments: [...(props.modelValue.parentIdDocuments || [])].filter(
    (u): u is string => typeof u === 'string',
  ),
  birthCertificate:
    typeof props.modelValue.birthCertificate === 'string' ? props.modelValue.birthCertificate : null,
  childIdDocument:
    typeof props.modelValue.childIdDocument === 'string' ? props.modelValue.childIdDocument : null,
})

watch(localData, (v) => emit('update:modelValue', { ...v, parentIdDocuments: [...v.parentIdDocuments] }), {
  deep: true,
})

const draggingParent = ref(false)
const draggingBirth = ref(false)
const draggingChild = ref(false)
const uploading = ref(false)
const errors = ref({ parent: '', birth: '', child: '' })

const isValid = computed(
  () =>
    !uploading.value &&
    localData.value.parentIdDocuments.length > 0 &&
    !!localData.value.birthCertificate &&
    !!localData.value.childIdDocument,
)

const allowed = /\.(pdf|jpe?g|png|webp)$/i
const maxBytes = 5 * 1024 * 1024
const maxParentDocs = 2

function validateFile(file: File): string {
  if (props.variant === 'public' && !props.schoolId?.trim()) return t('enrollment.schoolRequired')
  if (!allowed.test(file.name)) return t('validation.fileTypeInvalid')
  if (file.size > maxBytes) return t('validation.fileTooLarge')
  return ''
}

async function uploadOne(
  file: File,
  purpose: 'enrollment_parent_id' | 'enrollment_birth_certificate' | 'enrollment_child_id',
): Promise<string> {
  if (props.variant === 'staff') {
    const row = await attachmentService.uploadFile(file, { purpose })
    return row.url
  }
  const row = await enrollmentService.uploadPublicAttachment(file, props.schoolId, purpose)
  return row.url
}

async function acceptMany(files: File[]): Promise<string[]> {
  const out: string[] = []
  const room = Math.max(0, maxParentDocs - localData.value.parentIdDocuments.length)
  for (const file of files) {
    if (out.length >= room) {
      errors.value.parent = t('enrollment.tooManyParentDocuments', { max: maxParentDocs })
      break
    }
    const err = validateFile(file)
    if (err) {
      errors.value.parent = err
      continue
    }
    out.push(await uploadOne(file, 'enrollment_parent_id'))
  }
  return out
}

async function acceptOne(files: File[], slot: 'birth' | 'child'): Promise<string | null> {
  const file = files[0]
  if (!file) return null
  const err = validateFile(file)
  if (err) {
    errors.value[slot] = err
    return null
  }
  errors.value[slot] = ''
  const purpose = slot === 'birth' ? 'enrollment_birth_certificate' : 'enrollment_child_id'
  return uploadOne(file, purpose)
}

async function onPickParent(e: Event) {
  const input = e.target as HTMLInputElement
  errors.value.parent = ''
  uploading.value = true
  try {
    const accepted = await acceptMany(Array.from(input.files || []))
    if (accepted.length) {
      localData.value.parentIdDocuments = [...localData.value.parentIdDocuments, ...accepted]
    }
  } catch (err) {
    errors.value.parent = err instanceof Error ? err.message : t('enrollment.uploadFailed')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function onDropParent(e: DragEvent) {
  draggingParent.value = false
  errors.value.parent = ''
  uploading.value = true
  try {
    const accepted = await acceptMany(Array.from(e.dataTransfer?.files || []))
    if (accepted.length) {
      localData.value.parentIdDocuments = [...localData.value.parentIdDocuments, ...accepted]
    }
  } catch (err) {
    errors.value.parent = err instanceof Error ? err.message : t('enrollment.uploadFailed')
  } finally {
    uploading.value = false
  }
}

async function onPickBirth(e: Event) {
  const input = e.target as HTMLInputElement
  uploading.value = true
  try {
    const url = await acceptOne(Array.from(input.files || []), 'birth')
    if (url) localData.value.birthCertificate = url
  } catch (err) {
    errors.value.birth = err instanceof Error ? err.message : t('enrollment.uploadFailed')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function onDropBirth(e: DragEvent) {
  draggingBirth.value = false
  uploading.value = true
  try {
    const url = await acceptOne(Array.from(e.dataTransfer?.files || []), 'birth')
    if (url) localData.value.birthCertificate = url
  } catch (err) {
    errors.value.birth = err instanceof Error ? err.message : t('enrollment.uploadFailed')
  } finally {
    uploading.value = false
  }
}

async function onPickChild(e: Event) {
  const input = e.target as HTMLInputElement
  uploading.value = true
  try {
    const url = await acceptOne(Array.from(input.files || []), 'child')
    if (url) localData.value.childIdDocument = url
  } catch (err) {
    errors.value.child = err instanceof Error ? err.message : t('enrollment.uploadFailed')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function onDropChild(e: DragEvent) {
  draggingChild.value = false
  uploading.value = true
  try {
    const url = await acceptOne(Array.from(e.dataTransfer?.files || []), 'child')
    if (url) localData.value.childIdDocument = url
  } catch (err) {
    errors.value.child = err instanceof Error ? err.message : t('enrollment.uploadFailed')
  } finally {
    uploading.value = false
  }
}

const fileLabel = (file: string): string => {
  if (file.startsWith('/api/attachments/')) return t('enrollment.uploadedAttachment')
  return file.split('/').pop() || file
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
