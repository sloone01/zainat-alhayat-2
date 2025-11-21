<template>
  <DashboardLayout>
    <div class="space-y-8" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold">{{ $t('dashboard.welcome') }}</h2>
            <p class="text-blue-100 mt-2 text-lg">
              {{ currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : $t('dashboard.welcomeMessage') }}
            </p>
            <div class="flex items-center mt-4 space-x-4 rtl:space-x-reverse">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-blue-200 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-blue-100">{{ currentDate }}</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-blue-200 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-blue-100">{{ currentTime }}</span>
              </div>
            </div>
          </div>
          <div class="hidden sm:block">
            <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Students Card -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer" @click="navigateTo('/students')">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 rtl:mr-4 rtl:ml-0">
                <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.totalStudents') }}</p>
                <p class="text-3xl font-bold text-gray-900" v-if="!statsLoading">{{ stats?.totalStudents || 0 }}</p>
                <div v-else class="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                <p class="text-xs text-green-600 mt-1" v-if="stats?.activeStudents">
                  {{ stats.activeStudents }} {{ $t('dashboard.active') }}
                </p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Teachers Card -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer" @click="navigateTo('/users')">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 rtl:mr-4 rtl:ml-0">
                <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.totalTeachers') }}</p>
                <p class="text-3xl font-bold text-gray-900" v-if="!statsLoading">{{ stats?.totalTeachers || 0 }}</p>
                <div v-else class="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                <p class="text-xs text-blue-600 mt-1">{{ $t('dashboard.staff') }}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Groups Card -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer" @click="navigateTo('/groups')">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 rtl:mr-4 rtl:ml-0">
                <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.totalGroups') }}</p>
                <p class="text-3xl font-bold text-gray-900" v-if="!statsLoading">{{ stats?.totalGroups || 0 }}</p>
                <div v-else class="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                <p class="text-xs text-purple-600 mt-1">{{ $t('dashboard.classes') }}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Courses Card -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer" @click="navigateTo('/courses')">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 rtl:mr-4 rtl:ml-0">
                <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.totalCourses') }}</p>
                <p class="text-3xl font-bold text-gray-900" v-if="!statsLoading">{{ stats?.totalCourses || 0 }}</p>
                <div v-else class="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                <p class="text-xs text-orange-600 mt-1">{{ $t('dashboard.curriculum') }}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Attendance Overview & Recent Activities -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Attendance Overview -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('dashboard.attendanceOverview') }}</h3>
            <button @click="navigateTo('/attendance')" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {{ $t('dashboard.viewAll') }}
            </button>
          </div>

          <div v-if="!statsLoading && stats" class="space-y-4">
            <!-- Attendance Rate -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ $t('dashboard.todayAttendance') }}</span>
              <span class="text-lg font-semibold text-gray-900">{{ Math.round(stats.attendanceRate || 0) }}%</span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${stats.attendanceRate || 0}%` }"
              ></div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <p class="text-2xl font-bold text-green-600">{{ stats.activeStudents || 0 }}</p>
                <p class="text-xs text-green-700">{{ $t('dashboard.present') }}</p>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-lg">
                <p class="text-2xl font-bold text-red-600">{{ (stats.totalStudents || 0) - (stats.activeStudents || 0) }}</p>
                <p class="text-xs text-red-700">{{ $t('dashboard.absent') }}</p>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-2 bg-gray-200 rounded w-full mb-4"></div>
              <div class="grid grid-cols-2 gap-4">
                <div class="h-16 bg-gray-200 rounded"></div>
                <div class="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('dashboard.recentActivities') }}</h3>
            <button @click="refreshActivities" class="text-blue-600 hover:text-blue-700">
              <svg class="w-5 h-5" :class="{ 'animate-spin': activitiesLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div v-for="activity in recentActivities" :key="activity.id"
                 class="flex items-start space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div class="flex-shrink-0 mt-1">
                <div :class="getActivityIconClass(activity.type)" class="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getActivityIcon(activity.type)" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 font-medium">{{ activity.title }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ activity.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatTimeAgo(activity.timestamp) }}</p>
              </div>
            </div>

            <div v-if="recentActivities.length === 0 && !activitiesLoading" class="text-center py-8">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-gray-500 text-sm">{{ $t('dashboard.noRecentActivities') }}</p>
            </div>

            <div v-if="activitiesLoading" class="space-y-3">
              <div v-for="i in 3" :key="i" class="animate-pulse flex items-start space-x-3 rtl:space-x-reverse">
                <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('dashboard.quickActions') }}</h3>
          <span class="text-sm text-gray-500">{{ $t('dashboard.commonTasks') }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Add Student -->
          <button
            @click="navigateTo('/students/register')"
            class="dashboard-action-btn bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
          >
            <div class="dashboard-action-icon bg-gradient-to-r from-blue-500 to-blue-600">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-blue-900 text-center">{{ $t('dashboard.addStudent') }}</span>
            <span class="text-xs text-blue-700 mt-1 text-center">{{ $t('dashboard.registerNew') }}</span>
          </button>

          <!-- Take Attendance -->
          <button
            @click="navigateTo('/attendance')"
            class="dashboard-action-btn bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
          >
            <div class="dashboard-action-icon bg-gradient-to-r from-green-500 to-green-600">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-green-900 text-center">{{ $t('dashboard.takeAttendance') }}</span>
            <span class="text-xs text-green-700 mt-1 text-center">{{ $t('dashboard.markPresent') }}</span>
          </button>

          <!-- Manage Schedule -->
          <button
            @click="navigateTo('/schedules')"
            class="dashboard-action-btn bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200"
          >
            <div class="dashboard-action-icon bg-gradient-to-r from-purple-500 to-purple-600">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-purple-900 text-center">{{ $t('dashboard.manageSchedule') }}</span>
            <span class="text-xs text-purple-700 mt-1 text-center">{{ $t('dashboard.planClasses') }}</span>
          </button>

          <!-- View Reports -->
          <button
            @click="navigateTo('/reports')"
            class="dashboard-action-btn bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200"
          >
            <div class="dashboard-action-icon bg-gradient-to-r from-orange-500 to-orange-600">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-orange-900 text-center">{{ $t('dashboard.viewReports') }}</span>
            <span class="text-xs text-orange-700 mt-1 text-center">{{ $t('dashboard.analytics') }}</span>
          </button>
        </div>

        <!-- Additional Quick Actions Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <!-- Weekly Sessions -->
          <button
            @click="navigateTo('/teacher-weekly-sessions')"
            class="dashboard-action-btn bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200"
          >
            <div class="dashboard-action-icon bg-gradient-to-r from-indigo-500 to-indigo-600">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-indigo-900 text-center">{{ $t('dashboard.weeklySessions') }}</span>
            <span class="text-xs text-indigo-700 mt-1 text-center">{{ $t('dashboard.planWeek') }}</span>
          </button>

          <!-- Manage Groups -->
          <button
            @click="navigateTo('/groups')"
            class="dashboard-action-btn bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200"
          >
            <div class="dashboard-action-icon bg-gradient-to-r from-teal-500 to-teal-600">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-teal-900 text-center">{{ $t('dashboard.manageGroups') }}</span>
            <span class="text-xs text-teal-700 mt-1 text-center">{{ $t('dashboard.organizeClasses') }}</span>
          </button>

          <!-- Student Progress -->
          <button
            @click="navigateTo('/progress')"
            class="dashboard-action-btn bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200"
          >
            <div class="dashboard-action-icon bg-gradient-to-r from-pink-500 to-pink-600">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-pink-900 text-center">{{ $t('dashboard.studentProgress') }}</span>
            <span class="text-xs text-pink-700 mt-1 text-center">{{ $t('dashboard.trackGrowth') }}</span>
          </button>

          <!-- Settings -->
          <button
            @click="navigateTo('/settings')"
            class="dashboard-action-btn bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200"
          >
            <div class="dashboard-action-icon bg-gradient-to-r from-gray-500 to-gray-600">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-gray-900 text-center">{{ $t('dashboard.settings') }}</span>
            <span class="text-xs text-gray-700 mt-1 text-center">{{ $t('dashboard.configure') }}</span>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { statisticsService, type DashboardStats } from '@/services/statistics.service'
import { authService } from '@/services'

const { locale } = useI18n()
const router = useRouter()

// Reactive data
const stats = ref<DashboardStats | null>(null)
const statsLoading = ref(true)
const activitiesLoading = ref(false)
// FIXED: Since authentication is disabled, use a fixed user
const currentUser = ref({
  id: '0f851929-30b0-4b1c-8f64-779bd03dae03',
  email: 'موزة@zinat.local',
  firstName: 'موزة',
  lastName: 'معلمة',
  role: 'teacher',
  isActive: true
})
const currentTime = ref('')
const currentDate = ref('')

// Recent activities mock data (replace with real API call)
const recentActivities = ref([
  {
    id: 1,
    type: 'student',
    title: 'طالب جديد مسجل',
    description: 'تم تسجيل أحمد محمد في المجموعة الأولى',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 2,
    type: 'attendance',
    title: 'تحديث الحضور',
    description: 'تم تسجيل حضور المجموعة الثانية',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: 3,
    type: 'activity',
    title: 'نشاط جديد',
    description: 'تم إنشاء نشاط "تعلم الألوان" للمجموعة الثالثة',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    id: 4,
    type: 'progress',
    title: 'تقدم الطلاب',
    description: 'تم تحديث تقدم 5 طلاب في مادة الرياضيات',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  }
])

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Methods
const navigateTo = (path: string) => {
  router.push(path)
}

const loadDashboardStats = async () => {
  try {
    statsLoading.value = true
    console.log('🔄 Loading dashboard stats...')
    const data = await statisticsService.getDashboardStats()
    stats.value = data
    console.log('✅ Dashboard stats loaded:', data)
  } catch (error) {
    console.warn('⚠️ API failed, using mock data:', error)
    // Fallback to mock data if API fails
    stats.value = {
      totalStudents: 156,
      totalTeachers: 24,
      totalGroups: 8,
      totalCourses: 12,
      activeStudents: 142,
      completedMilestones: 89,
      attendanceRate: 91.2
    }
    console.log('📊 Using mock dashboard stats:', stats.value)
  } finally {
    statsLoading.value = false
  }
}

const refreshActivities = async () => {
  try {
    activitiesLoading.value = true
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    // In real implementation, fetch from API
    // const activities = await activitiesService.getRecentActivities()
    // recentActivities.value = activities
  } catch (error) {
    console.error('Error refreshing activities:', error)
  } finally {
    activitiesLoading.value = false
  }
}

const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  currentDate.value = now.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getActivityIconClass = (type: string) => {
  const classes = {
    student: 'bg-gradient-to-r from-blue-500 to-blue-600',
    attendance: 'bg-gradient-to-r from-green-500 to-green-600',
    activity: 'bg-gradient-to-r from-purple-500 to-purple-600',
    progress: 'bg-gradient-to-r from-orange-500 to-orange-600'
  }
  return classes[type as keyof typeof classes] || 'bg-gradient-to-r from-gray-500 to-gray-600'
}

const getActivityIcon = (type: string) => {
  const icons = {
    student: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    attendance: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    activity: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    progress: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  }
  return icons[type as keyof typeof icons] || 'M12 6v6m0 0v6m0-6h6m-6 0H6'
}

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} دقيقة مضت`
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} ساعة مضت`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days} يوم مضى`
  }
}

// Lifecycle
onMounted(() => {
  console.log('🚀 Dashboard mounted')
  console.log('👤 Current user:', currentUser.value)

  loadDashboardStats()
  updateDateTime()

  // Update time every minute
  setInterval(updateDateTime, 60000)
})
</script>
