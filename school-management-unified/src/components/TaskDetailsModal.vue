<template>
  <FikrDialog
    :show="show"
    plain-footer
    elevate
    size="lg"
    :title="$t('teacherWeeklySessions.taskDetails')"
    @close="$emit('close')"
  >
    <div v-if="task" class="space-y-5">
      <!-- Task header -->
      <div class="rounded-lg border border-fikr-hairline bg-fikr-surface-low/60 px-4 py-3">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h4 class="text-base font-semibold text-gray-900">{{ task.task_title }}</h4>
            <p v-if="task.task_description" class="mt-1 text-sm leading-relaxed text-gray-600">
              {{ task.task_description }}
            </p>
          </div>
          <span
            class="inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-medium"
            :class="statusBadgeClass(task)"
          >
            {{ getTaskStatusText(task) }}
          </span>
        </div>
      </div>

      <!-- Completion -->
      <div
        v-if="task.is_completed && task.completion_description"
        class="rounded-lg border border-emerald-200/80 bg-emerald-50/50 px-4 py-3"
      >
        <h5 class="mb-2 text-sm font-semibold text-emerald-900">
          {{ $t('teacherWeeklySessions.completionDescription') }}
        </h5>
        <p class="whitespace-pre-wrap text-sm leading-relaxed text-emerald-900/90">
          {{ task.completion_description }}
        </p>
        <div class="mt-3 grid grid-cols-1 gap-2 border-t border-emerald-200/80 pt-3 text-sm text-emerald-800 sm:grid-cols-2">
          <div>
            <span class="font-medium">{{ $t('common.completedAt') }}:</span>
            {{ formatDate(task.completed_at) }}
          </div>
          <div v-if="task.completed_by">
            <span class="font-medium">{{ $t('teacherWeeklySessions.completedBy') }}:</span>
            {{ task.completed_by }}
          </div>
        </div>
      </div>

      <!-- Postponement -->
      <div
        v-if="task.status === 'postponed' && task.postponement_reason"
        class="rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3"
      >
        <h5 class="mb-2 text-sm font-semibold text-amber-900">
          {{ $t('teacherWeeklySessions.postponementReason') }}
        </h5>
        <p class="whitespace-pre-wrap text-sm leading-relaxed text-amber-900/90">
          {{ task.postponement_reason }}
        </p>
        <div class="mt-3 border-t border-amber-200/80 pt-3 text-sm text-amber-800">
          <span class="font-medium">{{ $t('teacherWeeklySessions.postponedAt') }}:</span>
          {{ formatDate(task.postponed_at) }}
        </div>
      </div>

      <!-- Media -->
      <div v-if="task.media && task.media.length > 0">
        <h5 class="mb-3 text-sm font-semibold text-gray-900">
          {{ $t('teacherWeeklySessions.attachedMedia') }}
        </h5>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="media in task.media"
            :key="media.id"
            class="flex items-center gap-3 rounded-lg border border-fikr-hairline bg-white p-3"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700"
              aria-hidden="true"
            >
              <svg
                v-if="media.file_type === 'photo'"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900">{{ media.file_name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(media.file_size) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div class="rounded-lg border border-fikr-hairline px-4 py-3">
        <h5 class="mb-3 text-sm font-semibold text-gray-900">
          {{ $t('teacherWeeklySessions.taskMetadata') }}
        </h5>
        <div class="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
          <div>
            <span class="font-medium text-gray-900">{{ $t('common.created') }}:</span>
            {{ formatDate(task.created_at) }}
          </div>
          <div v-if="task.updated_at !== task.created_at">
            <span class="font-medium text-gray-900">{{ $t('common.updated') }}:</span>
            {{ formatDate(task.updated_at) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-10 text-center">
      <svg
        class="mx-auto h-10 w-10 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="mt-3 text-sm font-medium text-gray-900">
        {{ $t('teacherWeeklySessions.noTaskSelected') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ $t('teacherWeeklySessions.selectTaskToViewDetails') }}
      </p>
    </div>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--primary" @click="$emit('close')">
        {{ $t('common.close') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FikrDialog from '@/components/FikrDialog.vue'

const { t, locale } = useI18n()

withDefaults(
  defineProps<{
    show: boolean
    task?: any | null
  }>(),
  { task: null },
)

defineEmits<{
  close: []
}>()

const statusBadgeClass = (task: any): string => {
  if (task.is_completed) {
    return 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/80'
  }
  if (task.status === 'postponed') {
    return 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/80'
  }
  return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200/80'
}

const getTaskStatusText = (task: any): string => {
  if (task.is_completed) return t('common.completed')
  if (task.status === 'postponed') return t('teacherWeeklySessions.postponed')
  return t('common.pending')
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const loc = locale.value === 'ar' ? 'ar' : 'en-US'
  return date.toLocaleDateString(loc, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
</script>
