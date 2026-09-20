<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-elev">
        <div class="fk-empty-panel">
          <p>{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="loadProgressData">
            {{ $t('common.retry') }}
          </button>
        </div>
      </div>

      <template v-else>
        <FikrPageHeader :title="$t('parent.progress')" :subtitle="$t('parent.progressSubtitle')" />

        <div v-if="!progressData.length" class="fk-elev">
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
                <p class="fk-card__meta">{{ filteredRows.length }}</p>
              </div>
              <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
                <template v-if="progressData.length > 1">
                  <button
                    v-for="childProgress in progressData"
                    :key="childProgress.student.id"
                    type="button"
                    class="fk-fchip"
                    :class="selectedProgressChildId === childProgress.student.id ? 'fk-fchip--active' : ''"
                    :aria-pressed="selectedProgressChildId === childProgress.student.id"
                    @click="selectChild(childProgress.student.id)"
                  >
                    {{ childChipLabel(childProgress) }}
                  </button>
                </template>
                <FikrFilterButton :expanded="showFilters" :count="statusFilter !== 'all' ? 1 : 0" @click="showFilters = true" />
                <ListViewModeToggle v-model="viewMode" />
              </div>
            </header>

            <div class="p-6">
              <div v-if="!filteredRows.length" class="fk-empty">
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
                :show="filteredRows.length > 0"
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { parentService } from '@/services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
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

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedProgressChildId = ref<string | null>(null)
const showFilters = ref(false)
const statusFilter = ref('all')
const { viewMode, isCards } = useListViewMode()

const progressData = computed(() => dashboardData.value.progress || [])

const selectedChildProgress = computed(() => {
  if (!selectedProgressChildId.value) return progressData.value[0]
  return progressData.value.find((p: any) => p.student.id === selectedProgressChildId.value) || progressData.value[0]
})

function childChipLabel(childProgress: any) {
  const student = childProgress?.student
  if (!student) return t('parent.childName')
  const name = (student.firstName || '').trim() || t('parent.childName')
  const fromGroups = student.groups?.map((g: { name: string }) => g.name).join(', ')
  const group = formatParentGroupNames(fromGroups || student.groupNames, '')
  return group ? `${name} · ${group}` : name
}

const selectedItems = computed(() => selectedChildProgress.value?.progress || [])

const metricCounts = computed(() => {
  const list = selectedItems.value
  return {
    completed: list.filter((p: any) => p.status === 'completed').length,
    inProgress: list.filter((p: any) => p.status === 'in_progress').length,
    notStarted: list.filter((p: any) => p.status === 'not_started' || !p.status).length,
  }
})

const selectedRows = computed(() =>
  selectedItems.value.map((progress: any) => ({
    id: String(progress.id),
    label: progress.milestone?.title || progress.milestone?.name || t('parent.milestones'),
    status: progress.status || 'not_started',
    detail: String(progress.teacher_notes || '').trim() || undefined,
  })),
)

const filteredRows = computed(() =>
  statusFilter.value === 'all'
    ? selectedRows.value
    : selectedRows.value.filter((row: { status: string }) => row.status === statusFilter.value),
)

const {
  currentPage,
  paginatedItems,
  totalPages,
  goToPage,
} = useClientPagination(filteredRows)

function selectChild(id: string) {
  selectedProgressChildId.value = id
  currentPage.value = 1
}

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

const loadProgressData = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await parentService.getMyDashboardData()
    dashboardData.value = data
    if (data.progress?.length) {
      selectedProgressChildId.value = data.progress[0].student.id
    }
  } catch (err: any) {
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProgressData()
})
</script>
