<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-6 pt-6 pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                <span class="text-2xl font-medium text-purple-600">
                  {{ user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2) }}
                </span>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ user?.fullName }}</h3>
                <p class="text-gray-600">{{ user?.email }}</p>
                <span
                  :class="[
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1',
                    user?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ user?.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                </span>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 pb-6">
          <!-- Contact Information -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('userManagement.contactInfo') }}</h4>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-600">{{ $t('userManagement.email') }}</dt>
                <dd class="text-sm font-medium text-gray-900">{{ user?.email }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-600">{{ $t('userManagement.mobile') }}</dt>
                <dd class="text-sm font-medium text-gray-900">{{ user?.mobile }}</dd>
              </div>
            </dl>
          </div>

          <!-- Roles -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('userManagement.assignedRoles') }}</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="roleId in user?.roles"
                :key="roleId"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="getRoleColor(roleId)"
              >
                {{ getRoleName(roleId) }}
              </span>
            </div>
          </div>

          <!-- Account Information -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('userManagement.accountInfo') }}</h4>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-600">{{ $t('userManagement.createdDate') }}</dt>
                <dd class="text-sm font-medium text-gray-900">{{ formatDate(user?.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-600">{{ $t('userManagement.lastLogin') }}</dt>
                <dd class="text-sm font-medium text-gray-900">{{ formatDate(user?.lastLogin) || $t('userManagement.neverLoggedIn') }}</dd>
              </div>
            </dl>
          </div>

          <!-- Permissions Summary -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('userManagement.permissionsSummary') }}</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-blue-600">{{ getTotalPermissions() }}</div>
                  <div class="text-xs text-gray-600">{{ $t('userManagement.totalPermissions') }}</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-green-600">{{ getAccessiblePages() }}</div>
                  <div class="text-xs text-gray-600">{{ $t('userManagement.accessiblePages') }}</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-purple-600">{{ user?.roles?.length || 0 }}</div>
                  <div class="text-xs text-gray-600">{{ $t('userManagement.assignedRoles') }}</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-orange-600">{{ getLoginCount() }}</div>
                  <div class="text-xs text-gray-600">{{ $t('userManagement.loginCount') }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('userManagement.recentActivity') }}</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ $t('userManagement.lastLoginActivity') }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(user?.lastLogin) || $t('userManagement.neverLoggedIn') }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ $t('userManagement.accountCreated') }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(user?.createdAt) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.414-4.414a2 2 0 00-2.828 0L4 14v4h4l7.586-7.586a2 2 0 000-2.828z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ $t('userManagement.rolesAssigned') }}</p>
                  <p class="text-xs text-gray-500">{{ user?.roles?.length || 0 }} {{ $t('userManagement.roles') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-3 flex justify-end gap-3">
          <button
            @click="resetPassword"
            type="button"
            class="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {{ $t('userManagement.resetPassword') }}
          </button>
          <button
            @click="$emit('close')"
            type="button"
            class="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

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

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Methods
const getRoleName = (roleId: string) => {
  const role = props.availableRoles.find(r => r.id === roleId)
  return role ? role.name : roleId
}

const getRoleColor = (roleId: string) => {
  const role = props.availableRoles.find(r => r.id === roleId)
  return role ? role.color : 'bg-gray-100 text-gray-800'
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

const resetPassword = () => {
  alert(`Password reset email sent to ${props.user?.email} with new password: Oomani@123`)
}
</script>

