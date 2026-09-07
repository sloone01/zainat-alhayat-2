<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('userManagement.title')"
        :subtitle="$t('userManagement.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ error }}</span>
          <button type="button" class="font-semibold text-red-700 underline hover:text-red-900" @click="fetchUsers">
            {{ $t('userManagement.tryAgain') }}
          </button>
        </div>
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('userManagement.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('userManagement.usersCount', { count: filteredUsers.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
              <button
                type="button"
                class="fk-iconbtn"
                :aria-label="$t('common.filter')"
                :aria-expanded="showFilters"
                @click="showFilters = true"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
                </svg>
                <span
                  v-if="hasActiveFilters"
                  class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                  aria-hidden="true"
                />
              </button>
              <ListViewModeToggle v-model="viewMode" />
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="$t('userManagement.addUser')"
                @click="showAddModal = true"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
          </div>
        </header>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <span class="fk-spinner" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else>
      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="fk-empty">
        <svg class="mx-auto h-12 w-12 text-fikr-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-fikr-ink">{{ $t('userManagement.noUsers') }}</h3>
        <p class="mt-1 text-sm text-fikr-ink-soft">{{ $t('userManagement.noUsersDescription') }}</p>
      </div>

      <template v-else>
      <!-- Table View (desktop) -->
      <div v-if="!isCards" class="fk-table-wrap hidden md:block">
        <table class="fk-table">
          <thead>
            <tr>
              <th>
                {{ $t('userManagement.user') }}
              </th>
              <th>
                {{ $t('userManagement.contact') }}
              </th>
              <th>
                {{ $t('userManagement.roles') }}
              </th>
              <th>
                {{ $t('userManagement.status') }}
              </th>
              <th>
                {{ $t('userManagement.lastLogin') }}
              </th>
              <th class="text-end">
                {{ $t('userManagement.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-fikr-pearl">
              <!-- User Info -->
              <td class="whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="fk-monogram fk-monogram--navy">
                      <span>
                        {{ userInitials(user) }}
                      </span>
                    </div>
                  </div>
                  <div class="ms-4">
                    <div class="text-sm font-medium text-fikr-ink">{{ user.fullName }}</div>
                    <div class="text-sm text-fikr-ink-soft">{{ user.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="whitespace-nowrap">
                <div class="text-sm text-fikr-ink">{{ user.mobile }}</div>
                <div class="text-sm text-fikr-ink-soft">{{ user.email }}</div>
              </td>

              <!-- Roles -->
              <td class="whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="roleId in user.roles"
                    :key="roleId"
                    class="fk-chip"
                    :class="getRoleColor(roleId)"
                  >
                    {{ getRoleName(roleId) }}
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="whitespace-nowrap">
                <span
                  class="fk-chip"
                  :class="user.status === 'active' ? 'fk-chip--green' : 'fk-chip--red'"
                >
                  {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                </span>
              </td>

              <!-- Last Login -->
              <td class="whitespace-nowrap text-sm text-fikr-ink-soft">
                {{ formatDate(user.lastLogin) }}
              </td>

              <!-- Actions -->
              <td class="whitespace-nowrap text-end text-sm font-medium">
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
      <div v-if="isCards" class="fk-grid hidden md:grid">
        <article
          v-for="user in paginatedUsers"
          :key="'user-desktop-card-' + user.id"
          class="fk-item"
        >
          <div class="px-4 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div class="fk-monogram fk-monogram--navy">
                  <span>{{ userInitials(user) }}</span>
                </div>
                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold text-fikr-ink">{{ user.fullName }}</h3>
                  <p class="truncate text-sm text-fikr-ink-soft">{{ user.email }}</p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <span
                  class="fk-chip"
                  :class="user.status === 'active' ? 'fk-chip--green' : 'fk-chip--red'"
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
          <dl class="fk-item__stats">
            <div class="min-w-0">
              <dt>{{ $t('userManagement.mobile') }}</dt>
              <dd>{{ user.mobile || '—' }}</dd>
            </div>
            <div class="min-w-0">
              <dt>{{ $t('userManagement.lastLogin') }}</dt>
              <dd>{{ formatDate(user.lastLogin) }}</dd>
            </div>
          </dl>
          <div class="border-t border-fikr-hairline px-4 py-3">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="roleId in user.roles"
                :key="roleId"
                class="fk-chip"
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
          class="fk-item"
        >
          <div class="px-4 py-4">
            <div class="flex items-start gap-3">
              <div class="fk-monogram fk-monogram--navy">
                <span>{{ userInitials(user) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-semibold leading-snug text-fikr-ink">{{ user.fullName }}</h3>
                <p class="mt-0.5 truncate text-sm text-fikr-ink-soft">{{ user.email }}</p>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  <span
                    class="fk-chip"
                    :class="user.status === 'active' ? 'fk-chip--green' : 'fk-chip--red'"
                  >
                    {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                  </span>
                  <span
                    v-for="roleId in user.roles"
                    :key="roleId"
                    class="fk-chip"
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
          <dl class="fk-item__stats">
            <div class="min-w-0">
              <dt>{{ $t('userManagement.mobile') }}</dt>
              <dd>{{ user.mobile || '—' }}</dd>
            </div>
            <div class="min-w-0">
              <dt>{{ $t('userManagement.lastLogin') }}</dt>
              <dd>{{ formatDate(user.lastLogin) }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <!-- Pagination -->
      <div class="mt-6 border-t border-fikr-hairline pt-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-fikr-ink-muted">
            {{ $t('common.paginationShowing', { from: paginationFrom, to: paginationTo, total: filteredUsers.length }) }}
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <label class="inline-flex items-center gap-2 text-sm text-fikr-ink-muted">
              <span class="whitespace-nowrap">{{ $t('common.perPage') }}</span>
              <select
                v-model.number="pageSize"
                class="fk-input w-auto py-1.5"
              >
                <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
              </select>
            </label>
            <button
              type="button"
              class="fk-btn fk-btn--pearl fk-btn--sm"
              :disabled="currentPage <= 1"
              @click="goToPreviousPage"
            >
              {{ $t('common.previous') }}
            </button>
            <span class="text-sm text-fikr-ink-muted whitespace-nowrap">
              {{ $t('common.pageOf', { current: currentPage, total: totalPages }) }}
            </span>
            <button
              type="button"
              class="fk-btn fk-btn--pearl fk-btn--sm"
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

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('userManagement.filtersTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside
        class="fk-drawer"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('userManagement.filtersTitle') }}</h3>
          </div>
          <button
            type="button"
            class="fk-modal__close"
            :aria-label="$t('common.close')"
            @click="showFilters = false"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="fk-drawer__body">
          <div class="fk-form__row">
            <label class="fk-flabel" for="users-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="users-search"
              v-model="searchQuery"
              type="search"
              :placeholder="$t('userManagement.searchPlaceholder')"
              class="fk-field"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="users-role"><span>{{ $t('userManagement.roles') }}</span></label>
            <select
              id="users-role"
              v-model="roleFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('userManagement.allRoles') }}</option>
              <option v-for="role in availableRoles" :key="role.id" :value="role.id">{{ role.name }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="users-status"><span>{{ $t('userManagement.status') }}</span></label>
            <select
              id="users-status"
              v-model="statusFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('userManagement.allStatuses') }}</option>
              <option value="active">{{ $t('userManagement.active') }}</option>
              <option value="inactive">{{ $t('userManagement.inactive') }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="users-date"><span>{{ $t('userManagement.dateFilter') }}</span></label>
            <select
              id="users-date"
              v-model="dateFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('userManagement.allDates') }}</option>
              <option value="today">{{ $t('userManagement.today') }}</option>
              <option value="week">{{ $t('userManagement.thisWeek') }}</option>
              <option value="month">{{ $t('userManagement.thisMonth') }}</option>
            </select>
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
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
import FikrPageHeader from '@/components/FikrPageHeader.vue'
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
const showFilters = ref(false)
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
  { id: 'admin', name: 'مدير النظام', color: 'fk-chip--navy' },
  { id: 'teacher', name: 'معلم', color: 'fk-chip--teal' },
  { id: 'parent', name: 'ولي أمر', color: 'fk-chip--green' },
  { id: 'student', name: 'طالب', color: 'fk-chip--amber' },
])

// Users data from API
const users = ref<UserType[]>([])

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim())
  || roleFilter.value !== 'all'
  || statusFilter.value !== 'all'
  || dateFilter.value !== 'all',
)

function clearFilters() {
  searchQuery.value = ''
  roleFilter.value = 'all'
  statusFilter.value = 'all'
  dateFilter.value = 'all'
}

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
  return role ? role.color : 'fk-chip--neutral'
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

