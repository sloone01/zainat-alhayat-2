<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('roleManagement.title') }}</h1>
            <p class="text-gray-600 mt-1 text-sm">{{ $t('roleManagement.subtitle') }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="openRoleModal()"
              class="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-1.5 rounded-md hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-md text-sm inline-flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('roleManagement.addRole') }}
            </button>
          </div>
        </div>
        <p v-if="loadError" class="mt-2 text-sm text-red-600">{{ loadError }}</p>
        <p v-if="loading" class="mt-2 text-sm text-gray-500">{{ $t('common.loading') || 'Loading…' }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="role in filteredRoles"
          :key="role.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                :style="{ backgroundColor: role.color || '#0f766e' }"
              >
                {{ roleTitle(role).charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ roleTitle(role) }}</h3>
                <p class="text-sm text-gray-500">{{ role.description || '—' }}</p>
                <p v-if="role.isSystem" class="text-xs text-amber-600 mt-0.5">System</p>
              </div>
            </div>

            <div class="relative">
              <button
                @click.stop="toggleDropdown(role.id)"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                </svg>
              </button>
              <div
                v-if="activeDropdown === role.id"
                class="absolute end-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
              >
                <button
                  @click="openRoleModal(role)"
                  class="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {{ $t('common.edit') }}
                </button>
                <button
                  @click="openPermissionsModal(role)"
                  class="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {{ $t('roleManagement.managePermissions') }}
                </button>
                <button
                  @click="cloneRole(role)"
                  class="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Clone
                </button>
                <hr class="my-1" />
                <button
                  @click="deleteRole(role)"
                  class="w-full text-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40"
                  :disabled="role.isSystem"
                >
                  {{ $t('common.delete') }}
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ role.memberCount ?? 0 }}</div>
              <div class="text-sm text-gray-500">{{ $t('roleManagement.users') }}</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ getPermissionCount(role) }}</div>
              <div class="text-sm text-gray-500">{{ $t('roleManagement.permissions') }}</div>
            </div>
          </div>

          <div class="flex flex-wrap gap-1">
            <span
              v-for="pageKey in getTopPermissions(role)"
              :key="pageKey"
              class="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
            >
              {{ pageTitle(pageKey) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <RoleModal
      v-if="showRoleModal"
      :role="selectedRole"
      @close="closeRoleModal"
      @save="saveRole"
    />

    <PermissionsModal
      v-if="showPermissionsModal && selectedRole"
      :role="selectedRole"
      :pages="permissionPages"
      :claims="actionCodes"
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
import {
  rbacService,
  type RbacGroup,
  type RbacPageCatalog,
} from '@/services/rbac.service'
import { authService } from '@/services'

const { locale, t, te } = useI18n()

const loading = ref(false)
const loadError = ref('')
const activeDropdown = ref<string | null>(null)
const showRoleModal = ref(false)
const showPermissionsModal = ref(false)
const selectedRole = ref<RbacGroup | null>(null)
const roles = ref<RbacGroup[]>([])
const catalogPages = ref<RbacPageCatalog[]>([])
const actionCodes = ref<string[]>([])

const isRTL = computed(() => locale.value === 'ar')

const permissionPages = computed(() =>
  catalogPages.value.map((p) => ({
    id: p.key,
    route: p.route,
    allowedActions: p.allowedActions,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
  })),
)

const filteredRoles = computed(() => roles.value)

function roleTitle(role: RbacGroup) {
  return role.name
}

function pageTitle(pageKey: string) {
  const p = catalogPages.value.find((x) => x.key === pageKey)
  if (p) return isRTL.value ? p.nameAr : p.nameEn
  const key = `roleManagement.pages.${pageKey}`
  return te(key) ? t(key) : pageKey
}

function getPermissionCount(role: RbacGroup) {
  let count = 0
  Object.values(role.permissions || {}).forEach((actions) => {
    count += actions.length
  })
  return count
}

function getTopPermissions(role: RbacGroup) {
  return Object.keys(role.permissions || {}).slice(0, 3)
}

async function loadAll() {
  loading.value = true
  loadError.value = ''
  try {
    const user = authService.getStoredUser()
    const schoolId = user?.isSuperAdmin || user?.isSystemUser ? null : user?.school_id

    const [catalog, groups] = await Promise.all([
      rbacService.getCatalog(),
      rbacService.listGroups(schoolId ?? undefined),
    ])
    catalogPages.value = catalog.pages
    actionCodes.value = catalog.actions.map((a) => a.code)

    const detailed = await Promise.all(
      groups.map(async (g) => {
        try {
          return await rbacService.getGroup(g.id)
        } catch {
          return { ...g, permissions: {}, memberCount: 0 }
        }
      }),
    )
    roles.value = detailed
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load user groups'
  } finally {
    loading.value = false
  }
}

function toggleDropdown(roleId: string) {
  activeDropdown.value = activeDropdown.value === roleId ? null : roleId
}

function openRoleModal(role?: RbacGroup) {
  selectedRole.value = role || null
  showRoleModal.value = true
  activeDropdown.value = null
}

function closeRoleModal() {
  showRoleModal.value = false
  selectedRole.value = null
}

async function openPermissionsModal(role: RbacGroup) {
  activeDropdown.value = null
  try {
    selectedRole.value = await rbacService.getGroup(role.id)
    showPermissionsModal.value = true
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load permissions'
  }
}

function closePermissionsModal() {
  showPermissionsModal.value = false
  selectedRole.value = null
}

async function saveRole(roleData: { name: string; description?: string; color?: string }) {
  try {
    const user = authService.getStoredUser()
    if (selectedRole.value?.id) {
      await rbacService.updateGroup(selectedRole.value.id, roleData)
    } else {
      await rbacService.createGroup({
        ...roleData,
        schoolId: user?.isSuperAdmin || user?.isSystemUser ? null : user?.school_id,
      })
    }
    closeRoleModal()
    await loadAll()
  } catch (e: any) {
    alert(e?.message || 'Save failed')
  }
}

async function savePermissions(permissions: Record<string, string[]>) {
  if (!selectedRole.value?.id) return
  try {
    const payload = Object.entries(permissions).map(([pageKey, actions]) => ({
      pageKey,
      actions,
    }))
    await rbacService.setPermissions(selectedRole.value.id, payload)
    closePermissionsModal()
    await loadAll()
  } catch (e: any) {
    alert(e?.message || 'Failed to save permissions')
  }
}

async function cloneRole(role: RbacGroup) {
  activeDropdown.value = null
  try {
    await rbacService.cloneGroup(role.id, { name: `${role.name} (copy)` })
    await loadAll()
  } catch (e: any) {
    alert(e?.message || 'Clone failed')
  }
}

async function deleteRole(role: RbacGroup) {
  activeDropdown.value = null
  if (role.isSystem) return
  if (!confirm(t('roleManagement.confirmDelete', { name: role.name }))) return
  try {
    await rbacService.deleteGroup(role.id)
    await loadAll()
  } catch (e: any) {
    alert(e?.message || 'Delete failed')
  }
}

onMounted(() => {
  loadAll()
  document.addEventListener('click', () => {
    activeDropdown.value = null
  })
})
</script>
