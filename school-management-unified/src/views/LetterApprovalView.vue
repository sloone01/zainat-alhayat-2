<template>
  <div
    class="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-100 px-3 py-4"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <div class="mx-auto w-full max-w-2xl">
      <div class="rounded-2xl border border-secondary-200/50 bg-white/95 p-5 shadow-2xl backdrop-blur-sm sm:p-6">
        <div class="mb-3 flex items-center justify-end">
          <LanguageSwitcher />
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
          <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>

        <div v-else-if="error" class="py-10 text-center">
          <h1 class="text-xl font-semibold text-secondary-800">{{ $t('letterApproval.title') }}</h1>
          <p class="mt-2 text-sm text-red-700">{{ error }}</p>
        </div>

        <template v-else-if="view">
          <h1 class="text-xl font-semibold text-secondary-800">{{ view.subject }}</h1>
          <iframe
            class="mt-4 w-full min-h-[420px] rounded-xl border border-fikr-hairline bg-white"
            :srcdoc="view.body_html"
            sandbox=""
            :title="view.subject"
          />

          <p v-if="view.status === 'approved'" class="mt-4 text-sm font-medium text-primary-700">
            {{ $t('messageLetters.letterApproved') }}
          </p>
          <p v-else-if="view.status === 'rejected'" class="mt-4 text-sm font-medium text-red-700">
            {{ $t('messageLetters.letterRejected') }}
          </p>
          <p v-else-if="submitError" class="mt-4 text-sm text-red-700">{{ submitError }}</p>

          <div v-if="view.status === 'pending'" class="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              :class="preferred === 'approve' ? 'ring-2 ring-primary-500/50' : ''"
              :disabled="submitting"
              @click="decide('approve')"
            >
              {{ $t('messageLetters.approveLetter') }}
            </button>
            <button
              type="button"
              class="fk-btn fk-btn--danger"
              :class="preferred === 'reject' ? 'ring-2 ring-red-400/60' : ''"
              :disabled="submitting"
              @click="decide('reject')"
            >
              {{ $t('messageLetters.rejectLetter') }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { getApiBaseUrl } from '@/config/public-config'

type LetterApprovalView = {
  subject: string
  body_html: string
  status: 'pending' | 'approved' | 'rejected'
  locale: 'ar' | 'en'
}

const { t, locale } = useI18n()
const route = useRoute()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const submitError = ref('')
const view = ref<LetterApprovalView | null>(null)

const token = computed(() => String(route.query.t || ''))
const preferred = computed(() => {
  const d = String(route.query.d || '')
  return d === 'approve' || d === 'reject' ? d : ''
})

function apiUrl(path: string): string {
  return `${getApiBaseUrl().replace(/\/$/, '')}${path}`
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as {
    success?: boolean
    data?: T
    message?: string
  } | null
  if (!res.ok || !json?.success || json.data == null) {
    throw new Error(json?.message || t('letterApproval.invalid'))
  }
  return json.data
}

async function loadPreview(): Promise<void> {
  loading.value = true
  error.value = ''
  view.value = null
  if (!token.value) {
    error.value = t('letterApproval.invalid')
    loading.value = false
    return
  }
  try {
    const res = await fetch(
      `${apiUrl('/public/letter-approvals')}?token=${encodeURIComponent(token.value)}`,
    )
    view.value = await parseEnvelope<LetterApprovalView>(res)
    if (view.value.locale === 'ar' || view.value.locale === 'en') {
      locale.value = view.value.locale
    }
  } catch (err) {
    error.value = err instanceof Error && err.message ? err.message : t('letterApproval.invalid')
  } finally {
    loading.value = false
  }
}

async function decide(decision: 'approve' | 'reject'): Promise<void> {
  if (!token.value || submitting.value) return
  submitting.value = true
  submitError.value = ''
  try {
    const res = await fetch(apiUrl('/public/letter-approvals'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, decision }),
    })
    view.value = await parseEnvelope<LetterApprovalView>(res)
  } catch (err) {
    submitError.value =
      err instanceof Error && err.message ? err.message : t('messageLetters.approvalResolveError')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadPreview()
})
</script>
