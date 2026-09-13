<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('feesV2.pendingTransfers')"
        :subtitle="$t('feesV2.pendingTransfersHint')"
      />

      <div v-if="actionError" class="fk-alert fk-alert--error">
        {{ actionError }}
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('feesV2.pendingTransfers') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('feesV2.pendingTransfersCount', { count: transfers.length }) }}
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

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="transfers.length">
            <p
              v-if="filteredTransfers.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('feesV2.noTransferFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="tr in paginatedTransfers"
                :key="tr.id"
                class="relative rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                  aria-hidden="true"
                />
                <div class="flex items-center gap-3 p-5">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900">{{ fmt(tr.total_amount) }} OMR</h3>
                    <p class="mt-0.5 truncate text-xs text-gray-500">
                      {{ tr.reference || lineSummary(tr) }}
                    </p>
                  </div>
                  <span class="inline-flex shrink-0 items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-100">
                    {{ $t('platformFeePayments.transferStatus_pending_school') }}
                  </span>
                  <RowActionsMenu
                    :open="activeMenuId === tr.id"
                    placement="up"
                    @toggle="toggleMenu(tr.id)"
                  >
                    <RowActionsItem
                      v-if="tr.proof_url"
                      icon="view"
                      @click="openProof(tr.proof_url)"
                    >
                      {{ $t('feesV2.viewReceipt') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-for="line in receiptLines(tr)"
                      :key="line.id"
                      icon="view"
                      @click="openProof(line.payment!.proof_url!)"
                    >
                      {{ $t('feesV2.viewReceipt') }}
                    </RowActionsItem>
                    <RowActionsItem icon="activate" @click="approve(tr.id)">
                      {{ $t('feesV2.approveTransfer') }}
                    </RowActionsItem>
                    <RowActionsItem icon="delete" danger @click="reject(tr.id)">
                      {{ $t('feesV2.rejectTransfer') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </div>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.amount') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('students.studentNameCol') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="tr in paginatedTransfers" :key="'list-' + tr.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ fmt(tr.total_amount) }} OMR</td>
                    <td class="px-4 py-3 text-gray-600">{{ lineSummary(tr) }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                        {{ $t('platformFeePayments.transferStatus_pending_school') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === tr.id"
                          placement="up"
                          @toggle="toggleMenu(tr.id)"
                        >
                          <RowActionsItem
                            v-if="tr.proof_url"
                            icon="view"
                            @click="openProof(tr.proof_url)"
                          >
                            {{ $t('feesV2.viewReceipt') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-for="line in receiptLines(tr)"
                            :key="line.id"
                            icon="view"
                            @click="openProof(line.payment!.proof_url!)"
                          >
                            {{ $t('feesV2.viewReceipt') }}
                          </RowActionsItem>
                          <RowActionsItem icon="activate" @click="approve(tr.id)">
                            {{ $t('feesV2.approveTransfer') }}
                          </RowActionsItem>
                          <RowActionsItem icon="delete" danger @click="reject(tr.id)">
                            {{ $t('feesV2.rejectTransfer') }}
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
              :show="filteredTransfers.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('feesV2.pendingTransfersEmpty') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('feesV2.filtersTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('feesV2.filtersTitle') }}</h3>
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
              :placeholder="$t('feesV2.searchTransfersPlaceholder')"
            >
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
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { feesV2Service, type FeeTransfer } from '@/services/fees-v2.service'
import { openAuthenticatedMedia } from '@/utils/authenticated-media'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const allTransfers = ref<FeeTransfer[]>([])
const loading = ref(true)
const busyId = ref<string | null>(null)
const openingProof = ref(false)
const actionError = ref('')
const showFilters = ref(false)
const searchQuery = ref('')
const activeMenuId = ref<string | null>(null)

const transfers = computed(() =>
  allTransfers.value.filter((tr) => tr.status === 'pending_school'),
)

const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim()))

const filteredTransfers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return transfers.value
  return transfers.value.filter((tr) => {
    const haystack = [
      fmt(tr.total_amount),
      tr.reference || '',
      lineSummary(tr),
    ].join(' ').toLowerCase()
    return haystack.includes(q)
  })
})

const {
  currentPage,
  paginatedItems: paginatedTransfers,
  totalPages,
  goToPage,
} = useClientPagination(filteredTransfers)

watch(searchQuery, () => {
  currentPage.value = 1
})

function fmt(v: string | number) {
  return Number(v || 0).toFixed(3)
}

function openProof(url: string) {
  void (async () => {
    if (openingProof.value) return
    openingProof.value = true
    actionError.value = ''
    activeMenuId.value = null
    try {
      const opened = await openAuthenticatedMedia(url)
      if (!opened) actionError.value = t('platformSchools.popupBlocked')
    } catch {
      actionError.value = t('platformBilling.receiptOpenFailed')
    } finally {
      openingProof.value = false
    }
  })()
}

function lineSummary(tr: FeeTransfer) {
  const names = (tr.lines || [])
    .map((line) =>
      line.payment?.student
        ? `${line.payment.student.firstName} ${line.payment.student.lastName}`
        : null,
    )
    .filter((name): name is string => Boolean(name))
  if (names.length) return names.join(' · ')
  return t('feesV2.pendingTransferLines', { count: (tr.lines || []).length })
}

function receiptLines(tr: FeeTransfer) {
  return (tr.lines || []).filter((line) => line.payment?.proof_url)
}

function clearFilters() {
  searchQuery.value = ''
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    activeMenuId.value = null
  }
}

async function load() {
  loading.value = true
  try {
    allTransfers.value = await feesV2Service.listFeeTransfers()
  } catch {
    allTransfers.value = []
  } finally {
    loading.value = false
  }
}

async function approve(id: string) {
  if (busyId.value) return
  busyId.value = id
  actionError.value = ''
  activeMenuId.value = null
  try {
    await feesV2Service.approveFeeTransfer(id)
    await load()
  } catch (e: unknown) {
    actionError.value = (e as { message?: string })?.message || t('feesV2.transferActionError')
  } finally {
    busyId.value = null
  }
}

async function reject(id: string) {
  if (busyId.value) return
  busyId.value = id
  actionError.value = ''
  activeMenuId.value = null
  try {
    await feesV2Service.rejectFeeTransfer(id)
    await load()
  } catch (e: unknown) {
    actionError.value = (e as { message?: string })?.message || t('feesV2.transferActionError')
  } finally {
    busyId.value = null
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
