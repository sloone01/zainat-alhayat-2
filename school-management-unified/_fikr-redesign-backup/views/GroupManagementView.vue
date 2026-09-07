<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative max-w-2xl">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
            {{ $t('groupManagement.eyebrow') }}
          </p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {{ $t('groupManagement.title') }}
          </h1>
          <p class="mt-2 text-sm text-slate-200/95">
            {{ $t('groupManagement.subtitle') }}
          </p>
        </div>
      </section>

      <section class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.02]">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('groupManagement.listHeading') }}</h2>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-600"
                aria-hidden="true"
              />
            </button>
            <ListViewModeToggle v-model="viewMode" />
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              :aria-label="$t('groupManagement.addGroup')"
              @click="showAddModal = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <div
          v-if="groups.length === 0"
          class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
        >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900">{{ $t('groupManagement.noGroups') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-gray-500">{{ $t('groupManagement.noGroupsDescription') }}</p>
            <button
              type="button"
              class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              @click="showAddModal = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('groupManagement.createFirstGroup') }}
            </button>
          </div>

          <template v-else>

            <p
              v-if="filteredGroups.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('groupManagement.noGroups') }}
            </p>

            <!-- Cards -->
            <div v-else-if="viewMode === 'cards'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="group in filteredGroups"
                :key="group.id"
                class="relative flex flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-80"
                  :class="group.status === 'active' ? 'bg-gradient-to-r from-primary-500 to-teal-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'"
                  aria-hidden="true"
                />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-800">
                      {{ group.name.charAt(0) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <h3 class="truncate font-semibold text-gray-900">{{ group.name }}</h3>
                          <p v-if="group.levelName" class="mt-0.5 truncate text-xs text-gray-500">{{ group.levelName }}</p>
                        </div>
                        <span
                          class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          :class="group.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20'
                            : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/15'"
                        >
                          {{ group.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
                        </span>
                      </div>
                      <dl class="mt-3 space-y-1.5 text-xs text-gray-600">
                        <div class="flex justify-between gap-2">
                          <dt class="text-gray-400">{{ $t('groupManagement.supervisor') }}</dt>
                          <dd class="truncate font-medium text-gray-800">{{ supervisorDisplayName(group) }}</dd>
                        </div>
                        <div class="flex justify-between gap-2">
                          <dt class="text-gray-400">{{ $t('groupManagement.students') }}</dt>
                          <dd class="font-medium tabular-nums text-gray-800">{{ group.studentCount }}/{{ group.capacity }}</dd>
                        </div>
                        <div v-if="ageBandLabel(group)" class="flex justify-between gap-2">
                          <dt class="text-gray-400">{{ $t('groupManagement.ageGroup') }}</dt>
                          <dd class="truncate font-medium text-gray-800">{{ ageBandLabel(group) }}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-end border-t border-gray-100 bg-gray-50/60 px-4 py-3">
                  <RowActionsMenu
                    :open="activeDropdown === group.id"
                    placement="up"
                    @toggle="toggleDropdown(group.id)"
                  >
                    <RowActionsItem icon="edit" @click="editGroup(group)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem
                      :icon="group.status === 'active' ? 'archive' : 'activate'"
                      @click="toggleGroupStatus(group)"
                    >
                      {{ group.status === 'active' ? $t('groupManagement.deactivate') : $t('groupManagement.activate') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </div>
              </article>
            </div>

            <!-- List -->
            <div v-else class="overflow-x-auto rounded-xl border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('groupManagement.group') }}
                    </th>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('groupManagement.supervisor') }}
                    </th>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('groupManagement.students') }}
                    </th>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('groupManagement.occupancy') }}
                    </th>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('groupManagement.status') }}
                    </th>
                    <th class="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('common.actions') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr
                    v-for="group in filteredGroups"
                    :key="group.id"
                    class="transition hover:bg-primary-50/40"
                  >
                    <td class="whitespace-nowrap px-4 py-3.5">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800"
                        >
                          {{ group.name.charAt(0) }}
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-semibold text-gray-900">{{ group.name }}</div>
                          <div v-if="group.levelName || ageBandLabel(group)" class="truncate text-xs text-gray-500">
                            <span v-if="group.levelName">{{ group.levelName }}</span>
                            <span v-if="group.levelName && ageBandLabel(group)"> · </span>
                            <span v-if="ageBandLabel(group)">{{ ageBandLabel(group) }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5 text-sm text-gray-600">
                      {{ supervisorDisplayName(group) }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5 text-sm tabular-nums text-gray-700">
                      {{ group.studentCount }}/{{ group.capacity }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5">
                      <div class="flex min-w-[7rem] items-center gap-2">
                        <div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            class="h-2 rounded-full"
                            :class="occupancyBarClass(group)"
                            :style="{ width: `${Math.min(occupancyPercent(group), 100)}%` }"
                          />
                        </div>
                        <span class="text-xs font-semibold tabular-nums text-gray-700">{{ occupancyPercent(group) }}%</span>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        :class="group.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
                      >
                        {{ group.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5 text-end">
                      <RowActionsMenu
                        :open="activeDropdown === group.id"
                        placement="up"
                        @toggle="toggleDropdown(group.id)"
                      >
                        <RowActionsItem icon="edit" @click="editGroup(group)">
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem
                          :icon="group.status === 'active' ? 'archive' : 'activate'"
                          @click="toggleGroupStatus(group)"
                        >
                          {{ group.status === 'active' ? $t('groupManagement.deactivate') : $t('groupManagement.activate') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
      </section>

      <GroupModal
        v-if="showAddModal || showEditModal"
        :key="(editingGroup as { id?: string } | null)?.id ?? 'new-group'"
        :show="showAddModal || showEditModal"
        :group="editingGroup"
        :payment-levels="paymentLevels"
        @close="closeModal"
        @save="saveGroup"
      />

      <GroupDetailsModal
        v-if="showDetailsModal"
        :show="showDetailsModal"
        :group="selectedGroup"
        @close="showDetailsModal = false"
      />

      <ProgressDialog
        :show="showProgressDialog"
        :state="progressState"
        :title="progressTitle"
        :message="progressMessage"
        :error-message="errorMessage"
        @close="showProgressDialog = false"
      />

      <div
        v-if="showFilters"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('groupManagement.filtersTitle')"
      >
        <div class="absolute inset-0 bg-gray-900/40" @click="showFilters = false" />
        <aside
          class="absolute inset-y-0 end-0 flex w-full max-w-sm flex-col bg-white shadow-xl"
          :dir="isRTL ? 'rtl' : 'ltr'"
        >
          <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 class="text-base font-semibold text-gray-900">{{ $t('groupManagement.filtersTitle') }}</h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              :aria-label="$t('common.close')"
              @click="showFilters = false"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 space-y-5 overflow-y-auto px-4 py-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-900" for="groups-search">
                {{ $t('common.search') }}
              </label>
              <input
                id="groups-search"
                v-model="searchQuery"
                type="search"
                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                :placeholder="$t('groupManagement.searchPlaceholder')"
              >
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-900" for="groups-status">
                {{ $t('groupManagement.status') }}
              </label>
              <select
                id="groups-status"
                v-model="statusFilter"
                class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">{{ $t('groupManagement.allStatuses') }}</option>
                <option value="active">{{ $t('groupManagement.active') }}</option>
                <option value="inactive">{{ $t('groupManagement.inactive') }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="clearFilters"
            >
              {{ $t('common.clear') }}
            </button>
            <button
              type="button"
              class="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              @click="showFilters = false"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </aside>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import GroupModal from '@/components/GroupModal.vue'
import GroupDetailsModal from '@/components/GroupDetailsModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { groupService, type UpdateGroupRequest } from '@/services/group.service'
import { academicYearService } from '@/services/academic-year.service'
import userService from '@/services/user.service'
import { authService } from '@/services'
import paymentConfigService from '@/services/payment-config.service'
import type { SchoolPaymentLevel } from '@/services/payment-config.service'

const { locale, t } = useI18n()
const { viewMode } = useListViewMode()

const teacherNamesById = ref<Record<string, string>>({})
const paymentLevels = ref<SchoolPaymentLevel[]>([])

const normalizeLevelId = (v: unknown): string | null => {
  if (v == null || v === '') return null
  return String(v)
}

const loadPaymentLevels = async () => {
  if (authService.getStoredUser()?.role !== 'admin') {
    paymentLevels.value = []
    return
  }
  try {
    const sid = authService.getStoredUser()?.school_id ?? 1
    paymentLevels.value = await paymentConfigService.listLevels(Number(sid))
  } catch {
    paymentLevels.value = []
  }
}

const inferAgeBandKey = (
  min: number | null | undefined,
  max: number | null | undefined,
): 'toddlers' | 'preschool' | 'kindergarten' | null => {
  if (min == null || max == null) return null
  const a = Number(min)
  const b = Number(max)
  if (a === 3 && b === 4) return 'toddlers'
  if (a === 4 && b === 5) return 'preschool'
  if (a === 5 && b === 6) return 'kindergarten'
  return null
}

const ageBandLabel = (group: any) => {
  const key = inferAgeBandKey(group.age_range_min, group.age_range_max)
  if (!key) return ''
  return t(`groupManagement.${key}`)
}

const resolveSupervisorIdToName = (id: string | number | null | undefined) => {
  if (id == null || id === '') return ''
  return teacherNamesById.value[String(id)] || ''
}

const resolveSupervisorName = (group: any) => {
  if (group.supervisorName) return group.supervisorName
  const id = group.supervisor_id ?? group.supervisor
  return resolveSupervisorIdToName(id)
}

const supervisorDisplayName = (group: any) => {
  const name = resolveSupervisorName(group)
  return name || t('groupManagement.supervisorUnassigned')
}

const loadTeacherNames = async () => {
  try {
    const allUsers = await userService.getAllUsers()
    const map: Record<string, string> = {}
    for (const user of allUsers) {
      if (user.roles?.includes('teacher') || user.role === 'teacher') {
        map[String(user.id)] = user.fullName || `${user.firstName} ${user.lastName}`.trim()
      }
    }
    teacherNamesById.value = map
  } catch (e) {
    console.error('Error loading teachers for group cards:', e)
    teacherNamesById.value = {}
  }
}

const searchQuery = ref('')
const statusFilter = ref('all')
const showFilters = ref(false)
const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' || statusFilter.value !== 'all',
)

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}
const activeDropdown = ref<string | null>(null)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const editingGroup = ref(null)
const selectedGroup = ref(null)
const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const errorMessage = ref('')
const loading = ref(true)

const activeYear = ref<any>(null)
const groups = ref<any[]>([])

const loadActiveYear = async () => {
  try {
    const years = await academicYearService.getAll()
    const active = years.find((year) => year.is_active)
    if (active) {
      activeYear.value = {
        id: active.id,
        name: active.year,
        startDate: active.start_date,
        endDate: active.end_date,
        isActive: active.is_active,
      }
    } else {
      activeYear.value = {
        id: 'default',
        name: '2025-2026',
        startDate: '2025-09-01',
        endDate: '2026-06-30',
        isActive: true,
      }
    }
  } catch (error) {
    console.error('Error loading active year:', error)
    activeYear.value = {
      id: 'default',
      name: '2025-2026',
      startDate: '2025-09-01',
      endDate: '2026-06-30',
      isActive: true,
    }
  }
}

const loadGroups = async () => {
  try {
    loading.value = true
    const sid = Number(authService.getStoredUser()?.school_id) || 1
    const apiGroups = await groupService.getAll(sid)

    groups.value = await Promise.all(
      apiGroups.map(async (group) => {
        try {
          const capacityInfo = await groupService.getGroupCapacity(group.id)
          return {
            ...group,
            studentCount: capacityInfo.currentStudents || 0,
            teacherCount: 0,
            status: group.is_active ? 'active' : 'inactive',
            color: getGroupColor(group.name),
            yearId: group.academic_year_id || activeYear.value?.id,
            createdAt: group.created_at,
            supervisor: (group as any).supervisor_id ?? (group as any).supervisor,
            supervisorName: resolveSupervisorIdToName(
              (group as any).supervisor_id ?? (group as any).supervisor,
            ),
            levelName: (group as any).level?.name || '',
          }
        } catch {
          return {
            ...group,
            studentCount: 0,
            teacherCount: 0,
            status: group.is_active ? 'active' : 'inactive',
            color: getGroupColor(group.name),
            yearId: group.academic_year_id || activeYear.value?.id,
            createdAt: group.created_at,
            supervisor: (group as any).supervisor_id ?? (group as any).supervisor,
            supervisorName: resolveSupervisorIdToName(
              (group as any).supervisor_id ?? (group as any).supervisor,
            ),
            levelName: (group as any).level?.name || '',
          }
        }
      }),
    )
  } catch (error) {
    console.error('Error loading groups:', error)
    groups.value = []
  } finally {
    loading.value = false
  }
}

const getGroupColor = (name: string): string => {
  const colors = ['#0D9488', '#059669', '#0284C7', '#D97706', '#DC2626', '#4F46E5']
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

const isRTL = computed(() => locale.value === 'ar')

const filteredGroups = computed(() => {
  let filtered = groups.value

  if (searchQuery.value) {
    filtered = filtered.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (group.description || '').toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((group) => group.status === statusFilter.value)
  }

  return filtered
})

const occupancyPercent = (group: any) => {
  const capacity = Number(group.capacity) || 0
  if (!capacity) return 0
  return Math.round((Number(group.studentCount) / capacity) * 100)
}

const occupancyBarClass = (group: any) => {
  const pct = occupancyPercent(group)
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 75) return 'bg-amber-500'
  return 'bg-emerald-500'
}

const toggleDropdown = (groupId: string) => {
  activeDropdown.value = activeDropdown.value === groupId ? null : groupId
}

const editGroup = (group: any) => {
  editingGroup.value = { ...group }
  showEditModal.value = true
  activeDropdown.value = null
}

const toggleGroupStatus = async (group: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = group.status === 'active' ? 'إلغاء تفعيل المجموعة' : 'تفعيل المجموعة'
  progressMessage.value =
    group.status === 'active' ? 'جاري إلغاء تفعيل المجموعة...' : 'جاري تفعيل المجموعة...'

  try {
    const newIsActive = group.status !== 'active'
    await groupService.update(group.id, { is_active: newIsActive })

    const groupIndex = groups.value.findIndex((g) => g.id === group.id)
    if (groupIndex !== -1) {
      const newStatus = newIsActive ? 'active' : 'inactive'
      groups.value[groupIndex] = {
        ...groups.value[groupIndex],
        status: newStatus,
        is_active: newIsActive,
      }
      progressMessage.value = newIsActive ? 'تم تفعيل المجموعة بنجاح!' : 'تم إلغاء تفعيل المجموعة بنجاح!'
    }

    progressState.value = 'success'
    setTimeout(() => {
      showProgressDialog.value = false
    }, 1500)
  } catch (err: any) {
    console.error('Error toggling group status:', err)
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'
    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  } finally {
    activeDropdown.value = null
  }
}

const viewGroupDetails = (group: any) => {
  selectedGroup.value = group
  showDetailsModal.value = true
  activeDropdown.value = null
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingGroup.value = null
}

const saveGroup = async (groupData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingGroup.value ? 'تحديث المجموعة' : 'إنشاء مجموعة جديدة'
  progressMessage.value = editingGroup.value
    ? 'جاري تحديث بيانات المجموعة...'
    : 'جاري إنشاء المجموعة الجديدة...'

  try {
    if (editingGroup.value) {
      const updatePayload: UpdateGroupRequest = {
        name: groupData.name,
        description: groupData.description,
        capacity: groupData.capacity,
        level_id: normalizeLevelId(groupData.level_id),
      }
      if (typeof groupData.status === 'string') {
        updatePayload.is_active = groupData.status === 'active'
      }
      const updatedGroup = await groupService.update(editingGroup.value.id, updatePayload)

      const groupIndex = groups.value.findIndex((g) => g.id === editingGroup.value.id)
      if (groupIndex !== -1) {
        const supId = groupData.supervisor
        const lid = normalizeLevelId(updatedGroup.level_id)
        groups.value[groupIndex] = {
          ...updatedGroup,
          studentCount: groups.value[groupIndex].studentCount,
          teacherCount: groups.value[groupIndex].teacherCount,
          status: updatedGroup.is_active ? 'active' : 'inactive',
          color: getGroupColor(updatedGroup.name),
          yearId: updatedGroup.academic_year_id || activeYear.value?.id,
          createdAt: updatedGroup.created_at,
          supervisor: supId,
          supervisorName: resolveSupervisorIdToName(supId),
          levelName:
            paymentLevels.value.find((l) => l.id === lid)?.name ||
            (updatedGroup as any).level?.name ||
            '',
        }
      }
      progressMessage.value = 'تم تحديث المجموعة بنجاح!'
    } else {
      const newGroupData = {
        name: groupData.name,
        description: groupData.description,
        capacity: groupData.capacity,
        school_id: Number(authService.getStoredUser()?.school_id) || 1,
        academic_year_id: activeYear.value?.id,
        is_active: true,
        level_id: normalizeLevelId(groupData.level_id),
      }

      const createdGroup = await groupService.create(newGroupData)
      const supId = groupData.supervisor
      const lid = normalizeLevelId(createdGroup.level_id)
      groups.value.push({
        ...createdGroup,
        studentCount: 0,
        teacherCount: 0,
        status: 'active',
        color: getGroupColor(createdGroup.name),
        yearId: createdGroup.academic_year_id || activeYear.value?.id,
        createdAt: createdGroup.created_at,
        supervisor: supId,
        supervisorName: resolveSupervisorIdToName(supId),
        levelName:
          paymentLevels.value.find((l) => l.id === lid)?.name ||
          (createdGroup as any).level?.name ||
          '',
      })
      progressMessage.value = 'تم إنشاء المجموعة بنجاح!'
    }

    progressState.value = 'success'
    setTimeout(() => {
      showProgressDialog.value = false
      closeModal()
    }, 1500)
  } catch (err: any) {
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'
    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

const handleClickOutside = (event: Event) => {
  if (activeDropdown.value && !(event.target as Element).closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadTeacherNames()
  await loadPaymentLevels()
  await loadActiveYear()
  await loadGroups()
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
