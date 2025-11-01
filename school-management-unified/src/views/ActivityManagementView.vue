<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ $t('dashboard.activityManagement') }}</h1>
            <p class="mt-1 text-sm text-gray-600">
              {{ $t('activities.description') }}
            </p>
          </div>
          <button
            @click="showCreateModal = true"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ $t('activities.addActivity') }}
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-medium">📚</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ $t('activities.totalActivities') }}</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ activities.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ $t('activities.activeActivities') }}</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ activeActivities }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-medium">⏳</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ $t('activities.pendingActivities') }}</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ pendingActivities }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ $t('activities.participatingStudents') }}</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ participatingStudents }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activities List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">{{ $t('activities.recentActivities') }}</h2>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p class="mt-2 text-sm text-gray-600">{{ $t('common.loading') }}</p>
          </div>
          
          <div v-else-if="activities.length === 0" class="text-center py-8">
            <div class="text-gray-400 text-4xl mb-4">📚</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('activities.noActivities') }}</h3>
            <p class="text-gray-600 mb-4">{{ $t('activities.noActivitiesDescription') }}</p>
            <button
              @click="showCreateModal = true"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {{ $t('activities.createFirstActivity') }}
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900">{{ activity.title }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ activity.description }}</p>
                  <div class="flex items-center mt-2 space-x-4">
                    <span class="text-xs text-gray-500">
                      {{ $t('activities.type') }}: {{ activity.type }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ $t('activities.duration') }}: {{ activity.duration }} {{ $t('common.minutes') }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ $t('activities.participants') }}: {{ activity.participants }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': activity.status === 'active',
                      'bg-yellow-100 text-yellow-800': activity.status === 'pending',
                      'bg-gray-100 text-gray-800': activity.status === 'completed'
                    }"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ $t(`activities.status.${activity.status}`) }}
                  </span>
                  <button
                    @click="editActivity(activity)"
                    class="text-purple-600 hover:text-purple-900 text-sm font-medium"
                  >
                    {{ $t('common.edit') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal (placeholder) -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('activities.addActivity') }}</h3>
        <p class="text-gray-600 mb-4">{{ $t('activities.comingSoon') }}</p>
        <div class="flex justify-end">
          <button
            @click="showCreateModal = false"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Reactive data
const loading = ref(false)
const showCreateModal = ref(false)
const activities = ref([
  {
    id: 1,
    title: 'Morning Circle Time',
    description: 'Daily morning gathering for songs and stories',
    type: 'Social',
    duration: 30,
    participants: 15,
    status: 'active'
  },
  {
    id: 2,
    title: 'Art & Craft Session',
    description: 'Creative activities with various materials',
    type: 'Creative',
    duration: 45,
    participants: 12,
    status: 'active'
  },
  {
    id: 3,
    title: 'Outdoor Play',
    description: 'Physical activities in the playground',
    type: 'Physical',
    duration: 60,
    participants: 20,
    status: 'pending'
  }
])

// Computed properties
const activeActivities = computed(() => 
  activities.value.filter(a => a.status === 'active').length
)

const pendingActivities = computed(() => 
  activities.value.filter(a => a.status === 'pending').length
)

const participatingStudents = computed(() => 
  activities.value.reduce((total, activity) => total + activity.participants, 0)
)

// Methods
const editActivity = (activity: any) => {
  console.log('Edit activity:', activity)
  // TODO: Implement edit functionality
}

onMounted(() => {
  // TODO: Load activities from API
})
</script>
