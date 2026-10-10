<template>
  <section class="fk-hero">
    <div class="fk-hero__pixels" aria-hidden="true">
      <span v-for="n in 16" :key="n" />
    </div>
    <div class="relative flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0 max-w-2xl">
        <p v-if="eyebrow" class="fk-hero__eyebrow">{{ eyebrow }}</p>
        <div
          class="flex gap-3"
          :class="subtitle && $slots.leading ? 'items-center' : 'items-start'"
        >
          <div v-if="$slots.leading" class="shrink-0" :class="subtitle ? '' : 'pt-1'">
            <slot name="leading" />
          </div>
          <h1 class="fk-hero__title" :class="subtitle && $slots.leading ? '!mt-0' : ''">{{ title }}</h1>
        </div>
        <p v-if="subtitle" class="fk-hero__subtitle" :class="$slots.leading ? 'ps-11' : ''">{{ subtitle }}</p>
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
