<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.assignedActivities')"
        :subtitle="$t('parent.assignedActivitiesSubtitle')"
      />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <div v-else-if="!children.length" class="fk-card">
        <div class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center">
          <p class="text-sm text-gray-600">{{ $t('parent.noChildren') }}</p>
        </div>
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
              class="fk-fchip"
              :class="selectedChildId === child.id ? 'fk-fchip--active' : ''"
              :aria-pressed="selectedChildId === child.id"
              @click="selectedChildId = child.id"
            >
              {{ childChipLabel(child) }}
            </button>
          </div>
        </div>

        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('parent.assignedActivities') }}</h2>
              <p class="fk-card__meta">{{ $t('activities.activitiesCount', { count: filteredActivities.length }) }}</p>
            </div>
            <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <ListViewModeToggle v-model="viewMode" />
            </div>
          </header>

          <div v-if="filteredActivities.length" class="p-4 sm:p-6">
            <div v-if="isCards" class="fk-grid">
              <ParentActivityCard
                v-for="item in paginatedActivities"
                :key="item.id"
                :variant="cardVariant(item)"
                :title="item.title"
                :meta="cardMeta(item)"
                :eyebrow="completedEyebrow(item)"
                :date-badge="formatActivityDate(item.activity_date || '')"
                :day-number="activityDayNumber(item)"
                :weekday-short="activityWeekdayShort(item)"
                :status-chip="$t(`activities.status.${getActivityStatus(item)}`)"
                :chips="cardChips(item)"
                :approval-label="item.requires_parent_approval ? $t('activities.approvalRequiredBadge') : undefined"
              >
                <template v-if="item.requires_parent_approval && getActivityStatus(item) !== 'completed'" #actions>
                  <router-link to="/approvals" class="fk-btn fk-btn--navy !px-4 !py-2 text-sm">
                    {{ $t('parent.openApprovals') }}
                  </router-link>
                </template>
                <template v-else-if="item.location && getActivityStatus(item) === 'active'" #footer>
                  {{ item.location }}
                </template>
              </ParentActivityCard>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('activities.title') }}</th>
                    <th>{{ $t('activities.type') }}</th>
                    <th>{{ $t('activities.group') }}</th>
                    <th>{{ $t('activities.dueDate') }}</th>
                    <th>{{ $t('activities.statusLabel') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedActivities" :key="'list-' + item.id">
                    <td>
                      <div class="font-medium text-fikr-ink">{{ item.title }}</div>
                      <div v-if="item.requires_parent_approval" class="mt-0.5 text-xs font-medium text-navy-800">
                        {{ $t('activities.approvalRequiredBadge') }}
                      </div>
                    </td>
                    <td class="text-fikr-ink-muted">{{ formatActivityType(item.activity_type) }}</td>
                    <td class="text-fikr-ink-muted">{{ item.group?.name || $t('activities.unassignedGroup') }}</td>
                    <td class="whitespace-nowrap text-fikr-ink-muted">{{ activityWhen(item) }}</td>
                    <td>
                      <span class="fk-pill" :class="statusBadgeClass(getActivityStatus(item))">
                        {{ $t(`activities.status.${getActivityStatus(item)}`) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredActivities.length > 0"
              @update:page="goToPage"
            />
          </div>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center">
            <p class="text-sm text-gray-600">{{ $t('parent.noAssignedActivities') }}</p>
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
import ParentActivityCard from '@/components/ParentActivityCard.vue'
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

function childChipLabel(child: any) {
  const name = `${child.firstName || ''} ${child.lastName || ''}`.trim() || t('parent.childName')
  const group = formatParentGroupNames(child.groupNames, '')
  return group ? `${name} · ${group}` : name
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

function statusBadgeClass(status: 'active' | 'pending' | 'completed') {
  if (status === 'active') return 'fk-pill--teal'
  if (status === 'pending') return 'fk-pill--outline'
  return 'fk-pill--mist'
}

function cardVariant(item: { is_active?: boolean; activity_date?: string | Date; requires_parent_approval?: boolean }) {
  const status = getActivityStatus(item)
  if (status === 'completed') return 'completed' as const
  if (status === 'pending' || item.requires_parent_approval) return 'cover' as const
  return 'mist' as const
}

function cardMeta(item: {
  group?: { name?: string }
  start_time?: string
  end_time?: string
  location?: string
  activity_type?: string
}) {
  const parts: string[] = []
  if (item.group?.name) parts.push(item.group.name)
  if (item.start_time) {
    const start = formatTime(item.start_time)
    const end = item.end_time ? formatTime(item.end_time) : ''
    parts.push(end ? `${start} – ${end}` : start)
  }
  if (item.location) parts.push(item.location)
  return parts.join(' · ') || undefined
}

function cardChips(item: { activity_type?: string; requires_parent_approval?: boolean }) {
  const chips: string[] = []
  if (item.activity_type) chips.push(formatActivityType(item.activity_type))
  if (item.requires_parent_approval) chips.push(t('activities.approvalRequiredBadge'))
  return chips
}

function completedEyebrow(item: { activity_date?: string | Date }) {
  return t('parent.activityCompletedEyebrow', { date: formatActivityDate(item.activity_date || '') })
}

function activityDayNumber(item: { activity_date?: string | Date }) {
  const key = activityDateKey(item.activity_date)
  if (!key) return '—'
  const [, , d] = key.split('-')
  return String(Number(d) || d)
}

function activityWeekdayShort(item: { activity_date?: string | Date }) {
  const key = activityDateKey(item.activity_date)
  if (!key) return ''
  try {
    const [y, m, d] = key.split('-').map(Number)
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(y, m - 1, d).toLocaleDateString(loc, { weekday: 'short' })
  } catch {
    return ''
  }
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
