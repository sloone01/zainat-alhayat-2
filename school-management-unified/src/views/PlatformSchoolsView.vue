<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <h1 class="text-xl font-bold text-gray-900">{{ $t('platformSchools.title') }}</h1>
          <div class="text-sm text-gray-500">
            {{ $t('platformSchools.total', { count: schools.length }) }}
          </div>
        </div>

        <div class="mt-4">
          <input
            v-model="search"
            type="search"
            class="w-full sm:max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            :placeholder="$t('platformSchools.searchPlaceholder')"
          />
        </div>
      </div>

      <div v-if="loading" class="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 text-sm">
        {{ $t('common.loading') || 'Loading…' }}
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
        {{ error }}
      </div>

      <div v-else-if="filtered.length === 0" class="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-500 text-sm">
        {{ $t('platformSchools.empty') }}
      </div>

      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr class="text-start">
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('platformSchools.colSchool') }}</th>
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('platformSchools.colContact') }}</th>
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('platformSchools.colStatus') }}</th>
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('platformBilling.colPlan') }}</th>
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('platformBilling.colPeriod') }}</th>
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('platformBilling.colSubStatus') }}</th>
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('platformSchools.colStudents') }}</th>
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('platformSchools.colRegistered') }}</th>
                <th class="px-4 py-3 font-semibold text-gray-700">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="school in filtered"
                :key="school.id"
                class="border-b border-gray-100 hover:bg-primary-50/40"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="school.logo_url"
                      :src="school.logo_url"
                      alt=""
                      class="h-10 w-10 rounded-full object-cover border border-gray-200"
                    />
                    <div
                      v-else
                      class="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold"
                    >
                      {{ school.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900">{{ school.name }}</div>
                      <div class="text-xs text-gray-500">#{{ school.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-700">
                  <div class="font-medium text-gray-900">
                    {{
                      school.owner
                        ? `${school.owner.firstName} ${school.owner.lastName}`.trim()
                        : school.owner_legal_name || '—'
                    }}
                  </div>
                  <div>{{ school.owner?.email || school.email || '—' }}</div>
                  <div class="text-xs text-gray-500">{{ school.owner?.phone || school.phone || '—' }}</div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="statusClass(school.status)"
                  >
                    {{ statusLabel(school.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-800 capitalize">{{ school.planCode || '—' }}</td>
                <td class="px-4 py-3 text-gray-700">
                  {{
                    school.billingPeriod
                      ? $t(`platformBilling.periods.${school.billingPeriod}`)
                      : '—'
                  }}
                </td>
                <td class="px-4 py-3">
                  <span v-if="school.subscriptionStatus" class="text-xs text-gray-700">
                    {{ subStatusLabel(school.subscriptionStatus) }}
                  </span>
                  <span v-else class="text-xs text-gray-400">—</span>
                  <div v-if="school.invoiceStatus" class="text-xs text-gray-500 mt-0.5">
                    {{ invoiceStatusLabel(school.invoiceStatus) }}
                  </div>
                </td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ school.studentCount }}</td>
                <td class="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {{ formatDate(school.created_at) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-col items-start gap-1.5">
                    <button
                      v-if="school.status === 'pending'"
                      type="button"
                      class="rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      :disabled="approveBusyId === school.id"
                      @click="approveSchool(school)"
                    >
                      {{
                        approveBusyId === school.id
                          ? $t('platformSchools.approving')
                          : $t('platformSchools.approve')
                      }}
                    </button>
                    <button
                      type="button"
                      class="text-sm font-medium text-primary-700 hover:text-primary-900 hover:underline"
                      @click="openBilling(school)"
                    >
                      {{ $t('platformBilling.manage') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Billing drawer -->
    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/30" @click="closeDrawer" />
      <div
        class="relative z-50 w-full max-w-lg bg-white shadow-xl h-full overflow-y-auto border-s border-gray-200"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('platformBilling.drawerTitle') }}</h2>
            <p class="text-sm text-gray-500">{{ selectedSchool?.name }}</p>
          </div>
          <button
            type="button"
            class="text-sm text-gray-600 hover:text-gray-900"
            @click="closeDrawer"
          >
            {{ $t('common.close') }}
          </button>
        </div>

        <div class="p-4 space-y-5">
          <p v-if="drawerError" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {{ drawerError }}
          </p>
          <p v-if="drawerMsg" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            {{ drawerMsg }}
          </p>

          <div v-if="drawerLoading" class="text-sm text-gray-500 py-8 text-center">
            {{ $t('common.loading') }}
          </div>

          <template v-else>
            <div class="text-sm text-gray-600">
              {{ $t('platformBilling.students') }}:
              <span class="font-semibold text-gray-900">{{ bundle?.studentCount ?? 0 }}</span>
            </div>

            <p v-if="!bundle?.subscription" class="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {{ $t('platformBilling.noSubscription') }}
            </p>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.planLabel') }}</label>
                <select v-model="form.plan_code" class="input-field">
                  <option v-for="p in catalogPlans" :key="p.code" :value="p.code">
                    {{ locale === 'ar' ? p.name_ar : p.name_en }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.periodLabel') }}</label>
                <select v-model="form.billing_period" class="input-field">
                  <option v-for="period in periods" :key="period" :value="period">
                    {{ $t(`platformBilling.periods.${period}`) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('platformBilling.subStatus') }}</label>
                <select v-model="form.status" class="input-field">
                  <option value="draft">{{ $t('platformBilling.subStatuses.draft') }}</option>
                  <option value="active">{{ $t('platformBilling.subStatuses.active') }}</option>
                  <option value="past_due">{{ $t('platformBilling.subStatuses.past_due') }}</option>
                  <option value="cancelled">{{ $t('platformBilling.subStatuses.cancelled') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('platformBilling.schoolStatus') }}</label>
                <select v-model="form.school_status" class="input-field">
                  <option value="pending">{{ $t('platformSchools.status.pending') }}</option>
                  <option value="active">{{ $t('platformSchools.status.active') }}</option>
                  <option value="suspended">{{ $t('platformSchools.status.suspended') }}</option>
                  <option value="rejected">{{ $t('platformSchools.status.rejected') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('platformBilling.addons') }}</label>
                <div class="space-y-2">
                  <label
                    v-for="addon in catalogAddons"
                    :key="addon.code"
                    class="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      :value="addon.code"
                      v-model="form.addon_codes"
                    />
                    <span>
                      {{ locale === 'ar' ? addon.name_ar : addon.name_en }}
                      <span class="text-gray-500">({{ addon.amount_omr }} OMR)</span>
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('platformBilling.notes') }}</label>
                <textarea v-model="form.notes" rows="2" class="input-field" />
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                :disabled="actionBusy"
                @click="saveSubscription"
              >
                {{ $t('platformBilling.saveSubscription') }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                :disabled="actionBusy || !bundle?.subscription"
                @click="issueInvoice"
              >
                {{ $t('platformBilling.issueInvoice') }}
              </button>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ $t('platformBilling.invoices') }}</h3>
              <div v-if="!bundle?.invoices?.length" class="text-sm text-gray-400">—</div>
              <ul v-else class="space-y-2">
                <li
                  v-for="inv in bundle.invoices"
                  :key="inv.id"
                  class="rounded-lg border border-gray-200 p-3 text-sm"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="font-medium text-gray-900">
                        #{{ inv.id }} · {{ inv.total_amount }} OMR
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ inv.period_start }} → {{ inv.period_end }} ·
                        {{ invoiceStatusLabel(inv.status) }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ $t('platformBilling.students') }}: {{ inv.seats_used }}/{{ inv.seats_included }}
                      </div>
                    </div>
                    <button
                      v-if="inv.status === 'issued' || inv.status === 'draft'"
                      type="button"
                      class="shrink-0 text-xs font-medium text-primary-700 hover:underline disabled:opacity-50"
                      :disabled="actionBusy"
                      @click="markPaid(inv.id)"
                    >
                      {{ $t('platformBilling.markPaid') }}
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  platformSchoolService,
  type RegisteredSchool,
} from '@/services/platform-school.service'
import {
  platformBillingService,
  type PlatformAddon,
  type PlatformBillingPeriod,
  type PlatformPlan,
  type SchoolSubscriptionBundle,
} from '@/services/platform-billing.service'

const { locale, t, te } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schools = ref<RegisteredSchool[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const approveBusyId = ref<number | null>(null)

const drawerOpen = ref(false)
const drawerLoading = ref(false)
const drawerError = ref('')
const drawerMsg = ref('')
const actionBusy = ref(false)
const selectedSchool = ref<RegisteredSchool | null>(null)
const bundle = ref<SchoolSubscriptionBundle | null>(null)
const catalogPlans = ref<PlatformPlan[]>([])
const catalogAddons = ref<PlatformAddon[]>([])
const periods = ref<PlatformBillingPeriod[]>(['monthly', 'semester', 'yearly', 'summer'])

const form = reactive({
  plan_code: 'standard',
  billing_period: 'monthly' as PlatformBillingPeriod,
  status: 'draft',
  school_status: 'pending' as 'pending' | 'active' | 'suspended' | 'rejected',
  addon_codes: [] as string[],
  notes: '',
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return schools.value
  return schools.value.filter((s) => {
    const hay = [
      s.name,
      s.email,
      s.phone,
      s.owner?.email,
      s.owner?.phone,
      s.owner?.firstName,
      s.owner?.lastName,
      s.status,
      s.planCode,
      s.billingPeriod,
      s.subscriptionStatus,
      String(s.id),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

function formatDate(value: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(locale.value === 'ar' ? 'ar' : 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

function statusLabel(status: string) {
  const key = `platformSchools.status.${status || 'active'}`
  return te(key) ? t(key) : status
}

function subStatusLabel(status: string) {
  const key = `platformBilling.subStatuses.${status}`
  return te(key) ? t(key) : status
}

function invoiceStatusLabel(status: string) {
  const key = `platformBilling.invoiceStatuses.${status}`
  return te(key) ? t(key) : status
}

function statusClass(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
    case 'pending':
      return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
    case 'suspended':
      return 'bg-orange-50 text-orange-800 ring-1 ring-orange-200'
    case 'rejected':
      return 'bg-red-50 text-red-800 ring-1 ring-red-200'
    default:
      return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200'
  }
}

async function reloadList() {
  schools.value = await platformSchoolService.listRegistered()
}

async function approveSchool(school: RegisteredSchool) {
  if (!confirm(t('platformSchools.approveConfirm', { name: school.name }))) return
  approveBusyId.value = school.id
  error.value = ''
  try {
    await platformSchoolService.approve(school.id)
    await reloadList()
  } catch (e: any) {
    error.value = e?.message || t('platformSchools.approveError')
  } finally {
    approveBusyId.value = null
  }
}

async function openBilling(school: RegisteredSchool) {
  selectedSchool.value = school
  drawerOpen.value = true
  drawerLoading.value = true
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    const [catalog, detail] = await Promise.all([
      platformBillingService.listAdminPlans(),
      platformBillingService.getSchoolSubscription(school.id),
    ])
    catalogPlans.value = catalog.plans
    catalogAddons.value = catalog.addons
    if (catalog.billing_periods?.length) periods.value = catalog.billing_periods
    bundle.value = detail
    form.plan_code = detail.subscription?.plan_code || catalog.plans[0]?.code || 'standard'
    form.billing_period =
      (detail.subscription?.billing_period as PlatformBillingPeriod) || 'monthly'
    form.status = detail.subscription?.status || 'draft'
    form.school_status = (detail.school.status as typeof form.school_status) || 'pending'
    form.addon_codes = [...(detail.subscription?.addon_codes || [])]
    form.notes = detail.subscription?.notes || ''
  } catch (e: any) {
    drawerError.value = e?.message || t('platformBilling.loadError')
  } finally {
    drawerLoading.value = false
  }
}

function closeDrawer() {
  drawerOpen.value = false
  selectedSchool.value = null
  bundle.value = null
}

async function saveSubscription() {
  if (!selectedSchool.value) return
  actionBusy.value = true
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    bundle.value = await platformBillingService.upsertSchoolSubscription(selectedSchool.value.id, {
      plan_code: form.plan_code,
      billing_period: form.billing_period,
      status: form.status,
      school_status: form.school_status,
      addon_codes: form.addon_codes,
      notes: form.notes || null,
    })
    drawerMsg.value = t('platformBilling.saved')
    await reloadList()
  } catch (e: any) {
    drawerError.value = e?.message || t('platformBilling.saveError')
  } finally {
    actionBusy.value = false
  }
}

async function issueInvoice() {
  if (!selectedSchool.value) return
  actionBusy.value = true
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    await platformBillingService.issueInvoice(selectedSchool.value.id)
    bundle.value = await platformBillingService.getSchoolSubscription(selectedSchool.value.id)
    drawerMsg.value = t('platformBilling.invoiceIssued')
    await reloadList()
  } catch (e: any) {
    drawerError.value = e?.message || t('platformBilling.saveError')
  } finally {
    actionBusy.value = false
  }
}

async function markPaid(invoiceId: number) {
  if (!selectedSchool.value) return
  actionBusy.value = true
  drawerError.value = ''
  drawerMsg.value = ''
  try {
    await platformBillingService.markInvoicePaid(invoiceId, { activate_school: true })
    bundle.value = await platformBillingService.getSchoolSubscription(selectedSchool.value.id)
    form.school_status = 'active'
    form.status = 'active'
    drawerMsg.value = t('platformBilling.invoicePaid')
    await reloadList()
  } catch (e: any) {
    drawerError.value = e?.message || t('platformBilling.saveError')
  } finally {
    actionBusy.value = false
  }
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    await reloadList()
  } catch (e: any) {
    error.value = e?.message || t('platformSchools.loadError')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}
</style>
