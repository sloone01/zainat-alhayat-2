<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="levelTitle"
        :subtitle="$t('feesV2.gradeLinkSubtitle')"
      >
        <template #leading>
          <router-link
            to="/settings/payments/levels"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('feesV2.backToGrades')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <form @submit.prevent="save">
        <div class="min-w-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
          <div class="space-y-4 p-4 sm:space-y-5 sm:p-6">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="grade-fee-package">
                {{ $t('feesV2.selectPackage') }}
              </label>
              <select
                id="grade-fee-package"
                v-model="form.fee_package_id"
                required
                class="fk-field max-w-md"
                @change="onPackageChange"
              >
                <option value="">{{ $t('feesV2.choosePackage') }}</option>
                <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>

            <hr class="border-gray-200">

            <div>
              <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.amountsPerCharge') }}</h2>
              <p class="mt-0.5 text-xs text-gray-500">{{ $t('feesV2.zeroAllowed') }}</p>
            </div>
          </div>

          <div v-if="!form.fee_package_id || !form.lines.length" class="border-t border-gray-100 px-4 py-10 text-center sm:px-6 sm:py-14">
            <p class="text-sm text-gray-500">{{ $t('feesV2.choosePackage') }}</p>
          </div>

          <div v-else class="border-t border-gray-100">
            <div class="space-y-3 p-4 md:hidden">
              <article
                v-for="(line, idx) in form.lines"
                :key="'mobile-' + line.charge_type_id"
                class="relative rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                  aria-hidden="true"
                />
                <div class="flex items-start gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold tabular-nums text-primary-800">
                    {{ idx + 1 }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-semibold leading-snug text-gray-900">{{ line.label }}</h3>
                    <div class="mt-1.5 flex flex-wrap gap-1.5">
                      <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {{ line.payment_timing === 'upfront' ? $t('feesV2.upfront') : $t('feesV2.installment') }}
                      </span>
                      <span class="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-800 ring-1 ring-primary-100">
                        {{ line.billing_frequency === 'once_only' ? $t('feesV2.onceOnly') : $t('feesV2.perYear') }}
                      </span>
                    </div>
                  </div>
                </div>
                <label class="mb-1.5 mt-4 block text-xs font-medium text-gray-600" :for="'amount-m-' + idx">
                  {{ $t('feesV2.amount') }}
                </label>
                <div class="flex items-center gap-2">
                  <span class="shrink-0 text-xs font-medium text-gray-600">OMR</span>
                  <input
                    :id="'amount-m-' + idx"
                    v-model="form.lines[idx].amount"
                    type="number"
                    min="0"
                    step="0.001"
                    dir="ltr"
                    class="fk-field fk-field--mono text-end"
                  >
                </div>
              </article>
            </div>

            <div class="hidden overflow-x-auto md:block">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.chargeType') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.timing') }}</th>
                    <th class="w-40 px-4 py-3 text-end">{{ $t('feesV2.amount') }} (OMR)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(line, idx) in form.lines" :key="line.charge_type_id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ line.label }}</td>
                    <td class="px-4 py-3 text-xs text-gray-600">
                      {{ line.payment_timing === 'upfront' ? $t('feesV2.upfront') : $t('feesV2.installment') }}
                      ·
                      {{ line.billing_frequency === 'once_only' ? $t('feesV2.onceOnly') : $t('feesV2.perYear') }}
                    </td>
                    <td class="px-4 py-3 text-end">
                      <input
                        v-model="form.lines[idx].amount"
                        type="number"
                        min="0"
                        step="0.001"
                        dir="ltr"
                        class="fk-field fk-field--mono text-end"
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex flex-col-reverse gap-2 border-t border-fikr-hairline px-4 py-4 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2 sm:px-6">
            <router-link
              to="/settings/payments/levels"
              class="fk-btn fk-btn--pearl w-full sm:w-auto"
            >
              {{ $t('common.cancel') }}
            </router-link>
            <button
              type="submit"
              :disabled="saving || !form.fee_package_id"
              class="fk-btn fk-btn--primary w-full sm:w-auto"
            >
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { useFeedback } from '@/composables/useFeedback'
import { feesV2Service } from '@/services/fees-v2.service'
import { paymentConfigService } from '@/services/payment-config.service'
import { authService } from '@/services'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const { success, error: feedbackError } = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const levelId = computed(() => route.params.levelId as string)

const schoolId = computed(() => {
  const id = authService.getStoredUser()?.school_id
  return id != null && String(id).trim() !== '' ? String(id) : ''
})

const levelTitle = ref('')
const packages = ref<Array<{ id: string; name: string }>>([])
const saving = ref(false)
const flashError = ref('')
const existingYearPaymentMode = ref<'one_time' | 'installments' | 'both'>('one_time')
const existingCurrency = ref('OMR')
const existingInstallments = ref<Array<{
  sequence: number
  month_number?: number | null
  label?: string | null
  amount: number
}>>([])
const existingDiscountIds = ref<string[]>([])

const form = ref({
  fee_package_id: '',
  lines: [] as Array<{
    charge_type_id: string
    label: string
    amount: number
    payment_timing: string
    billing_frequency: string
  }>,
})

async function onPackageChange() {
  if (!form.value.fee_package_id) {
    form.value.lines = []
    return
  }
  const pkg = await feesV2Service.getPackage(form.value.fee_package_id)
  const existing = new Map(
    form.value.lines.map((l) => [l.charge_type_id, l.amount]),
  )
  form.value.lines = (pkg.charge_lines || []).map((cl) => ({
    charge_type_id: cl.charge_type_id,
    label: cl.charge_type?.label || cl.charge_type_id,
    amount: existing.get(cl.charge_type_id) ?? 0,
    payment_timing: cl.payment_timing,
    billing_frequency: cl.billing_frequency,
  }))
}

async function load() {
  flashError.value = ''
  try {
    const data = await paymentConfigService.getProfileByLevel(levelId.value)
    const grade = data.grade
    levelTitle.value = grade
      ? (locale.value === 'ar' ? grade.name_ar : grade.name_en) || data.level.name
      : data.level.name

    packages.value = await feesV2Service.listPackages(schoolId.value)
    const profile = data.profile
    const packageId = data.fee_package?.id || profile?.fee_package_id || ''
    form.value.fee_package_id = packageId

    const installments = (profile?.installments || []).map((row) => ({
      sequence: row.sequence,
      month_number: row.month_number,
      label: row.label,
      amount: Number(row.amount) || 0,
    }))
    existingInstallments.value = installments
    existingDiscountIds.value = (profile?.discountLinks || [])
      .map((d) => d.discount_type_id)
      .filter((id): id is string => Boolean(id))
    existingCurrency.value = profile?.currency || 'OMR'
    const mode = profile?.year_payment_mode
    existingYearPaymentMode.value =
      (mode === 'installments' || mode === 'both') && installments.length
        ? mode
        : 'one_time'

    if (packageId) await onPackageChange()
    for (const line of profile?.chargeLines || []) {
      const row = form.value.lines.find((x) => x.charge_type_id === line.charge_type_id)
      if (row) row.amount = Number(line.amount) || 0
    }
  } catch (e: unknown) {
    flashError.value = (e as { message?: string })?.message || t('paymentSettings.loadError')
  }
}

async function save() {
  flashError.value = ''
  if (!form.value.fee_package_id) return
  saving.value = true
  try {
    const charge_lines = form.value.lines.map((l) => ({
      charge_type_id: l.charge_type_id,
      amount: Number(l.amount) || 0,
      billing_period: 'yearly' as const,
    }))
    const year_total_amount = charge_lines.reduce((sum, line) => sum + line.amount, 0)
    await paymentConfigService.saveProfileForLevel(levelId.value, {
      pricing_model: 'per_year',
      year_payment_mode: existingYearPaymentMode.value,
      year_total_amount,
      currency: existingCurrency.value,
      fee_package_id: form.value.fee_package_id,
      charge_lines,
      installments: existingYearPaymentMode.value === 'one_time' ? [] : existingInstallments.value,
      discount_type_ids: existingDiscountIds.value,
    })
    success(t('paymentSettings.profileSaved'), t('common.success'))
    await router.push('/settings/payments/levels')
  } catch (e: unknown) {
    feedbackError((e as { message?: string })?.message || t('paymentSettings.saveError'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
