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
          <p class="fk-card__meta">{{ $t('schoolBilling.headingHint') }}</p>
        </header>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <span class="fk-spinner" aria-hidden="true" />
            <p class="text-sm">{{ $t('common.loading') }}</p>
          </div>

          <p v-else-if="error" class="text-sm text-red-700">{{ error }}</p>

          <div v-else-if="paid" class="mx-auto max-w-lg text-center py-8">
            <p class="text-base font-semibold text-fikr-ink">{{ $t('schoolBilling.paidTitle') }}</p>
            <p class="mt-2 text-sm text-fikr-ink-soft">{{ $t('schoolBilling.paidBody') }}</p>
            <router-link to="/dashboard" class="fk-btn fk-btn--primary mt-6 inline-flex">
              {{ $t('schoolBilling.goDashboard') }}
            </router-link>
          </div>

          <div v-else-if="invoice" class="mx-auto max-w-lg space-y-5">
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
                <dd class="text-sm text-fikr-ink">{{ invoice.period_start }} — {{ invoice.period_end }}</dd>
              </div>
              <div>
                <dt class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('schoolBilling.amount') }}</dt>
                <dd class="text-lg font-bold text-fikr-ink">{{ amountLabel }}</dd>
              </div>
            </dl>

            <p class="text-sm text-fikr-ink-soft">{{ $t('schoolBilling.thawaniHint') }}</p>
            <p v-if="payError" class="text-sm text-red-700">{{ payError }}</p>
            <button
              type="button"
              class="fk-btn fk-btn--primary w-full sm:w-auto"
              :disabled="paying || !thawaniConfigured"
              @click="pay"
            >
              {{ paying ? $t('schoolBilling.paying') : $t('schoolBilling.payThawani') }}
            </button>
            <p v-if="!thawaniConfigured" class="text-sm text-amber-800">
              {{ $t('schoolBilling.thawaniUnavailable') }}
            </p>
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
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { schoolBillingService, type SchoolBillingInvoice, type SchoolBillingMe } from '@/services/school-billing.service'
import { checkoutReturnUrls, openCheckoutPopup, watchCheckoutPopup } from '@/utils/thawaniCheckout'
import { authService } from '@/services'
import { resetClaims, useClaims } from '@/composables/useClaims'
import { setStoredAuth } from '@/utils/auth-token'

const { t, locale, te } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const router = useRouter()
const route = useRoute()
const { loadClaims } = useClaims()

const loading = ref(true)
const paying = ref(false)
const error = ref('')
const payError = ref('')
const bundle = ref<SchoolBillingMe | null>(null)

const invoice = computed<SchoolBillingInvoice | null>(() => bundle.value?.invoice ?? null)
const thawaniConfigured = computed(() => Boolean(bundle.value?.thawani_configured))
const paid = computed(() => bundle.value?.school.status === 'active' && !invoice.value)

const planName = computed(() => {
  const sub = bundle.value?.subscription
  if (!sub) return '—'
  return isRTL.value ? (sub.plan_name_ar || sub.plan_code || '—') : (sub.plan_name_en || sub.plan_code || '—')
})

const periodLabel = computed(() => {
  const period = bundle.value?.subscription?.billing_period
  if (!period) return '—'
  const key = `platformBilling.periods.${period}`
  return te(key) ? t(key) : period
})

const amountLabel = computed(() => {
  const amt = invoice.value?.total_amount
  if (amt == null) return '—'
  return `${Number(amt).toFixed(3)} OMR`
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

async function afterPaid(schoolStatus: string | null) {
  const token = authService.getStoredToken()
  const user = authService.getStoredUser()
  if (token && user) {
    setStoredAuth(token, { ...user, school_status: schoolStatus || 'active' })
  }
  resetClaims()
  await loadClaims()
  await router.replace('/dashboard')
}

async function pay() {
  if (!invoice.value) return
  paying.value = true
  payError.value = ''
  try {
    const popup = openCheckoutPopup()
    const urls = checkoutReturnUrls()
    const session = await schoolBillingService.createThawaniSession({
      success_url: urls.success,
      cancel_url: urls.cancel,
    })
    if (session.paid) {
      await afterPaid('active')
      return
    }
    if (!session.checkout_url) {
      payError.value = t('schoolBilling.payFailed')
      return
    }
    if (popup) popup.location.href = session.checkout_url
    else window.location.href = session.checkout_url
    if (popup) {
      await new Promise<void>((resolve) => {
        watchCheckoutPopup(popup, () => resolve())
      })
      const confirmed = await schoolBillingService.confirmThawani(session.invoice.id)
      if (!confirmed.paid) {
        payError.value = t('schoolBilling.thawaniNotPaid')
        await load()
      } else {
        await afterPaid(confirmed.school_status)
      }
    }
  } catch (e) {
    payError.value = extractApiMessage(e) || t('schoolBilling.payFailed')
  } finally {
    paying.value = false
  }
}

onMounted(async () => {
  await load()
  const returned = typeof route.query.invoice === 'string' ? route.query.invoice : ''
  if (route.query.pay === 'success' || returned) {
    paying.value = true
    try {
      const confirmed = await schoolBillingService.confirmThawani(
        returned ? Number(returned) : invoice.value?.id,
      )
      if (confirmed.paid) await afterPaid(confirmed.school_status)
      else await load()
    } finally {
      paying.value = false
    }
  }
})
</script>
