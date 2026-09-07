<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('groupManagement.title')"
        :subtitle="$t('groupManagement.subtitle')"
      />

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('groupManagement.listHeading') }}</h2>
            <p class="fk-card__meta">{{ $t('groupManagement.groupsCount', { count: filteredGroups.length }) }}</p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                aria-hidden="true"
              />
            </button>
            <ListViewModeToggle v-model="viewMode" />
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('groupManagement.addGroup')"
              @click="showAddModal = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>
        <div class="p-4 sm:p-6">

        <div
          v-if="groups.length === 0"
          class="fk-empty"
        >
            <div class="fk-empty__icon">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-fikr-ink">{{ $t('groupManagement.noGroups') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-fikr-ink-soft">{{ $t('groupManagement.noGroupsDescription') }}</p>
            <button
              type="button"
              class="fk-btn fk-btn--primary mt-5"
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
              class="fk-empty text-sm text-fikr-ink-soft"
            >
              {{ $t('groupManagement.noGroups') }}
            </p>

            <!-- Cards -->
            <div v-else-if="viewMode === 'cards'" class="fk-grid">
              <article
                v-for="group in filteredGroups"
                :key="group.id"
                class="fk-item"
              >
                <div
                  class="absolute inset-x-5 top-0 h-1 rounded-b-full"
                  :class="group.status === 'active' ? 'bg-primary-500' : 'bg-fikr-outline'"
                  aria-hidden="true"
                />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div class="fk-monogram fk-monogram--navy h-11 w-11 rounded-xl">
                      {{ group.name.charAt(0) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <h3 class="truncate font-semibold text-fikr-ink">{{ group.name }}</h3>
                          <p v-if="group.levelName" class="mt-0.5 truncate text-xs text-fikr-ink-soft">{{ group.levelName }}</p>
                        </div>
                        <span
                          class="fk-chip shrink-0"
                          :class="group.status === 'active' ? 'fk-chip--green' : 'fk-chip--neutral'"
                        >
                          {{ group.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
                        </span>
                      </div>
                      <dl class="mt-3 space-y-1.5 text-xs text-fikr-ink-muted">
                        <div class="flex justify-between gap-2">
                          <dt class="text-fikr-ink-soft">{{ $t('groupManagement.supervisor') }}</dt>
                          <dd class="truncate font-medium text-fikr-ink">{{ supervisorDisplayName(group) }}</dd>
                        </div>
                        <div class="flex justify-between gap-2">
                          <dt class="text-fikr-ink-soft">{{ $t('groupManagement.students') }}</dt>
                          <dd class="font-medium tabular-nums text-fikr-ink">{{ group.studentCount }}/{{ group.capacity }}</dd>
                        </div>
                        <div v-if="ageBandLabel(group)" class="flex justify-between gap-2">
                          <dt class="text-fikr-ink-soft">{{ $t('groupManagement.ageGroup') }}</dt>
                          <dd class="truncate font-medium text-fikr-ink">{{ ageBandLabel(group) }}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
                <div class="mt-auto flex items-center justify-end rounded-b-card border-t border-fikr-hairline bg-fikr-pearl px-4 py-2.5">
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
            <div v-else class="fk-table-wrap">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>
                      {{ $t('groupManagement.group') }}
                    </th>
                    <th>
                      {{ $t('groupManagement.supervisor') }}
                    </th>
                    <th>
                      {{ $t('groupManagement.students') }}
                    </th>
                    <th>
                      {{ $t('groupManagement.occupancy') }}
                    </th>
                    <th>
                      {{ $t('groupManagement.status') }}
                    </th>
                    <th class="text-end">
                      {{ $t('common.actions') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="group in filteredGroups"
                    :key="group.id"
                    class=""
                  >
                    <td class="whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div
                          class="fk-monogram fk-monogram--navy h-9 w-9 text-xs"
                        >
                          {{ group.name.charAt(0) }}
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-semibold text-fikr-ink">{{ group.name }}</div>
                          <div v-if="group.levelName || ageBandLabel(group)" class="truncate text-xs text-fikr-ink-soft">
                            <span v-if="group.levelName">{{ group.levelName }}</span>
                            <span v-if="group.levelName && ageBandLabel(group)"> · </span>
                            <span v-if="ageBandLabel(group)">{{ ageBandLabel(group) }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap text-sm text-fikr-ink-muted">
                      {{ supervisorDisplayName(group) }}
                    </td>
                    <td class="whitespace-nowrap text-sm tabular-nums text-fikr-ink-muted">
                      {{ group.studentCount }}/{{ group.capacity }}
                    </td>
                    <td class="whitespace-nowrap">
                      <div class="flex min-w-[7rem] items-center gap-2">
                        <div class="h-2 flex-1 overflow-hidden rounded-full bg-fikr-surface-high">
                          <div
                            class="h-2 rounded-full"
                            :class="occupancyBarClass(group)"
                            :style="{ width: `${Math.min(occupancyPercent(group), 100)}%` }"
                          />
                        </div>
                        <span class="text-xs font-semibold tabular-nums text-fikr-ink-muted">{{ occupancyPercent(group) }}%</span>
                      </div>
                    </td>
                    <td class="whitespace-nowrap">
                      <span
                        class="fk-chip"
                        :class="group.status === 'active' ? 'fk-chip--green' : 'fk-chip--neutral'"
                      >
                        {{ group.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap text-end">
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
        </div>
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
        <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
        <aside
          class="fk-drawer"
          :dir="isRTL ? 'rtl' : 'ltr'"
        >
          <div class="fk-drawer__header items-start">
            <div>
            <h3 class="fk-form__title">{{ $t('groupManagement.filtersTitle') }}</h3>
          </div>
            <button
              type="button"
              class="fk-modal__close"
              :aria-label="$t('common.close')"
              @click="showFilters = false"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="fk-drawer__body">
            <div class="fk-form__row">
              <label class="fk-flabel" for="groups-search"><span>{{ $t('common.search') }}</span></label>
              <input
                id="groups-search"
                v-model="searchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('groupManagement.searchPlaceholder')"
              >
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="groups-status"><span>{{ $t('groupManagement.status') }}</span></label>
              <select
                id="groups-status"
                v-model="statusFilter"
                class="fk-field"
              >
                <option value="all">{{ $t('groupManagement.allStatuses') }}</option>
                <option value="active">{{ $t('groupManagement.active') }}</option>
                <option value="inactive">{{ $t('groupManagement.inactive') }}</option>
              </select>
            </div>
          </div>
          <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
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
import FikrPageHeader from '@/components/FikrPageHeader.vue'
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
  return 'bg-primary-500'
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
