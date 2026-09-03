<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex flex-wrap items-center gap-3">
            <router-link
              to="/students"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              :aria-label="$t('students.backToStudentManagement')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
                {{ $t('students.registerEyebrow') }}
              </p>
              <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {{ $t('students.registerStudent') }}
              </h1>
            </div>
          </div>
          <p class="mt-3 max-w-2xl text-sm text-slate-200/95">
            {{ $t('students.registerSubtitle') }}
          </p>
          <div class="mt-5 flex flex-wrap items-center gap-3 text-sm text-primary-50/90">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-medium ring-1 ring-white/20">
              {{ $t('students.step') }} {{ currentStep }}/3
            </span>
            <span class="tabular-nums">{{ Math.round((currentStep / 3) * 100) }}%</span>
          </div>
          <div class="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-white/15">
            <div
              class="h-full rounded-full bg-gradient-to-r from-emerald-300 to-teal-200 transition-all duration-500"
              :style="{ width: `${(currentStep / 3) * 100}%` }"
            />
          </div>
        </div>
      </section>

      <!-- Progress steps -->
      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col items-center gap-5">
            <ol class="flex w-full max-w-xl items-center justify-between gap-2">
              <li
                v-for="(step, index) in steps"
                :key="index"
                class="flex flex-1 items-center"
              >
                <div class="flex flex-col items-center gap-2 text-center">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition"
                    :class="stepCircleClass(index + 1)"
                  >
                    <svg
                      v-if="currentStep > index + 1"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <span
                    class="hidden text-[11px] font-semibold sm:block"
                    :class="currentStep === index + 1 ? 'text-primary-800' : 'text-gray-500'"
                  >
                    {{ step.shortTitle }}
                  </span>
                </div>
                <div
                  v-if="index < steps.length - 1"
                  class="mx-2 h-1 flex-1 rounded-full"
                  :class="currentStep > index + 1 ? 'bg-emerald-500' : 'bg-gray-200'"
                  aria-hidden="true"
                />
              </li>
            </ol>
            <div class="text-center">
              <h2 class="text-base font-semibold text-gray-900">{{ steps[currentStep - 1]?.title }}</h2>
              <p class="mt-1 text-sm text-gray-500">{{ steps[currentStep - 1]?.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Step 1: Student Information -->
      <section
        v-if="currentStep === 1"
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
      >
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
          <div class="flex items-start gap-3">
            <div class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 sm:flex">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('students.stepStudentTitle') }}</h3>
              <p class="mt-0.5 text-xs text-gray-500">{{ $t('students.stepStudentSubtitle') }}</p>
            </div>
          </div>
        </div>

        <form class="space-y-6 p-6" @submit.prevent="nextStep">
          <div class="text-center">
            <div class="relative inline-block">
              <div class="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-primary-50 to-teal-50 shadow-md ring-1 ring-primary-100">
                <img v-if="studentForm.photo" :src="studentForm.photo" alt="" class="h-full w-full object-cover">
                <svg v-else class="h-14 w-14 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <button
                type="button"
                class="absolute -bottom-1 -end-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-md transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                :aria-label="$t('students.photoDescription')"
                @click="triggerPhotoPick"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref="photoInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handlePhotoUpload"
              >
            </div>
            <p class="mt-3 text-sm font-medium text-gray-600">{{ $t('students.photoDescription') }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ $t('students.photoOptional') }}</p>
          </div>

          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-first-name">
                {{ $t('students.firstName') }} *
              </label>
              <input
                id="reg-first-name"
                v-model="studentForm.firstName"
                type="text"
                required
                class="reg-input"
                :placeholder="$t('students.firstNamePlaceholder')"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-second-name">
                {{ $t('students.secondName') }} *
              </label>
              <input
                id="reg-second-name"
                v-model="studentForm.secondName"
                type="text"
                required
                class="reg-input"
                :placeholder="$t('students.secondNamePlaceholder')"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-third-name">
                {{ $t('students.thirdName') }}
              </label>
              <input
                id="reg-third-name"
                v-model="studentForm.thirdName"
                type="text"
                class="reg-input"
                :placeholder="$t('students.thirdNamePlaceholder')"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-family-name">
                {{ $t('students.familyName') }} *
              </label>
              <input
                id="reg-family-name"
                v-model="studentForm.familyName"
                type="text"
                required
                class="reg-input"
                :placeholder="$t('students.familyNamePlaceholder')"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-dob">
                {{ $t('students.dateOfBirth') }} *
              </label>
              <input
                id="reg-dob"
                v-model="studentForm.dateOfBirth"
                type="date"
                required
                class="reg-input"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-gender">
                {{ $t('students.gender') }} *
              </label>
              <select id="reg-gender" v-model="studentForm.gender" required class="reg-input">
                <option value="">{{ $t('students.selectGender') }}</option>
                <option value="male">{{ $t('students.male') }}</option>
                <option value="female">{{ $t('students.female') }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-student-id">
                {{ $t('students.studentId') }}
              </label>
              <input
                id="reg-student-id"
                v-model="studentForm.studentId"
                type="text"
                class="reg-input"
                :placeholder="$t('students.studentIdPlaceholder')"
              >
              <p class="mt-1 text-xs text-gray-500">{{ $t('students.studentIdNote') }}</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-nationality">
                {{ $t('students.nationality') }} *
              </label>
              <select id="reg-nationality" v-model="studentForm.nationality" required class="reg-input">
                <option value="">{{ $t('students.selectNationality') }}</option>
                <option value="omani">{{ $t('students.omani') }}</option>
                <option value="expat">{{ $t('students.expat') }}</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reg-medical">
                {{ $t('students.medicalConditions') }}
              </label>
              <textarea
                id="reg-medical"
                v-model="studentForm.medicalConditions"
                rows="3"
                class="reg-input min-h-[5rem] resize-y"
                :placeholder="$t('students.medicalConditionsPlaceholder')"
              />
            </div>
          </div>

          <div class="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            >
              {{ $t('common.next') }}
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </section>

      <!-- Step 2: Parent Information -->
      <section
        v-if="currentStep === 2"
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
      >
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
          <div class="flex items-start gap-3">
            <div class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 sm:flex">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('students.parentInformation') }}</h3>
              <p class="mt-0.5 text-xs text-gray-500">{{ $t('students.stepParentSubtitle') }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-6 p-6">
          <div v-if="selectedParent">
            <p class="mb-2 text-xs font-medium text-gray-600">{{ $t('students.selectedParentHeading') }}</p>
            <div class="max-w-md">
              <ParentPickerCard
                :parent="selectedParent"
                variant="selected"
                @change="showParentSearch = true"
                @remove="clearParentSelection"
              />
            </div>
          </div>

          <div v-else-if="parentMatches.length > 0">
            <div class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-sm font-semibold text-emerald-900">{{ $t('students.parentMatchesFound') }}</h3>
              </div>
              <p class="mt-1 text-sm text-emerald-800/90">{{ $t('students.parentMatchesDescription') }}</p>
            </div>

            <div class="space-y-3">
              <button
                v-for="parent in parentMatches"
                :key="parent.id"
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 text-start transition hover:border-primary-200 hover:bg-primary-50/40"
                @click="selectParent(parent)"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {{ parentInitials(parent) }}
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-medium text-gray-900">{{ parentFullName(parent) }}</h4>
                    <p v-if="parentContactLine(parent)" class="text-sm text-gray-600">{{ parentContactLine(parent) }}</p>
                    <div v-if="parentHasAccount(parent)" class="mt-1">
                      <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        {{ $t('students.hasAccount') }}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                  :class="parentIdsEqual(selectedParent, parent) ? 'border-primary-600 bg-primary-600' : 'border-gray-300'"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div v-else-if="!selectedParent" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 class="text-sm font-semibold text-amber-900">{{ $t('students.noParentMatches') }}</h3>
            </div>
            <p class="mt-1 text-sm text-amber-800/90">{{ $t('students.noParentMatchesDescription') }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('students.searchParent') }}</h3>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              @click="showParentSearch = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {{ $t('students.searchInParentDatabase') }}
            </button>
          </div>

          <div class="rounded-xl border border-gray-200 p-4">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('students.createNewParent') }}</h3>
              <label for="createNewParent" class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  id="createNewParent"
                  v-model="createNewParent"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                {{ $t('students.createNewParentLabel') }}
              </label>
            </div>

            <div v-if="createNewParent" class="space-y-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="parent-first">
                    {{ $t('students.parentFirstName') }} *
                  </label>
                  <input
                    id="parent-first"
                    v-model="newParentForm.firstName"
                    type="text"
                    required
                    class="reg-input"
                    :placeholder="$t('students.parentFirstNamePlaceholder')"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="parent-family">
                    {{ $t('students.parentFamilyName') }} *
                  </label>
                  <input
                    id="parent-family"
                    v-model="newParentForm.familyName"
                    type="text"
                    required
                    class="reg-input"
                    :placeholder="$t('students.parentFamilyNamePlaceholder')"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="parent-email">
                    {{ $t('students.email') }} *
                  </label>
                  <input
                    id="parent-email"
                    v-model="newParentForm.email"
                    type="email"
                    required
                    class="reg-input"
                    :placeholder="$t('students.emailPlaceholder')"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="parent-mobile">
                    {{ $t('students.mobile') }} *
                  </label>
                  <input
                    id="parent-mobile"
                    v-model="newParentForm.mobile"
                    type="tel"
                    required
                    class="reg-input"
                    :placeholder="$t('students.mobilePlaceholder')"
                  >
                </div>
              </div>

              <label
                for="createParentUser"
                class="flex cursor-pointer items-start gap-2.5 rounded-xl border border-primary-100 bg-primary-50/60 px-3 py-2.5"
              >
                <input
                  id="createParentUser"
                  v-model="createParentUser"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                <span class="min-w-0 leading-snug">
                  <span class="text-sm font-medium text-primary-900">{{ $t('students.createUserAccount') }}</span>
                  <span class="mt-0.5 block text-xs text-primary-800/80">{{ $t('students.createUserAccountNote') }}</span>
                </span>
              </label>
            </div>
          </div>

          <div class="flex justify-between gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              @click="previousStep"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ $t('common.previous') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
              :class="selectedParent || createNewParent
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-500'"
              :disabled="!selectedParent && !createNewParent"
              @click="nextStep"
            >
              {{ $t('common.next') }}
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Step 3: Group Assignment -->
      <section
        v-if="currentStep === 3"
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
      >
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
          <div class="flex items-start gap-3">
            <div class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:flex">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('students.groupAssignment') }}</h3>
              <p class="mt-0.5 text-xs text-gray-500">{{ $t('students.groupAssignmentDescription') }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-6 p-6">
          <div>
            <h3 class="mb-4 text-sm font-semibold text-gray-900">{{ $t('students.selectGroup') }}</h3>

            <div
              v-if="availableGroups.length === 0"
              class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center"
            >
              <p class="text-sm font-medium text-gray-700">{{ $t('students.noGroupsAvailable') }}</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <button
                v-for="group in availableGroups"
                :key="group.id"
                type="button"
                class="rounded-xl border p-4 text-start transition"
                :class="[
                  selectedGroup?.id === group.id
                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200'
                    : group.capacity <= group.currentStudents
                      ? 'cursor-not-allowed border-red-200 bg-red-50/60'
                      : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50/30',
                ]"
                :disabled="group.capacity <= group.currentStudents"
                @click="selectGroup(group)"
              >
                <div class="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ group.name }}</h4>
                    <p v-if="group.ageGroup" class="text-sm text-gray-600">{{ group.ageGroup }}</p>
                  </div>
                  <span
                    class="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                    :class="selectedGroup?.id === group.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'"
                    aria-hidden="true"
                  />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">{{ $t('students.capacity') }}:</span>
                    <span
                      class="font-medium tabular-nums"
                      :class="group.currentStudents >= group.capacity ? 'text-red-600' : 'text-gray-900'"
                    >
                      {{ group.currentStudents }}/{{ group.capacity }}
                    </span>
                  </div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="[
                        group.currentStudents >= group.capacity
                          ? 'bg-red-500'
                          : group.currentStudents >= group.capacity * 0.8
                            ? 'bg-amber-500'
                            : 'bg-emerald-500',
                      ]"
                      :style="{ width: Math.min((group.currentStudents / group.capacity) * 100, 100) + '%' }"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="h-2 w-2 rounded-full"
                      :class="[
                        group.currentStudents >= group.capacity
                          ? 'bg-red-500'
                          : group.currentStudents >= group.capacity * 0.8
                            ? 'bg-amber-500'
                            : 'bg-emerald-500',
                      ]"
                    />
                    <span
                      class="text-xs font-medium"
                      :class="[
                        group.currentStudents >= group.capacity
                          ? 'text-red-600'
                          : group.currentStudents >= group.capacity * 0.8
                            ? 'text-amber-700'
                            : 'text-emerald-700',
                      ]"
                    >
                      {{
                        group.currentStudents >= group.capacity
                          ? $t('students.groupFull')
                          : group.currentStudents >= group.capacity * 0.8
                            ? $t('students.groupAlmostFull')
                            : $t('students.groupAvailable')
                      }}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-5">
            <h3 class="mb-4 text-sm font-semibold text-gray-900">{{ $t('students.registrationSummary') }}</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ studentForm.firstName }} {{ studentForm.familyName }}</h4>
                  <p class="text-sm text-gray-600">{{ $t('students.dateOfBirth') }}: {{ formatDate(studentForm.dateOfBirth) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">
                    {{
                      selectedParent
                        ? parentFullName(selectedParent)
                        : createNewParent
                          ? `${newParentForm.firstName} ${newParentForm.familyName}`.trim()
                          : '—'
                    }}
                  </h4>
                  <p class="text-sm text-gray-600">
                    {{ selectedParent ? selectedParent.email : createNewParent ? newParentForm.email : '' }}
                  </p>
                  <div class="mt-1.5 flex flex-wrap gap-1.5">
                    <span
                      v-if="selectedParent"
                      class="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800"
                    >
                      {{ $t('students.existingParent') }}
                    </span>
                    <span
                      v-if="createNewParent"
                      class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                    >
                      {{ $t('students.newParent') }}
                    </span>
                    <span
                      v-if="createParentUser"
                      class="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800"
                    >
                      {{ $t('students.willCreateAccount') }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="selectedGroup" class="flex items-center gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ selectedGroup.name }}</h4>
                  <p class="text-sm text-gray-600">
                    <template v-if="selectedGroup.ageGroup">{{ selectedGroup.ageGroup }} · </template>
                    {{ selectedGroup.currentStudents + 1 }}/{{ selectedGroup.capacity }} {{ $t('students.students') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              @click="previousStep"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ $t('common.previous') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
              :class="selectedGroup
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-500'"
              :disabled="!selectedGroup"
              @click="registerStudent"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ $t('students.registerStudent') }}
            </button>
          </div>
        </div>
      </section>

      <ParentSearchModal
        v-if="showParentSearch"
        :show="showParentSearch"
        @close="showParentSearch = false"
        @select="selectParentFromSearch"
      />

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
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ParentSearchModal from '@/components/ParentSearchModal.vue'
import ParentPickerCard from '@/components/ParentPickerCard.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { studentService, type CreateStudentRequest } from '@/services/student.service'
import { groupService } from '@/services/group.service'
import { parentService, type Parent } from '@/services/parent.service'

const { locale, t } = useI18n()
const router = useRouter()

const currentStep = ref(1)
const showParentSearch = ref(false)
const createNewParent = ref(false)
const createParentUser = ref(false)
const selectedParent = ref<Parent | null>(null)
const selectedGroup = ref<any>(null)

const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')

const studentForm = ref({
  photo: null as string | null,
  firstName: '',
  secondName: '',
  thirdName: '',
  familyName: '',
  dateOfBirth: '',
  gender: '',
  studentId: '',
  nationality: '',
  medicalConditions: '',
})

const newParentForm = ref({
  firstName: '',
  familyName: '',
  email: '',
  mobile: '',
})

const steps = computed(() => [
  {
    shortTitle: t('students.stepShortStudent'),
    title: t('students.studentInformation'),
    description: t('students.stepStudentSubtitle'),
  },
  {
    shortTitle: t('students.stepShortParent'),
    title: t('students.parentInformation'),
    description: t('students.stepParentSubtitle'),
  },
  {
    shortTitle: t('students.stepShortGroup'),
    title: t('students.groupAssignment'),
    description: t('students.groupAssignmentDescription'),
  },
])

const parentMatches = ref<Parent[]>([])
const availableGroups = ref<any[]>([])

const isRTL = computed(() => locale.value === 'ar')

const stepCircleClass = (stepNumber: number) => {
  if (currentStep.value > stepNumber) return 'bg-emerald-500 text-white shadow-sm'
  if (currentStep.value === stepNumber) return 'bg-primary-600 text-white shadow-md ring-4 ring-primary-100'
  return 'bg-white text-gray-400 ring-2 ring-gray-200'
}

const loadAvailableGroups = async () => {
  try {
    const groups = await groupService.getActive(1)
    const groupsWithCapacity = await Promise.all(
      groups.map(async (group) => {
        try {
          const capacityInfo = await groupService.getGroupCapacity(group.id)
          return {
            ...group,
            currentStudents: capacityInfo.currentStudents || 0,
            ageGroup: formatGroupAgeRangeLabel(
              group.age_range_min,
              group.age_range_max,
              t('groupManagement.years'),
            ),
          }
        } catch {
          return {
            ...group,
            currentStudents: 0,
            ageGroup: formatGroupAgeRangeLabel(
              group.age_range_min,
              group.age_range_max,
              t('groupManagement.years'),
            ),
          }
        }
      }),
    )
    availableGroups.value = groupsWithCapacity
  } catch (error) {
    console.error('Error loading groups:', error)
    availableGroups.value = []
  }
}

const photoInput = ref<HTMLInputElement | null>(null)

const triggerPhotoPick = () => {
  photoInput.value?.click()
}

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

const nextStep = async () => {
  if (currentStep.value >= 3) return
  const leavingStep = currentStep.value
  currentStep.value++
  if (leavingStep === 1) {
    await searchParentMatches()
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function parentFullName(parent: Parent | null | undefined) {
  if (!parent) return ''
  return `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim()
}

function parentInitials(parent: Parent) {
  const a = parent.firstName?.[0] ?? ''
  const b = parent.lastName?.[0] ?? ''
  return (a + b).toUpperCase() || '?'
}

function parentContactLine(parent: Parent) {
  const parts = [parent.email, parent.phone].filter(Boolean)
  return parts.join(' • ')
}

function parentHasAccount(parent: Parent) {
  return Boolean(parent.user?.id ?? parent.user)
}

function parentIdsEqual(
  a: Parent | null | undefined,
  b: Parent | { id: number | string } | null | undefined,
): boolean {
  if (a == null || b == null) return false
  return String(a.id) === String(b.id)
}

function clearParentSelection() {
  selectedParent.value = null
}

const searchParentMatches = async () => {
  const family = studentForm.value.familyName.trim()
  const first = studentForm.value.firstName.trim()
  const query = family || first
  if (!query) {
    parentMatches.value = []
    return
  }
  try {
    const results = await parentService.search(query)
    const familyLower = family.toLowerCase()
    parentMatches.value = results.filter((p) => {
      if (!familyLower) return true
      return (p.lastName ?? '').toLowerCase().includes(familyLower)
    })
  } catch (err) {
    console.error('Parent match search failed:', err)
    parentMatches.value = []
  }
}

const selectParent = (parent: Parent) => {
  selectedParent.value = parent
  createNewParent.value = false
}

const selectParentFromSearch = (parent: Parent) => {
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
    day: 'numeric',
  })
}

const registerStudent = async () => {
  try {
    if (
      !studentForm.value.firstName ||
      !studentForm.value.familyName ||
      !studentForm.value.dateOfBirth ||
      !studentForm.value.gender
    ) {
      progressState.value = 'error'
      progressTitle.value = t('students.validationErrorTitle')
      progressMessage.value = t('students.validationFillRequired')
      showProgressDialog.value = true
      return
    }

    if (!selectedGroup.value) {
      progressState.value = 'error'
      progressTitle.value = t('students.validationErrorTitle')
      progressMessage.value = t('students.validationSelectGroup')
      showProgressDialog.value = true
      return
    }

    showProgressDialog.value = true
    progressState.value = 'loading'
    progressTitle.value = t('students.registeringTitle')
    progressMessage.value = t('students.registeringMessage')

    const studentData: CreateStudentRequest = {
      firstName: studentForm.value.firstName,
      lastName: studentForm.value.familyName,
      dateOfBirth: new Date(studentForm.value.dateOfBirth),
      gender: studentForm.value.gender as 'male' | 'female',
      address: 'Default Address',
      emergencyContact: newParentForm.value.mobile || 'No emergency contact',
      medicalInfo: studentForm.value.medicalConditions,
      notes: `Registered on ${new Date().toISOString()}`,
    }

    await studentService.create(studentData)

    progressState.value = 'success'
    progressTitle.value = t('students.registerSuccessTitle')
    progressMessage.value = t('students.registerSuccessMessage', {
      name: `${studentForm.value.firstName} ${studentForm.value.familyName}`.trim(),
    })

    setTimeout(() => {
      showProgressDialog.value = false
      router.push('/students')
    }, 2000)
  } catch (error: any) {
    console.error('Registration failed:', error)
    progressState.value = 'error'
    progressTitle.value = t('students.registerFailedTitle')
    progressMessage.value = error.message || t('students.registerFailedMessage')
  }
}

watch(createNewParent, (on) => {
  if (on) selectedParent.value = null
})

onMounted(async () => {
  await loadAvailableGroups()
})
</script>

<style scoped>
.reg-input {
  @apply w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20;
}
</style>
