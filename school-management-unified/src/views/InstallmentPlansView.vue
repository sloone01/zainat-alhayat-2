<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('feesV2.installmentPlansTitle')"
        :subtitle="$t('feesV2.installmentPlansSubtitle')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('feesV2.installmentPlansTitle') }}</h2>
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
              <router-link
                to="/settings/payments/installment-plans/new"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="$t('feesV2.newPlan')"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </router-link>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="plans.length">
            <p
              v-if="filteredPlans.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('feesV2.noPlanFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="plan in paginatedPlans"
                :key="plan.id"
                class="relative rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                :class="!plan.is_active ? 'opacity-75' : ''"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                  aria-hidden="true"
                />
                <div class="flex items-center gap-3 p-5">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900">{{ plan.name }}</h3>
                    <p v-if="plan.description" class="mt-0.5 line-clamp-2 text-xs text-gray-500">{{ plan.description }}</p>
                  </div>
                  <span class="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                    {{ plan.entries?.length || 0 }} {{ $t('feesV2.installments') }}
                  </span>
                  <span
                    class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="plan.is_active ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ plan.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                  </span>
                  <RowActionsMenu
                    :open="activeMenuId === plan.id"
                    placement="up"
                    @toggle="toggleMenu(plan.id)"
                  >
                    <RowActionsItem icon="edit" @click="openEdit(plan)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem
                      :icon="plan.is_active ? 'archive' : 'activate'"
                      @click="onSetActive(plan, !plan.is_active)"
                    >
                      {{ plan.is_active ? $t('paymentSettings.markInactive') : $t('paymentSettings.markActive') }}
                    </RowActionsItem>
                    <RowActionsItem icon="delete" danger @click="onDelete(plan)">
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </div>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.planName') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.planDescription') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.installments') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="plan in paginatedPlans" :key="'list-' + plan.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ plan.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ plan.description || '—' }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-600">{{ plan.entries?.length || 0 }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        :class="plan.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'"
                      >
                        {{ plan.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === plan.id"
                          placement="up"
                          @toggle="toggleMenu(plan.id)"
                        >
                          <RowActionsItem icon="edit" @click="openEdit(plan)">
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem
                            :icon="plan.is_active ? 'archive' : 'activate'"
                            @click="onSetActive(plan, !plan.is_active)"
                          >
                            {{ plan.is_active ? $t('paymentSettings.markInactive') : $t('paymentSettings.markActive') }}
                          </RowActionsItem>
                          <RowActionsItem icon="delete" danger @click="onDelete(plan)">
                            {{ $t('common.delete') }}
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
              :show="filteredPlans.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('feesV2.noInstallmentPlans') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('paymentSettings.filtersTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside
        class="fk-drawer"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('paymentSettings.filtersTitle') }}</h3>
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
              :placeholder="$t('feesV2.searchPlansPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="plans-status"><span>{{ $t('common.status') }}</span></label>
            <select
              id="plans-status"
              v-model="statusFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('paymentSettings.allStatuses') }}</option>
              <option value="active">{{ $t('paymentSettings.active') }}</option>
              <option value="inactive">{{ $t('paymentSettings.inactive') }}</option>
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
      :show="!!blockedPlan"
      plain-footer
      :title="$t('feesV2.planInUseTitle')"
      :subtitle="blockedPlan ? $t('feesV2.planInUseIntro', { name: blockedPlan.name }) : ''"
      @close="closeBlocked"
    >
      <ul class="max-h-60 divide-y divide-fikr-hairline overflow-y-auto">
        <li v-for="(u, i) in blockedUsages" :key="`${u.kind}-${u.id}-${i}`" class="py-2.5 text-sm text-fikr-ink">
          {{ usageLabel(u) }}
        </li>
      </ul>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--primary" @click="closeBlocked">
          {{ $t('common.close') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import {
  feesV2Service,
  type InstallmentPlan,
  type InstallmentPlanUsageItem,
} from '@/services/fees-v2.service'
import { authService } from '@/services'

const { locale, t } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const showFilters = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const activeMenuId = ref<string | null>(null)
const schoolId = computed(() => {
  const id = authService.getStoredUser()?.school_id
  return id != null && String(id).trim() !== '' ? String(id) : ''
})

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim()) || statusFilter.value !== 'all',
)

const filteredPlans = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return plans.value.filter((plan) => {
    if (statusFilter.value === 'active' && !plan.is_active) return false
    if (statusFilter.value === 'inactive' && plan.is_active) return false
    if (q && !`${plan.name} ${plan.description || ''}`.toLowerCase().includes(q)) return false
    return true
  })
})

const {
  currentPage,
  paginatedItems: paginatedPlans,
  totalPages,
  goToPage,
} = useClientPagination(filteredPlans)

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenu() {
  activeMenuId.value = null
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    closeMenu()
  }
}

function openEdit(plan: InstallmentPlan) {
  closeMenu()
  void router.push(`/settings/payments/installment-plans/${plan.id}`)
}

const loading = ref(false)
const flashError = ref('')
const deletingId = ref<string | null>(null)
const plans = ref<InstallmentPlan[]>([])
const blockedPlan = ref<{ id: string; name: string } | null>(null)
const blockedUsages = ref<InstallmentPlanUsageItem[]>([])

function usageLabel(u: InstallmentPlanUsageItem) {
  const key = `feesV2.planUsage_${u.kind}` as const
  return t(key, { label: u.label })
}

function closeBlocked() {
  blockedPlan.value = null
  blockedUsages.value = []
}

function extractUsagesFromError(e: unknown): InstallmentPlanUsageItem[] | null {
  const err = e as {
    response?: { data?: { code?: string; usages?: InstallmentPlanUsageItem[]; message?: unknown } }
  }
  const data = err?.response?.data
  if (!data) return null
  const payload =
    typeof data.message === 'object' && data.message !== null
      ? (data.message as { code?: string; usages?: InstallmentPlanUsageItem[] })
      : data
  if (payload?.code === 'INSTALLMENT_PLAN_IN_USE' && Array.isArray(payload.usages)) {
    return payload.usages
  }
  return null
}

async function load() {
  loading.value = true
  flashError.value = ''
  try {
    plans.value = await feesV2Service.listInstallmentPlans(schoolId.value)
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('common.error')
  } finally {
    loading.value = false
  }
}

async function onSetActive(plan: InstallmentPlan, is_active: boolean) {
  closeMenu()
  try {
    const updated = await feesV2Service.saveInstallmentPlan(
      {
        school_id: plan.school_id,
        name: plan.name,
        description: plan.description || undefined,
        is_active,
        entries: (plan.entries || []).map((e) => ({
          sequence: e.sequence,
          month_number: e.month_number,
          label: e.label,
          weight: typeof e.weight === 'string' ? Number(e.weight) : e.weight,
        })),
      },
      plan.id,
    )
    const i = plans.value.findIndex((x) => x.id === plan.id)
    if (i !== -1) plans.value[i] = updated
  } catch {
    await load()
  }
}

async function onDelete(plan: InstallmentPlan) {
  closeMenu()
  await tryDelete(plan)
}

async function tryDelete(plan: { id: string; name: string }) {
  flashError.value = ''
  deletingId.value = plan.id
  try {
    const usage = await feesV2Service.getInstallmentPlanUsage(plan.id)
    if (usage.in_use) {
      blockedPlan.value = { id: plan.id, name: plan.name }
      blockedUsages.value = usage.usages
      return
    }

    const ok = window.confirm(t('feesV2.confirmDeletePlan', { name: plan.name }))
    if (!ok) return

    await feesV2Service.deleteInstallmentPlan(plan.id)
    await load()
  } catch (e: unknown) {
    const usages = extractUsagesFromError(e)
    if (usages) {
      blockedPlan.value = { id: plan.id, name: plan.name }
      blockedUsages.value = usages
    } else {
      flashError.value = (e as Error)?.message || t('common.error')
    }
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void load()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
