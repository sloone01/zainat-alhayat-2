<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('platformFeeTransfers.title')"
        :subtitle="$t('platformFeeTransfers.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        <span>{{ error }}</span>
        <button type="button" class="ms-3 font-semibold underline" @click="load">{{ $t('common.retry') }}</button>
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('platformFeePayments.reconcileTitle') }}</h2>
            <p class="fk-card__meta">{{ $t('platformFeePayments.reconcileHint') }}</p>
          </div>
        </header>

        <div v-if="loading" class="flex items-center justify-center py-16 text-gray-500">
          <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        </div>
        <div v-else-if="!readyGroups.length" class="px-6 py-12 text-center text-sm text-gray-500">
          {{ $t('platformFeePayments.reconcileEmpty') }}
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="group in readyGroups" :key="group.schoolId" class="px-6 py-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="font-semibold text-gray-900">{{ group.schoolName }}</h3>
                <p class="text-xs text-gray-500">
                  {{ $t('platformFeePayments.selectedTotal', { count: selectedCount(group.schoolId), amount: formatMoney(selectedTotal(group.schoolId)) }) }}
                </p>
              </div>
              <button
                type="button"
                class="fk-btn fk-btn--primary fk-btn--sm"
                :disabled="!selectedCount(group.schoolId) || creatingSchoolId === group.schoolId"
                @click="createTransfer(group.schoolId)"
              >
                {{ $t('platformFeePayments.createTransfer') }}
              </button>
            </div>
            <label class="mt-3 block text-xs font-medium text-gray-600">
              {{ $t('platformFeePayments.transferReference') }}
              <input
                v-model="references[group.schoolId]"
                type="text"
                class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
                :placeholder="$t('platformFeePayments.transferReferencePh')"
              />
            </label>
            <ul class="mt-3 space-y-2">
              <li
                v-for="p in group.payments"
                :key="p.id"
                class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3"
              >
                <label class="flex min-w-0 items-start gap-3">
                  <input v-model="selectedIds" type="checkbox" :value="p.id" class="mt-1" />
                  <span>
                    <span class="block font-medium text-gray-900">{{ studentName(p) }} · {{ formatMoney(p.amount) }}</span>
                    <span class="block text-xs text-gray-500">{{ $t(`parentFees.method_${p.method}`) }}</span>
                  </span>
                </label>
                <a
                  v-if="p.proof_url"
                  :href="mediaUrl(p.proof_url)"
                  target="_blank"
                  rel="noopener"
                  class="text-xs font-medium text-teal-700 hover:underline"
                >
                  {{ $t('feesV2.viewReceipt') }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('platformFeePayments.transfersTitle') }}</h2>
          </div>
        </header>
        <div v-if="!transfers.length" class="px-6 py-12 text-center text-sm text-gray-500">
          {{ $t('platformFeePayments.transfersEmpty') }}
        </div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="tr in transfers" :key="tr.id" class="px-6 py-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-semibold text-gray-900">
                  {{ tr.school?.name || $t('platformFeePayments.schoolFallback') }}
                  · {{ formatMoney(tr.total_amount) }}
                </p>
                <p class="text-xs text-gray-500">
                  <span v-if="tr.reference">{{ tr.reference }} · </span>
                  {{ $t(`platformFeePayments.transferStatus_${tr.status}`) }}
                </p>
              </div>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="transferStatusClass(tr.status)"
              >
                {{ $t(`platformFeePayments.transferStatus_${tr.status}`) }}
              </span>
            </div>
            <ul class="mt-3 space-y-1 text-sm text-gray-700">
              <li v-for="line in tr.lines || []" :key="line.id" class="flex flex-wrap items-center justify-between gap-2">
                <span>{{ studentName(line.payment) }} · {{ formatMoney(line.payment?.amount || 0) }}</span>
                <a
                  v-if="line.payment?.proof_url"
                  :href="mediaUrl(line.payment.proof_url)"
                  target="_blank"
                  rel="noopener"
                  class="text-xs font-medium text-teal-700 hover:underline"
                >
                  {{ $t('feesV2.viewReceipt') }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { feesV2Service, type FeePayment, type FeeTransfer } from '@/services/fees-v2.service'
import { mediaUrl } from '@/utils/thawaniCheckout'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const ready = ref<FeePayment[]>([])
const transfers = ref<FeeTransfer[]>([])
const selectedIds = ref<string[]>([])
const references = reactive<Record<number, string>>({})
const loading = ref(true)
const error = ref('')
const creatingSchoolId = ref<number | null>(null)

const readyGroups = computed(() => {
  const map = new Map<number, { schoolId: number; schoolName: string; payments: FeePayment[] }>()
  for (const p of ready.value) {
    const schoolId = Number(p.school_id)
    const existing = map.get(schoolId)
    if (existing) existing.payments.push(p)
    else {
      map.set(schoolId, {
        schoolId,
        schoolName: p.school?.name || t('platformFeePayments.schoolFallback'),
        payments: [p],
      })
    }
  }
  return [...map.values()]
})

function studentName(p?: FeePayment | null) {
  if (!p) return '—'
  return p.student ? `${p.student.firstName} ${p.student.lastName}` : p.student_id
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

function selectedForSchool(schoolId: number) {
  const ids = new Set(ready.value.filter((p) => Number(p.school_id) === schoolId).map((p) => p.id))
  return selectedIds.value.filter((id) => ids.has(id))
}

function selectedCount(schoolId: number) {
  return selectedForSchool(schoolId).length
}

function selectedTotal(schoolId: number) {
  const ids = new Set(selectedForSchool(schoolId))
  return ready.value
    .filter((p) => ids.has(p.id))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
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
    const [pool, rows] = await Promise.all([
      feesV2Service.listPendingReconcile(),
      feesV2Service.listFeeTransfers(),
    ])
    ready.value = pool
    transfers.value = rows
    selectedIds.value = selectedIds.value.filter((id) => pool.some((p) => p.id === id))
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformFeeTransfers.loadError')
    ready.value = []
    transfers.value = []
  } finally {
    loading.value = false
  }
}

async function createTransfer(schoolId: number) {
  const paymentIds = selectedForSchool(schoolId)
  if (!paymentIds.length) return
  creatingSchoolId.value = schoolId
  error.value = ''
  try {
    await feesV2Service.createFeeTransfer({
      school_id: schoolId,
      payment_ids: paymentIds,
      reference: references[schoolId]?.trim() || undefined,
    })
    selectedIds.value = selectedIds.value.filter((id) => !paymentIds.includes(id))
    references[schoolId] = ''
    await load()
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformFeeTransfers.actionError')
  } finally {
    creatingSchoolId.value = null
  }
}

onMounted(load)
</script>
