<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.progress')"
        :subtitle="$t('parent.progressOverview')"
      />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadProgressData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <div v-else class="space-y-6">
        <div v-if="progressData.length > 0" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div v-for="childProgress in progressData" :key="childProgress.student.id" class="fk-card">
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
              <div class="flex min-w-0 items-center gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <span class="text-lg font-bold text-primary-700">
                    {{ childProgress.student.firstName?.charAt(0) }}{{ childProgress.student.lastName?.charAt(0) }}
                  </span>
                </div>
                <div class="min-w-0">
                  <h2 class="fk-card__title truncate">
                    {{ childProgress.student.firstName }} {{ childProgress.student.lastName }}
                  </h2>
                  <p class="fk-card__meta">{{ childProgress.student.groupNames || $t('parent.noData') }}</p>
                </div>
              </div>
            </header>

            <div class="space-y-6 p-5 sm:p-6">
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">{{ $t('parent.overallProgress') }}</span>
                  <span class="text-sm font-bold text-primary-700">{{ calculateOverallProgress(childProgress.progress) }}%</span>
                </div>
                <div class="h-3 w-full rounded-full bg-gray-200">
                  <div
                    class="h-3 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                    :style="`width: ${calculateOverallProgress(childProgress.progress)}%`"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ getCompletedCount(childProgress.progress) }}</div>
                  <div class="text-xs text-gray-600">{{ $t('parent.completed') }}</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-primary-600">{{ getInProgressCount(childProgress.progress) }}</div>
                  <div class="text-xs text-gray-600">{{ $t('parent.inProgress') }}</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-600">{{ getNotStartedCount(childProgress.progress) }}</div>
                  <div class="text-xs text-gray-600">{{ $t('parent.notStarted') }}</div>
                </div>
              </div>

              <div v-if="childProgress.progress.length > 0">
                <h4 class="mb-3 text-sm font-medium text-gray-900">{{ $t('parent.recentActivities') }}</h4>
                <div class="max-h-48 space-y-3 overflow-y-auto">
                  <div
                    v-for="progress in childProgress.progress.slice(0, 5)"
                    :key="progress.id"
                    class="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <div
                      :class="[
                        'h-3 w-3 shrink-0 rounded-full',
                        progress.status === 'completed' ? 'bg-green-500' :
                        progress.status === 'in_progress' ? 'bg-primary-500' :
                        'bg-gray-300',
                      ]"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-gray-900">
                        {{ progress.milestone?.title || progress.milestone?.name || 'معلم تعليمي' }}
                      </p>
                      <p class="text-xs text-gray-600">
                        {{ progress.milestone?.phase?.course?.name || 'مقرر دراسي' }}
                      </p>
                    </div>
                    <div class="text-xs text-gray-500">{{ formatDate(progress.updated_at) }}</div>
                  </div>
                </div>
              </div>

              <div v-else class="flex flex-col items-center py-8 text-center">
                <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600">{{ $t('parent.noProgress') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="fk-card">
          <div class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('parent.noChildren') }}</h3>
            <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ $t('parent.noData') }}</p>
          </div>
        </div>

        <div v-if="progressData.length > 0" class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('parent.childProgress') }}</h2>
              <p class="fk-card__meta">تفاصيل التقدم لكل طالب</p>
            </div>
          </header>

          <div class="p-5 sm:p-6">
            <div v-if="progressData.length > 1" class="mb-6 flex flex-wrap gap-2">
              <button
                v-for="childProgress in progressData"
                :key="childProgress.student.id"
                type="button"
                :class="[
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  selectedProgressChildId === childProgress.student.id
                    ? 'border border-primary-500 bg-primary-50 text-primary-900 ring-2 ring-primary-500/30'
                    : 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
                @click="selectedProgressChildId = childProgress.student.id"
              >
                {{ childProgress.student.firstName }} {{ childProgress.student.lastName }}
              </button>
            </div>

            <div v-if="selectedChildProgress" class="space-y-4">
              <div
                v-for="progress in selectedChildProgress.progress"
                :key="progress.id"
                class="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50/80"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <div class="mb-2 flex items-start gap-3">
                      <div
                        :class="[
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          progress.status === 'completed' ? 'bg-green-100' :
                          progress.status === 'in_progress' ? 'bg-primary-100' :
                          'bg-gray-100',
                        ]"
                      >
                        <svg v-if="progress.status === 'completed'" class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <svg v-else-if="progress.status === 'in_progress'" class="h-4 w-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <svg v-else class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <h4 class="font-semibold text-gray-900">
                          {{ progress.milestone?.title || progress.milestone?.name || 'معلم تعليمي' }}
                        </h4>
                        <p class="text-sm text-gray-600">
                          {{ progress.milestone?.phase?.course?.name || 'مقرر دراسي' }}
                        </p>
                      </div>
                    </div>

                    <div v-if="progress.teacher_notes" class="mt-2 ms-11 text-sm text-gray-700">
                      <strong>ملاحظات المعلم:</strong> {{ progress.teacher_notes }}
                    </div>
                  </div>

                  <div class="shrink-0 text-end">
                    <span
                      :class="[
                        'rounded-full px-2 py-1 text-xs font-medium',
                        progress.status === 'completed' ? 'bg-green-100 text-green-800' :
                        progress.status === 'in_progress' ? 'bg-primary-100 text-primary-800' :
                        'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ getStatusText(progress.status) }}
                    </span>
                    <p class="mt-1 text-xs text-gray-500">{{ formatDate(progress.updated_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
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

const { t, locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedProgressChildId = ref<string | null>(null)

const progressData = computed(() => dashboardData.value.progress || [])

const selectedChildProgress = computed(() => {
  if (!selectedProgressChildId.value) return progressData.value[0]
  return progressData.value.find(p => p.student.id === selectedProgressChildId.value) || progressData.value[0]
})

const loadProgressData = async () => {
  try {
    loading.value = true
    error.value = ''

    const data = await parentService.getMyDashboardData()
    dashboardData.value = data

    if (data.progress && data.progress.length > 0) {
      selectedProgressChildId.value = data.progress[0].student.id
    }

    console.log('Parent progress data loaded:', data)
  } catch (err: any) {
    console.error('Error loading parent progress data:', err)
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

const calculateOverallProgress = (progressList: any[]) => {
  if (!progressList || progressList.length === 0) return 0

  const completedCount = progressList.filter(p => p.status === 'completed').length
  return Math.round((completedCount / progressList.length) * 100)
}

const getCompletedCount = (progressList: any[]) => {
  return progressList.filter(p => p.status === 'completed').length
}

const getInProgressCount = (progressList: any[]) => {
  return progressList.filter(p => p.status === 'in_progress').length
}

const getNotStartedCount = (progressList: any[]) => {
  return progressList.filter(p => p.status === 'not_started' || !p.status).length
}

const formatDate = (dateString: string) => {
  if (!dateString) return t('parent.noData')

  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(dateString).toLocaleDateString(loc, {
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
  loadProgressData()
})
</script>
