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

      <form
        v-if="showForm"
        class="overflow-hidden rounded-2xl border border-primary-200/80 bg-gradient-to-br from-primary-50/60 to-white p-5 shadow-sm ring-1 ring-primary-100"
        @submit.prevent="saveRole"
      >
        <h2 class="text-sm font-semibold text-gray-900">
          {{ editingRole?.id ? $t('roleManagement.editRole') : $t('roleManagement.addRole') }}
        </h2>
        <p class="mt-0.5 text-xs text-gray-500">{{ $t('roleManagement.formHint') }}</p>
        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('roleManagement.roleName') }}</label>
            <input
              v-model="form.name"
              required
              type="text"
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              :placeholder="$t('roleManagement.roleNamePlaceholder')"
            >
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('roleManagement.code') }}</label>
            <input
              v-model="form.code"
              type="text"
              dir="ltr"
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-mono text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              :placeholder="$t('roleManagement.codePlaceholder')"
              :disabled="!!editingRole?.isSystem"
            >
          </div>
          <div class="md:col-span-2">
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('roleManagement.descriptionLabel') }}</label>
            <input
              v-model="form.description"
              type="text"
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              :placeholder="$t('roleManagement.descriptionPlaceholder')"
            >
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            :disabled="saving"
            class="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {{ $t('common.save') }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            @click="cancelForm"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </form>

      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('roleManagement.listHeading') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('roleManagement.rolesCount', { count: filteredRoles.length }) }}
              </p>
            </div>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ roleStats.total }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('roleManagement.stats.total') }}</div>
          </div>
          <div class="rounded-xl bg-amber-50/70 px-3 py-3 text-center ring-1 ring-amber-100">
            <div class="text-xl font-bold tabular-nums text-amber-800">{{ roleStats.system }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('roleManagement.stats.system') }}</div>
          </div>
          <div class="rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100">
            <div class="text-xl font-bold tabular-nums text-teal-700">{{ roleStats.members }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('roleManagement.stats.members') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ roleStats.claims }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('roleManagement.stats.claims') }}</div>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div class="sm:col-span-2 lg:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="roles-search">{{ $t('common.search') }}</label>
              <div class="relative">
                <svg class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="roles-search"
                  v-model="searchQuery"
                  type="search"
                  class="w-full rounded-lg border border-gray-200 bg-white py-2.5 ps-9 pe-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  :placeholder="$t('roleManagement.searchPlaceholder')"
                >
              </div>
            </div>
          </div>

          <div v-if="!loading" class="mb-5 flex flex-wrap items-center justify-end gap-2">
            <router-link
              to="/users"
              class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {{ $t('userManagement.title') }}
            </router-link>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              @click="startCreate"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('roleManagement.addRole') }}
            </button>
          </div>

          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="mt-3 text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="filteredRoles.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900">{{ $t('roleManagement.noRoles') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-gray-500">{{ $t('roleManagement.noRolesDescription') }}</p>
            <button
              type="button"
              class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
              @click="startCreate"
            >
              {{ $t('roleManagement.createFirstRole') }}
            </button>
          </div>

          <template v-else>
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="role in filteredRoles"
                :key="role.id"
                class="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h3 class="truncate font-semibold text-gray-900">{{ role.name }}</h3>
                      <p class="mt-0.5 truncate font-mono text-xs text-gray-500" dir="ltr">{{ role.code || '—' }}</p>
                      <p v-if="role.description" class="mt-2 line-clamp-2 text-xs text-gray-500">{{ role.description }}</p>
                    </div>
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      :aria-label="$t('common.actions')"
                      @click.stop="toggleDropdown(role, $event)"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <span class="inline-flex rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-800 ring-1 ring-primary-100">
                      {{ $t(`roleManagement.groupTypes.${role.groupType || 'staff'}`) }}
                    </span>
                    <span v-if="role.isSystem" class="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-100">
                      {{ $t('roleManagement.systemRole') }}
                    </span>
                  </div>
                  <div class="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-50/80 p-3 ring-1 ring-gray-100">
                    <div class="text-center">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ role.memberCount ?? 0 }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('roleManagement.users') }}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ getClaimCount(role) }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('roleManagement.claimsCount') }}</div>
                    </div>
                  </div>
                </div>
                <div class="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <router-link
                    :to="{ name: 'role-claims', params: { id: role.id } }"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
                  >
                    {{ $t('roleManagement.viewClaims') }}
                    <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </router-link>
                </div>
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
                  <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ role.name }}</div>
                      <div class="text-xs text-gray-500 line-clamp-1">{{ role.description || '—' }}</div>
                      <span v-if="role.isSystem" class="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                        {{ $t('roleManagement.systemRole') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-mono text-xs text-gray-700" dir="ltr">{{ role.code || '—' }}</td>
                    <td class="px-4 py-3 text-gray-700">{{ $t(`roleManagement.groupTypes.${role.groupType || 'staff'}`) }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-900">{{ role.memberCount ?? 0 }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-900">{{ getClaimCount(role) }}</td>
                    <td class="px-4 py-3 text-end">
                      <button
                        type="button"
                        class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        :aria-label="$t('common.actions')"
                        :aria-expanded="activeDropdown === role.id"
                        @click.stop="toggleDropdown(role, $event)"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div
        v-if="menuRole && menuStyle"
        class="fixed z-[100] w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        :style="menuStyle"
        :dir="isRTL ? 'rtl' : 'ltr'"
        @click.stop
      >
        <router-link
          :to="{ name: 'role-claims', params: { id: menuRole.id } }"
          class="block w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
          @click="closeDropdown"
        >
          {{ $t('roleManagement.viewClaims') }}
        </router-link>
        <button
          type="button"
          class="w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
          @click="startEdit(menuRole)"
        >
          {{ $t('common.edit') }}
        </button>
        <button
          type="button"
          class="w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
          @click="cloneRole(menuRole)"
        >
          {{ $t('roleManagement.clone') }}
        </button>
        <hr class="my-1 border-gray-100">
        <button
          type="button"
          class="w-full px-4 py-2 text-start text-sm text-red-600 hover:bg-red-50 disabled:opacity-40"
          :disabled="menuRole.isSystem"
          @click="deleteRole(menuRole)"
        >
          {{ $t('common.delete') }}
        </button>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { rbacService, type RbacGroup } from '@/services/rbac.service'
import { authService } from '@/services'

const { locale, t } = useI18n()
const { viewMode, isCards } = useListViewMode()

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const searchQuery = ref('')
const roles = ref<RbacGroup[]>([])
const showForm = ref(false)
const editingRole = ref<RbacGroup | null>(null)
const form = ref({ name: '', code: '', description: '' })
const activeDropdown = ref<string | null>(null)
const menuRole = ref<RbacGroup | null>(null)
const menuStyle = ref<Record<string, string> | null>(null)

const isRTL = computed(() => locale.value === 'ar')

const filteredRoles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return roles.value
  return roles.value.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      (r.code || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q),
  )
})

const roleStats = computed(() => ({
  total: roles.value.length,
  system: roles.value.filter((r) => r.isSystem).length,
  members: roles.value.reduce((sum, r) => sum + (r.memberCount ?? 0), 0),
  claims: roles.value.reduce((sum, r) => sum + getClaimCount(r), 0),
}))

function getClaimCount(role: RbacGroup) {
  let count = 0
  Object.values(role.permissions || {}).forEach((actions) => {
    count += actions.length
  })
  return count
}

function placeMenu(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect()
  const menuWidth = 176
  const gap = 4
  const left = isRTL.value
    ? Math.max(8, rect.left)
    : Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth)
  const openUp = rect.bottom + 180 > window.innerHeight
  menuStyle.value = {
    top: openUp ? `${rect.top - gap}px` : `${rect.bottom + gap}px`,
    left: `${left}px`,
    transform: openUp ? 'translateY(-100%)' : 'none',
  }
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

function toggleDropdown(role: RbacGroup, event: MouseEvent) {
  if (activeDropdown.value === role.id) {
    closeDropdown()
    return
  }
  activeDropdown.value = role.id
  menuRole.value = role
  placeMenu(event.currentTarget as HTMLElement)
}

function closeDropdown() {
  activeDropdown.value = null
  menuRole.value = null
  menuStyle.value = null
}

function startCreate() {
  activeDropdown.value = null
  editingRole.value = null
  form.value = { name: '', code: '', description: '' }
  showForm.value = true
}

function startEdit(role: RbacGroup) {
  closeDropdown()
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
  closeDropdown()
  try {
    await rbacService.cloneGroup(role.id, { name: `${role.name} (copy)` })
    await loadAll()
  } catch (e: unknown) {
    const err = e as Error
    alert(err?.message || 'Clone failed')
  }
}

async function deleteRole(role: RbacGroup) {
  closeDropdown()
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
  loadAll()
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>
