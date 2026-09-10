<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('feesV2.studentChargesTitle')"
        :subtitle="$t('feesV2.studentChargesSubtitle')"
      />

      <div v-if="!selectedId" class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('studentPayments.studentsList') }}</h2>
            <p v-if="!loadingList" class="fk-card__meta">
              {{
                $t('common.paginationShowing', {
                  from: paginationFrom,
                  to: paginationTo,
                  total: listTotal,
                })
              }}
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
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-600"
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
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">
              {{ hasActiveFilters ? $t('studentPayments.noFilterResults') : $t('studentPayments.noStudents') }}
            </p>
          </div>
          <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="s in students"
              :key="s.id"
              class="relative cursor-pointer rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              @click="selectStudent(s)"
            >
              <div
                class="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                aria-hidden="true"
              />
              <div class="p-5">
                <div class="flex items-start gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xs font-bold text-primary-800">
                    {{ studentInitials(s) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate font-semibold text-gray-900">
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
                <dl class="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div class="min-w-0">
                    <dt class="text-gray-500">{{ $t('studentManagement.parent') }}</dt>
                    <dd class="truncate font-medium text-gray-800">{{ parentName(s) }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-500">{{ $t('studentPayments.summaryTotal') }}</dt>
                    <dd class="truncate font-medium tabular-nums text-gray-800">{{ moneyOrDash(sheetSummary(s)?.list_total) }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-500">{{ $t('studentPayments.summaryPaid') }}</dt>
                    <dd class="truncate font-medium tabular-nums text-emerald-800">{{ moneyOrDash(sheetSummary(s)?.paid_total) }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-500">{{ $t('studentPayments.summaryPending') }}</dt>
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
                  <th class="px-4 py-3 text-start">{{ $t('studentManagement.studentNameCol') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('studentManagement.parent') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('studentPayments.summaryTotal') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('studentPayments.summaryPaid') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('studentPayments.summaryPending') }}</th>
                  <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="s in students"
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

          <FikrPagination
            :page="currentPage"
            :pages="totalPages"
            :show="students.length > 0 || listTotal > 0"
            :disabled="loadingList"
            @update:page="onPageChange"
          />
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="fk-card">
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
                <h2 class="fk-card__title truncate">{{ sheetStudentName }}</h2>
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
                class="fk-btn fk-btn--pearl mt-4"
                @click="refreshSheet"
              >
                {{ $t('feesV2.refreshCharges') }}
              </button>
            </div>
            <div v-else class="space-y-4">
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                <div class="min-w-0 rounded-lg border border-gray-200/80 bg-white px-2.5 py-2">
                  <p class="text-[11px] leading-tight text-gray-500">{{ $t('feesV2.totalList') }}</p>
                  <p class="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">{{ fmt(sheet.list_total) }}</p>
                </div>
                <div class="min-w-0 rounded-lg border border-teal-200/70 bg-teal-50/70 px-2.5 py-2">
                  <p class="text-[11px] leading-tight text-teal-800">{{ $t('feesV2.discounts') }}</p>
                  <p class="mt-0.5 text-sm font-semibold tabular-nums text-teal-900">−{{ fmt(displayDiscountTotal) }}</p>
                </div>
                <div class="min-w-0 rounded-lg border border-amber-200/70 bg-amber-50/70 px-2.5 py-2">
                  <p class="text-[11px] leading-tight text-amber-800">{{ $t('feesV2.upfrontDue') }}</p>
                  <p class="mt-0.5 text-sm font-semibold tabular-nums text-amber-900">{{ fmt(displayUpfrontDue) }}</p>
                </div>
                <div class="min-w-0 rounded-lg border border-sky-200/70 bg-sky-50/70 px-2.5 py-2">
                  <p class="text-[11px] leading-tight text-sky-800">{{ $t('feesV2.installmentDue') }}</p>
                  <p class="mt-0.5 text-sm font-semibold tabular-nums text-sky-900">{{ fmt(displayInstallmentDue) }}</p>
                </div>
                <div class="min-w-0 rounded-lg border border-primary-200/70 bg-primary-50/70 px-2.5 py-2">
                  <p class="text-[11px] leading-tight text-primary-800">{{ $t('feesV2.paid') }}</p>
                  <p class="mt-0.5 text-sm font-semibold tabular-nums text-primary-900">{{ fmt(sheet.paid_total) }}</p>
                </div>
              </div>

              <div v-if="planLocked" class="rounded-lg border border-gray-200/80 bg-white px-3 py-2.5">
                <p class="text-sm font-medium text-gray-600">{{ $t('feesV2.installmentPlan') }}</p>
                <p class="mt-0.5 text-base font-semibold text-gray-900">{{ selectedPlanName }}</p>
              </div>
              <div v-else class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div class="min-w-0 w-full sm:min-w-[200px] sm:flex-1">
                  <label class="mb-1.5 block text-sm font-medium text-gray-600" for="student-charge-plan">
                    <span>{{ $t('feesV2.installmentPlan') }}</span>
                  </label>
                  <select id="student-charge-plan" v-model="selectedPlanId" class="fk-field">
                    <option value="">{{ $t('feesV2.noPlan') }}</option>
                    <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <button
                  type="button"
                  class="fk-btn fk-btn--primary w-full sm:w-auto"
                  :disabled="applyingPlan"
                  @click="applyPlan"
                >
                  {{ applyingPlan ? $t('common.loading') : $t('feesV2.applyPlan') }}
                </button>
              </div>
              <p v-if="selectedPlanId && !planLocked" class="text-xs text-gray-500">
                {{ $t('feesV2.remainingAfterAdvance') }}: <span class="font-mono tabular-nums">{{ fmt(displayInstallmentDue) }}</span>
              </p>
              <p v-if="isSheetDirty" class="text-sm font-medium text-red-600">{{ $t('feesV2.pendingSave') }}</p>
              <p v-if="applyError" class="text-sm text-red-700">{{ applyError }}</p>
            </div>
          </div>
        </div>

        <div v-if="sheet && !loadingSheet" class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('feesV2.discounts') }}</h2>
            </div>
            <div v-if="!planLocked" class="flex shrink-0 flex-nowrap items-center gap-2">
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="$t('feesV2.addDiscount')"
                @click="addDiscountRow"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </header>
          <div class="p-6">
            <div v-if="!discountRows.length" class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              {{ $t('feesV2.noDiscounts') }}
            </div>
            <div v-else-if="planLocked" class="space-y-2">
              <div
                v-for="(row, idx) in discountRows"
                :key="idx"
                class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 text-sm"
              >
                <span class="font-medium text-gray-900">{{ discountLabel(row.discount_type_id) }}</span>
                <span class="font-mono tabular-nums text-gray-800">{{ fmt(row.amount) }}</span>
              </div>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(row, idx) in discountRows"
                :key="idx"
                class="flex flex-wrap items-end gap-3"
              >
                <div class="min-w-0 flex-1 basis-full sm:basis-auto">
                  <label class="fk-flabel" :for="`discount-type-${idx}`"><span>{{ $t('feesV2.discounts') }}</span></label>
                  <select :id="`discount-type-${idx}`" v-model="row.discount_type_id" class="fk-field">
                    <option value="">{{ $t('feesV2.chooseDiscount') }}</option>
                    <option v-for="d in discountTypes" :key="d.id" :value="d.id">{{ d.label }}</option>
                  </select>
                </div>
                <div class="w-28">
                  <label class="fk-flabel" :for="`discount-amount-${idx}`"><span>{{ $t('feesV2.amount') }}</span></label>
                  <input
                    :id="`discount-amount-${idx}`"
                    v-model.number="row.amount"
                    type="number"
                    min="0"
                    step="0.001"
                    dir="ltr"
                    class="fk-field fk-field--mono text-end"
                  >
                </div>
                <button
                  type="button"
                  class="fk-iconbtn text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  :aria-label="$t('common.delete')"
                  @click="discountRows.splice(idx, 1)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="sheet && !loadingSheet" class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('feesV2.chargeLines') }}</h2>
            </div>
          </header>
          <div class="p-6">
            <div class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.charge') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('feesV2.list') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('feesV2.due') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('feesV2.status') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="line in sheet.lines" :key="line.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ line.charge_label }}</div>
                      <div class="mt-0.5 text-[10px] uppercase text-gray-400">{{ line.source_type }}</div>
                    </td>
                    <td class="px-4 py-3 text-end font-mono tabular-nums text-gray-600">{{ fmt(line.list_amount) }}</td>
                    <td class="px-4 py-3 text-end font-mono font-semibold tabular-nums text-gray-900">{{ fmt(line.due_amount) }}</td>
                    <td class="px-4 py-3 text-end">
                      <span :class="statusClass(line.status)" class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        {{ $t(`feesV2.status_${line.status}`) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-if="sheet && !loadingSheet && sheet.installments?.length" class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('feesV2.schedule') }}</h2>
              <p v-if="isSheetDirty" class="mt-1 text-sm font-medium text-red-600">{{ $t('feesV2.pendingSave') }}</p>
              <p v-else class="mt-1 text-sm text-gray-500">
                {{ $t('feesV2.scheduleTotals', { total: fmt(scheduleTotalDue), pending: fmt(schedulePending) }) }}
              </p>
            </div>
            <button
              v-if="!isSheetDirty && payableInstallments.length"
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm shrink-0"
              :disabled="paying"
              @click="openPay"
            >
              {{ $t('feesV2.addPayment') }}
            </button>
          </header>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-2.5 text-start font-semibold sm:px-6">{{ $t('feesV2.installment') }}</th>
                  <th class="px-3 py-2.5 text-start font-semibold">{{ $t('feesV2.dueOn') }}</th>
                  <th class="px-3 py-2.5 text-end font-semibold">{{ $t('feesV2.due') }}</th>
                  <th class="px-3 py-2.5 text-end font-semibold">{{ $t('feesV2.paid') }}</th>
                  <th class="px-3 py-2.5 text-end font-semibold">{{ $t('feesV2.remaining') }}</th>
                  <th class="px-3 py-2.5 text-start font-semibold">{{ $t('feesV2.paymentRef') }}</th>
                  <th class="px-4 py-2.5 text-end font-semibold sm:px-6">{{ $t('feesV2.status') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="inst in sheet.installments"
                  :key="inst.id"
                  class="hover:bg-primary-50/20"
                  :class="isAdvanceInstallment(inst) ? 'bg-amber-50/40' : ''"
                >
                  <td class="px-4 py-3 sm:px-6">
                    <div class="font-medium text-gray-900">{{ scheduleLabel(inst) }}</div>
                    <div v-if="inst.month_number" class="mt-0.5 text-[11px] text-gray-400">
                      {{ $t('feesV2.month') }} {{ inst.month_number }}
                    </div>
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap text-gray-600">
                    {{ inst.due_date || '—' }}
                  </td>
                  <td class="px-3 py-3 text-end align-middle">
                    <div v-if="isAdvanceInstallment(inst) && !planLocked" class="flex w-full justify-end">
                      <input
                        :id="`schedule-advance-${inst.id}`"
                        v-model.number="draftUpfront"
                        type="number"
                        :min="advanceMinPaid(inst)"
                        :max="draftNet"
                        step="0.001"
                        dir="ltr"
                        class="fk-field fk-field--mono !m-0 h-8 w-[5.5rem] shrink-0 px-2 py-1 text-end text-sm tabular-nums"
                        :disabled="!selectedPlanId || inst.status === 'paid'"
                        :aria-label="$t('feesV2.advanceAmount')"
                        @blur="clampDraftUpfront"
                      >
                    </div>
                    <span v-else class="inline-block font-mono tabular-nums text-gray-700">{{ fmt(displayInstDue(inst)) }}</span>
                  </td>
                  <td class="px-3 py-3 text-end font-mono tabular-nums text-gray-700">{{ fmt(inst.amount_paid) }}</td>
                  <td class="px-3 py-3 text-end font-mono font-semibold tabular-nums text-gray-900">
                    {{ fmt(displayInstRemaining(inst)) }}
                  </td>
                  <td class="px-3 py-3">
                    <div v-if="refsForInstallment(inst.id).length" class="flex flex-col gap-0.5">
                      <code
                        v-for="pref in refsForInstallment(inst.id)"
                        :key="pref"
                        class="w-fit rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-800"
                      >{{ pref }}</code>
                    </div>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="px-4 py-3 text-end sm:px-6">
                    <span
                      :class="statusClass(scheduleStatusKey(inst))"
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {{ scheduleStatusLabel(inst) }}
                    </span>
                    <p v-if="isSheetDirty && displayInstStatus(inst) !== 'paid'" class="mt-1 text-xs font-medium text-red-600">
                      {{ $t('feesV2.pendingSave') }}
                    </p>
                  </td>
                </tr>
              </tbody>
              <tfoot class="border-t border-gray-200 bg-gray-50/60 text-sm">
                <tr>
                  <td class="px-4 py-3 font-semibold text-gray-900 sm:px-6" colspan="2">
                    {{ $t('feesV2.scheduleSummary') }}
                  </td>
                  <td class="px-3 py-3 text-end font-mono font-semibold tabular-nums">{{ fmt(scheduleTotalDue) }}</td>
                  <td class="px-3 py-3 text-end font-mono font-semibold tabular-nums">{{ fmt(scheduleTotalPaid) }}</td>
                  <td class="px-3 py-3 text-end font-mono font-semibold tabular-nums text-amber-800">{{ fmt(schedulePending) }}</td>
                  <td colspan="2" />
                </tr>
              </tfoot>
            </table>
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
      :show="payOpen"
      size="lg"
      compact
      plain-footer
      :title="$t('feesV2.schoolPayTitle')"
      :subtitle="$t('feesV2.schoolPayHint')"
      @close="closePay"
    >
      <div class="fk-form space-y-3">
        <div class="grid gap-3 sm:grid-cols-2 sm:items-start">
          <div class="space-y-3">
            <div class="fk-form__row !mb-0">
              <label class="fk-flabel" for="student-pay-amount"><span>{{ $t('feesV2.payAmountLabel') }}</span></label>
              <input
                id="student-pay-amount"
                v-model.number="payAmount"
                type="number"
                min="0.001"
                :max="maxPayable"
                step="0.001"
                dir="ltr"
                class="fk-field fk-field--mono text-end"
              >
            </div>
            <div class="fk-form__row !mb-0">
              <label class="fk-flabel" for="student-pay-remarks"><span>{{ $t('feesV2.payRemarks') }}</span></label>
              <textarea
                id="student-pay-remarks"
                v-model="payRemarks"
                rows="2"
                class="fk-field"
                :placeholder="$t('parentFees.remarksPlaceholder')"
              />
            </div>
          </div>
          <div class="fk-form__row !mb-0">
            <label class="fk-flabel" for="student-pay-proof"><span>{{ $t('parentFees.attachReceipt') }}</span></label>
            <input
              id="student-pay-proof"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              class="fk-field file:me-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-800"
              @change="onProofPicked"
            >
          </div>
        </div>
        <div v-if="showAllocations" class="overflow-hidden rounded-lg border border-gray-200">
          <div class="border-b border-gray-100 bg-gray-50 px-3 py-2">
            <p class="text-xs text-gray-600">{{ $t('feesV2.allocateHint') }}</p>
          </div>
          <table class="min-w-full text-sm">
            <thead class="bg-white text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-3 py-2 text-start font-semibold">{{ $t('feesV2.installment') }}</th>
                <th class="px-3 py-2 text-end font-semibold">{{ $t('feesV2.due') }}</th>
                <th class="px-3 py-2 text-end font-semibold">{{ $t('feesV2.remaining') }}</th>
                <th class="w-32 px-3 py-2 text-end font-semibold">{{ $t('feesV2.amount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(inst, idx) in allocationInstallments"
                :key="inst.id"
                :class="isAllocLocked(idx) ? 'bg-gray-50/80 opacity-60' : 'hover:bg-primary-50/20'"
              >
                <td class="px-3 py-2 font-medium text-gray-900">
                  <span>{{ scheduleLabel(inst) }}</span>
                  <p v-if="hasOpenInstallment(inst.id)" class="mt-0.5 text-xs font-medium text-amber-700">
                    {{ openPaymentStatusLabel(inst.id) }}
                  </p>
                </td>
                <td class="px-3 py-2 text-end font-mono tabular-nums text-gray-600">{{ fmt(inst.amount_due) }}</td>
                <td class="px-3 py-2 text-end font-mono tabular-nums text-gray-700">{{ fmt(instRemaining(inst)) }}</td>
                <td class="px-3 py-2">
                  <input
                    :id="`pay-alloc-${inst.id}`"
                    :value="allocAmount(inst.id)"
                    type="number"
                    min="0"
                    :max="instRemaining(inst)"
                    step="0.001"
                    dir="ltr"
                    class="fk-field fk-field--mono py-1.5 text-end"
                    :disabled="isAllocLocked(idx)"
                    @input="onAllocInput(idx, ($event.target as HTMLInputElement).value)"
                  >
                </td>
              </tr>
            </tbody>
          </table>
          <p
            class="border-t border-gray-100 px-3 py-2 text-sm font-medium"
            :class="unallocated > 0.001 ? 'text-red-600' : 'text-gray-600'"
          >
            {{ $t('feesV2.unallocated', { amount: fmt(unallocated) }) }}
          </p>
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
          :disabled="!canSubmitPay"
          @click="submitPay"
        >
          {{ paying ? $t('common.loading') : $t('parentFees.confirmPay') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { studentService, type Student } from '@/services'
import { feesV2Service, type ChargeSheetSummary, type FeePayment, type StudentChargeSheet, type InstallmentPlan } from '@/services/fees-v2.service'
import paymentConfigService, { type PaymentCatalogRow } from '@/services/payment-config.service'
import { authService } from '@/services'
import { splitRoundedUpToFive } from '@/utils/fees-v2.util'

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

const currentPage = ref(1)
const pageSize = ref(20)
const listTotal = ref(0)
const totalPages = ref(1)
let searchDebounce: ReturnType<typeof setTimeout> | null = null
let listRequestSeq = 0

const paginationFrom = computed(() => {
  if (!listTotal.value || !students.value.length) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})
const paginationTo = computed(() =>
  !listTotal.value ? 0 : Math.min(currentPage.value * pageSize.value, listTotal.value),
)

const listError = ref('')
const plans = ref<InstallmentPlan[]>([])
const selectedPlanId = ref('')
const discountTypes = ref<PaymentCatalogRow[]>([])
const discountRows = ref<Array<{ discount_type_id: string; amount: number }>>([])
const draftUpfront = ref(0)
const applyingPlan = ref(false)
const applyError = ref('')
const studentPayments = ref<FeePayment[]>([])
const payOpen = ref(false)
const payAmount = ref(0)
const payAllocs = ref<Array<{ id: string; amount: number }>>([])
const payRemarks = ref('')
const proofFile = ref<File | null>(null)
const paying = ref(false)
const payError = ref('')
const sheetReason = ref<'no_grade' | 'no_year' | 'generic' | ''>('')

function isOpenPaymentStatus(status: string) {
  return status === 'pending' || status === 'pending_approval' || status === 'pending_reconcile'
}

function openPaymentForInstallment(id: string) {
  return studentPayments.value.find((p) => p.installment_id === id && isOpenPaymentStatus(p.status))
}

function hasOpenInstallment(id: string) {
  return Boolean(openPaymentForInstallment(id))
}

function openPaymentStatusLabel(id: string) {
  const payment = openPaymentForInstallment(id)
  if (!payment) return ''
  const key = `parentFees.status_${payment.status}`
  return t(key)
}

const schoolId = computed(() => {
  const id = authService.getStoredUser()?.school_id
  return id != null && String(id).trim() !== '' ? String(id) : ''
})

const hasActiveFilters = computed(() =>
  Boolean(search.value.trim()) || gradeFilter.value !== 'all',
)

function clearFilters() {
  search.value = ''
  gradeFilter.value = 'all'
  currentPage.value = 1
}

function onPageChange(page: number) {
  const next = Math.min(Math.max(1, page), Math.max(1, totalPages.value))
  if (next === currentPage.value) return
  currentPage.value = next
  void loadStudents()
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

const sheetStudentName = computed(() => {
  if (!selectedStudent.value) return ''
  return `${selectedStudent.value.firstName} ${selectedStudent.value.lastName}`.trim()
})

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
  selectedPlanId.value = ''
  discountRows.value = []
  draftUpfront.value = 0
  applyError.value = ''
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
  if (status === 'pending_reconcile' || status === 'pending_approval') {
    return 'bg-amber-100 text-amber-900'
  }
  return 'bg-sky-100 text-sky-800'
}

function moneyKey(v: string | number | null | undefined) {
  return Math.round((Number(v) || 0) * 1000)
}

function validDiscountRows() {
  return discountRows.value.filter((r) => r.discount_type_id && Number(r.amount) > 0)
}

function syncDiscountRows() {
  discountRows.value = (sheet.value?.discountLines || []).map((d) => ({
    discount_type_id: d.discount_type_id,
    amount: Number(d.amount) || 0,
  }))
}

function syncSheetDrafts() {
  syncDiscountRows()
  selectedPlanId.value = sheet.value?.installment_plan_id || ''
  draftUpfront.value = Number(sheet.value?.upfront_due || 0)
}

const draftDiscountSum = computed(() =>
  validDiscountRows().reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
)

const draftNet = computed(() => {
  if (!sheet.value) return 0
  const gross = Number(sheet.value.due_total) + Number(sheet.value.discount_total)
  return Math.max(0, gross - draftDiscountSum.value)
})

const draftRemaining = computed(() => {
  if (!selectedPlanId.value) return 0
  return Math.max(0, draftNet.value - (Number(draftUpfront.value) || 0))
})

/**
 * Lock plan / advance / discounts once payment is initiated: money applied, or a
 * receipt awaiting approval/settlement (amounts must not change under that receipt).
 * Add payment stays available for other open installments.
 */
const planLocked = computed(() => {
  if (!sheet.value) return false
  if (Number(sheet.value.paid_total) > 0.001) return true
  if ((sheet.value.installments || []).some((inst) => Number(inst.amount_paid) > 0.001)) return true
  return studentPayments.value.some((p) =>
    ['paid', 'pending', 'pending_approval', 'pending_reconcile'].includes(p.status),
  )
})

const selectedPlanName = computed(() => {
  if (!selectedPlanId.value) return t('feesV2.noPlan')
  return plans.value.find((p) => p.id === selectedPlanId.value)?.name || t('feesV2.noPlan')
})

function discountLabel(discountTypeId: string) {
  return discountTypes.value.find((d) => d.id === discountTypeId)?.label || discountTypeId
}

const isSheetDirty = computed(() => {
  if (!sheet.value || planLocked.value) return false
  const savedPlan = sheet.value.installment_plan_id || ''
  if (selectedPlanId.value !== savedPlan) return true
  if (moneyKey(draftUpfront.value) !== moneyKey(sheet.value.upfront_due)) return true
  const saved = (sheet.value.discountLines || [])
    .map((d) => `${d.discount_type_id}:${moneyKey(d.amount)}`)
    .sort()
    .join('|')
  const draft = validDiscountRows()
    .map((d) => `${d.discount_type_id}:${moneyKey(d.amount)}`)
    .sort()
    .join('|')
  return saved !== draft
})

const displayDiscountTotal = computed(() =>
  isSheetDirty.value ? draftDiscountSum.value : Number(sheet.value?.discount_total || 0),
)

const displayUpfrontDue = computed(() => {
  if (!isSheetDirty.value) return Number(sheet.value?.upfront_due || 0)
  return selectedPlanId.value ? Number(draftUpfront.value) || 0 : draftNet.value
})

const displayInstallmentDue = computed(() => {
  if (!isSheetDirty.value) return Number(sheet.value?.installment_due || 0)
  return selectedPlanId.value ? draftRemaining.value : 0
})

function clampDraftUpfront() {
  const max = draftNet.value
  const advanceRow = (sheet.value?.installments || []).find((inst) => isAdvanceInstallment(inst))
  const min = advanceRow ? advanceMinPaid(advanceRow) : 0
  let value = Number(draftUpfront.value)
  if (!Number.isFinite(value) || value < min) value = min
  if (value > max) value = max
  draftUpfront.value = value
}

/** Plan-entry sequence → due amount after advance (same split as backend save). */
const draftInstallmentDueBySeq = computed(() => {
  const map = new Map<number, number>()
  const plan = plans.value.find((p) => p.id === selectedPlanId.value)
  const entries = [...(plan?.entries || [])].sort((a, b) => a.sequence - b.sequence)
  if (!entries.length) return map
  const remaining = Math.max(0, draftNet.value - (Number(draftUpfront.value) || 0))
  const weights = entries.map((e) => Number(e.weight) || 1)
  const amounts = splitRoundedUpToFive(remaining, weights)
  entries.forEach((entry, i) => {
    const sequence = entry.sequence === 0 ? Math.max(1, i + 1) : entry.sequence
    map.set(sequence, amounts[i] ?? 0)
  })
  return map
})

function scheduleLabel(inst: { sequence: number; label?: string | null }) {
  if (inst.sequence === 0 || inst.label === 'upfront') return t('feesV2.advanceAmount')
  return inst.label || `${t('feesV2.installment')} ${inst.sequence}`
}

function isAdvanceInstallment(inst: { sequence: number; label?: string | null }) {
  return inst.sequence === 0 || inst.label === 'upfront'
}

function advanceMinPaid(inst: { amount_paid: string }) {
  return money3(Number(inst.amount_paid) || 0)
}

function displayInstDue(inst: { sequence: number; label?: string | null; amount_due: string }) {
  if (planLocked.value) return money3(Number(inst.amount_due) || 0)
  if (isAdvanceInstallment(inst)) return money3(Number(draftUpfront.value) || 0)
  if (selectedPlanId.value && draftInstallmentDueBySeq.value.has(inst.sequence)) {
    return money3(draftInstallmentDueBySeq.value.get(inst.sequence)!)
  }
  return money3(Number(inst.amount_due) || 0)
}

function displayInstRemaining(inst: {
  sequence: number
  label?: string | null
  amount_due: string
  amount_paid: string
}) {
  return Math.max(0, money3(displayInstDue(inst) - (Number(inst.amount_paid) || 0)))
}

function displayInstStatus(inst: {
  sequence: number
  label?: string | null
  amount_due: string
  amount_paid: string
  status: string
}) {
  const due = displayInstDue(inst)
  const paid = Number(inst.amount_paid) || 0
  if (due <= 0 || (due > 0 && paid >= due)) return 'paid'
  if (paid > 0) return 'partial'
  return 'pending'
}

/** One badge only: open receipt status, or unpaid/partial/paid. */
function scheduleStatusKey(inst: {
  id: string
  sequence: number
  label?: string | null
  amount_due: string
  amount_paid: string
  status: string
}) {
  const open = openPaymentForInstallment(inst.id)
  if (!open) return displayInstStatus(inst)
  // Map generic payment `pending` to settlement styling (not unpaid sky).
  if (open.status === 'pending') return 'pending_reconcile'
  return open.status
}

function scheduleStatusLabel(inst: {
  id: string
  sequence: number
  label?: string | null
  amount_due: string
  amount_paid: string
  status: string
}) {
  const open = openPaymentForInstallment(inst.id)
  if (open) return openPaymentStatusLabel(inst.id)
  return t(`feesV2.status_${displayInstStatus(inst)}`)
}

async function loadSummaries(studentIds?: string[]) {
  try {
    const ids = studentIds?.length ? studentIds : students.value.map((s) => s.id)
    if (!ids.length) {
      sheetSummaries.value = {}
      return
    }
    const rows = await feesV2Service.listChargeSheetSummaries({ studentIds: ids })
    sheetSummaries.value = Object.fromEntries(rows.map((row) => [row.student_id, row]))
  } catch {
    sheetSummaries.value = {}
  }
}

async function loadStudents() {
  loadingList.value = true
  listError.value = ''
  const seq = ++listRequestSeq
  try {
    const page = await studentService.listPage({
      page: currentPage.value,
      limit: pageSize.value,
      q: search.value,
      fee_level: gradeFilter.value,
    })
    if (seq !== listRequestSeq) return
    students.value = page.items
    listTotal.value = page.total
    totalPages.value = page.pages
    currentPage.value = page.page
    await loadSummaries(page.items.map((s) => s.id))
  } catch (e: unknown) {
    if (seq !== listRequestSeq) return
    students.value = []
    listTotal.value = 0
    totalPages.value = 1
    sheetSummaries.value = {}
    const err = e as { message?: string }
    listError.value = err?.message || t('studentPayments.loadError')
  } finally {
    if (seq === listRequestSeq) loadingList.value = false
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
    syncSheetDrafts()
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
    syncSheetDrafts()
  } catch (e: unknown) {
    sheet.value = null
    sheetReason.value = classifySheetError(e)
  } finally {
    loadingSheet.value = false
  }
}

async function applyPlan() {
  if (!selectedId.value || planLocked.value) return
  clampDraftUpfront()
  applyingPlan.value = true
  applyError.value = ''
  try {
    sheet.value = await feesV2Service.assignInstallmentPlan(selectedId.value, {
      installment_plan_id: selectedPlanId.value || null,
      discounts: validDiscountRows().map((row) => ({
        discount_type_id: row.discount_type_id,
        amount: Number(row.amount) || 0,
      })),
      upfront_due: selectedPlanId.value ? Number(draftUpfront.value) || 0 : draftNet.value,
    })
    syncSheetDrafts()
    studentPayments.value = await feesV2Service.listStudentPayments(selectedId.value).catch(() => [])
    void loadSummaries()
  } catch (e: unknown) {
    const err = e as { message?: string }
    applyError.value = err?.message || t('feesV2.sheetUnavailable')
  } finally {
    applyingPlan.value = false
  }
}

function addDiscountRow() {
  if (planLocked.value) return
  discountRows.value.push({ discount_type_id: '', amount: 0 })
}

function money3(n: number) {
  return Math.round((Number(n) || 0) * 1000) / 1000
}

function instRemaining(inst: { amount_due: string; amount_paid: string }) {
  return Math.max(0, money3(Number(inst.amount_due) - Number(inst.amount_paid)))
}

const scheduleTotalDue = computed(() =>
  money3(
    (sheet.value?.installments || []).reduce((sum, inst) => sum + displayInstDue(inst), 0),
  ),
)

const scheduleTotalPaid = computed(() =>
  money3((sheet.value?.installments || []).reduce((sum, inst) => sum + (Number(inst.amount_paid) || 0), 0)),
)

const schedulePending = computed(() =>
  money3(Math.max(0, scheduleTotalDue.value - scheduleTotalPaid.value)),
)

function refsForInstallment(installmentId: string): string[] {
  const refs = studentPayments.value
    .filter((p) => p.installment_id === installmentId && p.payment?.payment_ref)
    .map((p) => p.payment!.payment_ref)
  return [...new Set(refs)]
}

/** Unpaid schedule rows in order (advance/sequence 0 first), including pending-receipt rows. */
const allocationInstallments = computed(() =>
  (sheet.value?.installments || [])
    .filter((inst) => inst.status !== 'paid' && instRemaining(inst) > 0.001)
    .slice()
    .sort((a, b) => a.sequence - b.sequence),
)

/** Rows that can receive a new allocation (no open receipt). */
const payableInstallments = computed(() =>
  allocationInstallments.value.filter((inst) => !hasOpenInstallment(inst.id)),
)

const maxPayable = computed(() =>
  money3(payableInstallments.value.reduce((sum, inst) => sum + instRemaining(inst), 0)),
)

const showAllocations = computed(() =>
  payOpen.value && Number(payAmount.value) > 0 && Boolean(proofFile.value) && allocationInstallments.value.length > 0,
)

const allocatedSum = computed(() =>
  money3(payAllocs.value.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)),
)

const unallocated = computed(() =>
  money3(Math.max(0, Number(payAmount.value) || 0) - allocatedSum.value),
)

const canSubmitPay = computed(() => {
  if (paying.value || !proofFile.value || !showAllocations.value) return false
  if (!payableInstallments.value.length) return false
  const amount = Number(payAmount.value) || 0
  if (amount <= 0 || amount > maxPayable.value + 0.001) return false
  return Math.abs(allocatedSum.value - amount) <= 0.001
})

function allocAmount(id: string) {
  return payAllocs.value.find((row) => row.id === id)?.amount ?? 0
}

function isAllocComplete(idx: number) {
  const inst = allocationInstallments.value[idx]
  if (!inst) return false
  if (hasOpenInstallment(inst.id)) return true
  return allocAmount(inst.id) >= instRemaining(inst) - 0.001
}

function isAllocLocked(idx: number) {
  const inst = allocationInstallments.value[idx]
  if (!inst) return true
  if (hasOpenInstallment(inst.id)) return true
  for (let i = 0; i < idx; i++) {
    const prev = allocationInstallments.value[i]
    if (!prev || hasOpenInstallment(prev.id)) continue
    if (!isAllocComplete(i)) return true
  }
  return false
}

function waterfallAllocate(total: number) {
  let left = money3(Math.min(Math.max(0, total), maxPayable.value))
  payAllocs.value = allocationInstallments.value.map((inst) => {
    if (hasOpenInstallment(inst.id)) return { id: inst.id, amount: 0 }
    const cap = instRemaining(inst)
    const take = money3(Math.min(cap, Math.max(0, left)))
    left = money3(left - take)
    return { id: inst.id, amount: take }
  })
}

function onAllocInput(idx: number, raw: string) {
  const inst = allocationInstallments.value[idx]
  if (!inst || isAllocLocked(idx)) return
  const cap = instRemaining(inst)
  const prior = money3(
    payAllocs.value.slice(0, idx).reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
  )
  const maxFromPayment = money3(Math.max(0, (Number(payAmount.value) || 0) - prior))
  let value = Number(raw)
  if (!Number.isFinite(value) || value < 0) value = 0
  value = money3(Math.min(value, cap, maxFromPayment))
  const next = payAllocs.value.map((row) => ({ ...row }))
  if (!next[idx]) next[idx] = { id: inst.id, amount: 0 }
  next[idx].amount = value
  if (value + 0.001 < cap) {
    for (let j = idx + 1; j < next.length; j++) next[j].amount = 0
  } else {
    let left = money3((Number(payAmount.value) || 0) - next.slice(0, idx + 1).reduce((sum, row) => sum + row.amount, 0))
    for (let j = idx + 1; j < next.length; j++) {
      const later = allocationInstallments.value[j]
      if (!later || hasOpenInstallment(later.id)) {
        next[j].amount = 0
        continue
      }
      const take = money3(Math.min(instRemaining(later), Math.max(0, left)))
      next[j].amount = take
      left = money3(left - take)
    }
  }
  payAllocs.value = next
  void nextTick(() => {
    for (const row of next) {
      const el = document.getElementById(`pay-alloc-${row.id}`) as HTMLInputElement | null
      if (el) el.value = String(row.amount)
    }
  })
}

function openPay() {
  if (!sheet.value || isSheetDirty.value || !payableInstallments.value.length) return
  payError.value = ''
  payRemarks.value = ''
  proofFile.value = null
  payAmount.value = 0
  payAllocs.value = allocationInstallments.value.map((inst) => ({ id: inst.id, amount: 0 }))
  payOpen.value = true
}

function closePay() {
  payOpen.value = false
  proofFile.value = null
  payAllocs.value = []
}

function onProofPicked(e: Event) {
  const input = e.target as HTMLInputElement
  proofFile.value = input.files?.[0] ?? null
}

async function submitPay() {
  if (!selectedId.value || !canSubmitPay.value || !proofFile.value) return
  paying.value = true
  payError.value = ''
  try {
    await feesV2Service.submitOfflinePayment(selectedId.value, {
      allocations: payAllocs.value
        .filter((row) => row.amount > 0.001)
        .map((row) => ({ installment_id: row.id, amount: money3(row.amount) })),
      remarks: payRemarks.value,
      locale: locale.value === 'en' ? 'en' : 'ar',
      file: proofFile.value,
    })
    closePay()
    sheet.value = await feesV2Service.getStudentChargeSheet(selectedId.value)
    studentPayments.value = await feesV2Service.listStudentPayments(selectedId.value).catch(() => [])
    syncSheetDrafts()
    void loadSummaries()
  } catch (e: unknown) {
    const err = e as { message?: string }
    payError.value = err?.message || t('parentFees.payFailed')
  } finally {
    paying.value = false
  }
}

watch(isSheetDirty, (dirty) => {
  if (dirty) closePay()
})

watch([payAmount, proofFile, allocationInstallments], () => {
  if (!payOpen.value) return
  const cap = maxPayable.value
  if (Number(payAmount.value) > cap) payAmount.value = cap
  if (Number(payAmount.value) > 0 && proofFile.value) {
    waterfallAllocate(Number(payAmount.value) || 0)
  }
})

watch([selectedPlanId, draftNet], () => {
  if (!selectedPlanId.value) {
    draftUpfront.value = draftNet.value
    return
  }
  if (Number(draftUpfront.value) > draftNet.value) {
    draftUpfront.value = draftNet.value
  }
})

watch(search, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    currentPage.value = 1
    void loadStudents()
  }, 300)
})

watch(gradeFilter, () => {
  currentPage.value = 1
  void loadStudents()
})

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
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>
