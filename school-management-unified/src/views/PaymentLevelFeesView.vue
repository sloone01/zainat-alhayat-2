<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('paymentSettings.levelFeesPageTitle')"
        :subtitle="$t('paymentSettings.levelFeesPageIntro')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('paymentSettings.levelsGridTitle') }}</h2>
            <p class="fk-card__meta">{{ $t('paymentSettings.levelsCount', { count: filteredLevels.length }) }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <FikrToolbarSearch
                v-model="searchQuery"
                id="levels-search"
                :placeholder="$t('paymentSettings.searchLevelsPlaceholder')"
                :aria-label="$t('common.search')"
              />
              <FikrFilterButton
                :expanded="showFilters"
                :count="drawerFilterCount"
                @click="showFilters = true"
              />
              <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="levels.length">
            <p
              v-if="filteredLevels.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('paymentSettings.noLevelFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <KanbanCard
              v-for="lv in paginatedLevels"
              :key="lv.id"
              :title="levelDisplayName(lv)"
              :description="lv.fee_package_name || $t('paymentSettings.noPackageLinkedYet')"
              :muted="!lv.is_active"
            >
              <template #tags>
                <KanbanTag :dot="lv.profile_configured ? 'emerald' : 'amber'">
                  {{ lv.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                </KanbanTag>
                <KanbanTag :dot="lv.is_active ? 'sky' : 'gray'">
                  {{ lv.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                </KanbanTag>
                <KanbanTag dot="navy">{{ lv.code }}</KanbanTag>
              </template>
              <template #actions>
                <RowActionsMenu
                  :open="activeMenuId === lv.id"
                  placement="up"
                  @toggle="toggleMenu(lv.id)"
                >
                  <RowActionsItem icon="edit" @click="openEdit(lv)">
                    {{ lv.profile_configured ? $t('common.edit') : $t('paymentSettings.configureFees') }}
                  </RowActionsItem>
                </RowActionsMenu>
              </template>
            </KanbanCard>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow class="hover:bg-transparent">
                    <TableHead>{{ $t('paymentSettings.levelsGridTitle') }}</TableHead>
                    <TableHead>{{ $t('common.status') }}</TableHead>
                    <TableHead>{{ $t('paymentSettings.feePackageBadge') }}</TableHead>
                    <TableHead class="text-end">{{ $t('common.actions') }}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="lv in paginatedLevels"
                    :key="'list-' + lv.id"
                    :class="!lv.is_active ? 'opacity-75' : ''"
                  >
                    <TableCell>
                      <div class="font-medium text-gray-900">{{ levelDisplayName(lv) }}</div>
                      <div class="mt-0.5 font-mono text-[11px] uppercase text-gray-400">{{ lv.code }}</div>
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-wrap gap-1.5">
                        <span
                          class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="lv.profile_configured ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'"
                        >
                          {{ lv.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                        </span>
                        <span
                          class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="lv.is_active ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'"
                        >
                          {{ lv.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell class="text-gray-700">
                      {{ lv.fee_package_name || $t('paymentSettings.noPackageLinkedYet') }}
                    </TableCell>
                    <TableCell class="text-end">
                      <RowActionsMenu
                        :open="activeMenuId === lv.id"
                        placement="up"
                        @toggle="toggleMenu(lv.id)"
                      >
                        <RowActionsItem icon="edit" @click="openEdit(lv)">
                          {{ lv.profile_configured ? $t('common.edit') : $t('paymentSettings.configureFees') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredLevels.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('paymentSettings.emptyLevels') }}</p>
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
            <label class="fk-flabel" for="levels-config"><span>{{ $t('paymentSettings.configurationFilter') }}</span></label>
            <select
              id="levels-config"
              v-model="configFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('paymentSettings.allConfigurations') }}</option>
              <option value="configured">{{ $t('paymentSettings.profileConfigured') }}</option>
              <option value="not_configured">{{ $t('paymentSettings.profileNotConfigured') }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="levels-status"><span>{{ $t('common.status') }}</span></label>
            <select
              id="levels-status"
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
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import FikrToolbarSearch from '@/components/FikrToolbarSearch.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { authService } from '@/services'
import paymentConfigService, { type SchoolPaymentLevelSummary } from '@/services/payment-config.service'
import FikrLoader from '@/components/FikrLoader.vue'

const { locale, t } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const activeMenuId = ref<string | null>(null)
const showFilters = ref(false)
const searchQuery = ref('')
const configFilter = ref<'all' | 'configured' | 'not_configured'>('all')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

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

function openEdit(lv: SchoolPaymentLevelSummary) {
  closeMenu()
  void router.push(`/settings/payments/level/${lv.id}`)
}

function levelDisplayName(lv: SchoolPaymentLevelSummary) {
  if (isRTL.value && lv.name_ar) return lv.name_ar
  if (!isRTL.value && lv.name_en) return lv.name_en
  return lv.name
}

function levelInitial(lv: SchoolPaymentLevelSummary) {
  const name = levelDisplayName(lv).trim()
  return name ? name.charAt(0) : '?'
}

const schoolId = computed(() => {
  const id = authService.getStoredUser()?.school_id
  return id != null && String(id).trim() !== '' ? String(id) : ''
})

const loading = ref(true)
const flashError = ref('')
const levels = ref<SchoolPaymentLevelSummary[]>([])

const drawerFilterCount = computed(() =>
  Number(configFilter.value !== 'all') + Number(statusFilter.value !== 'all'),
)

const filteredLevels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return levels.value.filter((lv) => {
    if (configFilter.value === 'configured' && !lv.profile_configured) return false
    if (configFilter.value === 'not_configured' && lv.profile_configured) return false
    if (statusFilter.value === 'active' && !lv.is_active) return false
    if (statusFilter.value === 'inactive' && lv.is_active) return false
    if (q) {
      const haystack = `${levelDisplayName(lv)} ${lv.code} ${lv.name}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
})

const {
  currentPage,
  paginatedItems: paginatedLevels,
  totalPages,
  goToPage,
} = useClientPagination(filteredLevels)

watch([searchQuery, statusFilter, configFilter], () => {
  currentPage.value = 1
})

function clearFilters() {
  searchQuery.value = ''
  configFilter.value = 'all'
  statusFilter.value = 'all'
}

async function load() {
  loading.value = true
  flashError.value = ''
  if (!schoolId.value) {
    flashError.value = t('paymentSettings.loadError')
    loading.value = false
    return
  }
  try {
    const lv = await paymentConfigService.listLevelsSummary(schoolId.value)
    levels.value = [...lv].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.loadError')
  } finally {
    loading.value = false
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
