<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">{{ $t('parent.schedule') }}</h1>
        <p class="text-blue-100">{{ $t('parent.scheduleOverview') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 mb-2">
          <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-red-800 mb-2">{{ $t('parent.error') }}</h3>
        <p class="text-red-600">{{ error }}</p>
        <button @click="loadScheduleData" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Schedule Content -->
      <div v-else class="space-y-6">
        <!-- Children Filter -->
        <div v-if="children.length > 1" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ $t('parent.myChildren') }}</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="child in children"
              :key="child.id"
              @click="selectedChildId = child.id"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedChildId === child.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ child.firstName }} {{ child.lastName }}
            </button>
          </div>
        </div>

        <!-- Schedule Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">{{ $t('parent.groupSchedule') }}</h2>
            <p v-if="selectedChild" class="text-sm text-gray-600 mt-1">
              {{ selectedChild.firstName }} {{ selectedChild.lastName }} - {{ selectedChild.groupNames }}
            </p>
          </div>

          <div v-if="filteredSchedules.length > 0" class="overflow-x-auto">
            <!-- Desktop Schedule Table -->
            <div class="hidden lg:block">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      {{ $t('common.time') }}
                    </th>
                    <th v-for="day in weekDays" :key="day.key" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t(`scheduleManagement.days.${day.key}`) }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="timeSlot in timeSlots" :key="timeSlot.time" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ timeSlot.time }}
                    </td>
                    <td v-for="day in weekDays" :key="`${timeSlot.time}-${day.key}`" class="px-2 py-4 text-center relative">
                      <div v-if="getClassForTimeAndDay(timeSlot.time, day.key)" class="class-card">
                        <div class="bg-blue-100 border border-blue-200 rounded-lg p-3 text-left">
                          <div class="text-sm font-medium text-blue-900">
                            {{ getClassForTimeAndDay(timeSlot.time, day.key).course?.name || getClassForTimeAndDay(timeSlot.time, day.key).subject }}
                          </div>
                          <div class="text-xs text-blue-700 mt-1">
                            {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher?.firstName }} {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher?.lastName }}
                          </div>
                          <div class="text-xs text-blue-600 mt-1">
                            {{ getClassForTimeAndDay(timeSlot.time, day.key).room?.name || 'غير محدد' }}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Schedule -->
            <div class="lg:hidden">
              <div v-for="day in weekDays" :key="day.key" class="border-b border-gray-200 last:border-b-0">
                <div class="bg-gray-50 px-6 py-3">
                  <h3 class="text-sm font-medium text-gray-900">{{ $t(`scheduleManagement.days.${day.key}`) }}</h3>
                </div>
                <div class="p-4 space-y-3">
                  <div v-for="timeSlot in timeSlots" :key="timeSlot.time" class="flex items-center gap-3">
                    <div class="w-16 text-sm font-medium text-gray-500">
                      {{ timeSlot.time }}
                    </div>
                    <div class="flex-1">
                      <div v-if="getClassForTimeAndDay(timeSlot.time, day.key)"
                           class="bg-blue-100 border border-blue-200 rounded-lg p-3">
                        <div class="text-sm font-medium text-blue-900">
                          {{ getClassForTimeAndDay(timeSlot.time, day.key).course?.name || getClassForTimeAndDay(timeSlot.time, day.key).subject }}
                        </div>
                        <div class="text-xs text-blue-700 mt-1">
                          {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher?.firstName }} {{ getClassForTimeAndDay(timeSlot.time, day.key).teacher?.lastName }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-12 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('parent.noSchedule') }}</h3>
            <p class="text-gray-500">{{ $t('parent.noData') }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { parentService } from '../services/parent.service'

const { t } = useI18n()

// Reactive data
const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedChildId = ref<string | null>(null)

// Week days configuration
const weekDays = [
  { key: 'sunday', name: 'الأحد' },
  { key: 'monday', name: 'الإثنين' },
  { key: 'tuesday', name: 'الثلاثاء' },
  { key: 'wednesday', name: 'الأربعاء' },
  { key: 'thursday', name: 'الخميس' }
]

// Time slots
const timeSlots = [
  { time: '08:00' },
  { time: '08:45' },
  { time: '09:30' },
  { time: '10:15' },
  { time: '11:00' },
  { time: '11:45' },
  { time: '12:30' },
  { time: '13:15' },
  { time: '14:00' }
]

// Computed properties
const children = computed(() => dashboardData.value.children || [])
const schedules = computed(() => dashboardData.value.schedules || [])

const selectedChild = computed(() => {
  if (!selectedChildId.value) return children.value[0]
  return children.value.find(child => child.id === selectedChildId.value) || children.value[0]
})

const filteredSchedules = computed(() => {
  if (!selectedChild.value) return []
  
  // Filter schedules by the groups that the selected child belongs to
  const childGroupIds = selectedChild.value.groups?.map(g => g.id) || []
  return schedules.value.filter(schedule => 
    childGroupIds.includes(schedule.group_id)
  )
})

// Methods
const loadScheduleData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const data = await parentService.getMyDashboardData()
    dashboardData.value = data
    
    // Set first child as selected by default
    if (data.children && data.children.length > 0) {
      selectedChildId.value = data.children[0].id
    }
    
    console.log('Parent schedule data loaded:', data)
  } catch (err: any) {
    console.error('Error loading parent schedule data:', err)
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

const getClassForTimeAndDay = (time: string, dayKey: string) => {
  const dayMap = {
    'sunday': 'sunday',
    'monday': 'monday', 
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday'
  }
  
  const targetDay = dayMap[dayKey]
  if (!targetDay) return null
  
  return filteredSchedules.value.find(schedule => {
    const scheduleTime = schedule.start_time?.substring(0, 5) // Convert "09:00:00" to "09:00"
    const scheduleDay = schedule.day_of_week?.toLowerCase()
    
    return scheduleTime === time && scheduleDay === targetDay
  })
}

// Lifecycle
onMounted(() => {
  loadScheduleData()
})
</script>

<style scoped>
.class-card {
  min-height: 60px;
}
</style>
