<template>
  <div class="flex min-h-screen bg-white font-sans" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- ───────── Brand tile (navy) — inline-start side, as in the FIKR mock ───────── -->
    <aside class="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-navy-800 px-10 py-9 text-white lg:flex xl:px-16">
      <!-- wordmark + pixel motif -->
      <div class="flex items-center justify-end gap-3">
        <span class="text-xl font-bold tracking-[0.04em] text-white" dir="ltr">FIKR</span>
        <span class="grid grid-cols-3 gap-1" aria-hidden="true">
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400/50" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400/70" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
        </span>
      </div>

      <!-- headline -->
      <div class="relative max-w-md">
        <h2 class="text-[44px] font-bold leading-[1.15] tracking-[-0.01em] text-white xl:text-[56px] xl:leading-[1.1]">
          {{ $t('login.heroTitle') }}
        </h2>
        <p class="mt-5 text-lg leading-relaxed text-white/80 xl:text-xl">
          {{ heroSubtitle }}
        </p>
      </div>

      <!-- footer line -->
      <p class="text-xs text-white/60">{{ $t('login.footerBrand') }}</p>

      <!-- soft teal glow (flat design — no shadows, just a tonal wash) -->
      <div
        class="pointer-events-none absolute -bottom-32 -start-32 h-96 w-96 rounded-full bg-primary-500/10"
        aria-hidden="true"
      />
    </aside>

    <!-- ───────── Form panel ───────── -->
    <main class="flex flex-1 flex-col px-5 py-6 sm:px-10">
      <div class="flex items-center justify-between">
        <router-link
          :to="backLink"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center text-primary-700 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 rounded-md"
          :aria-label="$t('login.home')"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </router-link>
        <LanguageSwitcher />
      </div>

      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-[400px]">
          <router-link
            v-if="isSchoolLogin"
            :to="backLink"
            class="mx-auto mb-2 flex max-w-[18rem] justify-center sm:max-w-[20rem]"
          >
            <img
              :src="schoolLogo"
              :alt="displayTitle"
              class="h-20 w-auto bg-transparent object-contain sm:h-24"
            />
          </router-link>
          <router-link
            v-else
            to="/"
            class="mx-auto mb-2 flex max-w-[18rem] justify-center sm:max-w-[20rem]"
          >
            <img
              src="/fikr-logo.png?v=5"
              :alt="$t('forSchools.logoAlt')"
              class="h-16 w-full bg-transparent object-contain sm:h-20"
            />
          </router-link>

          <div class="mt-6 text-center">
            <h1 class="text-[30px] font-bold tracking-[-0.01em] text-fikr-ink sm:text-[34px]">
              {{ $t('login.title') }}
            </h1>
            <p v-if="isSchoolLogin" class="mt-1 text-base text-fikr-ink-soft">{{ formSubtitle }}</p>
          </div>

          <form class="mt-7 space-y-3" novalidate @submit.prevent="handleLogin">
            <div>
              <label for="email" class="sr-only">{{ $t('login.email') }}</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                class="fk-input rounded-xl px-4 py-3.5 text-base"
                :placeholder="$t('login.emailPlaceholder')"
              />
            </div>

            <div class="relative">
              <label for="password" class="sr-only">{{ $t('login.password') }}</label>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="fk-input rounded-xl px-4 py-3.5 pe-12 text-base tracking-[0.15em]"
                :placeholder="$t('login.passwordPlaceholder')"
              />
              <button
                type="button"
                class="absolute inset-y-0 end-0 flex items-center pe-4 text-fikr-ink-soft hover:text-fikr-ink"
                :aria-label="$t('login.password')"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="fk-btn fk-btn--primary mt-3 w-full rounded-xl py-3.5 text-base"
            >
              <template v-if="loading">
                <FikrLoader v-if="!isSchoolLogin" size="xs" />
                <svg v-else class="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ $t('login.signingIn') }}
              </template>
              <template v-else>{{ $t('login.continue') }}</template>
            </button>

            <div
              class="flex items-center pt-1"
              :class="isSchoolLogin ? 'justify-end' : 'justify-between'"
            >
              <router-link
                v-if="!isSchoolLogin"
                to="/subscribe"
                class="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                {{ $t('login.subscribeSchool') }}
              </router-link>
              <button
                type="button"
                class="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                @click="openForgotPassword"
              >
                {{ $t('login.forgotPassword') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <FikrDialog
      :show="forgotOpen"
      :title="$t('login.forgotPasswordTitle')"
      plain-footer
      @close="closeForgotPassword"
    >
      <form class="space-y-3" novalidate @submit.prevent="handleForgotPassword">
        <div>
          <label for="forgot-email" class="fk-flabel">{{ $t('login.email') }}</label>
          <input
            id="forgot-email"
            v-model="forgotEmail"
            type="email"
            required
            autocomplete="email"
            class="fk-input mt-1.5 w-full rounded-xl px-4 py-3 text-base"
            :placeholder="$t('login.emailPlaceholder')"
          />
        </div>
      </form>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" :disabled="forgotLoading" @click="closeForgotPassword">
          {{ $t('common.cancel') }}
        </button>
        <button type="button" class="fk-btn fk-btn--primary" :disabled="forgotLoading" @click="handleForgotPassword">
          <template v-if="forgotLoading">{{ $t('login.sendingReset') }}</template>
          <template v-else>{{ $t('login.sendReset') }}</template>
        </button>
      </template>
    </FikrDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useFeedback } from '@/composables/useFeedback'
import { authService, type AuthError } from '@/services'
import { schoolLandingService } from '@/services/school-landing.service'

const { locale, t } = useI18n()
const router = useRouter()
const route = useRoute()
const feedback = useFeedback()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const schoolBrand = ref('')
const schoolLogo = ref('/zlogo.jpeg')
const forgotOpen = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)

const isRTL = computed(() => locale.value === 'ar')

const schoolSlug = computed(() => {
  const slug = route.params.slug
  return typeof slug === 'string' && slug.trim() ? slug.trim() : ''
})

const isSchoolLogin = computed(() => route.name === 'school-login' && !!schoolSlug.value)

const backLink = computed(() => (isSchoolLogin.value ? `/s/${schoolSlug.value}` : '/'))

const displayTitle = computed(() => {
  if (isSchoolLogin.value) return schoolBrand.value || t('hero.brandName')
  return t('forSchools.brand')
})

const formSubtitle = computed(() =>
  isSchoolLogin.value ? displayTitle.value : t('login.platformSubtitle'),
)

const heroSubtitle = computed(() =>
  isSchoolLogin.value
    ? t('login.heroSubtitleSchool', { school: displayTitle.value })
    : t('login.heroSubtitlePlatform'),
)

onMounted(async () => {
  document.documentElement.dir = isRTL.value ? 'rtl' : 'ltr'
  document.documentElement.lang = locale.value === 'ar' ? 'ar-OM' : locale.value
  if (!isSchoolLogin.value) return
  try {
    const cms = await schoolLandingService.getPublicBySlug(schoolSlug.value)
    schoolBrand.value =
      locale.value === 'ar'
        ? cms.brand_name_ar || cms.brand_name_en || ''
        : cms.brand_name_en || cms.brand_name_ar || ''
    if (cms.logo_url) schoolLogo.value = cms.logo_url
  } catch {
    schoolBrand.value = t('hero.brandName')
    schoolLogo.value = '/zlogo.jpeg'
  }
})

function loginErrorMessage(err: unknown): string {
  const code = (err as AuthError)?.code
  switch (code) {
    case 'NETWORK_ERROR':
      return t('login.networkError')
    case 'INVALID_CREDENTIALS':
      return t('login.invalidCredentials')
    case 'SCHOOL_PENDING':
      return t('login.schoolPending')
    case 'SCHOOL_SUSPENDED':
      return t('login.schoolSuspended')
    case 'SCHOOL_REJECTED':
      return t('login.schoolRejected')
    case 'ACCOUNT_INACTIVE':
      return t('login.accountInactive')
    case 'ACCESS_DENIED':
      return t('login.accessDenied')
    case 'VALIDATION_ERROR':
    case 'UNPROCESSABLE_ENTITY':
      return t('login.validationError')
    case 'RATE_LIMITED':
      return t('login.rateLimited')
    case 'SERVER_ERROR':
      return t('login.serverError')
    default:
      return t('login.failed')
  }
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    feedback.error(t('login.fillRequired'), t('common.error'))
    return
  }

  try {
    loading.value = true
    const response = await authService.login({
      email: email.value,
      password: password.value,
    })

    const user = response.user as {
      role?: string
      user_type?: string
      isSuperAdmin?: boolean
      isSystemUser?: boolean
    }
    if (user?.role === 'parent' || user?.user_type === 'parent') {
      router.push('/parent/dashboard')
    } else if (
      user?.isSuperAdmin ||
      user?.user_type === 'platform' ||
      (user?.isSystemUser && user?.role !== 'parent')
    ) {
      router.push('/platform/schools')
    } else {
      router.push('/dashboard')
    }
  } catch (e: unknown) {
    feedback.error(loginErrorMessage(e), t('common.error'))
  } finally {
    loading.value = false
  }
}

function openForgotPassword() {
  forgotEmail.value = email.value.trim()
  forgotOpen.value = true
}

function closeForgotPassword() {
  if (forgotLoading.value) return
  forgotOpen.value = false
}

async function handleForgotPassword() {
  const value = forgotEmail.value.trim()
  if (!value) {
    feedback.error(t('login.emailRequired'), t('common.error'))
    return
  }
  try {
    forgotLoading.value = true
    await authService.resetPassword(value)
    feedback.success(t('login.resetSent'), t('common.success'))
    forgotOpen.value = false
    email.value = value
  } catch (e: unknown) {
    const code = (e as AuthError)?.code
    if (code === 'RATE_LIMITED') {
      feedback.error(t('login.rateLimited'), t('common.error'))
    } else if (code === 'NETWORK_ERROR') {
      feedback.error(t('login.networkError'), t('common.error'))
    } else {
      feedback.error(t('login.resetFailed'), t('common.error'))
    }
  } finally {
    forgotLoading.value = false
  }
}
</script>
