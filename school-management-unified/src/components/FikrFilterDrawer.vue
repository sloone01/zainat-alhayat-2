<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
  >
    <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="emit('close')" />
    <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="fk-drawer__header items-start">
        <h3 class="fk-form__title">{{ title }}</h3>
        <button type="button" class="fk-modal__close" :aria-label="$t('common.close')" @click="emit('close')">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="fk-drawer__body">
        <slot />
      </div>
      <div class="px-4 pb-4">
        <div class="flex items-center justify-end gap-2">
          <button type="button" class="fk-btn fk-btn--pearl" @click="emit('clear')">{{ $t('common.clear') }}</button>
          <button type="button" class="fk-btn fk-btn--primary" @click="emit('close')">{{ $t('common.close') }}</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{ show: boolean; title: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'clear'): void }>()

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
</script>
