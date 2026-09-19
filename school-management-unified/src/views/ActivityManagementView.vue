<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('dashboard.activityManagement')"
        :subtitle="$t('activities.description')"
      />

      <div v-if="error && !showCreateModal" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('activities.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('activities.activitiesCount', { count: filteredActivities.length }) }}
            </p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <ListViewModeToggle v-model="viewMode" />
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('activities.addActivity')"
              @click="openCreateModal"
            >
              <IconPlus />
            </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="filteredActivities.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <template v-for="activity in paginatedActivities" :key="activity.id">
                <article
                  v-if="activity.image_url"
                  class="fk-kcard relative flex flex-col !p-0"
                >
                  <div class="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-navy-800">
                    <img
                      v-if="imageUrls[activity.id]"
                      :src="imageUrls[activity.id]"
                      alt=""
                      class="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <span class="absolute start-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-800">
                    {{ activityCoverDate(activity) }}
                  </span>
                  <div class="absolute end-3 top-3 z-20">
                    <RowActionsMenu
                      placement="down"
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
                  <div class="flex flex-1 flex-col gap-3 px-6 pb-6 pt-4">
                    <div class="min-w-0">
                      <h3 class="fk-display text-xl font-bold leading-7 text-navy-800">{{ activity.title }}</h3>
                      <p class="mt-0.5 text-sm leading-5 text-fikr-ink-muted">{{ approvalCardMeta(activity) }}</p>
                    </div>
                    <div v-if="activity.requires_parent_approval" class="flex items-center justify-between gap-3">
                      <span class="text-sm text-fikr-ink-muted">
                        {{ $t('activities.approvalsLabel') }}
                        <span class="font-medium tabular-nums text-navy-800">{{ approvalFraction(activity) }}</span>
                      </span>
                      <button
                        type="button"
                        class="shrink-0 rounded-full bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-900"
                        @click="openShowApprovals(activity)"
                      >
                        {{ $t('activities.remindRemaining') }}
                      </button>
                    </div>
                    <div
                      v-if="activity.requires_parent_approval"
                      class="flex h-1.5 gap-[3px]"
                      role="img"
                      :aria-label="approvalFraction(activity)"
                    >
                      <span
                        v-if="approvalParts(activity).approved > 0"
                        class="h-full min-w-0 rounded-full bg-primary-500"
                        :style="{ flex: `${approvalParts(activity).approved} 1 0%` }"
                      />
                      <span
                        v-if="approvalParts(activity).remaining > 0 || approvalParts(activity).approved === 0"
                        class="h-full min-w-0 rounded-full bg-white"
                        :style="{ flex: `${approvalParts(activity).remaining || 1} 1 0%` }"
                      />
                    </div>
                  </div>
                </article>

                <article
                  v-else
                  class="fk-kcard flex flex-col gap-4 p-6"
                >
                  <div class="flex items-start justify-between gap-2">
                    <span
                      v-if="getActivityStatus(activity) === 'completed'"
                      class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xl text-white"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span
                      v-else
                      class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-white"
                      aria-hidden="true"
                    >
                      <span class="fk-display text-lg font-bold leading-6 tabular-nums text-navy-800" dir="ltr">{{ activityDayNumber(activity) }}</span>
                      <span class="text-[11px] leading-4 text-fikr-ink-muted">{{ activityMonthShort(activity) }}</span>
                    </span>
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
                  <div class="min-w-0">
                    <h3 class="fk-display text-lg font-bold leading-7 text-navy-800">{{ activity.title }}</h3>
                    <p class="mt-0.5 truncate text-sm leading-5 text-fikr-ink-muted">
                      {{ [activity.group?.name || $t('activities.unassignedGroup'), activity.location].filter(Boolean).join(' · ') }}
                    </p>
                  </div>
                  <div class="mt-auto flex flex-wrap items-center gap-1.5">
                    <span class="fk-ktag">{{ translateActivityType(activity.activity_type) }}</span>
                    <span class="fk-ktag">
                      <span class="fk-ktag__dot" :class="statusDotClass(getActivityStatus(activity))" />
                      {{ $t(`activities.status.${getActivityStatus(activity)}`) }}
                    </span>
                  </div>
                  <div v-if="activity.requires_parent_approval" class="flex flex-col gap-3">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-sm text-fikr-ink-muted">
                        {{ $t('activities.approvalsLabel') }}
                        <span class="font-medium tabular-nums text-navy-800">{{ approvalFraction(activity) }}</span>
                      </span>
                      <button
                        type="button"
                        class="shrink-0 rounded-full bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-900"
                        @click="openShowApprovals(activity)"
                      >
                        {{ $t('activities.remindRemaining') }}
                      </button>
                    </div>
                    <div
                      class="flex h-1.5 gap-[3px]"
                      role="img"
                      :aria-label="approvalFraction(activity)"
                    >
                      <span
                        v-if="approvalParts(activity).approved > 0"
                        class="h-full min-w-0 rounded-full bg-primary-500"
                        :style="{ flex: `${approvalParts(activity).approved} 1 0%` }"
                      />
                      <span
                        v-if="approvalParts(activity).remaining > 0 || approvalParts(activity).approved === 0"
                        class="h-full min-w-0 rounded-full bg-white"
                        :style="{ flex: `${approvalParts(activity).remaining || 1} 1 0%` }"
                      />
                    </div>
                  </div>
                  <div class="flex items-center justify-between border-t border-fikr-hairline pt-3 text-sm leading-5">
                    <span class="text-fikr-ink-muted">{{ formatActivityDueDate(activity) }}</span>
                  </div>
                </article>
              </template>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('activities.title') }}</th>
                    <th>{{ $t('activities.type') }}</th>
                    <th>{{ $t('activities.group') }}</th>
                    <th>{{ $t('activities.dueDate') }}</th>
                    <th>{{ $t('activities.statusLabel') }}</th>
                    <th class="!text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="activity in paginatedActivities" :key="'list-' + activity.id">
                    <td>
                      <div class="font-medium">{{ activity.title }}</div>
                      <div
                        v-if="activity.requires_parent_approval"
                        class="mt-2 flex max-w-[11rem] items-center gap-2"
                      >
                        <span
                          class="flex h-1.5 min-w-0 flex-1 gap-0.5 overflow-hidden rounded-full"
                          aria-hidden="true"
                        >
                          <span
                            v-if="approvalParts(activity).approved > 0"
                            class="min-w-0 rounded-full bg-primary-500"
                            :style="{ flexGrow: approvalParts(activity).approved }"
                          />
                          <span
                            v-if="approvalParts(activity).remaining > 0 || approvalParts(activity).approved === 0"
                            class="min-w-0 rounded-full bg-fikr-mist"
                            :style="{ flexGrow: approvalParts(activity).remaining || 1 }"
                          />
                        </span>
                        <span class="shrink-0 font-medium tabular-nums text-navy-800">{{ approvalFraction(activity) }}</span>
                      </div>
                    </td>
                    <td>{{ translateActivityType(activity.activity_type) }}</td>
                    <td>{{ activity.group?.name || $t('activities.unassignedGroup') }}</td>
                    <td class="whitespace-nowrap">{{ formatActivityDueDate(activity) }}</td>
                    <td>
                      <span
                        class="fk-pill"
                        :class="statusBadgeClass(getActivityStatus(activity))"
                      >
                        {{ $t(`activities.status.${getActivityStatus(activity)}`) }}
                      </span>
                    </td>
                    <td class="text-end">
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

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredActivities.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div
            v-else-if="activities.length === 0"
            class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-fikr-mist text-navy-800">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-navy-800">{{ $t('activities.noActivities') }}</h3>
            <p class="mx-auto mt-1 max-w-md text-sm text-fikr-ink-muted">{{ $t('activities.noActivitiesDescription') }}</p>
            <button
              type="button"
              class="fk-btn fk-btn--navy mt-4"
              @click="openCreateModal"
            >
              {{ $t('activities.createFirstActivity') }}
            </button>
          </div>

          <div
            v-else
            class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-fikr-mist text-navy-800">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-navy-800">{{ $t('activities.noFilterResults') }}</h3>
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
            <button type="button" class="fk-btn fk-btn--mist" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--navy" @click="showFilters = false">{{ $t('common.close') }}</button>
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
          <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.title') }}</div>
          <div class="text-navy-800 font-medium mt-0.5">{{ selectedActivity.title }}</div>
        </div>
        <div>
          <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.descriptionLabel') }}</div>
          <div class="text-fikr-ink-muted mt-0.5 whitespace-pre-wrap">{{ selectedActivity.description || '—' }}</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.type') }}</div>
            <div class="text-navy-800 mt-0.5">{{ translateActivityType(selectedActivity.activity_type) }}</div>
          </div>
          <div>
            <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.date') }}</div>
            <div class="text-navy-800 mt-0.5">{{ formatDate(selectedActivity.activity_date) }}</div>
          </div>
          <div>
            <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.time') }}</div>
            <div class="text-navy-800 mt-0.5">{{ formatTimeRange(selectedActivity.start_time, selectedActivity.end_time) }}</div>
          </div>
          <div>
            <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.location') }}</div>
            <div class="text-navy-800 mt-0.5">{{ selectedActivity.location || '—' }}</div>
          </div>
          <div class="col-span-2">
            <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.group') }}</div>
            <div class="text-navy-800 mt-0.5">{{ selectedActivity.group?.name || $t('activities.unassignedGroup') }}</div>
          </div>
          <div class="col-span-2">
            <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.statusLabel') }}</div>
            <div class="text-navy-800 mt-0.5">{{ $t(`activities.status.${getActivityStatus(selectedActivity)}`) }}</div>
          </div>
          <div v-if="selectedActivity.requires_parent_approval" class="col-span-2">
            <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.parentApprovalViewFlag') }}</div>
            <div class="text-navy-800 mt-0.5">{{ $t('common.yes') }}</div>
          </div>
          <div v-if="creatorLabel(selectedActivity)" class="col-span-2">
            <div class="text-xs font-medium text-fikr-ink-soft uppercase tracking-wide">{{ $t('activities.createdBy') }}</div>
            <div class="text-navy-800 mt-0.5">{{ creatorLabel(selectedActivity) }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--navy" @click="closeViewModal">
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
            <div class="md:col-span-2">
              <label class="fk-flabel" for="activity-image">
                <span>{{ $t('activities.image') }} ({{ $t('common.optional') }})</span>
              </label>
              <input
                id="activity-image"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                class="fk-field"
                @change="onImagePick"
              />
              <img
                v-if="formImagePreview && !clearImage"
                :src="formImagePreview"
                alt=""
                class="mt-2 h-28 w-44 rounded-lg object-cover"
              />
              <button
                v-if="(existingImageUrl || imageFile) && !clearImage"
                type="button"
                class="mt-2 text-sm font-medium text-navy-800"
                @click="clearPickedImage"
              >
                {{ $t('common.remove') }}
              </button>
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
        <button type="button" class="fk-btn fk-btn--mist" @click="closeModal">
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="activity-form"
          :disabled="submitting"
          class="fk-btn fk-btn--navy"
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
import IconPlus from '@/components/icons/IconPlus.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import ActivityParentApprovalLetterPanel from '@/components/ActivityParentApprovalLetterPanel.vue'
import MessageLetterApprovalTrackingSheet from '@/components/MessageLetterApprovalTrackingSheet.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
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
import FikrLoader from '@/components/FikrLoader.vue'
import { fetchAuthenticatedMediaObjectUrl } from '@/utils/authenticated-media'

const { locale, t } = useI18n()
const { viewMode, isCards } = useListViewMode()

const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const showViewModal = ref(false)
const showFilters = ref(false)
const selectedActivity = ref<Activity | null>(null)
const error = ref('')
const activities = ref<Activity[]>([])
const imageUrls = ref<Record<string, string>>({})
const imageFile = ref<File | null>(null)
const formImagePreview = ref('')
const existingImageUrl = ref('')
const clearImage = ref(false)
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

function approvalParts(activity: Activity) {
  const approved = Math.max(0, Number(activity.approval_approved) || 0)
  const total = Math.max(0, Number(activity.approval_total) || 0)
  const capped = total > 0 ? Math.min(approved, total) : approved
  return { approved: capped, total, remaining: Math.max(0, total - capped) }
}

function approvalFraction(activity: Activity) {
  const { approved, total } = approvalParts(activity)
  return `${approved} / ${total}`
}

function activityCoverDate(activity: Activity) {
  const d = activityDateKey(activity.activity_date as string)
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  try {
    const dt = new Date(`${d}T12:00:00`)
    const weekday = dt.toLocaleDateString(loc, { weekday: 'long' })
    const day = dt.toLocaleDateString(loc, { day: 'numeric' })
    const month = dt.toLocaleDateString(loc, { month: 'long' })
    return `${weekday} ${day} ${month}`
  } catch {
    return d
  }
}

function approvalCardMeta(activity: Activity) {
  const parts: string[] = [activity.group?.name || t('activities.unassignedGroup')]
  if (activity.start_time || activity.end_time) {
    const start = activity.start_time ? String(activity.start_time).slice(0, 5) : ''
    const end = activity.end_time ? String(activity.end_time).slice(0, 5) : ''
    parts.push([start, end].filter(Boolean).join(' – '))
  }
  const who = creatorLabel(activity)
  if (who && who !== '—') parts.push(who)
  return parts.join(' · ')
}

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

const schoolId = computed(() => {
  const raw = currentUser.value?.school_id
  return raw != null && String(raw).trim() !== '' ? String(raw) : undefined
})

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

/** FIKR pills: teal = completed/done, navy outline = running now, mist = scheduled ahead. */
const statusBadgeClass = (status: 'active' | 'pending' | 'completed') => {
  if (status === 'active') return 'fk-pill--outline'
  if (status === 'pending') return 'fk-pill--mist'
  return 'fk-pill--teal'
}

/** Dot color for the white dot-pill on mist cards (mock 9a). */
const statusDotClass = (status: 'active' | 'pending' | 'completed') => {
  if (status === 'active') return 'bg-navy-800'
  if (status === 'pending') return 'bg-fikr-ink-soft'
  return 'bg-primary-500'
}

/** Day-of-month figure for the card's mist date tile. */
const activityDayNumber = (activity: Activity) => {
  const d = activityDateKey(activity.activity_date as string)
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  try {
    return new Date(`${d}T12:00:00`).toLocaleDateString(loc, { day: 'numeric' })
  } catch {
    return d.slice(-2)
  }
}

/** Short month label under the day number in the date tile. */
const activityMonthShort = (activity: Activity) => {
  const d = activityDateKey(activity.activity_date as string)
  const loc = locale.value === 'ar' ? 'ar' : 'en'
  try {
    return new Date(`${d}T12:00:00`).toLocaleDateString(loc, { month: 'short' })
  } catch {
    return ''
  }
}

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

const {
  currentPage,
  paginatedItems: paginatedActivities,
  totalPages,
  goToPage,
} = useClientPagination(filteredActivities)

watch(
  () => [filters.value.status, filters.value.activityType, filters.value.groupId],
  () => {
    currentPage.value = 1
  },
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
  return name || '—'
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

function revokePreview() {
  if (formImagePreview.value.startsWith('blob:')) URL.revokeObjectURL(formImagePreview.value)
  formImagePreview.value = ''
}

function onImagePick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  imageFile.value = file
  clearImage.value = false
  revokePreview()
  if (file) formImagePreview.value = URL.createObjectURL(file)
}

function clearPickedImage() {
  imageFile.value = null
  clearImage.value = true
  revokePreview()
  const input = document.getElementById('activity-image') as HTMLInputElement | null
  if (input) input.value = ''
}

async function loadActivityImages(list: Activity[]) {
  const next: Record<string, string> = {}
  await Promise.all(
    list
      .filter((activity) => activity.image_url)
      .map(async (activity) => {
        try {
          next[activity.id] = await fetchAuthenticatedMediaObjectUrl(activity.image_url as string)
        } catch {
          /* card falls back if the file cannot be read */
        }
      }),
  )
  for (const url of Object.values(imageUrls.value)) {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  }
  imageUrls.value = next
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
  imageFile.value = null
  existingImageUrl.value = ''
  clearImage.value = false
  revokePreview()
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
    void loadActivityImages(list)
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
  imageFile.value = null
  clearImage.value = false
  existingImageUrl.value = activity.image_url || ''
  revokePreview()
  if (activity.image_url) {
    void fetchAuthenticatedMediaObjectUrl(activity.image_url)
      .then((url) => {
        formImagePreview.value = url
      })
      .catch(() => {
        formImagePreview.value = ''
      })
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
  if (clearImage.value) patch.image_url = null
  return patch
}

const saveActivity = async () => {
  submitting.value = true
  error.value = ''
  try {
    if (form.value.requires_parent_approval && letterBundle.value) {
      approvalLetterPanelRef.value?.flushAndEmit?.()
    }
    let savedId = editingActivityId.value
    if (savedId) {
      await activityService.update(savedId, buildUpdatePayload())
    } else {
      const payload: CreateActivityRequest = {
        title: form.value.title.trim(),
        description: form.value.description.trim() || undefined,
        activity_date: form.value.activity_date,
        start_time: form.value.start_time || undefined,
        end_time: form.value.end_time || undefined,
        location: form.value.location.trim() || undefined,
        activity_type: form.value.activity_type,
        school_id: schoolId.value!,
        group_id: form.value.group_id || undefined,
        created_by: currentUser.value?.id,
        is_active: true,
        requires_parent_approval: form.value.requires_parent_approval || undefined,
        parent_approval_letter:
          form.value.requires_parent_approval && letterBundle.value ? letterBundle.value : undefined,
      }
      const created = await activityService.create(payload)
      savedId = created.id
    }
    if (imageFile.value && savedId && !clearImage.value) {
      await activityService.uploadImage(savedId, imageFile.value)
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
    templateSampleVars.value = schoolId.value
      ? await notificationTemplateService.sampleVariables(schoolId.value)
      : {}
  } catch {
    templateSampleVars.value = {}
  }
  await loadActivities()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

