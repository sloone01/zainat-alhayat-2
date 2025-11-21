<template>
  <div v-if="show" class="fixed inset-0 z-[60] overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full mx-4 sm:my-8 sm:align-middle sm:max-w-3xl sm:mx-auto"
           :class="isRTL ? 'text-right' : 'text-left'"
           :dir="isRTL ? 'rtl' : 'ltr'"
           style="max-height: 90vh; overflow-y: auto;">
        
        <div class="bg-white px-4 sm:px-6 pt-6 pb-4">
          <div class="w-full">
            <!-- Modal Header -->
            <div class="mb-6 border-b border-gray-200 pb-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xl leading-6 font-bold text-gray-900"
                    :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('teacherWeeklySessions.taskDetails') }}
                </h3>
                <button
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Task Information -->
            <div v-if="task" class="space-y-6">
              <!-- Task Header -->
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="flex items-start justify-between" :class="isRTL ? 'flex-row-reverse' : ''">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-blue-900 mb-2">{{ task.task_title }}</h4>
                    <p v-if="task.task_description" class="text-blue-800 text-sm">{{ task.task_description }}</p>
                  </div>
                  <span
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ml-4 rtl:mr-4 rtl:ml-0',
                      task.is_completed 
                        ? 'bg-green-100 text-green-800' 
                        : task.status === 'postponed'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ getTaskStatusText(task) }}
                  </span>
                </div>
              </div>

              <!-- Completion Details (if completed) -->
              <div v-if="task.is_completed && task.completion_description" class="bg-green-50 rounded-lg p-4">
                <h5 class="text-lg font-semibold text-green-900 mb-3">{{ $t('teacherWeeklySessions.completionDescription') }}</h5>
                <div class="prose prose-sm max-w-none text-green-800">
                  <p class="whitespace-pre-wrap">{{ task.completion_description }}</p>
                </div>
                
                <!-- Completion Metadata -->
                <div class="mt-4 pt-4 border-t border-green-200">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <span class="font-medium">{{ $t('common.completedAt') }}:</span>
                      <span class="ml-2 rtl:mr-2 rtl:ml-0">{{ formatDate(task.completed_at) }}</span>
                    </div>
                    <div v-if="task.completed_by">
                      <span class="font-medium">{{ $t('teacherWeeklySessions.completedBy') }}:</span>
                      <span class="ml-2 rtl:mr-2 rtl:ml-0">{{ task.completed_by }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Postponement Details (if postponed) -->
              <div v-if="task.status === 'postponed' && task.postponement_reason" class="bg-yellow-50 rounded-lg p-4">
                <h5 class="text-lg font-semibold text-yellow-900 mb-3">{{ $t('teacherWeeklySessions.postponementReason') }}</h5>
                <div class="prose prose-sm max-w-none text-yellow-800">
                  <p class="whitespace-pre-wrap">{{ task.postponement_reason }}</p>
                </div>
                
                <!-- Postponement Metadata -->
                <div class="mt-4 pt-4 border-t border-yellow-200">
                  <div class="text-sm text-yellow-700">
                    <span class="font-medium">{{ $t('teacherWeeklySessions.postponedAt') }}:</span>
                    <span class="ml-2 rtl:mr-2 rtl:ml-0">{{ formatDate(task.postponed_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Attached Media -->
              <div v-if="task.media && task.media.length > 0" class="bg-gray-50 rounded-lg p-4">
                <h5 class="text-lg font-semibold text-gray-900 mb-3">{{ $t('teacherWeeklySessions.attachedMedia') }}</h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="media in task.media"
                    :key="media.id"
                    class="bg-white rounded-lg border border-gray-200 p-3"
                  >
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg v-if="media.file_type === 'photo'" class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <svg v-else class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="ml-3 rtl:mr-3 rtl:ml-0 flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ media.file_name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(media.file_size) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Task Metadata -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h5 class="text-lg font-semibold text-gray-900 mb-3">{{ $t('teacherWeeklySessions.taskMetadata') }}</h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span class="font-medium text-gray-900">{{ $t('common.created') }}:</span>
                    <span class="ml-2 rtl:mr-2 rtl:ml-0">{{ formatDate(task.created_at) }}</span>
                  </div>
                  <div v-if="task.updated_at !== task.created_at">
                    <span class="font-medium text-gray-900">{{ $t('common.updated') }}:</span>
                    <span class="ml-2 rtl:mr-2 rtl:ml-0">{{ formatDate(task.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Task Selected -->
            <div v-else class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('teacherWeeklySessions.noTaskSelected') }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ $t('teacherWeeklySessions.selectTaskToViewDetails') }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-4 sm:px-6 py-4 flex items-center justify-end">
          <button
            @click="$emit('close')"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
}>()

// Methods
const getTaskStatusText = (task: any): string => {
  if (task.is_completed) return '✅ ' + t('common.completed')
  if (task.status === 'postponed') return '⏸️ ' + t('teacherWeeklySessions.postponed')
  return '⏳ ' + t('common.pending')
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
