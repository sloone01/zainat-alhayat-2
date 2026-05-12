<template>
  <div class="min-h-screen bg-gradient-to-br from-kindergarten-50 via-white to-teal-50" :dir="isRTL ? 'rtl' : 'ltr'">
    <header class="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-20">
      <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <router-link to="/" class="text-sm font-medium text-primary-600 hover:text-primary-800">
          ← {{ $t('subscription.backHome') }}
        </router-link>
        <LanguageSwitcher />
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8 pb-16">
      <div class="text-center mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">{{ $t('subscription.title') }}</h1>
        <p class="mt-2 text-gray-600 text-sm md:text-base">{{ $t('subscription.subtitle') }}</p>
        <p class="mt-2 text-xs text-gray-500">{{ $t('subscription.noteRelations') }}</p>
      </div>

      <form class="space-y-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8" @submit.prevent="onSubmit">
        <!-- Owner account -->
        <section>
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            {{ $t('subscription.sectionOwner') }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.ownerEmail') }}</label>
              <input v-model="owner_email" type="email" required maxlength="255" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.password') }}</label>
              <input v-model="password" type="password" required minlength="6" maxlength="100" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.passwordConfirm') }}</label>
              <input v-model="passwordConfirm" type="password" required minlength="6" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.ownerFirstName') }}</label>
              <input v-model="owner_first_name" type="text" required maxlength="100" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.ownerLastName') }}</label>
              <input v-model="owner_last_name" type="text" required maxlength="100" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.ownerPhone') }}</label>
              <input v-model="owner_phone" type="tel" maxlength="20" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.ownerLegalName') }}</label>
              <input v-model="owner_legal_name" type="text" maxlength="255" class="input-field" :placeholder="$t('subscription.ownerLegalNameHint')" />
            </div>
          </div>
        </section>

        <!-- Documents -->
        <section>
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            {{ $t('subscription.sectionDocuments') }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.crCopy') }}</label>
              <input ref="crInput" type="file" accept=".pdf,image/*" required class="block w-full text-sm text-gray-600" />
              <p class="text-xs text-gray-500 mt-1">{{ $t('subscription.fileHint') }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.idCopy') }}</label>
              <input ref="idInput" type="file" accept=".pdf,image/*" required class="block w-full text-sm text-gray-600" />
              <p class="text-xs text-gray-500 mt-1">{{ $t('subscription.fileHint') }}</p>
            </div>
          </div>
        </section>

        <!-- School -->
        <section>
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            {{ $t('subscription.sectionSchool') }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.schoolName') }}</label>
              <input v-model="school_name" type="text" required maxlength="200" class="input-field" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.schoolAddress') }}</label>
              <textarea v-model="school_address" rows="2" maxlength="2000" class="input-field"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.schoolPhone') }}</label>
              <input v-model="school_phone" type="tel" maxlength="30" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.schoolEmail') }}</label>
              <input v-model="school_email" type="email" maxlength="100" class="input-field" />
            </div>
          </div>
        </section>

        <!-- First group -->
        <section>
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            {{ $t('subscription.sectionGroup') }}
          </h2>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('subscription.groupName') }}</label>
            <input v-model="group_name" type="text" required maxlength="255" class="input-field" :placeholder="$t('subscription.groupPlaceholder')" />
            <p class="text-xs text-gray-500 mt-1">{{ $t('subscription.groupHelp') }}</p>
          </div>
        </section>

        <p v-if="error" class="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2">{{ error }}</p>

        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
          <button
            type="submit"
            class="inline-flex justify-center items-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
            :disabled="submitting"
          >
            {{ submitting ? $t('subscription.submitting') : $t('subscription.submit') }}
          </button>
          <router-link to="/login" class="text-sm text-center sm:text-end text-primary-600 hover:text-primary-800 font-medium">
            {{ $t('subscription.alreadyHaveAccount') }}
          </router-link>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { schoolSubscriptionService } from '@/services/school-subscription.service'

const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const crInput = ref<HTMLInputElement | null>(null)
const idInput = ref<HTMLInputElement | null>(null)

const owner_email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const owner_first_name = ref('')
const owner_last_name = ref('')
const owner_phone = ref('')
const owner_legal_name = ref('')
const school_name = ref('')
const school_address = ref('')
const school_phone = ref('')
const school_email = ref('')
const group_name = ref('')

const submitting = ref(false)
const error = ref('')

function buildFormData(): FormData {
  const fd = new FormData()
  fd.append('owner_email', owner_email.value.trim())
  fd.append('password', password.value)
  fd.append('owner_first_name', owner_first_name.value.trim())
  fd.append('owner_last_name', owner_last_name.value.trim())
  if (owner_phone.value.trim()) fd.append('owner_phone', owner_phone.value.trim())
  if (owner_legal_name.value.trim()) fd.append('owner_legal_name', owner_legal_name.value.trim())
  fd.append('school_name', school_name.value.trim())
  if (school_address.value.trim()) fd.append('school_address', school_address.value.trim())
  if (school_phone.value.trim()) fd.append('school_phone', school_phone.value.trim())
  if (school_email.value.trim()) fd.append('school_email', school_email.value.trim())
  fd.append('group_name', group_name.value.trim())
  const cr = crInput.value?.files?.[0]
  const idf = idInput.value?.files?.[0]
  if (cr) fd.append('cr_copy', cr)
  if (idf) fd.append('id_copy', idf)
  return fd
}

async function onSubmit() {
  error.value = ''
  if (password.value !== passwordConfirm.value) {
    error.value = t('subscription.passwordMismatch')
    return
  }
  submitting.value = true
  try {
    const data = await schoolSubscriptionService.register(buildFormData())
    localStorage.setItem('auth_token', data.access_token)
    localStorage.setItem('user_data', JSON.stringify(data.user))
    await router.push('/dashboard')
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    error.value = Array.isArray(m) ? m.join(', ') : m || (e as Error).message || t('subscription.submitError')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}
</style>
