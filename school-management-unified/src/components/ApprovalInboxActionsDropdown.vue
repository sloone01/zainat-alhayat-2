<template>
  <RowActionsMenu :open="open" placement="up" @toggle="emit('toggle')">
    <RowActionsItem v-if="showViewLetter" icon="view" @click="emit('viewLetter')">
      {{ $t('messageLetters.viewLetter') }}
    </RowActionsItem>
    <RowActionsItem
      v-if="canApprove"
      icon="activate"
      @click="emit('approve')"
    >
      {{ $t('messageLetters.approveLetter') }}
    </RowActionsItem>
    <RowActionsItem
      v-if="canApprove"
      icon="delete"
      danger
      @click="emit('reject')"
    >
      {{ $t('messageLetters.rejectLetter') }}
    </RowActionsItem>
    <router-link
      v-if="groupRoomId || threadId"
      :to="groupRoomId ? `/chat/${groupRoomId}` : `/messages/${threadId}`"
      role="menuitem"
      class="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist"
      @click="emit('navigate')"
    >
      <svg class="me-2.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {{ $t('messageLetters.viewInChat') }}
    </router-link>
  </RowActionsMenu>
</template>

<script setup lang="ts">
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'

defineProps<{
  open: boolean
  isRTL?: boolean
  canApprove: boolean
  showViewLetter: boolean
  threadId: string | null
  groupRoomId?: string | null
  busy?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  viewLetter: []
  approve: []
  reject: []
  navigate: []
}>()
</script>
