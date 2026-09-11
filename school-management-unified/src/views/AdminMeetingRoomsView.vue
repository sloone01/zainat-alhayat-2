<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('meetingRooms.adminTitle')"
        :subtitle="$t('meetingRooms.adminSubtitle')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">{{ flashError }}</div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('meetingRooms.roomsListTitle') }}</h2>
            <p class="fk-card__meta">{{ $t('meetingRooms.roomsCount', { count: filteredRooms.length }) }}</p>
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
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-600"
                aria-hidden="true"
              />
            </button>
            <ListViewModeToggle v-model="viewMode" />
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('meetingRooms.newRoom')"
              @click="openNew"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="pageLoading || roomsLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="rooms.length">
            <p
              v-if="filteredRooms.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('meetingRooms.noFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="r in paginatedRooms"
                :key="r.id"
                class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <span
                  v-if="roomBadge(r) === 'draft'"
                  class="absolute end-3 top-3 z-10 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-100"
                >
                  {{ $t('meetingRooms.statusDraft') }}
                </span>
                <span
                  v-else-if="roomBadge(r) === 'live'"
                  class="absolute end-3 top-3 z-10 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100"
                >
                  {{ $t('meetingRooms.statusLive') }}
                </span>
                <span
                  v-else-if="roomBadge(r) === 'expired'"
                  class="absolute end-3 top-3 z-10 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200"
                >
                  {{ $t('meetingRooms.statusExpired') }}
                </span>
                <div class="flex flex-1 flex-col p-5 pe-16">
                  <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">{{ r.title }}</h3>
                      <p class="mt-1 text-xs text-gray-500">
                        {{ $t('meetingRooms.colScheduled') }}:
                        <span class="font-medium text-gray-700 tabular-nums">{{ formatDate(r.scheduled_at ?? r.created_at) }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-1.5">
                    <span class="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-sky-800 ring-1 ring-sky-100">
                      {{ r.invitee_count }} {{ $t('meetingRooms.colInvitees') }}
                    </span>
                    <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                      {{ formatDate(r.created_at) }}
                    </span>
                  </div>
                </div>
                <div class="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <button
                    v-if="r.status === 'draft'"
                    type="button"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
                    @click="openEdit(r)"
                  >
                    {{ $t('meetingRooms.editDraft') }}
                  </button>
                  <router-link
                    v-else
                    :to="{ name: 'meeting-room', params: { id: r.id } }"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
                  >
                    {{ $t('meetingRooms.openRoom') }}
                    <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </router-link>
                </div>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('meetingRooms.colTitle') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('meetingRooms.colScheduled') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('meetingRooms.colInvitees') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('meetingRooms.colCreated') }}</th>
                    <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="r in paginatedRooms" :key="'list-' + r.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">
                      <span class="inline-flex items-center gap-2">
                        {{ r.title }}
                        <span
                          v-if="roomBadge(r) === 'draft'"
                          class="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-100"
                        >
                          {{ $t('meetingRooms.statusDraft') }}
                        </span>
                        <span
                          v-else-if="roomBadge(r) === 'live'"
                          class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100"
                        >
                          {{ $t('meetingRooms.statusLive') }}
                        </span>
                        <span
                          v-else-if="roomBadge(r) === 'expired'"
                          class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200"
                        >
                          {{ $t('meetingRooms.statusExpired') }}
                        </span>
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-700 whitespace-nowrap tabular-nums">
                      {{ formatDate(r.scheduled_at ?? r.created_at) }}
                    </td>
                    <td class="px-4 py-3 text-gray-700 tabular-nums">{{ r.invitee_count }}</td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums">{{ formatDate(r.created_at) }}</td>
                    <td class="px-4 py-3 text-end whitespace-nowrap">
                      <button
                        v-if="r.status === 'draft'"
                        type="button"
                        class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900"
                        @click="openEdit(r)"
                      >
                        {{ $t('meetingRooms.editDraft') }}
                      </button>
                      <router-link
                        v-else
                        :to="{ name: 'meeting-room', params: { id: r.id } }"
                        class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900"
                      >
                        {{ $t('meetingRooms.openRoom') }}
                        <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredRooms.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div
            v-else
            class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.noRoomsYet') }}</h3>
            <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ $t('meetingRooms.emptyHint') }}</p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              @click="openNew"
            >
              {{ $t('meetingRooms.createFirstRoom') }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showFilters"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('meetingRooms.filtersTitle')"
      >
        <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
        <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
          <div class="fk-drawer__header items-start">
            <div>
              <h3 class="fk-form__title">{{ $t('meetingRooms.filtersTitle') }}</h3>
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
              <label class="fk-flabel" for="meeting-rooms-search"><span>{{ $t('common.search') }}</span></label>
              <input
                id="meeting-rooms-search"
                v-model="searchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('meetingRooms.searchPlaceholder')"
              >
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="meeting-rooms-status"><span>{{ $t('common.status') }}</span></label>
              <select
                id="meeting-rooms-status"
                v-model="statusFilter"
                class="fk-field"
              >
                <option value="all">{{ $t('meetingRooms.allStatuses') }}</option>
                <option value="scheduled">{{ $t('meetingRooms.statusScheduled') }}</option>
                <option value="draft">{{ $t('meetingRooms.statusDraft') }}</option>
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

      <Teleport to="body">
        <div
          v-if="sheetOpen"
          class="fixed inset-0 z-[60] flex justify-end bg-black/40"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('meetingRooms.sheetTitle')"
          @click.self="closeSheet"
        >
          <div
            class="h-full w-full max-w-4xl overflow-y-auto bg-white shadow-xl"
            :class="isRTL ? 'border-s border-gray-200' : 'border-e border-gray-200'"
            @click.stop
          >
            <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-fikr-hairline bg-white px-4 py-3">
              <h2 class="fk-form__title">{{ editingId ? $t('meetingRooms.editDraft') : $t('meetingRooms.sheetTitle') }}</h2>
              <button
                type="button"
                class="fk-modal__close"
                :aria-label="$t('common.close')"
                @click="closeSheet"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 pb-28">
              <div class="lg:col-span-7 space-y-4">
                <div class="space-y-4">
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="meeting-scheduled-at">{{
                    $t('meetingRooms.scheduledAtLabel')
                  }}</label>
                  <input
                    id="meeting-scheduled-at"
                    v-model="scheduledAtLocal"
                    type="datetime-local"
                    step="60"
                    class="fk-field fk-field--mono max-w-md tabular-nums"
                    style="direction: ltr"
                  />
                  <p class="text-xs text-gray-500">{{ $t('meetingRooms.scheduledAtHint') }}</p>
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('meetingRooms.roomTitle') }}</label>
                  <input
                    v-model="title"
                    type="text"
                    maxlength="255"
                    class="fk-field"
                    :placeholder="$t('meetingRooms.roomTitlePlaceholder')"
                  />
                </div>

                <div class="rounded-lg border border-gray-200 p-4 space-y-4">
                  <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.rolesCardTitle') }}</h3>
                  <p class="text-xs text-gray-500">{{ $t('meetingRooms.audienceHeading') }}</p>
                  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <label
                      v-for="opt in roleOptions"
                      :key="opt.key"
                      class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors"
                      :class="
                        opt.model.value
                          ? 'border-primary-300 bg-primary-50 text-primary-900'
                          : 'border-gray-200 bg-gray-50/80 text-gray-700 hover:border-gray-300'
                      "
                    >
                      <input v-model="opt.model" type="checkbox" class="rounded border-gray-300 text-primary-600 shrink-0" />
                      <span class="text-sm font-medium">{{ opt.label }}</span>
                    </label>
                  </div>
                </div>

                <div class="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.groupsCardTitle') }}</h3>
                    <button
                      v-if="selectedGroupIds.length"
                      type="button"
                      class="text-xs font-medium text-primary-600 hover:text-primary-800"
                      @click="clearGroups"
                    >
                      {{ $t('meetingRooms.clearGroups') }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500">{{ $t('meetingRooms.groupsHint') }}</p>
                  <div v-if="!groups.length" class="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                    {{ $t('meetingRooms.noGroups') }}
                  </div>
                  <div v-else class="max-h-52 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    <label
                      v-for="g in groups"
                      :key="`grp-${g.id}-${selectionTick}`"
                      class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      :class="selectedGroupIds.includes(g.id) ? 'bg-primary-50/50' : ''"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 text-primary-600 shrink-0"
                        :checked="selectedGroupIds.includes(g.id)"
                        @change="toggleGroup(g.id, ($event.target as HTMLInputElement).checked)"
                      />
                      <span class="text-sm text-gray-900 font-medium">{{ g.name }}</span>
                    </label>
                  </div>
                </div>

                <div class="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.usersCardTitle') }}</h3>
                    <button
                      v-if="selectedUserIds.length"
                      type="button"
                      class="text-xs font-medium text-primary-600 hover:text-primary-800"
                      @click="clearUsers"
                    >
                      {{ $t('meetingRooms.clearUsers') }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500">{{ $t('meetingRooms.usersHint') }}</p>
                  <input
                    v-model="userSearch"
                    type="search"
                    class="fk-field"
                    :placeholder="$t('meetingRooms.userSearchPlaceholder')"
                  />
                  <div class="max-h-56 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    <label
                      v-for="u in filteredUsers"
                      :key="`usr-${u.id}-${selectionTick}`"
                      class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      :class="selectedUserIds.includes(u.id) ? 'bg-indigo-50/60' : ''"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 text-primary-600 shrink-0"
                        :checked="selectedUserIds.includes(u.id)"
                        @change="toggleUser(u.id, ($event.target as HTMLInputElement).checked)"
                      />
                      <span class="text-sm text-gray-900 flex-1 min-w-0">
                        <span class="font-medium">{{ personFullName(u, locale) }}</span>
                        <span class="text-gray-500"> · {{ roleLabel(u.role) }}</span>
                      </span>
                      <span class="text-xs text-gray-400 truncate max-w-[9rem]">{{ u.email }}</span>
                    </label>
                  </div>
                </div>

                <p v-if="createError" class="fk-alert fk-alert--error">{{ createError }}</p>
                <p v-else-if="!hasAnySelection" class="text-sm text-amber-700">{{ $t('meetingRooms.selectAudienceHint') }}</p>
              </div>

              <div class="lg:col-span-5">
                <div class="rounded-lg border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-20">
                  <div class="border-b border-gray-200 bg-gray-50 px-4 py-4">
                    <h3 class="text-base font-semibold text-gray-900">{{ $t('meetingRooms.summaryPanelTitle') }}</h3>
                    <p class="mt-1 text-xs text-gray-500">{{ $t('meetingRooms.summaryPanelSubtitle') }}</p>
                  </div>
                  <div class="p-4 space-y-4 bg-white">
                    <div v-if="!title.trim()" class="text-sm text-gray-500 italic">{{ $t('meetingRooms.summaryNoTitle') }}</div>
                    <div v-else class="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('meetingRooms.roomTitle') }}</p>
                      <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ title.trim() }}</p>
                    </div>
                    <div v-if="scheduledAtValid" class="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('meetingRooms.summaryScheduledLabel') }}</p>
                      <p class="text-sm font-semibold text-gray-900 mt-0.5 tabular-nums">{{ scheduledDisplayFull }}</p>
                    </div>
                    <div v-else class="text-sm text-amber-800 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2">
                      {{ $t('meetingRooms.scheduledAtInvalid') }}
                    </div>
                    <div v-if="!hasAnySelection" class="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-200 rounded-lg">
                      {{ $t('meetingRooms.summaryEmpty') }}
                    </div>
                    <ul v-else class="space-y-2 text-sm text-gray-800">
                      <li
                        v-for="(line, idx) in summaryLines"
                        :key="`sum-${selectionTick}-${idx}`"
                        class="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
                      >
                        <span class="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
                        <span>{{ line }}</span>
                      </li>
                    </ul>
                    <div
                      v-if="hasAnySelection"
                      class="rounded-lg border border-primary-100 bg-primary-50/90 px-3 py-2.5 text-sm text-primary-900"
                    >
                      <span class="font-semibold tabular-nums">{{ estimatedInviteHint }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-fikr-hairline bg-white px-4 py-3">
              <button type="button" class="fk-btn fk-btn--pearl" @click="closeSheet">
                {{ $t('common.cancel') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--pearl"
                :disabled="saving || !title.trim()"
                @click="onSave({ draft: true, open: false })"
              >
                {{ saving && saveMode === 'draft' ? $t('meetingRooms.savingDraft') : $t('meetingRooms.saveDraft') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--pearl"
                :disabled="saving || !title.trim() || !hasAnySelection || !scheduledAtValid"
                @click="onSave({ draft: false, open: false })"
              >
                {{ saving && saveMode === 'create' ? $t('meetingRooms.creating') : $t('meetingRooms.createWithoutCall') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="saving || !title.trim() || !hasAnySelection || !scheduledAtValid"
                @click="onSave({ draft: false, open: true })"
              >
                {{ saving && saveMode === 'open' ? $t('meetingRooms.creating') : $t('meetingRooms.createButton') }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { authService } from '@/services'
import { groupService, type Group } from '@/services/group.service'
import userService, { type User } from '@/services/user.service'
import { meetingRoomService, type MeetingRoomListRow } from '@/services/meeting-room.service'
import {
  formatExactLocalDateTime,
  formatFullLocalDateTime,
  defaultScheduledDatetimeLocal,
  toDatetimeLocalValue,
} from '@/utils/meeting-datetime'
import { meetingRoomPresence } from '@/utils/meeting-host'
import { personFullName } from '@/utils/person-name'

const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const showFilters = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'draft' | 'scheduled'>('all')

const schoolId = computed(() => {
  const raw = (authService.getStoredUser() as { school_id?: string | null } | null)?.school_id
  return typeof raw === 'string' && raw.trim() ? raw.trim() : ''
})

const pageLoading = ref(true)
const sheetOpen = ref(false)
const flashError = ref('')
const title = ref('')
const invAllParents = ref(false)
const invAllTeachers = ref(false)
const invAllStudents = ref(false)
const selectedGroupIds = ref<string[]>([])
const selectedUserIds = ref<string[]>([])
const selectionTick = ref(0)

const userSearch = ref('')
const groups = ref<Group[]>([])
const users = ref<User[]>([])

const saving = ref(false)
const saveMode = ref<'draft' | 'create' | 'open' | ''>('')
const createError = ref('')
const editingId = ref<string | null>(null)
const rooms = ref<MeetingRoomListRow[]>([])
const filteredRooms = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return rooms.value.filter((r) => {
    const status = r.status || 'scheduled'
    if (statusFilter.value !== 'all' && status !== statusFilter.value) return false
    if (q && !r.title.toLowerCase().includes(q)) return false
    return true
  })
})
const hasActiveFilters = computed(
  () => Boolean(searchQuery.value.trim()) || statusFilter.value !== 'all',
)
const {
  currentPage,
  paginatedItems: paginatedRooms,
  totalPages,
  goToPage,
} = useClientPagination(filteredRooms)

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

const roomsLoading = ref(false)

const scheduledAtLocal = ref(defaultScheduledDatetimeLocal())
const scheduledAtValid = computed(() => {
  const v = scheduledAtLocal.value
  if (!v?.trim()) return false
  const d = new Date(v)
  return !Number.isNaN(d.getTime())
})
const scheduledDisplayFull = computed(() => {
  if (!scheduledAtValid.value) return ''
  return formatFullLocalDateTime(new Date(scheduledAtLocal.value), locale.value)
})

const roleOptions = computed(() => [
  { key: 'parents', label: t('meetingRooms.optAllParents'), model: invAllParents },
  { key: 'teachers', label: t('meetingRooms.optAllTeachers'), model: invAllTeachers },
  { key: 'students', label: t('meetingRooms.optAllStudents'), model: invAllStudents },
])

const usersInSchool = computed(() => {
  return users.value.filter((u) => {
    if (u.role === 'admin') return false
    if (!u.isActive) return false
    return true
  })
})

function countRole(role: 'parent' | 'teacher' | 'student'): number {
  return usersInSchool.value.filter((u) => u.role === role).length
}

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  const list = usersInSchool.value
  if (!q) return list
  return list.filter((u) => {
  const blob = `${personFullName(u, locale.value)} ${u.email} ${u.role}`.toLowerCase()
    return blob.includes(q)
  })
})

const hasAnySelection = computed(() => {
  return (
    invAllParents.value ||
    invAllTeachers.value ||
    invAllStudents.value ||
    selectedGroupIds.value.length > 0 ||
    selectedUserIds.value.length > 0
  )
})

const summaryLines = computed(() => {
  const lines: string[] = []
  if (invAllParents.value) {
    lines.push(t('meetingRooms.summaryLineAllParents', { n: countRole('parent') }))
  }
  if (invAllTeachers.value) {
    lines.push(t('meetingRooms.summaryLineAllTeachers', { n: countRole('teacher') }))
  }
  if (invAllStudents.value) {
    lines.push(t('meetingRooms.summaryLineAllStudents', { n: countRole('student') }))
  }
  for (const gid of selectedGroupIds.value) {
    const g = groups.value.find((x) => x.id === gid)
    lines.push(t('meetingRooms.summaryLineGroup', { name: g?.name ?? gid.slice(0, 8) }))
  }
  if (selectedUserIds.value.length) {
    lines.push(t('meetingRooms.summaryLineUsers', { n: selectedUserIds.value.length }))
  }
  return lines
})

const estimatedInviteHint = computed(() => {
  let n = 0
  if (invAllParents.value) n += countRole('parent')
  if (invAllTeachers.value) n += countRole('teacher')
  if (invAllStudents.value) n += countRole('student')
  n += selectedUserIds.value.length
  const g = selectedGroupIds.value.length
  if (g > 0) {
    return t('meetingRooms.summaryEstimateWithGroups', { base: n, groups: g })
  }
  return t('meetingRooms.summaryEstimate', { n })
})

function bumpSelection() {
  selectionTick.value += 1
}

function roleLabel(role: string) {
  const key = `dashboard.${role}`
  const tr = t(key)
  return tr === key ? role : tr
}

function toggleGroup(id: string, on: boolean) {
  const arr = [...selectedGroupIds.value]
  const i = arr.indexOf(id)
  if (on && i < 0) arr.push(id)
  if (!on && i >= 0) arr.splice(i, 1)
  selectedGroupIds.value = arr
  bumpSelection()
}

function toggleUser(id: string, on: boolean) {
  const arr = [...selectedUserIds.value]
  const i = arr.indexOf(id)
  if (on && i < 0) arr.push(id)
  if (!on && i >= 0) arr.splice(i, 1)
  selectedUserIds.value = arr
  bumpSelection()
}

function clearGroups() {
  selectedGroupIds.value = []
  bumpSelection()
}

function clearUsers() {
  selectedUserIds.value = []
  bumpSelection()
}

function resetForm() {
  editingId.value = null
  title.value = ''
  invAllParents.value = false
  invAllTeachers.value = false
  invAllStudents.value = false
  selectedGroupIds.value = []
  selectedUserIds.value = []
  userSearch.value = ''
  scheduledAtLocal.value = defaultScheduledDatetimeLocal()
  createError.value = ''
  saveMode.value = ''
  bumpSelection()
}

function applyInviteSpec(spec: MeetingRoomListRow['invite_spec']) {
  invAllParents.value = !!spec?.allParents
  invAllTeachers.value = !!spec?.allTeachers
  invAllStudents.value = !!spec?.allStudents
  selectedGroupIds.value = Array.isArray(spec?.groupIds) ? [...spec.groupIds] : []
  selectedUserIds.value = Array.isArray(spec?.userIds) ? [...spec.userIds] : []
  bumpSelection()
}

function openNew() {
  resetForm()
  sheetOpen.value = true
}

function openEdit(row: MeetingRoomListRow) {
  resetForm()
  editingId.value = row.id
  title.value = row.title
  if (row.scheduled_at) {
    const d = new Date(row.scheduled_at)
    if (!Number.isNaN(d.getTime())) scheduledAtLocal.value = toDatetimeLocalValue(d)
  }
  applyInviteSpec(row.invite_spec)
  sheetOpen.value = true
}

function closeSheet() {
  sheetOpen.value = false
  createError.value = ''
  editingId.value = null
  saveMode.value = ''
}

const formatDate = (iso?: string) => formatExactLocalDateTime(iso, locale.value)

function roomBadge(r: MeetingRoomListRow): 'draft' | 'live' | 'expired' | null {
  const p = meetingRoomPresence(r)
  if (p === 'draft') return 'draft'
  if (p === 'live') return 'live'
  if (p === 'expired') return 'expired'
  return null
}

function apiErrorMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const m = e.response?.data?.message
    if (typeof m === 'string' && m.trim()) return m
    if (Array.isArray(m) && m.length) return m.filter(Boolean).join('; ')
    return e.message || fallback
  }
  return e instanceof Error ? e.message : fallback
}

async function loadRooms() {
  roomsLoading.value = true
  flashError.value = ''
  try {
    rooms.value = await meetingRoomService.list(schoolId.value)
  } catch (e: unknown) {
    flashError.value = apiErrorMessage(e, t('meetingRooms.loadFailed'))
    rooms.value = []
  } finally {
    roomsLoading.value = false
  }
}

async function onSave(opts: { draft: boolean; open: boolean }) {
  createError.value = ''
  saveMode.value = opts.draft ? 'draft' : opts.open ? 'open' : 'create'
  saving.value = true
  try {
    const invite = {
      allParents: invAllParents.value || undefined,
      allTeachers: invAllTeachers.value || undefined,
      allStudents: invAllStudents.value || undefined,
      groupIds: selectedGroupIds.value.length ? [...selectedGroupIds.value] : undefined,
      userIds: selectedUserIds.value.length ? [...selectedUserIds.value] : undefined,
    }
    const payload = {
      title: title.value.trim(),
      scheduled_at: scheduledAtValid.value ? new Date(scheduledAtLocal.value).toISOString() : undefined,
      save_as_draft: opts.draft || undefined,
      invite,
    }
    const created = editingId.value
      ? await meetingRoomService.update(editingId.value, payload)
      : await meetingRoomService.create(payload)
    if (opts.draft) {
      editingId.value = created.id
      await loadRooms()
      return
    }
    closeSheet()
    await loadRooms()
    if (opts.open) {
      await router.push({ name: 'meeting-room', params: { id: created.id } })
    }
  } catch (e: unknown) {
    createError.value = apiErrorMessage(e, t('meetingRooms.createFailed'))
  } finally {
    saving.value = false
    saveMode.value = ''
  }
}

onMounted(async () => {
  pageLoading.value = true
  try {
    const [g, u] = await Promise.all([groupService.getAll(schoolId.value), userService.getAllUsers()])
    groups.value = g
    users.value = u
    await loadRooms()
  } catch (e: unknown) {
    flashError.value = apiErrorMessage(e, t('meetingRooms.loadFailed'))
  } finally {
    pageLoading.value = false
  }
})
</script>
