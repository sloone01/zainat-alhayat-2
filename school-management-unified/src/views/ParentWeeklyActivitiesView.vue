<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">{{ $t('parent.weeklyActivities') }}</h1>
        <p class="text-purple-100">{{ $t('parent.completedActivities') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
        <button @click="loadActivitiesData" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Activities Content -->
      <div v-else class="space-y-6">
        <!-- Children Filter -->
        <div v-if="children.length > 1" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ $t('parent.myChildren') }}</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="child in children"
              :key="child.id"
              @click="selectedChildId = child.id"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedChildId === child.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ child.firstName }} {{ child.lastName }}
            </button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              @click="activeTab = 'completed'"
              :class="[
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                activeTab === 'completed'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ $t('parent.completedActivities') }}
            </button>
            <button
              @click="activeTab = 'upcoming'"
              :class="[
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                activeTab === 'upcoming'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ $t('parent.upcomingActivities') }}
            </button>
          </div>
        </div>

        <!-- Activities List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ activeTab === 'completed' ? $t('parent.completedActivities') : $t('parent.upcomingActivities') }}
            </h2>
            <p v-if="selectedChild" class="text-sm text-gray-600 mt-1">
              {{ selectedChild.firstName }} {{ selectedChild.lastName }} - {{ selectedChild.groupNames }}
            </p>
          </div>

          <div v-if="filteredActivities.length > 0" class="divide-y divide-gray-200">
            <div v-for="activity in filteredActivities" :key="activity.id" class="p-6 hover:bg-gray-50">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <div :class="[
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      activityUiStatus(activity) === 'completed' ? 'bg-green-100' : 'bg-purple-100'
                    ]">
                      <svg v-if="activityUiStatus(activity) === 'completed'" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg v-else class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">
                        {{ activity.task_title || activity.title || activity.objectives || $t('parent.weeklyActivities') }}
                      </h3>
                      <p class="text-sm text-gray-600">{{ activity.schedule?.course?.name || activity.schedule?.group?.name }}</p>
                    </div>
                  </div>
                  
                  <div v-if="activity.task_description || activity.description || activity.activities" class="text-gray-700 mb-3">
                    {{ activity.task_description || activity.description || activity.activities }}
                  </div>
                  
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(activity.week_start_date || activity.created_at) }}
                    </span>
                    
                    <span v-if="activity.schedule?.teacher" class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ activity.schedule.teacher.firstName }} {{ activity.schedule.teacher.lastName }}
                    </span>
                    
                    <span v-if="activity.duration" class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ activity.duration }} {{ $t('common.minutes') }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  ]">
                    {{ getStatusText(activity.status) }}
                  </span>
                </div>
              </div>
              
              <!-- Learning Outcomes -->
              <div v-if="activity.learning_outcomes" class="mt-4 pl-13">
                <h4 class="text-sm font-medium text-gray-900 mb-2">نتائج التعلم</h4>
                <div class="text-sm text-gray-600">
                  {{ activity.learning_outcomes }}
                </div>
              </div>
              
              <!-- Materials Used -->
              <div v-if="activity.materials" class="mt-4 pl-13">
                <h4 class="text-sm font-medium text-gray-900 mb-2">المواد المستخدمة</h4>
                <div class="text-sm text-gray-600">
                  {{ activity.materials }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-12 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ activeTab === 'completed' ? 'لا توجد أنشطة مكتملة' : 'لا توجد أنشطة قادمة' }}
            </h3>
            <p class="text-gray-500">{{ $t('parent.noData') }}</p>
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

const { t, locale } = useI18n()

function planGroupId(plan: any): string {
  const raw = plan?.group_id ?? plan?.schedule?.group_id
  return raw != null ? String(raw) : ''
}

function activityUiStatus(activity: any): string {
  if (activity.is_completed === true || activity.status === 'completed') return 'completed'
  if (activity.status === 'in_progress') return 'in_progress'
  return 'not_started'
}

// Reactive data
const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedChildId = ref<string | null>(null)
const activeTab = ref<'completed' | 'upcoming'>('completed')

// Computed properties
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

// Methods
const loadActivitiesData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const data = await parentService.getMyDashboardData()
    dashboardData.value = data
    
    // Set first child as selected by default
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

// Lifecycle
onMounted(() => {
  loadActivitiesData()
})
</script>
