<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('feesV2.presetsTitle')" />

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <div class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-display truncate text-lg font-bold text-navy-800">{{ $t('feesV2.presetsTitle') }}</h2>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading && !routePageLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="total > 0 || hasActiveFilters">
            <p
              v-if="total === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('feesV2.noPlanFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KanbanCard
                v-for="preset in presets"
                :key="preset.id"
                :title="preset.name"
                :description="preset.description"
                :muted="!preset.is_active"
              >
                <template #tags>
                  <KanbanTag :dot="preset.is_active ? 'emerald' : 'gray'">
                    {{ preset.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                  </KanbanTag>
                </template>
                <template #actions>
                  <RowActionsMenu
                    :open="activeMenuId === preset.id"
                    placement="up"
                    @toggle="toggleMenu(preset.id)"
                  >
                    <RowActionsItem icon="edit" @click="openEdit(preset)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem v-if="preset.is_active" icon="payment" @click="openApply(preset)">
                      {{ $t('feesV2.applyPlanToLevel') }}
                    </RowActionsItem>
                    <RowActionsItem
                      :icon="preset.is_active ? 'archive' : 'activate'"
                      @click="onSetActive(preset, !preset.is_active)"
                    >
                      {{ preset.is_active ? $t('paymentSettings.markInactive') : $t('paymentSettings.markActive') }}
                    </RowActionsItem>
                    <RowActionsItem icon="delete" danger @click="onDelete(preset)">
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </template>
                <template #meta>
                  <KanbanMeta icon="money">{{ fmt(presetTotal(preset)) }}</KanbanMeta>
                  <KanbanMeta icon="calendar">{{ preset.entries?.length || 0 }} {{ $t('feesV2.installments') }}</KanbanMeta>
                </template>
              </KanbanCard>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('feesV2.presetName') }}</th>
                    <th class="!text-end">{{ $t('feesV2.advanceAmount') }}</th>
                    <th>{{ $t('feesV2.installments') }}</th>
                    <th class="!text-end">{{ $t('feesV2.total') }}</th>
                    <th>{{ $t('feesV2.inclusions') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th class="!text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="preset in presets" :key="'list-' + preset.id">
                    <td class="font-medium">{{ preset.name }}</td>
                    <td class="text-end font-mono tabular-nums">{{ fmt(preset.advance_amount) }}</td>
                    <td>
                      <span class="font-mono tabular-nums">{{ entryAmountsLabel(preset) }}</span>
                    </td>
                    <td class="text-end font-mono tabular-nums">{{ fmt(presetTotal(preset)) }}</td>
                    <td class="text-fikr-ink-muted">{{ inclusionsLabel(preset) }}</td>
                    <td>
                      <span
                        class="fk-pill"
                        :class="preset.is_active ? 'fk-pill--teal' : 'fk-pill--mist'"
                      >
                        {{ preset.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                      </span>
                    </td>
                    <td>
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === preset.id"
                          placement="up"
                          @toggle="toggleMenu(preset.id)"
                        >
                          <RowActionsItem icon="edit" @click="openEdit(preset)">
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem v-if="preset.is_active" icon="payment" @click="openApply(preset)">
                            {{ $t('feesV2.applyPlanToLevel') }}
                          </RowActionsItem>
                          <RowActionsItem
                            :icon="preset.is_active ? 'archive' : 'activate'"
                            @click="onSetActive(preset, !preset.is_active)"
                          >
                            {{ preset.is_active ? $t('paymentSettings.markInactive') : $t('paymentSettings.markActive') }}
                          </RowActionsItem>
                          <RowActionsItem icon="delete" danger @click="onDelete(preset)">
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
              :show="total > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('feesV2.noPresets') }}</p>
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
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
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
            <label class="fk-flabel" for="presets-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="presets-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="presets-status"><span>{{ $t('common.status') }}</span></label>
            <select id="presets-status" v-model="statusFilter" class="fk-field">
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
      :show="!!applyPreset"
      size="sm"
      compact
      plain-footer
      :title="applyPreset ? `${$t('feesV2.applyPlanToLevel')} — ${applyPreset.name}` : ''"
      @close="closeApply"
    >
      <form class="fk-form" @submit.prevent="submitApply">
        <div class="fk-form__row !mb-0">
          <label class="fk-flabel" for="preset-apply-level"><span>{{ $t('feesV2.feeLevel') }}</span></label>
          <select id="preset-apply-level" v-model="applyLevelId" required class="fk-field">
            <option value="" disabled>{{ $t('feesV2.feeLevel') }}</option>
            <option v-for="lv in feeLevels" :key="lv.id" :value="lv.id">{{ lv.name }}</option>
          </select>
        </div>
      </form>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" :disabled="applying" @click="closeApply">
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          class="fk-btn fk-btn--primary"
          :disabled="applying || !applyLevelId"
          @click="submitApply"
        >
          {{ applying ? $t('common.loading') : $t('feesV2.applyNow') }}
        </button>
      </template>
    </FikrDialog>

    <FikrDialog
      :show="!!blockedPreset"
      plain-footer
      :title="$t('feesV2.planInUseTitle')"
      :subtitle="blockedPreset ? $t('feesV2.planInUseIntro', { name: blockedPreset.name }) : ''"
      @close="closeBlocked"
    >
      <ul class="max-h-60 divide-y divide-fikr-hairline overflow-y-auto">
        <li v-for="(u, i) in blockedUsages" :key="`${u.kind}-${u.id}-${i}`" class="py-2.5 text-sm text-fikr-ink">
          {{ t(`feesV2.planUsage_${u.kind}`, { label: u.label }) }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useFeedback } from '@/composables/useFeedback'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { routePageLoading } from '@/router/route-loading'
import FikrPagination from '@/components/FikrPagination.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useServerPagination } from '@/composables/useServerPagination'
import {
  feesV2Service,
  type InstallmentPlan,
  type InstallmentPlanUsageItem,
} from '@/services/fees-v2.service'
import paymentConfigService, {
  type PaymentCatalogRow,
  type SchoolPaymentLevel,
} from '@/services/payment-config.service'
import { authService } from '@/services'

const { locale, t } = useI18n()
const feedback = useFeedback()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const schoolId = computed(() => {
  const id = authService.getStoredUser()?.school_id
  return id != null && String(id).trim() !== '' ? String(id) : ''
})

const showFilters = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const activeMenuId = ref<string | null>(null)
const flashError = ref('')
const inclusionTypes = ref<PaymentCatalogRow[]>([])
const feeLevels = ref<SchoolPaymentLevel[]>([])
const applyPreset = ref<InstallmentPlan | null>(null)
const applyLevelId = ref('')
const applying = ref(false)
const blockedPreset = ref<{ id: string; name: string } | null>(null)
const blockedUsages = ref<InstallmentPlanUsageItem[]>([])

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim()) || statusFilter.value !== 'all',
)

const {
  items: presets,
  total,
  loading,
  currentPage,
  totalPages,
  goToPage,
  reload,
} = useServerPagination<InstallmentPlan, { q: string; status: string }>(
  (params) => feesV2Service.listInstallmentPlansPage({ ...params, kind: 'preset' }),
  {
    filters: () => ({ q: searchQuery.value, status: statusFilter.value }),
    debounceKeys: ['q'],
    onError: (err) => {
      flashError.value = (err as Error)?.message || t('common.error')
    },
  },
)

function fmt(v: string | number | null | undefined) {
  return Number(v || 0).toFixed(3)
}

function presetTotal(preset: InstallmentPlan) {
  return (
    (Number(preset.advance_amount) || 0) +
    (preset.entries || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  )
}

function entryAmountsLabel(preset: InstallmentPlan) {
  const rows = [...(preset.entries || [])].sort((a, b) => a.sequence - b.sequence)
  return rows.map((e) => Number(e.amount || 0).toFixed(0)).join(' · ') || '—'
}

function inclusionsLabel(preset: InstallmentPlan) {
  const ids = preset.inclusion_type_ids || []
  if (!ids.length) return '—'
  return ids
    .map((id) => inclusionTypes.value.find((it) => it.id === id)?.label)
    .filter(Boolean)
    .join('، ') || '—'
}

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

function openEdit(preset: InstallmentPlan) {
  closeMenu()
  void router.push(`/settings/payments/installment-presets/${preset.id}`)
}

async function openApply(preset: InstallmentPlan) {
  closeMenu()
  applyLevelId.value = ''
  applyPreset.value = preset
  if (!feeLevels.value.length) {
    feeLevels.value = await paymentConfigService
      .listLevels(schoolId.value)
      .then((rows) => rows.filter((lv) => lv.is_active))
      .catch(() => [])
  }
}

function closeApply() {
  if (applying.value) return
  applyPreset.value = null
}

async function submitApply() {
  if (!applyPreset.value || !applyLevelId.value || applying.value) return
  applying.value = true
  try {
    const res = await feesV2Service.applyPlanToLevel({
      installment_plan_id: applyPreset.value.id,
      level_id: applyLevelId.value,
    })
    applyPreset.value = null
    feedback.alert(
      t('feesV2.bulkApplyResult', {
        applied: res.applied,
        total: res.total,
        locked: res.skipped_locked,
        custom: res.skipped_custom,
        failed: res.failed,
      }),
      t('feesV2.applyPlanToLevel'),
    )
  } catch (e: unknown) {
    const err = e as { message?: string; response?: { data?: { message?: string | string[] } } }
    const apiMsg = err?.response?.data?.message
    feedback.error(
      Array.isArray(apiMsg) ? apiMsg.join(', ') : apiMsg || err?.message || t('common.error'),
      t('common.error'),
    )
  } finally {
    applying.value = false
  }
}

async function onSetActive(preset: InstallmentPlan, is_active: boolean) {
  closeMenu()
  try {
    await feesV2Service.saveInstallmentPlan(
      {
        school_id: preset.school_id,
        name: preset.name,
        description: preset.description || undefined,
        is_active,
        advance_amount: preset.advance_amount != null ? Number(preset.advance_amount) : null,
        entries: (preset.entries || []).map((e) => ({
          sequence: e.sequence,
          month_number: e.month_number,
          label: e.label,
          weight: Number(e.weight) || 1,
          amount: e.amount != null ? Number(e.amount) : null,
        })),
      },
      preset.id,
    )
  } finally {
    await reload()
  }
}

function closeBlocked() {
  blockedPreset.value = null
  blockedUsages.value = []
}

async function onDelete(preset: InstallmentPlan) {
  closeMenu()
  flashError.value = ''
  try {
    const usage = await feesV2Service.getInstallmentPlanUsage(preset.id)
    if (usage.in_use) {
      blockedPreset.value = { id: preset.id, name: preset.name }
      blockedUsages.value = usage.usages
      return
    }
    const ok = await feedback.confirm({
      title: t('common.delete'),
      message: t('feesV2.confirmDeletePlan', { name: preset.name }),
      confirmLabel: t('common.delete'),
      danger: true,
    })
    if (!ok) return
    await feesV2Service.deleteInstallmentPlan(preset.id)
    await reload()
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('common.error')
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  inclusionTypes.value = await paymentConfigService.listInclusionTypes(schoolId.value).catch(() => [])
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
