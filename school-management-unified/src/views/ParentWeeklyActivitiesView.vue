<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.weeklyActivities')"
        :subtitle="$t('parent.weeklyActivitiesSubtitle')"
      />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12">
        <FikrLoader />
        <span class="text-fikr-ink-muted">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-elev">
        <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
          <p class="fk-display text-lg font-bold text-navy-800">{{ $t('parent.error') }}</p>
          <p class="mt-1 text-sm text-fikr-ink-muted">{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="loadActivitiesData">
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
              @click="selectedChildId = child.id"
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

          <div v-if="filteredActivities.length > 0" class="divide-y divide-fikr-hairline">
            <div v-for="activity in filteredActivities" :key="activity.id" class="p-5 transition-colors hover:bg-fikr-pearl sm:p-6">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="mb-2 flex items-start gap-3">
                    <div
                      :class="[
                        'flex h-10 w-10 shrink-0 items-center justify-center',
                        activityUiStatus(activity) === 'completed'
                          ? 'rounded-full bg-primary-500 text-white'
                          : 'rounded-lg bg-fikr-mist text-navy-800',
                      ]"
                    >
                      <svg v-if="activityUiStatus(activity) === 'completed'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <h3 class="fk-display text-lg font-bold leading-7 text-navy-800">
                        {{ activity.task_title || activity.title || activity.objectives || $t('parent.weeklyActivities') }}
                      </h3>
                      <p class="text-sm text-fikr-ink-muted">{{ activity.schedule?.course?.name || activity.schedule?.group?.name }}</p>
                    </div>
                  </div>

                  <div v-if="activity.task_description || activity.description || activity.activities" class="mb-3 text-sm leading-6 text-fikr-ink-muted">
                    {{ activity.task_description || activity.description || activity.activities }}
                  </div>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fikr-ink-muted">
                    <span class="flex items-center">
                      <svg class="me-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(activity.week_start_date || activity.created_at) }}
                    </span>
                    <span v-if="activity.schedule?.teacher" class="flex items-center">
                      <svg class="me-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ activity.schedule.teacher.firstName }} {{ activity.schedule.teacher.lastName }}
                    </span>
                    <span v-if="activity.duration" class="flex items-center tabular-nums">
                      <svg class="me-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ activity.duration }} {{ $t('common.minutes') }}
                    </span>
                  </div>
                </div>

                <span
                  class="fk-pill shrink-0"
                  :class="activity.status === 'completed'
                    ? 'fk-pill--teal'
                    : activity.status === 'in_progress'
                      ? 'fk-pill--outline'
                      : 'fk-pill--mist'"
                >
                  {{ getStatusText(activity.status) }}
                </span>
              </div>

              <div v-if="activity.learning_outcomes" class="mt-4 ms-12 sm:ms-14">
                <h4 class="mb-2 text-sm font-medium text-navy-800">نتائج التعلم</h4>
                <div class="text-sm text-fikr-ink-muted">{{ activity.learning_outcomes }}</div>
              </div>

              <div v-if="activity.materials" class="mt-4 ms-12 sm:ms-14">
                <h4 class="mb-2 text-sm font-medium text-navy-800">المواد المستخدمة</h4>
                <div class="text-sm text-fikr-ink-muted">{{ activity.materials }}</div>
              </div>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { parentService } from '../services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()

function formatGroupNames(names?: string | null) {
  return formatParentGroupNames(names, t('parent.noGroupAssigned'))
}
const isRTL = computed(() => locale.value === 'ar')

function planGroupId(plan: any): string {
  const raw = plan?.group_id ?? plan?.schedule?.group_id
  return raw != null ? String(raw) : ''
}

function activityUiStatus(activity: any): string {
  if (activity.is_completed === true || activity.status === 'completed') return 'completed'
  if (activity.status === 'in_progress') return 'in_progress'
  return 'not_started'
}

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedChildId = ref<string | null>(null)
const activeTab = ref<'completed' | 'upcoming'>('completed')

const children = computed(() => dashboardData.value.children || [])
const weeklyPlans = computed(() => dashboardData.value.weeklyPlans || [])

const selectedChild = computed(() => {
  if (!selectedChildId.value) return children.value[0]
  return children.value.find(child => child.id === selectedChildId.value) || children.value[0]
})

const filteredActivities = computed(() => {
  if (!selectedChild.value) return []

  const childGroupIds = (selectedChild.value.groups?.map((g: { id: string }) => String(g.id)) || [])
  const childPlans = weeklyPlans.value.filter((plan: any) => {
    const gid = planGroupId(plan)
    return gid && childGroupIds.includes(gid)
  })

  if (activeTab.value === 'completed') {
    return childPlans.filter((plan: any) => activityUiStatus(plan) === 'completed')
  }
  return childPlans.filter((plan: any) => activityUiStatus(plan) !== 'completed')
})

const loadActivitiesData = async () => {
  try {
    loading.value = true
    error.value = ''

    const data = await parentService.getMyDashboardData()
    dashboardData.value = data

    if (data.children && data.children.length > 0) {
      selectedChildId.value = data.children[0].id
    }

    console.log('Parent activities data loaded:', data)
  } catch (err: any) {
    console.error('Error loading parent activities data:', err)
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

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

onMounted(() => {
  loadActivitiesData()
})
</script>
