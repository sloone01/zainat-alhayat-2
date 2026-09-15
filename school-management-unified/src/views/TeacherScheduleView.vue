<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('teacher.mySchedule')"
        :subtitle="$t('teacher.scheduleSubtitle')"
      />

      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadScheduleData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <div v-else class="space-y-6">
        <section class="fk-card overflow-visible">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('teacher.weeklyTimetable') }}</h2>
              <p class="fk-card__meta">{{ $t('teacher.groupInCellsHint') }}</p>
            </div>
          </header>

          <div v-if="teacherSchedules.length > 0">
            <div class="hidden overflow-x-auto lg:block">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="w-20 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {{ $t('common.time') }}
                    </th>
                    <th
                      v-for="day in weekDays"
                      :key="day.key"
                      class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {{ $t(`scheduleManagement.days.${day.key}`) }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="slot in timeSlots" :key="slot.time" class="hover:bg-gray-50">
                    <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {{ slot.time }}
                    </td>
                    <td
                      v-for="day in weekDays"
                      :key="`${slot.time}-${day.key}`"
                      class="relative px-2 py-4 text-center"
                    >
                      <div v-if="getClassForTimeAndDay(slot.time, day.key)" class="class-card">
                        <div
                          class="rounded-lg border border-primary-200 bg-primary-100 p-3 text-start transition-colors duration-200"
                        >
                          <div class="text-sm font-medium text-primary-900">
                            {{ scheduleSubject(getClassForTimeAndDay(slot.time, day.key)) }}
                          </div>
                          <div class="mt-1 text-xs text-primary-700">
                            {{ scheduleGroup(getClassForTimeAndDay(slot.time, day.key)) }}
                          </div>
                          <div class="mt-1 text-xs text-primary-600">
                            {{ scheduleRoom(getClassForTimeAndDay(slot.time, day.key)) }}
                          </div>
                        </div>
                      </div>
                      <div
                        v-else
                        class="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-200"
                      >
                        <span class="sr-only">{{ $t('parent.noData') }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ScheduleMobileFeed
              :items="mobileDayItems"
              :day-label="$t(`scheduleManagement.days.${weekDays[mobileDayIndex].key}`)"
              :empty-label="$t('teacher.noSchedule')"
              :reset-key="`${mobileDayIndex}`"
              @previous="previousMobileDay"
              @next="nextMobileDay"
            />
          </div>

          <div v-else class="px-6 py-16 text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('teacher.noSchedule') }}</h3>
            <p class="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">{{ $t('parent.noData') }}</p>
          </div>
        </section>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ScheduleMobileFeed, { type ScheduleMobileItem } from '@/components/ScheduleMobileFeed.vue'
import { scheduleService } from '@/services/schedule.service'
import { authService } from '@/services'

const { t, locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const schedules = ref<any[]>([])
const mobileDayIndex = ref(0)

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

function scheduleRoom(s: any): string {
  return s?.room?.name || t('parent.noData')
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
  return teacherSchedules.value
    .filter((schedule: { day_of_week?: string }) => normalizeDay(schedule.day_of_week) === dayKey)
    .sort((a: { start_time?: string }, b: { start_time?: string }) =>
      formatScheduleTime(a.start_time).localeCompare(formatScheduleTime(b.start_time), undefined, { numeric: true }),
    )
    .map((schedule: { id?: string; start_time?: string; course_id?: string }) => ({
      id: String(schedule.id ?? `${formatScheduleTime(schedule.start_time)}-${schedule.course_id || ''}`),
      title: scheduleSubject(schedule),
      subtitle: scheduleGroup(schedule),
      time: formatTimeRange(schedule),
      meta: scheduleRoomMeta(schedule),
    }))
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
  const d = new Date().getDay()
  if (d >= 0 && d <= 4) return d
  return 0
}

const previousMobileDay = () => {
  mobileDayIndex.value = mobileDayIndex.value === 0 ? weekDays.length - 1 : mobileDayIndex.value - 1
}

const nextMobileDay = () => {
  mobileDayIndex.value = mobileDayIndex.value === weekDays.length - 1 ? 0 : mobileDayIndex.value + 1
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

<style scoped>
.class-card {
  min-height: 60px;
}
</style>
