<template>
  <form class="flex gap-2" @submit.prevent="onSubmit">
    <label :for="inputId" class="sr-only">{{ placeholder }}</label>
    <textarea
      v-if="multiline"
      :id="inputId"
      :value="modelValue"
      rows="1"
      :placeholder="placeholder"
      :disabled="disabled"
      class="max-h-24 min-h-10 flex-1 resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-fikr-ink placeholder:text-fikr-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      @input="onInput"
      @keydown.enter.exact.prevent="onSubmit"
    />
    <input
      v-else
      :id="inputId"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="h-10 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-fikr-ink placeholder:text-fikr-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      @input="onInput"
    >
    <button
      type="submit"
      :disabled="sendDisabled"
      class="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-primary-600 text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      :aria-label="sendLabel"
    >
      <svg class="h-4 w-4 rtl:-scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder: string
    sendLabel: string
    inputId: string
    disabled?: boolean
    submitting?: boolean
    multiline?: boolean
  }>(),
  {
    modelValue: '',
    disabled: false,
    submitting: false,
    multiline: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  input: []
}>()

const sendDisabled = computed(
  () => props.disabled || props.submitting || !props.modelValue.trim(),
)

function onInput(e: Event) {
  const el = e.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', el.value)
  emit('input')
}

function onSubmit() {
  if (sendDisabled.value) return
  emit('submit')
}
</script>
