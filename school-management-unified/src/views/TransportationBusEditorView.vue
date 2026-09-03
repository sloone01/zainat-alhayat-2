<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="relative">
          <router-link
            to="/transportation"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 mb-3"
            :aria-label="$t('transportation.backToTransportation')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
            {{ isEdit ? $t('transportation.editBus') : $t('transportation.addBus') }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('transportation.busEditorHint') }}</p>
        </div>
      </section>

      <form class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]" @submit.prevent="save">
        <div class="border-b border-gray-100 bg-gray-50/80 px-6 py-3">
          <div class="inline-flex rounded-lg border border-gray-200 bg-gray-100/80 p-0.5" role="tablist">
            <button
              type="button"
              role="tab"
              class="rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              :class="activeTab === 'details' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-gray-200/80' : 'text-gray-600 hover:text-gray-900'"
              :aria-selected="activeTab === 'details'"
              @click="activeTab = 'details'"
            >
              {{ $t('transportation.detailsTab') }}
            </button>
            <button
              type="button"
              role="tab"
              class="rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              :class="activeTab === 'charges' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-gray-200/80' : 'text-gray-600 hover:text-gray-900'"
              :aria-selected="activeTab === 'charges'"
              @click="activeTab = 'charges'"
            >
              {{ $t('feesV2.busChargesTab') }}
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'details'" class="space-y-4 p-6">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('transportation.busTitle') }}</label>
            <input
              v-model="busForm.title"
              required
              type="text"
              class="w-full max-w-lg rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('transportation.driverName') }}</label>
              <input
                v-model="busForm.driverName"
                required
                type="text"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('transportation.capacity') }}</label>
              <input
                v-model.number="busForm.capacity"
                required
                type="number"
                min="1"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('transportation.driverContacts') }}</label>
            <textarea
              v-model="busForm.driverContacts"
              rows="3"
              class="w-full max-w-lg resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              :placeholder="$t('transportation.driverContactsPlaceholder')"
            />
          </div>
        </div>

        <div v-else class="space-y-4 p-6">
          <div class="rounded-xl border border-primary-100 bg-primary-50/40 p-4">
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('feesV2.selectPackage') }}</label>
            <select
              v-model="busFeeForm.fee_package_id"
              class="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              @change="onBusPackageChange"
            >
              <option value="">{{ $t('feesV2.choosePackage') }}</option>
              <option v-for="p in feePackages" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <div v-if="busFeeForm.fee_package_id && busFeeForm.lines.length" class="overflow-hidden rounded-xl border border-gray-200/80">
            <div class="border-b border-gray-100 bg-primary-50/50 px-6 py-3">
              <h2 class="text-sm font-semibold text-primary-900">{{ $t('feesV2.amountsPerCharge') }}</h2>
              <p class="mt-0.5 text-xs text-primary-700/80">{{ $t('feesV2.zeroAllowed') }}</p>
            </div>
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-6 py-3 text-start">{{ $t('feesV2.chargeType') }}</th>
                  <th class="text-end px-6 py-3 w-40">{{ $t('feesV2.amount') }} (OMR)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(line, idx) in busFeeForm.lines" :key="line.charge_type_id" class="hover:bg-primary-50/10">
                  <td class="px-6 py-3 font-medium text-gray-900">{{ line.label }}</td>
                  <td class="px-6 py-3 text-end">
                    <input
                      v-model="busFeeForm.lines[idx].amount"
                      type="number"
                      min="0"
                      step="0.001"
                      dir="ltr"
                      class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-end font-mono text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex flex-wrap justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <router-link
            to="/transportation"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
          >
            {{ $t('common.cancel') }}
          </router-link>
          <button
            type="submit"
            :disabled="saving || !busForm.title.trim() || !busForm.driverName.trim()"
            class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import SuccessFlashDialog from '@/components/SuccessFlashDialog.vue'
import { useSuccessFlash } from '@/composables/useSuccessFlash'
import { authService } from '@/services'
import { busService } from '@/services/bus.service'
import { feesV2Service } from '@/services/fees-v2.service'

const route = useRoute()
const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const busIdParam = computed(() => route.params.busId as string | undefined)
const isEdit = computed(() => !!busIdParam.value && busIdParam.value !== 'new')

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: number } | null
  return Number(u?.school_id ?? 1)
})

const {
  open: successOpen,
  title: successTitle,
  message: successMessage,
  durationMs: successDurationMs,
  show: showSuccessFlash,
  onFinished: onSuccessFinished,
} = useSuccessFlash()

const activeTab = ref<'details' | 'charges'>('details')
const saving = ref(false)
const feePackages = ref<Array<{ id: string; name: string }>>([])
const busForm = ref({
  title: '',
  driverName: '',
  capacity: 40,
  driverContacts: '',
})
const busFeeForm = ref({
  fee_package_id: '',
  lines: [] as Array<{ charge_type_id: string; label: string; amount: number }>,
})

async function onBusPackageChange() {
  if (!busFeeForm.value.fee_package_id) {
    busFeeForm.value.lines = []
    return
  }
  const pkg = await feesV2Service.getPackage(busFeeForm.value.fee_package_id)
  const existing = new Map(busFeeForm.value.lines.map((l) => [l.charge_type_id, l.amount]))
  busFeeForm.value.lines = (pkg.charge_lines || []).map((cl) => ({
    charge_type_id: cl.charge_type_id,
    label: cl.charge_type?.label || cl.charge_type_id,
    amount: existing.get(cl.charge_type_id) ?? 0,
  }))
}

async function loadBusFeeLink(id: string) {
  const link = await feesV2Service.getBusLink(schoolId.value, id).catch(() => null)
  if (!link) {
    busFeeForm.value = { fee_package_id: '', lines: [] }
    return
  }
  busFeeForm.value.fee_package_id = link.fee_package_id
  busFeeForm.value.lines = (link.lines || []).map((l) => ({
    charge_type_id: l.charge_type_id,
    label: l.chargeType?.label || l.charge_type_id,
    amount: Number(l.amount) || 0,
  }))
  if (link.fee_package_id) await onBusPackageChange()
  for (const l of link.lines || []) {
    const row = busFeeForm.value.lines.find((x) => x.charge_type_id === l.charge_type_id)
    if (row) row.amount = Number(l.amount) || 0
  }
}

async function load() {
  feePackages.value = await feesV2Service.listPackages(schoolId.value)
  if (isEdit.value && busIdParam.value) {
    const bus = await busService.getById(busIdParam.value)
    busForm.value = {
      title: bus.title,
      driverName: bus.driverName,
      capacity: bus.capacity,
      driverContacts: bus.driverContacts || '',
    }
    await loadBusFeeLink(bus.id)
  }
}

async function save() {
  saving.value = true
  try {
    let busId = isEdit.value ? busIdParam.value! : ''
    const payload = {
      title: busForm.value.title.trim(),
      driverName: busForm.value.driverName.trim(),
      capacity: Number(busForm.value.capacity) || 40,
      driverContacts: busForm.value.driverContacts.trim() || undefined,
    }

    if (isEdit.value && busId) {
      await busService.update(busId, payload)
    } else {
      const created = await busService.create({
        ...payload,
        school_id: schoolId.value,
      })
      busId = created.id
    }

    if (busFeeForm.value.fee_package_id && busId) {
      await feesV2Service.saveBusLink({
        school_id: schoolId.value,
        bus_id: busId,
        fee_package_id: busFeeForm.value.fee_package_id,
        lines: busFeeForm.value.lines.map((l) => ({
          charge_type_id: l.charge_type_id,
          amount: Number(l.amount) || 0,
        })),
      })
    }

    showSuccessFlash({ redirectTo: '/transportation' })
  } catch (e) {
    console.error(e)
    window.alert(t('transportation.saveFailed'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
