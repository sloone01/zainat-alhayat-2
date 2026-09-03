<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('feesV2.installmentPlansTitle') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('feesV2.installmentPlansSubtitle') }}</p>
        </div>
      </section>

      <div v-if="flashError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        {{ flashError }}
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('feesV2.plansGridTitle') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('feesV2.plansCount', { count: plans.length }) }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <ListViewModeToggle v-model="viewMode" />
              <router-link
                to="/settings/payments/installment-plans/new"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ $t('feesV2.newPlan') }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="plans.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="plan in plans"
                :key="plan.id"
                class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">{{ plan.name }}</h3>
                      <p v-if="plan.description" class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ plan.description }}</p>
                    </div>
                  </div>

                  <div class="mt-4 flex items-center gap-2 text-sm text-gray-700">
                    <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-800">
                      {{ plan.entries?.length || 0 }}
                    </span>
                    <span class="text-xs text-gray-500">{{ $t('feesV2.installments') }}</span>
                  </div>

                  <div v-if="plan.entries?.length" class="mt-3 flex flex-wrap gap-1.5">
                    <span
                      v-for="e in plan.entries.slice(0, 8)"
                      :key="e.id || e.sequence"
                      class="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-[10px] font-semibold text-primary-800 ring-1 ring-primary-100"
                    >
                      {{ entryChip(e) }}
                    </span>
                    <span v-if="(plan.entries?.length || 0) > 8" class="self-center text-[10px] font-medium text-gray-400">
                      +{{ plan.entries.length - 8 }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <router-link
                    :to="`/settings/payments/installment-plans/${plan.id}`"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
                  >
                    {{ $t('common.edit') }}
                    <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </router-link>
                  <button
                    type="button"
                    class="text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                    :disabled="deletingId === plan.id"
                    @click="tryDelete(plan)"
                  >
                    {{ deletingId === plan.id ? '…' : $t('common.delete') }}
                  </button>
                </div>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.planName') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.planDescription') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('feesV2.installments') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="plan in plans" :key="'list-' + plan.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ plan.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ plan.description || '—' }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="e in plan.entries?.slice(0, 6) || []"
                          :key="e.id || e.sequence"
                          class="inline-flex rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800"
                        >
                          {{ entryChip(e) }}
                        </span>
                        <span v-if="(plan.entries?.length || 0) > 6" class="text-[10px] text-gray-400 self-center">
                          +{{ plan.entries!.length - 6 }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-end">
                      <div class="flex items-center justify-end gap-3">
                        <router-link
                          :to="`/settings/payments/installment-plans/${plan.id}`"
                          class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900"
                        >
                          {{ $t('common.edit') }}
                          <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </router-link>
                        <button
                          type="button"
                          class="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          :disabled="deletingId === plan.id"
                          @click="tryDelete(plan)"
                        >
                          {{ deletingId === plan.id ? '…' : $t('common.delete') }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'empty-' + slot"
              class="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <template v-if="slot === 1">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('feesV2.noInstallmentPlans') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('feesV2.noInstallmentPlansHint') }}</p>
                <router-link
                  to="/settings/payments/installment-plans/new"
                  class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                >
                  + {{ $t('feesV2.createFirstPlan') }}
                </router-link>
              </template>
              <template v-else>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="blockedPlan" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-gray-900/45 backdrop-blur-[1px]" @click="closeBlocked" />
        <div class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <div class="border-b border-amber-100 bg-amber-50 px-5 py-4">
            <h3 class="text-base font-semibold text-amber-950">{{ $t('feesV2.planInUseTitle') }}</h3>
            <p class="mt-1 text-sm text-amber-900/90">{{ $t('feesV2.planInUseIntro', { name: blockedPlan.name }) }}</p>
          </div>
          <ul class="max-h-60 divide-y divide-gray-100 overflow-y-auto px-5 py-2">
            <li v-for="(u, i) in blockedUsages" :key="`${u.kind}-${u.id}-${i}`" class="py-2.5 text-sm text-gray-800">
              {{ usageLabel(u) }}
            </li>
          </ul>
          <div class="flex justify-end border-t border-gray-100 bg-gray-50 px-5 py-4">
            <button
              type="button"
              class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
              @click="closeBlocked"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import {
  feesV2Service,
  type InstallmentPlan,
  type InstallmentPlanEntry,
  type InstallmentPlanUsageItem,
} from '@/services/fees-v2.service'
import { authService } from '@/services'
import { isMonthNumberValid, localizedMonthName } from '@/utils/calendar-month'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const schoolId = computed(() => authService.getStoredUser()?.school_id ?? 1)

const emptyGridSlots = [1, 2, 3]
const loading = ref(false)
const flashError = ref('')
const deletingId = ref<string | null>(null)
const plans = ref<InstallmentPlan[]>([])
const blockedPlan = ref<{ id: string; name: string } | null>(null)
const blockedUsages = ref<InstallmentPlanUsageItem[]>([])

function usageLabel(u: InstallmentPlanUsageItem) {
  const key = `feesV2.planUsage_${u.kind}` as const
  return t(key, { label: u.label })
}

function closeBlocked() {
  blockedPlan.value = null
  blockedUsages.value = []
}

function extractUsagesFromError(e: unknown): InstallmentPlanUsageItem[] | null {
  const err = e as {
    response?: { data?: { code?: string; usages?: InstallmentPlanUsageItem[]; message?: unknown } }
  }
  const data = err?.response?.data
  if (!data) return null
  const payload =
    typeof data.message === 'object' && data.message !== null
      ? (data.message as { code?: string; usages?: InstallmentPlanUsageItem[] })
      : data
  if (payload?.code === 'INSTALLMENT_PLAN_IN_USE' && Array.isArray(payload.usages)) {
    return payload.usages
  }
  return null
}

function entryChip(e: InstallmentPlanEntry) {
  if (e.label?.trim()) return e.label.trim()
  if (isMonthNumberValid(e.month_number)) {
    return localizedMonthName(Number(e.month_number), locale.value)
  }
  return `#${e.sequence}`
}

async function load() {
  loading.value = true
  flashError.value = ''
  try {
    plans.value = await feesV2Service.listInstallmentPlans(schoolId.value)
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('common.error')
  } finally {
    loading.value = false
  }
}

async function tryDelete(plan: { id: string; name: string }) {
  flashError.value = ''
  deletingId.value = plan.id
  try {
    const usage = await feesV2Service.getInstallmentPlanUsage(plan.id)
    if (usage.in_use) {
      blockedPlan.value = { id: plan.id, name: plan.name }
      blockedUsages.value = usage.usages
      return
    }

    const ok = window.confirm(t('feesV2.confirmDeletePlan', { name: plan.name }))
    if (!ok) return

    await feesV2Service.deleteInstallmentPlan(plan.id)
    await load()
  } catch (e: unknown) {
    const usages = extractUsagesFromError(e)
    if (usages) {
      blockedPlan.value = { id: plan.id, name: plan.name }
      blockedUsages.value = usages
    } else {
      flashError.value = (e as Error)?.message || t('common.error')
    }
  } finally {
    deletingId.value = null
  }
}

onMounted(load)
</script>
