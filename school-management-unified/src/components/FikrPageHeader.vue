<template>
  <section class="fk-hero">
    <div class="fk-hero__pixels" aria-hidden="true">
      <span v-for="n in 16" :key="n" />
    </div>
    <div class="relative flex flex-wrap items-end justify-between gap-4">
      <div class="flex min-w-0 max-w-2xl items-start gap-3">
        <div v-if="$slots.leading" class="shrink-0 pt-1">
          <slot name="leading" />
        </div>
        <div class="min-w-0">
        <p v-if="eyebrow" class="fk-hero__eyebrow">{{ eyebrow }}</p>
        <h1 class="fk-hero__title">{{ title }}</h1>
        <p v-if="subtitle" class="fk-hero__subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="$slots.default" class="relative mt-5">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
}>()
</script>
