<template>
  <DashboardLayout>
    <div class="space-y-4 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="rounded-2xl bg-gradient-to-r from-primary-700 to-teal-600 p-6 text-white shadow-lg">
        <h1 class="text-2xl font-bold">{{ $t('feesV2.studentChargesTitle') }}</h1>
        <p class="text-sm text-primary-50/95 mt-1">{{ $t('feesV2.studentChargesSubtitle') }}</p>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden lg:col-span-1">
          <div class="p-4 border-b border-gray-100">
            <input v-model="search" type="search" :placeholder="$t('studentPayments.searchPlaceholder')" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          <div v-if="loadingList" class="flex flex-col items-center justify-center py-16 text-gray-500">
            <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" aria-hidden="true" />
            <span class="mt-2 text-sm">{{ $t('common.loading') }}</span>
          </div>
          <div v-else-if="listError" class="px-4 py-8 text-center text-sm text-red-700">{{ listError }}</div>
          <div v-else-if="!filteredStudents.length" class="px-4 py-10 text-center">
            <p class="text-sm font-medium text-gray-700">{{ $t('studentPayments.noStudents') }}</p>
            <p v-if="search.trim()" class="mt-1 text-xs text-gray-500">{{ $t('studentPayments.tryClearSearch') }}</p>
          </div>
          <ul v-else class="max-h-[28rem] overflow-y-auto divide-y divide-gray-50">
            <li v-for="s in filteredStudents" :key="s.id">
              <button
                type="button"
                @click="selectStudent(s)"
                :class="[
                  'w-full text-start px-4 py-3 transition-colors',
                  selectedId === s.id ? 'bg-primary-50 border-s-4 border-primary-500' : 'hover:bg-gray-50',
                ]"
              >
                <div class="font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ gradeLabel(s) || $t('feesV2.noGrade') }}</div>
              </button>
            </li>
          </ul>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <div v-if="!selectedId" class="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center text-gray-500 text-sm">
            {{ $t('feesV2.selectStudent') }}
          </div>

          <template v-else>
            <div v-if="loadingSheet" class="text-center py-16 text-gray-500">{{ $t('common.loading') }}</div>
            <template v-else-if="sheet">
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div class="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                  <p class="text-xs text-gray-500">{{ $t('feesV2.totalList') }}</p>
                  <p class="text-lg font-bold text-gray-900 tabular-nums">{{ fmt(sheet.list_total) }}</p>
                </div>
                <div class="rounded-xl bg-violet-50 border border-violet-200/80 p-4">
                  <p class="text-xs text-violet-800">{{ $t('feesV2.discounts') }}</p>
                  <p class="text-lg font-bold text-violet-900 tabular-nums">−{{ fmt(sheet.discount_total) }}</p>
                </div>
                <div class="rounded-xl bg-amber-50 border border-amber-200/80 p-4">
                  <p class="text-xs text-amber-800">{{ $t('feesV2.upfrontDue') }}</p>
                  <p class="text-lg font-bold text-amber-900 tabular-nums">{{ fmt(sheet.upfront_due) }}</p>
                </div>
                <div class="rounded-xl bg-sky-50 border border-sky-200/80 p-4">
                  <p class="text-xs text-sky-800">{{ $t('feesV2.installmentDue') }}</p>
                  <p class="text-lg font-bold text-sky-900 tabular-nums">{{ fmt(sheet.installment_due) }}</p>
                </div>
                <div class="rounded-xl bg-emerald-50 border border-emerald-200/80 p-4">
                  <p class="text-xs text-emerald-800">{{ $t('feesV2.paid') }}</p>
                  <p class="text-lg font-bold text-emerald-900 tabular-nums">{{ fmt(sheet.paid_total) }}</p>
                </div>
              </div>

              <div class="rounded-2xl border border-gray-200 bg-white p-4 flex flex-wrap gap-3 items-end shadow-sm">
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('feesV2.installmentPlan') }}</label>
                  <select v-model="selectedPlanId" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <option value="">{{ $t('feesV2.noPlan') }}</option>
                    <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <button type="button" @click="applyPlan" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                  {{ $t('feesV2.applyPlan') }}
                </button>
                <button type="button" @click="refreshSheet" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {{ $t('feesV2.refreshCharges') }}
                </button>
                <button
                  v-if="Number(sheet.upfront_due) > 0"
                  type="button"
                  @click="payAllUpfront"
                  class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  {{ $t('feesV2.payUpfront') }}
                </button>
              </div>

              <!-- Discounts -->
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div class="px-5 py-3 border-b border-gray-100 bg-violet-50/50 flex items-center justify-between">
                  <h2 class="text-sm font-semibold text-violet-900">{{ $t('feesV2.discounts') }}</h2>
                  <button type="button" @click="addDiscountRow" class="text-xs font-medium text-violet-700 hover:text-violet-900">+ {{ $t('feesV2.addDiscount') }}</button>
                </div>
                <div v-if="!discountRows.length" class="px-5 py-4 text-sm text-gray-500">{{ $t('feesV2.noDiscounts') }}</div>
                <div v-else class="divide-y divide-gray-100">
                  <div v-for="(row, idx) in discountRows" :key="idx" class="flex flex-wrap items-center gap-3 px-5 py-3">
                    <select v-model="row.discount_type_id" class="flex-1 min-w-[160px] rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
                      <option value="">{{ $t('feesV2.chooseDiscount') }}</option>
                      <option v-for="d in discountTypes" :key="d.id" :value="d.id">{{ d.label }}</option>
                    </select>
                    <input v-model.number="row.amount" type="number" min="0" step="0.001" dir="ltr" class="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-end font-mono text-sm" />
                    <button type="button" @click="discountRows.splice(idx, 1)" class="text-red-600 text-xs font-medium hover:text-red-800">{{ $t('common.delete') }}</button>
                  </div>
                </div>
                <div v-if="discountRows.length" class="px-5 py-3 border-t border-gray-100 flex justify-end">
                  <button type="button" @click="saveDiscounts" :disabled="savingDiscounts" class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                    {{ $t('feesV2.saveDiscounts') }}
                  </button>
                </div>
              </div>

              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div class="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.chargeLines') }}</h2>
                </div>
                <table class="min-w-full text-sm">
                  <thead class="text-xs uppercase text-gray-500 bg-gray-50">
                    <tr>
                      <th class="text-start px-5 py-2">{{ $t('feesV2.charge') }}</th>
                      <th class="text-end px-3 py-2">{{ $t('feesV2.list') }}</th>
                      <th class="text-end px-3 py-2">{{ $t('feesV2.due') }}</th>
                      <th class="text-end px-5 py-2">{{ $t('feesV2.status') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="line in sheet.lines" :key="line.id" class="hover:bg-gray-50/50">
                      <td class="px-5 py-3">
                        <div class="font-medium text-gray-900">{{ line.charge_label }}</div>
                        <div class="text-[10px] text-gray-400 uppercase mt-0.5">{{ line.source_type }}</div>
                      </td>
                      <td class="px-3 py-3 text-end font-mono tabular-nums text-gray-600">{{ fmt(line.list_amount) }}</td>
                      <td class="px-3 py-3 text-end font-mono tabular-nums font-semibold text-gray-900">{{ fmt(line.due_amount) }}</td>
                      <td class="px-5 py-3 text-end">
                        <span :class="statusClass(line.status)" class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold">
                          {{ $t(`feesV2.status_${line.status}`) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="sheet.installments?.length" class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div class="px-5 py-3 border-b border-gray-100">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.schedule') }}</h2>
                </div>
                <div class="divide-y divide-gray-100">
                  <div v-for="inst in sheet.installments" :key="inst.id" class="flex items-center justify-between px-5 py-3 gap-3">
                    <div>
                      <span class="font-medium text-gray-900">{{ inst.label || `${$t('feesV2.installment')} ${inst.sequence}` }}</span>
                      <span v-if="inst.month_number" class="ms-2 text-xs text-gray-500">· {{ $t('feesV2.month') }} {{ inst.month_number }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="text-end">
                        <div class="font-mono font-semibold tabular-nums">{{ fmt(inst.amount_paid) }} / {{ fmt(inst.amount_due) }}</div>
                        <span :class="statusClass(inst.status)" class="text-xs font-medium">{{ $t(`feesV2.status_${inst.status}`) }}</span>
                      </div>
                      <button
                        v-if="inst.status !== 'paid'"
                        type="button"
                        @click="payInstallment(inst)"
                        class="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                      >
                        {{ $t('feesV2.pay') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { studentService, type Student } from '@/services'
import { feesV2Service, type StudentChargeSheet, type InstallmentPlan } from '@/services/fees-v2.service'
import paymentConfigService, { type PaymentCatalogRow } from '@/services/payment-config.service'
import { authService } from '@/services'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const students = ref<Student[]>([])
const search = ref('')
const selectedId = ref<string | null>(null)
const sheet = ref<StudentChargeSheet | null>(null)
const loadingSheet = ref(false)
const loadingList = ref(true)
const listError = ref('')
const plans = ref<InstallmentPlan[]>([])
const selectedPlanId = ref('')
const discountTypes = ref<PaymentCatalogRow[]>([])
const discountRows = ref<Array<{ discount_type_id: string; amount: number }>>([])
const savingDiscounts = ref(false)

const schoolId = computed(() => authService.getStoredUser()?.school_id ?? 1)

const filteredStudents = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return students.value
  return students.value.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q))
})

function fmt(v: string | number) {
  return Number(v || 0).toFixed(3)
}

function gradeLabel(s: Student) {
  const pl = (s as Student & { paymentLevel?: { name?: string } }).paymentLevel
  return pl?.name || ''
}

function statusClass(status: string) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-800'
  if (status === 'partial') return 'bg-amber-100 text-amber-800'
  if (status === 'waived') return 'bg-gray-100 text-gray-600'
  return 'bg-sky-100 text-sky-800'
}

function syncDiscountRows() {
  discountRows.value = (sheet.value?.discountLines || []).map((d) => ({
    discount_type_id: d.discount_type_id,
    amount: Number(d.amount) || 0,
  }))
}

async function loadStudents() {
  loadingList.value = true
  listError.value = ''
  try {
    const sid = Number(schoolId.value)
    const rows = await studentService.getAll()
    students.value = rows.filter((s) => s.school_id == null || Number(s.school_id) === sid)
  } catch (e: unknown) {
    students.value = []
    const err = e as { message?: string }
    listError.value = err?.message || t('studentPayments.loadError')
  } finally {
    loadingList.value = false
  }
}

async function selectStudent(s: Student) {
  selectedId.value = s.id
  loadingSheet.value = true
  try {
    sheet.value = await feesV2Service.getStudentChargeSheet(s.id)
    selectedPlanId.value = sheet.value.installment_plan_id || ''
    syncDiscountRows()
  } catch {
    sheet.value = null
  } finally {
    loadingSheet.value = false
  }
}

async function refreshSheet() {
  if (!selectedId.value) return
  loadingSheet.value = true
  try {
    sheet.value = await feesV2Service.refreshStudentChargeSheet(selectedId.value)
    selectedPlanId.value = sheet.value.installment_plan_id || ''
    syncDiscountRows()
  } finally {
    loadingSheet.value = false
  }
}

async function applyPlan() {
  if (!selectedId.value) return
  sheet.value = await feesV2Service.assignInstallmentPlan(selectedId.value, selectedPlanId.value || null)
  syncDiscountRows()
}

function addDiscountRow() {
  discountRows.value.push({ discount_type_id: '', amount: 0 })
}

async function saveDiscounts() {
  if (!selectedId.value) return
  savingDiscounts.value = true
  try {
    const valid = discountRows.value.filter((r) => r.discount_type_id && r.amount > 0)
    sheet.value = await feesV2Service.setChargeSheetDiscounts(selectedId.value, valid)
    syncDiscountRows()
  } finally {
    savingDiscounts.value = false
  }
}

async function payAllUpfront() {
  if (!selectedId.value || !sheet.value) return
  const amt = Number(sheet.value.upfront_due)
  if (amt <= 0) return
  sheet.value = await feesV2Service.payUpfront(selectedId.value, amt)
  syncDiscountRows()
}

async function payInstallment(inst: { id: string; amount_due: string; amount_paid: string }) {
  const balance = Number(inst.amount_due) - Number(inst.amount_paid)
  if (balance <= 0 || !selectedId.value) return
  sheet.value = await feesV2Service.payInstallment(inst.id, balance)
  syncDiscountRows()
}

onMounted(async () => {
  await loadStudents()
  try {
    plans.value = await feesV2Service.listInstallmentPlans(schoolId.value)
    discountTypes.value = await paymentConfigService.listDiscountTypes(schoolId.value)
  } catch {
    plans.value = []
    discountTypes.value = []
  }
})
</script>
