<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="flashError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{{ flashError }}</div>
      <div v-if="flashOk" class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-900">{{ flashOk }}</div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-4">
          <router-link
            to="/settings/payments/packages"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('paymentSettings.backToFeePackages')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="min-w-0 flex-1 text-xl font-bold text-gray-900">
            {{ isNew ? $t('paymentSettings.createFeePackage') : $t('paymentSettings.editFeePackage') }}
          </h1>
        </div>

        <template v-if="pageLoading">
          <div class="px-4 py-12 text-center text-sm text-gray-600">{{ $t('common.loading') }}…</div>
        </template>
        <template v-else>
          <div class="border-b border-gray-200 bg-gray-100/70 px-3 py-2 sm:px-4">
            <nav class="flex flex-wrap gap-1" role="tablist">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                role="tab"
                :aria-selected="activeTab === tab.id"
                class="rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4 sm:py-2.5"
                :class="
                  activeTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200/90'
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                "
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <div class="p-6 space-y-6">
          <!-- Setup -->
          <div v-show="activeTab === 'setup'" class="space-y-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
              <div class="w-full min-w-0 sm:flex-[2]">
                <label class="mb-1.5 block text-base font-semibold text-gray-900">{{ $t('paymentSettings.packageName') }}</label>
                <input
                  v-model="name"
                  type="text"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base"
                  required
                />
              </div>
              <div class="w-full min-w-0 sm:flex-1">
                <label class="mb-1.5 block text-sm font-medium text-gray-900">{{ $t('paymentSettings.yearPaymentMode') }}</label>
                <select v-model="yearPaymentMode" class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm sm:text-base">
                  <option value="one_time">{{ $t('paymentSettings.oneTime') }}</option>
                  <option value="installments">{{ $t('paymentSettings.installments') }}</option>
                  <option value="both">{{ $t('paymentSettings.yearPaymentModeBoth') }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-base font-semibold text-gray-900">{{ $t('paymentSettings.chargesCardTitle') }}</h3>
              <div
                v-if="!activeChargeTypes.length"
                class="rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-4 py-8 text-center text-sm text-amber-950"
              >
                <p class="font-medium">{{ $t('paymentSettings.noChargeTypesInCatalog') }}</p>
                <router-link to="/system-settings#payment-fee-discount-catalogs" class="mt-2 inline-block text-sm font-medium text-primary-700 hover:underline">
                  {{ $t('systemSettings.feeItemsLines') }}
                </router-link>
              </div>
              <template v-else>
                <div
                  v-if="!chargeLines.length"
                  class="rounded-lg border border-dashed border-gray-300 bg-gray-50/60 px-4 py-10 text-center"
                >
                  <p class="text-sm font-medium text-gray-800">{{ $t('paymentSettings.noChargeTypesAdded') }}</p>
                  <p class="mt-1 text-xs text-gray-500">{{ $t('paymentSettings.noChargeTypesAddedHint') }}</p>
                  <button
                    type="button"
                    class="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    @click="addChargeLineRow"
                  >
                    {{ $t('paymentSettings.addChargeLine') }}
                  </button>
                </div>
                <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col" class="w-12 whitespace-nowrap px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                            #
                          </th>
                          <th scope="col" class="px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {{ $t('paymentSettings.packageGridChargeType') }}
                          </th>
                          <th scope="col" class="w-24 whitespace-nowrap px-3 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {{ $t('common.actions') }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100 bg-white">
                        <tr v-for="(line, idx) in chargeLines" :key="'chg-' + idx" class="hover:bg-gray-50/80">
                          <td class="whitespace-nowrap px-3 py-2 align-middle tabular-nums text-gray-500">{{ idx + 1 }}</td>
                          <td class="px-3 py-2 align-middle">
                            <select
                              v-model="line.charge_type_id"
                              class="block w-full min-w-[14rem] max-w-xl rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            >
                              <option value="">{{ $t('paymentSettings.pickChargeType') }}</option>
                              <option
                                v-for="c in availableChargeTypesForRow(idx)"
                                :key="c.id"
                                :value="String(c.id)"
                              >
                                {{ c.label }}
                              </option>
                            </select>
                          </td>
                          <td class="whitespace-nowrap px-3 py-2 align-middle text-end">
                            <button
                              type="button"
                              class="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"
                              :aria-label="$t('common.remove')"
                              @click="removeChargeLineRow(idx)"
                            >
                              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="border-t border-gray-100 bg-gray-50/80 px-3 py-2">
                    <button
                      type="button"
                      class="flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-primary-700 hover:bg-primary-50/80"
                      @click="addChargeLineRow"
                    >
                      <span class="text-lg leading-none">+</span>
                      {{ $t('paymentSettings.packageGridAddRowFooter') }}
                    </button>
                  </div>
                </div>
              </template>
            </div>

            <div class="space-y-3">
              <h3 class="text-base font-semibold text-gray-900">{{ $t('paymentSettings.discountsCardTitle') }}</h3>
              <div
                v-if="!activeDiscountTypes.length"
                class="rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-4 py-8 text-center text-sm text-amber-950"
              >
                <p class="font-medium">{{ $t('paymentSettings.noDiscountTypesInCatalog') }}</p>
                <router-link to="/system-settings#payment-fee-discount-catalogs" class="mt-2 inline-block text-sm font-medium text-primary-700 hover:underline">
                  {{ $t('systemSettings.discountItemsLines') }}
                </router-link>
              </div>
              <template v-else>
                <div
                  v-if="!discountLines.length"
                  class="rounded-lg border border-dashed border-gray-300 bg-gray-50/60 px-4 py-10 text-center"
                >
                  <p class="text-sm font-medium text-gray-800">{{ $t('paymentSettings.noDiscountTypesAdded') }}</p>
                  <p class="mt-1 text-xs text-gray-500">{{ $t('paymentSettings.noDiscountTypesAddedHint') }}</p>
                  <button
                    type="button"
                    class="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    @click="addDiscountLineRow"
                  >
                    {{ $t('paymentSettings.addDiscountLine') }}
                  </button>
                </div>
                <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col" class="w-12 whitespace-nowrap px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                            #
                          </th>
                          <th scope="col" class="px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {{ $t('paymentSettings.packageGridDiscountType') }}
                          </th>
                          <th scope="col" class="w-24 whitespace-nowrap px-3 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {{ $t('common.actions') }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100 bg-white">
                        <tr v-for="(line, idx) in discountLines" :key="'disc-' + idx" class="hover:bg-gray-50/80">
                          <td class="whitespace-nowrap px-3 py-2 align-middle tabular-nums text-gray-500">{{ idx + 1 }}</td>
                          <td class="px-3 py-2 align-middle">
                            <select
                              v-model="line.discount_type_id"
                              class="block w-full min-w-[14rem] max-w-xl rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            >
                              <option value="">{{ $t('paymentSettings.pickDiscountType') }}</option>
                              <option
                                v-for="d in availableDiscountTypesForRow(idx)"
                                :key="d.id"
                                :value="String(d.id)"
                              >
                                {{ d.label }}
                              </option>
                            </select>
                          </td>
                          <td class="whitespace-nowrap px-3 py-2 align-middle text-end">
                            <button
                              type="button"
                              class="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"
                              :aria-label="$t('common.remove')"
                              @click="removeDiscountLineRow(idx)"
                            >
                              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="border-t border-gray-100 bg-gray-50/80 px-3 py-2">
                    <button
                      type="button"
                      class="flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-primary-700 hover:bg-primary-50/80"
                      @click="addDiscountLineRow"
                    >
                      <span class="text-lg leading-none">+</span>
                      {{ $t('paymentSettings.packageGridAddRowFooter') }}
                    </button>
                  </div>
                </div>
              </template>
            </div>

            <div
              v-if="usesInstallmentSchedule"
              class="space-y-3 border-t border-gray-100 pt-6"
            >
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 class="text-base font-semibold text-gray-900">{{ $t('paymentSettings.sectionInstallments') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ $t('paymentSettings.packageInstallmentsHint') }}</p>
                </div>
                <button
                  type="button"
                  class="inline-flex shrink-0 items-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                  @click="addPackageInstallmentRow"
                >
                  <span class="me-1 text-lg leading-none" aria-hidden="true">+</span>
                  {{ $t('paymentSettings.addInstallment') }}
                </button>
              </div>
              <div class="overflow-x-auto rounded-lg border border-gray-200">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="w-24 px-3 py-2 text-start font-semibold text-gray-700">
                        {{ $t('paymentSettings.sequence') }}
                      </th>
                      <th scope="col" class="min-w-[10rem] px-3 py-2 text-start font-semibold text-gray-700">
                        {{ $t('paymentSettings.instLabel') }}
                      </th>
                      <th scope="col" class="w-28 px-3 py-2 text-start font-semibold text-gray-700">
                        {{ $t('paymentSettings.month') }}
                      </th>
                      <th scope="col" class="w-36 px-3 py-2 text-start font-semibold text-gray-700">
                        {{ $t('paymentSettings.amount') }}
                      </th>
                      <th scope="col" class="w-24 px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(inst, idx) in packageInstallments"
                      :key="'pkg-inst-' + idx"
                      class="border-t border-gray-200 bg-white hover:bg-gray-50"
                    >
                      <td class="px-3 py-2 align-middle">
                        <input
                          v-model.number="inst.sequence"
                          type="number"
                          min="1"
                          class="w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
                          :aria-label="$t('paymentSettings.sequence')"
                        />
                      </td>
                      <td class="px-3 py-2 align-middle">
                        <input
                          v-model="inst.label"
                          type="text"
                          class="w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
                          :placeholder="$t('paymentSettings.instLabel')"
                          :aria-label="$t('paymentSettings.instLabel')"
                        />
                      </td>
                      <td class="px-3 py-2 align-middle">
                        <input
                          v-model.number="inst.month_number"
                          type="number"
                          min="1"
                          max="12"
                          class="w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
                          :placeholder="$t('paymentSettings.month')"
                          :aria-label="$t('paymentSettings.month')"
                        />
                      </td>
                      <td class="px-3 py-2 align-middle">
                        <input
                          v-model="inst.amount"
                          type="text"
                          inputmode="decimal"
                          autocomplete="off"
                          class="w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm tabular-nums"
                          :placeholder="$t('paymentSettings.amount')"
                          :aria-label="$t('paymentSettings.amount')"
                        />
                      </td>
                      <td class="whitespace-nowrap px-3 py-2 align-middle">
                        <button
                          type="button"
                          class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          :aria-label="$t('common.delete')"
                          @click="packageInstallments.splice(idx, 1)"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <span class="text-gray-500">{{ $t('paymentSettings.installSumLabel') }}</span>
                  <span class="font-semibold tabular-nums text-gray-900">
                    {{ packageInstallmentsSum.toFixed(2) }} OMR
                  </span>
                </div>
              </div>
              <p
                v-if="showPackageInstallmentMismatch"
                class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
              >
                {{ $t('paymentSettings.packageInstallMismatchHint') }}
              </p>
            </div>

          </div>

          <!-- Levels -->
          <div v-show="activeTab === 'levels'" class="space-y-3">
            <p v-if="!packageChargeTypeIds.length" class="text-sm text-amber-800">{{ $t('paymentSettings.packageSelectChargesFirst') }}</p>
            <template v-else>
              <div
                v-if="levelRows.length"
                class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('paymentSettings.packageLevelsGridHeading') }}</h3>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
                  :disabled="!availableLevelsForPicker.length"
                  @click="openLevelPicker()"
                >
                  {{ $t('paymentSettings.packageAddLevel') }}
                </button>
              </div>

              <div
                v-if="!levelRows.length"
                class="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-8 text-center"
              >
                <p class="text-sm text-gray-600">{{ $t('paymentSettings.packageLevelsEmpty') }}</p>
                <button
                  type="button"
                  class="mt-3 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
                  :disabled="!availableLevelsForPicker.length"
                  @click="openLevelPicker()"
                >
                  {{ $t('paymentSettings.packageAddLevel') }}
                </button>
              </div>

              <div v-else class="space-y-5">
                <div
                  class="md:hidden"
                  role="tablist"
                  :aria-label="$t('paymentSettings.packageBillingPeriodSwitcher')"
                >
                  <div class="grid grid-cols-3 gap-0.5 rounded-lg border border-gray-200 bg-gray-100/80 p-0.5">
                    <button
                      v-for="bp in LEVEL_BILLING_PERIODS"
                      :key="'levels-summary-bp-' + bp"
                      type="button"
                      role="tab"
                      :aria-selected="levelsSummaryMobilePeriod === bp"
                      class="rounded-md px-2 py-2 text-xs font-semibold transition-colors"
                      :class="billingPeriodSwitcherClass(levelsSummaryMobilePeriod === bp)"
                      @click="levelsSummaryMobilePeriod = bp"
                    >
                      {{ billingPeriodColumnLabel(bp) }}
                    </button>
                  </div>
                </div>

                <article
                  v-for="(levelRow, levelIdx) in levelRows"
                  :key="levelRow.level_id"
                  class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
                >
                  <header
                    class="flex flex-wrap items-start justify-between gap-2 bg-primary-50/35 px-3 py-2.5 sm:px-4"
                    :class="isLevelCardCollapsed(levelRow.level_id) ? '' : 'border-b border-gray-100'"
                  >
                    <div class="min-w-0 space-y-0.5">
                      <p class="text-base font-semibold leading-snug text-gray-900">{{ levelTitle(levelRow.level_id) }}</p>
                      <p v-if="levelById(levelRow.level_id)?.code" class="font-mono text-xs text-gray-500">
                        {{ levelById(levelRow.level_id)?.code }}
                      </p>
                    </div>
                    <div class="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        class="rounded-md border border-primary-200 bg-white px-2.5 py-1 text-xs font-medium text-primary-800 shadow-sm hover:bg-primary-50"
                        @click.stop="openLevelPicker(levelRow.level_id)"
                      >
                        {{ $t('common.edit') }}
                      </button>
                      <button
                        type="button"
                        class="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-800 shadow-sm hover:bg-red-50"
                        @click="removeLevelRow(levelIdx)"
                      >
                        {{ $t('common.remove') }}
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                        :aria-label="
                          isLevelCardCollapsed(levelRow.level_id)
                            ? $t('paymentSettings.packageCardExpand')
                            : $t('paymentSettings.packageCardCollapse')
                        "
                        :aria-expanded="!isLevelCardCollapsed(levelRow.level_id)"
                        @click.stop="toggleLevelCardCollapsed(levelRow.level_id)"
                      >
                        <svg
                          class="h-3.5 w-3.5 transition-transform duration-200"
                          :class="{ 'rotate-180': !isLevelCardCollapsed(levelRow.level_id) }"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </header>

                  <div
                    v-if="isLevelCardCollapsed(levelRow.level_id)"
                    class="overflow-x-auto px-2 py-1 sm:px-3"
                    :dir="isRTL ? 'rtl' : 'ltr'"
                  >
                    <table class="min-w-full border-collapse text-sm leading-snug">
                      <thead class="bg-gray-50/80">
                        <tr>
                          <th
                            scope="col"
                            class="min-w-[7rem] px-2 py-1.5 text-start text-xs font-semibold uppercase tracking-wide text-gray-600"
                          >
                            {{ $t('paymentSettings.packageGridChargeType') }}
                          </th>
                          <th
                            v-for="period in LEVEL_BILLING_PERIODS"
                            :key="levelRow.level_id + '-mini-hdr-' + period"
                            scope="col"
                            class="min-w-[4.5rem] px-2 py-1.5 text-end text-xs font-semibold uppercase tracking-wide text-gray-600"
                          >
                            {{ billingPeriodColumnLabel(period) }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="bg-primary-50/25">
                          <td class="px-2 py-1.5 text-sm font-semibold text-primary-900">
                            {{ $t('paymentSettings.packageLevelRowTotal') }}
                          </td>
                          <td
                            v-for="period in LEVEL_BILLING_PERIODS"
                            :key="levelRow.level_id + '-mini-total-' + period"
                            class="px-2 py-1.5 text-end text-sm font-bold tabular-nums text-primary-900"
                          >
                            {{ formatLevelRowTotalByPeriod(levelRow.level_id, period) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <template v-else>
                  <div class="md:hidden divide-y divide-gray-100 px-3 py-1" :dir="isRTL ? 'rtl' : 'ltr'">
                    <div
                      v-for="cid in packageChargeTypeIds"
                      :key="levelRow.level_id + '-m-chg-' + cid"
                      class="flex items-center justify-between gap-3 py-2.5"
                    >
                      <span class="min-w-0 text-sm text-gray-800">{{ chargeLabel(cid) }}</span>
                      <span class="shrink-0 text-sm font-medium tabular-nums text-gray-900">
                        {{ formatDisplayAmount(getLevelAmount(levelRow.level_id, cid, levelsSummaryMobilePeriod)) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between gap-3 bg-primary-50/25 py-2.5">
                      <span class="text-sm font-semibold text-primary-900">{{ $t('paymentSettings.packageLevelRowTotal') }}</span>
                      <span class="text-sm font-bold tabular-nums text-primary-900">
                        {{ formatLevelRowTotalByPeriod(levelRow.level_id, levelsSummaryMobilePeriod) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between gap-3 bg-amber-50/20 py-2.5">
                      <span class="text-sm font-medium text-amber-950">{{ $t('paymentSettings.packagePickerDownpayment') }}</span>
                      <span class="text-sm tabular-nums text-amber-950">
                        {{ formatDisplayAmount(getLevelDownpayment(levelRow.level_id, levelsSummaryMobilePeriod)) }}
                      </span>
                    </div>
                  </div>

                  <div class="hidden overflow-x-auto md:block" :dir="isRTL ? 'rtl' : 'ltr'">
                    <table class="min-w-full border-collapse text-sm leading-snug">
                      <thead class="bg-gray-50/80">
                        <tr>
                          <th
                            scope="col"
                            class="min-w-[9rem] border-s border-gray-100 px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600 first:border-s-0"
                          >
                            {{ $t('paymentSettings.packageGridChargeType') }}
                          </th>
                          <th
                            v-for="period in LEVEL_BILLING_PERIODS"
                            :key="levelRow.level_id + '-hdr-' + period"
                            scope="col"
                            class="min-w-[5.5rem] border-s border-gray-100 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-600"
                          >
                            {{ billingPeriodColumnLabel(period) }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr
                          v-for="cid in packageChargeTypeIds"
                          :key="levelRow.level_id + '-chg-' + cid"
                          class="bg-white"
                        >
                          <td class="border-s border-gray-100 px-3 py-2 align-middle text-gray-800 first:border-s-0">
                            {{ chargeLabel(cid) }}
                          </td>
                          <td
                            v-for="period in LEVEL_BILLING_PERIODS"
                            :key="levelRow.level_id + '-' + cid + '-' + period"
                            class="border-s border-gray-100 px-2 py-2 align-middle text-end tabular-nums text-gray-900"
                          >
                            {{ formatDisplayAmount(getLevelAmount(levelRow.level_id, cid, period)) }}
                          </td>
                        </tr>
                        <tr class="bg-primary-50/25">
                          <td class="border-s border-gray-100 px-3 py-2 align-middle text-sm font-semibold text-primary-900 first:border-s-0">
                            {{ $t('paymentSettings.packageLevelRowTotal') }}
                          </td>
                          <td
                            v-for="period in LEVEL_BILLING_PERIODS"
                            :key="levelRow.level_id + '-total-' + period"
                            class="border-s border-gray-100 px-2 py-2 align-middle text-end text-sm font-bold tabular-nums text-primary-900"
                          >
                            {{ formatLevelRowTotalByPeriod(levelRow.level_id, period) }}
                          </td>
                        </tr>
                        <tr class="bg-amber-50/20">
                          <td class="border-s border-gray-100 px-3 py-2 align-middle text-sm font-medium text-amber-950 first:border-s-0">
                            {{ $t('paymentSettings.packagePickerDownpayment') }}
                          </td>
                          <td
                            v-for="period in LEVEL_BILLING_PERIODS"
                            :key="levelRow.level_id + '-dp-' + period"
                            class="border-s border-gray-100 px-2 py-2 align-middle text-end text-sm tabular-nums text-amber-950"
                          >
                            {{ formatDisplayAmount(getLevelDownpayment(levelRow.level_id, period)) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  </template>
                </article>
              </div>
            </template>
          </div>

          <!-- Courses -->
          <div v-show="activeTab === 'courses'" class="space-y-4">
            <p v-if="!packageChargeTypeIds.length" class="text-sm text-amber-800">{{ $t('paymentSettings.packageSelectChargesFirst') }}</p>
            <template v-else>
              <div
                v-if="courseRows.length"
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('paymentSettings.packageCoursesGridHeading') }}</h3>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
                  :disabled="!availableCoursesForPicker.length"
                  @click="openCoursePicker()"
                >
                  {{ $t('paymentSettings.packageAddCourse') }}
                </button>
              </div>

              <div v-if="!courseRows.length" class="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-10 text-center">
                <p class="text-sm text-gray-600">{{ $t('paymentSettings.packageCoursesEmpty') }}</p>
                <button
                  type="button"
                  class="mt-4 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
                  :disabled="!availableCoursesForPicker.length"
                  @click="openCoursePicker()"
                >
                  {{ $t('paymentSettings.packageAddCourse') }}
                </button>
              </div>

              <div v-else class="space-y-5">
                <article
                  v-for="(row, idx) in courseRows"
                  :key="row.course_id"
                  class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
                >
                  <header
                    class="flex flex-wrap items-start justify-between gap-2 bg-primary-50/35 px-3 py-2.5 sm:px-4"
                    :class="isCourseCardCollapsed(row.course_id) ? '' : 'border-b border-gray-100'"
                  >
                    <div class="min-w-0 space-y-0.5">
                      <p class="text-base font-semibold leading-snug text-gray-900">{{ courseTitle(row.course_id) }}</p>
                    </div>
                    <div class="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        class="rounded-md border border-primary-200 bg-white px-2.5 py-1 text-xs font-medium text-primary-800 shadow-sm hover:bg-primary-50"
                        @click.stop="openCoursePicker(row.course_id)"
                      >
                        {{ $t('common.edit') }}
                      </button>
                      <button
                        type="button"
                        class="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-800 shadow-sm hover:bg-red-50"
                        @click="removeCourseRow(idx)"
                      >
                        {{ $t('common.remove') }}
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                        :aria-label="
                          isCourseCardCollapsed(row.course_id)
                            ? $t('paymentSettings.packageCardExpand')
                            : $t('paymentSettings.packageCardCollapse')
                        "
                        :aria-expanded="!isCourseCardCollapsed(row.course_id)"
                        @click.stop="toggleCourseCardCollapsed(row.course_id)"
                      >
                        <svg
                          class="h-3.5 w-3.5 transition-transform duration-200"
                          :class="{ 'rotate-180': !isCourseCardCollapsed(row.course_id) }"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </header>

                  <div
                    v-if="isCourseCardCollapsed(row.course_id)"
                    class="overflow-x-auto px-2 py-1 sm:px-3"
                    :dir="isRTL ? 'rtl' : 'ltr'"
                  >
                    <table class="min-w-full border-collapse text-sm leading-snug">
                      <thead class="bg-gray-50/80">
                        <tr>
                          <th
                            scope="col"
                            class="min-w-[7rem] px-2 py-1.5 text-start text-xs font-semibold uppercase tracking-wide text-gray-600"
                          >
                            {{ $t('paymentSettings.packageGridChargeType') }}
                          </th>
                          <th
                            scope="col"
                            class="min-w-[4.5rem] px-2 py-1.5 text-end text-xs font-semibold uppercase tracking-wide text-gray-600"
                          >
                            {{ $t('paymentSettings.packageLevelRowTotal') }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="bg-primary-50/25">
                          <td class="px-2 py-1.5 text-sm font-semibold text-primary-900">
                            {{ $t('paymentSettings.packageLevelRowTotal') }}
                          </td>
                          <td class="px-2 py-1.5 text-end text-sm font-bold tabular-nums text-primary-900">
                            {{ formatCourseRowTotal(row.course_id) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <template v-else>
                  <div class="md:hidden divide-y divide-gray-100 px-3 py-1" :dir="isRTL ? 'rtl' : 'ltr'">
                    <div
                      v-for="cid in packageChargeTypeIds"
                      :key="row.course_id + '-m-chg-' + cid"
                      class="flex items-center justify-between gap-3 py-2.5"
                    >
                      <span class="min-w-0 text-sm text-gray-800">{{ chargeLabel(cid) }}</span>
                      <span class="shrink-0 text-sm font-medium tabular-nums text-gray-900">
                        {{ formatDisplayAmount(getCourseAmount(row.course_id, cid)) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between gap-3 bg-primary-50/25 py-2.5">
                      <span class="text-sm font-semibold text-primary-900">{{ $t('paymentSettings.packageLevelRowTotal') }}</span>
                      <span class="text-sm font-bold tabular-nums text-primary-900">
                        {{ formatCourseRowTotal(row.course_id) }}
                      </span>
                    </div>
                  </div>

                  <div class="hidden overflow-x-auto md:block" :dir="isRTL ? 'rtl' : 'ltr'">
                    <table class="min-w-full border-collapse text-sm leading-snug">
                      <thead class="bg-gray-50/80">
                        <tr>
                          <th
                            scope="col"
                            class="min-w-[9rem] border-s border-gray-100 px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600 first:border-s-0"
                          >
                            {{ $t('paymentSettings.packageGridChargeType') }}
                          </th>
                          <th
                            scope="col"
                            class="min-w-[5.5rem] border-s border-gray-100 px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-gray-600"
                          >
                            {{ $t('paymentSettings.packageModalChargeValuesTitle') }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr
                          v-for="cid in packageChargeTypeIds"
                          :key="row.course_id + '-chg-' + cid"
                          class="bg-white"
                        >
                          <td class="border-s border-gray-100 px-3 py-2 align-middle text-gray-800 first:border-s-0">
                            {{ chargeLabel(cid) }}
                          </td>
                          <td class="border-s border-gray-100 px-2 py-2 align-middle text-end tabular-nums text-gray-900">
                            {{ formatDisplayAmount(getCourseAmount(row.course_id, cid)) }}
                          </td>
                        </tr>
                        <tr class="bg-primary-50/25">
                          <td class="border-s border-gray-100 px-3 py-2 align-middle text-sm font-semibold text-primary-900 first:border-s-0">
                            {{ $t('paymentSettings.packageLevelRowTotal') }}
                          </td>
                          <td class="border-s border-gray-100 px-2 py-2 align-middle text-end text-sm font-bold tabular-nums text-primary-900">
                            {{ formatCourseRowTotal(row.course_id) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  </template>
                </article>
              </div>
            </template>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <button
              v-if="!isNew && packageId"
              type="button"
              class="text-sm text-red-600 hover:text-red-800"
              :disabled="saving"
              @click="removePackage"
            >
              {{ $t('paymentSettings.deleteFeePackage') }}
            </button>
            <span v-else></span>
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              :disabled="saving"
              @click="save"
            >
              {{ saving ? $t('common.saving') : $t('paymentSettings.saveFeePackage') }}
            </button>
          </div>
        </div>
      </template>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showLevelPicker"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        :aria-label="levelPickerModalTitle"
        @click.self="closeLevelPicker"
      >
        <div
          class="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl sm:max-h-[min(92vh,40rem)] sm:rounded-xl"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 class="text-base font-semibold text-gray-900">{{ levelPickerModalTitle }}</h2>
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              :aria-label="$t('common.close')"
              @click="closeLevelPicker"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="border-b border-gray-100 px-2 pt-2">
            <nav
              class="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
              role="tablist"
            >
              <button
                v-for="tab in levelPickerTabs"
                :key="tab.id"
                type="button"
                role="tab"
                :aria-selected="levelPickerTab === tab.id"
                class="shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors"
                :class="
                  levelPickerTab === tab.id
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                "
                @click="setLevelPickerTab(tab.id)"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto p-4">
            <div v-show="levelPickerTab === 'details'" class="space-y-4">
              <div v-if="levelPickerIsEdit">
                <p class="text-sm font-medium text-gray-500">{{ $t('paymentSettings.packagePickLevel') }}</p>
                <p class="mt-1 text-base font-semibold text-gray-900">{{ levelPickerSelectedLevel }}</p>
              </div>
              <div v-else>
                <label class="mb-2 block text-sm font-semibold text-gray-900">{{ $t('paymentSettings.packagePickLevel') }}</label>
                <select
                  v-model="levelPickerLevelId"
                  class="block w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">{{ $t('paymentSettings.packagePickLevel') }}</option>
                  <option v-for="lv in availableLevelsForPicker" :key="String(lv.id)" :value="String(lv.id)">
                    {{ levelLabel(lv) }}<template v-if="lv.code"> ({{ lv.code }})</template>
                  </option>
                </select>
              </div>
              <div>
                <p class="mb-2 text-sm font-semibold text-gray-900">
                  {{ $t('paymentSettings.packageModalChargeValuesTitle') }}
                </p>
                <p v-if="!packageChargeTypeIds.length" class="text-sm text-amber-800">
                  {{ $t('paymentSettings.packageSelectChargesFirst') }}
                </p>
                <div v-else class="space-y-3">
                  <div
                    class="md:hidden"
                    role="tablist"
                    :aria-label="$t('paymentSettings.packageBillingPeriodSwitcher')"
                  >
                    <div class="grid grid-cols-3 gap-0.5 rounded-lg border border-gray-200 bg-gray-100/80 p-0.5">
                      <button
                        v-for="bp in LEVEL_BILLING_PERIODS"
                        :key="'picker-details-bp-' + bp"
                        type="button"
                        role="tab"
                        :aria-selected="levelPickerDetailsMobilePeriod === bp"
                        class="rounded-md px-2 py-2 text-xs font-semibold transition-colors"
                        :class="billingPeriodSwitcherClass(levelPickerDetailsMobilePeriod === bp)"
                        @click="levelPickerDetailsMobilePeriod = bp"
                      >
                        {{ billingPeriodColumnLabel(bp) }}
                      </button>
                    </div>
                  </div>

                  <div
                    class="md:hidden overflow-hidden rounded-sm border border-gray-200"
                    :dir="isRTL ? 'rtl' : 'ltr'"
                  >
                    <table class="w-full border-collapse text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col" class="px-3 py-2 text-start text-xs font-semibold text-gray-600">
                            {{ $t('paymentSettings.packageGridChargeType') }}
                          </th>
                          <th scope="col" class="px-3 py-2 text-end text-xs font-semibold text-gray-600">
                            {{ billingPeriodColumnLabel(levelPickerDetailsMobilePeriod) }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="cid in packageChargeTypeIds" :key="'details-m-chg-' + cid">
                          <td class="px-3 py-2 text-gray-800">{{ chargeLabel(cid) }}</td>
                          <td class="px-3 py-2 text-end">
                            <input
                              :value="getLevelPickerAmount(cid, levelPickerDetailsMobilePeriod)"
                              type="text"
                              inputmode="decimal"
                              maxlength="12"
                              :aria-label="`${chargeLabel(cid)} — ${billingPeriodColumnLabel(levelPickerDetailsMobilePeriod)}`"
                              class="box-border ms-auto block w-full max-w-[8rem] rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-end text-sm tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                              @input="setLevelPickerAmount(cid, levelPickerDetailsMobilePeriod, ($event.target as HTMLInputElement).value)"
                            />
                          </td>
                        </tr>
                        <tr class="bg-primary-50/30">
                          <td class="px-3 py-2 font-semibold text-primary-900">
                            {{ $t('paymentSettings.packageLevelRowTotal') }}
                          </td>
                          <td class="px-3 py-2 text-end font-bold tabular-nums text-primary-900">
                            {{ levelPickerDraftTotalsByPeriod[levelPickerDetailsMobilePeriod] }}
                          </td>
                        </tr>
                        <tr class="bg-amber-50/25">
                          <td class="px-3 py-2 font-medium text-amber-950">
                            {{ $t('paymentSettings.packagePickerDownpayment') }}
                          </td>
                          <td class="px-3 py-2 text-end">
                            <input
                              :value="levelPickerDownpayment[levelPickerDetailsMobilePeriod]"
                              type="text"
                              inputmode="decimal"
                              maxlength="12"
                              :aria-label="`${$t('paymentSettings.packagePickerDownpayment')} — ${billingPeriodColumnLabel(levelPickerDetailsMobilePeriod)}`"
                              class="box-border ms-auto block w-full max-w-[8rem] rounded-sm border border-amber-200 bg-white px-2 py-1.5 text-end text-sm tabular-nums focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/25"
                              @input="setLevelPickerDownpayment(levelPickerDetailsMobilePeriod, ($event.target as HTMLInputElement).value)"
                            />
                          </td>
                        </tr>
                        <tr class="bg-gray-50/80">
                          <td class="px-3 py-2 font-medium text-gray-800">
                            {{ $t('paymentSettings.packagePickerInstallmentMonths') }}
                          </td>
                          <td class="px-3 py-2 text-end">
                            <input
                              v-if="levelPickerDetailsMobilePeriod === 'monthly'"
                              value="1"
                              type="text"
                              readonly
                              tabindex="-1"
                              class="box-border ms-auto block w-full max-w-[5rem] cursor-default rounded-sm border border-gray-200 bg-gray-100 px-2 py-1.5 text-center text-sm tabular-nums text-gray-600"
                              :aria-label="$t('paymentSettings.packagePickerInstallmentMonths')"
                            />
                            <input
                              v-else
                              :value="levelPickerInstallmentMonths[levelPickerDetailsMobilePeriod]"
                              type="number"
                              min="1"
                              max="36"
                              class="box-border ms-auto block w-full max-w-[5rem] rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                              @input="onLevelPickerInstallmentMonthsInput(levelPickerDetailsMobilePeriod, ($event.target as HTMLInputElement).value)"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div
                    class="hidden overflow-x-auto overflow-hidden rounded-sm border border-gray-200 md:block"
                    :dir="isRTL ? 'rtl' : 'ltr'"
                  >
                  <table class="w-full table-fixed border-collapse text-sm">
                    <colgroup>
                      <col class="w-1/2" />
                      <col class="w-1/6" />
                      <col class="w-1/6" />
                      <col class="w-1/6" />
                    </colgroup>
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-3 py-2 text-start text-xs font-semibold text-gray-600">
                          {{ $t('paymentSettings.packageGridChargeType') }}
                        </th>
                        <th
                          v-for="bp in LEVEL_BILLING_PERIODS"
                          :key="'details-hdr-' + bp"
                          scope="col"
                          class="px-2 py-2 text-center text-xs font-semibold text-gray-600"
                        >
                          {{ billingPeriodColumnLabel(bp) }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="cid in packageChargeTypeIds" :key="'details-chg-' + cid">
                        <td class="px-3 py-2 text-gray-800">{{ chargeLabel(cid) }}</td>
                        <td
                          v-for="bp in LEVEL_BILLING_PERIODS"
                          :key="'details-cell-' + cid + '-' + bp"
                          class="px-2 py-2 text-center"
                        >
                          <input
                            :value="getLevelPickerAmount(cid, bp)"
                            type="text"
                            inputmode="decimal"
                            maxlength="12"
                            :aria-label="`${chargeLabel(cid)} — ${billingPeriodColumnLabel(bp)}`"
                            class="box-border mx-auto block w-full max-w-[7rem] rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-end text-sm tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                            @input="setLevelPickerAmount(cid, bp, ($event.target as HTMLInputElement).value)"
                          />
                        </td>
                      </tr>
                      <tr class="bg-primary-50/30">
                        <td class="px-3 py-2 font-semibold text-primary-900">
                          {{ $t('paymentSettings.packageLevelRowTotal') }}
                        </td>
                        <td
                          v-for="bp in LEVEL_BILLING_PERIODS"
                          :key="'details-total-' + bp"
                          class="px-2 py-2 text-center font-bold tabular-nums text-primary-900"
                        >
                          {{ levelPickerDraftTotalsByPeriod[bp] }}
                        </td>
                      </tr>
                      <tr class="bg-amber-50/25">
                        <td class="px-3 py-2 font-medium text-amber-950">
                          {{ $t('paymentSettings.packagePickerDownpayment') }}
                        </td>
                        <td
                          v-for="bp in LEVEL_BILLING_PERIODS"
                          :key="'details-dp-' + bp"
                          class="px-2 py-2 text-center"
                        >
                          <input
                            :value="levelPickerDownpayment[bp]"
                            type="text"
                            inputmode="decimal"
                            maxlength="12"
                            :aria-label="`${$t('paymentSettings.packagePickerDownpayment')} — ${billingPeriodColumnLabel(bp)}`"
                            class="box-border mx-auto block w-full max-w-[7rem] rounded-sm border border-amber-200 bg-white px-2 py-1.5 text-end text-sm tabular-nums focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/25"
                            @input="setLevelPickerDownpayment(bp, ($event.target as HTMLInputElement).value)"
                          />
                        </td>
                      </tr>
                      <tr class="bg-gray-50/80">
                        <td class="px-3 py-2 font-medium text-gray-800">
                          {{ $t('paymentSettings.packagePickerInstallmentMonths') }}
                        </td>
                        <td
                          v-for="bp in LEVEL_BILLING_PERIODS"
                          :key="'details-inst-mo-' + bp"
                          class="px-2 py-2 text-center"
                        >
                          <input
                            v-if="bp === 'monthly'"
                            value="1"
                            type="text"
                            readonly
                            tabindex="-1"
                            class="box-border mx-auto block w-full max-w-[4.5rem] cursor-default rounded-sm border border-gray-200 bg-gray-100 px-2 py-1.5 text-center text-sm tabular-nums text-gray-600"
                            :aria-label="$t('paymentSettings.packagePickerInstallmentMonths')"
                          />
                          <input
                            v-else
                            :value="levelPickerInstallmentMonths[bp]"
                            type="number"
                            min="1"
                            max="36"
                            class="box-border mx-auto block w-full max-w-[4.5rem] rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                            @input="onLevelPickerInstallmentMonthsInput(bp, ($event.target as HTMLInputElement).value)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>

            </div>

            <template v-for="period in LEVEL_BILLING_PERIODS" :key="'picker-period-' + period">
              <div v-if="levelPickerTab === period" class="space-y-4">
              <div
                class="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-sm border border-gray-100 bg-gray-50/70 px-3 py-2.5 text-sm text-gray-700"
              >
                <span class="font-medium text-gray-900">{{ billingPeriodColumnLabel(period) }}</span>
                <span class="text-gray-400" aria-hidden="true">·</span>
                <span>
                  {{ $t('paymentSettings.packageLevelRowTotal') }}:
                  <span class="font-semibold tabular-nums text-gray-900">{{ levelPickerDraftTotalsByPeriod[period] }}</span>
                </span>
                <template v-if="String(levelPickerDownpayment[period] ?? '').trim()">
                  <span class="text-gray-400" aria-hidden="true">·</span>
                  <span>
                    {{ $t('paymentSettings.packagePickerDownpayment') }}:
                    <span class="font-semibold tabular-nums text-amber-950">{{ levelPickerDownpayment[period] }}</span>
                  </span>
                </template>
                <span class="text-gray-400" aria-hidden="true">·</span>
                <label class="inline-flex items-center gap-1.5">
                  <span class="font-medium text-gray-700">{{ $t('paymentSettings.packagePickerInstallmentMonths') }}:</span>
                  <input
                    v-if="period === 'monthly'"
                    value="1"
                    type="text"
                    readonly
                    tabindex="-1"
                    class="w-12 cursor-default rounded-sm border border-gray-200 bg-gray-100 px-2 py-0.5 text-center text-sm tabular-nums text-gray-600"
                    :aria-label="$t('paymentSettings.packagePickerInstallmentMonths')"
                  />
                  <input
                    v-else
                    :value="levelPickerInstallmentMonths[period]"
                    type="number"
                    min="1"
                    max="36"
                    class="w-14 rounded-sm border border-gray-300 bg-white px-2 py-0.5 text-center text-sm tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                    :aria-label="$t('paymentSettings.packagePickerInstallmentMonths')"
                    @input="onLevelPickerInstallmentMonthsInput(period, ($event.target as HTMLInputElement).value)"
                  />
                </label>
              </div>

              <div>
                <p class="mb-2 text-sm font-semibold text-gray-900">{{ $t('paymentSettings.packagePickerInstallmentSchedule') }}</p>
                <div class="overflow-hidden rounded-sm border border-gray-200">
                  <table class="w-full table-fixed border-collapse text-sm">
                    <colgroup>
                      <col class="w-1/2" />
                      <col class="w-1/2" />
                    </colgroup>
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-3 py-2 text-start text-xs font-medium text-gray-600">
                          {{ $t('paymentSettings.packagePickerInstallmentMonthCol') }}
                        </th>
                        <th class="px-3 py-2 text-end text-xs font-medium text-gray-600">
                          {{ $t('paymentSettings.packagePickerInstallmentAmountCol') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr
                        v-for="row in levelPickerScheduleRowsForPeriod(period)"
                        :key="period + '-inst-' + row.index"
                      >
                        <td class="px-2 py-1.5">
                          <input
                            :value="row.month"
                            type="number"
                            min="1"
                            max="12"
                            class="w-full max-w-[4.5rem] rounded-sm border border-gray-300 px-2 py-1 text-sm"
                            @input="onLevelPickerScheduleMonthChange(period, row.index, ($event.target as HTMLInputElement).value)"
                          />
                        </td>
                        <td class="px-3 py-1.5 text-end tabular-nums text-gray-900">{{ formatMoney(row.amount) }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="border-t border-gray-200 bg-gray-50">
                      <tr>
                        <td class="px-3 py-2 text-sm font-medium text-gray-700">
                          {{ $t('paymentSettings.packageLevelRowTotal') }}
                        </td>
                        <td class="px-3 py-2 text-end text-sm font-bold tabular-nums text-gray-900">
                          {{ formatMoney(levelPickerScheduleTotal(period)) }}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              </div>
            </template>
          </div>
          <div class="flex flex-col-reverse gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <button
              type="button"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 sm:w-auto"
              @click="closeLevelPicker"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 sm:w-auto"
              :disabled="!levelPickerCanConfirm || levelPickerSaving || saving"
              @click="confirmAddLevelFromPicker"
            >
              {{
                levelPickerSaving
                  ? $t('common.saving')
                  : levelPickerIsEdit
                    ? $t('common.save')
                    : $t('paymentSettings.packageAddLevelConfirm')
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showCoursePicker"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        :aria-label="coursePickerModalTitle"
        @click.self="closeCoursePicker"
      >
        <div
          class="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl sm:max-h-[min(92vh,36rem)] sm:rounded-xl"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 class="text-base font-semibold text-gray-900">{{ coursePickerModalTitle }}</h2>
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              :aria-label="$t('common.close')"
              @click="closeCoursePicker"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
            <p
              v-if="!coursePickerIsEdit && !availableCoursesForPicker.length"
              class="py-4 text-center text-sm text-gray-500"
            >
              {{ $t('paymentSettings.packageAllCoursesAdded') }}
            </p>
            <template v-else>
              <div v-if="coursePickerIsEdit">
                <p class="text-sm font-medium text-gray-500">{{ $t('paymentSettings.packagePickCourse') }}</p>
                <p class="mt-1 text-base font-semibold text-gray-900">{{ coursePickerSelectedCourse }}</p>
              </div>
              <div v-else>
                <label class="mb-2 block text-sm font-semibold text-gray-900">{{ $t('paymentSettings.packagePickCourse') }}</label>
                <select
                  v-model="coursePickerCourseId"
                  class="block w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">{{ $t('paymentSettings.packagePickCourse') }}</option>
                  <option v-for="c in availableCoursesForPicker" :key="String(c.id)" :value="String(c.id)">
                    {{ c.name }}
                  </option>
                </select>
              </div>

              <div>
                <p class="mb-2 text-sm font-semibold text-gray-900">
                  {{ $t('paymentSettings.packageModalChargeValuesTitle') }}
                </p>
                <div class="md:hidden space-y-2" :dir="isRTL ? 'rtl' : 'ltr'">
                  <label
                    v-for="cid in packageChargeTypeIds"
                    :key="'cmod-m-' + cid"
                    class="flex items-center justify-between gap-3 rounded-sm border border-gray-200 bg-gray-50/50 px-3 py-2.5"
                  >
                    <span class="min-w-0 text-sm font-medium text-gray-800">{{ chargeLabel(cid) }}</span>
                    <input
                      v-model="coursePickerAmounts[cid]"
                      type="text"
                      inputmode="decimal"
                      maxlength="12"
                      :aria-label="chargeLabel(cid)"
                      class="box-border w-full max-w-[8rem] shrink-0 rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-end text-sm tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                    />
                  </label>
                </div>
                <div class="hidden overflow-hidden rounded-sm border border-gray-200 md:block" :dir="isRTL ? 'rtl' : 'ltr'">
                  <table class="w-full border-collapse text-sm">
                    <tbody class="divide-y divide-gray-200">
                      <tr v-for="cid in packageChargeTypeIds" :key="'cmod-d-' + cid">
                        <th
                          scope="row"
                          class="min-w-0 px-3 py-2.5 text-start text-sm font-medium text-gray-800"
                        >
                          {{ chargeLabel(cid) }}
                        </th>
                        <td class="px-3 py-2.5 text-end">
                          <input
                            v-model="coursePickerAmounts[cid]"
                            type="text"
                            inputmode="decimal"
                            maxlength="12"
                            class="box-border ms-auto block w-full max-w-[8rem] rounded-sm border border-gray-300 px-2 py-1.5 text-end text-sm tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="mt-2 flex justify-end text-sm text-gray-600">
                  <span class="font-medium">{{ $t('paymentSettings.packageLevelRowTotal') }}:</span>
                  <span class="ms-2 tabular-nums font-semibold text-gray-900">{{ coursePickerDraftTotal }}</span>
                </div>
              </div>
            </template>
          </div>
          <div class="flex flex-col-reverse gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <button
              type="button"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 sm:w-auto"
              @click="closeCoursePicker"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 sm:w-auto"
              :disabled="!coursePickerCanConfirm"
              @click="confirmAddCourseFromPicker"
            >
              {{ coursePickerIsEdit ? $t('common.save') : $t('paymentSettings.packageAddCourseConfirm') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import paymentConfigService, {
  type PaymentCatalogRow,
  type SchoolPaymentLevelSummary,
  type CoursePaymentSummaryRow,
} from '@/services/payment-config.service'
import feePackageService, {
  type FeePackageLevelBillingPeriod,
  type UpsertFeePackagePayload,
} from '@/services/fee-package.service'

const LEVEL_BILLING_PERIODS: FeePackageLevelBillingPeriod[] = ['monthly', 'semester', 'yearly']

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const packageId = computed(() => (route.params.packageId as string) || '')
const isNew = computed(() => route.name === 'payment-fee-package-new' || packageId.value === 'new')

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

type TabId = 'setup' | 'levels' | 'courses'
const activeTab = ref<TabId>('setup')
const tabs = computed(() => [
  { id: 'setup' as TabId, label: t('paymentSettings.packageTabSetup') },
  { id: 'levels' as TabId, label: t('paymentSettings.packageTabLevels') },
  { id: 'courses' as TabId, label: t('paymentSettings.packageTabCourses') },
])

const pageLoading = ref(true)
const saving = ref(false)
const levelPickerSaving = ref(false)
const coursePickerSaving = ref(false)
const collapsedLevelIds = ref<Set<string>>(new Set())
const collapsedCourseIds = ref<Set<string>>(new Set())
const flashError = ref('')
const flashOk = ref('')

const name = ref('')
const yearPaymentMode = ref<'one_time' | 'installments' | 'both'>('one_time')
type PackageInstRow = {
  sequence: number
  month_number: number | null
  label: string
  amount: string
}
const packageInstallments = ref<PackageInstRow[]>([])
const chargeLines = ref<Array<{ charge_type_id: string }>>([])
const discountLines = ref<Array<{ discount_type_id: string }>>([])
const chargeTypes = ref<PaymentCatalogRow[]>([])
const discountTypes = ref<PaymentCatalogRow[]>([])
const levels = ref<SchoolPaymentLevelSummary[]>([])
const courses = ref<CoursePaymentSummaryRow[]>([])
const levelRows = ref<Array<{ level_id: string }>>([])
const courseRows = ref<Array<{ course_id: string }>>([])
const levelAmountMap = ref<Record<string, string>>({})
const levelDownpaymentMap = ref<Record<string, string>>({})
const levelScheduleMonthsMap = ref<Record<string, string>>({})
const courseAmountMap = ref<Record<string, string>>({})

const selectedLevelIds = computed(() => {
  const s = new Set<string>()
  for (const r of levelRows.value) {
    const id = String(r.level_id ?? '').trim()
    if (id) s.add(id)
  }
  return s
})

const selectedCourseIds = computed(() => {
  const s = new Set<string>()
  for (const r of courseRows.value) {
    const id = String(r.course_id ?? '').trim()
    if (id) s.add(id)
  }
  return s
})

const activeChargeTypes = computed(() => chargeTypes.value.filter((x) => x.is_active))
const activeDiscountTypes = computed(() => discountTypes.value.filter((x) => x.is_active))

const usesInstallmentSchedule = computed(
  () => yearPaymentMode.value === 'installments' || yearPaymentMode.value === 'both',
)

const packageYearlyReferenceTotal = computed(() => {
  let max = 0
  for (const levelId of selectedLevelIds.value) {
    const total = parseFloat(formatLevelRowTotalByPeriod(levelId, 'yearly')) || 0
    if (total > max) max = total
  }
  return max
})

const packageInstallmentsSum = computed(() => {
  if (!usesInstallmentSchedule.value) return 0
  let s = 0
  for (const row of packageInstallments.value) {
    s += parseAmount(row.amount)
  }
  return Math.round(s * 100) / 100
})

const showPackageInstallmentMismatch = computed(
  () =>
    usesInstallmentSchedule.value &&
    packageYearlyReferenceTotal.value > 0 &&
    packageInstallmentsSum.value > 0 &&
    Math.abs(packageInstallmentsSum.value - packageYearlyReferenceTotal.value) > 0.02,
)

function amountToInputString(n: number | string | null | undefined): string {
  if (n == null || n === '') return ''
  const x = Number(n)
  if (!Number.isFinite(x) || x === 0) return ''
  return String(x)
}

function makeDefaultPackageInstallmentRow(): PackageInstRow {
  return {
    sequence: 1,
    month_number: 1,
    label: t('paymentSettings.advanceInstallmentLabel'),
    amount: '',
  }
}

function applyPackageInstallmentsFromApi(
  rows: Array<{
    sequence: number
    month_number?: number | null
    label?: string | null
    amount: number
  }>,
  mode: 'one_time' | 'installments' | 'both',
) {
  if (rows.length) {
    packageInstallments.value = [...rows]
      .sort((a, b) => a.sequence - b.sequence)
      .map((i) => ({
        sequence: i.sequence,
        month_number: i.month_number ?? null,
        label: i.label || '',
        amount: amountToInputString(i.amount),
      }))
    return
  }
  if (mode === 'installments' || mode === 'both') {
    packageInstallments.value = [makeDefaultPackageInstallmentRow()]
  } else {
    packageInstallments.value = []
  }
}

function addPackageInstallmentRow() {
  const next =
    packageInstallments.value.length === 0
      ? 1
      : Math.max(...packageInstallments.value.map((i) => i.sequence)) + 1
  packageInstallments.value.push({
    sequence: next,
    month_number: null,
    label: '',
    amount: '',
  })
}

function buildPackageInstallmentsPayload() {
  if (!usesInstallmentSchedule.value) return []
  return packageInstallments.value
    .filter((i) => i.sequence >= 1 && parseAmount(i.amount) > 0)
    .map((i) => ({
      sequence: Number(i.sequence),
      month_number:
        i.month_number == null || Number.isNaN(Number(i.month_number))
          ? null
          : Number(i.month_number),
      label: i.label?.trim() || null,
      amount: parseAmount(i.amount),
    }))
}

const packageChargeTypeIds = computed(() => {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const line of chargeLines.value) {
    const id = String(line.charge_type_id ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
})

function packageDiscountTypeIds(): string[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const line of discountLines.value) {
    const id = String(line.discount_type_id ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

function addChargeLineRow() {
  chargeLines.value.push({ charge_type_id: '' })
}

function removeChargeLineRow(idx: number) {
  chargeLines.value.splice(idx, 1)
}

function addDiscountLineRow() {
  discountLines.value.push({ discount_type_id: '' })
}

function removeDiscountLineRow(idx: number) {
  discountLines.value.splice(idx, 1)
}

function availableChargeTypesForRow(rowIndex: number) {
  const current = String(chargeLines.value[rowIndex]?.charge_type_id ?? '').trim()
  const taken = new Set<string>()
  for (let i = 0; i < chargeLines.value.length; i++) {
    if (i === rowIndex) continue
    const id = String(chargeLines.value[i]?.charge_type_id ?? '').trim()
    if (id) taken.add(id)
  }
  return activeChargeTypes.value.filter((c) => !taken.has(c.id) || c.id === current)
}

function availableDiscountTypesForRow(rowIndex: number) {
  const current = String(discountLines.value[rowIndex]?.discount_type_id ?? '').trim()
  const taken = new Set<string>()
  for (let i = 0; i < discountLines.value.length; i++) {
    if (i === rowIndex) continue
    const id = String(discountLines.value[i]?.discount_type_id ?? '').trim()
    if (id) taken.add(id)
  }
  return activeDiscountTypes.value.filter((d) => !taken.has(d.id) || d.id === current)
}

function normEntityId(id: unknown): string {
  if (id == null) return ''
  if (typeof id === 'string' || typeof id === 'number') return String(id).trim()
  return ''
}
function levelKey(levelId: string, chargeTypeId: string, period: FeePackageLevelBillingPeriod) {
  return `${normEntityId(levelId)}|${normEntityId(chargeTypeId)}|${period}`
}
function pickerAmountKey(chargeTypeId: string, period: FeePackageLevelBillingPeriod) {
  return `picker|${chargeTypeId}|${period}`
}
function levelDownpaymentKey(levelId: string, period: FeePackageLevelBillingPeriod) {
  return `${normEntityId(levelId)}|__downpayment__|${period}`
}
function levelScheduleKey(levelId: string, period: FeePackageLevelBillingPeriod) {
  return `${normEntityId(levelId)}|__schedule__|${period}`
}
function defaultScheduleMonthsForPeriod(period: FeePackageLevelBillingPeriod): number[] {
  if (period === 'monthly') return [1]
  if (period === 'semester') return buildDefaultScheduleMonths(4)
  return buildDefaultScheduleMonths(10)
}
function formatDisplayAmount(raw: string): string {
  const v = String(raw ?? '').trim()
  if (!v) return '—'
  return v
}
function billingPeriodColumnLabel(period: FeePackageLevelBillingPeriod) {
  if (period === 'monthly') return t('paymentSettings.packageBillingMonthly')
  if (period === 'semester') return t('paymentSettings.packageBillingSemester')
  return t('paymentSettings.packageBillingYearly')
}
function courseKey(courseId: string, chargeTypeId: string) {
  return `${courseId}|${chargeTypeId}`
}

function chargeLabel(id: string) {
  return chargeTypes.value.find((c) => c.id === id)?.label ?? id
}

function levelLabel(lv: SchoolPaymentLevelSummary) {
  const en = lv.name_en?.trim()
  const ar = lv.name_ar?.trim()
  if (en && ar) return `${en} · ${ar}`
  return lv.name || lv.code
}

function parseAmount(raw: string): number {
  const v = String(raw ?? '')
    .trim()
    .replace(/,/g, '.')
  if (!v || v === '.') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function getLevelAmount(levelId: string, chargeTypeId: string, period: FeePackageLevelBillingPeriod) {
  return levelAmountMap.value[levelKey(levelId, chargeTypeId, period)] ?? ''
}
function setLevelAmount(
  levelId: string,
  chargeTypeId: string,
  period: FeePackageLevelBillingPeriod,
  v: string,
) {
  levelAmountMap.value = { ...levelAmountMap.value, [levelKey(levelId, chargeTypeId, period)]: v }
}
function getLevelDownpayment(levelId: string, period: FeePackageLevelBillingPeriod) {
  return levelDownpaymentMap.value[levelDownpaymentKey(levelId, period)] ?? ''
}
function setLevelDownpayment(levelId: string, period: FeePackageLevelBillingPeriod, v: string) {
  levelDownpaymentMap.value = { ...levelDownpaymentMap.value, [levelDownpaymentKey(levelId, period)]: v }
}
function getLevelScheduleMonths(levelId: string, period: FeePackageLevelBillingPeriod): number[] {
  const raw = levelScheduleMonthsMap.value[levelScheduleKey(levelId, period)]
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      return parsed
        .map((n) => Math.round(Number(n)))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 12)
    }
  } catch {
    /* ignore */
  }
  return []
}
function setLevelScheduleMonths(
  levelId: string,
  period: FeePackageLevelBillingPeriod,
  months: number[],
) {
  const cleaned = months
    .map((n) => Math.round(Number(n)))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 12)
  const key = levelScheduleKey(levelId, period)
  if (!cleaned.length) {
    const next = { ...levelScheduleMonthsMap.value }
    delete next[key]
    levelScheduleMonthsMap.value = next
    return
  }
  levelScheduleMonthsMap.value = {
    ...levelScheduleMonthsMap.value,
    [key]: JSON.stringify(cleaned),
  }
}
function getCourseAmount(courseId: string, chargeTypeId: string) {
  return courseAmountMap.value[courseKey(courseId, chargeTypeId)] ?? ''
}
function setCourseAmount(courseId: string, chargeTypeId: string, v: string) {
  courseAmountMap.value = { ...courseAmountMap.value, [courseKey(courseId, chargeTypeId)]: v }
}

const showLevelPicker = ref(false)
const levelPickerEditingId = ref('')
const levelPickerLevelId = ref('')
const levelPickerAmounts = ref<Record<string, string>>({})
const levelPickerDownpayment = ref<Record<FeePackageLevelBillingPeriod, string>>({
  monthly: '',
  semester: '',
  yearly: '',
})
const levelPickerInstallmentMonths = ref<Record<FeePackageLevelBillingPeriod, number>>({
  monthly: 1,
  semester: 4,
  yearly: 10,
})
const levelPickerScheduleMonths = ref<Record<FeePackageLevelBillingPeriod, number[]>>({
  monthly: [1],
  semester: [1, 2, 3, 4],
  yearly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
})
type LevelPickerTabId = 'details' | FeePackageLevelBillingPeriod
const levelPickerTab = ref<LevelPickerTabId>('details')
const levelsSummaryMobilePeriod = ref<FeePackageLevelBillingPeriod>('monthly')
const levelPickerDetailsMobilePeriod = ref<FeePackageLevelBillingPeriod>('monthly')

function billingPeriodSwitcherClass(active: boolean): string {
  return active
    ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/80'
    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
}

function isLevelCardCollapsed(levelId: string): boolean {
  return collapsedLevelIds.value.has(normEntityId(levelId))
}

function toggleLevelCardCollapsed(levelId: string) {
  const id = normEntityId(levelId)
  const next = new Set(collapsedLevelIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsedLevelIds.value = next
}

function isCourseCardCollapsed(courseId: string): boolean {
  return collapsedCourseIds.value.has(normEntityId(courseId))
}

function toggleCourseCardCollapsed(courseId: string) {
  const id = normEntityId(courseId)
  const next = new Set(collapsedCourseIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsedCourseIds.value = next
}

const levelPickerIsEdit = computed(() => Boolean(String(levelPickerEditingId.value ?? '').trim()))

const levelPickerModalTitle = computed(() =>
  levelPickerIsEdit.value
    ? t('paymentSettings.packageEditLevelModalTitle')
    : t('paymentSettings.packagePickLevelModalTitle'),
)

const levelPickerTabs = computed(() => [
  { id: 'details' as LevelPickerTabId, label: t('paymentSettings.packagePickerTabDetails') },
  { id: 'monthly' as LevelPickerTabId, label: t('paymentSettings.packageBillingMonthly') },
  { id: 'semester' as LevelPickerTabId, label: t('paymentSettings.packageBillingSemester') },
  { id: 'yearly' as LevelPickerTabId, label: t('paymentSettings.packageBillingYearly') },
])

const availableLevelsForPicker = computed(() => {
  const taken = new Set(
    levelRows.value.map((r) => String(r.level_id ?? '').trim()).filter(Boolean),
  )
  return levels.value.filter((lv) => !taken.has(String(lv.id)))
})

const levelPickerSelectedLevel = computed(() => {
  const id = normEntityId(levelPickerLevelId.value)
  if (!id) return ''
  const lv = levels.value.find((l) => normEntityId(l.id) === id)
  if (!lv) return id
  const label = levelLabel(lv)
  return lv.code ? `${label} (${lv.code})` : label
})

const levelPickerCanConfirm = computed(() => {
  const id = normEntityId(
    levelPickerIsEdit.value ? levelPickerEditingId.value : levelPickerLevelId.value,
  )
  if (!id) return false
  if (levelPickerIsEdit.value) return true
  return availableLevelsForPicker.value.some((lv) => normEntityId(lv.id) === id)
})

function roundMoney(n: number): number {
  return Math.round(n * 1000) / 1000
}

function formatMoney(n: number): string {
  return roundMoney(n).toFixed(2)
}

function roundInstallmentUp(per: number): number {
  if (per >= 50) return Math.ceil(per / 10) * 10
  return Math.ceil(per * 100) / 100
}

function clampCalendarMonth(n: number): number {
  if (!Number.isFinite(n)) return 1
  const r = Math.round(n)
  if (r < 1) return 1
  if (r > 12) return 12
  return r
}

function nextCalendarMonth(m: number): number {
  return m >= 12 ? 1 : m + 1
}

function buildDefaultScheduleMonths(count: number, startMonth = 1): number[] {
  const months: number[] = []
  let m = clampCalendarMonth(startMonth)
  for (let i = 0; i < count; i++) {
    months.push(m)
    m = nextCalendarMonth(m)
  }
  return months
}

function splitInstallmentAmounts(total: number, downpayment: number, count: number): number[] {
  const remaining = roundMoney(Math.max(0, total - downpayment))
  if (count <= 0) return []
  if (count === 1) return [remaining]
  const per = remaining / count
  const roundedUp = roundInstallmentUp(per)
  const amounts: number[] = []
  let paid = 0
  for (let i = 0; i < count - 1; i++) {
    amounts.push(roundedUp)
    paid = roundMoney(paid + roundedUp)
  }
  amounts.push(roundMoney(remaining - paid))
  return amounts
}

function resetLevelPickerInstallmentState() {
  levelPickerDownpayment.value = { monthly: '', semester: '', yearly: '' }
  levelPickerInstallmentMonths.value = { monthly: 1, semester: 4, yearly: 10 }
  levelPickerScheduleMonths.value = {
    monthly: [1],
    semester: buildDefaultScheduleMonths(4),
    yearly: buildDefaultScheduleMonths(10),
  }
  levelPickerTab.value = 'details'
}

function initLevelPickerAmountsShell() {
  const m: Record<string, string> = {}
  for (const cid of packageChargeTypeIds.value) {
    for (const period of LEVEL_BILLING_PERIODS) {
      m[pickerAmountKey(cid, period)] = ''
    }
  }
  levelPickerAmounts.value = m
}

function getLevelPickerAmount(chargeTypeId: string, period: FeePackageLevelBillingPeriod) {
  return levelPickerAmounts.value[pickerAmountKey(chargeTypeId, period)] ?? ''
}

function setLevelPickerAmount(chargeTypeId: string, period: FeePackageLevelBillingPeriod, v: string) {
  const key = pickerAmountKey(chargeTypeId, period)
  levelPickerAmounts.value = { ...levelPickerAmounts.value, [key]: v }
  ensureLevelPickerScheduleForPeriod(period)
}

function setLevelPickerTab(tabId: LevelPickerTabId) {
  levelPickerTab.value = tabId
  if (tabId !== 'details') {
    ensureLevelPickerScheduleForPeriod(tabId)
  }
}

function levelPickerInstallmentCount(period: FeePackageLevelBillingPeriod): number {
  if (period === 'monthly') return 1
  const n = Number(levelPickerInstallmentMonths.value[period])
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(36, Math.round(n))
}

function ensureLevelPickerScheduleForPeriod(period: FeePackageLevelBillingPeriod) {
  const count = levelPickerInstallmentCount(period)
  const existing = levelPickerScheduleMonths.value[period] ?? []
  if (existing.length === count) return
  const start = existing[0] ?? 1
  levelPickerScheduleMonths.value = {
    ...levelPickerScheduleMonths.value,
    [period]: buildDefaultScheduleMonths(count, start),
  }
}

function setLevelPickerDownpayment(period: FeePackageLevelBillingPeriod, v: string) {
  levelPickerDownpayment.value = { ...levelPickerDownpayment.value, [period]: v }
  ensureLevelPickerScheduleForPeriod(period)
}

function resetLevelPickerDraft() {
  levelPickerLevelId.value = ''
  levelPickerEditingId.value = ''
  initLevelPickerAmountsShell()
  resetLevelPickerInstallmentState()
}

function loadLevelPickerFromMaps(levelId: string) {
  const id = normEntityId(levelId)
  const amounts: Record<string, string> = {}
  for (const cid of packageChargeTypeIds.value) {
    for (const period of LEVEL_BILLING_PERIODS) {
      amounts[pickerAmountKey(cid, period)] = getLevelAmount(id, cid, period)
    }
  }
  levelPickerAmounts.value = amounts
  levelPickerDownpayment.value = {
    monthly: getLevelDownpayment(id, 'monthly'),
    semester: getLevelDownpayment(id, 'semester'),
    yearly: getLevelDownpayment(id, 'yearly'),
  }
  const scheduleMonths = {} as Record<FeePackageLevelBillingPeriod, number[]>
  const installmentMonths = {} as Record<FeePackageLevelBillingPeriod, number>
  for (const period of LEVEL_BILLING_PERIODS) {
    const saved = getLevelScheduleMonths(id, period)
    const months = saved.length ? saved : defaultScheduleMonthsForPeriod(period)
    scheduleMonths[period] = months
    installmentMonths[period] = months.length
  }
  levelPickerScheduleMonths.value = scheduleMonths
  levelPickerInstallmentMonths.value = installmentMonths
}

function openLevelPicker(editLevelId?: string | number) {
  const editId = normEntityId(editLevelId)
  initLevelPickerAmountsShell()
  if (editId) {
    levelPickerEditingId.value = editId
    levelPickerLevelId.value = editId
    loadLevelPickerFromMaps(editId)
  } else {
    levelPickerEditingId.value = ''
    levelPickerLevelId.value = ''
    resetLevelPickerInstallmentState()
  }
  for (const period of LEVEL_BILLING_PERIODS) {
    ensureLevelPickerScheduleForPeriod(period)
  }
  levelPickerTab.value = 'details'
  levelPickerDetailsMobilePeriod.value = 'monthly'
  showLevelPicker.value = true
}

function closeLevelPicker() {
  showLevelPicker.value = false
  resetLevelPickerDraft()
}

const levelPickerDraftTotalsByPeriod = computed(() => {
  const totals = {} as Record<FeePackageLevelBillingPeriod, string>
  for (const period of LEVEL_BILLING_PERIODS) {
    let s = 0
    for (const cid of packageChargeTypeIds.value) {
      s += parseAmount(levelPickerAmounts.value[pickerAmountKey(cid, period)] ?? '')
    }
    totals[period] = s.toFixed(2)
  }
  return totals
})

function levelPickerPeriodTotal(period: FeePackageLevelBillingPeriod): number {
  return parseFloat(levelPickerDraftTotalsByPeriod.value[period]) || 0
}

function levelPickerComputedAmounts(period: FeePackageLevelBillingPeriod): number[] {
  const count = levelPickerInstallmentCount(period)
  return splitInstallmentAmounts(
    levelPickerPeriodTotal(period),
    parseAmount(levelPickerDownpayment.value[period]),
    count,
  )
}

function levelPickerScheduleRowsForPeriod(period: FeePackageLevelBillingPeriod) {
  ensureLevelPickerScheduleForPeriod(period)
  const months = levelPickerScheduleMonths.value[period] ?? []
  const amounts = levelPickerComputedAmounts(period)
  return months.map((month, index) => ({ month, amount: amounts[index] ?? 0, index }))
}

function levelPickerScheduleTotal(period: FeePackageLevelBillingPeriod): number {
  const dp = parseAmount(levelPickerDownpayment.value[period])
  const installments = levelPickerComputedAmounts(period).reduce((s, a) => roundMoney(s + a), 0)
  return roundMoney(dp + installments)
}

function onLevelPickerInstallmentMonthsInput(period: FeePackageLevelBillingPeriod, raw: string) {
  if (period === 'monthly') return
  const n = Math.max(1, Math.min(36, Math.round(Number(raw) || 1)))
  levelPickerInstallmentMonths.value = { ...levelPickerInstallmentMonths.value, [period]: n }
  const start = levelPickerScheduleMonths.value[period]?.[0] ?? 1
  levelPickerScheduleMonths.value = {
    ...levelPickerScheduleMonths.value,
    [period]: buildDefaultScheduleMonths(n, start),
  }
  ensureLevelPickerScheduleForPeriod(period)
}

function onLevelPickerScheduleMonthChange(
  period: FeePackageLevelBillingPeriod,
  index: number,
  raw: string,
) {
  const months = [...(levelPickerScheduleMonths.value[period] ?? [])]
  if (!months.length) return
  months[index] = clampCalendarMonth(Number(raw))
  for (let j = index + 1; j < months.length; j++) {
    months[j] = nextCalendarMonth(months[j - 1])
  }
  levelPickerScheduleMonths.value = { ...levelPickerScheduleMonths.value, [period]: months }
}

function confirmAddLevelFromPicker() {
  const id = normEntityId(
    levelPickerIsEdit.value ? levelPickerEditingId.value : levelPickerLevelId.value,
  )
  if (!id) return
  if (!levelPickerIsEdit.value) {
    if (levelRows.value.some((r) => String(r.level_id ?? '').trim() === id)) {
      closeLevelPicker()
      return
    }
    levelRows.value.push({ level_id: id })
  }
  for (const cid of packageChargeTypeIds.value) {
    for (const period of LEVEL_BILLING_PERIODS) {
      const raw = levelPickerAmounts.value[pickerAmountKey(cid, period)]
      if (raw != null && String(raw).trim() !== '') {
        setLevelAmount(id, cid, period, String(raw))
      } else {
        const next = { ...levelAmountMap.value }
        delete next[levelKey(id, cid, period)]
        levelAmountMap.value = next
      }
    }
  }
  for (const period of LEVEL_BILLING_PERIODS) {
    const raw = levelPickerDownpayment.value[period]
    if (raw != null && String(raw).trim() !== '') {
      setLevelDownpayment(id, period, String(raw))
    } else {
      const next = { ...levelDownpaymentMap.value }
      delete next[levelDownpaymentKey(id, period)]
      levelDownpaymentMap.value = next
    }
    const months = levelPickerScheduleMonths.value[period] ?? []
    setLevelScheduleMonths(id, period, months)
  }
  closeLevelPicker()
}

function formatLevelRowTotalByPeriod(levelId: string, period: FeePackageLevelBillingPeriod): string {
  let s = 0
  for (const cid of packageChargeTypeIds.value) {
    s += parseAmount(getLevelAmount(levelId, cid, period))
  }
  return s.toFixed(2)
}

const showCoursePicker = ref(false)
const coursePickerEditingId = ref('')
const coursePickerCourseId = ref('')
const coursePickerAmounts = ref<Record<string, string>>({})

const coursePickerIsEdit = computed(() => Boolean(String(coursePickerEditingId.value ?? '').trim()))

const coursePickerModalTitle = computed(() =>
  coursePickerIsEdit.value
    ? t('paymentSettings.packageEditCourseModalTitle')
    : t('paymentSettings.packagePickCourseModalTitle'),
)

const coursePickerSelectedCourse = computed(() => {
  const id = String(coursePickerCourseId.value ?? '').trim()
  return id ? courseTitle(id) : ''
})

const availableCoursesForPicker = computed(() => {
  const taken = new Set(
    courseRows.value.map((r) => String(r.course_id ?? '').trim()).filter(Boolean),
  )
  const editing = String(coursePickerEditingId.value ?? '').trim()
  return courses.value.filter((c) => {
    const id = String(c.id)
    if (editing && id === editing) return true
    return !taken.has(id)
  })
})

const coursePickerCanConfirm = computed(() => {
  const id = String(coursePickerCourseId.value ?? '').trim()
  if (!id) return false
  if (coursePickerIsEdit.value) return true
  return availableCoursesForPicker.value.some((c) => String(c.id) === id)
})

function initCoursePickerAmountsShell() {
  const m: Record<string, string> = {}
  for (const cid of packageChargeTypeIds.value) {
    m[cid] = coursePickerAmounts.value[cid] ?? ''
  }
  coursePickerAmounts.value = m
}

function resetCoursePickerDraft() {
  coursePickerEditingId.value = ''
  coursePickerCourseId.value = ''
  const m: Record<string, string> = {}
  for (const cid of packageChargeTypeIds.value) {
    m[cid] = ''
  }
  coursePickerAmounts.value = m
}

function loadCoursePickerFromMaps(courseId: string) {
  const m: Record<string, string> = {}
  for (const cid of packageChargeTypeIds.value) {
    m[cid] = getCourseAmount(courseId, cid)
  }
  coursePickerAmounts.value = m
}

function openCoursePicker(editCourseId?: string | number) {
  const editId = normEntityId(editCourseId)
  initCoursePickerAmountsShell()
  if (editId) {
    coursePickerEditingId.value = editId
    coursePickerCourseId.value = editId
    loadCoursePickerFromMaps(editId)
  } else {
    resetCoursePickerDraft()
  }
  showCoursePicker.value = true
}

function closeCoursePicker() {
  showCoursePicker.value = false
  resetCoursePickerDraft()
}

const coursePickerDraftTotal = computed(() => {
  let s = 0
  for (const cid of packageChargeTypeIds.value) {
    s += parseAmount(coursePickerAmounts.value[cid] ?? '')
  }
  return s.toFixed(2)
})

function formatCourseRowTotal(courseId: string): string {
  let s = 0
  for (const cid of packageChargeTypeIds.value) {
    s += parseAmount(getCourseAmount(courseId, cid))
  }
  return s.toFixed(2)
}

function applyCoursePickerToMaps() {
  const id = String(coursePickerCourseId.value ?? '').trim()
  if (!id) return false

  if (!coursePickerIsEdit.value) {
    if (courseRows.value.some((r) => String(r.course_id ?? '').trim() === id)) {
      return false
    }
    courseRows.value.push({ course_id: id })
  }

  for (const cid of packageChargeTypeIds.value) {
    const raw = coursePickerAmounts.value[cid]
    if (raw != null && String(raw).trim() !== '') {
      setCourseAmount(id, cid, String(raw))
    } else if (coursePickerIsEdit.value) {
      setCourseAmount(id, cid, '')
    }
  }
  return true
}

async function confirmAddCourseFromPicker() {
  if (!coursePickerCanConfirm.value || coursePickerSaving.value || saving.value) return
  if (!applyCoursePickerToMaps()) {
    closeCoursePicker()
    return
  }
  coursePickerSaving.value = true
  flashError.value = ''
  try {
    await persistPackageToServer()
    closeCoursePicker()
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.saveError')
  } finally {
    coursePickerSaving.value = false
  }
}

function courseById(courseId: string): CoursePaymentSummaryRow | undefined {
  const want = String(courseId ?? '').trim()
  return courses.value.find((c) => String(c.id) === want)
}

function courseTitle(courseId: string) {
  const c = courseById(courseId)
  return c?.name?.trim() || c?.title?.trim() || courseId
}

function levelById(levelId: string): SchoolPaymentLevelSummary | undefined {
  const want = String(levelId ?? '').trim()
  return levels.value.find((l) => String(l.id) === want)
}

function levelTitle(levelId: string) {
  const lv = levelById(levelId)
  return lv ? levelLabel(lv) : levelId
}

function removeLevelRow(idx: number) {
  const id = String(levelRows.value[idx]?.level_id ?? '').trim()
  levelRows.value.splice(idx, 1)
  if (!id) return
  const normId = normEntityId(id)
  const nextCollapsed = new Set(collapsedLevelIds.value)
  nextCollapsed.delete(normId)
  collapsedLevelIds.value = nextCollapsed
  const prefix = `${normId}|`
  const nextAmounts = { ...levelAmountMap.value }
  const nextDownpayments = { ...levelDownpaymentMap.value }
  const nextSchedules = { ...levelScheduleMonthsMap.value }
  for (const k of Object.keys(nextAmounts)) {
    if (k.startsWith(prefix)) delete nextAmounts[k]
  }
  for (const k of Object.keys(nextDownpayments)) {
    if (k.startsWith(prefix)) delete nextDownpayments[k]
  }
  for (const k of Object.keys(nextSchedules)) {
    if (k.startsWith(prefix)) delete nextSchedules[k]
  }
  levelAmountMap.value = nextAmounts
  levelDownpaymentMap.value = nextDownpayments
  levelScheduleMonthsMap.value = nextSchedules
}

function removeCourseRow(idx: number) {
  const id = String(courseRows.value[idx]?.course_id ?? '').trim()
  courseRows.value.splice(idx, 1)
  if (!id) return
  const normId = normEntityId(id)
  const nextCollapsed = new Set(collapsedCourseIds.value)
  nextCollapsed.delete(normId)
  collapsedCourseIds.value = nextCollapsed
  const next = { ...courseAmountMap.value }
  for (const k of Object.keys(next)) {
    if (k.startsWith(`${id}|`)) delete next[k]
  }
  courseAmountMap.value = next
}

function buildPayload(): UpsertFeePackagePayload {
  const level_amounts: UpsertFeePackagePayload['level_amounts'] = []
  for (const levelId of selectedLevelIds.value) {
    for (const chargeTypeId of packageChargeTypeIds.value) {
      for (const billing_period of LEVEL_BILLING_PERIODS) {
        const amount = parseAmount(getLevelAmount(levelId, chargeTypeId, billing_period))
        if (amount > 0) {
          level_amounts.push({ level_id: levelId, charge_type_id: chargeTypeId, billing_period, amount })
        }
      }
    }
  }
  const course_amounts: UpsertFeePackagePayload['course_amounts'] = []
  for (const courseId of selectedCourseIds.value) {
    for (const chargeTypeId of packageChargeTypeIds.value) {
      const amount = parseAmount(getCourseAmount(courseId, chargeTypeId))
      if (amount > 0) course_amounts.push({ course_id: courseId, charge_type_id: chargeTypeId, amount })
    }
  }
  const level_period_settings: NonNullable<UpsertFeePackagePayload['level_period_settings']> = []
  for (const levelId of selectedLevelIds.value) {
    for (const billing_period of LEVEL_BILLING_PERIODS) {
      const downpayment_amount = parseAmount(getLevelDownpayment(levelId, billing_period))
      const installment_schedule_months = getLevelScheduleMonths(levelId, billing_period)
      if (downpayment_amount > 0 || installment_schedule_months.length > 0) {
        level_period_settings.push({
          level_id: levelId,
          billing_period,
          downpayment_amount,
          installment_schedule_months: installment_schedule_months.length
            ? installment_schedule_months
            : undefined,
        })
      }
    }
  }
  return {
    school_id: schoolId.value,
    name: name.value.trim(),
    currency: 'OMR',
    year_payment_mode: selectedLevelIds.value.size ? yearPaymentMode.value : null,
    course_pricing_basis: selectedCourseIds.value.size ? 'grade' : null,
    charge_type_ids: [...packageChargeTypeIds.value],
    discount_type_ids: packageDiscountTypeIds(),
    installments: buildPackageInstallmentsPayload(),
    level_amounts,
    level_period_settings,
    course_amounts,
  }
}

async function loadCatalogsAndLists() {
  const sid = schoolId.value
  const [ch, disc, lv, co] = await Promise.all([
    paymentConfigService.listChargeTypes(sid),
    paymentConfigService.listDiscountTypes(sid),
    paymentConfigService.listLevelsSummary(sid),
    paymentConfigService.listCoursesPaymentSummary(sid),
  ])
  chargeTypes.value = ch
  discountTypes.value = disc
  levels.value = lv
  courses.value = co
}

async function loadPackage() {
  if (isNew.value) return
  const data = await feePackageService.getOne(packageId.value)
  name.value = data.name
  const ym = (data.year_payment_mode as 'one_time' | 'installments' | 'both') || 'one_time'
  yearPaymentMode.value = ym
  applyPackageInstallmentsFromApi(data.installments ?? [], ym)
  chargeLines.value = data.charge_type_ids.map((id) => ({ charge_type_id: String(id) }))
  discountLines.value = data.discount_type_ids.map((id) => ({ discount_type_id: String(id) }))
  const levelIdsOrdered = [...new Set(data.level_amounts.map((a) => a.level_id))]
  levelRows.value = levelIdsOrdered.map((id) => ({ level_id: String(id) }))

  const courseIdsOrdered = [...new Set(data.course_amounts.map((a) => a.course_id))]
  courseRows.value = courseIdsOrdered.map((id) => ({ course_id: String(id) }))

  const lMap: Record<string, string> = {}
  const dpMap: Record<string, string> = {}
  const schedMap: Record<string, string> = {}
  const cMap: Record<string, string> = {}
  for (const a of data.level_amounts) {
    const period = (a.billing_period ?? 'yearly') as FeePackageLevelBillingPeriod
    lMap[levelKey(a.level_id, a.charge_type_id, period)] = String(a.amount)
  }
  for (const s of data.level_period_settings ?? []) {
    const period = (s.billing_period ?? 'yearly') as FeePackageLevelBillingPeriod
    if (Number(s.downpayment_amount) > 0) {
      dpMap[levelDownpaymentKey(s.level_id, period)] = String(s.downpayment_amount)
    }
    const months = s.installment_schedule_months
    if (Array.isArray(months) && months.length) {
      schedMap[levelScheduleKey(s.level_id, period)] = JSON.stringify(months)
    }
  }
  for (const a of data.course_amounts) {
    cMap[courseKey(a.course_id, a.charge_type_id)] = String(a.amount)
  }
  levelAmountMap.value = lMap
  levelDownpaymentMap.value = dpMap
  levelScheduleMonthsMap.value = schedMap
  courseAmountMap.value = cMap
}

async function boot() {
  pageLoading.value = true
  flashError.value = ''
  try {
    await loadCatalogsAndLists()
    if (!isNew.value) await loadPackage()
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.loadError')
  } finally {
    pageLoading.value = false
  }
}

function validatePackageForSave(): string | null {
  if (!name.value.trim()) return t('paymentSettings.packageNameRequired')
  if (!packageChargeTypeIds.value.length) return t('paymentSettings.packageChargeTypesRequired')
  return null
}

async function persistPackageToServer() {
  const validationError = validatePackageForSave()
  if (validationError) {
    activeTab.value = 'setup'
    throw new Error(validationError)
  }
  const body = buildPayload()
  if (isNew.value) {
    const created = await feePackageService.create(body)
    flashOk.value = t('paymentSettings.packageSaved')
    await router.replace(`/settings/payments/packages/${created.id}`)
    return
  }
  await feePackageService.update(packageId.value, body)
  flashOk.value = t('paymentSettings.packageSaved')
  await loadPackage()
}

async function save() {
  saving.value = true
  flashError.value = ''
  flashOk.value = ''
  try {
    await persistPackageToServer()
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.saveError')
  } finally {
    saving.value = false
  }
}

async function removePackage() {
  if (isNew.value || !packageId.value) return
  if (!window.confirm(t('paymentSettings.confirmDeleteFeePackage'))) return
  saving.value = true
  try {
    await feePackageService.remove(packageId.value)
    await router.push('/settings/payments/packages')
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.saveError')
  } finally {
    saving.value = false
  }
}

watch(yearPaymentMode, (mode) => {
  if (mode === 'installments' || mode === 'both') {
    if (!packageInstallments.value.length) {
      packageInstallments.value = [makeDefaultPackageInstallmentRow()]
    }
  }
})

watch(
  () => route.params.packageId,
  () => {
    boot()
  },
)

onMounted(boot)
</script>
