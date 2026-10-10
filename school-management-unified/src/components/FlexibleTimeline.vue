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
        class="relative max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-white"
        @mousemove="onGridMouseMove"
        @mouseleave="hover = null; slotTip = null"
      >
        <div
          class="relative grid w-full min-w-0"
          :style="{ gridTemplateColumns: gridColumns }"
        >
          <div class="sticky start-0 top-0 z-30 flex h-16 items-center border-b border-e border-gray-200 bg-white px-3 text-sm font-semibold text-[#0A2147]">
            {{ $t('common.time') }}
          </div>
          <div
            v-for="day in days"
            :key="`head-${day.key}`"
            class="sticky top-0 z-20 flex h-16 items-center justify-between gap-1 border-b border-e border-gray-200 px-2"
            :class="day.isToday ? 'bg-[#eef2f8]' : 'bg-white'"
          >
            <div class="min-w-0 flex-1">
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

          <div class="sticky start-0 z-10 border-e border-gray-200 bg-white">
            <div class="relative" :style="{ height: `${timelineHeight}px` }">
            <div
              v-for="marker in hourMarkers"
              :key="`gutter-${marker.position}`"
              class="absolute end-2 text-xs text-gray-500"
              :class="marker.edge === 'end' ? '-translate-y-full' : marker.position === 0 ? '' : '-translate-y-1/2'"
              :style="{ top: `${marker.position}px` }"
            >
              {{ marker.label }}
            </div>
            </div>
          </div>

          <div
            v-for="day in days"
            :key="day.key"
            :ref="(el) => setColEl(day.key, el)"
            class="relative border-e border-gray-200"
            :class="columnClass(day.key)"
            :style="{ height: `${timelineHeight}px` }"
          >
            <div
              v-for="(line, idx) in quarterLines"
              :key="`q-${day.key}-${idx}`"
              class="absolute inset-x-0 h-px bg-gray-100"
              :style="{ top: `${line}px` }"
            />
            <div
              v-for="marker in hourMarkers"
              :key="`h-${day.key}-${marker.position}`"
              class="absolute inset-x-0 h-px bg-gray-200"
              :style="{ top: `${marker.position}px` }"
            />

            <div
              v-for="slot in slotsFor(day.key)"
              :key="slot.id"
              role="button"
              tabindex="0"
              data-tl-slot
              class="absolute cursor-grab touch-none select-none"
              :style="slotBox(slot)"
              @pointerdown="onSlotPointerDown($event, slot)"
              @pointermove="onSlotPointerMove"
              @pointerup="onSlotPointerUp"
              @pointercancel="clearDrag"
              @mouseenter="onSlotHover($event, slot)"
              @mousemove="onSlotHover($event, slot)"
              @mouseleave="slotTip = null"
              @keydown.enter.prevent="emit('select', slot.id)"
              @keydown.space.prevent="emit('select', slot.id)"
            >
              <div
                class="absolute inset-0.5 overflow-hidden rounded border-s-4 bg-white px-2 py-1 text-start shadow-md"
                :class="slotCardClass(slot.id)"
                :style="{ borderInlineStartColor: slot.color }"
              >
                <p class="truncate text-xs font-medium leading-4" :style="{ color: slot.color }">{{ slot.title }}</p>
                <p class="truncate text-[11px] leading-4 text-gray-500">{{ slot.startTime }}</p>
                <p class="truncate text-[11px] leading-4 text-gray-500">{{ slot.teacher }}</p>
              </div>
            </div>

            <div
              v-if="drag && drag.valid && drag.day === day.key"
              class="pointer-events-none absolute z-[30] rounded-md bg-[#0A2147]/20"
              :style="ghostStyle()"
            />
          </div>

          <div
            v-if="nowMarker"
            class="pointer-events-none absolute z-[15] h-0.5 bg-[#0A2147]"
            :style="{ top: `${headerHeight + nowMarker.position}px`, insetInlineStart: `${columnWidth}px`, insetInlineEnd: '0' }"
          >
            <div class="absolute start-0 top-0 -translate-y-1/2 whitespace-nowrap rounded bg-[#0A2147] px-2 py-1 text-xs font-medium text-white shadow-md">
              {{ $t('scheduleUi.now') }}: {{ nowMarker.label }}
            </div>
          </div>

          <div
            v-if="drag?.moved"
            class="pointer-events-none absolute z-[12]"
            :style="dropRegionStyle()"
          >
            <div
              class="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded px-3 py-1.5 text-sm font-semibold text-white shadow-md"
              :class="drag.valid ? 'bg-[#0A2147]' : 'bg-red-600'"
            >
              {{ dragLabel }}
            </div>
            <div class="absolute inset-x-0 top-0 h-0.5" :class="drag.valid ? 'bg-[#0A2147]' : 'bg-red-600'" />
            <div class="absolute inset-x-0 bottom-0 h-0.5" :class="drag.valid ? 'bg-[#0A2147]' : 'bg-red-600'" />
            <div class="absolute inset-0" :class="drag.valid ? 'bg-[#0A2147]/[0.07]' : 'bg-red-500/10'" />
          </div>

          <div
            v-else-if="hover && !slotTip"
            class="pointer-events-none absolute z-20 h-0"
            :style="{ top: `${headerHeight + hover.y}px`, insetInlineStart: `${columnWidth}px`, insetInlineEnd: '0' }"
          >
            <div class="absolute inset-x-0 top-0 h-px bg-[#0A2147]/70" />
            <div class="absolute start-2 top-0 -translate-y-1/2 whitespace-nowrap rounded bg-[#0A2147] px-2 py-1 text-xs font-semibold text-white shadow-md">
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
          height: `${dragPreview.height}px`,
        }"
      >
        <div
          class="absolute inset-1 overflow-hidden rounded border-s-4 bg-white px-2 py-1 shadow-lg"
          :class="dragPreview.valid ? '' : 'ring-2 ring-red-500'"
          :style="{ borderInlineStartColor: dragPreview.color }"
        >
          <p class="truncate text-xs font-medium leading-4" :style="{ color: dragPreview.color }">{{ dragPreview.title }}</p>
          <p class="truncate text-[11px] leading-4 text-gray-500">{{ dragPreview.startTime }}</p>
          <p class="truncate text-[11px] leading-4 text-gray-500">{{ dragPreview.teacher }}</p>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="slotTip && !drag?.moved"
        class="pointer-events-none fixed z-[90] max-w-xs -translate-x-1/2 -translate-y-full rounded-md bg-[#0A2147] px-3 py-2 text-start text-white shadow-md"
        :dir="rtl ? 'rtl' : 'ltr'"
        :style="{ left: `${slotTip.x}px`, top: `${slotTip.y - 10}px` }"
      >
        <p class="text-xs font-semibold leading-4">{{ slotTip.title }}</p>
        <p class="text-xs leading-4">{{ slotTip.range }}</p>
        <p v-if="slotTip.teacher" class="text-xs leading-4 text-white/80">{{ slotTip.teacher }}</p>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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

const HEADER_HEIGHT = 64
const HOUR_PX = 72

const props = withDefaults(
  defineProps<{
    slots: FlexibleTimelineSlot[]
    days: FlexibleTimelineDay[]
    startMinutes: number
    endMinutes: number
    rtl?: boolean
    busy?: boolean
    snapMinutes?: number
    columnWidth?: number
  }>(),
  {
    rtl: false,
    busy: false,
    snapMinutes: 15,
    columnWidth: 72,
  },
)

const emit = defineEmits<{
  select: [id: string]
  add: [day: string]
  move: [payload: { id: string; day: string; startTime: string; endTime: string }]
  reject: []
}>()

const columnWidth = computed(() => props.columnWidth)
const headerHeight = HEADER_HEIGHT
const zoom = ref(100)
const scrollRef = ref<HTMLElement | null>(null)
const colEls = new Map<string, HTMLElement>()
const now = ref(new Date())
const hover = ref<{ y: number; time: string } | null>(null)
const slotTip = ref<{ title: string; teacher: string; range: string; x: number; y: number } | null>(null)

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
let nowTimer = 0

const rangeStart = computed(() => Math.floor(props.startMinutes / 60) * 60)
const rangeEnd = computed(() => {
  const raw = Math.max(props.endMinutes, props.startMinutes + 60)
  const snapped = Math.ceil(raw / 60) * 60
  return Math.max(snapped, rangeStart.value + 60)
})
const totalMinutes = computed(() => rangeEnd.value - rangeStart.value)
const pixelsPerMinute = computed(() => (HOUR_PX / 60) * (100 / zoom.value))
const timelineHeight = computed(() => totalMinutes.value * pixelsPerMinute.value)
const gridColumns = computed(
  () => `${columnWidth.value}px repeat(${Math.max(props.days.length, 1)}, minmax(0, 1fr))`,
)

const hourMarkers = computed(() => {
  const markers: { label: string; position: number; edge?: 'end' }[] = []
  const start = rangeStart.value
  const end = rangeEnd.value
  const ppm = pixelsPerMinute.value
  for (let minutes = start; minutes <= end; minutes += 60) {
    markers.push({
      label: minutesToHm(minutes),
      position: (minutes - start) * ppm,
      edge: minutes === end ? 'end' : undefined,
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
  const start = rangeStart.value
  const end = rangeEnd.value
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
    width: 180,
    height: Math.max(current.duration * pixelsPerMinute.value, 36),
    left: current.pointerX - current.grabX,
    top: current.pointerY - current.grabY,
  }
})

function setColEl(key: string, el: unknown) {
  if (el instanceof HTMLElement) colEls.set(key, el)
  else colEls.delete(key)
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
  const top = (start - rangeStart.value) * pixelsPerMinute.value
  const height = Math.max(durationOf(slot) * pixelsPerMinute.value, 18)
  return {
    top: `${Number.isFinite(top) ? top : 0}px`,
    height: `${height}px`,
    insetInlineStart: '4px',
    insetInlineEnd: '4px',
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

function columnAt(clientX: number) {
  for (const [key, el] of colEls) {
    const rect = el.getBoundingClientRect()
    if (clientX >= rect.left && clientX <= rect.right) return key
  }
  return null
}

function columnClass(day: string) {
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
  const top = (drag.value.newStart - rangeStart.value) * pixelsPerMinute.value
  const height = Math.max(drag.value.duration * pixelsPerMinute.value, 18)
  return {
    top: `${top}px`,
    height: `${height}px`,
    insetInlineStart: '4px',
    insetInlineEnd: '4px',
  }
}

function dropRegionStyle() {
  if (!drag.value || !scrollRef.value) return {}
  const grid = scrollRef.value.firstElementChild as HTMLElement | null
  const col = colEls.get(drag.value.day)
  if (!grid || !col) return {}
  const gridRect = grid.getBoundingClientRect()
  const colRect = col.getBoundingClientRect()
  const top = headerHeight + (drag.value.newStart - rangeStart.value) * pixelsPerMinute.value
  const height = Math.max(drag.value.duration * pixelsPerMinute.value, 18)
  return {
    left: `${colRect.left - gridRect.left}px`,
    width: `${colRect.width}px`,
    top: `${top}px`,
    height: `${height}px`,
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
  const trackY = event.clientY - rect.top - headerHeight
  if (trackY < 0 || trackY > timelineHeight.value) {
    hover.value = null
    return
  }
  const minutes = Math.floor(rangeStart.value + trackY / pixelsPerMinute.value)
  hover.value = { y: trackY, time: minutesToHm(minutes) }
}

function onSlotHover(event: MouseEvent, slot: FlexibleTimelineSlot) {
  if (drag.value?.moved) {
    slotTip.value = null
    return
  }
  slotTip.value = {
    title: slot.title,
    teacher: slot.teacher,
    range: `${slot.startTime} – ${slot.endTime}`,
    x: event.clientX,
    y: event.clientY,
  }
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
  slotTip.value = null
  const deltaMinutes = dy / pixelsPerMinute.value
  let next = snap(drag.value.startMinutes + deltaMinutes)
  const minStart = rangeStart.value
  const maxStart = Math.max(minStart, rangeEnd.value - drag.value.duration)
  next = Math.max(minStart, Math.min(maxStart, next))
  const day = columnAt(event.clientX) || drag.value.day
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

onMounted(() => {
  nowTimer = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onBeforeUnmount(() => {
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
