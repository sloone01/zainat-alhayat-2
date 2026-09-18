<template>
  <AuthSplitLayout :hero-subtitle="heroSubtitle" :back-link="backLink">
    <component
      :is="nativeApp ? 'div' : 'router-link'"
      v-if="isSchoolLogin"
      :to="nativeApp ? undefined : backLink"
      class="mx-auto mb-2 flex max-w-[18rem] justify-center sm:max-w-[20rem]"
    >
      <img
        :src="schoolLogo"
        :alt="displayTitle"
        class="h-20 w-auto bg-transparent object-contain sm:h-24"
      />
    </component>
    <component
      :is="nativeApp ? 'div' : 'router-link'"
      v-else
      :to="nativeApp ? undefined : '/'"
      class="mx-auto mb-2 flex max-w-[18rem] justify-center sm:max-w-[20rem]"
    >
      <img
        src="/fikr-logo.webp?v=6"
        :alt="$t('forSchools.logoAlt')"
        class="h-16 w-full bg-transparent object-contain sm:h-20"
      />
    </component>

    <div class="login-deck mt-6 overflow-hidden">
      <div
        class="login-deck__pane"
        :class="forgotOpen ? 'login-deck__pane--out' : 'login-deck__pane--in'"
        :inert="forgotOpen"
        :aria-hidden="forgotOpen"
      >
        <div class="text-center">
          <h1 class="text-[30px] font-bold tracking-[-0.01em] text-fikr-ink sm:text-[34px]">
            {{ $t('login.title') }}
          </h1>
          <p v-if="isSchoolLogin" class="mt-1 text-base text-fikr-ink-soft">{{ formSubtitle }}</p>
        </div>

        <form class="mt-7 space-y-3" novalidate @submit.prevent="handleLogin">
          <div>
            <label for="login" class="sr-only">{{ $t('login.identifier') }}</label>
            <input
              id="login"
              v-model="identifier"
              type="text"
              required
              autocomplete="username"
              data-demo="email"
              class="fk-input rounded-xl px-4 py-3.5 text-base"
              :placeholder="$t('login.identifierPlaceholder')"
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
              data-demo="password"
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
            data-demo="submit"
            :disabled="loading"
            class="fk-btn fk-btn--primary mt-3 w-full rounded-xl py-3.5 text-base"
          >
            <template v-if="loading">
              <FikrLoader size="xs" />
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

      <div
        class="login-deck__pane"
        :class="forgotOpen ? 'login-deck__pane--in' : 'login-deck__pane--enter'"
        :inert="!forgotOpen"
        :aria-hidden="!forgotOpen"
      >
        <div class="text-center">
          <h1 class="text-[30px] font-bold tracking-[-0.01em] text-fikr-ink sm:text-[34px]">
            {{ $t('login.forgotPasswordTitle') }}
          </h1>
        </div>

        <form class="mt-7 space-y-3" novalidate @submit.prevent="handleForgotPassword">
          <div>
            <label for="forgot-login" class="sr-only">{{ $t('login.identifier') }}</label>
            <input
              id="forgot-login"
              v-model="forgotIdentifier"
              type="text"
              required
              autocomplete="username"
              class="fk-input rounded-xl px-4 py-3.5 text-base"
              :placeholder="$t('login.identifierPlaceholder')"
            />
          </div>

          <button
            type="submit"
            :disabled="forgotLoading"
            class="fk-btn fk-btn--primary mt-3 w-full rounded-xl py-3.5 text-base"
          >
            <template v-if="forgotLoading">
              <FikrLoader size="xs" />
              {{ $t('login.sendingReset') }}
            </template>
            <template v-else>{{ $t('login.sendReset') }}</template>
          </button>

          <div class="flex items-center justify-end pt-1">
            <button
              type="button"
              class="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              :disabled="forgotLoading"
              @click="closeForgotPassword"
            >
              {{ $t('login.back') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AuthSplitLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AuthSplitLayout from '@/components/AuthSplitLayout.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { useFeedback } from '@/composables/useFeedback'
import { authService, type AuthError } from '@/services'
import { schoolLandingService } from '@/services/school-landing.service'
import { isNativeApp } from '@/utils/native-app'
import { startPushNotifications } from '@/utils/push-notifications'
import { sessionHomePath } from '@/utils/auth-token'

const { locale, t } = useI18n()
const router = useRouter()
const route = useRoute()
const feedback = useFeedback()

const identifier = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const schoolBrand = ref('')
const schoolLogo = ref('/zlogo.jpeg')
const forgotOpen = ref(false)
const forgotIdentifier = ref('')
const forgotLoading = ref(false)

const isDemoPlay = computed(() => String(route.query.demo || '') === 'play')

const nativeApp = computed(() => isNativeApp())

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
  if (isDemoPlay.value) window.addEventListener('message', onDemoMessage)
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

onUnmounted(() => {
  window.removeEventListener('message', onDemoMessage)
})

function onDemoMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  if (event.data?.type !== 'fikr-demo') return
  if (event.data.field === 'email') identifier.value = String(event.data.value || '')
  if (event.data.field === 'password') password.value = String(event.data.value || '')
}

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

function afterLoginPath(user: {
  must_change_password?: boolean
  school_status?: string | null
}): string {
  if (user?.must_change_password) return '/change-password'
  if (user?.school_status === 'pending_payment') return '/billing'
  return sessionHomePath()
}

const handleLogin = async () => {
  if (isDemoPlay.value) {
    const audience = String(route.query.persona || '') === 'parents' ? 'parents' : 'staff'
    try {
      loading.value = true
      await authService.startDemoSession(audience)
      void startPushNotifications(router)
      router.push({
        path: audience === 'parents' ? '/parent/dashboard' : '/dashboard',
        query: { demo: 'play', persona: audience },
      })
    } catch {
      loading.value = false
    }
    return
  }
  if (!identifier.value || !password.value) {
    feedback.error(t('login.fillRequired'), t('common.error'))
    return
  }

  try {
    loading.value = true
    const response = await authService.login({
      login: identifier.value.trim(),
      password: password.value,
    })
    void startPushNotifications(router)
    router.push(afterLoginPath(response.user))
  } catch (e: unknown) {
    feedback.error(loginErrorMessage(e), t('common.error'))
  } finally {
    loading.value = false
  }
}

function openForgotPassword() {
  forgotIdentifier.value = identifier.value.trim()
  forgotOpen.value = true
}

function closeForgotPassword() {
  if (forgotLoading.value) return
  forgotOpen.value = false
}

async function handleForgotPassword() {
  const value = forgotIdentifier.value.trim()
  if (!value) {
    feedback.error(t('login.identifierRequired'), t('common.error'))
    return
  }
  try {
    forgotLoading.value = true
    await authService.resetPassword(value)
    feedback.success(t('login.resetSent'), t('common.success'))
    forgotOpen.value = false
    identifier.value = value
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

<style scoped>
.login-deck {
  display: grid;
}
.login-deck__pane {
  grid-area: 1 / 1;
}
.login-deck__pane--out,
.login-deck__pane--enter {
  pointer-events: none;
  visibility: hidden;
}
</style>
