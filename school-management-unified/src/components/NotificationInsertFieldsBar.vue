<template>
  <div v-if="hints.length" class="flex min-w-0 flex-wrap items-center gap-2" :title="hint || undefined">
    <span class="shrink-0 text-xs font-semibold text-gray-800">{{ title }}</span>
    <div class="flex min-w-0 flex-wrap items-center gap-1">
      <button
        v-for="h in hints"
        :key="'chip-' + h.name"
        type="button"
        class="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-800 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
        :title="h.label"
        @mousedown.prevent
        @click="$emit('insert', h.name)"
      >
        {{ h.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  hint?: string
  hints: { name: string; label: string }[]
}>()

defineEmits<{
  insert: [name: string]
}>()
</script>
