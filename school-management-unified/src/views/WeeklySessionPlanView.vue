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
        <FikrLoader />
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
        class="fk-card overflow-hidden"
      >
        <FullScreenCalendar
          :data="calendarData"
          :month="calendarMonth"
          :selected="calendarSelected"
          @select-day="onCalendarSelectDay"
          @month-change="onCalendarMonthChange"
          @event-click="onCalendarEventClick"
        />
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
import FullScreenCalendar from '@/components/ui/fullscreen-calendar.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import {
  dateForWeekdayInWeek,
  groupDatedEvents,
  isSameMonth,
  parseLocalDateKey,
  startOfToday,
  startOfWeek,
  type CalendarEvent,
} from '@/utils/calendar-date'

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

const getTaskCount = (scheduleId: string) => tasksBySchedule.value[scheduleId]?.length || 0

const calendarMonth = computed(() => parseLocalDateKey(selectedWeekStart.value) || startOfToday())
const calendarSelected = computed(() => parseLocalDateKey(selectedWeekStart.value) || startOfToday())

const calendarData = computed(() =>
  groupDatedEvents(
    currentSchedule.value.flatMap((cls) => {
      const day = dateForWeekdayInWeek(selectedWeekStart.value, cls.day)
      if (!day) return []
      const taskCount = getTaskCount(cls.schedule_id)
      const time = cls.endTime ? `${cls.startTime}–${cls.endTime}` : String(cls.startTime || '')
      return [{
        day,
        event: {
          id: cls.id,
          name: cls.subjectLabel,
          time: taskCount ? `${time} · ${taskCount} ${t('weeklySessionPlans.tasks')}` : time,
          payload: cls,
        } satisfies CalendarEvent,
      }]
    }),
  ),
)

function onCalendarSelectDay(day: Date) {
  selectedWeekStart.value = toWeekStartIso(day)
}

function onCalendarMonthChange(month: Date) {
  const today = startOfToday()
  selectedWeekStart.value = toWeekStartIso(isSameMonth(today, month) ? today : startOfWeek(month))
}

function onCalendarEventClick(event: CalendarEvent) {
  openTaskModal(event.payload)
}

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
