<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('platformDiscounts.title')" />

      <div v-if="error" class="fk-alert fk-alert--error">
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ error }}</span>
          <button type="button" class="font-semibold underline" @click="load">
            {{ $t('platformBilling.tryAgain') }}
          </button>
        </div>
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('platformDiscounts.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('platformDiscounts.count', { count: filtered.length }) }}
            </p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrToolbarSearch v-model="searchQuery" :placeholder="$t('common.search')" />
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('platformDiscounts.new')"
              @click="openCreate"
            >
              <IconPlus />
            </button>
          </div>
        </header>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <FikrLoader size="sm" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="filtered.length">
            <div class="fk-table-wrap overflow-visible">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('platformDiscounts.colName') }}</th>
                    <th>{{ $t('platformDiscounts.colKind') }}</th>
                    <th>{{ $t('platformDiscounts.colValue') }}</th>
                    <th>{{ $t('platformDiscounts.colAppliesTo') }}</th>
                    <th>{{ $t('platformDiscounts.colValidity') }}</th>
                    <th>{{ $t('platformDiscounts.colUsage') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th class="text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in paginatedItems"
                    :key="row.id"
                    class="hover:bg-fikr-pearl"
                    :class="!row.is_active ? 'opacity-70' : ''"
                  >
                    <td>
                      <div class="font-medium text-fikr-ink">{{ displayName(row) }}</div>
                      <div v-if="row.code" class="mt-0.5 font-mono text-xs text-fikr-ink-soft" dir="ltr">{{ row.code }}</div>
                    </td>
                    <td>{{ $t(`platformDiscounts.kinds.${row.kind}`) }}</td>
                    <td class="tabular-nums" dir="ltr">{{ valueLabel(row) }}</td>
                    <td>
                      <div>{{ planLabel(row) }}</div>
                      <div v-if="row.school_name" class="mt-0.5 text-xs text-fikr-ink-soft">{{ row.school_name }}</div>
                      <div v-if="row.billing_periods.length" class="mt-0.5 text-xs text-fikr-ink-soft">
                        {{ row.billing_periods.map((p) => $t(`platformBilling.periods.${p}`)).join(' · ') }}
                      </div>
                    </td>
                    <td class="text-xs tabular-nums" dir="ltr">{{ validityLabel(row) }}</td>
                    <td class="text-xs">
                      <div v-if="row.kind === 'promo'" class="tabular-nums" dir="ltr">
                        {{ row.redemption_count }}{{ row.max_redemptions != null ? ` / ${row.max_redemptions}` : '' }}
                      </div>
                      <div v-if="row.duration_periods">
                        {{ $t('platformDiscounts.durationShort', { count: row.duration_periods }) }}
                      </div>
                    </td>
                    <td>
                      <span class="fk-chip" :class="row.is_active ? 'fk-chip--green' : 'fk-chip--neutral'">
                        {{ row.is_active ? $t('platformBilling.planActive') : $t('platformBilling.planInactive') }}
                      </span>
                    </td>
                    <td class="text-end">
                      <RowActionsMenu
                        :open="activeMenuId === row.id"
                        placement="up"
                        @toggle="toggleMenu(row.id)"
                      >
                        <RowActionsItem icon="edit" @click="openEdit(row)">
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem
                          :icon="row.is_active ? 'archive' : 'activate'"
                          @click="setActive(row, !row.is_active)"
                        >
                          {{ row.is_active ? $t('platformBilling.deactivate') : $t('platformBilling.activate') }}
                        </RowActionsItem>
                        <RowActionsItem icon="delete" danger @click="remove(row)">
                          {{ $t('common.delete') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filtered.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="fk-empty">
            <h3 class="fk-empty__title">{{ $t('platformDiscounts.empty') }}</h3>
            <button type="button" class="fk-btn fk-btn--primary mt-5" @click="openCreate">
              {{ $t('platformDiscounts.new') }}
            </button>
          </div>
        </div>
      </section>

      <FikrDialog
        :show="dialogOpen"
        :title="editingId ? $t('platformDiscounts.editTitle') : $t('platformDiscounts.newTitle')"
        size="lg"
        plain-footer
        @close="dialogOpen = false"
      >
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="fk-flabel" for="disc-kind"><span>{{ $t('platformDiscounts.colKind') }}</span></label>
              <select id="disc-kind" v-model="form.kind" class="fk-field">
                <option value="package">{{ $t('platformDiscounts.kinds.package') }}</option>
                <option value="school">{{ $t('platformDiscounts.kinds.school') }}</option>
                <option value="promo">{{ $t('platformDiscounts.kinds.promo') }}</option>
              </select>
            </div>
            <div v-if="form.kind === 'promo'">
              <label class="fk-flabel" for="disc-code"><span>{{ $t('platformDiscounts.code') }}</span></label>
              <input id="disc-code" v-model="form.code" type="text" maxlength="64" class="fk-field uppercase" dir="ltr" />
            </div>
            <div v-if="form.kind === 'school'">
              <label class="fk-flabel" for="disc-school"><span>{{ $t('platformDiscounts.school') }}</span></label>
              <select id="disc-school" v-model="form.school_id" class="fk-field">
                <option value="">—</option>
                <option v-for="s in schools" :key="s.id" :value="s.id">{{ schoolName(s) }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="fk-flabel" for="disc-name-ar"><span>{{ $t('platformBilling.nameAr') }}</span></label>
              <input id="disc-name-ar" v-model="form.name_ar" type="text" maxlength="120" class="fk-field" dir="rtl" lang="ar" />
            </div>
            <div>
              <label class="fk-flabel" for="disc-name-en"><span>{{ $t('platformBilling.nameEn') }}</span></label>
              <input id="disc-name-en" v-model="form.name_en" type="text" maxlength="120" class="fk-field" dir="ltr" lang="en" />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label class="fk-flabel" for="disc-type"><span>{{ $t('platformDiscounts.discountType') }}</span></label>
              <select id="disc-type" v-model="form.discount_type" class="fk-field">
                <option value="percent">{{ $t('platformDiscounts.types.percent') }}</option>
                <option value="fixed">{{ $t('platformDiscounts.types.fixed') }}</option>
              </select>
            </div>
            <div>
              <label class="fk-flabel" for="disc-value">
                <span>{{ form.discount_type === 'percent' ? $t('platformDiscounts.valuePercent') : $t('platformDiscounts.valueFixed') }}</span>
              </label>
              <input
                id="disc-value"
                v-model.number="form.value"
                type="number"
                min="0"
                :max="form.discount_type === 'percent' ? 100 : undefined"
                step="0.001"
                class="fk-field"
              />
            </div>
            <div>
              <label class="fk-flabel" for="disc-plan"><span>{{ $t('platformDiscounts.plan') }}</span></label>
              <select id="disc-plan" v-model="form.plan_code" class="fk-field">
                <option value="">{{ $t('platformDiscounts.allPlans') }}</option>
                <option v-for="p in plans" :key="p.code" :value="p.code">
                  {{ isRTL ? p.name_ar : p.name_en }}
                </option>
              </select>
            </div>
          </div>

          <fieldset>
            <legend class="fk-flabel"><span>{{ $t('platformDiscounts.periodsOptional') }}</span></legend>
            <div class="flex flex-wrap gap-4">
              <label v-for="period in periods" :key="period" class="flex items-center gap-2 text-sm text-gray-700">
                <input
                  v-model="form.billing_periods"
                  type="checkbox"
                  :value="period"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {{ $t(`platformBilling.periods.${period}`) }}
              </label>
            </div>
          </fieldset>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="fk-flabel" for="disc-start"><span>{{ $t('platformDiscounts.startsOn') }}</span></label>
              <input id="disc-start" v-model="form.starts_on" type="date" class="fk-field" />
            </div>
            <div>
              <label class="fk-flabel" for="disc-end"><span>{{ $t('platformDiscounts.endsOn') }}</span></label>
              <input id="disc-end" v-model="form.ends_on" type="date" class="fk-field" />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="fk-flabel" for="disc-duration"><span>{{ $t('platformDiscounts.durationPeriods') }}</span></label>
              <input id="disc-duration" v-model.number="form.duration_periods" type="number" min="1" step="1" class="fk-field" />
            </div>
            <div v-if="form.kind === 'promo'">
              <label class="fk-flabel" for="disc-max"><span>{{ $t('platformDiscounts.maxRedemptions') }}</span></label>
              <input id="disc-max" v-model.number="form.max_redemptions" type="number" min="1" step="1" class="fk-field" />
            </div>
          </div>

          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.is_active" type="checkbox" class="rounded border-gray-300 text-primary-600" />
            {{ $t('platformBilling.planActive') }}
          </label>
        </div>

        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="dialogOpen = false">
            {{ $t('common.cancel') }}
          </button>
          <button type="button" class="fk-btn fk-btn--primary" :disabled="saving" @click="save">
            {{ saving ? $t('platformBilling.savingPlan') : $t('common.save') }}
          </button>
        </template>
      </FikrDialog>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import FikrToolbarSearch from '@/components/FikrToolbarSearch.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { useFeedback } from '@/composables/useFeedback'
import {
  platformBillingService,
  type PlatformBillingPeriod,
  type PlatformDiscount,
  type PlatformDiscountKind,
  type PlatformDiscountPayload,
  type PlatformDiscountType,
  type PlatformPlan,
} from '@/services/platform-billing.service'
import { platformSchoolService, type RegisteredSchool } from '@/services/platform-school.service'

const { locale, t } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const rows = ref<PlatformDiscount[]>([])
const plans = ref<PlatformPlan[]>([])
const schools = ref<RegisteredSchool[]>([])
const periods = ref<PlatformBillingPeriod[]>(['monthly', 'semester', 'yearly', 'summer'])
const searchQuery = ref('')
const activeMenuId = ref<string | null>(null)

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) =>
    [r.name_en, r.name_ar, r.code, r.plan_code, r.school_name]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  )
})

const { paginatedItems, currentPage, totalPages, goToPage } = useClientPagination(filtered)

type DiscountForm = {
  kind: PlatformDiscountKind
  name_en: string
  name_ar: string
  code: string
  discount_type: PlatformDiscountType
  value: number | ''
  plan_code: string
  school_id: string
  billing_periods: PlatformBillingPeriod[]
  starts_on: string
  ends_on: string
  duration_periods: number | ''
  max_redemptions: number | ''
  is_active: boolean
}

const emptyForm = (): DiscountForm => ({
  kind: 'package',
  name_en: '',
  name_ar: '',
  code: '',
  discount_type: 'percent',
  value: '',
  plan_code: '',
  school_id: '',
  billing_periods: [],
  starts_on: '',
  ends_on: '',
  duration_periods: '',
  max_redemptions: '',
  is_active: true,
})

const dialogOpen = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref<DiscountForm>(emptyForm())

function displayName(row: PlatformDiscount) {
  return (isRTL.value ? row.name_ar : row.name_en) || row.name_en || row.name_ar
}

function valueLabel(row: PlatformDiscount) {
  return row.discount_type === 'percent' ? `${row.value}%` : `${row.value.toFixed(3)} OMR`
}

function planLabel(row: PlatformDiscount) {
  if (!row.plan_code) return t('platformDiscounts.allPlans')
  const plan = plans.value.find((p) => p.code === row.plan_code)
  return plan ? (isRTL.value ? plan.name_ar : plan.name_en) : row.plan_code
}

function validityLabel(row: PlatformDiscount) {
  if (!row.starts_on && !row.ends_on) return '—'
  return `${row.starts_on || '…'} → ${row.ends_on || '…'}`
}

function schoolName(s: RegisteredSchool) {
  return (isRTL.value ? s.name_ar : s.name_en) || s.name
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function handleClickOutside() {
  activeMenuId.value = null
}

function apiError(e: unknown) {
  const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
  const raw = ax.response?.data?.message
  if (Array.isArray(raw)) return raw.join('; ')
  return raw || ax.message || t('platformBilling.saveError')
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  dialogOpen.value = true
}

function openEdit(row: PlatformDiscount) {
  activeMenuId.value = null
  editingId.value = row.id
  form.value = {
    kind: row.kind,
    name_en: row.name_en,
    name_ar: row.name_ar,
    code: row.code || '',
    discount_type: row.discount_type,
    value: row.value,
    plan_code: row.plan_code || '',
    school_id: row.school_id || '',
    billing_periods: [...row.billing_periods],
    starts_on: row.starts_on || '',
    ends_on: row.ends_on || '',
    duration_periods: row.duration_periods ?? '',
    max_redemptions: row.max_redemptions ?? '',
    is_active: row.is_active,
  }
  dialogOpen.value = true
}

function payloadFrom(f: DiscountForm): PlatformDiscountPayload {
  return {
    kind: f.kind,
    name_en: f.name_en.trim(),
    name_ar: f.name_ar.trim(),
    code: f.kind === 'promo' ? f.code.trim().toUpperCase() : null,
    discount_type: f.discount_type,
    value: Number(f.value) || 0,
    plan_code: f.plan_code || null,
    school_id: f.kind === 'school' ? f.school_id || null : null,
    billing_periods: f.billing_periods,
    starts_on: f.starts_on || null,
    ends_on: f.ends_on || null,
    duration_periods: f.duration_periods === '' ? null : Number(f.duration_periods),
    max_redemptions: f.kind === 'promo' && f.max_redemptions !== '' ? Number(f.max_redemptions) : null,
    is_active: f.is_active,
  }
}

function payloadOf(row: PlatformDiscount): PlatformDiscountPayload {
  return {
    kind: row.kind,
    name_en: row.name_en,
    name_ar: row.name_ar,
    code: row.code,
    discount_type: row.discount_type,
    value: row.value,
    plan_code: row.plan_code,
    school_id: row.school_id,
    billing_periods: row.billing_periods,
    starts_on: row.starts_on,
    ends_on: row.ends_on,
    duration_periods: row.duration_periods,
    max_redemptions: row.max_redemptions,
    is_active: row.is_active,
  }
}

async function save() {
  const f = form.value
  if (!f.name_en.trim() || !f.name_ar.trim()) {
    feedback.error(t('platformDiscounts.namesRequired'))
    return
  }
  if (f.value === '' || Number(f.value) <= 0) {
    feedback.error(t('platformDiscounts.valueRequired'))
    return
  }
  if (f.discount_type === 'percent' && Number(f.value) > 100) {
    feedback.error(t('platformDiscounts.percentTooHigh'))
    return
  }
  if (f.kind === 'promo' && !f.code.trim()) {
    feedback.error(t('platformDiscounts.codeRequired'))
    return
  }
  if (f.kind === 'school' && !f.school_id) {
    feedback.error(t('platformDiscounts.schoolRequired'))
    return
  }
  saving.value = true
  try {
    const payload = payloadFrom(f)
    if (editingId.value) await platformBillingService.updateDiscount(editingId.value, payload)
    else await platformBillingService.createDiscount(payload)
    dialogOpen.value = false
    feedback.saved(t('platformDiscounts.saved'))
    await load()
  } catch (e) {
    feedback.error(apiError(e))
  } finally {
    saving.value = false
  }
}

async function setActive(row: PlatformDiscount, isActive: boolean) {
  activeMenuId.value = null
  try {
    await platformBillingService.updateDiscount(row.id, { ...payloadOf(row), is_active: isActive })
    feedback.saved(isActive ? t('platformDiscounts.activated') : t('platformDiscounts.deactivated'))
    await load()
  } catch (e) {
    feedback.error(apiError(e))
  }
}

async function remove(row: PlatformDiscount) {
  activeMenuId.value = null
  const ok = await feedback.confirm({
    title: t('common.delete'),
    message: t('platformDiscounts.confirmDelete', { name: displayName(row) }),
    confirmLabel: t('common.delete'),
    danger: true,
  })
  if (!ok) return
  try {
    await platformBillingService.deleteDiscount(row.id)
    await load()
  } catch (e) {
    feedback.error(apiError(e))
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await platformBillingService.listDiscounts()
  } catch (e) {
    error.value = apiError(e) || t('platformBilling.loadError')
  } finally {
    loading.value = false
  }
}

async function loadLookups() {
  try {
    const [catalog, schoolList] = await Promise.all([
      platformBillingService.listAdminPlans(),
      platformSchoolService.listRegistered(),
    ])
    plans.value = catalog.plans
    if (catalog.billing_periods?.length) periods.value = catalog.billing_periods
    schools.value = schoolList
  } catch {
    /* the list surfaces its own error */
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void load()
  void loadLookups()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
