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
        'absolute mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-20',
        isRTL ? 'left-0' : 'right-0'
      ]"
      role="menu"
      @click.stop
    >
      <div class="py-1">
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="emit('toggleDetails')"
        >
          {{ detailsExpanded ? $t('sessionAttendance.hideDetails') : $t('sessionAttendance.viewDetails') }}
        </button>
        <router-link
          :to="{ name: 'online-session-room', params: { id: sessionId } }"
          role="menuitem"
          class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="emit('navigate')"
        >
          {{ $t('sessionAttendance.openRoom') }}
        </router-link>
        <router-link
          :to="{ name: 'teacher-weekly-sessions' }"
          role="menuitem"
          class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="emit('navigate')"
        >
          {{ $t('sessionAttendance.weeklySessionsLink') }}
        </router-link>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
defineProps<{
  open: boolean
  isRTL: boolean
  sessionId: string
  detailsExpanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
  toggleDetails: []
  navigate: []
}>()
</script>
