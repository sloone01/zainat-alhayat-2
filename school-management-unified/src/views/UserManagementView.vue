<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <div v-if="error" class="fk-elev mb-4">
        <div class="flex flex-col items-center justify-center px-4 py-8 text-center">
          <p class="text-sm font-semibold text-navy-800">{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="fetchUsers">
            {{ $t('userManagement.tryAgain') }}
          </button>
        </div>
      </div>

      <div class="fk-elev p-0">
        <header class="border-b border-fikr-hairline">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ listHeading }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ listCountLabel }}
            </p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <FikrToolbarSearch
                v-model="searchQuery"
                id="users-search-inline"
                :placeholder="$t('userManagement.searchPlaceholder')"
                :aria-label="$t('common.search')"
              />
              <FikrFilterButton
                :expanded="showFilters"
                :count="hasActiveFilters ? 1 : 0"
                @click="showFilters = true"
              />
              <ListViewModeToggle v-model="viewMode" />
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="addButtonLabel"
                @click="onAdd"
              >
                <IconPlus />
              </button>
          </div>
          </div>
        </header>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <FikrLoader size="sm" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else>
      <!-- Empty State -->
      <div v-if="users.length === 0" class="fk-empty">
        <svg class="mx-auto h-12 w-12 text-fikr-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-navy-800">
          {{ isStaffMode ? $t('userManagement.noEmployees') : isStudentAccounts ? $t('userManagement.noStudents') : $t('userManagement.noParents') }}
        </h3>
        <p class="mt-1 text-sm text-fikr-ink-muted">
          {{ isStaffMode ? $t('userManagement.noEmployeesDescription') : isStudentAccounts ? $t('userManagement.noStudentsDescription') : $t('userManagement.noParentsDescription') }}
        </p>
        <button
          type="button"
          class="fk-btn fk-btn--navy mt-4"
          @click="onAdd"
        >
          {{ isStaffMode ? $t('userManagement.addEmployee') : addButtonLabel }}
        </button>
      </div>

      <template v-else>
      <!-- Table View -->
      <div v-if="!isCards" class="overflow-visible">
        <table class="fk-feetable w-full table-fixed">
          <thead>
            <tr>
              <th class="w-10 text-center">#</th>
              <th class="w-[36%]">
                {{ $t('userManagement.user') }}
              </th>
              <th class="hidden w-[20%] xl:table-cell">
                {{ $t('userManagement.contact') }}
              </th>
              <th class="w-[16%]">
                {{ $t('userManagement.status') }}
              </th>
              <th class="w-[20%]">
                {{ $t('userManagement.lastLogin') }}
              </th>
              <th class="w-14 text-end">
                {{ $t('userManagement.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in users" :key="user.id" class="hover:bg-fikr-mist/40">
              <td class="text-center tabular-nums text-sm text-fikr-ink-muted">
                {{ (currentPage - 1) * 10 + index + 1 }}
              </td>
              <td class="min-w-0">
                <div class="flex min-w-0 items-center">
                  <span class="fk-monogram fk-monogram--navy text-xs" aria-hidden="true">
                    {{ userInitials(user) }}
                  </span>
                  <div class="ms-3 min-w-0">
                    <div class="truncate text-sm font-medium text-navy-800">{{ user.fullName }}</div>
                    <div class="truncate text-end text-sm text-fikr-ink-muted" dir="ltr">{{ user.email }}</div>
                    <div
                      v-if="user.mobile"
                      class="truncate text-end text-xs text-fikr-ink-muted xl:hidden"
                      dir="ltr"
                    >
                      {{ user.mobile }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="hidden min-w-0 xl:table-cell">
                <div class="truncate text-end text-sm text-navy-800" dir="ltr">{{ user.mobile || '—' }}</div>
              </td>

              <td class="whitespace-nowrap">
                <span
                  class="fk-pill"
                  :class="user.status === 'active' ? 'fk-pill--teal' : 'fk-pill--mist'"
                >
                  {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                </span>
              </td>

              <td class="min-w-0 text-end text-sm text-fikr-ink-muted">
                <div v-if="formatLoginDate(user.lastLogin)" class="leading-snug">
                  <div class="tabular-nums" dir="ltr">{{ formatLoginDate(user.lastLogin) }}</div>
                  <div class="tabular-nums text-xs text-fikr-ink-soft" dir="ltr">
                    {{ formatLoginTime(user.lastLogin) }}
                  </div>
                </div>
                <span v-else>—</span>
              </td>

              <td class="whitespace-nowrap text-end text-sm font-medium">
                <RowActionsMenu
                  :open="activeMenuId === user.id"
                  placement="up"
                  @toggle="toggleMenu(user.id)"
                >
                  <RowActionsItem icon="view" @click="onViewUser(user)">
                    {{ $t('common.view') }}
                  </RowActionsItem>
                  <RowActionsItem icon="edit" @click="onEditUser(user)">
                    {{ $t('common.edit') }}
                  </RowActionsItem>
                  <RowActionsItem
                    v-if="isStaffMode"
                    icon="group"
                    @click="onEditRole(user)"
                  >
                    {{ $t('userManagement.editRole') }}
                  </RowActionsItem>
                  <RowActionsItem v-if="accountAudience !== 'parent'" icon="reset" @click="onResetPassword(user)">
                    {{ $t('userManagement.resetPassword') }}
                  </RowActionsItem>
                  <RowActionsItem
                    :icon="user.status === 'active' ? 'archive' : 'activate'"
                    @click="onToggleUserStatus(user)"
                  >
                    {{ user.status === 'active' ? $t('userManagement.deactivate') : $t('userManagement.activate') }}
                  </RowActionsItem>
                </RowActionsMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card View -->
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="user in users"
          :key="'user-card-' + user.id"
          class="fk-kcard flex flex-col gap-3 p-5"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-base font-medium text-navy-800"
                aria-hidden="true"
              >
                {{ userInitials(user) }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-base font-medium leading-5 text-navy-800">{{ user.fullName }}</p>
                <p class="truncate text-end text-xs text-fikr-ink-muted" dir="ltr">{{ user.email }}</p>
              </div>
            </div>
            <RowActionsMenu
              :open="activeMenuId === user.id"
              placement="up"
              @toggle="toggleMenu(user.id)"
            >
              <RowActionsItem icon="view" @click="onViewUser(user)">
                {{ $t('common.view') }}
              </RowActionsItem>
              <RowActionsItem icon="edit" @click="onEditUser(user)">
                {{ $t('common.edit') }}
              </RowActionsItem>
              <RowActionsItem
                v-if="isStaffMode"
                icon="group"
                @click="onEditRole(user)"
              >
                {{ $t('userManagement.editRole') }}
              </RowActionsItem>
              <RowActionsItem v-if="accountAudience !== 'parent'" icon="reset" @click="onResetPassword(user)">
                {{ $t('userManagement.resetPassword') }}
              </RowActionsItem>
              <RowActionsItem
                :icon="user.status === 'active' ? 'archive' : 'activate'"
                @click="onToggleUserStatus(user)"
              >
                {{ user.status === 'active' ? $t('userManagement.deactivate') : $t('userManagement.activate') }}
              </RowActionsItem>
            </RowActionsMenu>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <span class="fk-ktag">
              <span
                class="fk-ktag__dot"
                :class="user.status === 'active' ? 'bg-primary-500' : 'bg-fikr-ink-soft'"
              />
              {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
            </span>
          </div>

          <div
            v-if="user.mobile || formatLoginDate(user.lastLogin)"
            class="mt-auto flex flex-col gap-1.5 border-t border-fikr-hairline pt-3"
          >
            <div v-if="user.mobile" class="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-2.5">
              <span class="text-sm text-fikr-ink-muted">{{ $t('userManagement.contact') }}</span>
              <span class="text-sm font-medium tabular-nums text-navy-800" dir="ltr">{{ user.mobile }}</span>
            </div>
            <div v-if="formatLoginDate(user.lastLogin)" class="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-2.5">
              <span class="text-sm text-fikr-ink-muted">{{ $t('userManagement.lastLogin') }}</span>
              <span class="text-end leading-snug" dir="ltr">
                <span class="block text-sm font-medium tabular-nums text-navy-800">{{ formatLoginDate(user.lastLogin) }}</span>
                <span class="block text-xs tabular-nums text-fikr-ink-muted">{{ formatLoginTime(user.lastLogin) }}</span>
              </span>
            </div>
          </div>
        </article>
      </div>

      <FikrPagination
        :page="currentPage"
        :pages="totalPages"
        :show="users.length > 0"
        @update:page="goToPage"
      />
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
        <div class="fk-drawer__body space-y-5">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="users-search">{{ $t('common.search') }}</label>
            <input
              id="users-search"
              v-model="searchQuery"
              type="search"
              :placeholder="$t('userManagement.searchPlaceholder')"
              class="fk-field"
            >
          </div>
          <div v-if="isStaffMode">
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="users-role">{{ $t('userManagement.roles') }}</label>
            <select
              id="users-role"
              v-model="roleFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('userManagement.allRoles') }}</option>
              <option v-for="role in availableRoles" :key="role.id" :value="role.id">{{ role.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="users-status">{{ $t('userManagement.status') }}</label>
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
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="users-date">{{ $t('userManagement.dateFilter') }}</label>
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
            <button type="button" class="fk-btn fk-btn--mist" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--navy" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Add/Edit User Modal -->
    <UserModal
      v-if="showEditModal"
      :show="showEditModal"
      :user="editingUser"
      :locked-user-type="lockedUserType"
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
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import FikrToolbarSearch from '@/components/FikrToolbarSearch.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useServerPagination } from '@/composables/useServerPagination'
import type { UserListParams } from '@/services/user.service'
import UserModal from '@/components/UserModal.vue'
import UserDetailsModal from '@/components/UserDetailsModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { userService, translateUserApiError } from '@/services'
import type { UserType } from '@/services'

const route = useRoute()
const router = useRouter()
const { locale, t: $t } = useI18n()

const isStaffMode = computed(() =>
  route.name === 'employees' || route.meta.audience === 'staff',
)

const isStudentAccounts = computed(() =>
  route.name === 'user-students' || route.meta.audience === 'students',
)

const accountAudience = computed((): 'staff' | 'parent' | 'student' => {
  if (isStaffMode.value) return 'staff'
  return isStudentAccounts.value ? 'student' : 'parent'
})

const pageTitle = computed(() => {
  if (isStaffMode.value) return $t('userManagement.employeesTitle')
  return isStudentAccounts.value ? $t('userManagement.studentsTitle') : $t('userManagement.parentsTitle')
})

const pageSubtitle = computed(() => {
  if (isStaffMode.value) return $t('userManagement.employeesSubtitle')
  return isStudentAccounts.value ? $t('userManagement.studentsSubtitle') : $t('userManagement.parentsSubtitle')
})

const listHeading = computed(() => {
  if (isStaffMode.value) return $t('userManagement.employeesListHeading')
  return isStudentAccounts.value
    ? $t('userManagement.studentsListHeading')
    : $t('userManagement.parentsListHeading')
})

const addButtonLabel = computed(() => {
  if (isStaffMode.value) return $t('userManagement.addEmployee')
  return isStudentAccounts.value
    ? $t('userManagement.addStudent')
    : $t('userManagement.addParent')
})

function onAdd() {
  if (isStaffMode.value) {
    void router.push({ name: 'employee-create' })
    return
  }
  void router.push({ name: 'user-create', query: { type: accountAudience.value } })
}

const listCountLabel = computed(() => {
  const count = totalUsers.value
  if (isStaffMode.value) return $t('userManagement.employeesCount', { count })
  return isStudentAccounts.value
    ? $t('userManagement.studentsCount', { count })
    : $t('userManagement.parentsCount', { count })
})

const STAFF_ROLES = new Set(['admin', 'teacher'])

function accountKind(user: UserType): 'parent' | 'student' {
  if (user.user_type === 'student') return 'student'
  if (user.user_type === 'parent') return 'parent'
  const roles = Array.isArray(user.roles) ? user.roles : [user.role]
  return roles.includes('student') ? 'student' : 'parent'
}

// Reactive data
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const dateFilter = ref('all')
const { viewMode, isCards } = useListViewMode()
const showFilters = ref(false)
const activeMenuId = ref<string | null>(null)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const editingUser = ref<UserType | null>(null)
const selectedUser = ref<UserType | null>(null)
const lockedUserType = computed((): 'staff' | 'parent' | 'student' | undefined => {
  if (isStaffMode.value) return 'staff'
  if (editingUser.value) return accountKind(editingUser.value)
  return undefined
})
const showProgressDialog = ref(false)
const progressState = ref<'loading' | 'success' | 'error'>('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const successTitle = ref('')
const successMessage = ref('')
const errorTitle = ref('')
const errorMessage = ref('')

const availableRoles = computed(() => {
  const all = [
    { id: 'admin', name: 'مدير النظام', pillClass: 'fk-pill--outline' },
    { id: 'teacher', name: 'معلم', pillClass: 'fk-pill--mist' },
    { id: 'parent', name: 'ولي أمر', pillClass: 'fk-pill--mist' },
    { id: 'student', name: 'طالب', pillClass: 'fk-pill--mist' },
  ]
  if (isStaffMode.value) {
    return all.filter((r) => STAFF_ROLES.has(r.id))
  }
  return all.filter((r) => r.id === 'parent' || r.id === 'student')
})

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

// Audience, search, role, status and date filters are applied by the API; `users` is the current page.
const {
  items: users,
  total: totalUsers,
  loading,
  error,
  currentPage,
  totalPages,
  goToPage,
  reload: fetchUsers,
} = useServerPagination<UserType, UserListParams>(
  (params) => userService.listPage(params),
  {
    pageSize: 10,
    filters: () => ({
      audience: accountAudience.value,
      q: searchQuery.value,
      role: roleFilter.value,
      status: statusFilter.value as UserListParams['status'],
      created_within: dateFilter.value as UserListParams['created_within'],
    }),
    debounceKeys: ['q'],
    onError: (err) => console.error('Failed to fetch users:', err),
  },
)

watch([isStaffMode, accountAudience], () => {
  // The same component serves parents, student accounts and employees: start each with clean filters.
  // The audience is part of the list filters, so the change itself triggers the refetch.
  clearFilters()
})

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenu() {
  activeMenuId.value = null
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

const getRoleName = (roleId: string) => {
  const role = availableRoles.value.find(r => r.id === roleId)
  return role ? role.name : roleId
}

const getRolePillClass = (roleId: string) => {
  const role = availableRoles.value.find(r => r.id === roleId)
  return role?.pillClass ?? 'fk-pill--mist'
}

const parseUserDate = (value?: string | Date | null): Date | null => {
  if (value == null || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (dateString?: string | Date | null) => {
  const date = parseUserDate(dateString)
  if (!date) return '-'
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatLoginDate = (dateString?: string | Date | null) => {
  const date = parseUserDate(dateString)
  if (!date) return ''
  // Numeric keeps the last-login column narrow in RTL list layouts.
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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

function onEditUser(user: UserType) {
  editingUser.value = { ...user }
  showEditModal.value = true
  closeMenu()
}

function onEditRole(user: UserType) {
  closeMenu()
  router.push({ name: 'employee-access', params: { userId: user.id } })
}

async function onResetPassword(user: UserType) {
  closeMenu()
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = $t('userManagement.resettingPassword')
  progressMessage.value = $t('userManagement.resettingPasswordMessage')

  try {
    await userService.resetPassword(user.id)
    progressState.value = 'success'
    successTitle.value = $t('userManagement.passwordResetSuccess')
    successMessage.value = $t('userManagement.passwordResetEmailSent')
  } catch (err: any) {
    progressState.value = 'error'
    errorTitle.value = $t('common.error')
    errorMessage.value = err.message || $t('userManagement.resetPasswordError')
  }
}

async function onToggleUserStatus(user: UserType) {
  closeMenu()
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = user.status === 'active' ? $t('userManagement.deactivatingUser') : $t('userManagement.activatingUser')
  progressMessage.value = user.status === 'active' ? $t('userManagement.deactivatingUserMessage') : $t('userManagement.activatingUserMessage')

  try {
    const updatedUser = await userService.toggleUserStatus(user.id)
    await fetchUsers()
    progressState.value = 'success'
    successTitle.value = updatedUser.status === 'active' ? $t('userManagement.userActivatedSuccess') : $t('userManagement.userDeactivatedSuccess')
    successMessage.value = updatedUser.status === 'active' ? $t('userManagement.userActivatedMessage') : $t('userManagement.userDeactivatedMessage')
  } catch (err: any) {
    progressState.value = 'error'
    errorTitle.value = $t('common.error')
    errorMessage.value = err.message || $t('userManagement.toggleStatusError')
  }
}

function onViewUser(user: UserType) {
  selectedUser.value = user
  showDetailsModal.value = true
  closeMenu()
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (activeMenuId.value && !target.closest('.relative')) {
    activeMenuId.value = null
  }
}

const closeModal = () => {
  showEditModal.value = false
  editingUser.value = null
}

const saveUser = async (userData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingUser.value ? $t('userManagement.updatingUser') : $t('userManagement.creatingUser')
  progressMessage.value = editingUser.value ? $t('userManagement.updatingUserMessage') : $t('userManagement.creatingUserMessage')

  try {
    const nameParts = userData.fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''
    const username = userData.email.split('@')[0]

    const userType = (userData.userType || lockedUserType.value || 'staff') as 'staff' | 'parent' | 'student'
    const legacyRole =
      userType === 'parent' || userType === 'student'
        ? userType
        : 'teacher'

    if (editingUser.value) {
      await userService.updateUser(editingUser.value.id, {
        username: username,
        email: userData.email,
        firstName: firstName,
        lastName: lastName,
        role: legacyRole,
        phone: userData.mobile,
        isActive: userData.status === 'active',
        user_type: userType,
        civil_id: userData.civil_id?.trim() || null,
        preferred_language: userData.preferred_language === 'en' ? 'en' : 'ar',
        groupIds: userType === 'staff' ? userData.groupIds : undefined,
      })
      await fetchUsers()
      progressState.value = 'success'
      successTitle.value = $t('userManagement.userUpdatedSuccess')
      successMessage.value = $t('userManagement.userUpdatedMessage')
    } else {
      await userService.createUser({
        username: username,
        email: userData.email,
        firstName: firstName,
        lastName: lastName,
        role: legacyRole,
        phone: userData.mobile,
        isActive: userData.status === 'active',
        user_type: userType,
        civil_id: userData.civil_id?.trim() || undefined,
        preferred_language: userData.preferred_language === 'en' ? 'en' : 'ar',
        groupIds: userType === 'staff' ? userData.groupIds : undefined,
      })
      await fetchUsers()
      progressState.value = 'success'
      successTitle.value = $t('userManagement.userCreatedSuccess')
      successMessage.value = $t('userManagement.userCreatedMessage')
    }
    closeModal()
  } catch (err: unknown) {
    progressState.value = 'error'
    errorTitle.value = $t('common.error')
    errorMessage.value = translateUserApiError(err, $t)
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
