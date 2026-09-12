<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="isEdit ? $t('feesV2.editPackage') : $t('feesV2.newPackage')"
        :subtitle="$t('feesV2.packageSubtitle')"
      >
        <template #leading>
          <router-link
            to="/settings/payments/packages"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('feesV2.backToPackages')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <form class="space-y-6" @submit.prevent="save">
        <div class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.02]">
          <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.basicInfo') }}</h2>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('feesV2.packageName') }}</label>
              <input v-model="form.name" required type="text" class="fk-field" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('feesV2.currency') }}</label>
              <input v-model="form.currency" type="text" maxlength="3" dir="ltr" class="fk-field fk-field--mono" />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div class="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.chargeStructure') }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">{{ $t('feesV2.chargeStructureHint') }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="addLine"
              class="fk-btn fk-btn--primary fk-btn--sm"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('feesV2.addCharge') }}
            </button>
          </div>

          <div v-if="!form.charge_lines.length" class="px-6 py-14 text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="mt-4 text-sm text-gray-500">{{ $t('feesV2.noChargesYet') }}</p>
            <button
              type="button"
              @click="addLine"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-100"
            >
              + {{ $t('feesV2.addCharge') }}
            </button>
          </div>

          <!-- Mobile: stacked cards -->
          <div v-else class="md:hidden divide-y divide-gray-100">
            <div
              v-for="(line, idx) in form.charge_lines"
              :key="'m-' + idx"
              class="p-4 space-y-4 bg-white even:bg-gray-50/40"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-primary-100 px-2 text-xs font-bold text-primary-800 tabular-nums">
                  {{ idx + 1 }}
                </span>
                <button
                  type="button"
                  @click="removeLine(idx)"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                  :aria-label="$t('common.delete')"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">{{ $t('feesV2.chargeType') }}</label>
                <select
                  v-model="line.charge_type_id"
                  required
                  class="fk-field"
                >
                  <option value="">{{ $t('feesV2.selectCharge') }}</option>
                  <option v-for="ct in chargeTypes" :key="ct.id" :value="ct.id">{{ ct.label }}</option>
                </select>
              </div>
              <div>
                <span class="block text-xs font-medium text-gray-600 mb-1.5">{{ $t('feesV2.whenPaid') }}</span>
                <div class="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <label
                    class="flex-1 cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition-colors"
                    :class="line.payment_timing === 'upfront' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                  >
                    <input v-model="line.payment_timing" type="radio" value="upfront" class="sr-only" />
                    {{ $t('feesV2.upfront') }}
                  </label>
                  <label
                    class="flex-1 cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition-colors"
                    :class="line.payment_timing === 'installment' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                  >
                    <input v-model="line.payment_timing" type="radio" value="installment" class="sr-only" />
                    {{ $t('feesV2.installment') }}
                  </label>
                </div>
              </div>
              <div>
                <span class="block text-xs font-medium text-gray-600 mb-1.5">{{ $t('feesV2.frequency') }}</span>
                <div class="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <label
                    class="flex-1 cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition-colors"
                    :class="line.billing_frequency === 'per_year' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                  >
                    <input v-model="line.billing_frequency" type="radio" value="per_year" class="sr-only" />
                    {{ $t('feesV2.perYear') }}
                  </label>
                  <label
                    class="flex-1 cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition-colors"
                    :class="line.billing_frequency === 'once_only' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                  >
                    <input v-model="line.billing_frequency" type="radio" value="once_only" class="sr-only" />
                    {{ $t('feesV2.onceOnly') }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop: table -->
          <div v-if="form.charge_lines.length" class="hidden md:block overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th class="w-12 px-4 py-3 text-center">#</th>
                  <th class="min-w-[220px] px-4 py-3 text-start">{{ $t('feesV2.chargeType') }}</th>
                  <th class="min-w-[200px] px-4 py-3 text-start">{{ $t('feesV2.whenPaid') }}</th>
                  <th class="min-w-[200px] px-4 py-3 text-start">{{ $t('feesV2.frequency') }}</th>
                  <th class="w-16 px-3 py-3 text-center"><span class="sr-only">{{ $t('common.delete') }}</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(line, idx) in form.charge_lines"
                  :key="'d-' + idx"
                  class="group transition-colors hover:bg-primary-50/30"
                >
                  <td class="align-middle px-4 py-4 text-center">
                    <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 tabular-nums group-hover:bg-primary-100 group-hover:text-primary-800">
                      {{ idx + 1 }}
                    </span>
                  </td>
                  <td class="align-middle px-4 py-4">
                    <select
                      v-model="line.charge_type_id"
                      required
                      class="fk-field min-w-[12rem]"
                    >
                      <option value="">{{ $t('feesV2.selectCharge') }}</option>
                      <option v-for="ct in chargeTypes" :key="ct.id" :value="ct.id">{{ ct.label }}</option>
                    </select>
                  </td>
                  <td class="align-middle px-4 py-4">
                    <div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                      <label
                        class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                        :class="line.payment_timing === 'upfront' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                      >
                        <input v-model="line.payment_timing" type="radio" value="upfront" class="sr-only" />
                        {{ $t('feesV2.upfront') }}
                      </label>
                      <label
                        class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                        :class="line.payment_timing === 'installment' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                      >
                        <input v-model="line.payment_timing" type="radio" value="installment" class="sr-only" />
                        {{ $t('feesV2.installment') }}
                      </label>
                    </div>
                  </td>
                  <td class="align-middle px-4 py-4">
                    <div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                      <label
                        class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                        :class="line.billing_frequency === 'per_year' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                      >
                        <input v-model="line.billing_frequency" type="radio" value="per_year" class="sr-only" />
                        {{ $t('feesV2.perYear') }}
                      </label>
                      <label
                        class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                        :class="line.billing_frequency === 'once_only' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                      >
                        <input v-model="line.billing_frequency" type="radio" value="once_only" class="sr-only" />
                        {{ $t('feesV2.onceOnly') }}
                      </label>
                    </div>
                  </td>
                  <td class="align-middle px-3 py-4 text-center">
                    <button
                      type="button"
                      @click="removeLine(idx)"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                      :aria-label="$t('common.delete')"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div class="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-gray-900">{{ $t('paymentSettings.discountsCardTitle') }}</h2>
            <button
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm"
              @click="addDiscountLine"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('paymentSettings.addDiscountLine') }}
            </button>
          </div>
          <div v-if="!activeDiscountTypes.length" class="px-6 py-10 text-center text-sm text-gray-500">
            {{ $t('paymentSettings.noDiscountTypesInCatalog') }}
          </div>
          <div v-else-if="!discountLines.length" class="px-6 py-10 text-center">
            <p class="text-sm text-gray-500">{{ $t('paymentSettings.noDiscountTypesAdded') }}</p>
            <button type="button" class="mt-4 fk-btn fk-btn--pearl fk-btn--sm" @click="addDiscountLine">
              {{ $t('paymentSettings.addDiscountLine') }}
            </button>
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="(line, idx) in discountLines"
              :key="'disc-' + idx"
              class="flex flex-wrap items-end gap-3 px-6 py-4"
            >
              <div class="min-w-0 flex-1">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="'pkg-disc-' + idx">
                  {{ $t('paymentSettings.pickDiscountType') }}
                </label>
                <select :id="'pkg-disc-' + idx" v-model="line.discount_type_id" class="fk-field">
                  <option value="">{{ $t('paymentSettings.pickDiscountType') }}</option>
                  <option
                    v-for="d in availableDiscountTypesForRow(idx)"
                    :key="d.id"
                    :value="String(d.id)"
                  >
                    {{ d.label }}
                  </option>
                </select>
              </div>
              <button
                type="button"
                class="fk-iconbtn text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                :aria-label="$t('common.delete')"
                @click="removeDiscountLine(idx)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div class="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-gray-900">{{ $t('paymentSettings.extrasCardTitle') }}</h2>
            <button
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm"
              @click="addExtraLine"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('paymentSettings.addExtraLine') }}
            </button>
          </div>
          <div v-if="!activeExtraTypes.length" class="px-6 py-10 text-center text-sm text-gray-500">
            {{ $t('paymentSettings.noExtraTypesInCatalog') }}
          </div>
          <div v-else-if="!extraLines.length" class="px-6 py-10 text-center">
            <p class="text-sm text-gray-500">{{ $t('paymentSettings.noExtraTypesAdded') }}</p>
            <button type="button" class="mt-4 fk-btn fk-btn--pearl fk-btn--sm" @click="addExtraLine">
              {{ $t('paymentSettings.addExtraLine') }}
            </button>
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="(line, idx) in extraLines"
              :key="'extra-' + idx"
              class="flex flex-wrap items-end gap-3 px-6 py-4"
            >
              <div class="min-w-0 flex-1">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="'pkg-extra-' + idx">
                  {{ $t('paymentSettings.pickExtraType') }}
                </label>
                <select :id="'pkg-extra-' + idx" v-model="line.extra_type_id" class="fk-field">
                  <option value="">{{ $t('paymentSettings.pickExtraType') }}</option>
                  <option
                    v-for="d in availableExtraTypesForRow(idx)"
                    :key="d.id"
                    :value="String(d.id)"
                  >
                    {{ d.label }}
                  </option>
                </select>
              </div>
              <button
                type="button"
                class="fk-iconbtn text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                :aria-label="$t('common.delete')"
                @click="removeExtraLine(idx)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div class="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-gray-900">{{ $t('paymentSettings.inclusionsCardTitle') }}</h2>
            <button
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm"
              @click="addInclusionLine"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('paymentSettings.addInclusionLine') }}
            </button>
          </div>
          <div v-if="!activeInclusionTypes.length" class="px-6 py-10 text-center text-sm text-gray-500">
            {{ $t('paymentSettings.noInclusionTypesInCatalog') }}
          </div>
          <div v-else-if="!inclusionLines.length" class="px-6 py-10 text-center">
            <p class="text-sm text-gray-500">{{ $t('paymentSettings.noInclusionTypesAdded') }}</p>
            <button type="button" class="mt-4 fk-btn fk-btn--pearl fk-btn--sm" @click="addInclusionLine">
              {{ $t('paymentSettings.addInclusionLine') }}
            </button>
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="(line, idx) in inclusionLines"
              :key="'incl-' + idx"
              class="flex flex-wrap items-end gap-3 px-6 py-4"
            >
              <div class="min-w-0 flex-1">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="'pkg-incl-' + idx">
                  {{ $t('paymentSettings.pickInclusionType') }}
                </label>
                <select :id="'pkg-incl-' + idx" v-model="line.inclusion_type_id" class="fk-field">
                  <option value="">{{ $t('paymentSettings.pickInclusionType') }}</option>
                  <option
                    v-for="d in availableInclusionTypesForRow(idx)"
                    :key="d.id"
                    :value="String(d.id)"
                  >
                    {{ d.label }}
                  </option>
                </select>
              </div>
              <button
                type="button"
                class="fk-iconbtn text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                :aria-label="$t('common.delete')"
                @click="removeInclusionLine(idx)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <router-link to="/settings/payments/packages" class="fk-btn fk-btn--pearl">
            {{ $t('common.cancel') }}
          </router-link>
          <button type="submit" :disabled="saving" class="fk-btn fk-btn--primary">
            {{ saving ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </form>
    </div>

    <SuccessFlashDialog
      :open="successOpen"
      :title="successTitle"
      :message="successMessage"
      :duration-ms="successDurationMs"
      @finished="onSuccessFinished"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import SuccessFlashDialog from '@/components/SuccessFlashDialog.vue'
import { useSuccessFlash } from '@/composables/useSuccessFlash'
import { feesV2Service, type PaymentTiming, type BillingFrequency } from '@/services/fees-v2.service'
import { paymentConfigService, type PaymentCatalogRow } from '@/services/payment-config.service'
import { authService } from '@/services'

const route = useRoute()
const { locale } = useI18n()

const {
  open: successOpen,
  title: successTitle,
  message: successMessage,
  durationMs: successDurationMs,
  show: showSuccessFlash,
  onFinished: onSuccessFinished,
} = useSuccessFlash()

const isRTL = computed(() => locale.value === 'ar')
const packageId = computed(() => route.params.packageId as string | undefined)
const isEdit = computed(() => !!packageId.value && packageId.value !== 'new')

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id ?? 1
})

const saving = ref(false)
const chargeTypes = ref<PaymentCatalogRow[]>([])
const discountTypes = ref<PaymentCatalogRow[]>([])
const extraTypes = ref<PaymentCatalogRow[]>([])
const inclusionTypes = ref<PaymentCatalogRow[]>([])
const form = ref({
  name: '',
  currency: 'OMR',
  charge_lines: [] as Array<{
    charge_type_id: string
    payment_timing: PaymentTiming
    billing_frequency: BillingFrequency
  }>,
})
const discountLines = ref<Array<{ discount_type_id: string }>>([])
const extraLines = ref<Array<{ extra_type_id: string }>>([])
const inclusionLines = ref<Array<{ inclusion_type_id: string }>>([])

const activeDiscountTypes = computed(() => discountTypes.value.filter((x) => x.is_active))
const activeExtraTypes = computed(() => extraTypes.value.filter((x) => x.is_active))
const activeInclusionTypes = computed(() => inclusionTypes.value.filter((x) => x.is_active))

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

function packageExtraTypeIds(): string[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const line of extraLines.value) {
    const id = String(line.extra_type_id ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

function packageInclusionTypeIds(): string[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const line of inclusionLines.value) {
    const id = String(line.inclusion_type_id ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

function addDiscountLine() {
  discountLines.value.push({ discount_type_id: '' })
}

function removeDiscountLine(idx: number) {
  discountLines.value.splice(idx, 1)
}

function addExtraLine() {
  extraLines.value.push({ extra_type_id: '' })
}

function removeExtraLine(idx: number) {
  extraLines.value.splice(idx, 1)
}

function addInclusionLine() {
  inclusionLines.value.push({ inclusion_type_id: '' })
}

function removeInclusionLine(idx: number) {
  inclusionLines.value.splice(idx, 1)
}

function availableDiscountTypesForRow(rowIndex: number) {
  const current = String(discountLines.value[rowIndex]?.discount_type_id ?? '').trim()
  const used = new Set<string>()
  for (let i = 0; i < discountLines.value.length; i++) {
    if (i === rowIndex) continue
    const id = String(discountLines.value[i]?.discount_type_id ?? '').trim()
    if (id) used.add(id)
  }
  return activeDiscountTypes.value.filter((d) => String(d.id) === current || !used.has(String(d.id)))
}

function availableExtraTypesForRow(rowIndex: number) {
  const current = String(extraLines.value[rowIndex]?.extra_type_id ?? '').trim()
  const used = new Set<string>()
  for (let i = 0; i < extraLines.value.length; i++) {
    if (i === rowIndex) continue
    const id = String(extraLines.value[i]?.extra_type_id ?? '').trim()
    if (id) used.add(id)
  }
  return activeExtraTypes.value.filter((d) => String(d.id) === current || !used.has(String(d.id)))
}

function availableInclusionTypesForRow(rowIndex: number) {
  const current = String(inclusionLines.value[rowIndex]?.inclusion_type_id ?? '').trim()
  const used = new Set<string>()
  for (let i = 0; i < inclusionLines.value.length; i++) {
    if (i === rowIndex) continue
    const id = String(inclusionLines.value[i]?.inclusion_type_id ?? '').trim()
    if (id) used.add(id)
  }
  return activeInclusionTypes.value.filter((d) => String(d.id) === current || !used.has(String(d.id)))
}

function addLine() {
  form.value.charge_lines.push({
    charge_type_id: '',
    payment_timing: 'installment',
    billing_frequency: 'per_year',
  })
}

function removeLine(idx: number) {
  form.value.charge_lines.splice(idx, 1)
}

async function load() {
  const [charges, discs, extras, inclusions] = await Promise.all([
    paymentConfigService.listChargeTypes(schoolId.value),
    paymentConfigService.listDiscountTypes(schoolId.value).catch(() => [] as PaymentCatalogRow[]),
    paymentConfigService.listExtraTypes(schoolId.value).catch(() => [] as PaymentCatalogRow[]),
    paymentConfigService.listInclusionTypes(schoolId.value).catch(() => [] as PaymentCatalogRow[]),
  ])
  chargeTypes.value = charges
  discountTypes.value = discs
  extraTypes.value = extras
  inclusionTypes.value = inclusions
  if (isEdit.value && packageId.value) {
    const pkg = await feesV2Service.getPackage(packageId.value)
    form.value.name = pkg.name
    form.value.currency = pkg.currency || 'OMR'
    form.value.charge_lines = (pkg.charge_lines || []).map((l) => ({
      charge_type_id: l.charge_type_id,
      payment_timing: l.payment_timing,
      billing_frequency: l.billing_frequency,
    }))
    discountLines.value = (pkg.discount_type_ids || []).map((id) => ({ discount_type_id: String(id) }))
    extraLines.value = (pkg.extra_type_ids || []).map((id) => ({ extra_type_id: String(id) }))
    inclusionLines.value = (pkg.inclusion_type_ids || []).map((id) => ({ inclusion_type_id: String(id) }))
  }
}

async function save() {
  saving.value = true
  try {
    const payload = {
      school_id: schoolId.value,
      name: form.value.name.trim(),
      currency: form.value.currency,
      charge_lines: form.value.charge_lines,
      discount_type_ids: packageDiscountTypeIds(),
      extra_type_ids: packageExtraTypeIds(),
      inclusion_type_ids: packageInclusionTypeIds(),
    }
    if (isEdit.value && packageId.value) {
      await feesV2Service.savePackage(payload, packageId.value)
    } else {
      await feesV2Service.savePackage(payload)
    }
    showSuccessFlash({ redirectTo: '/settings/payments/packages' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
