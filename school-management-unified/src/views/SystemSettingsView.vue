<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ $t('systemSettings.systemSettings') }}</h1>
            <p class="text-gray-600 mt-1">{{ $t('systemSettings.systemSettingsDescription') }}</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="resetToDefaults"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ $t('systemSettings.resetToDefaults') }}
            </button>
            <button
              @click="saveSettings"
              :disabled="saving"
              class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
            >
              <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- School fee rules (stored in database) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('systemSettings.paymentOptionsTitle') }}</h2>
        </div>
        <p v-if="paymentFlagsLoading" class="text-sm text-gray-500">{{ $t('common.loading') }}</p>
        <div v-else class="flex items-center justify-between">
          <div class="flex-1 pe-4">
            <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.paymentAllowAdjustLabel') }}</label>
            <p class="text-xs text-gray-500 mt-1">{{ $t('systemSettings.paymentAllowAdjustDesc') }}</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="paymentAllowAdjust"
              :disabled="paymentFlagsSaving"
              @change="savePaymentFlags"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      <!-- Settings Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Attendance Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('systemSettings.attendanceSettings') }}</h2>
          </div>

          <div class="space-y-4">
            <!-- Allow All Users to Take Attendance -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.allowAllUsersToTakeAttendance') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('systemSettings.allowAllUsersToTakeAttendanceDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.attendance.allowAllUsersToTakeAttendance"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Require Supervisor Approval -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.requireSupervisorApproval') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('systemSettings.requireSupervisorApprovalDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.attendance.requireSupervisorApproval"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Allow Retroactive Attendance -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.allowRetroactiveAttendance') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('systemSettings.allowRetroactiveAttendanceDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.attendance.allowRetroactiveAttendance"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Max Retroactive Days -->
            <div v-if="settings.attendance.allowRetroactiveAttendance">
              <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.maxRetroactiveDays') }}</label>
              <input
                type="number"
                v-model.number="settings.attendance.maxRetroactiveDays"
                min="1"
                max="30"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>
          </div>
        </div>

        <!-- User Permissions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('systemSettings.userPermissions') }}</h2>
          </div>

          <div class="space-y-4">
            <!-- Teachers Can View All Groups -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.teacherCanViewAllGroups') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('systemSettings.teacherCanViewAllGroupsDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.userPermissions.teacherCanViewAllGroups"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Parents Can View Other Students -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.parentCanViewOtherStudents') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('systemSettings.parentCanViewOtherStudentsDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.userPermissions.parentCanViewOtherStudents"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- Admin Requires Two-Factor Auth -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.adminRequiresTwoFactorAuth') }}</label>
                <p class="text-xs text-gray-500 mt-1">{{ $t('systemSettings.adminRequiresTwoFactorAuthDesc') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.userPermissions.adminRequiresTwoFactorAuth"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- School Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('systemSettings.schoolInfo') }}</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-900">{{ $t('common.name') }}</label>
              <input
                type="text"
                v-model="settings.schoolInfo.name"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>

            <div>
              <label class="text-sm font-medium text-gray-900">{{ $t('students.address') }}</label>
              <input
                type="text"
                v-model="settings.schoolInfo.address"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-900">{{ $t('students.phone') }}</label>
                <input
                  type="tel"
                  v-model="settings.schoolInfo.phone"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="text-sm font-medium text-gray-900">{{ $t('students.email') }}</label>
                <input
                  type="email"
                  v-model="settings.schoolInfo.email"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-900">Website</label>
              <input
                type="url"
                v-model="settings.schoolInfo.website"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>
          </div>
        </div>

        <!-- Academic Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('systemSettings.academic') }}</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-900">Current Academic Year</label>
              <input
                type="text"
                v-model="settings.academic.currentAcademicYear"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-900">Term Start Date</label>
                <input
                  type="date"
                  v-model="settings.academic.termStartDate"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="text-sm font-medium text-gray-900">Term End Date</label>
                <input
                  type="date"
                  v-model="settings.academic.termEndDate"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Grades Management -->
        <div class="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7l-7 7-7-7m7 7l7-7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('systemSettings.gradesManagement') }}</h2>
            </div>
            <button
              @click="showAddGradeForm = true"
              class="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('systemSettings.addGrade') }}
            </button>
          </div>

          <!-- Add Grade Form -->
          <div v-if="showAddGradeForm" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.gradeNameEn') }}</label>
                <input
                  type="text"
                  v-model="newGrade.nameEn"
                  :placeholder="$t('systemSettings.gradeNameEnPlaceholder')"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.gradeNameAr') }}</label>
                <input
                  type="text"
                  v-model="newGrade.nameAr"
                  :placeholder="$t('systemSettings.gradeNameArPlaceholder')"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.gradeCode') }}</label>
                <input
                  type="text"
                  v-model="newGrade.code"
                  :placeholder="$t('systemSettings.gradeCodePlaceholder')"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.description') }}</label>
                <input
                  type="text"
                  v-model="newGrade.description"
                  :placeholder="$t('systemSettings.gradeDescriptionPlaceholder')"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <button
                @click="cancelAddGrade"
                class="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                @click="addGrade"
                :disabled="!isNewGradeValid || addingGrade"
                class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="addingGrade" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ $t('systemSettings.addGrade') }}
              </button>
            </div>
          </div>

          <!-- Initialize Default Grades -->
          <div v-if="grades.length === 0" class="text-center py-8">
            <p class="text-gray-600 mb-4">{{ $t('systemSettings.noGradesFound') }}</p>
            <button
              @click="initializeDefaultGrades"
              :disabled="initializingGrades"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
            >
              <svg v-if="initializingGrades" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('systemSettings.initializeDefaultGrades') }}
            </button>
          </div>

          <!-- Grades List -->
          <div v-else class="space-y-2">
            <div
              v-for="grade in grades"
              :key="grade.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-500">#{{ grade.displayOrder }}</div>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ isRTL ? grade.nameAr : grade.nameEn }}
                    <span class="text-sm text-gray-500 ml-2">({{ grade.code }})</span>
                  </div>
                  <div v-if="grade.description" class="text-sm text-gray-600">{{ grade.description }}</div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <!-- Active Status Toggle -->
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="grade.isActive"
                    @change="toggleGradeStatus(grade)"
                    class="sr-only peer"
                  >
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>

                <!-- Edit Button -->
                <button
                  @click="editGrade(grade)"
                  class="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <!-- Delete Button -->
                <button
                  @click="deleteGrade(grade)"
                  class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Edit Grade Modal -->
          <div v-if="editingGrade" class="fixed inset-0 z-50 overflow-y-auto" style="background-color: rgba(0, 0, 0, 0.5)">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="flex items-center mb-4">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">{{ $t('systemSettings.editGrade') }}</h3>
                  </div>
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.gradeNameEn') }}</label>
                        <input
                          type="text"
                          v-model="editingGrade.nameEn"
                          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.gradeNameAr') }}</label>
                        <input
                          type="text"
                          v-model="editingGrade.nameAr"
                          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.gradeCode') }}</label>
                        <input
                          type="text"
                          v-model="editingGrade.code"
                          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-900">{{ $t('systemSettings.description') }}</label>
                        <input
                          type="text"
                          v-model="editingGrade.description"
                          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    @click="updateGrade"
                    :disabled="updatingGrade"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    <svg v-if="updatingGrade" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ $t('common.update') }}
                  </button>
                  <button
                    @click="cancelEdit"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fee items & discount items (same card + row style as grade levels) -->
        <div id="payment-fee-discount-catalogs" class="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7l-7 7-7-7m7 7l7-7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('systemSettings.paymentCatalogsSectionTitle') }}</h2>
          </div>
          <div class="space-y-2">
            <router-link
              to="/settings/payments/catalog/charges"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-gray-900 no-underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <div class="font-medium text-gray-900">{{ $t('systemSettings.feeItemsLines') }}</div>
              <svg class="w-5 h-5 text-gray-400 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link
              to="/settings/payments/catalog/discounts"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-gray-900 no-underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <div class="font-medium text-gray-900">{{ $t('systemSettings.discountItemsLines') }}</div>
              <svg class="w-5 h-5 text-gray-400 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { settingsService, type SystemSettings } from '@/services/settings.service'
import { gradeService, type Grade, type CreateGradeData, type UpdateGradeData } from '@/services/grade.service'
import { authService } from '@/services'
import paymentConfigService from '@/services/payment-config.service'

const { locale, t } = useI18n()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const settings = ref<SystemSettings>({
  attendance: {
    allowAllUsersToTakeAttendance: true,
    requireSupervisorApproval: false,
    allowRetroactiveAttendance: true,
    maxRetroactiveDays: 7
  },
  userPermissions: {
    teacherCanViewAllGroups: true,
    parentCanViewOtherStudents: false,
    adminRequiresTwoFactorAuth: false
  },
  schoolInfo: {
    name: 'زهرة الحياة للأطفال',
    address: 'مسقط، سلطنة عمان',
    phone: '+968 1234 5678',
    email: 'info@zahratalhayat.om',
    website: 'www.zahratalhayat.om'
  },
  academic: {
    currentAcademicYear: '2024-2025',
    termStartDate: '2024-09-01',
    termEndDate: '2025-06-30'
  }
})

// Grades management reactive data
const grades = ref<Grade[]>([])
const loadingGrades = ref(false)
const showAddGradeForm = ref(false)
const newGrade = ref<CreateGradeData>({
  nameEn: '',
  nameAr: '',
  code: '',
  displayOrder: 1,
  description: ''
})
const addingGrade = ref(false)
const editingGrade = ref<Grade | null>(null)
const updatingGrade = ref(false)
const initializingGrades = ref(false)

const paymentAllowAdjust = ref(false)
const paymentFlagsLoading = ref(true)
const paymentFlagsSaving = ref(false)

// Computed properties
const isRTL = computed(() => locale.value === 'ar')
const isNewGradeValid = computed(() => {
  return newGrade.value.nameEn.trim() !== '' &&
         newGrade.value.nameAr.trim() !== '' &&
         newGrade.value.code.trim() !== ''
})

// Methods
const loadSettings = async () => {
  try {
    loading.value = true
    const loadedSettings = await settingsService.getStructuredSettings()
    settings.value = loadedSettings
  } catch (error) {
    console.error('Error loading settings:', error)
    // Keep default settings if loading fails
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  try {
    saving.value = true
    
    // Convert structured settings to flat array for API
    const settingsToUpdate: { key: string; value: any }[] = []
    
    Object.entries(settings.value).forEach(([category, categorySettings]) => {
      Object.entries(categorySettings).forEach(([key, value]) => {
        settingsToUpdate.push({
          key: `${category}.${key}`,
          value: value
        })
      })
    })

    await settingsService.bulkUpdate(settingsToUpdate)
    
    // Show success message
    alert('Settings saved successfully!')
    
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Failed to save settings. Please try again.')
  } finally {
    saving.value = false
  }
}

const resetToDefaults = async () => {
  if (confirm('Are you sure you want to reset all settings to their default values?')) {
    try {
      await settingsService.initializeDefaultSettings()
      await loadSettings()
      alert('Settings reset to defaults successfully!')
    } catch (error) {
      console.error('Error resetting settings:', error)
      alert('Failed to reset settings. Please try again.')
    }
  }
}

// Grades management methods
const loadGrades = async () => {
  try {
    loadingGrades.value = true
    grades.value = await gradeService.getAll()
  } catch (error) {
    console.error('Error loading grades:', error)
    alert('Failed to load grades. Please try again.')
  } finally {
    loadingGrades.value = false
  }
}

const addGrade = async () => {
  try {
    addingGrade.value = true

    // Calculate display order
    const maxOrder = grades.value.length > 0
      ? Math.max(...grades.value.map(g => g.displayOrder))
      : 0
    newGrade.value.displayOrder = maxOrder + 1

    await gradeService.create(newGrade.value)
    await loadGrades()

    // Reset form
    newGrade.value = {
      nameEn: '',
      nameAr: '',
      code: '',
      displayOrder: 1,
      description: ''
    }
    showAddGradeForm.value = false

    alert('Grade added successfully!')
  } catch (error) {
    console.error('Error adding grade:', error)
    alert('Failed to add grade. Please try again.')
  } finally {
    addingGrade.value = false
  }
}

const cancelAddGrade = () => {
  newGrade.value = {
    nameEn: '',
    nameAr: '',
    code: '',
    displayOrder: 1,
    description: ''
  }
  showAddGradeForm.value = false
}

const editGrade = (grade: Grade) => {
  editingGrade.value = { ...grade }
}

const updateGrade = async () => {
  if (!editingGrade.value) return

  try {
    updatingGrade.value = true
    await gradeService.update(editingGrade.value.id, {
      nameEn: editingGrade.value.nameEn,
      nameAr: editingGrade.value.nameAr,
      code: editingGrade.value.code,
      description: editingGrade.value.description
    })
    await loadGrades()
    editingGrade.value = null
    alert('Grade updated successfully!')
  } catch (error) {
    console.error('Error updating grade:', error)
    alert('Failed to update grade. Please try again.')
  } finally {
    updatingGrade.value = false
  }
}

const cancelEdit = () => {
  editingGrade.value = null
}

const toggleGradeStatus = async (grade: Grade) => {
  try {
    await gradeService.update(grade.id, { isActive: !grade.isActive })
    await loadGrades()
  } catch (error) {
    console.error('Error toggling grade status:', error)
    alert('Failed to update grade status. Please try again.')
  }
}

const deleteGrade = async (grade: Grade) => {
  if (!confirm(`Are you sure you want to delete the grade "${isRTL.value ? grade.nameAr : grade.nameEn}"?`)) {
    return
  }

  try {
    await gradeService.remove(grade.id)
    await loadGrades()
    alert('Grade deleted successfully!')
  } catch (error) {
    console.error('Error deleting grade:', error)
    alert('Failed to delete grade. Please try again.')
  }
}

const initializeDefaultGrades = async () => {
  try {
    initializingGrades.value = true
    await gradeService.initializeDefaults()
    await loadGrades()
    alert('Default grades initialized successfully!')
  } catch (error) {
    console.error('Error initializing default grades:', error)
    alert('Failed to initialize default grades. Please try again.')
  } finally {
    initializingGrades.value = false
  }
}

const loadPaymentFlags = async () => {
  try {
    paymentFlagsLoading.value = true
    const sid = Number(authService.getStoredUser()?.school_id) || 1
    const f = await paymentConfigService.getSchoolFlags(sid)
    paymentAllowAdjust.value = !!f.allow_admin_adjust_student_total
  } catch {
    paymentAllowAdjust.value = false
  } finally {
    paymentFlagsLoading.value = false
  }
}

const savePaymentFlags = async () => {
  try {
    paymentFlagsSaving.value = true
    const sid = Number(authService.getStoredUser()?.school_id) || 1
    const f = await paymentConfigService.updateSchoolFlags(sid, {
      allow_admin_adjust_student_total: paymentAllowAdjust.value,
    })
    paymentAllowAdjust.value = !!f.allow_admin_adjust_student_total
  } catch (error) {
    console.error(error)
    alert(t('systemSettings.paymentFlagsSaveError'))
  } finally {
    paymentFlagsSaving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
  loadGrades()
  loadPaymentFlags()
})
</script>
