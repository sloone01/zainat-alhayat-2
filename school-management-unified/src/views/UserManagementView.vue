<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('userManagement.title') }}</h1>
            <p class="text-gray-600 mt-1 text-sm">{{ $t('userManagement.description') }}</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="exportUsers"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ $t('userManagement.export') }}
            </button>
            <button
              @click="showAddModal = true"
              class="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('userManagement.addUser') }}
            </button>
          </div>
        </div>
      </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('userManagement.searchPlaceholder')"
            class="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        <!-- Role Filter -->
        <div>
          <select
            v-model="roleFilter"
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
          >
            <option value="all">{{ $t('userManagement.allRoles') }}</option>
            <option v-for="role in availableRoles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            v-model="statusFilter"
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
          >
            <option value="all">{{ $t('userManagement.allStatuses') }}</option>
            <option value="active">{{ $t('userManagement.active') }}</option>
            <option value="inactive">{{ $t('userManagement.inactive') }}</option>
          </select>
        </div>

        <!-- Date Filter -->
        <div>
          <select
            v-model="dateFilter"
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
          >
            <option value="all">{{ $t('userManagement.allDates') }}</option>
            <option value="today">{{ $t('userManagement.today') }}</option>
            <option value="week">{{ $t('userManagement.thisWeek') }}</option>
            <option value="month">{{ $t('userManagement.thisMonth') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-red-800">{{ error }}</span>
        <button @click="fetchUsers" class="ml-4 text-red-600 hover:text-red-800 text-sm underline">
          Try Again
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span class="ml-3 text-gray-600">Loading users...</span>
      </div>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ $t('userManagement.usersList') }}
            <span class="text-sm text-gray-500 ml-2">({{ filteredUsers.length }} {{ $t('userManagement.users') }})</span>
          </h3>
          <div class="flex items-center gap-2">
            <button
              @click="toggleView"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg v-if="viewMode === 'table'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="overflow-x-auto">
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
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <!-- User Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-purple-600">
                        {{ user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2) }}
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
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="relative">
                  <button
                    @click="toggleUserDropdown(user.id)"
                    class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <div
                    v-if="activeUserDropdown === user.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  >
                    <div class="py-1">
                      <button
                        @click="editUser(user)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {{ $t('common.edit') }}
                      </button>
                      <button
                        @click="resetPassword(user)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        {{ $t('userManagement.resetPassword') }}
                      </button>
                      <button
                        @click="toggleUserStatus(user)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                        {{ user.status === 'active' ? $t('userManagement.deactivate') : $t('userManagement.activate') }}
                      </button>
                      <button
                        @click="viewUserDetails(user)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {{ $t('common.view') }}
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card View -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
        >
          <!-- User Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span class="text-lg font-medium text-purple-600">
                  {{ user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2) }}
                </span>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ user.fullName }}</h3>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
            </div>
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
          </div>

          <!-- Contact Info -->
          <div class="mb-4">
            <div class="text-sm text-gray-600 mb-1">{{ $t('userManagement.mobile') }}: {{ user.mobile }}</div>
            <div class="text-sm text-gray-600">{{ $t('userManagement.lastLogin') }}: {{ formatDate(user.lastLogin) }}</div>
          </div>

          <!-- Roles -->
          <div class="mb-4">
            <div class="text-sm font-medium text-gray-700 mb-2">{{ $t('userManagement.roles') }}:</div>
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
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="editUser(user)"
              class="flex-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
            >
              {{ $t('common.edit') }}
            </button>
            <button
              @click="viewUserDetails(user)"
              class="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              {{ $t('common.view') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('userManagement.noUsers') }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ $t('userManagement.noUsersDescription') }}</p>
        <div class="mt-6">
          <button
            @click="showAddModal = true"
            class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('userManagement.createFirstUser') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <UserModal
      v-if="showAddModal || showEditModal"
      :show="showAddModal || showEditModal"
      :user="editingUser"
      :available-roles="availableRoles"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import UserModal from '@/components/UserModal.vue'
import UserDetailsModal from '@/components/UserDetailsModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { userService } from '@/services'
import type { UserType } from '@/services'

const { locale, t: $t } = useI18n()

// Reactive data
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const dateFilter = ref('all')
const viewMode = ref('table')
const activeUserDropdown = ref<string | null>(null)
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

// Available roles (in real app, this would come from role management)
const availableRoles = ref([
  { id: 'admin', name: 'مدير النظام', color: 'bg-purple-100 text-purple-800' },
  { id: 'teacher', name: 'معلم', color: 'bg-green-100 text-green-800' },
  { id: 'parent', name: 'ولي أمر', color: 'bg-blue-100 text-blue-800' },
  { id: 'student', name: 'طالب', color: 'bg-yellow-100 text-yellow-800' }
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
      user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.mobile.includes(searchQuery.value)
    )
  }

  // Filter by role
  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.roles.includes(roleFilter.value))
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

const toggleView = () => {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
}

const toggleUserDropdown = (userId: string) => {
  activeUserDropdown.value = activeUserDropdown.value === userId ? null : userId
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

const exportUsers = () => {
  // In real app, this would export users to CSV/Excel
  alert('Users exported successfully!')
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
    
    // Handle multiple roles by joining them with comma for now
    // TODO: Update backend to support multiple roles properly
    const role = userData.roles && userData.roles.length > 0 ? userData.roles[0] : 'parent'
    const rolesString = userData.roles && userData.roles.length > 0 ? userData.roles.join(',') : 'parent'
    
    if (editingUser.value) {
      // Update existing user
      const updatedUser = await userService.updateUser(editingUser.value.id, {
        username: username,
        email: userData.email,
        firstName: firstName,
        lastName: lastName,
        role: role,
        roles: rolesString,
        phone: userData.mobile,
        isActive: userData.status === 'active'
      })
      const userIndex = users.value.findIndex(u => u.id === editingUser.value.id)
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
        role: role,
        roles: rolesString,
        phone: userData.mobile,
        isActive: userData.status === 'active'
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

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  if (activeUserDropdown.value && !(event.target as Element).closest('.relative')) {
    activeUserDropdown.value = null
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

