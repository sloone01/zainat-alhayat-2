<template>
  <div class="flex flex-col gap-4">
    <div class="flex w-full max-w-xs flex-col gap-2">
      <p class="text-sm font-medium leading-none text-[#0A2147]">{{ $t('scheduleUi.zoom') }}</p>
      <input
        v-model.number="zoom"
        type="range"
        min="50"
        max="100"
        step="1"
        class="fk-tl-zoom"
        :style="{ '--fill': `${((zoom - 50) / 50) * 100}%` }"
        :aria-label="$t('scheduleUi.zoom')"
        :disabled="busy"
      >
    </div>

    <div v-if="legend.length" class="flex flex-wrap gap-4 text-sm text-[#0A2147]">
      <div v-for="item in legend" :key="item.key" class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
        {{ item.label }}
      </div>
    </div>

    <div class="relative w-full">
      <div
        ref="scrollRef"
        class="relative overflow-auto rounded-lg border border-gray-200 bg-white"
        @mousemove="onGridMouseMove"
        @mouseleave="hover = null"
      >
        <div
          class="relative"
          :style="{
            minWidth: `${timelineWidth + columnWidth}px`,
            '--tl-col': `${columnWidth}px`,
          }"
        >
          <div class="sticky top-0 z-10 border-b border-gray-200 bg-white">
            <div class="flex h-12">
              <div class="sticky start-0 z-20 flex w-[var(--tl-col)] items-center border-e border-gray-200 bg-white px-4 text-sm font-semibold text-[#0A2147]">
                {{ $t('scheduleUi.day') }}
              </div>
              <div class="relative h-12 flex-1">
                <div
                  v-for="marker in hourMarkers"
                  :key="marker.hour"
                  class="absolute top-0 flex h-full items-center ps-2 text-xs text-gray-500"
                  :style="{ insetInlineStart: `${marker.position}px` }"
                >
                  {{ marker.label }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-for="day in days"
            :key="day.key"
            :ref="(el) => setRowEl(day.key, el)"
            class="flex h-14 border-b border-gray-200"
            :class="rowClass(day.key)"
          >
            <div class="sticky start-0 z-[5] flex w-[var(--tl-col)] items-center gap-1 border-e border-gray-200 bg-inherit px-3">
              <div class="min-w-0 flex-1 py-1">
                <p class="truncate text-sm font-medium text-[#0A2147]">{{ day.label }}</p>
                <p v-if="day.isToday" class="truncate text-xs text-gray-500">{{ $t('scheduleUi.today') }}</p>
              </div>
              <button
                type="button"
                class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#0A2147] hover:bg-[#0A2147]/10"
                :aria-label="$t('scheduleManagement.addSession')"
                :disabled="busy"
                @click="emit('add', day.key)"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            <div class="relative h-14 flex-1" :style="{ width: `${timelineWidth}px` }">
              <div
                v-for="(line, idx) in quarterLines"
                :key="`q-${day.key}-${idx}`"
                class="absolute top-0 h-full w-px bg-gray-200/40"
                :style="{ insetInlineStart: `${line}px` }"
              />
              <div
                v-for="marker in hourMarkers"
                :key="`h-${day.key}-${marker.hour}`"
                class="absolute top-0 h-full w-px bg-gray-200"
                :style="{ insetInlineStart: `${marker.position}px` }"
              />
              <div
                v-if="endLine >= 0"
                class="absolute top-0 h-full w-px bg-gray-200"
                :style="{ insetInlineStart: `${endLine}px` }"
              />

              <div
                v-for="slot in slotsFor(day.key)"
                :key="slot.id"
                role="button"
                tabindex="0"
                class="absolute top-0 bottom-0 cursor-grab touch-none select-none"
                :style="slotBox(slot)"
                @pointerdown="onSlotPointerDown($event, slot)"
                @pointermove="onSlotPointerMove"
                @pointerup="onSlotPointerUp"
                @pointercancel="clearDrag"
                @keydown.enter.prevent="emit('select', slot.id)"
                @keydown.space.prevent="emit('select', slot.id)"
              >
                <div
                  class="absolute inset-1 overflow-hidden rounded border-s-4 bg-white px-2 py-1 text-start shadow-md"
                  :class="slotCardClass(slot.id)"
                  :style="{ borderInlineStartColor: slot.color }"
                >
                  <p class="truncate text-xs font-medium leading-4" :style="{ color: slot.color }">{{ slot.title }}</p>
                  <p class="flex items-center gap-2 truncate text-xs leading-4 text-gray-500">
                    <span class="inline-flex items-center gap-0.5">
                      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path stroke-linecap="round" d="M12 7v5l3 2" />
                      </svg>
                      {{ slot.startTime }}
                    </span>
                    <span class="inline-flex min-w-0 items-center gap-0.5">
                      <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="3" />
                      </svg>
                      <span class="truncate">{{ slot.teacher }}</span>
                    </span>
                  </p>
                </div>
              </div>

              <div
                v-if="drag && drag.valid && drag.day === day.key"
                class="pointer-events-none absolute z-[30] rounded-md bg-[#0A2147]/20"
                :style="ghostStyle()"
              />
            </div>
          </div>

          <div
            v-if="nowMarker"
            class="pointer-events-none absolute top-0 bottom-0 z-[15] w-0.5 bg-[#0A2147]"
            :style="{ insetInlineStart: `${columnWidth + nowMarker.position}px` }"
          >
            <div class="absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#0A2147] px-2 py-1 text-xs font-medium text-white shadow-md">
              {{ $t('scheduleUi.now') }}: {{ nowMarker.label }}
            </div>
          </div>

          <div
            v-if="drag?.moved"
            class="pointer-events-none absolute top-0 bottom-0 z-[12]"
            :style="dropRegionStyle()"
          >
            <div
              class="absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-3 py-1.5 text-sm font-semibold text-white shadow-md"
              :class="drag.valid ? 'bg-[#0A2147]' : 'bg-red-600'"
            >
              {{ dragLabel }}
            </div>
            <div class="absolute inset-y-0 start-0 w-0.5" :class="drag.valid ? 'bg-[#0A2147]' : 'bg-red-600'" />
            <div class="absolute inset-y-0 end-0 w-0.5" :class="drag.valid ? 'bg-[#0A2147]' : 'bg-red-600'" />
            <div class="absolute inset-0" :class="drag.valid ? 'bg-[#0A2147]/[0.07]' : 'bg-red-500/10'" />
          </div>

          <div
            v-else-if="hover"
            class="pointer-events-none absolute top-0 bottom-0 z-20"
            :style="{ left: `${hover.x}px` }"
          >
            <div class="absolute inset-y-0 start-0 w-px bg-[#0A2147]/70" />
            <div class="absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#0A2147] px-2 py-1 text-xs font-semibold text-white shadow-md">
              {{ hover.time }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="dragPreview"
        class="pointer-events-none fixed z-[80]"
        :dir="rtl ? 'rtl' : 'ltr'"
        :style="{
          left: `${dragPreview.left}px`,
          top: `${dragPreview.top}px`,
          width: `${dragPreview.width}px`,
          height: '56px',
        }"
      >
        <div
          class="absolute inset-1 overflow-hidden rounded border-s-4 bg-white px-2 py-1 shadow-lg"
          :class="dragPreview.valid ? '' : 'ring-2 ring-red-500'"
          :style="{ borderInlineStartColor: dragPreview.color }"
        >
          <p class="truncate text-xs font-medium leading-4" :style="{ color: dragPreview.color }">{{ dragPreview.title }}</p>
          <p class="flex items-center gap-2 truncate text-xs leading-4 text-gray-500">
            <span class="inline-flex items-center gap-0.5">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path stroke-linecap="round" d="M12 7v5l3 2" />
              </svg>
              {{ dragPreview.startTime }}
            </span>
            <span class="inline-flex min-w-0 items-center gap-0.5">
              <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="3" />
              </svg>
              <span class="truncate">{{ dragPreview.teacher }}</span>
            </span>
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { hmToMinutes, minutesToHm } from '@/utils/schedule-display'

export interface FlexibleTimelineSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  title: string
  teacher: string
  color: string
}

export interface FlexibleTimelineDay {
  key: string
  label: string
  isToday?: boolean
}

const props = withDefaults(
  defineProps<{
    slots: FlexibleTimelineSlot[]
    days: FlexibleTimelineDay[]
    startHour: number
    endHour: number
    rtl?: boolean
    busy?: boolean
    snapMinutes?: number
    columnWidth?: number
  }>(),
  {
    rtl: false,
    busy: false,
    snapMinutes: 15,
    columnWidth: 160,
  },
)

const emit = defineEmits<{
  select: [id: string]
  add: [day: string]
  move: [payload: { id: string; day: string; startTime: string; endTime: string }]
  reject: []
}>()

const columnWidth = computed(() => props.columnWidth)
const zoom = ref(100)
const scrollRef = ref<HTMLElement | null>(null)
const viewportWidth = ref(0)
const rowEls = new Map<string, HTMLElement>()
const now = ref(new Date())
const hover = ref<{ x: number; time: string } | null>(null)

type DragState = {
  id: string
  originX: number
  originY: number
  pointerX: number
  pointerY: number
  grabX: number
  grabY: number
  startMinutes: number
  duration: number
  moved: boolean
  day: string
  newStart: number
  valid: boolean
}

const drag = ref<DragState | null>(null)
let resizeObserver: ResizeObserver | null = null
let nowTimer = 0

const totalMinutes = computed(() => Math.max(60, (props.endHour - props.startHour) * 60))
const pixelsPerMinute = computed(() => {
  const base = viewportWidth.value > 0 ? viewportWidth.value / totalMinutes.value : 1.2
  return base * (100 / zoom.value)
})
const timelineWidth = computed(() => totalMinutes.value * pixelsPerMinute.value)

const hourMarkers = computed(() => {
  const markers: { hour: number; label: string; position: number }[] = []
  for (let hour = props.startHour; hour < props.endHour; hour += 1) {
    markers.push({
      hour,
      label: minutesToHm(hour * 60),
      position: (hour - props.startHour) * 60 * pixelsPerMinute.value,
    })
  }
  return markers
})

const quarterLines = computed(() => {
  const lines: number[] = []
  for (let minutes = 15; minutes < totalMinutes.value; minutes += 15) {
    if (minutes % 60 !== 0) lines.push(minutes * pixelsPerMinute.value)
  }
  return lines
})

const endLine = computed(() => totalMinutes.value * pixelsPerMinute.value)

const legend = computed(() => {
  const seen = new Map<string, { key: string; label: string; color: string }>()
  for (const slot of props.slots) {
    const key = `${slot.title}|${slot.color}`
    if (!seen.has(key)) seen.set(key, { key, label: slot.title, color: slot.color })
  }
  return [...seen.values()]
})

const nowMarker = computed(() => {
  const minutes = now.value.getHours() * 60 + now.value.getMinutes()
  const start = props.startHour * 60
  const end = props.endHour * 60
  if (minutes < start || minutes > end) return null
  return {
    position: (minutes - start) * pixelsPerMinute.value,
    label: minutesToHm(minutes),
  }
})

const dragLabel = computed(() => {
  if (!drag.value) return ''
  return `${minutesToHm(drag.value.newStart)} – ${minutesToHm(drag.value.newStart + drag.value.duration)}`
})

const dragPreview = computed(() => {
  const current = drag.value
  if (!current?.moved) return null
  const slot = props.slots.find((item) => item.id === current.id)
  if (!slot) return null
  return {
    title: slot.title,
    teacher: slot.teacher,
    color: slot.color,
    startTime: minutesToHm(current.newStart),
    valid: current.valid,
    width: Math.max(current.duration * pixelsPerMinute.value, 60),
    left: current.pointerX - current.grabX,
    top: current.pointerY - current.grabY,
  }
})

function measure() {
  if (!scrollRef.value) return
  viewportWidth.value = Math.max(0, scrollRef.value.clientWidth - columnWidth.value)
}

function setRowEl(key: string, el: unknown) {
  if (el instanceof HTMLElement) rowEls.set(key, el)
  else rowEls.delete(key)
}

function slotsFor(day: string) {
  return props.slots.filter((slot) => slot.day === day)
}

function durationOf(slot: FlexibleTimelineSlot) {
  const start = hmToMinutes(slot.startTime)
  const end = hmToMinutes(slot.endTime)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return props.snapMinutes
  return Math.max(props.snapMinutes, end - start)
}

function slotBox(slot: FlexibleTimelineSlot) {
  const start = hmToMinutes(slot.startTime)
  const left = (start - props.startHour * 60) * pixelsPerMinute.value
  const width = Math.max(durationOf(slot) * pixelsPerMinute.value, 60)
  return {
    insetInlineStart: `${Number.isFinite(left) ? left : 0}px`,
    width: `${width}px`,
  }
}

function slotCardClass(id: string) {
  const active = drag.value?.id === id
  if (active && drag.value?.moved) return 'opacity-40 shadow-sm ring-2 ring-[#0A2147]/50'
  return 'hover:ring-2 hover:ring-[#0A2147]/30'
}

function overlaps(day: string, start: number, end: number, excludeId: string) {
  return props.slots.some((slot) => {
    if (slot.id === excludeId || slot.day !== day) return false
    const otherStart = hmToMinutes(slot.startTime)
    const otherEnd = hmToMinutes(slot.endTime)
    if (!Number.isFinite(otherStart) || !Number.isFinite(otherEnd)) return false
    return start < otherEnd && otherStart < end
  })
}

function snap(minutes: number) {
  const step = props.snapMinutes
  return Math.round(minutes / step) * step
}

function rowAt(clientY: number) {
  for (const [key, el] of rowEls) {
    const rect = el.getBoundingClientRect()
    if (clientY >= rect.top && clientY <= rect.bottom) return key
  }
  return null
}

function rowClass(day: string) {
  const active = drag.value?.moved && drag.value.day === day
  const today = day === props.days.find((item) => item.isToday)?.key
  return [
    today ? 'bg-[#eef2f8]' : 'bg-white',
    active && drag.value?.valid ? 'ring-2 ring-inset ring-blue-500' : '',
    active && drag.value && !drag.value.valid ? 'ring-2 ring-inset ring-red-500' : '',
  ]
}

function ghostStyle() {
  if (!drag.value) return {}
  const left = (drag.value.newStart - props.startHour * 60) * pixelsPerMinute.value
  const width = Math.max(drag.value.duration * pixelsPerMinute.value, 60)
  return {
    insetInlineStart: `${left}px`,
    width: `${width}px`,
    top: '2px',
    bottom: '2px',
  }
}

function dropRegionStyle() {
  if (!drag.value) return {}
  const left = (drag.value.newStart - props.startHour * 60) * pixelsPerMinute.value
  const width = Math.max(drag.value.duration * pixelsPerMinute.value, 60)
  return {
    insetInlineStart: `${columnWidth.value + left}px`,
    width: `${width}px`,
  }
}

function onGridMouseMove(event: MouseEvent) {
  if (drag.value || !scrollRef.value) {
    hover.value = null
    return
  }
  const grid = scrollRef.value.firstElementChild as HTMLElement | null
  if (!grid) return
  const rect = grid.getBoundingClientRect()
  const x = event.clientX - rect.left
  const trackX = props.rtl ? grid.clientWidth - x - columnWidth.value : x - columnWidth.value
  if (trackX < 0 || trackX > timelineWidth.value) {
    hover.value = null
    return
  }
  const minutes = Math.floor(props.startHour * 60 + trackX / pixelsPerMinute.value)
  hover.value = { x, time: minutesToHm(minutes) }
}

function onSlotPointerDown(event: PointerEvent, slot: FlexibleTimelineSlot) {
  if (props.busy || event.button !== 0) return
  const start = hmToMinutes(slot.startTime)
  if (!Number.isFinite(start)) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const duration = durationOf(slot)
  drag.value = {
    id: slot.id,
    originX: event.clientX,
    originY: event.clientY,
    pointerX: event.clientX,
    pointerY: event.clientY,
    grabX: event.clientX - rect.left,
    grabY: event.clientY - rect.top,
    startMinutes: start,
    duration,
    moved: false,
    day: slot.day,
    newStart: start,
    valid: true,
  }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onSlotPointerMove(event: PointerEvent) {
  if (!drag.value || props.busy) return
  drag.value.pointerX = event.clientX
  drag.value.pointerY = event.clientY
  const dx = event.clientX - drag.value.originX
  const dy = event.clientY - drag.value.originY
  if (!drag.value.moved && Math.hypot(dx, dy) < 8) return
  drag.value.moved = true
  const sign = props.rtl ? -1 : 1
  const deltaMinutes = (dx * sign) / pixelsPerMinute.value
  let next = snap(drag.value.startMinutes + deltaMinutes)
  const minStart = props.startHour * 60
  const maxStart = Math.max(minStart, props.endHour * 60 - drag.value.duration)
  next = Math.max(minStart, Math.min(maxStart, next))
  const day = rowAt(event.clientY) || drag.value.day
  drag.value.day = day
  drag.value.newStart = next
  drag.value.valid = !overlaps(day, next, next + drag.value.duration, drag.value.id)
  hover.value = null
}

function clearDrag() {
  drag.value = null
}

function onSlotPointerUp() {
  const current = drag.value
  drag.value = null
  if (!current) return
  if (!current.moved) {
    emit('select', current.id)
    return
  }
  if (!current.valid) {
    emit('reject')
    return
  }
  const slot = props.slots.find((item) => item.id === current.id)
  const startTime = minutesToHm(current.newStart)
  const endTime = minutesToHm(current.newStart + current.duration)
  if (slot && slot.day === current.day && slot.startTime === startTime) return
  emit('move', { id: current.id, day: current.day, startTime, endTime })
}

watch(
  () => [props.startHour, props.endHour, props.columnWidth],
  () => measure(),
)

onMounted(() => {
  measure()
  if (scrollRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(scrollRef.value)
  }
  nowTimer = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.clearInterval(nowTimer)
})
</script>

<style scoped>
.fk-tl-zoom {
  appearance: none;
  height: 8px;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(to right, #0a2147 var(--fill), #e8edf5 var(--fill));
  outline: none;
  cursor: pointer;
}
.fk-tl-zoom:disabled {
  cursor: default;
  opacity: 0.5;
}
.fk-tl-zoom::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 999px;
  border: 2px solid #0a2147;
  background: #fff;
  cursor: pointer;
}
.fk-tl-zoom::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 999px;
  border: 2px solid #0a2147;
  background: #fff;
  cursor: pointer;
}
[dir='rtl'] .fk-tl-zoom {
  background: linear-gradient(to left, #0a2147 var(--fill), #e8edf5 var(--fill));
}
</style>
