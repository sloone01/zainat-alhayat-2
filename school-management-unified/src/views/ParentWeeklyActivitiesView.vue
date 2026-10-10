<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.weeklyActivities')"
        :subtitle="$t('parent.weeklyActivitiesSubtitle')"
      />

      <div v-if="loading && !loaded" class="flex items-center justify-center gap-3 py-12">
        <FikrLoader />
        <span class="text-fikr-ink-muted">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error && !loaded" class="fk-elev">
        <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
          <p class="fk-display text-lg font-bold text-navy-800">{{ $t('parent.error') }}</p>
          <p class="mt-1 text-sm text-fikr-ink-muted">{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="reload">
            {{ $t('common.retry') }}
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div v-if="children.length > 1" class="fk-elev p-0">
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
              @click="selectChild(child.id)"
            >
              {{ child.firstName }} {{ child.lastName }}
            </button>
          </div>
        </div>

        <div class="fk-elev p-0">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">
                {{ activeTab === 'completed' ? $t('parent.completedActivities') : $t('parent.upcomingActivities') }}
              </h2>
              <p v-if="selectedChild" class="fk-card__meta">
                {{ selectedChild.firstName }} {{ selectedChild.lastName }} — {{ formatGroupNames(selectedChild.groupNames) }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="fk-fchip"
                :class="activeTab === 'completed' ? 'fk-fchip--active' : ''"
                :aria-pressed="activeTab === 'completed'"
                @click="activeTab = 'completed'"
              >
                {{ $t('parent.completedActivities') }}
              </button>
              <button
                type="button"
                class="fk-fchip"
                :class="activeTab === 'upcoming' ? 'fk-fchip--active' : ''"
                :aria-pressed="activeTab === 'upcoming'"
                @click="activeTab = 'upcoming'"
              >
                {{ $t('parent.upcomingActivities') }}
              </button>
            </div>
          </header>

          <div v-if="activitiesTotal > 0" class="p-5 sm:p-6">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ParentActivityCard
                v-for="activity in paginatedItems"
                :key="activity.id"
                :variant="activityUiStatus(activity) === 'completed' ? 'completed' : 'mist'"
                :title="activity.task_title || activity.title || activity.objectives || $t('parent.weeklyActivities')"
                :meta="weeklyMeta(activity)"
                :eyebrow="$t('parent.activityCompletedEyebrow', { date: formatDate(activity.week_start_date || activity.created_at) })"
                :day-number="weeklyDayNumber(activity)"
                :weekday-short="weeklyWeekdayShort(activity)"
                :status-chip="getStatusText(activity.status || activityUiStatus(activity))"
                :chips="weeklyChips(activity)"
              >
                <template v-if="activity.materials || activity.learning_outcomes" #footer>
                  {{ activity.learning_outcomes || activity.materials }}
                </template>
              </ParentActivityCard>
            </div>
            <div class="mt-5">
              <FikrPagination
                :page="currentPage"
                :pages="totalPages"
                :show="activitiesTotal > 0"
                @update:page="goToPage"
              />
            </div>
          </div>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-fikr-mist text-navy-800">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-navy-800">
              {{ activeTab === 'completed' ? 'لا توجد أنشطة مكتملة' : 'لا توجد أنشطة قادمة' }}
            </h3>
            <p class="mx-auto mt-1 max-w-md text-sm text-fikr-ink-muted">{{ $t('parent.noData') }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { useServerPagination } from '@/composables/useServerPagination'
import ParentActivityCard from '@/components/ParentActivityCard.vue'
import { parentService, type ParentListChild } from '../services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import { getErrorMessage } from '@/utils/error-reporting'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()

function formatGroupNames(names?: string | null) {
  return formatParentGroupNames(names, t('parent.noGroupAssigned'))
}
const isRTL = computed(() => locale.value === 'ar')

function activityUiStatus(activity: any): string {
  if (activity.is_completed === true || activity.status === 'completed') return 'completed'
  if (activity.status === 'in_progress') return 'in_progress'
  return 'not_started'
}

const error = ref('')
const children = ref<ParentListChild[]>([])
const selectedChildId = ref<string | null>(null)
const pinnedChildId = ref('')
const activeTab = ref<'completed' | 'upcoming'>('completed')

function selectChild(id: string) {
  selectedChildId.value = id
  pinnedChildId.value = id
}

const selectedChild = computed(() => {
  if (!selectedChildId.value) return children.value[0]
  return children.value.find((child) => child.id === selectedChildId.value) || children.value[0]
})

const {
  items: paginatedItems,
  total: activitiesTotal,
  loading,
  loaded,
  currentPage,
  totalPages,
  goToPage,
  load,
  reload,
} = useServerPagination<any, { childId: string; status: 'completed' | 'upcoming' }>(
  async (params) => {
    error.value = ''
    const data = await parentService.getMyWeeklyPlansPage({
      page: params.page,
      limit: params.limit,
      childId: params.childId || undefined,
      status: params.status,
    })
    children.value = data.children || []
    if (!params.childId && data.childId) selectedChildId.value = data.childId
    return data
  },
  {
    filters: () => ({
      childId: pinnedChildId.value,
      status: activeTab.value,
    }),
    onError: (err) => {
      error.value = getErrorMessage(err, t('parent.error'))
    },
  },
)

const formatDate = (dateString: string) => {
  if (!dateString) return t('parent.noData')

  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(dateString).toLocaleDateString(loc, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return t('parent.noData')
  }
}

const getStatusText = (status: string) => {
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

function weeklyMeta(activity: any) {
  const parts: string[] = []
  if (activity.schedule?.course?.name) parts.push(activity.schedule.course.name)
  if (activity.schedule?.group?.name) parts.push(activity.schedule.group.name)
  if (activity.schedule?.teacher) {
    parts.push(`${activity.schedule.teacher.firstName || ''} ${activity.schedule.teacher.lastName || ''}`.trim())
  }
  return parts.filter(Boolean).join(' · ') || undefined
}

function weeklyChips(activity: any) {
  const chips: string[] = []
  if (activity.duration) chips.push(`${activity.duration} ${t('common.minutes')}`)
  if (activity.materials) chips.push(String(activity.materials).split(',')[0]?.trim() || '')
  return chips.filter(Boolean)
}

function weeklyDayNumber(activity: any) {
  const raw = activity.week_start_date || activity.created_at
  if (!raw) return '—'
  try {
    return String(new Date(raw).getDate())
  } catch {
    return '—'
  }
}

function weeklyWeekdayShort(activity: any) {
  const raw = activity.week_start_date || activity.created_at
  if (!raw) return ''
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(raw).toLocaleDateString(loc, { weekday: 'short' })
  } catch {
    return ''
  }
}

void load()
</script>
