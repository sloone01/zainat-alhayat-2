<template>
  <DashboardLayout>
    <div class="space-y-8" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ $t('groupManagement.title') }}</h1>
            <p class="text-gray-600 mt-2">{{ $t('groupManagement.description') }}</p>
            <div class="flex items-center gap-2 mt-3">
              <span class="text-sm text-gray-500">{{ $t('groupManagement.activeYear') }}:</span>
              <span v-if="activeYear" class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {{ activeYear.name }}
              </span>
              <span v-else class="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium animate-pulse">
                Loading...
              </span>
            </div>
          </div>
          <button
            @click="showAddModal = true"
            class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('groupManagement.addGroup') }}
          </button>
        </div>
      </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Search -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('groupManagement.searchPlaceholder')"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
          />
        </div>

        <!-- Status Filter -->
        <div>
          <select
            v-model="statusFilter"
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
          >
            <option value="all">{{ $t('groupManagement.allStatuses') }}</option>
            <option value="active">{{ $t('groupManagement.active') }}</option>
            <option value="inactive">{{ $t('groupManagement.inactive') }}</option>
          </select>
        </div>

      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <p class="mt-4 text-gray-600 text-lg">{{ $t('common.loading') }}...</p>
    </div>

    <!-- Groups Grid -->
    <div v-else-if="filteredGroups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="group in filteredGroups"
        :key="group.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
      >
        <!-- Group Header -->
        <div class="p-6 pb-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                :style="{ backgroundColor: group.color }"
              >
                {{ group.name.charAt(0) }}
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ group.name }}</h3>
                <p class="text-sm text-gray-500">{{ $t('groupManagement.group') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  group.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ group.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
              </span>
              <div class="relative">
                <button
                  @click="toggleDropdown(group.id)"
                  class="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <div
                  v-if="activeDropdown === group.id"
                  :class="[
                    'absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10',
                    isRTL ? 'left-0' : 'right-0'
                  ]"
                >
                  <div class="py-1">
                    <button
                      @click="editGroup(group)"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {{ $t('common.edit') }}
                    </button>
                    <button
                      @click="toggleGroupStatus(group)"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                      {{ group.status === 'active' ? $t('groupManagement.deactivate') : $t('groupManagement.activate') }}
                    </button>
                    <button
                      @click="viewGroupDetails(group)"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {{ $t('common.view') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Group Stats -->
        <div class="px-6 pb-4">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ group.studentCount }}</div>
              <div class="text-xs text-gray-500">{{ $t('groupManagement.students') }}</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ group.teacherCount }}</div>
              <div class="text-xs text-gray-500">{{ $t('groupManagement.teachers') }}</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ group.capacity }}</div>
              <div class="text-xs text-gray-500">{{ $t('groupManagement.capacity') }}</div>
            </div>
          </div>
        </div>

        <!-- Group Description -->
        <div class="px-6 pb-6">
          <p class="text-sm text-gray-600 line-clamp-2">{{ group.description }}</p>
        </div>

        <!-- Progress Bar -->
        <div class="px-6 pb-6">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-600">{{ $t('groupManagement.occupancy') }}</span>
            <span class="font-medium">{{ Math.round((group.studentCount / group.capacity) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="[
                (group.studentCount / group.capacity) * 100 >= 90
                  ? 'bg-red-500'
                  : (group.studentCount / group.capacity) * 100 >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              ]"
              :style="{ width: `${Math.min((group.studentCount / group.capacity) * 100, 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('groupManagement.noGroups') }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ $t('groupManagement.noGroupsDescription') }}</p>
      <div class="mt-6">
        <button
          @click="showAddModal = true"
          class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ $t('groupManagement.createFirstGroup') }}
        </button>
      </div>
    </div>

    <!-- Add/Edit Group Modal -->
    <GroupModal
      v-if="showAddModal || showEditModal"
      :show="showAddModal || showEditModal"
      :group="editingGroup"
      :active-year="activeYear"
      @close="closeModal"
      @save="saveGroup"
    />

    <!-- Group Details Modal -->
    <GroupDetailsModal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :group="selectedGroup"
      @close="showDetailsModal = false"
    />

    <!-- Progress Dialog -->
    <ProgressDialog
      :show="showProgressDialog"
      :state="progressState"
      :title="progressTitle"
      :message="progressMessage"
      :error-message="errorMessage"
      @close="showProgressDialog = false"
    />
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
import { groupService, type Group } from '@/services/group.service'
import { academicYearService } from '@/services/academic-year.service'

const { locale } = useI18n()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('all')
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

// Real data from API
const activeYear = ref(null)
const groups = ref<Group[]>([])

// Load data from API
const loadActiveYear = async () => {
  try {
    // Get active academic year for school
    const years = await academicYearService.getAll() // TODO: Filter by school_id
    const active = years.find(year => year.is_active)
    if (active) {
      activeYear.value = {
        id: active.id,
        name: active.year,
        startDate: active.start_date,
        endDate: active.end_date,
        isActive: active.is_active
      }
    } else {
      // Fallback if no active year
      activeYear.value = {
        id: 'default',
        name: '2025-2026',
        startDate: '2025-09-01',
        endDate: '2026-06-30',
        isActive: true
      }
    }
  } catch (error) {
    console.error('Error loading active year:', error)
    // Fallback
    activeYear.value = {
      id: 'default',
      name: '2025-2026',
      startDate: '2025-09-01',
      endDate: '2026-06-30',
      isActive: true
    }
  }
}

const loadGroups = async () => {
  try {
    loading.value = true
    const apiGroups = await groupService.getAll(1) // TODO: Get school_id from user context

    // Transform API data to match UI expectations
    groups.value = await Promise.all(
      apiGroups.map(async (group) => {
        try {
          const capacityInfo = await groupService.getGroupCapacity(group.id)
          return {
            ...group,
            studentCount: capacityInfo.currentStudents || 0,
            teacherCount: 0, // TODO: Get actual teacher count when available
            status: group.is_active ? 'active' : 'inactive',
            color: getGroupColor(group.name),
            yearId: group.academic_year_id || activeYear.value?.id,
            createdAt: group.created_at
          }
        } catch (error) {
          // Fallback if capacity endpoint fails
          return {
            ...group,
            studentCount: 0,
            teacherCount: 0,
            status: group.is_active ? 'active' : 'inactive',
            color: getGroupColor(group.name),
            yearId: group.academic_year_id || activeYear.value?.id,
            createdAt: group.created_at
          }
        }
      })
    )
  } catch (error) {
    console.error('Error loading groups:', error)
    groups.value = []
  } finally {
    loading.value = false
  }
}

// Helper function to assign colors to groups
const getGroupColor = (name: string): string => {
  const colors = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const filteredGroups = computed(() => {
  let filtered = groups.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(group =>
      group.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(group => group.status === statusFilter.value)
  }


  return filtered
})

// Methods
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
  progressMessage.value = group.status === 'active' ? 'جاري إلغاء تفعيل المجموعة...' : 'جاري تفعيل المجموعة...'

  try {
    const newIsActive = group.status !== 'active'

    // Update via API
    await groupService.update(group.id, { is_active: newIsActive })

    // Update local state
    const groupIndex = groups.value.findIndex(g => g.id === group.id)
    if (groupIndex !== -1) {
      const newStatus = newIsActive ? 'active' : 'inactive'
      groups.value[groupIndex] = {
        ...groups.value[groupIndex],
        status: newStatus,
        is_active: newIsActive
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
  console.log('saveGroup called', { groupData, editingGroup: editingGroup.value })

  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingGroup.value ? 'تحديث المجموعة' : 'إنشاء مجموعة جديدة'
  progressMessage.value = editingGroup.value ? 'جاري تحديث بيانات المجموعة...' : 'جاري إنشاء المجموعة الجديدة...'

  try {
    if (editingGroup.value) {
      // Update existing group
      const updatedGroup = await groupService.update(editingGroup.value.id, {
        name: groupData.name,
        description: groupData.description,
        capacity: groupData.capacity,
        age_range_min: groupData.age_range_min,
        age_range_max: groupData.age_range_max,
        is_active: groupData.status === 'active'
      })

      // Update local state
      const groupIndex = groups.value.findIndex(g => g.id === editingGroup.value.id)
      if (groupIndex !== -1) {
        groups.value[groupIndex] = {
          ...updatedGroup,
          studentCount: groups.value[groupIndex].studentCount,
          teacherCount: groups.value[groupIndex].teacherCount,
          status: updatedGroup.is_active ? 'active' : 'inactive',
          color: getGroupColor(updatedGroup.name),
          yearId: updatedGroup.academic_year_id || activeYear.value?.id,
          createdAt: updatedGroup.created_at
        }
      }
      progressMessage.value = 'تم تحديث المجموعة بنجاح!'
    } else {
      // Create new group
      const newGroupData = {
        name: groupData.name,
        description: groupData.description,
        capacity: groupData.capacity,
        age_range_min: groupData.age_range_min,
        age_range_max: groupData.age_range_max,
        school_id: 1, // TODO: Get from user context
        academic_year_id: activeYear.value?.id,
        is_active: true
      }

      const createdGroup = await groupService.create(newGroupData)

      // Add to local state
      const newGroup = {
        ...createdGroup,
        studentCount: 0,
        teacherCount: 0,
        status: 'active',
        color: getGroupColor(createdGroup.name),
        yearId: createdGroup.academic_year_id || activeYear.value?.id,
        createdAt: createdGroup.created_at
      }
      groups.value.push(newGroup)
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

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  if (activeDropdown.value && !(event.target as Element).closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  // Load data on component mount
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

