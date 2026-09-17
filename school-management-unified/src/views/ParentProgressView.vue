<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.progress')"
        :subtitle="$t('parent.progressOverview')"
      />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-gray-600">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error">
        <ActivityCard :title="$t('parent.progress')">
          <template #icon>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </template>
          <template #list>
            <div class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center">
              <p class="text-sm font-semibold text-zinc-800">{{ error }}</p>
              <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadProgressData">
                {{ $t('common.retry') }}
              </button>
            </div>
          </template>
        </ActivityCard>
      </div>

      <template v-else>
        <div v-if="!progressData.length">
          <ActivityCard :title="$t('parent.progress')">
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
              </svg>
            </template>
            <template #list>
              <div class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center">
                <p class="text-sm font-semibold text-zinc-800">{{ $t('parent.noChildren') }}</p>
              </div>
            </template>
          </ActivityCard>
        </div>

        <div v-else class="space-y-6">
          <ActivityCard
            v-if="progressData.length > 1"
            :title="$t('parent.myChildren')"
          >
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </template>
            <template #list>
              <button
                v-for="childProgress in progressData"
                :key="childProgress.student.id"
                type="button"
                class="flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-start transition-colors duration-200"
                :class="selectedProgressChildId === childProgress.student.id
                  ? 'border-primary-300 bg-primary-50/70'
                  : 'border-zinc-200/50 bg-zinc-50 hover:border-zinc-300'"
                @click="selectChild(childProgress.student.id)"
              >
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  :class="selectedProgressChildId === childProgress.student.id ? 'bg-primary-600' : 'bg-zinc-400'"
                >
                  {{ initials(childProgress.student) }}
                </span>
                <span class="min-w-0 truncate text-sm font-medium text-zinc-800">
                  {{ childProgress.student.firstName }} {{ childProgress.student.lastName }}
                </span>
              </button>
            </template>
          </ActivityCard>

          <ActivityCard
            :title="selectedChildName"
            :category="selectedGroupNames"
            :metrics="selectedMetrics"
          >
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </template>

            <div v-if="!selectedRows.length" class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center">
              <p class="text-sm font-semibold text-zinc-800">{{ $t('parent.noProgress') }}</p>
            </div>

            <div v-else class="space-y-3">
              <h3 class="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {{ $t('parent.milestones') }}
              </h3>
              <div class="overflow-hidden rounded-xl border border-zinc-200">
                <table class="w-full text-sm">
                  <tbody>
                    <template v-for="row in selectedRows" :key="row.id">
                      <tr class="border-b border-zinc-100 last:border-0">
                        <td class="px-4 py-3">
                          <div class="flex items-center gap-2">
                            <button
                              v-if="row.detail"
                              type="button"
                              class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-800"
                              :aria-expanded="expandedRowId === row.id"
                              :aria-label="row.label"
                              @click="toggleRow(row.id)"
                            >
                              <svg
                                class="h-4 w-4 transition-transform duration-200"
                                :class="expandedRowId === row.id ? 'rotate-90 rtl:rotate-[-90deg]' : ''"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <span class="min-w-0 font-medium text-zinc-800">{{ row.label }}</span>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-end">
                          <span class="whitespace-nowrap font-semibold" :class="statusTextClass(row.status)">
                            {{ getStatusText(row.status) }}
                          </span>
                        </td>
                      </tr>
                      <tr
                        v-if="row.detail && expandedRowId === row.id"
                        class="border-b border-zinc-100 bg-zinc-50/80 last:border-0"
                      >
                        <td colspan="2" class="px-4 py-2.5 text-xs text-zinc-600">
                          {{ row.detail }}
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </ActivityCard>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ActivityCard, { type ActivityMetric } from '@/components/ui/activity-card.vue'
import { parentService } from '@/services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import FikrLoader from '@/components/FikrLoader.vue'

const METRIC_COLORS = {
  completed: '#2CD758',
  inProgress: '#00A19B',
  notStarted: '#007AFF',
} as const

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedProgressChildId = ref<string | null>(null)
const expandedRowId = ref('')

const progressData = computed(() => dashboardData.value.progress || [])

const selectedChildProgress = computed(() => {
  if (!selectedProgressChildId.value) return progressData.value[0]
  return progressData.value.find((p: any) => p.student.id === selectedProgressChildId.value) || progressData.value[0]
})

const selectedChildName = computed(() => {
  const student = selectedChildProgress.value?.student
  return student ? `${student.firstName} ${student.lastName}`.trim() : t('parent.progress')
})

const selectedGroupNames = computed(() => {
  const student = selectedChildProgress.value?.student
  if (!student) return ''
  const fromGroups = student.groups?.map((g: { name: string }) => g.name).join(', ')
  return formatParentGroupNames(fromGroups || student.groupNames, t('parent.noGroupAssigned'))
})

const selectedItems = computed(() => selectedChildProgress.value?.progress || [])

const selectedMetrics = computed<ActivityMetric[]>(() => {
  const list = selectedItems.value
  const total = list.length
  const completed = list.filter((p: any) => p.status === 'completed').length
  const inProgress = list.filter((p: any) => p.status === 'in_progress').length
  const notStarted = list.filter((p: any) => p.status === 'not_started' || !p.status).length
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)
  return [
    {
      key: 'completed',
      label: t('parent.completed'),
      value: String(completed),
      trend: pct(completed),
      color: METRIC_COLORS.completed,
    },
    {
      key: 'inProgress',
      label: t('parent.inProgress'),
      value: String(inProgress),
      trend: pct(inProgress),
      color: METRIC_COLORS.inProgress,
    },
    {
      key: 'notStarted',
      label: t('parent.notStarted'),
      value: String(notStarted),
      trend: pct(notStarted),
      color: METRIC_COLORS.notStarted,
    },
  ]
})

const selectedRows = computed(() =>
  selectedItems.value.map((progress: any) => ({
    id: String(progress.id),
    label: progress.milestone?.title || progress.milestone?.name || t('parent.milestones'),
    status: progress.status || 'not_started',
    detail: String(progress.teacher_notes || '').trim() || undefined,
  })),
)

function selectChild(id: string) {
  selectedProgressChildId.value = id
  expandedRowId.value = ''
}

function toggleRow(id: string) {
  expandedRowId.value = expandedRowId.value === id ? '' : id
}

function initials(student: { firstName?: string; lastName?: string }) {
  const a = (student.firstName || '').trim().charAt(0)
  const b = (student.lastName || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

function statusTextClass(status: string) {
  switch (status) {
    case 'completed':
      return 'text-emerald-600'
    case 'in_progress':
      return 'text-primary-700'
    default:
      return 'text-zinc-500'
  }
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
