<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('feesV2.pendingApprovals')"
        :subtitle="$t('feesV2.pendingApprovalsSchoolHint')"
      />

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('feesV2.pendingApprovals') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('feesV2.pendingApprovalsCount', { count: payments.length }) }}
            </p>
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
          <p v-if="proofError" class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ proofError }}
          </p>
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="payments.length">
            <p
              v-if="filteredPayments.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('feesV2.noReceiptFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KanbanCard
                v-for="p in paginatedPayments"
                :key="p.id"
                :title="studentName(p)"
                :description="`${fmt(p.amount)} OMR · ${$t(`parentFees.method_${p.method}`)}`"
              >
                <template #tags>
                  <KanbanTag :dot="p.status === 'paid' ? 'emerald' : p.status === 'rejected' ? 'red' : 'amber'">
                    {{ $t(`parentFees.status_${p.status}`) }}
                  </KanbanTag>
                </template>
                <template #actions>
                  <RowActionsMenu
                    :open="activeMenuId === p.id"
                    placement="up"
                    @toggle="toggleMenu(p.id)"
                  >
                    <RowActionsItem
                      v-if="p.proof_url"
                      icon="view"
                      @click="openProof(p.proof_url)"
                    >
                      {{ $t('feesV2.viewReceipt') }}
                    </RowActionsItem>
                    <RowActionsItem
                      icon="activate"
                      @click="confirmPaid(p.id)"
                    >
                      {{ $t('feesV2.approvePayment') }}
                    </RowActionsItem>
                    <RowActionsItem
                      icon="delete"
                      danger
                      @click="rejectReceipt(p.id)"
                    >
                      {{ $t('feesV2.rejectPayment') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </template>
                <template #avatars>
                  <KanbanAvatar :initials="paymentInitials(p)" />
                </template>
              </KanbanCard>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('students.studentNameCol') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.amount') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="p in paginatedPayments" :key="'list-' + p.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ studentName(p) }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ fmt(p.amount) }} OMR</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        :class="statusPillClass(p.status)"
                      >
                        {{ $t(`parentFees.status_${p.status}`) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === p.id"
                          placement="up"
                          @toggle="toggleMenu(p.id)"
                        >
                          <RowActionsItem
                            v-if="p.proof_url"
                            icon="view"
                            @click="openProof(p.proof_url)"
                          >
                            {{ $t('feesV2.viewReceipt') }}
                          </RowActionsItem>
                          <RowActionsItem
                            icon="activate"
                            @click="confirmPaid(p.id)"
                          >
                            {{ $t('feesV2.approvePayment') }}
                          </RowActionsItem>
                          <RowActionsItem
                            icon="delete"
                            danger
                            @click="rejectReceipt(p.id)"
                          >
                            {{ $t('feesV2.rejectPayment') }}
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
              :show="filteredPayments.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('feesV2.pendingApprovalsEmpty') }}</p>
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
            <label class="fk-flabel" for="receipts-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="receipts-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('feesV2.searchReceiptsPlaceholder')"
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
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanAvatar from '@/components/ui/kanban-avatar.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { feesV2Service, type FeePayment } from '@/services/fees-v2.service'
import { openAuthenticatedMedia } from '@/utils/authenticated-media'
import { getErrorMessage } from '@/utils/error-reporting'
import { useFeedback } from '@/composables/useFeedback'
import FikrLoader from '@/components/FikrLoader.vue'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const feedback = useFeedback()

const payments = ref<FeePayment[]>([])
const loading = ref(true)
const showFilters = ref(false)
const searchQuery = ref('')
const activeMenuId = ref<string | null>(null)
const openingProof = ref(false)
const proofError = ref('')
const busyId = ref<string | null>(null)

const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim()))

const filteredPayments = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return payments.value
  return payments.value.filter((p) => {
    const name = studentName(p).toLowerCase()
    const remarks = (p.remarks || '').toLowerCase()
    const amount = fmt(p.amount)
    return name.includes(q) || remarks.includes(q) || amount.includes(q)
  })
})

const {
  currentPage,
  paginatedItems: paginatedPayments,
  totalPages,
  goToPage,
} = useClientPagination(filteredPayments)

watch(searchQuery, () => {
  currentPage.value = 1
})

function studentName(p: FeePayment) {
  return p.student ? `${p.student.firstName} ${p.student.lastName}` : p.student_id
}

function paymentInitials(p: FeePayment) {
  const first = p.student?.firstName?.trim()?.[0] || ''
  const last = p.student?.lastName?.trim()?.[0] || ''
  const initials = `${first}${last}`.toUpperCase()
  return initials || '?'
}

function statusPillClass(status: FeePayment['status']) {
  return status === 'pending_reconcile'
    ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-100'
    : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
}

function fmt(v: string | number) {
  return Number(v || 0).toFixed(3)
}

async function openProof(url: string) {
  if (openingProof.value) return
  openingProof.value = true
  proofError.value = ''
  activeMenuId.value = null
  try {
    const opened = await openAuthenticatedMedia(url)
    if (!opened) proofError.value = t('platformSchools.popupBlocked')
  } catch {
    proofError.value = t('platformBilling.receiptOpenFailed')
  } finally {
    openingProof.value = false
  }
}

async function confirmPaid(id: string) {
  if (busyId.value) return
  busyId.value = id
  activeMenuId.value = null
  try {
    await feesV2Service.approvePayment(id)
    payments.value = payments.value.filter((p) => p.id !== id)
    feedback.success(t('common.savedSuccessfully'))
  } catch (e) {
    feedback.error(getErrorMessage(e, t('common.error')), t('common.error'))
  } finally {
    busyId.value = null
  }
}

async function rejectReceipt(id: string) {
  if (busyId.value) return
  busyId.value = id
  activeMenuId.value = null
  try {
    await feesV2Service.rejectPayment(id)
    payments.value = payments.value.filter((p) => p.id !== id)
    feedback.success(t('common.savedSuccessfully'))
  } catch (e) {
    feedback.error(getErrorMessage(e, t('common.error')), t('common.error'))
  } finally {
    busyId.value = null
  }
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

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  loading.value = true
  try {
    payments.value = await feesV2Service.listPendingPayments()
  } catch {
    payments.value = []
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
