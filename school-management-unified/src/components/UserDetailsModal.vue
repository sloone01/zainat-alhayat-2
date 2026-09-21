<template>
  <FikrDialog
    :show="show"
    size="md"
    plain-footer
    :title="user?.fullName || ''"
    :subtitle="user?.email"
    @close="$emit('close')"
  >
    <div class="fk-form">
      <!-- identity strip -->
      <div class="flex flex-wrap items-center gap-4 rounded-lg bg-fikr-surface-low p-4">
        <div class="fk-monogram fk-monogram--navy h-14 w-14 text-lg">
          {{ user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2) }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="fk-chip" :class="user?.status === 'active' ? 'fk-chip--green' : 'fk-chip--red'">
              {{ user?.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
            </span>
            <span v-for="roleId in user?.roles" :key="roleId" class="fk-chip" :class="getRoleColor(roleId)">
              {{ getRoleName(roleId) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Contact & identity: one tile each, easy to read and copy -->
      <div class="fk-form__section">
        <p class="fk-form__eyebrow">{{ $t('userManagement.contactInfo') }}</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="item in contactItems"
            :key="item.key"
            class="flex items-center gap-3 rounded-xl border border-fikr-hairline bg-white p-3"
            :class="item.wide ? 'sm:col-span-2' : ''"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700" aria-hidden="true">
              <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-fikr-ink-soft">{{ item.label }}</p>
              <p class="mt-0.5 break-all text-sm font-medium text-fikr-ink" dir="ltr" :class="isRTL ? 'text-end' : ''">
                {{ item.value || '—' }}
              </p>
            </div>
            <button
              v-if="item.value"
              type="button"
              class="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
              @click="copy(item)"
            >
              {{ copiedKey === item.key ? $t('userManagement.copied') : $t('userManagement.copyValue') }}
            </button>
          </div>
        </div>
      </div>

      <div class="fk-form__section">
        <p class="fk-form__eyebrow">{{ $t('userManagement.accountInfo') }}</p>
        <dl class="grid grid-cols-2 gap-4">
          <div>
            <dt class="text-xs text-fikr-ink-soft">{{ $t('userManagement.createdDate') }}</dt>
            <dd class="mt-0.5 text-sm font-medium text-fikr-ink">{{ formatDate(user?.createdAt) }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="text-xs text-fikr-ink-soft">{{ $t('userManagement.lastLogin') }}</dt>
            <dd class="mt-0.5 text-sm font-medium text-fikr-ink">
              <template v-if="formatLoginDate(user?.lastLogin)">
                <span class="block">{{ formatLoginDate(user?.lastLogin) }}</span>
                <span class="block text-xs tabular-nums text-fikr-ink-soft">{{ formatLoginTime(user?.lastLogin) }}</span>
              </template>
              <template v-else>{{ $t('userManagement.neverLoggedIn') }}</template>
            </dd>
          </div>
        </dl>
      </div>

      <div v-if="!isParentAccount" class="fk-form__section">
        <p class="fk-form__eyebrow">{{ $t('userManagement.permissionsSummary') }}</p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-lg bg-fikr-surface-low px-3 py-3">
            <div class="text-xl font-semibold tabular-nums text-navy-800">{{ getTotalPermissions() }}</div>
            <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ $t('userManagement.totalPermissions') }}</div>
          </div>
          <div class="rounded-lg bg-fikr-surface-low px-3 py-3">
            <div class="text-xl font-semibold tabular-nums text-navy-800">{{ getAccessiblePages() }}</div>
            <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ $t('userManagement.accessiblePages') }}</div>
          </div>
          <div class="rounded-lg bg-fikr-surface-low px-3 py-3">
            <div class="text-xl font-semibold tabular-nums text-navy-800">{{ user?.roles?.length || 0 }}</div>
            <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ $t('userManagement.assignedRoles') }}</div>
          </div>
          <div class="rounded-lg bg-fikr-surface-low px-3 py-3">
            <div class="text-xl font-semibold tabular-nums text-navy-800">{{ getLoginCount() }}</div>
            <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ $t('userManagement.loginCount') }}</div>
          </div>
        </div>
      </div>

      <div v-if="!isParentAccount" class="fk-form__section">
        <p class="fk-form__eyebrow">{{ $t('userManagement.recentActivity') }}</p>
        <ul class="divide-y divide-fikr-hairline rounded-lg ring-1 ring-fikr-hairline">
          <li class="flex items-center gap-3 px-4 py-3">
            <span class="h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-fikr-ink">{{ $t('userManagement.lastLoginActivity') }}</p>
            </div>
            <p class="shrink-0 text-end text-xs text-fikr-ink-soft">
              <template v-if="formatLoginDate(user?.lastLogin)">
                <span class="block">{{ formatLoginDate(user?.lastLogin) }}</span>
                <span class="block tabular-nums">{{ formatLoginTime(user?.lastLogin) }}</span>
              </template>
              <template v-else>{{ $t('userManagement.neverLoggedIn') }}</template>
            </p>
          </li>
          <li class="flex items-center gap-3 px-4 py-3">
            <span class="h-2 w-2 shrink-0 rounded-full bg-navy-800" aria-hidden="true" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-fikr-ink">{{ $t('userManagement.accountCreated') }}</p>
            </div>
            <p class="text-xs text-fikr-ink-soft">{{ formatDate(user?.createdAt) }}</p>
          </li>
          <li class="flex items-center gap-3 px-4 py-3">
            <span class="h-2 w-2 shrink-0 rounded-full bg-fikr-outline" aria-hidden="true" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-fikr-ink">{{ $t('userManagement.rolesAssigned') }}</p>
            </div>
            <p class="text-xs text-fikr-ink-soft">{{ user?.roles?.length || 0 }} {{ $t('userManagement.roles') }}</p>
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <button
        v-if="!isParentAccount"
        type="button"
        class="fk-btn fk-btn--pearl"
        :disabled="resetting"
        @click="resetPassword"
      >
        {{ resetting ? $t('common.loading') : $t('userManagement.resetPassword') }}
      </button>
      <button type="button" class="fk-btn fk-btn--primary" @click="$emit('close')">{{ $t('common.close') }}</button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import FikrDialog from '@/components/FikrDialog.vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService } from '@/services'

const { locale, t } = useI18n()

// Props
const props = defineProps<{
  show: boolean
  user?: any
  availableRoles: any[]
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

const resetting = ref(false)

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Methods
const getRoleName = (roleId: string) => {
  const role = props.availableRoles.find(r => r.id === roleId)
  return role ? role.name : roleId
}

const getRoleColor = (roleId: string) => {
  const role = props.availableRoles.find(r => r.id === roleId)
  return role ? role.color : 'fk-chip--neutral'
}

const parseUserDate = (value?: string | Date | null): Date | null => {
  if (value == null || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (dateString?: string | Date | null) => {
  const date = parseUserDate(dateString)
  if (!date) return null
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatLoginDate = (dateString?: string | Date | null) => {
  const date = parseUserDate(dateString)
  if (!date) return ''
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatLoginTime = (dateString?: string | Date | null) => {
  const date = parseUserDate(dateString)
  if (!date) return ''
  return date.toLocaleTimeString(locale.value === 'ar' ? 'ar-OM' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTotalPermissions = () => {
  // Mock calculation based on roles
  return (props.user?.roles?.length || 0) * 15
}

const getAccessiblePages = () => {
  // Mock calculation based on roles
  return Math.min((props.user?.roles?.length || 0) * 3, 8)
}

const getLoginCount = () => {
  // Mock login count
  return Math.floor(Math.random() * 50) + 1
}

const ICON_MAIL = 'M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
const ICON_PHONE = 'M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z'
const ICON_ID = 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0M9 12h.01M9 16h6'

const contactItems = computed(() => [
  { key: 'email', label: t('userManagement.email'), value: props.user?.email as string | undefined, icon: ICON_MAIL, wide: true },
  { key: 'mobile', label: t('userManagement.mobile'), value: props.user?.mobile as string | undefined, icon: ICON_PHONE, wide: false },
  { key: 'civil', label: t('students.civilId'), value: props.user?.civil_id as string | undefined, icon: ICON_ID, wide: false },
])

const copiedKey = ref('')
async function copy(item: { key: string; value?: string }) {
  if (!item.value) return
  try {
    await navigator.clipboard.writeText(item.value)
    copiedKey.value = item.key
    setTimeout(() => {
      if (copiedKey.value === item.key) copiedKey.value = ''
    }, 1500)
  } catch {
    /* clipboard not available (e.g. insecure context) */
  }
}

// Parents are shared across schools, so a school cannot reset their password.
const isParentAccount = computed(() => {
  const u = props.user as { role?: string; user_type?: string } | null
  return u?.user_type === 'parent' || u?.role === 'parent'
})

const resetPassword = async () => {
  if (!props.user?.id || resetting.value) return
  resetting.value = true
  try {
    await userService.resetPassword(props.user.id)
    alert(t('userManagement.passwordResetEmailSent'))
  } catch (e: any) {
    alert(e?.message || t('userManagement.resetPasswordError'))
  } finally {
    resetting.value = false
  }
}
</script>

