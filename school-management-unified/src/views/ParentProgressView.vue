<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">{{ $t('parent.progress') }}</h1>
        <p class="text-orange-100">{{ $t('parent.progressOverview') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <span class="ml-3 text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 mb-2">
          <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-red-800 mb-2">{{ $t('parent.error') }}</h3>
        <p class="text-red-600">{{ error }}</p>
        <button @click="loadProgressData" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Progress Content -->
      <div v-else class="space-y-6">
        <!-- Children Progress Cards -->
        <div v-if="progressData.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="childProgress in progressData" :key="childProgress.student.id" 
               class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <!-- Child Header -->
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <span class="text-orange-600 font-bold text-lg">
                  {{ childProgress.student.firstName?.charAt(0) }}{{ childProgress.student.lastName?.charAt(0) }}
                </span>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ childProgress.student.firstName }} {{ childProgress.student.lastName }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ childProgress.student.groupNames || $t('parent.noData') }}
                </p>
              </div>
            </div>

            <!-- Progress Summary -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">{{ $t('parent.overallProgress') }}</span>
                <span class="text-sm font-bold text-orange-600">{{ calculateOverallProgress(childProgress.progress) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div 
                  class="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500" 
                  :style="`width: ${calculateOverallProgress(childProgress.progress)}%`"
                ></div>
              </div>
            </div>

            <!-- Progress Stats -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ getCompletedCount(childProgress.progress) }}</div>
                <div class="text-xs text-gray-600">{{ $t('parent.completed') }}</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ getInProgressCount(childProgress.progress) }}</div>
                <div class="text-xs text-gray-600">{{ $t('parent.inProgress') }}</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-600">{{ getNotStartedCount(childProgress.progress) }}</div>
                <div class="text-xs text-gray-600">{{ $t('parent.notStarted') }}</div>
              </div>
            </div>

            <!-- Recent Progress -->
            <div v-if="childProgress.progress.length > 0">
              <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('parent.recentActivities') }}</h4>
              <div class="space-y-3 max-h-48 overflow-y-auto">
                <div v-for="progress in childProgress.progress.slice(0, 5)" :key="progress.id" 
                     class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div :class="[
                    'w-3 h-3 rounded-full flex-shrink-0',
                    progress.status === 'completed' ? 'bg-green-500' :
                    progress.status === 'in_progress' ? 'bg-blue-500' :
                    'bg-gray-300'
                  ]"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ progress.milestone?.title || progress.milestone?.name || 'معلم تعليمي' }}
                    </p>
                    <p class="text-xs text-gray-600">
                      {{ progress.milestone?.phase?.course?.name || 'مقرر دراسي' }}
                    </p>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(progress.updated_at) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- No Progress Data -->
            <div v-else class="text-center py-8">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p class="text-sm text-gray-600">{{ $t('parent.noProgress') }}</p>
            </div>
          </div>
        </div>

        <!-- No Children Data -->
        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('parent.noChildren') }}</h3>
          <p class="text-gray-500">{{ $t('parent.noData') }}</p>
        </div>

        <!-- Detailed Progress Section -->
        <div v-if="progressData.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">{{ $t('parent.childProgress') }}</h2>
            <p class="text-sm text-gray-600 mt-1">تفاصيل التقدم لكل طفل</p>
          </div>

          <div class="p-6">
            <!-- Child Selector -->
            <div v-if="progressData.length > 1" class="mb-6">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="childProgress in progressData"
                  :key="childProgress.student.id"
                  @click="selectedProgressChildId = childProgress.student.id"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedProgressChildId === childProgress.student.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ childProgress.student.firstName }} {{ childProgress.student.lastName }}
                </button>
              </div>
            </div>

            <!-- Detailed Progress List -->
            <div v-if="selectedChildProgress" class="space-y-4">
              <div v-for="progress in selectedChildProgress.progress" :key="progress.id" 
                   class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <div :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        progress.status === 'completed' ? 'bg-green-100' :
                        progress.status === 'in_progress' ? 'bg-blue-100' :
                        'bg-gray-100'
                      ]">
                        <svg v-if="progress.status === 'completed'" class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <svg v-else-if="progress.status === 'in_progress'" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <svg v-else class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 class="font-semibold text-gray-900">
                          {{ progress.milestone?.title || progress.milestone?.name || 'معلم تعليمي' }}
                        </h4>
                        <p class="text-sm text-gray-600">
                          {{ progress.milestone?.phase?.course?.name || 'مقرر دراسي' }}
                        </p>
                      </div>
                    </div>
                    
                    <div v-if="progress.teacher_notes" class="text-sm text-gray-700 mt-2 pl-11">
                      <strong>ملاحظات المعلم:</strong> {{ progress.teacher_notes }}
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <span :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      progress.status === 'completed' ? 'bg-green-100 text-green-800' :
                      progress.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    ]">
                      {{ getStatusText(progress.status) }}
                    </span>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(progress.updated_at) }}</p>
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
import { parentService } from '../services/parent.service'

const { t } = useI18n()

// Reactive data
const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedProgressChildId = ref<string | null>(null)

// Computed properties
const progressData = computed(() => dashboardData.value.progress || [])

const selectedChildProgress = computed(() => {
  if (!selectedProgressChildId.value) return progressData.value[0]
  return progressData.value.find(p => p.student.id === selectedProgressChildId.value) || progressData.value[0]
})

// Methods
const loadProgressData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const data = await parentService.getMyDashboardData()
    dashboardData.value = data
    
    // Set first child as selected by default
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
    return new Date(dateString).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric'
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

// Lifecycle
onMounted(() => {
  loadProgressData()
})
</script>
