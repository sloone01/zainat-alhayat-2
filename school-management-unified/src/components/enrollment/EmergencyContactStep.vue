<template>
  <div class="text-center py-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('enrollment.steps.emergency') }}</h2>
    <p class="text-gray-600 mb-8">{{ $t('enrollment.comingSoon') }}</p>

    <div class="flex justify-between">
      <button
        @click="$emit('back')"
        class="px-6 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        {{ $t('common.back') }}
      </button>
      <button
        @click="$emit('next')"
        class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        {{ $t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: any
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'next'): void
  (e: 'back'): void
}>()
</script>