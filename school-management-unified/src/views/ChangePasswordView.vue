<template>
  <AuthSplitLayout :hero-subtitle="heroSubtitle" hide-home>
    <div class="mx-auto mb-2 flex max-w-[18rem] justify-center sm:max-w-[20rem]">
      <img
        src="/fikr-logo.webp?v=6"
        :alt="$t('forSchools.logoAlt')"
        class="h-16 w-full bg-transparent object-contain sm:h-20"
      />
    </div>

    <div class="mt-6 text-center">
      <h1 class="text-[30px] font-bold tracking-[-0.01em] text-fikr-ink sm:text-[34px]">
        {{ $t('changePassword.title') }}
      </h1>
    </div>

    <form class="mt-7 space-y-3" novalidate @submit.prevent="handleSubmit">
      <div class="relative">
        <label for="current-password" class="sr-only">{{ $t('changePassword.current') }}</label>
        <input
          id="current-password"
          v-model="currentPassword"
          :type="showCurrent ? 'text' : 'password'"
          required
          autocomplete="current-password"
          class="fk-input rounded-xl px-4 py-3.5 pe-12 text-base tracking-[0.15em]"
          :placeholder="$t('changePassword.current')"
        />
        <button
          type="button"
          class="absolute inset-y-0 end-0 flex items-center pe-4 text-fikr-ink-soft hover:text-fikr-ink"
          :aria-label="$t('changePassword.current')"
          @click="showCurrent = !showCurrent"
        >
          <svg v-if="showCurrent" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        </button>
      </div>

      <div class="relative">
        <label for="new-password" class="sr-only">{{ $t('changePassword.new') }}</label>
        <input
          id="new-password"
          v-model="newPassword"
          :type="showNew ? 'text' : 'password'"
          required
          autocomplete="new-password"
          class="fk-input rounded-xl px-4 py-3.5 pe-12 text-base tracking-[0.15em]"
          :placeholder="$t('changePassword.new')"
        />
        <button
          type="button"
          class="absolute inset-y-0 end-0 flex items-center pe-4 text-fikr-ink-soft hover:text-fikr-ink"
          :aria-label="$t('changePassword.new')"
          @click="showNew = !showNew"
        >
          <svg v-if="showNew" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        </button>
      </div>

      <div class="relative">
        <label for="confirm-password" class="sr-only">{{ $t('changePassword.confirm') }}</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          :type="showConfirm ? 'text' : 'password'"
          required
          autocomplete="new-password"
          class="fk-input rounded-xl px-4 py-3.5 pe-12 text-base tracking-[0.15em]"
          :placeholder="$t('changePassword.confirm')"
        />
        <button
          type="button"
          class="absolute inset-y-0 end-0 flex items-center pe-4 text-fikr-ink-soft hover:text-fikr-ink"
          :aria-label="$t('changePassword.confirm')"
          @click="showConfirm = !showConfirm"
        >
          <svg v-if="showConfirm" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
          <FikrLoader size="xs" />
          {{ $t('changePassword.saving') }}
        </template>
        <template v-else>{{ $t('changePassword.submit') }}</template>
      </button>
    </form>
  </AuthSplitLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AuthSplitLayout from '@/components/AuthSplitLayout.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { useFeedback } from '@/composables/useFeedback'
import { authService, type AuthError } from '@/services'
import { sessionHomePath } from '@/utils/auth-token'

const { t } = useI18n()
const router = useRouter()
const feedback = useFeedback()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const loading = ref(false)

const heroSubtitle = computed(() => t('login.heroSubtitlePlatform'))

function afterChangePath(): string {
  const user = authService.getStoredUser()
  if (user?.school_status === 'pending_payment') return '/billing'
  return sessionHomePath()
}

async function handleSubmit() {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    feedback.error(t('changePassword.fillRequired'), t('common.error'))
    return
  }
  if (newPassword.value.length < 6) {
    feedback.error(t('changePassword.tooShort'), t('common.error'))
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    feedback.error(t('changePassword.mismatch'), t('common.error'))
    return
  }
  if (newPassword.value === currentPassword.value) {
    feedback.error(t('changePassword.sameAsCurrent'), t('common.error'))
    return
  }

  try {
    loading.value = true
    await authService.changePassword({
      oldPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    feedback.success(t('changePassword.success'), t('common.success'))
    router.replace(afterChangePath())
  } catch (e: unknown) {
    const err = e as AuthError
    const code = err?.code
    const msg = String(err?.message || '')
    if (code === 'INVALID_CREDENTIALS') {
      feedback.error(t('changePassword.currentWrong'), t('common.error'))
    } else if (/must be different/i.test(msg)) {
      feedback.error(t('changePassword.sameAsCurrent'), t('common.error'))
    } else if (code === 'VALIDATION_ERROR' || code === 'UNPROCESSABLE_ENTITY') {
      feedback.error(t('changePassword.tooShort'), t('common.error'))
    } else if (code === 'RATE_LIMITED') {
      feedback.error(t('login.rateLimited'), t('common.error'))
    } else if (code === 'NETWORK_ERROR') {
      feedback.error(t('login.networkError'), t('common.error'))
    } else {
      feedback.error(t('changePassword.failed'), t('common.error'))
    }
  } finally {
    loading.value = false
  }
}
</script>
