<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('systemSettings.inclusionItemsLines')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('paymentSettings.inclusionItemsListHeading') }}</h2>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <FikrFilterButton
                :expanded="showFilters"
                :count="hasActiveFilters ? 1 : 0"
                @click="showFilters = true"
              />
              <ListViewModeToggle v-model="viewMode" />
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="$t('paymentSettings.addInclusionItem')"
                @click="openCreate"
              >
                <IconPlus />
              </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading && !routePageLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="rows.length">
            <p
              v-if="filteredRows.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('paymentSettings.noInclusionFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KanbanCard
                v-for="row in paginatedRows"
                :key="row.id"
                :title="row.label"
                :description="row.code"
                :muted="!row.is_active"
              >
                <template #tags>
                  <KanbanTag :dot="row.is_active ? 'emerald' : 'gray'">
                    {{ row.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                  </KanbanTag>
                  <KanbanTag :dot="inclusionIsUsed(row) ? 'amber' : 'gray'">
                    {{ inclusionUsageLabel(row) }}
                  </KanbanTag>
                </template>
                <template #actions>
                  <RowActionsMenu
                    :open="activeMenuId === row.id"
                    placement="up"
                    @toggle="toggleMenu(row.id)"
                  >
                    <RowActionsItem icon="edit" @click="openEdit(row)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem
                      :icon="row.is_active ? 'archive' : 'activate'"
                      @click="onSetActive(row, !row.is_active)"
                    >
                      {{ row.is_active ? $t('paymentSettings.markInactive') : $t('paymentSettings.markActive') }}
                    </RowActionsItem>
                    <RowActionsItem icon="delete" danger @click="onDelete(row)">
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </template>
              </KanbanCard>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('paymentSettings.label') }}</th>
                    <th>{{ $t('paymentSettings.code') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th>{{ $t('paymentSettings.discountUsage') }}</th>
                    <th class="!text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in paginatedRows" :key="'list-' + row.id">
                    <td class="font-medium">{{ row.label }}</td>
                    <td class="font-mono text-xs">{{ row.code }}</td>
                    <td>
                      <span
                        class="fk-pill"
                        :class="row.is_active ? 'fk-pill--teal' : 'fk-pill--mist'"
                      >
                        {{ row.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                      </span>
                    </td>
                    <td>{{ inclusionUsageLabel(row) }}</td>
                    <td>
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === row.id"
                          placement="up"
                          @toggle="toggleMenu(row.id)"
                        >
                          <RowActionsItem icon="edit" @click="openEdit(row)">
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem
                            :icon="row.is_active ? 'archive' : 'activate'"
                            @click="onSetActive(row, !row.is_active)"
                          >
                            {{ row.is_active ? $t('paymentSettings.markInactive') : $t('paymentSettings.markActive') }}
                          </RowActionsItem>
                          <RowActionsItem icon="delete" danger @click="onDelete(row)">
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
              :show="filteredRows.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('paymentSettings.emptyInclusions') }}</p>
          </div>
        </div>
      </section>
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
            <label class="fk-flabel" for="inclusions-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="inclusions-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('paymentSettings.searchInclusionsPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="inclusions-status"><span>{{ $t('common.status') }}</span></label>
            <select
              id="inclusions-status"
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
      :show="showForm"
      plain-footer
      :title="editingRow ? $t('paymentSettings.editInclusionItem') : $t('paymentSettings.addInclusionItem')"
      @close="closeForm"
    >
      <form id="inclusion-item-form" class="fk-form" @submit.prevent="saveForm">
        <div class="fk-form__section">
          <div class="fk-form__row">
            <label class="fk-flabel" for="inclusion-code"><span>{{ $t('paymentSettings.code') }}</span></label>
            <input
              id="inclusion-code"
              v-model="form.code"
              required
              class="fk-field"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="inclusion-label"><span>{{ $t('paymentSettings.label') }}</span></label>
            <input
              id="inclusion-label"
              v-model="form.label"
              required
              class="fk-field"
            >
          </div>
          <p v-if="formError" class="text-sm text-red-700">{{ formError }}</p>
        </div>
      </form>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="closeForm">{{ $t('common.cancel') }}</button>
        <button type="submit" form="inclusion-item-form" class="fk-btn fk-btn--primary" :disabled="saving">
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFeedback } from '@/composables/useFeedback'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { authService } from '@/services'
import paymentConfigService, { type PaymentCatalogRow } from '@/services/payment-config.service'
import FikrLoader from '@/components/FikrLoader.vue'
import { routePageLoading } from '@/router/route-loading'

const { locale, t } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const schoolId = computed(() => {
  const id = authService.getStoredUser()?.school_id
  return id != null && String(id).trim() !== '' ? String(id) : ''
})

const rows = ref<PaymentCatalogRow[]>([])
const loading = ref(true)
const flashError = ref('')
const showFilters = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const activeMenuId = ref<string | null>(null)

const showForm = ref(false)
const editingRow = ref<PaymentCatalogRow | null>(null)
const saving = ref(false)
const formError = ref('')
const form = ref({ code: '', label: '' })

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim()) || statusFilter.value !== 'all',
)

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (statusFilter.value === 'active' && !row.is_active) return false
    if (statusFilter.value === 'inactive' && row.is_active) return false
    if (q && !`${row.label} ${row.code}`.toLowerCase().includes(q)) return false
    return true
  })
})

const {
  currentPage,
  paginatedItems: paginatedRows,
  totalPages,
  goToPage,
} = useClientPagination(filteredRows)

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

function inclusionIsUsed(row: PaymentCatalogRow) {
  return Boolean(row.package_names?.length || row.used_on_charges)
}

function inclusionUsageLabel(row: PaymentCatalogRow) {
  const names = row.package_names ?? []
  if (names.length) return t('paymentSettings.discountUsedIn', { names: names.join(', ') })
  if (row.used_on_charges) return t('paymentSettings.discountUsedOnCharges')
  return t('paymentSettings.discountNotUsed')
}

function apiErrorText(error: unknown, fallback: string): string {
  const ax = error as { response?: { data?: { message?: string | string[] } }; message?: string }
  const raw = ax.response?.data?.message
  if (Array.isArray(raw)) {
    const text = raw.map((part) => String(part)).filter(Boolean).join(' ')
    if (text) return text
  } else if (typeof raw === 'string' && raw.trim() && !raw.startsWith('Request failed')) {
    return raw.trim()
  }
  return fallback
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

function resetForm() {
  form.value = { code: '', label: '' }
  formError.value = ''
  editingRow.value = null
}

function openCreate() {
  resetForm()
  showForm.value = true
}

function openEdit(row: PaymentCatalogRow) {
  closeMenu()
  editingRow.value = row
  form.value = {
    code: row.code,
    label: row.label,
  }
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  if (saving.value) return
  showForm.value = false
  resetForm()
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
    rows.value = await paymentConfigService.listInclusionTypes(schoolId.value)
  } catch (e: unknown) {
    flashError.value = (e as { message?: string })?.message || t('paymentSettings.loadError')
  } finally {
    loading.value = false
  }
}

async function saveForm() {
  formError.value = ''
  saving.value = true
  try {
    const payload = {
      code: form.value.code.trim(),
      label: form.value.label.trim(),
    }
    if (editingRow.value) {
      const updated = await paymentConfigService.updateInclusionType(editingRow.value.id, payload)
      const i = rows.value.findIndex((x) => x.id === editingRow.value?.id)
      if (i !== -1) {
        rows.value[i] = {
          ...updated,
          package_names: rows.value[i].package_names,
          used_on_charges: rows.value[i].used_on_charges,
        }
      }
    } else {
      const row = await paymentConfigService.createInclusionType(schoolId.value, payload)
      rows.value = [...rows.value, { ...row, package_names: [], used_on_charges: false }]
    }
    showForm.value = false
    resetForm()
  } catch (e: unknown) {
    formError.value = (e as { message?: string })?.message || t('paymentSettings.saveError')
  } finally {
    saving.value = false
  }
}

async function onSetActive(row: PaymentCatalogRow, is_active: boolean) {
  closeMenu()
  try {
    const updated = await paymentConfigService.updateInclusionType(row.id, { is_active })
    const i = rows.value.findIndex((x) => x.id === row.id)
    if (i !== -1) {
      rows.value[i] = {
        ...updated,
        package_names: rows.value[i].package_names,
        used_on_charges: rows.value[i].used_on_charges,
      }
    }
  } catch {
    await load()
  }
}

async function onDelete(row: PaymentCatalogRow) {
  closeMenu()
  flashError.value = ''
  const names = row.package_names ?? []
  if (names.length) {
    flashError.value = t('paymentSettings.inclusionUsedInPackage', { names: names.join(', ') })
    return
  }
  if (row.used_on_charges) {
    flashError.value = t('paymentSettings.discountUsedOnCharges')
    return
  }
  if (!(await feedback.confirm({
    title: t('common.delete'),
    message: t('paymentSettings.confirmDelete'),
    confirmLabel: t('common.delete'),
    danger: true,
  }))) return
  try {
    await paymentConfigService.deleteInclusionType(row.id)
    rows.value = rows.value.filter((x) => x.id !== row.id)
  } catch (e: unknown) {
    flashError.value = apiErrorText(e, t('paymentSettings.saveError'))
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
