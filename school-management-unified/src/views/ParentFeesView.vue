<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parentFees.title')"
        :subtitle="$t('parentFees.subtitle')"
      />

      <div v-if="loadingChildren" class="flex items-center justify-center gap-3 py-10 text-gray-600">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="childrenError" class="fk-alert fk-alert--error">
        <p class="font-medium">{{ childrenError }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadChildren">{{ $t('common.retry') }}</button>
      </div>

      <template v-else>
        <div v-if="!children.length" class="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-6 py-12 text-center">
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-800">{{ $t('parentFees.noChildren') }}</p>
        </div>

        <template v-else>
          <div class="fk-card">
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
              <div class="min-w-0">
                <h2 class="fk-card__title truncate">{{ $t('parent.myChildren') }}</h2>
              </div>
            </header>
            <div class="flex flex-wrap gap-2 p-4 sm:gap-3 sm:p-6">
            <button
              v-for="c in children"
              :key="c.id"
              type="button"
              class="group flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3 text-start shadow-sm transition-all sm:min-w-[12rem]"
              :class="selectedId === c.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/30' : 'border-gray-200 bg-white hover:border-primary-200'"
              @click="selectChild(c.id)"
            >
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" :class="selectedId === c.id ? 'bg-primary-600' : 'bg-gray-400 group-hover:bg-primary-500'">
                {{ initials(c) }}
              </span>
              <span class="min-w-0">
                <span class="block truncate font-semibold text-gray-900">{{ c.firstName }} {{ c.lastName }}</span>
                <span v-if="c.groupNames" class="mt-0.5 block truncate text-xs text-gray-500">{{ c.groupNames }}</span>
              </span>
            </button>
            </div>
          </div>

          <div v-if="selectedId" class="fk-card">
            <div v-if="detailLoading" class="flex flex-col items-center justify-center gap-3 py-20 text-gray-600">
              <span class="h-12 w-12 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              <span>{{ $t('parentFees.loadingDetail') }}</span>
            </div>

            <div v-else-if="detailError" class="fk-alert fk-alert--error m-5 sm:m-6">
              <p class="text-sm">{{ detailError }}</p>
              <button type="button" class="fk-btn fk-btn--primary mt-4" @click="reloadDetail">{{ $t('common.retry') }}</button>
            </div>

            <div v-else-if="sheet" class="p-5 sm:p-8 space-y-8">
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border border-gray-100 bg-slate-50/80 p-4">
                  <p class="text-xs font-medium uppercase text-gray-500">{{ $t('feesV2.totalList') }}</p>
                  <p class="mt-1 text-xl font-bold tabular-nums">{{ formatMoney(sheet.list_total) }}</p>
                </div>
                <div class="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                  <p class="text-xs font-medium uppercase text-amber-800/80">{{ $t('feesV2.discounts') }}</p>
                  <p class="mt-1 text-xl font-bold tabular-nums text-amber-950">−{{ formatMoney(sheet.discount_total) }}</p>
                </div>
                <div class="rounded-xl border border-navy-100 bg-navy-50/70 p-4 sm:col-span-2">
                  <p class="text-xs font-medium uppercase text-navy-700/80">{{ $t('studentPayments.amountDue') }}</p>
                  <p class="mt-1 text-2xl font-extrabold tabular-nums text-navy-950">{{ formatMoney(sheet.due_total) }}</p>
                  <p v-if="sheet.student?.paymentLevel?.name" class="mt-1 text-xs text-navy-700">{{ sheet.student.paymentLevel.name }}</p>
                </div>
              </div>

              <div v-if="sheet.discountLines?.length" class="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <h2 class="text-sm font-semibold text-gray-800 mb-2">{{ $t('parentFees.appliedDiscounts') }}</h2>
                <ul class="divide-y divide-gray-100">
                  <li v-for="d in sheet.discountLines" :key="d.id" class="flex justify-between py-2 text-sm">
                    <span>{{ d.discountType?.label || d.discount_type_id }}</span>
                    <span class="font-semibold text-amber-800">−{{ formatMoney(d.amount) }}</span>
                  </li>
                </ul>
              </div>

              <div class="rounded-xl border border-gray-100 overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.chargeLines') }}</h2>
                </div>
                <table class="min-w-full text-sm">
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="line in sheet.lines" :key="line.id">
                      <td class="px-4 py-3">{{ line.charge_label }}</td>
                      <td class="px-4 py-3 text-end font-mono">{{ formatMoney(line.due_amount) }}</td>
                      <td class="px-4 py-3 text-end">
                        <span class="text-xs font-medium rounded-full px-2 py-0.5" :class="statusClass(line.status)">{{ $t(`feesV2.status_${line.status}`) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="upfrontRemaining > 0" class="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <div>
                  <p class="text-sm font-medium text-amber-900">{{ $t('feesV2.upfrontDue') }}</p>
                  <p class="text-xl font-bold tabular-nums text-amber-950">{{ formatMoney(upfrontRemaining) }}</p>
                  <p v-if="hasOpenUpfront" class="mt-1 text-xs text-amber-800">{{ $t('parentFees.waitingApproval') }}</p>
                </div>
                <button
                  type="button"
                  class="fk-btn fk-btn--primary"
                  :disabled="hasOpenUpfront || paying"
                  @click="openPay('upfront')"
                >
                  {{ $t('parentFees.payNow') }}
                </button>
              </div>

              <div v-if="sheet.installments?.length">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ $t('feesV2.schedule') }}</h2>
                <div class="space-y-3">
                  <div v-for="inst in sheet.installments" :key="inst.id" class="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                    <div>
                      <p class="font-medium text-gray-900">{{ inst.label || `${$t('feesV2.installment')} ${inst.sequence}` }}</p>
                      <p v-if="inst.due_date" class="text-xs text-gray-500">{{ $t('feesV2.dueOn') }} {{ inst.due_date }}</p>
                      <p class="text-sm text-gray-600 tabular-nums">{{ formatMoney(inst.amount_paid) }} / {{ formatMoney(inst.amount_due) }}</p>
                    </div>
                    <button
                      v-if="inst.status !== 'paid'"
                      type="button"
                      class="fk-btn fk-btn--primary"
                      :disabled="hasOpenInstallment(inst.id) || paying"
                      @click="openPay('installment', inst)"
                    >
                      {{ hasOpenInstallment(inst.id) ? $t('parentFees.waitingApproval') : $t('parentFees.payNow') }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="payments.length" class="rounded-xl border border-gray-100 overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('parentFees.paymentHistory') }}</h2>
                </div>
                <ul class="divide-y divide-gray-100">
                  <li v-for="p in payments" :key="p.id" class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <div>
                      <p class="font-medium text-gray-900">{{ formatMoney(p.amount) }} · {{ $t(`parentFees.method_${p.method}`) }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(p.created_at) }}</p>
                    </div>
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="payStatusClass(p.status)">
                      {{ $t(`parentFees.status_${parentFacingStatus(p.status)}`) }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <FikrDialog
      :show="!!payTarget"
      plain-footer
      size="md"
      :title="$t('parentFees.payModalTitle')"
      :subtitle="$t('parentFees.payModalSubtitle')"
      @close="closePay"
    >
        <p class="text-2xl font-extrabold tabular-nums text-primary-800">{{ formatMoney(payAmount) }}</p>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-xl border px-3 py-3 text-sm font-semibold"
            :class="payMethod === 'offline' ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 text-gray-700'"
            @click="payMethod = 'offline'"
          >
            {{ $t('parentFees.methodOffline') }}
          </button>
          <button
            type="button"
            class="rounded-xl border px-3 py-3 text-sm font-semibold"
            :class="payMethod === 'thawani' ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 text-gray-700'"
            @click="payMethod = 'thawani'"
          >
            {{ $t('parentFees.methodThawani') }}
          </button>
        </div>

        <div v-if="payMethod === 'offline'" class="mt-4 space-y-3">
          <p class="text-sm text-gray-600">{{ $t('parentFees.offlineHint') }}</p>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('parentFees.attachReceipt') }}</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="block w-full text-sm" @change="onProofPicked" />
          <textarea
            v-model="payRemarks"
            rows="2"
            class="fk-field"
            :placeholder="$t('parentFees.remarksPlaceholder')"
          />
        </div>
        <p v-else class="mt-4 text-sm text-gray-600">{{ $t('parentFees.thawaniHint') }}</p>

        <p v-if="payError" class="fk-alert fk-alert--error mt-3">{{ payError }}</p>

        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="closePay">
            {{ $t('common.cancel') }}
          </button>
          <button
            type="button"
            class="fk-btn fk-btn--primary"
            :disabled="paying || (payMethod === 'offline' && !proofFile)"
            @click="submitPay"
          >
            {{ paying ? $t('common.loading') : $t('parentFees.confirmPay') }}
          </button>
        </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import { parentService } from '@/services/parent.service'
import { feesV2Service, type FeePayment, type StudentChargeSheet } from '@/services/fees-v2.service'
import { checkoutReturnUrls, openCheckoutPopup, watchCheckoutPopup } from '@/utils/thawaniCheckout'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')

interface DashboardChild {
  id: string
  firstName: string
  lastName: string
  groupNames?: string
}

const loadingChildren = ref(true)
const childrenError = ref('')
const children = ref<DashboardChild[]>([])
const selectedId = ref<string | null>(null)
const sheet = ref<StudentChargeSheet | null>(null)
const payments = ref<FeePayment[]>([])
const detailLoading = ref(false)
const detailError = ref('')
const paying = ref(false)
const payError = ref('')
const payTarget = ref<'upfront' | 'installment' | null>(null)
const payInstallmentId = ref<string | null>(null)
const payAmount = ref(0)
const payMethod = ref<'offline' | 'thawani'>('offline')
const payRemarks = ref('')
const proofFile = ref<File | null>(null)

const upfrontRemaining = computed(() => {
  if (!sheet.value) return 0
  return (sheet.value.lines || [])
    .filter((l) => l.payment_timing === 'upfront')
    .reduce((s, l) => s + Math.max(0, Number(l.due_amount) - Number(l.paid_amount)), 0)
})

function isOpenPaymentStatus(status: string) {
  return status === 'pending' || status === 'pending_approval' || status === 'pending_reconcile'
}

function parentFacingStatus(status: string) {
  if (status === 'pending_approval' || status === 'pending_reconcile') return 'pending'
  return status
}

const hasOpenUpfront = computed(() =>
  payments.value.some((p) => p.target_type === 'upfront' && isOpenPaymentStatus(p.status)),
)

function hasOpenInstallment(id: string) {
  return payments.value.some((p) => p.installment_id === id && isOpenPaymentStatus(p.status))
}

function initials(c: DashboardChild) {
  const a = (c.firstName || '').trim().charAt(0)
  const b = (c.lastName || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

function formatMoney(v: string | number) {
  const n = Number(v || 0)
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(n)
  } catch {
    return `${n.toFixed(3)} OMR`
  }
}

function statusClass(status: string) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-800'
  if (status === 'partial') return 'bg-amber-100 text-amber-800'
  return 'bg-sky-100 text-sky-800'
}

function formatDate(v: string) {
  try {
    return new Date(v).toLocaleString(locale.value === 'ar' ? 'ar-OM' : 'en-OM')
  } catch {
    return v
  }
}

function payStatusClass(status: string) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-800'
  if (isOpenPaymentStatus(status)) return 'bg-amber-100 text-amber-800'
  if (status === 'rejected' || status === 'failed' || status === 'cancelled') return 'bg-red-100 text-red-800'
  return 'bg-sky-100 text-sky-800'
}

function extractApiMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string | string[] } }; message?: string }
  const raw = err?.response?.data?.message
  if (Array.isArray(raw)) return raw.filter(Boolean).join('. ')
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return typeof err?.message === 'string' ? err.message : ''
}

async function loadChildren() {
  loadingChildren.value = true
  childrenError.value = ''
  try {
    const dash = await parentService.getMyDashboardData()
    children.value = (dash?.children ?? []).map((c: DashboardChild) => ({ ...c, id: String(c.id) }))
    if (!selectedId.value && children.value.length) selectedId.value = children.value[0].id
  } catch (e) {
    childrenError.value = extractApiMessage(e) || t('parent.error')
  } finally {
    loadingChildren.value = false
  }
}

async function loadDetailFor(studentId: string) {
  detailLoading.value = true
  detailError.value = ''
  sheet.value = null
  payments.value = []
  try {
    const [s, pays] = await Promise.all([
      feesV2Service.getStudentChargeSheet(studentId),
      feesV2Service.listStudentPayments(studentId).catch(() => []),
    ])
    sheet.value = s
    payments.value = pays
  } catch (e) {
    detailError.value = extractApiMessage(e) || t('parentFees.noFeeRecords')
  } finally {
    detailLoading.value = false
  }
}

function selectChild(id: string) {
  selectedId.value = id
}

function reloadDetail() {
  if (selectedId.value) loadDetailFor(selectedId.value)
}

function openPay(target: 'upfront' | 'installment', inst?: { id: string; amount_due: string; amount_paid: string }) {
  payError.value = ''
  payRemarks.value = ''
  proofFile.value = null
  payMethod.value = 'offline'
  payTarget.value = target
  if (target === 'installment' && inst) {
    payInstallmentId.value = inst.id
    payAmount.value = Math.max(0, Number(inst.amount_due) - Number(inst.amount_paid))
  } else {
    payInstallmentId.value = null
    payAmount.value = upfrontRemaining.value
  }
}

function closePay() {
  payTarget.value = null
  proofFile.value = null
}

function onProofPicked(e: Event) {
  const input = e.target as HTMLInputElement
  proofFile.value = input.files?.[0] ?? null
}

async function submitPay() {
  if (!selectedId.value || !payTarget.value || payAmount.value <= 0) return
  paying.value = true
  payError.value = ''
  try {
    if (payMethod.value === 'offline') {
      if (!proofFile.value) throw new Error(t('parentFees.attachReceipt'))
      await feesV2Service.submitOfflinePayment(selectedId.value, {
        target_type: payTarget.value,
        installment_id: payInstallmentId.value ?? undefined,
        remarks: payRemarks.value,
        locale: locale.value === 'en' ? 'en' : 'ar',
        file: proofFile.value,
      })
      closePay()
      await reloadDetail()
      return
    }

    const popup = openCheckoutPopup()
    const urls = checkoutReturnUrls()
    const session = await feesV2Service.createThawaniSession(selectedId.value, {
      target_type: payTarget.value,
      installment_id: payInstallmentId.value ?? undefined,
      success_url: urls.success,
      cancel_url: urls.cancel,
      locale: locale.value === 'en' ? 'en' : 'ar',
    })
    if (popup) popup.location.href = session.checkout_url
    else window.location.href = session.checkout_url
    if (popup) {
      await new Promise<void>((resolve) => {
        watchCheckoutPopup(popup, () => resolve())
      })
      const confirmed = await feesV2Service.confirmThawaniPayment(session.payment.id)
      if (confirmed.sheet) sheet.value = confirmed.sheet
      if (!confirmed.paid) {
        payError.value = t('parentFees.thawaniNotPaid')
      } else {
        closePay()
      }
      await reloadDetail()
    }
  } catch (e) {
    payError.value = extractApiMessage(e) || t('parentFees.payFailed')
  } finally {
    paying.value = false
  }
}

async function confirmReturnedPayment(paymentId: string) {
  paying.value = true
  try {
    const confirmed = await feesV2Service.confirmThawaniPayment(paymentId)
    if (confirmed.sheet) sheet.value = confirmed.sheet
    await reloadDetail()
  } catch {
    /* keep current sheet */
  } finally {
    paying.value = false
    router.replace({ path: '/parent/fees', query: {} })
  }
}

watch(selectedId, (id) => {
  if (id) loadDetailFor(id)
})

onMounted(async () => {
  await loadChildren()
  const returned = typeof route.query.payment === 'string' ? route.query.payment : ''
  if (returned && route.query.pay === 'success') {
    await confirmReturnedPayment(returned)
  }
})
</script>
