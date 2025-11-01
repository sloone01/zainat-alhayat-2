<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-6 pt-6 pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div 
                class="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                :style="{ backgroundColor: group?.color }"
              >
                {{ group?.name?.charAt(0) }}
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ group?.name }}</h3>
                <p class="text-gray-600">{{ group?.ageGroup }}</p>
                <span
                  :class="[
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1',
                    group?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ group?.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
                </span>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 pb-6">
          <!-- Description -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-2">{{ $t('groupManagement.description') }}</h4>
            <p class="text-gray-600">{{ group?.description || $t('groupManagement.noDescription') }}</p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-6 mb-6">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ group?.studentCount || 0 }}</div>
              <div class="text-sm text-blue-800">{{ $t('groupManagement.students') }}</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ group?.teacherCount || 0 }}</div>
              <div class="text-sm text-green-800">{{ $t('groupManagement.teachers') }}</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ group?.capacity || 0 }}</div>
              <div class="text-sm text-purple-800">{{ $t('groupManagement.capacity') }}</div>
            </div>
          </div>

          <!-- Occupancy Progress -->
          <div class="mb-6">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="font-medium text-gray-900">{{ $t('groupManagement.occupancy') }}</span>
              <span class="text-gray-600">
                {{ group?.studentCount || 0 }} / {{ group?.capacity || 0 }} 
                ({{ Math.round(((group?.studentCount || 0) / (group?.capacity || 1)) * 100) }}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all duration-300"
                :class="[
                  occupancyPercentage >= 90
                    ? 'bg-red-500'
                    : occupancyPercentage >= 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                ]"
                :style="{ width: `${Math.min(occupancyPercentage, 100)}%` }"
              ></div>
            </div>
          </div>

          <!-- Group Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('groupManagement.groupInfo') }}</h4>
              <dl class="space-y-2">
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">{{ $t('groupManagement.createdDate') }}</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ formatDate(group?.createdAt) }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">{{ $t('groupManagement.academicYear') }}</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ group?.yearId }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">{{ $t('groupManagement.groupColor') }}</dt>
                  <dd class="flex items-center">
                    <div 
                      class="w-4 h-4 rounded-full mr-2"
                      :style="{ backgroundColor: group?.color }"
                    ></div>
                    <span class="text-sm font-medium text-gray-900">{{ group?.color }}</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('groupManagement.quickStats') }}</h4>
              <dl class="space-y-2">
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">{{ $t('groupManagement.availableSpots') }}</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ Math.max(0, (group?.capacity || 0) - (group?.studentCount || 0)) }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">{{ $t('groupManagement.studentTeacherRatio') }}</dt>
                  <dd class="text-sm font-medium text-gray-900">
                    {{ group?.teacherCount > 0 ? Math.round((group?.studentCount || 0) / group.teacherCount) : 0 }}:1
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">{{ $t('groupManagement.status') }}</dt>
                  <dd>
                    <span
                      :class="[
                        'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                        group?.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ group?.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Recent Activities (Mock data) -->
          <div class="mt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('groupManagement.recentActivities') }}</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ $t('groupManagement.newStudentJoined') }}</p>
                  <p class="text-xs text-gray-500">{{ $t('groupManagement.timeAgo', { time: '2 hours' }) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ $t('groupManagement.activityCompleted') }}</p>
                  <p class="text-xs text-gray-500">{{ $t('groupManagement.timeAgo', { time: '1 day' }) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            @click="$emit('close')"
            type="button"
            class="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// Props
const props = defineProps<{
  show: boolean
  group?: any
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const occupancyPercentage = computed(() => {
  if (!props.group?.capacity) return 0
  return Math.round(((props.group?.studentCount || 0) / props.group.capacity) * 100)
})

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US')
}
</script>

