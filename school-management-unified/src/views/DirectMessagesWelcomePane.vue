<template>
  <div
    class="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center min-h-[min(320px,40vh)]"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <div
      class="flex max-w-md flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-8 py-12"
    >
      <div
        class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100"
        aria-hidden="true"
      >
        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>
      <p class="text-lg font-semibold text-gray-900">{{ $t('directMessages.mailboxEmptyTitle') }}</p>
      <p class="mt-2 text-sm leading-relaxed text-gray-500">
        {{ $t('directMessages.mailboxEmptyHint') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
</script>
