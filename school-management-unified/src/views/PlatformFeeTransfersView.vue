<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('platformFeeTransfers.title')" />

      <div v-if="error" class="fk-alert fk-alert--error">
        <span>{{ error }}</span>
        <button type="button" class="ms-3 font-semibold underline" @click="load">{{ $t('common.retry') }}</button>
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('platformFeePayments.transfersTitle') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('platformFeeTransfers.count', { count: filteredTransfers.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn relative"
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
            <router-link
              to="/platform/transfers/new"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('platformFeeTransfers.newTransfer')"
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

          <div
            v-else-if="!transfers.length"
            class="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-500"
          >
            {{ $t('platformFeePayments.transfersEmpty') }}
          </div>

          <p
            v-else-if="!filteredTransfers.length"
            class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
          >
            {{ $t('feesV2.noTransferFilterResults') }}
          </p>

          <template v-else>
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="tr in paginatedItems"
                :key="tr.id"
                class="relative rounded-2xl border border-gray-200/80 bg-white shadow-sm"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                  aria-hidden="true"
                />
                <div class="flex items-start gap-3 p-5">
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900">{{ schoolLabel(tr) }}</h3>
                    <p class="mt-1 text-sm font-medium text-gray-800">{{ formatMoney(tr.total_amount) }}</p>
                    <p class="mt-1 text-xs text-gray-500">
                      <span v-if="tr.transferred_at">{{ formatDate(tr.transferred_at) }} · </span>
                      <span v-if="tr.reference">{{ tr.reference }}</span>
                    </p>
                    <span
                      class="mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="transferStatusClass(tr.status)"
                    >
                      {{ $t(`platformFeePayments.transferStatus_${tr.status}`) }}
                    </span>
                  </div>
                  <RowActionsMenu
                    :open="activeMenuId === tr.id"
                    placement="up"
                    @toggle="toggleMenu(tr.id)"
                  >
                    <RowActionsItem icon="view" @click="viewReceipt(tr)">
                      {{ $t('feesV2.viewReceipt') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </div>
              </article>
            </div>

            <div v-else class="overflow-visible rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('platformFeeTransfers.school') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('platformFeeTransfers.amount') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('platformFeeTransfers.transferDate') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('platformFeePayments.transferReference') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-for="tr in paginatedItems" :key="tr.id">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ schoolLabel(tr) }}</td>
                    <td class="px-4 py-3 text-gray-800">{{ formatMoney(tr.total_amount) }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ tr.transferred_at ? formatDate(tr.transferred_at) : '—' }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ tr.reference || '—' }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        :class="transferStatusClass(tr.status)"
                      >
                        {{ $t(`platformFeePayments.transferStatus_${tr.status}`) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-end">
                      <RowActionsMenu
                        :open="activeMenuId === tr.id"
                        placement="up"
                        @toggle="toggleMenu(tr.id)"
                      >
                        <RowActionsItem icon="view" @click="viewReceipt(tr)">
                          {{ $t('feesV2.viewReceipt') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              class="mt-5 border-t border-fikr-hairline pt-4"
              :page="currentPage"
              :pages="totalPages"
              :show="filteredTransfers.length > 0"
              @update:page="goToPage"
            />
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
            <label class="fk-flabel" for="transfers-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="transfers-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('platformFeeTransfers.searchPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="transfers-school"><span>{{ $t('platformFeeTransfers.school') }}</span></label>
            <select id="transfers-school" v-model="schoolFilter" class="fk-field">
              <option value="all">{{ $t('platformFeeTransfers.allSchools') }}</option>
              <option v-for="s in schoolOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="transfers-status"><span>{{ $t('common.status') }}</span></label>
            <select id="transfers-status" v-model="statusFilter" class="fk-field">
              <option value="all">{{ $t('platformFeeTransfers.allStatuses') }}</option>
              <option value="pending_school">{{ $t('platformFeePayments.transferStatus_pending_school') }}</option>
              <option value="approved">{{ $t('platformFeePayments.transferStatus_approved') }}</option>
              <option value="rejected">{{ $t('platformFeePayments.transferStatus_rejected') }}</option>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { useListViewMode } from '@/composables/useListViewMode'
import { feesV2Service, type FeeTransfer, type FeeTransferStatus } from '@/services/fees-v2.service'
import { openAuthenticatedMedia } from '@/utils/authenticated-media'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const transfers = ref<FeeTransfer[]>([])
const loading = ref(true)
const error = ref('')
const activeMenuId = ref<string | null>(null)
const showFilters = ref(false)
const searchQuery = ref('')
const schoolFilter = ref('all')
const statusFilter = ref<'all' | FeeTransferStatus>('all')

const schoolOptions = computed(() => {
  const map = new Map<string, { id: string; name: string }>()
  for (const tr of transfers.value) {
    const id = String(tr.school_id || '')
    if (!id || map.has(id)) continue
    map.set(id, { id, name: schoolLabel(tr) })
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
})

const hasActiveFilters = computed(
  () =>
    Boolean(searchQuery.value.trim()) ||
    schoolFilter.value !== 'all' ||
    statusFilter.value !== 'all',
)

const filteredTransfers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return transfers.value.filter((tr) => {
    if (schoolFilter.value !== 'all' && String(tr.school_id) !== schoolFilter.value) return false
    if (statusFilter.value !== 'all' && tr.status !== statusFilter.value) return false
    if (!q) return true
    const haystack = [
      schoolLabel(tr),
      tr.reference || '',
      String(tr.total_amount || ''),
      formatMoney(tr.total_amount),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

const { currentPage, totalPages, paginatedItems, goToPage } = useClientPagination(filteredTransfers)

watch([searchQuery, schoolFilter, statusFilter], () => {
  currentPage.value = 1
})

function clearFilters() {
  searchQuery.value = ''
  schoolFilter.value = 'all'
  statusFilter.value = 'all'
}

function schoolLabel(tr: FeeTransfer) {
  return tr.school?.name || t('platformFeePayments.schoolFallback')
}

function transferReceiptUrl(tr: FeeTransfer): string | null {
  if (tr.proof_url) return tr.proof_url
  return (tr.lines || []).find((line) => line.payment?.proof_url)?.payment?.proof_url ?? null
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function viewReceipt(tr: FeeTransfer) {
  const url = transferReceiptUrl(tr)
  if (!url) {
    activeMenuId.value = null
    error.value = t('platformBilling.receiptOpenFailed')
    return
  }
  void openProof(url)
}

async function openProof(url: string) {
  activeMenuId.value = null
  error.value = ''
  try {
    const opened = await openAuthenticatedMedia(url)
    if (!opened) error.value = t('platformSchools.popupBlocked')
  } catch {
    error.value = t('platformBilling.receiptOpenFailed')
  }
}

function formatMoney(v: string | number) {
  const n = Number(v || 0)
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(n)
  } catch {
    return `${n.toFixed(3)} OMR`
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
    return d.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

function transferStatusClass(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-800'
  if (status === 'rejected') return 'bg-red-100 text-red-800'
  return 'bg-amber-100 text-amber-800'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    transfers.value = await feesV2Service.listFeeTransfers()
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformFeeTransfers.loadError')
    transfers.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
