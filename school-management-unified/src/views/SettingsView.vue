<template>
  <DashboardLayout canvas="ice" content-bleed>
    <div class="space-y-3 px-2 py-3 sm:px-3 sm:py-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="error" class="fk-alert fk-alert--error">
        {{ error }}
      </div>

      <FikrPageHeader
        :title="$t('settings.title')"
        :subtitle="$t('settings.subtitle')"
      />

      <div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <div class="fk-stat fk-stat--navy">
          <div class="fk-stat__label">{{ $t('settings.stats.totalYears') }}</div>
          <div class="fk-stat__value">{{ yearStats.total }}</div>
        </div>
        <div class="fk-stat">
          <div class="fk-stat__label">{{ $t('settings.stats.activeYears') }}</div>
          <div class="fk-stat__value text-primary-600">{{ yearStats.active }}</div>
        </div>
        <div class="fk-stat">
          <div class="fk-stat__label">{{ $t('settings.stats.semesters') }}</div>
          <div class="fk-stat__value">{{ yearStats.semesters }}</div>
        </div>
        <div class="fk-stat">
          <div class="fk-stat__label">{{ $t('settings.stats.archivedYears') }}</div>
          <div class="fk-stat__value text-fikr-ink-soft">{{ yearStats.archived }}</div>
        </div>
      </div>

      <section class="fk-card p-4 sm:p-5">
        <div class="mb-4">
          <h2 class="fk-form__title">{{ $t('systemSettings.schoolInfo') }}</h2>
        </div>
        <p v-if="schoolInfoError" class="fk-alert fk-alert--error mb-4">{{ schoolInfoError }}</p>
        <p v-else-if="schoolInfoOk" class="fk-alert fk-alert--ok mb-4">{{ schoolInfoOk }}</p>
        <form class="fk-form" @submit.prevent="saveSchoolInfo">
          <div class="fk-form__section">
            <div class="fk-form__grid">
              <div class="fk-form__row">
                <label class="fk-flabel" for="school-name"><span>{{ $t('common.name') }}</span></label>
                <input id="school-name" v-model="schoolInfo.name" type="text" class="fk-field">
              </div>
              <div class="fk-form__row">
                <label class="fk-flabel" for="school-website"><span>{{ $t('systemSettings.website') }}</span></label>
                <input id="school-website" v-model="schoolInfo.website" type="url" dir="ltr" class="fk-field">
              </div>
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="school-address"><span>{{ $t('students.address') }}</span></label>
              <input id="school-address" v-model="schoolInfo.address" type="text" class="fk-field">
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="school-logo"><span>{{ $t('settings.schoolLogo') }}</span></label>
              <div class="flex flex-wrap items-center gap-3">
                <div
                  class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <img
                    v-if="schoolLogoPreview"
                    :src="schoolLogoPreview"
                    alt=""
                    class="h-full w-full object-contain p-1"
                  >
                  <span v-else class="text-[10px] text-gray-400">{{ $t('settings.noLogo') }}</span>
                </div>
                <input
                  id="school-logo"
                  v-model="schoolLogoUrl"
                  type="url"
                  dir="ltr"
                  class="fk-field min-w-0 flex-1"
                  :placeholder="$t('settings.schoolLogoPlaceholder')"
                >
              </div>
              <p class="mt-1.5 text-xs text-gray-500">{{ $t('settings.schoolLogoHint') }}</p>
              <div v-if="brandPrimaryColor || brandAccentColor" class="mt-3 flex flex-wrap items-center gap-3">
                <span class="text-xs font-medium text-gray-600">{{ $t('settings.brandColorsFromLogo') }}</span>
                <span
                  v-if="brandPrimaryColor"
                  class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <span class="h-4 w-4 rounded" :style="{ backgroundColor: brandPrimaryColor }" aria-hidden="true" />
                  {{ brandPrimaryColor }}
                </span>
                <span
                  v-if="brandAccentColor"
                  class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <span class="h-4 w-4 rounded" :style="{ backgroundColor: brandAccentColor }" aria-hidden="true" />
                  {{ brandAccentColor }}
                </span>
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :disabled="!schoolLogoPreview || detectingBrandColors"
                  @click="detectBrandColorsFromLogo"
                >
                  {{ detectingBrandColors ? $t('common.loading') : $t('settings.detectBrandColors') }}
                </button>
              </div>
              <div v-else class="mt-3">
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :disabled="!schoolLogoPreview || detectingBrandColors"
                  @click="detectBrandColorsFromLogo"
                >
                  {{ detectingBrandColors ? $t('common.loading') : $t('settings.detectBrandColors') }}
                </button>
              </div>
            </div>
            <div class="fk-form__grid">
              <div class="fk-form__row">
                <label class="fk-flabel" for="school-phone"><span>{{ $t('students.phone') }}</span></label>
                <input id="school-phone" v-model="schoolInfo.phone" type="tel" dir="ltr" class="fk-field">
              </div>
              <div class="fk-form__row">
                <label class="fk-flabel" for="school-email"><span>{{ $t('students.email') }}</span></label>
                <input id="school-email" v-model="schoolInfo.email" type="email" dir="ltr" class="fk-field">
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="fk-btn fk-btn--primary" :disabled="savingSchoolInfo">
              {{ savingSchoolInfo ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </section>

      <div class="fk-card p-4 sm:p-5">
        <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 class="fk-card__title">{{ $t('settings.academicYears') }}</h2>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative min-w-[12rem] flex-1 sm:flex-none">
              <svg class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fikr-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="search"
                :placeholder="$t('settings.searchYears')"
                class="fk-field fk-field--sm rounded-pill ps-10"
              >
            </div>
            <select
              v-model="statusFilter"
              :dir="isRTL ? 'rtl' : 'ltr'"
              class="fk-field fk-field--sm w-auto"
            >
              <option value="all">{{ $t('settings.allStatuses') }}</option>
              <option value="active">{{ $t('settings.active') }}</option>
              <option value="inactive">{{ $t('settings.inactive') }}</option>
              <option value="archived">{{ $t('settings.archived') }}</option>
            </select>
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('settings.addYear')"
              @click="showAddYearModal = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12 text-sm text-fikr-ink-soft">
          {{ $t('common.loading') }}
        </div>

        <div v-else-if="filteredYears.length" class="fk-table-wrap">
          <table class="fk-table">
            <thead>
              <tr>
                <th>{{ $t('settings.yearName') }}</th>
                <th>{{ $t('common.status') }}</th>
                <th>{{ $t('settings.period') }}</th>
                <th class="text-center">{{ $t('settings.semesters') }}</th>
                <th class="text-end">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="year in filteredYears" :key="year.id" class="bg-white">
                <td>
                  <div class="font-medium text-fikr-ink">{{ year.year }}</div>
                  <div v-if="year.description" class="fk-card__meta">{{ year.description }}</div>
                </td>
                <td>
                  <span
                    class="fk-chip"
                    :class="yearStatusClass(year)"
                  >
                    {{ $t(`settings.${yearStatus(year)}`) }}
                  </span>
                </td>
                <td class="text-fikr-ink-muted">
                  <div
                    class="flex flex-col gap-0.5"
                    :class="isRTL ? 'items-start text-right' : 'items-start text-left'"
                    :dir="isRTL ? 'rtl' : 'ltr'"
                  >
                    <span>{{ formatDate(year.start_date) }}</span>
                    <span>{{ formatDate(year.end_date) }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="flex w-full justify-center tabular-nums text-fikr-ink-muted">
                    {{ year.semesters?.length || 0 }}
                  </div>
                </td>
                <td class="text-end">
                  <RowActionsMenu
                    :open="activeYearDropdown === year.id"
                    @toggle="toggleYearDropdown(year.id)"
                  >
                    <RowActionsItem icon="edit" @click="editYear(year)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="!year.is_active"
                      icon="activate"
                      @click="activateYear(year)"
                    >
                      {{ $t('settings.activateYear') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="yearStatus(year) !== 'archived'"
                      icon="archive"
                      @click="archiveYear(year)"
                    >
                      {{ $t('settings.archiveYear') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="yearStatus(year) === 'archived'"
                      icon="restore"
                      @click="restoreYear(year)"
                    >
                      {{ $t('settings.restoreYear') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="fk-empty">
          <h3 class="text-sm font-medium text-fikr-ink">{{ $t('settings.noYears') }}</h3>
          <p class="mt-1 text-sm text-fikr-ink-soft">{{ $t('settings.noYearsDescription') }}</p>
          <button
            type="button"
            class="fk-btn fk-btn--primary mt-4"
            @click="showAddYearModal = true"
          >
            {{ $t('settings.createFirstYear') }}
          </button>
        </div>
      </div>

      <div class="fk-card px-4 py-3 sm:px-5">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-baseline gap-x-2">
            <h2 class="fk-card__title">{{ $t('settings.semesters') }}</h2>
            <p v-if="semesterYear" class="text-xs text-fikr-ink-soft">
              {{ $t('settings.semestersForYear', { year: semesterYear.year }) }}
            </p>
          </div>
          <button
            type="button"
            :disabled="!semesterYear"
            class="fk-iconbtn fk-iconbtn--primary"
            :aria-label="$t('settings.addSemester')"
            @click="openSemesterModal(semesterYear)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <p v-if="!semesterYear" class="rounded-lg border border-dashed border-fikr-outline bg-fikr-pearl px-3 py-2 text-center text-sm text-fikr-ink-soft">
          {{ $t('settings.activateYearToAddSemesters') }}
        </p>
        <div v-else-if="semesterYear.semesters?.length" class="fk-table-wrap">
          <table class="fk-table">
            <thead>
              <tr>
                <th class="!py-2">{{ $t('settings.semesterTitle') }}</th>
                <th class="!py-2">{{ $t('settings.period') }}</th>
                <th class="!py-2">{{ $t('common.status') }}</th>
                <th class="!py-2 text-end">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="semester in semesterYear.semesters" :key="semester.id">
                <td class="!py-2 font-medium text-fikr-ink">{{ semester.title }}</td>
                <td
                  class="!py-2 text-fikr-ink-muted"
                  :dir="isRTL ? 'rtl' : 'ltr'"
                >
                  {{ formatDate(semester.start_date) }} — {{ formatDate(semester.end_date) }}
                </td>
                <td class="!py-2">
                  <span
                    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                    :class="
                      semester.is_active
                        ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/80'
                        : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200/80'
                    "
                  >
                    {{
                      semester.is_active
                        ? $t('settings.activeSemesterNow')
                        : $t('settings.inactiveSemester')
                    }}
                  </span>
                </td>
                <td class="!py-2 text-end">
                  <RowActionsMenu
                    :open="activeSemesterDropdown === semester.id"
                    @toggle="toggleSemesterDropdown(semester.id)"
                  >
                    <RowActionsItem
                      v-if="!semester.is_active"
                      icon="activate"
                      @click="activateSemester(semester)"
                    >
                      {{ $t('settings.setActiveSemester') }}
                    </RowActionsItem>
                    <RowActionsItem icon="edit" @click="editSemester(semester, semesterYear)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem icon="delete" danger @click="deleteSemester(semester)">
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="rounded-lg border border-dashed border-fikr-outline bg-fikr-pearl px-3 py-2 text-center text-sm text-fikr-ink-soft">
          {{ $t('settings.noSemesters') }}
        </p>
      </div>

      <!-- Class Settings Section -->
      <div class="fk-card overflow-visible p-4 sm:p-5">
        <div class="relative mb-4 flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary-200/80 bg-primary-50 text-primary-700 hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            :aria-label="$t('classSettings.helpAria')"
            :aria-expanded="showClassSettingsHelp"
            @click="showClassSettingsHelp = !showClassSettingsHelp"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <h2 class="fk-card__title">{{ $t('classSettings.title') }}</h2>
          <div
            v-if="showClassSettingsHelp"
            class="absolute start-0 top-full z-20 mt-2 w-[min(100%,22rem)] rounded-lg border border-fikr-hairline bg-white p-3 text-start text-xs leading-relaxed text-fikr-ink-muted shadow-lg"
            role="note"
          >
            <ul class="list-disc space-y-1.5 ps-4">
              <li>{{ $t('classSettings.durations.defaultHint') }}</li>
              <li>{{ $t('classSettings.startTimes.description') }}</li>
              <li>{{ $t('classSettings.durations.defaultRequired') }}</li>
              <li>{{ $t('classSettings.timeSlots.editableHint') }}</li>
            </ul>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <div class="fk-card--pearl overflow-visible p-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-fikr-ink">{{ $t('classSettings.durations.title') }}</h3>
              </div>
              <button
                type="button"
                class="fk-iconbtn"
                :aria-label="$t('classSettings.durations.addDuration')"
                @click="openAddDuration"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <p v-if="!classDurations.length" class="rounded-xl border border-dashed border-fikr-outline bg-white px-4 py-4 text-center text-sm text-fikr-ink-soft">
              {{ $t('classSettings.durations.empty') }}
            </p>
            <div v-else class="fk-table-wrap overflow-visible">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('common.name') }}</th>
                    <th class="text-end">{{ $t('common.minutes') }}</th>
                    <th class="text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="duration in classDurations" :key="duration.id">
                    <td>
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-fikr-ink">{{ duration.name }}</span>
                        <span
                          v-if="duration.isDefault"
                          class="fk-chip fk-chip--outline"
                        >
                          {{ $t('classSettings.durations.isDefault') }}
                        </span>
                      </div>
                    </td>
                    <td class="text-end tabular-nums text-fikr-ink-muted">{{ duration.minutes }}</td>
                    <td class="text-end">
                      <RowActionsMenu
                        :open="activeDurationDropdown === duration.id"
                        @toggle="toggleDurationDropdown(duration.id)"
                      >
                        <RowActionsItem
                          v-if="!duration.isDefault"
                          icon="activate"
                          @click="makeDefaultDuration(duration)"
                        >
                          {{ $t('classSettings.durations.setAsDefault') }}
                        </RowActionsItem>
                        <RowActionsItem icon="edit" @click="editDuration(duration)">
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="!duration.inUse && !(duration.isDefault && classDurations.length === 1)"
                          icon="delete"
                          danger
                          @click="confirmDeleteDuration(duration)"
                        >
                          {{ $t('common.delete') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="fk-card--pearl p-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-fikr-ink">{{ $t('classSettings.startTimes.title') }}</h3>
              </div>
              <button
                type="button"
                class="fk-iconbtn"
                :aria-label="$t('common.edit')"
                @click="showStartTimesModal = true"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <dl class="divide-y divide-fikr-hairline overflow-hidden rounded-xl border border-fikr-hairline bg-white">
              <div class="flex items-center justify-between gap-4 px-4 py-3">
                <dt class="text-sm text-fikr-ink-muted">{{ $t('classSettings.startTimes.schoolStartTime') }}</dt>
                <dd class="text-sm font-medium tabular-nums text-fikr-ink">{{ schoolStartTime }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-3">
                <dt class="text-sm text-fikr-ink-muted">{{ $t('classSettings.startTimes.firstClassTime') }}</dt>
                <dd class="text-sm font-medium tabular-nums text-fikr-ink">{{ firstClassTime }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-3">
                <dt class="text-sm text-fikr-ink-muted">{{ $t('classSettings.startTimes.endTime') }}</dt>
                <dd class="text-sm font-medium tabular-nums text-fikr-ink">{{ schoolEndTime }}</dd>
              </div>
              <div class="px-4 py-3">
                <dt class="text-sm text-fikr-ink-muted">{{ $t('classSettings.startTimes.breakTimes') }}</dt>
                <dd class="mt-2 space-y-1.5">
                  <p v-if="!breakTimes.length" class="text-sm text-fikr-ink-soft">
                    {{ $t('classSettings.startTimes.breakTimesEmpty') }}
                  </p>
                  <div
                    v-for="(b, bi) in breakTimes"
                    :key="bi"
                    class="flex items-center justify-between gap-2 text-sm"
                  >
                    <span class="truncate font-medium text-fikr-ink">{{ b.name }}</span>
                    <span class="shrink-0 tabular-nums text-fikr-ink-muted">
                      {{ b.startTime }} · {{ b.duration }} {{ $t('common.minutes') }}
                    </span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div class="fk-card--pearl p-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-fikr-ink">{{ $t('classSettings.timeSlots.title') }}</h3>
              </div>
              <button
                type="button"
                class="fk-iconbtn"
                :aria-label="$t('classSettings.timeSlots.regenerate')"
                :disabled="!defaultDurationMinutes"
                @click="regenerateTimeSlots"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p v-if="!generatedTimeSlots.length" class="rounded-xl border border-dashed border-fikr-outline bg-white px-4 py-4 text-center text-sm text-fikr-ink-soft">
              {{ $t('classSettings.timeSlots.empty') }}
            </p>
            <div v-else class="fk-table-wrap">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('classSettings.timeSlots.slot') }}</th>
                    <th>{{ $t('common.time') }}</th>
                    <th>{{ $t('classSettings.timeSlots.kind') }}</th>
                    <th class="text-end">{{ $t('common.minutes') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(slot, index) in generatedTimeSlots" :key="slot.id">
                    <td class="tabular-nums text-fikr-ink-soft">{{ index + 1 }}</td>
                    <td class="font-medium tabular-nums text-fikr-ink">{{ slot.startTime }}</td>
                    <td>
                      <span
                        class="fk-chip"
                        :class="slot.kind === 'break' ? 'fk-chip--amber' : 'fk-chip--outline'"
                      >
                        {{ slot.kind === 'break' ? (slot.name || $t('classSettings.timeSlots.breakKind')) : $t('classSettings.timeSlots.classKind') }}
                      </span>
                    </td>
                    <td class="text-end tabular-nums text-fikr-ink-muted">{{ slot.duration }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Year Modal -->
      <YearModal
        v-if="showAddYearModal || showEditYearModal"
        :show="showAddYearModal || showEditYearModal"
        :year="editingYear"
        @close="closeYearModal"
        @save="saveYear"
      />

      <!-- Add/Edit Semester Modal -->
      <SemesterModal
        v-if="showSemesterModal"
        :show="showSemesterModal"
        :semester="editingSemester"
        :year="selectedYear"
        @close="closeSemesterModal"
        @save="saveSemester"
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

      <!-- Duration Modal -->
      <DurationModal
        v-if="showAddDurationModal"
        :duration="editingDuration"
        :force-default="!defaultDurationMinutes || (!!editingDuration && editingDuration.isDefault && classDurations.length === 1)"
        @close="showAddDurationModal = false; editingDuration = null"
        @save="saveDuration"
      />

      <!-- Start Times Modal -->
      <StartTimesModal
        v-if="showStartTimesModal"
        :start-times="schoolDayConfig"
        @close="showStartTimesModal = false"
        @save="saveStartTimes"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import YearModal from '@/components/YearModal.vue'
import SemesterModal from '@/components/SemesterModal.vue'
import DurationModal from '@/components/DurationModal.vue'
import StartTimesModal from '@/components/StartTimesModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import {
  academicYearService,
  semesterService,
  classSettingsService,
  scheduleService,
  type AcademicYear,
  type CreateAcademicYearDto,
  type UpdateAcademicYearDto,
  type CreateSemesterDto,
  type UpdateSemesterDto,
  type ClassSettings
} from '@/services'
import { settingsService } from '@/services/settings.service'
import { schoolLandingService } from '@/services/school-landing.service'
import { getApiBaseUrl } from '@/config/public-config'
import { resetSchoolBrand, useSchoolBrand } from '@/composables/useSchoolBrand'
import { extractLogoBrandColors } from '@/utils/extract-logo-brand-colors'

const { locale, t } = useI18n()
const { load: reloadSchoolBrand } = useSchoolBrand()

const schoolInfo = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
})
const schoolLogoUrl = ref('')
const brandPrimaryColor = ref('')
const brandAccentColor = ref('')
const detectingBrandColors = ref(false)
const savingSchoolInfo = ref(false)
const schoolInfoError = ref('')
const schoolInfoOk = ref('')

function resolveLogoPreview(path: string) {
  const trimmed = path.trim()
  if (!trimmed) return ''
  if (/^(https?:|data:)/i.test(trimmed)) return trimmed
  const base = getApiBaseUrl().replace(/\/api\/?$/, '')
  return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
}

const schoolLogoPreview = computed(() => resolveLogoPreview(schoolLogoUrl.value))

async function detectBrandColorsFromLogo() {
  detectingBrandColors.value = true
  try {
    const src = schoolLogoPreview.value
    if (!src) {
      brandPrimaryColor.value = ''
      brandAccentColor.value = ''
      return
    }
    const colors = await extractLogoBrandColors(src)
    if (colors) {
      brandPrimaryColor.value = colors.primary
      brandAccentColor.value = colors.accent
    }
  } catch (err) {
    console.error('Brand color detection failed:', err)
  } finally {
    detectingBrandColors.value = false
  }
}

async function loadSchoolInfo() {
  try {
    const loaded = await settingsService.getStructuredSettings()
    schoolInfo.value = {
      name: loaded.schoolInfo?.name || '',
      address: loaded.schoolInfo?.address || '',
      phone: loaded.schoolInfo?.phone || '',
      email: loaded.schoolInfo?.email || '',
      website: loaded.schoolInfo?.website || '',
    }
  } catch (err) {
    console.error('Error loading school info:', err)
  }
  try {
    const landing = await schoolLandingService.getAdmin()
    schoolLogoUrl.value = landing.logo_url?.trim() || ''
    brandPrimaryColor.value = landing.brand_primary_color?.trim() || ''
    brandAccentColor.value = landing.brand_accent_color?.trim() || ''
  } catch (err) {
    console.error('Error loading school logo:', err)
  }
}

async function saveSchoolInfo() {
  savingSchoolInfo.value = true
  schoolInfoError.value = ''
  schoolInfoOk.value = ''
  try {
    await settingsService.bulkUpdate(
      Object.entries(schoolInfo.value).map(([key, value]) => ({
        key: `schoolInfo.${key}`,
        value,
      })),
    )
    // Refresh palette from logo before persist (best-effort).
    if (schoolLogoPreview.value && (!brandPrimaryColor.value || !brandAccentColor.value)) {
      await detectBrandColorsFromLogo()
    }
    if (!schoolLogoUrl.value.trim()) {
      brandPrimaryColor.value = ''
      brandAccentColor.value = ''
    }
    await schoolLandingService.saveAdmin({
      logo_url: schoolLogoUrl.value.trim() || null,
      brand_primary_color: brandPrimaryColor.value.trim() || null,
      brand_accent_color: brandAccentColor.value.trim() || null,
    })
    resetSchoolBrand()
    await reloadSchoolBrand(true)
    schoolInfoOk.value = t('common.savedSuccessfully')
  } catch (err) {
    console.error('Error saving school info:', err)
    schoolInfoError.value = t('systemSettings.paymentFlagsSaveError')
  } finally {
    savingSchoolInfo.value = false
  }
}

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('all')
const activeYearDropdown = ref<string | null>(null)
const activeSemesterDropdown = ref<string | null>(null)
const activeDurationDropdown = ref<string | number | null>(null)

type YearStatus = 'active' | 'inactive' | 'archived'

const yearStatus = (year: AcademicYear): YearStatus => {
  if (year.is_active) return 'active'
  if (new Date(year.end_date) < new Date()) return 'archived'
  return 'inactive'
}

const yearStatusClass = (year: AcademicYear) => {
  const status = yearStatus(year)
  if (status === 'active') return 'fk-chip--green'
  if (status === 'archived') return 'fk-chip--neutral'
  return 'fk-chip--amber'
}

const showAddYearModal = ref(false)
const showEditYearModal = ref(false)
const showSemesterModal = ref(false)
const editingYear = ref(null)
const editingSemester = ref(null)
const selectedYear = ref(null)

// Class Settings data
const showAddDurationModal = ref(false)
const showStartTimesModal = ref(false)
const showClassSettingsHelp = ref(false)
const editingDuration = ref(null)

// Class settings data (loaded from API)
const classSettings = ref<ClassSettings[]>([])
const usedDurationMinutes = ref<Set<number>>(new Set())
const classDurations = computed(() =>
  classSettings.value
    .filter(setting => setting.setting_type === 'duration')
    .map(setting => ({
      id: setting.id,
      name: setting.name,
      minutes: setting.duration_minutes || 0,
      isDefault: setting.is_default,
      inUse:
        setting.in_use === true ||
        usedDurationMinutes.value.has(setting.duration_minutes || 0),
      color: setting.color || 'blue'
    }))
)

const defaultDurationMinutes = computed(
  () => classDurations.value.find((d) => d.isDefault)?.minutes || 0,
)

type BreakTimeRow = { name: string; startTime: string; duration: number }
type GeneratedSlot = {
  id: string
  startTime: string
  duration: number
  kind: 'class' | 'break'
  name?: string
}

// Start times data
const schoolStartTime = ref('07:30')
const firstClassTime = ref('08:00')
const schoolEndTime = ref('15:00')
const breakTimes = ref<BreakTimeRow[]>([])

const schoolDayConfig = computed(() => ({
  schoolStartTime: schoolStartTime.value,
  firstClassTime: firstClassTime.value,
  schoolEndTime: schoolEndTime.value,
  breakTimes: breakTimes.value,
}))

// Generated time slots (period template for schedules)
const generatedTimeSlots = ref<GeneratedSlot[]>([])

// Academic years data (loaded from API)
const years = ref<AcademicYear[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const errorMessage = ref('')

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const activeYear = computed(() => years.value.find(year => year.is_active))
const semesterYear = computed(() => activeYear.value || years.value[0] || null)

const yearStats = computed(() => ({
  total: years.value.length,
  active: years.value.filter((y) => y.is_active).length,
  archived: years.value.filter((y) => new Date(y.end_date) < new Date()).length,
  semesters: activeYear.value?.semesters?.length || 0,
}))

const filteredYears = computed(() => {
  let filtered = years.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(year =>
      year.year.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      year.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(year => yearStatus(year) === statusFilter.value)
  }

  return filtered
})

// Methods
const stripBidiMarks = (value: string) =>
  value.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const formatted = date.toLocaleDateString(locale.value === 'ar' ? 'ar-OM-u-ca-gregory' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory'
  })
  return stripBidiMarks(formatted)
}

// API methods
const loadAcademicYears = async () => {
  try {
    loading.value = true
    error.value = null
    years.value = await academicYearService.getAll(1) // Assuming school_id = 1
  } catch (err: any) {
    error.value = err.message || 'Failed to load academic years'
    console.error('Error loading academic years:', err)
  } finally {
    loading.value = false
  }
}

const loadClassSettings = async () => {
  try {
    classSettings.value = await classSettingsService.getAll()
  } catch (err: any) {
    console.error('Error loading class settings:', err)
    classSettings.value = []
  }

  try {
    const schedules = await scheduleService.getAllSchedules()
    usedDurationMinutes.value = new Set(
      (schedules || [])
        .map((schedule) => Number(schedule.duration_minutes))
        .filter((minutes) => Number.isFinite(minutes) && minutes > 0)
    )
  } catch (err) {
    console.error('Error loading schedule duration usage:', err)
  }

  hydrateSchoolDayFromStorage()
}

function hydrateSchoolDayFromStorage() {
  try {
    const raw = localStorage.getItem('classSettings')
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved.schoolStartTime) schoolStartTime.value = saved.schoolStartTime
    if (saved.firstClassTime) firstClassTime.value = saved.firstClassTime
    if (saved.schoolEndTime) schoolEndTime.value = saved.schoolEndTime
    if (Array.isArray(saved.breakTimes)) {
      breakTimes.value = saved.breakTimes.filter(
        (b: BreakTimeRow) => b?.name && b?.startTime && Number(b.duration) > 0,
      )
    }
    if (Array.isArray(saved.timeSlots) && saved.timeSlots.length) {
      generatedTimeSlots.value = saved.timeSlots.map((slot: any, i: number) => ({
        id: String(slot.id || i + 1),
        startTime: slot.startTime,
        duration: Number(slot.duration) || 0,
        kind: slot.kind === 'break' ? 'break' : 'class',
        name: slot.name,
      }))
    }
  } catch (err) {
    console.warn('Failed to hydrate class settings from localStorage:', err)
  }
}

function persistClassSettingsLocal() {
  try {
    localStorage.setItem(
      'classSettings',
      JSON.stringify({
        timeSlots: generatedTimeSlots.value,
        classDurations: classDurations.value,
        schoolStartTime: schoolStartTime.value,
        firstClassTime: firstClassTime.value,
        schoolEndTime: schoolEndTime.value,
        breakTimes: breakTimes.value,
      }),
    )
  } catch (error) {
    console.warn('Failed to save class settings to localStorage:', error)
  }
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = String(hhmm || '00:00').split(':').map((n) => Number(n) || 0)
  return h * 60 + m
}

function minutesToTime(total: number): string {
  const mins = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const toggleYearDropdown = (yearId: string) => {
  activeSemesterDropdown.value = null
  activeDurationDropdown.value = null
  activeYearDropdown.value = activeYearDropdown.value === yearId ? null : yearId
}

const toggleSemesterDropdown = (semesterId: string) => {
  activeYearDropdown.value = null
  activeDurationDropdown.value = null
  activeSemesterDropdown.value = activeSemesterDropdown.value === semesterId ? null : semesterId
}

const toggleDurationDropdown = (durationId: string | number) => {
  activeYearDropdown.value = null
  activeSemesterDropdown.value = null
  activeDurationDropdown.value = activeDurationDropdown.value === durationId ? null : durationId
}

const editYear = (year: any) => {
  editingYear.value = { ...year }
  showEditYearModal.value = true
  activeYearDropdown.value = null
}

const activateYear = async (year: AcademicYear) => {
  try {
    await academicYearService.activate(year.id)
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to activate year'
    console.error('Error activating year:', err)
  }
  activeYearDropdown.value = null
}

const activateSemester = async (semester: { id: string }) => {
  try {
    await semesterService.activate(semester.id)
    await loadAcademicYears()
  } catch (err: any) {
    error.value = err.message || 'Failed to activate semester'
    console.error('Error activating semester:', err)
  }
  activeSemesterDropdown.value = null
}

const archiveYear = async (year: AcademicYear) => {
  try {
    await academicYearService.archive(year.id)
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to archive year'
    console.error('Error archiving year:', err)
  }
  activeYearDropdown.value = null
}

const restoreYear = async (year: AcademicYear) => {
  try {
    // For restore, we update to make it active again
    await academicYearService.update(year.id, { is_active: false }) // Just make it inactive, not archived
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to restore year'
    console.error('Error restoring year:', err)
  }
  activeYearDropdown.value = null
}

const openSemesterModal = (year: any) => {
  if (!year) return
  selectedYear.value = year
  editingSemester.value = null
  showSemesterModal.value = true
}

const editSemester = (semester: any, year?: AcademicYear) => {
  editingSemester.value = { ...semester }
  selectedYear.value = year || years.value.find((item) => item.id === semester.academic_year_id) || activeYear.value
  showSemesterModal.value = true
  activeSemesterDropdown.value = null
}

const deleteSemester = async (semester: any) => {
  if (confirm('هل أنت متأكد من حذف هذا الفصل الدراسي؟')) {
    try {
      await semesterService.remove(semester.id)
      await loadAcademicYears() // Reload data
    } catch (err: any) {
      error.value = err.message || 'Failed to delete semester'
      console.error('Error deleting semester:', err)
    }
  }
  activeSemesterDropdown.value = null
}

const closeYearModal = () => {
  showAddYearModal.value = false
  showEditYearModal.value = false
  editingYear.value = null
}

const closeSemesterModal = () => {
  showSemesterModal.value = false
  editingSemester.value = null
  selectedYear.value = null
}

const saveYear = async (yearData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingYear.value ? 'تحديث السنة الأكاديمية' : 'إنشاء سنة أكاديمية جديدة'
  progressMessage.value = editingYear.value ? 'جاري تحديث بيانات السنة الأكاديمية...' : 'جاري إنشاء السنة الأكاديمية الجديدة...'

  try {
    if (editingYear.value) {
      // Update existing year
      const updateData: UpdateAcademicYearDto = {
        year: yearData.name || yearData.year,
        start_date: yearData.startDate || yearData.start_date,
        end_date: yearData.endDate || yearData.end_date,
        description: yearData.description,
        is_active: yearData.setAsActive || yearData.isActive || yearData.is_active
      }
      await academicYearService.update(editingYear.value.id, updateData)
      progressMessage.value = 'تم تحديث السنة الأكاديمية بنجاح'
    } else {
      // Add new year
      const createData: CreateAcademicYearDto = {
        year: yearData.name || yearData.year,
        start_date: yearData.startDate || yearData.start_date,
        end_date: yearData.endDate || yearData.end_date,
        description: yearData.description,
        is_active: yearData.setAsActive || yearData.isActive || yearData.is_active || false,
        school_id: 1 // Assuming school_id = 1
      }
      await academicYearService.create(createData)
      progressMessage.value = 'تم إنشاء السنة الأكاديمية بنجاح'
    }

    await loadAcademicYears() // Reload data
    progressState.value = 'success'

    setTimeout(() => {
      showProgressDialog.value = false
      closeYearModal()
    }, 1500)

  } catch (err: any) {
    console.error('Error saving year:', err)
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'

    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

const saveSemester = async (semesterData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingSemester.value ? 'تحديث الفصل الدراسي' : 'إنشاء فصل دراسي جديد'
  progressMessage.value = editingSemester.value ? 'جاري تحديث بيانات الفصل الدراسي...' : 'جاري إنشاء الفصل الدراسي الجديد...'

  try {
    if (editingSemester.value) {
      // Update existing semester
      const updateData: UpdateSemesterDto = {
        title: semesterData.title,
        start_date: semesterData.startDate || semesterData.start_date,
        end_date: semesterData.endDate || semesterData.end_date,
        description: semesterData.description,
        is_active: semesterData.isActive ?? semesterData.is_active,
      }
      await semesterService.update(editingSemester.value.id, updateData)
      progressMessage.value = 'تم تحديث الفصل الدراسي بنجاح'
    } else {
      // Add new semester — inactive unless explicitly marked active
      const createData: CreateSemesterDto = {
        title: semesterData.title,
        start_date: semesterData.startDate || semesterData.start_date,
        end_date: semesterData.endDate || semesterData.end_date,
        description: semesterData.description,
        academic_year_id: selectedYear.value.id,
        is_active: semesterData.isActive ?? semesterData.is_active ?? false,
      }
      await semesterService.create(createData)
      progressMessage.value = 'تم إنشاء الفصل الدراسي بنجاح'
    }

    await loadAcademicYears() // Reload data to get updated semesters
    progressState.value = 'success'

    setTimeout(() => {
      showProgressDialog.value = false
      closeSemesterModal()
    }, 1500)

  } catch (err: any) {
    console.error('Error saving semester:', err)
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'

    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

// Class Settings Methods
const openAddDuration = () => {
  editingDuration.value = null
  showAddDurationModal.value = true
}

const editDuration = (duration: any) => {
  editingDuration.value = duration
  showAddDurationModal.value = true
  activeDurationDropdown.value = null
}

const makeDefaultDuration = async (duration: { minutes: number }) => {
  activeDurationDropdown.value = null
  try {
    await classSettingsService.setDefaultDuration(duration.minutes)
    await loadClassSettings()
    await regenerateTimeSlots()
  } catch (err: any) {
    error.value = err.message || 'Failed to set default duration'
    console.error('Error setting default duration:', err)
  }
}

const saveDuration = async (durationData: any) => {
  try {
    const mustBeDefault =
      durationData.isDefault
      || !defaultDurationMinutes.value
      || classDurations.value.length === 0

    if (editingDuration.value?.id) {
      await classSettingsService.updateDuration(editingDuration.value.id, {
        duration: durationData.minutes,
        name: durationData.name,
      })
    } else {
      await classSettingsService.addDuration(durationData.minutes, durationData.name)
    }

    if (mustBeDefault) {
      await classSettingsService.setDefaultDuration(durationData.minutes)
    }

    await loadClassSettings()
    await regenerateTimeSlots()
  } catch (err: any) {
    error.value = err.message || 'Failed to save duration'
    console.error('Error saving duration:', err)
  }

  showAddDurationModal.value = false
  editingDuration.value = null
}

const confirmDeleteDuration = (duration: any) => {
  activeDurationDropdown.value = null
  if (duration.inUse) return
  if (duration.isDefault && classDurations.value.length === 1) {
    error.value = t('classSettings.durations.cannotDeleteOnlyDefault')
    return
  }
  if (!confirm(t('classSettings.durations.confirmDelete'))) return
  void deleteDuration(duration)
}

const deleteDuration = async (duration: any) => {
  if (duration?.inUse) {
    error.value = t('classSettings.durations.inUseCannotDelete')
    return
  }

  try {
    const wasDefault = duration.isDefault
    await classSettingsService.removeDuration(duration.minutes)
    await loadClassSettings()
    if (wasDefault && classDurations.value.length) {
      await classSettingsService.setDefaultDuration(classDurations.value[0].minutes)
      await loadClassSettings()
    }
    await regenerateTimeSlots()
  } catch (err: any) {
    error.value = err.message || t('classSettings.durations.inUseCannotDelete')
    console.error('Error deleting duration:', err)
  }
  showAddDurationModal.value = false
  editingDuration.value = null
}

const saveStartTimes = (startTimesData: any) => {
  schoolStartTime.value = startTimesData.schoolStartTime
  firstClassTime.value = startTimesData.firstClassTime
  schoolEndTime.value = startTimesData.schoolEndTime
  breakTimes.value = (startTimesData.breakTimes || []).filter(
    (row: BreakTimeRow) => row?.name && row?.startTime && Number(row.duration) > 0,
  )

  showStartTimesModal.value = false
  void regenerateTimeSlots()
}

function buildSlotsFromDay(
  defaultDuration: number,
  firstClass: string,
  schoolEnd: string,
  breaks: BreakTimeRow[],
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = []
  const endMins = timeToMinutes(schoolEnd)
  let cursor = timeToMinutes(firstClass)
  const sortedBreaks = [...breaks]
    .map((b) => ({
      name: b.name,
      startTime: b.startTime,
      duration: Number(b.duration) || 0,
      startMins: timeToMinutes(b.startTime),
    }))
    .filter((b) => b.duration > 0 && b.startMins >= cursor && b.startMins < endMins)
    .sort((a, b) => a.startMins - b.startMins)

  let slotId = 1
  let guard = 0
  while (cursor < endMins && guard < 200) {
    guard++
    const breakHere = sortedBreaks.find((b) => b.startMins === cursor)
    if (breakHere) {
      slots.push({
        id: String(slotId++),
        startTime: minutesToTime(cursor),
        duration: breakHere.duration,
        kind: 'break',
        name: breakHere.name,
      })
      cursor += breakHere.duration
      continue
    }

    const nextBreak = sortedBreaks.find((b) => b.startMins > cursor)
    const classEnd = cursor + defaultDuration

    if (nextBreak && nextBreak.startMins < classEnd) {
      if (nextBreak.startMins <= cursor) {
        cursor = nextBreak.startMins
        continue
      }
      // Gap before break is shorter than a full class — jump to break
      cursor = nextBreak.startMins
      continue
    }

    if (classEnd <= endMins) {
      slots.push({
        id: String(slotId++),
        startTime: minutesToTime(cursor),
        duration: defaultDuration,
        kind: 'class',
      })
      cursor = classEnd
      continue
    }

    break
  }

  return slots
}

const regenerateTimeSlots = async () => {
  const defaultDuration = defaultDurationMinutes.value
  if (!defaultDuration) {
    error.value = t('classSettings.durations.defaultRequired')
    generatedTimeSlots.value = []
    persistClassSettingsLocal()
    return
  }

  try {
    generatedTimeSlots.value = buildSlotsFromDay(
      defaultDuration,
      firstClassTime.value,
      schoolEndTime.value,
      breakTimes.value,
    )
    persistClassSettingsLocal()
  } catch (err: any) {
    console.error('Error regenerating time slots:', err)
    generatedTimeSlots.value = buildSlotsFromDay(
      defaultDuration,
      firstClassTime.value,
      schoolEndTime.value,
      breakTimes.value,
    )
    persistClassSettingsLocal()
  }
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  if (!(event.target as Element).closest('.relative')) {
    activeYearDropdown.value = null
    activeSemesterDropdown.value = null
    activeDurationDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadAcademicYears()
  await loadClassSettings()
  await loadSchoolInfo()
  if (!generatedTimeSlots.value.length && defaultDurationMinutes.value) {
    await regenerateTimeSlots()
  }
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

