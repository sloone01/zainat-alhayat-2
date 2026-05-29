<template>
  <div class="flex min-h-0 flex-1 flex-col bg-white" :dir="isRTL ? 'rtl' : 'ltr'">
    <header
      class="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:px-5"
    >
      <router-link
        to="/messages"
        class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 lg:hidden"
      >
        <span aria-hidden="true">←</span>
        {{ $t('directMessages.backToList') }}
      </router-link>
      <div class="min-w-0 flex-1">
        <h2 class="truncate text-base font-semibold text-gray-900 lg:text-lg">{{ roomTitle }}</h2>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
          :class="socketConnected ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'"
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="socketConnected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'"
          />
          {{ socketConnected ? $t('chatRooms.liveConnected') : $t('chatRooms.connecting') }}
        </span>
      </div>
    </header>

    <div
      ref="scrollRef"
      class="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50/80 p-4 lg:p-5"
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
      <div v-for="m in messages" :key="m.id" class="flex flex-col gap-0.5">
        <!-- Structured official letter -->
        <div
          v-if="letterMeta(m)"
          :class="[
            'max-w-[min(92%,36rem)] rounded-2xl border px-4 py-3 text-sm shadow-sm',
            m.userId === currentUserId
              ? 'self-end border-primary-400 bg-primary-50 text-gray-900'
              : 'self-start border-primary-200 bg-white text-gray-900',
          ]"
        >
          <div class="mb-2 text-xs font-semibold text-primary-700">
            {{ messageLetterSenderLabel(m) }}
          </div>
          <h4 class="mb-2 font-semibold text-gray-900 leading-snug">{{ letterDisplay(m).subject }}</h4>
          <MessageLetterCardFrame
            v-if="letterDisplay(m).cardSrcdoc"
            :srcdoc="letterDisplay(m).cardSrcdoc"
            :locale="letterDisplay(m).locale"
            title="message-letter-chat"
          />
          <p v-else-if="letterDisplay(m).loading" class="text-xs text-gray-500">{{ $t('common.loading') }}…</p>
          <template v-if="letterMeta(m)!.requiresApproval">
            <div v-if="approvalPending(m)" class="mt-3 space-y-2">
              <template v-if="m.userId !== currentUserId">
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="inline-flex flex-1 min-w-[6rem] items-center justify-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50 sm:text-sm"
                    :disabled="approvalBusyId === m.id"
                    @click="resolveLetterApproval(m, 'approve')"
                  >
                    {{ $t('messageLetters.approveLetter') }}
                  </button>
                  <button
                    type="button"
                    class="inline-flex flex-1 min-w-[6rem] items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 sm:text-sm"
                    :disabled="approvalBusyId === m.id"
                    @click="resolveLetterApproval(m, 'reject')"
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
                :class="approvalStatusClass(m)"
              >
                {{ approvalStatusLabel(m) }}
              </span>
            </div>
          </template>
          <p
            :class="[
              'mt-2 text-[10px]',
              m.userId === currentUserId ? 'text-primary-700/90' : 'text-gray-500',
            ]"
          >
            {{ formatTime(m.createdAt) }}
          </p>
        </div>

        <!-- Plain chat bubble -->
        <div
          v-else
          :class="[
            'max-w-[min(85%,36rem)] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
            m.userId === currentUserId ? 'self-end' : 'self-start',
            m.userId === currentUserId
              ? 'rounded-br-md bg-primary-600 text-white'
              : 'rounded-bl-md border border-gray-200 bg-white text-gray-900',
          ]"
        >
          <div
            v-if="m.userId !== currentUserId"
            class="mb-1 text-xs font-semibold text-primary-700"
          >
            {{ m.senderName }}
          </div>
          <p class="whitespace-pre-wrap break-words">{{ m.body }}</p>
          <p
            :class="[
              'mt-1 text-[10px] opacity-80',
              m.userId === currentUserId ? 'text-primary-100' : 'text-gray-500',
            ]"
          >
            {{ formatTime(m.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="typingLine" class="shrink-0 px-4 py-1 text-xs italic text-gray-500 lg:px-5">
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
        class="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
        @input="onDraftInput"
        @keydown.enter.exact.prevent="send"
      />
      <button
        type="submit"
        :disabled="!draft.trim() || sending || !socketConnected"
        class="shrink-0 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
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
