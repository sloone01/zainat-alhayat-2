<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('students.registerStudent') }}</h1>
            <div class="flex items-center gap-2 mt-1">
              <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span class="text-sm text-primary-600 font-medium">{{ $t('students.step') }} {{ currentStep }}/3</span>
            </div>
          </div>
          <button
            @click="$router.push('/students')"
            class="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('common.back') }}
          </button>
        </div>
      </div>

      <!-- Enhanced Progress Steps -->
      <div class="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg shadow-sm border border-primary-200 p-6">
        <div class="flex items-center justify-center space-x-8">
          <div v-for="(step, index) in steps" :key="index" class="flex items-center">
            <div class="relative">
              <div :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                currentStep > index + 1 ? 'bg-green-500 text-white shadow-lg transform scale-110' :
                currentStep === index + 1 ? 'bg-primary-600 text-white shadow-lg transform scale-110 ring-4 ring-primary-200' :
                'bg-white text-gray-400 border-2 border-gray-200'
              ]">
                <svg v-if="currentStep > index + 1" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else class="font-bold">{{ index + 1 }}</span>
              </div>
              <!-- Step icon -->
              <div v-if="currentStep === index + 1" class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div v-if="index < steps.length - 1" :class="[
              'w-16 h-1 mx-4 rounded-full transition-all duration-300',
              currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
            ]"></div>
          </div>
        </div>
        <!-- Enhanced Step Title -->
        <div class="text-center mt-6">
          <h2 class="text-lg font-bold text-gray-900">{{ steps[currentStep - 1]?.title }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ steps[currentStep - 1]?.description }}</p>
          <div class="mt-2 w-24 h-1 bg-primary-500 rounded-full mx-auto"></div>
        </div>
      </div>

      <!-- Step 1: Enhanced Student Information -->
      <div v-if="currentStep === 1" class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <!-- Step Header -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div class="flex items-center gap-3 text-white">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold">معلومات الطالب الأساسية</h3>
              <p class="text-blue-100 text-sm">يرجى إدخال البيانات الشخصية للطالب</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="nextStep" class="p-6 space-y-6">
          <!-- Enhanced Student Photo -->
          <div class="text-center">
            <div class="relative inline-block">
              <div class="w-28 h-28 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-lg">
                <img v-if="studentForm.photo" :src="studentForm.photo" alt="Student Photo" class="w-full h-full object-cover" />
                <svg v-else class="w-14 h-14 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <button
                type="button"
                @click="$refs.photoInput.click()"
                class="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-110"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p class="text-sm text-gray-600 mt-3 font-medium">{{ $t('students.photoDescription') }}</p>
            <p class="text-xs text-gray-500 mt-1">اختياري - يمكن إضافة الصورة لاحقاً</p>
          </div>

          <!-- Enhanced Form Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- First Name -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                {{ $t('students.firstName') }} *
              </label>
              <div class="relative">
                <input
                  v-model="studentForm.firstName"
                  type="text"
                  required
                  :placeholder="$t('students.firstNamePlaceholder')"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 hover:border-gray-300"
                />
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Second Name -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                {{ $t('students.secondName') }} *
              </label>
              <div class="relative">
                <input
                  v-model="studentForm.secondName"
                  type="text"
                  required
                  :placeholder="$t('students.secondNamePlaceholder')"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 hover:border-gray-300"
                />
              </div>
            </div>

            <!-- Third Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('students.thirdName') }}
              </label>
              <input
                v-model="studentForm.thirdName"
                type="text"
                :placeholder="$t('students.thirdNamePlaceholder')"
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Family Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('students.familyName') }} *
              </label>
              <input
                v-model="studentForm.familyName"
                type="text"
                required
                :placeholder="$t('students.familyNamePlaceholder')"
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('students.dateOfBirth') }} *
              </label>
              <input
                v-model="studentForm.dateOfBirth"
                type="date"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('students.gender') }} *
              </label>
              <select
                v-model="studentForm.gender"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              >
                <option value="">{{ $t('students.selectGender') }}</option>
                <option value="male">{{ $t('students.male') }}</option>
                <option value="female">{{ $t('students.female') }}</option>
              </select>
            </div>

            <!-- Student ID -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('students.studentId') }}
              </label>
              <input
                v-model="studentForm.studentId"
                type="text"
                :placeholder="$t('students.studentIdPlaceholder')"
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              />
              <p class="text-xs text-gray-500 mt-1">{{ $t('students.studentIdNote') }}</p>
            </div>

            <!-- Nationality -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('students.nationality') }} *
              </label>
              <select
                v-model="studentForm.nationality"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              >
                <option value="">{{ $t('students.selectNationality') }}</option>
                <option value="omani">{{ $t('students.omani') }}</option>
                <option value="expat">{{ $t('students.expat') }}</option>
              </select>
            </div>

            <!-- Medical Conditions -->
            <div class="md:col-span-2 lg:col-span-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('students.medicalConditions') }}
              </label>
              <textarea
                v-model="studentForm.medicalConditions"
                rows="3"
                :placeholder="$t('students.medicalConditionsPlaceholder')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Enhanced Actions -->
          <div class="pt-6 border-t border-gray-100">
            <button
              type="submit"
              class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 text-lg font-semibold shadow-lg transform hover:scale-105"
            >
              <span>{{ $t('common.next') }}</span>
              <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </form>
      </div>

      <!-- Step 2: Parent Information -->
      <div v-if="currentStep === 2" class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('students.parentInformation') }}</h2>

        <!-- Parent Matching Results -->
        <div v-if="parentMatches.length > 0" class="mb-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-sm font-medium text-green-800">{{ $t('students.parentMatchesFound') }}</h3>
            </div>
            <p class="text-sm text-green-700 mt-1">{{ $t('students.parentMatchesDescription') }}</p>
          </div>

          <div class="space-y-3">
            <div
              v-for="parent in parentMatches"
              :key="parent.id"
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-all duration-200',
                selectedParent?.id === parent.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
              @click="selectParent(parent)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">{{ parent.firstName[0] }}{{ parent.familyName[0] }}</span>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ parent.firstName }} {{ parent.secondName }} {{ parent.thirdName }} {{ parent.familyName }}</h4>
                    <p class="text-sm text-gray-600">{{ parent.email }} • {{ parent.mobile }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ $t('students.matchScore') }}: {{ parent.matchScore }}%</span>
                      <span v-if="parent.hasUserAccount" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{{ $t('students.hasAccount') }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center">
                  <input
                    type="radio"
                    :checked="selectedParent?.id === parent.id"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Matches Found -->
        <div v-else class="mb-6">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 class="text-sm font-medium text-yellow-800">{{ $t('students.noParentMatches') }}</h3>
            </div>
            <p class="text-sm text-yellow-700 mt-1">{{ $t('students.noParentMatchesDescription') }}</p>
          </div>
        </div>

        <!-- Search for Parent -->
        <div class="mb-6">
          <div class="flex items-center gap-4 mb-4">
            <h3 class="text-lg font-medium text-gray-900">{{ $t('students.searchParent') }}</h3>
            <button
              @click="showParentSearch = true"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {{ $t('students.searchInParentDatabase') }}
            </button>
          </div>
        </div>

        <!-- Create New Parent -->
        <div class="mb-6">
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">{{ $t('students.createNewParent') }}</h3>
              <div class="flex items-center">
                <input
                  v-model="createNewParent"
                  type="checkbox"
                  id="createNewParent"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="createNewParent" class="ml-2 text-sm text-gray-700">{{ $t('students.createNewParentLabel') }}</label>
              </div>
            </div>

            <div v-if="createNewParent" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Parent First Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('students.parentFirstName') }} *
                  </label>
                  <input
                    v-model="newParentForm.firstName"
                    type="text"
                    required
                    :placeholder="$t('students.parentFirstNamePlaceholder')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Parent Family Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('students.parentFamilyName') }} *
                  </label>
                  <input
                    v-model="newParentForm.familyName"
                    type="text"
                    required
                    :placeholder="$t('students.parentFamilyNamePlaceholder')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Parent Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('students.email') }} *
                  </label>
                  <input
                    v-model="newParentForm.email"
                    type="email"
                    required
                    :placeholder="$t('students.emailPlaceholder')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Parent Mobile -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('students.mobile') }} *
                  </label>
                  <input
                    v-model="newParentForm.mobile"
                    type="tel"
                    required
                    :placeholder="$t('students.mobilePlaceholder')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Create User Account -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-blue-800">{{ $t('students.createUserAccount') }}</h4>
                    <p class="text-sm text-blue-700 mt-1">{{ $t('students.createUserAccountNote') }}</p>
                  </div>
                  <div class="flex items-center">
                    <input
                      v-model="createParentUser"
                      type="checkbox"
                      id="createParentUser"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="createParentUser" class="ml-2 text-sm text-blue-700">{{ $t('students.createUserAccountLabel') }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between pt-6 border-t border-gray-200">
          <button
            @click="previousStep"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('common.previous') }}
          </button>
          <button
            @click="nextStep"
            :disabled="!selectedParent && !createNewParent"
            :class="[
              'px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2',
              selectedParent || createNewParent
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            {{ $t('common.next') }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 3: Group Assignment -->
      <div v-if="currentStep === 3" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ $t('students.groupAssignment') }}</h2>

        <!-- Available Groups -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('students.selectGroup') }}</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="group in availableGroups"
              :key="group.id"
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-all duration-200',
                selectedGroup?.id === group.id
                  ? 'border-blue-500 bg-blue-50'
                  : group.capacity <= group.currentStudents
                    ? 'border-red-200 bg-red-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
              @click="selectGroup(group)"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h4 class="font-medium text-gray-900">{{ group.name }}</h4>
                  <p class="text-sm text-gray-600">{{ group.ageGroup }}</p>
                </div>
                <div class="flex items-center">
                  <input
                    type="radio"
                    :checked="selectedGroup?.id === group.id"
                    :disabled="group.capacity <= group.currentStudents"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <!-- Capacity -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{{ $t('students.capacity') }}:</span>
                  <span :class="[
                    'font-medium',
                    group.currentStudents >= group.capacity ? 'text-red-600' : 'text-gray-900'
                  ]">{{ group.currentStudents }}/{{ group.capacity }}</span>
                </div>

                <!-- Progress Bar -->
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    :class="[
                      'h-2 rounded-full transition-all duration-300',
                      group.currentStudents >= group.capacity ? 'bg-red-500' :
                      group.currentStudents >= group.capacity * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                    ]"
                    :style="{ width: Math.min((group.currentStudents / group.capacity) * 100, 100) + '%' }"
                  ></div>
                </div>

                <!-- Status -->
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-2 h-2 rounded-full',
                    group.currentStudents >= group.capacity ? 'bg-red-500' :
                    group.currentStudents >= group.capacity * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                  ]"></div>
                  <span :class="[
                    'text-xs font-medium',
                    group.currentStudents >= group.capacity ? 'text-red-600' :
                    group.currentStudents >= group.capacity * 0.8 ? 'text-yellow-600' : 'text-green-600'
                  ]">
                    {{ group.currentStudents >= group.capacity ? $t('students.groupFull') :
                       group.currentStudents >= group.capacity * 0.8 ? $t('students.groupAlmostFull') : $t('students.groupAvailable') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Summary -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('students.registrationSummary') }}</h3>

          <div class="space-y-4">
            <!-- Student Info -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">{{ studentForm.firstName }} {{ studentForm.familyName }}</h4>
                <p class="text-sm text-gray-600">{{ $t('students.dateOfBirth') }}: {{ formatDate(studentForm.dateOfBirth) }}</p>
              </div>
            </div>

            <!-- Parent Info -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">
                  {{ selectedParent ? `${selectedParent.firstName} ${selectedParent.familyName}` :
                     createNewParent ? `${newParentForm.firstName} ${newParentForm.familyName}` : '' }}
                </h4>
                <p class="text-sm text-gray-600">
                  {{ selectedParent ? selectedParent.email :
                     createNewParent ? newParentForm.email : '' }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span v-if="selectedParent" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ $t('students.existingParent') }}</span>
                  <span v-if="createNewParent" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{{ $t('students.newParent') }}</span>
                  <span v-if="createParentUser" class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{{ $t('students.willCreateAccount') }}</span>
                </div>
              </div>
            </div>

            <!-- Group Info -->
            <div v-if="selectedGroup" class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">{{ selectedGroup.name }}</h4>
                <p class="text-sm text-gray-600">{{ selectedGroup.ageGroup }} • {{ selectedGroup.currentStudents + 1 }}/{{ selectedGroup.capacity }} {{ $t('students.students') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between pt-6 border-t border-gray-200">
          <button
            @click="previousStep"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('common.previous') }}
          </button>
          <button
            @click="registerStudent"
            :disabled="!selectedGroup"
            :class="[
              'px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2',
              selectedGroup
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ $t('students.registerStudent') }}
          </button>
        </div>
      </div>

      <!-- Parent Search Modal -->
      <ParentSearchModal
        v-if="showParentSearch"
        :show="showParentSearch"
        @close="showParentSearch = false"
        @select="selectParentFromSearch"
      />

      <!-- Progress Dialog -->
      <ProgressDialog
        :show="showProgressDialog"
        :state="progressState"
        :title="progressTitle"
        :message="progressMessage"
        @close="showProgressDialog = false"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ParentSearchModal from '@/components/ParentSearchModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { studentService, type CreateStudentRequest } from '@/services/student.service'
import { groupService, type Group } from '@/services/group.service'

const { locale, t } = useI18n()
const router = useRouter()

// Reactive data
const currentStep = ref(1)
const showParentSearch = ref(false)
const createNewParent = ref(false)
const createParentUser = ref(false)
const selectedParent = ref(null)
const selectedGroup = ref(null)

// Progress dialog
const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')

// Form data
const studentForm = ref({
  photo: null,
  firstName: '',
  secondName: '',
  thirdName: '',
  familyName: '',
  dateOfBirth: '',
  gender: '',
  studentId: '',
  nationality: '',
  medicalConditions: ''
})

const newParentForm = ref({
  firstName: '',
  familyName: '',
  email: '',
  mobile: ''
})

// Steps configuration
const steps = ref([
  {
    title: 'معلومات الطالب',
    description: 'البيانات الأساسية للطالب'
  },
  {
    title: 'معلومات ولي الأمر',
    description: 'ربط أو إنشاء ولي أمر'
  },
  {
    title: 'تخصيص المجموعة',
    description: 'اختيار المجموعة المناسبة'
  }
])

// API data
const parentMatches = ref([])
const availableGroups = ref<Group[]>([])

// Load groups from API
const loadAvailableGroups = async () => {
  try {
    const groups = await groupService.getActive(1) // TODO: Get school_id from user context

    // Enhance groups with capacity info
    const groupsWithCapacity = await Promise.all(
      groups.map(async (group) => {
        try {
          const capacityInfo = await groupService.getGroupCapacity(group.id)
          return {
            ...group,
            currentStudents: capacityInfo.currentStudents || 0,
            ageGroup: `${group.age_range_min}-${group.age_range_max} سنوات`
          }
        } catch (error) {
          // Fallback if capacity endpoint is not available
          return {
            ...group,
            currentStudents: 0,
            ageGroup: group.age_range_min && group.age_range_max
              ? `${group.age_range_min}-${group.age_range_max} سنوات`
              : 'مجموعة عامة'
          }
        }
      })
    )

    availableGroups.value = groupsWithCapacity
  } catch (error) {
    console.error('Error loading groups:', error)
    availableGroups.value = []
  }
}

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

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

const nextStep = () => {
  if (currentStep.value === 1) {
    // Search for parent matches based on student's family name
    searchParentMatches()
  }
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const searchParentMatches = () => {
  // In real app, this would be an API call
  // For now, we'll simulate matching based on family name
  const studentFamilyName = studentForm.value.familyName.toLowerCase()

  // Mock API response - in real app this would search the database
  parentMatches.value = parentMatches.value.filter(parent =>
    parent.familyName.toLowerCase().includes(studentFamilyName) ||
    parent.secondName.toLowerCase().includes(studentForm.value.secondName.toLowerCase()) ||
    parent.thirdName.toLowerCase().includes(studentForm.value.thirdName.toLowerCase())
  )
}

const selectParent = (parent: any) => {
  selectedParent.value = parent
  createNewParent.value = false
}

const selectParentFromSearch = (parent: any) => {
  selectedParent.value = parent
  createNewParent.value = false
  showParentSearch.value = false
}

const selectGroup = (group: any) => {
  if (group.currentStudents < group.capacity) {
    selectedGroup.value = group
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const registerStudent = async () => {
  try {
    // Validate required fields
    if (!studentForm.value.firstName || !studentForm.value.familyName || !studentForm.value.dateOfBirth || !studentForm.value.gender) {
      progressState.value = 'error'
      progressTitle.value = 'خطأ في التحقق'
      progressMessage.value = 'يرجى ملء جميع الحقول المطلوبة'
      showProgressDialog.value = true
      return
    }

    if (!selectedGroup.value) {
      progressState.value = 'error'
      progressTitle.value = 'خطأ في التحقق'
      progressMessage.value = 'يرجى اختيار مجموعة للطالب'
      showProgressDialog.value = true
      return
    }

    // Show progress dialog
    showProgressDialog.value = true
    progressState.value = 'loading'
    progressTitle.value = 'جاري تسجيل الطالب'
    progressMessage.value = 'يرجى الانتظار...'

    // Prepare student data
    const studentData: CreateStudentRequest = {
      firstName: studentForm.value.firstName,
      lastName: studentForm.value.familyName,
      dateOfBirth: new Date(studentForm.value.dateOfBirth),
      gender: studentForm.value.gender as 'male' | 'female',
      address: 'Default Address', // TODO: Add address field to form
      emergencyContact: newParentForm.value.mobile || 'No emergency contact',
      medicalInfo: studentForm.value.medicalConditions,
      notes: `Registered on ${new Date().toISOString()}`,
      // TODO: Add parent and group associations
    }

    // Register student
    const registeredStudent = await studentService.create(studentData)

    // Show success
    progressState.value = 'success'
    progressTitle.value = 'تم التسجيل بنجاح!'
    progressMessage.value = `تم تسجيل الطالب ${studentForm.value.firstName} ${studentForm.value.familyName} بنجاح`

    // Redirect after delay
    setTimeout(() => {
      showProgressDialog.value = false
      router.push('/students')
    }, 2000)

  } catch (error: any) {
    console.error('Registration failed:', error)
    progressState.value = 'error'
    progressTitle.value = 'فشل في التسجيل'
    progressMessage.value = error.message || 'حدث خطأ أثناء تسجيل الطالب'
  }
}

// Watch for createNewParent changes
const watchCreateNewParent = () => {
  if (createNewParent.value) {
    selectedParent.value = null
  }
}

onMounted(async () => {
  // Load available groups
  await loadAvailableGroups()
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

