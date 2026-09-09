<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('platformBilling.plansTitle')"
        :subtitle="$t('platformBilling.plansIntroModules')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ error }}</span>
          <button type="button" class="font-semibold underline" @click="load">
            {{ $t('platformBilling.tryAgain') }}
          </button>
        </div>
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('platformBilling.plansListHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('platformBilling.plansCount', { count: filteredPlans.length }) }}
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
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('platformBilling.newPlan')"
              @click="openCreate"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        <div v-if="!loading && plans.length" class="grid grid-cols-2 gap-3 border-b border-fikr-hairline px-5 py-4 sm:grid-cols-3 sm:px-6">
          <div class="fk-stat">
            <div class="fk-stat__label">{{ $t('platformBilling.plansStats.total') }}</div>
            <div class="fk-stat__value text-lg sm:text-2xl">{{ planStats.total }}</div>
          </div>
          <div class="fk-stat">
            <div class="fk-stat__label">{{ $t('platformBilling.plansStats.active') }}</div>
            <div class="fk-stat__value text-lg sm:text-2xl">{{ planStats.active }}</div>
          </div>
          <div class="fk-stat col-span-2 sm:col-span-1">
            <div class="fk-stat__label">{{ $t('platformBilling.plansStats.maxSeats') }}</div>
            <div class="fk-stat__value text-lg sm:text-2xl">{{ planStats.seats }}</div>
          </div>
        </div>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <span class="fk-spinner" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="plans.length && !filteredPlans.length"
            class="fk-empty text-sm text-fikr-ink-soft"
          >
            {{ $t('platformBilling.noPlanFilterResults') }}
          </div>

          <template v-else-if="filteredPlans.length">
            <div v-if="isCards" class="fk-grid">
              <article
                v-for="plan in filteredPlans"
                :key="plan.code"
                class="fk-item"
                :class="!plan.is_active ? 'opacity-75' : ''"
              >
                <div class="fk-item__body flex items-start gap-3">
                  <span class="fk-monogram fk-monogram--navy text-xs">{{ planInitial(plan) }}</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-sm font-semibold text-fikr-ink">{{ planDisplayName(plan) }}</h3>
                        <p class="mt-0.5 truncate font-mono text-[11px] text-fikr-ink-soft" dir="ltr">{{ plan.code }}</p>
                      </div>
                      <RowActionsMenu
                        :open="activeMenuId === plan.code"
                        placement="up"
                        @toggle="toggleMenu(plan.code)"
                      >
                        <RowActionsItem icon="edit" @click="onEdit(plan)">
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem icon="delete" danger @click="onDelete(plan)">
                          {{ $t('common.delete') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </div>
                    <p v-if="planDisplayDesc(plan)" class="mt-1 line-clamp-2 text-xs text-fikr-ink-soft">
                      {{ planDisplayDesc(plan) }}
                    </p>
                    <div class="mt-2 flex flex-wrap gap-1.5">
                      <span class="fk-chip" :class="plan.is_active ? 'fk-chip--green' : 'fk-chip--neutral'">
                        {{ plan.is_active ? $t('platformBilling.planActive') : $t('platformBilling.planInactive') }}
                      </span>
                      <span class="fk-chip fk-chip--outline font-mono" dir="ltr">{{ plan.code }}</span>
                    </div>
                  </div>
                </div>
                <dl class="fk-item__stats">
                  <div class="min-w-0">
                    <dt>{{ $t('platformBilling.seatsIncluded') }}</dt>
                    <dd>{{ plan.included_student_seats }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt>{{ $t('platformBilling.modules') }}</dt>
                    <dd>{{ moduleCount(plan) }}</dd>
                  </div>
                  <div
                    v-for="period in summaryPeriods"
                    :key="period"
                    class="min-w-0"
                  >
                    <dt>{{ $t(`platformBilling.periods.${period}`) }}</dt>
                    <dd>{{ priceOf(plan, period) }}</dd>
                  </div>
                </dl>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('platformBilling.colPlan') }}</th>
                    <th
                      v-for="period in periods"
                      :key="period"
                    >
                      {{ $t(`platformBilling.periods.${period}`) }}
                    </th>
                    <th>{{ $t('platformBilling.seatsIncluded') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th class="text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="plan in filteredPlans"
                    :key="plan.code"
                    class="hover:bg-fikr-pearl"
                    :class="!plan.is_active ? 'opacity-70' : ''"
                  >
                    <td>
                      <div class="flex items-center gap-3">
                        <span class="fk-monogram fk-monogram--navy text-xs">{{ planInitial(plan) }}</span>
                        <div class="min-w-0">
                          <div class="font-medium text-fikr-ink">{{ planDisplayName(plan) }}</div>
                          <div class="mt-0.5 font-mono text-xs text-fikr-ink-soft" dir="ltr">{{ plan.code }}</div>
                        </div>
                      </div>
                    </td>
                    <td
                      v-for="period in periods"
                      :key="period"
                      class="tabular-nums text-fikr-ink"
                    >
                      {{ priceOf(plan, period) }}
                    </td>
                    <td class="tabular-nums font-medium text-fikr-ink">
                      {{ plan.included_student_seats }}
                    </td>
                    <td>
                      <span class="fk-chip" :class="plan.is_active ? 'fk-chip--green' : 'fk-chip--neutral'">
                        {{ plan.is_active ? $t('platformBilling.planActive') : $t('platformBilling.planInactive') }}
                      </span>
                    </td>
                    <td class="text-end">
                      <RowActionsMenu
                        :open="activeMenuId === plan.code"
                        placement="up"
                        @toggle="toggleMenu(plan.code)"
                      >
                        <RowActionsItem icon="edit" @click="onEdit(plan)">
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem icon="delete" danger @click="onDelete(plan)">
                          {{ $t('common.delete') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="fk-empty">
            <div class="fk-empty__icon">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="fk-empty__title">{{ $t('platformBilling.plansEmpty') }}</h3>
            <p class="fk-empty__desc">{{ $t('platformBilling.plansEmptyHint') }}</p>
            <button type="button" class="fk-btn fk-btn--primary mt-5" @click="openCreate">
              {{ $t('platformBilling.newPlan') }}
            </button>
          </div>
        </div>
      </section>

      <div
        v-if="showFilters"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('platformBilling.plansFiltersTitle')"
      >
        <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
        <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
          <div class="fk-drawer__header items-start">
            <div>
              <h3 class="fk-form__title">{{ $t('platformBilling.plansFiltersTitle') }}</h3>
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
              <label class="fk-flabel" for="plans-search"><span>{{ $t('common.search') }}</span></label>
              <input
                id="plans-search"
                v-model="searchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('platformBilling.searchPlansPlaceholder')"
              >
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="plans-status"><span>{{ $t('common.status') }}</span></label>
              <select id="plans-status" v-model="statusFilter" class="fk-field">
                <option value="all">{{ $t('settings.allStatuses') }}</option>
                <option value="active">{{ $t('platformBilling.planActive') }}</option>
                <option value="inactive">{{ $t('platformBilling.planInactive') }}</option>
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
        :show="createOpen"
        :title="$t('platformBilling.newPlanTitle')"
        :subtitle="$t('platformBilling.newPlanHint')"
        size="lg"
        plain-footer
        @close="closeCreate"
      >
        <p v-if="createError" class="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ createError }}
        </p>

        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="plan-code">
                {{ $t('platformBilling.planCode') }}
              </label>
              <input id="plan-code" v-model="createForm.code" type="text" class="fk-field" dir="ltr" placeholder="premium" />
              <p class="mt-1 text-xs text-gray-400">{{ $t('platformBilling.planCodeHint') }}</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="plan-name-ar">
                {{ $t('platformBilling.planNameAr') }}
              </label>
              <input id="plan-name-ar" v-model="createForm.name_ar" type="text" class="fk-field" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="plan-name-en">
                {{ $t('platformBilling.planNameEn') }}
              </label>
              <input id="plan-name-en" v-model="createForm.name_en" type="text" class="fk-field" dir="ltr" />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="plan-seats">
                {{ $t('platformBilling.seats') }}
              </label>
              <input id="plan-seats" v-model.number="createForm.included_student_seats" type="number" min="0" class="fk-field" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="plan-overage">
                {{ $t('platformBilling.overage') }}
              </label>
              <input id="plan-overage" v-model.number="createForm.overage_per_student_omr" type="number" min="0" step="0.1" class="fk-field" />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('platformBilling.prices') }}</label>
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div v-for="period in periods" :key="period">
                <span class="mb-1 block text-xs text-gray-500">{{ $t('platformBilling.periods.' + period) }}</span>
                <input v-model.number="createForm.prices[period]" type="number" min="0" step="1" class="fk-field" />
              </div>
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('platformBilling.modules') }}</label>
            <div class="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-gray-200 p-2">
              <label v-for="mod in allModules" :key="mod.code" class="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  :value="mod.code"
                  v-model="createForm.module_codes"
                />
                <span>{{ locale === 'ar' ? mod.name_ar : mod.name_en }}</span>
              </label>
            </div>
          </div>
        </div>

        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="closeCreate">
            {{ $t('common.cancel') }}
          </button>
          <button type="button" class="fk-btn fk-btn--primary" :disabled="creating" @click="submitCreate">
            {{ creating ? $t('platformSchools.saving') : $t('platformBilling.createPlan') }}
          </button>
        </template>
      </FikrDialog>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import {
  platformBillingService,
  type PlatformBillingPeriod,
  type PlatformModule,
  type PlatformPlan,
} from '@/services/platform-billing.service'

const { locale, t } = useI18n()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const plans = ref<PlatformPlan[]>([])
const periods = ref<PlatformBillingPeriod[]>(['monthly', 'semester', 'yearly', 'summer'])
const summaryPeriods = computed(() =>
  periods.value.filter((p) => p === 'monthly' || p === 'yearly'),
)

const activeMenuId = ref<string | null>(null)
const showFilters = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const hasActiveFilters = computed(
  () => searchQuery.value.trim().length > 0 || statusFilter.value !== 'all',
)

const filteredPlans = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return plans.value.filter((plan) => {
    if (statusFilter.value === 'active' && !plan.is_active) return false
    if (statusFilter.value === 'inactive' && plan.is_active) return false
    if (!q) return true
    return [plan.name_ar, plan.name_en, plan.code, plan.description_ar, plan.description_en]
      .some((value) => (value || '').toLowerCase().includes(q))
  })
})

const planStats = computed(() => ({
  total: plans.value.length,
  active: plans.value.filter((p) => p.is_active).length,
  seats: plans.value.reduce((max, p) => Math.max(max, p.included_student_seats), 0),
}))

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

function toggleMenu(code: string) {
  activeMenuId.value = activeMenuId.value === code ? null : code
}

function handleClickOutside() {
  activeMenuId.value = null
}

function planDisplayName(plan: PlatformPlan) {
  return locale.value === 'ar' ? plan.name_ar : plan.name_en
}

function planDisplayDesc(plan: PlatformPlan) {
  const desc = locale.value === 'ar' ? plan.description_ar : plan.description_en
  return desc || ''
}

function planInitial(plan: PlatformPlan) {
  return (plan.code || planDisplayName(plan) || '?').slice(0, 2).toUpperCase()
}

function moduleCount(plan: PlatformPlan) {
  return plan.module_codes?.length ?? 0
}

function priceOf(plan: PlatformPlan, period: PlatformBillingPeriod) {
  const row = plan.prices?.find((p) => p.billing_period === period)
  if (!row) return '—'
  return `${Number(row.amount_omr).toFixed(3)} OMR`
}

function onEdit(plan: PlatformPlan) {
  activeMenuId.value = null
  router.push(`/platform/plans/${plan.code}`)
}

async function onDelete(plan: PlatformPlan) {
  activeMenuId.value = null
  if (!window.confirm(t('platformBilling.confirmDeletePlan', { name: planDisplayName(plan) }))) {
    return
  }
  try {
    await platformBillingService.deletePlan(plan.code)
    await load()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = ax.response?.data?.message || ax.message || t('platformBilling.saveError')
  }
}

const allModules = ref<PlatformModule[]>([])
const createOpen = ref(false)
const creating = ref(false)
const createError = ref('')
const emptyCreateForm = () => ({
  code: '',
  name_ar: '',
  name_en: '',
  included_student_seats: 50,
  overage_per_student_omr: 0,
  module_codes: [] as string[],
  prices: {} as Record<string, number | null>,
})
const createForm = ref(emptyCreateForm())

function openCreate() {
  createForm.value = emptyCreateForm()
  createError.value = ''
  createOpen.value = true
}

function closeCreate() {
  createOpen.value = false
}

async function submitCreate() {
  const f = createForm.value
  if (!f.code.trim() || !f.name_ar.trim() || !f.name_en.trim()) {
    createError.value = t('platformBilling.planFieldsRequired')
    return
  }
  creating.value = true
  createError.value = ''
  try {
    await platformBillingService.createPlan({
      code: f.code.trim().toLowerCase(),
      name_en: f.name_en.trim(),
      name_ar: f.name_ar.trim(),
      included_student_seats: f.included_student_seats || 0,
      overage_per_student_omr: f.overage_per_student_omr || 0,
      module_codes: f.module_codes,
      prices: Object.entries(f.prices)
        .filter(([, v]) => v != null && Number(v) >= 0 && String(v) !== '')
        .map(([billing_period, amount_omr]) => ({
          billing_period: billing_period as PlatformBillingPeriod,
          amount_omr: Number(amount_omr),
        })),
    })
    createOpen.value = false
    await load()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string } }; message?: string }
    createError.value = ax.response?.data?.message || ax.message || t('platformBilling.saveError')
  } finally {
    creating.value = false
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [catalog, mods] = await Promise.all([
      platformBillingService.listAdminPlans(),
      platformBillingService.listModules(),
    ])
    plans.value = catalog.plans
    allModules.value = mods.modules
    if (catalog.billing_periods?.length) periods.value = catalog.billing_periods
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformBilling.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  load()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
