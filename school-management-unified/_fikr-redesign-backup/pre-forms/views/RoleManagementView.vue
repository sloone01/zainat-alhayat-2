<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('roleManagement.title')"
        :subtitle="$t('roleManagement.subtitle')"
      />

      <div v-if="loadError" class="fk-alert fk-alert--error">
        {{ loadError }}
      </div>

      <div class="fk-card">
        <div class="fk-card__header">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('roleManagement.listHeading') }}</h2>
              <p v-if="!loading" class="fk-card__meta">
                {{ $t('roleManagement.rolesCount', { count: filteredRoles.length }) }}
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
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <span class="fk-spinner" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <p
            v-else-if="roles.length && !filteredRoles.length"
            class="fk-empty text-sm text-fikr-ink-soft"
          >
            {{ $t('roleManagement.noRoleFilterResults') }}
          </p>

          <template v-else-if="filteredRoles.length">
            <div v-if="isCards" class="fk-grid">
              <article
                v-for="role in filteredRoles"
                :key="role.id"
                class="fk-item"
              >
                <div class="fk-item__body flex items-start gap-3">
                  <div class="fk-monogram fk-monogram--navy">
                    {{ roleInitial(role) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-sm font-semibold text-fikr-ink">{{ role.name }}</h3>
                        <p class="mt-0.5 truncate font-mono text-[11px] text-fikr-ink-soft" dir="ltr">{{ role.code || '—' }}</p>
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
                      <span class="fk-chip fk-chip--teal">
                        {{ $t(`roleManagement.groupTypes.${role.groupType || 'staff'}`) }}
                      </span>
                      <span
                        v-if="role.isSystem"
                        class="fk-chip fk-chip--amber"
                      >
                        {{ $t('roleManagement.systemRole') }}
                      </span>
                    </div>
                  </div>
                </div>
                <dl class="fk-item__stats">
                  <div class="min-w-0">
                    <dt>{{ $t('roleManagement.users') }}</dt>
                    <dd>{{ role.memberCount ?? 0 }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt>{{ $t('roleManagement.claimsCount') }}</dt>
                    <dd>{{ getClaimCount(role) }}</dd>
                  </div>
                </dl>
              </article>
            </div>

            <div v-else class="fk-table-wrap">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('roleManagement.roleName') }}</th>
                    <th>{{ $t('roleManagement.code') }}</th>
                    <th>{{ $t('roleManagement.groupType') }}</th>
                    <th>{{ $t('roleManagement.users') }}</th>
                    <th>{{ $t('roleManagement.claimsCount') }}</th>
                    <th class="text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="role in filteredRoles" :key="'list-' + role.id" class="hover:bg-fikr-pearl">
                    <td>
                      <div class="font-medium text-fikr-ink">{{ role.name }}</div>
                      <div class="text-xs text-fikr-ink-soft line-clamp-1">{{ role.description || '—' }}</div>
                      <span
                        v-if="role.isSystem"
                        class="fk-chip fk-chip--amber mt-1"
                      >
                        {{ $t('roleManagement.systemRole') }}
                      </span>
                    </td>
                    <td class="font-mono text-xs text-fikr-ink-muted" dir="ltr">{{ role.code || '—' }}</td>
                    <td class="text-fikr-ink-muted">{{ $t(`roleManagement.groupTypes.${role.groupType || 'staff'}`) }}</td>
                    <td class="tabular-nums text-fikr-ink">{{ role.memberCount ?? 0 }}</td>
                    <td class="tabular-nums text-fikr-ink">{{ getClaimCount(role) }}</td>
                    <td>
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
            <div class="fk-empty__icon">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-fikr-ink-muted">{{ $t('roleManagement.noRoles') }}</p>
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
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside
        class="fk-drawer"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="fk-drawer__header">
          <h3 class="text-base font-semibold text-fikr-ink">{{ $t('roleManagement.filtersTitle') }}</h3>
          <button
            type="button"
            class="text-fikr-ink-soft hover:text-fikr-ink-muted"
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
            <label class="fk-label" for="roles-search">
              {{ $t('common.search') }}
            </label>
            <input
              id="roles-search"
              v-model="searchQuery"
              type="search"
              class="fk-input"
              :placeholder="$t('roleManagement.searchPlaceholder')"
            >
          </div>
          <div>
            <label class="fk-label" for="roles-type">
              {{ $t('roleManagement.groupType') }}
            </label>
            <select
              id="roles-type"
              v-model="typeFilter"
              class="fk-input"
            >
              <option value="all">{{ $t('roleManagement.allTypes') }}</option>
              <option value="staff">{{ $t('roleManagement.groupTypes.staff') }}</option>
              <option value="parent">{{ $t('roleManagement.groupTypes.parent') }}</option>
              <option value="student">{{ $t('roleManagement.groupTypes.student') }}</option>
              <option value="system">{{ $t('roleManagement.groupTypes.system') }}</option>
            </select>
          </div>
        </div>
        <div class="fk-drawer__footer">
          <button
            type="button"
            class="fk-btn fk-btn--pearl"
            @click="clearFilters"
          >
            {{ $t('common.clear') }}
          </button>
          <button
            type="button"
            class="fk-btn fk-btn--primary"
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
        <div class="fk-backdrop" @click="cancelForm" />
        <div class="fk-dialog max-w-lg" :dir="isRTL ? 'rtl' : 'ltr'">
          <div class="fk-dialog__header">
            <h3 :id="formTitleId" class="fk-card__title">
              {{ editingRole?.id ? $t('roleManagement.editRole') : $t('roleManagement.addRole') }}
            </h3>
            <button
              type="button"
              class="text-fikr-ink-soft hover:text-fikr-ink-muted"
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
              <label class="fk-label" for="role-name">
                {{ $t('roleManagement.roleName') }}
              </label>
              <input
                id="role-name"
                v-model="form.name"
                required
                type="text"
                class="fk-input"
                :placeholder="$t('roleManagement.roleNamePlaceholder')"
              >
            </div>
            <div>
              <label class="fk-label" for="role-code">
                {{ $t('roleManagement.code') }}
              </label>
              <input
                id="role-code"
                v-model="form.code"
                type="text"
                dir="ltr"
                class="fk-input disabled:bg-fikr-pearl"
                :placeholder="$t('roleManagement.codePlaceholder')"
                :disabled="!!editingRole?.isSystem"
              >
            </div>
            <div>
              <label class="fk-label" for="role-description">
                {{ $t('roleManagement.descriptionLabel') }}
              </label>
              <input
                id="role-description"
                v-model="form.description"
                type="text"
                class="fk-input"
                :placeholder="$t('roleManagement.descriptionPlaceholder')"
              >
            </div>
            <div class="flex justify-end gap-2 border-t border-fikr-hairline pt-4">
              <button
                type="button"
                class="fk-btn fk-btn--pearl"
                @click="cancelForm"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="fk-btn fk-btn--primary"
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
import FikrPageHeader from '@/components/FikrPageHeader.vue'
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
