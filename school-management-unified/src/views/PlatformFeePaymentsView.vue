<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('platformFeePayments.title')"
        :subtitle="$t('platformFeePayments.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        <span>{{ error }}</span>
        <button type="button" class="ms-3 font-semibold underline" @click="load">{{ $t('common.retry') }}</button>
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('feesV2.pendingApprovals') }}</h2>
            <p class="fk-card__meta">{{ $t('platformFeePayments.hint') }}</p>
          </div>
        </header>

        <div v-if="loading" class="flex items-center justify-center py-16 text-gray-500">
          <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        </div>
        <div v-else-if="!pending.length" class="px-6 py-12 text-center text-sm text-gray-500">
          {{ $t('platformFeePayments.empty') }}
        </div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="p in pending" :key="p.id" class="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900">
                {{ p.school?.name || $t('platformFeePayments.schoolFallback') }}
                · {{ studentName(p) }}
              </p>
              <p class="mt-0.5 text-sm tabular-nums text-gray-800">{{ formatMoney(p.amount) }}</p>
              <p class="text-xs text-gray-500">
                {{ $t(`parentFees.method_${p.method}`) }}
                <span v-if="p.remarks"> · {{ p.remarks }}</span>
              </p>
              <a
                v-if="p.proof_url"
                :href="mediaUrl(p.proof_url)"
                target="_blank"
                rel="noopener"
                class="mt-1 inline-block text-xs font-medium text-teal-700 hover:underline"
              >
                {{ $t('feesV2.viewReceipt') }}
              </a>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="fk-btn fk-btn--primary fk-btn--sm"
                :disabled="busyId === p.id"
                @click="approve(p.id)"
              >
                {{ $t('feesV2.approvePayment') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm"
                :disabled="busyId === p.id"
                @click="reject(p.id)"
              >
                {{ $t('feesV2.rejectPayment') }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { feesV2Service, type FeePayment } from '@/services/fees-v2.service'
import { mediaUrl } from '@/utils/thawaniCheckout'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const pending = ref<FeePayment[]>([])
const loading = ref(true)
const error = ref('')
const busyId = ref<string | null>(null)

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

async function load() {
  loading.value = true
  error.value = ''
  try {
    pending.value = await feesV2Service.listPendingPayments()
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformFeePayments.loadError')
    pending.value = []
  } finally {
    loading.value = false
  }
}

async function approve(id: string) {
  busyId.value = id
  try {
    await feesV2Service.approvePayment(id)
    await load()
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformFeePayments.actionError')
  } finally {
    busyId.value = null
  }
}

async function reject(id: string) {
  busyId.value = id
  try {
    await feesV2Service.rejectPayment(id)
    await load()
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformFeePayments.actionError')
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>
