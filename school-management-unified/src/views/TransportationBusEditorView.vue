<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="isEdit ? $t('transportation.editBus') : $t('transportation.addBus')"
        :subtitle="$t('transportation.busEditorHint')"
      >
        <template #leading>
          <router-link
            to="/transportation"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('transportation.backToTransportation')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
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
              :class="activeTab === 'track' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-gray-200/80' : 'text-gray-600 hover:text-gray-900'"
              :aria-selected="activeTab === 'track'"
              @click="activeTab = 'track'"
            >
              {{ $t('transportation.trackTab') }}
            </button>
          </div>
        </div>

        <form v-if="activeTab === 'details'" @submit.prevent="save">
          <div class="space-y-6 p-6">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="bus-title">
                  {{ $t('transportation.busTitle') }}
                </label>
                <input
                  id="bus-title"
                  v-model="busForm.title"
                  required
                  type="text"
                  class="fk-field"
                  autocomplete="off"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="bus-capacity">
                  {{ $t('transportation.capacity') }}
                </label>
                <input
                  id="bus-capacity"
                  v-model.number="busForm.capacity"
                  required
                  type="number"
                  min="1"
                  class="fk-field"
                />
              </div>
            </div>

            <div class="grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="bus-driver">
                  {{ $t('transportation.driverName') }}
                </label>
                <select
                  id="bus-driver"
                  v-model="busForm.driver_user_id"
                  required
                  class="fk-field"
                  :disabled="loadingStaff"
                >
                  <option value="">{{ $t('transportation.driverPlaceholder') }}</option>
                  <option v-for="u in staffOptions" :key="u.id" :value="u.id">
                    {{ staffLabel(u) }}
                  </option>
                </select>
                <p v-if="staffError" class="mt-2 text-xs text-red-600">{{ staffError }}</p>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="bus-driver-phone">
                  {{ $t('transportation.phoneNumber') }}
                </label>
                <input
                  id="bus-driver-phone"
                  v-model="busForm.driver_phone"
                  type="tel"
                  dir="ltr"
                  class="fk-field"
                  :placeholder="$t('transportation.phoneNumberPlaceholder')"
                  autocomplete="tel"
                />
              </div>
            </div>

            <div class="grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="bus-supervisor">
                  {{ $t('transportation.supervisor') }}
                  <span class="font-normal text-gray-400">({{ $t('common.optional') }})</span>
                </label>
                <select
                  id="bus-supervisor"
                  v-model="busForm.supervisor_user_id"
                  class="fk-field"
                  :disabled="loadingStaff"
                >
                  <option value="">{{ $t('transportation.supervisorPlaceholder') }}</option>
                  <option v-for="u in staffOptions" :key="u.id" :value="u.id">
                    {{ staffLabel(u) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="bus-supervisor-phone">
                  {{ $t('transportation.phoneNumber') }}
                </label>
                <input
                  id="bus-supervisor-phone"
                  v-model="busForm.supervisor_phone"
                  type="tel"
                  dir="ltr"
                  class="fk-field"
                  :placeholder="$t('transportation.phoneNumberPlaceholder')"
                  autocomplete="tel"
                />
              </div>
            </div>

            <div class="space-y-4 border-t border-gray-100 pt-6">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="bus-fee-package">
                  {{ $t('feesV2.selectPackage') }}
                </label>
                <select
                  id="bus-fee-package"
                  v-model="busFeeForm.fee_package_id"
                  class="fk-field max-w-md"
                  @change="onBusPackageChange"
                >
                  <option value="">{{ $t('feesV2.choosePackage') }}</option>
                  <option v-for="p in feePackages" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>

              <div
                v-if="busFeeForm.fee_package_id && busFeeForm.lines.length"
                class="overflow-hidden rounded-xl border border-gray-200/80"
              >
                <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                  <h2 class="text-sm font-semibold text-gray-900">{{ $t('feesV2.amountsPerCharge') }}</h2>
                  <p class="mt-0.5 text-xs text-gray-500">{{ $t('feesV2.zeroAllowed') }}</p>
                </div>
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th class="px-6 py-3 text-start">{{ $t('feesV2.chargeType') }}</th>
                      <th class="text-end px-6 py-3 w-40">{{ $t('feesV2.amount') }} (OMR)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr
                      v-for="(line, idx) in busFeeForm.lines"
                      :key="line.charge_type_id"
                      class="hover:bg-primary-50/10"
                    >
                      <td class="px-6 py-3 font-medium text-gray-900">{{ line.label }}</td>
                      <td class="px-6 py-3 text-end">
                        <input
                          v-model="busFeeForm.lines[idx].amount"
                          type="number"
                          min="0"
                          step="0.001"
                          dir="ltr"
                          class="fk-field fk-field--mono text-end"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-2 border-t border-fikr-hairline px-6 py-4">
            <router-link to="/transportation" class="fk-btn fk-btn--pearl">
              {{ $t('common.cancel') }}
            </router-link>
            <button
              type="submit"
              :disabled="saving || !busForm.title.trim() || !busForm.driver_user_id"
              class="fk-btn fk-btn--primary"
            >
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>

        <div v-else class="p-6">
          <BusTrackStudentsPanel :bus-id="savedBusId" :capacity="Number(busForm.capacity) || 40" />
        </div>
      </div>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import SuccessFlashDialog from '@/components/SuccessFlashDialog.vue'
import BusTrackStudentsPanel from '@/components/BusTrackStudentsPanel.vue'
import { useSuccessFlash } from '@/composables/useSuccessFlash'
import { authService } from '@/services'
import { busService } from '@/services/bus.service'
import { feesV2Service } from '@/services/fees-v2.service'
import userService, { type User } from '@/services/user.service'

const route = useRoute()
const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const busIdParam = computed(() => route.params.busId as string | undefined)
const isEdit = computed(() => !!busIdParam.value && busIdParam.value !== 'new')
const savedBusId = computed(() => (isEdit.value && busIdParam.value ? busIdParam.value : null))
const activeTab = ref<'details' | 'track'>('details')

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: string } | null
  const raw = u?.school_id
  return raw != null && String(raw).trim() !== '' ? String(raw) : undefined
})

const {
  open: successOpen,
  title: successTitle,
  message: successMessage,
  durationMs: successDurationMs,
  show: showSuccessFlash,
  onFinished: onSuccessFinished,
} = useSuccessFlash()

const saving = ref(false)
const loadingStaff = ref(false)
const staffError = ref('')
const staffOptions = ref<User[]>([])
const feePackages = ref<Array<{ id: string; name: string }>>([])
const busForm = ref({
  title: '',
  capacity: 40,
  driver_user_id: '',
  driver_phone: '',
  supervisor_user_id: '',
  supervisor_phone: '',
})
const busFeeForm = ref({
  fee_package_id: '',
  lines: [] as Array<{ charge_type_id: string; label: string; amount: number }>,
})

function staffName(u: User) {
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.fullName || u.email || u.id
}

function staffLabel(u: User) {
  const name = staffName(u)
  return u.email ? `${name} (${u.email})` : name
}

function staffPhone(u: User | undefined) {
  if (!u) return ''
  return String(u.phone || u.mobile || '').trim()
}

const selectedDriver = computed(() => staffOptions.value.find((u) => u.id === busForm.value.driver_user_id))
const selectedSupervisor = computed(() =>
  staffOptions.value.find((u) => u.id === busForm.value.supervisor_user_id),
)

async function fillPhoneFromStaff(userId: string, target: 'driver' | 'supervisor') {
  if (!userId) {
    if (target === 'driver') busForm.value.driver_phone = ''
    else busForm.value.supervisor_phone = ''
    return
  }
  const fromList = staffPhone(
    target === 'driver' ? selectedDriver.value : selectedSupervisor.value,
  )
  if (fromList) {
    if (target === 'driver') busForm.value.driver_phone = fromList
    else busForm.value.supervisor_phone = fromList
    return
  }
  try {
    const u = await userService.getUserById(userId)
    const phone = staffPhone(u)
    if (target === 'driver') busForm.value.driver_phone = phone
    else busForm.value.supervisor_phone = phone
  } catch {
    if (target === 'driver') busForm.value.driver_phone = ''
    else busForm.value.supervisor_phone = ''
  }
}

const skipPhoneAutoFill = ref(false)

watch(
  () => busForm.value.driver_user_id,
  (id) => {
    if (skipPhoneAutoFill.value) return
    void fillPhoneFromStaff(id, 'driver')
  },
)

watch(
  () => busForm.value.supervisor_user_id,
  (id) => {
    if (skipPhoneAutoFill.value) return
    void fillPhoneFromStaff(id, 'supervisor')
  },
)

function isStaffUser(u: User) {
  if (u.isActive === false) return false
  if (u.user_type === 'parent' || u.user_type === 'student') return false
  if (u.role === 'parent' || u.role === 'student') return false
  const roles = Array.isArray(u.roles)
    ? u.roles
    : typeof u.roles === 'string'
      ? u.roles.split(',').map((r) => r.trim())
      : []
  if (roles.includes('parent') || roles.includes('student')) return false
  return true
}

async function loadStaff() {
  loadingStaff.value = true
  staffError.value = ''
  try {
    const users = await userService.getAllUsers()
    staffOptions.value = users.filter(isStaffUser).sort((a, b) => staffLabel(a).localeCompare(staffLabel(b), locale.value))
  } catch {
    staffOptions.value = []
    staffError.value = t('transportation.staffLoadFailed')
  } finally {
    loadingStaff.value = false
  }
}

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
  if (!schoolId.value) {
    busFeeForm.value = { fee_package_id: '', lines: [] }
    return
  }
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
  await loadStaff()
  if (schoolId.value) {
    feePackages.value = await feesV2Service.listPackages(schoolId.value)
  }
  if (isEdit.value && busIdParam.value) {
    const bus = await busService.getById(busIdParam.value)
    const driverId = bus.driver_user_id || ''
    const supervisorId = bus.supervisor_user_id || ''
    const driver = staffOptions.value.find((u) => u.id === driverId)
    const supervisor = staffOptions.value.find((u) => u.id === supervisorId)
    skipPhoneAutoFill.value = true
    busForm.value = {
      title: bus.title,
      capacity: bus.capacity,
      driver_user_id: driverId,
      driver_phone: bus.driverContacts || staffPhone(driver) || '',
      supervisor_user_id: supervisorId,
      supervisor_phone: staffPhone(supervisor),
    }
    await nextTick()
    skipPhoneAutoFill.value = false
    await loadBusFeeLink(bus.id)
  }
}

async function save() {
  saving.value = true
  try {
    let busId = isEdit.value ? busIdParam.value! : ''
    if (!busForm.value.driver_user_id) {
      window.alert(t('transportation.driverRequired'))
      return
    }
    const driver = selectedDriver.value
    const payload = {
      title: busForm.value.title.trim(),
      driverName: driver ? staffName(driver) : '',
      capacity: Number(busForm.value.capacity) || 40,
      driverContacts: busForm.value.driver_phone.trim() || null,
      driver_user_id: busForm.value.driver_user_id,
      supervisor_user_id: busForm.value.supervisor_user_id || null,
    }

    if (isEdit.value && busId) {
      await busService.update(busId, payload)
    } else {
      if (!schoolId.value) {
        window.alert(t('transportation.saveFailed'))
        return
      }
      const created = await busService.create({
        ...payload,
        school_id: schoolId.value,
      })
      busId = created.id
    }

    if (busFeeForm.value.fee_package_id && busId && schoolId.value) {
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

    if (!isEdit.value && busId) {
      showSuccessFlash({
        redirectTo: `/transportation/buses/${busId}`,
        onDone: () => {
          activeTab.value = 'track'
        },
      })
      return
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
