<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div class="max-w-2xl">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
              {{ $t('groupManagement.eyebrow') }}
            </p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {{ $t('groupManagement.title') }}
            </h1>
            <p class="mt-2 text-sm text-slate-200/95">
              {{ $t('groupManagement.subtitle') }}
            </p>
            <p v-if="activeYear" class="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-primary-50 ring-1 ring-white/20">
              {{ $t('groupManagement.activeYear') }}: {{ activeYear.name }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-primary-800 shadow-sm transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            @click="showAddModal = true"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('groupManagement.addGroup') }}
          </button>
        </div>
      </section>

      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="grid flex-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="groups-search">
                  {{ $t('common.search') }}
                </label>
                <div class="relative">
                  <svg
                    class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    id="groups-search"
                    v-model="searchQuery"
                    type="search"
                    class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pe-3 ps-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    :placeholder="$t('groupManagement.searchPlaceholder')"
                  >
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="groups-status">
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
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ groups.length }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('groupManagement.stats.total') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ statusCounts.active }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('groupManagement.stats.active') }}</div>
          </div>
          <div class="rounded-xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-200">
            <div class="text-xl font-bold tabular-nums text-slate-700">{{ statusCounts.inactive }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('groupManagement.stats.inactive') }}</div>
          </div>
          <div class="rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100">
            <div class="text-xl font-bold tabular-nums text-teal-700">{{ totalStudents }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('groupManagement.stats.students') }}</div>
          </div>
        </div>

        <div class="px-6 py-5">
          <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
            <svg class="mb-3 h-8 w-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p class="text-sm font-medium">{{ $t('common.loading') }}</p>
          </div>

          <div
            v-else-if="filteredGroups.length === 0"
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
            <div class="mb-4 flex items-center justify-between gap-3">
              <h2 class="text-sm font-semibold text-gray-900">{{ $t('groupManagement.listHeading') }}</h2>
              <p class="text-xs font-medium text-gray-500">
                {{ $t('groupManagement.groupsCount', { count: filteredGroups.length }) }}
              </p>
            </div>

            <!-- Cards -->
            <div v-if="viewMode === 'cards'" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="group in filteredGroups"
                :key="group.id"
                class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md"
              >
                <div class="flex items-start gap-3 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white px-4 py-4">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                    :style="{ backgroundColor: group.color }"
                  >
                    {{ group.name.charAt(0) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate text-sm font-semibold text-gray-900">{{ group.name }}</h3>
                    <p v-if="group.levelName" class="mt-0.5 truncate text-xs font-medium text-primary-700">
                      {{ group.levelName }}
                    </p>
                    <p class="mt-0.5 truncate text-xs text-gray-500">
                      <template v-if="ageBandLabel(group)">
                        <span>{{ ageBandLabel(group) }}</span>
                        <span class="mx-1 text-gray-300" aria-hidden="true">·</span>
                      </template>
                      {{ $t('groupManagement.supervisedBy') }}
                      <span class="font-medium text-gray-700">{{ supervisorDisplayName(group) }}</span>
                    </p>
                  </div>
                  <div class="flex shrink-0 items-center gap-1.5">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      :class="group.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
                    >
                      {{ group.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
                    </span>
                    <div class="relative">
                      <button
                        type="button"
                        class="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        :aria-label="$t('common.actions')"
                        @click.stop="toggleDropdown(group.id)"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      <div
                        v-if="activeDropdown === group.id"
                        class="absolute end-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                      >
                        <button
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
                          @click="editGroup(group)"
                        >
                          {{ $t('common.edit') }}
                        </button>
                        <button
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
                          @click="toggleGroupStatus(group)"
                        >
                          {{ group.status === 'active' ? $t('groupManagement.deactivate') : $t('groupManagement.activate') }}
                        </button>
                        <button
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800"
                          @click="viewGroupDetails(group)"
                        >
                          {{ $t('common.view') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex flex-1 flex-col gap-4 px-4 py-4">
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="rounded-xl bg-slate-50 px-2 py-2.5">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ group.studentCount }}</div>
                      <div class="text-[10px] font-medium uppercase tracking-wide text-gray-500">{{ $t('groupManagement.students') }}</div>
                    </div>
                    <div class="rounded-xl bg-slate-50 px-2 py-2.5">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ group.teacherCount }}</div>
                      <div class="text-[10px] font-medium uppercase tracking-wide text-gray-500">{{ $t('groupManagement.teachers') }}</div>
                    </div>
                    <div class="rounded-xl bg-slate-50 px-2 py-2.5">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ group.capacity }}</div>
                      <div class="text-[10px] font-medium uppercase tracking-wide text-gray-500">{{ $t('groupManagement.capacity') }}</div>
                    </div>
                  </div>

                  <p class="line-clamp-2 text-sm text-gray-600">
                    {{ group.description || $t('groupManagement.noDescription') }}
                  </p>

                  <div class="mt-auto">
                    <div class="mb-1.5 flex items-center justify-between text-xs">
                      <span class="font-medium text-gray-500">{{ $t('groupManagement.occupancy') }}</span>
                      <span class="font-semibold tabular-nums text-gray-800">{{ occupancyPercent(group) }}%</span>
                    </div>
                    <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        class="h-2 rounded-full transition-all"
                        :class="occupancyBarClass(group)"
                        :style="{ width: `${Math.min(occupancyPercent(group), 100)}%` }"
                      />
                    </div>
                  </div>
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
                          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                          :style="{ backgroundColor: group.color }"
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
                      <div class="inline-flex items-center gap-1">
                        <button
                          type="button"
                          class="rounded-lg p-2 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
                          :title="$t('common.view')"
                          :aria-label="$t('common.view')"
                          @click="viewGroupDetails(group)"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
                          :title="$t('common.edit')"
                          :aria-label="$t('common.edit')"
                          @click="editGroup(group)"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
                          :title="group.status === 'active' ? $t('groupManagement.deactivate') : $t('groupManagement.activate')"
                          :aria-label="group.status === 'active' ? $t('groupManagement.deactivate') : $t('groupManagement.activate')"
                          @click="toggleGroupStatus(group)"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </button>
                      </div>
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

const statusCounts = computed(() => {
  const counts = { active: 0, inactive: 0 }
  for (const g of groups.value) {
    if (g.status === 'active') counts.active += 1
    else counts.inactive += 1
  }
  return counts
})

const totalStudents = computed(() =>
  groups.value.reduce((sum, g) => sum + (Number(g.studentCount) || 0), 0),
)

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
