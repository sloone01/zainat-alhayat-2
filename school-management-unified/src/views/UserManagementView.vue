<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
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
        <header class="border-b border-fikr-hairline">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ listHeading }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ listCountLabel }}
            </p>
          </div>
          <div class="flex min-w-0 shrink-0 flex-nowrap items-center gap-2">
              <input
                id="users-search-inline"
                v-model="searchQuery"
                type="search"
                class="fk-field fk-field--sm w-40 sm:w-56"
                :placeholder="$t('userManagement.searchPlaceholder')"
                :aria-label="$t('common.search')"
              >
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
                :aria-label="addButtonLabel"
                @click="onAdd"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
          </div>
          </div>
          <div
            v-if="!isStaffMode"
            class="border-t border-gray-100 px-5 py-2.5 sm:px-6"
          >
            <div
              class="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm"
              role="tablist"
              :aria-label="$t('userManagement.userTypeTabsLabel')"
            >
              <button
                type="button"
                role="tab"
                class="rounded-md px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                :class="audienceTab === 'parent'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                :aria-selected="audienceTab === 'parent'"
                @click="audienceTab = 'parent'"
              >
                {{ $t('userManagement.userTypes.parent') }}
              </button>
              <button
                type="button"
                role="tab"
                class="rounded-md px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                :class="audienceTab === 'student'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                :aria-selected="audienceTab === 'student'"
                @click="audienceTab = 'student'"
              >
                {{ $t('userManagement.userTypes.student') }}
              </button>
            </div>
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
        <h3 class="mt-2 text-sm font-medium text-fikr-ink">
          {{ isStaffMode ? $t('userManagement.noEmployees') : audienceTab === 'student' ? $t('userManagement.noStudents') : $t('userManagement.noParents') }}
        </h3>
        <p class="mt-1 text-sm text-fikr-ink-soft">
          {{ isStaffMode ? $t('userManagement.noEmployeesDescription') : audienceTab === 'student' ? $t('userManagement.noStudentsDescription') : $t('userManagement.noParentsDescription') }}
        </p>
        <button
          type="button"
          class="fk-btn fk-btn--primary mt-4"
          @click="onAdd"
        >
          {{ isStaffMode ? $t('userManagement.addEmployee') : addButtonLabel }}
        </button>
      </div>

      <template v-else>
      <!-- Table View -->
      <div v-if="!isCards" class="fk-table-wrap overflow-visible">
        <table class="fk-table w-full table-fixed">
          <thead>
            <tr>
              <th class="w-[36%]">
                {{ $t('userManagement.user') }}
              </th>
              <th class="hidden w-[16%] xl:table-cell">
                {{ $t('userManagement.contact') }}
              </th>
              <th class="w-[14%]">
                {{ $t('userManagement.roles') }}
              </th>
              <th class="w-[12%]">
                {{ $t('userManagement.status') }}
              </th>
              <th class="w-[16%]">
                {{ $t('userManagement.lastLogin') }}
              </th>
              <th class="w-14 text-end">
                {{ $t('userManagement.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-fikr-pearl">
              <td class="min-w-0">
                <div class="flex min-w-0 items-center">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                    {{ userInitials(user) }}
                  </div>
                  <div class="ms-3 min-w-0">
                    <div class="truncate text-sm font-medium text-fikr-ink">{{ user.fullName }}</div>
                    <div class="truncate text-sm text-fikr-ink-soft" dir="ltr">{{ user.email }}</div>
                    <div
                      v-if="user.mobile"
                      class="truncate text-xs text-fikr-ink-soft xl:hidden"
                      dir="ltr"
                    >
                      {{ user.mobile }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="hidden min-w-0 xl:table-cell">
                <div class="truncate text-sm text-fikr-ink" dir="ltr">{{ user.mobile || '—' }}</div>
              </td>

              <td class="min-w-0">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="roleId in user.roles"
                    :key="roleId"
                    class="inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :class="getRolePillClass(roleId)"
                  >
                    {{ getRoleName(roleId) }}
                  </span>
                </div>
              </td>

              <td class="whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  :class="user.status === 'active'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'"
                >
                  {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                </span>
              </td>

              <td class="min-w-0 text-sm text-fikr-ink-soft">
                <div v-if="formatLoginDate(user.lastLogin)" class="leading-snug">
                  <div class="tabular-nums">{{ formatLoginDate(user.lastLogin) }}</div>
                  <div class="tabular-nums text-xs text-gray-500">
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
                  <RowActionsItem icon="reset" @click="onResetPassword(user)">
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
      <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="user in paginatedUsers"
          :key="'user-card-' + user.id"
          class="relative rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-colors hover:border-primary-200"
        >
          <div class="flex items-start gap-2.5">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
              {{ userInitials(user) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-gray-900">{{ user.fullName }}</h3>
                  <p class="truncate text-xs text-gray-500">{{ user.email }}</p>
                  <span
                    class="mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :class="user.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'"
                  >
                    {{ user.status === 'active' ? $t('userManagement.active') : $t('userManagement.inactive') }}
                  </span>
                  <div v-if="user.roles?.length" class="mt-1.5 flex flex-wrap gap-1">
                    <span
                      v-for="roleId in user.roles"
                      :key="roleId"
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      :class="getRolePillClass(roleId)"
                    >
                      {{ getRoleName(roleId) }}
                    </span>
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
                  <RowActionsItem icon="reset" @click="onResetPassword(user)">
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
            </div>
          </div>
          <dl class="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 text-xs sm:grid-cols-2">
            <div class="min-w-0">
              <dt class="text-gray-400">{{ $t('userManagement.mobile') }}</dt>
              <dd class="truncate font-medium text-gray-800">{{ user.mobile || '—' }}</dd>
            </div>
            <div class="min-w-0">
              <dt class="text-gray-400">{{ $t('userManagement.lastLogin') }}</dt>
              <dd class="font-medium text-gray-800">
                <template v-if="formatLoginDate(user.lastLogin)">
                  <span class="block truncate">{{ formatLoginDate(user.lastLogin) }}</span>
                  <span class="block tabular-nums text-gray-500">{{ formatLoginTime(user.lastLogin) }}</span>
                </template>
                <template v-else>—</template>
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <FikrPagination
        :page="currentPage"
        :pages="totalPages"
        :show="filteredUsers.length > 0"
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
            <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
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
import FikrPagination from '@/components/FikrPagination.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useClientPagination } from '@/composables/useClientPagination'
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

const audienceTab = computed({
  get(): 'parent' | 'student' {
    return route.query.kind === 'student' ? 'student' : 'parent'
  },
  set(kind: 'parent' | 'student') {
    void router.replace({ query: { ...route.query, kind } })
  },
})

const pageTitle = computed(() =>
  isStaffMode.value ? $t('userManagement.employeesTitle') : $t('userManagement.parentsTitle'),
)

const pageSubtitle = computed(() =>
  isStaffMode.value ? $t('userManagement.employeesSubtitle') : $t('userManagement.parentsSubtitle'),
)

const listHeading = computed(() => {
  if (isStaffMode.value) return $t('userManagement.employeesListHeading')
  return audienceTab.value === 'student'
    ? $t('userManagement.studentsListHeading')
    : $t('userManagement.parentsListHeading')
})

const addButtonLabel = computed(() => {
  if (isStaffMode.value) return $t('userManagement.addEmployee')
  return audienceTab.value === 'student'
    ? $t('userManagement.addStudent')
    : $t('userManagement.addParent')
})

function onAdd() {
  if (isStaffMode.value) {
    void router.push({ name: 'employee-create' })
    return
  }
  void router.push({ name: 'user-create', query: { type: audienceTab.value } })
}

const listCountLabel = computed(() => {
  const count = filteredUsers.value.length
  if (isStaffMode.value) return $t('userManagement.employeesCount', { count })
  return audienceTab.value === 'student'
    ? $t('userManagement.studentsCount', { count })
    : $t('userManagement.parentsCount', { count })
})

const STAFF_ROLES = new Set(['admin', 'teacher'])

function isStaffUser(user: UserType): boolean {
  if (user.user_type === 'platform') return false
  const roles = Array.isArray(user.roles) ? user.roles : [user.role]
  if (roles.some((r) => STAFF_ROLES.has(r))) return true
  return user.user_type === 'staff'
}

function digitsOnly(value?: string | null): string {
  return (value ?? '').replace(/\D/g, '')
}

function userMatchesSearch(user: UserType, raw: string): boolean {
  const q = raw.trim().toLowerCase()
  if (!q) return true
  const textHaystack = [
    user.fullName,
    user.firstName,
    user.lastName,
    user.first_name_ar,
    user.first_name_en,
    user.last_name_ar,
    user.last_name_en,
    user.email,
    user.username,
    user.mobile,
    user.phone,
    user.civil_id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  if (textHaystack.includes(q)) return true
  const qDigits = digitsOnly(q)
  if (qDigits.length >= 3) {
    const phoneDigits = digitsOnly(user.mobile || user.phone)
    const civilDigits = digitsOnly(user.civil_id)
    if (phoneDigits.includes(qDigits) || civilDigits.includes(qDigits)) return true
  }
  return false
}

function isNonStaffUser(user: UserType): boolean {
  if (isStaffUser(user)) return false
  if (user.user_type === 'parent' || user.user_type === 'student') return true
  const roles = Array.isArray(user.roles) ? user.roles : [user.role]
  return roles.some((r) => r === 'parent' || r === 'student')
}

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
const loading = ref(false)
const error = ref('')
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
    { id: 'admin', name: 'مدير النظام', pillClass: 'bg-primary-50 text-primary-800' },
    { id: 'teacher', name: 'معلم', pillClass: 'bg-teal-50 text-teal-800' },
    { id: 'parent', name: 'ولي أمر', pillClass: 'bg-emerald-50 text-emerald-800' },
    { id: 'student', name: 'طالب', pillClass: 'bg-amber-50 text-amber-800' },
  ]
  if (isStaffMode.value) {
    return all.filter((r) => STAFF_ROLES.has(r.id))
  }
  return all.filter((r) => r.id === 'parent' || r.id === 'student')
})

const users = ref<UserType[]>([])

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

const audienceUsers = computed(() => {
  if (isStaffMode.value) {
    return users.value.filter(isStaffUser)
  }
  return users.value.filter((user) => isNonStaffUser(user) && accountKind(user) === audienceTab.value)
})

const filteredUsers = computed(() => {
  let filtered = audienceUsers.value

  if (searchQuery.value.trim()) {
    filtered = filtered.filter((user) => userMatchesSearch(user, searchQuery.value))
  }

  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.roles?.includes(roleFilter.value))
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  if (dateFilter.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter(user => {
      const userDate = new Date(user.createdAt)

      switch (dateFilter.value) {
        case 'today':
          return userDate >= today
        case 'week': {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return userDate >= weekAgo
        }
        case 'month': {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return userDate >= monthAgo
        }
        default:
          return true
      }
    })
  }

  return filtered
})

const {
  currentPage,
  paginatedItems: paginatedUsers,
  totalPages,
  goToPage,
} = useClientPagination(filteredUsers)

watch([searchQuery, roleFilter, statusFilter, dateFilter], () => {
  currentPage.value = 1
})

const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = ''
    users.value = await userService.getAllUsers(
      isStaffMode.value ? 'staff' : audienceTab.value,
    )
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch users'
    console.error('Failed to fetch users:', err)
    users.value = []
  } finally {
    loading.value = false
  }
}

watch([isStaffMode, audienceTab], () => {
  currentPage.value = 1
  void fetchUsers()
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
  return role?.pillClass ?? 'bg-gray-100 text-gray-700'
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
    const userIndex = users.value.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users.value[userIndex] = updatedUser
    }
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
      const updatedUser = await userService.updateUser(editingUser.value.id, {
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
      const userIndex = users.value.findIndex(u => u.id === editingUser.value!.id)
      if (userIndex !== -1) {
        users.value[userIndex] = updatedUser
      }
      progressState.value = 'success'
      successTitle.value = $t('userManagement.userUpdatedSuccess')
      successMessage.value = $t('userManagement.userUpdatedMessage')
    } else {
      const newUser = await userService.createUser({
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
      users.value.push(newUser)
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
