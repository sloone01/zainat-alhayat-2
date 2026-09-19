<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AnimatedList from '@/components/ui/animated-list.vue'
import {
  periodPhase,
  periodProgress,
  schoolWeekDates,
  sessionDurationMinutes,
} from '@/utils/schedule-display'

export type ScheduleMobileItem = {
  id: string
  title: string
  subtitle: string
  time: string
  startTime?: string
  endTime?: string
  meta?: string
  to?: RouteLocationRaw | null
  kind?: 'lesson' | 'break' | 'empty'
}

const props = withDefaults(
  defineProps<{
    items: ScheduleMobileItem[]
    weekDays: { key: string }[]
    selectedIndex: number
    todayIndex: number
    emptyLabel: string
    resetKey?: string | number
    variant?: 'timeline' | 'lessons'
    showStrip?: boolean
  }>(),
  { variant: 'timeline', showStrip: true },
)

const emit = defineEmits<{
  select: [index: number]
  open: [item: ScheduleMobileItem]
}>()

const { t } = useI18n()
const weekDates = schoolWeekDates()

function phaseOf(item: ScheduleMobileItem) {
  return periodPhase(
    props.selectedIndex,
    props.todayIndex,
    item.startTime || item.time,
    item.endTime || '',
  )
}

function progressOf(item: ScheduleMobileItem) {
  return periodProgress(item.startTime || item.time, item.endTime || '')
}

function durationLabel(item: ScheduleMobileItem) {
  const mins = sessionDurationMinutes(item.startTime || '', item.endTime || '')
  if (!mins) return item.time
  return t('scheduleUi.mins', { n: mins })
}

function clockLines(item: ScheduleMobileItem) {
  const start = item.startTime || item.time
  const end = item.endTime || ''
  return { start, end }
}

function onOpen(item: ScheduleMobileItem) {
  if (item.to) return
  if (item.kind === 'break') return
  emit('open', item)
}

const listKey = computed(() => props.resetKey ?? `${props.selectedIndex}-${props.variant}`)
</script>

<template>
  <div class="lg:hidden">
    <div v-if="showStrip" class="fk-tt-strip">
      <button
        v-for="(day, index) in weekDays"
        :key="day.key"
        type="button"
        class="fk-tt-strip__day"
        :class="index === selectedIndex ? 'fk-tt-strip__day--on' : ''"
        @click="emit('select', index)"
      >
        {{ $t(`scheduleManagement.days.${day.key}`) }}
        <b>{{ weekDates[index]?.getDate() }}</b>
      </button>
    </div>

    <div :class="showStrip ? 'pt-6' : ''">
      <AnimatedList
        v-if="items.length"
        :items="items"
        :delay="160"
        :reset-key="listKey"
      >
        <template #default="{ item }">
          <button
            v-if="item.kind === 'empty'"
            type="button"
            class="fk-tt-cell fk-tt-cell--empty min-h-14 w-full"
            @click="onOpen(item)"
          >
            {{ item.title }}
          </button>

          <article
            v-else-if="item.kind === 'break' || variant === 'lessons'"
            class="fk-tt-lesson"
            :class="{
              'fk-tt-lesson--past': phaseOf(item) === 'past',
              'fk-tt-lesson--now': item.kind !== 'break' && phaseOf(item) === 'now',
              'fk-tt-cell--break': item.kind === 'break',
            }"
            role="button"
            :tabindex="item.to || item.kind === 'break' ? undefined : 0"
            @click="onOpen(item)"
          >
            <template v-if="item.kind !== 'break' && phaseOf(item) === 'now'">
              <div class="flex items-center justify-between gap-2">
                <span class="fk-tt-now">
                  <span class="fk-tt-now__dot" aria-hidden="true" />
                  {{ $t('scheduleUi.now') }}
                  <template v-if="clockLines(item).start">
                    · {{ clockLines(item).start }}<template v-if="clockLines(item).end"> – {{ clockLines(item).end }}</template>
                  </template>
                </span>
                <span v-if="item.meta" class="text-xs text-[#c9d3e6]">{{ item.meta }}</span>
              </div>
              <div>
                <p class="fk-tt-lesson__title">{{ item.title }}<template v-if="item.subtitle"> · {{ item.subtitle }}</template></p>
              </div>
            </template>
            <template v-else>
              <span class="fk-tt-lesson__clock">
                {{ clockLines(item).start }}<template v-if="clockLines(item).end"><br>{{ clockLines(item).end }}</template>
              </span>
              <div class="min-w-0 flex-1">
                <p class="fk-tt-lesson__title">{{ item.title }}<template v-if="item.subtitle"> · {{ item.subtitle }}</template></p>
                <p v-if="item.meta" class="fk-tt-lesson__sub">{{ item.meta }}</p>
              </div>
            </template>
          </article>

          <component
            v-else
            :is="item.to ? 'router-link' : 'article'"
            :to="item.to || undefined"
            class="fk-tt-row"
            :class="{
              'fk-tt-row--past': phaseOf(item) === 'past',
              'fk-tt-row--now': phaseOf(item) === 'now',
            }"
            :aria-label="item.to ? $t('courseMaterials.navTitle') : undefined"
          >
            <span class="fk-tt-row__time">{{ item.startTime || item.time }}</span>
            <div
              class="fk-tt-card"
              :class="phaseOf(item) === 'now' ? 'fk-tt-card--now' : ''"
            >
              <template v-if="phaseOf(item) === 'now'">
                <span class="fk-tt-now">
                  <span class="fk-tt-now__dot" aria-hidden="true" />
                  {{ $t('scheduleUi.now') }}
                </span>
                <span class="fk-tt-card__title">{{ item.title }}</span>
                <span class="fk-tt-card__meta">
                  {{ item.subtitle }}<template v-if="item.meta"> · {{ item.meta }}</template>
                  <template v-if="item.endTime"> · {{ $t('scheduleUi.until', { time: item.endTime }) }}</template>
                </span>
                <span class="fk-tt-bar" aria-hidden="true">
                  <span :style="{ width: `${progressOf(item)}%` }" />
                </span>
              </template>
              <template v-else>
                <span class="fk-tt-card__title">{{ item.title }}<template v-if="item.subtitle"> · {{ item.subtitle }}</template></span>
                <span class="fk-tt-card__meta">{{ durationLabel(item) }}</span>
              </template>
            </div>
          </component>
        </template>
      </AnimatedList>

      <div
        v-else
        class="fk-tt-cell fk-tt-cell--empty min-h-32 px-4 py-8 text-center"
      >
        <p class="text-sm font-semibold text-[#0a2147]">{{ emptyLabel }}</p>
      </div>
    </div>
  </div>
</template>
