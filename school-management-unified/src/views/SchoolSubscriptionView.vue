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

    <main
      class="relative"
      :class="
        submitted
          ? 'flex min-h-[calc(100dvh-4.25rem)] flex-col'
          : 'mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 pb-20'
      "
    >
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

      <div
        v-if="submitted"
        class="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6"
        role="status"
      >
        <div
          class="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-hub-mint text-hub-primary"
          aria-hidden="true"
        >
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-hub-primary/80">
          {{ $t('subscription.eyebrow') }}
        </p>
        <h1 class="font-hubDisplay text-xl font-bold tracking-tight text-hub-ink sm:text-2xl">
          {{ $t('subscription.pendingTitle') }}
        </h1>
        <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-hub-muted">
          {{ $t('subscription.pendingBody') }}
        </p>
        <div class="mt-8 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row sm:justify-center">
          <router-link
            to="/"
            class="inline-flex flex-1 items-center justify-center rounded-xl bg-hub-primary px-5 py-2.5 text-sm font-bold text-white shadow-hub-soft hover:bg-hub-primary-container"
          >
            {{ $t('subscription.backHome') }}
          </router-link>
          <router-link
            to="/#gallery-pricing"
            class="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-hub-primary px-5 py-2.5 text-sm font-bold text-hub-primary hover:bg-hub-mint/40"
          >
            {{ $t('forSchools.customPlan.backPricing') }}
          </router-link>
        </div>
      </div>

      <form v-else class="space-y-6" @submit.prevent="onSubmit">
        <!-- Plan picker — single layout -->
        <section
          id="subscribe-plan"
          class="scroll-mt-20 overflow-hidden rounded-3xl border border-hub-outline/50 bg-[#f4f7f9] shadow-hub-soft"
        >
          <div class="border-b border-hub-outline/40 bg-white/80 px-5 py-5 sm:px-8 sm:py-6">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-hub-primary text-sm font-bold text-white">1</span>
              <h2 class="font-hubDisplay text-lg font-bold text-hub-ink sm:text-xl">
                {{ $t('subscription.sectionPlan') }}
              </h2>
            </div>
          </div>

          <div class="px-5 py-6 sm:px-8 sm:py-8" role="radiogroup" :aria-label="$t('subscription.planLabel')">
            <PlatformPricingCards
              :cards="pricingPlans"
              :loading="plansLoading"
              selectable
              :selected-code="plan_code"
              @select="onPricingCardSelect"
            />
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
                  </div>
                  <p v-if="otpErrorKey" class="mt-2 text-sm text-amber-800" role="alert">{{ $t(otpErrorKey, otpErrorParams) }}</p>
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
              <p v-if="selectedPlan && selectedPlan.contactOnly" class="font-medium text-hub-ink">
                {{ $t('subscription.contactReadySummary', { plan: selectedPlan.name }) }}
              </p>
              <p v-else-if="selectedPlan && selectedPlan.yearly != null" class="font-medium text-hub-ink">
                {{ $t('subscription.readySummary', {
                  plan: selectedPlan.name,
                  amount: formatAmount(selectedPlan.yearly),
                  period: $t('platformBilling.periods.yearly'),
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
import PlatformPricingCards from '@/components/PlatformPricingCards.vue'
import { useFeedback } from '@/composables/useFeedback'
import { schoolSubscriptionService } from '@/services/school-subscription.service'
import {
  platformBillingService,
  type PlatformBillingPeriod,
  type PlatformModule,
  type PlatformPlan,
} from '@/services/platform-billing.service'
import { buildPublicPricingCards, type PublicPricingCard } from '@/utils/public-pricing-cards'

const route = useRoute()
const router = useRouter()
const { locale, t, messages } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const crInput = ref<HTMLInputElement | null>(null)
const idInput = ref<HTMLInputElement | null>(null)
const crFileName = ref('')
const idFileName = ref('')

const CONTACT_PLAN_CODES = new Set(['__contact__', 'contact'])

const plans = ref<PlatformPlan[]>([])
const moduleCatalog = ref<PlatformModule[]>([])
const plansLoading = ref(true)
const plan_code = ref('standard')
const billing_period = ref<PlatformBillingPeriod>('yearly')

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
const submitted = ref(String(route.query.status || '') === 'pending')
const plansLoadFailed = ref(false)

const otpCode = ref('')
const otpSent = ref(false)
const otpSending = ref(false)
const otpVerifying = ref(false)
const otpErrorKey = ref('')
const otpErrorParams = ref<Record<string, string>>({})
const emailVerified = ref(false)
const emailVerificationToken = ref('')
const verifiedEmail = ref('')
const otpCooldownUntil = ref(0)

function clearOtpError() {
  otpErrorKey.value = ''
  otpErrorParams.value = {}
}

function setOtpError(key: string, params: Record<string, string> = {}) {
  otpErrorKey.value = key
  otpErrorParams.value = params
}

const canSendOtp = computed(() => {
  const email = owner_email.value.trim()
  if (!email || !email.includes('@') || emailVerified.value) return false
  return Date.now() >= otpCooldownUntil.value
})

function resetEmailVerification() {
  otpCode.value = ''
  otpSent.value = false
  clearOtpError()
  emailVerified.value = false
  emailVerificationToken.value = ''
  verifiedEmail.value = ''
}

watch(owner_email, (next) => {
  if (emailVerified.value && next.trim().toLowerCase() !== verifiedEmail.value) {
    resetEmailVerification()
  }
})

async function sendOtp() {
  clearOtpError()
  const email = owner_email.value.trim()
  if (!email) {
    setOtpError('subscription.otpEmailRequired')
    return
  }
  otpSending.value = true
  try {
    const data = await schoolSubscriptionService.sendEmailOtp(email, locale.value)
    otpSent.value = true
    otpCode.value = '000000'
    emailVerified.value = false
    emailVerificationToken.value = ''
    verifiedEmail.value = ''
    const cooldownSec = data.resend_after_seconds || 60
    otpCooldownUntil.value = Date.now() + cooldownSec * 1000
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    const mapped = friendlyOtpError(
      normalizeApiMessage(ax.response?.data?.message) || ax.message || '',
      'otpSendError',
    )
    setOtpError(mapped.key, mapped.params)
  } finally {
    otpSending.value = false
  }
}

async function verifyOtp() {
  clearOtpError()
  const email = owner_email.value.trim()
  const code = otpCode.value.trim()
  if (code.length !== 6) {
    setOtpError('subscription.otpInvalid')
    return
  }
  otpVerifying.value = true
  try {
    const data = await schoolSubscriptionService.verifyEmailOtp(email, code)
    emailVerificationToken.value = data.email_verification_token
    verifiedEmail.value = email.toLowerCase()
    emailVerified.value = true
    clearOtpError()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    emailVerified.value = false
    emailVerificationToken.value = ''
    const mapped = friendlyOtpError(
      normalizeApiMessage(ax.response?.data?.message) || ax.message || '',
      'otpInvalid',
    )
    setOtpError(mapped.key, mapped.params)
  } finally {
    otpVerifying.value = false
  }
}

function isContactPlan(plan: string | { code?: string; contactOnly?: boolean; prices?: PlatformPlan['prices'] }) {
  if (typeof plan === 'string') return CONTACT_PLAN_CODES.has(String(plan || '').toLowerCase())
  if (plan.contactOnly) return true
  if (CONTACT_PLAN_CODES.has(String(plan.code || '').toLowerCase())) return true
  return !(plan.prices || []).some((p) => p.amount_omr != null && String(p.amount_omr).trim() !== '')
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
  const selected = section?.querySelector<HTMLElement>('[aria-pressed="true"]')
  selected?.focus({ preventScroll: true })
}

function planHighlightLines(code: 'essential' | 'standard' | 'complete'): string[] {
  const bag = messages.value[locale.value] as { forSchools?: { planHighlights?: Record<string, unknown> } }
  const raw = bag?.forSchools?.planHighlights?.[code]
  if (!Array.isArray(raw)) return []
  return raw.map((line) => String(line).trim()).filter((line) => line && !line.startsWith('forSchools.'))
}

const pricingPlans = computed(() =>
  buildPublicPricingCards({
    plans: plans.value,
    modules: moduleCatalog.value,
    locale: locale.value,
    t: (key, params) => t(key, params as never),
    highlightLines: planHighlightLines,
  }),
)

function onPricingCardSelect(plan: PublicPricingCard) {
  if (plan.contactOnly) {
    goToCustomPlan()
    return
  }
  plan_code.value = plan.code
}

const selectedPlan = computed(() => pricingPlans.value.find((p) => p.code === plan_code.value) || null)

function formatAmount(amount: string | number | null) {
  if (amount == null) return '—'
  const n = Number(amount)
  return Number.isFinite(n) ? String(Math.round(n)) : String(amount)
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

function friendlyOtpError(
  rawMessage: string,
  fallback: 'otpInvalid' | 'otpSendError',
): { key: string; params?: Record<string, string> } {
  const msg = rawMessage.trim()
  const lower = msg.toLowerCase()
  const wait = msg.match(/wait\s+(\d+)\s+seconds/i)
  if (wait) return { key: 'subscription.otpWait', params: { seconds: wait[1] } }
  if (lower.includes('too many')) return { key: 'subscription.otpTooMany' }
  if (lower.includes('invalid') || lower.includes('expired') || lower.includes('6-digit')) {
    return { key: 'subscription.otpInvalid' }
  }
  if (lower.includes('email is required') || lower.includes('enter your email')) {
    return { key: 'subscription.otpEmailRequired' }
  }
  return { key: `subscription.${fallback}` }
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
  if (lower.includes('email verification') || lower.includes('verify your email')) {
    return t('subscription.otpRequired')
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
  if (plansLoadFailed.value || !pricingPlans.value.length) {
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
    await router.replace({ query: { status: 'pending' } })
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
  if (submitted.value) {
    plansLoading.value = false
    return
  }
  const qPlan = String(route.query.plan || '').toLowerCase()
  plansLoading.value = true
  try {
    const catalog = await platformBillingService.listPublicPlans()
    plans.value = (catalog.plans || []).filter((p) => p.is_active !== false)
    moduleCatalog.value = catalog.modules || []
    plansLoadFailed.value = false
    billing_period.value = 'yearly'
    const selectable = pricingPlans.value
    if (qPlan && selectable.some((p) => p.code === qPlan && p.contactOnly)) {
      goToCustomPlan()
      return
    }
    if (qPlan && selectable.some((p) => p.code === qPlan && !p.contactOnly)) {
      plan_code.value = qPlan
    } else if (selectable.some((p) => p.code === 'standard')) {
      plan_code.value = 'standard'
    } else if (selectable.some((p) => !p.contactOnly)) {
      plan_code.value = selectable.find((p) => !p.contactOnly)!.code
    } else if (selectable[0]) {
      plan_code.value = selectable[0].code
    } else {
      plan_code.value = ''
    }
  } catch {
    plans.value = []
    moduleCatalog.value = []
    plan_code.value = 'contact'
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
