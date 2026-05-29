<template>
  <DashboardLayout>
    <div class="space-y-8 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Hero -->
      <section
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 p-6 text-white shadow-xl sm:p-8"
      >
        <div
          class="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"
          aria-hidden="true"
        />
        <div class="relative">
          <p class="text-sm font-medium uppercase tracking-wider text-emerald-100/90">
            {{ $t('parentFees.kicker') }}
          </p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {{ $t('parentFees.title') }}
          </h1>
          <p class="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/95 sm:text-base">
            {{ $t('parentFees.subtitle') }}
          </p>
        </div>
      </section>

      <!-- Loading children -->
      <div v-if="loadingChildren" class="flex items-center justify-center gap-3 py-10 text-gray-600">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" aria-hidden="true" />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="childrenError" class="rounded-xl border border-red-200 bg-red-50/90 p-6 text-center text-red-800 shadow-sm">
        <p class="font-medium">{{ childrenError }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
          @click="loadChildren"
        >
          {{ $t('common.retry') }}
        </button>
      </div>

      <template v-else>
        <div v-if="!children.length" class="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-gray-600">
          {{ $t('parentFees.noChildren') }}
        </div>

        <template v-else>
          <!-- Child selector -->
          <div class="flex flex-wrap gap-2 sm:gap-3">
            <button
              v-for="c in children"
              :key="c.id"
              type="button"
              class="group flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3 text-start shadow-sm transition-all sm:min-w-[12rem]"
              :class="
                selectedId === c.id
                  ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-white ring-2 ring-teal-500/30'
                  : 'border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50/40'
              "
              @click="selectChild(c.id)"
            >
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-inner"
                :class="selectedId === c.id ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gray-400 group-hover:bg-teal-500'"
              >
                {{ initials(c) }}
              </span>
              <span class="min-w-0">
                <span class="block truncate font-semibold text-gray-900">{{ c.firstName }} {{ c.lastName }}</span>
                <span v-if="c.groupNames" class="mt-0.5 block truncate text-xs text-gray-500">{{ c.groupNames }}</span>
              </span>
            </button>
          </div>

          <!-- Detail panel -->
          <div
            v-if="selectedId"
            class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg shadow-gray-200/40 ring-1 ring-black/[0.03]"
          >
            <div v-if="detailLoading" class="flex flex-col items-center justify-center gap-3 py-20 text-gray-600">
              <span class="h-12 w-12 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              <span>{{ $t('parentFees.loadingDetail') }}</span>
            </div>

            <div v-else-if="detailError" class="border-b border-amber-100 bg-amber-50/90 p-6 text-amber-950">
              <p class="text-sm leading-relaxed">{{ detailError }}</p>
              <button
                type="button"
                class="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                @click="reloadDetail"
              >
                {{ $t('common.retry') }}
              </button>
            </div>

            <div v-else-if="paymentBlocks.length" class="p-5 sm:p-8 space-y-10">
              <section v-for="(detail, blockIndex) in paymentBlocks" :key="detail.payment.id" class="space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{
                    detail.payment.payment_kind === 'course'
                      ? detail.payment.course?.name || $t('courseEnrollment.courseFees')
                      : $t('parentFees.levelFeesSection')
                  }}
                </h2>
              </div>
              <!-- Summary strip -->
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border border-gray-100 bg-slate-50/80 p-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ $t('studentPayments.subtotal') }}</p>
                  <p class="mt-1 text-xl font-bold tabular-nums text-slate-900">
                    {{ formatMoney(detail.subtotal, blockCurrency(detail)) }}
                  </p>
                </div>
                <div class="rounded-xl border border-gray-100 bg-violet-50/60 p-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-violet-700/80">{{ $t('studentPayments.discounts') }}</p>
                  <p class="mt-1 text-xl font-bold tabular-nums text-violet-950">
                    −{{ formatMoney(detail.discountTotal, blockCurrency(detail)) }}
                  </p>
                </div>
                <div class="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50/80 p-4 sm:col-span-2 lg:col-span-2">
                  <p class="text-xs font-medium uppercase tracking-wide text-teal-800/80">{{ $t('studentPayments.amountDue') }}</p>
                  <div class="mt-1 flex flex-wrap items-end justify-between gap-3">
                    <p class="text-2xl font-extrabold tracking-tight text-teal-950 tabular-nums sm:text-3xl">
                      {{ formatMoney(detail.payable, blockCurrency(detail)) }}
                    </p>
                    <span
                      v-if="detail.payment.level?.name"
                      class="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-teal-900 shadow-sm ring-1 ring-teal-200/60"
                    >
                      {{ detail.payment.level.name }}
                    </span>
                    <span
                      v-else-if="detail.payment.course?.name"
                      class="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-sky-900 shadow-sm ring-1 ring-sky-200/60"
                    >
                      {{ detail.payment.course.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Discount lines (read-only) -->
              <div v-if="detail.payment.discountLines?.length" class="mb-8">
                <h2 class="mb-3 text-sm font-semibold text-gray-800">{{ $t('parentFees.appliedDiscounts') }}</h2>
                <ul class="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/50">
                  <li
                    v-for="line in detail.payment.discountLines"
                    :key="line.id"
                    class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span class="text-sm text-gray-800">{{ line.discountType?.label || line.discount_type_id }}</span>
                    <span class="text-sm font-semibold tabular-nums text-emerald-700">−{{ formatMoney(Number(line.amount), blockCurrency(detail)) }}</span>
                  </li>
                </ul>
              </div>

              <!-- Installments -->
              <div v-if="detail.installmentSchedule && detail.installmentSchedule.rows.length">
                <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">{{ $t('studentPayments.installmentsTitle') }}</h2>
                    <p class="mt-1 text-sm text-gray-600">
                      {{
                        $t('studentPayments.installmentsSummary', {
                          paid: formatMoney(detail.installmentSchedule.paid_total, blockCurrency(detail)),
                          total: formatMoney(detail.installmentSchedule.scheduled_total, blockCurrency(detail)),
                          currency: blockCurrency(detail),
                        })
                      }}
                    </p>
                    <p
                      v-if="(detail.installmentSchedule.downpayment_total ?? 0) > 0"
                      class="mt-1 text-sm font-medium text-amber-950"
                    >
                      {{ $t('paymentSettings.packagePickerDownpayment') }}:
                      <span class="tabular-nums">{{ formatMoney(detail.installmentSchedule.downpayment_total ?? 0, blockCurrency(detail)) }}</span>
                    </p>
                  </div>
                  <div class="h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200 sm:w-48">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                      :style="{ width: `${installmentPercentFor(detail)}%` }"
                    />
                  </div>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="row in detail.installmentSchedule.rows"
                    :key="row.installment_id"
                    class="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div class="flex flex-wrap items-center gap-3">
                      <span
                        class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white tabular-nums"
                        :class="row.is_downpayment ? 'bg-amber-600' : 'bg-gray-900'"
                      >
                        {{ row.is_downpayment ? 'DP' : row.sequence }}
                      </span>
                      <div>
                        <p class="font-medium text-gray-900">
                          {{
                            row.is_downpayment
                              ? $t('paymentSettings.advanceInstallmentLabel')
                              : row.label || $t('parentFees.installmentDefaultLabel', { n: row.sequence })
                          }}
                        </p>
                        <p class="text-xs text-gray-500">
                          <span v-if="row.month_number != null">{{ $t('studentPayments.installmentMonth') }}: {{ row.month_number }}</span>
                          <span class="mx-1 text-gray-300" v-if="row.month_number != null">·</span>
                          <span class="font-semibold tabular-nums text-gray-800">{{ formatMoney(Number(row.scheduled_amount), blockCurrency(detail)) }}</span>
                        </p>
                      </div>
                      <span
                        v-if="row.paid"
                        class="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
                      >
                        {{ $t('studentPayments.installmentBadgePaid') }}
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
                      >
                        {{ $t('studentPayments.installmentBadgeDue') }}
                      </span>
                    </div>
                    <div class="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <template v-if="row.paid">
                        <span class="text-xs text-gray-500">{{ formatPaidAt(row.paid.paid_at) }}</span>
                      </template>
                      <button
                        v-else
                        type="button"
                        class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:from-teal-700 hover:to-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        @click="openPayModal(row, blockIndex)"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        {{ $t('parentFees.payNow') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- One-time / no installment UI -->
              <div
                v-else
                class="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-white p-6 text-sky-950 shadow-inner"
              >
                <h2 class="text-base font-semibold">{{ $t('parentFees.oneTimeTitle') }}</h2>
                <p class="mt-2 text-sm leading-relaxed text-sky-900/85">
                  {{ $t('parentFees.oneTimeBody') }}
                </p>
                <p class="mt-4 text-lg font-bold tabular-nums text-sky-950">
                  {{ $t('studentPayments.amountDue') }}: {{ formatMoney(detail.payable, currency) }}
                </p>
              </div>
              </section>
            </div>
            <div v-else class="p-8 text-center text-sm text-gray-500">{{ $t('parentFees.noFeeRecords') }}</div>
          </div>
        </template>
      </template>

      <!-- Pay modal -->
      <Teleport to="body">
        <div
          v-if="payModalOpen && payRow"
          class="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'pay-modal-title'"
          @click.self="closePayModal"
        >
          <div
            class="w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
            @click.stop
          >
            <div class="bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-4 text-white">
              <h2 id="pay-modal-title" class="text-lg font-bold">{{ $t('parentFees.payModalTitle') }}</h2>
              <p class="mt-1 text-sm text-teal-50">
                {{ payRow.label || $t('parentFees.installmentDefaultLabel', { n: payRow.sequence }) }}
              </p>
            </div>
            <div class="space-y-4 p-5">
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600">{{ $t('studentPayments.installmentAmount') }}</label>
                <input
                  v-model.number="payForm.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 tabular-nums shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600">{{ $t('studentPayments.installmentPayRemarks') }}</label>
                <input
                  v-model="payForm.remarks"
                  type="text"
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  :placeholder="$t('parentFees.remarksPlaceholder')"
                />
              </div>
              <div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  :disabled="paySubmitting"
                  @click="closePayModal"
                >
                  {{ $t('studentPayments.installmentCancelPay') }}
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
                  :disabled="paySubmitting"
                  @click="submitPay"
                >
                  <span v-if="paySubmitting" class="me-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {{ $t('parentFees.confirmPay') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { parentService } from '@/services/parent.service'
import studentPaymentService, {
  type StudentPaymentSnapshot,
  type StudentInstallmentScheduleRow,
} from '@/services/student-payment.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

interface DashboardChild {
  id: string
  firstName: string
  lastName: string
  groupNames?: string
}

const loadingChildren = ref(true)
const childrenError = ref('')
const children = ref<DashboardChild[]>([])
const selectedId = ref<string | null>(null)
const paymentBlocks = ref<StudentPaymentSnapshot[]>([])
const activeBlockIndex = ref(0)
const detailLoading = ref(false)
const detailError = ref('')

const payModalOpen = ref(false)
const payRow = ref<StudentInstallmentScheduleRow | null>(null)
const payForm = ref({ amount: 0, remarks: '' })
const paySubmitting = ref(false)

const currency = computed(() => paymentBlocks.value[activeBlockIndex.value]?.payment?.currency || 'OMR')

function blockCurrency(detail: StudentPaymentSnapshot) {
  return detail.payment?.currency || 'OMR'
}

function installmentPercentFor(detail: StudentPaymentSnapshot) {
  const s = detail.installmentSchedule
  if (!s || s.scheduled_total <= 0) return 0
  return Math.min(100, Math.round((s.paid_total / s.scheduled_total) * 1000) / 10)
}

function extractApiMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string | string[] } }; message?: string }
  const raw = err?.response?.data?.message
  if (Array.isArray(raw)) return raw.filter(Boolean).join('. ')
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return typeof err?.message === 'string' && err.message.trim() ? err.message.trim() : ''
}

function resolveEnsureErrorMessage(e: unknown): string {
  const msg = extractApiMessage(e)
  if (msg === 'STUDENT_PAYMENT_NO_FEE_LEVEL') {
    return t('studentPayments.errorNoFeeLevel')
  }
  return msg || t('studentPayments.ensureError')
}

function initials(c: DashboardChild): string {
  const a = (c.firstName || '').trim().charAt(0)
  const b = (c.lastName || '').trim().charAt(0)
  const out = `${a}${b}`.toUpperCase()
  return out || '?'
}

function formatMoney(n: number, curr: string): string {
  const v = Number.isFinite(n) ? n : 0
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
      style: 'currency',
      currency: curr || 'OMR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v)
  } catch {
    return `${v.toFixed(2)} ${curr}`
  }
}

function formatPaidAt(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : undefined, { dateStyle: 'medium' })
  } catch {
    return iso
  }
}

async function loadChildren() {
  loadingChildren.value = true
  childrenError.value = ''
  try {
    const dash = await parentService.getMyDashboardData()
    const list = (dash?.children ?? []) as DashboardChild[]
    children.value = list.map((c) => ({
      ...c,
      id: String(c.id),
    }))
    if (!selectedId.value && list.length) {
      selectedId.value = list[0].id
    } else if (selectedId.value && !list.some((c) => c.id === selectedId.value)) {
      selectedId.value = list[0]?.id ?? null
    }
  } catch (e) {
    childrenError.value = extractApiMessage(e) || t('parent.error')
  } finally {
    loadingChildren.value = false
  }
}

async function loadDetailFor(studentId: string) {
  detailLoading.value = true
  detailError.value = ''
  paymentBlocks.value = []
  try {
    let rows = await studentPaymentService.listAllForStudent(studentId)
    const hasLevel = rows.some((r) => r.payment.payment_kind !== 'course' && !r.payment.course_id)
    if (!hasLevel) {
      try {
        await studentPaymentService.ensure(studentId)
        rows = await studentPaymentService.listAllForStudent(studentId)
      } catch (e) {
        if (!rows.length) {
          detailError.value = resolveEnsureErrorMessage(e)
          return
        }
      }
    }
    rows.sort((a, b) => {
      const aCourse = a.payment.payment_kind === 'course' || !!a.payment.course_id
      const bCourse = b.payment.payment_kind === 'course' || !!b.payment.course_id
      if (aCourse === bCourse) return 0
      return aCourse ? 1 : -1
    })
    paymentBlocks.value = rows
    if (!rows.length) {
      detailError.value = t('parentFees.noFeeRecords')
    }
  } catch (e) {
    detailError.value = extractApiMessage(e) || t('parent.error')
  } finally {
    detailLoading.value = false
  }
}

function selectChild(id: string) {
  selectedId.value = id
}

function reloadDetail() {
  if (selectedId.value) loadDetailFor(selectedId.value)
}

function openPayModal(row: StudentInstallmentScheduleRow, blockIndex: number) {
  activeBlockIndex.value = blockIndex
  payRow.value = row
  payForm.value = {
    amount: Number(row.scheduled_amount),
    remarks: '',
  }
  payModalOpen.value = true
}

function closePayModal() {
  if (paySubmitting.value) return
  payModalOpen.value = false
  payRow.value = null
}

async function submitPay() {
  if (!selectedId.value || !payRow.value) return
  const amt = Number(payForm.value.amount)
  if (!amt || Number.isNaN(amt) || amt <= 0) return
  paySubmitting.value = true
  try {
    const updated = await studentPaymentService.recordInstallmentPayment(selectedId.value, payRow.value.installment_id, {
      amount: amt,
      remarks: payForm.value.remarks.trim() || undefined,
    })
    if (paymentBlocks.value[activeBlockIndex.value]) {
      paymentBlocks.value[activeBlockIndex.value] = updated
    }
    payModalOpen.value = false
    payRow.value = null
  } catch (e) {
    window.alert(extractApiMessage(e) || t('studentPayments.saveError'))
  } finally {
    paySubmitting.value = false
  }
}

watch(selectedId, (id) => {
  if (id) loadDetailFor(id)
})

onMounted(() => {
  loadChildren()
})
</script>
