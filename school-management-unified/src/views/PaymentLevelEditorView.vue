<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header card: title + linked system grade -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <router-link to="/settings/payments/levels" class="text-sm font-medium text-primary-600 hover:text-primary-800">
          {{ $t('paymentSettings.backToOverview') }}
        </router-link>
        <h1 class="text-xl font-bold text-gray-900 mt-2">{{ $t('paymentSettings.editLevelTitle') }}</h1>

        <div
          v-if="currentLevelId"
          class="mt-4 border-t border-gray-100 pt-4"
          role="region"
          :aria-label="$t('paymentSettings.gradeLinkedTitle')"
        >
          <p v-if="pageLoading" class="text-sm text-gray-500">{{ $t('common.loading') }}…</p>
          <template v-else-if="linkedLevel">
            <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <span
                class="inline-flex max-w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-sm font-semibold tracking-wide text-slate-800"
              >
                {{ linkedLevel.code }}
              </span>
              <template v-if="gradeInfo">
                <p class="min-w-0 max-w-full text-base font-semibold leading-snug text-gray-900">
                  <span dir="ltr" class="inline">{{ gradeInfo.name_en }}</span>
                  <span class="mx-2 text-base font-light text-gray-300" aria-hidden="true">·</span>
                  <span>{{ gradeInfo.name_ar }}</span>
                </p>
              </template>
              <p v-else class="min-w-0 max-w-full text-base font-semibold leading-snug text-gray-900">
                {{ linkedLevel.name }}
              </p>
            </div>
            <p
              v-if="gradeInfo && !gradeInfo.is_active"
              class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs leading-relaxed text-amber-900"
            >
              {{ $t('paymentSettings.gradeInactiveHint') }}
            </p>
          </template>
        </div>
      </div>

      <div v-if="flashError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-red-800 text-sm">{{ flashError }}</span>
        </div>
      </div>

      <div
        v-if="managedByPackage && feePackage"
        class="bg-sky-50 border border-sky-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <p class="text-sm font-semibold text-sky-900">{{ $t('paymentSettings.managedByFeePackage') }}: {{ feePackage.name }}</p>
          <p class="text-xs text-sky-800 mt-1">{{ $t('paymentSettings.managedByFeePackageHint') }}</p>
        </div>
        <router-link
          :to="`/settings/payments/packages/${feePackage.id}`"
          class="inline-flex shrink-0 items-center px-3 py-1.5 rounded-md bg-white border border-sky-300 text-sm font-medium text-sky-900 hover:bg-sky-100"
        >
          {{ $t('paymentSettings.openFeePackage') }}
        </router-link>
      </div>

      <template v-if="currentLevelId && !pageLoading && linkedLevel">
        <fieldset :disabled="managedByPackage" class="space-y-4 min-w-0 border-0 p-0 m-0">
        <!-- Charge lines -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6" :class="managedByPackage ? 'opacity-90' : ''">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="min-w-0">
                <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.chargesCardTitle') }}</h2>
              </div>
            </div>
            <button
              v-if="activeChargeTypes.length && !managedByPackage"
              type="button"
              class="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shrink-0"
              @click="addChargeLineRow"
            >
              <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('paymentSettings.addChargeLine') }}
            </button>
          </div>

          <div
            v-if="!activeChargeTypes.length"
            class="text-center py-10 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 text-sm text-amber-950 space-y-3"
          >
            <svg class="mx-auto h-12 w-12 text-amber-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="font-medium px-2">{{ $t('paymentSettings.noChargeTypesInCatalog') }}</p>
            <router-link
              to="/system-settings#payment-fee-discount-catalogs"
              class="inline-block text-sm font-medium text-primary-700 hover:underline"
            >
              {{ $t('systemSettings.feeItemsLines') }}
            </router-link>
          </div>

          <template v-else>
            <div v-if="profileForm.charge_lines.length" class="md:hidden space-y-3">
              <div
                class="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50/80 p-1"
                role="tablist"
                :aria-label="$t('paymentSettings.packageBillingPeriodSwitcher')"
              >
                <button
                  v-for="period in LEVEL_BILLING_PERIODS"
                  :key="'charges-m-tab-' + period"
                  type="button"
                  role="tab"
                  :aria-selected="chargesMobilePeriod === period"
                  class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                  :class="billingPeriodSwitcherClass(chargesMobilePeriod === period)"
                  @click="chargesMobilePeriod = period"
                >
                  {{ billingPeriodLabel(period) }}
                </button>
              </div>
              <article
                v-for="(line, idx) in profileForm.charge_lines"
                :key="'charges-m-line-' + idx"
                class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
              >
                <div class="flex items-start justify-between gap-2 border-b border-gray-100 bg-gray-50/60 px-3 py-2.5">
                  <div class="min-w-0 flex-1">
                    <select
                      v-if="!managedByPackage"
                      v-model="line.charge_type_id"
                      class="block w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                    >
                      <option value="">{{ $t('paymentSettings.pickChargeType') }}</option>
                      <option v-for="c in activeChargeTypes" :key="c.id" :value="String(c.id)">{{ c.label }}</option>
                    </select>
                    <p v-else class="text-sm font-semibold text-gray-900">{{ chargeTypeLabel(line.charge_type_id) }}</p>
                  </div>
                  <button
                    v-if="!managedByPackage"
                    type="button"
                    class="shrink-0 rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    :aria-label="$t('common.delete')"
                    @click="removeChargeLineRow(idx)"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div class="flex items-center justify-between gap-3 px-3 py-3">
                  <span class="text-xs font-medium text-gray-500">{{ billingPeriodLabel(chargesMobilePeriod) }}</span>
                  <input
                    v-model="line[chargesMobilePeriod]"
                    type="text"
                    inputmode="decimal"
                    maxlength="12"
                    :readonly="managedByPackage"
                    :disabled="managedByPackage"
                    :aria-label="`${chargeTypeLabel(line.charge_type_id)} — ${billingPeriodLabel(chargesMobilePeriod)}`"
                    class="w-28 rounded-md border border-gray-200 bg-white px-2 py-2 text-end text-sm tabular-nums shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-default disabled:bg-gray-50 disabled:text-gray-800"
                  />
                </div>
              </article>
              <article class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04] divide-y divide-gray-100">
                <div class="flex items-center justify-between gap-3 bg-primary-50/25 px-3 py-2.5">
                  <span class="text-sm font-semibold text-primary-900">{{ $t('paymentSettings.packageLevelRowTotal') }}</span>
                  <span class="text-sm font-bold tabular-nums text-primary-900">{{ chargeLinesTotalsByPeriod[chargesMobilePeriod].toFixed(2) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 bg-amber-50/20 px-3 py-2.5">
                  <span class="text-sm font-medium text-amber-950">{{ $t('paymentSettings.packagePickerDownpayment') }}</span>
                  <input
                    v-if="!managedByPackage"
                    v-model="periodDownpayment[chargesMobilePeriod]"
                    type="text"
                    inputmode="decimal"
                    maxlength="12"
                    class="w-28 rounded-md border border-amber-200/80 bg-white px-2 py-2 text-end text-sm tabular-nums text-amber-950 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    @input="onChargesDownpaymentInput(chargesMobilePeriod)"
                  />
                  <span v-else class="text-sm tabular-nums text-amber-950">{{ formatDisplayAmount(periodDownpayment[chargesMobilePeriod]) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 bg-slate-50/80 px-3 py-2.5">
                  <span class="text-sm font-medium text-slate-700">{{ $t('paymentSettings.packagePickerInstallmentMonths') }}</span>
                  <input
                    v-if="chargesMobilePeriod === 'monthly'"
                    value="1"
                    type="text"
                    readonly
                    tabindex="-1"
                    class="w-12 cursor-default rounded-md border border-gray-200 bg-gray-100 px-2 py-2 text-center text-sm tabular-nums text-gray-600"
                  />
                  <input
                    v-else-if="!managedByPackage"
                    :value="periodInstallmentMonths[chargesMobilePeriod]"
                    type="number"
                    min="1"
                    max="36"
                    class="w-14 rounded-md border border-gray-200 bg-white px-2 py-2 text-center text-sm tabular-nums shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    @input="onChargesInstallmentMonthsInput(chargesMobilePeriod, ($event.target as HTMLInputElement).value)"
                  />
                  <span v-else class="text-sm tabular-nums text-slate-800">{{ formatInstallmentMonthsCount(chargesMobilePeriod) }}</span>
                </div>
              </article>
            </div>

            <div v-if="profileForm.charge_lines.length" class="hidden md:block overflow-x-auto rounded-lg border border-gray-200" :dir="isRTL ? 'rtl' : 'ltr'">
              <table class="w-full table-fixed border-collapse text-sm">
                <colgroup>
                  <col :style="managedByPackage ? 'width: 50%' : 'width: 46%'" />
                  <col style="width: 16.666667%" span="3" />
                  <col v-if="!managedByPackage" style="width: 4%" />
                </colgroup>
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50/80">
                    <th scope="col" class="py-2.5 ps-3 pe-3 text-start text-xs font-medium text-gray-600">
                      {{ $t('paymentSettings.packageGridChargeType') }}
                    </th>
                    <th
                      v-for="period in LEVEL_BILLING_PERIODS"
                      :key="'hdr-' + period"
                      scope="col"
                      class="px-2 py-2.5 text-center text-xs font-medium text-gray-600"
                    >
                      {{ billingPeriodLabel(period) }}
                    </th>
                    <th v-if="!managedByPackage" scope="col" class="px-1 py-2.5">
                      <span class="sr-only">{{ $t('common.actions') }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(line, idx) in profileForm.charge_lines" :key="idx">
                    <th scope="row" class="py-3 ps-3 pe-3 align-middle text-start font-normal">
                      <select
                        v-if="!managedByPackage"
                        v-model="line.charge_type_id"
                        class="block w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                      >
                        <option value="">{{ $t('paymentSettings.pickChargeType') }}</option>
                        <option v-for="c in activeChargeTypes" :key="c.id" :value="String(c.id)">{{ c.label }}</option>
                      </select>
                      <span
                        v-else
                        class="text-sm font-medium leading-snug text-gray-800"
                        :title="chargeTypeLabel(line.charge_type_id)"
                      >
                        {{ chargeTypeLabel(line.charge_type_id) }}
                      </span>
                    </th>
                    <td
                      v-for="period in LEVEL_BILLING_PERIODS"
                      :key="idx + '-' + period"
                      class="px-2 py-2.5 align-middle"
                    >
                      <input
                        v-model="line[period]"
                        type="text"
                        inputmode="decimal"
                        maxlength="12"
                        :readonly="managedByPackage"
                        :disabled="managedByPackage"
                        :aria-label="`${chargeTypeLabel(line.charge_type_id)} — ${billingPeriodLabel(period)}`"
                        class="block w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-end text-sm tabular-nums shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-default disabled:bg-gray-50 disabled:text-gray-800"
                      />
                    </td>
                    <td v-if="!managedByPackage" class="px-1 py-2.5 align-middle text-center">
                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                        :aria-label="$t('common.delete')"
                        @click="removeChargeLineRow(idx)"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-gray-200 bg-gray-50/70">
                    <th scope="row" class="py-2.5 ps-3 pe-3 text-start text-xs font-semibold text-gray-700">
                      {{ $t('paymentSettings.packageLevelRowTotal') }}
                    </th>
                    <td
                      v-for="period in LEVEL_BILLING_PERIODS"
                      :key="'foot-' + period"
                      class="px-2 py-2.5 text-end text-sm tabular-nums font-semibold text-gray-900"
                    >
                      <span class="inline-block min-w-[3rem] rounded-md bg-white px-2 py-1 ring-1 ring-gray-200/80">
                        {{ chargeLinesTotalsByPeriod[period].toFixed(2) }}
                      </span>
                    </td>
                    <td v-if="!managedByPackage"></td>
                  </tr>
                  <tr class="border-t border-gray-200 bg-amber-50/25">
                    <th scope="row" class="py-2.5 ps-3 pe-3 text-start text-xs font-medium text-amber-950">
                      {{ $t('paymentSettings.packagePickerDownpayment') }}
                    </th>
                    <td
                      v-for="period in LEVEL_BILLING_PERIODS"
                      :key="'foot-dp-' + period"
                      class="px-2 py-2.5 align-middle text-end"
                    >
                      <input
                        v-if="!managedByPackage"
                        v-model="periodDownpayment[period]"
                        type="text"
                        inputmode="decimal"
                        maxlength="12"
                        class="block w-full rounded-md border border-amber-200/80 bg-white px-2 py-2 text-end text-sm tabular-nums text-amber-950 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        :aria-label="`${$t('paymentSettings.packagePickerDownpayment')} — ${billingPeriodLabel(period)}`"
                        @input="onChargesDownpaymentInput(period)"
                      />
                      <span v-else class="text-sm tabular-nums text-amber-950">
                        {{ formatDisplayAmount(periodDownpayment[period]) }}
                      </span>
                    </td>
                    <td v-if="!managedByPackage"></td>
                  </tr>
                  <tr class="border-t border-gray-100 bg-slate-50/80">
                    <th scope="row" class="py-2.5 ps-3 pe-3 text-start text-xs font-medium text-slate-700">
                      {{ $t('paymentSettings.packagePickerInstallmentMonths') }}
                    </th>
                    <td
                      v-for="period in LEVEL_BILLING_PERIODS"
                      :key="'foot-inst-' + period"
                      class="px-2 py-2.5 align-middle text-center"
                    >
                      <input
                        v-if="period === 'monthly'"
                        value="1"
                        type="text"
                        readonly
                        tabindex="-1"
                        class="mx-auto block w-12 cursor-default rounded-md border border-gray-200 bg-gray-100 px-2 py-2 text-center text-sm tabular-nums text-gray-600"
                        :aria-label="$t('paymentSettings.packagePickerInstallmentMonths')"
                      />
                      <input
                        v-else-if="!managedByPackage"
                        :value="periodInstallmentMonths[period]"
                        type="number"
                        min="1"
                        max="36"
                        class="mx-auto block w-14 rounded-md border border-gray-200 bg-white px-2 py-2 text-center text-sm tabular-nums shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        :aria-label="`${$t('paymentSettings.packagePickerInstallmentMonths')} — ${billingPeriodLabel(period)}`"
                        @input="onChargesInstallmentMonthsInput(period, ($event.target as HTMLInputElement).value)"
                      />
                      <span v-else class="text-sm tabular-nums text-slate-800">
                        {{ formatInstallmentMonthsCount(period) }}
                      </span>
                    </td>
                    <td v-if="!managedByPackage"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div v-else class="text-center py-10 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 space-y-3 px-4">
              <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p class="text-sm font-medium text-gray-800">{{ $t('paymentSettings.noChargeTypesAdded') }}</p>
              <p class="text-xs text-gray-500 max-w-md mx-auto whitespace-pre-line">{{ $t('paymentSettings.noChargeTypesAddedHint') }}</p>
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                @click="addChargeLineRow"
              >
                <svg class="w-4 h-4 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ $t('paymentSettings.addChargeLine') }}
              </button>
            </div>
          </template>
        </div>

        <!-- Discount lines -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h.01M5 12h14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17a1 1 0 011 1v1M5 12a2 2 0 00-2 2v1a2 2 0 002 2h1m10-6h.01M19 12a2 2 0 012 2v1a2 2 0 01-2 2h-1m-6 0h.01" />
                </svg>
              </div>
              <div class="min-w-0">
                <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.discountsCardTitle') }}</h2>
              </div>
            </div>
            <button
              v-if="activeDiscountTypes.length && !managedByPackage"
              type="button"
              class="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shrink-0"
              @click="addDiscountLineRow"
            >
              <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('paymentSettings.addDiscountLine') }}
            </button>
          </div>

          <div
            v-if="!activeDiscountTypes.length"
            class="text-center py-10 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 text-sm text-amber-950 space-y-3"
          >
            <svg class="mx-auto h-12 w-12 text-amber-500/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h.01M5 12h14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17a1 1 0 011 1v1M5 12a2 2 0 00-2 2v1a2 2 0 002 2h1m10-6h.01M19 12a2 2 0 012 2v1a2 2 0 01-2 2h-1m-6 0h.01" />
            </svg>
            <p class="font-medium px-2">{{ $t('paymentSettings.noDiscountTypesInCatalog') }}</p>
            <router-link
              to="/system-settings#payment-fee-discount-catalogs"
              class="inline-block text-sm font-medium text-primary-700 hover:underline"
            >
              {{ $t('systemSettings.discountItemsLines') }}
            </router-link>
          </div>

          <template v-else>
            <div v-if="profileForm.discount_lines.length" class="space-y-2">
              <div
                v-for="(line, idx) in profileForm.discount_lines"
                :key="idx"
                class="flex flex-col sm:flex-row sm:items-end gap-2 p-3 rounded-md bg-gray-50 border border-gray-200"
              >
                <span class="text-xs text-gray-400 w-6 shrink-0 sm:pt-2">{{ idx + 1 }}.</span>
                <select v-model="line.discount_type_id" class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 bg-white">
                  <option value="">{{ $t('paymentSettings.pickDiscountType') }}</option>
                  <option v-for="d in activeDiscountTypes" :key="d.id" :value="String(d.id)">{{ d.label }}</option>
                </select>
                <input
                  type="number"
                  disabled
                  tabindex="-1"
                  class="sm:w-32 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 sm:self-end shrink-0"
                  :aria-label="$t('common.delete')"
                  @click="removeDiscountLineRow(idx)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-else class="text-center py-10 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 space-y-3 px-4">
              <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h.01M5 12h14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17a1 1 0 011 1v1M5 12a2 2 0 00-2 2v1a2 2 0 002 2h1m10-6h.01M19 12a2 2 0 012 2v1a2 2 0 01-2 2h-1m-6 0h.01" />
              </svg>
              <p class="text-sm font-medium text-gray-800">{{ $t('paymentSettings.noDiscountTypesAdded') }}</p>
              <p class="text-xs text-gray-500 max-w-md mx-auto">{{ $t('paymentSettings.noDiscountTypesAddedHint') }}</p>
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                @click="addDiscountLineRow"
              >
                <svg class="w-4 h-4 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ $t('paymentSettings.addDiscountLine') }}
              </button>
            </div>
          </template>
        </div>
        </fieldset>

        <!-- 3 · Pricing, totals, installments, save -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center me-3 shrink-0">
              <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.pricingCardTitle') }}</h2>
            </div>
          </div>

          <div class="space-y-6">
            <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm space-y-3">
              <p class="text-xs font-medium text-gray-600">{{ $t('paymentSettings.yearTotalFromChargesLabel') }}</p>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div
                  v-for="period in LEVEL_BILLING_PERIODS"
                  :key="'pricing-' + period"
                  class="flex items-baseline justify-between gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-gray-200/80 sm:flex-col sm:items-stretch"
                >
                  <span class="text-xs text-gray-500">{{ billingPeriodLabel(period) }}</span>
                  <span class="font-semibold text-gray-900 tabular-nums text-end">
                    {{ chargeLinesTotalsByPeriod[period].toFixed(2) }} {{ profileForm.currency }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <p class="text-sm text-gray-600">{{ $t('paymentSettings.levelFeeAnnualOnlyHint') }}</p>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-1">{{ $t('paymentSettings.yearPaymentMode') }}</label>
                  <select
                    v-model="profileForm.year_payment_mode"
                    :disabled="managedByPackage"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-600"
                  >
                    <option value="one_time">{{ $t('paymentSettings.oneTime') }}</option>
                    <option value="installments">{{ $t('paymentSettings.installments') }}</option>
                    <option value="both">{{ $t('paymentSettings.yearPaymentModeBoth') }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div
              v-if="showPeriodInstallmentPanel"
              class="border-t border-gray-100 pt-4 space-y-3"
            >
              <h3 class="text-sm font-semibold text-gray-800">{{ $t('paymentSettings.sectionInstallments') }}</h3>
              <LevelBillingInstallmentPanel
                v-model:downpayment="periodDownpayment"
                v-model:installment-months="periodInstallmentMonths"
                v-model:schedule-months="periodScheduleMonths"
                :totals-by-period="chargeLinesTotalsByPeriod"
                :readonly="managedByPackage"
              />
            </div>

            <div
              v-if="showPeriodInstallmentPanel && usesInstallmentSchedule"
              class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm space-y-2"
            >
              <div
                v-for="period in LEVEL_BILLING_PERIODS"
                :key="'sum-' + period"
                class="flex flex-wrap items-baseline justify-between gap-2"
              >
                <span class="text-gray-500">{{ billingPeriodLabel(period) }} — {{ $t('paymentSettings.installSumLabel') }}</span>
                <span class="font-semibold text-gray-900 tabular-nums">
                  {{ installmentSumForPeriod(period).toFixed(2) }} {{ profileForm.currency }}
                </span>
              </div>
            </div>

            <p v-if="showInstallmentMismatch" class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {{ $t('paymentSettings.installMismatchHint') }}
            </p>

            <div v-if="!managedByPackage" class="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p class="text-xs text-gray-500 max-w-xl">{{ $t('paymentSettings.saveFeeSetupHint') }}</p>
              <button
                type="button"
                :disabled="profileSaving"
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
                @click="saveProfile"
              >
                <svg v-if="profileSaving" class="animate-spin me-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ profileSaving ? $t('common.saving') : $t('paymentSettings.saveFeeSetup') }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <ProgressDialog
        :show="showProgressDialog"
        :state="progressState"
        :title="progressTitle"
        :message="progressMessage"
        :success-title="progressSuccessTitle"
        :success-message="progressSuccessMessage"
        :error-message="feeSaveErrorMessage"
        @close="showProgressDialog = false"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import LevelBillingInstallmentPanel from '@/components/LevelBillingInstallmentPanel.vue'
import { authService } from '@/services'
import feePackageService from '@/services/fee-package.service'
import {
  LEVEL_BILLING_PERIODS as INSTALLMENT_PERIODS,
  type LevelBillingPeriod,
  buildDefaultScheduleMonths,
  defaultScheduleMonthsForPeriod,
  deriveInstallmentRowsFromPeriod,
  emptyPeriodMaps,
  hydratePeriodMapsFromPackageLevel,
  installmentsToPeriodMaps,
  parseAmount,
  scheduleTotalForPeriod,
} from '@/utils/level-installment-schedule'
import paymentConfigService, {
  type GradePaymentLinkApi,
  type LevelChargeBillingPeriod,
  type LevelPaymentProfileApi,
  type PaymentCatalogRow,
  type SchoolPaymentLevel,
  type UpsertLevelPaymentProfilePayload,
} from '@/services/payment-config.service'

const LEVEL_BILLING_PERIODS: LevelChargeBillingPeriod[] = ['monthly', 'semester', 'yearly']

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const currentLevelId = computed(() => (route.params.levelId as string) || '')

const pageLoading = ref(true)
const flashError = ref('')
const profileSaving = ref(false)

const showProgressDialog = ref(false)
const progressState = ref<'loading' | 'success' | 'error'>('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const progressSuccessTitle = ref('')
const progressSuccessMessage = ref('')
const feeSaveErrorMessage = ref('')

const chargeTypes = ref<PaymentCatalogRow[]>([])
const discountTypes = ref<PaymentCatalogRow[]>([])

const activeChargeTypes = computed(() => chargeTypes.value.filter((x) => x.is_active))
const activeDiscountTypes = computed(() => discountTypes.value.filter((x) => x.is_active))

const linkedLevel = ref<SchoolPaymentLevel | null>(null)
const gradeInfo = ref<GradePaymentLinkApi | null>(null)
const feePackage = ref<{ id: string; name: string } | null>(null)
const managedByPackage = computed(() => !!feePackage.value?.id)

type ChargeLineRow = {
  charge_type_id: string
  monthly: string
  semester: string
  yearly: string
}
type DiscountLineRow = { discount_type_id: string }
type InstRow = { sequence: number; month_number: number | null; label: string; amount: string }

const periodMaps = emptyPeriodMaps()
const periodDownpayment = ref(periodMaps.downpayment)
const periodInstallmentMonths = ref(periodMaps.installmentMonths)
const periodScheduleMonths = ref(periodMaps.scheduleMonths)
const chargesMobilePeriod = ref<LevelChargeBillingPeriod>('monthly')

const profileForm = ref<{
  year_payment_mode: 'one_time' | 'installments' | 'both'
  year_total_amount: number | null
  currency: string
  charge_lines: ChargeLineRow[]
  installments: InstRow[]
  discount_lines: DiscountLineRow[]
}>({
  year_payment_mode: 'one_time',
  year_total_amount: 0,
  currency: 'OMR',
  charge_lines: [],
  installments: [{ sequence: 1, month_number: null, label: '', amount: '' }],
  discount_lines: [],
})

const usesInstallmentSchedule = computed(
  () =>
    profileForm.value.year_payment_mode === 'installments' ||
    profileForm.value.year_payment_mode === 'both',
)

function installmentSumForPeriod(period: LevelChargeBillingPeriod): number {
  return scheduleTotalForPeriod(
    chargeLinesTotalsByPeriod.value[period],
    periodDownpayment.value[period],
    periodInstallmentMonths.value[period],
    periodScheduleMonths.value[period],
    period,
  )
}

function parseDecimalInput(raw: string | number | undefined | null): number {
  const v = String(raw ?? '')
    .trim()
    .replace(/,/g, '.')
  if (v === '' || v === '.' || v === '-' || v === '-.') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Show empty field for 0 so users can type freely; otherwise plain string. */
function amountToInputString(n: number | string | null | undefined): string {
  if (n == null || n === '') return ''
  const x = Number(n)
  if (!Number.isFinite(x) || x === 0) return ''
  return String(x)
}

function billingPeriodLabel(period: LevelChargeBillingPeriod) {
  if (period === 'monthly') return t('paymentSettings.packageBillingMonthly')
  if (period === 'semester') return t('paymentSettings.packageBillingSemester')
  return t('paymentSettings.packageBillingYearly')
}

function billingPeriodSwitcherClass(active: boolean): string {
  return active
    ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/80'
    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
}

function formatDisplayAmount(raw: string | number | undefined | null): string {
  const v = String(raw ?? '').trim()
  if (!v) return '—'
  const n = parseDecimalInput(v)
  if (n === 0) return '—'
  return n.toFixed(2)
}

function formatInstallmentMonthsCount(period: LevelChargeBillingPeriod): string {
  if (period === 'monthly') return '1'
  const n = Number(periodInstallmentMonths.value[period])
  return String(Number.isFinite(n) && n >= 1 ? Math.round(n) : 1)
}

function onChargesDownpaymentInput(period: LevelChargeBillingPeriod) {
  ensureScheduleForPeriod(period)
}

function onChargesInstallmentMonthsInput(period: LevelChargeBillingPeriod, raw: string) {
  if (period === 'monthly' || managedByPackage.value) return
  const n = Math.max(1, Math.min(36, Math.round(Number(raw) || 1)))
  periodInstallmentMonths.value = { ...periodInstallmentMonths.value, [period]: n }
  const start = periodScheduleMonths.value[period]?.[0] ?? 1
  periodScheduleMonths.value = {
    ...periodScheduleMonths.value,
    [period]: buildDefaultScheduleMonths(n, start),
  }
}

function ensureScheduleForPeriod(period: LevelChargeBillingPeriod) {
  const count = period === 'monthly' ? 1 : Math.max(1, Math.min(36, Math.round(periodInstallmentMonths.value[period]) || 1))
  const existing = periodScheduleMonths.value[period] ?? []
  if (existing.length === count) return
  periodScheduleMonths.value = {
    ...periodScheduleMonths.value,
    [period]: buildDefaultScheduleMonths(count, existing[0] ?? 1),
  }
}

function chargeTypeLabel(id: string) {
  if (!id) return '—'
  return chargeTypes.value.find((c) => String(c.id) === String(id))?.label ?? id
}

function emptyChargeLineRow(): ChargeLineRow {
  return { charge_type_id: '', monthly: '', semester: '', yearly: '' }
}

const chargeLinesTotalsByPeriod = computed(() => {
  const totals: Record<LevelChargeBillingPeriod, number> = {
    monthly: 0,
    semester: 0,
    yearly: 0,
  }
  for (const line of profileForm.value.charge_lines) {
    if (!line.charge_type_id) continue
    for (const period of LEVEL_BILLING_PERIODS) {
      totals[period] += parseDecimalInput(line[period])
    }
  }
  for (const period of LEVEL_BILLING_PERIODS) {
    totals[period] = Math.round(totals[period] * 100) / 100
  }
  return totals
})

const chargeLinesYearlySum = computed(() => chargeLinesTotalsByPeriod.value.yearly)

const hasAnyChargePeriodTotal = computed(() =>
  LEVEL_BILLING_PERIODS.some((p) => chargeLinesTotalsByPeriod.value[p] > 0),
)

/** Match fee-package level picker: show monthly / semester / yearly schedules when there are totals or a fee package. */
const showPeriodInstallmentPanel = computed(
  () => usesInstallmentSchedule.value || managedByPackage.value || hasAnyChargePeriodTotal.value,
)

const showInstallmentMismatch = computed(() => {
  if (!usesInstallmentSchedule.value) return false
  return LEVEL_BILLING_PERIODS.some((period) => {
    const total = chargeLinesTotalsByPeriod.value[period]
    if (total <= 0) return false
    return Math.abs(installmentSumForPeriod(period) - total) > 0.02
  })
})

function syncYearTotalFromCharges() {
  profileForm.value.year_total_amount = chargeLinesYearlySum.value
}

function resetPeriodInstallmentState() {
  const maps = emptyPeriodMaps()
  periodDownpayment.value = maps.downpayment
  periodInstallmentMonths.value = maps.installmentMonths
  periodScheduleMonths.value = maps.scheduleMonths
}

function applyPeriodMapsFromProfileInstallments(rows: InstRow[]) {
  const advanceKey = t('paymentSettings.advanceInstallmentLabel')
  const maps = installmentsToPeriodMaps(
    rows.map((r) => ({
      sequence: r.sequence,
      month_number: r.month_number,
      label: r.label,
      amount: r.amount,
    })),
    advanceKey,
  )
  periodDownpayment.value = maps.downpayment
  periodInstallmentMonths.value = maps.installmentMonths
  periodScheduleMonths.value = maps.scheduleMonths
}

function applyPeriodMaps(maps: ReturnType<typeof emptyPeriodMaps>) {
  periodDownpayment.value = maps.downpayment
  periodInstallmentMonths.value = maps.installmentMonths
  periodScheduleMonths.value = maps.scheduleMonths
}

async function syncPeriodSettingsFromFeePackage() {
  const pkgId = feePackage.value?.id
  const lid = currentLevelId.value
  if (!pkgId || !lid) return
  try {
    const pkg = await feePackageService.getOne(pkgId)
    const maps = hydratePeriodMapsFromPackageLevel(
      lid,
      pkg.level_period_settings ?? [],
      chargeLinesTotalsByPeriod.value,
    )
    applyPeriodMaps(maps)
  } catch {
    /* keep profile-derived state */
  }
}

function applyDefaultPeriodMapsFromChargeTotals() {
  const maps = emptyPeriodMaps()
  for (const period of LEVEL_BILLING_PERIODS) {
    if (chargeLinesTotalsByPeriod.value[period] <= 0) continue
    const months = defaultScheduleMonthsForPeriod(period)
    maps.scheduleMonths[period] = months
    maps.installmentMonths[period] = months.length
  }
  applyPeriodMaps(maps)
}

function buildInstallmentsForSave(): UpsertLevelPaymentProfilePayload['installments'] {
  const advanceLabel = t('paymentSettings.advanceInstallmentLabel')
  for (const period of [...LEVEL_BILLING_PERIODS].reverse() as LevelChargeBillingPeriod[]) {
    const total = chargeLinesTotalsByPeriod.value[period]
    if (total <= 0) continue
    const rows = deriveInstallmentRowsFromPeriod(
      total,
      parseAmount(periodDownpayment.value[period]),
      periodScheduleMonths.value[period],
      { downpaymentLabel: advanceLabel },
    )
    if (!rows.length) continue
    return rows.map((r) => ({
      sequence: r.sequence,
      month_number: r.month_number,
      label: r.label,
      amount: r.amount,
    }))
  }
  return []
}

function clearFlash() {
  flashError.value = ''
}

function resetProfileFormDefaults() {
  profileForm.value = {
    year_payment_mode: 'one_time',
    year_total_amount: 0,
    currency: 'OMR',
    charge_lines: [],
    installments: [],
    discount_lines: [],
  }
  resetPeriodInstallmentState()
  syncYearTotalFromCharges()
}

function addChargeLineRow() {
  profileForm.value.charge_lines.push(emptyChargeLineRow())
}

function removeChargeLineRow(idx: number) {
  profileForm.value.charge_lines.splice(idx, 1)
}

function addDiscountLineRow() {
  profileForm.value.discount_lines.push({ discount_type_id: '' })
}

function removeDiscountLineRow(idx: number) {
  profileForm.value.discount_lines.splice(idx, 1)
}

function applyProfileFromApi(p: LevelPaymentProfileApi | null) {
  if (!p) {
    resetProfileFormDefaults()
    return
  }
  const ym = (p.year_payment_mode || 'one_time') as 'one_time' | 'installments' | 'both'
  profileForm.value = {
    year_payment_mode: ym,
    year_total_amount: p.year_total_amount != null ? Number(p.year_total_amount) : 0,
    currency: (p.currency || 'OMR').slice(0, 3),
    charge_lines: (() => {
      if (!p.chargeLines?.length) return []
      const byType = new Map<string, ChargeLineRow>()
      for (const cl of p.chargeLines) {
        const cid = String(cl.charge_type_id ?? '')
        if (!cid) continue
        if (!byType.has(cid)) byType.set(cid, emptyChargeLineRow())
        const row = byType.get(cid)!
        row.charge_type_id = cid
        const period = (cl.billing_period ?? 'yearly') as LevelChargeBillingPeriod
        if (LEVEL_BILLING_PERIODS.includes(period)) {
          row[period] = amountToInputString(cl.amount)
        }
      }
      return [...byType.values()]
    })(),
    installments:
      p.installments && p.installments.length
        ? [...p.installments]
            .sort((a, b) => a.sequence - b.sequence)
            .map((i) => ({
              sequence: i.sequence,
              month_number: i.month_number,
              label: i.label || '',
              amount: amountToInputString(i.amount),
            }))
        : [],
    discount_lines:
      p.discountLinks && p.discountLinks.length
        ? p.discountLinks.map((l) => ({ discount_type_id: l.discount_type_id }))
        : [],
  }
  syncYearTotalFromCharges()
  if (feePackage.value?.id) {
    return
  }
  if (profileForm.value.installments.length) {
    applyPeriodMapsFromProfileInstallments(profileForm.value.installments)
    applyDefaultPeriodMapsFromChargeTotals()
  } else if (usesInstallmentSchedule.value) {
    applyDefaultPeriodMapsFromChargeTotals()
  } else {
    resetPeriodInstallmentState()
  }
}

async function loadCatalogs() {
  const sid = schoolId.value
  const [ch, disc] = await Promise.all([
    paymentConfigService.listChargeTypes(sid),
    paymentConfigService.listDiscountTypes(sid),
  ])
  chargeTypes.value = ch
  discountTypes.value = disc
}

async function loadBundle() {
  const id = currentLevelId.value
  if (!id) return
  try {
    const data = await paymentConfigService.getProfileByLevel(id)
    linkedLevel.value = data.level
    gradeInfo.value = data.grade
    let pkg = data.fee_package ?? null
    if (!pkg?.id) {
      const summaries = await paymentConfigService.listLevelsSummary(schoolId.value)
      const row = summaries.find((s) => String(s.id) === String(id))
      if (row?.fee_package_id) {
        pkg = {
          id: row.fee_package_id,
          name: row.fee_package_name?.trim() || '—',
        }
      }
    }
    feePackage.value = pkg
    applyProfileFromApi(data.profile)
    if (feePackage.value?.id) {
      await syncPeriodSettingsFromFeePackage()
    }
  } catch (e: any) {
    linkedLevel.value = null
    gradeInfo.value = null
    feePackage.value = null
    flashError.value = e?.message || t('paymentSettings.loadError')
    resetProfileFormDefaults()
  }
}

async function boot() {
  pageLoading.value = true
  clearFlash()
  linkedLevel.value = null
  gradeInfo.value = null
  try {
    await loadCatalogs()
    if (route.name === 'payment-level-edit' && currentLevelId.value) {
      await loadBundle()
    }
  } finally {
    pageLoading.value = false
  }
}

watch(
  () => [route.name, route.params.levelId],
  () => {
    if (route.name !== 'payment-level-edit') return
    boot()
  },
  { immediate: true },
)

watch(
  () => profileForm.value.charge_lines,
  () => {
    syncYearTotalFromCharges()
  },
  { deep: true },
)

async function saveProfile() {
  const id = currentLevelId.value
  if (!id) return
  if (managedByPackage.value) {
    flashError.value = t('paymentSettings.managedByFeePackageHint')
    return
  }
  clearFlash()
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = t('paymentSettings.saveFeeProgressTitle')
  progressMessage.value = t('paymentSettings.saveFeeProgressMessage')
  progressSuccessTitle.value = ''
  progressSuccessMessage.value = ''
  feeSaveErrorMessage.value = ''
  profileSaving.value = true
  try {
    const f = profileForm.value
    const charge_lines: UpsertLevelPaymentProfilePayload['charge_lines'] = []
    for (const row of f.charge_lines) {
      const charge_type_id = String(row.charge_type_id ?? '').trim()
      if (!charge_type_id) continue
      for (const billing_period of LEVEL_BILLING_PERIODS) {
        const amount = parseDecimalInput(row[billing_period])
        if (amount > 0) charge_lines.push({ charge_type_id, billing_period, amount })
      }
    }

    const installments =
      f.year_payment_mode !== 'installments' && f.year_payment_mode !== 'both'
        ? []
        : buildInstallmentsForSave()

    const discount_type_ids = [
      ...new Set(
        f.discount_lines.map((l) => l.discount_type_id).filter((id): id is string => Boolean(id && id.trim())),
      ),
    ]

    const linesTotal = Math.round(
      charge_lines
        .filter((l) => (l.billing_period ?? 'yearly') === 'yearly')
        .reduce((acc, l) => acc + Number(l.amount), 0) * 100,
    ) / 100

    const body: UpsertLevelPaymentProfilePayload = {
      school_id: schoolId.value,
      pricing_model: 'per_year',
      year_payment_mode: f.year_payment_mode,
      year_total_amount: linesTotal,
      currency: f.currency,
      charge_lines,
      installments,
      discount_type_ids,
    }

    await paymentConfigService.saveProfileForLevel(id, body)
    await loadBundle()
    progressSuccessTitle.value = t('common.success')
    progressSuccessMessage.value = t('paymentSettings.profileSaved')
    progressState.value = 'success'
    setTimeout(() => {
      showProgressDialog.value = false
    }, 1500)
  } catch (e: any) {
    progressState.value = 'error'
    feeSaveErrorMessage.value = e?.message || t('paymentSettings.saveError')
    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  } finally {
    profileSaving.value = false
  }
}
</script>
