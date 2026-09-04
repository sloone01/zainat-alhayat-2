<template>
  <div class="space-y-6 lg:space-y-8">
    <!-- Section Header -->
    <div class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.guardian') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.guardianDescription') }}</p>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Guardian Type Selection -->
      <div class="space-y-4">
        <label class="flex items-center text-sm font-semibold text-gray-700">
          <span class="text-red-500 mr-1">*</span>
          {{ $t('enrollment.guardianType') }}
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="relative cursor-pointer">
            <input
              v-model="localData.type"
              type="radio"
              value="father"
              class="peer sr-only"
            >
            <div class="p-4 bg-white border-2 border-gray-200 rounded-xl peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all duration-200 hover:border-gray-300 text-center">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 peer-checked:bg-indigo-100">
                <svg class="w-5 h-5 text-blue-600 peer-checked:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900">{{ $t('enrollment.father') }}</h3>
            </div>
          </label>

          <label class="relative cursor-pointer">
            <input
              v-model="localData.type"
              type="radio"
              value="mother"
              class="peer sr-only"
            >
            <div class="p-4 bg-white border-2 border-gray-200 rounded-xl peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all duration-200 hover:border-gray-300 text-center">
              <div class="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-2 peer-checked:bg-indigo-100">
                <svg class="w-5 h-5 text-pink-600 peer-checked:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900">{{ $t('enrollment.mother') }}</h3>
            </div>
          </label>

          <label class="relative cursor-pointer">
            <input
              v-model="localData.type"
              type="radio"
              value="other"
              class="peer sr-only"
            >
            <div class="p-4 bg-white border-2 border-gray-200 rounded-xl peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all duration-200 hover:border-gray-300 text-center">
              <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 peer-checked:bg-indigo-100">
                <svg class="w-5 h-5 text-gray-600 peer-checked:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900">{{ $t('enrollment.other') }}</h3>
            </div>
          </label>
        </div>
      </div>

      <!-- Father Information -->
      <div v-if="localData.type === 'father'" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 space-y-6">
        <h3 class="text-xl font-semibold text-gray-900 flex items-center">
          <svg class="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ $t('enrollment.fatherInfo') }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.fullName') }}
            </label>
            <input
              v-model="localData.fatherInfo.fullName"
              type="text"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.fatherNamePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.tribe') }}
            </label>
            <input
              v-model="localData.fatherInfo.tribe"
              type="text"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.tribePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.workplace') }}
            </label>
            <input
              v-model="localData.fatherInfo.workplace"
              type="text"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.workplacePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.workPhone') }}
            </label>
            <input
              v-model="localData.fatherInfo.workPhone"
              type="tel"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.workPhonePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.mobile') }}
            </label>
            <input
              v-model="localData.fatherInfo.mobile"
              type="tel"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.mobilePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.email') }}
            </label>
            <input
              v-model="localData.fatherInfo.email"
              @blur="validateFatherEmail"
              @input="validateFatherEmail"
              type="email"
              :class="[
                'w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white',
                fatherEmailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              ]"
              :placeholder="$t('enrollment.emailPlaceholder')"
            >
            <p v-if="fatherEmailError" class="text-sm text-red-600 mt-1">{{ fatherEmailError }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">
            {{ $t('enrollment.maritalStatus') }}
          </label>
          <select
            v-model="localData.fatherInfo.maritalStatus"
            class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
          >
            <option value="">{{ $t('enrollment.selectMaritalStatus') }}</option>
            <option value="married">{{ $t('enrollment.married') }}</option>
            <option value="divorced">{{ $t('enrollment.divorced') }}</option>
            <option value="widowed">{{ $t('enrollment.widowed') }}</option>
          </select>
        </div>
      </div>

      <!-- Mother Information -->
      <div v-if="localData.type === 'mother'" class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100 space-y-6">
        <h3 class="text-xl font-semibold text-gray-900 flex items-center">
          <svg class="w-6 h-6 text-pink-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ $t('enrollment.motherInfo') }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.fullName') }}
            </label>
            <input
              v-model="localData.motherInfo.fullName"
              type="text"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.motherNamePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.tribe') }}
            </label>
            <input
              v-model="localData.motherInfo.tribe"
              type="text"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.tribePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.workplace') }}
            </label>
            <input
              v-model="localData.motherInfo.workplace"
              type="text"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.workplacePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.workPhone') }}
            </label>
            <input
              v-model="localData.motherInfo.workPhone"
              type="tel"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.workPhonePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.mobile') }}
            </label>
            <input
              v-model="localData.motherInfo.mobile"
              type="tel"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.mobilePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.email') }}
            </label>
            <input
              v-model="localData.motherInfo.email"
              @blur="validateMotherEmail"
              @input="validateMotherEmail"
              type="email"
              :class="[
                'w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white',
                motherEmailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
              ]"
              :placeholder="$t('enrollment.emailPlaceholder')"
            >
            <p v-if="motherEmailError" class="text-sm text-red-600 mt-1">{{ motherEmailError }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">
            {{ $t('enrollment.maritalStatus') }}
          </label>
          <select
            v-model="localData.motherInfo.maritalStatus"
            class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
          >
            <option value="">{{ $t('enrollment.selectMaritalStatus') }}</option>
            <option value="married">{{ $t('enrollment.married') }}</option>
            <option value="divorced">{{ $t('enrollment.divorced') }}</option>
            <option value="widowed">{{ $t('enrollment.widowed') }}</option>
          </select>
        </div>
      </div>

      <!-- Other Guardian Information -->
      <div v-if="localData.type === 'other'" class="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 space-y-6">
        <h3 class="text-xl font-semibold text-gray-900 flex items-center">
          <svg class="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {{ $t('enrollment.otherGuardianInfo') }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.organizationName') }}
            </label>
            <input
              v-model="localData.otherInfo.organizationName"
              type="text"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.organizationPlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.phone') }}
            </label>
            <input
              v-model="localData.otherInfo.phone"
              type="tel"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.phonePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.responsiblePerson') }}
            </label>
            <input
              v-model="localData.otherInfo.responsiblePerson"
              type="text"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.responsiblePersonPlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.responsiblePhone') }}
            </label>
            <input
              v-model="localData.otherInfo.responsiblePhone"
              type="tel"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.responsiblePhonePlaceholder')"
            >
          </div>
        </div>
      </div>

      <!-- Emergency Contact Section -->
      <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200 space-y-6">
        <h3 class="text-xl font-semibold text-gray-900 flex items-center">
          <svg class="w-6 h-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {{ $t('enrollment.emergencyContact') }}
        </h3>
        <p class="text-gray-600">{{ $t('enrollment.emergencyContactDescription') }}</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.emergencyContactName') }}
            </label>
            <input
              v-model="localData.emergencyContact.fullName"
              type="text"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.emergencyContactNamePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.tribe') }}
            </label>
            <input
              v-model="localData.emergencyContact.tribe"
              type="text"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.tribePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.workplace') }}
            </label>
            <input
              v-model="localData.emergencyContact.workplace"
              type="text"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.workplacePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              {{ $t('enrollment.workPhone') }}
            </label>
            <input
              v-model="localData.emergencyContact.workPhone"
              type="tel"
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.workPhonePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.mobile') }}
            </label>
            <input
              v-model="localData.emergencyContact.mobile"
              type="tel"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.mobilePlaceholder')"
            >
          </div>

          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <span class="text-red-500 mr-1">*</span>
              {{ $t('enrollment.relationship') }}
            </label>
            <input
              v-model="localData.emergencyContact.relationship"
              type="text"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              :placeholder="$t('enrollment.relationshipPlaceholder')"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
      <button
        @click="$emit('back')"
        class="order-2 sm:order-1 px-6 py-3 text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 font-medium transition-colors"
      >
        <svg class="w-5 h-5 inline" :class="{ 'mr-2': !isRTL, 'ml-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
        </svg>
        {{ $t('common.back') }}
      </button>
      <button
        @click="handleNext"
        :disabled="!isValid"
        class="order-1 sm:order-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
      >
        {{ $t('common.next') }}
        <svg class="w-5 h-5 inline" :class="{ 'ml-2': !isRTL, 'mr-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const props = defineProps<{
  modelValue: {
    type: string
    fatherInfo: {
      fullName: string
      tribe: string
      workplace: string
      workPhone: string
      mobile: string
      email: string
      maritalStatus: string
    }
    motherInfo: {
      fullName: string
      tribe: string
      workplace: string
      workPhone: string
      mobile: string
      email: string
      maritalStatus: string
    }
    otherInfo: {
      organizationName: string
      phone: string
      responsiblePerson: string
      responsiblePhone: string
    }
    emergencyContact: {
      fullName: string
      tribe: string
      workplace: string
      workPhone: string
      mobile: string
      relationship: string
    }
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

// Local copy of the data
const localData = ref({ ...props.modelValue })

// Email validation states
const fatherEmailError = ref('')
const motherEmailError = ref('')

// Email validation functions
const validateEmail = (email: string): string => {
  if (!email) return '' // Empty email is allowed
  if (!emailRegex.test(email)) {
    return 'البريد الإلكتروني غير صحيح'
  }
  return ''
}

const validateFatherEmail = () => {
  fatherEmailError.value = validateEmail(localData.value.fatherInfo.email)
}

const validateMotherEmail = () => {
  motherEmailError.value = validateEmail(localData.value.motherInfo.email)
}

// Watch for changes and emit updates
watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// Validation
const isValid = computed(() => {
  if (!localData.value.type) return false

  // Check for email validation errors
  if (fatherEmailError.value || motherEmailError.value) return false

  // Guardian validation
  let guardianValid = false
  if (localData.value.type === 'father') {
    guardianValid = !!(localData.value.fatherInfo.fullName && localData.value.fatherInfo.mobile)
  } else if (localData.value.type === 'mother') {
    guardianValid = !!(localData.value.motherInfo.fullName && localData.value.motherInfo.mobile)
  } else if (localData.value.type === 'other') {
    guardianValid = !!(
      localData.value.otherInfo.organizationName &&
      localData.value.otherInfo.phone &&
      localData.value.otherInfo.responsiblePerson &&
      localData.value.otherInfo.responsiblePhone
    )
  }

  // Emergency contact validation
  const emergencyValid = !!(
    localData.value.emergencyContact.fullName &&
    localData.value.emergencyContact.mobile &&
    localData.value.emergencyContact.relationship
  )

  return guardianValid && emergencyValid
})

const handleNext = () => {
  if (isValid.value) {
    emit('next')
  }
}
</script>