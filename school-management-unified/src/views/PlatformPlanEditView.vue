<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="flex flex-wrap items-center gap-3">
        <router-link
          to="/platform/plans"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
          :aria-label="$t('platformBilling.backToPlans')"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ $t('platformBilling.editPlanTitle') }}</h1>
          <p class="text-sm text-gray-500">{{ planCode }}</p>
        </div>
      </div>

      <div
        v-if="loading"
        class="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500"
      >
        {{ $t('common.loading') }}
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ error }}
      </div>

      <template v-else-if="form">
        <div v-if="msg" class="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {{ msg }}
        </div>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-lg font-bold text-gray-900">{{ $t('platformBilling.planDetails') }}</h2>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label">{{ $t('platformBilling.nameEn') }}</label>
              <input v-model="form.name_en" type="text" class="input-field" />
            </div>
            <div>
              <label class="field-label">{{ $t('platformBilling.nameAr') }}</label>
              <input v-model="form.name_ar" type="text" class="input-field" />
            </div>
            <div class="sm:col-span-2">
              <label class="field-label">{{ $t('platformBilling.descEn') }}</label>
              <textarea v-model="form.description_en" rows="2" class="input-field" />
            </div>
            <div class="sm:col-span-2">
              <label class="field-label">{{ $t('platformBilling.descAr') }}</label>
              <textarea v-model="form.description_ar" rows="2" class="input-field" />
            </div>
            <div class="sm:col-span-2 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
              <label class="field-label">{{ $t('platformBilling.seatsIncluded') }}</label>
              <input
                v-model.number="form.included_student_seats"
                type="number"
                min="1"
                step="1"
                required
                class="input-field max-w-xs text-lg font-semibold"
              />
              <p class="mt-1.5 text-xs text-gray-600">{{ $t('platformBilling.seatsIncludedHint') }}</p>
            </div>
            <div>
              <label class="field-label">{{ $t('platformBilling.overagePerStudent') }}</label>
              <input
                v-model.number="form.overage_per_student_omr"
                type="number"
                min="0"
                step="0.001"
                class="input-field"
              />
            </div>
            <label class="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
              <input v-model="form.is_active" type="checkbox" class="rounded border-gray-300 text-primary-600" />
              {{ $t('platformBilling.planActive') }}
            </label>
          </div>

          <div class="mt-6">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('platformBilling.pricesByPeriod') }}</h3>
            <p class="mt-1 text-xs text-gray-500">{{ $t('platformBilling.planPricesHint') }}</p>
            <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div v-for="period in periods" :key="period">
                <label class="field-label">{{ $t(`platformBilling.periods.${period}`) }}</label>
                <div class="flex items-center gap-1.5">
                  <input
                    v-model.number="form.prices[period]"
                    type="number"
                    min="0"
                    step="0.001"
                    class="input-field"
                  />
                  <span class="text-xs text-gray-500">{{ $t('landingPricing.currency') }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-lg font-bold text-gray-900">{{ $t('platformBilling.modulesInPlan') }}</h2>
          <p class="mt-1 text-sm text-gray-600">{{ $t('platformBilling.modulesInPlanHint') }}</p>

          <div class="mt-4 space-y-2">
            <label
              v-for="mod in modules"
              :key="mod.code"
              class="flex cursor-pointer gap-3 rounded-xl border p-3 transition"
              :class="
                selected[mod.code]
                  ? 'border-primary-300 bg-primary-50/50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              "
            >
              <input
                v-model="selected[mod.code]"
                type="checkbox"
                class="mt-1 rounded border-gray-300 text-primary-600"
              />
              <div class="min-w-0 flex-1">
                <div class="font-semibold text-gray-900">
                  {{ locale === 'ar' ? mod.name_ar : mod.name_en }}
                </div>
                <p class="mt-0.5 text-sm text-gray-600">
                  {{ locale === 'ar' ? mod.description_ar : mod.description_en }}
                </p>
              </div>
            </label>
          </div>
        </section>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? $t('platformBilling.savingPlan') : $t('platformBilling.savePlan') }}
          </button>
          <router-link
            to="/platform/plans"
            class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {{ $t('common.cancel') }}
          </router-link>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  platformBillingService,
  type PlatformBillingPeriod,
  type PlatformModule,
} from '@/services/platform-billing.service'

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const planCode = computed(() => String(route.params.code || '').toLowerCase())
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const msg = ref('')
const modules = ref<PlatformModule[]>([])
const periods = ref<PlatformBillingPeriod[]>(['monthly', 'semester', 'yearly', 'summer'])
const selected = reactive<Record<string, boolean>>({})

const form = ref<{
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  included_student_seats: number
  overage_per_student_omr: number
  is_active: boolean
  prices: Record<PlatformBillingPeriod, number>
} | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const detail = await platformBillingService.getPlanDetail(planCode.value)
    if (detail.billing_periods?.length) periods.value = detail.billing_periods
    modules.value = detail.modules
    const prices: Record<PlatformBillingPeriod, number> = {
      monthly: 0,
      semester: 0,
      yearly: 0,
      summer: 0,
    }
    for (const row of detail.plan.prices || []) {
      prices[row.billing_period] = Number(row.amount_omr) || 0
    }
    form.value = {
      name_en: detail.plan.name_en,
      name_ar: detail.plan.name_ar,
      description_en: detail.plan.description_en || '',
      description_ar: detail.plan.description_ar || '',
      included_student_seats: detail.plan.included_student_seats,
      overage_per_student_omr: Number(detail.plan.overage_per_student_omr) || 0,
      is_active: detail.plan.is_active,
      prices,
    }
    for (const key of Object.keys(selected)) delete selected[key]
    for (const mod of detail.modules) {
      selected[mod.code] = !!mod.included
    }
  } catch (e: any) {
    error.value = e?.message || t('platformBilling.loadError')
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!form.value) return
  saving.value = true
  msg.value = ''
  error.value = ''
  try {
    const module_codes = Object.keys(selected).filter((c) => selected[c])
    const detail = await platformBillingService.updatePlan(planCode.value, {
      name_en: form.value.name_en,
      name_ar: form.value.name_ar,
      description_en: form.value.description_en,
      description_ar: form.value.description_ar,
      included_student_seats: form.value.included_student_seats,
      overage_per_student_omr: form.value.overage_per_student_omr,
      is_active: form.value.is_active,
      module_codes,
      prices: periods.value.map((period) => ({
        billing_period: period,
        amount_omr: Number(form.value!.prices[period]) || 0,
      })),
    })
    modules.value = detail.modules
    for (const mod of detail.modules) selected[mod.code] = !!mod.included
    for (const row of detail.plan.prices || []) {
      form.value.prices[row.billing_period] = Number(row.amount_omr) || 0
    }
    msg.value = t('platformBilling.planSaved')
  } catch (e: any) {
    error.value = e?.message || t('platformBilling.saveError')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.field-label {
  @apply mb-1 block text-sm font-medium text-gray-700;
}
.input-field {
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500;
}
</style>
