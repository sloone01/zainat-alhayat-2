<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-teal-600 p-6 text-white shadow-lg sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center gap-3">
            <router-link
              to="/settings/payments/packages"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              :aria-label="$t('feesV2.backToPackages')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
              {{ isEdit ? $t('feesV2.editPackage') : $t('feesV2.newPackage') }}
            </h1>
          </div>
          <p class="mt-2 max-w-2xl text-sm text-primary-50/95">{{ $t('feesV2.packageSubtitle') }}</p>
        </div>
      </section>

      <form class="space-y-6" @submit.prevent="save">
        <div class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.02]">
          <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.basicInfo') }}</h2>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('feesV2.packageName') }}</label>
              <input v-model="form.name" required type="text" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('feesV2.currency') }}</label>
              <input v-model="form.currency" type="text" maxlength="3" dir="ltr" class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.chargeStructure') }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">{{ $t('feesV2.chargeStructureHint') }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="addLine"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('feesV2.addCharge') }}
            </button>
          </div>

          <div v-if="!form.charge_lines.length" class="px-6 py-14 text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="mt-4 text-sm text-gray-500">{{ $t('feesV2.noChargesYet') }}</p>
            <button
              type="button"
              @click="addLine"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-100"
            >
              + {{ $t('feesV2.addCharge') }}
            </button>
          </div>

          <!-- Mobile: stacked cards -->
          <div v-else class="md:hidden divide-y divide-gray-100">
            <div
              v-for="(line, idx) in form.charge_lines"
              :key="'m-' + idx"
              class="p-4 space-y-4 bg-white even:bg-gray-50/40"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-primary-100 px-2 text-xs font-bold text-primary-800 tabular-nums">
                  {{ idx + 1 }}
                </span>
                <button
                  type="button"
                  @click="removeLine(idx)"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                  :aria-label="$t('common.delete')"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">{{ $t('feesV2.chargeType') }}</label>
                <select
                  v-model="line.charge_type_id"
                  required
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">{{ $t('feesV2.selectCharge') }}</option>
                  <option v-for="ct in chargeTypes" :key="ct.id" :value="ct.id">{{ ct.label }}</option>
                </select>
              </div>
              <div>
                <span class="block text-xs font-medium text-gray-600 mb-1.5">{{ $t('feesV2.whenPaid') }}</span>
                <div class="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <label
                    class="flex-1 cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition-colors"
                    :class="line.payment_timing === 'upfront' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                  >
                    <input v-model="line.payment_timing" type="radio" value="upfront" class="sr-only" />
                    {{ $t('feesV2.upfront') }}
                  </label>
                  <label
                    class="flex-1 cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition-colors"
                    :class="line.payment_timing === 'installment' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                  >
                    <input v-model="line.payment_timing" type="radio" value="installment" class="sr-only" />
                    {{ $t('feesV2.installment') }}
                  </label>
                </div>
              </div>
              <div>
                <span class="block text-xs font-medium text-gray-600 mb-1.5">{{ $t('feesV2.frequency') }}</span>
                <div class="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <label
                    class="flex-1 cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition-colors"
                    :class="line.billing_frequency === 'per_year' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                  >
                    <input v-model="line.billing_frequency" type="radio" value="per_year" class="sr-only" />
                    {{ $t('feesV2.perYear') }}
                  </label>
                  <label
                    class="flex-1 cursor-pointer rounded-md px-2 py-2 text-center text-xs font-medium transition-colors"
                    :class="line.billing_frequency === 'once_only' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                  >
                    <input v-model="line.billing_frequency" type="radio" value="once_only" class="sr-only" />
                    {{ $t('feesV2.onceOnly') }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop: table -->
          <div v-if="form.charge_lines.length" class="hidden md:block overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th class="w-12 px-4 py-3 text-center">#</th>
                  <th class="min-w-[220px] px-4 py-3 text-start">{{ $t('feesV2.chargeType') }}</th>
                  <th class="min-w-[200px] px-4 py-3 text-start">{{ $t('feesV2.whenPaid') }}</th>
                  <th class="min-w-[200px] px-4 py-3 text-start">{{ $t('feesV2.frequency') }}</th>
                  <th class="w-16 px-3 py-3 text-center"><span class="sr-only">{{ $t('common.delete') }}</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(line, idx) in form.charge_lines"
                  :key="'d-' + idx"
                  class="group transition-colors hover:bg-primary-50/30"
                >
                  <td class="align-middle px-4 py-4 text-center">
                    <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 tabular-nums group-hover:bg-primary-100 group-hover:text-primary-800">
                      {{ idx + 1 }}
                    </span>
                  </td>
                  <td class="align-middle px-4 py-4">
                    <select
                      v-model="line.charge_type_id"
                      required
                      class="w-full min-w-[12rem] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">{{ $t('feesV2.selectCharge') }}</option>
                      <option v-for="ct in chargeTypes" :key="ct.id" :value="ct.id">{{ ct.label }}</option>
                    </select>
                  </td>
                  <td class="align-middle px-4 py-4">
                    <div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                      <label
                        class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                        :class="line.payment_timing === 'upfront' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                      >
                        <input v-model="line.payment_timing" type="radio" value="upfront" class="sr-only" />
                        {{ $t('feesV2.upfront') }}
                      </label>
                      <label
                        class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                        :class="line.payment_timing === 'installment' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                      >
                        <input v-model="line.payment_timing" type="radio" value="installment" class="sr-only" />
                        {{ $t('feesV2.installment') }}
                      </label>
                    </div>
                  </td>
                  <td class="align-middle px-4 py-4">
                    <div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                      <label
                        class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                        :class="line.billing_frequency === 'per_year' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                      >
                        <input v-model="line.billing_frequency" type="radio" value="per_year" class="sr-only" />
                        {{ $t('feesV2.perYear') }}
                      </label>
                      <label
                        class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                        :class="line.billing_frequency === 'once_only' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-primary-200/60' : 'text-gray-600 hover:text-gray-900'"
                      >
                        <input v-model="line.billing_frequency" type="radio" value="once_only" class="sr-only" />
                        {{ $t('feesV2.onceOnly') }}
                      </label>
                    </div>
                  </td>
                  <td class="align-middle px-3 py-4 text-center">
                    <button
                      type="button"
                      @click="removeLine(idx)"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                      :aria-label="$t('common.delete')"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 justify-end">
          <router-link to="/settings/payments/packages" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {{ $t('common.cancel') }}
          </router-link>
          <button type="submit" :disabled="saving" class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-50">
            {{ $t('common.save') }}
          </button>
        </div>
      </form>
    </div>

    <SuccessFlashDialog
      :open="successOpen"
      :title="successTitle"
      :message="successMessage"
      :duration-ms="successDurationMs"
      @finished="onSuccessFinished"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import SuccessFlashDialog from '@/components/SuccessFlashDialog.vue'
import { useSuccessFlash } from '@/composables/useSuccessFlash'
import { feesV2Service, type PaymentTiming, type BillingFrequency } from '@/services/fees-v2.service'
import { paymentConfigService, type PaymentCatalogRow } from '@/services/payment-config.service'
import { authService } from '@/services'

const route = useRoute()
const { locale } = useI18n()

const {
  open: successOpen,
  title: successTitle,
  message: successMessage,
  durationMs: successDurationMs,
  show: showSuccessFlash,
  onFinished: onSuccessFinished,
} = useSuccessFlash()

const isRTL = computed(() => locale.value === 'ar')
const packageId = computed(() => route.params.packageId as string | undefined)
const isEdit = computed(() => !!packageId.value && packageId.value !== 'new')

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id ?? 1
})

const saving = ref(false)
const chargeTypes = ref<PaymentCatalogRow[]>([])
const form = ref({
  name: '',
  currency: 'OMR',
  charge_lines: [] as Array<{
    charge_type_id: string
    payment_timing: PaymentTiming
    billing_frequency: BillingFrequency
  }>,
})

function addLine() {
  form.value.charge_lines.push({
    charge_type_id: '',
    payment_timing: 'installment',
    billing_frequency: 'per_year',
  })
}

function removeLine(idx: number) {
  form.value.charge_lines.splice(idx, 1)
}

async function load() {
  chargeTypes.value = await paymentConfigService.listChargeTypes(schoolId.value)
  if (isEdit.value && packageId.value) {
    const pkg = await feesV2Service.getPackage(packageId.value)
    form.value.name = pkg.name
    form.value.currency = pkg.currency || 'OMR'
    form.value.charge_lines = (pkg.charge_lines || []).map((l) => ({
      charge_type_id: l.charge_type_id,
      payment_timing: l.payment_timing,
      billing_frequency: l.billing_frequency,
    }))
  }
}

async function save() {
  saving.value = true
  try {
    const payload = {
      school_id: schoolId.value,
      name: form.value.name.trim(),
      currency: form.value.currency,
      charge_lines: form.value.charge_lines,
    }
    if (isEdit.value && packageId.value) {
      await feesV2Service.savePackage(payload, packageId.value)
    } else {
      await feesV2Service.savePackage(payload)
    }
    showSuccessFlash({ redirectTo: '/settings/payments/packages' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
