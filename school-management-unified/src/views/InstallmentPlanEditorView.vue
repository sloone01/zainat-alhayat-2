<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center gap-3">
            <router-link
              to="/settings/payments/installment-plans"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              :aria-label="$t('feesV2.backToPlans')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
              {{ isEdit ? $t('feesV2.editPlan') : $t('feesV2.newPlan') }}
            </h1>
          </div>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('feesV2.planEditorHint') }}</p>
        </div>
      </section>

      <form class="space-y-6" @submit.prevent="save">
        <div class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.02]">
          <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.planBasicInfo') }}</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('feesV2.planName') }}</label>
              <input
                v-model="planForm.name"
                required
                type="text"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('feesV2.planDescription') }}</label>
              <input
                v-model="planForm.description"
                type="text"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
          <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.planEntries') }}</h2>
              <p class="text-xs text-gray-500 mt-0.5">{{ $t('feesV2.planEntriesHint') }}</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700"
              @click="addEntry"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('feesV2.addMonth') }}
            </button>
          </div>

          <div v-if="!planForm.entries.length" class="px-6 py-14 text-center">
            <p class="text-sm text-gray-500">{{ $t('feesV2.noPlanEntriesYet') }}</p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-100"
              @click="addEntry"
            >
              + {{ $t('feesV2.addMonth') }}
            </button>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="w-12 px-4 py-3 text-center">#</th>
                  <th class="px-4 py-3 text-start">{{ $t('feesV2.month') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('feesV2.installmentName') }}</th>
                  <th class="w-16 px-3 py-3 text-center"><span class="sr-only">{{ $t('common.delete') }}</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(e, i) in planForm.entries" :key="i" class="hover:bg-primary-50/20">
                  <td class="align-middle px-4 py-3 text-center">
                    <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 tabular-nums">
                      {{ i + 1 }}
                    </span>
                  </td>
                  <td class="align-middle px-4 py-3">
                    <select
                      v-model.number="e.month_number"
                      required
                      class="w-full min-w-[9rem] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      @change="onMonthChange(e)"
                    >
                      <option disabled value="">{{ $t('feesV2.selectMonth') }}</option>
                      <option v-for="m in 12" :key="m" :value="m">{{ monthOptionLabel(m) }}</option>
                    </select>
                  </td>
                  <td class="align-middle px-4 py-3">
                    <input
                      v-model="e.label"
                      type="text"
                      required
                      class="w-full min-w-[10rem] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      @input="e.labelManual = true"
                    />
                  </td>
                  <td class="align-middle px-3 py-3 text-center">
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                      :aria-label="$t('common.delete')"
                      @click="planForm.entries.splice(i, 1)"
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
          <router-link
            to="/settings/payments/installment-plans"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {{ $t('common.cancel') }}
          </router-link>
          <button
            type="submit"
            :disabled="saving || !planForm.entries.length"
            class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-50"
          >
            {{ saving ? $t('common.saving') : $t('common.save') }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import SuccessFlashDialog from '@/components/SuccessFlashDialog.vue'
import { useSuccessFlash } from '@/composables/useSuccessFlash'
import { feesV2Service } from '@/services/fees-v2.service'
import { authService } from '@/services'
import {
  isAutoMonthLabel,
  isMonthNumberValid,
  localizedMonthName,
} from '@/utils/calendar-month'

type PlanEntryRow = {
  sequence: number
  month_number: number | null
  label: string | null
  labelManual: boolean
}

const route = useRoute()
const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const planId = computed(() => route.params.planId as string | undefined)
const isEdit = computed(() => !!planId.value && planId.value !== 'new')

const schoolId = computed(() => authService.getStoredUser()?.school_id ?? 1)

const {
  open: successOpen,
  title: successTitle,
  message: successMessage,
  durationMs: successDurationMs,
  show: showSuccessFlash,
  onFinished: onSuccessFinished,
} = useSuccessFlash()

const saving = ref(false)
const planForm = ref({
  name: '',
  description: '',
  entries: [] as PlanEntryRow[],
})

function monthOptionLabel(month: number) {
  return localizedMonthName(month, locale.value)
}

function syncLabelFromMonth(entry: PlanEntryRow) {
  if (entry.labelManual || !isMonthNumberValid(entry.month_number)) return
  entry.label = localizedMonthName(Number(entry.month_number), locale.value)
}

function onMonthChange(entry: PlanEntryRow) {
  entry.labelManual = false
  syncLabelFromMonth(entry)
}

function createEntry(month_number: number | null = null): PlanEntryRow {
  const row: PlanEntryRow = {
    sequence: 0,
    month_number,
    label: null,
    labelManual: false,
  }
  syncLabelFromMonth(row)
  return row
}

function addEntry() {
  planForm.value.entries.push(createEntry(null))
}

function refreshAutoLabels() {
  for (const entry of planForm.value.entries) {
    if (!entry.labelManual && isMonthNumberValid(entry.month_number)) {
      entry.label = localizedMonthName(Number(entry.month_number), locale.value)
    }
  }
}

watch(locale, refreshAutoLabels)

async function load() {
  if (isEdit.value && planId.value) {
    const plan = await feesV2Service.getInstallmentPlan(planId.value)
    planForm.value = {
      name: plan.name,
      description: plan.description || '',
      entries: (plan.entries || []).map((e) => {
        const labelManual = !isAutoMonthLabel(e.month_number, e.label, locale.value)
        return {
          sequence: e.sequence,
          month_number: e.month_number,
          label: e.label,
          labelManual,
        }
      }),
    }
    refreshAutoLabels()
  } else {
    planForm.value = {
      name: '',
      description: '',
      entries: [createEntry(9)],
    }
  }
}

async function save() {
  saving.value = true
  try {
    const payload = {
      school_id: schoolId.value,
      name: planForm.value.name.trim(),
      description: planForm.value.description.trim() || undefined,
      entries: planForm.value.entries.map((e, i) => ({
        sequence: i + 1,
        month_number: e.month_number,
        label: e.label,
      })),
    }
    if (isEdit.value && planId.value) {
      await feesV2Service.saveInstallmentPlan(payload, planId.value)
    } else {
      await feesV2Service.saveInstallmentPlan(payload)
    }
    showSuccessFlash({ redirectTo: '/settings/payments/installment-plans' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
