<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('reports.exportsTitle')" />

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('reports.exportsTitle') }}</h2>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="total > 0 || hasActiveFilters">
            <p
              v-if="total === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('reports.exportsNoFilter') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KanbanCard
                v-for="row in paginatedItems"
                :key="row.key"
                :title="reportName(row)"
                :description="row.source_path"
              >
                <template #actions>
                  <RowActionsMenu
                    :open="activeMenuId === row.key"
                    placement="up"
                    @toggle="toggleMenu(row.key)"
                  >
                    <RowActionsItem icon="edit" @click="onEdit(row.key)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </template>
              </KanbanCard>
            </div>
            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('reports.exportReportName') }}</th>
                    <th>{{ $t('reports.exportSourcePage') }}</th>
                    <th class="!text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in paginatedItems" :key="row.key">
                    <td class="font-medium">{{ reportName(row) }}</td>
                    <td class="text-fikr-ink-muted">{{ row.source_path }}</td>
                    <td>
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === row.key"
                          placement="up"
                          @toggle="toggleMenu(row.key)"
                        >
                          <RowActionsItem icon="edit" @click="onEdit(row.key)">
                            {{ $t('common.edit') }}
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
              :show="total > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="px-6 py-16 text-center text-sm text-fikr-ink-muted">
            {{ $t('reports.exportsEmpty') }}
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('common.filter')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <h3 class="fk-form__title">{{ $t('common.filter') }}</h3>
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
            <label class="fk-flabel" for="exports-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="exports-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('reports.exportSearchPlaceholder')"
            >
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import { useFeedback } from '@/composables/useFeedback'
import { useServerPagination } from '@/composables/useServerPagination'
import { useListViewMode } from '@/composables/useListViewMode'
import reportExportService, { type ReportExportListItem } from '@/services/report-export.service'

const { t, locale } = useI18n()
const router = useRouter()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const activeMenuId = ref<string | null>(null)
const showFilters = ref(false)
const searchQuery = ref('')

const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim()))

const {
  items: paginatedItems,
  total,
  loading,
  currentPage,
  totalPages,
  goToPage,
} = useServerPagination(
  (params) => reportExportService.listExportsPage(params),
  {
    filters: () => ({ q: searchQuery.value }),
    debounceKeys: ['q'],
    onError: (err) => {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message || '')
          : ''
      feedback.error(message || t('reports.exportsLoadFailed'), t('common.error'))
    },
  },
)

function reportName(row: ReportExportListItem) {
  return isRTL.value ? row.name_ar || row.name_en : row.name_en
}

function clearFilters() {
  searchQuery.value = ''
}

function toggleMenu(key: string) {
  activeMenuId.value = activeMenuId.value === key ? null : key
}

function onEdit(key: string) {
  activeMenuId.value = null
  void router.push(`/reports/exports/${encodeURIComponent(key)}`)
}

function onDocClick(ev: Event) {
  const target = ev.target as Element
  if (activeMenuId.value && !target.closest('.relative')) activeMenuId.value = null
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
