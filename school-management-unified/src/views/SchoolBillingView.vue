<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('schoolBilling.title')"
        :subtitle="$t('schoolBilling.subtitle')"
      />

      <section class="fk-card">
        <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <h2 class="fk-card__title">{{ $t('schoolBilling.heading') }}</h2>
        </header>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <FikrLoader size="sm" />
            <p class="text-sm">{{ $t('common.loading') }}</p>
          </div>

          <p v-else-if="error" class="text-sm text-red-700">{{ error }}</p>

          <div v-else-if="displayInvoice" class="mx-auto max-w-lg space-y-5">
            <p v-if="invoicePaid" class="text-base font-semibold text-fikr-ink">{{ $t('schoolBilling.paidTitle') }}</p>
            <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('schoolBilling.plan') }}</dt>
                <dd class="text-sm font-semibold text-fikr-ink">{{ planName }}</dd>
              </div>
              <div>
                <dt class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('schoolBilling.period') }}</dt>
                <dd class="text-sm font-semibold text-fikr-ink">{{ periodLabel }}</dd>
              </div>
              <div>
                <dt class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('schoolBilling.coverage') }}</dt>
                <dd class="text-sm text-fikr-ink">{{ displayInvoice.period_start }} — {{ displayInvoice.period_end }}</dd>
              </div>
              <div>
                <dt class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('schoolBilling.amount') }}</dt>
                <dd class="text-lg font-bold text-fikr-ink">{{ amountLabel }}</dd>
              </div>
              <div>
                <dt class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('common.status') }}</dt>
                <dd class="text-sm font-semibold text-fikr-ink">{{ invoiceStatusLabel }}</dd>
              </div>
              <div v-if="invoicePaid && paidAtLabel">
                <dt class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('schoolBilling.paidAt') }}</dt>
                <dd class="text-sm text-fikr-ink">{{ paidAtLabel }}</dd>
              </div>
              <div v-if="displayInvoice.thawani_invoice">
                <dt class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('schoolBilling.reference') }}</dt>
                <dd class="text-sm font-mono text-fikr-ink">{{ displayInvoice.thawani_invoice }}</dd>
              </div>
            </dl>

            <p v-if="!invoicePaid" class="text-sm font-semibold text-amber-800">
              {{ $t('schoolBilling.notLaunched') }}
            </p>
            <router-link v-else to="/dashboard" class="fk-btn fk-btn--primary inline-flex">
              {{ $t('schoolBilling.goDashboard') }}
            </router-link>
          </div>

          <p v-else class="text-sm text-fikr-ink-soft">{{ $t('schoolBilling.noInvoice') }}</p>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { schoolBillingService, type SchoolBillingInvoice, type SchoolBillingMe } from '@/services/school-billing.service'

const { t, locale, te } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const bundle = ref<SchoolBillingMe | null>(null)

const invoice = computed<SchoolBillingInvoice | null>(() => bundle.value?.invoice ?? null)
const displayInvoice = computed<SchoolBillingInvoice | null>(
  () => invoice.value ?? bundle.value?.invoices?.[0] ?? null,
)
const invoicePaid = computed(() => displayInvoice.value?.status === 'paid')

const planName = computed(() => {
  const sub = bundle.value?.subscription
  if (!sub) return '—'
  return isRTL.value ? (sub.plan_name_ar || sub.plan_code || '—') : (sub.plan_name_en || sub.plan_code || '—')
})

const periodLabel = computed(() => {
  const period = bundle.value?.subscription?.billing_period || displayInvoice.value?.billing_period
  if (!period) return '—'
  const key = `platformBilling.periods.${period}`
  return te(key) ? t(key) : period
})

const amountLabel = computed(() => {
  const row = displayInvoice.value
  if (!row) return '—'
  const amt = invoicePaid.value && row.paid_amount != null ? row.paid_amount : row.total_amount
  return `${Number(amt).toFixed(3)} OMR`
})

const invoiceStatusLabel = computed(() => {
  if (!displayInvoice.value) return '—'
  return invoicePaid.value ? t('schoolBilling.statusPaid') : t('schoolBilling.statusIssued')
})

const paidAtLabel = computed(() => {
  const raw = displayInvoice.value?.paid_at
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleString(isRTL.value ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' })
})

function extractApiMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string | string[] } }; message?: string }
  const raw = err?.response?.data?.message
  if (Array.isArray(raw)) return raw.filter(Boolean).join('. ')
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return typeof err?.message === 'string' ? err.message : ''
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    bundle.value = await schoolBillingService.getMine()
  } catch (e) {
    error.value = extractApiMessage(e) || t('schoolBilling.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>
