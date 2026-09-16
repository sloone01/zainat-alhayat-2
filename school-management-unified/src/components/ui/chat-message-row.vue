<template>
  <div
    class="flex gap-3"
    :class="fullBleed
      ? 'w-[calc(100%+1rem)] -mx-2 flex-col'
      : isOwn ? 'flex-row-reverse' : 'flex-row'"
  >
    <span
      v-if="!fullBleed"
      class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fikr-surface-container text-xs font-semibold text-fikr-ink"
      aria-hidden="true"
    >
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="senderName"
        class="h-full w-full object-cover"
      >
      <template v-else>{{ initials }}</template>
    </span>
    <div
      class="flex flex-col gap-1"
      :class="fullBleed
        ? 'w-full min-w-0'
        : ['max-w-[75%]', isOwn ? 'items-end' : 'items-start']"
    >
      <div
        class="flex items-center gap-2"
        :class="fullBleed && isOwn ? 'flex-row-reverse self-end' : ''"
      >
        <span
          v-if="fullBleed"
          class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fikr-surface-container text-xs font-semibold text-fikr-ink"
          aria-hidden="true"
        >
          <img
            v-if="avatarSrc"
            :src="avatarSrc"
            :alt="senderName"
            class="h-full w-full object-cover"
          >
          <template v-else>{{ initials }}</template>
        </span>
        <span v-if="senderName" class="text-xs font-medium text-fikr-ink">{{ senderName }}</span>
        <span class="text-xs text-fikr-ink-soft">{{ timestamp }}</span>
      </div>
      <div
        v-if="!$slots.raw"
        class="rounded-lg px-3 py-2 text-sm"
        :class="isOwn
          ? 'bg-primary-600 text-white'
          : 'border border-gray-200 bg-white text-fikr-ink'"
      >
        <slot />
      </div>
      <slot v-else name="raw" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isOwn: boolean
    senderName: string
    timestamp: string
    initials: string
    avatarSrc?: string
    fullBleed?: boolean
  }>(),
  { fullBleed: false },
)
</script>
