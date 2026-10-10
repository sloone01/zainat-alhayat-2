<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('messageLetters.approvalInboxTitle')"
        :subtitle="isAdmin ? $t('messageLetters.approvalInboxSubtitleAdmin') : $t('messageLetters.approvalInboxSubtitle')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('messageLetters.approvalInboxListHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('messageLetters.approvalInboxCount', { count: total }) }}
              <template v-if="pendingCount > 0">
                · {{ $t('messageLetters.approvalInboxPendingCount', { count: pendingCount }) }}
              </template>
            </p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading && !routePageLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="total > 0">
            <div v-if="isCards" class="fk-grid">
              <KanbanCard
                v-for="row in paginatedRows"
                :key="'approval-card-' + row.message_id"
                :title="row.title"
                :description="[row.party_name, row.students_label].filter(Boolean).join(' · ')"
              >
                <template #tags>
                  <KanbanTag v-if="row.approval_status === 'approved'" dot="emerald">
                    {{ approvalStatusLabel(row.approval_status) }}
                  </KanbanTag>
                  <KanbanTag v-else-if="row.approval_status === 'not_sent'" dot="gray">
                    {{ approvalStatusLabel(row.approval_status) }}
                  </KanbanTag>
                  <KanbanTag v-else-if="row.approval_status === 'rejected'" dot="red">
                    {{ approvalStatusLabel(row.approval_status) }}
                  </KanbanTag>
                  <KanbanTag v-else-if="row.approval_status === 'pending'" dot="amber">
                    {{ approvalStatusLabel(row.approval_status) }}
                  </KanbanTag>
                </template>
                <template #actions>
                  <ApprovalInboxActionsDropdown
                    :open="activeMenuId === row.message_id"
                    :isRTL="isRTL"
                    :can-approve="rowCanApprove(row)"
                    :show-view-letter="!!row.message_id"
                    :thread-id="row.thread_id"
                    :group-room-id="row.group_room_id"
                    :busy="busyId === row.message_id"
                    @toggle="toggleMenu(row.message_id)"
                    @view-letter="onViewLetter(row)"
                    @approve="resolve(row, 'approve')"
                    @reject="resolve(row, 'reject')"
                    @navigate="closeMenu"
                  />
                </template>
                <template #meta>
                  <KanbanMeta icon="calendar">{{ row.sent_at ? formatDate(row.sent_at) : '—' }}</KanbanMeta>
                  <KanbanMeta icon="check">{{ row.activity_title || $t('messageLetters.noLinkedActivity') }}</KanbanMeta>
                </template>
              </KanbanCard>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('messageLetters.colTitle') }}</th>
                    <th class="whitespace-nowrap">
                      {{ isAdmin ? $t('messageLetters.colParentStudent') : $t('messageLetters.colFrom') }}
                    </th>
                    <th class="whitespace-nowrap">{{ $t('messageLetters.colSentAt') }}</th>
                    <th class="whitespace-nowrap">{{ $t('messageLetters.colActivity') }}</th>
                    <th class="whitespace-nowrap">{{ $t('messageLetters.colApprovalStatus') }}</th>
                    <th class="whitespace-nowrap">{{ $t('messageLetters.colApprovalDate') }}</th>
                    <th class="!text-end whitespace-nowrap">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in paginatedRows" :key="row.message_id">
                    <td>
                      <p class="font-medium text-fikr-ink" :title="row.title">{{ truncateTitle(row.title) }}</p>
                    </td>
                    <td>
                      <p class="whitespace-nowrap text-fikr-ink">{{ row.party_name }}</p>
                      <p v-if="row.students_label" class="mt-0.5 text-xs text-fikr-ink-soft">{{ row.students_label }}</p>
                    </td>
                    <td class="whitespace-nowrap text-fikr-ink-muted">{{ row.sent_at ? formatDate(row.sent_at) : '—' }}</td>
                    <td class="text-fikr-ink-muted">{{ row.activity_title || $t('messageLetters.noLinkedActivity') }}</td>
                    <td class="whitespace-nowrap">
                      <span class="fk-pill" :class="approvalStatusClass(row.approval_status)">
                        {{ approvalStatusLabel(row.approval_status) }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap text-fikr-ink-muted">
                      {{ row.approval_resolved_at ? formatDate(row.approval_resolved_at) : '—' }}
                    </td>
                    <td>
                      <div class="flex justify-end">
                        <ApprovalInboxActionsDropdown
                          :open="activeMenuId === row.message_id"
                          :isRTL="isRTL"
                          :can-approve="rowCanApprove(row)"
                          :show-view-letter="!!row.message_id"
                          :thread-id="row.thread_id"
                          :group-room-id="row.group_room_id"
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

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="total > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="fk-empty">
            <div class="fk-empty__icon">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="fk-empty__title">{{ $t('messageLetters.approvalInboxEmpty') }}</h3>
            <p class="fk-empty__desc">{{ $t('messageLetters.approvalInboxEmptyHint') }}</p>
          </div>
        </div>
      </section>
    </div>

    <MessageLetterPreviewDialog
      v-model:open="previewOpen"
      :message-id="previewMessageId"
      :recipient-user-id="previewRecipientUserId"
      :can-approve="previewCanApprove"
      :busy="previewBusy"
      :status="previewStatus"
      @approve="resolvePreview('approve')"
      @reject="resolvePreview('reject')"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import MessageLetterPreviewDialog from '@/components/MessageLetterPreviewDialog.vue'
import ApprovalInboxActionsDropdown from '@/components/ApprovalInboxActionsDropdown.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useServerPagination } from '@/composables/useServerPagination'
import { useFeedback } from '@/composables/useFeedback'
import { authService } from '@/services'
import {
  chatApiService,
  type DirectApprovalInboxRow,
  type MessageLetterApprovalStatus as ChatApprovalStatus,
} from '@/services/chat.service'
import {
  messageLetterService,
  type MessageLetterApprovalRecipientRow,
  type MessageLetterApprovalStatus,
} from '@/services/message-letter.service'
import { isMessageLetterSystemSender } from '@/utils/message-letter-sender'
import FikrLoader from '@/components/FikrLoader.vue'
import { routePageLoading } from '@/router/route-loading'

type InboxRow = {
  message_id: string
  thread_id: string | null
  group_room_id?: string | null
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
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const currentUserId = computed(() => authService.getStoredUser()?.id ?? '')
const isAdmin = computed(() => authService.getStoredUser()?.role === 'admin')

const flashError = ref('')
const pendingCount = ref(0)
const {
  items: paginatedRows,
  total,
  loading,
  currentPage,
  totalPages,
  goToPage,
  reload: load,
} = useServerPagination(
  async (params) => {
    flashError.value = ''
    const loc = locale.value === 'ar' ? 'ar' : 'en'
    if (isAdmin.value) {
      const page = await messageLetterService.listApprovalRecipientsPage({ ...params, locale: loc })
      pendingCount.value = page.pending_total ?? 0
      return { ...page, items: page.items.map(mapAdminRow) }
    }
    const page = await chatApiService.listApprovalInboxPage({ ...params, locale: loc })
    pendingCount.value = page.pending_total ?? 0
    return { ...page, items: mapParentRows(page.items) }
  },
  {
    onError: () => {
      flashError.value = t('messageLetters.approvalInboxLoadError')
      pendingCount.value = 0
    },
  },
)
const busyId = ref<string | null>(null)
const activeMenuId = ref<string | null>(null)
const previewOpen = ref(false)
const previewMessageId = ref<string | null>(null)
const previewRecipientUserId = ref<string | null>(null)
const previewRow = ref<InboxRow | null>(null)

const previewCanApprove = computed(() => (previewRow.value ? rowCanApprove(previewRow.value) : false))
const previewBusy = computed(() => Boolean(previewRow.value && busyId.value === previewRow.value.message_id))
const previewStatus = computed(() => previewRow.value?.approval_status ?? null)

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
  previewRow.value = row
  previewMessageId.value = row.message_id
  previewRecipientUserId.value = row.recipient_user_id
  previewOpen.value = true
}

async function resolvePreview(decision: 'approve' | 'reject') {
  if (!previewRow.value) return
  const done = await resolve(previewRow.value, decision)
  if (done) previewOpen.value = false
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
  if (status === 'approved') return 'fk-pill--teal'
  if (status === 'rejected') return 'fk-pill--navy'
  if (status === 'not_sent') return 'fk-pill--mist'
  return 'fk-pill--outline'
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

function mapParentRows(list: DirectApprovalInboxRow[]): InboxRow[] {
  const uid = currentUserId.value
  return list.map((r) => ({
    message_id: r.message_id,
    thread_id: r.thread_id,
    group_room_id: r.group_room_id ?? null,
    recipient_user_id: uid,
    sender_user_id: r.sender_user_id,
    title: r.title,
    preview_text: r.preview_text,
    sent_at: r.sent_at,
    party_name: (() => {
      const name = (r.sender_name || '').trim()
      if (!name || isMessageLetterSystemSender(name)) return '—'
      return name
    })(),
    students_label: null,
    activity_title: r.activity_title,
    approval_status: r.approval_status,
    approval_resolved_at: r.approval_resolved_at,
    can_approve: r.can_approve && r.sender_user_id !== uid,
  }))
}

async function resolve(row: InboxRow, decision: 'approve' | 'reject'): Promise<boolean> {
  if (!rowCanApprove(row)) return false
  const ok = await feedback.confirm({
    title: t('common.confirm'),
    message: decision === 'approve'
      ? t('messageLetters.confirmApproveLetter')
      : t('messageLetters.confirmRejectLetter'),
    confirmLabel: decision === 'approve'
      ? t('messageLetters.approveLetter')
      : t('messageLetters.rejectLetter'),
    danger: decision === 'reject',
  })
  if (!ok) return false
  busyId.value = row.message_id
  flashError.value = ''
  closeMenu()
  try {
    await chatApiService.resolveMessageLetterApproval(row.message_id, decision)
    await load()
  } catch {
    flashError.value = t('messageLetters.approvalResolveError')
    return false
  } finally {
    busyId.value = null
  }
  return true
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
