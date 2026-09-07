<template>
  <DashboardLayout>
    <div class="fk-page min-w-0 overflow-x-hidden" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('feesV2.studentChargesTitle')"
        :subtitle="$t('feesV2.studentChargesSubtitle')"
      />

      <div v-if="!selectedId" class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('studentPayments.studentsList') }}</h2>
            <p v-if="!loadingList" class="fk-card__meta">
              {{ $t('studentPayments.listCount', { shown: filteredStudents.length, total: students.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                aria-hidden="true"
              />
            </button>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="loadingList" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>
          <div v-else-if="listError" class="px-4 py-8 text-center text-sm text-red-700">{{ listError }}</div>
          <div v-else-if="!students.length" class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <p class="text-sm font-medium text-gray-600">{{ $t('studentPayments.noStudents') }}</p>
          </div>
          <p
            v-else-if="!filteredStudents.length"
            class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
          >
            {{ $t('studentPayments.noFilterResults') }}
          </p>
          <div v-else-if="isCards" class="grid gap-3 sm:grid-cols-2">
            <article
              v-for="s in filteredStudents"
              :key="s.id"
              class="relative cursor-pointer rounded-xl border border-gray-200/80 bg-white shadow-sm transition-colors hover:border-primary-200"
              @click="selectStudent(s)"
            >
              <div
                class="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                aria-hidden="true"
              />
              <div class="p-3">
                <div class="flex items-start gap-2.5">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                    {{ studentInitials(s) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-sm font-semibold text-gray-900">
                          {{ s.firstName }} {{ s.lastName }}
                        </h3>
                        <p class="mt-0.5 truncate text-xs text-gray-500">
                          {{ studentHasFeeLevel(s) ? gradeLabel(s) : $t('feesV2.noGrade') }}
                        </p>
                      </div>
                      <RowActionsMenu
                        :open="activeMenuId === s.id"
                        placement="up"
                        @toggle="toggleMenu(s.id)"
                        @click.stop
                      >
                        <RowActionsItem icon="view" @click="selectStudent(s)">
                          {{ $t('studentPayments.open') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </div>
                  </div>
                </div>
                <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('studentManagement.parent') }}</dt>
                    <dd class="truncate font-medium text-gray-800">{{ parentName(s) }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('studentPayments.summaryTotal') }}</dt>
                    <dd class="truncate font-medium tabular-nums text-gray-800">{{ moneyOrDash(sheetSummary(s)?.list_total) }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('studentPayments.summaryPaid') }}</dt>
                    <dd class="truncate font-medium tabular-nums text-emerald-800">{{ moneyOrDash(sheetSummary(s)?.paid_total) }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('studentPayments.summaryPending') }}</dt>
                    <dd class="truncate font-medium tabular-nums text-amber-800">{{ moneyOrDash(sheetSummary(s)?.pending_total) }}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>
          <div v-else class="fk-table-wrap overflow-visible">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-start">{{ $t('students.studentNameCol') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('studentManagement.parent') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('studentPayments.summaryTotal') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('studentPayments.summaryPaid') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('studentPayments.summaryPending') }}</th>
                  <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="s in filteredStudents"
                  :key="'list-' + s.id"
                  class="cursor-pointer hover:bg-primary-50/20"
                  @click="selectStudent(s)"
                >
                  <td class="px-4 py-3 font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ parentName(s) }}</td>
                  <td class="px-4 py-3 tabular-nums text-gray-700">{{ moneyOrDash(sheetSummary(s)?.list_total) }}</td>
                  <td class="px-4 py-3 tabular-nums text-emerald-800">{{ moneyOrDash(sheetSummary(s)?.paid_total) }}</td>
                  <td class="px-4 py-3 tabular-nums text-amber-800">{{ moneyOrDash(sheetSummary(s)?.pending_total) }}</td>
                  <td class="px-4 py-3" @click.stop>
                    <div class="flex justify-end">
                      <RowActionsMenu
                        :open="activeMenuId === s.id"
                        placement="up"
                        @toggle="toggleMenu(s.id)"
                      >
                        <RowActionsItem icon="view" @click="selectStudent(s)">
                          {{ $t('studentPayments.open') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              :aria-label="$t('feesV2.backToStudents')"
              @click="clearSelection"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">
                {{ selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : '' }}
              </h2>
              <p class="fk-card__meta">
                {{
                  selectedStudent && studentHasFeeLevel(selectedStudent)
                    ? gradeLabel(selectedStudent)
                    : $t('feesV2.noGrade')
                }}
              </p>
            </div>
          </div>
        </header>

        <div class="p-6">
            <div v-if="loadingSheet" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
              <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
              <span class="text-sm">{{ $t('common.loading') }}</span>
            </div>
            <div v-else-if="!sheet" class="flex min-h-[16rem] flex-col items-center justify-center text-center">
              <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-600">{{ sheetEmptyTitle }}</p>
              <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ sheetEmptyBody }}</p>
              <button
                v-if="sheetReason === 'generic'"
                type="button"
                class="mt-3 text-sm font-medium text-primary-700 hover:text-primary-800"
                @click="refreshSheet"
              >
                {{ $t('feesV2.refreshCharges') }}
              </button>
            </div>
            <div v-else-if="sheet" class="space-y-4">
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <div class="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                  <p class="text-xs text-gray-500">{{ $t('feesV2.totalList') }}</p>
                  <p class="text-base font-bold tabular-nums text-gray-900 sm:text-lg">{{ fmt(sheet.list_total) }}</p>
                </div>
                <div class="min-w-0 rounded-xl border border-violet-200/80 bg-violet-50 p-3 sm:p-4">
                  <p class="text-xs text-violet-800">{{ $t('feesV2.discounts') }}</p>
                  <p class="text-base font-bold tabular-nums text-violet-900 sm:text-lg">−{{ fmt(sheet.discount_total) }}</p>
                </div>
                <div class="min-w-0 rounded-xl border border-amber-200/80 bg-amber-50 p-3 sm:p-4">
                  <p class="text-xs text-amber-800">{{ $t('feesV2.upfrontDue') }}</p>
                  <p class="text-base font-bold tabular-nums text-amber-900 sm:text-lg">{{ fmt(sheet.upfront_due) }}</p>
                </div>
                <div class="min-w-0 rounded-xl border border-sky-200/80 bg-sky-50 p-3 sm:p-4">
                  <p class="text-xs text-sky-800">{{ $t('feesV2.installmentDue') }}</p>
                  <p class="text-base font-bold tabular-nums text-sky-900 sm:text-lg">{{ fmt(sheet.installment_due) }}</p>
                </div>
                <div class="min-w-0 rounded-xl border border-emerald-200/80 bg-emerald-50 p-3 sm:p-4">
                  <p class="text-xs text-emerald-800">{{ $t('feesV2.paid') }}</p>
                  <p class="text-base font-bold tabular-nums text-emerald-900 sm:text-lg">{{ fmt(sheet.paid_total) }}</p>
                </div>
              </div>

              <div class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
                <div class="min-w-0 w-full sm:min-w-[200px] sm:flex-1">
                  <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('feesV2.installmentPlan') }}</label>
                  <select v-model="selectedPlanId" class="fk-field">
                    <option value="">{{ $t('feesV2.noPlan') }}</option>
                    <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <button type="button" class="fk-btn fk-btn--primary w-full sm:w-auto" @click="applyPlan">
                  {{ $t('feesV2.applyPlan') }}
                </button>
                <button type="button" class="fk-btn fk-btn--pearl w-full sm:w-auto" @click="refreshSheet">
                  {{ $t('feesV2.refreshCharges') }}
                </button>
                <button
                  v-if="Number(sheet.upfront_due) > 0"
                  type="button"
                  :disabled="hasOpenUpfront || paying"
                  class="fk-btn fk-btn--primary w-full disabled:opacity-50 sm:w-auto"
                  @click="openPay('upfront')"
                >
                  {{ hasOpenUpfront ? $t('parentFees.waitingApproval') : $t('feesV2.payUpfront') }}
                </button>
              </div>

              <!-- Discounts -->
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div class="px-5 py-3 border-b border-gray-100 bg-violet-50/50 flex items-center justify-between">
                  <h2 class="text-sm font-semibold text-violet-900">{{ $t('feesV2.discounts') }}</h2>
                  <button type="button" @click="addDiscountRow" class="text-xs font-medium text-violet-700 hover:text-violet-900">+ {{ $t('feesV2.addDiscount') }}</button>
                </div>
                <div v-if="!discountRows.length" class="px-5 py-4 text-sm text-gray-500">{{ $t('feesV2.noDiscounts') }}</div>
                <div v-else class="divide-y divide-gray-100">
                  <div v-for="(row, idx) in discountRows" :key="idx" class="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                    <select v-model="row.discount_type_id" class="fk-field fk-field--sm min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[160px]">
                      <option value="">{{ $t('feesV2.chooseDiscount') }}</option>
                      <option v-for="d in discountTypes" :key="d.id" :value="d.id">{{ d.label }}</option>
                    </select>
                    <input v-model.number="row.amount" type="number" min="0" step="0.001" dir="ltr" class="fk-field fk-field--sm fk-field--mono w-28 text-end" />
                    <button type="button" @click="discountRows.splice(idx, 1)" class="text-red-600 text-xs font-medium hover:text-red-800">{{ $t('common.delete') }}</button>
                  </div>
                </div>
                <div v-if="discountRows.length" class="px-5 py-3 border-t border-gray-100 flex justify-end">
                  <button type="button" @click="saveDiscounts" :disabled="savingDiscounts" class="fk-btn fk-btn--primary">
                    {{ $t('feesV2.saveDiscounts') }}
                  </button>
                </div>
              </div>

              <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div class="border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.chargeLines') }}</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th class="px-4 py-2 text-start sm:px-5">{{ $t('feesV2.charge') }}</th>
                        <th class="px-3 py-2 text-end">{{ $t('feesV2.list') }}</th>
                        <th class="px-3 py-2 text-end">{{ $t('feesV2.due') }}</th>
                        <th class="px-4 py-2 text-end sm:px-5">{{ $t('feesV2.status') }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="line in sheet.lines" :key="line.id" class="hover:bg-gray-50/50">
                        <td class="px-4 py-3 sm:px-5">
                          <div class="font-medium text-gray-900">{{ line.charge_label }}</div>
                          <div class="mt-0.5 text-[10px] uppercase text-gray-400">{{ line.source_type }}</div>
                        </td>
                        <td class="px-3 py-3 text-end font-mono tabular-nums text-gray-600">{{ fmt(line.list_amount) }}</td>
                        <td class="px-3 py-3 text-end font-mono text-sm font-semibold tabular-nums text-gray-900">{{ fmt(line.due_amount) }}</td>
                        <td class="px-4 py-3 text-end sm:px-5">
                          <span :class="statusClass(line.status)" class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold">
                            {{ $t(`feesV2.status_${line.status}`) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="sheet.installments?.length" class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div class="border-b border-gray-100 px-4 py-3 sm:px-5">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.schedule') }}</h2>
                </div>
                <div class="divide-y divide-gray-100">
                  <div v-for="inst in sheet.installments" :key="inst.id" class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div class="min-w-0">
                      <span class="font-medium text-gray-900">{{ inst.label || `${$t('feesV2.installment')} ${inst.sequence}` }}</span>
                      <span v-if="inst.due_date" class="ms-2 text-xs text-gray-500">· {{ $t('feesV2.dueOn') }} {{ inst.due_date }}</span>
                      <span v-else-if="inst.month_number" class="ms-2 text-xs text-gray-500">· {{ $t('feesV2.month') }} {{ inst.month_number }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-3 sm:justify-end">
                      <div class="text-end">
                        <div class="font-mono font-semibold tabular-nums">{{ fmt(inst.amount_paid) }} / {{ fmt(inst.amount_due) }}</div>
                        <span :class="statusClass(inst.status)" class="text-xs font-medium">{{ $t(`feesV2.status_${inst.status}`) }}</span>
                      </div>
                      <button
                        v-if="inst.status !== 'paid'"
                        type="button"
                        :disabled="hasOpenInstallment(inst.id) || paying"
                        class="fk-btn fk-btn--primary fk-btn--sm shrink-0"
                        @click="openPay('installment', inst)"
                      >
                        {{ hasOpenInstallment(inst.id) ? $t('parentFees.waitingApproval') : $t('feesV2.pay') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="studentPayments.length" class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div class="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('parentFees.paymentHistory') }}</h2>
                </div>
                <ul class="divide-y divide-gray-100">
                  <li v-for="p in studentPayments" :key="p.id" class="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                    <div>
                      <p class="font-medium text-gray-900">{{ fmt(p.amount) }} OMR · {{ $t(`parentFees.method_${p.method}`) }}</p>
                      <p class="text-xs text-gray-500">{{ p.remarks || p.review_notes || '' }}</p>
                      <a
                        v-if="p.proof_url"
                        :href="mediaUrl(p.proof_url)"
                        target="_blank"
                        rel="noopener"
                        class="mt-1 inline-block text-xs font-medium text-teal-700 hover:underline"
                      >
                        {{ $t('feesV2.viewReceipt') }}
                      </a>
                    </div>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="schoolPayStatusClass(p.status)"
                    >
                      {{ $t(`parentFees.status_${p.status}`) }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
        </div>
      </div>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('studentPayments.filtersTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('studentPayments.filtersTitle') }}</h3>
          </div>
          <button
            type="button"
            class="fk-modal__close"
            :aria-label="$t('common.close')"
            @click="showFilters = false"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="fk-drawer__body">
          <div class="fk-form__row">
            <label class="fk-flabel" for="payments-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="payments-search"
              v-model="search"
              type="search"
              class="fk-field"
              :placeholder="$t('studentPayments.searchPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="payments-grade"><span>{{ $t('studentPayments.gradeAssignment') }}</span></label>
            <select id="payments-grade" v-model="gradeFilter" class="fk-field">
              <option value="all">{{ $t('studentPayments.allAssignments') }}</option>
              <option value="with">{{ $t('studentPayments.withGrade') }}</option>
              <option value="without">{{ $t('studentPayments.withoutGrade') }}</option>
            </select>
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>

    <FikrDialog
      :show="!!payTarget"
      plain-footer
      :title="$t('feesV2.schoolPayTitle')"
      :subtitle="$t('feesV2.schoolPayHint')"
      @close="closePay"
    >
      <div class="fk-form">
        <p class="text-2xl font-extrabold tabular-nums text-primary-800">{{ fmt(payAmount) }} OMR</p>
        <div class="fk-form__row">
          <label class="fk-flabel"><span>{{ $t('parentFees.attachReceipt') }}</span></label>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="block w-full text-sm" @change="onProofPicked" />
        </div>
        <div class="fk-form__row">
          <textarea
            v-model="payRemarks"
            rows="2"
            class="fk-field"
            :placeholder="$t('parentFees.remarksPlaceholder')"
          />
        </div>
        <p v-if="payError" class="text-sm text-red-700">{{ payError }}</p>
      </div>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="closePay">
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          class="fk-btn fk-btn--primary"
          :disabled="paying || !proofFile"
          @click="submitPay"
        >
          {{ paying ? $t('common.loading') : $t('parentFees.confirmPay') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { studentService, type Student } from '@/services'
import { feesV2Service, type ChargeSheetSummary, type FeePayment, type StudentChargeSheet, type InstallmentPlan } from '@/services/fees-v2.service'
import { mediaUrl } from '@/utils/thawaniCheckout'
import paymentConfigService, { type PaymentCatalogRow } from '@/services/payment-config.service'
import { authService } from '@/services'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const students = ref<Student[]>([])
const sheetSummaries = ref<Record<string, ChargeSheetSummary>>({})
const search = ref('')
const showFilters = ref(false)
const gradeFilter = ref<'all' | 'with' | 'without'>('all')
const activeMenuId = ref<string | null>(null)
const selectedId = ref<string | null>(null)
const sheet = ref<StudentChargeSheet | null>(null)
const loadingSheet = ref(false)
const loadingList = ref(true)
const listError = ref('')
const plans = ref<InstallmentPlan[]>([])
const selectedPlanId = ref('')
const discountTypes = ref<PaymentCatalogRow[]>([])
const discountRows = ref<Array<{ discount_type_id: string; amount: number }>>([])
const savingDiscounts = ref(false)
const studentPayments = ref<FeePayment[]>([])
const payTarget = ref<'upfront' | 'installment' | null>(null)
const payInstallmentId = ref<string | null>(null)
const payAmount = ref(0)
const payRemarks = ref('')
const proofFile = ref<File | null>(null)
const paying = ref(false)
const payError = ref('')
const sheetReason = ref<'no_grade' | 'no_year' | 'generic' | ''>('')

function isOpenPaymentStatus(status: string) {
  return status === 'pending' || status === 'pending_approval' || status === 'pending_reconcile'
}

const hasOpenUpfront = computed(() =>
  studentPayments.value.some((p) => p.target_type === 'upfront' && isOpenPaymentStatus(p.status)),
)

function hasOpenInstallment(id: string) {
  return studentPayments.value.some((p) => p.installment_id === id && isOpenPaymentStatus(p.status))
}

const schoolId = computed(() => authService.getStoredUser()?.school_id ?? 1)

const hasActiveFilters = computed(() =>
  Boolean(search.value.trim()) || gradeFilter.value !== 'all',
)

const filteredStudents = computed(() => {
  const q = search.value.trim().toLowerCase()
  return students.value.filter((s) => {
    if (gradeFilter.value === 'with' && !studentHasFeeLevel(s)) return false
    if (gradeFilter.value === 'without' && studentHasFeeLevel(s)) return false
    if (q && !`${s.firstName} ${s.lastName} ${parentName(s)}`.toLowerCase().includes(q)) return false
    return true
  })
})

function clearFilters() {
  search.value = ''
  gradeFilter.value = 'all'
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    activeMenuId.value = null
  }
}

const selectedStudent = computed(() =>
  students.value.find((s) => s.id === selectedId.value) ?? null,
)

const sheetEmptyTitle = computed(() => {
  if (sheetReason.value === 'no_grade') return t('feesV2.needGradeTitle')
  if (sheetReason.value === 'no_year') return t('feesV2.needYearTitle')
  return t('feesV2.sheetUnavailable')
})

const sheetEmptyBody = computed(() => {
  if (sheetReason.value === 'no_grade') return t('feesV2.needGradeBody')
  if (sheetReason.value === 'no_year') return t('feesV2.needYearBody')
  return t('feesV2.sheetUnavailable')
})

function studentHasFeeLevel(s: Student) {
  if (s.payment_level_id || s.paymentLevel?.id) return true
  const groups = s.groups as Array<{ level_id?: string | null; level?: { id?: string } }> | undefined
  return Boolean(groups?.some((g) => g.level_id || g.level?.id))
}

function classifySheetError(e: unknown): 'no_grade' | 'no_year' | 'generic' {
  const data = (e as { response?: { data?: Record<string, unknown> } })?.response?.data
  const nested = data?.message
  const code =
    (typeof data?.code === 'string' && data.code) ||
    (nested && typeof nested === 'object' && nested !== null && 'code' in nested
      ? String((nested as { code?: string }).code || '')
      : '')
  if (code === 'STUDENT_NO_GRADE') return 'no_grade'
  if (code === 'NO_ACTIVE_YEAR') return 'no_year'
  const msg = Array.isArray(nested)
    ? nested.join(' ')
    : typeof nested === 'string'
      ? nested
      : nested && typeof nested === 'object' && 'message' in nested
        ? String((nested as { message?: string }).message || '')
        : ''
  if (/grade/i.test(msg)) return 'no_grade'
  if (/academic year/i.test(msg)) return 'no_year'
  return 'generic'
}

function clearSelection() {
  selectedId.value = null
  sheet.value = null
  sheetReason.value = ''
  void loadSummaries()
}

function fmt(v: string | number) {
  return Number(v || 0).toFixed(3)
}

function gradeLabel(s: Student) {
  const pl = (s as Student & { paymentLevel?: { name?: string } }).paymentLevel
  return pl?.name || ''
}

function studentInitials(s: Student) {
  const a = (s.firstName || '').trim().charAt(0)
  const b = (s.lastName || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

function parentName(s: Student) {
  if (!s.parents?.length) return t('studentPayments.noParent')
  return s.parents
    .map((parent) => `${parent.firstName || parent.first_name || ''} ${parent.lastName || parent.last_name || ''}`.trim())
    .filter(Boolean)
    .join(', ') || t('studentPayments.noParent')
}

function sheetSummary(s: Student) {
  return sheetSummaries.value[s.id] ?? null
}

function moneyOrDash(v?: string) {
  return fmt(v ?? 0)
}

function statusClass(status: string) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-800'
  if (status === 'partial') return 'bg-amber-100 text-amber-800'
  if (status === 'waived') return 'bg-gray-100 text-gray-600'
  return 'bg-sky-100 text-sky-800'
}

function schoolPayStatusClass(status: string) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-800'
  if (status === 'pending_reconcile') return 'bg-sky-100 text-sky-800'
  if (status === 'pending_approval' || status === 'pending') return 'bg-amber-100 text-amber-800'
  if (status === 'rejected' || status === 'failed' || status === 'cancelled') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-700'
}

function syncDiscountRows() {
  discountRows.value = (sheet.value?.discountLines || []).map((d) => ({
    discount_type_id: d.discount_type_id,
    amount: Number(d.amount) || 0,
  }))
}

async function loadSummaries() {
  try {
    const rows = await feesV2Service.listChargeSheetSummaries()
    sheetSummaries.value = Object.fromEntries(rows.map((row) => [row.student_id, row]))
  } catch {
    sheetSummaries.value = {}
  }
}

async function loadStudents() {
  loadingList.value = true
  listError.value = ''
  try {
    const sid = Number(schoolId.value)
    const [rows] = await Promise.all([studentService.getAll(), loadSummaries()])
    students.value = rows.filter((s) => s.school_id == null || Number(s.school_id) === sid)
  } catch (e: unknown) {
    students.value = []
    const err = e as { message?: string }
    listError.value = err?.message || t('studentPayments.loadError')
  } finally {
    loadingList.value = false
  }
}

async function selectStudent(s: Student) {
  selectedId.value = s.id
  if (!studentHasFeeLevel(s)) {
    sheet.value = null
    sheetReason.value = 'no_grade'
    studentPayments.value = []
    loadingSheet.value = false
    return
  }
  sheet.value = null
  sheetReason.value = ''
  loadingSheet.value = true
  try {
    sheet.value = await feesV2Service.getStudentChargeSheet(s.id)
    studentPayments.value = await feesV2Service.listStudentPayments(s.id).catch(() => [])
    selectedPlanId.value = sheet.value.installment_plan_id || ''
    syncDiscountRows()
  } catch (e: unknown) {
    sheet.value = null
    sheetReason.value = classifySheetError(e)
  } finally {
    loadingSheet.value = false
  }
}

async function refreshSheet() {
  if (!selectedId.value) return
  const current = selectedStudent.value
  if (current && !studentHasFeeLevel(current)) {
    sheet.value = null
    sheetReason.value = 'no_grade'
    return
  }
  loadingSheet.value = true
  sheetReason.value = ''
  try {
    sheet.value = await feesV2Service.refreshStudentChargeSheet(selectedId.value)
    selectedPlanId.value = sheet.value.installment_plan_id || ''
    syncDiscountRows()
  } catch (e: unknown) {
    sheet.value = null
    sheetReason.value = classifySheetError(e)
  } finally {
    loadingSheet.value = false
  }
}

async function applyPlan() {
  if (!selectedId.value) return
  sheet.value = await feesV2Service.assignInstallmentPlan(selectedId.value, selectedPlanId.value || null)
  syncDiscountRows()
}

function addDiscountRow() {
  discountRows.value.push({ discount_type_id: '', amount: 0 })
}

async function saveDiscounts() {
  if (!selectedId.value) return
  savingDiscounts.value = true
  try {
    const valid = discountRows.value.filter((r) => r.discount_type_id && r.amount > 0)
    sheet.value = await feesV2Service.setChargeSheetDiscounts(selectedId.value, valid)
    syncDiscountRows()
  } finally {
    savingDiscounts.value = false
  }
}

function openPay(target: 'upfront' | 'installment', inst?: { id: string; amount_due: string; amount_paid: string }) {
  if (!sheet.value) return
  payError.value = ''
  payRemarks.value = ''
  proofFile.value = null
  payTarget.value = target
  if (target === 'installment' && inst) {
    payInstallmentId.value = inst.id
    payAmount.value = Math.max(0, Number(inst.amount_due) - Number(inst.amount_paid))
  } else {
    payInstallmentId.value = null
    payAmount.value = Number(sheet.value.upfront_due)
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
  if (!selectedId.value || !payTarget.value || !proofFile.value || payAmount.value <= 0) return
  paying.value = true
  payError.value = ''
  try {
    await feesV2Service.submitOfflinePayment(selectedId.value, {
      target_type: payTarget.value,
      installment_id: payInstallmentId.value ?? undefined,
      remarks: payRemarks.value,
      locale: locale.value === 'en' ? 'en' : 'ar',
      file: proofFile.value,
    })
    closePay()
    studentPayments.value = await feesV2Service.listStudentPayments(selectedId.value).catch(() => [])
  } catch (e: unknown) {
    const err = e as { message?: string }
    payError.value = err?.message || t('parentFees.payFailed')
  } finally {
    paying.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadStudents()
  try {
    plans.value = await feesV2Service.listInstallmentPlans(schoolId.value)
    discountTypes.value = await paymentConfigService.listDiscountTypes(schoolId.value)
  } catch {
    plans.value = []
    discountTypes.value = []
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
