<template>
  <div class="space-y-4">
    <div
      class="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50/80 p-1"
      role="tablist"
      :aria-label="$t('paymentSettings.packageBillingPeriodSwitcher')"
    >
      <button
        v-for="period in LEVEL_BILLING_PERIODS"
        :key="'inst-tab-' + period"
        type="button"
        role="tab"
        :aria-selected="activePeriod === period"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          activePeriod === period
            ? 'bg-white text-primary-800 shadow-sm ring-1 ring-gray-200/80'
            : 'text-gray-600 hover:text-gray-900'
        "
        @click="activePeriod = period"
      >
        {{ billingPeriodLabel(period) }}
      </button>
    </div>

    <template v-for="period in LEVEL_BILLING_PERIODS" :key="'inst-panel-' + period">
      <div v-show="activePeriod === period" class="space-y-4">
        <div
          class="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5 text-sm text-gray-700"
        >
          <span class="font-medium text-gray-900">{{ billingPeriodLabel(period) }}</span>
          <span class="text-gray-400" aria-hidden="true">·</span>
          <span>
            {{ $t('paymentSettings.packageLevelRowTotal') }}:
            <span class="font-semibold tabular-nums text-gray-900">{{ formatPeriodTotal(period) }}</span>
          </span>
          <span class="text-gray-400" aria-hidden="true">·</span>
          <label class="inline-flex flex-wrap items-center gap-1.5">
            <span class="font-medium text-gray-700">{{ $t('paymentSettings.packagePickerDownpayment') }}:</span>
            <input
              :value="downpayment[period]"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              :readonly="readonly"
              :tabindex="readonly ? -1 : undefined"
              class="w-24 rounded-sm border border-gray-300 bg-white px-2 py-0.5 text-center text-sm tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25 disabled:bg-gray-100 disabled:text-gray-600"
              :class="readonly ? 'cursor-default border-gray-200 bg-gray-100' : ''"
              :aria-label="`${$t('paymentSettings.packagePickerDownpayment')} — ${billingPeriodLabel(period)}`"
              @input="setDownpayment(period, ($event.target as HTMLInputElement).value)"
            />
          </label>
          <span class="text-gray-400" aria-hidden="true">·</span>
          <label class="inline-flex items-center gap-1.5">
            <span class="font-medium text-gray-700">{{ $t('paymentSettings.packagePickerInstallmentMonths') }}:</span>
            <input
              v-if="period === 'monthly'"
              value="1"
              type="text"
              readonly
              tabindex="-1"
              class="w-12 cursor-default rounded-sm border border-gray-200 bg-gray-100 px-2 py-0.5 text-center text-sm tabular-nums text-gray-600"
              :aria-label="$t('paymentSettings.packagePickerInstallmentMonths')"
            />
            <input
              v-else
              :value="installmentMonths[period]"
              type="number"
              min="1"
              max="36"
              :readonly="readonly"
              :tabindex="readonly ? -1 : undefined"
              class="w-14 rounded-sm border border-gray-300 bg-white px-2 py-0.5 text-center text-sm tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25 disabled:bg-gray-100 disabled:text-gray-600"
              :class="readonly ? 'cursor-default border-gray-200 bg-gray-100' : ''"
              :aria-label="$t('paymentSettings.packagePickerInstallmentMonths')"
              @input="onInstallmentMonthsInput(period, ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <div>
          <p class="mb-2 text-sm font-semibold text-gray-900">
            {{ $t('paymentSettings.packagePickerInstallmentSchedule') }}
          </p>
          <div class="overflow-hidden rounded-lg border border-gray-200">
            <table class="w-full table-fixed border-collapse text-sm">
              <colgroup>
                <col class="w-1/2" />
                <col class="w-1/2" />
              </colgroup>
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-start text-xs font-medium text-gray-600">
                    {{ $t('paymentSettings.packagePickerInstallmentMonthCol') }}
                  </th>
                  <th class="px-3 py-2 text-end text-xs font-medium text-gray-600">
                    {{ $t('paymentSettings.packagePickerInstallmentAmountCol') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="row in rowsForPeriod(period)"
                  :key="period + '-inst-' + row.index"
                >
                  <td class="px-2 py-1.5">
                    <input
                      :value="row.month"
                      type="number"
                      min="1"
                      max="12"
                      :readonly="readonly"
                      :tabindex="readonly ? -1 : undefined"
                      class="w-full max-w-[4.5rem] rounded-sm border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-600"
                      :class="readonly ? 'cursor-default border-gray-200 bg-gray-100' : ''"
                      @input="onScheduleMonthChange(period, row.index, ($event.target as HTMLInputElement).value)"
                    />
                  </td>
                  <td class="px-3 py-1.5 text-end tabular-nums text-gray-900">{{ formatMoney(row.amount) }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t border-gray-200 bg-gray-50">
                <tr>
                  <td class="px-3 py-2 text-sm font-medium text-gray-700">
                    {{ $t('paymentSettings.packageLevelRowTotal') }}
                  </td>
                  <td class="px-3 py-2 text-end text-sm font-bold tabular-nums text-gray-900">
                    {{ formatMoney(totalForPeriod(period)) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  LEVEL_BILLING_PERIODS,
  type LevelBillingPeriod,
  buildDefaultScheduleMonths,
  formatMoney,
  scheduleRowsForPeriod as computeScheduleRows,
  scheduleTotalForPeriod,
} from '@/utils/level-installment-schedule'

const props = defineProps<{
  totalsByPeriod: Record<LevelBillingPeriod, number>
  readonly?: boolean
}>()

const downpayment = defineModel<Record<LevelBillingPeriod, string>>('downpayment', { required: true })
const installmentMonths = defineModel<Record<LevelBillingPeriod, number>>('installmentMonths', {
  required: true,
})
const scheduleMonths = defineModel<Record<LevelBillingPeriod, number[]>>('scheduleMonths', {
  required: true,
})

const { t } = useI18n()
const activePeriod = ref<LevelBillingPeriod>('yearly')

function billingPeriodLabel(period: LevelBillingPeriod) {
  if (period === 'monthly') return t('paymentSettings.packageBillingMonthly')
  if (period === 'semester') return t('paymentSettings.packageBillingSemester')
  return t('paymentSettings.packageBillingYearly')
}

function formatPeriodTotal(period: LevelBillingPeriod): string {
  const n = props.totalsByPeriod[period] ?? 0
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function installmentCount(period: LevelBillingPeriod): number {
  if (period === 'monthly') return 1
  const n = Number(installmentMonths.value[period])
  return Math.max(1, Math.min(36, Math.round(n) || 1))
}

function ensureScheduleForPeriod(period: LevelBillingPeriod) {
  const count = installmentCount(period)
  const existing = scheduleMonths.value[period] ?? []
  if (existing.length === count) return
  scheduleMonths.value = {
    ...scheduleMonths.value,
    [period]: buildDefaultScheduleMonths(count, existing[0] ?? 1),
  }
}

function rowsForPeriod(period: LevelBillingPeriod) {
  ensureScheduleForPeriod(period)
  return computeScheduleRows(
    period,
    props.totalsByPeriod[period] ?? 0,
    downpayment.value[period] ?? '',
    installmentMonths.value[period],
    scheduleMonths.value[period] ?? [],
  )
}

function totalForPeriod(period: LevelBillingPeriod): number {
  ensureScheduleForPeriod(period)
  return scheduleTotalForPeriod(
    props.totalsByPeriod[period] ?? 0,
    downpayment.value[period] ?? '',
    installmentMonths.value[period],
    scheduleMonths.value[period] ?? [],
    period,
  )
}

function setDownpayment(period: LevelBillingPeriod, v: string) {
  if (props.readonly) return
  downpayment.value = { ...downpayment.value, [period]: v }
}

function onInstallmentMonthsInput(period: LevelBillingPeriod, raw: string) {
  if (props.readonly || period === 'monthly') return
  const n = Math.max(1, Math.min(36, Math.round(Number(raw) || 1)))
  installmentMonths.value = { ...installmentMonths.value, [period]: n }
  const start = scheduleMonths.value[period]?.[0] ?? 1
  scheduleMonths.value = {
    ...scheduleMonths.value,
    [period]: buildDefaultScheduleMonths(n, start),
  }
}

function clampCalendarMonth(n: number): number {
  if (!Number.isFinite(n)) return 1
  const r = Math.round(n)
  if (r < 1) return 1
  if (r > 12) return 12
  return r
}

function nextCalendarMonth(m: number): number {
  return m >= 12 ? 1 : m + 1
}

function onScheduleMonthChange(period: LevelBillingPeriod, index: number, raw: string) {
  if (props.readonly) return
  const months = [...(scheduleMonths.value[period] ?? [])]
  if (!months.length) return
  months[index] = clampCalendarMonth(Number(raw))
  for (let j = index + 1; j < months.length; j++) {
    months[j] = nextCalendarMonth(months[j - 1])
  }
  scheduleMonths.value = { ...scheduleMonths.value, [period]: months }
}

defineExpose({ totalForPeriod })
</script>
