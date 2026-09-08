<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('platformSchools.title')"
        :subtitle="$t('platformSchools.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ error }}</span>
          <button type="button" class="font-semibold underline" @click="reloadPage">
            {{ $t('platformSchools.tryAgain') }}
          </button>
        </div>
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('platformSchools.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('platformSchools.schoolsCount', { count: filtered.length }) }}
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

        <div v-if="!loading" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ schoolStats.total }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('platformSchools.stats.total') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ schoolStats.active }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('platformSchools.stats.active') }}</div>
          </div>
          <div class="rounded-xl bg-amber-50/70 px-3 py-3 text-center ring-1 ring-amber-100">
            <div class="text-xl font-bold tabular-nums text-amber-800">{{ schoolStats.pending }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('platformSchools.stats.pending') }}</div>
          </div>
          <div class="rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100">
            <div class="text-xl font-bold tabular-nums text-teal-700">{{ schoolStats.students }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('platformSchools.stats.students') }}</div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="filtered.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900">{{ $t('platformSchools.empty') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-gray-500">{{ $t('platformSchools.emptyHint') }}</p>
          </div>

          <template v-else>
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="school in filtered"
                :key="school.id"
                class="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <img
                      v-if="school.logo_url"
                      :src="school.logo_url"
                      alt=""
                      class="h-12 w-12 shrink-0 rounded-full border border-gray-200 object-cover"
                    >
                    <div
                      v-else
                      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700"
                    >
                      {{ school.name.charAt(0) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">{{ school.name }}</h3>
                      <p class="mt-0.5 text-xs text-gray-500">#{{ school.id }}</p>
                      <span
                        class="mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        :class="statusClass(school.status)"
                      >
                        {{ statusLabel(school.status) }}
                      </span>
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-50/80 p-3 ring-1 ring-gray-100">
                    <div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('platformBilling.colPlan') }}</div>
                      <div class="mt-0.5 text-sm font-semibold capitalize text-gray-900">{{ school.planCode || '—' }}</div>
                    </div>
                    <div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('platformSchools.colStudents') }}</div>
                      <div class="mt-0.5 text-sm font-bold tabular-nums text-gray-900">{{ school.studentCount }}</div>
                    </div>
                    <div class="col-span-2">
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('platformSchools.membership') }}</div>
                      <div class="mt-0.5 text-xs text-gray-700">
                        {{ formatDate(school.membershipFrom || '') }} → {{ formatDate(school.membershipTo || '') }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <button
                    v-if="school.status === 'pending'"
                    type="button"
                    class="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    :disabled="approveBusyId === school.id"
                    @click="approveSchool(school)"
                  >
                    {{
                      approveBusyId === school.id
                        ? $t('platformSchools.approving')
                        : $t('platformSchools.approve')
                    }}
                  </button>
                  <button
                    type="button"
                    class="text-sm font-semibold text-primary-700 hover:text-primary-900"
                    @click="openBilling(school)"
                  >
                    {{ $t('platformBilling.manage') }}
                  </button>
                  <button
                    type="button"
                    class="text-sm font-semibold text-gray-700 hover:text-gray-900"
                    @click="openDetails(school)"
                  >
                    {{ $t('platformSchools.detailsNav') }}
                  </button>
                </div>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('platformSchools.colSchool') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('platformSchools.colStatus') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('platformBilling.colPlan') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('platformSchools.colMembershipFrom') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('platformSchools.colMembershipTo') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('platformSchools.colStudents') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('platformSchools.colRegistered') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="school in filtered"
                    :key="school.id"
                    class="hover:bg-primary-50/20"
                  >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <img
                          v-if="school.logo_url"
                          :src="school.logo_url"
                          alt=""
                          class="h-10 w-10 rounded-full border border-gray-200 object-cover"
                        >
                        <div
                          v-else
                          class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700"
                        >
                          {{ school.name.charAt(0) }}
                        </div>
                        <div>
                          <div class="font-medium text-gray-900">{{ school.name }}</div>
                          <div class="text-xs text-gray-500">#{{ school.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        :class="statusClass(school.status)"
                      >
                        {{ statusLabel(school.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 capitalize text-gray-800">{{ school.planCode || '—' }}</td>
                    <td class="whitespace-nowrap px-4 py-3 text-gray-700">
                      {{ formatDate(school.membershipFrom || '') }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-gray-700">
                      {{ formatDate(school.membershipTo || '') }}
                    </td>
                    <td class="px-4 py-3 font-medium tabular-nums text-gray-900">{{ school.studentCount }}</td>
                    <td class="whitespace-nowrap px-4 py-3 text-gray-700">
                      {{ formatDate(school.created_at) }}
                    </td>
                    <td class="px-4 py-3 text-end">
                      <div class="flex flex-col items-end gap-1.5">
                        <button
                          v-if="school.status === 'pending'"
                          type="button"
                          class="rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                          :disabled="approveBusyId === school.id"
                          @click="approveSchool(school)"
                        >
                          {{
                            approveBusyId === school.id
                              ? $t('platformSchools.approving')
                              : $t('platformSchools.approve')
                          }}
                        </button>
                        <button
                          type="button"
                          class="text-sm font-semibold text-primary-700 hover:underline"
                          @click="openBilling(school)"
                        >
                          {{ $t('platformBilling.manage') }}
                        </button>
                        <button
                          type="button"
                          class="text-sm font-semibold text-gray-700 hover:underline"
                          @click="openDetails(school)"
                        >
                          {{ $t('platformSchools.detailsNav') }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </section>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('common.filter')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('common.filter') }}</h3>
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
            <label class="fk-flabel" for="schools-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="schools-search"
              v-model="search"
              type="search"
              class="fk-field"
              :placeholder="$t('platformSchools.searchPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="schools-status"><span>{{ $t('platformSchools.colStatus') }}</span></label>
            <select id="schools-status" v-model="statusFilter" class="fk-field">
              <option value="all">{{ $t('platformSchools.allStatuses') }}</option>
              <option value="pending">{{ $t('platformSchools.status.pending') }}</option>
              <option value="active">{{ $t('platformSchools.status.active') }}</option>
              <option value="suspended">{{ $t('platformSchools.status.suspended') }}</option>
              <option value="rejected">{{ $t('platformSchools.status.rejected') }}</option>
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

    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('platformBilling.drawerTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="closeDrawer" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h2 class="fk-form__title">{{ $t('platformBilling.drawerTitle') }}</h2>
            <p class="mt-1 text-sm text-gray-500">{{ selectedSchool?.name }}</p>
          </div>
          <button
            type="button"
            class="fk-modal__close"
            :aria-label="$t('common.close')"
            @click="closeDrawer"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="fk-drawer__body space-y-5">
          <p v-if="drawerError" class="fk-alert fk-alert--error">
            {{ drawerError }}
          </p>
          <p v-if="drawerMsg" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            {{ drawerMsg }}
          </p>

          <div v-if="drawerLoading" class="text-sm text-gray-500 py-8 text-center">
            {{ $t('common.loading') }}
          </div>

          <template v-else>
            <div class="text-sm text-gray-600">
              {{ $t('platformBilling.students') }}:
              <span class="font-semibold text-gray-900">{{ bundle?.studentCount ?? 0 }}</span>
            </div>

            <p v-if="!bundle?.subscription" class="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {{ $t('platformBilling.noSubscription') }}
            </p>

            <div class="space-y-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('subscription.planLabel') }}</label>
                <select v-model="form.plan_code" class="fk-field">
                  <option v-for="p in catalogPlans" :key="p.code" :value="p.code">
                    {{ locale === 'ar' ? p.name_ar : p.name_en }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('subscription.periodLabel') }}</label>
                <select v-model="form.billing_period" class="fk-field">
                  <option v-for="period in periods" :key="period" :value="period">
                    {{ $t(`platformBilling.periods.${period}`) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('platformBilling.subStatus') }}</label>
                <select v-model="form.status" class="fk-field">
                  <option value="draft">{{ $t('platformBilling.subStatuses.draft') }}</option>
                  <option value="active">{{ $t('platformBilling.subStatuses.active') }}</option>
                  <option value="past_due">{{ $t('platformBilling.subStatuses.past_due') }}</option>
                  <option value="cancelled">{{ $t('platformBilling.subStatuses.cancelled') }}</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('platformBilling.schoolStatus') }}</label>
                <select v-model="form.school_status" class="fk-field">
                  <option value="pending">{{ $t('platformSchools.status.pending') }}</option>
                  <option value="active">{{ $t('platformSchools.status.active') }}</option>
                  <option value="suspended">{{ $t('platformSchools.status.suspended') }}</option>
                  <option value="rejected">{{ $t('platformSchools.status.rejected') }}</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('platformBilling.addons') }}</label>
                <div class="space-y-2">
                  <label
                    v-for="addon in catalogAddons"
                    :key="addon.code"
                    class="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      :value="addon.code"
                      v-model="form.addon_codes"
                    />
                    <span>
                      {{ locale === 'ar' ? addon.name_ar : addon.name_en }}
                      <span class="text-gray-500">({{ addon.amount_omr }} OMR)</span>
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('platformBilling.notes') }}</label>
                <textarea v-model="form.notes" rows="2" class="fk-field" />
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="actionBusy"
                @click="saveSubscription"
              >
                {{ $t('platformBilling.saveSubscription') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--pearl"
                :disabled="actionBusy || !bundle?.subscription"
                @click="issueInvoice"
              >
                {{ $t('platformBilling.issueInvoice') }}
              </button>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ $t('platformBilling.invoices') }}</h3>
              <div v-if="!bundle?.invoices?.length" class="text-sm text-gray-400">—</div>
              <ul v-else class="space-y-2">
                <li
                  v-for="inv in bundle.invoices"
                  :key="inv.id"
                  class="rounded-lg border border-gray-200 p-3 text-sm"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="font-medium text-gray-900">
                        #{{ inv.id }} · {{ inv.total_amount }} OMR
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ inv.period_start }} → {{ inv.period_end }} ·
                        {{ invoiceStatusLabel(inv.status) }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ $t('platformBilling.students') }}: {{ inv.seats_used }}/{{ inv.seats_included }}
                      </div>
                    </div>
                    <button
                      v-if="inv.status === 'issued' || inv.status === 'draft'"
                      type="button"
                      class="shrink-0 text-xs font-medium text-primary-700 hover:underline disabled:opacity-50"
                      :disabled="actionBusy"
                      @click="markPaid(inv.id)"
                    >
                      {{ $t('platformBilling.markPaid') }}
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </template>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" @click="closeDrawer">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>
    <!-- Billing drawer -->
    <div
      v-if="detailsOpen"
      class="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/30" @click="closeDetails" />
      <div
        class="relative z-50 h-full w-full max-w-lg overflow-y-auto border-s border-gray-200 bg-white shadow-xl"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="sticky top-0 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('platformSchools.detailsTitle') }}</h2>
            <p class="text-sm text-gray-500">{{ detailsSchool?.name }}</p>
          </div>
          <button type="button" class="text-sm text-gray-600 hover:text-gray-900" @click="closeDetails">
            {{ $t('common.close') }}
          </button>
        </div>

        <div v-if="detailsSchool" class="space-y-5 p-4">
          <p v-if="detailsMsg" class="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {{ detailsMsg }}
          </p>
          <p v-if="detailsError" class="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {{ detailsError }}
          </p>

          <div class="flex flex-wrap gap-2">
            <button
              v-if="!editing"
              type="button"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              @click="startEditing"
            >
              {{ $t('platformSchools.edit') }}
            </button>
            <template v-else>
              <button
                type="button"
                class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                :disabled="detailsSaving"
                @click="saveDetails"
              >
                {{ detailsSaving ? $t('platformSchools.saving') : $t('platformSchools.save') }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                @click="editing = false"
              >
                {{ $t('platformSchools.cancelEdit') }}
              </button>
            </template>
          </div>

          <section class="rounded-xl border border-gray-200 p-4">
            <h3 class="mb-3 text-sm font-bold text-gray-900">{{ $t('platformSchools.sectionSchool') }}</h3>
            <div class="space-y-3">
              <div v-for="field in schoolFields" :key="field.key">
                <label class="field-label">{{ $t(field.label) }}</label>
                <textarea
                  v-if="editing && field.multiline"
                  v-model="editForm[field.key]"
                  rows="3"
                  class="input-field"
                />
                <input
                  v-else-if="editing"
                  v-model="editForm[field.key]"
                  type="text"
                  class="input-field"
                />
                <p v-else class="text-sm text-gray-800" :class="!detailsValue(field.key) ? 'text-gray-400' : ''">
                  {{ detailsValue(field.key) || $t('platformSchools.notProvided') }}
                </p>
              </div>
            </div>
          </section>

          <section class="rounded-xl border border-gray-200 p-4">
            <h3 class="mb-3 text-sm font-bold text-gray-900">{{ $t('platformSchools.sectionDocs') }}</h3>
            <dl class="space-y-3 text-sm">
              <div v-for="doc in documentFields" :key="doc.key" class="flex items-center justify-between gap-3">
                <dt class="text-gray-600">{{ $t(doc.label) }}</dt>
                <dd>
                  <a
                    v-if="detailsSchool[doc.key]"
                    :href="documentUrl(detailsSchool[doc.key] as string)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-semibold text-primary-700 hover:underline"
                  >
                    {{ $t('platformSchools.openDocument') }}
                  </a>
                  <span v-else class="text-gray-400">{{ $t('platformSchools.noDocument') }}</span>
                </dd>
              </div>
            </dl>
          </section>

          <section class="rounded-xl border border-gray-200 p-4">
            <h3 class="mb-3 text-sm font-bold text-gray-900">{{ $t('platformSchools.sectionAccount') }}</h3>
            <div v-if="detailsSchool.owner" class="space-y-1.5 text-sm">
              <div class="font-semibold text-gray-900">
                {{ detailsSchool.owner.firstName }} {{ detailsSchool.owner.lastName }}
              </div>
              <div class="text-gray-600" dir="ltr">{{ detailsSchool.owner.email }}</div>
              <div v-if="detailsSchool.owner.phone" class="text-gray-600" dir="ltr">
                {{ detailsSchool.owner.phone }}
              </div>
              <span
                class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1"
                :class="
                  detailsSchool.owner.isActive
                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                    : 'bg-gray-100 text-gray-600 ring-gray-200'
                "
              >
                {{
                  detailsSchool.owner.isActive
                    ? $t('platformSchools.ownerAccountActive')
                    : $t('platformSchools.ownerAccountInactive')
                }}
              </span>
            </div>
            <p v-else class="text-sm text-gray-400">{{ $t('platformSchools.noOwner') }}</p>
          </section>

          <section class="rounded-xl border border-gray-200 p-4">
            <h3 class="mb-3 text-sm font-bold text-gray-900">{{ $t('platformSchools.sectionSummary') }}</h3>
            <dl class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500">{{ $t('platformSchools.colStatus') }}</dt>
                <dd class="font-semibold text-gray-900">{{ detailsSchool.status }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">{{ $t('platformBilling.colPlan') }}</dt>
                <dd class="font-semibold text-gray-900">{{ detailsSchool.planCode || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">{{ $t('platformSchools.colStudents') }}</dt>
                <dd class="font-semibold tabular-nums text-gray-900">{{ detailsSchool.studentCount }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">{{ $t('platformBilling.colSubStatus') }}</dt>
                <dd class="font-semibold text-gray-900">{{ detailsSchool.subscriptionStatus || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">{{ $t('platformSchools.registeredOn') }}</dt>
                <dd class="text-gray-800">{{ formatDate(detailsSchool.created_at) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">{{ $t('platformSchools.lastUpdated') }}</dt>
                <dd class="text-gray-800">{{ formatDate(detailsSchool.updated_at) }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import {
  platformSchoolService,
  type RegisteredSchool,
} from '@/services/platform-school.service'
import {
  platformBillingService,
  type PlatformAddon,
  type PlatformBillingPeriod,
  type PlatformPlan,
  type SchoolSubscriptionBundle,
} from '@/services/platform-billing.service'
import { getApiBaseUrl } from '@/config/public-config'

const { locale, t, te } = useI18n()
const { viewMode, isCards } = useListViewMode()
const isRTL = computed(() => locale.value === 'ar')

const schools = ref<RegisteredSchool[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const statusFilter = ref('all')
const showFilters = ref(false)
const approveBusyId = ref<number | null>(null)

const hasActiveFilters = computed(() =>
  search.value.trim().length > 0 || statusFilter.value !== 'all',
)

function clearFilters() {
  search.value = ''
  statusFilter.value = 'all'
}

const drawerOpen = ref(false)
const drawerLoading = ref(false)
const drawerError = ref('')
const drawerMsg = ref('')
const actionBusy = ref(false)
const selectedSchool = ref<RegisteredSchool | null>(null)
const bundle = ref<SchoolSubscriptionBundle | null>(null)
const catalogPlans = ref<PlatformPlan[]>([])
const catalogAddons = ref<PlatformAddon[]>([])
const periods = ref<PlatformBillingPeriod[]>(['monthly', 'semester', 'yearly', 'summer'])

const form = reactive({
  plan_code: 'standard',
  billing_period: 'monthly' as PlatformBillingPeriod,
  status: 'draft',
  school_status: 'pending' as 'pending' | 'active' | 'suspended' | 'rejected',
  addon_codes: [] as string[],
  notes: '',
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return schools.value.filter((s) => {
    if (statusFilter.value !== 'all' && s.status !== statusFilter.value) return false
    if (!q) return true
    const hay = [
      s.name,
      s.email,
      s.phone,
      s.owner?.email,
      s.owner?.phone,
      s.owner?.firstName,
      s.owner?.lastName,
      s.status,
      s.planCode,
      s.membershipFrom,
      s.membershipTo,
      String(s.id),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

const schoolStats = computed(() => ({
  total: schools.value.length,
  active: schools.value.filter((s) => s.status === 'active').length,
  pending: schools.value.filter((s) => s.status === 'pending').length,
  students: schools.value.reduce((sum, s) => sum + (s.studentCount ?? 0), 0),
}))

function formatDate(value: string) {
  if (!value) return '—'
  try {
    // Date-only membership fields are YYYY-MM-DD; noon avoids TZ day-shift.
    const d = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value)
    return d.toLocaleDateString(locale.value === 'ar' ? 'ar' : 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

function statusLabel(status: string) {
  const key = `platformSchools.status.${status || 'active'}`
  return te(key) ? t(key) : status
}

function invoiceStatusLabel(status: string) {
  const key = `platformBilling.invoiceStatuses.${status}`
  return te(key) ? t(key) : status
}

function statusClass(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
    case 'pending':
      return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
    case 'suspended':
      return 'bg-orange-50 text-orange-800 ring-1 ring-orange-200'
    case 'rejected':
      return 'bg-red-50 text-red-800 ring-1 ring-red-200'
    default:
      return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200'
  }
}

type EditableField =
  | 'name'
  | 'email'
  | 'phone'
  | 'address'
  | 'website'
  | 'description'
  | 'owner_legal_name'

const schoolFields: { key: EditableField; label: string; multiline?: boolean }[] = [
  { key: 'name', label: 'platformSchools.fieldName' },
  { key: 'email', label: 'platformSchools.fieldEmail' },
  { key: 'phone', label: 'platformSchools.fieldPhone' },
  { key: 'website', label: 'platformSchools.fieldWebsite' },
  { key: 'owner_legal_name', label: 'platformSchools.fieldOwnerLegalName' },
  { key: 'address', label: 'platformSchools.fieldAddress', multiline: true },
  { key: 'description', label: 'platformSchools.fieldDescription', multiline: true },
]

const documentFields = [
  { key: 'cr_document_url' as const, label: 'platformSchools.crDocument' },
  { key: 'owner_id_document_url' as const, label: 'platformSchools.ownerIdDocument' },
]

const detailsOpen = ref(false)
const detailsSchool = ref<RegisteredSchool | null>(null)
const detailsError = ref('')
const detailsMsg = ref('')
const detailsSaving = ref(false)
const editing = ref(false)
const editForm = reactive<Record<EditableField, string>>({
  name: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  description: '',
  owner_legal_name: '',
})

/** `description` is not part of the list payload, so read it from the edit buffer instead. */
function detailsValue(key: EditableField): string {
  const school = detailsSchool.value as unknown as Record<string, unknown> | null
  const raw = school?.[key]
  return typeof raw === 'string' ? raw : ''
}

/** Documents are stored as absolute API paths (/api/files/...), so resolve them against the API origin. */
function documentUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  const base = getApiBaseUrl().replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

function openDetails(school: RegisteredSchool) {
  detailsSchool.value = school
  detailsOpen.value = true
  editing.value = false
  detailsError.value = ''
  detailsMsg.value = ''
}

function closeDetails() {
  detailsOpen.value = false
  detailsSchool.value = null
  editing.value = false
}

function startEditing() {
  detailsError.value = ''
  detailsMsg.value = ''
  for (const field of schoolFields) editForm[field.key] = detailsValue(field.key)
  editing.value = true
}

async function saveDetails() {
  const school = detailsSchool.value
  if (!school) return
  if (!editForm.name.trim()) {
    detailsError.value = t('platformSchools.nameRequired')
    return
  }
  detailsSaving.value = true
  detailsError.value = ''
  detailsMsg.value = ''
  try {
    const updated = await platformSchoolService.update(school.id, {
      name: editForm.name.trim(),
      email: editForm.email.trim() || null,
      phone: editForm.phone.trim() || null,
      website: editForm.website.trim() || null,
      address: editForm.address.trim() || null,
      description: editForm.description.trim() || null,
      owner_legal_name: editForm.owner_legal_name.trim() || null,
    })
    detailsSchool.value = updated
    editing.value = false
    detailsMsg.value = t('platformSchools.saved')
    await reloadList()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    const m = ax.response?.data?.message
    detailsError.value = (Array.isArray(m) ? m.join(', ') : m) || ax.message || t('platformBilling.saveError')
  } finally {
    detailsSaving.value = false
  }
}

async function reloadPage() {
  loading.value = true
  error.value = ''
  try {
    await reloadList()
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformSchools.loadError')
  } finally {
    loading.value = false
  }
}

async function reloadList() {
  schools.value = await platformSchoolService.listRegistered()
}

async function approveSchool(school: RegisteredSchool) {
  if (!confirm(t('platformSchools.approveConfirm', { name: school.name }))) return
  approveBusyId.value = school.id
  error.value = ''
  try {
    await platformSchoolService.approve(school.id)
    await reloadList()
  } catch (e: any) {
    error.value = e?.message || t('platformSchools.approveError')
  } finally {
    approveBusyId.value = null
  }
}

async function openBilling(school: RegisteredSchool) {
  selectedSchool.value = school
  drawerOpen.value = true
  drawerLoading.value = true
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    const [catalog, detail] = await Promise.all([
      platformBillingService.listAdminPlans(),
      platformBillingService.getSchoolSubscription(school.id),
    ])
    catalogPlans.value = catalog.plans
    catalogAddons.value = catalog.addons
    if (catalog.billing_periods?.length) periods.value = catalog.billing_periods
    bundle.value = detail
    form.plan_code = detail.subscription?.plan_code || catalog.plans[0]?.code || 'standard'
    form.billing_period =
      (detail.subscription?.billing_period as PlatformBillingPeriod) || 'monthly'
    form.status = detail.subscription?.status || 'draft'
    form.school_status = (detail.school.status as typeof form.school_status) || 'pending'
    form.addon_codes = [...(detail.subscription?.addon_codes || [])]
    form.notes = detail.subscription?.notes || ''
  } catch (e: any) {
    drawerError.value = e?.message || t('platformBilling.loadError')
  } finally {
    drawerLoading.value = false
  }
}

function closeDrawer() {
  drawerOpen.value = false
  selectedSchool.value = null
  bundle.value = null
}

async function saveSubscription() {
  if (!selectedSchool.value) return
  actionBusy.value = true
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    bundle.value = await platformBillingService.upsertSchoolSubscription(selectedSchool.value.id, {
      plan_code: form.plan_code,
      billing_period: form.billing_period,
      status: form.status,
      school_status: form.school_status,
      addon_codes: form.addon_codes,
      notes: form.notes || null,
    })
    drawerMsg.value = t('platformBilling.saved')
    await reloadList()
  } catch (e: any) {
    drawerError.value = e?.message || t('platformBilling.saveError')
  } finally {
    actionBusy.value = false
  }
}

async function issueInvoice() {
  if (!selectedSchool.value) return
  actionBusy.value = true
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    await platformBillingService.issueInvoice(selectedSchool.value.id)
    bundle.value = await platformBillingService.getSchoolSubscription(selectedSchool.value.id)
    drawerMsg.value = t('platformBilling.invoiceIssued')
    await reloadList()
  } catch (e: any) {
    drawerError.value = e?.message || t('platformBilling.saveError')
  } finally {
    actionBusy.value = false
  }
}

async function markPaid(invoiceId: number) {
  if (!selectedSchool.value) return
  actionBusy.value = true
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    await platformBillingService.markInvoicePaid(invoiceId, { activate_school: true })
    bundle.value = await platformBillingService.getSchoolSubscription(selectedSchool.value.id)
    form.school_status = 'active'
    form.status = 'active'
    drawerMsg.value = t('platformBilling.invoicePaid')
    await reloadList()
  } catch (e: any) {
    drawerError.value = e?.message || t('platformBilling.saveError')
  } finally {
    actionBusy.value = false
  }
}

onMounted(reloadPage)
</script>

