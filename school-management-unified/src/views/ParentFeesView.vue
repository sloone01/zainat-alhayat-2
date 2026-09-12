<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('parentFees.title')" />

      <div v-if="loadingChildren" class="flex items-center justify-center gap-3 py-12 text-gray-600">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="childrenError" class="fk-card">
        <div class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center">
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-800">{{ childrenError }}</p>
          <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadChildren">{{ $t('common.retry') }}</button>
        </div>
      </div>

      <template v-else>
        <div v-if="!children.length" class="fk-card">
          <div class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-800">{{ $t('parentFees.noChildren') }}</p>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div v-if="children.length > 1" class="fk-card">
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
              <h2 class="fk-card__title truncate">{{ $t('parent.myChildren') }}</h2>
            </header>
            <div class="flex flex-wrap gap-2 p-4 sm:p-6">
              <button
                v-for="c in children"
                :key="c.id"
                type="button"
                class="inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
                :class="selectedId === c.id
                  ? 'border-primary-500 bg-primary-50 font-semibold text-primary-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200'"
                @click="selectChild(c.id)"
              >
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  :class="selectedId === c.id ? 'bg-primary-600' : 'bg-gray-400'"
                >
                  {{ initials(c) }}
                </span>
                <span class="truncate">{{ c.firstName }} {{ c.lastName }}</span>
              </button>
            </div>
          </div>

          <div class="fk-card">
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
              <div class="min-w-0">
                <h2 class="fk-card__title truncate">{{ selectedChildName }}</h2>
                <p v-if="sheet?.student?.paymentLevel?.name" class="fk-card__meta">
                  {{ sheet.student.paymentLevel.name }}
                </p>
              </div>
            </header>

            <div v-if="detailLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-600">
              <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
              <span class="text-sm">{{ $t('parentFees.loadingDetail') }}</span>
            </div>

            <div v-else-if="detailError" class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center">
              <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800">{{ detailError }}</p>
              <button type="button" class="fk-btn fk-btn--primary mt-4" @click="reloadDetail">{{ $t('common.retry') }}</button>
            </div>

            <div v-else-if="!hasFeeContent" class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center">
              <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-800">{{ $t('parentFees.noFeeRecords') }}</p>
            </div>

            <div v-else-if="sheet" class="space-y-6 p-5 sm:p-6">
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3">
                <div class="rounded-lg border border-gray-200/80 bg-white px-3 py-2.5">
                  <p class="text-xs font-medium text-gray-500">{{ $t('feesV2.totalList') }}</p>
                  <p class="mt-0.5 text-lg font-semibold tabular-nums text-gray-900">{{ formatMoney(sheet.list_total) }}</p>
                </div>
                <div class="rounded-lg border border-violet-200/70 bg-violet-50/70 px-3 py-2.5">
                  <p class="text-xs font-medium text-violet-800">{{ $t('feesV2.extras') }}</p>
                  <p class="mt-0.5 text-lg font-semibold tabular-nums text-violet-950">+{{ formatMoney(sheet.extra_total) }}</p>
                </div>
                <div class="rounded-lg border border-amber-200/70 bg-amber-50/70 px-3 py-2.5">
                  <p class="text-xs font-medium text-amber-800">{{ $t('feesV2.discounts') }}</p>
                  <p class="mt-0.5 text-lg font-semibold tabular-nums text-amber-950">−{{ formatMoney(sheet.discount_total) }}</p>
                </div>
                <div class="rounded-lg border border-emerald-200/70 bg-emerald-50/70 px-3 py-2.5">
                  <p class="text-xs font-medium text-emerald-700">{{ $t('feesV2.paid') }}</p>
                  <p class="mt-0.5 text-lg font-semibold tabular-nums text-emerald-950">{{ formatMoney(sheet.paid_total) }}</p>
                </div>
                <div class="rounded-lg border border-primary-200/70 bg-primary-50/70 px-3 py-2.5">
                  <p class="text-xs font-medium text-primary-800">{{ $t('feesV2.due') }}</p>
                  <p class="mt-0.5 text-lg font-semibold tabular-nums text-primary-950">{{ formatMoney(sheet.due_total) }}</p>
                </div>
              </div>

              <div v-if="sheet.inclusions?.length">
                <h3 class="mb-2 text-sm font-semibold text-gray-900">{{ $t('parentFees.includedInPackage') }}</h3>
                <ul class="flex flex-wrap gap-2">
                  <li
                    v-for="item in sheet.inclusions"
                    :key="item.id"
                    class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-800"
                  >
                    {{ item.label }}
                  </li>
                </ul>
              </div>

              <div v-if="sheet.extraLines?.length">
                <h3 class="mb-2 text-sm font-semibold text-gray-900">{{ $t('parentFees.appliedExtras') }}</h3>
                <ul class="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200/80">
                  <li
                    v-for="e in sheet.extraLines"
                    :key="e.id"
                    class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                  >
                    <span class="min-w-0 truncate text-gray-800">{{ e.extraType?.label || e.extra_type_id }}</span>
                    <span class="shrink-0 font-semibold tabular-nums text-violet-800">+{{ formatMoney(e.amount) }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="sheet.discountLines?.length">
                <h3 class="mb-2 text-sm font-semibold text-gray-900">{{ $t('parentFees.appliedDiscounts') }}</h3>
                <ul class="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200/80">
                  <li
                    v-for="d in sheet.discountLines"
                    :key="d.id"
                    class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                  >
                    <span class="min-w-0 truncate text-gray-800">{{ d.discountType?.label || d.discount_type_id }}</span>
                    <span class="shrink-0 font-semibold tabular-nums text-amber-800">−{{ formatMoney(d.amount) }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="sheet.lines?.length">
                <h3 class="mb-2 text-sm font-semibold text-gray-900">{{ $t('feesV2.chargeLines') }}</h3>
                <ul class="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200/80">
                  <li
                    v-for="line in sheet.lines"
                    :key="line.id"
                    class="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  >
                    <span class="min-w-0 font-medium text-gray-900">{{ line.charge_label }}</span>
                    <div class="flex items-center gap-2">
                      <span class="tabular-nums text-sm font-semibold text-gray-900">{{ formatMoney(line.due_amount) }}</span>
                      <span class="fk-chip" :class="statusChip(line.status)">{{ $t(`feesV2.status_${line.status}`) }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="sheet && hasFeeContent && !detailLoading && !detailError && sheet.installments?.length" class="fk-card">
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
              <h2 class="fk-card__title truncate">{{ $t('feesV2.schedule') }}</h2>
            </header>
            <ul class="divide-y divide-gray-100">
              <li
                v-for="inst in sheet.installments"
                :key="inst.id"
                class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div class="min-w-0">
                  <p class="font-medium text-gray-900">{{ installmentLabel(inst) }}</p>
                  <p v-if="inst.due_date" class="text-sm text-gray-500">{{ $t('feesV2.dueOn') }} {{ formatDay(inst.due_date) }}</p>
                  <p class="mt-0.5 text-sm tabular-nums text-gray-600">
                    {{ formatMoney(inst.amount_paid) }} / {{ formatMoney(inst.amount_due) }}
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="fk-chip"
                    :class="hasOpenInstallment(inst.id) ? 'fk-chip--amber' : statusChip(inst.status)"
                  >
                    <template v-if="settlementChipFor(inst.id) === 'waiting'">{{ $t('parentFees.waitingApproval') }}</template>
                    <template v-else-if="settlementChipFor(inst.id) === 'checkout'">{{ $t('parentFees.checkoutInProgress') }}</template>
                    <template v-else>{{ $t(`feesV2.status_${inst.status}`) }}</template>
                  </span>
                  <button
                    v-if="installmentRemaining(inst) > 0 && !hasOpenInstallment(inst.id)"
                    type="button"
                    class="fk-btn fk-btn--primary"
                    :disabled="paying"
                    @click="openPay(inst)"
                  >
                    {{ $t('parentFees.payNow') }}
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="sheet && hasFeeContent && !detailLoading && !detailError && payments.length" class="fk-card">
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
              <h2 class="fk-card__title truncate">{{ $t('parentFees.paymentHistory') }}</h2>
            </header>
            <ul class="divide-y divide-gray-100">
              <li
                v-for="p in payments"
                :key="p.id"
                class="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 sm:px-6"
              >
                <div class="min-w-0">
                  <p class="font-medium text-gray-900">{{ formatMoney(p.amount) }}</p>
                  <p class="text-sm text-gray-500">{{ $t(`parentFees.method_${p.method}`) }} · {{ formatDate(p.created_at) }}</p>
                </div>
                <span class="fk-chip" :class="payStatusChip(p.status)">
                  {{ $t(`parentFees.status_${parentFacingStatus(p.status)}`) }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>

    <FikrDialog
      :show="!!payTarget"
      plain-footer
      size="md"
      :title="$t('parentFees.payModalTitle')"
      @close="closePay"
    >
      <p class="text-2xl font-semibold tabular-nums text-gray-950">{{ formatMoney(payAmount) }}</p>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-lg border px-3 py-2.5 text-sm font-semibold"
          :class="payMethod === 'offline' ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 text-gray-700'"
          @click="payMethod = 'offline'"
        >
          {{ $t('parentFees.methodOffline') }}
        </button>
        <button
          type="button"
          class="rounded-lg border px-3 py-2.5 text-sm font-semibold"
          :class="payMethod === 'thawani' ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 text-gray-700'"
          @click="payMethod = 'thawani'"
        >
          {{ $t('parentFees.methodThawani') }}
        </button>
      </div>

      <div v-if="payMethod === 'offline'" class="mt-4 space-y-3">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600" for="parent-pay-proof">{{ $t('parentFees.attachReceipt') }}</label>
          <input
            id="parent-pay-proof"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            class="fk-field file:me-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-800"
            @change="onProofPicked"
          >
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600" for="parent-pay-remarks">{{ $t('feesV2.payRemarks') }}</label>
          <textarea
            id="parent-pay-remarks"
            v-model="payRemarks"
            rows="2"
            class="fk-field"
            :placeholder="$t('parentFees.remarksPlaceholder')"
          />
        </div>
      </div>

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
import { useFeedback } from '@/composables/useFeedback'
import { parentService } from '@/services/parent.service'
import { feesV2Service, type FeePayment, type StudentChargeSheet } from '@/services/fees-v2.service'
import { checkoutReturnUrls, openCheckoutPopup, watchCheckoutPopup } from '@/utils/thawaniCheckout'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const feedback = useFeedback()
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
const payTarget = ref<'upfront' | 'installment' | null>(null)
const payInstallmentId = ref<string | null>(null)
const payAmount = ref(0)
const payMethod = ref<'offline' | 'thawani'>('offline')
const payRemarks = ref('')
const proofFile = ref<File | null>(null)

const selectedChildName = computed(() => {
  const child = children.value.find((c) => c.id === selectedId.value)
  return child ? `${child.firstName} ${child.lastName}`.trim() : t('parentFees.title')
})

const hasFeeContent = computed(() => {
  if (!sheet.value) return false
  const due = Number(sheet.value.due_total || 0)
  const list = Number(sheet.value.list_total || 0)
  return Boolean(
    sheet.value.lines?.length ||
      sheet.value.installments?.length ||
      sheet.value.extraLines?.length ||
      sheet.value.inclusions?.length ||
      payments.value.length ||
      due > 0 ||
      list > 0,
  )
})

function installmentRemaining(inst: { amount_due: string; amount_paid: string }) {
  return Math.max(0, Number(inst.amount_due) - Number(inst.amount_paid))
}

function isSettlementPending(status: string) {
  return status === 'pending_approval' || status === 'pending_reconcile'
}

function isOpenPaymentStatus(status: string) {
  return status === 'pending' || isSettlementPending(status)
}

/** Parent-facing label: attachment settlement only — not open Thawani checkout. */
function parentFacingStatus(status: string) {
  if (isSettlementPending(status)) return 'pending_reconcile'
  return status
}

function hasOpenInstallment(id: string) {
  return payments.value.some((p) => p.installment_id === id && isOpenPaymentStatus(p.status))
}

function settlementChipFor(installmentId: string) {
  const open = payments.value.find(
    (p) => p.installment_id === installmentId && isOpenPaymentStatus(p.status),
  )
  if (!open) return null
  if (isSettlementPending(open.status)) return 'waiting'
  if (open.method === 'thawani' && open.status === 'pending') return 'checkout'
  return 'open'
}

function installmentLabel(inst: { label?: string; sequence: number }) {
  if (inst.label === 'upfront' || inst.sequence === 0) return t('feesV2.upfront')
  if (inst.label) return inst.label
  return t('parentFees.installmentDefaultLabel', { n: inst.sequence })
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

function statusChip(status: string) {
  if (status === 'paid') return 'fk-chip--green'
  if (status === 'partial') return 'fk-chip--amber'
  if (status === 'waived') return 'fk-chip--neutral'
  return 'fk-chip--outline'
}

function payStatusChip(status: string) {
  if (status === 'paid') return 'fk-chip--green'
  if (isOpenPaymentStatus(status)) return 'fk-chip--amber'
  if (status === 'rejected' || status === 'failed' || status === 'cancelled') return 'fk-chip--red'
  return 'fk-chip--outline'
}

function formatDate(v: string) {
  try {
    return new Date(v).toLocaleString(locale.value === 'ar' ? 'ar-OM' : 'en-OM')
  } catch {
    return v
  }
}

function formatDay(v: string) {
  try {
    const raw = String(v)
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw)
    return date.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-OM')
  } catch {
    return v
  }
}

function apiErrorCode(e: unknown): string {
  const err = e as {
    response?: {
      status?: number
      data?: {
        code?: string
        message?: string | string[] | { code?: string; message?: string }
        details?: unknown
      }
    }
  }
  const data = err.response?.data
  if (typeof data?.code === 'string' && data.code.trim()) return data.code.trim()
  const raw = data?.message
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && typeof raw.code === 'string') {
    return raw.code.trim()
  }
  const msg = Array.isArray(raw)
    ? raw.filter(Boolean).join(' ')
    : typeof raw === 'string'
      ? raw
      : raw && typeof raw === 'object' && typeof raw.message === 'string'
        ? raw.message
        : ''
  if (msg.includes('No active academic year')) return 'NO_ACTIVE_YEAR'
  if (msg.includes('assigned to a grade')) return 'STUDENT_NO_GRADE'
  if (msg === 'Not allowed') return 'FORBIDDEN'
  if (msg === 'Student not found' || msg === 'Charge sheet not found') return 'NOT_FOUND'
  if (err.response?.status === 403) return 'FORBIDDEN'
  if (err.response?.status === 404) return 'NOT_FOUND'
  return ''
}

function localizedLoadError(e: unknown, fallbackKey: string) {
  const code = apiErrorCode(e)
  if (code === 'NO_ACTIVE_YEAR') return t('parentFees.noActiveYear')
  if (code === 'STUDENT_NO_GRADE') return t('parentFees.noGrade')
  if (code === 'FORBIDDEN') return t('parentFees.notAllowed')
  if (code === 'NOT_FOUND') return t('parentFees.noFeeRecords')
  return t(fallbackKey)
}

async function loadChildren() {
  loadingChildren.value = true
  childrenError.value = ''
  try {
    const dash = await parentService.getMyDashboardData()
    children.value = (dash?.children ?? []).map((c: DashboardChild) => ({ ...c, id: String(c.id) }))
    if (!selectedId.value && children.value.length) selectedId.value = children.value[0].id
  } catch (e) {
    childrenError.value = localizedLoadError(e, 'parent.error')
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
    // Sheet first — payment list must not race a charge-sheet rebuild.
    const s = await feesV2Service.getStudentChargeSheet(studentId)
    sheet.value = s
    payments.value = await feesV2Service.listStudentPayments(studentId).catch(() => [])
    await syncPendingThawaniPayments()
  } catch (e) {
    detailError.value = localizedLoadError(e, 'parentFees.loadFailed')
  } finally {
    detailLoading.value = false
  }
}

/** If Thawani already collected money but confirm never ran, finish it on load/refresh. */
async function syncPendingThawaniPayments() {
  const pending = payments.value.filter((p) => p.method === 'thawani' && p.status === 'pending')
  if (!pending.length) return
  let changed = false
  for (const p of pending) {
    try {
      const confirmed = await feesV2Service.confirmThawaniPayment(p.id)
      if (confirmed.sheet) sheet.value = confirmed.sheet
      if (confirmed.paid) changed = true
    } catch {
      /* still unpaid / cancelled on Thawani */
    }
  }
  if (changed && selectedId.value) {
    payments.value = await feesV2Service.listStudentPayments(selectedId.value).catch(() => payments.value)
  }
}

function selectChild(id: string) {
  selectedId.value = id
}

function reloadDetail() {
  if (selectedId.value) loadDetailFor(selectedId.value)
}

function openPay(inst: { id: string; amount_due: string; amount_paid: string }) {
  payRemarks.value = ''
  proofFile.value = null
  payMethod.value = 'offline'
  payTarget.value = 'installment'
  payInstallmentId.value = inst.id
  payAmount.value = installmentRemaining(inst)
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
      feedback.success(t('parentFees.paySubmitted'))
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
    if (!session.checkout_url) throw new Error(t('parentFees.payFailed'))
    const paymentId = session.payment?.id
    if (!paymentId) throw new Error(t('parentFees.payFailed'))

    let usedPopup = false
    if (popup && !popup.closed) {
      try {
        popup.location.href = session.checkout_url
        usedPopup = true
      } catch {
        try {
          popup.close()
        } catch {
          /* ignore */
        }
      }
    }
    if (!usedPopup) {
      window.location.href = session.checkout_url
      return
    }

    await new Promise<void>((resolve) => {
      let done = false
      const finish = () => {
        if (done) return
        done = true
        clearInterval(poll)
        resolve()
      }
      watchCheckoutPopup(popup!, () => finish())
      const poll = setInterval(async () => {
        try {
          const mid = await feesV2Service.confirmThawaniPayment(paymentId)
          if (mid.paid) {
            if (mid.sheet) sheet.value = mid.sheet
            finish()
          }
        } catch {
          /* keep waiting for popup / next poll */
        }
      }, 2500)
    })
    const confirmed = await feesV2Service.confirmThawaniPayment(paymentId)
    if (confirmed.sheet) sheet.value = confirmed.sheet
    if (!confirmed.paid) {
      feedback.error(t('parentFees.thawaniNotPaid'), t('common.error'))
    } else {
      closePay()
      feedback.success(t('parentFees.paySubmitted'))
    }
    await reloadDetail()
  } catch (e) {
    const attachMissing = e instanceof Error && e.message === t('parentFees.attachReceipt')
    feedback.error(attachMissing ? t('parentFees.attachReceipt') : localizedLoadError(e, 'parentFees.payFailed'), t('common.error'))
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
