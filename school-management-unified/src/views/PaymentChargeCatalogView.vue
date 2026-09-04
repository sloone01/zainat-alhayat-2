<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <router-link to="/system-settings#payment-fee-discount-catalogs" class="text-sm font-medium text-primary-600 hover:text-primary-800">
          {{ $t('systemSettings.paymentCatalogsBack') }}
        </router-link>
        <h1 class="text-xl font-bold text-gray-900 mt-2">{{ $t('systemSettings.feeItemsLines') }}</h1>
      </div>

      <div v-if="flashError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-red-800 text-sm">{{ flashError }}</span>
        </div>
      </div>
      <div v-if="flashOk" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-green-800 text-sm">{{ flashOk }}</span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center me-3 shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.addNewTitle') }}</h2>
        </div>
        <form class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" @submit.prevent="addRow">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">{{ $t('paymentSettings.code') }}</label>
            <input v-model="form.code" class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500" required />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">{{ $t('paymentSettings.label') }}</label>
            <input v-model="form.label" class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">{{ $t('paymentSettings.chargeBillingOccurrence') }}</label>
            <select
              v-model="form.billing_occurrence"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              :title="$t('paymentSettings.chargeBillingOccurrenceHelp')"
            >
              <option v-for="opt in billingOccurrenceOptions" :key="opt" :value="opt">
                {{ billingOccurrenceLabel(opt) }}
              </option>
            </select>
          </div>
          <div class="md:col-span-4">
            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('common.create') }}
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="!rows.length" class="px-4 py-10 text-center text-gray-500">
          {{ $t('paymentSettings.emptyCharges') }}
        </div>

        <template v-else>
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('paymentSettings.code') }}</th>
                  <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('paymentSettings.label') }}</th>
                  <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('paymentSettings.chargeBillingOccurrence') }}</th>
                  <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('paymentSettings.active') }}</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in paginatedItems" :key="row.id" class="border-t border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 font-mono text-gray-900">{{ row.code }}</td>
                  <td class="px-4 py-3 text-gray-900">{{ row.label }}</td>
                  <td class="px-4 py-3">
                    <select
                      :value="row.billing_occurrence ?? 'per_year'"
                      class="max-w-[14rem] rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      :aria-label="$t('paymentSettings.chargeBillingOccurrence')"
                      @change="updateBillingOccurrence(row, ($event.target as HTMLSelectElement).value as PaymentChargeBillingOccurrence)"
                    >
                      <option v-for="opt in billingOccurrenceOptions" :key="opt" :value="opt">
                        {{ billingOccurrenceLabel(opt) }}
                      </option>
                    </select>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      :class="row.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                    >
                      {{ row.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center">
                      <PaymentCatalogRowActionsDropdown
                        :open="activeMenuId === row.id"
                        :isRTL="isRTL"
                        :is-active="row.is_active"
                        @toggle="toggleMenu(row.id)"
                        @set-active="onSetActive(row, $event)"
                        @delete="onDelete(row)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="md:hidden p-4 space-y-3">
            <article
              v-for="row in paginatedItems"
              :key="'charge-card-' + row.id"
              class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
            >
              <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <p class="font-mono text-xs font-semibold text-primary-800">{{ row.code }}</p>
                    <h3 class="mt-1 text-base font-semibold text-gray-900">{{ row.label }}</h3>
                    <span
                      class="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      :class="row.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                    >
                      {{ row.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                    </span>
                  </div>
                  <PaymentCatalogRowActionsDropdown
                    :open="activeMenuId === row.id"
                    :isRTL="isRTL"
                    :is-active="row.is_active"
                    @toggle="toggleMenu(row.id)"
                    @set-active="onSetActive(row, $event)"
                    @delete="onDelete(row)"
                  />
                </div>
              </div>
              <div class="border-t border-gray-100 px-4 py-3">
                <label class="mb-1 block text-xs font-medium text-gray-500">{{ $t('paymentSettings.chargeBillingOccurrence') }}</label>
                <select
                  :value="row.billing_occurrence ?? 'per_year'"
                  class="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                  @change="updateBillingOccurrence(row, ($event.target as HTMLSelectElement).value as PaymentChargeBillingOccurrence)"
                >
                  <option v-for="opt in billingOccurrenceOptions" :key="opt" :value="opt">
                    {{ billingOccurrenceLabel(opt) }}
                  </option>
                </select>
              </div>

            </article>
          </div>

          <div class="border-t border-gray-200 px-4 py-3 sm:px-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-gray-600">
                {{ $t('common.paginationShowing', { from: paginationFrom, to: paginationTo, total: rows.length }) }}
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <label class="inline-flex items-center gap-2 text-sm text-gray-600">
                  <span class="whitespace-nowrap">{{ $t('common.perPage') }}</span>
                  <select
                    v-model.number="pageSize"
                    class="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                  </select>
                </label>
                <button
                  type="button"
                  class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage <= 1"
                  @click="goToPreviousPage"
                >
                  {{ $t('common.previous') }}
                </button>
                <span class="text-sm text-gray-600 whitespace-nowrap">
                  {{ $t('common.pageOf', { current: currentPage, total: totalPages }) }}
                </span>
                <button
                  type="button"
                  class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage >= totalPages"
                  @click="goToNextPage"
                >
                  {{ $t('common.next') }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PaymentCatalogRowActionsDropdown from '@/components/PaymentCatalogRowActionsDropdown.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { authService } from '@/services'
import paymentConfigService, {
  PAYMENT_CHARGE_BILLING_OCCURRENCES,
  type PaymentCatalogRow,
  type PaymentChargeBillingOccurrence,
} from '@/services/payment-config.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const billingOccurrenceOptions = PAYMENT_CHARGE_BILLING_OCCURRENCES

const rows = ref<PaymentCatalogRow[]>([])
const form = ref({
  code: '',
  label: '',
  billing_occurrence: 'per_year' as PaymentChargeBillingOccurrence,
})
const flashError = ref('')
const flashOk = ref('')
const activeMenuId = ref<string | null>(null)

const {
  currentPage,
  pageSize,
  pageSizeOptions,
  paginatedItems,
  totalPages,
  paginationFrom,
  paginationTo,
  goToPreviousPage,
  goToNextPage,
} = useClientPagination(rows)

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenu() {
  activeMenuId.value = null
}

function onSetActive(row: PaymentCatalogRow, is_active: boolean) {
  closeMenu()
  void toggle(row, is_active)
}

function onDelete(row: PaymentCatalogRow) {
  closeMenu()
  void remove(row)
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    closeMenu()
  }
}

function billingOccurrenceLabel(value: PaymentChargeBillingOccurrence): string {
  const map: Record<PaymentChargeBillingOccurrence, string> = {
    per_year: t('paymentSettings.chargeBillingOccurrencePerYear'),
    once_ever: t('paymentSettings.chargeBillingOccurrenceOnceEver'),
    other: t('paymentSettings.chargeBillingOccurrenceOther'),
  }
  return map[value] ?? value
}

async function load() {
  try {
    rows.value = await paymentConfigService.listChargeTypes(schoolId.value)
  } catch (e: any) {
    flashError.value = e?.message || t('paymentSettings.loadError')
  }
}

async function addRow() {
  flashError.value = ''
  flashOk.value = ''
  try {
    const row = await paymentConfigService.createChargeType(schoolId.value, {
      code: form.value.code.trim(),
      label: form.value.label.trim(),
      value: null,
      billing_occurrence: form.value.billing_occurrence,
    })
    rows.value = [...rows.value, row]
    form.value = { code: '', label: '', billing_occurrence: 'per_year' }
    flashOk.value = t('paymentSettings.saved')
  } catch (e: any) {
    flashError.value = e?.message || t('paymentSettings.saveError')
  }
}

async function toggle(row: PaymentCatalogRow, is_active: boolean) {
  try {
    const updated = await paymentConfigService.updateChargeType(row.id, { is_active })
    const i = rows.value.findIndex((x) => x.id === row.id)
    if (i !== -1) rows.value[i] = updated
  } catch {
    await load()
  }
}

async function updateBillingOccurrence(row: PaymentCatalogRow, billing_occurrence: PaymentChargeBillingOccurrence) {
  if ((row.billing_occurrence ?? 'per_year') === billing_occurrence) return
  try {
    const updated = await paymentConfigService.updateChargeType(row.id, { billing_occurrence })
    const i = rows.value.findIndex((x) => x.id === row.id)
    if (i !== -1) rows.value[i] = updated
  } catch {
    await load()
  }
}

async function remove(row: PaymentCatalogRow) {
  if (!confirm(t('paymentSettings.confirmDelete'))) return
  try {
    await paymentConfigService.deleteChargeType(row.id)
    rows.value = rows.value.filter((x) => x.id !== row.id)
    flashOk.value = t('paymentSettings.saved')
  } catch (e: any) {
    flashError.value = e?.message || t('paymentSettings.saveError')
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
