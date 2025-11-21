<template>
  <div v-if="show" class="fixed inset-0 z-[70] overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full mx-4 sm:my-8 sm:align-middle sm:max-w-2xl sm:mx-auto"
           :class="isRTL ? 'text-right' : 'text-left'"
           :dir="isRTL ? 'rtl' : 'ltr'"
           style="max-height: 90vh; overflow-y: auto;"
      >
        <form @submit.prevent="submitCompletion">
          <div class="bg-white px-6 pt-6 pb-4">
            <div class="w-full">
              <!-- Modal Header -->
              <div class="mb-6 border-b border-gray-200 pb-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl leading-6 font-bold text-gray-900"
                      :class="isRTL ? 'text-right' : 'text-left'">
                    {{ $t('teacherWeeklySessions.completeTask') }}
                  </h3>
                  <button
                    @click="$emit('close')"
                    type="button"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <!-- Task Info -->
                <div v-if="task" class="bg-green-50 rounded-lg p-4 text-sm text-gray-700 mt-4"
                     :class="isRTL ? 'text-right' : 'text-left'">
                  <div class="font-medium text-green-900">{{ task.task_title }}</div>
                  <div v-if="task.task_description" class="text-green-700 mt-1">{{ task.task_description }}</div>
                </div>
              </div>

              <!-- Completion Description -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('teacherWeeklySessions.completionDescription') }} *
                </label>
                <textarea
                  v-model="completionDescription"
                  :placeholder="$t('teacherWeeklySessions.completionDescriptionPlaceholder')"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  :class="[isRTL ? 'text-right' : 'text-left', { 'border-red-500': errors.description }]"
                  required
                ></textarea>
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">
                  {{ errors.description }}
                </p>
              </div>

              <!-- Media Upload -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('teacherWeeklySessions.uploadMedia') }}
                </label>
                
                <!-- Upload Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <label class="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center">
                    <svg class="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ $t('teacherWeeklySessions.uploadPhotos') }}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      @change="handlePhotoUpload"
                      class="hidden"
                    />
                  </label>

                  <label class="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center">
                    <svg class="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {{ $t('teacherWeeklySessions.uploadVideos') }}
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      @change="handleVideoUpload"
                      class="hidden"
                    />
                  </label>
                </div>

                <!-- File Info -->
                <div class="text-xs text-gray-500 mb-4" :class="isRTL ? 'text-right' : 'text-left'">
                  <p>{{ $t('teacherWeeklySessions.maxFileSize') }}: 10MB</p>
                  <p>{{ $t('teacherWeeklySessions.supportedFormats') }}: JPG, PNG, GIF | MP4, MOV, AVI</p>
                </div>

                <!-- Uploaded Files -->
                <div v-if="uploadedFiles.length > 0" class="space-y-2">
                  <div
                    v-for="(file, index) in uploadedFiles"
                    :key="index"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div class="flex items-center">
                      <svg v-if="file.type.startsWith('image/')" class="w-5 h-5 text-blue-500 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <svg v-else class="w-5 h-5 text-purple-500 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                      </div>
                    </div>
                    <button
                      @click="removeFile(index)"
                      type="button"
                      class="text-red-500 hover:text-red-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-3 sm:space-x-3 rtl:space-x-reverse">
            <button
              @click="$emit('close')"
              type="button"
              class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 order-2 sm:order-1"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="loading || !completionDescription.trim()"
              class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 rtl:ml-2 rtl:-mr-1 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? $t('common.saving') : $t('teacherWeeklySessions.completeTask') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// RTL support
const isRTL = computed(() => locale.value === 'ar')

// Props
interface Props {
  show: boolean
  task?: any | null
}

const props = withDefaults(defineProps<Props>(), {
  task: null
})

// Emits
const emit = defineEmits<{
  close: []
  submit: [description: string, files: File[]]
}>()

// Reactive data
const loading = ref(false)
const completionDescription = ref('')
const uploadedFiles = ref<File[]>([])
const errors = ref<{ description?: string }>({})

// Watch for show changes to reset form
watch(() => props.show, (show) => {
  if (show) {
    resetForm()
  }
})

// Methods
const resetForm = () => {
  completionDescription.value = ''
  uploadedFiles.value = []
  errors.value = {}
}

const handlePhotoUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    handleFileUpload(Array.from(files))
  }
}

const handleVideoUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    handleFileUpload(Array.from(files))
  }
}

const handleFileUpload = (files: File[]) => {
  const maxSize = 10 * 1024 * 1024 // 10MB

  files.forEach(file => {
    if (file.size > maxSize) {
      alert(`الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت.`)
      return
    }

    uploadedFiles.value.push(file)
  })
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!completionDescription.value.trim()) {
    errors.value.description = t('teacherWeeklySessions.completionDescriptionRequired')
    return false
  }

  return true
}

const submitCompletion = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    emit('submit', completionDescription.value.trim(), uploadedFiles.value)
    resetForm()
  } catch (error) {
    console.error('Error submitting completion:', error)
  } finally {
    loading.value = false
  }
}
</script>
