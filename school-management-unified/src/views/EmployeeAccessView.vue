<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('userManagement.editRoleTitle')"
        :subtitle="employeeName || $t('userManagement.editRoleSubtitle')"
      >
        <template #leading>
          <router-link
            to="/employees"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('userManagement.backToEmployees')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="loadError" class="fk-alert fk-alert--error">{{ loadError }}</div>
      <div v-if="saveOk" class="fk-alert fk-alert--ok">{{ saveOk }}</div>
      <div v-if="saveError" class="fk-alert fk-alert--error">{{ saveError }}</div>

      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <template v-else-if="user">
        <!-- User groups -->
        <section class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('userManagement.staffGroups') }}</h2>
              <p class="fk-card__meta">{{ $t('userManagement.editRoleGroupsHint') }}</p>
            </div>
            <button
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm"
              :disabled="savingGroups || !groupsDirty"
              @click="saveGroups"
            >
              {{ savingGroups ? $t('common.saving') : $t('common.save') }}
            </button>
          </header>
          <div class="p-5 sm:p-6">
            <p v-if="!staffGroups.length" class="text-sm text-gray-500">{{ $t('userManagement.noStaffGroups') }}</p>
            <div v-else class="fk-choices">
              <label
                v-for="group in staffGroups"
                :key="group.id"
                class="fk-choice"
                :class="{ 'fk-choice--on': selectedGroupIds.includes(group.id) }"
              >
                <input v-model="selectedGroupIds" :value="group.id" type="checkbox" />
                <span>{{ group.name }}</span>
                <span v-if="group.code" class="font-mono text-[11px] opacity-70" dir="ltr">{{ group.code }}</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Extra claim grants -->
        <section class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('userManagement.extraClaimsTitle') }}</h2>
              <p class="fk-card__meta">{{ $t('userManagement.extraClaimsHint') }}</p>
            </div>
            <div class="flex shrink-0 flex-nowrap items-center gap-2">
              <div class="relative min-w-[10rem] sm:min-w-[14rem]">
                <svg class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fikr-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="claimsSearch"
                  type="search"
                  class="fk-field fk-field--sm rounded-pill ps-10"
                  :placeholder="$t('roleManagement.claimsModulesSearch')"
                  :aria-label="$t('common.search')"
                >
              </div>
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm"
                @click="clearExtraClaims"
              >
                {{ $t('roleManagement.clearAll') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--primary fk-btn--sm"
                :disabled="savingClaims || !claimsDirty"
                @click="saveClaims"
              >
                {{ savingClaims ? $t('common.saving') : $t('common.save') }}
              </button>
            </div>
          </header>

          <div class="p-5 sm:p-6">
            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="page in filteredPages"
                :key="page.key"
                class="rounded-xl border border-gray-200/80 bg-white"
              >
                <div class="border-b border-gray-100 px-4 py-3">
                  <h3 class="font-semibold text-gray-900">{{ pageTitle(page) }}</h3>
                  <p class="mt-0.5 truncate font-mono text-[10px] text-gray-400" dir="ltr">{{ page.route }}</p>
                </div>
                <ul class="divide-y divide-gray-100 px-4 py-2">
                  <li
                    v-for="action in page.allowedActions"
                    :key="`${page.key}:${action}`"
                    class="flex items-center gap-3 py-2.5"
                  >
                    <input
                      :id="`extra-${page.key}-${action}`"
                      type="checkbox"
                      class="h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      :checked="hasGrant(page.key, action)"
                      @change="toggleGrant(page.key, action)"
                    >
                    <label
                      :for="`extra-${page.key}-${action}`"
                      class="min-w-0 flex-1 cursor-pointer text-sm text-gray-800"
                    >
                      {{ claimLabel(action) }}
                    </label>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { userService } from '@/services'
import {
  rbacService,
  type RbacGroup,
  type RbacPageCatalog,
  type RbacUserOverride,
} from '@/services/rbac.service'

const route = useRoute()
const { locale, t, te } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const userId = computed(() => String(route.params.userId || ''))

const loading = ref(true)
const loadError = ref('')
const saveOk = ref('')
const saveError = ref('')

const user = ref<Awaited<ReturnType<typeof userService.getUserById>> | null>(null)
const employeeName = computed(() =>
  user.value
    ? (user.value.fullName || `${user.value.firstName} ${user.value.lastName}`).trim() || user.value.email
    : '',
)

const staffGroups = ref<RbacGroup[]>([])
const selectedGroupIds = ref<string[]>([])
const savedGroupIds = ref<string[]>([])
const savingGroups = ref(false)

const pages = ref<RbacPageCatalog[]>([])
const grants = ref<Record<string, string[]>>({})
const savedGrants = ref('')
const claimsSearch = ref('')
const savingClaims = ref(false)

const groupsDirty = computed(() => {
  const a = [...selectedGroupIds.value].sort().join(',')
  const b = [...savedGroupIds.value].sort().join(',')
  return a !== b
})

const claimsDirty = computed(() => JSON.stringify(grants.value) !== savedGrants.value)

const filteredPages = computed(() => {
  const q = claimsSearch.value.trim().toLowerCase()
  const schoolPages = pages.value.filter((p) => p.scope === 'school' || p.scope === 'both')
  if (!q) return schoolPages
  return schoolPages.filter((page) => {
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

function hasGrant(pageKey: string, action: string) {
  return grants.value[pageKey]?.includes(action) || false
}

function toggleGrant(pageKey: string, action: string) {
  const cur = new Set(grants.value[pageKey] || [])
  if (cur.has(action)) cur.delete(action)
  else cur.add(action)
  const next = { ...grants.value }
  if (cur.size) next[pageKey] = [...cur]
  else delete next[pageKey]
  grants.value = next
  saveOk.value = ''
  saveError.value = ''
}

function clearExtraClaims() {
  grants.value = {}
  saveOk.value = ''
}

function overridesFromGrants(): RbacUserOverride[] {
  const out: RbacUserOverride[] = []
  for (const [pageKey, actions] of Object.entries(grants.value)) {
    for (const actionCode of actions) {
      out.push({ pageKey, actionCode, effect: 'grant' })
    }
  }
  return out
}

function grantsFromOverrides(overrides: RbacUserOverride[]) {
  const map: Record<string, string[]> = {}
  for (const o of overrides) {
    if (o.effect !== 'grant') continue
    if (!map[o.pageKey]) map[o.pageKey] = []
    if (!map[o.pageKey].includes(o.actionCode)) map[o.pageKey].push(o.actionCode)
  }
  return map
}

async function saveGroups() {
  if (!user.value) return
  savingGroups.value = true
  saveOk.value = ''
  saveError.value = ''
  try {
    const prev = new Set(savedGroupIds.value)
    const next = new Set(selectedGroupIds.value)
    for (const id of prev) {
      if (!next.has(id)) await rbacService.removeUser(id, userId.value)
    }
    for (const id of next) {
      if (!prev.has(id)) await rbacService.assignUser(id, userId.value)
    }
    savedGroupIds.value = [...selectedGroupIds.value]
    saveOk.value = t('userManagement.groupsSaved')
  } catch (e: any) {
    saveError.value = e?.message || t('userManagement.groupsSaveError')
  } finally {
    savingGroups.value = false
  }
}

async function saveClaims() {
  if (!user.value) return
  savingClaims.value = true
  saveOk.value = ''
  saveError.value = ''
  try {
    await rbacService.setUserOverrides(userId.value, overridesFromGrants())
    savedGrants.value = JSON.stringify(grants.value)
    saveOk.value = t('userManagement.claimsSaved')
  } catch (e: any) {
    saveError.value = e?.message || t('userManagement.claimsSaveError')
  } finally {
    savingClaims.value = false
  }
}

async function boot() {
  loading.value = true
  loadError.value = ''
  try {
    const [u, allGroups, memberships, catalog, overrides] = await Promise.all([
      userService.getUserById(userId.value),
      rbacService.listGroups(),
      rbacService.listUserGroups(userId.value),
      rbacService.getCatalog(),
      rbacService.listUserOverrides(userId.value),
    ])
    user.value = u
    staffGroups.value = allGroups.filter((g) => g.groupType === 'staff' || (!g.groupType && !g.isSystem))
    const memberIds = memberships
      .filter((g) => g.groupType === 'staff' || staffGroups.value.some((s) => s.id === g.id))
      .map((g) => g.id)
    selectedGroupIds.value = [...memberIds]
    savedGroupIds.value = [...memberIds]
    pages.value = catalog.pages || []
    grants.value = grantsFromOverrides(overrides || [])
    savedGrants.value = JSON.stringify(grants.value)
  } catch (e: any) {
    loadError.value = e?.message || t('userManagement.editRoleLoadError')
  } finally {
    loading.value = false
  }
}

onMounted(boot)
</script>
