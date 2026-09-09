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
            <router-link to="/platform/schools/new" class="fk-btn fk-btn--primary fk-btn--sm">
              {{ $t('platformSchools.registerCta') }}
            </router-link>
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

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <span class="fk-spinner" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="schools.length && !filtered.length"
            class="fk-empty text-sm text-fikr-ink-soft"
          >
            {{ $t('platformSchools.emptyHint') }}
          </div>

          <div
            v-else-if="filtered.length === 0"
            class="fk-empty"
          >
            <div class="fk-empty__icon">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="fk-empty__title">{{ $t('platformSchools.empty') }}</h3>
            <p class="fk-empty__desc">{{ $t('platformSchools.emptyHint') }}</p>
            <router-link to="/platform/schools/new" class="fk-btn fk-btn--primary fk-btn--sm mt-4">
              {{ $t('platformSchools.registerCta') }}
            </router-link>
          </div>

          <template v-else>
            <div v-if="isCards" class="fk-grid">
              <article
                v-for="(school, index) in filtered"
                :key="school.id"
                class="fk-item"
              >
                <div class="fk-item__body flex items-start gap-3">
                  <img
                    v-if="school.logo_url"
                    :src="school.logo_url"
                    alt=""
                    class="h-11 w-11 shrink-0 rounded-full border border-fikr-hairline object-cover"
                  >
                  <span
                    v-else
                    class="fk-monogram fk-monogram--navy text-xs"
                  >{{ school.name.charAt(0) }}</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-sm font-semibold text-fikr-ink">{{ school.name }}</h3>
                        <p
                          class="mt-0.5 truncate text-xs text-fikr-ink-soft"
                          dir="ltr"
                        >
                          {{ submittedEmail(school) || $t('platformSchools.notProvided') }}
                        </p>
                      </div>
                      <RowActionsMenu
                        :open="activeMenuId === school.id"
                        :placement="index < 3 ? 'down' : 'up'"
                        @toggle="toggleMenu(school.id)"
                      >
                        <RowActionsItem icon="view" @click="onOpenDetails(school)">
                          {{ $t('platformSchools.detailsNav') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canManageSchool"
                          icon="settings"
                          @click="onOpenBilling(school)"
                        >
                          {{ $t('platformBilling.manage') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-1.5">
                      <span class="fk-chip" :class="statusChipClass(school.status)">
                        {{ statusLabel(school.status) }}
                      </span>
                    </div>
                  </div>
                </div>
                <dl class="fk-item__stats">
                  <div class="min-w-0">
                    <dt>{{ $t('platformBilling.colPlan') }}</dt>
                    <dd class="capitalize">{{ school.planCode || '—' }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt>{{ $t('platformSchools.colStudents') }}</dt>
                    <dd>{{ school.studentCount }}</dd>
                  </div>
                  <div class="col-span-2 min-w-0">
                    <dt>{{ $t('platformSchools.membership') }}</dt>
                    <dd>{{ formatDate(school.membershipFrom || '') }} → {{ formatDate(school.membershipTo || '') }}</dd>
                  </div>
                </dl>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('platformSchools.colSchool') }}</th>
                    <th>{{ $t('platformSchools.submittedEmail') }}</th>
                    <th>{{ $t('platformSchools.colStatus') }}</th>
                    <th>{{ $t('platformBilling.colPlan') }}</th>
                    <th>{{ $t('platformSchools.colStudents') }}</th>
                    <th>{{ $t('platformSchools.colRegistered') }}</th>
                    <th class="text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(school, index) in filtered"
                    :key="school.id"
                    class="hover:bg-fikr-pearl"
                  >
                    <td>
                      <div class="flex items-center gap-3">
                        <img
                          v-if="school.logo_url"
                          :src="school.logo_url"
                          alt=""
                          class="h-10 w-10 shrink-0 rounded-full border border-fikr-hairline object-cover"
                        >
                        <span
                          v-else
                          class="fk-monogram fk-monogram--navy text-xs"
                        >{{ school.name.charAt(0) }}</span>
                        <div class="min-w-0">
                          <div class="font-medium text-fikr-ink">{{ school.name }}</div>
                          <div class="mt-0.5 text-xs text-fikr-ink-soft">#{{ school.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        v-if="submittedEmail(school)"
                        class="block max-w-[16rem] truncate text-fikr-ink"
                        dir="ltr"
                      >{{ submittedEmail(school) }}</span>
                      <span v-else class="text-fikr-ink-soft">{{ $t('platformSchools.notProvided') }}</span>
                    </td>
                    <td>
                      <span class="fk-chip" :class="statusChipClass(school.status)">
                        {{ statusLabel(school.status) }}
                      </span>
                    </td>
                    <td class="capitalize">{{ school.planCode || '—' }}</td>
                    <td class="tabular-nums font-medium">{{ school.studentCount }}</td>
                    <td class="whitespace-nowrap">{{ formatDate(school.created_at) }}</td>
                    <td class="text-end">
                      <RowActionsMenu
                        :open="activeMenuId === school.id"
                        :placement="index < 2 ? 'down' : 'up'"
                        @toggle="toggleMenu(school.id)"
                      >
                        <RowActionsItem icon="view" @click="onOpenDetails(school)">
                          {{ $t('platformSchools.detailsNav') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canManageSchool"
                          icon="settings"
                          @click="onOpenBilling(school)"
                        >
                          {{ $t('platformBilling.manage') }}
                        </RowActionsItem>
                      </RowActionsMenu>
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
              <option value="pending_payment">{{ $t('platformSchools.status.pending_payment') }}</option>
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
                  <option value="pending_payment">{{ $t('platformSchools.status.pending_payment') }}</option>
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
                        #{{ shortInvoiceId(inv.id) }} · {{ inv.total_amount }} OMR
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ inv.period_start }} → {{ inv.period_end }} ·
                        {{ invoiceStatusLabel(inv.status) }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ $t('platformBilling.students') }}: {{ inv.seats_used }}/{{ inv.seats_included }}
                      </div>
                      <div
                        v-if="inv.status === 'paid' && (inv.paid_amount != null || inv.paid_receipt_url)"
                        class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600"
                      >
                        <span v-if="inv.paid_amount != null">
                          {{ $t('platformBilling.paidAmount') }}: {{ inv.paid_amount }} OMR
                        </span>
                        <button
                          v-if="inv.paid_receipt_url"
                          type="button"
                          class="font-medium text-primary-700 hover:underline disabled:opacity-50"
                          :disabled="openingReceiptId === inv.id"
                          @click="openReceipt(inv)"
                        >
                          {{ $t('platformBilling.openReceipt') }}
                        </button>
                      </div>
                    </div>
                    <button
                      v-if="inv.status === 'issued' || inv.status === 'draft'"
                      type="button"
                      class="shrink-0 text-xs font-medium text-primary-700 hover:underline disabled:opacity-50"
                      :disabled="actionBusy"
                      @click="openMarkPaid(inv)"
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

    <FikrDialog
      :show="markPaidOpen"
      :title="$t('platformBilling.markPaidDialogTitle')"
      :subtitle="$t('platformBilling.markPaidDialogSubtitle')"
      plain-footer
      @close="closeMarkPaid"
    >
      <div class="space-y-3">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600" for="mark-paid-amount">
            {{ $t('platformBilling.paidAmount') }}
          </label>
          <input
            id="mark-paid-amount"
            v-model.number="markPaidForm.paid_amount"
            type="number"
            min="0"
            step="0.001"
            class="fk-field w-full"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600" for="mark-paid-note">
            {{ $t('platformBilling.paidNote') }}
          </label>
          <textarea
            id="mark-paid-note"
            v-model="markPaidForm.paid_note"
            rows="2"
            class="fk-field w-full"
            :placeholder="$t('platformBilling.paidNotePlaceholder')"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600" for="mark-paid-receipt">
            {{ $t('platformBilling.receipt') }}
          </label>
          <input
            id="mark-paid-receipt"
            ref="receiptInputRef"
            type="file"
            accept="image/*,application/pdf"
            class="block w-full text-sm text-gray-600 file:me-3 file:rounded-md file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-800"
            @change="onReceiptFileChange"
          />
          <p class="mt-1 text-xs text-gray-500">{{ $t('platformBilling.receiptHint') }}</p>
        </div>
        <p v-if="markPaidError" class="text-sm text-red-600">{{ markPaidError }}</p>
      </div>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" :disabled="actionBusy" @click="closeMarkPaid">
          {{ $t('common.cancel') }}
        </button>
        <button type="button" class="fk-btn fk-btn--primary" :disabled="actionBusy" @click="confirmMarkPaid">
          {{ actionBusy ? $t('platformBilling.markingPaid') : $t('platformBilling.confirmMarkPaid') }}
        </button>
      </template>
    </FikrDialog>
    <!-- Billing drawer only (registration details are a separate page) -->
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useClaims } from '@/composables/useClaims'
import { setSelectedPlatformSchoolId } from '@/composables/usePlatformSchoolSelection'
import {
  platformSchoolService,
  type RegisteredSchool,
} from '@/services/platform-school.service'
import {
  platformBillingService,
  type PlatformAddon,
  type PlatformBillingPeriod,
  type PlatformInvoice,
  type PlatformPlan,
  type SchoolSubscriptionBundle,
} from '@/services/platform-billing.service'

const { locale, t, te } = useI18n()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()
const { hasClaim } = useClaims()
const isRTL = computed(() => locale.value === 'ar')
const canManageSchool = computed(
  () => hasClaim('platform_schools', 'manage') || hasClaim('platform_schools', 'edit'),
)

const schools = ref<RegisteredSchool[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const statusFilter = ref('all')
const showFilters = ref(false)
const activeMenuId = ref<string | null>(null)

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
  school_status: 'pending' as 'pending' | 'pending_payment' | 'active' | 'suspended' | 'rejected',
  addon_codes: [] as string[],
  notes: '',
})

const markPaidOpen = ref(false)
const markPaidError = ref('')
const markPaidInvoice = ref<PlatformInvoice | null>(null)
const markPaidForm = reactive({
  paid_amount: 0 as number,
  paid_note: '',
})
const receiptFile = ref<File | null>(null)
const receiptInputRef = ref<HTMLInputElement | null>(null)
const openingReceiptId = ref<string | null>(null)

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

function shortInvoiceId(id: string) {
  return String(id || '').slice(0, 8)
}

function statusChipClass(status: string) {
  switch (status) {
    case 'active':
      return 'fk-chip--green'
    case 'pending':
    case 'pending_payment':
      return 'fk-chip--amber'
    case 'suspended':
      return 'fk-chip--navy'
    case 'rejected':
      return 'fk-chip--red'
    default:
      return 'fk-chip--neutral'
  }
}

function submittedEmail(school: RegisteredSchool) {
  return (school.owner?.email || school.email || '').trim()
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function handleClickOutside() {
  activeMenuId.value = null
}

function onOpenDetails(school: RegisteredSchool) {
  activeMenuId.value = null
  setSelectedPlatformSchoolId(school.id)
  void router.push({ name: 'platform-school-registration', state: { schoolId: school.id } })
}

function onOpenBilling(school: RegisteredSchool) {
  activeMenuId.value = null
  void openBilling(school)
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

function openMarkPaid(inv: PlatformInvoice) {
  markPaidInvoice.value = inv
  markPaidForm.paid_amount = Number(inv.total_amount) || 0
  markPaidForm.paid_note = ''
  receiptFile.value = null
  markPaidError.value = ''
  if (receiptInputRef.value) receiptInputRef.value.value = ''
  markPaidOpen.value = true
}

function closeMarkPaid() {
  if (actionBusy.value) return
  markPaidOpen.value = false
  markPaidInvoice.value = null
  markPaidError.value = ''
  receiptFile.value = null
}

function onReceiptFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  receiptFile.value = input.files?.[0] || null
}

async function confirmMarkPaid() {
  if (!selectedSchool.value || !markPaidInvoice.value) return
  const amount = Number(markPaidForm.paid_amount)
  if (!Number.isFinite(amount) || amount < 0) {
    markPaidError.value = t('platformBilling.paidAmountInvalid')
    return
  }
  actionBusy.value = true
  markPaidError.value = ''
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    const fd = new FormData()
    fd.append('paid_amount', String(amount))
    fd.append('activate_school', 'true')
    if (markPaidForm.paid_note.trim()) {
      fd.append('paid_note', markPaidForm.paid_note.trim())
    }
    if (receiptFile.value) {
      fd.append('receipt', receiptFile.value)
    }
    await platformBillingService.markInvoicePaid(markPaidInvoice.value.id, fd)
    markPaidOpen.value = false
    markPaidInvoice.value = null
    receiptFile.value = null
    bundle.value = await platformBillingService.getSchoolSubscription(selectedSchool.value.id)
    form.school_status = 'active'
    form.status = 'active'
    drawerMsg.value = t('platformBilling.invoicePaid')
    await reloadList()
  } catch (e: any) {
    markPaidError.value = e?.message || t('platformBilling.saveError')
  } finally {
    actionBusy.value = false
  }
}

async function openReceipt(inv: PlatformInvoice) {
  if (!inv.paid_receipt_url) return
  openingReceiptId.value = inv.id
  drawerError.value = ''
  try {
    const path = inv.paid_receipt_url
    if (/^https?:\/\//i.test(path)) {
      window.open(path, '_blank', 'noopener')
      return
    }
    const url = await platformSchoolService.fetchDocument(path)
    const opened = window.open(url, '_blank', 'noopener')
    if (!opened) drawerError.value = t('platformSchools.popupBlocked')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch {
    drawerError.value = t('platformBilling.receiptOpenFailed')
  } finally {
    openingReceiptId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void reloadPage()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

