<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative flex items-start gap-3">
          <button
            v-if="selectedGroup"
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            :aria-label="$t('common.back')"
            @click="goBack"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('progressTracking.teacherDashboard') }}</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-200/95">
              <span v-if="!selectedGroup">{{ $t('progressTracking.selectGroupToStart') }}</span>
              <span v-else-if="!selectedLesson">{{ selectedGroup.name }} — {{ $t('progressTracking.selectLesson') }}</span>
              <span v-else>{{ selectedGroup.name }} — {{ selectedLesson.title }}</span>
            </p>
          </div>
        </div>
      </section>

      <!-- Step 1: Group Selection -->
      <div v-if="!selectedGroup" class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('progressTracking.selectGroup') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('progressTracking.groupsCount', { count: teacherGroups.length }) }}
              </p>
            </div>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div v-else-if="teacherGroups.length && isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="group in teacherGroups"
              :key="group.id"
              type="button"
              class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-start shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              @click="selectGroup(group)"
            >
              <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
              <div class="flex flex-1 flex-col p-5">
                <div class="flex items-start gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900 group-hover:text-primary-800">{{ group.name }}</h3>
                    <span
                      v-if="group.ageGroup"
                      class="mt-1.5 inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 ring-1 ring-teal-100"
                    >{{ group.ageGroup }}</span>
                    <p v-if="group.description" class="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ group.description }}</p>
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 ring-1 ring-sky-100">
                    <span class="tabular-nums text-sm">{{ group.studentsCount }}</span>
                    {{ $t('progressTracking.students') }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    <span class="tabular-nums text-sm">{{ group.lessonsCount }}</span>
                    {{ $t('progressTracking.lessons') }}
                  </span>
                </div>
              </div>
              <div class="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
                <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                  {{ $t('progressTracking.openGroup') }}
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          </div>

          <div v-else-if="teacherGroups.length" class="overflow-x-auto rounded-xl border border-gray-200/80">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.groupName') }}</th>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.ageGroup') }}</th>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.students') }}</th>
                  <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="group in teacherGroups"
                  :key="'list-' + group.id"
                  class="cursor-pointer hover:bg-primary-50/20"
                  @click="selectGroup(group)"
                >
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">{{ group.name }}</div>
                    <div v-if="group.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ group.description }}</div>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ group.ageGroup || '—' }}</td>
                  <td class="px-4 py-3 tabular-nums text-gray-700">{{ group.studentsCount }}</td>
                  <td class="px-4 py-3 text-end">
                    <span class="inline-flex items-center gap-1 font-semibold text-primary-700">
                      {{ $t('progressTracking.openGroup') }}
                      <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'empty-' + slot"
              class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <div v-if="slot === 1">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('progressTracking.noGroups') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('progressTracking.noGroupsHint') }}</p>
              </div>
              <div v-else>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Lesson Selection -->
      <div v-else-if="selectedGroup && !selectedLesson" class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('progressTracking.selectLesson') }}</h2>
              <p class="mt-0.5 text-xs text-gray-500">
                {{ selectedGroup.name }}
                <span v-if="!loading"> · {{ $t('progressTracking.lessonsCountLabel', { count: groupLessons.length }) }}</span>
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="text-sm font-semibold text-primary-700 hover:text-primary-900"
                @click="selectedGroup = null"
              >
                {{ $t('progressTracking.changeGroup') }}
              </button>
              <ListViewModeToggle v-model="viewMode" />
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div v-else-if="groupLessons.length && isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="lesson in groupLessons"
              :key="lesson.id"
              type="button"
              class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-start shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              @click="selectLesson(lesson)"
            >
              <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-primary-500 opacity-80" aria-hidden="true" />
              <div class="flex flex-1 flex-col p-5">
                <div class="flex items-start gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="line-clamp-2 font-semibold leading-snug text-gray-900 group-hover:text-primary-800">{{ lesson.title }}</h3>
                    <span class="mt-1.5 inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-800 ring-1 ring-primary-100">
                      {{ lesson.subject }}
                    </span>
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span class="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1.5 font-medium ring-1 ring-gray-100">
                    <span class="me-1 font-bold tabular-nums text-gray-900">{{ lesson.milestones.length }}</span>
                    {{ $t('progressTracking.milestones') }}
                  </span>
                  <span class="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1.5 font-medium ring-1 ring-gray-100">
                    {{ $t('progressTracking.lastUpdate') }}: {{ formatDate(lesson.lastUpdate) }}
                  </span>
                </div>
              </div>
              <div class="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
                <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                  {{ $t('progressTracking.openLesson') }}
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          </div>

          <div v-else-if="groupLessons.length" class="overflow-x-auto rounded-xl border border-gray-200/80">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.selectLesson') }}</th>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.milestones') }}</th>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.lastUpdate') }}</th>
                  <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="lesson in groupLessons"
                  :key="'lesson-list-' + lesson.id"
                  class="cursor-pointer hover:bg-primary-50/20"
                  @click="selectLesson(lesson)"
                >
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">{{ lesson.title }}</div>
                    <div class="mt-0.5 text-xs text-gray-500">{{ lesson.subject }}</div>
                  </td>
                  <td class="px-4 py-3 tabular-nums text-gray-700">{{ lesson.milestones.length }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-gray-600">{{ formatDate(lesson.lastUpdate) }}</td>
                  <td class="px-4 py-3 text-end">
                    <span class="inline-flex items-center gap-1 font-semibold text-primary-700">
                      {{ $t('progressTracking.openLesson') }}
                      <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-6 py-16 text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('progressTracking.noLessons') }}</h3>
            <p class="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">{{ $t('progressTracking.noLessonsHint') }}</p>
          </div>
        </div>
      </div>

    <!-- Step 3: Student Progress Table -->
    <div v-else-if="selectedGroup && selectedLesson" class="space-y-4 sm:space-y-6">
      <!-- Lesson Info -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-800">{{ selectedLesson.title }}</h2>
            <p class="text-sm sm:text-base text-gray-600">{{ selectedGroup.name }} - {{ selectedLesson.subject }}</p>
            <div class="flex items-center space-x-4 mt-2">
              <span class="text-xs text-gray-500">{{ $t('progressTracking.courseTime') }}: {{ selectedLesson.time }}</span>
              <span class="text-xs text-gray-500">{{ $t('progressTracking.day') }}: {{ formatDay(selectedLesson.day) }}</span>
              <span class="text-xs text-gray-500">{{ $t('progressTracking.teacher') }}: {{ selectedLesson.teacher }}</span>
            </div>
          </div>
          <button @click="selectedLesson = null" class="text-primary-600 hover:text-primary-800 text-sm sm:text-base touch-button self-start sm:self-auto">
            {{ $t('progressTracking.changeLesson') }}
          </button>
        </div>

        <!-- Course Info -->
        <div v-if="selectedLesson.courseInfo" class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 class="text-sm font-semibold text-blue-900 mb-2">{{ $t('progressTracking.courseInfo') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-blue-700 font-medium">{{ $t('progressTracking.ageGroup') }}:</span>
              <span class="text-blue-600 mr-2">{{ selectedLesson.courseInfo.age_group_min }}-{{ selectedLesson.courseInfo.age_group_max }} {{ $t('progressTracking.years') }}</span>
            </div>
            <div>
              <span class="text-blue-700 font-medium">{{ $t('progressTracking.duration') }}:</span>
              <span class="text-blue-600 mr-2">{{ selectedLesson.courseInfo.estimated_duration_weeks }} {{ $t('progressTracking.weeks') }}</span>
            </div>
            <div>
              <span class="text-blue-700 font-medium">{{ $t('progressTracking.phases') }}:</span>
              <span class="text-blue-600 mr-2">{{ coursePhases.length }}</span>
            </div>
            <div>
              <span class="text-blue-700 font-medium">{{ $t('progressTracking.totalMilestones') }}:</span>
              <span class="text-blue-600">{{ selectedLesson.milestones.length }}</span>
            </div>
          </div>
          <div v-if="selectedLesson.courseInfo.description" class="mt-2 text-xs text-blue-700">
            {{ selectedLesson.courseInfo.description }}
          </div>
        </div>

        <!-- Progress Stats -->
        <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div class="text-center bg-gray-50 rounded-lg p-3 sm:p-4">
            <div class="text-lg sm:text-2xl font-bold text-gray-800">{{ groupStudents.length }}</div>
            <div class="text-xs sm:text-sm text-gray-600">{{ $t('progressTracking.totalStudents') }}</div>
          </div>
          <div class="text-center bg-green-50 rounded-lg p-3 sm:p-4">
            <div class="text-lg sm:text-2xl font-bold text-green-600">{{ completedStudents }}</div>
            <div class="text-xs sm:text-sm text-gray-600">{{ $t('progressTracking.completed') }}</div>
          </div>
          <div class="text-center bg-yellow-50 rounded-lg p-3 sm:p-4">
            <div class="text-lg sm:text-2xl font-bold text-yellow-600">{{ postponedStudents }}</div>
            <div class="text-xs sm:text-sm text-gray-600">{{ $t('progressTracking.postponed') }}</div>
          </div>
        </div>
      </div>

      <!-- Progress Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Mobile View -->
        <div class="block sm:hidden">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-2">{{ $t('progressTracking.studentName') }}</h3>
            <div class="text-xs text-gray-500">{{ $t('progressTracking.milestonesCount', { count: selectedLesson.milestones.length }) }}</div>
          </div>
          <div class="divide-y divide-gray-200">
            <div v-for="student in groupStudents" :key="student.id" class="p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-800">{{ student.name.charAt(0) }}</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatDate(student.lastUpdate) }}</div>
                  </div>
                </div>
              </div>
              <!-- Scrollable milestones for mobile organized by phases -->
              <div class="overflow-x-auto">
                <div class="space-y-4">
                  <div
                    v-for="(phase, phaseKey) in milestonesByPhase"
                    :key="`mobile-${student.id}-${phaseKey}`"
                    class="border rounded-lg p-3"
                    :class="phaseKey !== 'general' ? 'bg-indigo-25 border-indigo-200' : 'bg-gray-25 border-gray-200'"
                  >
                    <div class="text-xs font-semibold text-gray-700 mb-2" v-if="Object.keys(milestonesByPhase).length > 1">
                      {{ phase.name }}
                    </div>
                    <div class="flex space-x-2 overflow-x-auto pb-2" style="min-width: max-content;">
                      <div
                        v-for="milestone in phase.milestones"
                        :key="`${student.id}-${milestone.id}`"
                        class="flex flex-col items-center space-y-1 min-w-[80px]"
                      >
                        <div class="text-xs text-gray-600 text-center leading-tight">
                          {{ milestone.name || milestone.title }}
                          <span v-if="milestone.isRequired" class="text-red-500">*</span>
                        </div>
                        <MilestoneStatusButton
                          :student-id="student.id"
                          :milestone-id="milestone.id"
                          :status="getMilestoneStatus(student.id, milestone.id)"
                          :student-name="student.name"
                          :milestone-name="milestone.name || milestone.title"
                          :progress-data="getStudentProgressData(student.id, milestone.id)"
                          @update-status="updateMilestoneStatus"
                          size="small"
                        />
                        <!-- Required indicator -->
                        <div v-if="milestone.isRequired" class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden sm:block">
          <div class="overflow-x-auto">
            <table class="w-full">
              <!-- Phase Headers -->
              <thead v-if="Object.keys(milestonesByPhase).length > 1" class="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th class="px-4 sm:px-6 py-2 sticky left-0 bg-gradient-to-r from-indigo-50 to-purple-50 z-20"></th>
                  <th class="px-3 sm:px-4 py-2"></th>
                  <th
                    v-for="(phase, phaseKey) in milestonesByPhase"
                    :key="`phase-${phaseKey}`"
                    :colspan="phase.milestones.length"
                    class="px-2 py-2 text-center text-sm font-bold text-indigo-800 border-l border-indigo-200"
                  >
                    {{ phase.name }}
                  </th>
                </tr>
              </thead>

              <!-- Milestone Headers -->
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    {{ $t('progressTracking.studentName') }}
                  </th>
                  <th class="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('progressTracking.lastUpdate') }}
                  </th>
                  <template v-for="(phase, phaseKey) in milestonesByPhase" :key="`milestones-${phaseKey}`">
                    <th
                      v-for="milestone in phase.milestones"
                      :key="milestone.id"
                      class="px-2 sm:px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] sm:min-w-[100px] border-l border-gray-200"
                      :class="phaseKey !== 'general' ? 'bg-indigo-25' : ''"
                    >
                      <div class="truncate" :title="milestone.name || milestone.title">
                        {{ milestone.name || milestone.title }}
                      </div>
                      <div v-if="milestone.isRequired" class="text-xs text-red-500 mt-1">*</div>
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in groupStudents" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-4 sm:px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-primary-800">{{ student.name.charAt(0) }}</span>
                      </div>
                      <div class="mr-3 sm:mr-4">
                        <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {{ formatDate(student.lastUpdate) }}
                  </td>
                  <template v-for="(phase, phaseKey) in milestonesByPhase" :key="`student-${student.id}-phase-${phaseKey}`">
                    <td
                      v-for="milestone in phase.milestones"
                      :key="`${student.id}-${milestone.id}`"
                      class="px-2 sm:px-3 py-4 whitespace-nowrap text-center border-l border-gray-100"
                      :class="phaseKey !== 'general' ? 'bg-indigo-25' : ''"
                    >
                      <div class="relative">
                        <MilestoneStatusButton
                          :student-id="student.id"
                          :milestone-id="milestone.id"
                          :status="getMilestoneStatus(student.id, milestone.id)"
                          :student-name="student.name"
                          :milestone-name="milestone.name || milestone.title"
                          :progress-data="getStudentProgressData(student.id, milestone.id)"
                          @update-status="updateMilestoneStatus"
                          size="small"
                        />
                        <!-- Required indicator -->
                        <div v-if="milestone.isRequired" class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import MilestoneStatusButton from '@/components/MilestoneStatusButton.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { scheduleService } from '@/services/schedule.service'
import { authService } from '@/services'
import { groupService } from '@/services/group.service'
import { settingsService } from '@/services/settings.service'
import { studentService } from '@/services/student.service'
import { courseService } from '@/services/course.service'
import { progressService } from '@/services/progress.service'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

// Reactive data
const selectedGroup = ref(null)
const selectedLesson = ref(null)
const studentProgress = ref({})
const loading = ref(false)
const currentUser = ref(null)
const progressSettings = ref({
  restrictLessonsToAssignedTeacher: false,
  allowAllTeachersAccessToLessons: true,
  loadLessonsFromSchedule: true,
  showOnlyTodayLessons: false
})

// Data from APIs
const teacherGroups = ref([])
const groupLessons = ref([])
const groupStudents = ref([])

// Get current user info
const getCurrentUser = async () => {
  try {
    currentUser.value = authService.getStoredUser()
  } catch (error) {
    console.error('Error getting current user:', error)
    currentUser.value = null
  }
}

// Load progress settings
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

const mapGroupToRow = (group) => ({
  id: group.id,
  name: group.name,
  ageGroup: formatGroupAgeRangeLabel(
    group.age_range_min,
    group.age_range_max,
    t('groupManagement.years')
  ),
  studentsCount: group.students ? group.students.length : 0,
  lessonsCount: 0,
  description: group.description
})

// Teachers: groups from schedule only. Admins: all groups.
const loadGroups = async () => {
  try {
    loading.value = true

    if (currentUser.value?.role === 'admin') {
      const allGroups = await groupService.getAll()
      teacherGroups.value = allGroups.map(mapGroupToRow)
    } else if (currentUser.value?.role === 'teacher' && currentUser.value?.id) {
      const assigned = await scheduleService.getGroupsForTeacher(currentUser.value.id)
      teacherGroups.value = assigned.map(mapGroupToRow)
    } else {
      teacherGroups.value = []
    }
  } catch (error) {
    console.error('Error loading groups:', error)
    teacherGroups.value = []
  } finally {
    loading.value = false
  }
}

// Computed properties
const completedStudents = computed(() => {
  if (!selectedLesson.value || !groupStudents.value.length) return 0
  return groupStudents.value.filter(student => {
    const milestones = selectedLesson.value.milestones
    return milestones.every(milestone =>
      getMilestoneStatus(student.id, milestone.id) === 'completed'
    )
  }).length
})

const postponedStudents = computed(() => {
  if (!selectedLesson.value || !groupStudents.value.length) return 0
  return groupStudents.value.filter(student => {
    const milestones = selectedLesson.value.milestones
    return milestones.some(milestone =>
      getMilestoneStatus(student.id, milestone.id) === 'postponed'
    )
  }).length
})

// Course phases computed property
const coursePhases = computed(() => {
  if (!selectedLesson.value?.courseInfo?.phases) return []
  return selectedLesson.value.courseInfo.phases.sort((a, b) => a.order - b.order)
})

// Group milestones by phases
const milestonesByPhase = computed(() => {
  if (!selectedLesson.value?.milestones) return {}

  const phases = {}
  selectedLesson.value.milestones.forEach(milestone => {
    // Find the phase this milestone belongs to
    const phase = coursePhases.value.find(p => p.id === milestone.phaseId)
    const phaseKey = phase ? phase.id : 'general'
    const phaseName = phase ? phase.name : 'عام'

    if (!phases[phaseKey]) {
      phases[phaseKey] = {
        name: phaseName,
        order: phase ? phase.order : 999,
        milestones: []
      }
    }
    phases[phaseKey].milestones.push(milestone)
  })

  // Sort milestones within each phase
  Object.values(phases).forEach(phase => {
    phase.milestones.sort((a, b) => a.order - b.order)
  })

  return phases
})

// Methods
const selectGroup = async (group) => {
  selectedGroup.value = group
  await loadGroupLessons(group.id)
}

const selectLesson = async (lesson) => {
  selectedLesson.value = lesson
  await loadGroupStudents(selectedGroup.value.id)
  // Don't call loadStudentProgress as it overwrites real data with mock data
  // The real progress is already loaded by loadExistingProgress() in loadGroupStudents()
}

const goBack = () => {
  if (selectedLesson.value) {
    selectedLesson.value = null
  } else if (selectedGroup.value) {
    selectedGroup.value = null
  }
}

const loadGroupLessons = async (groupId) => {
  try {
    loading.value = true

    if (progressSettings.value.loadLessonsFromSchedule) {
      // Load lessons from schedule
      let schedules = await scheduleService.getSchedulesByGroup(groupId)

      // Filter by teacher if restricted
      if (progressSettings.value.restrictLessonsToAssignedTeacher && currentUser.value?.role === 'teacher') {
        schedules = schedules.filter(schedule => schedule.teacher_id === currentUser.value.id)
      }

      // Filter by today's lessons if enabled
      if (progressSettings.value.showOnlyTodayLessons) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        schedules = schedules.filter(schedule => schedule.day_of_week === today)
      }

      // Convert schedules to lessons format with real course data
      const lessonPromises = schedules.map(async (schedule) => {
        let courseMilestones = []
        let courseInfo = null

        if (schedule.course_id) {
          try {
            // Get full course data with phases and milestones
            courseInfo = await courseService.getCourseById(schedule.course_id)

            // Get all milestones for this course
            courseMilestones = await courseService.getMilestonesByCourse(schedule.course_id)
          } catch (error) {
            console.error('Error loading course data:', error)
            courseMilestones = generateMilestones(schedule.course?.name || 'عام')
          }
        } else {
          courseMilestones = generateMilestones(schedule.course?.name || 'عام')
        }

        return {
          id: schedule.id,
          title: schedule.course?.name || courseInfo?.name || 'عام',
          subject: schedule.course?.name || courseInfo?.name || 'عام',
          teacher: schedule.teacher?.firstName ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}` : 'غير محدد',
          time: `${schedule.start_time} - ${schedule.end_time}`,
          day: schedule.day_of_week,
          lastUpdate: new Date(),
          courseId: schedule.course_id,
          courseInfo: courseInfo,
          milestones: courseMilestones,
          scheduleId: schedule.id
        }
      })

      groupLessons.value = await Promise.all(lessonPromises)

      console.log(`Lessons loaded from schedule for group ${groupId}:`, groupLessons.value.length)
    } else {
      // Fallback to mock lessons data
      groupLessons.value = [
        {
          id: 1,
          title: 'تعلم الحروف العربية',
          subject: 'اللغة العربية',
          lastUpdate: new Date(),
          milestones: generateMilestones('اللغة العربية')
        },
        {
          id: 2,
          title: 'الأرقام والعد',
          subject: 'الرياضيات',
          lastUpdate: new Date(),
          milestones: generateMilestones('الرياضيات')
        }
      ]
    }

    // Update lessons count for the group
    const group = teacherGroups.value.find(g => g.id === groupId)
    if (group) {
      group.lessonsCount = groupLessons.value.length
    }

  } catch (error) {
    console.error('Error loading group lessons:', error)
    // Fallback to mock data
    groupLessons.value = [
      {
        id: 1,
        title: 'تعلم الحروف العربية',
        subject: 'اللغة العربية',
        lastUpdate: new Date(),
        milestones: generateMilestones('اللغة العربية')
      },
      {
        id: 2,
        title: 'الأرقام والعد',
        subject: 'الرياضيات',
        lastUpdate: new Date(),
        milestones: generateMilestones('الرياضيات')
      }
    ]
  } finally {
    loading.value = false
  }
}

// Generate milestones based on subject
const generateMilestones = (subject) => {
  const arabicMilestones = [
    { id: 1, title: 'معرفة الحروف' },
    { id: 2, title: 'كتابة الحروف' },
    { id: 3, title: 'نطق الحروف' },
    { id: 4, title: 'تكوين كلمات' },
    { id: 5, title: 'قراءة الكلمات' },
    { id: 6, title: 'فهم المعنى' },
    { id: 7, title: 'التهجي' },
    { id: 8, title: 'الإملاء' },
    { id: 9, title: 'التعبير' },
    { id: 10, title: 'القراءة الجهرية' },
    { id: 11, title: 'القراءة الصامتة' },
    { id: 12, title: 'فهم النص' },
    { id: 13, title: 'التلخيص' },
    { id: 14, title: 'النقد' },
    { id: 15, title: 'الإبداع' },
    { id: 16, title: 'التحليل' },
    { id: 17, title: 'المقارنة' },
    { id: 18, title: 'الاستنتاج' },
    { id: 19, title: 'التطبيق' },
    { id: 20, title: 'التقييم' }
  ]

  const mathMilestones = [
    { id: 1, title: 'معرفة الأرقام 1-10' },
    { id: 2, title: 'العد التصاعدي' },
    { id: 3, title: 'العد التنازلي' },
    { id: 4, title: 'الجمع البسيط' },
    { id: 5, title: 'الطرح البسيط' },
    { id: 6, title: 'المقارنة' },
    { id: 7, title: 'الترتيب' },
    { id: 8, title: 'الأنماط' },
    { id: 9, title: 'الأشكال' },
    { id: 10, title: 'القياس' },
    { id: 11, title: 'الوقت' },
    { id: 12, title: 'النقود' },
    { id: 13, title: 'الرسوم البيانية' },
    { id: 14, title: 'حل المسائل' },
    { id: 15, title: 'التفكير المنطقي' }
  ]

  const generalMilestones = [
    { id: 1, title: 'فهم الأساسيات' },
    { id: 2, title: 'التطبيق العملي' },
    { id: 3, title: 'حل المشكلات' },
    { id: 4, title: 'الإبداع والابتكار' },
    { id: 5, title: 'التقييم الذاتي' },
    { id: 6, title: 'العمل الجماعي' },
    { id: 7, title: 'التفكير النقدي' },
    { id: 8, title: 'التطوير المستمر' }
  ]

  if (subject.includes('عربية') || subject.includes('Arabic')) {
    return arabicMilestones
  } else if (subject.includes('رياضيات') || subject.includes('Math')) {
    return mathMilestones
  } else {
    return generalMilestones
  }
}

const loadGroupStudents = async (groupId) => {
  try {
    loading.value = true

    // Load real students from database
    const students = await studentService.getByGroup(groupId)

    groupStudents.value = students.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId || student.id,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      email: student.email,
      phone: student.phone,
      address: student.address,
      emergencyContact: student.emergencyContact,
      medicalInfo: student.medicalInfo,
      notes: student.notes,
      photo: student.photo,
      lastUpdate: new Date(student.updatedAt || new Date()),
      createdAt: student.createdAt,
      user: student.user,
      parents: student.parents,
      groups: student.groups,
      progress: student.progress || []
    }))

    console.log(`Students loaded for group ${groupId}:`, groupStudents.value.length)

    // Load existing progress for all students
    await loadExistingProgress()

  } catch (error) {
    console.error('Error loading group students:', error)

    // Fallback to mock data
    groupStudents.value = [
      { id: 1, name: 'أحمد محمد', lastUpdate: new Date() },
      { id: 2, name: 'فاطمة علي', lastUpdate: new Date() },
      { id: 3, name: 'محمد سالم', lastUpdate: new Date() },
      { id: 4, name: 'سارة أحمد', lastUpdate: new Date() },
      { id: 5, name: 'خالد عبدالله', lastUpdate: new Date() }
    ]
  } finally {
    loading.value = false
  }
}

// Load existing progress from database
const loadExistingProgress = async () => {
  try {
    console.log('🔄 Loading existing progress from database...')

    // Clear existing progress
    studentProgress.value = {}

    // Load progress for each student
    for (const student of groupStudents.value) {
      try {
        console.log(`🔄 Loading progress for student: ${student.name} (ID: ${student.id})`)
        const progressRecords = await progressService.getProgressByStudent(student.id)

        console.log(`📊 API Response for student ${student.name}:`, progressRecords)

        if (progressRecords && progressRecords.length > 0) {
          studentProgress.value[student.id] = {}

          progressRecords.forEach(record => {
            console.log(`📝 Processing progress record:`, record)
            studentProgress.value[student.id][record.milestone_id] = {
              status: record.status,
              startDate: record.started_date,
              endDate: record.completed_date,
              remarks: record.teacher_notes || '',
              updatedAt: record.updated_at,
              id: record.id
            }
          })

          console.log(`✅ Loaded ${progressRecords.length} progress records for student ${student.name}`)
          console.log(`📋 Student progress data:`, studentProgress.value[student.id])
        } else {
          console.log(`ℹ️ No progress records found for student ${student.name}`)
        }
      } catch (error) {
        console.error(`❌ Error loading progress for student ${student.name}:`, error)
      }
    }

    console.log('✅ Finished loading all student progress')

  } catch (error) {
    console.error('❌ Error loading student progress:', error)
  }
}

// REMOVED: Mock progress loading function that was overwriting real database data
// This function was causing the issue where real progress data was being overwritten with mock data
const loadStudentProgress = (groupId, lessonId) => {
  console.log(`🚫 loadStudentProgress called but disabled - using real database data instead`)
  console.log(`Real progress data already loaded for group ${groupId}, lesson ${lessonId}`)
  // Real progress is loaded by loadExistingProgress() from the database
}

const getMilestoneStatus = (studentId, milestoneId) => {
  const status = studentProgress.value[studentId]?.[milestoneId]?.status || 'notStarted'
  // Map old status names to new ones
  if (status === 'not_started') return 'notStarted'
  return status
}

const getStudentProgressData = (studentId, milestoneId) => {
  const progress = studentProgress.value[studentId]?.[milestoneId]

  return {
    startDate: progress?.startDate || '',
    endDate: progress?.endDate || '',
    remarks: progress?.remarks || progress?.notes || ''
  }
}

const getMilestoneButtonClass = (studentId, milestoneId) => {
  const status = getMilestoneStatus(studentId, milestoneId)
  switch (status) {
    case 'completed':
      return 'bg-green-500 border-green-500 text-white'
    case 'postponed':
      return 'bg-yellow-500 border-yellow-500 text-white'
    default:
      return 'bg-gray-100 border-gray-300 text-gray-400'
  }
}

const updateMilestoneStatus = async (data) => {
  try {
    // Use default Staff ID (1) for updated_by field
    // TODO: Implement proper Staff ID lookup based on current User
    const staffId = 1

    // Get course ID from the current lesson
    const currentLesson = groupLessons.value.find(lesson =>
      lesson.milestones.some(m => m.id === data.milestoneId)
    )
    const courseId = currentLesson?.courseId || 1

    // Save to database
    const savedProgress = await progressService.saveMilestoneProgress({
      studentId: data.studentId,
      courseId: courseId,
      milestoneId: data.milestoneId,
      status: data.status,
      teacherNotes: data.remarks,
      startDate: data.startDate,
      endDate: data.endDate,
      updatedBy: staffId
    })

    console.log('✅ Progress saved to database:', savedProgress)

    // Update local state
    if (!studentProgress.value[data.studentId]) {
      studentProgress.value[data.studentId] = {}
    }

    // Create progress object with new structure
    const progressData = {
      status: data.status,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      remarks: data.remarks || '',
      updatedAt: new Date().toISOString(),
      id: savedProgress.id
    }

    if (data.status === 'notStarted') {
      delete studentProgress.value[data.studentId][data.milestoneId]
    } else {
      studentProgress.value[data.studentId][data.milestoneId] = progressData
    }

    // Update student's last update time
    const student = groupStudents.value.find(s => s.id === data.studentId)
    if (student) {
      student.lastUpdate = new Date()
    }

    console.log(`✅ Updated milestone ${data.milestoneId} for student ${data.studentId} to ${data.status}`)

  } catch (error) {
    console.error('❌ Error saving progress to database:', error)

    // Show error message to user
    alert(`خطأ في حفظ التقدم: ${error.message || 'حدث خطأ غير متوقع'}`)

    // Still update local state as fallback
    if (!studentProgress.value[data.studentId]) {
      studentProgress.value[data.studentId] = {}
    }

    const progressData = {
      status: data.status,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      remarks: data.remarks || '',
      updatedAt: new Date().toISOString(),
      error: true // Mark as error for UI indication
    }

    if (data.status === 'notStarted') {
      delete studentProgress.value[data.studentId][data.milestoneId]
    } else {
      studentProgress.value[data.studentId][data.milestoneId] = progressData
    }
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ar-SA')
}

const formatDay = (day) => {
  const dayNames = {
    'sunday': 'الأحد',
    'monday': 'الاثنين',
    'tuesday': 'الثلاثاء',
    'wednesday': 'الأربعاء',
    'thursday': 'الخميس',
    'friday': 'الجمعة',
    'saturday': 'السبت'
  }
  return dayNames[day] || day
}

onMounted(async () => {
  // Initialize current user and load progress settings
  await getCurrentUser()
  loadProgressSettings()

  // Load groups based on settings
  await loadGroups()
})
</script>

<style scoped>
/* Mobile touch targets */
.touch-button {
  min-height: 44px;
  min-width: 44px;
}

/* Smooth scrolling for milestone lists */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Sticky column styling */
.sticky {
  position: sticky;
  box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.1);
}

/* Mobile milestone grid */
@media (max-width: 640px) {
  .milestone-grid {
    display: flex;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    min-width: max-content;
  }

  .milestone-item {
    min-width: 80px;
    flex-shrink: 0;
  }
}

/* Hover effects for interactive elements */
.hover\:scale-110:hover {
  transform: scale(1.1);
}

/* Focus styles for accessibility */
button:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}
</style>

