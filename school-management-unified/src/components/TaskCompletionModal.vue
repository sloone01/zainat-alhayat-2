<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full mx-4 sm:my-8 sm:align-middle sm:max-w-4xl sm:mx-auto"
           :class="isRTL ? 'text-right' : 'text-left'"
           :dir="isRTL ? 'rtl' : 'ltr'"
           style="max-height: 90vh; overflow-y: auto;"
      >
        <div class="bg-white px-6 pt-6 pb-4">
          <div class="w-full">
            <!-- Modal Header -->
            <div class="mb-6 border-b border-gray-200 pb-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xl leading-6 font-bold text-gray-900"
                    :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('teacherWeeklySessions.sessionTasks') }}
                </h3>
                <button
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- Session Info -->
              <div v-if="schedule" class="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 mt-4"
                   :class="isRTL ? 'text-right' : 'text-left'">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="flex items-start sm:items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                    <span class="text-blue-600 mt-0.5 sm:mt-0">📚</span>
                    <span class="break-words"><strong class="text-blue-800">{{ $t('common.course') }}:</strong> {{ getCourseName(schedule.course_id) }}</span>
                  </div>
                  <div class="flex items-start sm:items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                    <span class="text-blue-600 mt-0.5 sm:mt-0">👥</span>
                    <span class="break-words"><strong class="text-blue-800">{{ $t('common.group') }}:</strong> {{ getGroupName(schedule.group_id) }}</span>
                  </div>
                  <div class="flex items-start sm:items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                    <span class="text-blue-600 mt-0.5 sm:mt-0">⏰</span>
                    <span class="break-words"><strong class="text-blue-800">{{ $t('common.time') }}:</strong> {{ schedule.day_of_week }} {{ schedule.start_time }} - {{ schedule.end_time }}</span>
                  </div>
                  <div class="flex items-start sm:items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                    <span class="text-blue-600 mt-0.5 sm:mt-0">📅</span>
                    <span class="break-words"><strong class="text-blue-800">{{ $t('weeklySessionPlans.weekOf') }}:</strong> {{ formatWeekRange(weekStartDate) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tasks List (Read-only with completion options) -->
            <div v-if="existingTasks.length > 0" class="space-y-4">
              <div
                v-for="task in existingTasks"
                :key="task.id"
                :class="[
                  'border rounded-lg p-4 transition-all duration-200',
                  task.is_completed 
                    ? 'bg-green-50 border-green-200' 
                    : task.status === 'postponed'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-200'
                ]"
              >
                <!-- Task Header -->
                <div class="flex justify-between items-start mb-3" :class="isRTL ? 'flex-row-reverse' : ''">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2" :class="isRTL ? 'flex-row-reverse' : ''">
                      <h5 class="font-medium text-gray-900">{{ task.task_title }}</h5>
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
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
                    <p v-if="task.task_description" class="text-sm text-gray-600 mb-2">{{ task.task_description }}</p>
                    
                    <!-- Completion/Postponement Details -->
                    <div v-if="task.completion_description || task.postponement_reason" class="mt-3 p-3 rounded-md"
                         :class="task.is_completed ? 'bg-green-100' : 'bg-yellow-100'">
                      <h6 class="text-sm font-medium mb-1"
                          :class="task.is_completed ? 'text-green-900' : 'text-yellow-900'">
                        {{ task.is_completed ? $t('teacherWeeklySessions.completionDescription') : $t('teacherWeeklySessions.postponementReason') }}:
                      </h6>
                      <p class="text-sm"
                         :class="task.is_completed ? 'text-green-800' : 'text-yellow-800'">
                        {{ task.completion_description || task.postponement_reason }}
                      </p>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-xs"
                              :class="task.is_completed ? 'text-green-700' : 'text-yellow-700'">
                          {{ task.is_completed ? $t('common.completedAt') : $t('teacherWeeklySessions.postponedAt') }}:
                          {{ formatDate(task.completed_at || task.postponed_at) }}
                        </span>
                        <button
                          @click="viewTaskDetails(task)"
                          class="text-xs underline hover:no-underline"
                          :class="task.is_completed ? 'text-green-700 hover:text-green-900' : 'text-yellow-700 hover:text-yellow-900'"
                        >
                          {{ $t('teacherWeeklySessions.viewFullDetails') }}
                        </button>
                      </div>

                      <!-- Attached Media Preview -->
                      <div v-if="task.media && task.media.length > 0" class="mt-3 pt-3 border-t border-gray-200">
                        <h6 class="text-xs font-medium mb-2"
                            :class="task.is_completed ? 'text-green-900' : 'text-yellow-900'">
                          {{ $t('teacherWeeklySessions.attachedFiles') }} ({{ task.media.length }}):
                        </h6>
                        <div class="flex flex-wrap gap-2">
                          <div
                            v-for="media in task.media.slice(0, 3)"
                            :key="media.id"
                            class="flex items-center bg-white rounded border px-2 py-1"
                          >
                            <svg v-if="media.file_type === 'photo'" class="w-3 h-3 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <svg v-else class="w-3 h-3 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span class="text-xs text-gray-700 truncate max-w-20">{{ media.file_name }}</span>
                          </div>
                          <div v-if="task.media.length > 3" class="flex items-center text-xs text-gray-500">
                            +{{ task.media.length - 3 }} {{ $t('common.more') }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons (only if not completed/postponed) -->
                <div v-if="!task.is_completed && task.status !== 'postponed'"
                     class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2 sm:space-x-2 rtl:space-x-reverse pt-3 border-t border-gray-200">
                  <button
                    @click="openCompletionForm(task)"
                    type="button"
                    class="inline-flex items-center justify-center px-4 py-3 sm:py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ $t('teacherWeeklySessions.markAsCompleted') }}
                  </button>

                  <button
                    @click="openPostponementForm(task)"
                    type="button"
                    class="inline-flex items-center justify-center px-4 py-3 sm:py-2 text-sm font-medium text-yellow-700 bg-yellow-100 border border-transparent rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ $t('teacherWeeklySessions.postponeTask') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- No Tasks Message -->
            <div v-else class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('teacherWeeklySessions.noTasksFound') }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ $t('teacherWeeklySessions.noTasksFoundDescription') }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 flex items-center justify-end">
          <button
            @click="$emit('close')"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// RTL support
const isRTL = computed(() => locale.value === 'ar')

// Props
interface Props {
  show: boolean
  schedule?: any | null
  groupId: string
  weekStartDate: string
  existingTasks: any[]
  courses?: any[]
  groups?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  schedule: null,
  existingTasks: () => [],
  courses: () => [],
  groups: () => []
})

// Emits
const emit = defineEmits<{
  close: []
  complete: [taskId: string, description: string, files: File[]]
  postpone: [taskId: string, reason: string]
  viewDetails: [task: any]
}>()

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
  end.setDate(start.getDate() + 6)

  return `${start.toLocaleDateString('ar-SA')} - ${end.toLocaleDateString('ar-SA')}`
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
  if (task.is_completed) return '✅ ' + t('common.completed')
  if (task.status === 'postponed') return '⏸️ ' + t('teacherWeeklySessions.postponed')
  return '⏳ ' + t('common.pending')
}

const openCompletionForm = (task: any) => {
  // This will open a separate completion form modal
  emit('complete', task.id, '', [])
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
