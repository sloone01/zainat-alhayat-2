<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('platformFeeTransfers.createTitle')">
        <template #leading>
          <router-link
            to="/platform/transfers"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('platformFeeTransfers.backToTransfers')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="error" class="fk-alert fk-alert--error">
        <span>{{ error }}</span>
        <button type="button" class="ms-3 font-semibold underline" @click="load">{{ $t('common.retry') }}</button>
      </div>

      <section class="fk-card">
        <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <h2 class="fk-card__title truncate">{{ $t('platformFeePayments.reconcileTitle') }}</h2>
        </header>

        <div class="space-y-4 px-5 py-5 sm:px-6">
          <div>
            <label for="transfer-school" class="fk-flabel">{{ $t('platformFeeTransfers.school') }}</label>
            <select
              id="transfer-school"
              v-model="selectedSchoolId"
              class="fk-field w-full max-w-md"
              :disabled="loading"
            >
              <option value="">{{ $t('platformFeeTransfers.schoolPlaceholder') }}</option>
              <option v-for="s in schoolOptions" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.count }})
              </option>
            </select>
          </div>

          <div v-if="selectedSchoolId && schoolPayments.length" class="grid gap-4 sm:grid-cols-2 max-w-md">
            <div>
              <label for="transfer-range-from" class="fk-flabel">{{ $t('platformFeeTransfers.from') }}</label>
              <input
                id="transfer-range-from"
                v-model="rangeFrom"
                type="date"
                class="fk-field w-full"
              />
            </div>
            <div>
              <label for="transfer-range-to" class="fk-flabel">{{ $t('platformFeeTransfers.to') }}</label>
              <input
                id="transfer-range-to"
                v-model="rangeTo"
                type="date"
                class="fk-field w-full"
              />
            </div>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-12 text-gray-500">
            <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          </div>

          <template v-else-if="!selectedSchoolId">
            <p class="py-8 text-center text-sm text-gray-500">{{ $t('platformFeeTransfers.selectSchoolFirst') }}</p>
          </template>

          <template v-else-if="!schoolPayments.length">
            <p class="py-8 text-center text-sm text-gray-500">{{ $t('platformFeePayments.reconcileEmpty') }}</p>
          </template>

          <template v-else>
            <ul class="space-y-2.5">
              <li v-for="p in schoolPayments" :key="p.id">
                <div
                  class="relative overflow-hidden rounded-2xl border shadow-sm transition-all"
                  :class="
                    selectedIds.includes(p.id)
                      ? 'border-primary-300 bg-primary-50/70 shadow-primary-100/80'
                      : 'border-gray-200/80 bg-white hover:border-primary-200 hover:shadow-md'
                  "
                >
                  <div
                    v-if="selectedIds.includes(p.id)"
                    class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500"
                    aria-hidden="true"
                  />
                  <div class="flex items-center gap-3 px-4 py-3.5">
                    <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        v-model="selectedIds"
                        type="checkbox"
                        :value="p.id"
                        class="h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span
                        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xs font-semibold text-primary-800"
                      >{{ paymentInitials(p) }}</span>
                      <span class="min-w-0 flex-1">
                        <span class="block truncate font-semibold text-gray-900">{{ studentName(p) }}</span>
                        <span class="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span class="fk-chip fk-chip--outline tabular-nums" dir="ltr">{{ formatPaymentDay(p) }}</span>
                          <span
                            v-if="p.thawani_invoice"
                            class="fk-chip fk-chip--teal font-mono tabular-nums"
                            dir="ltr"
                          >{{ p.thawani_invoice }}</span>
                        </span>
                      </span>
                    </label>
                    <span class="shrink-0 text-lg font-semibold tabular-nums text-primary-800" dir="ltr">
                      {{ formatRowAmount(p.amount) }}
                    </span>
                    <button
                      v-if="p.proof_url"
                      type="button"
                      class="fk-iconbtn shrink-0"
                      :aria-label="$t('feesV2.viewReceipt')"
                      @click="openProof(p.proof_url)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            </ul>

            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label for="transfer-date" class="fk-flabel">{{ $t('platformFeeTransfers.transferDate') }}</label>
                <input
                  id="transfer-date"
                  v-model="transferDate"
                  type="date"
                  class="fk-field w-full"
                />
              </div>
              <div>
                <label for="transfer-amount" class="fk-flabel">{{ $t('platformFeeTransfers.amount') }}</label>
                <input
                  id="transfer-amount"
                  v-model="transferAmount"
                  type="number"
                  min="0.001"
                  step="0.001"
                  class="fk-field w-full"
                  @input="amountTouched = true"
                />
              </div>
              <div>
                <label for="transfer-reference" class="fk-flabel">{{ $t('platformFeePayments.transferReference') }}</label>
                <input
                  id="transfer-reference"
                  v-model="transferReference"
                  type="text"
                  maxlength="120"
                  class="fk-field w-full"
                />
              </div>
            </div>

            <div>
              <label for="transfer-receipt" class="fk-flabel">{{ $t('platformFeeTransfers.receipt') }}</label>
              <input
                id="transfer-receipt"
                ref="receiptInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                class="fk-field w-full file:me-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-800"
                @change="onReceiptPicked"
              />
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm text-gray-600">
                {{
                  $t('platformFeePayments.selectedTotal', {
                    count: selectedIds.length,
                    amount: formatMoney(selectedReceiptsTotal),
                  })
                }}
              </p>
              <button
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="sending || !canSend"
                @click="sendTransfer"
              >
                {{ sending ? $t('common.loading') : $t('platformFeeTransfers.send') }}
              </button>
            </div>
          </template>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { useFeedback } from '@/composables/useFeedback'
import { feesV2Service, type FeePayment } from '@/services/fees-v2.service'
import { personFirstName, personFullName, personLastName } from '@/utils/person-name'
import { openAuthenticatedMedia } from '@/utils/authenticated-media'

const { locale, t } = useI18n()
const router = useRouter()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const ready = ref<FeePayment[]>([])
const selectedSchoolId = ref('')
const selectedIds = ref<string[]>([])
const rangeFrom = ref('')
const rangeTo = ref('')
const transferDate = ref('')
const transferAmount = ref('')
const transferReference = ref('')
const proofFile = ref<File | null>(null)
const receiptInput = ref<HTMLInputElement | null>(null)
const amountTouched = ref(false)
const loading = ref(true)
const sending = ref(false)
const error = ref('')

const schoolOptions = computed(() => {
  const map = new Map<string, { id: string; name: string; count: number }>()
  for (const p of ready.value) {
    const id = String(p.school_id || '')
    if (!id) continue
    const school = p.school as { name?: string; name_ar?: string; name_en?: string } | null | undefined
    const name =
      school?.name ||
      (locale.value === 'ar' ? school?.name_ar : school?.name_en) ||
      school?.name_en ||
      school?.name_ar ||
      t('platformFeePayments.schoolFallback')
    const existing = map.get(id)
    if (existing) existing.count += 1
    else map.set(id, { id, name: String(name), count: 1 })
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
})

const schoolPayments = computed(() => {
  if (!selectedSchoolId.value) return []
  return ready.value.filter((p) => String(p.school_id) === selectedSchoolId.value)
})

const selectedReceiptsTotal = computed(() => {
  const ids = new Set(selectedIds.value)
  return schoolPayments.value
    .filter((p) => ids.has(p.id))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
})

const canSend = computed(() => {
  return (
    !!selectedSchoolId.value &&
    selectedIds.value.length > 0 &&
    !!transferDate.value &&
    Number(transferAmount.value) > 0 &&
    !!transferReference.value.trim() &&
    !!proofFile.value
  )
})

watch(selectedSchoolId, (id) => {
  amountTouched.value = false
  transferReference.value = ''
  transferDate.value = todayIso()
  proofFile.value = null
  if (receiptInput.value) receiptInput.value.value = ''
  if (!id) {
    selectedIds.value = []
    transferAmount.value = ''
    return
  }
  applyRangeSelection()
})

watch([rangeFrom, rangeTo], () => {
  if (!selectedSchoolId.value) return
  applyRangeSelection()
})

watch(selectedIds, () => {
  if (!amountTouched.value) syncAmountFromSelection()
})

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function paymentDay(p: FeePayment): string {
  return String(p.paid_at || p.created_at || '').slice(0, 10)
}

function formatPaymentDay(p: FeePayment): string {
  const day = paymentDay(p)
  const [y, m, d] = day.split('-')
  if (!y || !m || !d) return day
  return `${d}/${m}/${y}`
}

function inDateRange(day: string, from: string, to: string) {
  if (!day) return false
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

function applyRangeSelection() {
  const from = rangeFrom.value
  const to = rangeTo.value
  if (!from && !to) {
    selectedIds.value = []
    if (!amountTouched.value) syncAmountFromSelection()
    return
  }
  selectedIds.value = schoolPayments.value
    .filter((p) => inDateRange(paymentDay(p), from, to))
    .map((p) => p.id)
  if (!amountTouched.value) syncAmountFromSelection()
}

function syncAmountFromSelection() {
  const total = selectedReceiptsTotal.value
  transferAmount.value = total > 0 ? total.toFixed(3) : ''
  amountTouched.value = false
}

function studentName(p?: FeePayment | null) {
  if (!p) return '—'
  if (p.student) {
    const name = personFullName(p.student, locale.value)
    if (name) return name
  }
  return p.student_id
}

function paymentInitials(p: FeePayment) {
  const first = personFirstName(p.student, locale.value)
  const last = personLastName(p.student, locale.value).replace(/^ال/, '')
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  return initials || '?'
}

function onReceiptPicked(event: Event) {
  const input = event.target as HTMLInputElement
  proofFile.value = input.files?.[0] ?? null
}

async function openProof(url: string) {
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

function formatRowAmount(v: string | number) {
  const n = Number(v || 0)
  return Number.isFinite(n) ? n.toFixed(3) : '0.000'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    ready.value = await feesV2Service.listPendingReconcile()
    if (selectedSchoolId.value && !schoolOptions.value.some((s) => s.id === selectedSchoolId.value)) {
      selectedSchoolId.value = ''
      selectedIds.value = []
    } else if (selectedSchoolId.value) {
      applyRangeSelection()
    }
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformFeeTransfers.loadError')
    ready.value = []
  } finally {
    loading.value = false
  }
}

async function sendTransfer() {
  if (!canSend.value || !selectedSchoolId.value) return
  if (!proofFile.value) {
    error.value = t('platformFeeTransfers.receiptRequired')
    return
  }
  sending.value = true
  error.value = ''
  try {
    await feesV2Service.createFeeTransfer({
      school_id: selectedSchoolId.value,
      payment_ids: [...selectedIds.value],
      reference: transferReference.value.trim(),
      transferred_at: transferDate.value,
      amount: Number(transferAmount.value),
      file: proofFile.value,
    })
    feedback.success(t('platformFeeTransfers.sendSuccess'))
    await router.push('/platform/transfers')
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformFeeTransfers.actionError')
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  transferDate.value = todayIso()
  void load()
})
</script>
