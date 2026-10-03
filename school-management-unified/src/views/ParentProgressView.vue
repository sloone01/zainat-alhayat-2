<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="loading && !loaded" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error && !loaded" class="fk-elev">
        <div class="fk-empty-panel">
          <p>{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="reload">
            {{ $t('common.retry') }}
          </button>
        </div>
      </div>

      <template v-else>
        <FikrPageHeader :title="$t('parent.progress')" :subtitle="$t('parent.progressSubtitle')" />

        <div v-if="!children.length" class="fk-elev">
          <div class="fk-empty-panel">
            <p>{{ $t('parent.noChildren') }}</p>
          </div>
        </div>

        <template v-else>
          <div class="mb-4 grid gap-3 sm:grid-cols-3">
            <div class="fk-tile">
              <span class="fk-tile__label">{{ $t('parent.completed') }}</span>
              <span class="fk-tile__value fk-tile__value--lead" dir="ltr">{{ metricCounts.completed }}</span>
            </div>
            <div class="fk-tile">
              <span class="fk-tile__label">{{ $t('parent.inProgress') }}</span>
              <span class="fk-tile__value" dir="ltr">{{ metricCounts.inProgress }}</span>
            </div>
            <div class="fk-tile">
              <span class="fk-tile__label">{{ $t('parent.notStarted') }}</span>
              <span class="fk-tile__value" dir="ltr">{{ metricCounts.notStarted }}</span>
            </div>
          </div>

          <section class="fk-elev p-0" :aria-label="$t('parent.milestones')">
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
              <div class="min-w-0">
                <h2 class="fk-card__title truncate">{{ $t('parent.milestones') }}</h2>
                <p class="fk-card__meta">{{ progressTotal }}</p>
              </div>
              <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
                <template v-if="children.length > 1">
                  <button
                    v-for="child in children"
                    :key="child.id"
                    type="button"
                    class="fk-fchip"
                    :class="selectedProgressChildId === child.id ? 'fk-fchip--active' : ''"
                    :aria-pressed="selectedProgressChildId === child.id"
                    @click="selectChild(child.id)"
                  >
                    {{ childChipLabel(child) }}
                  </button>
                </template>
                <FikrFilterButton :expanded="showFilters" :count="statusFilter !== 'all' ? 1 : 0" @click="showFilters = true" />
                <ListViewModeToggle v-model="viewMode" />
              </div>
            </header>

            <div class="p-6">
              <div v-if="!progressTotal" class="fk-empty">
                <p class="fk-empty__title">{{ $t('parent.noProgress') }}</p>
              </div>

              <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <KanbanCard
                  v-for="row in paginatedItems"
                  :key="row.id"
                  :title="row.label"
                  :description="row.detail"
                >
                  <template #tags>
                    <KanbanTag :dot="statusDot(row.status)">{{ getStatusText(row.status) }}</KanbanTag>
                  </template>
                </KanbanCard>
              </div>

              <div v-else class="fk-table-wrap">
                <table class="fk-table">
                  <thead>
                    <tr>
                      <th>{{ $t('parent.milestones') }}</th>
                      <th>{{ $t('absenceExcuses.status') }}</th>
                      <th>{{ $t('parent.teacherNotes') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in paginatedItems" :key="'row-' + row.id">
                      <td class="font-medium">{{ row.label }}</td>
                      <td><KanbanTag :dot="statusDot(row.status)">{{ getStatusText(row.status) }}</KanbanTag></td>
                      <td class="text-fikr-ink-muted">{{ row.detail || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <FikrPagination
                class="mt-4"
                :page="currentPage"
                :pages="totalPages"
                :show="progressTotal > 0"
                @update:page="goToPage"
              />
            </div>
          </section>

          <FikrFilterDrawer :show="showFilters" :title="$t('common.filter')" @close="showFilters = false" @clear="statusFilter = 'all'">
            <div class="fk-form__row">
              <label class="fk-flabel" for="progress-status"><span>{{ $t('absenceExcuses.status') }}</span></label>
              <select id="progress-status" v-model="statusFilter" class="fk-field">
                <option value="all">{{ $t('absenceExcuses.all') }}</option>
                <option value="completed">{{ $t('parent.completed') }}</option>
                <option value="in_progress">{{ $t('parent.inProgress') }}</option>
                <option value="not_started">{{ $t('parent.notStarted') }}</option>
              </select>
            </div>
          </FikrFilterDrawer>
        </template>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { useServerPagination } from '@/composables/useServerPagination'
import { parentService, type ParentListChild } from '@/services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import { getErrorMessage } from '@/utils/error-reporting'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import FikrFilterDrawer from '@/components/FikrFilterDrawer.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import { useListViewMode } from '@/composables/useListViewMode'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const error = ref('')
const children = ref<ParentListChild[]>([])
const selectedProgressChildId = ref<string | null>(null)
const pinnedChildId = ref('')
const showFilters = ref(false)
const statusFilter = ref('all')
const metricCounts = ref({ completed: 0, inProgress: 0, notStarted: 0 })
const { viewMode, isCards } = useListViewMode()

function childChipLabel(child: ParentListChild) {
  const name = (child.firstName || '').trim() || t('parent.childName')
  const fromGroups = child.groups?.map((g) => g.name).filter(Boolean).join(', ')
  const group = formatParentGroupNames(fromGroups || child.groupNames, '')
  return group ? `${name} · ${group}` : name
}

function selectChild(id: string) {
  selectedProgressChildId.value = id
  pinnedChildId.value = id
}

const {
  items: paginatedItems,
  total: progressTotal,
  loading,
  loaded,
  currentPage,
  totalPages,
  goToPage,
  load,
  reload,
} = useServerPagination<
  { id: string; label: string; status: string; detail?: string },
  { childId: string; status: string }
>(
  async (params) => {
    error.value = ''
    const data = await parentService.getMyProgressPage({
      page: params.page,
      limit: params.limit,
      childId: params.childId || undefined,
      status: params.status,
    })
    children.value = data.children || []
    metricCounts.value = data.counts || { completed: 0, inProgress: 0, notStarted: 0 }
    if (!params.childId && data.childId) selectedProgressChildId.value = data.childId
    return {
      ...data,
      items: (data.items || []).map((row) => ({
        id: String(row.id),
        label: row.milestoneName || t('parent.milestones'),
        status: row.status || 'not_started',
        detail: String(row.teacher_notes || '').trim() || undefined,
      })),
    }
  },
  {
    filters: () => ({
      childId: pinnedChildId.value,
      status: statusFilter.value,
    }),
    onError: (err) => {
      error.value = getErrorMessage(err, t('parent.error'))
    },
  },
)

function statusDot(status: string) {
  if (status === 'completed') return 'emerald'
  if (status === 'in_progress') return 'amber'
  return 'gray'
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return t('parent.completed')
    case 'in_progress':
      return t('parent.inProgress')
    case 'not_started':
      return t('parent.notStarted')
    default:
      return t('parent.notStarted')
  }
}

void load()
</script>
