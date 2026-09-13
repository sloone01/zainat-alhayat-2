<template>
  <div
    class="flex min-h-[min(320px,40vh)] flex-1 flex-col items-center justify-center px-6 py-16 text-center"
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
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      </div>
      <p class="text-lg font-semibold text-gray-900">{{ $t('chatRooms.mailboxEmptyTitle') }}</p>
      <p class="mt-2 text-sm leading-relaxed text-gray-500">
        {{ $t('chatRooms.mailboxEmptyHint') }}
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
