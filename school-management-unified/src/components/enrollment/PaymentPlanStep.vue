<template>
  <div class="space-y-6">
    <div v-if="loadError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ loadError }}
    </div>

    <div v-if="loadingPlans" class="flex items-center justify-center gap-3 py-10 text-sm text-gray-500">
      <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
      {{ $t('common.loading') }}
    </div>

    <template v-else>
      <div v-if="!plans.length" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {{ $t('enrollment.noInstallmentPlans') }}
      </div>

      <div v-else class="space-y-3">
        <label class="mb-1.5 block text-xs font-medium text-gray-600">
          <span class="text-red-500 me-1">*</span>
          {{ $t('enrollment.selectInstallmentPlan') }}
        </label>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            v-for="plan in plans"
            :key="plan.id"
            type="button"
            class="rounded-xl border p-4 text-start transition"
            :class="
              modelValue === plan.id
                ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200'
                : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50/30'
            "
            @click="selectPlan(plan.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h4 class="font-semibold text-gray-900">{{ plan.name }}</h4>
                <p v-if="plan.description" class="mt-0.5 text-xs text-gray-500">{{ plan.description }}</p>
                <p class="mt-1 text-xs text-gray-600">
                  {{ $t('enrollment.planEntryCount', { count: plan.entries.length }) }}
                </p>
              </div>
              <span
                class="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                :class="modelValue === plan.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'"
                aria-hidden="true"
              />
            </div>
          </button>
        </div>
      </div>

      <div v-if="previewLoading" class="flex items-center gap-2 py-4 text-sm text-gray-500">
        <span class="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        {{ $t('common.loading') }}
      </div>

      <div v-else-if="preview" class="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h3 class="text-sm font-semibold text-gray-900">{{ $t('enrollment.feeSchedulePreview') }}</h3>
          <p class="text-sm font-semibold tabular-nums text-gray-900">
            {{ preview.list_total }} {{ currencyLabel }}
          </p>
        </div>

        <div v-if="!preview.level" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {{ $t('enrollment.feeLevelUnmatched') }}
        </div>

        <div v-if="preview.charges.length" class="space-y-2">
          <h4 class="text-xs font-medium text-gray-600">{{ $t('enrollment.feeStructure') }}</h4>
          <div class="divide-y divide-gray-100 rounded-lg border border-gray-100">
            <div
              v-for="c in preview.charges"
              :key="c.charge_type_id"
              class="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span class="text-gray-700">{{ c.label }}</span>
              <span class="tabular-nums text-gray-900">{{ c.amount }} {{ currencyLabel }}</span>
            </div>
          </div>
        </div>

        <div v-if="preview.inclusions?.length" class="space-y-2">
          <h4 class="text-xs font-medium text-gray-600">{{ $t('enrollment.includedInPackage') }}</h4>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="item in preview.inclusions"
              :key="item.id"
              class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-800"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-medium text-gray-600">{{ $t('enrollment.paymentSchedule') }}</h4>
          <div class="divide-y divide-gray-100 rounded-lg border border-gray-100">
            <div
              v-for="row in preview.schedule"
              :key="`${row.kind}-${row.sequence}`"
              class="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              :class="row.kind === 'advance' ? 'bg-primary-50/60' : ''"
            >
              <span class="text-gray-700">{{ scheduleLabel(row) }}</span>
              <span class="font-medium tabular-nums text-gray-900">{{ row.amount }} {{ currencyLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <WizardStepNav
      :disabled="!isValid"
      @next="emit('next')"
      @back="emit('back')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'
import {
  publicEnrollmentFeesService,
  type PublicEnrollmentFeePreview,
  type PublicEnrollmentPlanRow,
} from '@/services/public-enrollment-fees.service'

const props = defineProps<{
  schoolId: string
  gradeLevel: string
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { t, locale } = useI18n()

const plans = ref<PublicEnrollmentPlanRow[]>([])
const preview = ref<PublicEnrollmentFeePreview | null>(null)
const loadingPlans = ref(false)
const previewLoading = ref(false)
const loadError = ref('')

const isValid = computed(() => !!props.modelValue && !!preview.value)
const currencyLabel = computed(() => {
  const c = preview.value?.currency || 'OMR'
  return c === 'OMR' ? t('enrollment.omaniRial') : c
})

const MONTH_KEYS = [
  '',
  'enrollment.january',
  'enrollment.february',
  'enrollment.march',
  'enrollment.april',
  'enrollment.may',
  'enrollment.june',
  'enrollment.july',
  'enrollment.august',
  'enrollment.september',
  'enrollment.october',
  'enrollment.november',
  'enrollment.december',
] as const

function scheduleLabel(row: PublicEnrollmentFeePreview['schedule'][number]): string {
  if (row.kind === 'advance') return t('enrollment.advancePayment')
  if (row.label?.trim()) return row.label
  if (row.month_number && row.month_number >= 1 && row.month_number <= 12) {
    return t(MONTH_KEYS[row.month_number])
  }
  return t('enrollment.installmentN', { n: row.sequence })
}

function selectPlan(id: string) {
  emit('update:modelValue', id)
}

async function loadPlans() {
  if (!props.schoolId) return
  loadingPlans.value = true
  loadError.value = ''
  try {
    plans.value = await publicEnrollmentFeesService.listPlans(props.schoolId)
    if (props.modelValue && !plans.value.some((p) => p.id === props.modelValue)) {
      emit('update:modelValue', null)
    }
  } catch {
    loadError.value = t('enrollment.feePlansLoadError')
    plans.value = []
  } finally {
    loadingPlans.value = false
  }
}

async function loadPreview() {
  preview.value = null
  if (!props.schoolId || !props.gradeLevel || !props.modelValue) return
  previewLoading.value = true
  try {
    preview.value = await publicEnrollmentFeesService.preview(
      props.schoolId,
      props.gradeLevel,
      props.modelValue,
    )
  } catch {
    loadError.value = t('enrollment.feePreviewLoadError')
    preview.value = null
  } finally {
    previewLoading.value = false
  }
}

watch(
  () => props.schoolId,
  () => {
    void loadPlans()
  },
  { immediate: true },
)

watch(
  () => [props.schoolId, props.gradeLevel, props.modelValue, locale.value] as const,
  () => {
    void loadPreview()
  },
  { immediate: true },
)
</script>
