<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.assignedActivities')"
        :subtitle="$t('parent.assignedActivitiesSubtitle')"
      />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12">
        <FikrLoader />
        <span class="text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <div v-else class="space-y-6">
        <div v-if="children.length > 1" class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('parent.myChildren') }}</h2>
            </div>
          </header>
          <div class="flex flex-wrap gap-2 p-4 sm:gap-3 sm:p-6">
            <button
              v-for="child in children"
              :key="child.id"
              type="button"
              :class="[
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                selectedChildId === child.id
                  ? 'border border-primary-500 bg-primary-50 text-primary-900 ring-2 ring-primary-500/30'
                  : 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
              @click="selectedChildId = child.id"
            >
              {{ child.firstName }} {{ child.lastName }}
            </button>
          </div>
        </div>

        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('parent.assignedActivities') }}</h2>
              <p class="fk-card__meta">
                <template v-if="selectedChild">
                  {{ selectedChild.firstName }} {{ selectedChild.lastName }} — {{ formatGroupNames(selectedChild.groupNames) }}
                </template>
                <template v-if="filteredActivities.length">
                  <template v-if="selectedChild"> · </template>
                  {{ $t('activities.activitiesCount', { count: filteredActivities.length }) }}
                </template>
              </p>
            </div>
            <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <ListViewModeToggle v-model="viewMode" />
            </div>
          </header>

          <div class="p-6">
            <template v-if="filteredActivities.length">
              <div
                v-if="isCards"
                class="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]"
              >
                <KanbanCard
                  v-for="item in paginatedActivities"
                  :key="item.id"
                  class="fk-kcard--arranged"
                  :title="item.title"
                  :description="item.location || undefined"
                  :priority="item.requires_parent_approval ? 'medium' : undefined"
                  :priority-label="item.requires_parent_approval ? $t('activities.approvalRequiredBadge') : undefined"
                >
                  <template #tags>
                    <KanbanTag v-if="item.activity_type" dot="sky">{{ formatActivityType(item.activity_type) }}</KanbanTag>
                  </template>
                  <template #actions>
                    <KanbanTag :dot="activityStatusDot(item)">
                      {{ $t(`activities.status.${getActivityStatus(item)}`) }}
                    </KanbanTag>
                  </template>
                  <p v-if="item.description" class="line-clamp-2 text-sm text-gray-500">{{ item.description }}</p>
                  <template #meta>
                    <KanbanMeta icon="calendar">{{ activityWhen(item) }}</KanbanMeta>
                    <KanbanMeta v-if="item.group?.name" icon="users">{{ item.group.name }}</KanbanMeta>
                  </template>
                </KanbanCard>
              </div>

              <div v-else class="fk-table-wrap overflow-visible">
                <Table>
                  <TableHeader>
                    <TableRow class="hover:bg-transparent">
                      <TableHead>{{ $t('activities.title') }}</TableHead>
                      <TableHead>{{ $t('activities.type') }}</TableHead>
                      <TableHead>{{ $t('activities.group') }}</TableHead>
                      <TableHead>{{ $t('activities.dueDate') }}</TableHead>
                      <TableHead>{{ $t('activities.statusLabel') }}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="item in paginatedActivities" :key="'list-' + item.id">
                      <TableCell>
                        <div class="font-medium text-gray-900">{{ item.title }}</div>
                        <div v-if="item.requires_parent_approval" class="mt-0.5 text-[11px] font-semibold text-amber-800">
                          {{ $t('activities.approvalRequiredBadge') }}
                        </div>
                      </TableCell>
                      <TableCell class="text-gray-700">{{ formatActivityType(item.activity_type) }}</TableCell>
                      <TableCell class="text-gray-700">{{ item.group?.name || $t('activities.unassignedGroup') }}</TableCell>
                      <TableCell class="whitespace-nowrap text-gray-600">{{ activityWhen(item) }}</TableCell>
                      <TableCell>
                        <span
                          class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          :class="statusBadgeClass(getActivityStatus(item))"
                        >
                          {{ $t(`activities.status.${getActivityStatus(item)}`) }}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <FikrPagination
                :page="currentPage"
                :pages="totalPages"
                :show="filteredActivities.length > 0"
                @update:page="goToPage"
              />
            </template>

            <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
              <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-gray-800">{{ $t('parent.noAssignedActivities') }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useListViewMode } from '@/composables/useListViewMode'
import { useClientPagination } from '@/composables/useClientPagination'
import { parentService } from '../services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import { translateActivityType as translateActivityTypeLabel } from '@/utils/activity-types'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()
const { viewMode, isCards } = useListViewMode()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const activities = ref<any[]>([])
const children = ref<any[]>([])
const selectedChildId = ref<string | null>(null)

const selectedChild = computed(() => {
  if (!selectedChildId.value) return children.value[0]
  return children.value.find((c) => c.id === selectedChildId.value) || children.value[0]
})

function childGroupIds(child: any): string[] {
  return (child?.groups?.map((g: { id: string }) => String(g.id)) || []) as string[]
}

function formatGroupNames(names?: string | null) {
  return formatParentGroupNames(names, t('parent.noGroupAssigned'))
}

const filteredActivities = computed(() => {
  if (!selectedChild.value) return activities.value
  const ids = new Set(childGroupIds(selectedChild.value))
  if (ids.size === 0) return []
  return activities.value.filter((a) => a.group_id && ids.has(String(a.group_id)))
})

const {
  currentPage,
  paginatedItems: paginatedActivities,
  totalPages,
  goToPage,
} = useClientPagination(filteredActivities)

watch(selectedChildId, () => {
  currentPage.value = 1
})

function todayKeyLocal() {
  const n = new Date()
  const y = n.getFullYear()
  const m = String(n.getMonth() + 1).padStart(2, '0')
  const d = String(n.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function activityDateKey(raw: string | Date | null | undefined) {
  if (!raw) return ''
  return typeof raw === 'string' ? raw.split('T')[0] : raw.toISOString().split('T')[0]
}

function getActivityStatus(item: { is_active?: boolean; activity_date?: string | Date }): 'active' | 'pending' | 'completed' {
  if (item.is_active === false) return 'completed'
  const d = activityDateKey(item.activity_date)
  const today = todayKeyLocal()
  return d > today ? 'pending' : 'active'
}

function activityStatusDot(item: { is_active?: boolean; activity_date?: string | Date }) {
  const status = getActivityStatus(item)
  if (status === 'completed') return 'emerald' as const
  if (status === 'pending') return 'amber' as const
  return 'sky' as const
}

function statusBadgeClass(status: 'active' | 'pending' | 'completed') {
  if (status === 'active') return 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20'
  if (status === 'pending') return 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20'
  return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/15'
}

const formatActivityDate = (val: string | Date) => {
  if (!val) return t('parent.noData')
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    const s = typeof val === 'string' ? val.split('T')[0] : val.toISOString().split('T')[0]
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(loc, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return t('parent.noData')
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  try {
    const [h, min] = time.split(':').map(Number)
    const d = new Date(2000, 0, 1, h, min || 0)
    return d.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' })
  } catch {
    return time.slice(0, 5)
  }
}

function activityWhen(item: { activity_date?: string | Date; start_time?: string; end_time?: string }) {
  const date = formatActivityDate(item.activity_date || '')
  if (!item.start_time) return date
  const start = formatTime(item.start_time)
  const end = item.end_time ? formatTime(item.end_time) : ''
  return end ? `${date} · ${start} – ${end}` : `${date} · ${start}`
}

const formatActivityType = (type: string) => translateActivityTypeLabel(t, type)

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''
    const [acts, dash] = await Promise.all([
      parentService.getMyAssignedActivities(),
      parentService.getMyDashboardData(),
    ])
    activities.value = Array.isArray(acts) ? acts : []
    const ch = dash?.children || []
    children.value = ch
    if (ch.length > 0) {
      selectedChildId.value = ch[0].id
    }
  } catch (e: any) {
    error.value = e?.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
