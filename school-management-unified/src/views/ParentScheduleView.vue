<template>
  <DashboardLayout>
    <div class="fk-page fk-tt-canvas" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.schedule')"
        :subtitle="weekRangeLabel"
      />
      <div v-if="loading" class="flex items-center justify-center gap-3 py-12">
        <FikrLoader />
        <span class="text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadScheduleData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <section v-else class="fk-tt-board">
        <div v-if="children.length" class="flex flex-wrap gap-2 lg:hidden">
          <button
            v-for="child in children"
            :key="child.id"
            type="button"
            class="fk-tt-child"
            :class="selectedChildId === child.id ? 'fk-tt-child--on' : ''"
            @click="selectedChildId = child.id"
          >
            <span class="fk-tt-child__av">{{ childInitial(child) }}</span>
            {{ child.firstName }}<template v-if="childGroupLabel(child)"> · {{ childGroupLabel(child) }}</template>
          </button>
        </div>

        <div v-if="children.length" class="hidden flex-wrap gap-2 lg:flex">
          <button
            v-for="child in children"
            :key="`desk-${child.id}`"
            type="button"
            class="fk-tt-child"
            :class="selectedChildId === child.id ? 'fk-tt-child--on' : ''"
            @click="selectedChildId = child.id"
          >
            <span class="fk-tt-child__av">{{ childInitial(child) }}</span>
            {{ child.firstName }}<template v-if="childGroupLabel(child)"> · {{ childGroupLabel(child) }}</template>
          </button>
        </div>

        <div v-if="filteredSchedules.length > 0">
          <div class="hidden lg:block">
            <ScheduleWeekGrid
              :days="weekDays"
              :slots="weekGridSlots"
              :today-key="weekDays[todayIndex]?.key || 'sunday'"
              :cells="weekGridCells"
            />
          </div>
          <ScheduleMobileFeed
            variant="timeline"
            :items="mobileDayItems"
            :week-days="weekDays"
            :selected-index="mobileDayIndex"
            :today-index="todayIndex"
            :empty-label="$t('parent.noSchedule')"
            :reset-key="`${selectedChildId || ''}-${mobileDayIndex}`"
            @select="mobileDayIndex = $event"
          />
        </div>

        <div v-else class="fk-tt-cell fk-tt-cell--empty min-h-40">
          <p class="text-sm font-semibold">{{ $t('parent.noSchedule') }}</p>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ScheduleMobileFeed, { type ScheduleMobileItem } from '@/components/ScheduleMobileFeed.vue'
import ScheduleWeekGrid, { type WeekGridCell, type WeekGridSlot } from '@/components/ScheduleWeekGrid.vue'
import { parentService } from '../services/parent.service'
import { formatSchoolWeekRange, periodPhase, schoolWeekdayIndex } from '@/utils/schedule-display'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedChildId = ref<string | null>(null)
const mobileDayIndex = ref(0)
const todayIndex = schoolWeekdayIndex()

function dayIndexFor(key: string) {
  return weekDays.findIndex((d) => d.key === key)
}

function childInitial(child: { firstName?: string }) {
  return String(child.firstName || '').trim().charAt(0) || '—'
}

function childGroupLabel(child: { groupNames?: string; groups?: { name?: string }[] }) {
  if (typeof child.groupNames === 'string' && child.groupNames.trim()) {
    return child.groupNames.split(/[,،]/)[0].trim()
  }
  return child.groups?.[0]?.name || ''
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
        meta: [scheduleTeacher(cls), scheduleRoomMeta(cls)].filter(Boolean).join(' · '),
        now: periodPhase(dayIndexFor(day.key), todayIndex, start, end) === 'now',
        to: courseMaterialsLink(cls),
      }
    }
  }
  return map
})

/** Same defaults as ScheduleManagementView — overridden by classSettings in localStorage */
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

const children = computed(() => dashboardData.value.children || [])
const schedules = computed(() => dashboardData.value.schedules || [])

const selectedChild = computed(() => {
  if (!selectedChildId.value) return children.value[0]
  return children.value.find((child) => child.id === selectedChildId.value) || children.value[0]
})

const filteredSchedules = computed(() => {
  if (!selectedChild.value) return []
  const childGroupIds = selectedChild.value.groups?.map((g: { id: string }) => g.id) || []
  return schedules.value.filter((schedule: { group_id: string }) =>
    childGroupIds.some((id: string) => String(id) === String(schedule.group_id)),
  )
})

/** Grid rows: saved school slots + any session start times from API (same idea as /schedules) */
const timeSlots = computed(() => {
  const times = new Set<string>()
  configuredSlots.value.forEach((s) => times.add(s.time))
  filteredSchedules.value.forEach((s: { start_time?: string }) => {
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

function scheduleTeacher(s: any): string {
  if (!s?.teacher) return t('parent.noData')
  const fn = s.teacher.firstName || ''
  const ln = s.teacher.lastName || ''
  const name = `${fn} ${ln}`.trim()
  return name || t('parent.noData')
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

const mobileDayItems = computed<ScheduleMobileItem[]>(() => {
  const dayKey = normalizeDay(weekDays[mobileDayIndex.value]?.key)
  return filteredSchedules.value
    .filter((schedule: { day_of_week?: string }) => normalizeDay(schedule.day_of_week) === dayKey)
    .sort((a: { start_time?: string }, b: { start_time?: string }) =>
      formatScheduleTime(a.start_time).localeCompare(formatScheduleTime(b.start_time), undefined, { numeric: true }),
    )
    .map((schedule: { id?: string; start_time?: string; end_time?: string; course_id?: string }) => ({
      id: String(schedule.id ?? `${formatScheduleTime(schedule.start_time)}-${schedule.course_id || ''}`),
      title: scheduleSubject(schedule),
      subtitle: scheduleTeacher(schedule),
      time: formatTimeRange(schedule),
      startTime: formatScheduleTime(schedule.start_time),
      endTime: formatScheduleTime(schedule.end_time),
      meta: scheduleRoomMeta(schedule),
      to: courseMaterialsLink(schedule),
    }))
})

function courseMaterialsLink(s: any): { path: string; query: { course: string } } | null {
  const id = s?.course_id || s?.course?.id
  if (!id) return null
  return { path: '/parent/course-materials', query: { course: String(id) } }
}

const loadScheduleData = async () => {
  try {
    loading.value = true
    error.value = ''

    const data = await parentService.getMyDashboardData()
    dashboardData.value = data

    if (data.children?.length > 0) {
      selectedChildId.value = data.children[0].id
    }
  } catch (err: any) {
    console.error('Error loading parent schedule data:', err)
    error.value = err.message || t('parent.error')
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
  return filteredSchedules.value.find((schedule: { start_time?: string; day_of_week?: string }) => {
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

