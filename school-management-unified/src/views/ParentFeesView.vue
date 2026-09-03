<template>
  <DashboardLayout>
    <div class="space-y-8 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 p-6 text-white shadow-xl sm:p-8"
      >
        <div class="relative">
          <p class="text-sm font-medium uppercase tracking-wider text-emerald-100/90">{{ $t('parentFees.kicker') }}</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('parentFees.title') }}</h1>
          <p class="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/95 sm:text-base">{{ $t('parentFees.subtitle') }}</p>
        </div>
      </section>

      <div v-if="loadingChildren" class="flex items-center justify-center gap-3 py-10 text-gray-600">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="childrenError" class="rounded-xl border border-red-200 bg-red-50/90 p-6 text-center text-red-800">
        <p class="font-medium">{{ childrenError }}</p>
        <button type="button" class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white" @click="loadChildren">{{ $t('common.retry') }}</button>
      </div>

      <template v-else>
        <div v-if="!children.length" class="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-gray-600">
          {{ $t('parentFees.noChildren') }}
        </div>

        <template v-else>
          <div class="flex flex-wrap gap-2 sm:gap-3">
            <button
              v-for="c in children"
              :key="c.id"
              type="button"
              class="group flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3 text-start shadow-sm transition-all sm:min-w-[12rem]"
              :class="selectedId === c.id ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-white ring-2 ring-teal-500/30' : 'border-gray-200 bg-white hover:border-teal-200'"
              @click="selectChild(c.id)"
            >
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" :class="selectedId === c.id ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gray-400 group-hover:bg-teal-500'">
                {{ initials(c) }}
              </span>
              <span class="min-w-0">
                <span class="block truncate font-semibold text-gray-900">{{ c.firstName }} {{ c.lastName }}</span>
                <span v-if="c.groupNames" class="mt-0.5 block truncate text-xs text-gray-500">{{ c.groupNames }}</span>
              </span>
            </button>
          </div>

          <div v-if="selectedId" class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg">
            <div v-if="detailLoading" class="flex flex-col items-center justify-center gap-3 py-20 text-gray-600">
              <span class="h-12 w-12 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              <span>{{ $t('parentFees.loadingDetail') }}</span>
            </div>

            <div v-else-if="detailError" class="border-b border-amber-100 bg-amber-50/90 p-6 text-amber-950">
              <p class="text-sm">{{ detailError }}</p>
              <button type="button" class="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white" @click="reloadDetail">{{ $t('common.retry') }}</button>
            </div>

            <div v-else-if="sheet" class="p-5 sm:p-8 space-y-8">
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-xl border border-gray-100 bg-slate-50/80 p-4">
                  <p class="text-xs font-medium uppercase text-gray-500">{{ $t('feesV2.totalList') }}</p>
                  <p class="mt-1 text-xl font-bold tabular-nums">{{ formatMoney(sheet.list_total) }}</p>
                </div>
                <div class="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                  <p class="text-xs font-medium uppercase text-violet-700/80">{{ $t('feesV2.discounts') }}</p>
                  <p class="mt-1 text-xl font-bold tabular-nums text-violet-950">−{{ formatMoney(sheet.discount_total) }}</p>
                </div>
                <div class="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50/80 p-4 sm:col-span-2">
                  <p class="text-xs font-medium uppercase text-teal-800/80">{{ $t('studentPayments.amountDue') }}</p>
                  <p class="mt-1 text-2xl font-extrabold tabular-nums text-teal-950">{{ formatMoney(sheet.due_total) }}</p>
                  <p v-if="sheet.student?.paymentLevel?.name" class="mt-1 text-xs text-teal-800">{{ sheet.student.paymentLevel.name }}</p>
                </div>
              </div>

              <div v-if="sheet.discountLines?.length" class="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <h2 class="text-sm font-semibold text-gray-800 mb-2">{{ $t('parentFees.appliedDiscounts') }}</h2>
                <ul class="divide-y divide-gray-100">
                  <li v-for="d in sheet.discountLines" :key="d.id" class="flex justify-between py-2 text-sm">
                    <span>{{ d.discountType?.label || d.discount_type_id }}</span>
                    <span class="font-semibold text-emerald-700">−{{ formatMoney(d.amount) }}</span>
                  </li>
                </ul>
              </div>

              <div class="rounded-xl border border-gray-100 overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.chargeLines') }}</h2>
                </div>
                <table class="min-w-full text-sm">
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="line in sheet.lines" :key="line.id">
                      <td class="px-4 py-3">{{ line.charge_label }}</td>
                      <td class="px-4 py-3 text-end font-mono">{{ formatMoney(line.due_amount) }}</td>
                      <td class="px-4 py-3 text-end">
                        <span class="text-xs font-medium rounded-full px-2 py-0.5" :class="statusClass(line.status)">{{ $t(`feesV2.status_${line.status}`) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="Number(sheet.upfront_due) > 0" class="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <div>
                  <p class="text-sm font-medium text-amber-900">{{ $t('feesV2.upfrontDue') }}</p>
                  <p class="text-xl font-bold tabular-nums text-amber-950">{{ formatMoney(sheet.upfront_due) }}</p>
                </div>
                <button type="button" class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700" @click="payUpfront">
                  {{ $t('feesV2.payUpfront') }}
                </button>
              </div>

              <div v-if="sheet.installments?.length">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ $t('feesV2.schedule') }}</h2>
                <div class="space-y-3">
                  <div v-for="inst in sheet.installments" :key="inst.id" class="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                    <div>
                      <p class="font-medium text-gray-900">{{ inst.label || `${$t('feesV2.installment')} ${inst.sequence}` }}</p>
                      <p class="text-sm text-gray-600 tabular-nums">{{ formatMoney(inst.amount_paid) }} / {{ formatMoney(inst.amount_due) }}</p>
                    </div>
                    <button
                      v-if="inst.status !== 'paid'"
                      type="button"
                      class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                      @click="payInstallment(inst)"
                    >
                      {{ $t('feesV2.pay') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { parentService } from '@/services/parent.service'
import { feesV2Service, type StudentChargeSheet } from '@/services/fees-v2.service'

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
const sheet = ref<StudentChargeSheet | null>(null)
const detailLoading = ref(false)
const detailError = ref('')

function initials(c: DashboardChild) {
  const a = (c.firstName || '').trim().charAt(0)
  const b = (c.lastName || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
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

function statusClass(status: string) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-800'
  if (status === 'partial') return 'bg-amber-100 text-amber-800'
  return 'bg-sky-100 text-sky-800'
}

function extractApiMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string | string[] } }; message?: string }
  const raw = err?.response?.data?.message
  if (Array.isArray(raw)) return raw.filter(Boolean).join('. ')
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return typeof err?.message === 'string' ? err.message : ''
}

async function loadChildren() {
  loadingChildren.value = true
  childrenError.value = ''
  try {
    const dash = await parentService.getMyDashboardData()
    children.value = (dash?.children ?? []).map((c: DashboardChild) => ({ ...c, id: String(c.id) }))
    if (!selectedId.value && children.value.length) selectedId.value = children.value[0].id
  } catch (e) {
    childrenError.value = extractApiMessage(e) || t('parent.error')
  } finally {
    loadingChildren.value = false
  }
}

async function loadDetailFor(studentId: string) {
  detailLoading.value = true
  detailError.value = ''
  sheet.value = null
  try {
    sheet.value = await feesV2Service.getStudentChargeSheet(studentId)
  } catch (e) {
    detailError.value = extractApiMessage(e) || t('parentFees.noFeeRecords')
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

async function payUpfront() {
  if (!selectedId.value || !sheet.value) return
  const amt = Number(sheet.value.upfront_due)
  if (amt <= 0) return
  sheet.value = await feesV2Service.payUpfront(selectedId.value, amt)
}

async function payInstallment(inst: { id: string; amount_due: string; amount_paid: string }) {
  const balance = Number(inst.amount_due) - Number(inst.amount_paid)
  if (balance <= 0) return
  sheet.value = await feesV2Service.payInstallment(inst.id, balance)
}

watch(selectedId, (id) => {
  if (id) loadDetailFor(id)
})

onMounted(loadChildren)
</script>
