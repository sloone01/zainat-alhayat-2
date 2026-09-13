<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('platformSchools.registerTitle')"
        :subtitle="$t('platformSchools.registerSubtitle')"
      >
        <template #leading>
          <router-link
            to="/platform/schools"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('platformSchools.backToList')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="flashError" class="fk-alert fk-alert--error mb-4">{{ flashError }}</div>
      <div v-if="flashOk" class="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
        {{ flashOk }}
      </div>

      <form class="space-y-5" @submit.prevent="onSubmit(false)">
        <section class="fk-card">
          <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title">{{ $t('platformSchools.sectionSchool') }}</h2>
          </header>
          <div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-school-name-ar">
                {{ $t('platformSchools.fieldNameAr') }}
              </label>
              <input id="reg-school-name-ar" v-model="form.school_name_ar" type="text" required class="fk-field" maxlength="200" dir="rtl" lang="ar" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-school-name-en">
                {{ $t('platformSchools.fieldNameEn') }}
              </label>
              <input id="reg-school-name-en" v-model="form.school_name_en" type="text" required class="fk-field" maxlength="200" dir="ltr" lang="en" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-school-email">
                {{ $t('platformSchools.fieldEmail') }}
              </label>
              <input id="reg-school-email" v-model="form.school_email" type="email" required class="fk-field" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-school-phone">
                {{ $t('platformSchools.fieldPhone') }}
              </label>
              <input id="reg-school-phone" v-model="form.school_phone" type="tel" required class="fk-field" maxlength="30" />
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-school-address">
                {{ $t('platformSchools.fieldAddress') }}
              </label>
              <textarea id="reg-school-address" v-model="form.school_address" rows="2" class="fk-field" maxlength="2000" />
            </div>
          </div>
        </section>

        <section class="fk-card">
          <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title">{{ $t('platformSchools.sectionOwner') }}</h2>
            <p class="fk-card__meta mt-1">{{ $t('platformSchools.registerOwnerHint') }}</p>
          </header>
          <div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-owner-first">
                {{ $t('platformSchools.fieldOwnerFirstName') }}
              </label>
              <input id="reg-owner-first" v-model="form.owner_first_name" type="text" required class="fk-field" maxlength="100" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-owner-last">
                {{ $t('platformSchools.fieldOwnerLastName') }}
              </label>
              <input id="reg-owner-last" v-model="form.owner_last_name" type="text" required class="fk-field" maxlength="100" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-owner-email">
                {{ $t('platformSchools.fieldOwnerEmail') }}
              </label>
              <input id="reg-owner-email" v-model="form.owner_email" type="email" required class="fk-field" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-owner-phone">
                {{ $t('platformSchools.fieldOwnerPhone') }}
              </label>
              <input id="reg-owner-phone" v-model="form.owner_phone" type="tel" required class="fk-field" maxlength="20" />
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-owner-legal">
                {{ $t('platformSchools.fieldOwnerLegalName') }}
              </label>
              <input id="reg-owner-legal" v-model="form.owner_legal_name" type="text" class="fk-field" maxlength="255" />
            </div>
          </div>
        </section>

        <section class="fk-card">
          <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title">{{ $t('platformSchools.sectionPlan') }}</h2>
          </header>
          <div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-plan">
                {{ $t('platformSchools.fieldPlan') }}
              </label>
              <select id="reg-plan" v-model="form.plan_code" required class="fk-field" :disabled="plansLoading">
                <option v-for="plan in plans" :key="plan.code" :value="plan.code">
                  {{ locale.startsWith('ar') ? plan.name_ar : plan.name_en }}
                </option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-period">
                {{ $t('platformSchools.fieldBillingPeriod') }}
              </label>
              <select id="reg-period" v-model="form.billing_period" required class="fk-field">
                <option v-for="period in billingPeriods" :key="period" :value="period">
                  {{ $t(`platformBilling.periods.${period}`) }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <section class="fk-card">
          <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title">{{ $t('platformSchools.sectionPayment') }}</h2>
            <p class="fk-card__meta mt-1">{{ $t('platformSchools.sectionPaymentHint') }}</p>
          </header>
          <div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-paid-amount">
                {{ $t('platformBilling.paidAmount') }}
              </label>
              <input
                id="reg-paid-amount"
                v-model.number="form.paid_amount"
                type="number"
                min="0"
                step="0.001"
                class="fk-field"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-receipt">
                {{ $t('platformBilling.receipt') }}
              </label>
              <input
                id="reg-receipt"
                type="file"
                accept=".pdf,image/*"
                class="fk-field"
                @change="onReceiptFile"
              />
              <p class="mt-1 text-xs text-gray-500">{{ $t('platformSchools.receiptRequiredHint') }}</p>
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-paid-note">
                {{ $t('platformBilling.paidNote') }}
              </label>
              <textarea
                id="reg-paid-note"
                v-model="form.paid_note"
                rows="2"
                class="fk-field"
                :placeholder="$t('platformBilling.paidNotePlaceholder')"
              />
            </div>
          </div>
        </section>

        <section class="fk-card">
          <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title">{{ $t('platformSchools.sectionDocs') }}</h2>
            <p class="fk-card__meta mt-1">{{ $t('platformSchools.registerDocsOptional') }}</p>
          </header>
          <div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-cr">
                {{ $t('platformSchools.crDocument') }}
              </label>
              <input id="reg-cr" type="file" accept=".pdf,image/*" class="fk-field" @change="onCrFile" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-id">
                {{ $t('platformSchools.ownerIdDocument') }}
              </label>
              <input id="reg-id" type="file" accept=".pdf,image/*" class="fk-field" @change="onIdFile" />
            </div>
          </div>
        </section>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <router-link to="/platform/schools" class="fk-btn fk-btn--pearl">
            {{ $t('common.cancel') }}
          </router-link>
          <button
            type="button"
            class="fk-btn fk-btn--pearl"
            :disabled="submitting || plansLoading"
            @click="onSubmit(true)"
          >
            {{ submittingDraft ? $t('platformSchools.savingDraft') : $t('platformSchools.saveDraft') }}
          </button>
          <button type="submit" class="fk-btn fk-btn--primary" :disabled="submitting || plansLoading">
            {{ submittingSubmit ? $t('platformSchools.registering') : $t('platformSchools.registerSubmit') }}
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import {
  platformBillingService,
  type PlatformBillingPeriod,
  type PlatformPlan,
} from '@/services/platform-billing.service'
import { platformSchoolService } from '@/services'
import { setSelectedPlatformSchoolId } from '@/composables/usePlatformSchoolSelection'

const { t, locale } = useI18n()
const router = useRouter()
const isRTL = computed(() => String(locale.value || '').startsWith('ar'))

const plans = ref<PlatformPlan[]>([])
const billingPeriods = ref<PlatformBillingPeriod[]>(['monthly', 'semester', 'yearly', 'summer'])
const plansLoading = ref(true)
const submitting = ref(false)
const submittingDraft = ref(false)
const submittingSubmit = ref(false)
const flashError = ref('')
const flashOk = ref('')
const crFile = ref<File | null>(null)
const idFile = ref<File | null>(null)
const receiptFile = ref<File | null>(null)

const form = reactive({
  school_name_ar: '',
  school_name_en: '',
  school_email: '',
  school_phone: '',
  school_address: '',
  owner_first_name: '',
  owner_last_name: '',
  owner_email: '',
  owner_phone: '',
  owner_legal_name: '',
  plan_code: '',
  billing_period: 'monthly' as PlatformBillingPeriod,
  paid_amount: 0 as number,
  paid_note: '',
})

function planPriceForSelection(): number {
  const plan = plans.value.find((p) => p.code === form.plan_code)
  const price = plan?.prices?.find((p) => p.billing_period === form.billing_period)
  return Number(price?.amount_omr) || 0
}

watch(
  () => [form.plan_code, form.billing_period] as const,
  () => {
    form.paid_amount = planPriceForSelection()
  },
)

function onCrFile(e: Event) {
  const input = e.target as HTMLInputElement
  crFile.value = input.files?.[0] || null
}

function onIdFile(e: Event) {
  const input = e.target as HTMLInputElement
  idFile.value = input.files?.[0] || null
}

function onReceiptFile(e: Event) {
  const input = e.target as HTMLInputElement
  receiptFile.value = input.files?.[0] || null
}

async function loadPlans() {
  plansLoading.value = true
  flashError.value = ''
  try {
    const catalog = await platformBillingService.listAdminPlans()
    plans.value = (catalog.plans || []).filter((p) => p.is_active !== false)
    if (catalog.billing_periods?.length) billingPeriods.value = catalog.billing_periods
    if (!form.plan_code && plans.value.length) {
      form.plan_code = plans.value.find((p) => p.code === 'standard')?.code || plans.value[0].code
    }
    form.paid_amount = planPriceForSelection()
  } catch (e) {
    flashError.value = (e as Error)?.message || t('platformSchools.loadError')
  } finally {
    plansLoading.value = false
  }
}

async function onSubmit(asDraft: boolean) {
  flashError.value = ''
  flashOk.value = ''
  if (!form.plan_code) {
    flashError.value = t('platformSchools.planRequired')
    return
  }
  if (!asDraft) {
    const amount = Number(form.paid_amount)
    if (!Number.isFinite(amount) || amount < 0) {
      flashError.value = t('platformBilling.paidAmountInvalid')
      return
    }
    if (!receiptFile.value) {
      flashError.value = t('platformSchools.receiptRequired')
      return
    }
  }

  submitting.value = true
  submittingDraft.value = asDraft
  submittingSubmit.value = !asDraft
  try {
    const fd = new FormData()
    fd.append('school_name_ar', form.school_name_ar.trim())
    fd.append('school_name_en', form.school_name_en.trim())
    fd.append('school_name', form.school_name_ar.trim() || form.school_name_en.trim())
    fd.append('school_email', form.school_email.trim())
    fd.append('school_phone', form.school_phone.trim())
    if (form.school_address.trim()) fd.append('school_address', form.school_address.trim())
    fd.append('owner_first_name', form.owner_first_name.trim())
    fd.append('owner_last_name', form.owner_last_name.trim())
    fd.append('owner_email', form.owner_email.trim())
    fd.append('owner_phone', form.owner_phone.trim())
    if (form.owner_legal_name.trim()) fd.append('owner_legal_name', form.owner_legal_name.trim())
    fd.append('plan_code', form.plan_code)
    fd.append('billing_period', form.billing_period)
    fd.append('save_as_draft', asDraft ? 'true' : 'false')
    if (!asDraft) {
      fd.append('paid_amount', String(Number(form.paid_amount)))
      if (form.paid_note.trim()) fd.append('paid_note', form.paid_note.trim())
      if (receiptFile.value) fd.append('receipt', receiptFile.value)
    }
    if (crFile.value) fd.append('cr_copy', crFile.value)
    if (idFile.value) fd.append('id_copy', idFile.value)

    const school = await platformSchoolService.register(fd)
    flashOk.value =
      school.status === 'active'
        ? t('platformSchools.registerSuccessActive')
        : t('platformSchools.registerSuccessDraft')
    setSelectedPlatformSchoolId(school.id)
    await router.push({ name: 'platform-school-registration', state: { schoolId: school.id } })
  } catch (e) {
    flashError.value = (e as Error)?.message || t('platformSchools.registerError')
  } finally {
    submitting.value = false
    submittingDraft.value = false
    submittingSubmit.value = false
  }
}

onMounted(loadPlans)
</script>
