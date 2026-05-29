<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h1 class="text-xl font-bold text-gray-900">{{ $t('messageLetters.approvalInboxTitle') }}</h1>
        <p class="mt-1 text-sm text-gray-600">
          {{ isAdmin ? $t('messageLetters.approvalInboxSubtitleAdmin') : $t('messageLetters.approvalInboxSubtitle') }}
        </p>
        <p v-if="pendingCount > 0" class="mt-2 text-xs font-medium text-amber-800">
          {{ $t('messageLetters.approvalInboxPendingCount', { count: pendingCount }) }}
        </p>
      </div>

      <div v-if="flashError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {{ flashError }}
      </div>

      <div v-if="loading" class="rounded-xl border border-gray-200 bg-white py-16 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <p class="mt-3 text-sm text-gray-600">{{ $t('common.loading') }}…</p>
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <!-- Desktop table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('messageLetters.colTitle') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                  {{ isAdmin ? $t('messageLetters.colParentStudent') : $t('messageLetters.colFrom') }}
                </th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colSentAt') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colActivity') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colApprovalStatus') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colApprovalDate') }}</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!rows.length">
                <td colspan="7" class="px-4 py-12 text-center text-gray-500">{{ $t('messageLetters.approvalInboxEmpty') }}</td>
              </tr>
              <tr
                v-for="row in rows"
                :key="row.message_id"
                class="border-t border-gray-200 align-top hover:bg-gray-50/80"
              >
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900" :title="row.title">{{ truncateTitle(row.title) }}</p>
                </td>
                <td class="px-4 py-3 text-gray-800">
                  <p class="whitespace-nowrap">{{ row.party_name }}</p>
                  <p v-if="row.students_label" class="mt-0.5 text-xs text-gray-500">{{ row.students_label }}</p>
                </td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ row.sent_at ? formatDate(row.sent_at) : '—' }}</td>
                <td class="px-4 py-3 text-gray-700">{{ row.activity_title || $t('messageLetters.noLinkedActivity') }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    :class="approvalStatusClass(row.approval_status)"
                  >
                    {{ approvalStatusLabel(row.approval_status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {{ row.approval_resolved_at ? formatDate(row.approval_resolved_at) : '—' }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-center">
                    <ApprovalInboxActionsDropdown
                      :open="activeMenuId === row.message_id"
                      :isRTL="isRTL"
                      :can-approve="rowCanApprove(row)"
                      :show-view-letter="!!row.message_id"
                      :thread-id="row.thread_id"
                      :busy="busyId === row.message_id"
                      @toggle="toggleMenu(row.message_id)"
                      @view-letter="onViewLetter(row)"
                      @approve="resolve(row, 'approve')"
                      @reject="resolve(row, 'reject')"
                      @navigate="closeMenu"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="md:hidden p-4 space-y-3">
          <p
            v-if="!rows.length"
            class="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 px-4 py-10 text-center text-sm text-gray-500"
          >
            {{ $t('messageLetters.approvalInboxEmpty') }}
          </p>
          <article
            v-for="row in rows"
            :key="'approval-card-' + row.message_id"
            class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
          >
            <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <h3 class="text-base font-semibold leading-snug text-gray-900" :title="row.title">
                    {{ row.title }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-600">{{ row.party_name }}</p>
                  <p v-if="row.students_label" class="mt-0.5 text-xs text-gray-500">{{ row.students_label }}</p>
                  <div class="mt-2">
                    <span
                      class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      :class="approvalStatusClass(row.approval_status)"
                    >
                      {{ approvalStatusLabel(row.approval_status) }}
                    </span>
                  </div>
                </div>
                <ApprovalInboxActionsDropdown
                  :open="activeMenuId === row.message_id"
                  :isRTL="isRTL"
                  :can-approve="rowCanApprove(row)"
                  :show-view-letter="!!row.message_id"
                  :thread-id="row.thread_id"
                  :busy="busyId === row.message_id"
                  @toggle="toggleMenu(row.message_id)"
                  @view-letter="onViewLetter(row)"
                  @approve="resolve(row, 'approve')"
                  @reject="resolve(row, 'reject')"
                  @navigate="closeMenu"
                />
              </div>
            </div>
            <dl class="grid grid-cols-2 gap-2 px-4 py-3 text-sm">
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('messageLetters.colSentAt') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800">{{ row.sent_at ? formatDate(row.sent_at) : '—' }}</dd>
              </div>
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('messageLetters.colApprovalDate') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800">
                  {{ row.approval_resolved_at ? formatDate(row.approval_resolved_at) : '—' }}
                </dd>
              </div>
              <div class="col-span-2 rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('messageLetters.colActivity') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800">{{ row.activity_title || $t('messageLetters.noLinkedActivity') }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </div>

    <MessageLetterPreviewDialog
      v-model:open="previewOpen"
      :message-id="previewMessageId"
      :recipient-user-id="previewRecipientUserId"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MessageLetterPreviewDialog from '@/components/MessageLetterPreviewDialog.vue'
import ApprovalInboxActionsDropdown from '@/components/ApprovalInboxActionsDropdown.vue'
import { authService } from '@/services'
import {
  chatApiService,
  type MessageLetterApprovalStatus as ChatApprovalStatus,
} from '@/services/chat.service'
import {
  messageLetterService,
  type MessageLetterApprovalRecipientRow,
  type MessageLetterApprovalStatus,
} from '@/services/message-letter.service'

type InboxRow = {
  message_id: string
  thread_id: string | null
  recipient_user_id: string | null
  sender_user_id: string | null
  title: string
  preview_text: string
  sent_at: string | null
  party_name: string
  students_label: string | null
  activity_title: string | null
  approval_status: MessageLetterApprovalStatus | ChatApprovalStatus
  approval_resolved_at: string | null
  can_approve: boolean
}

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const currentUserId = computed(() => authService.getStoredUser()?.id ?? '')
const isAdmin = computed(() => authService.getStoredUser()?.role === 'admin')
const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const rows = ref<InboxRow[]>([])
const loading = ref(true)
const flashError = ref('')
const busyId = ref<string | null>(null)
const activeMenuId = ref<string | null>(null)
const previewOpen = ref(false)
const previewMessageId = ref<string | null>(null)
const previewRecipientUserId = ref<string | null>(null)

const pendingCount = computed(() => rows.value.filter((r) => r.can_approve).length)

function rowCanApprove(row: InboxRow): boolean {
  if (isAdmin.value) return false
  if (!row.can_approve) return false
  if (row.sender_user_id && row.sender_user_id === currentUserId.value) return false
  return true
}

function toggleMenu(messageId: string) {
  activeMenuId.value = activeMenuId.value === messageId ? null : messageId
}

function closeMenu() {
  activeMenuId.value = null
}

function onViewLetter(row: InboxRow) {
  closeMenu()
  openLetterPreview(row)
}

function openLetterPreview(row: InboxRow) {
  previewMessageId.value = row.message_id
  previewRecipientUserId.value = row.recipient_user_id
  previewOpen.value = true
}

function truncateTitle(title: string, maxLen = 48): string {
  const s = (title || '').trim()
  if (!s) return '—'
  if (s.length <= maxLen) return s
  return `${s.slice(0, maxLen)}…`
}

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function approvalStatusLabel(status: InboxRow['approval_status']): string {
  if (status === 'approved') return t('messageLetters.letterApproved')
  if (status === 'rejected') return t('messageLetters.letterRejected')
  if (status === 'not_sent') return t('messageLetters.approvalStatusNotSent')
  return t('messageLetters.approvalStatusPending')
}

function approvalStatusClass(status: InboxRow['approval_status']): string {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-800'
  if (status === 'rejected') return 'bg-red-100 text-red-800'
  if (status === 'not_sent') return 'bg-slate-100 text-slate-700'
  return 'bg-amber-100 text-amber-900'
}

function mapAdminRow(r: MessageLetterApprovalRecipientRow): InboxRow {
  const students =
    r.students.length > 0 ? r.students.map((s) => s.name).join(', ') : null
  return {
    message_id: r.message_id,
    thread_id: r.thread_id,
    recipient_user_id: r.recipient_user_id,
    sender_user_id: null,
    title: r.letter_title,
    preview_text: '',
    sent_at: r.sent_at,
    party_name: r.recipient_name,
    students_label: students,
    activity_title: r.activity_title,
    approval_status: r.approval_status,
    approval_resolved_at: r.approval_resolved_at,
    can_approve: false,
  }
}

function mapParentRows(
  list: Awaited<ReturnType<typeof chatApiService.listApprovalInbox>>,
): InboxRow[] {
  const uid = currentUserId.value
  return list.map((r) => ({
    message_id: r.message_id,
    thread_id: r.thread_id,
    recipient_user_id: uid,
    sender_user_id: r.sender_user_id,
    title: r.title,
    preview_text: r.preview_text,
    sent_at: r.sent_at,
    party_name: r.sender_name || t('messageLetters.systemAdminSender'),
    students_label: null,
    activity_title: r.activity_title,
    approval_status: r.approval_status,
    approval_resolved_at: r.approval_resolved_at,
    can_approve: r.can_approve && r.sender_user_id !== uid,
  }))
}

async function load() {
  loading.value = true
  flashError.value = ''
  closeMenu()
  try {
    const loc = locale.value === 'ar' ? 'ar' : 'en'
    if (isAdmin.value) {
      const list = await messageLetterService.listApprovalRecipients(schoolId.value, { locale: loc })
      rows.value = list
        .map(mapAdminRow)
        .sort((a, b) => {
          const rank = (s: InboxRow['approval_status']) => {
            if (s === 'pending') return 0
            if (s === 'not_sent') return 1
            return 2
          }
          const d = rank(a.approval_status) - rank(b.approval_status)
          if (d !== 0) return d
          return (b.sent_at ?? '').localeCompare(a.sent_at ?? '')
        })
    } else {
      rows.value = mapParentRows(await chatApiService.listApprovalInbox(loc))
    }
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('messageLetters.approvalInboxLoadError')
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function resolve(row: InboxRow, decision: 'approve' | 'reject') {
  if (!rowCanApprove(row)) return
  busyId.value = row.message_id
  flashError.value = ''
  closeMenu()
  try {
    await chatApiService.resolveMessageLetterApproval(row.message_id, decision)
    await load()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const msg = ax.response?.data?.message
    const detail = Array.isArray(msg) ? msg.join(', ') : msg
    flashError.value = detail || (e as Error).message || t('messageLetters.approvalResolveError')
  } finally {
    busyId.value = null
  }
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void load()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
