<template>
  <component
    :is="variant === 'pick' ? 'button' : 'div'"
    :type="variant === 'pick' ? 'button' : undefined"
    :class="cardClass"
    @click="variant === 'pick' ? $emit('select', parent) : undefined"
  >
    <div class="flex items-start gap-2">
      <span
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600"
        :class="variant === 'pick' ? 'group-hover:bg-white' : ''"
      >
        {{ initials }}
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium text-gray-900">{{ fullName }}</span>
        <span v-if="parent.email" class="mt-0.5 block truncate text-[11px] text-gray-500">{{ parent.email }}</span>
        <span v-if="parent.phone" class="block truncate text-[11px] text-gray-500">{{ parent.phone }}</span>
        <span v-if="variant === 'selected' && hasAccount" class="mt-1.5 inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800">
          {{ $t('students.hasAccount') }}
        </span>
      </span>
    </div>

    <div v-if="variant === 'pick'" class="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary-600 px-2 py-1 text-[11px] font-medium text-white group-hover:bg-primary-700">
      {{ $t('common.select') }}
    </div>

    <div v-else class="mt-2 flex gap-2">
      <button
        type="button"
        class="inline-flex flex-1 items-center justify-center rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
        @click.stop="$emit('change')"
      >
        {{ $t('students.changeParent') }}
      </button>
      <button
        type="button"
        class="inline-flex flex-1 items-center justify-center rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-800 hover:bg-red-50"
        @click.stop="$emit('remove')"
      >
        {{ $t('students.removeSelectedParent') }}
      </button>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Parent } from '@/services/parent.service'

const props = withDefaults(
  defineProps<{
    parent: Parent
    variant?: 'pick' | 'selected'
  }>(),
  { variant: 'pick' },
)

defineEmits<{
  select: [parent: Parent]
  change: []
  remove: []
}>()

const fullName = computed(() => `${props.parent.firstName ?? ''} ${props.parent.lastName ?? ''}`.trim())

const initials = computed(() => {
  const a = props.parent.firstName?.[0] ?? ''
  const b = props.parent.lastName?.[0] ?? ''
  return (a + b).toUpperCase() || '?'
})

const hasAccount = computed(() => Boolean(props.parent.user?.id ?? props.parent.user))

const cardClass = computed(() => {
  const base =
    'flex w-full flex-col rounded-lg border p-2.5 text-start shadow-sm transition-colors'
  if (props.variant === 'pick') {
    return `${base} group border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30`
  }
  return `${base} border-primary-300 bg-primary-50/40`
})
</script>
