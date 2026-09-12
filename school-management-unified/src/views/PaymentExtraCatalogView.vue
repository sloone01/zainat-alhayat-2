<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('systemSettings.extraItemsLines')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('paymentSettings.extraItemsListHeading') }}</h2>
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
                :aria-label="$t('paymentSettings.addExtraItem')"
                @click="openCreate"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="rows.length">
            <p
              v-if="filteredRows.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('paymentSettings.noExtraFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="row in paginatedRows"
                :key="row.id"
                class="relative rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                :class="!row.is_active ? 'opacity-75' : ''"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                  aria-hidden="true"
                />
                <div class="flex items-center gap-3 p-5">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900">{{ row.label }}</h3>
                    <p class="mt-0.5 font-mono text-xs text-gray-500">{{ row.code }}</p>
                  </div>
                  <span
                    class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="row.is_active ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ row.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                  </span>
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
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.label') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.code') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in paginatedRows" :key="'list-' + row.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ row.label }}</td>
                    <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ row.code }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        :class="row.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'"
                      >
                        {{ row.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('paymentSettings.emptyExtras') }}</p>
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
            <label class="fk-flabel" for="extras-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="extras-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('paymentSettings.searchExtrasPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="extras-status"><span>{{ $t('common.status') }}</span></label>
            <select
              id="extras-status"
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
      :title="editingRow ? $t('paymentSettings.editExtraItem') : $t('paymentSettings.addExtraItem')"
      @close="closeForm"
    >
      <form id="extra-item-form" class="fk-form" @submit.prevent="saveForm">
        <div class="fk-form__section">
          <div class="fk-form__row">
            <label class="fk-flabel" for="extra-code"><span>{{ $t('paymentSettings.code') }}</span></label>
            <input
              id="extra-code"
              v-model="form.code"
              required
              class="fk-field"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="extra-label"><span>{{ $t('paymentSettings.label') }}</span></label>
            <input
              id="extra-label"
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
        <button type="submit" form="extra-item-form" class="fk-btn fk-btn--primary" :disabled="saving">
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { authService } from '@/services'
import paymentConfigService, { type PaymentCatalogRow } from '@/services/payment-config.service'

const { locale, t } = useI18n()
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
    rows.value = await paymentConfigService.listExtraTypes(schoolId.value)
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
      const updated = await paymentConfigService.updateExtraType(editingRow.value.id, payload)
      const i = rows.value.findIndex((x) => x.id === editingRow.value?.id)
      if (i !== -1) rows.value[i] = updated
    } else {
      const row = await paymentConfigService.createExtraType(schoolId.value, payload)
      rows.value = [...rows.value, row]
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
    const updated = await paymentConfigService.updateExtraType(row.id, { is_active })
    const i = rows.value.findIndex((x) => x.id === row.id)
    if (i !== -1) rows.value[i] = updated
  } catch {
    await load()
  }
}

async function onDelete(row: PaymentCatalogRow) {
  closeMenu()
  if (!confirm(t('paymentSettings.confirmDelete'))) return
  try {
    await paymentConfigService.deleteExtraType(row.id)
    rows.value = rows.value.filter((x) => x.id !== row.id)
  } catch (e: unknown) {
    flashError.value = (e as { message?: string })?.message || t('paymentSettings.saveError')
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
