<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">{{ $t('parent.welcomeMessage') }}</h1>
        <p class="text-blue-100">{{ $t('parent.childrenOverview') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <button @click="loadDashboardData" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Children -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.summary?.totalChildren || 0 }}</p>
                <p class="text-sm text-gray-600">{{ $t('parent.myChildren') }}</p>
              </div>
            </div>
          </div>

          <!-- Total Groups -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.summary?.totalGroups || 0 }}</p>
                <p class="text-sm text-gray-600">{{ $t('parent.groupName') }}</p>
              </div>
            </div>
          </div>

          <!-- Total Schedules -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.summary?.totalSchedules || 0 }}</p>
                <p class="text-sm text-gray-600">{{ $t('parent.schedule') }}</p>
              </div>
            </div>
          </div>

          <!-- Weekly Plans -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.summary?.totalWeeklyPlans || 0 }}</p>
                <p class="text-sm text-gray-600">{{ $t('parent.weeklyPlans') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Children Overview -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('parent.myChildren') }}</h2>
          
          <div v-if="dashboardData.children && dashboardData.children.length > 0" class="space-y-4">
            <div v-for="child in dashboardData.children" :key="child.id" 
                 class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-blue-600 font-semibold">{{ child.firstName?.charAt(0) }}{{ child.lastName?.charAt(0) }}</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ child.firstName }} {{ child.lastName }}</h3>
                    <p class="text-sm text-gray-600">{{ child.groupNames || $t('parent.noData') }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">{{ $t('parent.lastUpdate') }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(child.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('parent.noChildren') }}</h3>
            <p class="text-gray-500">{{ $t('parent.noData') }}</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link to="/parent/schedule" 
                       class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">{{ $t('parent.schedule') }}</span>
            </div>
          </router-link>

          <router-link to="/parent/weekly-plans" 
                       class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">{{ $t('parent.weeklyPlans') }}</span>
            </div>
          </router-link>

          <router-link to="/parent/weekly-activities" 
                       class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">{{ $t('parent.weeklyActivities') }}</span>
            </div>
          </router-link>

          <router-link to="/parent/progress" 
                       class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">{{ $t('parent.progress') }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { parentService } from '../services/parent.service'

const { t } = useI18n()

// Reactive data
const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const data = await parentService.getMyDashboardData()
    dashboardData.value = data
    
    console.log('Parent dashboard data loaded:', data)
  } catch (err: any) {
    console.error('Error loading parent dashboard data:', err)
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return t('parent.noData')
  
  try {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return t('parent.noData')
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>
