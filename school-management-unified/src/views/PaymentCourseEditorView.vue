<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="flashError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{{ flashError }}</div>
      <div v-if="flashOk" class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-900">{{ flashOk }}</div>

      <div v-if="pageLoading" class="text-center py-12 text-gray-600 text-sm">{{ $t('common.loading') }}…</div>

      <div v-else class="space-y-6">
        <div
          v-if="managedByPackage && feePackage"
          class="bg-sky-50 border border-sky-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div>
            <p class="text-sm font-semibold text-sky-900">{{ $t('paymentSettings.managedByFeePackage') }}: {{ feePackage.name }}</p>
            <p class="text-xs text-sky-800 mt-1">{{ $t('paymentSettings.managedByFeePackageHint') }}</p>
          </div>
          <router-link
            :to="`/settings/payments/packages/${feePackage.id}`"
            class="inline-flex shrink-0 items-center px-3 py-1.5 rounded-md bg-white border border-sky-300 text-sm font-medium text-sky-900 hover:bg-sky-100"
          >
            {{ $t('paymentSettings.openFeePackage') }}
          </router-link>
        </div>

        <fieldset :disabled="managedByPackage" class="min-w-0 border-0 p-0 m-0 space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h1 v-if="courseName" class="text-xl font-bold text-gray-900 mb-4">{{ courseName }}</h1>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.chargesCardTitle') }}</h2>
              <button
                v-if="!managedByPackage"
                type="button"
                class="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                @click="addChargeLine"
              >
                {{ $t('paymentSettings.addChargeLine') }}
              </button>
            </div>
            <div v-if="!activeChargeTypes.length" class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {{ $t('paymentSettings.noChargeTypesInCatalog') }}
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(line, idx) in form.charge_lines"
                :key="idx"
                class="flex flex-wrap gap-2 items-end border border-gray-100 rounded-lg p-3"
              >
                <div class="flex-1 min-w-[10rem]">
                  <label class="block text-xs text-gray-500 mb-1">{{ $t('paymentSettings.pickChargeType') }}</label>
                  <select v-model="line.charge_type_id" class="w-full border rounded-md px-2 py-2 text-sm">
                    <option value="">{{ $t('paymentSettings.pickChargeType') }}</option>
                    <option v-for="ct in activeChargeTypes" :key="ct.id" :value="ct.id">{{ ct.label }}</option>
                  </select>
                </div>
                <div class="w-32">
                  <label class="block text-xs text-gray-500 mb-1">{{ $t('paymentSettings.amount') }}</label>
                  <input v-model="line.amount" type="text" inputmode="decimal" class="w-full border rounded-md px-2 py-2 text-sm" />
                </div>
                <button v-if="!managedByPackage" type="button" class="text-red-600 text-sm" @click="removeChargeLine(idx)">
                  {{ $t('common.remove') }}
                </button>
              </div>
              <p class="text-xs text-gray-500">
                {{ $t('paymentSettings.courseChargeTotalLabel') }}:
                <span class="font-semibold tabular-nums">{{ chargeSum.toFixed(2) }} {{ currency }}</span>
              </p>
            </div>
          </div>

          <div v-if="!managedByPackage" class="flex justify-end">
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              :disabled="saving"
              @click="save"
            >
              {{ saving ? $t('common.saving') : $t('paymentSettings.saveFeeSetup') }}
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import paymentConfigService, { type PaymentCatalogRow } from '@/services/payment-config.service'

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const courseId = computed(() => (route.params.courseId as string) || '')

const pageLoading = ref(true)
const saving = ref(false)
const flashError = ref('')
const flashOk = ref('')
const courseName = ref('')
const feePackage = ref<{ id: string; name: string } | null>(null)
const managedByPackage = computed(() => !!feePackage.value?.id)

const chargeTypes = ref<PaymentCatalogRow[]>([])
const activeChargeTypes = computed(() => chargeTypes.value.filter((x) => x.is_active))

type Line = { charge_type_id: string; amount: string }
const coursePricingBasis = ref<'grade' | 'phase'>('grade')
const currency = ref('OMR')
const form = ref({
  charge_lines: [] as Line[],
})

function parseAmount(raw: string): number {
  const v = String(raw ?? '')
    .trim()
    .replace(/,/g, '.')
  if (!v || v === '.' || v === '-') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const chargeSum = computed(() => {
  let s = 0
  for (const l of form.value.charge_lines) {
    if (l.charge_type_id) s += parseAmount(l.amount)
  }
  return Math.round(s * 100) / 100
})

function addChargeLine() {
  form.value.charge_lines.push({ charge_type_id: '', amount: '' })
}

function removeChargeLine(i: number) {
  form.value.charge_lines.splice(i, 1)
}

async function load() {
  pageLoading.value = true
  flashError.value = ''
  flashOk.value = ''
  feePackage.value = null
  try {
    const [types, bundle] = await Promise.all([
      paymentConfigService.listChargeTypes(schoolId.value),
      paymentConfigService.getCoursePaymentProfile(courseId.value, schoolId.value),
    ])
    chargeTypes.value = types
    courseName.value = bundle.course?.name || ''
    feePackage.value = bundle.fee_package ?? null
    const p = bundle.profile
    if (p) {
      coursePricingBasis.value = (p.course_pricing_basis as 'grade' | 'phase') || 'grade'
      currency.value = (p.currency || 'OMR').slice(0, 3).toUpperCase()
      form.value.charge_lines =
        p.chargeLines?.map((cl) => ({
          charge_type_id: String(cl.charge_type_id ?? ''),
          amount: cl.amount && Number(cl.amount) !== 0 ? String(cl.amount) : '',
        })) ?? []
    } else {
      coursePricingBasis.value = 'grade'
      currency.value = 'OMR'
      form.value.charge_lines = []
    }
    if (!form.value.charge_lines.length && !managedByPackage.value) addChargeLine()
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.loadError')
  } finally {
    pageLoading.value = false
  }
}

async function save() {
  if (!courseId.value || managedByPackage.value) return
  saving.value = true
  flashError.value = ''
  flashOk.value = ''
  try {
    const charge_lines = form.value.charge_lines
      .filter((l) => l.charge_type_id?.trim())
      .map((l) => ({ charge_type_id: l.charge_type_id, amount: parseAmount(l.amount) }))
    await paymentConfigService.saveCoursePaymentProfile(courseId.value, {
      school_id: schoolId.value,
      course_pricing_basis: coursePricingBasis.value,
      currency: currency.value,
      charge_lines,
    })
    flashOk.value = t('paymentSettings.profileSaved')
    await load()
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.saveError')
  } finally {
    saving.value = false
  }
}

watch(
  () => route.params.courseId,
  () => {
    load()
  },
)

onMounted(() => {
  load()
})
</script>
