<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm ring-1 ring-black/[0.02]">
        <h1 class="text-xl font-bold text-gray-900">{{ $t('studentPayments.title') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ $t('studentPayments.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          class="bg-white rounded-xl border border-gray-200/80 shadow-sm lg:col-span-1 flex flex-col overflow-hidden ring-1 ring-black/[0.02]"
        >
          <div class="px-4 pt-4 pb-3 border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h2 class="text-base font-semibold text-gray-900 tracking-tight">{{ $t('studentPayments.studentsList') }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">{{ $t('studentPayments.listPanelHint') }}</p>
              </div>
              <span
                v-if="!loadingList"
                class="shrink-0 inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200 shadow-sm tabular-nums"
              >
                {{ $t('studentPayments.listCount', { shown: filteredStudents.length, total: students.length }) }}
              </span>
            </div>
            <div class="relative mt-3">
              <span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                v-model="search"
                type="search"
                autocomplete="off"
                class="block w-full rounded-lg border border-gray-200 bg-white py-2 ps-9 pe-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-inner shadow-gray-100/50 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-shadow"
                :placeholder="$t('studentPayments.searchPlaceholder')"
              />
            </div>
          </div>

          <div class="flex-1 min-h-0 p-3">
            <div v-if="loadingList" class="flex flex-col items-center justify-center py-16 gap-2 text-gray-500">
              <span
                class="h-8 w-8 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin"
                aria-hidden="true"
              />
              <span class="text-sm">{{ $t('common.loading') }}</span>
            </div>
            <div v-else-if="!filteredStudents.length" class="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center">
              <p class="text-sm font-medium text-gray-700">{{ $t('studentPayments.noStudents') }}</p>
              <p v-if="search.trim()" class="text-xs text-gray-500 mt-1">{{ $t('studentPayments.tryClearSearch') }}</p>
            </div>
            <ul
              v-else
              class="max-h-[min(32rem,calc(100vh-14rem))] overflow-y-auto overscroll-contain space-y-1.5 pe-0.5 -me-0.5 [scrollbar-width:thin]"
              role="listbox"
              :aria-label="$t('studentPayments.studentsList')"
            >
              <li v-for="s in filteredStudents" :key="s.id">
                <button
                  type="button"
                  role="option"
                  :aria-selected="selectedId === s.id"
                  @click="selectStudent(s)"
                  :class="[
                    'group w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-all duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                    selectedId === s.id
                      ? 'border-primary-300 bg-gradient-to-br from-primary-50 via-white to-primary-50/30 shadow-md shadow-primary-900/5 ring-1 ring-primary-200/60'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/90 hover:shadow-sm',
                  ]"
                >
                  <span
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold tracking-tight text-primary-900 bg-gradient-to-br from-primary-100 to-primary-50 ring-1 ring-primary-200/60 shadow-sm"
                    aria-hidden="true"
                  >
                    {{ studentInitials(s) }}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block font-semibold text-gray-900 leading-snug truncate group-hover:text-primary-950">
                      {{ s.firstName }} {{ s.lastName }}
                    </span>
                    <span class="mt-1 flex flex-wrap items-center gap-1.5">
                      <span
                        v-if="paymentByStudentId[s.id]"
                        class="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-inset ring-emerald-200/80"
                      >
                        {{ $t('studentPayments.feeBadgeReady') }}
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900 ring-1 ring-inset ring-amber-200/80"
                      >
                        {{ $t('studentPayments.feeBadgePending') }}
                      </span>
                    </span>
                  </span>
                  <span
                    class="shrink-0 text-gray-300 group-hover:text-primary-400 transition-colors"
                    :class="selectedId === s.id ? 'text-primary-500' : ''"
                    aria-hidden="true"
                  >
                    <svg class="h-5 w-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm lg:col-span-2 ring-1 ring-black/[0.02]">
          <div v-if="!selectedId" class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/40 py-16 px-6 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-700">{{ $t('studentPayments.selectStudent') }}</p>
            <p class="text-xs text-gray-500 mt-1 max-w-xs">{{ $t('studentPayments.selectStudentHint') }}</p>
          </div>
          <div v-else-if="detailLoading" class="text-sm text-gray-500 py-8 text-center">{{ $t('common.loading') }}</div>
          <div
            v-else-if="detailError"
            class="rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-amber-50/40 px-4 py-3 text-sm text-amber-950 leading-relaxed shadow-sm ring-1 ring-amber-100/80"
            role="alert"
          >
            {{ detailError }}
          </div>
          <div v-else-if="detail" class="space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ detail.payment.student?.firstName }} {{ detail.payment.student?.lastName }}
              </h2>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                @click="refreshFee"
              >
                {{ $t('studentPayments.refreshFee') }}
              </button>
            </div>

            <dl
              class="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-10 sm:gap-y-2"
            >
              <div class="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <dt class="shrink-0 text-xs font-medium text-gray-500">{{ $t('studentPayments.baseTotal') }}</dt>
                <dd class="text-base font-semibold tabular-nums text-gray-900">
                  {{ Number(detail.payment.base_total_amount).toFixed(2) }} {{ detail.payment.currency }}
                </dd>
              </div>
              <div class="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <dt class="shrink-0 text-xs font-medium text-gray-500">{{ $t('studentPayments.discounts') }}</dt>
                <dd class="text-base font-semibold tabular-nums text-amber-900">
                  −{{ detail.discountTotal.toFixed(2) }} {{ detail.payment.currency }}
                </dd>
              </div>
              <div class="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <dt class="shrink-0 text-xs font-medium text-gray-500">{{ $t('studentPayments.summaryPaid') }}</dt>
                <dd class="text-base font-semibold tabular-nums text-emerald-700">
                  {{ installmentPaidTotal.toFixed(2) }} {{ detail.payment.currency }}
                </dd>
              </div>
              <div class="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <dt class="shrink-0 text-xs font-medium text-gray-500">{{ $t('studentPayments.summaryPending') }}</dt>
                <dd class="text-base font-semibold tabular-nums text-primary-800">
                  {{ detail.payable.toFixed(2) }} {{ detail.payment.currency }}
                </dd>
              </div>
            </dl>

            <div class="border-t border-gray-100 pt-4 space-y-3">
              <h3 class="text-sm font-semibold text-gray-800">{{ $t('studentPayments.discounts') }}</h3>
              <div
                v-if="!allowedDiscountOptions.length"
                class="flex gap-3 rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50 to-white px-4 py-3.5 text-start shadow-sm ring-1 ring-sky-100/60"
                role="status"
              >
                <span class="shrink-0 text-sky-600 mt-0.5" aria-hidden="true">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-sky-950">{{ $t('studentPayments.noDiscountTypesTitle') }}</p>
                  <p class="text-sm text-sky-900/85 mt-1 leading-relaxed">{{ $t('studentPayments.noDiscountTypes') }}</p>
                </div>
              </div>
              <table v-if="detail.payment.discountLines?.length" class="min-w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-start p-2">{{ $t('studentPayments.discountType') }}</th>
                    <th class="text-start p-2">{{ $t('studentPayments.discountAmount') }}</th>
                    <th class="text-start p-2">{{ $t('studentPayments.discountRemarks') }}</th>
                    <th class="p-2 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in detail.payment.discountLines" :key="line.id" class="border-t border-gray-100">
                    <td class="p-2">{{ line.discountType?.label || line.discount_type_id }}</td>
                    <td class="p-2">{{ line.amount }}</td>
                    <td class="p-2 text-gray-700">{{ line.remarks }}</td>
                    <td class="p-2">
                      <button type="button" class="text-red-600 text-xs" @click="removeLine(line.id)">{{ $t('studentPayments.removeDiscount') }}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="allowedDiscountOptions.length" class="space-y-2 border border-gray-100 rounded-md p-3">
                <div class="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-end sm:gap-2">
                  <div class="min-w-0 flex-1 basis-0 sm:min-w-[10rem]">
                    <label class="mb-1 block text-xs text-gray-500 sm:sr-only">{{ $t('studentPayments.discountType') }}</label>
                    <select v-model="newDisc.typeId" class="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm">
                      <option value="">{{ $t('studentPayments.discountType') }}</option>
                      <option v-for="o in allowedDiscountOptions" :key="o.id" :value="o.id">{{ o.label }}</option>
                    </select>
                  </div>
                  <div class="w-full shrink-0 sm:w-[5.5rem]">
                    <label class="mb-1 block text-xs text-gray-500 sm:sr-only">{{ $t('studentPayments.discountAmount') }}</label>
                    <input
                      v-model.number="newDisc.amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      class="w-full rounded-md border border-gray-200 px-1.5 py-1.5 text-center text-xs tabular-nums"
                      :placeholder="$t('studentPayments.discountAmountPlaceholder')"
                    />
                  </div>
                  <div class="min-w-0 flex-[2] basis-0">
                    <label class="mb-1 block text-xs text-gray-500 sm:sr-only">{{ $t('studentPayments.discountRemarks') }}</label>
                    <input
                      v-model="newDisc.remarks"
                      type="text"
                      class="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                      :placeholder="$t('studentPayments.discountRemarksPlaceholder')"
                    />
                  </div>
                  <button
                    type="button"
                    class="shrink-0 rounded-md border border-primary-600/80 bg-white px-2.5 py-1.5 text-xs font-medium text-primary-700 shadow-sm hover:bg-primary-50 sm:self-end"
                    @click="addDisc"
                  >
                    {{ $t('studentPayments.addDiscount') }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="detail.feeCharges?.length" class="border-t border-gray-100 pt-4 space-y-3">
              <h3 class="text-sm font-semibold text-gray-800">{{ $t('studentPayments.feeChargesTitle') }}</h3>
              <p class="text-xs text-gray-500">{{ $t('studentPayments.feeChargesHint') }}</p>
              <div class="overflow-x-auto rounded-xl border border-gray-200/90">
                <table class="min-w-full text-xs">
                  <thead class="bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                    <tr>
                      <th class="px-2 py-2 text-start">{{ $t('paymentSettings.label') }}</th>
                      <th class="px-2 py-2 text-start">{{ $t('paymentSettings.chargeBillingOccurrence') }}</th>
                      <th class="px-2 py-2 text-end">{{ $t('studentPayments.chargeDue') }}</th>
                      <th class="px-2 py-2 text-end">{{ $t('studentPayments.chargePaid') }}</th>
                      <th class="px-2 py-2 text-end">{{ $t('studentPayments.chargeBalance') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="c in detail.feeCharges"
                      :key="c.id"
                      class="border-t border-gray-100"
                      :class="c.is_satisfied ? 'bg-emerald-50/30' : ''"
                    >
                      <td class="px-2 py-2 font-medium text-gray-900">{{ c.charge_label }}</td>
                      <td class="px-2 py-2 text-gray-600">{{ billingOccurrenceLabel(c.billing_occurrence) }}</td>
                      <td class="px-2 py-2 text-end tabular-nums">{{ c.amount_due.toFixed(2) }}</td>
                      <td class="px-2 py-2 text-end tabular-nums text-emerald-700">{{ c.amount_paid.toFixed(2) }}</td>
                      <td class="px-2 py-2 text-end tabular-nums font-semibold">{{ c.balance.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="detail.installmentSchedule" class="border-t border-gray-100 pt-4 space-y-4">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 class="text-sm font-semibold text-gray-800">{{ $t('studentPayments.installmentsTitle') }}</h3>
                  <p class="text-xs text-gray-600 mt-0.5">
                    {{
                      $t('studentPayments.installmentsSummary', {
                        paid: detail.installmentSchedule.paid_total.toFixed(2),
                        total: detail.installmentSchedule.scheduled_total.toFixed(2),
                        currency: detail.payment.currency,
                      })
                    }}
                  </p>
                </div>
                <div
                  v-if="detail.installmentSchedule.scheduled_total > 0"
                  class="w-full sm:max-w-[14rem] sm:shrink-0"
                  role="progressbar"
                  :aria-valuenow="Math.round(installmentPaidPercent)"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="$t('studentPayments.installmentsTitle')"
                >
                  <div class="h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      class="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out"
                      :style="{ width: `${installmentPaidPercent}%` }"
                    />
                  </div>
                </div>
              </div>
              <p v-if="!detail.installmentSchedule.rows.length" class="text-sm text-gray-500">
                {{ $t('studentPayments.installmentsNoRows') }}
              </p>
              <div
                v-else
                class="overflow-x-auto rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.03]"
              >
                <table class="w-full min-w-[36rem] border-collapse text-xs">
                  <thead>
                    <tr
                      class="border-b border-gray-200 bg-gray-50 text-start text-[10px] font-semibold uppercase tracking-wide text-gray-600"
                    >
                      <th class="w-10 px-2 py-2 whitespace-nowrap">{{ $t('studentPayments.installmentSeq') }}</th>
                      <th class="min-w-[6rem] px-2 py-2">{{ $t('studentPayments.installmentLabel') }}</th>
                      <th class="w-24 px-2 py-2 whitespace-nowrap">{{ $t('studentPayments.installmentStatus') }}</th>
                      <th class="w-14 px-2 py-2 whitespace-nowrap">{{ $t('studentPayments.installmentMonth') }}</th>
                      <th class="w-28 px-2 py-2 whitespace-nowrap text-end">{{ $t('studentPayments.installmentAmount') }}</th>
                      <th class="min-w-[6.5rem] px-2 py-2 whitespace-nowrap">{{ $t('studentPayments.installmentPaidAt') }}</th>
                      <th class="w-36 px-2 py-2 text-end">{{ $t('studentPayments.installmentActions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="row in detail.installmentSchedule.rows" :key="row.installment_id">
                      <tr
                        class="border-b border-gray-100 transition-colors hover:bg-gray-50/80"
                        :class="row.paid ? 'bg-emerald-50/25' : ''"
                      >
                        <td class="px-2 py-1.5 align-middle tabular-nums text-gray-700">{{ row.sequence }}</td>
                        <td class="px-2 py-1.5 align-middle font-medium text-gray-900">{{ row.label || '—' }}</td>
                        <td class="px-2 py-1.5 align-middle">
                          <span
                            v-if="row.paid"
                            class="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-800"
                          >
                            {{ $t('studentPayments.installmentBadgePaid') }}
                          </span>
                          <span
                            v-else
                            class="inline-flex rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-900"
                          >
                            {{ $t('studentPayments.installmentBadgeDue') }}
                          </span>
                        </td>
                        <td class="px-2 py-1.5 align-middle tabular-nums text-gray-800">{{ row.month_number ?? '—' }}</td>
                        <td class="px-2 py-1.5 align-middle text-end font-semibold tabular-nums text-gray-900">
                          {{ Number(row.scheduled_amount).toFixed(2) }} {{ detail.payment.currency }}
                        </td>
                        <td class="px-2 py-1.5 align-middle text-gray-800">
                          <span v-if="row.paid">{{ formatPaidAt(row.paid.paid_at) }}</span>
                          <span v-else class="text-gray-400">—</span>
                        </td>
                        <td class="px-2 py-1.5 align-middle text-end">
                          <div class="flex flex-wrap justify-end gap-1">
                            <template v-if="row.paid">
                              <button
                                type="button"
                                class="inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-red-700 shadow-sm hover:bg-red-50"
                                @click="clearInstallment(row.installment_id)"
                              >
                                {{ $t('studentPayments.installmentClearPaid') }}
                              </button>
                            </template>
                            <button
                              v-else
                              type="button"
                              class="inline-flex items-center justify-center rounded-md border border-primary-600/75 bg-white px-1.5 py-0.5 text-[10px] font-medium text-primary-700 shadow-sm hover:bg-primary-50"
                              @click="startPayInstallment(row)"
                            >
                              {{ $t('studentPayments.installmentMarkPaid') }}
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="payingInstallmentId === row.installment_id" class="border-b border-gray-100 bg-gray-50/90">
                        <td colspan="7" class="px-3 py-3">
                          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
                            <div class="sm:w-32">
                              <label class="mb-1 block text-[11px] font-medium text-gray-500">{{ $t('studentPayments.installmentAmount') }}</label>
                              <input
                                v-model.number="payInstallmentForm.amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                class="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs"
                                @input="schedulePayPreview"
                              />
                            </div>
                            <div class="min-w-0 flex-1 sm:min-w-[14rem]">
                              <label class="mb-1 block text-[11px] font-medium text-gray-500">{{ $t('studentPayments.installmentPayRemarks') }}</label>
                              <input
                                v-model="payInstallmentForm.remarks"
                                type="text"
                                class="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs"
                              />
                            </div>
                            <div
                              v-if="payPreview?.lines?.length"
                              class="w-full rounded-md border border-primary-200 bg-primary-50/50 p-2.5 text-[11px] text-primary-950"
                            >
                              <p class="mb-1.5 font-semibold">{{ $t('studentPayments.allocationPreviewTitle') }}</p>
                              <ul class="space-y-1">
                                <li
                                  v-for="(line, idx) in payPreview.lines"
                                  :key="idx"
                                  class="flex items-center justify-between gap-2"
                                >
                                  <span class="min-w-0 truncate">{{ line.charge_label }}</span>
                                  <span class="shrink-0 tabular-nums font-medium">
                                    {{ line.amount.toFixed(2) }} {{ detail.payment.currency }}
                                  </span>
                                </li>
                              </ul>
                              <p v-if="payPreview.unallocated > 0.01" class="mt-1.5 text-amber-800">
                                {{
                                  $t('studentPayments.allocationUnallocated', {
                                    amount: payPreview.unallocated.toFixed(2),
                                    currency: detail.payment.currency,
                                  })
                                }}
                              </p>
                            </div>
                            <div class="flex flex-wrap gap-1.5 sm:pb-0.5">
                              <button
                                type="button"
                                class="inline-flex items-center justify-center rounded-md border border-primary-600/75 bg-white px-2 py-0.5 text-[11px] font-medium text-primary-700 shadow-sm hover:bg-primary-50"
                                @click="submitInstallmentPay"
                              >
                                {{ $t('studentPayments.installmentSubmitPay') }}
                              </button>
                              <button
                                type="button"
                                class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                @click="cancelPayInstallment"
                              >
                                {{ $t('studentPayments.installmentCancelPay') }}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
            <p v-else class="text-xs text-gray-500 border-t border-gray-100 pt-3">{{ $t('studentPayments.noInstallmentPlan') }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import { studentService, type Student } from '@/services/student.service'
import studentPaymentService, {
  type StudentPaymentSnapshot,
  type StudentInstallmentScheduleRow,
  type PaymentAllocationPreview,
  type PaymentChargeBillingOccurrence,
} from '@/services/student-payment.service'
import paymentConfigService from '@/services/payment-config.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => Number(authService.getStoredUser()?.school_id) || 1)

const students = ref<Student[]>([])
const paymentByStudentId = ref<Record<string, boolean>>({})
const loadingList = ref(true)
const search = ref('')
const selectedId = ref<string | null>(null)
const detail = ref<StudentPaymentSnapshot | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const allDiscountTypes = ref<{ id: string; label: string }[]>([])
const newDisc = ref({ typeId: '', amount: 0, remarks: '' })
const payingInstallmentId = ref<string | null>(null)
const payInstallmentForm = ref({ amount: 0, remarks: '' })
const payPreview = ref<PaymentAllocationPreview | null>(null)
let payPreviewTimer: ReturnType<typeof setTimeout> | undefined

function extractApiMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string | string[] } }; message?: string }
  const raw = err?.response?.data?.message
  if (Array.isArray(raw)) return raw.filter(Boolean).join('. ')
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return typeof err?.message === 'string' && err.message.trim() ? err.message.trim() : ''
}

/** Maps API error codes to i18n keys for student fee flows */
function resolveEnsureErrorMessage(e: unknown): string {
  const msg = extractApiMessage(e)
  if (msg === 'STUDENT_PAYMENT_NO_FEE_LEVEL') {
    return t('studentPayments.errorNoFeeLevel')
  }
  return msg || t('studentPayments.ensureError')
}

function studentInitials(s: Student): string {
  const a = (s.firstName || '').trim().charAt(0)
  const b = (s.lastName || '').trim().charAt(0)
  const out = `${a}${b}`.toUpperCase()
  return out || '?'
}

const filteredStudents = computed(() => {
  const q = search.value.trim().toLowerCase()
  const sid = schoolId.value
  let list = students.value.filter((s) => s.school_id == null || Number(s.school_id) === sid)
  if (q) {
    list = list.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q))
  }
  return [...list].sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName))
})

const allowedDiscountOptions = computed(() => {
  const ids = new Set(detail.value?.allowedDiscountTypeIds ?? [])
  return allDiscountTypes.value.filter((d) => ids.has(d.id))
})

const installmentPaidTotal = computed(() => detail.value?.installmentSchedule?.paid_total ?? 0)

const installmentPaidPercent = computed(() => {
  const s = detail.value?.installmentSchedule
  if (!s || s.scheduled_total <= 0) return 0
  return Math.min(100, Math.round((s.paid_total / s.scheduled_total) * 1000) / 10)
})

async function loadList() {
  loadingList.value = true
  try {
    const [st, pays] = await Promise.all([
      studentService.getAll(),
      studentPaymentService.list(schoolId.value).catch(() => [] as StudentPaymentSnapshot[]),
    ])
    students.value = st.filter((s) => s.school_id == null || Number(s.school_id) === schoolId.value)
    const map: Record<string, boolean> = {}
    for (const row of pays) {
      const sid = row.payment?.student_id
      if (sid) map[sid] = true
    }
    paymentByStudentId.value = map
  } finally {
    loadingList.value = false
  }
}

async function loadDiscountCatalog() {
  try {
    const rows = await paymentConfigService.listDiscountTypes(schoolId.value)
    allDiscountTypes.value = rows.filter((r) => r.is_active).map((r) => ({ id: r.id, label: r.label }))
  } catch {
    allDiscountTypes.value = []
  }
}

async function selectStudent(s: Student) {
  selectedId.value = s.id
  detailError.value = ''
  detail.value = null
  detailLoading.value = true
  payingInstallmentId.value = null
  newDisc.value = { typeId: '', amount: 0, remarks: '' }
  try {
    detail.value = await studentPaymentService.getDetail(s.id)
  } catch {
    try {
      detail.value = await studentPaymentService.ensure(s.id)
    } catch (e) {
      detailError.value = resolveEnsureErrorMessage(e)
    }
  } finally {
    detailLoading.value = false
  }
}

async function refreshFee() {
  if (!selectedId.value) return
  detailLoading.value = true
  detailError.value = ''
  try {
    detail.value = await studentPaymentService.ensure(selectedId.value)
    paymentByStudentId.value = { ...paymentByStudentId.value, [selectedId.value]: true }
  } catch (e) {
    detailError.value = resolveEnsureErrorMessage(e)
  } finally {
    detailLoading.value = false
  }
}

async function addDisc() {
  if (!selectedId.value || !newDisc.value.typeId || !newDisc.value.remarks.trim()) return
  const amt = Number(newDisc.value.amount)
  if (!amt || Number.isNaN(amt) || amt <= 0) {
    alert(t('studentPayments.discountAmountInvalid'))
    return
  }
  try {
    detail.value = await studentPaymentService.addDiscount(selectedId.value, {
      discount_type_id: newDisc.value.typeId,
      amount: Number(newDisc.value.amount),
      remarks: newDisc.value.remarks.trim(),
    })
    newDisc.value = { typeId: '', amount: 0, remarks: '' }
  } catch (e: any) {
    alert(e?.message || t('studentPayments.saveError'))
  }
}

async function removeLine(lineId: string) {
  if (!selectedId.value) return
  try {
    detail.value = await studentPaymentService.removeDiscount(selectedId.value, lineId)
  } catch {
    alert(t('studentPayments.saveError'))
  }
}

function formatPaidAt(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : undefined, { dateStyle: 'short' })
  } catch {
    return iso
  }
}

function billingOccurrenceLabel(o: PaymentChargeBillingOccurrence): string {
  const map: Record<PaymentChargeBillingOccurrence, string> = {
    per_year: t('paymentSettings.chargeBillingOccurrencePerYear'),
    once_ever: t('paymentSettings.chargeBillingOccurrenceOnceEver'),
    other: t('paymentSettings.chargeBillingOccurrenceOther'),
  }
  return map[o] ?? o
}

function schedulePayPreview() {
  clearTimeout(payPreviewTimer)
  payPreviewTimer = setTimeout(() => {
    void loadPayPreview()
  }, 300)
}

async function loadPayPreview() {
  if (!selectedId.value || !payingInstallmentId.value) {
    payPreview.value = null
    return
  }
  const amt = Number(payInstallmentForm.value.amount)
  if (!amt || Number.isNaN(amt) || amt <= 0) {
    payPreview.value = null
    return
  }
  try {
    payPreview.value = await studentPaymentService.previewPayment(selectedId.value, {
      amount: amt,
      target_installment_id: payingInstallmentId.value,
    })
  } catch {
    payPreview.value = null
  }
}

function startPayInstallment(row: StudentInstallmentScheduleRow) {
  payingInstallmentId.value = row.installment_id
  payInstallmentForm.value = {
    amount: Number(row.scheduled_amount),
    remarks: '',
  }
  payPreview.value = null
  void loadPayPreview()
}

function cancelPayInstallment() {
  payingInstallmentId.value = null
  payPreview.value = null
}

async function submitInstallmentPay() {
  if (!selectedId.value || !payingInstallmentId.value) return
  const amt = Number(payInstallmentForm.value.amount)
  if (!amt || Number.isNaN(amt) || amt <= 0) return
  try {
    detail.value = await studentPaymentService.recordInstallmentPayment(
      selectedId.value,
      payingInstallmentId.value,
      {
        amount: amt,
        remarks: payInstallmentForm.value.remarks.trim() || undefined,
      },
    )
    payingInstallmentId.value = null
    payPreview.value = null
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: string }).message) : ''
    alert(msg || t('studentPayments.saveError'))
  }
}

async function clearInstallment(installmentId: string) {
  if (!selectedId.value) return
  try {
    detail.value = await studentPaymentService.clearInstallmentPayment(selectedId.value, installmentId)
  } catch {
    alert(t('studentPayments.saveError'))
  }
}

watch(selectedId, () => {
  detailError.value = ''
})

onMounted(async () => {
  await loadDiscountCatalog()
  await loadList()
})
</script>
