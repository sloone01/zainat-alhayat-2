<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 p-6 text-white shadow-lg">
        <h1 class="mb-2 text-2xl font-bold">{{ $t('parent.assignedActivities') }}</h1>
        <p class="text-cyan-100">{{ $t('parent.assignedActivitiesSubtitle') }}</p>
        <p class="mt-2 max-w-2xl text-sm text-cyan-200/95">{{ $t('parent.assignedActivitiesStaffNote') }}</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600"></div>
        <span class="ms-3 text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h3 class="mb-2 text-lg font-semibold text-red-800">{{ $t('parent.error') }}</h3>
        <p class="text-red-600">{{ error }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          @click="loadData"
        >
          {{ $t('common.retry') }}
        </button>
      </div>

      <div v-else class="space-y-6">
        <div v-if="children.length > 1" class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h3 class="mb-3 text-lg font-semibold text-gray-900">{{ $t('parent.myChildren') }}</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="child in children"
              :key="child.id"
              type="button"
              :class="[
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                selectedChildId === child.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
              @click="selectedChildId = child.id"
            >
              {{ child.firstName }} {{ child.lastName }}
            </button>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div class="border-b border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900">{{ $t('parent.assignedActivities') }}</h2>
            <p v-if="selectedChild" class="mt-1 text-sm text-gray-600">
              {{ selectedChild.firstName }} {{ selectedChild.lastName }} — {{ selectedChild.groupNames }}
            </p>
          </div>

          <div v-if="filteredActivities.length > 0" class="divide-y divide-gray-200">
            <div
              v-for="item in filteredActivities"
              :key="item.id"
              class="p-6 transition-colors hover:bg-gray-50/80"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0 flex-1">
                  <div class="mb-2 flex items-start gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100">
                      <svg class="h-5 w-5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900">{{ item.title }}</h3>
                      <p class="text-sm text-gray-600">
                        <span v-if="item.group?.name">{{ item.group.name }}</span>
                        <span v-if="item.activity_type" class="text-gray-500">
                          <template v-if="item.group?.name"> · </template>
                          {{ formatActivityType(item.activity_type) }}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p v-if="item.description" class="text-sm text-gray-700 whitespace-pre-wrap">{{ item.description }}</p>
                  <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span class="tabular-nums">{{ formatActivityDate(item.activity_date) }}</span>
                    <span v-if="item.start_time" class="tabular-nums">
                      {{ formatTime(item.start_time) }}
                      <template v-if="item.end_time"> – {{ formatTime(item.end_time) }}</template>
                    </span>
                    <span v-if="item.location">{{ item.location }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-12 text-center">
            <svg class="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 class="mb-2 text-lg font-medium text-gray-900">{{ $t('parent.noAssignedActivities') }}</h3>
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
import { translateActivityType as translateActivityTypeLabel } from '@/utils/activity-types'

const { t, locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const activities = ref<any[]>([])
const children = ref<any[]>([])
const selectedChildId = ref<string | null>(null)

const selectedChild = computed(() => {
  if (!selectedChildId.value) return children.value[0]
  return children.value.find((c) => c.id === selectedChildId.value) || children.value[0]
})

function childGroupIds(child: any): string[] {
  return (child?.groups?.map((g: { id: string }) => String(g.id)) || []) as string[]
}

const filteredActivities = computed(() => {
  if (!selectedChild.value) return activities.value
  const ids = new Set(childGroupIds(selectedChild.value))
  if (ids.size === 0) return []
  return activities.value.filter((a) => a.group_id && ids.has(String(a.group_id)))
})

const formatActivityDate = (val: string | Date) => {
  if (!val) return t('parent.noData')
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    const s = typeof val === 'string' ? val.split('T')[0] : val.toISOString().split('T')[0]
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(loc, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return t('parent.noData')
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  try {
    const [h, min] = time.split(':').map(Number)
    const d = new Date(2000, 0, 1, h, min || 0)
    return d.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' })
  } catch {
    return time.slice(0, 5)
  }
}

const formatActivityType = (type: string) => translateActivityTypeLabel(t, type)

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''
    const [acts, dash] = await Promise.all([
      parentService.getMyAssignedActivities(),
      parentService.getMyDashboardData(),
    ])
    activities.value = Array.isArray(acts) ? acts : []
    const ch = dash?.children || []
    children.value = ch
    if (ch.length > 0) {
      selectedChildId.value = ch[0].id
    }
  } catch (e: any) {
    error.value = e?.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
