<template>
  <DashboardLayout>
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div class="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse">
          <div class="bg-white/20 p-2 sm:p-3 rounded-full">
            <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold">{{ $t('progressTracking.teacherDashboard') }}</h1>
            <p class="text-primary-100 text-sm sm:text-base" v-if="!selectedGroup">{{ $t('progressTracking.selectGroupToStart') }}</p>
            <p class="text-primary-100 text-sm sm:text-base" v-else>{{ selectedGroup.name }} - {{ selectedLesson?.title || $t('progressTracking.selectLesson') }}</p>
          </div>
        </div>
        <div v-if="selectedGroup && selectedLesson" class="flex space-x-2 rtl:space-x-reverse">
          <button @click="goBack" class="bg-white/20 hover:bg-white/30 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base touch-button">
            {{ $t('common.back') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Step 1: Group Selection -->
    <div v-if="!selectedGroup" class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4">{{ $t('progressTracking.selectGroup') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div
          v-for="group in teacherGroups"
          :key="group.id"
          @click="selectGroup(group)"
          class="group relative overflow-hidden border-2 border-gray-200 hover:border-primary-500 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 touch-button bg-gradient-to-br from-white to-gray-50"
        >
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-5 bg-gradient-to-br from-primary-500 to-primary-600"></div>

          <!-- Content -->
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3 rtl:space-x-reverse">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-all duration-300">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 text-base sm:text-lg group-hover:text-primary-700 transition-colors duration-300">{{ group.name }}</h3>
                  <span class="inline-block bg-primary-100 text-primary-700 text-xs sm:text-sm px-2 py-1 rounded-full font-medium mt-1">{{ group.ageGroup }}</span>
                </div>
              </div>

              <!-- Arrow Icon -->
              <div class="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div class="bg-white/70 rounded-lg p-3 border border-gray-100">
                <div class="flex items-center space-x-2 rtl:space-x-reverse">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-lg font-bold text-gray-800">{{ group.studentsCount }}</p>
                    <p class="text-xs text-gray-600">{{ $t('progressTracking.students') }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white/70 rounded-lg p-3 border border-gray-100">
                <div class="flex items-center space-x-2 rtl:space-x-reverse">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-lg font-bold text-gray-800">{{ group.lessonsCount }}</p>
                    <p class="text-xs text-gray-600">{{ $t('progressTracking.lessons') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" :style="`width: ${(group.lessonsCount / 10) * 100}%`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Lesson Selection -->
    <div v-else-if="selectedGroup && !selectedLesson" class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800">{{ $t('progressTracking.selectLesson') }}</h2>
        <button @click="selectedGroup = null" class="text-primary-600 hover:text-primary-800 text-sm sm:text-base touch-button self-start sm:self-auto">
          {{ $t('progressTracking.changeGroup') }}
        </button>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div
          v-for="lesson in groupLessons"
          :key="lesson.id"
          @click="selectLesson(lesson)"
          class="group relative overflow-hidden border-2 border-gray-200 hover:border-primary-500 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-102 touch-button bg-gradient-to-br from-white via-gray-50 to-white"
        >
          <!-- Background Pattern -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <!-- Content -->
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 text-base sm:text-lg group-hover:text-primary-700 transition-colors duration-300 mb-1">{{ lesson.title }}</h3>
                    <span class="inline-block bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 text-xs sm:text-sm px-3 py-1 rounded-full font-medium">{{ lesson.subject }}</span>
                  </div>
                </div>
              </div>

              <!-- Arrow Icon -->
              <div class="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <!-- Stats and Info -->
            <div class="space-y-3">
              <div class="flex items-center space-x-4 rtl:space-x-reverse">
                <div class="flex items-center space-x-2 rtl:space-x-reverse bg-white/80 rounded-lg px-3 py-2 border border-gray-100">
                  <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-800">{{ lesson.milestones.length }}</p>
                    <p class="text-xs text-gray-600">{{ $t('progressTracking.milestones') }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-2 rtl:space-x-reverse bg-white/80 rounded-lg px-3 py-2 border border-gray-100">
                  <div class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">{{ $t('progressTracking.lastUpdate') }}</p>
                    <p class="text-xs font-medium text-gray-700">{{ formatDate(lesson.lastUpdate) }}</p>
                  </div>
                </div>
              </div>

              <!-- Progress Indicator -->
              <div class="bg-white/80 rounded-lg p-3 border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs text-gray-600">{{ $t('progressTracking.progress') }}</span>
                  <span class="text-xs font-bold text-primary-600">{{ Math.round((lesson.milestones.length / 20) * 100) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500" :style="`width: ${(lesson.milestones.length / 20) * 100}%`"></div>
                </div>
              </div>
            </div>
          </div>
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
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MilestoneStatusButton from '@/components/MilestoneStatusButton.vue'
import { scheduleService } from '@/services/schedule.service'
import { groupService } from '@/services/group.service'
import { settingsService } from '@/services/settings.service'
import { studentService } from '@/services/student.service'
import { courseService } from '@/services/course.service'
import { progressService } from '@/services/progress.service'

const { t } = useI18n()

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
    // In development mode, we'll use a mock teacher user
    currentUser.value = {
      id: 'bd306529-6a0f-4e42-9dce-3928af367e94',
      role: 'teacher',
      firstName: 'System',
      lastName: 'Administrator'
    }
  } catch (error) {
    console.error('Error getting current user:', error)
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

// Load groups based on user role and system settings
const loadGroups = async () => {
  try {
    loading.value = true

    if (progressSettings.value.allowAllTeachersAccessToLessons || currentUser.value?.role === 'admin') {
      // Allow all users to see all groups
      const allGroups = await groupService.getAll()
      teacherGroups.value = allGroups.map(group => ({
        id: group.id,
        name: group.name,
        ageGroup: group.age_range_min && group.age_range_max
          ? `${group.age_range_min}-${group.age_range_max} سنوات`
          : 'غير محدد',
        studentsCount: group.students ? group.students.length : 0,
        lessonsCount: 0, // Will be updated when we load lessons
        description: group.description
      }))
    } else if (currentUser.value?.role === 'teacher' && progressSettings.value.restrictLessonsToAssignedTeacher) {
      // Teacher can only see groups they're assigned to via schedule
      const teacherSchedules = await scheduleService.getByTeacher(currentUser.value.id)
      const groupIds = [...new Set(teacherSchedules.map(s => s.group_id))]

      const groupPromises = groupIds.map(id => groupService.getById(id))
      const groups = await Promise.all(groupPromises)

      teacherGroups.value = groups.map(group => ({
        id: group.id,
        name: group.name,
        ageGroup: group.age_range_min && group.age_range_max
          ? `${group.age_range_min}-${group.age_range_max} سنوات`
          : 'غير محدد',
        studentsCount: group.students ? group.students.length : 0,
        lessonsCount: 0,
        description: group.description
      }))
    } else {
      teacherGroups.value = []
    }

    console.log('Groups loaded:', teacherGroups.value.length)
  } catch (error) {
    console.error('Error loading groups:', error)
    // Fallback to mock data for development
    teacherGroups.value = [
      {
        id: 1,
        name: 'مجموعة الورود',
        ageGroup: '4-5 سنوات',
        studentsCount: 15,
        lessonsCount: 3
      },
      {
        id: 2,
        name: 'مجموعة النجوم',
        ageGroup: '5-6 سنوات',
        studentsCount: 12,
        lessonsCount: 4
      },
      {
        id: 3,
        name: 'مجموعة القمر',
        ageGroup: '3-4 سنوات',
        studentsCount: 18,
        lessonsCount: 2
      }
    ]
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

