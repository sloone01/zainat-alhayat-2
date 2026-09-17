<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('parentFees.title')" />

      <div v-if="loadingChildren" class="flex items-center justify-center gap-3 py-12 text-gray-600">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="childrenError">
        <ActivityCard :title="$t('parentFees.title')">
          <template #icon>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </template>
          <template #list>
            <div class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center">
              <p class="text-sm font-semibold text-zinc-800">{{ childrenError }}</p>
              <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadChildren">{{ $t('common.retry') }}</button>
            </div>
          </template>
        </ActivityCard>
      </div>

      <template v-else>
        <div v-if="!children.length">
          <ActivityCard :title="$t('parentFees.title')">
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
              </svg>
            </template>
            <template #list>
              <div class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center">
                <p class="text-sm font-semibold text-zinc-800">{{ $t('parentFees.noChildren') }}</p>
              </div>
            </template>
          </ActivityCard>
        </div>

        <div v-else class="space-y-6">
          <ActivityCard
            v-if="children.length > 1"
            :title="$t('parent.myChildren')"
          >
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </template>
            <template #list>
              <button
                v-for="c in children"
                :key="c.id"
                type="button"
                class="flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-start transition-colors duration-200"
                :class="selectedId === c.id
                  ? 'border-primary-300 bg-primary-50/70'
                  : 'border-zinc-200/50 bg-zinc-50 hover:border-zinc-300'"
                @click="selectChild(c.id)"
              >
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  :class="selectedId === c.id ? 'bg-primary-600' : 'bg-zinc-400'"
                >
                  {{ initials(c) }}
                </span>
                <span class="min-w-0 truncate text-sm font-medium text-zinc-800">
                  {{ c.firstName }} {{ c.lastName }}
                </span>
              </button>
            </template>
          </ActivityCard>

          <ActivityCard
            :title="selectedChildName"
            :category="sheet?.student?.paymentLevel?.name"
            :metrics="detailLoading || detailError || !hasFeeContent ? [] : sheetMetrics"
          >
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </template>

            <div v-if="detailLoading" class="flex flex-col items-center justify-center gap-3 py-10 text-zinc-600">
              <FikrLoader />
              <span class="text-sm">{{ $t('parentFees.loadingDetail') }}</span>
            </div>

            <div
              v-else-if="detailError"
              class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center"
            >
              <p class="text-sm font-semibold text-zinc-800">{{ detailError }}</p>
              <button type="button" class="fk-btn fk-btn--primary mt-4" @click="reloadDetail">{{ $t('common.retry') }}</button>
            </div>

            <div
              v-else-if="!hasFeeContent"
              class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center"
            >
              <p class="text-sm font-semibold text-zinc-800">{{ $t('parentFees.noFeeRecords') }}</p>
            </div>

            <template v-else-if="sheet">
              <div class="space-y-6">
              <div v-if="pricedRows.length" class="space-y-3">
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-2 text-start text-sm font-medium text-zinc-700"
                  :aria-expanded="breakdownOpen"
                  @click="breakdownOpen = !breakdownOpen"
                >
                  <svg
                    class="h-4 w-4 shrink-0 transition-transform duration-200"
                    :class="breakdownOpen ? 'rotate-90 rtl:rotate-[-90deg]' : ''"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  {{ $t('parentFees.pricedBreakdown') }}
                </button>
                <div v-if="breakdownOpen" class="overflow-hidden rounded-xl border border-zinc-200">
                  <table class="w-full text-sm">
                    <tbody>
                      <tr
                        v-for="row in pricedRows"
                        :key="row.id"
                        class="border-b border-zinc-100 last:border-0"
                      >
                        <td class="px-4 py-3 font-medium text-zinc-800">{{ row.label }}</td>
                        <td class="px-4 py-3 text-end">
                          <span
                            class="whitespace-nowrap font-semibold tabular-nums"
                            :class="pricedAmountClass(row.kind)"
                          >
                            {{ pricedAmountLabel(row) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="sheet.installments?.length">
                <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ $t('feesV2.schedule') }}</h3>
                <RadioGroup
                  v-model="selectedScheduleId"
                  class="gap-2"
                  :aria-label="$t('feesV2.schedule')"
                >
                  <div
                    v-for="inst in sheet.installments"
                    :key="inst.id"
                    class="relative flex w-full items-center gap-3 rounded-xl border p-4 shadow-sm transition-colors duration-200"
                    :class="scheduleCardClass(inst)"
                  >
                    <RadioGroupItem
                      v-if="canSelectInstallment(inst)"
                      :id="`schedule-${inst.id}`"
                      :value="inst.id"
                      :aria-describedby="`schedule-${inst.id}-desc`"
                      class="after:absolute after:inset-0"
                    />
                    <span
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      :class="scheduleIconClass(inst)"
                      aria-hidden="true"
                    >
                      <svg
                        v-if="inst.status === 'paid'"
                        class="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <svg
                        v-else-if="inst.sequence === 0"
                        class="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                      <svg
                        v-else
                        class="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 6.75h15A1.5 1.5 0 0121 8.25v11.25A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V8.25A1.5 1.5 0 014.5 6.75z" />
                      </svg>
                    </span>
                    <div class="min-w-0 flex-1">
                      <UiLabel :html-for="canSelectInstallment(inst) ? `schedule-${inst.id}` : undefined" class="flex flex-wrap items-baseline gap-x-2">
                        <span>{{ installmentLabel(inst) }}</span>
                        <span
                          v-if="canSelectInstallment(inst)"
                          class="text-xs font-normal leading-[inherit] text-gray-500"
                        >
                          {{ formatMoney(installmentRemaining(inst)) }}
                        </span>
                      </UiLabel>
                      <p :id="`schedule-${inst.id}-desc`" class="mt-1 text-xs tabular-nums text-gray-500">
                        <template v-if="inst.due_date">{{ $t('feesV2.dueOn') }} {{ formatDay(inst.due_date) }} · </template>
                        {{ formatMoney(inst.amount_paid) }} / {{ formatMoney(inst.amount_due) }}
                      </p>
                    </div>
                    <div class="relative z-10 flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <span
                        v-if="scheduleEndChip(inst)"
                        class="fk-chip fk-chip--amber"
                      >
                        <template v-if="scheduleEndChip(inst) === 'waiting'">{{ $t('parentFees.waitingApproval') }}</template>
                        <template v-else>{{ $t('parentFees.checkoutInProgress') }}</template>
                      </span>
                      <button
                        v-if="selectedScheduleId === inst.id && canSelectInstallment(inst)"
                        type="button"
                        class="fk-btn fk-btn--primary fk-btn--sm"
                        :disabled="paying"
                        @click.stop="openPay(inst)"
                      >
                        {{ $t('parentFees.payNow') }}
                      </button>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              </div>
            </template>
          </ActivityCard>
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

    <ThawaniCheckoutSheet
      :visible="checkoutSheetOpen"
      :checkout-url="checkoutSheetUrl"
      @success="onCheckoutSheetDone('success')"
      @cancel="onCheckoutSheetDone('cancel')"
      @error="onCheckoutSheetDone('closed')"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ThawaniCheckoutSheet from '@/components/ThawaniCheckoutSheet.vue'
import RadioGroup from '@/components/ui/radio-group.vue'
import RadioGroupItem from '@/components/ui/radio-group-item.vue'
import UiLabel from '@/components/ui/label.vue'
import ActivityCard, { type ActivityMetric } from '@/components/ui/activity-card.vue'
import { useFeedback } from '@/composables/useFeedback'
import { parentService } from '@/services/parent.service'
import { feesV2Service, type ChargeSheetInstallment, type FeePayment, type StudentChargeSheet } from '@/services/fees-v2.service'
import {
  checkoutReturnUrls,
  isNativeCheckout,
  openCheckoutPopup,
  openNativeCheckout,
  watchCheckoutPopup,
  type CheckoutOutcome,
} from '@/utils/thawaniCheckout'
import FikrLoader from '@/components/FikrLoader.vue'

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
const selectedScheduleId = ref('')
const checkoutSheetOpen = ref(false)
const checkoutSheetUrl = ref<string | null>(null)
let sheetWait: ((outcome: CheckoutOutcome) => void) | null = null

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

type PricedKind = 'charge' | 'extra' | 'discount' | 'included'

interface PricedRow {
  id: string
  label: string
  kind: PricedKind
  amount: number | null
}

const breakdownOpen = ref(true)

const pricedRows = computed<PricedRow[]>(() => {
  const s = sheet.value
  if (!s) return []
  const rows: PricedRow[] = []

  for (const line of s.lines || []) {
    rows.push({
      id: `charge-${line.id}`,
      label: line.charge_label,
      kind: 'charge',
      amount: Number(line.due_amount || 0),
    })
  }

  const extras = s.extraLines || []
  if (extras.length) {
    for (const extra of extras) {
      rows.push({
        id: `extra-${extra.id}`,
        label: extra.extraType?.label || extra.extra_type_id,
        kind: 'extra',
        amount: Number(extra.amount || 0),
      })
    }
  } else if (Number(s.extra_total) > 0) {
    rows.push({
      id: 'extra-total',
      label: t('feesV2.extras'),
      kind: 'extra',
      amount: Number(s.extra_total),
    })
  }

  const discounts = s.discountLines || []
  if (discounts.length) {
    for (const discount of discounts) {
      rows.push({
        id: `discount-${discount.id}`,
        label: discount.discountType?.label || discount.discount_type_id,
        kind: 'discount',
        amount: Number(discount.amount || 0),
      })
    }
  } else if (Number(s.discount_total) > 0) {
    rows.push({
      id: 'discount-total',
      label: t('feesV2.discounts'),
      kind: 'discount',
      amount: Number(s.discount_total),
    })
  }

  for (const item of s.inclusions || []) {
    rows.push({
      id: `included-${item.id}`,
      label: item.label,
      kind: 'included',
      amount: null,
    })
  }

  return rows
})

function pricedAmountLabel(row: PricedRow) {
  if (row.kind === 'included') return t('feesV2.inclusions')
  const money = formatMoney(row.amount ?? 0)
  if (row.kind === 'extra') return `+${money}`
  if (row.kind === 'discount') return `−${money}`
  return money
}

function pricedAmountClass(kind: PricedKind) {
  if (kind === 'extra') return 'text-violet-700'
  if (kind === 'discount') return 'text-amber-700'
  if (kind === 'included') return 'text-emerald-700'
  return 'text-zinc-900'
}

const RING_VALUE = 'text-[13px] font-bold tabular-nums text-zinc-900 sm:text-sm'

const sheetMetrics = computed<ActivityMetric[]>(() => {
  if (!sheet.value) return []
  const list = Number(sheet.value.list_total || 0)
  const paid = Number(sheet.value.paid_total || 0)
  const due = Number(sheet.value.due_total || 0)
  const base = Math.max(list, paid + due, 1)
  const pct = (n: number) => Math.round((n / base) * 100)
  return [
    {
      key: 'list',
      label: t('feesV2.totalList'),
      value: formatRingAmount(list),
      trend: list > 0 ? 100 : 0,
      color: '#007AFF',
      valueClass: RING_VALUE,
    },
    {
      key: 'paid',
      label: t('feesV2.paid'),
      value: formatRingAmount(paid),
      trend: pct(paid),
      color: '#2CD758',
      valueClass: RING_VALUE,
    },
    {
      key: 'due',
      label: t('feesV2.due'),
      value: formatRingAmount(due),
      trend: pct(due),
      color: '#00A19B',
      valueClass: RING_VALUE,
    },
  ]
})

function installmentRemaining(inst: { amount_due: string; amount_paid: string }) {
  return Math.max(0, Number(inst.amount_due) - Number(inst.amount_paid))
}

function canSelectInstallment(inst: ChargeSheetInstallment) {
  return installmentRemaining(inst) > 0 && !hasOpenInstallment(inst.id)
}

function scheduleEndChip(inst: ChargeSheetInstallment): 'waiting' | 'checkout' | null {
  const open = settlementChipFor(inst.id)
  if (open === 'waiting' || open === 'checkout') return open
  return null
}

function scheduleCardClass(inst: ChargeSheetInstallment) {
  if (scheduleEndChip(inst) === 'waiting' || scheduleEndChip(inst) === 'checkout') {
    return 'border-amber-200 bg-amber-50/40'
  }
  if (selectedScheduleId.value === inst.id) return 'border-primary-500 bg-primary-50/30'
  return 'border-gray-200 bg-white'
}

function scheduleIconClass(inst: ChargeSheetInstallment) {
  if (inst.status === 'paid') return 'bg-emerald-100 text-emerald-700'
  if (inst.sequence === 0) return 'bg-primary-50 text-primary-700'
  return 'bg-navy-50 text-navy-700'
}

function isSettlementPending(status: string) {
  return status === 'pending_approval' || status === 'pending_reconcile'
}

function isOpenPaymentStatus(status: string) {
  return status === 'pending' || isSettlementPending(status)
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

function formatRingAmount(v: string | number) {
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(Number(v || 0))
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

function closeCheckoutSheet() {
  checkoutSheetOpen.value = false
  checkoutSheetUrl.value = null
  sheetWait = null
}

function onCheckoutSheetDone(outcome: CheckoutOutcome) {
  const done = sheetWait
  closeCheckoutSheet()
  done?.(outcome)
}

function waitForCheckout(
  paymentId: string,
  listen: (onDone: (outcome: CheckoutOutcome) => void) => void,
) {
  return new Promise<void>((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      clearInterval(poll)
      resolve()
    }
    listen(() => finish())
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

    const native = isNativeCheckout()
    const popup = native ? null : openCheckoutPopup()
    if (!native && !(popup && !popup.closed)) {
      checkoutSheetOpen.value = true
      checkoutSheetUrl.value = null
    }
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

    if (native) {
      await waitForCheckout(paymentId, (onDone) => {
        void openNativeCheckout(session.checkout_url, t('parentFees.checkoutTitle'), onDone).catch(() => {
          checkoutSheetOpen.value = true
          checkoutSheetUrl.value = session.checkout_url
          sheetWait = onDone
        })
      })
    } else if (popup && !popup.closed) {
      try {
        popup.location.replace(session.checkout_url)
        await waitForCheckout(paymentId, (onDone) => watchCheckoutPopup(popup, onDone))
      } catch {
        try {
          popup.close()
        } catch {
          /* ignore */
        }
        checkoutSheetOpen.value = true
        checkoutSheetUrl.value = session.checkout_url
        await waitForCheckout(paymentId, (onDone) => {
          sheetWait = onDone
        })
      }
    } else {
      checkoutSheetUrl.value = session.checkout_url
      await waitForCheckout(paymentId, (onDone) => {
        sheetWait = onDone
      })
    }

    const confirmed = await feesV2Service.confirmThawaniPayment(paymentId)
    closeCheckoutSheet()
    if (confirmed.sheet) sheet.value = confirmed.sheet
    if (!confirmed.paid) {
      feedback.error(t('parentFees.thawaniNotPaid'), t('common.error'))
    } else {
      closePay()
      feedback.success(t('parentFees.paySubmitted'))
    }
    await reloadDetail()
  } catch (e) {
    closeCheckoutSheet()
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

watch(
  () => sheet.value?.installments,
  (list) => {
    const rows = list || []
    if (!rows.length) {
      selectedScheduleId.value = ''
      return
    }
    if (rows.some((inst) => inst.id === selectedScheduleId.value)) return
    selectedScheduleId.value = rows.find((inst) => canSelectInstallment(inst))?.id || rows[0].id
  },
)

watch(selectedId, (id) => {
  breakdownOpen.value = true
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
