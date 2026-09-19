<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

export type WeekGridSlot = {
  time: string
  label?: string
  kind?: 'class' | 'break'
  name?: string
}

export type WeekGridCell = {
  title: string
  meta?: string
  now?: boolean
  to?: RouteLocationRaw | null
}

const props = withDefaults(
  defineProps<{
    days: { key: string }[]
    slots: WeekGridSlot[]
    todayKey: string
    cells: Record<string, WeekGridCell | null | undefined>
    editable?: boolean
    addLabel?: string
  }>(),
  { editable: false, addLabel: '' },
)

const emit = defineEmits<{
  edit: [payload: { time: string; day: string }]
  add: [payload: { time: string; day: string }]
}>()

function cellKey(time: string, day: string) {
  return `${time}|${day}`
}

function cellAt(time: string, day: string) {
  return props.cells[cellKey(time, day)] || null
}

function cellClass(time: string, day: string) {
  const cell = cellAt(time, day)
  return {
    'fk-tt-cell--today': day === props.todayKey,
    'fk-tt-cell--now': !!cell?.now,
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <div class="fk-tt-grid" role="grid">
      <span />
      <span
        v-for="day in days"
        :key="day.key"
        class="fk-tt-grid__day"
        :class="day.key === todayKey ? 'fk-tt-grid__day--today' : ''"
      >
        {{ $t(`scheduleManagement.days.${day.key}`) }}
        <template v-if="day.key === todayKey"> · {{ $t('scheduleUi.today') }}</template>
      </span>

      <template v-for="slot in slots" :key="slot.time">
        <span class="fk-tt-grid__gutter">
          {{ slot.time }}
          <template v-if="slot.label"><br>{{ slot.label }}</template>
        </span>
        <span v-if="slot.kind === 'break'" class="fk-tt-grid__span">
          {{ slot.name }}
        </span>
        <template v-else>
          <template v-for="day in days" :key="`${slot.time}-${day.key}`">
            <router-link
              v-if="cellAt(slot.time, day.key)?.to"
              :to="cellAt(slot.time, day.key)!.to!"
              class="fk-tt-cell fk-tt-cell--lesson"
              :class="cellClass(slot.time, day.key)"
              :aria-label="$t('courseMaterials.navTitle')"
            >
              <p class="fk-tt-cell__title">{{ cellAt(slot.time, day.key)!.title }}</p>
              <p v-if="cellAt(slot.time, day.key)!.meta" class="fk-tt-cell__meta">
                {{ cellAt(slot.time, day.key)!.meta }}
              </p>
            </router-link>
            <button
              v-else-if="cellAt(slot.time, day.key) && editable"
              type="button"
              class="fk-tt-cell fk-tt-cell--lesson"
              :class="cellClass(slot.time, day.key)"
              @click="emit('edit', { time: slot.time, day: day.key })"
            >
              <p class="fk-tt-cell__title">{{ cellAt(slot.time, day.key)!.title }}</p>
              <p v-if="cellAt(slot.time, day.key)!.meta" class="fk-tt-cell__meta">
                {{ cellAt(slot.time, day.key)!.meta }}
              </p>
            </button>
            <div
              v-else-if="cellAt(slot.time, day.key)"
              class="fk-tt-cell fk-tt-cell--lesson"
              :class="cellClass(slot.time, day.key)"
            >
              <p class="fk-tt-cell__title">{{ cellAt(slot.time, day.key)!.title }}</p>
              <p v-if="cellAt(slot.time, day.key)!.meta" class="fk-tt-cell__meta">
                {{ cellAt(slot.time, day.key)!.meta }}
              </p>
            </div>
            <button
              v-else-if="editable"
              type="button"
              class="fk-tt-cell fk-tt-cell--empty"
              @click="emit('add', { time: slot.time, day: day.key })"
            >
              {{ addLabel }}
            </button>
            <div v-else class="fk-tt-cell fk-tt-cell--empty" />
          </template>
        </template>
      </template>
    </div>
  </div>
</template>
