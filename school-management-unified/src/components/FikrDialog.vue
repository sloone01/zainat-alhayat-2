<template>
  <div v-if="show" class="fk-modal" :class="elevate ? '!z-[80]' : ''" role="dialog" aria-modal="true" :aria-labelledby="titleId" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="fk-modal__backdrop" @click="$emit('close')" />
    <div
      class="fk-modal__panel"
      :class="[
        size === 'md' ? 'fk-modal__panel--md' : size === 'lg' ? 'fk-modal__panel--lg' : '',
        compact ? 'fk-modal__panel--compact' : '',
      ]"
    >
      <div class="fk-modal__head">
        <div class="min-w-0">
          <p v-if="eyebrow" class="fk-form__eyebrow">{{ eyebrow }}</p>
          <h3 :id="titleId" class="fk-form__title">{{ title }}</h3>
          <p v-if="subtitle" class="fk-form__hint mt-1">{{ subtitle }}</p>
        </div>
        <button type="button" class="fk-modal__close" :aria-label="$t('common.close')" @click="$emit('close')">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="fk-modal__body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="fk-modal__foot">
        <div :class="plainFooter ? 'flex items-center justify-end gap-2' : 'fk-actionbar'">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{
  show: boolean
  title: string
  eyebrow?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  plainFooter?: boolean
  elevate?: boolean
  compact?: boolean
}>(), { size: 'sm', plainFooter: false, elevate: false, compact: false })

defineEmits<{ (e: 'close'): void }>()

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const titleId = `fk-dialog-${Math.random().toString(36).slice(2, 8)}`
</script>
