<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('roleManagement.title') }}</h1>
            <p class="text-gray-600 mt-1 text-sm">{{ $t('roleManagement.description') }}</p>
          </div>
          <button
            @click="openRoleModal()"
            class="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-1.5 rounded-md hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('roleManagement.addRole') }}
          </button>
        </div>
      </div>

      <!-- Roles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="role in filteredRoles"
          :key="role.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
        >
          <!-- Role Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                   :style="{ backgroundColor: role.color }">
                {{ role.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ role.name }}</h3>
                <p class="text-sm text-gray-500">{{ role.description }}</p>
              </div>
            </div>

            <!-- Actions Dropdown -->
            <div class="relative">
              <button
                @click="toggleDropdown(role.id)"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                </svg>
              </button>

              <div v-if="activeDropdown === role.id" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  @click="openRoleModal(role)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {{ $t('common.edit') }}
                </button>
                <button
                  @click="openPermissionsModal(role)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {{ $t('roleManagement.managePermissions') }}
                </button>
                <hr class="my-1">
                <button
                  @click="deleteRole(role)"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  :disabled="role.isSystem"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {{ $t('common.delete') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Role Stats -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ role.userCount || 0 }}</div>
              <div class="text-sm text-gray-500">{{ $t('roleManagement.users') }}</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ getPermissionCount(role) }}</div>
              <div class="text-sm text-gray-500">{{ $t('roleManagement.permissions') }}</div>
            </div>
          </div>

          <!-- Quick Permissions Preview -->
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700">{{ $t('roleManagement.keyPermissions') }}</h4>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="permission in getTopPermissions(role)"
                :key="permission"
                class="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {{ permission }}
              </span>
              <span
                v-if="getPermissionCount(role) > 3"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                +{{ getPermissionCount(role) - 3 }} {{ $t('common.more') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRoles.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('roleManagement.noRoles') }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ $t('roleManagement.noRolesDescription') }}</p>
        <div class="mt-6">
          <button
            @click="openRoleModal()"
            class="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all duration-200"
          >
            {{ $t('roleManagement.createFirstRole') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Role Modal -->
    <RoleModal
      v-if="showRoleModal"
      :role="selectedRole"
      @close="closeRoleModal"
      @save="saveRole"
    />

    <!-- Permissions Modal -->
    <PermissionsModal
      v-if="showPermissionsModal"
      :role="selectedRole"
      :pages="systemPages"
      :claims="systemClaims"
      @close="closePermissionsModal"
      @save="savePermissions"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import RoleModal from '@/components/RoleModal.vue'
import PermissionsModal from '@/components/PermissionsModal.vue'

const { locale } = useI18n()

// Reactive data
const searchQuery = ref('')
const activeDropdown = ref<string | null>(null)
const showRoleModal = ref(false)
const showPermissionsModal = ref(false)
const selectedRole = ref<any>(null)

// System configuration
const systemClaims = ref(['Read', 'Write', 'View', 'Search'])
const systemPages = ref([
  { id: 'dashboard', name: 'Dashboard', route: '/dashboard' },
  { id: 'users', name: 'User Management', route: '/users' },
  { id: 'roles', name: 'Role Management', route: '/roles' },
  { id: 'settings', name: 'Settings', route: '/settings' },
  { id: 'groups', name: 'Group Management', route: '/groups' },
  { id: 'students', name: 'Student Management', route: '/students' },
  { id: 'teachers', name: 'Teacher Management', route: '/teachers' },
  { id: 'parents', name: 'Parent Management', route: '/parents' },
  { id: 'activities', name: 'Activity Management', route: '/activities' },
  { id: 'reports', name: 'Reports', route: '/reports' }
])

// Sample roles data
const roles = ref([
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access with all permissions',
    color: '#8b5cf6',
    isSystem: true,
    userCount: 2,
    permissions: {
      dashboard: ['Read', 'Write', 'View', 'Search'],
      users: ['Read', 'Write', 'View', 'Search'],
      roles: ['Read', 'Write', 'View', 'Search'],
      settings: ['Read', 'Write', 'View', 'Search'],
      groups: ['Read', 'Write', 'View', 'Search'],
      students: ['Read', 'Write', 'View', 'Search'],
      teachers: ['Read', 'Write', 'View', 'Search'],
      parents: ['Read', 'Write', 'View', 'Search'],
      activities: ['Read', 'Write', 'View', 'Search'],
      reports: ['Read', 'View', 'Search']
    }
  },
  {
    id: '2',
    name: 'Teacher',
    description: 'Access to student and activity management',
    color: '#10b981',
    isSystem: false,
    userCount: 15,
    permissions: {
      dashboard: ['Read', 'View'],
      students: ['Read', 'Write', 'View', 'Search'],
      activities: ['Read', 'Write', 'View', 'Search'],
      groups: ['Read', 'View', 'Search'],
      reports: ['Read', 'View']
    }
  },
  {
    id: '3',
    name: 'Parent',
    description: 'Limited access to view child information',
    color: '#f59e0b',
    isSystem: false,
    userCount: 45,
    permissions: {
      dashboard: ['Read', 'View'],
      students: ['Read', 'View'],
      activities: ['Read', 'View'],
      reports: ['Read', 'View']
    }
  }
])

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value
  return roles.value.filter(role =>
    role.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const toggleDropdown = (roleId: string) => {
  activeDropdown.value = activeDropdown.value === roleId ? null : roleId
}

const openRoleModal = (role?: any) => {
  selectedRole.value = role || null
  showRoleModal.value = true
  activeDropdown.value = null
}

const closeRoleModal = () => {
  showRoleModal.value = false
  selectedRole.value = null
}

const openPermissionsModal = (role: any) => {
  selectedRole.value = role
  showPermissionsModal.value = true
  activeDropdown.value = null
}

const closePermissionsModal = () => {
  showPermissionsModal.value = false
  selectedRole.value = null
}

const saveRole = (roleData: any) => {
  if (selectedRole.value) {
    // Update existing role
    const index = roles.value.findIndex(r => r.id === selectedRole.value.id)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...roleData }
    }
  } else {
    // Create new role
    const newRole = {
      id: Date.now().toString(),
      ...roleData,
      userCount: 0,
      permissions: {}
    }
    roles.value.push(newRole)
  }
  closeRoleModal()
}

const savePermissions = (permissions: any) => {
  if (selectedRole.value) {
    const index = roles.value.findIndex(r => r.id === selectedRole.value.id)
    if (index !== -1) {
      roles.value[index].permissions = permissions
    }
  }
  closePermissionsModal()
}

const deleteRole = (role: any) => {
  if (role.isSystem) return

  if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index !== -1) {
      roles.value.splice(index, 1)
    }
  }
  activeDropdown.value = null
}

const getPermissionCount = (role: any) => {
  let count = 0
  Object.values(role.permissions || {}).forEach((claims: any) => {
    count += claims.length
  })
  return count
}

const getTopPermissions = (role: any) => {
  const permissions: string[] = []
  Object.entries(role.permissions || {}).forEach(([page, claims]: [string, any]) => {
    if (claims.length > 0) {
      permissions.push(page)
    }
  })
  return permissions.slice(0, 3)
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', () => {
    activeDropdown.value = null
  })
})
</script>

