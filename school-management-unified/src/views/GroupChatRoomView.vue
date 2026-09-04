<template>
  <DashboardLayout>
    <div
      class="mx-auto flex max-w-5xl flex-col gap-6 pb-6"
      :dir="isRTL ? 'rtl' : 'ltr'"
      style="min-height: calc(100vh - 6rem)"
    >
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-5 text-white shadow-xl sm:p-6">
        <div class="pointer-events-none absolute -end-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-28 w-28 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative flex flex-wrap items-start justify-between gap-4">
          <div class="flex min-w-0 items-start gap-3">
            <router-link
              to="/chat"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              :aria-label="$t('chatRooms.backToRooms')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
                {{ $t('chatRooms.roomEyebrow') }}
              </p>
              <h1 class="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
                {{ groupTitle }}
              </h1>
              <p v-if="groupMeta?.description" class="mt-1 line-clamp-2 max-w-xl text-sm text-slate-200/95">
                {{ groupMeta.description }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span
                  v-if="groupMeta?.studentCount != null"
                  class="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium ring-1 ring-white/20"
                >
                  {{ groupMeta.studentCount }} {{ $t('chatRooms.students') }}
                </span>
                <span
                  v-if="messages.length"
                  class="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium ring-1 ring-white/20"
                >
                  {{ $t('chatRooms.messagesCount', { count: messages.length }) }}
                </span>
              </div>
            </div>
          </div>
          <span
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            :class="socketConnected ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30' : 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30'"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="socketConnected ? 'animate-pulse bg-emerald-300' : 'bg-amber-300'"
            />
            {{ socketConnected ? $t('chatRooms.liveConnected') : $t('chatRooms.connecting') }}
          </span>
        </div>
      </section>

      <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-4 py-3 sm:px-5">
          <p class="text-xs font-medium text-gray-500">
            {{ $t('chatRooms.roomSubtitle') }}
          </p>
        </div>

        <div
          ref="scrollRef"
          class="min-h-[320px] flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-5"
        >
          <div v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
            {{ loadError }}
          </div>
          <div
            v-if="sendError"
            class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
          >
            {{ sendError }}
          </div>

          <div
            v-if="!loadError && !messages.length"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 px-6 py-14 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('chatRooms.noMessages') }}</h3>
            <p class="mt-1 max-w-sm text-xs text-gray-500">{{ $t('chatRooms.noMessagesHint') }}</p>
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

            <div
              v-else
              class="flex gap-2"
              :class="item.message.userId === currentUserId ? 'justify-end' : 'justify-start'"
            >
              <div
                v-if="item.message.userId !== currentUserId"
                class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700"
                aria-hidden="true"
              >
                {{ senderInitials(item.message.senderName) }}
              </div>
              <div
                :class="[
                  'max-w-[min(85%,34rem)] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                  item.message.userId === currentUserId
                    ? 'rounded-br-md bg-primary-600 text-white'
                    : 'rounded-bl-md border border-gray-200 bg-white text-gray-900',
                ]"
              >
                <div
                  v-if="item.message.userId !== currentUserId"
                  class="mb-1 text-xs font-semibold text-primary-700"
                >
                  {{ item.message.senderName }}
                </div>
                <p class="whitespace-pre-wrap break-words">{{ item.message.body }}</p>
                <p
                  :class="[
                    'mt-1.5 text-[10px]',
                    item.message.userId === currentUserId ? 'text-primary-100/90' : 'text-gray-500',
                  ]"
                >
                  {{ formatTime(item.message.createdAt) }}
                </p>
              </div>
            </div>
          </template>
        </div>

        <div v-if="typingLine" class="border-t border-gray-100 bg-white px-4 py-1.5 text-xs italic text-gray-500 sm:px-5">
          {{ typingLine }}
        </div>

        <form
          class="flex items-end gap-2 border-t border-gray-200 bg-white p-3 sm:p-4"
          @submit.prevent="send"
        >
          <textarea
            v-model="draft"
            rows="2"
            :placeholder="$t('chatRooms.messagePlaceholder')"
            class="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            @input="onDraftInput"
            @keydown.enter.exact.prevent="send"
          />
          <button
            type="submit"
            :disabled="!draft.trim() || sending || !socketConnected"
            class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {{ $t('chatRooms.send') }}
          </button>
        </form>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThrottleFn, useDebounceFn } from '@vueuse/core'
import { io, type Socket } from 'socket.io-client'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import { getSocketBaseUrl } from '@/config/public-config'
import { chatApiService, type ChatGroupSummary, type ChatMessage } from '@/services/chat.service'

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const groupId = computed(() => String(route.params.groupId || ''))
const groupTitle = ref('')
const groupMeta = ref<ChatGroupSummary | null>(null)
const messages = ref<ChatMessage[]>([])
const loadError = ref('')
const sendError = ref('')
const draft = ref('')
const sending = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
const socketConnected = ref(false)
const typingByUser = ref<Record<string, string>>({})

const currentUserId = computed(() => authService.getStoredUser()?.id || '')

type ChatItem =
  | { kind: 'separator'; label: string; key: string }
  | { kind: 'message'; message: ChatMessage; key: string }

const chatItems = computed<ChatItem[]>(() => {
  const items: ChatItem[] = []
  let lastDay = ''
  for (const m of messages.value) {
    const dayKey = new Date(m.createdAt).toDateString()
    if (dayKey !== lastDay) {
      lastDay = dayKey
      items.push({
        kind: 'separator',
        label: formatDateHeader(m.createdAt),
        key: `sep-${dayKey}`,
      })
    }
    items.push({ kind: 'message', message: m, key: m.id })
  }
  return items
})

let socket: Socket | null = null

const typingLine = computed(() => {
  const names = Object.values(typingByUser.value).filter(Boolean)
  if (!names.length) return ''
  if (names.length === 1) {
    return t('chatRooms.typingOne', { name: names[0] })
  }
  return t('chatRooms.typingMany', { names: names.join(', ') })
})

function senderInitials(name: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function formatDateHeader(iso: string) {
  try {
    const d = new Date(iso)
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
  } catch {
    return ''
  }
}

async function scrollBottom() {
  await nextTick()
  const el = scrollRef.value
  if (el) el.scrollTop = el.scrollHeight
}

function mergeMessages(incoming: ChatMessage[]) {
  const map = new Map<string, ChatMessage>()
  for (const m of messages.value) {
    if (m?.id) map.set(m.id, m)
  }
  for (const m of incoming) {
    if (m?.id) map.set(m.id, m)
  }
  messages.value = [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

function emitTyping(typing: boolean) {
  if (!socket?.connected || !groupId.value) return
  socket.emit('chat:typing', { groupId: groupId.value, typing })
}

const throttledTypingTrue = useThrottleFn(() => emitTyping(true), 900)
const debouncedTypingFalse = useDebounceFn(() => emitTyping(false), 1400)

function onDraftInput() {
  if (!draft.value.trim()) {
    emitTyping(false)
    return
  }
  throttledTypingTrue()
  debouncedTypingFalse()
}

function connectSocket() {
  const token = localStorage.getItem('auth_token')
  if (!token || !groupId.value) return

  socket = io(getSocketBaseUrl(), {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1200,
  })

  const joinRoom = (label: string) => {
    const gid = groupId.value
    if (!socket?.connected || !gid) return
    socket.emit('chat:join', { groupId: gid }, (res: { ok?: boolean; history?: ChatMessage[]; error?: string }) => {
      if (res?.ok && Array.isArray(res.history)) {
        mergeMessages(res.history)
        scrollBottom()
      } else if (res && res.ok === false) {
        console.warn(`[chat] chat:join failed (${label}):`, res)
      }
    })
  }

  socket.on('connect', () => {
    socketConnected.value = true
    sendError.value = ''
    joinRoom('connect')
    setTimeout(() => joinRoom('retry+50ms'), 50)
    setTimeout(() => joinRoom('retry+300ms'), 300)
  })

  socket.on('disconnect', () => {
    socketConnected.value = false
  })

  socket.on('connect_error', () => {
    socketConnected.value = false
  })

  socket.on('chat:message', (msg: ChatMessage) => {
    const incoming = String(msg?.groupId ?? '')
    const current = String(groupId.value ?? '')
    if (incoming && current && incoming !== current) return
    mergeMessages([msg])
    if (typingByUser.value[msg.userId]) {
      const { [msg.userId]: _, ...rest } = typingByUser.value
      typingByUser.value = rest
    }
    scrollBottom()
  })

  socket.on(
    'chat:typing',
    (payload: { groupId?: string; userId?: string; displayName?: string; typing?: boolean }) => {
      if (!payload?.groupId || payload.groupId !== groupId.value) return
      const uid = payload.userId
      if (!uid || uid === currentUserId.value) return
      if (payload.typing && payload.displayName) {
        typingByUser.value = { ...typingByUser.value, [uid]: payload.displayName }
      } else {
        const { [uid]: _removed, ...rest } = typingByUser.value
        typingByUser.value = rest
      }
    },
  )
}

async function loadInitial() {
  loadError.value = ''
  sendError.value = ''
  try {
    const list = await chatApiService.listGroups()
    const g = list.find((x) => x.id === groupId.value)
    groupMeta.value = g ?? null
    groupTitle.value = g?.name || t('chatRooms.roomTitleShort')
    const initial = await chatApiService.listMessages(groupId.value, 120)
    messages.value = Array.isArray(initial) ? initial : []
    await scrollBottom()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    const detail = Array.isArray(m) ? m.join(', ') : m
    loadError.value = detail || (e as Error).message || t('chatRooms.loadError')
  }
}

function send() {
  const text = draft.value.trim()
  if (!text || !socket?.connected || !groupId.value) return
  sending.value = true
  sendError.value = ''
  emitTyping(false)
  socket.emit(
    'chat:message',
    { groupId: groupId.value, text },
    (res: { ok?: boolean; message?: ChatMessage; error?: string }) => {
      sending.value = false
      if (res?.ok && res.message) {
        sendError.value = ''
        mergeMessages([res.message])
        scrollBottom()
      }
      if (res && res.ok === false && res.error) {
        sendError.value = res.error
      }
    },
  )
  draft.value = ''
}

watch(
  () => groupId.value,
  async (id, prev) => {
    if (!id) return
    if (socket) {
      if (prev) socket.emit('chat:leave', { groupId: prev })
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }
    typingByUser.value = {}
    messages.value = []
    groupMeta.value = null
    await loadInitial()
    connectSocket()
  },
  { immediate: true },
)

onUnmounted(() => {
  if (socket && groupId.value) {
    socket.emit('chat:leave', { groupId: groupId.value })
  }
  socket?.removeAllListeners()
  socket?.disconnect()
  socket = null
})
</script>
