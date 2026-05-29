<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[70] flex justify-end bg-black/40 p-4 sm:p-5 md:p-6"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('messageLetters.approvalTrackingTitle')"
      @click.self="close"
    >
      <div
        class="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
        @click.stop
      >
        <div class="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('messageLetters.approvalTrackingBack')"
            @click="close"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="min-w-0 flex-1">
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('messageLetters.approvalTrackingTitle') }}</h2>
            <p v-if="letterTitle" class="mt-0.5 text-sm font-medium text-gray-800">{{ letterTitle }}</p>
            <p v-if="trackingSummary" class="mt-0.5 text-xs font-medium text-primary-800">{{ trackingSummary }}</p>
            <p class="mt-0.5 text-xs text-gray-500">{{ $t('messageLetters.approvalTrackingHint') }}</p>
          </div>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            :aria-label="$t('common.close')"
            @click="close"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          <div class="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/90 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            <label class="min-w-0 flex-1 text-sm sm:min-w-[10rem]">
              <span class="mb-1 hidden font-medium text-gray-700 sm:block">{{ $t('messageLetters.filterRecipient') }}</span>
              <select
                v-model="filterRecipientId"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                :aria-label="$t('messageLetters.filterRecipient')"
                @change="reload"
              >
                <option value="">{{ $t('messageLetters.filterAll') }} — {{ $t('messageLetters.filterRecipient') }}</option>
                <option v-for="opt in recipientOptions" :key="opt.id" :value="opt.id">{{ opt.name }}</option>
              </select>
            </label>
            <label class="min-w-0 flex-1 text-sm sm:min-w-[10rem]">
              <span class="mb-1 hidden font-medium text-gray-700 sm:block">{{ $t('messageLetters.filterStudent') }}</span>
              <select
                v-model="filterStudentId"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                :aria-label="$t('messageLetters.filterStudent')"
                @change="reload"
              >
                <option value="">{{ $t('messageLetters.filterAll') }} — {{ $t('messageLetters.filterStudent') }}</option>
                <option v-for="opt in studentOptions" :key="opt.id" :value="opt.id">{{ opt.name }}</option>
              </select>
            </label>
            <label class="min-w-0 flex-1 text-sm sm:max-w-[12rem]">
              <span class="mb-1 hidden font-medium text-gray-700 sm:block">{{ $t('messageLetters.filterApprovalStatus') }}</span>
              <select
                v-model="filterStatus"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                :aria-label="$t('messageLetters.filterApprovalStatus')"
                @change="reload"
              >
                <option value="">{{ $t('messageLetters.filterAll') }} — {{ $t('messageLetters.filterApprovalStatus') }}</option>
                <option value="not_sent">{{ $t('messageLetters.approvalStatusNotSent') }}</option>
                <option value="pending">{{ $t('messageLetters.approvalStatusPending') }}</option>
                <option value="approved">{{ $t('messageLetters.letterApproved') }}</option>
                <option value="rejected">{{ $t('messageLetters.letterRejected') }}</option>
              </select>
            </label>
          </div>
          <div v-if="loading" class="py-16 text-center text-sm text-gray-500">{{ $t('common.loading') }}…</div>
          <div v-else class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table class="min-w-full text-sm">
              <thead class="hidden bg-gray-50/90 sm:table-header-group">
                <tr>
                  <th v-if="!letterId" class="text-start px-5 py-3.5 font-semibold text-gray-700">{{ $t('messageLetters.colTitle') }}</th>
                  <th class="text-start min-w-[14rem] px-5 py-3.5 font-semibold text-gray-700">{{ $t('messageLetters.colParentStudent') }}</th>
                  <th class="text-start px-5 py-3.5 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colSentAt') }}</th>
                  <th v-if="!letterId" class="text-start px-5 py-3.5 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colActivity') }}</th>
                  <th class="text-start px-5 py-3.5 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colApprovalStatus') }}</th>
                  <th class="text-start px-5 py-3.5 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colApprovalDate') }}</th>
                  <th class="px-5 py-3.5 text-end font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colReminder') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="!rows.length">
                  <td :colspan="emptyColspan" class="px-5 py-12 text-center text-gray-500">
                    <p>{{ $t('messageLetters.approvalTrackingEmpty') }}</p>
                    <p v-if="letterId" class="mt-2 text-xs text-gray-400">{{ $t('messageLetters.approvalTrackingEmptyLetterHint') }}</p>
                  </td>
                </tr>
                <tr
                  v-for="row in rows"
                  :key="row.message_id"
                  class="block border-b border-gray-100 last:border-0 transition-colors hover:bg-primary-50/40 sm:table-row sm:border-0"
                >
                  <td v-if="!letterId" class="hidden px-5 py-3.5 font-medium text-gray-900 sm:table-cell">{{ row.letter_title }}</td>
                  <td class="block px-4 py-3.5 sm:table-cell sm:px-5">
                    <p class="leading-snug text-gray-900">
                      <span class="font-medium">{{ row.recipient_name }}</span>
                      <span v-if="row.students.length" class="text-gray-600"> ({{ row.students.map((s) => s.name).join(', ') }})</span>
                    </p>
                    <p v-if="row.recipient_phone" class="mt-1 text-xs text-gray-500 tabular-nums" dir="ltr">{{ row.recipient_phone }}</p>
                    <div class="mt-2.5 flex flex-wrap items-center gap-2 sm:hidden">
                      <span
                        class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                        :class="approvalStatusClass(row.approval_status)"
                      >
                        {{ approvalStatusLabel(row.approval_status) }}
                      </span>
                      <span class="text-xs text-gray-500">{{ row.sent_at ? formatDate(row.sent_at) : '—' }}</span>
                    </div>
                  </td>
                  <td class="hidden px-5 py-3.5 text-gray-600 whitespace-nowrap sm:table-cell">
                    {{ row.sent_at ? formatDate(row.sent_at) : '—' }}
                  </td>
                  <td v-if="!letterId" class="hidden px-5 py-3.5 text-gray-700 sm:table-cell">{{ row.activity_title || $t('messageLetters.noLinkedActivity') }}</td>
                  <td class="hidden px-5 py-3.5 whitespace-nowrap sm:table-cell">
                    <span
                      class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                      :class="approvalStatusClass(row.approval_status)"
                    >
                      {{ approvalStatusLabel(row.approval_status) }}
                    </span>
                  </td>
                  <td class="hidden px-5 py-3.5 text-gray-600 whitespace-nowrap sm:table-cell">
                    {{ row.approval_resolved_at ? formatDate(row.approval_resolved_at) : '—' }}
                  </td>
                  <td class="hidden px-5 py-3.5 text-end whitespace-nowrap sm:table-cell">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled
                      :title="$t('messageLetters.reminderComingSoon')"
                      :aria-label="$t('messageLetters.reminderAction')"
                    >
                      {{ $t('messageLetters.reminderAction') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  messageLetterService,
  type MessageLetterApprovalRecipientRow,
  type MessageLetterApprovalStatus,
} from '@/services/message-letter.service'

const props = defineProps<{
  open: boolean
  schoolId: number
  letterId?: string | null
  activityId?: string | null
  letterTitle?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { locale, t } = useI18n()

const loading = ref(false)
const rows = ref<MessageLetterApprovalRecipientRow[]>([])
const allRowsForFilters = ref<MessageLetterApprovalRecipientRow[]>([])

const filterRecipientId = ref('')
const filterStudentId = ref('')
const filterStatus = ref<'' | MessageLetterApprovalStatus>('')

const emptyColspan = computed(() => (props.letterId ? 5 : 7))

const trackingSummary = computed(() => {
  if (!props.letterId || !rows.value.length) return ''
  const total = rows.value.length
  const sent = rows.value.filter((r) => r.approval_status !== 'not_sent').length
  const notSent = total - sent
  return t('messageLetters.approvalTrackingSummary', { sent: String(sent), total: String(total), notSent: String(notSent) })
})

function parentStudentLabel(row: MessageLetterApprovalRecipientRow): string {
  if (!row.students.length) return row.recipient_name
  return `${row.recipient_name} (${row.students.map((s) => s.name).join(', ')})`
}

const recipientOptions = computed(() => {
  const map = new Map<string, string>()
  for (const r of allRowsForFilters.value) {
    map.set(r.recipient_user_id, parentStudentLabel(r))
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, locale.value))
})

const studentOptions = computed(() => {
  const map = new Map<string, string>()
  for (const r of allRowsForFilters.value) {
    for (const s of r.students) {
      map.set(s.id, s.name)
    }
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, locale.value))
})

function close() {
  emit('update:open', false)
}

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function approvalStatusLabel(status: MessageLetterApprovalStatus): string {
  if (status === 'not_sent') return t('messageLetters.approvalStatusNotSent')
  if (status === 'approved') return t('messageLetters.letterApproved')
  if (status === 'rejected') return t('messageLetters.letterRejected')
  return t('messageLetters.approvalStatusPending')
}

function approvalStatusClass(status: MessageLetterApprovalStatus): string {
  if (status === 'not_sent') return 'bg-gray-100 text-gray-700'
  if (status === 'approved') return 'bg-emerald-100 text-emerald-800'
  if (status === 'rejected') return 'bg-red-100 text-red-800'
  return 'bg-amber-100 text-amber-900'
}

function scopedFilters() {
  return {
    letter_id: props.letterId || undefined,
    recipient_user_id: filterRecipientId.value || undefined,
    student_id: filterStudentId.value || undefined,
    approval_status: filterStatus.value || undefined,
  }
}

async function loadFilterOptions() {
  try {
    allRowsForFilters.value = await messageLetterService.listApprovalRecipients(props.schoolId, {
      letter_id: props.letterId || undefined,
      activity_id: props.activityId || undefined,
    })
  } catch {
    allRowsForFilters.value = []
  }
}

async function reload() {
  loading.value = true
  try {
    rows.value = await messageLetterService.listApprovalRecipients(props.schoolId, scopedFilters())
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function load() {
  await Promise.all([loadFilterOptions(), reload()])
}

watch(
  () => [props.open, props.letterId, props.activityId] as const,
  ([isOpen]) => {
    if (isOpen) {
      filterRecipientId.value = ''
      filterStudentId.value = ''
      filterStatus.value = ''
      void load()
    }
  },
)

defineExpose({ reload: load })
</script>
