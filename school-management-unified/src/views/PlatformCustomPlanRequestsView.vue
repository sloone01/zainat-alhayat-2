<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('platformCustomRequests.title')"
        :subtitle="$t('platformCustomRequests.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ error }}</span>
          <button type="button" class="font-semibold underline" @click="load">
            {{ $t('platformBilling.tryAgain') }}
          </button>
        </div>
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('platformCustomRequests.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('platformCustomRequests.count', { count: filtered.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <select v-model="statusFilter" class="fk-field !m-0 h-9 w-auto min-w-[8rem] py-1.5 text-sm">
              <option value="all">{{ $t('platformCustomRequests.filterAll') }}</option>
              <option value="new">{{ $t('platformCustomRequests.status_new') }}</option>
              <option value="contacted">{{ $t('platformCustomRequests.status_contacted') }}</option>
              <option value="closed">{{ $t('platformCustomRequests.status_closed') }}</option>
            </select>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <span class="fk-spinner" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div v-else-if="!filtered.length" class="fk-empty">
            <h3 class="text-sm font-medium text-fikr-ink">{{ $t('platformCustomRequests.empty') }}</h3>
            <p class="mt-1 text-sm text-fikr-ink-soft">{{ $t('platformCustomRequests.emptyHint') }}</p>
          </div>

          <template v-else>
            <div v-if="isCards" class="fk-grid overflow-visible">
              <article
                v-for="(row, index) in paginated"
                :key="row.id"
                class="fk-item"
              >
                <div class="fk-item__body flex items-start gap-3">
                  <span class="fk-monogram fk-monogram--navy text-xs">{{ schoolInitial(row) }}</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-sm font-semibold text-fikr-ink">
                          {{ row.school_name_ar || row.school_name }}
                        </h3>
                        <p v-if="row.school_name_en" class="mt-0.5 truncate text-xs text-fikr-ink-soft" dir="ltr" lang="en">
                          {{ row.school_name_en }}
                        </p>
                        <p class="mt-0.5 truncate text-xs text-fikr-ink-soft" dir="ltr">{{ row.email }}</p>
                      </div>
                      <RowActionsMenu
                        :open="activeMenuId === row.id"
                        :placement="index < 3 ? 'down' : 'up'"
                        @toggle="toggleMenu(row.id)"
                      >
                        <RowActionsItem icon="view" @click="openRequest(row.id)">
                          {{ $t('common.view') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-1.5">
                      <span class="fk-chip" :class="statusChipClass(row.status)">
                        {{ $t(`platformCustomRequests.status_${row.status}`) }}
                      </span>
                    </div>
                    <ul v-if="row.module_labels?.length" class="mt-2 flex flex-wrap gap-1">
                      <li
                        v-for="m in row.module_labels"
                        :key="m.code"
                        class="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-800"
                      >
                        {{ isRTL ? m.name_ar : m.name_en }}
                      </li>
                    </ul>
                  </div>
                </div>
                <dl class="fk-item__stats">
                  <div class="min-w-0">
                    <dt>{{ $t('platformCustomRequests.colPhone') }}</dt>
                    <dd dir="ltr">{{ row.phone }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt>{{ $t('platformCustomRequests.colScope') }}</dt>
                    <dd>{{ scopeLabel(row.scope) }}</dd>
                  </div>
                  <div class="col-span-2 min-w-0">
                    <dt>{{ $t('platformCustomRequests.colDate') }}</dt>
                    <dd>{{ formatDate(row.created_at) }}</dd>
                  </div>
                </dl>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('platformCustomRequests.colSchool') }}</th>
                    <th>{{ $t('platformCustomRequests.colContact') }}</th>
                    <th>{{ $t('platformCustomRequests.colModules') }}</th>
                    <th>{{ $t('platformCustomRequests.colStatus') }}</th>
                    <th>{{ $t('platformCustomRequests.colDate') }}</th>
                    <th class="text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in paginated" :key="row.id" class="hover:bg-fikr-pearl">
                    <td>
                      <router-link
                        :to="{ name: 'platform-custom-plan-request', params: { id: row.id } }"
                        class="font-medium text-primary-800 hover:underline"
                      >
                        {{ row.school_name_ar || row.school_name }}
                      </router-link>
                      <div v-if="row.school_name_en" class="text-xs text-fikr-ink-soft" dir="ltr" lang="en">
                        {{ row.school_name_en }}
                      </div>
                      <div class="text-xs text-fikr-ink-soft">{{ scopeLabel(row.scope) }}</div>
                      <div v-if="row.notes" class="mt-1 max-w-xs truncate text-xs text-gray-500" :title="row.notes">
                        {{ row.notes }}
                      </div>
                    </td>
                    <td class="whitespace-nowrap text-sm">
                      <div dir="ltr">{{ row.email }}</div>
                      <div dir="ltr" class="text-fikr-ink-soft">{{ row.phone }}</div>
                    </td>
                    <td>
                      <div v-if="!row.module_labels?.length" class="text-xs text-gray-400">
                        {{ $t('platformCustomRequests.noModules') }}
                      </div>
                      <ul v-else class="flex max-w-xs flex-wrap gap-1">
                        <li
                          v-for="m in row.module_labels"
                          :key="m.code"
                          class="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-800"
                        >
                          {{ isRTL ? m.name_ar : m.name_en }}
                        </li>
                      </ul>
                    </td>
                    <td>
                      <span class="fk-chip" :class="statusChipClass(row.status)">
                        {{ $t(`platformCustomRequests.status_${row.status}`) }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap text-sm text-fikr-ink-soft">
                      {{ formatDate(row.created_at) }}
                    </td>
                    <td class="text-end">
                      <RowActionsMenu
                        :open="activeMenuId === row.id"
                        :placement="index < 2 ? 'down' : 'up'"
                        @toggle="toggleMenu(row.id)"
                      >
                        <RowActionsItem icon="view" @click="openRequest(row.id)">
                          {{ $t('common.view') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filtered.length > 0"
              @update:page="goToPage"
            />
          </template>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useClientPagination } from '@/composables/useClientPagination'
import {
  schoolSubscriptionService,
  type CustomPlanRequest,
  type CustomPlanRequestStatus,
} from '@/services/school-subscription.service'

const { locale, t } = useI18n()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const rows = ref<CustomPlanRequest[]>([])
const statusFilter = ref<'all' | CustomPlanRequestStatus>('all')
const activeMenuId = ref<string | null>(null)

const filtered = computed(() => {
  if (statusFilter.value === 'all') return rows.value
  return rows.value.filter((r) => r.status === statusFilter.value)
})

const {
  currentPage,
  paginatedItems: paginated,
  totalPages,
  goToPage,
} = useClientPagination(filtered)

watch(statusFilter, () => {
  currentPage.value = 1
})

function schoolInitial(row: CustomPlanRequest) {
  const name = (row.school_name_ar || row.school_name || '').trim()
  return name.charAt(0) || '?'
}

function scopeLabel(scope: CustomPlanRequest['scope']) {
  if (scope === 'mid') return t('forSchools.gallery.scopeMid')
  if (scope === 'large') return t('forSchools.gallery.scopeLarge')
  return t('forSchools.gallery.scopeSmall')
}

function statusChipClass(status: CustomPlanRequestStatus) {
  if (status === 'new') return 'fk-chip--amber'
  if (status === 'contacted') return 'fk-chip--teal'
  return 'fk-chip--neutral'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function handleClickOutside() {
  activeMenuId.value = null
}

function openRequest(id: string) {
  activeMenuId.value = null
  void router.push({ name: 'platform-custom-plan-request', params: { id } })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await schoolSubscriptionService.listCustomPlanRequests()
  } catch (e: unknown) {
    error.value = (e as { message?: string })?.message || t('platformCustomRequests.loadError')
    rows.value = []
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
