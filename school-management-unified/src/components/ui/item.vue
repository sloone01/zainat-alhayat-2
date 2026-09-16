<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive ? disabled : undefined"
    :role="interactive ? undefined : 'listitem'"
    data-slot="item"
    data-variant="outline"
    :class="[
      'flex items-center gap-4 rounded-md border border-gray-200 bg-white p-4 text-sm outline-none transition-colors duration-200',
      interactive
        ? 'w-full cursor-pointer text-start hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:pointer-events-none disabled:opacity-50'
        : '',
    ]"
    @click="onClick"
  >
    <div
      data-slot="item-media"
      class="size-10 shrink-0 overflow-hidden rounded-sm bg-gray-100"
    >
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        alt=""
        class="size-full object-cover"
      >
      <span
        v-else
        class="flex size-full items-center justify-center text-xs font-semibold text-fikr-ink"
        aria-hidden="true"
      >
        {{ initials }}
      </span>
    </div>
    <div
      data-slot="item-content"
      class="flex min-w-0 flex-1 flex-col gap-1"
    >
      <div
        data-slot="item-title"
        class="text-sm font-medium leading-snug text-fikr-ink"
      >
        {{ title }}
      </div>
      <p
        v-if="description"
        data-slot="item-description"
        class="line-clamp-2 text-sm font-normal leading-normal text-fikr-ink-soft"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      data-slot="item-actions"
      class="flex shrink-0 items-center gap-2"
    >
      <slot name="actions" />
    </div>
  </component>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  initials?: string
  avatarSrc?: string
  interactive?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

function onClick() {
  if (!props.interactive || props.disabled) return
  emit('click')
}
</script>
