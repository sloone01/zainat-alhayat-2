<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex min-w-0 items-start gap-3">
            <router-link
              :to="{ name: 'roles' }"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white shadow-sm hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
              :aria-label="$t('roleManagement.backToRoles')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
                {{ $t('roleManagement.claimsEditorEyebrow') }}
              </p>
              <h1 class="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {{ role?.name || $t('roleManagement.viewClaims') }}
              </h1>
              <p class="mt-2 max-w-2xl text-sm text-slate-200/95">
                {{ $t('roleManagement.claimsGridSubtitle') }}
              </p>
              <p v-if="role?.code" class="mt-1 font-mono text-xs text-primary-100/70" dir="ltr">{{ role.code }}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              :disabled="saving || !role || !dirty"
              class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-primary-800 shadow-sm transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              @click="save"
            >
              <svg v-if="saving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ saving ? ($t('common.saving') || 'Saving…') : $t('common.save') }}
            </button>
          </div>
        </div>
      </section>

      <div v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        {{ loadError }}
      </div>

      <div
        v-if="saveMessage"
        class="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-800 shadow-sm"
      >
        {{ saveMessage }}
      </div>

      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div class="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
              <div class="sm:col-span-2">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="claims-search">{{ $t('common.search') }}</label>
                <div class="relative">
                  <svg class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    id="claims-search"
                    v-model="searchQuery"
                    type="search"
                    class="w-full rounded-lg border border-gray-200 bg-white py-2.5 ps-9 pe-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    :placeholder="$t('roleManagement.claimsModulesSearch')"
                  >
                </div>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                @click="applyReadOnlyAll"
              >
                {{ $t('roleManagement.readOnlyAccess') }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                @click="clearAllClaims"
              >
                {{ $t('roleManagement.clearAll') }}
              </button>
              <ListViewModeToggle v-model="viewMode" />
            </div>
          </div>
        </div>

        <div v-if="!loading && role" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ filteredPages.length }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('roleManagement.claimsStats.modules') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ enabledModuleCount }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('roleManagement.claimsStats.enabled') }}</div>
          </div>
          <div class="rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100">
            <div class="text-xl font-bold tabular-nums text-teal-700">{{ assignedClaimCount }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('roleManagement.claimsStats.assigned') }}</div>
          </div>
          <div class="rounded-xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-200">
            <div class="text-xl font-bold tabular-nums text-slate-700">{{ role.memberCount ?? 0 }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('roleManagement.stats.members') }}</div>
          </div>
        </div>

        <div class="px-6 py-5">
          <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="mt-3 text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="!role"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <h3 class="text-base font-semibold text-gray-900">{{ $t('roleManagement.noRoles') }}</h3>
            <router-link
              :to="{ name: 'roles' }"
              class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
            >
              {{ $t('roleManagement.backToRoles') }}
            </router-link>
          </div>

          <div
            v-else-if="filteredPages.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <p class="text-sm text-gray-500">{{ $t('roleManagement.claimsNoModulesMatch') }}</p>
          </div>

          <!-- Module cards -->
          <div v-else-if="isCards" class="grid gap-4 lg:grid-cols-2">
            <article
              v-for="page in filteredPages"
              :key="page.key"
              class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-gray-900/[0.03] transition hover:border-primary-200"
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
                    :id="`claim-${page.key}-${action}`"
                    type="checkbox"
                    class="h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    :checked="hasClaim(page.key, action)"
                    @change="toggleClaim(page.key, action)"
                  >
                  <label
                    :for="`claim-${page.key}-${action}`"
                    class="min-w-0 flex-1 cursor-pointer text-sm text-gray-800"
                  >
                    {{ claimActionLabel(page, action) }}
                  </label>
                </li>
              </ul>
              <div v-if="!pageEnabled(page)" class="border-t border-gray-100 bg-gray-50/50 px-4 py-2 text-[11px] text-gray-500">
                {{ $t('roleManagement.pageDisabled') }}
              </div>
            </article>
          </div>

          <!-- Matrix list -->
          <div v-else class="overflow-auto rounded-xl border border-gray-200/80 max-h-[calc(100vh-320px)]">
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
                    <div class="font-normal text-[10px] text-gray-400">{{ page.route }}</div>
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
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import {
  rbacService,
  type RbacGroup,
  type RbacPageCatalog,
} from '@/services/rbac.service'

const route = useRoute()
const { locale, t, te } = useI18n()
const { viewMode, isCards } = useListViewMode()

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const saveMessage = ref('')
const searchQuery = ref('')
const role = ref<RbacGroup | null>(null)
const pages = ref<RbacPageCatalog[]>([])
const actionCodes = ref<string[]>([])
const permissions = ref<Record<string, string[]>>({})
const savedSnapshot = ref('')

const isRTL = computed(() => locale.value === 'ar')

const dirty = computed(() => JSON.stringify(permissions.value) !== savedSnapshot.value)

const filteredPages = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return pages.value
  return pages.value.filter((page) => {
    const title = pageTitle(page).toLowerCase()
    return title.includes(q) || page.route.toLowerCase().includes(q) || page.key.toLowerCase().includes(q)
  })
})

const enabledModuleCount = computed(() =>
  pages.value.filter((page) => pageEnabled(page)).length,
)

const assignedClaimCount = computed(() =>
  Object.values(permissions.value).reduce((sum, actions) => sum + actions.length, 0),
)

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
  saveMessage.value = ''
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

async function load() {
  const id = String(route.params.id || '')
  if (!id) return
  loading.value = true
  loadError.value = ''
  saveMessage.value = ''
  searchQuery.value = ''
  try {
    const [catalog, group] = await Promise.all([
      rbacService.getCatalog(),
      rbacService.getGroup(id),
    ])
    role.value = group
    const scoped = catalog.pages.filter((p) => {
      if (group.schoolId == null) return true
      return p.scope === 'school' || p.scope === 'both'
    })
    pages.value = [...scoped].sort((a, b) => a.sortOrder - b.sortOrder)
    actionCodes.value = catalog.actions.map((a) => a.code)
    permissions.value = { ...(group.permissions || {}) }
    savedSnapshot.value = JSON.stringify(permissions.value)
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load claims'
    role.value = null
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!role.value?.id) return
  saving.value = true
  saveMessage.value = ''
  loadError.value = ''
  try {
    const payload = Object.entries(permissions.value).map(([pageKey, actions]) => ({
      pageKey,
      actions,
    }))
    const updated = await rbacService.setPermissions(role.value.id, payload)
    role.value = updated
    permissions.value = { ...(updated.permissions || permissions.value) }
    savedSnapshot.value = JSON.stringify(permissions.value)
    saveMessage.value = t('roleManagement.claimsSaved')
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to save claims'
  } finally {
    saving.value = false
  }
}

watch(() => route.params.id, load)
onMounted(load)
</script>
