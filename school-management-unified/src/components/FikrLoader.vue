<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg'
    showLabel?: boolean
    label?: string
    muted?: boolean
  }>(),
  {
    size: 'md',
    showLabel: false,
    muted: false,
  },
)

const { t } = useI18n()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-5 w-5'
    case 'sm':
      return 'h-8 w-8'
    case 'lg':
      return 'h-16 w-16'
    default:
      return 'h-12 w-12'
  }
})

const statusLabel = computed(() => props.label ?? t('common.loading'))
</script>

<template>
  <div
    class="inline-flex flex-col items-center justify-center gap-3"
    role="status"
    :aria-label="statusLabel"
  >
    <div class="fikr-loader relative flex shrink-0 items-center justify-center" :class="sizeClass">
      <span class="fikr-loader-glow" aria-hidden="true" />
      <img
        src="/fikr-icon.png?v=4"
        alt=""
        class="fikr-loader-icon relative z-10 h-full w-full object-contain"
        aria-hidden="true"
      >
    </div>
    <span
      v-if="showLabel"
      class="text-sm"
      :class="muted ? 'text-hub-muted' : 'text-current'"
    >
      {{ statusLabel }}
    </span>
  </div>
</template>

<style scoped>
.fikr-loader-glow {
  position: absolute;
  inset: -35%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(26, 176, 160, 0.35) 0%, transparent 68%);
  animation: fikr-glow 2.4s ease-in-out infinite;
}

.fikr-loader-icon {
  animation: fikr-breathe 2.4s ease-in-out infinite;
  filter: drop-shadow(0 6px 14px rgba(26, 176, 160, 0.22));
}

@keyframes fikr-breathe {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.07) translateY(-3px);
  }
}

@keyframes fikr-glow {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.92);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}
</style>
