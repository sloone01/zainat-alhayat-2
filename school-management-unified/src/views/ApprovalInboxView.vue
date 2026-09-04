<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('messageLetters.approvalInboxTitle') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">
            {{ isAdmin ? $t('messageLetters.approvalInboxSubtitleAdmin') : $t('messageLetters.approvalInboxSubtitle') }}
          </p>
          <p
            v-if="pendingCount > 0"
            class="mt-3 inline-flex items-center rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-300/40"
          >
            {{ $t('messageLetters.approvalInboxPendingCount', { count: pendingCount }) }}
          </p>
        </div>
      </section>

      <div v-if="flashError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        {{ flashError }}
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('messageLetters.approvalInboxListHeading') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('messageLetters.approvalInboxCount', { count: rows.length }) }}
              </p>
            </div>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="rows.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="row in rows"
                :key="'approval-card-' + row.message_id"
                class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 opacity-80"
                  :class="approvalBarClass(row.approval_status)"
                  aria-hidden="true"
                />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <h3 class="font-semibold leading-snug text-gray-900" :title="row.title">{{ row.title }}</h3>
                      <p class="mt-1 text-sm text-gray-600">{{ row.party_name }}</p>
                      <p v-if="row.students_label" class="mt-0.5 text-xs text-gray-500">{{ row.students_label }}</p>
                      <div class="mt-3">
                        <span
                          class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
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
                  <dl class="mt-4 grid grid-cols-2 gap-2 text-sm">
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
                      <dd class="mt-0.5 text-sm font-medium text-gray-800">
                        {{ row.activity_title || $t('messageLetters.noLinkedActivity') }}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('messageLetters.colTitle') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">
                      {{ isAdmin ? $t('messageLetters.colParentStudent') : $t('messageLetters.colFrom') }}
                    </th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('messageLetters.colSentAt') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('messageLetters.colActivity') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('messageLetters.colApprovalStatus') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('messageLetters.colApprovalDate') }}</th>
                    <th class="px-4 py-3 text-center font-semibold whitespace-nowrap">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="row in rows"
                    :key="row.message_id"
                    class="align-top hover:bg-primary-50/20"
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
          </template>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'empty-' + slot"
              class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <template v-if="slot === 1">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('messageLetters.approvalInboxEmpty') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">
                  {{ $t('messageLetters.approvalInboxEmptyHint') }}
                </p>
              </template>
              <template v-else>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </template>
            </div>
          </div>
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
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import MessageLetterPreviewDialog from '@/components/MessageLetterPreviewDialog.vue'
import ApprovalInboxActionsDropdown from '@/components/ApprovalInboxActionsDropdown.vue'
import { useListViewMode } from '@/composables/useListViewMode'
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
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

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

function approvalBarClass(status: InboxRow['approval_status']): string {
  if (status === 'approved') return 'bg-gradient-to-r from-emerald-400 to-teal-500'
  if (status === 'rejected') return 'bg-gradient-to-r from-red-400 to-rose-500'
  if (status === 'not_sent') return 'bg-gradient-to-r from-slate-300 to-slate-400'
  return 'bg-gradient-to-r from-amber-400 to-orange-400'
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
