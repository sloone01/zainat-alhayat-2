<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('dashboard.activityManagement')"
        :subtitle="$t('activities.description')"
      />

      <div v-if="error && !showCreateModal" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('activities.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('activities.activitiesCount', { count: filteredActivities.length }) }}
            </p>
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
              :aria-label="$t('activities.addActivity')"
              @click="openCreateModal"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        <div v-if="!loading" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ activities.length }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('activities.totalActivities') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ activeActivities }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('activities.activeActivities') }}</div>
          </div>
          <div class="rounded-xl bg-amber-50/70 px-3 py-3 text-center ring-1 ring-amber-100">
            <div class="text-xl font-bold tabular-nums text-amber-700">{{ pendingActivities }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('activities.pendingActivities') }}</div>
          </div>
          <div class="rounded-xl bg-sky-50/70 px-3 py-3 text-center ring-1 ring-sky-100">
            <div class="text-xl font-bold tabular-nums text-sky-700">{{ assignedGroups }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('activities.linkedGroups') }}</div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="filteredActivities.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="activity in filteredActivities"
                :key="activity.id"
                class="group relative flex flex-col overflow-visible rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 opacity-80"
                  :class="activity.requires_parent_approval ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-primary-500 to-teal-500'"
                  aria-hidden="true"
                />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      :class="activity.requires_parent_approval ? 'bg-amber-50 text-amber-800' : 'bg-primary-100 text-primary-800'"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-2">
                        <h3 class="line-clamp-2 font-semibold leading-snug text-gray-900">{{ activity.title }}</h3>
                        <RowActionsMenu
                          :open="activeDropdown === activity.id"
                          @toggle="toggleDropdown(activity.id)"
                        >
                          <RowActionsItem icon="view" @click="viewActivity(activity)">
                            {{ $t('common.view') }}
                          </RowActionsItem>
                          <RowActionsItem icon="edit" @click="editActivity(activity)">
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="activity.requires_parent_approval"
                            icon="parent"
                            @click="openShowApprovals(activity)"
                          >
                            {{ $t('activities.showApprovals') }}
                          </RowActionsItem>
                          <RowActionsItem icon="delete" danger @click="removeActivity(activity.id)">
                            {{ $t('common.delete') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                      <div class="mt-3 flex flex-wrap gap-1.5">
                        <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                          {{ translateActivityType(activity.activity_type) }}
                        </span>
                        <span
                          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          :class="statusBadgeClass(getActivityStatus(activity))"
                        >
                          {{ $t(`activities.status.${getActivityStatus(activity)}`) }}
                        </span>
                        <span
                          v-if="activity.requires_parent_approval"
                          class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900"
                        >
                          {{ $t('activities.approvalRequiredBadge') }}
                        </span>
                      </div>
                      <p class="mt-2 text-xs text-gray-500">
                        <span class="text-gray-400">{{ $t('activities.dueDate') }}:</span>
                        {{ formatActivityDueDate(activity) }}
                      </p>
                      <p v-if="activity.group?.name || activity.location" class="mt-1 truncate text-xs text-gray-500">
                        <template v-if="activity.group?.name">{{ activity.group.name }}</template>
                        <template v-if="activity.group?.name && activity.location"> · </template>
                        <template v-if="activity.location">{{ activity.location }}</template>
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('activities.title') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('activities.type') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('activities.group') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('activities.dueDate') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('activities.statusLabel') }}</th>
                    <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="activity in filteredActivities" :key="'list-' + activity.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ activity.title }}</div>
                      <div v-if="activity.requires_parent_approval" class="mt-0.5 text-[11px] font-semibold text-amber-800">
                        {{ $t('activities.approvalRequiredBadge') }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-700">{{ translateActivityType(activity.activity_type) }}</td>
                    <td class="px-4 py-3 text-gray-700">{{ activity.group?.name || $t('activities.unassignedGroup') }}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-gray-600">{{ formatActivityDueDate(activity) }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        :class="statusBadgeClass(getActivityStatus(activity))"
                      >
                        {{ $t(`activities.status.${getActivityStatus(activity)}`) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-end">
                      <RowActionsMenu
                        :open="activeDropdown === activity.id"
                        @toggle="toggleDropdown(activity.id)"
                      >
                        <RowActionsItem icon="view" @click="viewActivity(activity)">
                          {{ $t('common.view') }}
                        </RowActionsItem>
                        <RowActionsItem icon="edit" @click="editActivity(activity)">
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="activity.requires_parent_approval"
                          icon="parent"
                          @click="openShowApprovals(activity)"
                        >
                          {{ $t('activities.showApprovals') }}
                        </RowActionsItem>
                        <RowActionsItem icon="delete" danger @click="removeActivity(activity.id)">
                          {{ $t('common.delete') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'empty-' + slot"
              class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <template v-if="slot === 1">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('activities.noActivities') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('activities.noActivitiesDescription') }}</p>
                <button
                  type="button"
                  class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                  @click="openCreateModal"
                >
                  {{ $t('activities.createFirstActivity') }}
                </button>
              </template>
              <template v-else>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </template>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('common.filter')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('common.filter') }}</h3>
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
            <label class="fk-flabel" for="activity-status"><span>{{ $t('activities.statusLabel') }}</span></label>
            <select id="activity-status" v-model="filters.status" class="fk-field">
              <option value="all">{{ $t('activities.filterStatusAll') }}</option>
              <option value="active">{{ $t('activities.status.active') }}</option>
              <option value="pending">{{ $t('activities.status.pending') }}</option>
              <option value="completed">{{ $t('activities.status.completed') }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="activity-type"><span>{{ $t('activities.type') }}</span></label>
            <select id="activity-type" v-model="filters.activityType" class="fk-field">
              <option value="">{{ $t('activities.filterTypeAll') }}</option>
              <option v-for="type in activityTypes" :key="type" :value="type">{{ translateActivityType(type) }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="activity-group"><span>{{ $t('activities.filterByGroup') }}</span></label>
            <select id="activity-group" v-model="filters.groupId" class="fk-field">
              <option value="">{{ $t('activities.filterGroupAll') }}</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
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

    <FikrDialog
      :show="showViewModal && !!selectedActivity"
      plain-footer
      :title="$t('activities.detailsTitle')"
      size="md"
      @close="closeViewModal"
    >
      <div v-if="selectedActivity" class="space-y-4 text-sm">
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
            <div class="text-gray-900 mt-0.5">{{ translateActivityType(selectedActivity.activity_type) }}</div>
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
          <div v-if="selectedActivity.requires_parent_approval" class="col-span-2">
            <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.parentApprovalViewFlag') }}</div>
            <div class="text-gray-900 mt-0.5">{{ $t('common.yes') }}</div>
          </div>
          <div v-if="creatorLabel(selectedActivity)" class="col-span-2">
            <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('activities.createdBy') }}</div>
            <div class="text-gray-900 mt-0.5">{{ creatorLabel(selectedActivity) }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--primary" @click="closeViewModal">
          {{ $t('common.close') }}
        </button>
      </template>
    </FikrDialog>

    <FikrDialog
      :show="showCreateModal"
      plain-footer
      :title="editingActivityId ? $t('activities.editActivity') : $t('activities.addActivity')"
      size="lg"
      @close="closeModal"
    >
      <form id="activity-form" class="fk-form" @submit.prevent="saveActivity">
        <div class="fk-form__section">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="fk-flabel" for="activity-title"><span>{{ $t('activities.title') }}</span></label>
              <input id="activity-title" v-model="form.title" type="text" required class="fk-field" />
            </div>
            <div class="md:col-span-2">
              <label class="fk-flabel" for="activity-description"><span>{{ $t('activities.descriptionLabel') }}</span></label>
              <textarea id="activity-description" v-model="form.description" rows="3" class="fk-field" />
            </div>
            <div>
              <label class="fk-flabel" for="activity-form-type"><span>{{ $t('activities.type') }}</span></label>
              <select id="activity-form-type" v-model="form.activity_type" required class="fk-field">
                <option v-for="type in activityTypes" :key="type" :value="type">{{ translateActivityType(type) }}</option>
              </select>
            </div>
            <div>
              <label class="fk-flabel" for="activity-form-group"><span>{{ $t('activities.group') }}</span></label>
              <select id="activity-form-group" v-model="form.group_id" class="fk-field">
                <option value="">{{ $t('activities.unassignedGroup') }}</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
              </select>
            </div>
            <div>
              <label class="fk-flabel" for="activity-form-date"><span>{{ $t('activities.date') }}</span></label>
              <input id="activity-form-date" v-model="form.activity_date" type="date" required class="fk-field" />
            </div>
            <div>
              <label class="fk-flabel" for="activity-form-location"><span>{{ $t('activities.location') }}</span></label>
              <input id="activity-form-location" v-model="form.location" type="text" class="fk-field" />
            </div>
            <div>
              <label class="fk-flabel" for="activity-form-start"><span>{{ $t('activities.startTime') }}</span></label>
              <input id="activity-form-start" v-model="form.start_time" type="time" class="fk-field" />
            </div>
            <div>
              <label class="fk-flabel" for="activity-form-end"><span>{{ $t('activities.endTime') }}</span></label>
              <input id="activity-form-end" v-model="form.end_time" type="time" class="fk-field" />
            </div>
            <div class="md:col-span-2">
              <label class="inline-flex items-start gap-2 cursor-pointer">
                <input
                  v-model="form.requires_parent_approval"
                  type="checkbox"
                  class="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                />
                <span class="text-sm text-gray-800">{{ $t('activities.parentApprovalCheckbox') }}</span>
              </label>
              <p v-if="form.requires_parent_approval && !form.group_id" class="mt-1.5 text-xs text-gray-500">
                {{ $t('activities.parentApprovalAllParentsHint') }}
              </p>
            </div>
            <div v-if="form.requires_parent_approval && letterBundle" class="md:col-span-2">
              <ActivityParentApprovalLetterPanel
                :key="approvalLetterPanelKey"
                ref="approvalLetterPanelRef"
                v-model="letterBundle"
                :school-id="schoolId"
                :preview-samples="approvalPreviewSamples"
                :disabled="submitting"
              />
            </div>
          </div>
          <p v-if="error" class="fk-alert fk-alert--error">{{ error }}</p>
        </div>
      </form>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="closeModal">
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="activity-form"
          :disabled="submitting"
          class="fk-btn fk-btn--primary"
        >
          {{ submitting ? $t('common.loading') : $t('common.save') }}
        </button>
      </template>
    </FikrDialog>

    <MessageLetterApprovalTrackingSheet
      v-model:open="approvalSheetOpen"
      :school-id="schoolId"
      :letter-id="approvalSheetLetterId"
      :activity-id="approvalSheetActivityId"
      :letter-title="approvalSheetTitle"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import ActivityParentApprovalLetterPanel from '@/components/ActivityParentApprovalLetterPanel.vue'
import MessageLetterApprovalTrackingSheet from '@/components/MessageLetterApprovalTrackingSheet.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import activityService, {
  type Activity,
  type CreateActivityRequest,
  type UpdateActivityRequest,
  type ParentApprovalLetterBundle,
} from '@/services/activity.service'
import groupService, { type Group } from '@/services/group.service'
import scheduleService from '@/services/schedule.service'
import notificationTemplateService from '@/services/notification-template.service'
import { createParentApprovalLetterBundle } from '@/utils/activity-parent-approval-letter-defaults'
import { ACTIVITY_TYPE_VALUES, translateActivityType as translateActivityTypeLabel } from '@/utils/activity-types'

const { locale, t } = useI18n()
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const showViewModal = ref(false)
const showFilters = ref(false)
const selectedActivity = ref<Activity | null>(null)
const error = ref('')
const activities = ref<Activity[]>([])
const groups = ref<Group[]>([])
const editingActivityId = ref<string | null>(null)
const activeDropdown = ref<string | null>(null)
const modalOpenSeq = ref(0)
const approvalLetterPanelRef = ref<InstanceType<typeof ActivityParentApprovalLetterPanel> | null>(null)
const letterBundle = ref<ParentApprovalLetterBundle | null>(null)
const templateSampleVars = ref<Record<string, string>>({})
const approvalSheetOpen = ref(false)
const approvalSheetLetterId = ref<string | null>(null)
const approvalSheetActivityId = ref<string | null>(null)
const approvalSheetTitle = ref('')

const activityTypes = [...ACTIVITY_TYPE_VALUES]

const translateActivityType = (type: string) => translateActivityTypeLabel(t, type)

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
  requires_parent_approval: false,
})

const isRTL = computed(() => locale.value === 'ar')

const approvalLetterPanelKey = computed(() => `${editingActivityId.value ?? 'new'}-${modalOpenSeq.value}`)

const schoolPreviewName = computed(() => templateSampleVars.value.schoolName || '—')

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

const statusBadgeClass = (status: 'active' | 'pending' | 'completed') => {
  if (status === 'active') return 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20'
  if (status === 'pending') return 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20'
  return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/15'
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

const hasActiveFilters = computed(() =>
  filters.value.status !== 'all' || Boolean(filters.value.activityType) || Boolean(filters.value.groupId),
)

function clearFilters() {
  filters.value = { status: 'all', activityType: '', groupId: '' }
}

const formatActivityDueDate = (activity: Activity) => {
  const raw = activity.activity_date
  if (!raw) return '—'
  const d = String(raw).split('T')[0]
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  try {
    return new Date(`${d}T12:00:00`).toLocaleDateString(loc, { dateStyle: 'medium' })
  } catch {
    return d
  }
}

const formatActivitySampleRange = (dateKey: string, time?: string, endTime?: string) => {
  const d = (dateKey || '').split('T')[0]
  const t = time ? String(time).slice(0, 5) : ''
  const e = endTime ? String(endTime).slice(0, 5) : ''
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  try {
    const base = d || todayKeyLocal()
    const startIso = t ? `${base}T${t}:00` : `${base}T12:00:00`
    const endPart = e || t
    const endIso = endPart ? `${base}T${endPart}:00` : `${base}T13:00:00`
    const start = new Date(startIso).toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' })
    const end = new Date(endIso).toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' })
    return { start, end }
  } catch {
    return { start: d || '—', end: d || '—' }
  }
}

const approvalPreviewSamples = computed<Record<string, string>>(() => {
  const { start, end } = formatActivitySampleRange(form.value.activity_date, form.value.start_time, form.value.end_time)
  return {
    parentName: t('activities.parentApprovalSampleParent'),
    activityStartDate: start,
    activityEndDate: end,
    schoolName: schoolPreviewName.value,
  }
})

function defaultApprovalSubjects(title: string) {
  const tlabel = title.trim() || '—'
  return {
    en: t('activities.parentApprovalSubjectEn', { title: tlabel }),
    ar: t('activities.parentApprovalSubjectAr', { title: tlabel }),
  }
}

watch(
  () => form.value.requires_parent_approval,
  (on) => {
    if (on && !letterBundle.value) {
      letterBundle.value = createParentApprovalLetterBundle(defaultApprovalSubjects(form.value.title))
    }
    if (!on) letterBundle.value = null
  },
)

watch(
  () => [form.value.title, form.value.requires_parent_approval] as const,
  () => {
    if (!form.value.requires_parent_approval || !letterBundle.value) return
    const s = defaultApprovalSubjects(form.value.title)
    letterBundle.value = {
      ...letterBundle.value,
      en: { ...letterBundle.value.en, subject: s.en },
      ar: { ...letterBundle.value.ar, subject: s.ar },
    }
  },
)

const formatDate = (dateStr: string) => {
  const d = typeof dateStr === 'string' ? dateStr.split('T')[0] : dateStr
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  try {
    return new Date(`${d}T12:00:00`).toLocaleDateString(loc, { dateStyle: 'medium' })
  } catch {
    return String(d)
  }
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

const openShowApprovals = (activity: Activity) => {
  activeDropdown.value = null
  approvalSheetLetterId.value = activity.approval_letter_id ?? null
  approvalSheetActivityId.value = activity.id
  approvalSheetTitle.value = activity.title
  approvalSheetOpen.value = true
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
    requires_parent_approval: false,
  }
  letterBundle.value = null
  editingActivityId.value = null
  error.value = ''
}

const openCreateModal = () => {
  modalOpenSeq.value += 1
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
  modalOpenSeq.value += 1
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
    requires_parent_approval: !!activity.requires_parent_approval,
  }
  if (activity.requires_parent_approval && activity.parent_approval_letter) {
    letterBundle.value = JSON.parse(JSON.stringify(activity.parent_approval_letter)) as ParentApprovalLetterBundle
  } else if (activity.requires_parent_approval) {
    letterBundle.value = createParentApprovalLetterBundle(defaultApprovalSubjects(activity.title))
  } else {
    letterBundle.value = null
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
    requires_parent_approval: form.value.requires_parent_approval,
    parent_approval_letter:
      form.value.requires_parent_approval && letterBundle.value ? letterBundle.value : null,
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
    if (form.value.requires_parent_approval && letterBundle.value) {
      approvalLetterPanelRef.value?.flushAndEmit?.()
    }
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
        requires_parent_approval: form.value.requires_parent_approval || undefined,
        parent_approval_letter:
          form.value.requires_parent_approval && letterBundle.value ? letterBundle.value : undefined,
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
  try {
    templateSampleVars.value = await notificationTemplateService.sampleVariables(schoolId.value)
  } catch {
    templateSampleVars.value = {}
  }
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
