<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('roleManagement.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('roleManagement.subtitle') }}</p>
        </div>
      </section>

      <div v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        {{ loadError }}
      </div>

      <div class="rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <h2 class="truncate text-lg font-semibold text-gray-900">{{ $t('roleManagement.listHeading') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('roleManagement.rolesCount', { count: filteredRoles.length }) }}
              </p>
            </div>
            <div class="flex shrink-0 flex-nowrap items-center gap-2">
              <button
                type="button"
                class="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                :aria-label="$t('common.filter')"
                :aria-expanded="showFilters"
                @click="showFilters = true"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
                </svg>
                <span
                  v-if="hasActiveFilters"
                  class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-600"
                  aria-hidden="true"
                />
              </button>
              <ListViewModeToggle v-model="viewMode" />
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                :aria-label="$t('roleManagement.addRole')"
                @click="startCreate"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <p
            v-else-if="roles.length && !filteredRoles.length"
            class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
          >
            {{ $t('roleManagement.noRoleFilterResults') }}
          </p>

          <template v-else-if="filteredRoles.length">
            <div v-if="isCards" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="role in filteredRoles"
                :key="role.id"
                class="relative rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-colors hover:border-primary-200"
              >
                <div class="flex items-start gap-2.5">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                    {{ roleInitial(role) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-sm font-semibold text-gray-900">{{ role.name }}</h3>
                        <p class="mt-0.5 truncate font-mono text-[11px] text-gray-400" dir="ltr">{{ role.code || '—' }}</p>
                      </div>
                      <RowActionsMenu
                        :open="activeMenuId === role.id"
                        placement="up"
                        @toggle="toggleMenu(role.id)"
                      >
                        <RowActionsItem icon="view" @click="onViewClaims(role)">
                          {{ $t('roleManagement.viewClaims') }}
                        </RowActionsItem>
                        <RowActionsItem icon="edit" @click="onEdit(role)">
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem icon="clone" @click="onClone(role)">
                          {{ $t('roleManagement.clone') }}
                        </RowActionsItem>
                        <RowActionsItem
                          icon="delete"
                          danger
                          :disabled="role.isSystem"
                          @click="onDelete(role)"
                        >
                          {{ $t('common.delete') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-1.5">
                      <span class="inline-flex rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800">
                        {{ $t(`roleManagement.groupTypes.${role.groupType || 'staff'}`) }}
                      </span>
                      <span
                        v-if="role.isSystem"
                        class="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900"
                      >
                        {{ $t('roleManagement.systemRole') }}
                      </span>
                    </div>
                  </div>
                </div>
                <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('roleManagement.users') }}</dt>
                    <dd class="truncate font-medium text-gray-800">{{ role.memberCount ?? 0 }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('roleManagement.claimsCount') }}</dt>
                    <dd class="truncate font-medium text-gray-800">{{ getClaimCount(role) }}</dd>
                  </div>
                </dl>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('roleManagement.roleName') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('roleManagement.code') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('roleManagement.groupType') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('roleManagement.users') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('roleManagement.claimsCount') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="role in filteredRoles" :key="'list-' + role.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ role.name }}</div>
                      <div class="text-xs text-gray-500 line-clamp-1">{{ role.description || '—' }}</div>
                      <span
                        v-if="role.isSystem"
                        class="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
                      >
                        {{ $t('roleManagement.systemRole') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-mono text-xs text-gray-700" dir="ltr">{{ role.code || '—' }}</td>
                    <td class="px-4 py-3 text-gray-700">{{ $t(`roleManagement.groupTypes.${role.groupType || 'staff'}`) }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-900">{{ role.memberCount ?? 0 }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-900">{{ getClaimCount(role) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === role.id"
                          placement="up"
                          @toggle="toggleMenu(role.id)"
                        >
                          <RowActionsItem icon="view" @click="onViewClaims(role)">
                            {{ $t('roleManagement.viewClaims') }}
                          </RowActionsItem>
                          <RowActionsItem icon="edit" @click="onEdit(role)">
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem icon="clone" @click="onClone(role)">
                            {{ $t('roleManagement.clone') }}
                          </RowActionsItem>
                          <RowActionsItem
                            icon="delete"
                            danger
                            :disabled="role.isSystem"
                            @click="onDelete(role)"
                          >
                            {{ $t('common.delete') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('roleManagement.noRoles') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('roleManagement.filtersTitle')"
    >
      <div class="absolute inset-0 bg-gray-900/40" @click="showFilters = false" />
      <aside
        class="absolute inset-y-0 end-0 flex w-full max-w-sm flex-col bg-white shadow-xl"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 class="text-base font-semibold text-gray-900">{{ $t('roleManagement.filtersTitle') }}</h3>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600"
            :aria-label="$t('common.close')"
            @click="showFilters = false"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-900" for="roles-search">
              {{ $t('common.search') }}
            </label>
            <input
              id="roles-search"
              v-model="searchQuery"
              type="search"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              :placeholder="$t('roleManagement.searchPlaceholder')"
            >
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-900" for="roles-type">
              {{ $t('roleManagement.groupType') }}
            </label>
            <select
              id="roles-type"
              v-model="typeFilter"
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">{{ $t('roleManagement.allTypes') }}</option>
              <option value="staff">{{ $t('roleManagement.groupTypes.staff') }}</option>
              <option value="parent">{{ $t('roleManagement.groupTypes.parent') }}</option>
              <option value="student">{{ $t('roleManagement.groupTypes.student') }}</option>
              <option value="system">{{ $t('roleManagement.groupTypes.system') }}</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="clearFilters"
          >
            {{ $t('common.clear') }}
          </button>
          <button
            type="button"
            class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            @click="showFilters = false"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </aside>
    </div>

    <div
      v-if="showForm"
      class="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="formTitleId"
    >
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-gray-900/45 backdrop-blur-[1px]" @click="cancelForm" />
        <div class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5" :dir="isRTL ? 'rtl' : 'ltr'">
          <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 :id="formTitleId" class="text-lg font-semibold text-gray-900">
              {{ editingRole?.id ? $t('roleManagement.editRole') : $t('roleManagement.addRole') }}
            </h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              :aria-label="$t('common.close')"
              @click="cancelForm"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form class="space-y-4 px-5 py-5" @submit.prevent="saveRole">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-900" for="role-name">
                {{ $t('roleManagement.roleName') }}
              </label>
              <input
                id="role-name"
                v-model="form.name"
                required
                type="text"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                :placeholder="$t('roleManagement.roleNamePlaceholder')"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-900" for="role-code">
                {{ $t('roleManagement.code') }}
              </label>
              <input
                id="role-code"
                v-model="form.code"
                type="text"
                dir="ltr"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-mono text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-50"
                :placeholder="$t('roleManagement.codePlaceholder')"
                :disabled="!!editingRole?.isSystem"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-900" for="role-description">
                {{ $t('roleManagement.descriptionLabel') }}
              </label>
              <input
                id="role-description"
                v-model="form.description"
                type="text"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                :placeholder="$t('roleManagement.descriptionPlaceholder')"
              >
            </div>
            <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="cancelForm"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                :disabled="saving"
              >
                {{ saving ? $t('common.saving') : $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { rbacService, type RbacGroup } from '@/services/rbac.service'
import { authService } from '@/services'

const { locale, t } = useI18n()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()
const isRTL = computed(() => locale.value === 'ar')
const formTitleId = 'role-form-title'

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const searchQuery = ref('')
const typeFilter = ref<'all' | 'staff' | 'parent' | 'student' | 'system'>('all')
const roles = ref<RbacGroup[]>([])
const showFilters = ref(false)
const showForm = ref(false)
const editingRole = ref<RbacGroup | null>(null)
const form = ref({ name: '', code: '', description: '' })
const activeMenuId = ref<string | null>(null)

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim()) || typeFilter.value !== 'all',
)

const filteredRoles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return roles.value.filter((r) => {
    const type = r.groupType || (r.isSystem ? 'system' : 'staff')
    if (typeFilter.value !== 'all' && type !== typeFilter.value) return false
    if (!q) return true
    return (
      r.name.toLowerCase().includes(q)
      || (r.code || '').toLowerCase().includes(q)
      || (r.description || '').toLowerCase().includes(q)
    )
  })
})

function getClaimCount(role: RbacGroup) {
  let count = 0
  Object.values(role.permissions || {}).forEach((actions) => {
    count += actions.length
  })
  return count
}

function roleInitial(role: RbacGroup) {
  const name = (role.name || '').trim()
  return name ? name.charAt(0) : '?'
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenu() {
  activeMenuId.value = null
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    closeMenu()
  }
}

function clearFilters() {
  searchQuery.value = ''
  typeFilter.value = 'all'
}

async function loadAll() {
  loading.value = true
  loadError.value = ''
  try {
    const user = authService.getStoredUser()
    const listArg =
      user?.isSuperAdmin || user?.isSystemUser ? null : user?.school_id ?? undefined
    roles.value = await rbacService.listGroups(listArg)
  } catch (e: unknown) {
    const err = e as Error
    loadError.value = err?.message || 'Failed to load user groups'
  } finally {
    loading.value = false
  }
}

function startCreate() {
  closeMenu()
  editingRole.value = null
  form.value = { name: '', code: '', description: '' }
  showForm.value = true
}

function startEdit(role: RbacGroup) {
  closeMenu()
  editingRole.value = role
  form.value = {
    name: role.name,
    code: role.code || '',
    description: role.description || '',
  }
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingRole.value = null
  form.value = { name: '', code: '', description: '' }
}

function onViewClaims(role: RbacGroup) {
  closeMenu()
  void router.push({ name: 'role-claims', params: { id: role.id } })
}

function onEdit(role: RbacGroup) {
  startEdit(role)
}

function onClone(role: RbacGroup) {
  void cloneRole(role)
}

function onDelete(role: RbacGroup) {
  void deleteRole(role)
}

async function saveRole() {
  saving.value = true
  try {
    const user = authService.getStoredUser()
    const code = form.value.code.trim() || undefined
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || undefined,
      code,
    }
    if (editingRole.value?.id) {
      await rbacService.updateGroup(editingRole.value.id, payload)
    } else {
      await rbacService.createGroup({
        ...payload,
        groupType: 'staff',
        schoolId: user?.isSuperAdmin || user?.isSystemUser ? null : user?.school_id,
      })
    }
    cancelForm()
    await loadAll()
  } catch (e: unknown) {
    const err = e as Error
    alert(err?.message || 'Save failed')
  } finally {
    saving.value = false
  }
}

async function cloneRole(role: RbacGroup) {
  closeMenu()
  try {
    await rbacService.cloneGroup(role.id, { name: `${role.name} (copy)` })
    await loadAll()
  } catch (e: unknown) {
    const err = e as Error
    alert(err?.message || 'Clone failed')
  }
}

async function deleteRole(role: RbacGroup) {
  closeMenu()
  if (role.isSystem) return
  if (!confirm(t('roleManagement.confirmDelete', { name: role.name }))) return
  try {
    await rbacService.deleteGroup(role.id)
    await loadAll()
  } catch (e: unknown) {
    const err = e as Error
    alert(err?.message || 'Delete failed')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void loadAll()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
