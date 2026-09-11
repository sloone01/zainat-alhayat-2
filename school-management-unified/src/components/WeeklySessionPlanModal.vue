<template>
  <FikrDialog
    :show="show"
    plain-footer
    size="lg"
    :title="$t('weeklySessionPlans.manageTasks')"
    @close="$emit('close')"
  >
    <form id="weekly-session-plan-form" class="fk-form space-y-6" @submit.prevent="handleSubmit">
      <!-- Session summary -->
      <div
        v-if="schedule"
        class="rounded-lg border border-fikr-hairline bg-fikr-surface-low/60 px-4 py-3"
      >
        <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium text-gray-500">{{ $t('common.course') }}</dt>
            <dd class="mt-0.5 font-medium text-gray-900">
              {{ schedule.course?.name || $t('weeklySessionPlans.unknownCourse') }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500">{{ $t('common.teacher') }}</dt>
            <dd class="mt-0.5 font-medium text-gray-900">
              {{ schedule.teacher?.first_name }} {{ schedule.teacher?.last_name }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500">{{ $t('common.time') }}</dt>
            <dd class="mt-0.5 font-medium text-gray-900">
              {{ schedule.day_of_week }} {{ schedule.start_time }} – {{ schedule.end_time }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-gray-500">{{ $t('weeklySessionPlans.weekOf') }}</dt>
            <dd class="mt-0.5 font-medium text-gray-900">{{ formatWeekRange(weekStartDate) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Existing tasks -->
      <div v-if="existingTasks.length > 0">
        <h4 class="mb-3 text-sm font-semibold text-gray-900">
          {{ $t('weeklySessionPlans.existingTasks') }}
        </h4>
        <ul class="max-h-48 space-y-2 overflow-y-auto">
          <li
            v-for="task in existingTasks"
            :key="task.id"
            class="rounded-lg border border-fikr-hairline bg-white px-4 py-3"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900">{{ task.task_title }}</p>
                <p v-if="task.task_description" class="mt-1 text-sm leading-relaxed text-gray-600">
                  {{ task.task_description }}
                </p>
              </div>
              <div class="flex shrink-0 flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="
                    task.is_completed
                      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/80'
                      : 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/80'
                  "
                >
                  {{
                    task.is_completed
                      ? $t('weeklySessionPlans.completed')
                      : $t('weeklySessionPlans.incomplete')
                  }}
                </span>
                <button
                  v-if="task.is_completed && (task.completion_description || task.media)"
                  type="button"
                  class="fk-btn fk-btn--pearl !px-2.5 !py-1 text-xs"
                  @click="viewTaskDetails(task)"
                >
                  {{ $t('teacherWeeklySessions.viewDetails') }}
                </button>
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl !px-2.5 !py-1 text-xs text-red-700 hover:bg-red-50"
                  @click="deleteTask(task.id)"
                >
                  {{ $t('common.delete') }}
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Add new tasks (accordion — same chrome as course phases / milestones) -->
      <div class="border-t border-fikr-hairline pt-5">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 class="text-sm font-semibold text-gray-900">
              {{ $t('weeklySessionPlans.addNewTasks') }}
            </h4>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
            @click="addNewTask"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('weeklySessionPlans.addTask') }}
          </button>
        </div>

        <div v-if="newTasks.length > 0" class="space-y-3">
          <article
            v-for="(task, index) in newTasks"
            :key="`task-${index}`"
            class="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
            :class="activeTaskIndex === index ? 'border-primary-200 ring-primary-100' : ''"
          >
            <header
              class="flex cursor-pointer items-start justify-between gap-2 px-4 py-3 hover:bg-gray-50/80"
              :class="activeTaskIndex === index ? 'border-b border-gray-100 bg-primary-50/40' : ''"
              @click="setActiveTask(index)"
            >
              <div class="flex min-w-0 items-center gap-2">
                <span
                  class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800"
                >
                  {{ index + 1 }}
                </span>
                <div class="min-w-0">
                  <h5 class="truncate text-sm font-semibold text-gray-900">
                    {{ task.title || `${$t('weeklySessionPlans.task')} ${index + 1}` }}
                  </h5>
                  <p
                    v-if="activeTaskIndex !== index && task.description"
                    class="mt-0.5 truncate text-[11px] text-gray-500"
                  >
                    {{ task.description }}
                  </p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-1" @click.stop>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                  :aria-label="$t('weeklySessionPlans.deleteNewTask')"
                  @click="removeTask(index)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                  :aria-expanded="activeTaskIndex === index"
                  :aria-label="
                    activeTaskIndex === index
                      ? $t('weeklySessionPlans.collapseTask')
                      : $t('weeklySessionPlans.expandTask')
                  "
                  @click="setActiveTask(index)"
                >
                  <svg
                    class="h-4 w-4 transition-transform duration-200"
                    :class="activeTaskIndex === index ? 'rotate-180' : ''"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </header>

            <div v-if="activeTaskIndex === index" class="grid grid-cols-1 gap-4 p-4 lg:gap-6">
              <div class="space-y-2">
                <label
                  class="mb-1.5 block text-xs font-medium text-gray-600"
                  :for="`session-task-title-${index}`"
                >
                  <span class="text-red-500">*</span>
                  {{ $t('weeklySessionPlans.form.title') }}
                </label>
                <input
                  :id="`session-task-title-${index}`"
                  v-model="task.title"
                  type="text"
                  required
                  :placeholder="$t('weeklySessionPlans.form.titlePlaceholder')"
                  class="fk-field"
                >
              </div>
              <div class="space-y-2">
                <label class="mb-1.5 block text-xs font-medium text-gray-600">
                  {{ $t('weeklySessionPlans.form.description') }}
                </label>
                <textarea
                  v-model="task.description"
                  rows="2"
                  :placeholder="$t('weeklySessionPlans.form.descriptionPlaceholder')"
                  class="fk-field resize-none"
                />
              </div>
            </div>
          </article>
        </div>

        <div
          v-else
          class="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center"
        >
          <p class="text-xs font-medium text-gray-700">{{ $t('weeklySessionPlans.noNewTasks') }}</p>
          <p class="mt-1 text-[11px] text-gray-500">{{ $t('weeklySessionPlans.noNewTasksDescription') }}</p>
          <button
            type="button"
            class="fk-btn fk-btn--primary fk-btn--sm mt-4"
            @click="addNewTask"
          >
            {{ $t('weeklySessionPlans.createFirstTask') }}
          </button>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="$emit('close')">
        {{ $t('common.close') }}
      </button>
      <button
        type="submit"
        form="weekly-session-plan-form"
        class="fk-btn fk-btn--primary"
        :disabled="loading || !hasValidTasks"
      >
        {{ loading ? $t('common.loading') : $t('weeklySessionPlans.saveAllTasks') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import FikrDialog from '@/components/FikrDialog.vue'
import { useFeedback } from '@/composables/useFeedback'
import type { WeeklySessionPlan } from '../services'

const { t, locale } = useI18n()
const feedback = useFeedback()

interface Props {
  show: boolean
  schedule?: any | null
  groupId: string
  weekStartDate: string
  existingTasks: WeeklySessionPlan[]
}

const props = withDefaults(defineProps<Props>(), {
  schedule: null,
  existingTasks: () => [],
})

const emit = defineEmits<{
  close: []
  save: [data: any]
  delete: [taskId: string]
  viewDetails: [task: any]
}>()

const loading = ref(false)
/** Accordion: only one new-task body open; null = all collapsed. */
const activeTaskIndex = ref<number | null>(0)

type NewTaskDraft = { title: string; description: string }

const newTasks = ref<NewTaskDraft[]>([{ title: '', description: '' }])

const hasValidTasks = computed(() =>
  newTasks.value.some((task) => task.title.trim().length > 0),
)

function emptyTask(): NewTaskDraft {
  return { title: '', description: '' }
}

function focusTaskTitle(index: number) {
  nextTick(() => {
    const el = document.getElementById(`session-task-title-${index}`) as HTMLInputElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.focus()
  })
}

function setActiveTask(index: number) {
  if (activeTaskIndex.value === index) {
    activeTaskIndex.value = null
    return
  }
  activeTaskIndex.value = index
}

const resetForm = () => {
  newTasks.value = [emptyTask()]
  activeTaskIndex.value = 0
}

const addNewTask = () => {
  newTasks.value.push(emptyTask())
  const idx = newTasks.value.length - 1
  activeTaskIndex.value = idx
  focusTaskTitle(idx)
}

const removeTask = (index: number) => {
  newTasks.value.splice(index, 1)
  if (!newTasks.value.length) {
    activeTaskIndex.value = null
    return
  }
  if (activeTaskIndex.value == null) return
  if (activeTaskIndex.value === index) {
    activeTaskIndex.value = Math.min(index, newTasks.value.length - 1)
  } else if (activeTaskIndex.value > index) {
    activeTaskIndex.value -= 1
  }
}

watch(
  () => props.show,
  (show) => {
    if (show) resetForm()
  },
)

const handleSubmit = async () => {
  if (!props.groupId || !props.weekStartDate || !props.schedule) {
    feedback.error(t('weeklySessionPlans.missingRequiredInfo'))
    return
  }

  const validTasks = newTasks.value.filter((task) => task.title.trim().length > 0)

  if (validTasks.length === 0) {
    feedback.error(t('weeklySessionPlans.atLeastOneTaskRequired'))
    return
  }

  loading.value = true

  try {
    const tasksData = validTasks.map((task) => ({
      groupId: props.groupId,
      weekStartDate: props.weekStartDate,
      scheduleId: props.schedule.id,
      title: task.title.trim(),
      description: task.description.trim(),
    }))

    emit('save', tasksData)
    resetForm()
  } catch (error: any) {
    feedback.error(error?.message || t('common.error'))
  } finally {
    loading.value = false
  }
}

const deleteTask = async (taskId: string) => {
  const ok = await feedback.confirm({
    title: t('common.delete'),
    message: t('weeklySessionPlans.confirmDelete'),
    confirmLabel: t('common.delete'),
    danger: true,
  })
  if (ok) emit('delete', taskId)
}

const viewTaskDetails = (task: any) => {
  emit('viewDetails', task)
}

const formatWeekRange = (weekStart: string) => {
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  const loc = locale.value === 'ar' ? 'ar' : 'en-US'

  return `${startDate.toLocaleDateString(loc, options)} – ${endDate.toLocaleDateString(loc, options)}`
}
</script>
