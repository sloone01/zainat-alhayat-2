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
          <p class="mt-2 text-sm text-fikr-ink-muted" dir="ltr">{{ user?.mobile || '—' }}</p>
        </div>
      </div>

      <div class="fk-form__section">
        <p class="fk-form__eyebrow">{{ $t('userManagement.accountInfo') }}</p>
        <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt class="text-xs text-fikr-ink-soft">{{ $t('userManagement.createdDate') }}</dt>
            <dd class="mt-0.5 text-sm font-medium text-fikr-ink">{{ formatDate(user?.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-fikr-ink-soft">{{ $t('userManagement.lastLogin') }}</dt>
            <dd class="mt-0.5 text-sm font-medium text-fikr-ink">{{ formatDate(user?.lastLogin) || $t('userManagement.neverLoggedIn') }}</dd>
          </div>
          <div>
            <dt class="text-xs text-fikr-ink-soft">{{ $t('userManagement.email') }}</dt>
            <dd class="mt-0.5 truncate text-sm font-medium text-fikr-ink" dir="ltr">{{ user?.email }}</dd>
          </div>
          <div>
            <dt class="text-xs text-fikr-ink-soft">{{ $t('userManagement.mobile') }}</dt>
            <dd class="mt-0.5 text-sm font-medium text-fikr-ink" dir="ltr">{{ user?.mobile || '—' }}</dd>
          </div>
        </dl>
      </div>

      <div class="fk-form__section">
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

      <div class="fk-form__section">
        <p class="fk-form__eyebrow">{{ $t('userManagement.recentActivity') }}</p>
        <ul class="divide-y divide-fikr-hairline rounded-lg ring-1 ring-fikr-hairline">
          <li class="flex items-center gap-3 px-4 py-3">
            <span class="h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-fikr-ink">{{ $t('userManagement.lastLoginActivity') }}</p>
            </div>
            <p class="text-xs text-fikr-ink-soft">{{ formatDate(user?.lastLogin) || $t('userManagement.neverLoggedIn') }}</p>
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
      <button type="button" class="fk-btn fk-btn--pearl" :disabled="resetting" @click="resetPassword">
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

const formatDate = (dateString: string) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US')
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

