<template>
  <DashboardLayout>
    <div class="space-y-8" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.863-.833-2.632 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p class="text-red-700">{{ error }}</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ $t('settings.title') }}</h1>
            <p class="text-gray-600 mt-2">{{ $t('settings.description') }}</p>
          </div>
          <button
            @click="showAddYearModal = true"
            class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('settings.addYear') }}
          </button>
        </div>
      </div>

      <!-- Active Year Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">{{ $t('settings.activeYear') }}</h2>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-green-600 font-medium">{{ $t('settings.currentlyActive') }}</span>
          </div>
        </div>

        <div v-if="activeYear" class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-green-800 mb-2">{{ activeYear.year }}</h3>
              <p class="text-green-700 mb-4">{{ activeYear.description }}</p>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white/60 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">{{ $t('settings.startDate') }}</p>
                      <p class="font-semibold text-gray-900">{{ formatDate(activeYear.start_date) }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white/60 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">{{ $t('settings.endDate') }}</p>
                      <p class="font-semibold text-gray-900">{{ formatDate(activeYear.end_date) }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white/60 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">{{ $t('settings.semesters') }}</p>
                      <p class="font-semibold text-gray-900">{{ activeYear.semesters?.length || 0 }} {{ $t('settings.semester') }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Semesters -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-semibold text-green-800">{{ $t('settings.semestersList') }}</h4>
                  <button
                    @click="openSemesterModal(activeYear)"
                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {{ $t('settings.addSemester') }}
                  </button>
                </div>

                <div v-if="activeYear.semesters && activeYear.semesters.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div
                    v-for="semester in activeYear.semesters"
                    :key="semester.id"
                    class="bg-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <h5 class="font-semibold text-gray-900">{{ semester.title }}</h5>
                        <p class="text-sm text-gray-500">{{ formatDate(semester.start_date) }} - {{ formatDate(semester.end_date) }}</p>
                      </div>
                      <div class="relative">
                        <button
                          @click="toggleSemesterDropdown(semester.id)"
                          class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        <!-- Dropdown Menu -->
                        <div
                          v-if="activeSemesterDropdown === semester.id"
                          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                        >
                          <button
                            @click="editSemester(semester)"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {{ $t('settings.editSemester') }}
                          </button>
                          <button
                            @click="deleteSemester(semester)"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {{ $t('settings.deleteSemester') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 bg-white border border-green-200 rounded-lg">
                  <svg class="mx-auto h-12 w-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('settings.noSemesters') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ $t('settings.noSemestersDescription') }}</p>
                  <div class="mt-6">
                    <button
                      @click="openSemesterModal(activeYear)"
                      class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {{ $t('settings.createFirstSemester') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 ml-4">
              <button
                @click="editYear(activeYear)"
                class="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors duration-200"
                :title="$t('settings.editYear')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('settings.noActiveYear') }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ $t('settings.noActiveYearDescription') }}</p>
          <div class="mt-6">
            <button
              @click="showAddYearModal = true"
              class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('settings.createFirstYear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- All Years Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">{{ $t('settings.allYears') }}</h2>
          <div class="flex items-center gap-4">
            <!-- Search -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('settings.searchYears')"
                class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">{{ $t('settings.allStatuses') }}</option>
              <option value="active">{{ $t('settings.active') }}</option>
              <option value="archived">{{ $t('settings.archived') }}</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
        </div>

        <!-- Years Grid -->
        <div v-else-if="filteredYears.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="year in filteredYears"
            :key="year.id"
            :class="[
              'border rounded-xl p-6 hover:shadow-md transition-shadow duration-200',
              year.is_active 
                ? 'border-green-200 bg-green-50' 
                : new Date(year.end_date) < new Date() 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-purple-200 bg-purple-50'
            ]"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ year.year }}</h3>
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      year.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : new Date(year.end_date) < new Date() 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-purple-100 text-purple-800'
                    ]"
                  >
                    {{ year.is_active ? $t('settings.active') : new Date(year.end_date) < new Date() ? $t('settings.archived') : $t('settings.inactive') }}
                  </span>
                </div>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ year.description }}</p>
                
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ formatDate(year.start_date) }} - {{ formatDate(year.end_date) }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{{ year.semesters?.length || 0 }} {{ $t('settings.semesters') }}</span>
                  </div>
                </div>
              </div>

              <div class="relative">
                <button
                  @click="toggleYearDropdown(year.id)"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/60 transition-colors duration-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="activeYearDropdown === year.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                >
                  <button
                    @click="editYear(year)"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {{ $t('settings.editYear') }}
                  </button>
                  <button
                    v-if="!year.is_active"
                    @click="activateYear(year)"
                    class="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ $t('settings.activateYear') }}
                  </button>
                  <button
                    v-if="year.status !== 'archived'"
                    @click="archiveYear(year)"
                    class="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8l6 6m-6 0l6-6 2-2h8a2 2 0 012 2v6a2 2 0 01-2 2h-8l-2-2z" />
                    </svg>
                    {{ $t('settings.archiveYear') }}
                  </button>
                  <button
                    v-if="new Date(year.end_date) < new Date()"
                    @click="restoreYear(year)"
                    class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {{ $t('settings.restoreYear') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('settings.noYears') }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ $t('settings.noYearsDescription') }}</p>
          <div class="mt-6">
            <button
              @click="showAddYearModal = true"
              class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('settings.createFirstYear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Tracking Settings Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ $t('progressSettings.title') }}</h2>
            <p class="text-gray-600 text-sm mt-1">{{ $t('progressSettings.description') }}</p>
          </div>
          <button
            @click="saveProgressSettings"
            class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ $t('common.save') }}
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Lesson Access Control -->
          <div class="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-purple-900">{{ $t('progressSettings.lessonAccess.title') }}</h3>
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p class="text-purple-700 text-sm mb-4">{{ $t('progressSettings.lessonAccess.description') }}</p>

            <div class="space-y-4">
              <div class="bg-white/80 rounded-lg p-4 border border-purple-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-semibold text-gray-900 mb-1">{{ $t('progressSettings.lessonAccess.restrictToAssignedTeacher') }}</h4>
                    <p class="text-sm text-gray-600">{{ $t('progressSettings.lessonAccess.restrictDescription') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="progressSettings.restrictLessonsToAssignedTeacher"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <div class="bg-white/80 rounded-lg p-4 border border-purple-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-semibold text-gray-900 mb-1">{{ $t('progressSettings.lessonAccess.allowAllTeachers') }}</h4>
                    <p class="text-sm text-gray-600">{{ $t('progressSettings.lessonAccess.allowAllDescription') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="progressSettings.allowAllTeachersAccessToLessons"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Lesson Source Configuration -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-green-900">{{ $t('progressSettings.lessonSource.title') }}</h3>
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p class="text-green-700 text-sm mb-4">{{ $t('progressSettings.lessonSource.description') }}</p>

            <div class="space-y-4">
              <div class="bg-white/80 rounded-lg p-4 border border-green-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-semibold text-gray-900 mb-1">{{ $t('progressSettings.lessonSource.useSchedule') }}</h4>
                    <p class="text-sm text-gray-600">{{ $t('progressSettings.lessonSource.useScheduleDescription') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="progressSettings.loadLessonsFromSchedule"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <div class="bg-white/80 rounded-lg p-4 border border-green-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-semibold text-gray-900 mb-1">{{ $t('progressSettings.lessonSource.showOnlyTodayLessons') }}</h4>
                    <p class="text-sm text-gray-600">{{ $t('progressSettings.lessonSource.showOnlyTodayDescription') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="progressSettings.showOnlyTodayLessons"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Configuration Preview -->
        <div class="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-900 mb-4">{{ $t('progressSettings.currentConfig') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white/80 rounded-lg p-3 border border-blue-200">
              <div class="flex items-center space-x-2">
                <div :class="['w-3 h-3 rounded-full', progressSettings.restrictLessonsToAssignedTeacher ? 'bg-red-500' : 'bg-green-500']"></div>
                <p class="text-sm font-medium">{{ progressSettings.restrictLessonsToAssignedTeacher ? $t('progressSettings.restricted') : $t('progressSettings.unrestricted') }}</p>
              </div>
              <p class="text-xs text-gray-600 mt-1">{{ $t('progressSettings.lessonAccess.title') }}</p>
            </div>

            <div class="bg-white/80 rounded-lg p-3 border border-blue-200">
              <div class="flex items-center space-x-2">
                <div :class="['w-3 h-3 rounded-full', progressSettings.allowAllTeachersAccessToLessons ? 'bg-green-500' : 'bg-yellow-500']"></div>
                <p class="text-sm font-medium">{{ progressSettings.allowAllTeachersAccessToLessons ? $t('progressSettings.allTeachers') : $t('progressSettings.assignedOnly') }}</p>
              </div>
              <p class="text-xs text-gray-600 mt-1">{{ $t('progressSettings.teacherAccess') }}</p>
            </div>

            <div class="bg-white/80 rounded-lg p-3 border border-blue-200">
              <div class="flex items-center space-x-2">
                <div :class="['w-3 h-3 rounded-full', progressSettings.loadLessonsFromSchedule ? 'bg-blue-500' : 'bg-gray-500']"></div>
                <p class="text-sm font-medium">{{ progressSettings.loadLessonsFromSchedule ? $t('progressSettings.fromSchedule') : $t('progressSettings.manual') }}</p>
              </div>
              <p class="text-xs text-gray-600 mt-1">{{ $t('progressSettings.lessonSource.title') }}</p>
            </div>

            <div class="bg-white/80 rounded-lg p-3 border border-blue-200">
              <div class="flex items-center space-x-2">
                <div :class="['w-3 h-3 rounded-full', progressSettings.showOnlyTodayLessons ? 'bg-orange-500' : 'bg-purple-500']"></div>
                <p class="text-sm font-medium">{{ progressSettings.showOnlyTodayLessons ? $t('progressSettings.todayOnly') : $t('progressSettings.allLessons') }}</p>
              </div>
              <p class="text-xs text-gray-600 mt-1">{{ $t('progressSettings.timeFilter') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Class Settings Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ $t('classSettings.title') }}</h2>
            <p class="text-gray-600 text-sm mt-1">{{ $t('classSettings.description') }}</p>
          </div>
          <button
            @click="showClassSettingsModal = true"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ $t('classSettings.actions.apply') }}
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Class Durations -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-blue-900">{{ $t('classSettings.durations.title') }}</h3>
              <button
                @click="showAddDurationModal = true"
                class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ $t('classSettings.durations.addDuration') }}
              </button>
            </div>
            <p class="text-blue-700 text-sm mb-4">{{ $t('classSettings.durations.description') }}</p>
            
            <div class="space-y-3">
              <div
                v-for="duration in classDurations"
                :key="duration.id"
                :class="[
                  'flex items-center justify-between p-3 rounded-lg border',
                  duration.isDefault 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-white border-blue-200'
                ]"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ duration.name }}</p>
                    <p class="text-sm text-gray-600">{{ duration.minutes }} {{ $t('common.minutes') }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    v-if="duration.isDefault"
                    class="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium"
                  >
                    {{ $t('classSettings.durations.isDefault') }}
                  </span>
                  <button
                    @click="editDuration(duration)"
                    class="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Start Times -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-green-900">{{ $t('classSettings.startTimes.title') }}</h3>
              <button
                @click="showStartTimesModal = true"
                class="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {{ $t('common.edit') }}
              </button>
            </div>
            <p class="text-green-700 text-sm mb-4">{{ $t('classSettings.startTimes.description') }}</p>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ $t('classSettings.startTimes.schoolStartTime') }}</p>
                    <p class="text-sm text-gray-600">{{ schoolStartTime }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ $t('classSettings.startTimes.firstClassTime') }}</p>
                    <p class="text-sm text-gray-600">{{ firstClassTime }}</p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ $t('classSettings.startTimes.endTime') }}</p>
                    <p class="text-sm text-gray-600">{{ schoolEndTime }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Generated Time Slots Preview -->
        <div class="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-purple-900">{{ $t('classSettings.timeSlots.title') }}</h3>
            <button
              @click="regenerateTimeSlots"
              class="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ $t('classSettings.timeSlots.regenerate') }}
            </button>
          </div>
          <p class="text-purple-700 text-sm mb-4">{{ $t('classSettings.timeSlots.description') }}</p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <div
              v-for="slot in generatedTimeSlots"
              :key="slot.id"
              class="bg-white border border-purple-200 rounded-lg p-3 text-center"
            >
              <p class="text-sm font-medium text-gray-900">{{ slot.startTime }}</p>
              <p class="text-xs text-gray-600">{{ slot.duration }}{{ $t('common.minutes') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Year Modal -->
      <YearModal
        v-if="showAddYearModal || showEditYearModal"
        :show="showAddYearModal || showEditYearModal"
        :year="editingYear"
        @close="closeYearModal"
        @save="saveYear"
      />

      <!-- Add/Edit Semester Modal -->
      <SemesterModal
        v-if="showSemesterModal"
        :show="showSemesterModal"
        :semester="editingSemester"
        :year="selectedYear"
        @close="closeSemesterModal"
        @save="saveSemester"
      />

      <!-- Progress Dialog -->
      <ProgressDialog
        :show="showProgressDialog"
        :state="progressState"
        :title="progressTitle"
        :message="progressMessage"
        :error-message="errorMessage"
        @close="showProgressDialog = false"
      />

      <!-- Duration Modal -->
      <DurationModal
        v-if="showAddDurationModal"
        :duration="editingDuration"
        @close="showAddDurationModal = false; editingDuration = null"
        @save="saveDuration"
        @delete="deleteDuration"
      />

      <!-- Start Times Modal -->
      <StartTimesModal
        v-if="showStartTimesModal"
        @close="showStartTimesModal = false"
        @save="saveStartTimes"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import YearModal from '@/components/YearModal.vue'
import SemesterModal from '@/components/SemesterModal.vue'
import DurationModal from '@/components/DurationModal.vue'
import StartTimesModal from '@/components/StartTimesModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import {
  academicYearService,
  semesterService,
  classSettingsService,
  type AcademicYear,
  type CreateAcademicYearDto,
  type UpdateAcademicYearDto,
  type CreateSemesterDto,
  type UpdateSemesterDto,
  type ClassSettings
} from '@/services'

const { locale } = useI18n()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('all')
const activeYearDropdown = ref<string | null>(null)
const activeSemesterDropdown = ref<string | null>(null)
const showAddYearModal = ref(false)
const showEditYearModal = ref(false)
const showSemesterModal = ref(false)
const editingYear = ref(null)
const editingSemester = ref(null)
const selectedYear = ref(null)

// Class Settings data
const showAddDurationModal = ref(false)
const showStartTimesModal = ref(false)
const showClassSettingsModal = ref(false)
const editingDuration = ref(null)

// Class settings data (loaded from API)
const classSettings = ref<ClassSettings[]>([])
const classDurations = computed(() =>
  classSettings.value
    .filter(setting => setting.setting_type === 'duration')
    .map(setting => ({
      id: setting.id,
      name: setting.name,
      minutes: setting.duration_minutes || 0,
      isDefault: setting.is_default,
      color: setting.color || 'blue'
    }))
)

// Progress settings data
const progressSettings = ref({
  restrictLessonsToAssignedTeacher: false,
  allowAllTeachersAccessToLessons: true,
  loadLessonsFromSchedule: true,
  showOnlyTodayLessons: false
})

// Start times data
const schoolStartTime = ref('07:30')
const firstClassTime = ref('08:00')
const schoolEndTime = ref('15:00')

// Generated time slots
const generatedTimeSlots = ref([
  { id: '1', startTime: '08:00', duration: 45 },
  { id: '2', startTime: '08:45', duration: 45 },
  { id: '3', startTime: '09:30', duration: 15 },
  { id: '4', startTime: '09:45', duration: 45 },
  { id: '5', startTime: '10:30', duration: 45 },
  { id: '6', startTime: '11:15', duration: 45 },
  { id: '7', startTime: '12:00', duration: 45 },
  { id: '8', startTime: '12:45', duration: 45 },
  { id: '9', startTime: '13:30', duration: 45 },
  { id: '10', startTime: '14:15', duration: 45 }
])

// Academic years data (loaded from API)
const years = ref<AcademicYear[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const errorMessage = ref('')

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const activeYear = computed(() => years.value.find(year => year.is_active))

const filteredYears = computed(() => {
  let filtered = years.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(year =>
      year.year.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      year.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'active') {
      filtered = filtered.filter(year => year.is_active)
    } else if (statusFilter.value === 'archived') {
      filtered = filtered.filter(year => !year.is_active && new Date(year.end_date) < new Date())
    }
  }

  return filtered
})

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// API methods
const loadAcademicYears = async () => {
  try {
    loading.value = true
    error.value = null
    years.value = await academicYearService.getAll(1) // Assuming school_id = 1
  } catch (err: any) {
    error.value = err.message || 'Failed to load academic years'
    console.error('Error loading academic years:', err)
  } finally {
    loading.value = false
  }
}

const loadClassSettings = async () => {
  try {
    classSettings.value = await classSettingsService.getAll()
  } catch (err: any) {
    console.error('Error loading class settings:', err)
    // Fallback to empty array if class settings table doesn't exist yet
    classSettings.value = []
  }
}

const toggleYearDropdown = (yearId: string) => {
  activeYearDropdown.value = activeYearDropdown.value === yearId ? null : yearId
}

const toggleSemesterDropdown = (semesterId: string) => {
  activeSemesterDropdown.value = activeSemesterDropdown.value === semesterId ? null : semesterId
}

const editYear = (year: any) => {
  editingYear.value = { ...year }
  showEditYearModal.value = true
  activeYearDropdown.value = null
}

const activateYear = async (year: AcademicYear) => {
  try {
    await academicYearService.activate(year.id)
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to activate year'
    console.error('Error activating year:', err)
  }
  activeYearDropdown.value = null
}

const archiveYear = async (year: AcademicYear) => {
  try {
    await academicYearService.archive(year.id)
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to archive year'
    console.error('Error archiving year:', err)
  }
  activeYearDropdown.value = null
}

const restoreYear = async (year: AcademicYear) => {
  try {
    // For restore, we update to make it active again
    await academicYearService.update(year.id, { is_active: false }) // Just make it inactive, not archived
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to restore year'
    console.error('Error restoring year:', err)
  }
  activeYearDropdown.value = null
}

const openSemesterModal = (year: any) => {
  selectedYear.value = year
  editingSemester.value = null
  showSemesterModal.value = true
}

const editSemester = (semester: any) => {
  editingSemester.value = { ...semester }
  selectedYear.value = activeYear.value
  showSemesterModal.value = true
  activeSemesterDropdown.value = null
}

const deleteSemester = async (semester: any) => {
  if (confirm('هل أنت متأكد من حذف هذا الفصل الدراسي؟')) {
    try {
      await semesterService.remove(semester.id)
      await loadAcademicYears() // Reload data
    } catch (err: any) {
      error.value = err.message || 'Failed to delete semester'
      console.error('Error deleting semester:', err)
    }
  }
  activeSemesterDropdown.value = null
}

const closeYearModal = () => {
  showAddYearModal.value = false
  showEditYearModal.value = false
  editingYear.value = null
}

const closeSemesterModal = () => {
  showSemesterModal.value = false
  editingSemester.value = null
  selectedYear.value = null
}

const saveYear = async (yearData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingYear.value ? 'تحديث السنة الأكاديمية' : 'إنشاء سنة أكاديمية جديدة'
  progressMessage.value = editingYear.value ? 'جاري تحديث بيانات السنة الأكاديمية...' : 'جاري إنشاء السنة الأكاديمية الجديدة...'

  try {
    if (editingYear.value) {
      // Update existing year
      const updateData: UpdateAcademicYearDto = {
        year: yearData.name || yearData.year,
        start_date: yearData.startDate || yearData.start_date,
        end_date: yearData.endDate || yearData.end_date,
        description: yearData.description,
        is_active: yearData.isActive || yearData.is_active
      }
      await academicYearService.update(editingYear.value.id, updateData)
      progressMessage.value = 'تم تحديث السنة الأكاديمية بنجاح'
    } else {
      // Add new year
      const createData: CreateAcademicYearDto = {
        year: yearData.name || yearData.year,
        start_date: yearData.startDate || yearData.start_date,
        end_date: yearData.endDate || yearData.end_date,
        description: yearData.description,
        is_active: yearData.isActive || yearData.is_active || false,
        school_id: 1 // Assuming school_id = 1
      }
      await academicYearService.create(createData)
      progressMessage.value = 'تم إنشاء السنة الأكاديمية بنجاح'
    }

    await loadAcademicYears() // Reload data
    progressState.value = 'success'

    setTimeout(() => {
      showProgressDialog.value = false
      closeYearModal()
    }, 1500)

  } catch (err: any) {
    console.error('Error saving year:', err)
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'

    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

const saveSemester = async (semesterData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingSemester.value ? 'تحديث الفصل الدراسي' : 'إنشاء فصل دراسي جديد'
  progressMessage.value = editingSemester.value ? 'جاري تحديث بيانات الفصل الدراسي...' : 'جاري إنشاء الفصل الدراسي الجديد...'

  try {
    if (editingSemester.value) {
      // Update existing semester
      const updateData: UpdateSemesterDto = {
        title: semesterData.title,
        start_date: semesterData.startDate || semesterData.start_date,
        end_date: semesterData.endDate || semesterData.end_date,
        description: semesterData.description,
        is_active: semesterData.isActive || semesterData.is_active
      }
      await semesterService.update(editingSemester.value.id, updateData)
      progressMessage.value = 'تم تحديث الفصل الدراسي بنجاح'
    } else {
      // Add new semester
      const createData: CreateSemesterDto = {
        title: semesterData.title,
        start_date: semesterData.startDate || semesterData.start_date,
        end_date: semesterData.endDate || semesterData.end_date,
        description: semesterData.description,
        academic_year_id: selectedYear.value.id,
        is_active: semesterData.isActive || semesterData.is_active || true
      }
      await semesterService.create(createData)
      progressMessage.value = 'تم إنشاء الفصل الدراسي بنجاح'
    }

    await loadAcademicYears() // Reload data to get updated semesters
    progressState.value = 'success'

    setTimeout(() => {
      showProgressDialog.value = false
      closeSemesterModal()
    }, 1500)

  } catch (err: any) {
    console.error('Error saving semester:', err)
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'

    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

// Progress Settings Methods
const saveProgressSettings = async () => {
  try {
    // Save progress settings to localStorage for now
    localStorage.setItem('progressSettings', JSON.stringify(progressSettings.value))

    // Show success message
    showProgressDialog.value = true
    progressState.value = 'success'
    progressTitle.value = 'Progress Settings Saved'
    progressMessage.value = 'Progress tracking settings have been saved successfully.'

    setTimeout(() => {
      showProgressDialog.value = false
    }, 2000)

    console.log('Progress settings saved:', progressSettings.value)
  } catch (err: any) {
    console.error('Error saving progress settings:', err)
    showProgressDialog.value = true
    progressState.value = 'error'
    progressTitle.value = 'Error Saving Settings'
    errorMessage.value = 'Failed to save progress settings. Please try again.'

    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

const loadProgressSettings = () => {
  try {
    const savedSettings = localStorage.getItem('progressSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      progressSettings.value = {
        ...progressSettings.value,
        ...settings
      }
    }
  } catch (error) {
    console.warn('Failed to load progress settings:', error)
  }
}

// Class Settings Methods
const editDuration = (duration: any) => {
  editingDuration.value = duration
  showAddDurationModal.value = true
}

const saveDuration = async (durationData: any) => {
  try {
    // Add new duration
    await classSettingsService.addDuration(durationData.minutes)

    // Set as default if specified
    if (durationData.isDefault) {
      await classSettingsService.setDefaultDuration(durationData.minutes)
    }

    await loadClassSettings() // Reload data
    regenerateTimeSlots()
  } catch (err: any) {
    error.value = err.message || 'Failed to save duration'
    console.error('Error saving duration:', err)
  }

  showAddDurationModal.value = false
  editingDuration.value = null
}

const deleteDuration = async (duration: any) => {
  try {
    await classSettingsService.removeDuration(duration.minutes)
    await loadClassSettings() // Reload data
    regenerateTimeSlots()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete duration'
    console.error('Error deleting duration:', err)
  }
  showAddDurationModal.value = false
  editingDuration.value = null
}

const saveStartTimes = (startTimesData: any) => {
  schoolStartTime.value = startTimesData.schoolStartTime
  firstClassTime.value = startTimesData.firstClassTime
  schoolEndTime.value = startTimesData.schoolEndTime
  
  showStartTimesModal.value = false
  regenerateTimeSlots()
}

const regenerateTimeSlots = async () => {
  try {
    // Get time slots from API
    const timeSlotData = await classSettingsService.getTimeSlots()

    // Clear existing slots
    generatedTimeSlots.value = []

    // Get default duration
    const defaultDuration = timeSlotData.defaultDuration || 45

    // Generate time slots from first class time to school end time
    const startTime = new Date(`2000-01-01 ${firstClassTime.value}`)
    const endTime = new Date(`2000-01-01 ${schoolEndTime.value}`)

    let currentTime = new Date(startTime)
    let slotId = 1

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5)

      // Check if we have enough time for a full slot
      const nextTime = new Date(currentTime.getTime() + defaultDuration * 60000)
      if (nextTime <= endTime) {
        generatedTimeSlots.value.push({
          id: slotId.toString(),
          startTime: timeString,
          duration: defaultDuration
        })
      }

      currentTime = nextTime
      slotId++
    }

    // Also save to localStorage for backward compatibility
    try {
      const settingsData = {
        timeSlots: generatedTimeSlots.value,
        classDurations: classDurations.value,
        schoolStartTime: schoolStartTime.value,
        firstClassTime: firstClassTime.value,
        schoolEndTime: schoolEndTime.value
      }
      localStorage.setItem('classSettings', JSON.stringify(settingsData))
    } catch (error) {
      console.warn('Failed to save class settings to localStorage:', error)
    }
  } catch (err: any) {
    console.error('Error regenerating time slots:', err)
    // Fallback to original implementation if API fails
    regenerateTimeSlotsLocal()
  }
}

const regenerateTimeSlotsLocal = () => {
  // Clear existing slots
  generatedTimeSlots.value = []

  // Get default duration
  const defaultDuration = classDurations.value.find(d => d.isDefault)?.minutes || 45

  // Generate time slots from first class time to school end time
  const startTime = new Date(`2000-01-01 ${firstClassTime.value}`)
  const endTime = new Date(`2000-01-01 ${schoolEndTime.value}`)

  let currentTime = new Date(startTime)
  let slotId = 1

  while (currentTime < endTime) {
    const timeString = currentTime.toTimeString().slice(0, 5)

    // Check if we have enough time for a full slot
    const nextTime = new Date(currentTime.getTime() + defaultDuration * 60000)
    if (nextTime <= endTime) {
      generatedTimeSlots.value.push({
        id: slotId.toString(),
        startTime: timeString,
        duration: defaultDuration
      })
    }

    currentTime = nextTime
    slotId++
  }
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  if (activeYearDropdown.value && !(event.target as Element).closest('.relative')) {
    activeYearDropdown.value = null
  }
  if (activeSemesterDropdown.value && !(event.target as Element).closest('.relative')) {
    activeSemesterDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadAcademicYears()
  await loadClassSettings()
  loadProgressSettings()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

