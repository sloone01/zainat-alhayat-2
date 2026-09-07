<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('paymentSettings.levelFeesPageTitle')"
        :subtitle="$t('paymentSettings.levelFeesPageIntro')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('paymentSettings.levelsGridTitle') }}</h2>
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
                  class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-600"
                  aria-hidden="true"
                />
              </button>
              <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="levels.length">
            <p
              v-if="filteredLevels.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('paymentSettings.noLevelFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <article
              v-for="lv in filteredLevels"
              :key="lv.id"
              class="relative flex flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              :class="!lv.is_active ? 'opacity-75' : ''"
            >
              <div
                class="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-80"
                :class="lv.profile_configured ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'"
                aria-hidden="true"
              />

              <div class="flex flex-1 flex-col p-4 sm:p-5">
                <div class="flex items-start gap-3">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    :class="lv.profile_configured ? 'bg-primary-100 text-primary-800' : 'bg-amber-50 text-amber-800'"
                  >
                    {{ levelInitial(lv) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900">{{ levelDisplayName(lv) }}</h3>
                    <p class="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-gray-400">{{ lv.code }}</p>
                  </div>
                  <RowActionsMenu
                    :open="activeMenuId === lv.id"
                    placement="up"
                    @toggle="toggleMenu(lv.id)"
                  >
                    <RowActionsItem icon="edit" @click="openEdit(lv)">
                      {{ lv.profile_configured ? $t('common.edit') : $t('paymentSettings.configureFees') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </div>

                <div class="mt-3 flex flex-wrap items-center gap-1.5">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="lv.profile_configured ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'"
                  >
                    {{ lv.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                  </span>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="lv.is_active ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ lv.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                  </span>
                </div>

                <div
                  v-if="lv.fee_package_name"
                  class="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 ring-1 ring-sky-100"
                >
                  <span class="min-w-0 truncate text-sm font-medium text-sky-900">{{ lv.fee_package_name }}</span>
                </div>
                <p v-else class="mt-3 text-xs leading-relaxed text-gray-500">
                  {{ $t('paymentSettings.noPackageLinkedYet') }}
                </p>
              </div>
            </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.levelsGridTitle') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.feePackageBadge') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="lv in filteredLevels" :key="'list-' + lv.id" class="hover:bg-primary-50/20" :class="!lv.is_active ? 'opacity-75' : ''">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ levelDisplayName(lv) }}</div>
                      <div class="mt-0.5 font-mono text-[11px] uppercase text-gray-400">{{ lv.code }}</div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1.5">
                        <span
                          class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="lv.profile_configured ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'"
                        >
                          {{ lv.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                        </span>
                        <span
                          class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="lv.is_active ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'"
                        >
                          {{ lv.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-700">
                      {{ lv.fee_package_name || $t('paymentSettings.noPackageLinkedYet') }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === lv.id"
                          placement="up"
                          @toggle="toggleMenu(lv.id)"
                        >
                          <RowActionsItem icon="edit" @click="openEdit(lv)">
                            {{ lv.profile_configured ? $t('common.edit') : $t('paymentSettings.configureFees') }}
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('paymentSettings.emptyLevels') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('paymentSettings.filtersTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside
        class="fk-drawer"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('paymentSettings.filtersTitle') }}</h3>
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
        <div class="fk-drawer__body">
          <div class="fk-form__row">
            <label class="fk-flabel" for="levels-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="levels-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('paymentSettings.searchLevelsPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="levels-config"><span>{{ $t('paymentSettings.configurationFilter') }}</span></label>
            <select
              id="levels-config"
              v-model="configFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('paymentSettings.allConfigurations') }}</option>
              <option value="configured">{{ $t('paymentSettings.profileConfigured') }}</option>
              <option value="not_configured">{{ $t('paymentSettings.profileNotConfigured') }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="levels-status"><span>{{ $t('common.status') }}</span></label>
            <select
              id="levels-status"
              v-model="statusFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('paymentSettings.allStatuses') }}</option>
              <option value="active">{{ $t('paymentSettings.active') }}</option>
              <option value="inactive">{{ $t('paymentSettings.inactive') }}</option>
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
import { authService } from '@/services'
import paymentConfigService, { type SchoolPaymentLevelSummary } from '@/services/payment-config.service'

const { locale, t } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const activeMenuId = ref<string | null>(null)
const showFilters = ref(false)
const searchQuery = ref('')
const configFilter = ref<'all' | 'configured' | 'not_configured'>('all')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

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

function openEdit(lv: SchoolPaymentLevelSummary) {
  closeMenu()
  void router.push(`/settings/payments/level/${lv.id}`)
}

function levelDisplayName(lv: SchoolPaymentLevelSummary) {
  if (isRTL.value && lv.name_ar) return lv.name_ar
  if (!isRTL.value && lv.name_en) return lv.name_en
  return lv.name
}

function levelInitial(lv: SchoolPaymentLevelSummary) {
  const name = levelDisplayName(lv).trim()
  return name ? name.charAt(0) : '?'
}

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const loading = ref(true)
const flashError = ref('')
const levels = ref<SchoolPaymentLevelSummary[]>([])

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim())
  || configFilter.value !== 'all'
  || statusFilter.value !== 'all',
)

const filteredLevels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return levels.value.filter((lv) => {
    if (configFilter.value === 'configured' && !lv.profile_configured) return false
    if (configFilter.value === 'not_configured' && lv.profile_configured) return false
    if (statusFilter.value === 'active' && !lv.is_active) return false
    if (statusFilter.value === 'inactive' && lv.is_active) return false
    if (q) {
      const haystack = `${levelDisplayName(lv)} ${lv.code} ${lv.name}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
})

function clearFilters() {
  searchQuery.value = ''
  configFilter.value = 'all'
  statusFilter.value = 'all'
}

async function load() {
  loading.value = true
  flashError.value = ''
  try {
    const lv = await paymentConfigService.listLevelsSummary(schoolId.value)
    levels.value = [...lv].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void load()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
