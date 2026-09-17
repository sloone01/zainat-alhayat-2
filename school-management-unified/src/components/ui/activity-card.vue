<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/utils/cn'

export interface ActivityMetric {
  key: string
  label: string
  value: string
  trend: number
  unit?: string
  color: string
  valueClass?: string
}

const RING_R = 38
const RING_C = 2 * Math.PI * RING_R

const props = withDefaults(defineProps<{
  title: string
  category?: string
  metrics?: ActivityMetric[]
  layout?: 'stack' | 'split'
  className?: string
}>(), {
  metrics: () => [],
  layout: 'stack',
})

const hovering = ref<string | null>(null)
const hasMetrics = computed(() => props.metrics.length > 0)

function clampTrend(trend: number) {
  if (!Number.isFinite(trend)) return 0
  return Math.min(100, Math.max(0, trend))
}

function dashOffset(trend: number) {
  return RING_C * (1 - clampTrend(trend) / 100)
}
</script>

<template>
  <section
    :class="cn(
      'relative rounded-3xl border border-zinc-200 bg-white p-6 transition-colors duration-300 hover:border-zinc-300',
      className,
    )"
  >
    <div class="mb-6 flex items-center gap-3">
      <div class="rounded-full bg-zinc-100 p-2 text-primary-600">
        <slot name="icon" />
      </div>
      <div class="min-w-0">
        <h2 class="truncate text-lg font-semibold text-zinc-900">
          {{ title }}
        </h2>
        <p v-if="category" class="truncate text-sm text-zinc-500">
          {{ category }}
        </p>
      </div>
    </div>

    <div
      :class="layout === 'split' && hasMetrics
        ? 'lg:grid lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:items-start lg:gap-12'
        : ''"
    >
    <div v-if="hasMetrics" class="grid grid-cols-3 gap-3 sm:gap-4">
      <div
        v-for="metric in metrics"
        :key="metric.key"
        class="relative flex flex-col items-center"
        @mouseenter="hovering = metric.key"
        @mouseleave="hovering = null"
      >
        <div
          class="relative h-20 w-20 sm:h-24 sm:w-24"
          :aria-label="`${metric.label} ${metric.value}`"
        >
          <svg class="h-full w-full -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
            <circle
              cx="48"
              cy="48"
              :r="RING_R"
              fill="none"
              class="stroke-zinc-200"
              stroke-width="8"
            />
            <circle
              cx="48"
              cy="48"
              :r="RING_R"
              fill="none"
              stroke-width="8"
              stroke-linecap="round"
              class="origin-center transition-[stroke-dashoffset,opacity] duration-500 motion-reduce:transition-none"
              :class="hovering === metric.key ? 'opacity-100' : 'opacity-90'"
              :stroke="metric.color"
              :stroke-dasharray="RING_C"
              :stroke-dashoffset="dashOffset(metric.trend)"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center px-1">
            <span
              :class="metric.valueClass || 'text-lg font-bold tabular-nums text-zinc-900 sm:text-xl'"
            >
              {{ metric.value }}
            </span>
            <span v-if="metric.unit" class="text-xs text-zinc-500">
              {{ metric.unit }}
            </span>
          </div>
        </div>
        <span class="mt-3 text-center text-sm font-medium text-zinc-700">
          {{ metric.label }}
        </span>
        <span class="text-xs tabular-nums text-zinc-500">
          {{ Math.round(clampTrend(metric.trend)) }}%
        </span>
      </div>
    </div>

    <div
      v-if="$slots.list || $slots.default"
      :class="hasMetrics && layout !== 'split'
        ? 'mt-8 space-y-6'
        : hasMetrics && layout === 'split'
          ? 'mt-8 space-y-6 lg:mt-0'
          : 'space-y-6'"
    >
      <div
        v-if="hasMetrics"
        class="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent"
        :class="layout === 'split' ? 'lg:hidden' : ''"
      />

      <div v-if="$slots.list" class="space-y-4">
        <div v-if="$slots['list-title']" class="flex items-center justify-between gap-3">
          <h3 class="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <slot name="list-title" />
          </h3>
        </div>
        <div class="space-y-2">
          <slot name="list" />
        </div>
      </div>

      <div v-if="$slots.default" :class="$slots.list ? 'space-y-6' : ''">
        <slot />
      </div>
    </div>
    </div>

    <div
      v-if="$slots.footer"
      class="mt-6 border-t border-zinc-200 pt-4"
    >
      <slot name="footer" />
    </div>
  </section>
</template>
