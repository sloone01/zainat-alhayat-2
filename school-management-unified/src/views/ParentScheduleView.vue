<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.schedule')"
        :subtitle="$t('parent.scheduleOverview')"
      />

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center gap-3 py-12">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadScheduleData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Schedule Content -->
      <div v-else class="space-y-6">
        <!-- Children Filter -->
        <div v-if="children.length > 1" class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('parent.myChildren') }}</h2>
            </div>
          </header>
          <div class="flex flex-wrap gap-2 p-4 sm:gap-3 sm:p-6">
            <button
              v-for="child in children"
              :key="child.id"
              type="button"
              @click="selectedChildId = child.id"
              :class="[
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                selectedChildId === child.id
                  ? 'border border-primary-500 bg-primary-50 text-primary-900 ring-2 ring-primary-500/30'
                  : 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
            >
              {{ child.firstName }} {{ child.lastName }}
            </button>
          </div>
        </div>

        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('parent.groupSchedule') }}</h2>
              <p v-if="selectedChild" class="fk-card__meta">
                {{ selectedChild.firstName }} {{ selectedChild.lastName }} — {{ selectedChild.groupNames }}
              </p>
            </div>
          </header>

          <div v-if="filteredSchedules.length > 0">
            <!-- Desktop: match ScheduleManagementView -->
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
                            {{ scheduleTeacher(getClassForTimeAndDay(slot.time, day.key)) }}
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

            <!-- Mobile: one day + arrows -->
            <div class="lg:hidden">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div class="grid grid-cols-3 items-center gap-2">
                  <div class="justify-self-start rtl:justify-self-end">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                      @click="previousMobileDay"
                    >
                      <svg class="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      {{ $t('common.previous') }}
                    </button>
                  </div>
                  <div class="min-w-0 text-center">
                    <h3 class="text-sm font-semibold text-gray-900">
                      {{ $t(`scheduleManagement.days.${weekDays[mobileDayIndex].key}`) }}
                    </h3>
                  </div>
                  <div class="justify-self-end rtl:justify-self-start">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                      @click="nextMobileDay"
                    >
                      {{ $t('common.next') }}
                      <svg class="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div class="space-y-3 p-4">
                <div
                  v-for="slot in timeSlots"
                  :key="slot.time"
                  class="flex items-stretch gap-3 rtl:flex-row-reverse"
                >
                  <div class="w-14 shrink-0 text-sm font-medium tabular-nums text-gray-500">
                    {{ slot.time }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div
                      v-if="getClassForTimeAndDay(slot.time, weekDays[mobileDayIndex].key)"
                      class="rounded-lg border border-primary-200 bg-primary-100 p-3"
                      :class="isRTL ? 'text-right' : 'text-left'"
                    >
                      <div class="text-sm font-medium text-primary-900">
                        {{ scheduleSubject(getClassForTimeAndDay(slot.time, weekDays[mobileDayIndex].key)) }}
                      </div>
                      <div class="mt-1 text-xs text-primary-700">
                        {{ scheduleTeacher(getClassForTimeAndDay(slot.time, weekDays[mobileDayIndex].key)) }}
                      </div>
                      <div class="mt-1 text-xs text-primary-600">
                        {{ scheduleRoom(getClassForTimeAndDay(slot.time, weekDays[mobileDayIndex].key)) }}
                      </div>
                    </div>
                    <div
                      v-else
                      class="flex h-12 items-center justify-center rounded-lg border-2 border-dashed border-gray-200"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 002.25 2.25v7.5m-18 0h18" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('parent.noSchedule') }}</h3>
            <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ $t('parent.noData') }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { parentService } from '../services/parent.service'

const { t, locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedChildId = ref<string | null>(null)
const mobileDayIndex = ref(0)

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

function scheduleRoom(s: any): string {
  return s?.room?.name || t('parent.noData')
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

<style scoped>
.class-card {
  min-height: 60px;
}
</style>
