<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('roleManagement.addRole')"
        :subtitle="$t('roleManagement.createPageSubtitle')"
      >
        <template #leading>
          <router-link
            :to="{ name: 'roles' }"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('roleManagement.backToRoles')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="loadError" class="fk-alert fk-alert--error">{{ loadError }}</div>

      <form class="space-y-6" @submit.prevent="submit">
        <section class="fk-card">
          <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title">{{ $t('roleManagement.roleDetails') }}</h2>
            <p class="fk-card__meta">{{ $t('roleManagement.roleDetailsHint') }}</p>
          </header>
          <div class="space-y-5 p-5 sm:p-6">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="role-create-name">
                {{ $t('roleManagement.roleName') }} *
              </label>
              <input
                id="role-create-name"
                v-model="form.name"
                type="text"
                required
                class="fk-field max-w-xl"
                :placeholder="$t('roleManagement.roleNamePlaceholder')"
              >
            </div>
            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="role-create-code">
                  {{ $t('roleManagement.code') }}
                </label>
                <input
                  id="role-create-code"
                  v-model="form.code"
                  type="text"
                  dir="ltr"
                  class="fk-field fk-field--mono"
                  :placeholder="$t('roleManagement.codePlaceholder')"
                >
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="role-create-description">
                  {{ $t('roleManagement.descriptionLabel') }}
                </label>
                <input
                  id="role-create-description"
                  v-model="form.description"
                  type="text"
                  class="fk-field"
                  :placeholder="$t('roleManagement.descriptionPlaceholder')"
                >
              </div>
            </div>
          </div>
        </section>

        <section class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('roleManagement.privilegesHeading') }}</h2>
              <p class="fk-card__meta">{{ $t('roleManagement.privilegesHint') }}</p>
            </div>
            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <div class="relative min-w-[10rem] sm:min-w-[14rem]">
                <svg
                  class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fikr-ink-soft"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="searchQuery"
                  type="search"
                  class="fk-field fk-field--sm rounded-pill ps-10"
                  :placeholder="$t('roleManagement.claimsModulesSearch')"
                  :aria-label="$t('common.search')"
                >
              </div>
              <ListViewModeToggle v-model="viewMode" />
              <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="applyReadOnlyAll">
                {{ $t('roleManagement.readOnlyAccess') }}
              </button>
              <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="clearAllClaims">
                {{ $t('roleManagement.clearAll') }}
              </button>
            </div>
          </header>

          <div class="px-5 py-5 sm:px-6">
            <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
              <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
              <span class="mt-3 text-sm">{{ $t('common.loading') }}</span>
            </div>

            <div
              v-else-if="pages.length === 0"
              class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
            >
              <p class="text-sm font-semibold text-gray-800">{{ $t('roleManagement.noEntitledModules') }}</p>
              <p class="mt-1 max-w-md text-sm text-gray-500">{{ $t('roleManagement.noEntitledModulesHint') }}</p>
            </div>

            <div
              v-else-if="filteredPages.length === 0"
              class="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center text-sm text-gray-500"
            >
              {{ $t('roleManagement.claimsNoModulesMatch') }}
            </div>

            <div v-else-if="isCards" class="grid gap-4 lg:grid-cols-2">
              <article
                v-for="page in filteredPages"
                :key="page.key"
                class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-gray-900/[0.03]"
                :class="pageEnabled(page) ? 'ring-primary-100' : ''"
              >
                <div
                  class="flex items-start justify-between gap-3 border-b px-4 py-3"
                  :class="pageEnabled(page) ? 'border-primary-100 bg-primary-50/50' : 'border-gray-100 bg-gray-50/60'"
                >
                  <div class="min-w-0">
                    <h3 class="font-semibold text-gray-900">{{ pageTitle(page) }}</h3>
                    <p class="mt-0.5 truncate font-mono text-[10px] text-gray-400" dir="ltr">{{ page.route }}</p>
                  </div>
                  <div class="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      class="rounded-md px-2 py-1 text-[10px] font-semibold text-primary-700 hover:bg-primary-100"
                      @click="setPageReadOnly(page)"
                    >
                      {{ $t('roleManagement.readOnlyAccess') }}
                    </button>
                    <button
                      type="button"
                      class="rounded-md px-2 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-100"
                      @click="clearPageClaims(page.key)"
                    >
                      {{ $t('roleManagement.clearAll') }}
                    </button>
                  </div>
                </div>
                <ul class="divide-y divide-gray-100 px-4 py-2">
                  <li
                    v-for="action in allowedActionsForPage(page)"
                    :key="`${page.key}:${action}`"
                    class="flex items-center gap-3 py-2.5"
                  >
                    <input
                      :id="`create-claim-${page.key}-${action}`"
                      type="checkbox"
                      class="h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      :checked="hasClaim(page.key, action)"
                      @change="toggleClaim(page.key, action)"
                    >
                    <label
                      :for="`create-claim-${page.key}-${action}`"
                      class="min-w-0 flex-1 cursor-pointer text-sm text-gray-800"
                    >
                      {{ claimActionLabel(page, action) }}
                    </label>
                  </li>
                </ul>
              </article>
            </div>

            <div v-else class="max-h-[calc(100vh-320px)] overflow-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full border-collapse text-xs">
                <thead class="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    <th class="sticky start-0 z-20 min-w-[200px] border-b border-e border-gray-200 bg-gray-50 px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {{ $t('roleManagement.pageColumn') }}
                    </th>
                    <th
                      v-for="action in actionCodes"
                      :key="action"
                      class="whitespace-nowrap border-b border-gray-200 px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-600"
                    >
                      {{ claimLabel(action) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="page in filteredPages"
                    :key="page.key"
                    class="odd:bg-white even:bg-gray-50/60 hover:bg-primary-50/30"
                  >
                    <td class="sticky start-0 z-[1] border-b border-e border-gray-100 bg-inherit px-3 py-2 font-medium text-gray-900">
                      <div>{{ pageTitle(page) }}</div>
                      <div class="text-[10px] font-normal text-gray-400">{{ page.route }}</div>
                    </td>
                    <td
                      v-for="action in actionCodes"
                      :key="`${page.key}:${action}`"
                      class="border-b border-gray-100 px-2 py-1.5 text-center"
                    >
                      <input
                        v-if="pageAllows(page, action)"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        :checked="hasClaim(page.key, action)"
                        @change="toggleClaim(page.key, action)"
                      >
                      <span v-else class="text-gray-300">·</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div class="flex flex-wrap items-center justify-end gap-2 pb-6">
          <router-link :to="{ name: 'roles' }" class="fk-btn fk-btn--pearl">
            {{ $t('common.cancel') }}
          </router-link>
          <button type="submit" class="fk-btn fk-btn--primary" :disabled="saving || loading || !form.name.trim()">
            {{ saving ? $t('common.saving') : $t('roleManagement.createWithPrivileges') }}
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { authService } from '@/services'
import {
  rbacService,
  type RbacPageCatalog,
} from '@/services/rbac.service'
import { filterRbacPagesForSchool, permissionsPayload } from '@/utils/rbac-page-filter'

const { locale, t, te } = useI18n()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const searchQuery = ref('')
const pages = ref<RbacPageCatalog[]>([])
const actionCodes = ref<string[]>([])
const permissions = ref<Record<string, string[]>>({})
const form = ref({ name: '', code: '', description: '' })

const filteredPages = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return pages.value
  return pages.value.filter((page) => {
    const title = pageTitle(page).toLowerCase()
    return title.includes(q) || page.route.toLowerCase().includes(q) || page.key.toLowerCase().includes(q)
  })
})

function pageTitle(page: RbacPageCatalog) {
  return isRTL.value ? page.nameAr || page.nameEn : page.nameEn || page.nameAr
}

function claimLabel(code: string) {
  const key = `roleManagement.claims.${code}`
  return te(key) ? t(key) : code
}

function claimActionLabel(page: RbacPageCatalog, action: string) {
  const key = `roleManagement.claimActionLabel`
  if (te(key)) {
    return t(key, { action: claimLabel(action), page: pageTitle(page) })
  }
  return `${claimLabel(action)} — ${pageTitle(page)}`
}

function pageAllows(page: RbacPageCatalog, action: string) {
  return page.allowedActions?.includes(action) ?? false
}

function allowedActionsForPage(page: RbacPageCatalog) {
  return actionCodes.value.filter((action) => pageAllows(page, action))
}

function hasClaim(pageKey: string, action: string) {
  return permissions.value[pageKey]?.includes(action) || false
}

function pageEnabled(page: RbacPageCatalog) {
  return (permissions.value[page.key]?.length ?? 0) > 0
}

function setPermissions(next: Record<string, string[]>) {
  permissions.value = next
}

function toggleClaim(pageKey: string, action: string) {
  const current = [...(permissions.value[pageKey] || [])]
  const idx = current.indexOf(action)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(action)
    if (action !== 'view' && !current.includes('view')) {
      const page = pages.value.find((p) => p.key === pageKey)
      if (page?.allowedActions?.includes('view')) current.unshift('view')
    }
  }
  if (current.length) {
    setPermissions({ ...permissions.value, [pageKey]: current })
  } else {
    const next = { ...permissions.value }
    delete next[pageKey]
    setPermissions(next)
  }
}

function clearPageClaims(pageKey: string) {
  const next = { ...permissions.value }
  delete next[pageKey]
  setPermissions(next)
}

function setPageReadOnly(page: RbacPageCatalog) {
  if (!page.allowedActions?.includes('view')) {
    clearPageClaims(page.key)
    return
  }
  setPermissions({ ...permissions.value, [page.key]: ['view'] })
}

function clearAllClaims() {
  setPermissions({})
}

function applyReadOnlyAll() {
  const next: Record<string, string[]> = {}
  for (const page of pages.value) {
    if (page.allowedActions?.includes('view')) {
      next[page.key] = ['view']
    }
  }
  setPermissions(next)
}

async function loadCatalog() {
  loading.value = true
  loadError.value = ''
  try {
    const user = authService.getStoredUser()
    const platform = !!(user?.isSuperAdmin || user?.isSystemUser)
    const [catalog, me] = await Promise.all([
      rbacService.getCatalog(),
      rbacService.getMyClaims(),
    ])
    pages.value = filterRbacPagesForSchool(catalog.pages, {
      schoolScoped: !platform,
      entitledPageKeys: platform ? null : me.entitledPageKeys,
    })
    actionCodes.value = catalog.actions.map((a) => a.code)
  } catch (e: unknown) {
    loadError.value = (e as Error)?.message || t('roleManagement.loadCatalogFailed')
    pages.value = []
  } finally {
    loading.value = false
  }
}

async function submit() {
  const name = form.value.name.trim()
  if (!name) return
  saving.value = true
  loadError.value = ''
  try {
    const user = authService.getStoredUser()
    const platform = !!(user?.isSuperAdmin || user?.isSystemUser)
    const created = await rbacService.createGroup({
      name,
      code: form.value.code.trim() || undefined,
      description: form.value.description.trim() || undefined,
      groupType: 'staff',
      schoolId: platform ? null : user?.school_id,
    })
    const payload = permissionsPayload(permissions.value)
    if (payload.length) {
      await rbacService.setPermissions(created.id, payload)
    }
    await router.push({ name: 'role-claims', params: { id: created.id } })
  } catch (e: unknown) {
    loadError.value = (e as Error)?.message || t('roleManagement.createFailed')
  } finally {
    saving.value = false
  }
}

onMounted(loadCatalog)
</script>
