<template>
  <div class="flex min-h-0 flex-1 flex-col bg-white" :dir="isRTL ? 'rtl' : 'ltr'">
    <header class="shrink-0 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-4 py-3 lg:px-5">
      <div class="flex flex-wrap items-center gap-3">
        <router-link
          to="/messages"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 lg:hidden"
          :aria-label="$t('directMessages.backToList')"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-sm font-semibold text-primary-800 ring-2 ring-white"
          aria-hidden="true"
        >
          {{ senderInitials(roomTitle) }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-primary-700/80">
            {{ $t('directMessages.roomEyebrow') }}
          </p>
          <h2 class="truncate text-base font-semibold text-gray-900 lg:text-lg">{{ roomTitle }}</h2>
          <p v-if="threadPeerRole" class="truncate text-xs text-gray-500">{{ threadPeerRole }}</p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span
            v-if="messages.length"
            class="hidden rounded-full bg-white px-2.5 py-1 font-medium tabular-nums text-gray-600 ring-1 ring-gray-200 sm:inline-flex"
          >
            {{ $t('directMessages.messagesCount', { count: messages.length }) }}
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
            :class="socketConnected ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="socketConnected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'"
            />
            {{ socketConnected ? $t('chatRooms.liveConnected') : $t('chatRooms.connecting') }}
          </span>
        </div>
      </div>
    </header>

    <div
      ref="scrollRef"
      class="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-white p-4 lg:p-5"
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
        v-if="!loadError && !messages.length"
        class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 px-6 py-14 text-center"
      >
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-sm font-semibold text-gray-900">{{ $t('directMessages.noMessages') }}</h3>
        <p class="mt-1 max-w-sm text-xs text-gray-500">{{ $t('directMessages.noMessagesHint') }}</p>
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
          class="flex flex-col gap-0.5"
          :class="item.message.userId === currentUserId ? 'items-end' : 'items-start'"
        >
        <!-- Structured official letter -->
        <div
          v-if="letterMeta(item.message)"
          :class="[
            'max-w-[min(92%,36rem)] rounded-2xl border px-4 py-3 text-sm shadow-sm',
            item.message.userId === currentUserId
              ? 'border-primary-400 bg-primary-50 text-gray-900'
              : 'border-primary-200 bg-white text-gray-900',
          ]"
        >
          <div class="mb-2 text-xs font-semibold text-primary-700">
            {{ messageLetterSenderLabel(item.message) }}
          </div>
          <h4 class="mb-2 font-semibold text-gray-900 leading-snug">{{ letterDisplay(item.message).subject }}</h4>
          <MessageLetterCardFrame
            v-if="letterDisplay(item.message).cardSrcdoc"
            :srcdoc="letterDisplay(item.message).cardSrcdoc"
            :locale="letterDisplay(item.message).locale"
            title="message-letter-chat"
          />
          <p v-else-if="letterDisplay(item.message).loading" class="text-xs text-gray-500">{{ $t('common.loading') }}…</p>
          <template v-if="letterMeta(item.message)!.requiresApproval">
            <div v-if="approvalPending(item.message)" class="mt-3 space-y-2">
              <template v-if="item.message.userId !== currentUserId">
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="inline-flex flex-1 min-w-[6rem] items-center justify-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50 sm:text-sm"
                    :disabled="approvalBusyId === item.message.id"
                    @click="resolveLetterApproval(item.message, 'approve')"
                  >
                    {{ $t('messageLetters.approveLetter') }}
                  </button>
                  <button
                    type="button"
                    class="inline-flex flex-1 min-w-[6rem] items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 sm:text-sm"
                    :disabled="approvalBusyId === item.message.id"
                    @click="resolveLetterApproval(item.message, 'reject')"
                  >
                    {{ $t('messageLetters.rejectLetter') }}
                  </button>
                </div>
              </template>
              <p v-else class="text-xs text-gray-500">{{ $t('messageLetters.awaitingRecipientApproval') }}</p>
            </div>
            <div v-else class="mt-3">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="approvalStatusClass(item.message)"
              >
                {{ approvalStatusLabel(item.message) }}
              </span>
            </div>
          </template>
          <p
            :class="[
              'mt-2 text-[10px]',
              item.message.userId === currentUserId ? 'text-primary-700/90' : 'text-gray-500',
            ]"
          >
            {{ formatTime(item.message.createdAt) }}
          </p>
        </div>

        <!-- Plain chat bubble -->
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
              'max-w-[min(85%,36rem)] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
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
        </div>
      </template>
    </div>

    <div v-if="typingLine" class="shrink-0 border-t border-gray-100 bg-white px-4 py-1.5 text-xs italic text-gray-500 lg:px-5">
      {{ typingLine }}
    </div>

    <form
      class="flex shrink-0 items-end gap-2 border-t border-gray-200 bg-white p-3 lg:p-4"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThrottleFn, useDebounceFn } from '@vueuse/core'
import { io, type Socket } from 'socket.io-client'
import { authService } from '@/services'
import { getSocketBaseUrl } from '@/config/public-config'
import { chatApiService, type ChatMessage } from '@/services/chat.service'
import MessageLetterCardFrame from '@/components/MessageLetterCardFrame.vue'
import { buildEmailCardPreviewSrcdoc } from '@/utils/email-template-card-preview'
import { translateMessageLetterSender } from '@/utils/message-letter-sender'

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const threadId = computed(() => String(route.params.threadId || ''))
const roomTitle = ref('')
/** Parent (or other peer) in this thread — needed when admin reads official letter threads. */
const threadPeerUserId = ref<string | null>(null)
const threadPeerRole = ref('')
const messages = ref<ChatMessage[]>([])
const loadError = ref('')
/** Send/socket failures must not hide history (previously reused loadError + v-else). */
const sendError = ref('')
const draft = ref('')
const sending = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
const socketConnected = ref(false)
const typingByUser = ref<Record<string, string>>({})

const currentUserId = computed(() => authService.getStoredUser()?.id || '')

const approvalBusyId = ref<string | null>(null)

type LetterMetaParsed = {
  letterId: string
  title: string
  previewText: string
  /** Legacy messages only; new sends use letterId + letterVariables and hydrate via API. */
  renderedBodyHtml?: string
  renderedLocale: 'en' | 'ar'
  requiresApproval: boolean
  approval?: { status?: string }
}

type LetterDisplayState = {
  subject: string
  cardSrcdoc: string
  locale: 'en' | 'ar'
  loading: boolean
}

const letterDisplayCache = ref<Record<string, LetterDisplayState>>({})
const letterHydrateInflight = new Set<string>()

function messageLetterSenderLabel(m: ChatMessage): string {
  return translateMessageLetterSender(m.senderName, t)
}

function letterMeta(m: ChatMessage): LetterMetaParsed | null {
  const raw = m.metadata
  if (!raw || typeof raw !== 'object' || raw['kind'] !== 'message_letter') return null
  const legacySubject = raw['renderedSubject'] ? String(raw['renderedSubject']) : ''
  const legacyPreview = raw['renderedPreview'] ? String(raw['renderedPreview']) : ''
  const legacyBodyHtml = raw['renderedBodyHtml'] ? String(raw['renderedBodyHtml']) : ''
  const loc = raw['renderedLocale'] === 'en' ? 'en' : 'ar'
  return {
    letterId: String(raw['letterId'] ?? ''),
    title: String(raw['title'] ?? '') || legacySubject,
    previewText: String(raw['previewText'] ?? '') || legacyPreview,
    renderedBodyHtml: legacyBodyHtml || undefined,
    renderedLocale: loc,
    requiresApproval: raw['requiresApproval'] === true,
    approval: raw['approval'] as { status?: string } | undefined,
  }
}

function letterDisplay(m: ChatMessage): LetterDisplayState {
  const meta = letterMeta(m)
  const cached = letterDisplayCache.value[m.id]
  if (cached) return cached
  const loc = meta?.renderedLocale ?? (locale.value === 'ar' ? 'ar' : 'en')
  const subject = meta?.title || '—'
  if (meta?.renderedBodyHtml) {
    return {
      subject,
      cardSrcdoc: buildEmailCardPreviewSrcdoc(meta.renderedBodyHtml, loc),
      locale: loc,
      loading: false,
    }
  }
  void hydrateLetterRender(m)
  return { subject, cardSrcdoc: '', locale: loc, loading: true }
}

async function hydrateLetterRender(m: ChatMessage) {
  if (!letterMeta(m) || letterDisplayCache.value[m.id] || letterHydrateInflight.has(m.id)) return
  letterHydrateInflight.add(m.id)
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  const isAdminObserver =
    authService.getStoredUser()?.role === 'admin' &&
    threadPeerRole.value === 'parent' &&
    m.userId !== currentUserId.value
  const recipientUserId =
    isAdminObserver && threadPeerUserId.value ? threadPeerUserId.value : undefined
  try {
    const rendered = await chatApiService.getRenderedMessageLetter(m.id, loc, recipientUserId)
    letterDisplayCache.value[m.id] = {
      subject: rendered.subject,
      cardSrcdoc: buildEmailCardPreviewSrcdoc(rendered.body_html, rendered.locale === 'en' ? 'en' : 'ar'),
      locale: rendered.locale === 'en' ? 'en' : 'ar',
      loading: false,
    }
  } catch {
    const meta = letterMeta(m)
    letterDisplayCache.value[m.id] = {
      subject: meta?.title || '—',
      cardSrcdoc: '',
      locale: loc,
      loading: false,
    }
  } finally {
    letterHydrateInflight.delete(m.id)
  }
}

async function hydrateAllLetterMessages(msgs: ChatMessage[]) {
  await Promise.all(msgs.filter((m) => letterMeta(m)).map((m) => hydrateLetterRender(m)))
}

function approvalPending(m: ChatMessage): boolean {
  const meta = letterMeta(m)
  if (!meta?.requiresApproval) return false
  const st = meta.approval?.status
  return !st || st === 'pending'
}

function approvalStatusLabel(m: ChatMessage): string {
  const st = letterMeta(m)?.approval?.status
  if (st === 'approved') return t('messageLetters.letterApproved')
  if (st === 'rejected') return t('messageLetters.letterRejected')
  return ''
}

function approvalStatusClass(m: ChatMessage): string {
  const st = letterMeta(m)?.approval?.status
  if (st === 'approved') return 'bg-emerald-100 text-emerald-900'
  if (st === 'rejected') return 'bg-red-100 text-red-900'
  return 'bg-gray-100 text-gray-800'
}

async function resolveLetterApproval(m: ChatMessage, decision: 'approve' | 'reject') {
  approvalBusyId.value = m.id
  sendError.value = ''
  try {
    const updated = await chatApiService.resolveMessageLetterApproval(m.id, decision)
    mergeMessages([updated])
    await scrollBottom()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const msg = ax.response?.data?.message
    const detail = Array.isArray(msg) ? msg.join(', ') : msg
    sendError.value = detail || (e as Error).message || t('messageLetters.approvalResolveError')
  } finally {
    approvalBusyId.value = null
  }
}

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
  if (!socket?.connected || !threadId.value) return
  socket.emit('dm:typing', { threadId: threadId.value, typing })
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
  if (!token || !threadId.value) return

  socket = io(getSocketBaseUrl(), {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1200,
  })

  const joinRoom = (label: string) => {
    const tid = threadId.value
    if (!socket?.connected || !tid) return
    socket.emit(
      'dm:join',
      { threadId: tid },
      (
        res: {
          ok?: boolean
          history?: ChatMessage[]
          peer?: { id: string; name: string; role: string }
          error?: string
        },
      ) => {
        if (res?.ok && Array.isArray(res.history)) {
          mergeMessages(res.history)
          scrollBottom()
          if (res.peer?.name) {
            roomTitle.value = res.peer.name
          }
        } else if (res && res.ok === false) {
          console.warn(`[dm] dm:join failed (${label}):`, res)
        }
      },
    )
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

  socket.on('dm:message', (msg: ChatMessage & { threadId?: string }) => {
    const incoming = String(msg?.groupId ?? msg?.threadId ?? '')
    const current = String(threadId.value ?? '')
    if (incoming && current && incoming !== current) return
    mergeMessages([msg])
    if (typingByUser.value[msg.userId]) {
      const { [msg.userId]: _, ...rest } = typingByUser.value
      typingByUser.value = rest
    }
    scrollBottom()
  })

  socket.on(
    'dm:typing',
    (payload: { groupId?: string; userId?: string; displayName?: string; typing?: boolean }) => {
      if (!payload?.groupId || payload.groupId !== threadId.value) return
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
    const peer = await chatApiService.getDirectThreadPeer(threadId.value)
    threadPeerUserId.value = peer.other_user_id
    threadPeerRole.value = peer.other_role || ''
    roomTitle.value = peer.other_name || t('directMessages.roomTitle')
    const initial = await chatApiService.listDirectMessages(threadId.value, 120)
    messages.value = Array.isArray(initial) ? initial : []
    await hydrateAllLetterMessages(messages.value)
    await scrollBottom()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    const detail = Array.isArray(m) ? m.join(', ') : m
    loadError.value = detail || (e as Error).message || t('directMessages.loadError')
  }
}

function send() {
  const text = draft.value.trim()
  if (!text || !socket?.connected || !threadId.value) return
  sending.value = true
  sendError.value = ''
  emitTyping(false)
  socket.emit(
    'dm:message',
    { threadId: threadId.value, text },
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
  () => threadId.value,
  async (id, prev) => {
    if (!id) return
    if (socket) {
      if (prev) socket.emit('dm:leave', { threadId: prev })
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }
    typingByUser.value = {}
    threadPeerUserId.value = null
    threadPeerRole.value = ''
    messages.value = []
    letterDisplayCache.value = {}
    letterHydrateInflight.clear()
    await loadInitial()
    connectSocket()
  },
  { immediate: true },
)

onUnmounted(() => {
  if (socket && threadId.value) {
    socket.emit('dm:leave', { threadId: threadId.value })
  }
  socket?.removeAllListeners()
  socket?.disconnect()
  socket = null
})
</script>
