<template>
  <DashboardLayout>
    <div class="space-y-8" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ $t('dashboard.activityManagement') }}</h1>
            <p class="mt-1 text-sm text-gray-600">
              {{ $t('activities.description') }}
            </p>
          </div>
          <button
            type="button"
            @click="openCreateModal"
            class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('activities.addActivity') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="stat-metric-card border-t-4 border-t-blue-500 text-blue-600">
          <div class="stat-metric-card__row">
            <div class="stat-metric-card__body">
              <div class="stat-metric-card__icon bg-gradient-to-br from-blue-500 to-blue-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="stat-metric-card__label">{{ $t('activities.totalActivities') }}</p>
                <p class="stat-metric-card__value text-blue-950">{{ activities.length }}</p>
                <p class="stat-metric-card__hint text-blue-600/80">{{ $t('activities.statHintTotal') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-metric-card border-t-4 border-t-emerald-500 text-emerald-600">
          <div class="stat-metric-card__row">
            <div class="stat-metric-card__body">
              <div class="stat-metric-card__icon bg-gradient-to-br from-emerald-500 to-teal-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="stat-metric-card__label">{{ $t('activities.activeActivities') }}</p>
                <p class="stat-metric-card__value text-emerald-950">{{ activeActivities }}</p>
                <p class="stat-metric-card__hint text-emerald-600/80">{{ $t('activities.statHintActive') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-metric-card border-t-4 border-t-amber-500 text-amber-600">
          <div class="stat-metric-card__row">
            <div class="stat-metric-card__body">
              <div class="stat-metric-card__icon bg-gradient-to-br from-amber-500 to-orange-500">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="stat-metric-card__label">{{ $t('activities.pendingActivities') }}</p>
                <p class="stat-metric-card__value text-amber-950">{{ pendingActivities }}</p>
                <p class="stat-metric-card__hint text-amber-600/80">{{ $t('activities.statHintUpcoming') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-metric-card border-t-4 border-t-violet-500 text-violet-600">
          <div class="stat-metric-card__row">
            <div class="stat-metric-card__body">
              <div class="stat-metric-card__icon bg-gradient-to-br from-violet-500 to-purple-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="stat-metric-card__label">{{ $t('activities.participatingStudents') }}</p>
                <p class="stat-metric-card__value text-violet-950">{{ assignedGroups }}</p>
                <p class="stat-metric-card__hint text-violet-600/80">{{ $t('activities.statHintGroups') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('activities.recentActivities') }}</h2>
            <div class="flex flex-wrap items-center gap-2">
              <select
                v-model="filters.status"
                class="block min-w-[10rem] px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="all">{{ $t('activities.filterStatusAll') }}</option>
                <option value="active">{{ $t('activities.status.active') }}</option>
                <option value="pending">{{ $t('activities.status.pending') }}</option>
                <option value="completed">{{ $t('activities.status.completed') }}</option>
              </select>
              <select
                v-model="filters.activityType"
                class="block min-w-[10rem] px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="">{{ $t('activities.filterTypeAll') }}</option>
                <option v-for="type in activityTypes" :key="type" :value="type">{{ type }}</option>
              </select>
              <select
                v-model="filters.groupId"
                :aria-label="$t('activities.filterByGroup')"
                class="block min-w-[10rem] px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="">{{ $t('activities.filterGroupAll') }}</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p class="mt-4 text-gray-600">{{ $t('common.loading') }}</p>
          </div>

          <div v-else-if="filteredActivities.length === 0" class="text-center py-12">
            <div class="text-gray-400 text-5xl mb-4">📚</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('activities.noActivities') }}</h3>
            <p class="text-gray-600 mb-4">{{ $t('activities.noActivitiesDescription') }}</p>
            <button
              type="button"
              @click="openCreateModal"
              class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              {{ $t('activities.createFirstActivity') }}
            </button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="activity in filteredActivities"
              :key="activity.id"
              class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div class="p-6 pb-4 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                      :style="{ background: activityCardGradient(activity) }"
                    >
                      {{ activity.title.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900 truncate">{{ activity.title }}</h3>
                      <p class="text-sm text-gray-600 mt-0.5 leading-snug">
                        <span class="font-medium text-gray-800">{{ activity.activity_type }}</span>
                        <span class="mx-1.5 text-gray-300" aria-hidden="true">—</span>
                        <span class="text-gray-500">{{ formatDate(activity.activity_date) }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getActivityStatus(activity) === 'active'
                          ? 'bg-green-100 text-green-800'
                          : getActivityStatus(activity) === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ $t(`activities.status.${getActivityStatus(activity)}`) }}
                    </span>
                    <div class="relative">
                      <button
                        type="button"
                        class="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        @click.stop="toggleDropdown(activity.id)"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                      <div
                        v-if="activeDropdown === activity.id"
                        :class="[
                          'absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10',
                          isRTL ? 'left-0' : 'right-0',
                        ]"
                      >
                        <div class="py-1">
                          <button
                            type="button"
                            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            @click="viewActivity(activity)"
                          >
                            <svg class="w-4 h-4 me-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {{ $t('common.view') }}
                          </button>
                          <button
                            type="button"
                            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            @click="editActivity(activity)"
                          >
                            <svg class="w-4 h-4 me-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            {{ $t('common.edit') }}
                          </button>
                          <button
                            type="button"
                            class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            @click="removeActivity(activity.id)"
                          >
                            <svg class="w-4 h-4 me-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            {{ $t('common.delete') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-6 pb-6 mt-auto">
                <p class="text-sm text-gray-600 line-clamp-2">{{ activity.description || '—' }}</p>
                <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>{{ $t('activities.group') }}: {{ activity.group?.name || $t('activities.unassignedGroup') }}</span>
                  <span v-if="activity.start_time || activity.end_time">
                    {{ $t('activities.time') }}: {{ formatTimeRange(activity.start_time, activity.end_time) }}
                  </span>
                  <span v-if="activity.location">{{ $t('activities.location') }}: {{ activity.location }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View details (read-only) -->
    <div
      v-if="showViewModal && selectedActivity"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeViewModal"
    >
      <div class="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-2">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('activities.detailsTitle') }}</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100" @click="closeViewModal">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4 text-sm">
          <div>
            <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.title') }}</div>
            <div class="text-gray-900 font-medium mt-0.5">{{ selectedActivity.title }}</div>
          </div>
          <div>
            <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.descriptionLabel') }}</div>
            <div class="text-gray-700 mt-0.5 whitespace-pre-wrap">{{ selectedActivity.description || '—' }}</div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.type') }}</div>
              <div class="text-gray-900 mt-0.5">{{ selectedActivity.activity_type }}</div>
            </div>
            <div>
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.date') }}</div>
              <div class="text-gray-900 mt-0.5">{{ formatDate(selectedActivity.activity_date) }}</div>
            </div>
            <div>
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.time') }}</div>
              <div class="text-gray-900 mt-0.5">{{ formatTimeRange(selectedActivity.start_time, selectedActivity.end_time) }}</div>
            </div>
            <div>
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.location') }}</div>
              <div class="text-gray-900 mt-0.5">{{ selectedActivity.location || '—' }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.group') }}</div>
              <div class="text-gray-900 mt-0.5">{{ selectedActivity.group?.name || $t('activities.unassignedGroup') }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.statusLabel') }}</div>
              <div class="text-gray-900 mt-0.5">{{ $t(`activities.status.${getActivityStatus(selectedActivity)}`) }}</div>
            </div>
            <div v-if="creatorLabel(selectedActivity)" class="col-span-2">
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.createdBy') }}</div>
              <div class="text-gray-900 mt-0.5">{{ creatorLabel(selectedActivity) }}</div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
            @click="closeViewModal"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ editingActivityId ? $t('activities.editActivity') : $t('activities.addActivity') }}
          </h3>
        </div>
        <form class="p-6 space-y-4" @submit.prevent="saveActivity">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('activities.title') }}</label>
              <input v-model="form.title" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('activities.descriptionLabel') }}</label>
              <textarea v-model="form.description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('activities.type') }}</label>
              <select v-model="form.activity_type" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500">
                <option v-for="type in activityTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('activities.group') }}</label>
              <select v-model="form.group_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500">
                <option value="">{{ $t('activities.unassignedGroup') }}</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('activities.date') }}</label>
              <input v-model="form.activity_date" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('activities.location') }}</label>
              <input v-model="form.location" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('activities.startTime') }}</label>
              <input v-model="form.start_time" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('activities.endTime') }}</label>
              <input v-model="form.end_time" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500" />
            </div>
          </div>
          <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium" @click="closeModal">
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 hover:from-purple-700 hover:to-pink-700"
            >
              {{ submitting ? $t('common.loading') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import activityService, { type Activity, type CreateActivityRequest, type UpdateActivityRequest } from '@/services/activity.service'
import groupService, { type Group } from '@/services/group.service'
import scheduleService from '@/services/schedule.service'

const { locale } = useI18n()

const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const showViewModal = ref(false)
const selectedActivity = ref<Activity | null>(null)
const error = ref('')
const activities = ref<Activity[]>([])
const groups = ref<Group[]>([])
const editingActivityId = ref<string | null>(null)
const activeDropdown = ref<string | null>(null)

const activityTypes = ['Homework', 'Class Activity', 'Project', 'Assessment', 'Parent Task']

const filters = ref({
  status: 'all',
  activityType: '',
  groupId: '',
})

const form = ref({
  title: '',
  description: '',
  activity_date: '',
  start_time: '',
  end_time: '',
  location: '',
  activity_type: activityTypes[0],
  group_id: '',
})

const isRTL = computed(() => locale.value === 'ar')

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    return null
  }
})

const schoolId = computed(() => Number(currentUser.value?.school_id || 1))

/** Local calendar YYYY-MM-DD (avoid UTC `toISOString()` shifting “today” for +offset zones). */
const todayKeyLocal = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const activityDateKey = (raw: string) => String(raw || '').split('T')[0]

/**
 * - completed: archived / inactive (`is_active` false)
 * - pending: strictly future date (scheduled ahead — not “suspended”)
 * - active: today or past, still active (includes newly created “today” activities)
 */
const getActivityStatus = (activity: Activity): 'active' | 'pending' | 'completed' => {
  if (!activity.is_active) return 'completed'
  const d = activityDateKey(activity.activity_date as string)
  const today = todayKeyLocal()
  return d > today ? 'pending' : 'active'
}

const activeActivities = computed(() => activities.value.filter(a => getActivityStatus(a) === 'active').length)
const pendingActivities = computed(() => activities.value.filter(a => getActivityStatus(a) === 'pending').length)
const assignedGroups = computed(() => new Set(activities.value.filter(a => a.group_id).map(a => a.group_id)).size)

const filteredActivities = computed(() =>
  activities.value.filter(activity => {
    const matchesStatus =
      filters.value.status === 'all' || getActivityStatus(activity) === filters.value.status
    const matchesType =
      !filters.value.activityType || activity.activity_type === filters.value.activityType
    const matchesGroup =
      !filters.value.groupId || String(activity.group_id ?? '') === String(filters.value.groupId)
    return matchesStatus && matchesType && matchesGroup
  }),
)

const activityCardGradient = (activity: Activity) => {
  const colors = [
    'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
    'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
    'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
  ]
  const key = (activity.title + activity.activity_type).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return colors[key % colors.length]
}

const formatDate = (dateStr: string) => {
  const d = typeof dateStr === 'string' ? dateStr.split('T')[0] : dateStr
  return new Date(d).toLocaleDateString()
}

const formatTimeRange = (start?: string | null, end?: string | null) => {
  const s = start ? String(start).slice(0, 5) : '--:--'
  const e = end ? String(end).slice(0, 5) : '--:--'
  return `${s} – ${e}`
}

const normalizeDateInput = (dateVal: string | Date) => {
  if (!dateVal) return todayKeyLocal()
  const s = typeof dateVal === 'string' ? dateVal : (dateVal as Date).toISOString()
  return s.split('T')[0]
}

const normalizeTimeInput = (t?: string | null) => {
  if (!t) return ''
  const s = String(t)
  return s.length >= 5 ? s.slice(0, 5) : s
}

const creatorLabel = (activity: Activity) => {
  const u = activity.createdByUser
  if (!u) return ''
  const fn = u.firstName || ''
  const ln = u.lastName || ''
  const name = `${fn} ${ln}`.trim()
  return name || u.id
}

const handleClickOutside = (event: Event) => {
  if (activeDropdown.value && !(event.target as Element).closest('.relative')) {
    activeDropdown.value = null
  }
}

const toggleDropdown = (id: string) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    activity_date: todayKeyLocal(),
    start_time: '',
    end_time: '',
    location: '',
    activity_type: activityTypes[0],
    group_id: '',
  }
  editingActivityId.value = null
  error.value = ''
}

const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedActivity.value = null
}

const viewActivity = (activity: Activity) => {
  selectedActivity.value = activity
  showViewModal.value = true
  activeDropdown.value = null
}

const loadActivities = async () => {
  loading.value = true
  error.value = ''
  try {
    let list = await activityService.getAll({ school_id: schoolId.value })
    if (currentUser.value?.role === 'teacher') {
      const allowed = new Set(groups.value.map((g) => String(g.id)))
      list = list.filter((a) => a.group_id != null && allowed.has(String(a.group_id)))
    }
    activities.value = list
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load activities'
  } finally {
    loading.value = false
  }
}

const loadGroups = async () => {
  try {
    const role = currentUser.value?.role
    const uid = currentUser.value?.id
    if (role === 'teacher' && uid) {
      groups.value = await scheduleService.getGroupsForTeacher(uid)
    } else {
      groups.value = await groupService.getAll(schoolId.value)
    }
  } catch {
    groups.value = []
  }
}

const editActivity = (activity: Activity) => {
  editingActivityId.value = activity.id
  form.value = {
    title: activity.title,
    description: activity.description || '',
    activity_date: normalizeDateInput(activity.activity_date as unknown as string),
    start_time: normalizeTimeInput(activity.start_time),
    end_time: normalizeTimeInput(activity.end_time),
    location: activity.location || '',
    activity_type: activity.activity_type,
    group_id: activity.group_id || '',
  }
  showCreateModal.value = true
  activeDropdown.value = null
}

const buildUpdatePayload = (): UpdateActivityRequest => {
  const patch: UpdateActivityRequest = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    activity_date: form.value.activity_date,
    activity_type: form.value.activity_type,
    is_active: true,
    group_id: form.value.group_id ? form.value.group_id : null,
  }
  if (form.value.start_time) patch.start_time = form.value.start_time
  if (form.value.end_time) patch.end_time = form.value.end_time
  const loc = form.value.location.trim()
  if (loc) patch.location = loc
  return patch
}

const saveActivity = async () => {
  submitting.value = true
  error.value = ''
  try {
    if (editingActivityId.value) {
      await activityService.update(editingActivityId.value, buildUpdatePayload())
    } else {
      const payload: CreateActivityRequest = {
        title: form.value.title.trim(),
        description: form.value.description.trim() || undefined,
        activity_date: form.value.activity_date,
        start_time: form.value.start_time || undefined,
        end_time: form.value.end_time || undefined,
        location: form.value.location.trim() || undefined,
        activity_type: form.value.activity_type,
        school_id: schoolId.value,
        group_id: form.value.group_id || undefined,
        created_by: currentUser.value?.id,
        is_active: true,
      }
      await activityService.create(payload)
    }

    await loadActivities()
    closeModal()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to save activity'
  } finally {
    submitting.value = false
  }
}

const removeActivity = async (id: string) => {
  if (!window.confirm('Are you sure you want to delete this activity?')) return
  activeDropdown.value = null
  try {
    await activityService.deleteActivity(id)
    await loadActivities()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to delete activity'
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  resetForm()
  await loadGroups()
  await loadActivities()
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
