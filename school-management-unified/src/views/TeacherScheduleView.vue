<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
        <h1 class="mb-2 text-2xl font-bold">{{ $t('teacher.mySchedule') }}</h1>
        <p class="text-indigo-100">{{ $t('teacher.scheduleSubtitle') }}</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        <span class="ms-3 text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h3 class="mb-2 text-lg font-semibold text-red-800">{{ $t('parent.error') }}</h3>
        <p class="text-red-600">{{ error }}</p>
        <button type="button" class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700" @click="loadScheduleData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <div v-else class="space-y-6">
        <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div class="border-b border-gray-200 px-6 py-4">
            <h2 class="text-lg font-medium text-gray-900">{{ $t('teacher.weeklyTimetable') }}</h2>
            <p class="mt-1 text-sm text-gray-600">{{ $t('teacher.groupInCellsHint') }}</p>
          </div>

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
                        {{ scheduleGroup(getClassForTimeAndDay(slot.time, weekDays[mobileDayIndex].key)) }}
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

          <div v-else class="p-12 text-center">
            <svg class="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="mb-2 text-lg font-medium text-gray-900">{{ $t('teacher.noSchedule') }}</h3>
            <p class="text-gray-500">{{ $t('parent.noData') }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
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
