<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import AnimatedList from '@/components/ui/animated-list.vue'
import { cn } from '@/utils/cn'

export type ScheduleMobileItem = {
  id: string
  title: string
  subtitle: string
  time: string
  meta?: string
  to?: RouteLocationRaw | null
}

defineProps<{
  items: ScheduleMobileItem[]
  dayLabel: string
  emptyLabel: string
  resetKey?: string | number
}>()

defineEmits<{
  previous: []
  next: []
}>()

const ACCENTS = ['#00A19B', '#0A2147', '#0284c7', '#d97706', '#7c3aed', '#db2777', '#059669']

function accentFor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0
  }
  return ACCENTS[hash % ACCENTS.length]
}

function cardClass(item: ScheduleMobileItem): string {
  return cn(
    'relative mx-auto block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_rgba(15,23,42,0.04)]',
    'transition-colors duration-200',
    item.to && 'cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
  )
}
</script>

<template>
  <div class="lg:hidden">
    <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div class="grid grid-cols-3 items-center gap-2">
        <div class="justify-self-start rtl:justify-self-end">
          <button
            type="button"
            class="fk-btn fk-btn--pearl inline-flex items-center gap-2"
            @click="$emit('previous')"
          >
            <svg class="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('common.previous') }}
          </button>
        </div>
        <div class="min-w-0 text-center">
          <h3 class="text-sm font-semibold text-gray-900">{{ dayLabel }}</h3>
        </div>
        <div class="justify-self-end rtl:justify-self-start">
          <button
            type="button"
            class="fk-btn fk-btn--pearl inline-flex items-center gap-2"
            @click="$emit('next')"
          >
            {{ $t('common.next') }}
            <svg class="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="p-4">
      <AnimatedList
        v-if="items.length"
        :items="items"
        :delay="160"
        :reset-key="resetKey ?? dayLabel"
      >
        <template #default="{ item }">
          <component
            :is="item.to ? 'router-link' : 'article'"
            :to="item.to || undefined"
            :class="cardClass(item)"
            :aria-label="item.to ? $t('courseMaterials.navTitle') : undefined"
          >
            <div class="flex flex-row items-center gap-3">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-2xl text-white"
                :style="{ backgroundColor: accentFor(item.title) }"
                aria-hidden="true"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-baseline gap-x-1.5 text-fikr-ink">
                  <span class="truncate text-sm font-medium">{{ item.title }}</span>
                  <span class="text-gray-400" aria-hidden="true">·</span>
                  <span class="shrink-0 text-xs tabular-nums text-gray-500">{{ item.time }}</span>
                </div>
                <p class="mt-0.5 truncate text-sm text-fikr-ink-muted">{{ item.subtitle }}</p>
                <p v-if="item.meta" class="mt-0.5 truncate text-xs text-fikr-ink-soft">{{ item.meta }}</p>
              </div>
            </div>
          </component>
        </template>
      </AnimatedList>

      <div
        v-else
        class="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center"
      >
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-gray-800">{{ emptyLabel }}</p>
      </div>
    </div>
  </div>
</template>
