<template>
  <DashboardLayout>
    <div class="fk-page fk-tt-canvas" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('teacher.mySchedule')"
        :subtitle="weekRangeLabel"
      />
      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <FikrLoader />
        <span class="text-sm">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadScheduleData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <section v-else class="fk-tt-board">
        <header class="flex flex-wrap items-end justify-between gap-4 lg:hidden">
          <p class="fk-tt-board__meta">{{ selectedDayHeading }}</p>
          <div class="fk-tt-seg">
            <button
              type="button"
              class="fk-tt-seg__opt"
              :class="mobileScope === 'day' ? 'fk-tt-seg__opt--on' : ''"
              @click="mobileScope = 'day'"
            >
              {{ $t('scheduleUi.day') }}
            </button>
            <button
              type="button"
              class="fk-tt-seg__opt"
              :class="mobileScope === 'week' ? 'fk-tt-seg__opt--on' : ''"
              @click="mobileScope = 'week'"
            >
              {{ $t('scheduleUi.week') }}
            </button>
          </div>
        </header>

        <div class="flex flex-wrap gap-2 lg:hidden">
          <span class="fk-tt-chip">{{ $t('scheduleUi.periods', { count: dayPeriodCount }) }}</span>
          <span class="fk-tt-chip">{{ $t('scheduleUi.groups', { count: dayGroupCount }) }}</span>
        </div>

        <div v-if="teacherSchedules.length > 0">
          <div class="hidden lg:block">
            <ScheduleWeekGrid
              :days="weekDays"
              :slots="weekGridSlots"
              :today-key="weekDays[todayIndex]?.key || 'sunday'"
              :cells="weekGridCells"
            />
          </div>

          <ScheduleMobileFeed
            v-if="mobileScope === 'day'"
            variant="lessons"
            :show-strip="false"
            :items="mobileDayItems"
            :week-days="weekDays"
            :selected-index="mobileDayIndex"
            :today-index="todayIndex"
            :empty-label="$t('teacher.noSchedule')"
            :reset-key="`${mobileDayIndex}`"
          />
          <div v-else class="space-y-5 lg:hidden">
            <section v-for="(day, index) in weekDays" :key="day.key">
              <h3 class="mb-2 text-sm font-semibold text-[#0a2147]">
                {{ $t(`scheduleManagement.days.${day.key}`) }}
              </h3>
              <ScheduleMobileFeed
                variant="lessons"
                :show-strip="false"
                :items="itemsForDay(index)"
                :week-days="weekDays"
                :selected-index="index"
                :today-index="todayIndex"
                :empty-label="$t('teacher.noSchedule')"
                :reset-key="`week-${index}`"
              />
            </section>
          </div>
        </div>

        <div v-else class="fk-tt-cell fk-tt-cell--empty min-h-40">
          <p class="text-sm font-semibold">{{ $t('teacher.noSchedule') }}</p>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ScheduleMobileFeed, { type ScheduleMobileItem } from '@/components/ScheduleMobileFeed.vue'
import ScheduleWeekGrid, { type WeekGridCell, type WeekGridSlot } from '@/components/ScheduleWeekGrid.vue'
import { scheduleService } from '@/services/schedule.service'
import { authService } from '@/services'
import { formatSchoolWeekRange, periodPhase, schoolWeekDates, schoolWeekdayIndex } from '@/utils/schedule-display'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const schedules = ref<any[]>([])
const mobileDayIndex = ref(0)
const mobileScope = ref<'day' | 'week'>('day')
const todayIndex = schoolWeekdayIndex()
const weekDates = schoolWeekDates()

function dayIndexFor(key: string) {
  return weekDays.findIndex((d) => d.key === key)
}

const weekRangeLabel = computed(() => {
  const range = formatSchoolWeekRange(locale.value)
  return t('scheduleUi.weekRange', range)
})

const weekGridSlots = computed<WeekGridSlot[]>(() => timeSlots.value.map((slot) => ({ time: slot.time })))

const weekGridCells = computed(() => {
  const map: Record<string, WeekGridCell> = {}
  for (const slot of timeSlots.value) {
    for (const day of weekDays) {
      const cls = getClassForTimeAndDay(slot.time, day.key)
      if (!cls) continue
      const start = formatScheduleTime(cls.start_time)
      const end = formatScheduleTime(cls.end_time)
      map[`${slot.time}|${day.key}`] = {
        title: scheduleSubject(cls),
        meta: [scheduleGroup(cls), scheduleRoomMeta(cls)].filter(Boolean).join(' · '),
        now: periodPhase(dayIndexFor(day.key), todayIndex, start, end) === 'now',
      }
    }
  }
  return map
})

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

const configuredSlots = ref<{ time: string }[]>([...defaultTimeSlots])

const weekDays = [
  { key: 'sunday', name: 'الأحد' },
  { key: 'monday', name: 'الإثنين' },
  { key: 'tuesday', name: 'الثلاثاء' },
  { key: 'wednesday', name: 'الأربعاء' },
  { key: 'thursday', name: 'الخميس' },
]

const teacherSchedules = computed(() => schedules.value)

const timeSlots = computed(() => {
  const times = new Set<string>()
  configuredSlots.value.forEach((s) => times.add(s.time))
  teacherSchedules.value.forEach((s: { start_time?: string }) => {
    const normalized = formatScheduleTime(s.start_time)
    if (normalized) times.add(normalized)
  })
  return Array.from(times)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((time) => ({ time }))
})

function loadClassSettingsFromStorage() {
  try {
    const raw = localStorage.getItem('classSettings')
    if (raw) {
      const settings = JSON.parse(raw)
      if (settings.timeSlots?.length) {
        configuredSlots.value = settings.timeSlots.map((slot: { startTime: string }) => ({ time: slot.startTime }))
        return
      }
    }
  } catch {
    /* ignore */
  }
  configuredSlots.value = [...defaultTimeSlots]
}

function formatScheduleTime(time: string | undefined | null): string {
  if (time == null || time === '') return ''
  const part = String(time).trim().split(/\s+/)[0]
  const bits = part.split(':')
  if (bits.length < 2) return ''
  const h = bits[0].padStart(2, '0')
  const m = bits[1].padStart(2, '0')
  return `${h}:${m}`
}

function normalizeDay(d: string | undefined | null): string {
  return (d || '').toLowerCase().trim()
}

function scheduleSubject(s: any): string {
  return s?.course?.name || s?.subject || t('parent.noData')
}

function scheduleGroup(s: any): string {
  return s?.group?.name || t('teacher.noGroup')
}

function scheduleRoomMeta(s: any): string | undefined {
  const name = String(s?.room?.name || '').trim()
  return name || undefined
}

function formatTimeRange(s: { start_time?: string; end_time?: string }): string {
  const start = formatScheduleTime(s.start_time)
  const end = formatScheduleTime(s.end_time)
  if (start && end && end !== start) return `${start} – ${end}`
  return start
}

function itemsForDay(index: number): ScheduleMobileItem[] {
  const dayKey = normalizeDay(weekDays[index]?.key)
  return teacherSchedules.value
    .filter((schedule: { day_of_week?: string }) => normalizeDay(schedule.day_of_week) === dayKey)
    .sort((a: { start_time?: string }, b: { start_time?: string }) =>
      formatScheduleTime(a.start_time).localeCompare(formatScheduleTime(b.start_time), undefined, { numeric: true }),
    )
    .map((schedule: { id?: string; start_time?: string; end_time?: string; course_id?: string }) => ({
      id: String(schedule.id ?? `${formatScheduleTime(schedule.start_time)}-${schedule.course_id || ''}`),
      title: scheduleSubject(schedule),
      subtitle: scheduleGroup(schedule),
      time: formatTimeRange(schedule),
      startTime: formatScheduleTime(schedule.start_time),
      endTime: formatScheduleTime(schedule.end_time),
      meta: scheduleRoomMeta(schedule),
    }))
}

const mobileDayItems = computed(() => itemsForDay(mobileDayIndex.value))

const dayPeriodCount = computed(() =>
  mobileScope.value === 'week' ? teacherSchedules.value.length : mobileDayItems.value.length,
)

const dayGroupCount = computed(() => {
  const names = new Set(
    mobileScope.value === 'week'
      ? teacherSchedules.value.map((s) => scheduleGroup(s)).filter(Boolean)
      : mobileDayItems.value.map((s) => s.subtitle).filter(Boolean),
  )
  return names.size
})

const selectedDayHeading = computed(() => {
  const date = weekDates[mobileDayIndex.value]
  const day = t(`scheduleManagement.days.${weekDays[mobileDayIndex.value]?.key}`)
  if (!date) return day
  const month = date.toLocaleDateString(locale.value === 'ar' ? 'ar' : 'en', { month: 'long' })
  return `${day} ${date.getDate()} ${month}`
})

const loadScheduleData = async () => {
  try {
    loading.value = true
    error.value = ''
    const user = authService.getStoredUser()
    const teacherId = user?.id
    if (!teacherId) {
      error.value = t('teacher.notSignedIn')
      schedules.value = []
      return
    }
    const rows = await scheduleService.getByTeacher(String(teacherId))
    schedules.value = Array.isArray(rows) ? rows : []
  } catch (err: any) {
    console.error('Teacher schedule load error:', err)
    error.value = err?.message || t('parent.error')
    schedules.value = []
  } finally {
    loading.value = false
  }
}

function defaultMobileDayIndex(): number {
  return schoolWeekdayIndex()
}

const getClassForTimeAndDay = (slotTime: string, dayKey: string) => {
  const targetDay = normalizeDay(dayKey)
  const targetTime = formatScheduleTime(slotTime)
  return teacherSchedules.value.find((schedule: { start_time?: string; day_of_week?: string }) => {
    const scheduleTime = formatScheduleTime(schedule.start_time)
    const scheduleDay = normalizeDay(schedule.day_of_week)
    return scheduleTime === targetTime && scheduleDay === targetDay
  })
}

onMounted(() => {
  loadClassSettingsFromStorage()
  mobileDayIndex.value = defaultMobileDayIndex()
  loadScheduleData()
})
</script>

