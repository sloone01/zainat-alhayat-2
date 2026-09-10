<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('paymentSettings.courseFeesPageTitle')"
        :subtitle="$t('paymentSettings.hubCoursesIntro')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">
        {{ flashError }}
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('paymentSettings.coursesGridTitle') }}</h2>
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

          <template v-else-if="courses.length">
            <p
              v-if="filteredCourses.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('paymentSettings.noCourseFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              <article
                v-for="c in paginatedCourses"
                :key="c.id"
                class="relative flex flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                :class="!c.is_active ? 'opacity-75' : ''"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-80"
                  :class="c.profile_configured ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'"
                  aria-hidden="true"
                />

                <div class="flex flex-1 flex-col p-4 sm:p-5">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      :class="c.profile_configured ? 'bg-sky-100 text-sky-800' : 'bg-amber-50 text-amber-800'"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">{{ courseDisplayName(c) }}</h3>
                      <p v-if="c.title && c.title !== c.name" class="mt-0.5 truncate text-xs text-gray-500">{{ c.title }}</p>
                    </div>
                    <RowActionsMenu
                      :open="activeMenuId === c.id"
                      placement="up"
                      @toggle="toggleMenu(c.id)"
                    >
                      <RowActionsItem icon="edit" @click="openEdit(c)">
                        {{ c.profile_configured ? $t('common.edit') : $t('paymentSettings.configureFees') }}
                      </RowActionsItem>
                    </RowActionsMenu>
                  </div>

                  <div class="mt-3 flex flex-wrap items-center gap-1.5">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="c.profile_configured ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'"
                    >
                      {{ c.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                    </span>
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="c.is_active ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'"
                    >
                      {{ c.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                    </span>
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="c.course_pricing_basis ? 'bg-violet-50 text-violet-800 ring-1 ring-violet-100' : 'bg-gray-50 text-gray-500 ring-1 ring-gray-100'"
                    >
                      {{ pricingBasisLabel(c) }}
                    </span>
                  </div>

                  <div
                    v-if="c.fee_package_name"
                    class="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 ring-1 ring-sky-100"
                  >
                    <span class="min-w-0 truncate text-sm font-medium text-sky-900">{{ c.fee_package_name }}</span>
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
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.coursesGridTitle') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.coursePricingBasis') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.feePackageBadge') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="c in paginatedCourses" :key="'list-' + c.id" class="hover:bg-primary-50/20" :class="!c.is_active ? 'opacity-75' : ''">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ courseDisplayName(c) }}</div>
                      <div v-if="c.title && c.title !== c.name" class="mt-0.5 text-xs text-gray-500">{{ c.title }}</div>
                    </td>
                    <td class="px-4 py-3 text-gray-700">{{ pricingBasisLabel(c) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1.5">
                        <span
                          class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="c.profile_configured ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'"
                        >
                          {{ c.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                        </span>
                        <span
                          class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="c.is_active ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'"
                        >
                          {{ c.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-700">
                      {{ c.fee_package_name || $t('paymentSettings.noPackageLinkedYet') }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === c.id"
                          placement="up"
                          @toggle="toggleMenu(c.id)"
                        >
                          <RowActionsItem icon="edit" @click="openEdit(c)">
                            {{ c.profile_configured ? $t('common.edit') : $t('paymentSettings.configureFees') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredCourses.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('paymentSettings.emptyCourses') }}</p>
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
            <label class="fk-flabel" for="courses-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="courses-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('paymentSettings.searchCoursesPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="courses-config"><span>{{ $t('paymentSettings.configurationFilter') }}</span></label>
            <select
              id="courses-config"
              v-model="configFilter"
              class="fk-field"
            >
              <option value="all">{{ $t('paymentSettings.allConfigurations') }}</option>
              <option value="configured">{{ $t('paymentSettings.profileConfigured') }}</option>
              <option value="not_configured">{{ $t('paymentSettings.profileNotConfigured') }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="courses-status"><span>{{ $t('common.status') }}</span></label>
            <select
              id="courses-status"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { authService } from '@/services'
import paymentConfigService, { type CoursePaymentSummaryRow } from '@/services/payment-config.service'

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

function openEdit(c: CoursePaymentSummaryRow) {
  closeMenu()
  void router.push(`/settings/payments/course/${c.id}`)
}

const schoolId = computed(() => {
  const id = authService.getStoredUser()?.school_id
  return id != null && String(id).trim() !== '' ? String(id) : ''
})

const loading = ref(true)
const flashError = ref('')
const courses = ref<CoursePaymentSummaryRow[]>([])

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value.trim())
  || configFilter.value !== 'all'
  || statusFilter.value !== 'all',
)

const filteredCourses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return courses.value.filter((c) => {
    if (configFilter.value === 'configured' && !c.profile_configured) return false
    if (configFilter.value === 'not_configured' && c.profile_configured) return false
    if (statusFilter.value === 'active' && !c.is_active) return false
    if (statusFilter.value === 'inactive' && c.is_active) return false
    if (q) {
      const haystack = `${courseDisplayName(c)} ${c.title || ''} ${c.name || ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
})

const {
  currentPage,
  paginatedItems: paginatedCourses,
  totalPages,
  goToPage,
} = useClientPagination(filteredCourses)

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

function clearFilters() {
  searchQuery.value = ''
  configFilter.value = 'all'
  statusFilter.value = 'all'
}

function courseDisplayName(c: CoursePaymentSummaryRow) {
  return c.name?.trim() || c.title?.trim() || c.id
}

function pricingBasisLabel(c: CoursePaymentSummaryRow) {
  if (c.course_pricing_basis === 'phase') return t('paymentSettings.coursePricingBasisPhase')
  if (c.course_pricing_basis === 'grade') return t('paymentSettings.coursePricingBasisGrade')
  return t('paymentSettings.coursePricingBasisUnset')
}

async function load() {
  loading.value = true
  flashError.value = ''
  if (!schoolId.value) {
    flashError.value = t('paymentSettings.loadError')
    loading.value = false
    return
  }
  try {
    const cr = await paymentConfigService.listCoursesPaymentSummary(schoolId.value)
    courses.value = [...cr].sort((a, b) => a.name.localeCompare(b.name))
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
