<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('parentFees.title')" />

      <div v-if="loadingChildren" class="flex items-center justify-center gap-3 py-12 text-gray-600">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="childrenError" class="fk-elev">
        <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
          <p class="text-sm font-semibold text-navy-800">{{ childrenError }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="loadChildren">{{ $t('common.retry') }}</button>
        </div>
      </div>

      <template v-else>
        <div v-if="!children.length" class="fk-elev">
          <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
            <p class="text-sm font-semibold text-navy-800">{{ $t('parentFees.noChildren') }}</p>
          </div>
        </div>

        <!-- Mobile: keep the existing schedule-first layout -->
        <div class="mx-auto w-full max-w-lg space-y-5 px-1 sm:max-w-none sm:space-y-6 xl:hidden">
          <div v-if="children.length > 1" class="flex flex-wrap gap-3">
            <button
              v-for="c in children"
              :key="c.id"
              type="button"
              class="fk-fchip"
              :class="selectedId === c.id ? 'fk-fchip--active' : ''"
              :aria-pressed="selectedId === c.id"
              @click="selectChild(c.id)"
            >
              {{ c.firstName }} {{ c.lastName }}
            </button>
          </div>

          <div v-if="detailLoading" class="flex flex-col items-center justify-center gap-3 py-10 text-zinc-600">
            <FikrLoader />
            <span class="text-sm">{{ $t('parentFees.loadingDetail') }}</span>
          </div>

          <div v-else-if="detailError" class="fk-elev">
            <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
              <p class="text-sm font-semibold text-navy-800">{{ detailError }}</p>
              <button type="button" class="fk-btn fk-btn--navy mt-4" @click="reloadDetail">{{ $t('common.retry') }}</button>
            </div>
          </div>

          <div v-else-if="!hasFeeContent" class="fk-elev">
            <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
              <p class="text-sm font-semibold text-navy-800">{{ $t('parentFees.noFeeRecords') }}</p>
            </div>
          </div>

          <template v-else-if="sheet">
            <section class="fk-elev flex flex-col gap-2" :aria-label="$t('parentFees.title')">
              <div class="grid gap-2 sm:grid-cols-3">
              <div class="fk-tile">
                <span class="fk-tile__label">{{ $t('parentFees.remainingOnPlan') }}</span>
                <span class="fk-tile__value fk-tile__value--lead" dir="ltr">{{ formatPlainMoney(dueTotal) }}</span>
              </div>
              <div class="fk-tile">
                <span class="fk-tile__label">{{ $t('parentFees.paidSoFar') }}</span>
                <span class="fk-tile__value" dir="ltr">{{ formatPlainMoney(paidTotal) }}</span>
              </div>
              <div class="fk-tile">
                <span class="fk-tile__label">{{ yearTotalLabel }}</span>
                <span class="fk-tile__value" dir="ltr">{{ formatPlainMoney(listTotal) }}</span>
              </div>
              </div>
              <button
                v-if="nextPayable"
                type="button"
                class="fk-btn fk-btn--navy fk-btn--lg mt-1 w-full"
                :disabled="paying"
                @click="openPayFor(selectedId!, nextPayable)"
              >
                {{ $t('parentFees.settleCta', { label: installmentLabel(nextPayable), amount: formatMoney(installmentRemaining(nextPayable)) }) }}
              </button>
            </section>

            <section v-if="overdueInstallment" class="fk-promo" role="status">
              <p class="fk-promo__eyebrow">{{ $t('reports.daysOverdue', { n: overdueDays(overdueInstallment) }) }}</p>
              <h2 class="fk-promo__title">
                {{ $t('parentFees.lateNoticeTitle', { label: installmentLabel(overdueInstallment) }) }}
              </h2>
              <p class="fk-promo__body">
                {{ $t('parentFees.lateNoticeBody', { date: formatDay(overdueInstallment.due_date || '') }) }}
              </p>
              <div class="fk-promo__actions">
                <button
                  type="button"
                  class="fk-btn fk-btn--white"
                  :disabled="paying"
                  @click="openPayFor(selectedId!, overdueInstallment, 'thawani')"
                >
                  {{ $t('parentFees.payNow') }}
                </button>
                <button
                  type="button"
                  class="fk-btn fk-btn--ondark"
                  :disabled="paying"
                  @click="openPayFor(selectedId!, overdueInstallment, 'offline')"
                >
                  {{ $t('parentFees.uploadReceipt') }}
                </button>
              </div>
            </section>

            <section v-if="sheet.installments?.length" :aria-label="$t('feesV2.schedule')">
              <h2 class="fk-display mb-1 text-xl font-bold leading-7 text-navy-800">{{ $t('feesV2.schedule') }}</h2>
              <div class="flex flex-col">
                <div
                  v-for="inst in paginatedMobileInstallments"
                  :key="inst.id"
                  class="fk-sched__row"
                >
                  <span class="fk-sched__dot" :class="dotClass(inst)" aria-hidden="true">{{ dotGlyph(inst) }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="fk-sched__title" :class="rowState(inst) === 'future' ? 'text-fikr-ink-muted' : ''">
                      {{ installmentLabel(inst) }}
                    </p>
                    <p
                      class="fk-sched__meta"
                      :class="rowState(inst) === 'late' ? 'font-medium text-navy-800' : ''"
                    >
                      <template v-if="rowState(inst) === 'late'">
                        {{ $t('reports.daysOverdue', { n: overdueDays(inst) }) }}
                      </template>
                      <template v-else-if="rowState(inst) === 'wait'">
                        <template v-if="settlementChipFor(inst.id) === 'waiting'">{{ $t('parentFees.waitingApproval') }}</template>
                        <template v-else>{{ $t('parentFees.checkoutInProgress') }}</template>
                      </template>
                      <template v-else>
                        <template v-if="inst.due_date">{{ $t('feesV2.dueOn') }} {{ formatDay(inst.due_date) }} · </template>{{ formatPlainMoney(inst.amount_paid) }} / {{ formatPlainMoney(inst.amount_due) }}
                      </template>
                    </p>
                  </div>
                  <button
                    v-if="rowState(inst) === 'late' || rowState(inst) === 'payable'"
                    type="button"
                    class="fk-btn fk-btn--sm"
                    :class="rowState(inst) === 'late' ? 'fk-btn--navy' : 'fk-btn--mist'"
                    :disabled="paying"
                    @click="openPayFor(selectedId!, inst)"
                  >
                    {{ $t('parentFees.payAmountCta', { amount: formatPlainMoney(installmentRemaining(inst)) }) }}
                  </button>
                  <span
                    v-else
                    class="fk-sched__amount"
                    :class="rowState(inst) === 'future' ? 'text-fikr-ink-soft' : rowState(inst) === 'paid' ? 'text-fikr-ink-muted' : ''"
                    dir="ltr"
                  >
                    {{ formatPlainMoney(inst.amount_due) }}
                  </span>
                </div>
              </div>
              <FikrPagination
                :page="mobileInstallmentPage"
                :pages="mobileInstallmentPages"
                :show="(sheet.installments?.length || 0) > 0"
                @update:page="goToMobileInstallmentPage"
              />
            </section>

            <section v-if="pricedRows.length" class="fk-soft" :aria-label="$t('parentFees.feeBreakdown')">
              <p class="mb-2 text-base font-medium text-navy-800">{{ $t('parentFees.feeBreakdown') }}</p>
              <div class="flex flex-col gap-2">
                <div v-for="row in pricedRows" :key="row.id" class="fk-soft__row">
                  <span class="text-fikr-ink-muted">{{ row.label }}</span>
                  <span :class="pricedAmountClass(row.kind)" dir="ltr">{{ pricedAmountLabel(row) }}</span>
                </div>
                <div class="fk-soft__row fk-soft__row--total">
                  <span>{{ $t('feesV2.totalList') }}</span>
                  <span dir="ltr">{{ formatMoney(listTotal) }}</span>
                </div>
              </div>
            </section>
          </template>
        </div>

        <!-- Desktop: due/late board customized for the parent's kids -->
        <section class="fk-elev hidden overflow-hidden p-0 xl:block">
          <div v-if="desktopLoading" class="flex flex-col items-center justify-center gap-3 py-20 text-fikr-ink-muted">
            <FikrLoader />
            <span class="text-sm">{{ $t('parentFees.loadingDetail') }}</span>
          </div>

          <div v-else-if="desktopError" class="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p class="text-sm font-semibold text-navy-800">{{ desktopError }}</p>
            <button type="button" class="fk-btn fk-btn--navy mt-4" @click="loadAllChildFees">{{ $t('common.retry') }}</button>
          </div>

          <template v-else>
            <div class="grid items-start gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] xl:items-center xl:px-8">
              <div class="min-w-0">
                <p class="text-sm leading-5 text-fikr-ink-muted">
                  {{ $t('parentFees.desktopHeroMeta', { date: formatDay(todayIso), count: children.length }) }}
                </p>
                <h2 class="fk-display mt-2 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl xl:text-5xl xl:leading-[64px]">
                  {{ $t('parentFees.desktopHeroUnpaid', { amount: formatPlainMoney(familyDueTotal) }) }}
                </h2>
                <p class="mt-2 text-lg font-medium leading-6 text-fikr-ink-muted">
                  {{ $t('parentFees.desktopHeroSubtitle', {
                    late: formatPlainMoney(familyLateTotal),
                    dueToday: formatPlainMoney(familyDueTodayTotal),
                  }) }}
                </p>
                <div class="mt-6 flex flex-wrap gap-2.5">
                  <button
                    v-for="chip in bucketChips"
                    :key="chip.id"
                    type="button"
                    class="fk-fchip"
                    :class="desktopBucket === chip.id ? 'fk-fchip--active' : ''"
                    @click="desktopBucket = chip.id"
                  >
                    {{ chip.label }} · {{ chip.count }}
                  </button>
                </div>
              </div>

              <div class="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,.16)]">
                <div class="flex flex-col gap-2">
                  <div v-if="children.length > 1" class="flex flex-wrap gap-2 rounded-lg bg-fikr-mist p-3">
                    <button
                      type="button"
                      class="fk-fchip"
                      :class="desktopChildFilter === 'all' ? 'fk-fchip--active' : ''"
                      @click="desktopChildFilter = 'all'"
                    >
                      {{ $t('parentFees.allChildren') }}
                    </button>
                    <button
                      v-for="c in children"
                      :key="c.id"
                      type="button"
                      class="fk-fchip"
                      :class="desktopChildFilter === c.id ? 'fk-fchip--active' : ''"
                      @click="desktopChildFilter = c.id"
                    >
                      {{ c.firstName }}
                    </button>
                  </div>
                  <div class="flex items-center justify-between rounded-lg bg-fikr-mist px-4 py-4 text-base">
                    <span class="text-fikr-ink-muted">{{ $t('parentFees.paidSoFar') }}</span>
                    <span class="font-medium tabular-nums text-navy-800" dir="ltr">{{ formatPlainMoney(familyPaidTotal) }}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-lg bg-fikr-mist px-4 py-4 text-base">
                    <span class="text-fikr-ink-muted">{{ $t('parentFees.remainingOnPlan') }}</span>
                    <span class="font-medium tabular-nums text-navy-800" dir="ltr">{{ formatPlainMoney(familyDueTotal) }}</span>
                  </div>
                  <button
                    v-if="desktopNextPayable"
                    type="button"
                    class="fk-btn fk-btn--navy mt-1 w-full"
                    :disabled="paying"
                    @click="openPayFor(desktopNextPayable.studentId, desktopNextPayable.installment)"
                  >
                    {{ $t('parentFees.settleCta', {
                      label: installmentLabel(desktopNextPayable.installment),
                      amount: formatMoney(desktopNextPayable.remaining),
                    }) }}
                  </button>
                </div>
              </div>
            </div>

            <div class="px-4 pb-4 sm:px-6 xl:px-8">
              <div v-if="!filteredDesktopRows.length" class="py-16 text-center text-sm text-fikr-ink-muted">
                {{ $t('parentFees.desktopEmptyBucket') }}
              </div>
              <div v-else class="-mx-4 overflow-x-auto sm:mx-0">
                <table class="fk-feetable min-w-[720px] w-full sm:min-w-full">
                  <thead>
                    <tr>
                      <th>{{ $t('progressTracking.studentName') }}</th>
                      <th>{{ $t('feesV2.installment') }}</th>
                      <th>{{ $t('feesV2.dueOn') }}</th>
                      <th class="!text-end">{{ $t('reports.balance') }}</th>
                      <th>{{ $t('feesV2.status') }}</th>
                      <th class="!text-end">{{ $t('common.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in paginatedDesktopRows" :key="row.key">
                      <td>
                        <div class="font-medium text-navy-800">{{ row.studentName }}</div>
                        <div class="text-xs text-fikr-ink-muted">{{ row.metaLine }}</div>
                      </td>
                      <td>{{ installmentLabel(row.installment) }}</td>
                      <td>{{ row.installment.due_date ? formatDay(row.installment.due_date) : '—' }}</td>
                      <td class="text-end font-medium tabular-nums" dir="ltr">
                        {{ formatPlainMoney(row.remaining) }}
                        <span v-if="Number(row.installment.amount_paid) > 0" class="font-normal text-fikr-ink-soft">
                          / {{ formatPlainMoney(row.installment.amount_due) }}
                        </span>
                      </td>
                      <td>
                        <span v-if="row.bucket === 'late'" class="fk-pill fk-pill--navy">
                          {{ $t('reports.daysOverdue', { n: overdueDays(row.installment) }) }}
                        </span>
                        <span v-else-if="row.bucket === 'due'" class="fk-pill fk-pill--outline">
                          {{ $t('reports.bucket_due') }}
                        </span>
                        <span v-else-if="row.bucket === 'partial'" class="fk-pill fk-pill--outline">
                          {{ $t('parentFees.partiallyPaid') }}
                        </span>
                        <span v-else-if="row.bucket === 'wait'" class="fk-pill fk-pill--outline">
                          {{ $t('parentFees.waitingApproval') }}
                        </span>
                        <span v-else class="text-fikr-ink-muted">
                          {{ upcomingLabel(row.installment) }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button
                          v-if="row.bucket !== 'wait'"
                          type="button"
                          class="fk-btn fk-btn--mist fk-btn--sm"
                          :disabled="paying"
                          @click="openPayFor(row.studentId, row.installment)"
                        >
                          {{ $t('parentFees.payNow') }}
                        </button>
                        <span v-else class="text-fikr-ink-soft">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <FikrPagination
                :page="desktopPage"
                :pages="desktopPages"
                :show="filteredDesktopRows.length > 0"
                @update:page="goToDesktopPage"
              />
            </div>

            <div class="grid gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 xl:grid-cols-2 xl:gap-8 xl:px-8">
              <div v-if="desktopLatePromo" class="fk-promo !p-6">
                <p class="fk-promo__eyebrow">{{ $t('reports.daysOverdue', { n: overdueDays(desktopLatePromo.installment) }) }}</p>
                <h2 class="fk-promo__title">
                  {{ desktopLatePromo.studentName }} · {{ installmentLabel(desktopLatePromo.installment) }}
                </h2>
                <p class="fk-promo__body">
                  {{ $t('parentFees.lateNoticeBody', { date: formatDay(desktopLatePromo.installment.due_date || '') }) }}
                </p>
                <div class="fk-promo__actions">
                  <button
                    type="button"
                    class="fk-btn fk-btn--white"
                    :disabled="paying"
                    @click="openPayFor(desktopLatePromo.studentId, desktopLatePromo.installment, 'thawani')"
                  >
                    {{ $t('parentFees.payNow') }}
                  </button>
                  <button
                    type="button"
                    class="fk-btn fk-btn--ondark"
                    :disabled="paying"
                    @click="openPayFor(desktopLatePromo.studentId, desktopLatePromo.installment, 'offline')"
                  >
                    {{ $t('parentFees.uploadReceipt') }}
                  </button>
                </div>
              </div>
              <div v-else-if="pendingReceiptCount" class="fk-promo !p-6">
                <p class="fk-promo__eyebrow">{{ $t('parentFees.waitingApproval') }}</p>
                <h2 class="fk-promo__title">
                  {{ $t('parentFees.pendingReceiptsTitle', { count: pendingReceiptCount }) }}
                </h2>
              </div>
              <div v-else class="fk-soft !p-6">
                <h2 class="fk-display text-2xl font-bold leading-8 text-navy-800">{{ $t('parentFees.paidSoFar') }}</h2>
                <p class="mt-4 fk-display text-3xl font-bold tabular-nums text-navy-800" dir="ltr">{{ formatPlainMoney(familyPaidTotal) }}</p>
              </div>

              <div class="fk-soft !p-6">
                <h2 class="fk-display text-2xl font-bold leading-8 text-navy-800">{{ $t('parentFees.feeBreakdown') }}</h2>
                <div v-if="desktopChildFilter === 'all' && children.length > 1" class="mt-4 flex flex-col gap-2">
                  <div
                    v-for="row in familyChildSummaries"
                    :key="row.studentId"
                    class="fk-soft__row"
                  >
                    <span class="text-fikr-ink-muted">{{ row.name }}</span>
                    <span class="tabular-nums text-navy-800" dir="ltr">{{ formatPlainMoney(row.due) }}</span>
                  </div>
                  <div class="fk-soft__row fk-soft__row--total">
                    <span>{{ $t('parentFees.remainingOnPlan') }}</span>
                    <span dir="ltr">{{ formatMoney(familyDueTotal) }}</span>
                  </div>
                </div>
                <div v-else-if="desktopBreakdownChild" class="mt-4 flex flex-col gap-2">
                  <p class="text-sm font-medium text-navy-800">
                    {{ desktopBreakdownChild.firstName }} {{ desktopBreakdownChild.lastName }}
                  </p>
                  <div v-for="row in desktopPricedRows" :key="row.id" class="fk-soft__row">
                    <span class="text-fikr-ink-muted">{{ row.label }}</span>
                    <span :class="pricedAmountClass(row.kind)" dir="ltr">{{ pricedAmountLabel(row) }}</span>
                  </div>
                  <div class="fk-soft__row fk-soft__row--total">
                    <span>{{ $t('feesV2.totalList') }}</span>
                    <span dir="ltr">{{ formatMoney(desktopBreakdownListTotal) }}</span>
                  </div>
                </div>
                <p v-else class="mt-3 text-sm text-fikr-ink-muted">{{ $t('parentFees.noFeeRecords') }}</p>
              </div>
            </div>
          </template>
        </section>
      </template>
    </div>

    <FikrDialog
      :show="!!payTarget"
      plain-footer
      size="md"
      :title="$t('parentFees.payModalTitle')"
      @close="closePay"
    >
      <p class="fk-display text-2xl font-bold tabular-nums text-navy-800">{{ formatMoney(payAmount) }}</p>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-lg border px-3 py-2.5 text-sm font-semibold"
          :class="payMethod === 'offline' ? 'border-navy-800 bg-navy-50 text-navy-800' : 'border-gray-200 text-gray-700'"
          @click="payMethod = 'offline'"
        >
          {{ $t('parentFees.methodOffline') }}
        </button>
        <button
          type="button"
          class="rounded-lg border px-3 py-2.5 text-sm font-semibold"
          :class="payMethod === 'thawani' ? 'border-navy-800 bg-navy-50 text-navy-800' : 'border-gray-200 text-gray-700'"
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
            class="fk-field file:me-3 file:rounded-md file:border-0 file:bg-navy-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy-800"
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
        <button type="button" class="fk-btn fk-btn--mist" @click="closePay">
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          class="fk-btn fk-btn--navy"
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
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'

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
const payStudentId = ref<string | null>(null)
const payInstallmentId = ref<string | null>(null)
const payAmount = ref(0)
const payMethod = ref<'offline' | 'thawani'>('offline')
const payRemarks = ref('')
const proofFile = ref<File | null>(null)
const checkoutSheetOpen = ref(false)
const checkoutSheetUrl = ref<string | null>(null)
let sheetWait: ((outcome: CheckoutOutcome) => void) | null = null

type DesktopBucket = 'all' | 'late' | 'due' | 'partial' | 'upcoming' | 'wait'
type PricedKind = 'charge' | 'extra' | 'discount' | 'included'

interface PricedRow {
  id: string
  label: string
  kind: PricedKind
  amount: number | null
}

interface ChildFeeBundle {
  studentId: string
  sheet: StudentChargeSheet | null
  payments: FeePayment[]
}

interface DesktopFeeRow {
  key: string
  studentId: string
  studentName: string
  metaLine: string
  installment: ChargeSheetInstallment
  remaining: number
  bucket: Exclude<DesktopBucket, 'all'>
}

const familyBundles = ref<ChildFeeBundle[]>([])
const desktopLoading = ref(false)
const desktopError = ref('')
const desktopBucket = ref<DesktopBucket>('all')
const desktopChildFilter = ref<string>('all')

const todayIso = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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

const dueTotal = computed(() => Number(sheet.value?.due_total || 0))
const paidTotal = computed(() => Number(sheet.value?.paid_total || 0))
const listTotal = computed(() => Number(sheet.value?.list_total || 0))

const yearTotalLabel = computed(() => {
  const year = (sheet.value as { academicYear?: { name?: string } } | null)?.academicYear?.name || ''
  return t('parentFees.yearTotal', { year }).replace(/\s+$/, '')
})

/** First installment the parent can settle right now — drives the balance-card CTA. */
const nextPayable = computed(() => {
  const rows = sheet.value?.installments || []
  return rows.find((inst) => canSelectInstallment(inst)) || null
})

/** Oldest overdue, still-payable installment — drives the dark late-notice card. */
const overdueInstallment = computed(() => {
  const rows = sheet.value?.installments || []
  return rows.find((inst) => canSelectInstallment(inst) && isOverdue(inst)) || null
})

function buildPricedRows(s: StudentChargeSheet | null): PricedRow[] {
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
        label: extra.extraType?.label || '—',
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
        label: discount.discountType?.label || '—',
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
}

const pricedRows = computed(() => buildPricedRows(sheet.value))

const scopedBundles = computed(() => {
  if (desktopChildFilter.value === 'all') return familyBundles.value
  return familyBundles.value.filter((b) => b.studentId === desktopChildFilter.value)
})

const familyDueTotal = computed(() =>
  scopedBundles.value.reduce((sum, b) => sum + Number(b.sheet?.due_total || 0), 0),
)

const familyPaidTotal = computed(() =>
  scopedBundles.value.reduce((sum, b) => sum + Number(b.sheet?.paid_total || 0), 0),
)

const desktopRows = computed<DesktopFeeRow[]>(() => {
  const rows: DesktopFeeRow[] = []
  for (const bundle of scopedBundles.value) {
    const child = children.value.find((c) => c.id === bundle.studentId)
    if (!child || !bundle.sheet) continue
    const studentName = `${child.firstName} ${child.lastName}`.trim()
    const group = child.groupNames || bundle.sheet.student?.paymentLevel?.name || ''
    const plan = bundle.sheet.installmentPlan?.name || ''
    const metaLine = [group, plan].filter(Boolean).join(' · ')
    for (const inst of bundle.sheet.installments || []) {
      const remaining = installmentRemaining(inst)
      if (remaining <= 0) continue
      rows.push({
        key: `${bundle.studentId}-${inst.id}`,
        studentId: bundle.studentId,
        studentName,
        metaLine,
        installment: inst,
        remaining,
        bucket: desktopBucketFor(inst, bundle.payments),
      })
    }
  }
  rows.sort((a, b) => {
    const rank = (bucket: DesktopFeeRow['bucket']) =>
      bucket === 'late' ? 0 : bucket === 'due' ? 1 : bucket === 'partial' ? 2 : bucket === 'wait' ? 3 : 4
    const diff = rank(a.bucket) - rank(b.bucket)
    if (diff !== 0) return diff
    return String(a.installment.due_date || '').localeCompare(String(b.installment.due_date || ''))
  })
  return rows
})

const filteredDesktopRows = computed(() => {
  if (desktopBucket.value === 'all') return desktopRows.value
  return desktopRows.value.filter((row) => row.bucket === desktopBucket.value)
})

const mobileInstallments = computed(() => sheet.value?.installments || [])

const {
  currentPage: desktopPage,
  paginatedItems: paginatedDesktopRows,
  totalPages: desktopPages,
  goToPage: goToDesktopPage,
} = useClientPagination(filteredDesktopRows)

const {
  currentPage: mobileInstallmentPage,
  paginatedItems: paginatedMobileInstallments,
  totalPages: mobileInstallmentPages,
  goToPage: goToMobileInstallmentPage,
} = useClientPagination(mobileInstallments)

const familyLateTotal = computed(() =>
  desktopRows.value.filter((r) => r.bucket === 'late').reduce((sum, r) => sum + r.remaining, 0),
)

const familyDueTodayTotal = computed(() =>
  desktopRows.value.filter((r) => r.bucket === 'due').reduce((sum, r) => sum + r.remaining, 0),
)

const bucketChips = computed(() => {
  const counts = {
    all: desktopRows.value.length,
    late: 0,
    due: 0,
    partial: 0,
    upcoming: 0,
  }
  for (const row of desktopRows.value) {
    if (row.bucket === 'late') counts.late += 1
    else if (row.bucket === 'due') counts.due += 1
    else if (row.bucket === 'partial') counts.partial += 1
    else if (row.bucket === 'upcoming') counts.upcoming += 1
  }
  return [
    { id: 'all' as const, label: t('reports.bucket_all'), count: counts.all },
    { id: 'late' as const, label: t('reports.bucket_late'), count: counts.late },
    { id: 'due' as const, label: t('reports.bucket_due'), count: counts.due },
    { id: 'upcoming' as const, label: t('reports.bucket_upcoming'), count: counts.upcoming },
    { id: 'partial' as const, label: t('parentFees.partiallyPaid'), count: counts.partial },
  ]
})

const desktopNextPayable = computed(() => {
  const row =
    desktopRows.value.find((r) => r.bucket === 'late' || r.bucket === 'due' || r.bucket === 'partial') ||
    desktopRows.value.find((r) => r.bucket === 'upcoming') ||
    null
  if (!row) return null
  return { studentId: row.studentId, installment: row.installment, remaining: row.remaining }
})

const desktopLatePromo = computed(() => desktopRows.value.find((r) => r.bucket === 'late') || null)

const pendingReceiptCount = computed(() =>
  scopedBundles.value.reduce(
    (sum, b) => sum + b.payments.filter((p) => isSettlementPending(p.status)).length,
    0,
  ),
)

const desktopBreakdownChild = computed(() => {
  if (desktopChildFilter.value !== 'all') {
    return children.value.find((c) => c.id === desktopChildFilter.value) || null
  }
  return children.value[0] || null
})

const desktopBreakdownSheet = computed(() => {
  const id = desktopBreakdownChild.value?.id
  if (!id) return null
  return familyBundles.value.find((b) => b.studentId === id)?.sheet || null
})

const desktopPricedRows = computed(() => buildPricedRows(desktopBreakdownSheet.value))
const desktopBreakdownListTotal = computed(() => Number(desktopBreakdownSheet.value?.list_total || 0))

const familyChildSummaries = computed(() =>
  children.value.map((c) => {
    const bundle = familyBundles.value.find((b) => b.studentId === c.id)
    return {
      studentId: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      due: Number(bundle?.sheet?.due_total || 0),
    }
  }),
)

function pricedAmountLabel(row: PricedRow) {
  if (row.kind === 'included') return t('feesV2.inclusions')
  const money = formatPlainMoney(row.amount ?? 0)
  if (row.kind === 'extra') return `+${money}`
  if (row.kind === 'discount') return `−${money}`
  return money
}

function pricedAmountClass(kind: PricedKind) {
  if (kind === 'discount') return 'text-primary-700'
  if (kind === 'included') return 'text-fikr-ink-soft'
  return 'text-navy-800'
}

function installmentRemaining(inst: { amount_due: string; amount_paid: string }) {
  return Math.max(0, Number(inst.amount_due) - Number(inst.amount_paid))
}

function canSelectInstallment(inst: ChargeSheetInstallment) {
  return installmentRemaining(inst) > 0 && !hasOpenInstallment(inst.id)
}

function parseDueDate(raw: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw)
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function isOverdue(inst: ChargeSheetInstallment) {
  if (!inst.due_date || inst.status === 'paid') return false
  if (installmentRemaining(inst) <= 0) return false
  return parseDueDate(String(inst.due_date)).getTime() < startOfToday().getTime()
}

function isDueToday(inst: ChargeSheetInstallment) {
  if (!inst.due_date || inst.status === 'paid') return false
  if (installmentRemaining(inst) <= 0) return false
  return parseDueDate(String(inst.due_date)).getTime() === startOfToday().getTime()
}

function overdueDays(inst: ChargeSheetInstallment) {
  if (!inst.due_date) return 0
  const due = parseDueDate(String(inst.due_date))
  return Math.max(0, Math.floor((startOfToday().getTime() - due.getTime()) / 86400000))
}

function daysUntilDue(inst: ChargeSheetInstallment) {
  if (!inst.due_date) return 0
  const due = parseDueDate(String(inst.due_date))
  return Math.max(0, Math.floor((due.getTime() - startOfToday().getTime()) / 86400000))
}

function upcomingLabel(inst: ChargeSheetInstallment) {
  const n = daysUntilDue(inst)
  if (n <= 0) return t('reports.state_upcoming')
  return t('parentFees.upcomingIn', { n })
}

function settlementChipFromPayments(installmentId: string, list: FeePayment[]) {
  const open = list.find((p) => p.installment_id === installmentId && isOpenPaymentStatus(p.status))
  if (!open) return null
  if (isSettlementPending(open.status)) return 'waiting'
  if (open.method === 'thawani' && open.status === 'pending') return 'checkout'
  return 'open'
}

function desktopBucketFor(inst: ChargeSheetInstallment, list: FeePayment[]): Exclude<DesktopBucket, 'all'> {
  const chip = settlementChipFromPayments(inst.id, list)
  if (chip === 'waiting' || chip === 'checkout') return 'wait'
  if (isOverdue(inst)) return 'late'
  if (isDueToday(inst)) return 'due'
  if (Number(inst.amount_paid) > 0) return 'partial'
  return 'upcoming'
}

type RowState = 'paid' | 'late' | 'wait' | 'payable' | 'future'

function rowState(inst: ChargeSheetInstallment): RowState {
  if (inst.status === 'paid' || installmentRemaining(inst) <= 0) return 'paid'
  const chip = settlementChipFor(inst.id)
  if (chip === 'waiting' || chip === 'checkout') return 'wait'
  if (isOverdue(inst)) return 'late'
  if (inst === nextPayable.value) return 'payable'
  return 'future'
}

function dotClass(inst: ChargeSheetInstallment) {
  const state = rowState(inst)
  if (state === 'paid') return 'fk-sched__dot--paid'
  if (state === 'late') return 'fk-sched__dot--late'
  if (state === 'wait') return 'fk-sched__dot--wait'
  return 'fk-sched__dot--future'
}

function dotGlyph(inst: ChargeSheetInstallment) {
  const state = rowState(inst)
  if (state === 'paid') return '✓'
  if (state === 'late') return '!'
  if (state === 'wait') return '◔'
  return ''
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
  return settlementChipFromPayments(installmentId, payments.value)
}

function installmentLabel(inst: { label?: string; sequence: number }) {
  if (inst.label === 'upfront' || inst.sequence === 0) return t('feesV2.upfront')
  if (inst.label) return inst.label
  return t('parentFees.installmentDefaultLabel', { n: inst.sequence })
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

/** Bare tabular amount (no currency symbol) — the mockups show plain figures. */
function formatPlainMoney(v: string | number) {
  const n = Number(v || 0)
  return new Intl.NumberFormat('en-OM', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(n)
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
    await loadAllChildFees()
  } catch (e) {
    childrenError.value = localizedLoadError(e, 'parent.error')
  } finally {
    loadingChildren.value = false
  }
}

async function loadOneChildBundle(studentId: string): Promise<ChildFeeBundle> {
  try {
    const s = await feesV2Service.getStudentChargeSheet(studentId)
    const list = await feesV2Service.listStudentPayments(studentId).catch(() => [] as FeePayment[])
    return { studentId, sheet: s, payments: list }
  } catch {
    return { studentId, sheet: null, payments: [] }
  }
}

async function loadAllChildFees() {
  if (!children.value.length) {
    familyBundles.value = []
    return
  }
  desktopLoading.value = true
  desktopError.value = ''
  try {
    const bundles = await Promise.all(children.value.map((c) => loadOneChildBundle(c.id)))
    for (const bundle of bundles) {
      await syncPendingThawaniForBundle(bundle)
    }
    familyBundles.value = bundles
  } catch (e) {
    desktopError.value = localizedLoadError(e, 'parentFees.loadFailed')
  } finally {
    desktopLoading.value = false
  }
}

async function refreshChildBundle(studentId: string) {
  const next = await loadOneChildBundle(studentId)
  await syncPendingThawaniForBundle(next)
  const idx = familyBundles.value.findIndex((b) => b.studentId === studentId)
  if (idx >= 0) {
    const copy = familyBundles.value.slice()
    copy[idx] = next
    familyBundles.value = copy
  } else {
    familyBundles.value = [...familyBundles.value, next]
  }
  if (selectedId.value === studentId) {
    sheet.value = next.sheet
    payments.value = next.payments
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
    const next: ChildFeeBundle = {
      studentId,
      sheet: sheet.value,
      payments: payments.value,
    }
    const idx = familyBundles.value.findIndex((b) => b.studentId === studentId)
    if (idx >= 0) {
      const copy = familyBundles.value.slice()
      copy[idx] = next
      familyBundles.value = copy
    } else if (children.value.some((c) => c.id === studentId)) {
      familyBundles.value = [...familyBundles.value, next]
    }
  } catch (e) {
    detailError.value = localizedLoadError(e, 'parentFees.loadFailed')
  } finally {
    detailLoading.value = false
  }
}

/** If Thawani already collected money but confirm never ran, finish it on load/refresh. */
async function syncPendingThawaniForBundle(bundle: ChildFeeBundle) {
  const pending = bundle.payments.filter((p) => p.method === 'thawani' && p.status === 'pending')
  if (!pending.length) return
  let changed = false
  for (const p of pending) {
    try {
      const confirmed = await feesV2Service.confirmThawaniPayment(p.id)
      if (confirmed.sheet) bundle.sheet = confirmed.sheet
      if (confirmed.paid) changed = true
    } catch {
      /* still unpaid / cancelled on Thawani */
    }
  }
  if (changed) {
    bundle.payments = await feesV2Service.listStudentPayments(bundle.studentId).catch(() => bundle.payments)
  }
}

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
  desktopPage.value = 1
  mobileInstallmentPage.value = 1
}

function reloadDetail() {
  if (selectedId.value) void loadDetailFor(selectedId.value)
}

function openPayFor(
  studentId: string,
  inst: { id: string; amount_due: string; amount_paid: string },
  method: 'offline' | 'thawani' = 'offline',
) {
  payStudentId.value = studentId
  payRemarks.value = ''
  proofFile.value = null
  payMethod.value = method
  payTarget.value = 'installment'
  payInstallmentId.value = inst.id
  payAmount.value = installmentRemaining(inst)
}

function closePay() {
  payTarget.value = null
  payStudentId.value = null
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
  const studentId = payStudentId.value || selectedId.value
  if (!studentId || !payTarget.value || payAmount.value <= 0) return
  paying.value = true
  try {
    if (payMethod.value === 'offline') {
      if (!proofFile.value) throw new Error(t('parentFees.attachReceipt'))
      await feesV2Service.submitOfflinePayment(studentId, {
        target_type: payTarget.value,
        installment_id: payInstallmentId.value ?? undefined,
        remarks: payRemarks.value,
        locale: locale.value === 'en' ? 'en' : 'ar',
        file: proofFile.value,
      })
      closePay()
      feedback.success(t('parentFees.paySubmitted'))
      if (selectedId.value === studentId) await loadDetailFor(studentId)
      else await refreshChildBundle(studentId)
      return
    }

    const native = isNativeCheckout()
    const popup = native ? null : openCheckoutPopup()
    if (!native && !(popup && !popup.closed)) {
      checkoutSheetOpen.value = true
      checkoutSheetUrl.value = null
    }
    const urls = checkoutReturnUrls()
    const session = await feesV2Service.createThawaniSession(studentId, {
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
    if (confirmed.sheet && selectedId.value === studentId) sheet.value = confirmed.sheet
    if (!confirmed.paid) {
      feedback.error(t('parentFees.thawaniNotPaid'), t('common.error'))
    } else {
      closePay()
      feedback.success(t('parentFees.paySubmitted'))
    }
    if (selectedId.value === studentId) await loadDetailFor(studentId)
    else await refreshChildBundle(studentId)
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
