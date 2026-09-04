<template>
  <div class="relative shrink-0">
    <button
      type="button"
      class="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="$t('common.actions')"
      @click.stop="emit('toggle')"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </button>
    <div
      v-if="open"
      :class="[
        'absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20',
        isRTL ? 'left-0' : 'right-0'
      ]"
      role="menu"
      @click.stop
    >
      <div class="py-1">
        <button
          type="button"
          role="menuitem"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="emit('edit')"
        >
          <svg class="w-4 h-4 me-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {{ $t('common.edit') }}
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="emit('resetPassword')"
        >
          <svg class="w-4 h-4 me-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          {{ $t('userManagement.resetPassword') }}
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="emit('toggleStatus')"
        >
          <svg class="w-4 h-4 me-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
          {{ user.status === 'active' ? $t('userManagement.deactivate') : $t('userManagement.activate') }}
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="emit('view')"
        >
          <svg class="w-4 h-4 me-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ $t('common.view') }}
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { UserType } from '@/services'

defineProps<{
  user: UserType
  open: boolean
  isRTL: boolean
}>()

const emit = defineEmits<{
  toggle: []
  edit: []
  view: []
  resetPassword: []
  toggleStatus: []
}>()
</script>
