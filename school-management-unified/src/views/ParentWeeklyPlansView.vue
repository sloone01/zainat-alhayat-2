<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">{{ $t('parent.weeklyPlans') }}</h1>
        <p class="text-green-100">{{ $t('parent.weeklyPlan') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
        <button @click="loadWeeklyPlansData" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Weekly Plans Content -->
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
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ child.firstName }} {{ child.lastName }}
            </button>
          </div>
        </div>

        <!-- Week Navigation (RTL: previous/next mirror to screen edges; chevrons flip for reading direction) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="grid grid-cols-3 items-center gap-2">
            <div class="justify-self-start rtl:justify-self-end">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                @click="previousWeek"
              >
                <svg class="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                {{ $t('common.previous') }}
              </button>
            </div>

            <div class="min-w-0 text-center">
              <h3 class="text-lg font-semibold text-gray-900">{{ formatWeekRange(currentWeekStart) }}</h3>
              <p class="text-sm text-gray-600">{{ $t('parent.weeklyPlan') }}</p>
            </div>

            <div class="justify-self-end rtl:justify-self-start">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                @click="nextWeek"
              >
                {{ $t('common.next') }}
                <svg class="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Weekly Plans List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">{{ $t('parent.weeklyPlans') }}</h2>
            <p v-if="selectedChild" class="text-sm text-gray-600 mt-1">
              {{ selectedChild.firstName }} {{ selectedChild.lastName }} - {{ selectedChild.groupNames }}
            </p>
          </div>

          <div v-if="filteredWeeklyPlans.length > 0" class="divide-y divide-gray-200">
            <div v-for="plan in filteredWeeklyPlans" :key="plan.id" class="p-6 hover:bg-gray-50">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">
                        {{ plan.task_title || plan.title || plan.schedule?.course?.name || $t('parent.weeklyPlans') }}
                      </h3>
                      <p class="text-sm text-gray-600">
                        {{ plan.schedule?.course?.name || plan.schedule?.group?.name || '' }}
                      </p>
                    </div>
                  </div>
                  
                  <div v-if="plan.task_description || plan.description" class="text-gray-700 mb-3">
                    {{ plan.task_description || plan.description }}
                  </div>
                  
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(plan.week_start_date) }}
                    </span>
                    
                    <span v-if="plan.schedule?.teacher" class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ plan.schedule.teacher.firstName }} {{ plan.schedule.teacher.lastName }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    planDisplayStatus(plan) === 'completed' ? 'bg-green-100 text-green-800' :
                    planDisplayStatus(plan) === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  ]">
                    {{ getStatusText(planDisplayStatus(plan)) }}
                  </span>
                </div>
              </div>
              
              <!-- Activities Preview -->
              <div v-if="plan.completion_notes" class="mt-4 ms-12 sm:ms-14">
                <h4 class="text-sm font-medium text-gray-900 mb-2">{{ $t('parent.planNotes') }}</h4>
                <div class="text-sm text-gray-600 whitespace-pre-wrap">{{ plan.completion_notes }}</div>
              </div>
            </div>
          </div>

          <div v-else class="p-12 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('parent.noWeeklyPlans') }}</h3>
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

const { t, locale } = useI18n()

// Reactive data
const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedChildId = ref<string | null>(null)
const currentWeekStart = ref(new Date())

// Computed properties
const children = computed(() => dashboardData.value.children || [])
const weeklyPlans = computed(() => dashboardData.value.weeklyPlans || [])

const selectedChild = computed(() => {
  if (!selectedChildId.value) return children.value[0]
  return children.value.find(child => child.id === selectedChildId.value) || children.value[0]
})

/** Group id on weekly session plans lives on schedule, not top-level */
function planGroupId(plan: any): string {
  const raw = plan?.group_id ?? plan?.schedule?.group_id
  return raw != null ? String(raw) : ''
}

function parseLocalDate(val: string | Date | undefined | null): Date | null {
  if (val == null) return null
  if (val instanceof Date) {
    return new Date(val.getFullYear(), val.getMonth(), val.getDate())
  }
  const s = String(val).split('T')[0]
  const parts = s.split('-').map(Number)
  if (parts.length < 3 || parts.some(Number.isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function planOverlapsWeek(plan: any, weekStart: Date): boolean {
  const ws = parseLocalDate(plan.week_start_date)
  const we = parseLocalDate(plan.week_end_date) ?? ws
  if (!ws || !we) return true
  const rangeStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
  const rangeEnd = new Date(rangeStart)
  rangeEnd.setDate(rangeEnd.getDate() + 6)
  return ws <= rangeEnd && we >= rangeStart
}

function planDisplayStatus(plan: any): string {
  if (plan.is_completed === true || plan.status === 'completed') return 'completed'
  if (plan.status === 'in_progress') return 'in_progress'
  return 'not_started'
}

const filteredWeeklyPlans = computed(() => {
  if (!selectedChild.value) return []

  const childGroupIds = (selectedChild.value.groups?.map((g: { id: string }) => String(g.id)) || [])
  const weekStart = currentWeekStart.value

  return weeklyPlans.value.filter((plan: any) => {
    const gid = planGroupId(plan)
    if (!gid || !childGroupIds.includes(gid)) return false
    return planOverlapsWeek(plan, weekStart)
  })
})

// Methods
const loadWeeklyPlansData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const data = await parentService.getMyDashboardData()
    dashboardData.value = data
    
    // Set first child as selected by default
    if (data.children && data.children.length > 0) {
      selectedChildId.value = data.children[0].id
    }
    
    console.log('Parent weekly plans data loaded:', data)
  } catch (err: any) {
    console.error('Error loading parent weekly plans data:', err)
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return t('parent.noData')

  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    const d = parseLocalDate(dateString)
    return (d ?? new Date(dateString)).toLocaleDateString(loc, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return t('parent.noData')
  }
}

const formatWeekRange = (startDate: Date) => {
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return `${startDate.toLocaleDateString(loc, { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString(loc, { month: 'short', day: 'numeric' })}`
}

const previousWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return t('parent.completed')
    case 'in_progress':
      return t('parent.inProgress')
    case 'not_started':
      return t('parent.notStarted')
    default:
      return t('parent.notStarted')
  }
}

// Lifecycle
onMounted(() => {
  // Set current week start (Sunday)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - dayOfWeek)
  currentWeekStart.value = startOfWeek
  
  loadWeeklyPlansData()
})
</script>
