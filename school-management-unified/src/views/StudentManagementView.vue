<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('studentManagement.title') }}</h1>
            <p class="text-gray-600 mt-1 text-sm">{{ $t('studentManagement.description') }}</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="exportStudents"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ $t('common.export') }}
            </button>
            <button
              @click="showParentManagementModal = true"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ $t('studentManagement.addParent') }}
            </button>
            <router-link
              to="/students/register"
              class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('studentManagement.addStudent') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('studentManagement.searchPlaceholder')"
              class="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <!-- Group Filter -->
          <select
            v-model="selectedGroup"
            class="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="">{{ $t('studentManagement.allGroups') }}</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>

          <!-- Status Filter -->
          <select
            v-model="selectedStatus"
            class="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="">{{ $t('studentManagement.allStatuses') }}</option>
            <option value="active">{{ $t('studentManagement.active') }}</option>
            <option value="inactive">{{ $t('studentManagement.inactive') }}</option>
          </select>

          <!-- Age Group Filter -->
          <select
            v-model="selectedAgeGroup"
            class="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="">{{ $t('studentManagement.allAgeGroups') }}</option>
            <option value="toddlers">{{ $t('studentManagement.toddlers') }}</option>
            <option value="preschool">{{ $t('studentManagement.preschool') }}</option>
            <option value="kindergarten">{{ $t('studentManagement.kindergarten') }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-600">{{ $t('common.loading') }}...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
        </div>
      </div>

      <!-- Students Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
        >
          <!-- Student Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-primary-600 font-medium text-sm">
                  {{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}
                </span>
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">
                  {{ student.firstName }} {{ student.lastName }}
                </h3>
                <p class="text-xs text-gray-500">{{ student.id.substring(0, 8) }}</p>
              </div>
            </div>

            <!-- Status Badge -->
            <span
              :class="[
                'px-2 py-1 text-xs rounded-full font-medium',
                getStudentStatus(student) === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              ]"
            >
              {{ getStudentStatus(student) === 'active' ? $t('studentManagement.active') : $t('studentManagement.inactive') }}
            </span>
          </div>

          <!-- Student Info -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">{{ $t('studentManagement.age') }}:</span>
              <span class="text-gray-900">{{ calculateAge(student.dateOfBirth) }} {{ $t('studentManagement.years') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">{{ $t('studentManagement.group') }}:</span>
              <span class="text-gray-900">{{ getStudentGroup(student) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">{{ $t('studentManagement.parent') }}:</span>
              <span class="text-gray-900">{{ getParentName(student) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">{{ $t('studentManagement.enrollmentDate') }}:</span>
              <span class="text-gray-900">{{ formatDate(student.createdAt) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-3 pt-3 border-t border-gray-200 flex gap-2">
            <button
              @click="viewStudent(student)"
              class="flex-1 text-xs bg-primary-50 text-primary-600 py-1.5 px-2 rounded-md hover:bg-primary-100 transition-colors duration-200"
            >
              {{ $t('common.view') }}
            </button>
            <button
              @click="editStudent(student)"
              class="flex-1 text-xs bg-gray-50 text-gray-600 py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              {{ $t('common.edit') }}
            </button>
            <!-- Assign to Group button for unassigned students -->
            <button
              v-if="!student.groups || student.groups.length === 0"
              @click="assignToGroup(student)"
              class="flex-1 text-xs bg-green-50 text-green-600 py-1.5 px-2 rounded-md hover:bg-green-100 transition-colors duration-200"
            >
              {{ $t('studentManagement.assignToGroup') }}
            </button>
            <!-- Create Parent button for students without parents -->
            <button
              v-if="!student.parents || student.parents.length === 0"
              @click="createParent(student)"
              class="flex-1 text-xs bg-blue-50 text-blue-600 py-1.5 px-2 rounded-md hover:bg-blue-100 transition-colors duration-200"
            >
              {{ $t('studentManagement.createParent') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredStudents.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('studentManagement.noStudents') }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ $t('studentManagement.noStudentsDescription') }}</p>
        <div class="mt-6">
          <router-link
            to="/students/register"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm"
          >
            {{ $t('studentManagement.registerFirstStudent') }}
          </router-link>
        </div>
      </div>

      <!-- Student Detail Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" :dir="isRTL ? 'rtl' : 'ltr'">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <div class="flex items-center gap-3 text-white">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold">
                    {{ modalMode === 'view' ? $t('studentManagement.viewStudent') : $t('studentManagement.editStudent') }}
                  </h3>
                  <p class="text-blue-100 text-sm">
                    {{ modalMode === 'view' ? $t('studentManagement.viewStudentDescription') : $t('studentManagement.editStudentDescription') }}
                  </p>
                </div>
              </div>
            </div>
            <div class="bg-white px-6 py-6">
              <div class="w-full">

                  <div v-if="selectedStudent" class="space-y-6">
                    <!-- VIEW MODE -->
                    <div v-if="modalMode === 'view'" class="space-y-6">
                      <!-- Student Photo - View Mode -->
                      <div class="text-center">
                        <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-lg">
                          <img v-if="selectedStudent.photo" :src="selectedStudent.photo" alt="Student Photo" class="w-full h-full object-cover" />
                          <svg v-else class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 class="mt-3 text-xl font-bold text-gray-900">{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</h3>
                        <p class="text-sm text-gray-500">{{ $t('studentManagement.studentId') }}: {{ selectedStudent.id.substring(0, 8) }}</p>
                      </div>

                      <!-- Student Info Cards - View Mode -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Personal Information -->
                        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <h4 class="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {{ $t('studentManagement.personalInformation') }}
                          </h4>
                          <div class="space-y-3">
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.firstName') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.firstName || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.secondName') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.secondName || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.thirdName') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.thirdName || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.familyName') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.lastName || '-' }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Birth & Identity -->
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <h4 class="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0V7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2V7" />
                            </svg>
                            {{ $t('studentManagement.birthAndIdentity') }}
                          </h4>
                          <div class="space-y-3">
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.dateOfBirth') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ formatDate(selectedStudent.dateOfBirth) }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('studentManagement.age') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ calculateAge(selectedStudent.dateOfBirth) }} {{ $t('studentManagement.years') }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.gender') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.gender === 'male' ? $t('students.male') : $t('students.female') }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.nationality') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.nationality === 'omani' ? $t('students.omani') : selectedStudent.nationality === 'expat' ? $t('students.expat') : '-' }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Student ID & Contact -->
                        <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                          <h4 class="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M9 4h6m-6 0v1a1 1 0 001 1h4a1 1 0 001-1V4m-6 0a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1z" />
                            </svg>
                            {{ $t('studentManagement.contactInformation') }}
                          </h4>
                          <div class="space-y-3">
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.studentId') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.studentId || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('studentManagement.emergencyContact') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.emergencyContact || '-' }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Medical Information -->
                        <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                          <h4 class="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {{ $t('students.medicalConditions') }}
                          </h4>
                          <div class="bg-white rounded-lg p-3 border border-red-100">
                            <p class="text-sm text-gray-900">{{ selectedStudent.medicalInfo || $t('studentManagement.noMedicalConditions') }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- EDIT MODE -->
                    <div v-else class="space-y-4">
                      <!-- Student Photo - Edit Mode -->
                      <div class="text-center">
                        <div class="relative inline-block">
                          <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-lg">
                            <img v-if="studentForm.photo" :src="studentForm.photo" alt="Student Photo" class="w-full h-full object-cover" />
                            <svg v-else class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            @click="$refs.photoInput.click()"
                            class="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-110"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <input
                            ref="photoInput"
                            type="file"
                            accept="image/*"
                            @change="handlePhotoUpload"
                            class="hidden"
                          />
                        </div>
                        <p class="text-xs text-gray-600 mt-2">{{ $t('students.photoDescription') }}</p>
                      </div>

                      <!-- Student Basic Info - Edit Mode -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.firstName') }} *</label>
                          <input
                            v-model="studentForm.firstName"
                            type="text"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.secondName') }} *</label>
                          <input
                            v-model="studentForm.secondName"
                            type="text"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.thirdName') }}</label>
                          <input
                            v-model="studentForm.thirdName"
                            type="text"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.familyName') }} *</label>
                          <input
                            v-model="studentForm.familyName"
                            type="text"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.dateOfBirth') }} *</label>
                          <input
                            v-model="studentForm.dateOfBirth"
                            type="date"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.gender') }} *</label>
                          <select
                            v-model="studentForm.gender"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            <option value="">{{ $t('students.selectGender') }}</option>
                            <option value="male">{{ $t('students.male') }}</option>
                            <option value="female">{{ $t('students.female') }}</option>
                          </select>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.studentId') }}</label>
                          <input
                            v-model="studentForm.studentId"
                            type="text"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                          <p class="text-xs text-gray-500 mt-1">{{ $t('students.studentIdNote') }}</p>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.nationality') }} *</label>
                          <select
                            v-model="studentForm.nationality"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            <option value="">{{ $t('students.selectNationality') }}</option>
                            <option value="omani">{{ $t('students.omani') }}</option>
                            <option value="expat">{{ $t('students.expat') }}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700">{{ $t('students.medicalConditions') }}</label>
                        <textarea
                          v-model="studentForm.medicalConditions"
                          rows="3"
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                          :placeholder="$t('students.medicalConditionsPlaceholder')"
                        ></textarea>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.emergencyContact') }}</label>
                        <input
                          v-model="studentForm.emergencyContact"
                          type="text"
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <!-- Enhanced Group Section -->
                    <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h4 class="text-sm font-semibold text-purple-800">{{ $t('studentManagement.groupAssignment') }}</h4>
                      </div>
                      <div class="bg-white rounded-lg p-3 border border-purple-100">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ getStudentGroup(selectedStudent) }}</p>
                            <p class="text-xs text-gray-500 mt-1">{{ $t('studentManagement.currentGroup') }}</p>
                          </div>
                          <div v-if="modalMode === 'edit'" class="flex gap-2">
                            <button
                              @click="assignToGroup(selectedStudent)"
                              class="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors duration-200"
                            >
                              {{ $t('studentManagement.changeGroup') }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Enhanced Parent Section -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <h4 class="text-sm font-semibold text-green-800">{{ $t('studentManagement.parentInformation') }}</h4>
                      </div>
                      <div class="bg-white rounded-lg p-3 border border-green-100">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ getParentName(selectedStudent) }}</p>
                            <p class="text-xs text-gray-500 mt-1">{{ $t('studentManagement.guardianContact') }}</p>
                          </div>
                          <div v-if="modalMode === 'edit'" class="flex gap-2">
                            <button
                              v-if="!selectedStudent.parents || selectedStudent.parents.length === 0"
                              @click="createParent(selectedStudent)"
                              class="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors duration-200"
                            >
                              {{ $t('studentManagement.addParent') }}
                            </button>
                            <button
                              v-else
                              @click="manageParents(selectedStudent)"
                              class="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors duration-200"
                            >
                              {{ $t('studentManagement.manageParents') }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                v-if="modalMode === 'edit'"
                @click="saveStudent"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.save') }}
              </button>
              <button
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assign to Group Modal -->
      <div v-if="showAssignModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeAssignModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ $t('studentManagement.assignToGroup') }}
              </h3>

              <div v-if="assigningStudent">
                <p class="text-sm text-gray-600 mb-4">
                  {{ $t('studentManagement.assignStudentToGroup', { name: `${assigningStudent.firstName} ${assigningStudent.lastName}` }) }}
                </p>

                <select
                  v-model="selectedGroupForAssign"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">{{ $t('studentManagement.selectGroup') }}</option>
                  <option v-for="group in groups" :key="group.id" :value="group.id">
                    {{ group.name }} ({{ group.currentStudents || 0 }}/{{ group.capacity }})
                  </option>
                </select>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmAssignToGroup"
                :disabled="!selectedGroupForAssign"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ $t('studentManagement.assign') }}
              </button>
              <button
                @click="closeAssignModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Parent Management Modal -->
      <div v-if="showParentManagementModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeParentManagementModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ $t('studentManagement.addParent') }}
              </h3>

              <!-- Tab Navigation -->
              <div class="border-b border-gray-200 mb-6">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    @click="parentModalTab = 'select'"
                    :class="[
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                      parentModalTab === 'select'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    {{ $t('studentManagement.selectExistingParent') }}
                  </button>
                  <button
                    @click="parentModalTab = 'create'"
                    :class="[
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                      parentModalTab === 'create'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    {{ $t('studentManagement.createNewParent') }}
                  </button>
                </nav>
              </div>

              <!-- Select Existing Parent Tab -->
              <div v-if="parentModalTab === 'select'" class="space-y-4">
                <!-- Search Field -->
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="parentSearchQuery"
                    @input="searchParents"
                    type="text"
                    :placeholder="$t('studentManagement.searchParents')"
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                </div>

                <!-- Search Results -->
                <div class="max-h-64 overflow-y-auto">
                  <div v-if="searchingParents" class="text-center py-4">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <p class="mt-2 text-gray-600 text-sm">{{ $t('common.loading') }}...</p>
                  </div>

                  <div v-else-if="searchedParents.length === 0 && parentSearchQuery" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('studentManagement.noParentsFound') }}</h3>
                    <p class="mt-1 text-sm text-gray-500">{{ $t('studentManagement.noParentsFoundDescription') }}</p>
                  </div>

                  <div v-else-if="searchedParents.length > 0" class="space-y-2">
                    <div
                      v-for="parent in searchedParents"
                      :key="parent.id"
                      @click="selectParent(parent)"
                      class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      :class="{ 'ring-2 ring-primary-500 bg-primary-50': selectedParent?.id === parent.id }"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h4 class="text-sm font-medium text-gray-900">{{ parent.firstName }} {{ parent.lastName }}</h4>
                          <p v-if="parent.email" class="text-sm text-gray-500">{{ parent.email }}</p>
                          <p v-if="parent.phone" class="text-sm text-gray-500">{{ parent.phone }}</p>
                        </div>
                        <div v-if="selectedParent?.id === parent.id" class="text-primary-600">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('studentManagement.searchParentDatabase') }}</h3>
                    <p class="mt-1 text-sm text-gray-500">{{ $t('studentManagement.searchParents') }}</p>
                  </div>
                </div>
              </div>

              <!-- Create New Parent Tab -->
              <div v-if="parentModalTab === 'create'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.firstName') }}</label>
                    <input
                      v-model="parentForm.firstName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.firstName')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.lastName') }}</label>
                    <input
                      v-model="parentForm.lastName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.lastName')"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.email') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <input
                    v-model="parentForm.email"
                    type="email"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :placeholder="$t('studentManagement.email')"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.phone') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <input
                    v-model="parentForm.phone"
                    type="tel"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :placeholder="$t('studentManagement.phone')"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.address') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <textarea
                    v-model="parentForm.address"
                    rows="3"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :placeholder="$t('studentManagement.address')"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmParentAction"
                :disabled="!canConfirmParentAction"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ parentModalTab === 'select' ? $t('studentManagement.assignParent') : $t('common.create') }}
              </button>
              <button
                @click="closeParentManagementModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Parent for Specific Student Modal -->
      <div v-if="showCreateParentModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeCreateParentModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ $t('studentManagement.createParent') }}
              </h3>

              <div v-if="creatingParentFor">
                <p class="text-sm text-gray-600 mb-4">
                  {{ $t('studentManagement.assignParentToStudent', { name: `${creatingParentFor.firstName} ${creatingParentFor.lastName}` }) }}
                </p>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.firstName') }}</label>
                    <input
                      v-model="parentForm.firstName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.firstName')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.lastName') }}</label>
                    <input
                      v-model="parentForm.lastName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.lastName')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.email') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                    <input
                      v-model="parentForm.email"
                      type="email"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.email')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.phone') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                    <input
                      v-model="parentForm.phone"
                      type="tel"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.phone')"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmCreateParent"
                :disabled="!parentForm.firstName || !parentForm.lastName"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ $t('common.create') }}
              </button>
              <button
                @click="closeCreateParentModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
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
import { studentService, type Student } from '@/services/student.service'
import { groupService, type Group } from '@/services/group.service'
import { parentService, type Parent } from '@/services/parent.service'

const { locale, t } = useI18n()

// Reactive data
const searchQuery = ref('')
const selectedGroup = ref('')
const selectedStatus = ref('')
const selectedAgeGroup = ref('')
const loading = ref(true)
const error = ref('')

// Real data from API
const groups = ref<Group[]>([])
const students = ref<Student[]>([])

// Modal state
const showModal = ref(false)
const showAssignModal = ref(false)
const showCreateParentModal = ref(false)
const showParentManagementModal = ref(false)
const modalMode = ref<'view' | 'edit'>('view')
const selectedStudent = ref<Student | null>(null)
const assigningStudent = ref<Student | null>(null)
const creatingParentFor = ref<Student | null>(null)
const selectedGroupForAssign = ref('')

// Parent management state
const parentModalTab = ref<'select' | 'create'>('select')
const parentSearchQuery = ref('')
const searchingParents = ref(false)
const searchedParents = ref<Parent[]>([])
const selectedParent = ref<Parent | null>(null)

// Form data
const studentForm = ref({
  photo: null,
  firstName: '',
  secondName: '',
  thirdName: '',
  familyName: '',
  dateOfBirth: '',
  gender: 'male' as 'male' | 'female',
  studentId: '',
  nationality: '',
  medicalConditions: '',
  emergencyContact: ''
})

const parentForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: ''
})

// Load data from API
const loadStudents = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await studentService.getAll()
    students.value = response || []
  } catch (err) {
    console.error('Error loading students:', err)
    error.value = 'Failed to load students'
    students.value = []
  } finally {
    loading.value = false
  }
}

const loadGroups = async () => {
  try {
    // Load only active groups
    const response = await groupService.getActive(1) // TODO: Get school_id from user context
    groups.value = response || []
  } catch (err) {
    console.error('Error loading groups:', err)
    groups.value = []
  }
}

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const filteredStudents = computed(() => {
  let filtered = students.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student =>
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      (student.email && student.email.toLowerCase().includes(query))
    )
  }

  if (selectedGroup.value) {
    filtered = filtered.filter(student =>
      student.groups && student.groups.some(group => group.id === selectedGroup.value)
    )
  }

  // TODO: Add status filtering when status field is available
  // if (selectedStatus.value) {
  //   filtered = filtered.filter(student => student.status === selectedStatus.value)
  // }

  return filtered
})

// Helper functions
const calculateAge = (dateOfBirth: Date | string) => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

const getStudentGroup = (student: Student) => {
  if (!student.groups || student.groups.length === 0) {
    return t('studentManagement.noGroup') || 'No Group'
  }
  return student.groups.map(group => group.name).join(', ')
}

const getParentName = (student: Student) => {
  if (!student.parents || student.parents.length === 0) {
    return t('studentManagement.noParent') || 'No Parent'
  }
  return student.parents.map(parent => `${parent.firstName || parent.first_name || ''} ${parent.lastName || parent.last_name || ''}`).join(', ')
}

const getStudentStatus = (student: Student) => {
  // TODO: Add real status logic when available
  return 'active'
}

// Methods
const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      studentForm.value.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US')
}

const exportStudents = () => {
  // Export functionality
  console.log('Exporting students...')
}

const viewStudent = (student: Student) => {
  // Create a detailed modal or navigate to student detail page
  showStudentModal(student, 'view')
}

const editStudent = (student: Student) => {
  // Create an edit modal or navigate to edit page
  showStudentModal(student, 'edit')
}

const assignToGroup = (student: Student) => {
  // Show assign to group modal
  showAssignGroupModal(student)
}

// Modal functions
const showStudentModal = (student: Student, mode: 'view' | 'edit') => {
  selectedStudent.value = student
  modalMode.value = mode

  // Initialize form with student data
  studentForm.value = {
    photo: student.photo || null,
    firstName: student.firstName || '',
    secondName: student.secondName || '',
    thirdName: student.thirdName || '',
    familyName: student.lastName || '',
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
    gender: student.gender || 'male',
    studentId: student.studentId || '',
    nationality: student.nationality || '',
    medicalConditions: student.medicalInfo || '',
    emergencyContact: student.emergencyContact || ''
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedStudent.value = null
  studentForm.value = {
    photo: null,
    firstName: '',
    secondName: '',
    thirdName: '',
    familyName: '',
    dateOfBirth: '',
    gender: 'male',
    studentId: '',
    nationality: '',
    medicalConditions: '',
    emergencyContact: ''
  }
}

const saveStudent = async () => {
  if (!selectedStudent.value) return

  try {
    loading.value = true

    const updateData = {
      firstName: studentForm.value.firstName,
      secondName: studentForm.value.secondName,
      thirdName: studentForm.value.thirdName,
      lastName: studentForm.value.familyName,
      dateOfBirth: new Date(studentForm.value.dateOfBirth),
      gender: studentForm.value.gender,
      studentId: studentForm.value.studentId,
      nationality: studentForm.value.nationality,
      medicalInfo: studentForm.value.medicalConditions,
      emergencyContact: studentForm.value.emergencyContact,
      photo: studentForm.value.photo
    }

    await studentService.update(selectedStudent.value.id, updateData)

    // Refresh students list
    await loadStudents()

    closeModal()
  } catch (err) {
    console.error('Error updating student:', err)
    error.value = 'Failed to update student'
  } finally {
    loading.value = false
  }
}

const showAssignGroupModal = (student: Student) => {
  assigningStudent.value = student
  selectedGroupForAssign.value = ''
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  assigningStudent.value = null
  selectedGroupForAssign.value = ''
}

const confirmAssignToGroup = async () => {
  if (!assigningStudent.value || !selectedGroupForAssign.value) return

  try {
    loading.value = true

    // Use the real API call to assign student to group
    await studentService.assignToGroup(assigningStudent.value.id, selectedGroupForAssign.value)

    // Refresh students list to show updated assignment
    await loadStudents()

    closeAssignModal()
  } catch (err) {
    console.error('Error assigning student to group:', err)
    error.value = 'Failed to assign student to group'
  } finally {
    loading.value = false
  }
}

// Computed properties
const canConfirmParentAction = computed(() => {
  if (parentModalTab.value === 'select') {
    return selectedParent.value !== null
  } else {
    return parentForm.value.firstName && parentForm.value.lastName
  }
})

// Parent search and management functions
const searchParents = async () => {
  if (!parentSearchQuery.value.trim()) {
    searchedParents.value = []
    return
  }

  try {
    searchingParents.value = true
    searchedParents.value = await parentService.search(parentSearchQuery.value)
  } catch (err) {
    console.error('Error searching parents:', err)
    searchedParents.value = []
  } finally {
    searchingParents.value = false
  }
}

const selectParent = (parent: Parent) => {
  selectedParent.value = parent
}

const closeParentManagementModal = () => {
  showParentManagementModal.value = false
  parentModalTab.value = 'select'
  parentSearchQuery.value = ''
  searchedParents.value = []
  selectedParent.value = null
  parentForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  }
}

const confirmParentAction = async () => {
  if (!canConfirmParentAction.value) return

  try {
    loading.value = true

    if (parentModalTab.value === 'select' && selectedParent.value) {
      // If just creating a parent without assigning to specific student
      console.log('Selected parent:', selectedParent.value)
      // You could add logic here to do something with the selected parent
    } else if (parentModalTab.value === 'create') {
      // Create new parent
      await parentService.create({
        firstName: parentForm.value.firstName,
        lastName: parentForm.value.lastName,
        email: parentForm.value.email || undefined,
        phone: parentForm.value.phone || undefined,
        address: parentForm.value.address || undefined,
      })
    }

    closeParentManagementModal()
  } catch (err) {
    console.error('Error with parent action:', err)
    error.value = 'Failed to process parent action'
  } finally {
    loading.value = false
  }
}

// Parent creation functions
const createParent = (student: Student) => {
  creatingParentFor.value = student
  parentForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  }
  showCreateParentModal.value = true
}

const manageParents = (student: Student) => {
  // Open parent management modal for existing parents
  showParentManagementModal.value = true
}

const closeCreateParentModal = () => {
  showCreateParentModal.value = false
  creatingParentFor.value = null
  parentForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  }
}

const confirmCreateParent = async () => {
  if (!creatingParentFor.value || !parentForm.value.firstName || !parentForm.value.lastName) return

  try {
    loading.value = true

    // Create the parent
    const newParent = await parentService.create({
      firstName: parentForm.value.firstName,
      lastName: parentForm.value.lastName,
      email: parentForm.value.email || undefined,
      phone: parentForm.value.phone || undefined,
    })

    // Assign the parent to the student
    await parentService.assignToStudent(newParent.id, creatingParentFor.value.id)

    // Refresh students list to show updated parent assignment
    await loadStudents()

    closeCreateParentModal()
  } catch (err) {
    console.error('Error creating parent:', err)
    error.value = 'Failed to create parent'
  } finally {
    loading.value = false
  }
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    loadStudents(),
    loadGroups()
  ])
})
</script>
