<template>
  <div class="flex min-h-0 flex-1 flex-col" :dir="isRTL ? 'rtl' : 'ltr'">
    <ChatThreadShell>
      <header class="shrink-0 border-b border-gray-100 bg-white px-3 py-2 lg:px-4">
        <div class="flex items-center gap-2.5">
          <router-link
            :to="backTo"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 lg:hidden"
            :aria-label="$t('directMessages.backToList')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-xs font-semibold text-primary-800 ring-2 ring-white"
            aria-hidden="true"
          >
            {{ initials(roomTitle) }}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-sm font-semibold text-gray-900 lg:text-base">{{ roomTitle }}</h2>
          </div>
        </div>
      </header>

      <ScrollArea6 ref="threadFrame">
        <div v-if="loadError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {{ loadError }}
        </div>
        <div
          v-if="loading"
          class="flex min-h-[12rem] items-center justify-center text-sm text-fikr-ink-soft"
        >
          {{ $t('common.loading') }}
        </div>
        <div
          v-else-if="!loadError && !messages.length"
          class="flex min-h-[12rem] flex-col items-center justify-center py-14 text-center"
        >
          <h3 class="text-sm font-semibold text-fikr-ink">{{ $t('chatAudit.noMessages') }}</h3>
        </div>

        <template v-for="item in chatItems" :key="item.key">
          <div
            v-if="item.kind === 'separator'"
            class="flex items-center gap-3 py-1"
          >
            <div class="h-px flex-1 bg-gray-200" />
            <span class="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-gray-200">
              {{ item.label }}
            </span>
            <div class="h-px flex-1 bg-gray-200" />
          </div>

          <ChatMessageRow
            v-else
            :is-own="item.message.userId === ownUserId"
            :sender-name="item.message.senderName"
            :timestamp="formatTime(item.message.createdAt)"
            :initials="initials(item.message.senderName)"
          >
            <p class="whitespace-pre-wrap break-words">{{ item.message.body }}</p>
          </ChatMessageRow>
        </template>

        <template #composer>
          <ChatComposer
            input-id="chat-review-composer"
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
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ChatThreadShell from '@/components/ui/chat-thread-shell.vue'
import ScrollArea6 from '@/components/ui/scroll-area6.vue'
import ChatComposer from '@/components/ui/chat-composer.vue'
import ChatMessageRow from '@/components/ui/chat-message-row.vue'
import { chatApiService, chatReviewHitsKey, type ChatReviewMessage } from '@/services/chat.service'

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const hits = inject(chatReviewHitsKey, ref([]))

const messages = ref<ChatReviewMessage[]>([])
const loading = ref(false)
const loadError = ref('')
const threadFrame = ref<{ scrollToBottom: () => Promise<void> } | null>(null)

const kind = computed(() => {
  if (route.path.includes('/admin/chat-review/single/')) return 'direct'
  const raw = String(route.params.kind || '')
  return raw === 'class' || raw === 'room' ? raw : ''
})
const conversationId = computed(() => String(route.params.id || ''))
const backTo = computed(() =>
  kind.value === 'direct' ? '/admin/chat-review/single' : '/admin/chat-review/groups',
)

const roomTitle = computed(() => {
  const hit = hits.value.find((row) => row.id === conversationId.value && row.kind === kind.value)
  return hit?.title || t('chatAudit.title')
})

const ownUserId = computed(() => {
  const ids: string[] = []
  for (const message of messages.value) {
    if (message.userId && !ids.includes(message.userId)) ids.push(message.userId)
  }
  return ids.length === 2 ? ids[1] : ''
})

type ChatItem =
  | { kind: 'separator'; label: string; key: string }
  | { kind: 'message'; message: ChatReviewMessage; key: string }

const chatItems = computed<ChatItem[]>(() => {
  const items: ChatItem[] = []
  let lastDay = ''
  for (const message of messages.value) {
    const dayKey = new Date(message.createdAt).toDateString()
    if (dayKey !== lastDay) {
      lastDay = dayKey
      items.push({
        kind: 'separator',
        label: formatDateHeader(message.createdAt),
        key: `sep-${dayKey}`,
      })
    }
    items.push({ kind: 'message', message, key: message.id })
  }
  return items
})

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateHeader(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return t('chatRooms.today')
  if (d.toDateString() === yesterday.toDateString()) return t('chatRooms.yesterday')
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

async function load() {
  if (!kind.value || !conversationId.value) return
  loading.value = true
  loadError.value = ''
  messages.value = []
  try {
    messages.value = await chatApiService.adminReviewMessages(kind.value, conversationId.value)
    await threadFrame.value?.scrollToBottom()
  } catch {
    loadError.value = t('chatRooms.loadError')
  } finally {
    loading.value = false
  }
}

watch([kind, conversationId], () => {
  void load()
}, { immediate: true })
</script>
