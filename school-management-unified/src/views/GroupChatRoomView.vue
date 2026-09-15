<template>
  <div class="flex min-h-0 flex-1 flex-col" :dir="isRTL ? 'rtl' : 'ltr'">
    <ChatThreadShell>
    <header class="shrink-0 border-b border-gray-100 bg-white px-3 py-2 lg:px-4">
      <div class="flex items-center gap-2.5">
        <router-link
          to="/chat"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 lg:hidden"
          :aria-label="$t('chatRooms.backToRooms')"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-800 ring-2 ring-white"
          aria-hidden="true"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-sm font-semibold text-gray-900 lg:text-base">{{ groupTitle }}</h2>
          <p v-if="kindCaption" class="truncate text-[11px] text-gray-500">{{ kindCaption }}</p>
        </div>
        <span
          class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          :class="socketConnected ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'"
          :title="socketConnected ? $t('chatRooms.liveConnected') : $t('chatRooms.connecting')"
          :aria-label="socketConnected ? $t('chatRooms.liveConnected') : $t('chatRooms.connecting')"
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="socketConnected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'"
          />
        </span>
      </div>
    </header>

    <ScrollArea6 ref="threadFrame">
      <div v-if="loadError" class="fk-alert fk-alert--error">
        {{ loadError }}
      </div>
      <div
        v-if="sendError"
        role="alert"
        class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
      >
        {{ sendError }}
      </div>

      <div
        v-if="!loadError && !messages.length"
        class="flex min-h-[12rem] flex-col items-center justify-center py-14 text-center"
      >
        <h3 class="text-sm font-semibold text-fikr-ink">{{ $t('chatRooms.noMessages') }}</h3>
        <p class="mt-1 max-w-sm text-xs text-fikr-ink-soft">{{ $t('chatRooms.noMessagesHint') }}</p>
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
          :is-own="item.message.userId === currentUserId"
          :sender-name="item.message.userId === currentUserId ? $t('chatRooms.you') : item.message.senderName"
          :timestamp="formatTime(item.message.createdAt)"
          :initials="item.message.userId === currentUserId ? ownInitials : senderInitials(item.message.senderName)"
        >
          <template v-if="letterMeta(item.message)" #raw>
            <div
              :class="[
                'rounded-lg border px-4 py-3 text-sm',
                item.message.userId === currentUserId
                  ? 'border-primary-400 bg-primary-50 text-gray-900'
                  : 'border-primary-200 bg-white text-gray-900',
              ]"
            >
              <div class="mb-2 text-xs font-semibold text-primary-700">
                {{ messageLetterSenderLabel(item.message) }}
              </div>
              <h4 class="mb-2 font-semibold leading-snug text-gray-900">{{ letterDisplay(item.message).subject }}</h4>
              <MessageLetterCardFrame
                v-if="letterDisplay(item.message).cardSrcdoc"
                :srcdoc="letterDisplay(item.message).cardSrcdoc"
                :locale="letterDisplay(item.message).locale"
                title="message-letter-chat"
              />
              <p v-else-if="letterDisplay(item.message).loading" class="text-xs text-gray-500">{{ $t('common.loading') }}…</p>
              <template v-if="letterMeta(item.message)!.requiresApproval">
                <div v-if="approvalPending(item.message)" class="mt-3 space-y-2">
                  <template v-if="item.message.userId !== currentUserId && canActOnLetter(item.message)">
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="inline-flex min-w-[6rem] flex-1 cursor-pointer items-center justify-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-primary-700 disabled:opacity-50 sm:text-sm"
                        :disabled="approvalBusyId === item.message.id"
                        @click="resolveLetterApproval(item.message, 'approve')"
                      >
                        {{ $t('messageLetters.approveLetter') }}
                      </button>
                      <button
                        type="button"
                        class="inline-flex min-w-[6rem] flex-1 cursor-pointer items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors duration-200 hover:bg-red-50 disabled:opacity-50 sm:text-sm"
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
            </div>
          </template>
          <p v-if="!letterMeta(item.message)" class="whitespace-pre-wrap break-words">{{ item.message.body }}</p>
        </ChatMessageRow>
      </template>

      <template #typing>
        <div v-if="typingLine" class="shrink-0 border-t border-gray-100 bg-white px-4 py-1.5 text-xs italic text-gray-500">
          {{ typingLine }}
        </div>
      </template>

      <template v-if="canCompose" #composer>
        <ChatComposer
          v-model="draft"
          multiline
          input-id="gc-room-composer"
          :placeholder="$t('chatRooms.messagePlaceholder')"
          :send-label="$t('chatRooms.send')"
          :disabled="!socketConnected"
          :submitting="sending"
          @input="onDraftInput"
          @submit="send"
        />
      </template>
    </ScrollArea6>
    </ChatThreadShell>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThrottleFn, useDebounceFn } from '@vueuse/core'
import { io, type Socket } from 'socket.io-client'
import { authService } from '@/services'
import { getSocketBaseUrl } from '@/config/public-config'
import {
  chatApiService,
  clearGroupChatUnreadKey,
  type ChatGroupSummary,
  type ChatMessage,
} from '@/services/chat.service'
import ChatThreadShell from '@/components/ui/chat-thread-shell.vue'
import ScrollArea6 from '@/components/ui/scroll-area6.vue'
import ChatComposer from '@/components/ui/chat-composer.vue'
import ChatMessageRow from '@/components/ui/chat-message-row.vue'
import MessageLetterCardFrame from '@/components/MessageLetterCardFrame.vue'
import { buildEmailCardPreviewSrcdoc } from '@/utils/email-template-card-preview'
import { translateMessageLetterSender } from '@/utils/message-letter-sender'

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const clearUnread = inject(clearGroupChatUnreadKey, () => undefined)

const groupId = computed(() => String(route.params.groupId || ''))
const groupTitle = ref('')
const groupMeta = ref<ChatGroupSummary | null>(null)
const messages = ref<ChatMessage[]>([])
const loadError = ref('')
const sendError = ref('')
const draft = ref('')
const sending = ref(false)
const threadFrame = ref<{ scrollToBottom: () => Promise<void> } | null>(null)
const socketConnected = ref(false)
const typingByUser = ref<Record<string, string>>({})
const approvalBusyId = ref<string | null>(null)

const currentUserId = computed(() => authService.getStoredUser()?.id || '')
const ownInitials = computed(() => {
  const u = authService.getStoredUser()
  const name = `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || u?.email || ''
  return senderInitials(name)
})
const isParent = computed(() => {
  const u = authService.getStoredUser()
  return u?.role === 'parent' || u?.user_type === 'parent'
})
const isApprovalsRoom = computed(() => groupMeta.value?.kind === 'approvals')
const canCompose = computed(() => !(isApprovalsRoom.value && isParent.value))

const kindCaption = computed(() => {
  const kind = groupMeta.value?.kind
  if (kind === 'approvals') return t('chatRooms.kindApprovals')
  if (kind === 'bus') return t('chatRooms.kindBus')
  if (kind === 'adhoc') return t('chatRooms.kindAdhoc')
  if (kind === 'class' || groupMeta.value) return t('chatRooms.kindClass')
  return ''
})

type LetterMetaParsed = {
  letterId: string
  title: string
  previewText: string
  renderedBodyHtml?: string
  renderedLocale: 'en' | 'ar'
  requiresApproval: boolean
  approval?: { status?: string }
  targetUserId?: string
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
    targetUserId: raw['targetUserId'] ? String(raw['targetUserId']) : undefined,
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
  const meta = letterMeta(m)
  const recipientUserId =
    authService.getStoredUser()?.role === 'admin' && meta?.targetUserId
      ? meta.targetUserId
      : undefined
  try {
    const rendered = await chatApiService.getRenderedMessageLetter(m.id, loc, recipientUserId)
    letterDisplayCache.value[m.id] = {
      subject: rendered.subject,
      cardSrcdoc: buildEmailCardPreviewSrcdoc(rendered.body_html, rendered.locale === 'en' ? 'en' : 'ar'),
      locale: rendered.locale === 'en' ? 'en' : 'ar',
      loading: false,
    }
  } catch {
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

function canActOnLetter(m: ChatMessage): boolean {
  const meta = letterMeta(m)
  if (!meta?.requiresApproval) return false
  if (!isParent.value) return false
  if (meta.targetUserId && meta.targetUserId !== currentUserId.value) return false
  return true
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
    delete letterDisplayCache.value[m.id]
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const detailRaw = ax.response?.data?.message
    const detail = Array.isArray(detailRaw) ? detailRaw.join(', ') : detailRaw
    sendError.value = detail || (e as Error).message || t('messageLetters.approvalResolveError')
  } finally {
    approvalBusyId.value = null
  }
}

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
  await threadFrame.value?.scrollToBottom()
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

const markReadWhileViewing = useDebounceFn(() => {
  const id = groupId.value
  if (!id) return
  clearUnread(id)
  void chatApiService.markGroupRead(id).catch(() => undefined)
}, 800)

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
    if (isApprovalsRoom.value && isParent.value) {
      const meta = letterMeta(msg)
      if (meta?.targetUserId && meta.targetUserId !== currentUserId.value) return
    }
    mergeMessages([msg])
    if (typingByUser.value[msg.userId]) {
      const { [msg.userId]: _, ...rest } = typingByUser.value
      typingByUser.value = rest
    }
    scrollBottom()
    markReadWhileViewing()
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
    groupTitle.value =
      g?.kind === 'approvals'
        ? t('chatRooms.approvalsRoomName')
        : g?.name || t('chatRooms.roomTitleShort')
    const initial = await chatApiService.listMessages(groupId.value, 120)
    messages.value = Array.isArray(initial) ? initial : []
    letterDisplayCache.value = {}
    clearUnread(groupId.value)
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
