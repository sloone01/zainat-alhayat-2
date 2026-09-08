<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="pageTitle"
        :subtitle="$t('userManagement.addUserPageSubtitle')"
      >
        <template #leading>
          <router-link
            :to="backTo"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('userManagement.backToUsers')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="saveError" class="fk-alert fk-alert--error">{{ saveError }}</div>

      <form
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
        @submit.prevent="submit"
      >
        <header class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/40 px-5 py-4 sm:px-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-gray-900">{{ $t('userManagement.accountInfo') }}</h2>
              <p class="mt-0.5 text-sm text-gray-500">{{ $t('userManagement.addUserDetailsHint') }}</p>
            </div>
            <div
              class="inline-flex max-w-full flex-wrap rounded-lg border border-gray-200 bg-white/80 p-0.5 shadow-sm"
              role="tablist"
              :aria-label="$t('userManagement.userTypeTabsLabel')"
            >
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                role="tab"
                class="rounded-md px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                :class="userType === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                :aria-selected="userType === tab.id"
                @click="userType = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
        </header>

        <div class="space-y-5 p-6">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-full-name">
              {{ $t('userManagement.fullName') }} *
            </label>
            <input
              id="user-full-name"
              v-model="form.fullName"
              type="text"
              required
              class="fk-field max-w-xl"
              :placeholder="$t('userManagement.fullNamePlaceholder')"
            >
          </div>
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-email">
                {{ $t('userManagement.email') }} *
              </label>
              <input
                id="user-email"
                v-model="form.email"
                type="email"
                required
                dir="ltr"
                class="fk-field"
                :placeholder="$t('userManagement.emailPlaceholder')"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-mobile">
                {{ $t('userManagement.mobile') }} *
              </label>
              <input
                id="user-mobile"
                v-model="form.mobile"
                type="tel"
                required
                dir="ltr"
                class="fk-field"
                :placeholder="$t('userManagement.mobilePlaceholder')"
              >
            </div>
          </div>
          <div class="fk-note max-w-3xl">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="font-semibold text-fikr-ink">{{ $t('userManagement.passwordInfo') }}</p>
              <p class="mt-0.5">
                {{ userType === 'student' ? $t('userManagement.studentPasswordDetails') : $t('userManagement.passwordDetails') }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:px-6">
          <router-link :to="backTo" class="fk-btn fk-btn--pearl">
            {{ $t('common.cancel') }}
          </router-link>
          <button
            type="submit"
            class="fk-btn fk-btn--primary"
            :disabled="!isValid || saving"
          >
            {{ saving ? $t('common.saving') : submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { userService } from '@/services'

type AccountKind = 'parent' | 'student'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const userType = ref<AccountKind>(route.query.type === 'student' ? 'student' : 'parent')

const form = ref({
  fullName: '',
  email: '',
  mobile: '',
})

const saving = ref(false)
const saveError = ref('')

const tabs = computed(() => [
  { id: 'parent' as const, label: t('userManagement.userTypes.parent') },
  { id: 'student' as const, label: t('userManagement.userTypes.student') },
])

const pageTitle = computed(() =>
  userType.value === 'student' ? t('userManagement.addStudent') : t('userManagement.addParent'),
)

const submitLabel = computed(() =>
  userType.value === 'student' ? t('userManagement.createStudent') : t('userManagement.createParent'),
)

const backTo = computed(() => ({
  path: '/users',
  query: { kind: userType.value },
}))

const isValid = computed(() =>
  form.value.fullName.trim() !== '' &&
  form.value.email.trim() !== '' &&
  form.value.mobile.trim() !== '',
)

watch(userType, (kind) => {
  if (route.query.type !== kind) {
    void router.replace({ query: { ...route.query, type: kind } })
  }
})

async function submit() {
  if (!isValid.value || saving.value) return
  saving.value = true
  saveError.value = ''
  try {
    const nameParts = form.value.fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''
    const username = form.value.email.split('@')[0]
    await userService.createUser({
      username,
      email: form.value.email.trim(),
      firstName,
      lastName,
      role: userType.value,
      phone: form.value.mobile.trim(),
      isActive: true,
      user_type: userType.value,
    })
    await router.push(backTo.value)
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    const m = ax.response?.data?.message
    saveError.value =
      (Array.isArray(m) ? m.join(', ') : m) || ax.message || t('userManagement.saveUserError')
  } finally {
    saving.value = false
  }
}
</script>
