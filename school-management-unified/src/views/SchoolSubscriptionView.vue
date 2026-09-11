<template>
  <div
    class="relative min-h-screen overflow-x-hidden bg-hub-bg font-hubBody text-hub-ink selection:bg-hub-mint"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <!-- Soft atmosphere -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(201,234,221,0.55),_transparent_65%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -start-24 top-40 h-72 w-72 rounded-full bg-hub-mint/30 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -end-20 top-72 h-64 w-64 rounded-full bg-hub-primary/10 blur-3xl"
      aria-hidden="true"
    />

    <header class="sticky top-0 z-30 border-b border-hub-outline/50 bg-hub-surface/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <router-link
            to="/"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('subscription.backHome')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <router-link to="/" class="inline-flex shrink-0 items-center">
            <img
              src="/fikr-logo.png?v=4"
              :alt="$t('forSchools.logoAlt')"
              class="h-9 w-auto max-w-[9rem] object-contain sm:h-10 sm:max-w-[11rem]"
            >
          </router-link>
        </div>
        <LanguageSwitcher />
      </div>
    </header>

    <main class="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 pb-20">
      <div v-if="!submitted" class="mb-8 text-center sm:mb-10">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-hub-primary/80">
          {{ $t('subscription.eyebrow') }}
        </p>
        <h1 class="font-hubDisplay text-3xl font-bold tracking-tight text-hub-ink sm:text-4xl">
          {{ $t('subscription.title') }}
        </h1>
        <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-hub-muted sm:text-base">
          {{ $t('subscription.subtitle') }}
        </p>
      </div>

      <!-- Pending approval success -->
      <div
        v-if="submitted"
        class="mx-auto flex min-h-[min(70vh,36rem)] max-w-3xl flex-col items-center justify-center rounded-[2rem] border border-hub-outline/40 bg-white px-8 py-14 text-center shadow-[0_24px_60px_-28px_rgba(15,60,45,0.35)] sm:px-14 sm:py-20"
      >
        <div
          class="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-hub-mint text-hub-primary ring-8 ring-hub-mint/40"
          aria-hidden="true"
        >
          <span class="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h1 class="font-hubDisplay text-3xl font-bold tracking-tight text-hub-ink sm:text-4xl">
          {{ $t('subscription.pendingTitle') }}
        </h1>
        <p class="mx-auto mt-4 max-w-lg text-base leading-relaxed text-hub-muted sm:text-lg">
          {{ $t('subscription.pendingBody') }}
        </p>
        <div class="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <router-link
            to="/login"
            class="inline-flex flex-1 items-center justify-center rounded-xl bg-hub-primary px-6 py-3.5 text-sm font-bold text-white shadow-hub-soft hover:bg-hub-primary-container"
          >
            {{ $t('nav.signIn') }}
          </router-link>
          <router-link
            to="/"
            class="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-hub-primary px-6 py-3.5 text-sm font-bold text-hub-primary hover:bg-hub-mint/40"
          >
            {{ $t('subscription.backHome') }}
          </router-link>
        </div>
      </div>

      <form v-else class="space-y-6" @submit.prevent="onSubmit">
        <!-- Plan picker — single layout -->
        <section
          id="subscribe-plan"
          class="scroll-mt-20 overflow-hidden rounded-3xl border border-hub-outline/50 bg-white/95 shadow-hub-soft backdrop-blur-sm"
        >
          <div class="border-b border-hub-outline/40 px-5 py-5 sm:px-8 sm:py-6">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-hub-primary text-sm font-bold text-white">1</span>
              <h2 class="font-hubDisplay text-lg font-bold text-hub-ink sm:text-xl">
                {{ $t('subscription.sectionPlan') }}
              </h2>
            </div>
            <p class="mt-2 max-w-xl text-sm text-hub-muted">
              {{ $t('subscription.sectionPlanHint') }}
            </p>

            <div class="mt-5 flex w-full justify-center">
              <div
                class="inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full bg-hub-surface-low p-1.5 ring-1 ring-hub-outline/40"
                role="tablist"
                :aria-label="$t('subscription.periodLabel')"
              >
                <button
                  v-for="period in billingPeriods"
                  :key="period"
                  type="button"
                  role="tab"
                  class="inline-flex items-center justify-center rounded-full px-3.5 py-2 text-center text-sm font-semibold transition sm:px-5"
                  :class="
                    billing_period === period
                      ? 'bg-white text-hub-ink shadow-sm'
                      : 'text-hub-muted hover:text-hub-primary'
                  "
                  :aria-selected="billing_period === period"
                  @click="billing_period = period"
                >
                  {{ $t(`platformBilling.periods.${period}`) }}
                </button>
              </div>
            </div>
          </div>

          <div class="px-5 py-6 sm:px-8 sm:py-8">
            <div
              v-if="plansLoading"
              class="flex flex-col items-center justify-center gap-3 py-12"
            >
              <FikrLoader show-label muted />
            </div>

            <!-- Same card layout as landing #pricing -->
            <div
              v-else
              class="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-5 lg:gap-6"
              role="radiogroup"
              :aria-label="$t('subscription.planLabel')"
            >
              <button
                v-for="plan in orderedPlans"
                :key="plan.code"
                type="button"
                role="radio"
                :aria-checked="plan_code === plan.code"
                class="relative flex h-full flex-col overflow-visible rounded-2xl bg-white p-8 text-start shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition"
                :class="
                  plan_code === plan.code
                    ? 'border-2 border-hub-primary md:-translate-y-1 ring-2 ring-hub-primary/15'
                    : 'border border-gray-200 hover:border-hub-primary/30'
                "
                @click="onPlanCardClick(plan)"
              >
                <div
                  v-if="isPopularPlan(plan)"
                  class="mb-4 inline-flex self-start rounded-full bg-hub-primary px-3 py-1 text-xs font-bold text-white"
                >
                  {{ $t('landingPricing.popular') }}
                </div>

                <h3 class="font-hubDisplay text-xl font-bold text-hub-ink">
                  {{ planDisplayName(plan) }}
                </h3>
                <p class="mt-2 min-h-[3rem] text-sm leading-relaxed text-hub-muted">
                  {{ planDisplayDesc(plan) }}
                </p>

                <div class="mt-6">
                  <template v-if="isContactPlan(plan)">
                    <p class="font-hubDisplay text-3xl font-bold text-hub-ink sm:text-4xl">
                      {{ $t('landingPricing.contactPrice') }}
                    </p>
                  </template>
                  <template v-else>
                    <p class="font-hubDisplay text-3xl font-bold tabular-nums text-hub-ink sm:text-4xl">
                      <span dir="ltr" class="inline-flex flex-wrap items-baseline gap-1.5">
                        <span>{{ formatAmount(priceForPlan(plan)) }}</span>
                        <span class="text-lg font-semibold text-hub-muted">{{ $t('landingPricing.currency') }}</span>
                        <span class="text-base font-medium text-hub-muted">/ {{ periodShortLabel }}</span>
                      </span>
                    </p>
                  </template>
                </div>

                <ul class="mt-8 flex-1 space-y-3.5 text-sm text-hub-ink">
                  <li
                    v-for="line in planHighlights(plan)"
                    :key="line"
                    class="flex gap-2.5"
                  >
                    <span
                      class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-hub-primary"
                      aria-hidden="true"
                    >check</span>
                    <span>{{ line }}</span>
                  </li>
                </ul>

                <span
                  class="mt-8 block w-full rounded-lg px-4 py-3.5 text-center text-sm font-bold transition"
                  :class="
                    plan_code === plan.code
                      ? 'bg-hub-primary text-white'
                      : 'border-2 border-hub-primary bg-white text-hub-primary'
                  "
                >
                  {{ planCardCta(plan) }}
                </span>
              </button>
            </div>
          </div>
        </section>

        <!-- School details — one layout for contact, documents, school -->
        <section class="overflow-hidden rounded-3xl border border-hub-outline/50 bg-white/95 shadow-hub-soft backdrop-blur-sm">
          <div class="border-b border-hub-outline/40 px-5 py-5 sm:px-8 sm:py-6">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-hub-primary text-sm font-bold text-white">2</span>
              <div>
                <h2 class="font-hubDisplay text-lg font-bold text-hub-ink sm:text-xl">
                  {{ $t('subscription.sectionDetails') }}
                </h2>
                <p class="mt-0.5 text-sm text-hub-muted">{{ $t('subscription.sectionDetailsHint') }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
            <!-- Contact -->
            <div>
              <h3 class="mb-1 text-sm font-bold text-hub-ink">{{ $t('subscription.sectionContact') }}</h3>
              <p class="mb-4 text-xs text-hub-muted">{{ $t('subscription.sectionContactHint') }}</p>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="field-label">{{ $t('subscription.ownerFirstName') }}</label>
                  <input v-model="owner_first_name" type="text" required maxlength="100" class="input-field">
                </div>
                <div>
                  <label class="field-label">{{ $t('subscription.ownerLastName') }}</label>
                  <input v-model="owner_last_name" type="text" required maxlength="100" class="input-field">
                </div>
                <div class="sm:col-span-2">
                  <label class="field-label">{{ $t('subscription.ownerEmail') }}</label>
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <input
                      v-model="owner_email"
                      type="email"
                      required
                      maxlength="255"
                      class="input-field sm:flex-1"
                      autocomplete="email"
                    >
                    <button
                      v-if="!emailVerified"
                      type="button"
                      class="inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-hub-primary px-4 py-2.5 text-sm font-bold text-hub-primary transition hover:bg-hub-mint/40 disabled:opacity-50"
                      :disabled="!canSendOtp || otpSending"
                      @click="sendOtp"
                    >
                      {{
                        otpSending
                          ? $t('subscription.otpSending')
                          : otpSent
                            ? $t('subscription.otpResend')
                            : $t('subscription.otpSend')
                      }}
                    </button>
                  </div>
                  <p v-if="emailVerified" class="mt-2 flex items-center gap-1.5 text-sm font-semibold text-hub-primary">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">verified</span>
                    {{ $t('subscription.emailVerified') }}
                  </p>
                  <div v-else-if="otpSent" class="mt-3 space-y-2">
                    <label class="field-label">{{ $t('subscription.otpCode') }}</label>
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
                      <input
                        v-model="otpCode"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        maxlength="6"
                        autocomplete="one-time-code"
                        class="input-field tracking-[0.35em] sm:max-w-[12rem]"
                        :placeholder="$t('subscription.otpPlaceholder')"
                      >
                      <button
                        type="button"
                        class="inline-flex shrink-0 items-center justify-center rounded-xl bg-hub-primary px-4 py-2.5 text-sm font-bold text-white shadow-hub-soft hover:bg-hub-primary-container disabled:opacity-50"
                        :disabled="otpCode.trim().length !== 6 || otpVerifying"
                        @click="verifyOtp"
                      >
                        {{ otpVerifying ? $t('subscription.otpVerifying') : $t('subscription.otpVerify') }}
                      </button>
                    </div>
                    <p v-if="devOtpHint" class="text-xs text-hub-muted">{{ $t('subscription.otpDevHint') }}</p>
                  </div>
                  <p v-if="otpError" class="mt-2 text-sm text-amber-800" role="alert">{{ otpError }}</p>
                </div>
                <div>
                  <label class="field-label">{{ $t('subscription.ownerPhone') }}</label>
                  <input
                    v-model="owner_phone"
                    type="tel"
                    required
                    minlength="5"
                    maxlength="20"
                    class="input-field"
                    autocomplete="tel"
                  >
                </div>
                <div class="sm:col-span-2">
                  <label class="field-label">{{ $t('subscription.ownerLegalName') }}</label>
                  <input
                    v-model="owner_legal_name"
                    type="text"
                    maxlength="255"
                    class="input-field"
                    :placeholder="$t('subscription.ownerLegalNameHint')"
                  >
                </div>
              </div>
            </div>

            <div class="h-px w-full bg-hub-outline/40" aria-hidden="true" />

            <!-- Documents -->
            <div>
              <h3 class="mb-1 text-sm font-bold text-hub-ink">{{ $t('subscription.sectionDocuments') }}</h3>
              <p class="mb-4 text-xs text-hub-muted">{{ $t('subscription.fileHint') }}</p>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label class="upload-row">
                  <input
                    ref="crInput"
                    type="file"
                    accept=".pdf,image/*"
                    required
                    class="sr-only"
                    @change="onCrChange"
                  >
                  <span class="material-symbols-outlined text-2xl text-hub-primary" aria-hidden="true">upload_file</span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-semibold text-hub-ink">{{ $t('subscription.crCopy') }}</span>
                    <span class="mt-0.5 block truncate text-xs text-hub-muted">{{ crFileName || $t('subscription.fileChoose') }}</span>
                  </span>
                </label>
                <label class="upload-row">
                  <input
                    ref="idInput"
                    type="file"
                    accept=".pdf,image/*"
                    required
                    class="sr-only"
                    @change="onIdChange"
                  >
                  <span class="material-symbols-outlined text-2xl text-hub-primary" aria-hidden="true">badge</span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-semibold text-hub-ink">{{ $t('subscription.idCopy') }}</span>
                    <span class="mt-0.5 block truncate text-xs text-hub-muted">{{ idFileName || $t('subscription.fileChoose') }}</span>
                  </span>
                </label>
              </div>
            </div>

            <div class="h-px w-full bg-hub-outline/40" aria-hidden="true" />

            <!-- School -->
            <div>
              <h3 class="mb-4 text-sm font-bold text-hub-ink">{{ $t('subscription.sectionSchool') }}</h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="field-label">{{ $t('subscription.schoolNameAr') }}</label>
                  <input v-model="school_name_ar" type="text" required maxlength="200" class="input-field" dir="rtl" lang="ar">
                </div>
                <div>
                  <label class="field-label">{{ $t('subscription.schoolNameEn') }}</label>
                  <input v-model="school_name_en" type="text" required maxlength="200" class="input-field" dir="ltr" lang="en">
                </div>
                <div class="sm:col-span-2">
                  <label class="field-label">{{ $t('subscription.schoolAddress') }}</label>
                  <textarea v-model="school_address" rows="2" maxlength="2000" class="input-field" />
                </div>
                <div>
                  <label class="field-label">{{ $t('subscription.schoolPhone') }}</label>
                  <input
                    v-model="school_phone"
                    type="tel"
                    required
                    minlength="5"
                    maxlength="30"
                    class="input-field"
                    autocomplete="tel"
                  >
                </div>
                <div>
                  <label class="field-label">{{ $t('subscription.schoolEmail') }}</label>
                  <input v-model="school_email" type="email" required maxlength="100" class="input-field">
                </div>
              </div>
            </div>
          </div>

          <!-- Sticky-feeling footer inside same panel -->
          <div class="flex flex-col gap-4 border-t border-hub-outline/40 bg-hub-surface-low/50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
            <div class="text-sm text-hub-muted">
              <p v-if="selectedPlan && isContactPlan(selectedPlan)" class="font-medium text-hub-ink">
                {{ $t('subscription.contactReadySummary', { plan: planDisplayName(selectedPlan) }) }}
              </p>
              <p v-else-if="selectedPlan && selectedPrice != null" class="font-medium text-hub-ink">
                {{ $t('subscription.readySummary', {
                  plan: planDisplayName(selectedPlan),
                  amount: formatAmount(selectedPrice),
                  period: $t(`platformBilling.periods.${billing_period}`),
                }) }}
              </p>
              <p class="mt-1 text-xs">{{ $t('subscription.submitHint') }}</p>
              <router-link
                to="/login"
                class="mt-1 inline-block font-semibold text-hub-primary hover:text-hub-primary-container"
              >
                {{ $t('subscription.alreadyHaveAccount') }}
              </router-link>
            </div>
            <button
              type="submit"
              class="inline-flex items-center justify-center rounded-xl bg-hub-primary px-7 py-3.5 text-sm font-bold text-white shadow-hub-soft transition hover:bg-hub-primary-container disabled:opacity-50"
              :disabled="submitting || (!isContactPlan(plan_code) && !emailVerified)"
            >
              {{
                submitting
                  ? $t('subscription.submitting')
                  : isContactPlan(plan_code)
                    ? $t('forSchools.gallery.chooseModules')
                    : $t('subscription.submit')
              }}
            </button>
          </div>
        </section>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { useFeedback } from '@/composables/useFeedback'
import { schoolSubscriptionService } from '@/services/school-subscription.service'
import {
  platformBillingService,
  type PlatformBillingPeriod,
  type PlatformPlan,
} from '@/services/platform-billing.service'

const route = useRoute()
const router = useRouter()
const { locale, t, te, tm } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const crInput = ref<HTMLInputElement | null>(null)
const idInput = ref<HTMLInputElement | null>(null)
const crFileName = ref('')
const idFileName = ref('')

const CONTACT_PLAN_CODES = new Set(['__contact__'])
const POPULAR_PLAN_CODES = new Set(['standard', 'qa-basic'])
const SYNTHETIC_CONTACT_CODE = '__contact__'

const plans = ref<PlatformPlan[]>([])
const plansLoading = ref(true)
const billingPeriods = ref<PlatformBillingPeriod[]>(['monthly', 'semester', 'yearly', 'summer'])
const plan_code = ref('standard')
const billing_period = ref<PlatformBillingPeriod>('monthly')

const owner_email = ref('')
const owner_first_name = ref('')
const owner_last_name = ref('')
const owner_phone = ref('')
const owner_legal_name = ref('')
const school_name_ar = ref('')
const school_name_en = ref('')
const school_address = ref('')
const school_phone = ref('')
const school_email = ref('')

const submitting = ref(false)
const submitted = ref(false)
const plansLoadFailed = ref(false)

const otpCode = ref('')
const otpSent = ref(false)
const otpSending = ref(false)
const otpVerifying = ref(false)
const otpError = ref('')
const emailVerified = ref(false)
const emailVerificationToken = ref('')
const verifiedEmail = ref('')
const devOtpHint = ref(false)
const otpCooldownUntil = ref(0)

const canSendOtp = computed(() => {
  const email = owner_email.value.trim()
  if (!email || !email.includes('@') || emailVerified.value) return false
  return Date.now() >= otpCooldownUntil.value
})

function resetEmailVerification() {
  otpCode.value = ''
  otpSent.value = false
  otpError.value = ''
  emailVerified.value = false
  emailVerificationToken.value = ''
  verifiedEmail.value = ''
  devOtpHint.value = false
}

watch(owner_email, (next) => {
  if (emailVerified.value && next.trim().toLowerCase() !== verifiedEmail.value) {
    resetEmailVerification()
  }
})

async function sendOtp() {
  otpError.value = ''
  const email = owner_email.value.trim()
  if (!email) {
    otpError.value = t('subscription.otpEmailRequired')
    return
  }
  otpSending.value = true
  try {
    const data = await schoolSubscriptionService.sendEmailOtp(email)
    otpSent.value = true
    otpCode.value = ''
    emailVerified.value = false
    emailVerificationToken.value = ''
    verifiedEmail.value = ''
    const cooldownSec = data.resend_after_seconds || 60
    otpCooldownUntil.value = Date.now() + cooldownSec * 1000
    devOtpHint.value = Boolean(data.development_otp) || import.meta.env.DEV
    if (data.development_otp) {
      otpCode.value = data.development_otp
    }
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    otpError.value =
      normalizeApiMessage(ax.response?.data?.message) || ax.message || t('subscription.otpSendError')
  } finally {
    otpSending.value = false
  }
}

async function verifyOtp() {
  otpError.value = ''
  const email = owner_email.value.trim()
  const code = otpCode.value.trim()
  if (code.length !== 6) {
    otpError.value = t('subscription.otpInvalid')
    return
  }
  otpVerifying.value = true
  try {
    const data = await schoolSubscriptionService.verifyEmailOtp(email, code)
    emailVerificationToken.value = data.email_verification_token
    verifiedEmail.value = email.toLowerCase()
    emailVerified.value = true
    otpError.value = ''
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    emailVerified.value = false
    emailVerificationToken.value = ''
    otpError.value =
      normalizeApiMessage(ax.response?.data?.message) || ax.message || t('subscription.otpInvalid')
  } finally {
    otpVerifying.value = false
  }
}

function isContactPlan(plan: Pick<PlatformPlan, 'code' | 'prices'> | string) {
  if (typeof plan === 'string') {
    return CONTACT_PLAN_CODES.has(String(plan || '').toLowerCase())
  }
  if (CONTACT_PLAN_CODES.has(String(plan.code || '').toLowerCase())) return true
  // Same rule as marketing pricing: no billable price → custom-plan flow.
  return !(plan.prices || []).some((p) => p.amount_omr != null && String(p.amount_omr).trim() !== '')
}

function isPopularPlan(plan: Pick<PlatformPlan, 'code'>) {
  return POPULAR_PLAN_CODES.has(String(plan.code || '').toLowerCase())
}

function goToCustomPlan() {
  void router.push('/custom-plan')
}

function focusPlanSection() {
  const section = document.getElementById('subscribe-plan')
  if (section) {
    section.scrollIntoView({ behavior: 'auto', block: 'start' })
  } else {
    window.scrollTo({ top: 0, left: 0 })
  }
  const selected = section?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')
  selected?.focus({ preventScroll: true })
}

function onPlanCardClick(plan: PlatformPlan) {
  if (isContactPlan(plan)) {
    goToCustomPlan()
    return
  }
  plan_code.value = plan.code
}

function syntheticContactPlan(): PlatformPlan {
  return {
    id: -1,
    code: SYNTHETIC_CONTACT_CODE,
    name_en: t('landingPricing.planNames.complete'),
    name_ar: t('landingPricing.planNames.complete'),
    description_en: t('landingPricing.planDescs.complete'),
    description_ar: t('landingPricing.planDescs.complete'),
    included_student_seats: 0,
    overage_per_student_omr: 0,
    sort_order: 999,
    is_active: true,
    prices: [],
    features: [],
  }
}

/**
 * Catalog packages as priced cards, plus a dedicated custom-plan card when the
 * catalog has no contact-only (unpriced) plan — same idea as the marketing hub.
 */
const orderedPlans = computed(() => {
  const order = ['essential', 'qa-basic', 'standard', 'complete', 'qa-premium']
  const sorted = [...plans.value].sort((a, b) => {
    const ai = order.indexOf(a.code)
    const bi = order.indexOf(b.code)
    const aRank = ai === -1 ? 900 + a.sort_order : ai
    const bRank = bi === -1 ? 900 + b.sort_order : bi
    return aRank - bRank
  })
  if (sorted.some((p) => isContactPlan(p))) return sorted
  return [...sorted, syntheticContactPlan()]
})

function planCardCta(plan: PlatformPlan) {
  if (isContactPlan(plan)) return t('forSchools.gallery.chooseModules')
  if (plan_code.value === plan.code) return t('subscription.planSelected')
  if (isPopularPlan(plan)) return t('landingPricing.subscribeCta')
  return t('landingPricing.startCta')
}

const selectedPlan = computed(() => orderedPlans.value.find((p) => p.code === plan_code.value) || null)
const selectedPrice = computed(() => {
  const p = selectedPlan.value
  if (!p) return null
  return priceForPlan(p)
})
const periodShortLabel = computed(() => t(`platformBilling.periods.${billing_period.value}`))

function priceForPlan(plan: PlatformPlan) {
  const row = plan.prices.find((x) => x.billing_period === billing_period.value)
  return row ? row.amount_omr : null
}

function formatAmount(amount: string | number | null) {
  if (amount == null) return '—'
  const n = Number(amount)
  return Number.isFinite(n) ? String(Math.round(n)) : String(amount)
}

function planDisplayName(plan: PlatformPlan) {
  const key = `landingPricing.planNames.${plan.code}`
  return te(key) ? t(key) : locale.value === 'ar' ? plan.name_ar : plan.name_en
}

function planDisplayDesc(plan: PlatformPlan) {
  const key = `landingPricing.planDescs.${plan.code}`
  return te(key)
    ? t(key)
    : locale.value === 'ar'
      ? plan.description_ar || ''
      : plan.description_en || ''
}

function planHighlights(plan: PlatformPlan): string[] {
  const ar = locale.value === 'ar'
  const fromFeatures = (plan.features || [])
    .map((f) => (ar ? f.label_ar : f.label_en) || f.label_en || f.label_ar)
    .map((s) => (s || '').trim())
    .filter(Boolean)
  const highlightCode =
    plan.code === SYNTHETIC_CONTACT_CODE || plan.code === 'qa-premium' ? 'complete' : plan.code
  const lines = fromFeatures.length
    ? fromFeatures
    : (() => {
        const key = `forSchools.planHighlights.${highlightCode}`
        const messages = tm(key)
        return Array.isArray(messages) && messages.length ? messages.map(String) : []
      })()
  const seats = Number(plan.included_student_seats)
  if (Number.isFinite(seats) && seats > 0) {
    lines.push(t('forSchools.planSeatsLine', { count: seats }))
  }
  return lines
}

function onCrChange() {
  crFileName.value = crInput.value?.files?.[0]?.name || ''
}

function onIdChange() {
  idFileName.value = idInput.value?.files?.[0]?.name || ''
}

function buildFormData(): FormData {
  const fd = new FormData()
  fd.append('plan_code', plan_code.value)
  fd.append('billing_period', billing_period.value)
  fd.append('owner_email', owner_email.value.trim())
  fd.append('email_verification_token', emailVerificationToken.value)
  fd.append('owner_first_name', owner_first_name.value.trim())
  fd.append('owner_last_name', owner_last_name.value.trim())
  fd.append('owner_phone', owner_phone.value.trim())
  if (owner_legal_name.value.trim()) fd.append('owner_legal_name', owner_legal_name.value.trim())
  fd.append('school_name_ar', school_name_ar.value.trim())
  fd.append('school_name_en', school_name_en.value.trim())
  fd.append('school_name', school_name_ar.value.trim() || school_name_en.value.trim())
  if (school_address.value.trim()) fd.append('school_address', school_address.value.trim())
  fd.append('school_phone', school_phone.value.trim())
  fd.append('school_email', school_email.value.trim())
  const cr = crInput.value?.files?.[0]
  const idf = idInput.value?.files?.[0]
  if (cr) fd.append('cr_copy', cr)
  if (idf) fd.append('id_copy', idf)
  return fd
}

function normalizeApiMessage(raw: unknown): string {
  if (Array.isArray(raw)) return raw.map(String).join(' ')
  if (typeof raw === 'string') return raw
  return ''
}

function friendlyRegisterError(rawMessage: string): string {
  const msg = rawMessage.trim()
  const lower = msg.toLowerCase()
  if (
    lower.includes('already exists') ||
    lower.includes('sign in instead') ||
    lower.includes('email already')
  ) {
    return t('subscription.emailExists')
  }
  if (
    lower.includes('unknown or inactive plan') ||
    lower.includes('unknown plan') ||
    /inactive plan/i.test(msg)
  ) {
    return t('subscription.planUnavailable')
  }
  if (msg) return msg
  return t('subscription.submitError')
}

function showFormError(message: string) {
  feedback.error(message, t('common.error'))
}

async function onSubmit() {
  if (!plan_code.value || !billing_period.value) {
    showFormError(t('subscription.planRequired'))
    return
  }
  if (plansLoadFailed.value || !orderedPlans.value.length) {
    showFormError(t('subscription.plansLoadError'))
    return
  }
  // Custom / contact plan — same module-picker flow as marketing pricing.
  if (isContactPlan(plan_code.value)) {
    goToCustomPlan()
    return
  }
  if (!plans.value.some((p) => p.code === plan_code.value)) {
    showFormError(t('subscription.planUnavailable'))
    return
  }
  if (!emailVerified.value || !emailVerificationToken.value) {
    showFormError(t('subscription.otpRequired'))
    return
  }
  if (owner_email.value.trim().toLowerCase() !== verifiedEmail.value) {
    showFormError(t('subscription.otpRequired'))
    resetEmailVerification()
    return
  }
  submitting.value = true
  try {
    await schoolSubscriptionService.register(buildFormData())
    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    showFormError(
      friendlyRegisterError(
        normalizeApiMessage(ax.response?.data?.message) || ax.message || '',
      ),
    )
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const qPlan = String(route.query.plan || '').toLowerCase()
  const qPeriod = String(route.query.period || '').toLowerCase()
  plansLoading.value = true
  try {
    const catalog = await platformBillingService.listPublicPlans()
    plans.value = (catalog.plans || []).filter((p) => p.is_active !== false)
    plansLoadFailed.value = false
    if (catalog.billing_periods?.length) {
      billingPeriods.value = catalog.billing_periods
    }
    const selectable = orderedPlans.value
    if (qPlan && selectable.some((p) => p.code === qPlan && isContactPlan(p))) {
      goToCustomPlan()
      return
    }
    if (qPlan && selectable.some((p) => p.code === qPlan && !isContactPlan(p))) {
      plan_code.value = qPlan
    } else if (selectable.some((p) => p.code === 'standard')) {
      plan_code.value = 'standard'
    } else if (selectable.some((p) => !isContactPlan(p))) {
      plan_code.value = selectable.find((p) => !isContactPlan(p))!.code
    } else if (selectable[0]) {
      plan_code.value = selectable[0].code
    } else {
      plan_code.value = ''
    }
    if (
      qPeriod &&
      (['monthly', 'semester', 'yearly', 'summer'] as string[]).includes(qPeriod)
    ) {
      billing_period.value = qPeriod as PlatformBillingPeriod
    }
  } catch {
    plans.value = []
    plan_code.value = SYNTHETIC_CONTACT_CODE
    plansLoadFailed.value = true
    showFormError(t('subscription.plansLoadError'))
  } finally {
    plansLoading.value = false
    if (route.path !== '/subscribe') return
    await nextTick()
    requestAnimationFrame(() => {
      if (route.path === '/subscribe') focusPlanSection()
    })
  }
})
</script>

<style scoped>
.field-label {
  @apply mb-1.5 block text-sm font-medium text-hub-ink;
}

.input-field {
  @apply w-full rounded-xl border border-hub-outline/70 bg-white px-3.5 py-2.5 text-sm text-hub-ink shadow-sm transition placeholder:text-hub-muted/60 focus:border-hub-primary focus:outline-none focus:ring-2 focus:ring-hub-primary/25;
}

.upload-row {
  @apply flex cursor-pointer items-center gap-3 rounded-xl border border-hub-outline/70 bg-hub-surface-low/40 px-4 py-3.5 transition hover:border-hub-primary/50 hover:bg-hub-mint/20;
}

.upload-row:has(input:focus-visible) {
  @apply border-hub-primary ring-2 ring-hub-primary/25;
}
</style>
