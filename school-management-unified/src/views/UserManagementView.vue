<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('userManagement.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('userManagement.subtitle') }}</p>
        </div>
      </section>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ error }}</span>
          <button type="button" class="font-semibold text-red-700 underline hover:text-red-900" @click="fetchUsers">
            {{ $t('userManagement.tryAgain') }}
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('userManagement.listHeading') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('userManagement.usersCount', { count: filteredUsers.length }) }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <ListViewModeToggle v-model="viewMode" />
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="sm:col-span-2 lg:col-span-1">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="users-search">{{ $t('common.search') }}</label>
              <div class="relative">
                <svg class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="users-search"
                  v-model="searchQuery"
                  type="search"
                  :placeholder="$t('userManagement.searchPlaceholder')"
                  class="w-full rounded-lg border border-gray-200 bg-white py-2.5 ps-9 pe-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="users-role">{{ $t('userManagement.roles') }}</label>
              <select id="users-role" v-model="roleFilter" class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="all">{{ $t('userManagement.allRoles') }}</option>
                <option v-for="role in availableRoles" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="users-status">{{ $t('userManagement.status') }}</label>
              <select id="users-status" v-model="statusFilter" class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="all">{{ $t('userManagement.allStatuses') }}</option>
                <option value="active">{{ $t('userManagement.active') }}</option>
                <option value="inactive">{{ $t('userManagement.inactive') }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="users-date">{{ $t('userManagement.dateFilter') }}</label>
              <select id="users-date" v-model="dateFilter" class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="all">{{ $t('userManagement.allDates') }}</option>
                <option value="today">{{ $t('userManagement.today') }}</option>
                <option value="week">{{ $t('userManagement.thisWeek') }}</option>
                <option value="month">{{ $t('userManagement.thisMonth') }}</option>
              </select>
            </div>
          </div>

          <div v-if="!loading" class="mb-5 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              @click="showAddModal = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('userManagement.addUser') }}
            </button>
          </div>

          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else>
      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('userManagement.noUsers') }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ $t('userManagement.noUsersDescription') }}</p>
      </div>

      <template v-else>
      <!-- Table View (desktop) -->
      <div v-if="!isCards" class="hidden md:block overflow-x-auto rounded-xl border border-gray-200/80">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th :class="[
                'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                isRTL ? 'text-right' : 'text-left'
              ]">
                {{ $t('userManagement.user') }}
              </th>
              <th :class="[
                'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                isRTL ? 'text-right' : 'text-left'
              ]">
                {{ $t('userManagement.contact') }}
              </th>
              <th :class="[
                'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                isRTL ? 'text-right' : 'text-left'
              ]">
                {{ $t('userManagement.roles') }}
              </th>
              <th :class="[
                'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                isRTL ? 'text-right' : 'text-left'
              ]">
                {{ $t('userManagement.status') }}
              </th>
              <th :class="[
                'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                isRTL ? 'text-right' : 'text-left'
              ]">
                {{ $t('userManagement.lastLogin') }}
              </th>
              <th :class="[
                'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                isRTL ? 'text-left' : 'text-right'
              ]">
                {{ $t('userManagement.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
              <!-- User Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-700">
                        {{ userInitials(user) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.fullName }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.mobile }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>

              <!-- Roles -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="roleId in user.roles"
                    :key="roleId"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRoleColor(roleId)"
                  >
                    {{ getRoleName(roleId) }}
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                </span>
              </td>

              <!-- Last Login -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.lastLogin) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <UserActionsDropdown
                  :user="user"
                  :open="activeUserDropdown === user.id"
                  :isRTL="isRTL"
                  @toggle="toggleUserDropdown(user.id)"
                  @edit="editUser(user)"
                  @view="viewUserDetails(user)"
                  @reset-password="resetPassword(user)"
                  @toggle-status="toggleUserStatus(user)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card View (desktop) -->
      <div v-if="isCards" class="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          v-for="user in paginatedUsers"
          :key="'user-desktop-card-' + user.id"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
        >
          <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <span class="text-sm font-semibold text-primary-700">{{ userInitials(user) }}</span>
                </div>
                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold text-gray-900">{{ user.fullName }}</h3>
                  <p class="truncate text-sm text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                </span>
                <UserActionsDropdown
                  :user="user"
                  :open="activeUserDropdown === user.id"
                  :isRTL="isRTL"
                  @toggle="toggleUserDropdown(user.id)"
                  @edit="editUser(user)"
                  @view="viewUserDetails(user)"
                  @reset-password="resetPassword(user)"
                  @toggle-status="toggleUserStatus(user)"
                />
              </div>
            </div>
          </div>
          <dl class="grid grid-cols-2 gap-2 px-4 py-3 text-sm">
            <div class="rounded-lg bg-gray-50 px-3 py-2">
              <dt class="text-xs font-medium text-gray-500">{{ $t('userManagement.mobile') }}</dt>
              <dd class="mt-0.5 font-medium text-gray-900">{{ user.mobile || '—' }}</dd>
            </div>
            <div class="rounded-lg bg-gray-50 px-3 py-2">
              <dt class="text-xs font-medium text-gray-500">{{ $t('userManagement.lastLogin') }}</dt>
              <dd class="mt-0.5 font-medium text-gray-800">{{ formatDate(user.lastLogin) }}</dd>
            </div>
          </dl>
          <div class="border-t border-gray-100 px-4 py-3">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="roleId in user.roles"
                :key="roleId"
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                :class="getRoleColor(roleId)"
              >
                {{ getRoleName(roleId) }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden space-y-3">
        <article
          v-for="user in paginatedUsers"
          :key="'user-mobile-card-' + user.id"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
        >
          <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <span class="text-sm font-semibold text-primary-700">{{ userInitials(user) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-semibold leading-snug text-gray-900">{{ user.fullName }}</h3>
                <p class="mt-0.5 truncate text-sm text-gray-500">{{ user.email }}</p>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                  </span>
                  <span
                    v-for="roleId in user.roles"
                    :key="roleId"
                    class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :class="getRoleColor(roleId)"
                  >
                    {{ getRoleName(roleId) }}
                  </span>
                </div>
              </div>
              <UserActionsDropdown
                :user="user"
                :open="activeUserDropdown === user.id"
                :isRTL="isRTL"
                @toggle="toggleUserDropdown(user.id)"
                @edit="editUser(user)"
                @view="viewUserDetails(user)"
                @reset-password="resetPassword(user)"
                @toggle-status="toggleUserStatus(user)"
              />
            </div>
          </div>
          <dl class="grid grid-cols-2 gap-2 px-4 py-3 text-sm">
            <div class="rounded-lg bg-gray-50 px-3 py-2">
              <dt class="text-xs font-medium text-gray-500">{{ $t('userManagement.mobile') }}</dt>
              <dd class="mt-0.5 font-medium text-gray-900">{{ user.mobile || '—' }}</dd>
            </div>
            <div class="rounded-lg bg-gray-50 px-3 py-2">
              <dt class="text-xs font-medium text-gray-500">{{ $t('userManagement.lastLogin') }}</dt>
              <dd class="mt-0.5 text-sm font-medium text-gray-800">{{ formatDate(user.lastLogin) }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <!-- Pagination -->
      <div class="mt-6 border-t border-gray-200 pt-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-gray-600">
            {{ $t('common.paginationShowing', { from: paginationFrom, to: paginationTo, total: filteredUsers.length }) }}
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <label class="inline-flex items-center gap-2 text-sm text-gray-600">
              <span class="whitespace-nowrap">{{ $t('common.perPage') }}</span>
              <select
                v-model.number="pageSize"
                class="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
              </select>
            </label>
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage <= 1"
              @click="goToPreviousPage"
            >
              {{ $t('common.previous') }}
            </button>
            <span class="text-sm text-gray-600 whitespace-nowrap">
              {{ $t('common.pageOf', { current: currentPage, total: totalPages }) }}
            </span>
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage >= totalPages"
              @click="goToNextPage"
            >
              {{ $t('common.next') }}
            </button>
          </div>
        </div>
      </div>
      </template>
          </template>
        </div>
      </div>

    <!-- Add/Edit User Modal -->
    <UserModal
      v-if="showAddModal || showEditModal"
      :show="showAddModal || showEditModal"
      :user="editingUser"
      @close="closeModal"
      @save="saveUser"
    />

    <!-- User Details Modal -->
    <UserDetailsModal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :user="selectedUser"
      :available-roles="availableRoles"
      @close="showDetailsModal = false"
    />

    <!-- Progress Dialog -->
    <ProgressDialog
      :show="showProgressDialog"
      :state="progressState"
      :title="progressTitle"
      :message="progressMessage"
      :success-title="successTitle"
      :success-message="successMessage"
      :error-title="errorTitle"
      :error-message="errorMessage"
      :auto-close="true"
      :auto-close-delay="2500"
      @close="showProgressDialog = false"
    />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import UserModal from '@/components/UserModal.vue'
import UserDetailsModal from '@/components/UserDetailsModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import UserActionsDropdown from '@/components/UserActionsDropdown.vue'
import { userService } from '@/services'
import type { UserType } from '@/services'

const { locale, t: $t } = useI18n()

// Reactive data
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const dateFilter = ref('all')
const { viewMode, isCards } = useListViewMode()
const activeUserDropdown = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 20, 50]
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const editingUser = ref(null)
const selectedUser = ref(null)
const loading = ref(false)
const error = ref('')
// Progress Dialog state
const showProgressDialog = ref(false)
const progressState = ref<'loading' | 'success' | 'error'>('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const successTitle = ref('')
const successMessage = ref('')
const errorTitle = ref('')
const errorMessage = ref('')

const availableRoles = ref([
  { id: 'admin', name: 'مدير النظام', color: 'bg-primary-100 text-primary-800' },
  { id: 'teacher', name: 'معلم', color: 'bg-green-100 text-green-800' },
  { id: 'parent', name: 'ولي أمر', color: 'bg-blue-100 text-blue-800' },
  { id: 'student', name: 'طالب', color: 'bg-yellow-100 text-yellow-800' },
])

// Users data from API
const users = ref<UserType[]>([])

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(user =>
      user.fullName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.mobile?.includes(searchQuery.value)
    )
  }

  // Filter by role
  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.roles?.includes(roleFilter.value))
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  // Filter by date (simplified for demo)
  if (dateFilter.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter(user => {
      const userDate = new Date(user.createdAt)

      switch (dateFilter.value) {
        case 'today':
          return userDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return userDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return userDate >= monthAgo
        default:
          return true
      }
    })
  }

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / pageSize.value))
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

const paginationFrom = computed(() => {
  if (filteredUsers.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationTo = computed(() =>
  Math.min(currentPage.value * pageSize.value, filteredUsers.value.length)
)

watch([searchQuery, roleFilter, statusFilter, dateFilter, pageSize], () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = ''
    users.value = await userService.getAllUsers()
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch users'
    console.error('Failed to fetch users:', err)
    // Don't try to show users if fetch failed
    users.value = []
  } finally {
    loading.value = false
  }
}

const toggleUserDropdown = (userId: string) => {
  activeUserDropdown.value = activeUserDropdown.value === userId ? null : userId
}

const userInitials = (user: UserType) => {
  const name = user.fullName?.trim()
  if (!name) return 'U'
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const getRoleName = (roleId: string) => {
  const role = availableRoles.value.find(r => r.id === roleId)
  return role ? role.name : roleId
}

const getRoleColor = (roleId: string) => {
  const role = availableRoles.value.find(r => r.id === roleId)
  return role ? role.color : 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US')
}

const editUser = (user: any) => {
  editingUser.value = { ...user }
  showEditModal.value = true
  activeUserDropdown.value = null
}

const resetPassword = async (user: any) => {
  activeUserDropdown.value = null
  // Show loading dialog
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = $t('userManagement.resettingPassword')
  progressMessage.value = $t('userManagement.resettingPasswordMessage')
  
  try {
    const newPassword = 'Oomani@123'
    await userService.updatePassword(user.id, newPassword)
    
    // Show success state
    progressState.value = 'success'
    successTitle.value = $t('userManagement.passwordResetSuccess')
    successMessage.value = $t('userManagement.passwordResetMessage', { password: newPassword })
  } catch (err: any) {
    // Show error state
    progressState.value = 'error'
    errorTitle.value = $t('common.error')
    errorMessage.value = err.message || $t('userManagement.resetPasswordError')
  }
}

const toggleUserStatus = async (user: any) => {
  activeUserDropdown.value = null
  // Show loading dialog
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = user.status === 'active' ? $t('userManagement.deactivatingUser') : $t('userManagement.activatingUser')
  progressMessage.value = user.status === 'active' ? $t('userManagement.deactivatingUserMessage') : $t('userManagement.activatingUserMessage')
  
  try {
    const updatedUser = await userService.toggleUserStatus(user.id)
    const userIndex = users.value.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users.value[userIndex] = updatedUser
    }
    
    // Show success state
    progressState.value = 'success'
    successTitle.value = updatedUser.status === 'active' ? $t('userManagement.userActivatedSuccess') : $t('userManagement.userDeactivatedSuccess')
    successMessage.value = updatedUser.status === 'active' ? $t('userManagement.userActivatedMessage') : $t('userManagement.userDeactivatedMessage')
  } catch (err: any) {
    // Show error state
    progressState.value = 'error'
    errorTitle.value = $t('common.error')
    errorMessage.value = err.message || $t('userManagement.toggleStatusError')
  }
}

const viewUserDetails = (user: any) => {
  selectedUser.value = user
  showDetailsModal.value = true
  activeUserDropdown.value = null
}

const handleClickOutside = (event: Event) => {
  if (activeUserDropdown.value && !(event.target as Element).closest('.relative')) {
    activeUserDropdown.value = null
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingUser.value = null
}

const saveUser = async (userData: any) => {
  // Show loading dialog
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingUser.value ? $t('userManagement.updatingUser') : $t('userManagement.creatingUser')
  progressMessage.value = editingUser.value ? $t('userManagement.updatingUserMessage') : $t('userManagement.creatingUserMessage')
  
  try {
    // Parse fullName into firstName and lastName
    const nameParts = userData.fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''
    
    // Generate username from email if not provided
    const username = userData.email.split('@')[0]
    
    const userType = (userData.userType || 'staff') as 'staff' | 'parent' | 'student'
    const legacyRole =
      userType === 'parent' || userType === 'student'
        ? userType
        : 'teacher'

    if (editingUser.value) {
      // Update existing user
      const updatedUser = await userService.updateUser(editingUser.value!.id, {
        username: username,
        email: userData.email,
        firstName: firstName,
        lastName: lastName,
        role: legacyRole,
        phone: userData.mobile,
        isActive: userData.status === 'active',
        user_type: userType,
        groupIds: userType === 'staff' ? userData.groupIds : undefined,
      })
      const userIndex = users.value.findIndex(u => u.id === editingUser.value!.id)
      if (userIndex !== -1) {
        users.value[userIndex] = updatedUser
      }
      
      // Show success state
      progressState.value = 'success'
      successTitle.value = $t('userManagement.userUpdatedSuccess')
      successMessage.value = $t('userManagement.userUpdatedMessage')
    } else {
      // Add new user
      const newUser = await userService.createUser({
        username: username,
        email: userData.email,
        password: userData.password || 'Oomani@123',
        firstName: firstName,
        lastName: lastName,
        role: legacyRole,
        phone: userData.mobile,
        isActive: userData.status === 'active',
        user_type: userType,
        groupIds: userType === 'staff' ? userData.groupIds : undefined,
      })
      users.value.push(newUser)
      
      // Show success state
      progressState.value = 'success'
      successTitle.value = $t('userManagement.userCreatedSuccess')
      successMessage.value = $t('userManagement.userCreatedMessage')
    }
    closeModal()
  } catch (err: any) {
    // Show error state
    progressState.value = 'error'
    errorTitle.value = $t('common.error')
    errorMessage.value = err.message || $t('userManagement.saveUserError')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchUsers()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

