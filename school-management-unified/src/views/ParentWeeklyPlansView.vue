<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.weeklyPlans')"
        :subtitle="$t('parent.weeklyPlan')"
      />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadWeeklyPlansData">
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
            <div class="min-w-0 text-center sm:text-start">
              <h2 class="fk-card__title truncate">{{ formatWeekRange(currentWeekStart) }}</h2>
              <p class="fk-card__meta">{{ $t('parent.weeklyPlan') }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <button type="button" class="fk-btn fk-btn--pearl inline-flex items-center gap-2" @click="previousWeek">
                <svg class="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                {{ $t('common.previous') }}
              </button>
              <button type="button" class="fk-btn fk-btn--pearl inline-flex items-center gap-2" @click="nextWeek">
                {{ $t('common.next') }}
                <svg class="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </header>
        </div>

        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('parent.weeklyPlans') }}</h2>
              <p v-if="selectedChild" class="fk-card__meta">
                {{ selectedChild.firstName }} {{ selectedChild.lastName }} — {{ formatGroupNames(selectedChild.groupNames) }}
              </p>
            </div>
          </header>

          <div v-if="filteredWeeklyPlans.length > 0" class="divide-y divide-gray-100">
            <div v-for="plan in filteredWeeklyPlans" :key="plan.id" class="p-5 transition-colors hover:bg-gray-50/80 sm:p-6">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="mb-2 flex items-start gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                      <svg class="h-5 w-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900">
                        {{ plan.task_title || plan.title || plan.schedule?.course?.name || $t('parent.weeklyPlans') }}
                      </h3>
                      <p class="text-sm text-gray-600">
                        {{ plan.schedule?.course?.name || plan.schedule?.group?.name || '' }}
                      </p>
                    </div>
                  </div>

                  <div v-if="plan.task_description || plan.description" class="mb-3 text-gray-700">
                    {{ plan.task_description || plan.description }}
                  </div>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span class="flex items-center">
                      <svg class="me-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(plan.week_start_date) }}
                    </span>
                    <span v-if="planTeacherName(plan)" class="flex items-center">
                      <svg class="me-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ planTeacherName(plan) }}
                    </span>
                  </div>
                </div>

                <span
                  :class="[
                    'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
                    planDisplayStatus(plan) === 'completed' ? 'bg-green-100 text-green-800' :
                    planDisplayStatus(plan) === 'in_progress' ? 'bg-primary-100 text-primary-800' :
                    'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ getStatusText(planDisplayStatus(plan)) }}
                </span>
              </div>

              <div v-if="plan.completion_notes" class="mt-4 ms-12 sm:ms-14">
                <h4 class="mb-2 text-sm font-medium text-gray-900">{{ $t('parent.planNotes') }}</h4>
                <div class="whitespace-pre-wrap text-sm text-gray-600">{{ plan.completion_notes }}</div>
              </div>
            </div>
          </div>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('parent.noWeeklyPlans') }}</h3>
            <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ $t('parent.noData') }}</p>
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
import { getErrorMessage } from '@/utils/error-reporting'
import { personFullName } from '@/utils/person-name'

const { t, locale } = useI18n()

function formatGroupNames(names?: string | null) {
  return formatParentGroupNames(names, t('parent.noGroupAssigned'))
}
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedChildId = ref<string | null>(null)
const currentWeekStart = ref(new Date())

const children = computed(() => dashboardData.value.children || [])
const weeklyPlans = computed(() => dashboardData.value.weeklyPlans || [])

const selectedChild = computed(() => {
  if (!selectedChildId.value) return children.value[0]
  return children.value.find(child => child.id === selectedChildId.value) || children.value[0]
})

function planGroupId(plan: any): string {
  const raw = plan?.group_id ?? plan?.schedule?.group_id ?? plan?.schedule?.group?.id
  return raw != null ? String(raw) : ''
}

function planTeacherName(plan: any): string {
  return personFullName(plan?.schedule?.teacher, locale.value)
}

function parseLocalDate(val: string | Date | undefined | null): Date | null {
  if (val == null) return null
  if (val instanceof Date) {
    return new Date(val.getFullYear(), val.getMonth(), val.getDate())
  }
  const s = String(val).split('T')[0]
  const parts = s.split('-').map(Number)
  if (parts.length < 3 || parts.some(Number.isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function planOverlapsWeek(plan: any, weekStart: Date): boolean {
  const ws = parseLocalDate(plan.week_start_date)
  const we = parseLocalDate(plan.week_end_date) ?? ws
  if (!ws || !we) return true
  const rangeStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
  const rangeEnd = new Date(rangeStart)
  rangeEnd.setDate(rangeEnd.getDate() + 6)
  return ws <= rangeEnd && we >= rangeStart
}

function planDisplayStatus(plan: any): string {
  if (plan.is_completed === true || plan.status === 'completed') return 'completed'
  if (plan.status === 'in_progress') return 'in_progress'
  return 'not_started'
}

const filteredWeeklyPlans = computed(() => {
  if (!selectedChild.value) return []

  const childGroupIds = (selectedChild.value.groups?.map((g: { id: string }) => String(g.id)) || [])
  const weekStart = currentWeekStart.value

  return weeklyPlans.value.filter((plan: any) => {
    const gid = planGroupId(plan)
    if (childGroupIds.length && gid && !childGroupIds.includes(gid)) return false
    return planOverlapsWeek(plan, weekStart)
  })
})

const loadWeeklyPlansData = async () => {
  try {
    loading.value = true
    error.value = ''

    const data = await parentService.getMyWeeklyPlans()
    dashboardData.value = data

    if (data.children && data.children.length > 0) {
      selectedChildId.value = data.children[0].id
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err, t('parent.error'))
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return t('parent.noData')

  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    const d = parseLocalDate(dateString)
    return (d ?? new Date(dateString)).toLocaleDateString(loc, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return t('parent.noData')
  }
}

const formatWeekRange = (startDate: Date) => {
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return `${startDate.toLocaleDateString(loc, { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString(loc, { month: 'short', day: 'numeric' })}`
}

const previousWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
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
  const today = new Date()
  const dayOfWeek = today.getDay()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - dayOfWeek)
  currentWeekStart.value = startOfWeek

  loadWeeklyPlansData()
})
</script>
