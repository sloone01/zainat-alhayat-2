<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('notificationTransactions.detailTitle')"
        :subtitle="row?.to_address || ''"
      >
        <template #leading>
          <router-link
            :to="listBase"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('notificationTransactions.backToList')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="flashError" class="fk-alert fk-alert--error">{{ flashError }}</div>
      <div v-if="flashOk" class="fk-alert fk-alert--ok">{{ flashOk }}</div>

      <div v-if="loading" class="fk-card flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <template v-else-if="row">
        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ row.subject || row.template_key || channelLabel(row.channel) }}</h2>
              <p class="fk-card__meta">{{ formatDate(row.created_at) }}</p>
            </div>
            <div class="flex shrink-0 flex-nowrap items-center gap-2">
              <span
                class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                :class="statusClass(row.status)"
              >
                {{ statusLabel(row.status) }}
              </span>
              <button
                v-if="canResend"
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="resending"
                @click="resend"
              >
                {{ resending ? $t('common.loading') : $t('notificationTransactions.resend') }}
              </button>
            </div>
          </header>

          <div class="space-y-4 p-6">
            <dl class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('notificationTransactions.colChannel') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800">{{ channelLabel(row.channel) }}</dd>
              </div>
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('notificationTransactions.colTo') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800" dir="ltr">{{ row.to_address }}</dd>
              </div>
              <div v-if="row.template_key" class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('notificationTransactions.colTemplate') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800" dir="ltr">{{ row.template_key }}</dd>
              </div>
              <div v-if="row.source" class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('notificationTransactions.colSource') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800" dir="ltr">{{ row.source }}</dd>
              </div>
              <div v-if="row.provider_message_id" class="rounded-lg bg-gray-50 px-3 py-2 sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('notificationTransactions.colProviderId') }}</dt>
                <dd class="mt-0.5 break-all text-sm font-medium text-gray-800" dir="ltr">{{ row.provider_message_id }}</dd>
              </div>
              <div v-if="row.error_message" class="rounded-lg bg-red-50 px-3 py-2 sm:col-span-2">
                <dt class="text-xs font-medium text-red-700">{{ $t('notificationTransactions.colError') }}</dt>
                <dd class="mt-0.5 break-words text-sm text-red-800" dir="ltr">{{ row.error_message }}</dd>
              </div>
            </dl>

            <div v-if="row.channel === 'email' && row.body_html" class="overflow-hidden rounded-xl border border-gray-200">
              <div class="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {{ $t('notificationTransactions.emailPreview') }}
              </div>
              <iframe
                class="h-[28rem] w-full bg-white"
                sandbox=""
                :srcdoc="row.body_html"
                :title="$t('notificationTransactions.emailPreview')"
              />
            </div>

            <div v-if="row.body_text" class="rounded-xl border border-gray-200">
              <div class="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {{ row.channel === 'sms' ? $t('notificationTransactions.smsBody') : $t('notificationTransactions.textBody') }}
              </div>
              <pre class="whitespace-pre-wrap break-words px-4 py-3 text-sm text-gray-800" dir="auto">{{ row.body_text }}</pre>
            </div>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { useClaims } from '@/composables/useClaims'
import {
  notificationTransactionService,
  type NotificationTransactionRow,
  type NotificationTransactionStatus,
} from '@/services/notification-transaction.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const route = useRoute()
const router = useRouter()
const { hasClaim } = useClaims()

const isPlatform = computed(() => route.path.startsWith('/platform/'))
const claimPage = computed(() =>
  isPlatform.value ? 'platform_notification_transactions' : 'notification_transactions',
)
const canResend = computed(() => hasClaim(claimPage.value, 'manage'))
const listBase = computed(() =>
  isPlatform.value ? '/platform/notification-transactions' : '/settings/notification-transactions',
)

const loading = ref(true)
const resending = ref(false)
const flashError = ref('')
const flashOk = ref('')
const row = ref<NotificationTransactionRow | null>(null)

function channelLabel(channel: string) {
  return channel === 'sms'
    ? t('notificationTransactions.channelSms')
    : t('notificationTransactions.channelEmail')
}

function statusLabel(status: NotificationTransactionStatus) {
  if (status === 'failed') return t('notificationTransactions.statusFailed')
  if (status === 'skipped') return t('notificationTransactions.statusSkipped')
  return t('notificationTransactions.statusSent')
}

function statusClass(status: NotificationTransactionStatus) {
  if (status === 'failed') return 'bg-red-100 text-red-800'
  if (status === 'skipped') return 'bg-slate-100 text-slate-700'
  return 'bg-emerald-100 text-emerald-800'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

async function load() {
  const id = String(route.params.id || '')
  if (!id) return
  loading.value = true
  flashError.value = ''
  try {
    row.value = await notificationTransactionService.getById(id)
  } catch {
    flashError.value = t('notificationTransactions.loadError')
    row.value = null
  } finally {
    loading.value = false
  }
}

async function resend() {
  if (!row.value || !canResend.value) return
  resending.value = true
  flashError.value = ''
  flashOk.value = ''
  try {
    const created = await notificationTransactionService.resend(row.value.id)
    flashOk.value = t('notificationTransactions.resendOk')
    await router.push(`${listBase.value}/${created.id}`)
  } catch {
    flashError.value = t('notificationTransactions.resendError')
  } finally {
    resending.value = false
  }
}

watch(() => route.params.id, () => {
  void load()
})

onMounted(() => {
  void load()
})
</script>
