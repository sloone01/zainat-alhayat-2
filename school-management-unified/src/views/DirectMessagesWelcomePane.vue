<template>
  <div class="flex min-h-0 flex-1 flex-col" :dir="isRTL ? 'rtl' : 'ltr'">
    <ChatThreadShell>
      <ScrollArea6>
        <div class="flex min-h-[18rem] flex-col items-center justify-center py-16 text-center">
          <p class="text-sm font-semibold text-fikr-ink">{{ $t('directMessages.mailboxEmptyTitle') }}</p>
          <p class="mt-1 text-xs text-fikr-ink-soft">{{ $t('directMessages.mailboxEmptyHint') }}</p>
        </div>
        <template #composer>
          <ChatComposer
            input-id="dm-welcome-composer"
            disabled
            :placeholder="$t('chatRooms.messagePlaceholder')"
            :send-label="$t('chatRooms.send')"
          />
        </template>
      </ScrollArea6>
    </ChatThreadShell>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatThreadShell from '@/components/ui/chat-thread-shell.vue'
import ScrollArea6 from '@/components/ui/scroll-area6.vue'
import ChatComposer from '@/components/ui/chat-composer.vue'

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
</script>
