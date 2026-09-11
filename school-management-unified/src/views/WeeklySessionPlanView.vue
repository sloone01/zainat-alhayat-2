<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('weeklySessionPlans.title')"
        :subtitle="$t('weeklySessionPlans.description')"
      />

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">
              {{ selectedGroup?.name || $t('weeklySessionPlans.selectGroup') }}
            </h2>
            <p class="fk-card__meta">{{ formatWeekRange(selectedWeekStart) }}</p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              v-if="selectedGroup && hasAnyTasks"
              type="button"
              class="fk-btn fk-btn--pearl"
              @click="copyFromPreviousWeek"
            >
              {{ $t('weeklySessionPlans.copyFromPreviousWeek') }}
            </button>
          </div>
        </header>
        <div class="px-5 py-5 sm:px-6">
          <div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
            <div class="min-w-0">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="wsp-group">
                {{ $t('common.group') }}
              </label>
              <select
                id="wsp-group"
                v-model="selectedGroupId"
                class="fk-field w-full"
              >
                <option value="">{{ $t('weeklySessionPlans.selectGroupPlaceholder') }}</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>

            <div class="min-w-0">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="wsp-week">
                {{ $t('weeklySessionPlans.selectWeek') }}
              </label>
              <div class="flex w-full items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  type="button"
                  class="inline-flex w-10 shrink-0 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  :aria-label="$t('weeklySessionPlans.previousWeek')"
                  @click="previousWeek"
                >
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="min-w-0 flex-1 px-2 py-2.5 text-center text-sm tabular-nums text-gray-900 hover:bg-gray-50"
                  :aria-label="$t('weeklySessionPlans.selectWeek')"
                  @click="openWeekPicker"
                >
                  {{ formatWeekRange(selectedWeekStart) }}
                </button>
                <button
                  type="button"
                  class="inline-flex w-10 shrink-0 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  :aria-label="$t('weeklySessionPlans.nextWeek')"
                  @click="nextWeek"
                >
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div class="h-0 w-0 overflow-hidden">
                <input
                  id="wsp-week"
                  ref="weekPicker"
                  :value="selectedWeekStart"
                  type="date"
                  tabindex="-1"
                  @change="onWeekPicked"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!selectedGroup"
        class="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-6 py-16 text-center"
      >
        <h3 class="text-base font-semibold text-gray-900">{{ $t('weeklySessionPlans.noGroupSelected') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ $t('weeklySessionPlans.noGroupSelectedDescription') }}</p>
      </div>

      <div
        v-else-if="loading"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-16 text-gray-500"
      >
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <div
        v-else-if="currentSchedule.length === 0"
        class="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-6 py-16 text-center"
      >
        <h3 class="text-base font-semibold text-gray-900">{{ $t('scheduleManagement.noClassesScheduled') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ $t('weeklySessionPlans.noScheduleHint') }}</p>
      </div>

      <div
        v-else
        class="fk-card"
      >
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">
              {{ $t('scheduleManagement.weeklySchedule') }} — {{ selectedGroup.name }}
            </h2>
            <p class="fk-card__meta">
              {{ $t('weeklySessionPlans.weekOf') }} {{ formatWeekRange(selectedWeekStart) }}
            </p>
          </div>
        </header>

        <div class="hidden overflow-x-auto lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-20 px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {{ $t('common.time') }}
                </th>
                <th
                  v-for="day in weekDays"
                  :key="day.key"
                  class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {{ $t(`scheduleManagement.days.${day.key}`) }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="timeSlot in timeSlots" :key="timeSlot.time" class="hover:bg-primary-50/20">
                <td class="whitespace-nowrap px-4 py-3 text-sm font-semibold tabular-nums text-gray-900">
                  {{ timeSlot.time }}
                </td>
                <td v-for="day in weekDays" :key="`${timeSlot.time}-${day.key}`" class="px-2 py-3 text-center align-top">
                  <template v-if="getClassForTimeAndDay(timeSlot.time, day.key)">
                    <button
                      type="button"
                      class="w-full rounded-xl border p-3 text-start transition-colors"
                      :class="
                        getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key)!.schedule_id) > 0
                          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                          : 'border-primary-200 bg-primary-50 hover:bg-primary-100'
                      "
                      @click="openTaskModal(getClassForTimeAndDay(timeSlot.time, day.key))"
                    >
                      <div class="text-sm font-semibold text-gray-900">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.subjectLabel }}
                      </div>
                      <div class="mt-1 text-xs text-gray-700">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.teacherLabel }}
                      </div>
                      <div
                        v-if="getClassForTimeAndDay(timeSlot.time, day.key)?.room"
                        class="mt-0.5 text-xs text-gray-500"
                      >
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.room }}
                      </div>
                      <div
                        v-if="getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key)!.schedule_id) > 0"
                        class="mt-1 text-xs font-semibold text-emerald-700"
                      >
                        {{ getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key)!.schedule_id) }}
                        {{ $t('weeklySessionPlans.tasks') }}
                      </div>
                    </button>
                  </template>
                  <div
                    v-else
                    class="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400"
                  >
                    —
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lg:hidden">
          <div v-for="day in weekDays" :key="day.key" class="border-b border-gray-100 last:border-b-0">
            <div class="bg-gray-50 px-5 py-3">
              <h3 class="text-sm font-semibold text-gray-900">{{ $t(`scheduleManagement.days.${day.key}`) }}</h3>
            </div>
            <div class="space-y-3 p-4">
              <div v-for="timeSlot in timeSlots" :key="timeSlot.time" class="flex items-center gap-3">
                <div class="w-14 shrink-0 text-sm font-semibold tabular-nums text-gray-500">{{ timeSlot.time }}</div>
                <div class="min-w-0 flex-1">
                  <template v-if="getClassForTimeAndDay(timeSlot.time, day.key)">
                    <button
                      type="button"
                      class="w-full rounded-xl border p-3 text-start transition-colors"
                      :class="
                        getTaskCount(getClassForTimeAndDay(timeSlot.time, day.key)!.schedule_id) > 0
                          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                          : 'border-primary-200 bg-primary-50 hover:bg-primary-100'
                      "
                      @click="openTaskModal(getClassForTimeAndDay(timeSlot.time, day.key))"
                    >
                      <div class="text-sm font-semibold text-gray-900">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.subjectLabel }}
                      </div>
                      <div class="mt-1 text-xs text-gray-700">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.teacherLabel }}
                        <template v-if="getClassForTimeAndDay(timeSlot.time, day.key)?.room">
                          · {{ getClassForTimeAndDay(timeSlot.time, day.key)?.room }}
                        </template>
                      </div>
                    </button>
                  </template>
                  <div
                    v-else
                    class="flex h-12 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400"
                  >
                    —
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <WeeklySessionPlanModal
      :show="showCreateModal"
      :schedule="selectedSchedule"
      :group-id="selectedGroupId"
      :week-start-date="selectedWeekStart"
      :existing-tasks="selectedSchedule ? tasksBySchedule[selectedSchedule.id] || [] : []"
      @close="closeModal"
      @save="savePlan"
      @delete="deleteTask"
      @viewDetails="openTaskDetailsModal"
    />

    <TaskDetailsModal
      :show="showTaskDetailsModal"
      :task="selectedTaskForDetails"
      @close="closeTaskDetailsModal"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import WeeklySessionPlanModal from '@/components/WeeklySessionPlanModal.vue'
import TaskDetailsModal from '@/components/TaskDetailsModal.vue'
import { authService } from '@/services'
import {
  weeklySessionPlanService,
  groupService,
  scheduleService,
  type WeeklySessionPlan,
  type Group,
  type Schedule,
} from '@/services'
import {
  normalizeScheduleDayKey,
  toScheduleHm,
  teacherDisplayName,
  courseDisplayName,
  decodeScheduleNotes,
} from '@/utils/schedule-display'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: string } | null
  return u?.school_id != null ? Number(u.school_id) : 1
})

const groups = ref<Group[]>([])
const schedules = ref<Schedule[]>([])
const weeklyPlans = ref<WeeklySessionPlan[]>([])
const selectedGroupId = ref('')
const selectedWeekStart = ref('')
const weekPicker = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const showCreateModal = ref(false)
const selectedSchedule = ref<Schedule | null>(null)
const showTaskDetailsModal = ref(false)
const selectedTaskForDetails = ref<any | null>(null)

const weekDays = [
  { key: 'sunday' },
  { key: 'monday' },
  { key: 'tuesday' },
  { key: 'wednesday' },
  { key: 'thursday' },
]

const defaultTimeSlots = [
  { time: '08:00' },
  { time: '08:45' },
  { time: '09:30' },
  { time: '10:15' },
  { time: '11:00' },
  { time: '11:45' },
  { time: '12:30' },
  { time: '13:15' },
]

const timeSlots = ref([...defaultTimeSlots])
const currentSchedule = ref<any[]>([])

const selectedGroup = computed(() => groups.value.find((g) => g.id === selectedGroupId.value))

const hasAnyTasks = computed(() => weeklyPlans.value.length > 0)

const tasksBySchedule = computed(() => {
  const grouped: Record<string, WeeklySessionPlan[]> = {}
  weeklyPlans.value.forEach((plan) => {
    if (!grouped[plan.schedule_id]) grouped[plan.schedule_id] = []
    grouped[plan.schedule_id].push(plan)
  })
  return grouped
})

const loadClassSettings = () => {
  try {
    const savedSettings = localStorage.getItem('classSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.timeSlots?.length > 0) {
        timeSlots.value = settings.timeSlots.map((slot: any) => ({ time: slot.startTime }))
      }
    }
  } catch (error) {
    console.warn('Failed to load class settings:', error)
  }
}

const loadGroups = async () => {
  try {
    groups.value = await groupService.getAll(schoolId.value)
  } catch (error) {
    console.error('Failed to load groups:', error)
    groups.value = []
  }
}

const loadSchedules = async () => {
  if (!selectedGroupId.value) {
    schedules.value = []
    currentSchedule.value = []
    return
  }

  try {
    schedules.value = await scheduleService.getSchedulesByGroup(selectedGroupId.value)
    currentSchedule.value = schedules.value
      .map((schedule) => {
        const dayKey = normalizeScheduleDayKey(schedule.day_of_week)
        if (!dayKey) return null

        return {
          id: schedule.id,
          day: dayKey,
          startTime: toScheduleHm(String(schedule.start_time)),
          endTime: toScheduleHm(String(schedule.end_time)),
          subjectLabel: courseDisplayName(schedule.course, '—'),
          teacherLabel: teacherDisplayName(
            schedule.teacher,
            t('scheduleManagement.unspecifiedTeacher'),
          ),
          room: schedule.room?.name || decodeScheduleNotes(schedule.notes || '').room || '',
          course_id: schedule.course_id,
          teacher_id: schedule.teacher_id,
          schedule_id: schedule.id,
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error('Failed to load schedules:', error)
    schedules.value = []
    currentSchedule.value = []
  }
}

const loadWeeklyPlans = async () => {
  if (!selectedGroupId.value || !selectedWeekStart.value) {
    weeklyPlans.value = []
    return
  }

  loading.value = true
  try {
    weeklyPlans.value = await weeklySessionPlanService.getAll(
      selectedGroupId.value,
      selectedWeekStart.value,
    )
  } catch (error) {
    console.error('Failed to load weekly plans:', error)
    weeklyPlans.value = []
  } finally {
    loading.value = false
  }
}

const reloadGroupData = async () => {
  await Promise.all([loadSchedules(), loadWeeklyPlans()])
}

watch(selectedGroupId, () => {
  void reloadGroupData()
})

watch(selectedWeekStart, () => {
  void loadWeeklyPlans()
})

onMounted(async () => {
  selectedWeekStart.value = weeklySessionPlanService.getCurrentWeekStartDate()
  loadClassSettings()
  await loadGroups()
  if (groups.value.length && !selectedGroupId.value) {
    selectedGroupId.value = groups.value[0].id
  }
})

const weekDate = (iso: string) => new Date(`${iso}T12:00:00`)

const toWeekStartIso = (date: Date) => weeklySessionPlanService.getWeekStartDate(date)

const previousWeek = () => {
  const currentDate = weekDate(selectedWeekStart.value)
  currentDate.setDate(currentDate.getDate() - 7)
  selectedWeekStart.value = toWeekStartIso(currentDate)
}

const nextWeek = () => {
  const currentDate = weekDate(selectedWeekStart.value)
  currentDate.setDate(currentDate.getDate() + 7)
  selectedWeekStart.value = toWeekStartIso(currentDate)
}

const onWeekPicked = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (!value) return
  selectedWeekStart.value = toWeekStartIso(weekDate(value))
}

const openWeekPicker = () => {
  const el = weekPicker.value
  if (!el) return
  if (typeof el.showPicker === 'function') {
    el.showPicker()
    return
  }
  el.focus()
  el.click()
}

const formatWeekRange = (weekStart: string) => {
  if (!weekStart) return ''
  const start = weekDate(weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const loc = locale.value === 'ar' ? 'ar-OM' : 'en-GB'
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString(loc, opts)} – ${end.toLocaleDateString(loc, opts)}`
}

const getClassForTimeAndDay = (time: string, day: string) =>
  currentSchedule.value.find((cls) => cls.startTime === time && cls.day === day)

const getTaskCount = (scheduleId: string) => tasksBySchedule.value[scheduleId]?.length || 0

const openTaskModal = (classData: any) => {
  const schedule = schedules.value.find((s) => s.id === classData.schedule_id)
  if (schedule) {
    selectedSchedule.value = schedule
    showCreateModal.value = true
  }
}

const copyFromPreviousWeek = async () => {
  if (!selectedWeekStart.value) return
  loading.value = true
  try {
    await weeklySessionPlanService.copyFromPreviousWeek(selectedWeekStart.value)
    await loadWeeklyPlans()
  } catch (error) {
    console.error('Failed to copy from previous week:', error)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  selectedSchedule.value = null
}

const savePlan = async (tasksData: any[]) => {
  if (!Array.isArray(tasksData)) {
    alert('Invalid data format')
    return
  }

  try {
    for (const taskData of tasksData) {
      await weeklySessionPlanService.create(taskData)
    }
    await loadWeeklyPlans()
    closeModal()
  } catch (error: any) {
    console.error('Failed to save task:', error)
    alert('Failed to save task: ' + (error?.message || error))
  }
}

const deleteTask = async (taskId: string) => {
  try {
    await weeklySessionPlanService.delete(taskId)
    await loadWeeklyPlans()
  } catch (error: any) {
    console.error('Failed to delete task:', error)
    alert('Failed to delete task: ' + (error?.message || error))
  }
}

const openTaskDetailsModal = (task: any) => {
  selectedTaskForDetails.value = task
  showTaskDetailsModal.value = true
}

const closeTaskDetailsModal = () => {
  selectedTaskForDetails.value = null
  showTaskDetailsModal.value = false
}
</script>
