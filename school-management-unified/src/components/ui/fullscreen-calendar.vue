<template>
  <div class="fk-cal flex flex-1 flex-col">
    <div class="flex flex-col gap-4 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-4">
        <div
          v-if="!isWeekdayMode"
          class="hidden h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-2xl border-2 border-primary-100 bg-primary-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:flex"
        >
          <div class="text-[10px] font-semibold uppercase tracking-wide text-primary-700">
            {{ formatMonthShort(today) }}
          </div>
          <div class="text-2xl font-bold leading-none text-navy-800">
            {{ formatDayNumber(today) }}
          </div>
        </div>
        <div class="min-w-0">
          <h2 class="text-xl font-semibold tracking-tight text-fikr-ink">
            {{ isWeekdayMode ? (heading || $t('scheduleManagement.weeklySchedule')) : formatMonthYear(firstDayCurrentMonth) }}
          </h2>
          <p v-if="!isWeekdayMode" class="mt-1 text-sm text-fikr-ink-muted">
            {{ formatMonthDayYear(firstDayCurrentMonth) }} – {{ formatMonthDayYear(monthEnd) }}
          </p>
        </div>
      </div>

      <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <button
          type="button"
          class="hidden h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-fikr-hairline bg-white text-fikr-ink-muted shadow-sm transition-colors duration-200 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 lg:inline-flex"
          :aria-label="$t('calendar.search')"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </button>

        <div
          v-if="!isWeekdayMode"
          class="inline-flex w-full overflow-hidden rounded-2xl border-2 border-fikr-hairline bg-white shadow-sm sm:w-auto rtl:flex-row-reverse"
        >
          <button
            type="button"
            class="inline-flex h-11 w-11 cursor-pointer items-center justify-center text-fikr-ink-muted transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/40"
            :aria-label="$t('calendar.previousMonth')"
            @click="previousMonth"
          >
            <svg class="h-5 w-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex h-11 flex-1 cursor-pointer items-center justify-center border-x-2 border-fikr-hairline px-4 text-sm font-semibold text-fikr-ink transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/40 sm:flex-none"
            @click="goToToday"
          >
            {{ $t('calendar.today') }}
          </button>
          <button
            type="button"
            class="inline-flex h-11 w-11 cursor-pointer items-center justify-center text-fikr-ink-muted transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/40"
            :aria-label="$t('calendar.nextMonth')"
            @click="nextMonth"
          >
            <svg class="h-5 w-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          v-if="showNewEvent"
          type="button"
          class="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 sm:w-auto"
          @click="$emit('newEvent')"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ newEventLabel || $t('calendar.newEvent') }}</span>
        </button>
      </div>
    </div>

    <div class="px-3 pb-4 sm:px-4">
      <div
        class="grid gap-1.5 text-center text-xs font-semibold text-fikr-ink-muted sm:gap-2"
        :style="{ gridTemplateColumns: `repeat(${visibleWeekdayKeys.length}, minmax(0, 1fr))` }"
      >
        <div
          v-for="label in weekdayLabels"
          :key="label"
          class="py-2"
        >
          {{ label }}
        </div>
      </div>

      <div
        v-if="isWeekdayMode"
        class="mt-1 hidden gap-2 lg:grid"
        :style="{ gridTemplateColumns: `repeat(${visibleWeekdayKeys.length}, minmax(0, 1fr))` }"
      >
        <button
          v-for="key in visibleWeekdayKeys"
          :key="key"
          type="button"
          class="fk-cal-cell flex min-h-[22rem] cursor-pointer flex-col p-2.5 text-start"
          :class="selectedWeekday === key ? 'fk-cal-cell--on' : ''"
          @click="selectWeekday(key)"
        >
          <div class="flex flex-1 flex-col gap-2">
            <button
              v-for="event in eventsForWeekday(key)"
              :key="event.id"
              type="button"
              class="flex w-full cursor-pointer flex-col items-start gap-1 rounded-xl bg-primary-50 px-2.5 py-2 text-start text-xs leading-tight text-primary-900 transition-colors duration-200 hover:bg-primary-100"
              @click.stop="emitEvent(event, key)"
            >
              <p class="font-semibold leading-none">{{ event.name }}</p>
              <p v-if="event.time" class="leading-none text-primary-800">{{ event.time }}</p>
            </button>
          </div>
        </button>
      </div>

      <div
        v-if="isWeekdayMode"
        class="mt-1 grid gap-1.5 lg:hidden"
        :style="{ gridTemplateColumns: `repeat(${visibleWeekdayKeys.length}, minmax(0, 1fr))` }"
      >
        <button
          v-for="key in visibleWeekdayKeys"
          :key="`m-${key}`"
          type="button"
          class="fk-cal-cell flex min-h-14 cursor-pointer flex-col items-center px-1 py-2"
          :class="selectedWeekday === key ? 'fk-cal-cell--on' : ''"
          @click="selectWeekday(key)"
        >
          <span class="text-[11px] font-semibold text-fikr-ink">{{ weekdayShort(key) }}</span>
          <div v-if="eventsForWeekday(key).length" class="mt-1 flex flex-wrap justify-center gap-0.5">
            <span
              v-for="event in eventsForWeekday(key).slice(0, 3)"
              :key="event.id"
              class="h-1.5 w-1.5 rounded-full bg-primary-500"
            />
          </div>
        </button>
      </div>

      <div
        v-if="!isWeekdayMode"
        class="mt-1 hidden gap-2 lg:grid"
        :style="{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gridTemplateRows: `repeat(${weekRowCount}, minmax(6rem, 1fr))` }"
      >
        <button
          v-for="(day, dayIdx) in days"
          :key="dateKey(day)"
          type="button"
          class="fk-cal-cell flex cursor-pointer flex-col p-2 text-start"
          :class="[
            dayIdx === 0 ? colStartClasses[day.getDay()] : '',
            cellTone(day),
          ]"
          @click="selectDay(day)"
        >
          <div v-if="!hideDates" class="mb-1 flex justify-center">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
              :class="dayNumberClass(day)"
            >
              <time :datetime="dateKey(day)">{{ formatDayNumber(day) }}</time>
            </span>
          </div>
          <div v-if="eventsFor(day).length" class="mt-auto space-y-1">
            <span
              class="block truncate rounded-xl bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-900"
            >
              {{ eventsFor(day)[0].name }}
            </span>
            <div v-if="eventsFor(day).length > 1" class="px-1 text-[11px] font-medium text-fikr-ink-muted">
              {{ $t('calendar.moreCount', { count: eventsFor(day).length - 1 }) }}
            </div>
          </div>
        </button>
      </div>

      <div
        v-if="!isWeekdayMode"
        class="mt-1 grid gap-1.5 lg:hidden"
        :style="{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gridTemplateRows: `repeat(${weekRowCount}, minmax(3.5rem, 1fr))` }"
      >
        <button
          v-for="day in days"
          :key="`m-${dateKey(day)}`"
          type="button"
          class="fk-cal-cell flex min-h-14 cursor-pointer flex-col items-center px-1 py-2"
          :class="cellTone(day)"
          @click="selectDay(day)"
        >
          <time
            v-if="!hideDates"
            :datetime="dateKey(day)"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
            :class="dayNumberClass(day)"
          >
            {{ formatDayNumber(day) }}
          </time>
          <div v-if="eventsFor(day).length" class="mt-1 flex flex-wrap justify-center gap-0.5">
            <span
              v-for="event in eventsFor(day).slice(0, 3)"
              :key="event.id"
              class="h-1.5 w-1.5 rounded-full bg-primary-500"
            />
          </div>
        </button>
      </div>
    </div>

    <div v-if="selectedListEvents.length" class="border-t border-fikr-hairline px-5 py-4 lg:hidden">
      <h3 class="text-sm font-semibold text-fikr-ink">
        {{ selectedListTitle }}
      </h3>
      <ul class="mt-3 space-y-2">
        <li v-for="event in selectedListEvents" :key="event.id">
          <button
            type="button"
            class="flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-2xl border-2 border-fikr-hairline bg-white px-3 py-3 text-start transition-colors duration-200 hover:border-primary-200 hover:bg-primary-50"
            @click="emitEvent(event, isWeekdayMode ? selectedWeekday : undefined)"
          >
            <span class="text-sm font-semibold text-fikr-ink">{{ event.name }}</span>
            <span v-if="event.time" class="text-xs text-fikr-ink-muted">{{ event.time }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  addMonths,
  dateKey,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  eventsForDay,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfToday,
  startOfWeek,
  weekdayKey,
  type CalendarDayData,
  type CalendarEvent,
} from '@/utils/calendar-date'

const props = withDefaults(
  defineProps<{
    data?: CalendarDayData[]
    weekly?: Array<{ dayKey: string; event: CalendarEvent }>
    weekDayKeys?: string[]
    mode?: 'month' | 'weekdays'
    heading?: string
    month?: Date | string | null
    selected?: Date | string | null
    hideDates?: boolean
    showNewEvent?: boolean
    newEventLabel?: string
  }>(),
  {
    data: () => [],
    weekly: () => [],
    weekDayKeys: () => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    mode: 'month',
    heading: '',
    month: null,
    selected: null,
    hideDates: false,
    showNewEvent: true,
    newEventLabel: '',
  },
)

const emit = defineEmits<{
  selectDay: [Date]
  selectWeekday: [string]
  monthChange: [Date]
  newEvent: []
  eventClick: [event: CalendarEvent, dayKey?: string]
}>()

const { locale } = useI18n()

const today = startOfToday()
const currentMonth = ref(resolveMonth(props.month) ?? today)
const selectedDay = ref(resolveDate(props.selected) ?? today)
const isWeekdayMode = computed(() => props.mode === 'weekdays')
const visibleWeekdayKeys = computed(() =>
  isWeekdayMode.value
    ? props.weekDayKeys
    : ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
)
const selectedWeekday = ref(props.weekDayKeys[0] || 'sunday')

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
]

const firstDayCurrentMonth = computed(() =>
  new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1),
)
const monthEnd = computed(() => endOfMonth(firstDayCurrentMonth.value))

const days = computed(() =>
  eachDayOfInterval(
    startOfWeek(firstDayCurrentMonth.value),
    endOfWeek(monthEnd.value),
  ),
)

const weekRowCount = computed(() => Math.max(5, Math.ceil(days.value.length / 7)))

const weekdayLabels = computed(() =>
  visibleWeekdayKeys.value.map((key) => weekdayLong(key)),
)

const eventsByWeekday = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  for (const key of visibleWeekdayKeys.value) map.set(key, [])
  for (const item of props.weekly || []) {
    const key = String(item.dayKey || '').toLowerCase()
    const list = map.get(key)
    if (!list) continue
    list.push(item.event)
  }
  for (const list of map.values()) {
    list.sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''), undefined, { numeric: true }))
  }
  return map
})

const selectedDayEvents = computed(() => eventsForDay(props.data || [], selectedDay.value))
const selectedListEvents = computed(() =>
  isWeekdayMode.value ? eventsForWeekday(selectedWeekday.value) : selectedDayEvents.value,
)
const selectedListTitle = computed(() => {
  if (isWeekdayMode.value) return weekdayLong(selectedWeekday.value)
  if (props.hideDates) return weekdayLong(weekdayKey(selectedDay.value))
  return formatMonthDayYear(selectedDay.value)
})

watch(
  () => props.month,
  (value) => {
    const next = resolveMonth(value)
    if (next && !isSameMonth(next, currentMonth.value)) currentMonth.value = next
  },
)

watch(
  () => props.selected,
  (value) => {
    const next = resolveDate(value)
    if (next && !isSameDay(next, selectedDay.value)) selectedDay.value = next
  },
)

function resolveDate(value: Date | string | null | undefined): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return startOfDay(value)
  if (typeof value === 'string' && value) {
    const part = value.split('T')[0]
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(part)
    if (!match) return null
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  return null
}

function resolveMonth(value: Date | string | null | undefined): Date | null {
  const day = resolveDate(value)
  if (!day) return null
  return new Date(day.getFullYear(), day.getMonth(), 1)
}

function dateLocale() {
  return locale.value === 'ar' ? 'ar' : 'en'
}

function formatMonthShort(date: Date) {
  return new Intl.DateTimeFormat(dateLocale(), { month: 'short' }).format(date)
}

function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat(dateLocale(), { day: 'numeric' }).format(date)
}

function formatMonthYear(date: Date) {
  const month = new Intl.DateTimeFormat(dateLocale(), { month: 'long' }).format(date)
  const year = new Intl.DateTimeFormat(dateLocale(), { year: 'numeric' }).format(date)
  return locale.value === 'ar' ? `${month} ${year}` : `${month}, ${year}`
}

function formatMonthDayYear(date: Date) {
  return new Intl.DateTimeFormat(dateLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function eventsFor(day: Date) {
  return eventsForDay(props.data || [], day)
}

function eventsForWeekday(key: string) {
  return eventsByWeekday.value.get(key) || []
}

function weekdayLong(key: string) {
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  const index = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(key)
  return new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(new Date(2026, 8, 13 + (index >= 0 ? index : 0)))
}

function weekdayShort(key: string) {
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  const index = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(key)
  return new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(new Date(2026, 8, 13 + (index >= 0 ? index : 0)))
}

function selectWeekday(key: string) {
  selectedWeekday.value = key
  emit('selectWeekday', key)
}

function isToday(day: Date) {
  return isSameDay(day, today)
}

function dayNumberClass(day: Date) {
  if (isToday(day)) return 'bg-primary-600 text-white'
  if (!isSameMonth(day, firstDayCurrentMonth.value)) return 'text-fikr-ink-soft'
  return 'text-fikr-ink'
}

function cellTone(day: Date) {
  if (!props.hideDates && isToday(day)) return 'fk-cal-cell--today'
  if (isSameDay(day, selectedDay.value)) return 'fk-cal-cell--on'
  if (!isSameMonth(day, firstDayCurrentMonth.value)) return 'fk-cal-cell--mute'
  return ''
}

function selectDay(day: Date) {
  selectedDay.value = startOfDay(day)
  emit('selectDay', selectedDay.value)
  const first = eventsFor(day)[0]
  if (first) emit('eventClick', first)
}

function setMonth(next: Date) {
  currentMonth.value = new Date(next.getFullYear(), next.getMonth(), 1)
  emit('monthChange', currentMonth.value)
}

function previousMonth() {
  setMonth(addMonths(firstDayCurrentMonth.value, -1))
}

function nextMonth() {
  setMonth(addMonths(firstDayCurrentMonth.value, 1))
}

function goToToday() {
  selectedDay.value = today
  setMonth(today)
  emit('selectDay', today)
}

function emitEvent(event: CalendarEvent, dayKey?: string) {
  emit('eventClick', event, dayKey)
}
</script>

<style scoped>
.fk-cal {
  background:
    linear-gradient(180deg, rgba(230, 247, 246, 0.55), rgba(255, 255, 255, 0.9) 28%, #ffffff);
}
.fk-cal-cell {
  border-radius: 1.25rem;
  border: 3px solid #e2e6ea;
  background: #ffffff;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.95),
    0 8px 18px rgba(10, 33, 71, 0.06);
  transition: border-color 200ms ease-out, background-color 200ms ease-out, box-shadow 200ms ease-out, transform 200ms ease-out;
}
.fk-cal-cell:hover {
  border-color: #7fd8d2;
  background: #e6f7f6;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.95),
    0 10px 20px rgba(0, 161, 155, 0.1);
}
.fk-cal-cell:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 2px 4px rgba(10, 33, 71, 0.08),
    0 4px 10px rgba(10, 33, 71, 0.05);
}
.fk-cal-cell--on {
  border-color: #4cc9c1;
  background: #e6f7f6;
}
.fk-cal-cell--today {
  border-color: #00A19B;
  background: #e6f7f6;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.95),
    0 0 0 4px rgba(0, 161, 155, 0.16);
}
.fk-cal-cell--mute {
  background: #f5f5f7;
  color: #727784;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
@media (prefers-reduced-motion: reduce) {
  .fk-cal-cell,
  .fk-cal-cell:active {
    transition: none;
    transform: none;
  }
}
</style>
