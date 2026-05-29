<template>
  <DashboardLayout>
    <div class="flex flex-col gap-4 max-w-4xl mx-auto" :dir="isRTL ? 'rtl' : 'ltr'" style="min-height: calc(100vh - 8rem)">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <router-link
            to="/chat"
            class="shrink-0 text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            ← {{ $t('chatRooms.backToRooms') }}
          </router-link>
          <div class="h-4 w-px bg-gray-200 hidden sm:block" />
          <h1 class="text-lg font-semibold text-gray-900 truncate">{{ groupTitle }}</h1>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
            :class="socketConnected ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'"
            />
            {{ socketConnected ? $t('chatRooms.liveConnected') : $t('chatRooms.connecting') }}
          </span>
        </div>
      </div>

      <div
        ref="scrollRef"
        class="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3 min-h-[320px] max-h-[60vh]"
      >
        <div v-if="loadError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {{ loadError }}
        </div>
        <div
          v-if="sendError"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          {{ sendError }}
        </div>
        <div
          v-for="m in messages"
          :key="m.id"
          class="flex flex-col gap-0.5"
        >
          <div
            :class="[
              'max-w-[85%] rounded-2xl px-4 py-2 shadow-sm text-sm',
              m.userId === currentUserId ? 'self-end' : 'self-start',
              m.userId === currentUserId
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md',
            ]"
          >
            <div
              v-if="m.userId !== currentUserId"
              class="text-xs font-semibold text-primary-700 mb-1"
            >
              {{ m.senderName }}
            </div>
            <p class="whitespace-pre-wrap break-words">{{ m.body }}</p>
            <p
              :class="[
                'text-[10px] mt-1 opacity-80',
                m.userId === currentUserId ? 'text-primary-100' : 'text-gray-500',
              ]"
            >
              {{ formatTime(m.createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="typingLine" class="text-xs text-gray-500 italic px-1 min-h-[1.25rem]">
        {{ typingLine }}
      </div>

      <form class="flex gap-2 items-end" @submit.prevent="send">
        <textarea
          v-model="draft"
          rows="2"
          :placeholder="$t('chatRooms.messagePlaceholder')"
          class="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @input="onDraftInput"
          @keydown.enter.exact.prevent="send"
        />
        <button
          type="submit"
          :disabled="!draft.trim() || sending || !socketConnected"
          class="shrink-0 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ $t('chatRooms.send') }}
        </button>
      </form>
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
import { chatApiService, type ChatMessage } from '@/services/chat.service'

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const groupId = computed(() => String(route.params.groupId || ''))
const groupTitle = ref('')
const messages = ref<ChatMessage[]>([])
const loadError = ref('')
const sendError = ref('')
const draft = ref('')
const sending = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
const socketConnected = ref(false)
const typingByUser = ref<Record<string, string>>({})

const currentUserId = computed(() => authService.getStoredUser()?.id || '')

let socket: Socket | null = null

const typingLine = computed(() => {
  const names = Object.values(typingByUser.value).filter(Boolean)
  if (!names.length) return ''
  if (names.length === 1) {
    return t('chatRooms.typingOne', { name: names[0] })
  }
  return t('chatRooms.typingMany', { names: names.join(', ') })
})

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
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
