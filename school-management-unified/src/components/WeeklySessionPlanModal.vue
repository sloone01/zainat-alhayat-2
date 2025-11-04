<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
           :class="isRTL ? 'text-right' : 'text-left'"
           :dir="isRTL ? 'rtl' : 'ltr'">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-6 pt-6 pb-4">
            <div class="w-full">
                <!-- Modal Header -->
                <div class="mb-6 border-b border-gray-200 pb-4">
                  <h3 class="text-xl leading-6 font-bold text-gray-900 mb-3"
                      :class="isRTL ? 'text-right' : 'text-left'">
                    {{ $t('weeklySessionPlans.manageTasks') }}
                  </h3>
                  <div v-if="schedule" class="bg-blue-50 rounded-lg p-4 text-sm text-gray-700"
                       :class="isRTL ? 'text-right' : 'text-left'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <span class="text-blue-600">📚</span>
                        <span><strong class="text-blue-800">{{ $t('common.course') }}:</strong> {{ schedule.course?.name || 'Unknown Course' }}</span>
                      </div>
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <span class="text-blue-600">👨‍🏫</span>
                        <span><strong class="text-blue-800">{{ $t('common.teacher') }}:</strong> {{ schedule.teacher?.first_name }} {{ schedule.teacher?.last_name }}</span>
                      </div>
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <span class="text-blue-600">🕐</span>
                        <span><strong class="text-blue-800">{{ $t('common.time') }}:</strong> {{ schedule.day_of_week }} {{ schedule.start_time }} - {{ schedule.end_time }}</span>
                      </div>
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <span class="text-blue-600">📅</span>
                        <span><strong class="text-blue-800">{{ $t('weeklySessionPlans.weekOf') }}:</strong> {{ formatWeekRange(weekStartDate) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Existing Tasks -->
                <div v-if="existingTasks.length > 0" class="mb-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
                      :class="isRTL ? 'text-right' : 'text-left'">
                    <span class="text-green-600" :class="isRTL ? 'ml-2' : 'mr-2'">📋</span>
                    {{ $t('weeklySessionPlans.existingTasks') }}
                  </h4>
                  <div class="space-y-3 max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-4">
                    <div v-for="task in existingTasks" :key="task.id"
                         class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div class="flex items-start justify-between" :class="isRTL ? 'flex-row-reverse' : ''">
                        <div class="flex-1" :class="isRTL ? 'text-right ml-4' : 'text-left mr-4'">
                          <h5 class="font-semibold text-gray-900 text-base">{{ task.task_title }}</h5>
                          <p v-if="task.task_description" class="text-sm text-gray-600 mt-2 leading-relaxed">{{ task.task_description }}</p>
                        </div>
                        <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                          <span :class="[
                            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                            task.is_completed ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          ]">
                            <span :class="isRTL ? 'ml-1' : 'mr-1'">{{ task.is_completed ? '✓' : '⏳' }}</span>
                            {{ task.is_completed ? $t('weeklySessionPlans.completed') : $t('weeklySessionPlans.incomplete') }}
                          </span>
                          <button
                            @click="deleteTask(task.id)"
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            :title="$t('common.delete')"
                          >
                            <span :class="isRTL ? 'ml-1' : 'mr-1'">🗑️</span>
                            {{ $t('common.delete') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Add New Tasks Section -->
                <div class="border-t border-gray-200 pt-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
                      :class="isRTL ? 'text-right' : 'text-left'">
                    <span class="text-blue-600" :class="isRTL ? 'ml-2' : 'mr-2'">➕</span>
                    {{ $t('weeklySessionPlans.addNewTasks') }}
                  </h4>
                </div>

                <!-- Multiple Tasks Form -->
                <div class="space-y-6">
                  <!-- Tasks List -->
                  <div v-for="(task, index) in newTasks" :key="`task-${index}`"
                       class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-4" :class="isRTL ? 'flex-row-reverse' : ''">
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {{ index + 1 }}
                        </div>
                        <h5 class="text-lg font-semibold text-gray-900">{{ $t('weeklySessionPlans.task') }} {{ index + 1 }}</h5>
                      </div>
                      <button
                        v-if="newTasks.length > 1"
                        @click="removeTask(index)"
                        type="button"
                        class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        :title="$t('common.remove')"
                      >
                        <span :class="isRTL ? 'ml-1' : 'mr-1'">🗑️</span>
                        {{ $t('common.remove') }}
                      </button>
                    </div>

                    <!-- Task Title -->
                    <div class="mb-4">
                      <label class="block text-sm font-semibold text-gray-800 mb-2 flex items-center"
                             :class="isRTL ? 'text-right' : 'text-left'">
                        <span class="text-blue-600" :class="isRTL ? 'ml-1' : 'mr-1'">📝</span>
                        {{ $t('weeklySessionPlans.form.title') }}
                        <span class="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        v-model="task.title"
                        type="text"
                        required
                        :placeholder="$t('weeklySessionPlans.form.titlePlaceholder')"
                        :dir="isRTL ? 'rtl' : 'ltr'"
                        class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm"
                        :class="isRTL ? 'text-right' : 'text-left'"
                      />
                    </div>

                    <!-- Task Description -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-800 mb-2 flex items-center"
                             :class="isRTL ? 'text-right' : 'text-left'">
                        <span class="text-blue-600" :class="isRTL ? 'ml-1' : 'mr-1'">📄</span>
                        {{ $t('weeklySessionPlans.form.description') }}
                      </label>
                      <textarea
                        v-model="task.description"
                        rows="4"
                        :placeholder="$t('weeklySessionPlans.form.descriptionPlaceholder')"
                        :dir="isRTL ? 'rtl' : 'ltr'"
                        class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm resize-none"
                        :class="isRTL ? 'text-right' : 'text-left'"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Add Another Task Button -->
                  <button
                    @click="addNewTask"
                    type="button"
                    class="w-full border-2 border-dashed border-blue-300 rounded-xl p-6 text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div class="flex items-center justify-center" :class="isRTL ? 'flex-row-reverse' : ''">
                      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors"
                           :class="isRTL ? 'ml-3' : 'mr-3'">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      </div>
                      <span class="text-lg font-semibold">{{ $t('weeklySessionPlans.addAnotherTask') }}</span>
                    </div>
                  </button>
                </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-t border-gray-200">
            <div class="flex flex-col sm:flex-row gap-3" :class="isRTL ? 'sm:flex-row-reverse' : 'sm:justify-between'">
              <button
                type="button"
                @click="$emit('close')"
                class="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 shadow-sm px-6 py-3 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                <span :class="isRTL ? 'ml-2' : 'mr-2'">✕</span>
                {{ $t('common.close') }}
              </button>
              <button
                type="submit"
                :disabled="loading || !hasValidTasks"
                class="inline-flex items-center justify-center rounded-lg border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 transition-all"
              >
                <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" :class="isRTL ? 'ml-2' : 'mr-2'"></span>
                <span v-else :class="isRTL ? 'ml-2' : 'mr-2'">💾</span>
                {{ loading ? $t('common.loading') : $t('weeklySessionPlans.saveAllTasks') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { WeeklySessionPlan } from '../services'

const { t, locale } = useI18n()

// RTL support
const isRTL = computed(() => locale.value === 'ar')

// Props
interface Props {
  show: boolean
  schedule?: any | null
  groupId: string
  weekStartDate: string
  existingTasks: WeeklySessionPlan[]
}

const props = withDefaults(defineProps<Props>(), {
  schedule: null,
  existingTasks: () => []
})

// Emits
const emit = defineEmits<{
  close: []
  save: [data: any]
  delete: [taskId: string]
}>()

// Reactive data
const loading = ref(false)

// Multiple tasks form data
const newTasks = ref([
  {
    title: '',
    description: ''
  }
])

// Computed
const isEditing = computed(() => false) // Always creating new tasks

const hasValidTasks = computed(() => {
  return newTasks.value.some(task => task.title.trim().length > 0)
})

// Methods
const resetForm = () => {
  newTasks.value = [
    {
      title: '',
      description: ''
    }
  ]
}

const addNewTask = () => {
  newTasks.value.push({
    title: '',
    description: ''
  })
}

const removeTask = (index: number) => {
  if (newTasks.value.length > 1) {
    newTasks.value.splice(index, 1)
  }
}

// Watch for show changes to reset form
watch(() => props.show, (show) => {
  if (show) {
    resetForm()
  }
})

const handleSubmit = async () => {
  console.log('Form submitted with tasks:', newTasks.value)
  console.log('Props:', { groupId: props.groupId, weekStartDate: props.weekStartDate, schedule: props.schedule })

  if (!props.groupId || !props.weekStartDate || !props.schedule) {
    console.error('Missing required props: groupId, weekStartDate, or schedule')
    alert('Missing required information. Please close and try again.')
    return
  }

  // Filter out tasks with empty titles
  const validTasks = newTasks.value.filter(task => task.title.trim().length > 0)

  if (validTasks.length === 0) {
    alert('At least one task title is required')
    return
  }

  loading.value = true

  try {
    // Emit all valid tasks for saving
    const tasksData = validTasks.map(task => ({
      groupId: props.groupId,
      weekStartDate: props.weekStartDate,
      scheduleId: props.schedule.id,
      title: task.title.trim(),
      description: task.description.trim()
    }))

    console.log('Emitting save event with tasks data:', tasksData)
    emit('save', tasksData)

    // Reset form after successful save
    resetForm()
    console.log('Form reset after save')
  } catch (error) {
    console.error('Error preparing form data:', error)
    alert('Error preparing form data: ' + error.message)
  } finally {
    loading.value = false
  }
}

const deleteTask = async (taskId: string) => {
  if (confirm(t('weeklySessionPlans.confirmDelete'))) {
    console.log('Delete task:', taskId)
    emit('delete', taskId)
  }
}

const formatWeekRange = (weekStart: string) => {
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  }

  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`
}
</script>
