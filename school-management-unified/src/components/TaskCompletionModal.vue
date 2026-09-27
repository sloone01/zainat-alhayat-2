<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full transform overflow-hidden rounded-2xl bg-white text-start shadow-xl transition-all sm:my-8 sm:mx-auto sm:max-w-3xl sm:align-middle"
           :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="flex max-h-[90vh] flex-col bg-white">
          <div class="shrink-0 border-b border-fikr-hairline px-5 py-4">
            <div class="flex items-center gap-3">
              <button
                v-if="completingTask"
                type="button"
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
                :aria-label="$t('common.back')"
                @click="backToTasks"
              >
                <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 class="min-w-0 flex-1 text-lg font-semibold text-fikr-ink">
                {{ completingTask ? $t('teacherWeeklySessions.completeTask') : $t('teacherWeeklySessions.sessionTasks') }}
              </h3>
              <div v-if="!completingTask && schedule && canStartOnlineSession" class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :disabled="inviteBusy || startBusy"
                  @click="$emit('sendInvite')"
                >
                  {{ inviteBusy ? $t('common.loading') : $t('onlineSession.sendInvite') }}
                </button>
                <button
                  type="button"
                  class="fk-btn fk-btn--primary fk-btn--sm"
                  :disabled="inviteBusy || startBusy"
                  @click="$emit('startOnline')"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ startBusy ? $t('common.loading') : $t('onlineSession.startNow') }}
                </button>
              </div>
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--ghost"
                :aria-label="$t('common.close')"
                @click="$emit('close')"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="schedule" class="mt-3 flex flex-wrap gap-2">
              <span class="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">{{ getCourseName(schedule.course_id) }}</span>
              <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{{ getGroupName(schedule.group_id) }}</span>
              <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700" dir="ltr">{{ dayLabel(schedule.day_of_week) }} · {{ clock(schedule.start_time) }}–{{ clock(schedule.end_time) }}</span>
              <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{{ formatWeekRange(weekStartDate) }}</span>
              <span
                class="rounded-full px-2.5 py-1 text-xs font-medium"
                :class="tasksLeft ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'"
              >{{ $t('teacherWeeklySessions.tasksToDo', { n: tasksLeft }) }}</span>
            </div>
          </div>

          <div
            class="relative overflow-hidden"
            :class="completingTask ? 'min-h-[28rem]' : ''"
            dir="ltr"
          >
            <div
              class="max-h-[70vh] overflow-y-auto px-5 py-4 transition-transform duration-300 ease-out"
              :dir="isRTL ? 'rtl' : 'ltr'"
              :style="{ transform: completingTask ? 'translateX(-100%)' : 'translateX(0)' }"
              :aria-hidden="completingTask ? 'true' : undefined"
            >

            <div v-if="existingTasks.length > 0" class="space-y-3">
              <article
                v-for="task in existingTasks"
                :key="task.id"
                class="rounded-xl border border-fikr-hairline bg-white p-4"
                :class="task.is_completed ? 'border-s-4 border-s-green-500' : task.status === 'postponed' ? 'border-s-4 border-s-amber-400' : 'border-s-4 border-s-gray-200'"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <h5 class="min-w-0 flex-1 font-semibold text-fikr-ink">{{ task.task_title }}</h5>
                  <span
                    class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="task.is_completed ? 'bg-green-100 text-green-800' : task.status === 'postponed' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'"
                  >
                    {{ getTaskStatusText(task) }}
                  </span>
                </div>
                <p v-if="task.task_description" class="mt-2 text-sm text-gray-600">{{ task.task_description }}</p>

                <div v-if="taskNote(task)" class="mt-3 rounded-lg bg-gray-50 px-3 py-2.5">
                  <p class="text-sm text-gray-800">{{ taskNote(task) }}</p>
                  <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xs text-gray-500">
                      {{ task.is_completed ? $t('common.completedAt') : $t('teacherWeeklySessions.postponedAt') }}
                      {{ formatDate(task.completed_at || task.postponed_at) }}
                    </span>
                    <button type="button" class="text-xs font-semibold text-primary-700 hover:text-primary-800" @click="viewTaskDetails(task)">
                      {{ $t('teacherWeeklySessions.viewFullDetails') }}
                    </button>
                  </div>
                </div>

                <div v-if="task.media && task.media.length" class="mt-3 space-y-2">
                  <div
                    v-for="media in task.media"
                    :key="media.id"
                    class="flex items-center gap-3 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/90 to-white px-3 py-2 shadow-sm"
                  >
                    <span
                      class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold tracking-wide"
                      :class="fileBadgeClass(media)"
                    >{{ fileBadge(media) }}</span>
                    <span class="min-w-0 flex-1 truncate text-sm font-medium text-fikr-ink">{{ media.file_name }}</span>
                    <div class="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        class="fk-iconbtn"
                        :aria-label="$t('common.view')"
                        :disabled="completionBusy"
                        @click="viewMedia(media)"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="fk-iconbtn"
                        :aria-label="$t('common.edit')"
                        :disabled="completionBusy"
                        @click="pickReplacement(media)"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="!task.is_completed && task.status !== 'postponed'" class="mt-3 flex flex-wrap justify-end gap-2">
                  <button type="button" class="fk-btn fk-btn--primary fk-btn--sm" @click="openCompletionForm(task)">
                    {{ $t('teacherWeeklySessions.markAsCompleted') }}
                  </button>
                  <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="openPostponementForm(task)">
                    {{ $t('teacherWeeklySessions.postponeTask') }}
                  </button>
                </div>
              </article>
            </div>

            <div v-else class="py-14 text-center text-sm font-medium text-gray-500">
              {{ $t('teacherWeeklySessions.noTasksFound') }}
            </div>
            <input
              ref="replaceInput"
              type="file"
              class="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              @change="onReplacePicked"
            />
            </div>

            <form
              class="absolute inset-0 overflow-y-auto px-5 py-4 transition-transform duration-300 ease-out"
              :dir="isRTL ? 'rtl' : 'ltr'"
              :style="{ transform: completingTask ? 'translateX(0)' : 'translateX(100%)' }"
              :aria-hidden="completingTask ? undefined : 'true'"
              @submit.prevent="submitCompletion"
            >
              <div v-if="completingTask" class="rounded-xl border border-fikr-hairline border-s-4 border-s-primary-500 bg-white p-4">
                <h4 class="font-semibold text-fikr-ink">{{ completingTask.task_title }}</h4>
                <p v-if="completingTask.task_description" class="mt-2 text-sm text-gray-600">{{ completingTask.task_description }}</p>
              </div>

              <div class="mt-4">
                <label class="fk-flabel" for="task-completion-notes">
                  <span>{{ $t('teacherWeeklySessions.completionDescription') }} *</span>
                </label>
                <textarea
                  id="task-completion-notes"
                  v-model="completionDescription"
                  rows="4"
                  class="fk-field"
                  required
                />
                <p v-if="formError" class="fk-alert fk-alert--error mt-2">{{ formError }}</p>
              </div>

              <div class="mt-4">
                <p class="fk-flabel">
                  <span>{{ $t('teacherWeeklySessions.uploadMedia') }} ({{ $t('common.optional') }})</span>
                </p>
                <div class="flex flex-wrap gap-2">
                  <label class="fk-btn fk-btn--pearl fk-btn--sm cursor-pointer">
                    {{ $t('teacherWeeklySessions.uploadPhotos') }}
                    <input type="file" multiple accept="image/*" class="hidden" @change="onPickFiles" />
                  </label>
                  <label class="fk-btn fk-btn--pearl fk-btn--sm cursor-pointer">
                    {{ $t('teacherWeeklySessions.uploadVideos') }}
                    <input type="file" multiple accept="video/*" class="hidden" @change="onPickFiles" />
                  </label>
                  <label class="fk-btn fk-btn--pearl fk-btn--sm cursor-pointer">
                    {{ $t('teacherWeeklySessions.uploadDocuments') }}
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      class="hidden"
                      @change="onPickFiles"
                    />
                  </label>
                </div>
                <ul v-if="uploadedFiles.length" class="mt-3 space-y-2">
                  <li
                    v-for="(file, index) in uploadedFiles"
                    :key="`${file.name}-${index}`"
                    class="flex items-center justify-between gap-3 rounded-xl border border-fikr-hairline bg-white px-3 py-2"
                  >
                    <span class="min-w-0 truncate text-sm text-fikr-ink">{{ file.name }}</span>
                    <button type="button" class="fk-iconbtn fk-iconbtn--ghost" :aria-label="$t('common.remove')" @click="removeFile(index)">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                </ul>
              </div>
            </form>
          </div>

          <div class="flex shrink-0 justify-end gap-2 border-t border-fikr-hairline px-5 py-3">
            <button v-if="completingTask" type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="backToTasks">
              {{ $t('common.back') }}
            </button>
            <button
              v-if="completingTask"
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm"
              :disabled="completionBusy || !completionDescription.trim()"
              @click="submitCompletion"
            >
              {{ completionBusy ? $t('common.saving') : $t('teacherWeeklySessions.completeTask') }}
            </button>
            <button v-else type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="$emit('close')">
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import apiClient from '@/services/api'
import { useFeedback } from '@/composables/useFeedback'

const { t, locale } = useI18n()
const feedback = useFeedback()

const isRTL = computed(() => locale.value === 'ar')

interface Props {
  show: boolean
  schedule?: any | null
  groupId: string
  weekStartDate: string
  existingTasks: any[]
  courses?: any[]
  groups?: any[]
  canStartOnlineSession?: boolean
  inviteBusy?: boolean
  startBusy?: boolean
  completionBusy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  schedule: null,
  existingTasks: () => [],
  courses: () => [],
  groups: () => [],
  canStartOnlineSession: false,
  inviteBusy: false,
  startBusy: false,
  completionBusy: false,
})

const emit = defineEmits<{
  close: []
  complete: [taskId: string, description: string, files: File[]]
  replaceFile: [taskId: string, mediaId: string, file: File]
  postpone: [taskId: string, reason: string]
  viewDetails: [task: any]
  startOnline: []
  sendInvite: []
}>()

const completingTask = ref<any | null>(null)
const completionDescription = ref('')
const uploadedFiles = ref<File[]>([])
const formError = ref('')
const replaceInput = ref<HTMLInputElement | null>(null)
const replacingMedia = ref<any | null>(null)

watch(() => props.show, (open) => {
  if (!open) backToTasks()
})

watch(() => props.existingTasks, (tasks) => {
  const current = completingTask.value
  if (current && tasks.some((task) => task.id === current.id && task.is_completed)) {
    backToTasks()
  }
})

const tasksLeft = computed(() => props.existingTasks.filter((task) => !task.is_completed).length)

// Methods
const getCourseName = (courseId: string): string => {
  // Use the course data from the schedule object if available
  if (props.schedule && props.schedule.course) {
    return props.schedule.course.name || props.schedule.course.title || 'مقرر غير معروف'
  }

  // Fallback to courses array
  const course = props.courses?.find(c => c.id === courseId)
  return course ? (course.name_ar || course.name) : 'مقرر غير معروف'
}

const getGroupName = (groupId: string): string => {
  const group = props.groups?.find(g => g.id === groupId)
  return group ? (group.name_ar || group.name) : 'مجموعة غير معروفة'
}

const formatWeekRange = (weekStart: string): string => {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 4)
  const tag = locale.value === 'ar' ? 'ar' : 'en'
  return `${start.toLocaleDateString(tag)} – ${end.toLocaleDateString(tag)}`
}

const clock = (value: string): string => String(value || '').slice(0, 5)

const dayLabel = (day: string): string => {
  const key = String(day || '').toLowerCase()
  const path = `scheduleManagement.days.${key}`
  const label = t(path)
  return label === path ? day : label
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTaskStatusText = (task: any): string => {
  if (task.is_completed) return t('common.completed')
  if (task.status === 'postponed') return t('teacherWeeklySessions.postponed')
  return t('common.pending')
}

const taskNote = (task: any): string =>
  task.completion_notes || task.completion_description || task.postponement_reason || ''

const fileBadge = (media: any): string => {
  const name = String(media.file_name || '').toLowerCase()
  const mime = String(media.mime_type || '').toLowerCase()
  if (media.file_type === 'photo' || mime.startsWith('image/')) return 'IMG'
  if (media.file_type === 'video' || mime.startsWith('video/')) return 'VID'
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'PDF'
  if (name.endsWith('.doc') || name.endsWith('.docx') || mime.includes('word')) return 'DOC'
  return 'FILE'
}

const fileBadgeClass = (media: any): string => {
  const badge = fileBadge(media)
  if (badge === 'PDF') return 'bg-rose-50 text-rose-700'
  if (badge === 'DOC') return 'bg-sky-50 text-sky-700'
  if (badge === 'VID') return 'bg-amber-50 text-amber-800'
  return 'bg-primary-100 text-primary-800'
}

const viewMedia = async (media: any) => {
  const path = String(media.file_path || '')
  if (!path) return
  try {
    if (path.startsWith('/api/attachments/')) {
      const response = await apiClient.get(path.replace(/^\/api/, ''), { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(response.data as Blob)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      return
    }
    window.open(path, '_blank', 'noopener,noreferrer')
  } catch (error: unknown) {
    feedback.error(error instanceof Error ? error.message : t('common.error'))
  }
}

const pickReplacement = (media: any) => {
  replacingMedia.value = media
  if (replaceInput.value) replaceInput.value.value = ''
  replaceInput.value?.click()
}

const onReplacePicked = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const media = replacingMedia.value
  replacingMedia.value = null
  input.value = ''
  if (!file || !media) return
  if (file.size > 50 * 1024 * 1024) {
    feedback.error(t('teacherWeeklySessions.fileTooLarge'))
    return
  }
  emit('replaceFile', String(media.session_plan_id), String(media.id), file)
}

const openCompletionForm = (task: any) => {
  completingTask.value = task
  completionDescription.value = ''
  uploadedFiles.value = []
  formError.value = ''
}

const backToTasks = () => {
  completingTask.value = null
  completionDescription.value = ''
  uploadedFiles.value = []
  formError.value = ''
}

const onPickFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  const maxSize = 50 * 1024 * 1024
  formError.value = ''
  for (const file of files) {
    if (file.size > maxSize) {
      formError.value = t('teacherWeeklySessions.fileTooLarge')
      continue
    }
    uploadedFiles.value.push(file)
  }
  input.value = ''
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const submitCompletion = () => {
  if (!completingTask.value || props.completionBusy) return
  if (!completionDescription.value.trim()) {
    formError.value = t('teacherWeeklySessions.completionDescriptionRequired')
    return
  }
  formError.value = ''
  emit('complete', completingTask.value.id, completionDescription.value.trim(), uploadedFiles.value.slice())
}

const openPostponementForm = (task: any) => {
  // This will open a separate postponement form modal
  const reason = prompt(t('teacherWeeklySessions.postponementReasonPrompt'))
  if (reason && reason.trim()) {
    emit('postpone', task.id, reason.trim())
  }
}

const viewTaskDetails = (task: any) => {
  emit('viewDetails', task)
}
</script>
