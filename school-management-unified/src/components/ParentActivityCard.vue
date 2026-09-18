<template>
  <!-- 7b completed: navy card -->
  <article
    v-if="variant === 'completed'"
    class="flex flex-col gap-4 rounded-2xl bg-navy-800 p-6 text-white"
  >
    <div class="flex items-start justify-between gap-3">
      <span
        class="grid h-14 w-14 place-items-center rounded-full bg-primary-500 text-xl text-white"
        aria-hidden="true"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </div>
    <div class="min-w-0">
      <p class="text-xs leading-5 text-fikr-link-on-dark">{{ eyebrow }}</p>
      <h3 class="fk-display mt-0.5 text-xl font-bold leading-7 text-white">{{ title }}</h3>
      <p v-if="meta" class="mt-0.5 text-sm leading-5 text-white/75">{{ meta }}</p>
    </div>
    <div v-if="$slots.actions" class="mt-auto flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </article>

  <!-- 7b upcoming: cover + body -->
  <article
    v-else-if="variant === 'cover'"
    class="flex flex-col overflow-hidden rounded-2xl bg-fikr-mist text-navy-800"
  >
    <div class="relative aspect-[4/3] bg-navy-800">
      <img
        v-if="coverImage"
        :src="coverImage"
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div
        v-else
        class="absolute inset-0 grid place-items-center px-4 text-center text-sm text-white/50"
      >
        {{ $t('parent.activityCoverPlaceholder') }}
      </div>
      <span
        v-if="dateBadge"
        class="absolute start-3 top-3 rounded-pill bg-white px-3 py-1 text-xs font-medium text-navy-800"
      >
        {{ dateBadge }}
      </span>
    </div>
    <div class="flex flex-1 flex-col gap-3 px-6 pb-6 pt-4">
      <div class="min-w-0">
        <h3 class="fk-display text-xl font-bold leading-7 text-navy-800">{{ title }}</h3>
        <p v-if="meta" class="mt-0.5 text-sm leading-5 text-fikr-ink-muted">{{ meta }}</p>
      </div>
      <div v-if="approvalLabel || $slots.actions" class="mt-auto flex items-center justify-between gap-3">
        <span v-if="approvalLabel" class="text-sm text-fikr-ink-muted">
          {{ approvalLabel }}
        </span>
        <div v-if="$slots.actions" class="ms-auto flex flex-wrap items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
      <div
        v-if="approvalProgress != null"
        class="flex h-1.5 overflow-hidden rounded-pill bg-white"
        aria-hidden="true"
      >
        <span class="bg-primary-500" :style="{ width: `${Math.min(100, Math.max(0, approvalProgress))}%` }" />
      </div>
    </div>
  </article>

  <!-- 7b mist: date block + chips -->
  <article
    v-else
    class="flex flex-col gap-4 rounded-2xl bg-fikr-mist p-6 text-navy-800"
  >
    <div class="flex items-start justify-between gap-3">
      <span
        class="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white text-center"
        aria-hidden="true"
      >
        <span class="fk-display text-lg font-bold leading-5 tabular-nums text-navy-800" dir="ltr">{{ dayNumber }}</span>
        <span class="text-[11px] leading-4 text-fikr-ink-muted">{{ weekdayShort }}</span>
      </span>
      <span
        v-if="statusChip"
        class="fk-ktag"
      >
        <span class="fk-ktag__dot bg-primary-500" aria-hidden="true" />
        {{ statusChip }}
      </span>
    </div>
    <div class="min-w-0">
      <h3 class="fk-display text-xl font-bold leading-7 text-navy-800">{{ title }}</h3>
      <p v-if="meta" class="mt-0.5 text-sm leading-5 text-fikr-ink-muted">{{ meta }}</p>
    </div>
    <div v-if="chips.length" class="flex flex-wrap gap-2">
      <span
        v-for="(chip, i) in chips"
        :key="i"
        class="rounded-pill bg-white px-3 py-1 text-xs font-medium text-navy-800"
      >{{ chip }}</span>
    </div>
    <div
      v-if="$slots.footer || $slots.actions"
      class="mt-auto flex items-center justify-between gap-3 border-t border-fikr-hairline pt-4"
    >
      <div class="min-w-0 text-sm text-fikr-ink-muted">
        <slot name="footer" />
      </div>
      <div v-if="$slots.actions" class="shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'cover' | 'mist' | 'completed'
  title: string
  meta?: string
  eyebrow?: string
  dateBadge?: string
  dayNumber?: string
  weekdayShort?: string
  statusChip?: string
  chips?: string[]
  coverImage?: string
  approvalLabel?: string
  /** 0–100 fill for the teal approval bar on cover cards */
  approvalProgress?: number | null
}>(), {
  variant: 'mist',
  chips: () => [],
  approvalProgress: null,
})
</script>
