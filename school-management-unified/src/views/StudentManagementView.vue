<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('studentManagement.title')"
        :subtitle="$t('studentManagement.description')"
      />

      <div
        v-if="exportFilterLines.length"
        class="flex flex-wrap items-center gap-2"
      >
        <span class="text-xs font-semibold text-fikr-ink-soft">{{ $t('studentManagement.appliedFilters') }}:</span>
        <span
          v-for="(row, idx) in exportFilterLines"
          :key="idx"
          class="inline-flex items-center rounded-full bg-fikr-pearl px-2.5 py-0.5 text-xs text-fikr-ink ring-1 ring-fikr-hairline"
        >
          <span class="font-medium">{{ row.label }}:</span>
          <span class="ms-0.5 max-w-[220px] truncate" :title="row.value">{{ row.value }}</span>
        </span>
      </div>

      <div
        v-if="error"
        class="fk-alert fk-alert--error"
        role="alert"
      >
        {{ error }}
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('studentManagement.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('studentManagement.studentsCount', { count: filteredStudents.length }) }}
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
              <div class="relative" data-export-menu>
                <button
                  type="button"
                  class="fk-iconbtn"
                  :aria-label="$t('studentManagement.exportMenu')"
                  :aria-expanded="showExportMenu"
                  aria-haspopup="true"
                  @click="toggleExportMenu"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <div
                  v-if="showExportMenu"
                  role="menu"
                  class="absolute end-0 z-30 mt-1 w-44 rounded-md border border-gray-200 bg-white py-1 text-start shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="onExport('word')"
                  >
                    <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-sky-100 text-[10px] font-bold text-sky-800">W</span>
                    {{ $t('studentManagement.exportAsWord') }}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="onExport('pdf')"
                  >
                    <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-red-100 text-[10px] font-bold text-red-800">PDF</span>
                    {{ $t('studentManagement.exportAsPdf') }}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="onExport('excel')"
                  >
                    <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-[10px] font-bold text-emerald-800">XLS</span>
                    {{ $t('studentManagement.exportAsExcel') }}
                  </button>
                </div>
              </div>
              <ListViewModeToggle v-model="viewMode" />
              <router-link
                v-if="canCreateStudent"
                to="/students/register"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="$t('studentManagement.addStudent')"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </router-link>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <p
            v-else-if="students.length && !filteredStudents.length"
            class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
          >
            {{ $t('studentManagement.noStudentFilterResults') }}
          </p>

          <template v-else-if="filteredStudents.length">
            <div v-if="isCards" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="student in filteredStudents"
                :key="student.id"
                class="relative rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-colors hover:border-primary-200"
              >
                <div class="flex items-start gap-2.5">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                    {{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-sm font-semibold text-gray-900">
                          {{ student.firstName }} {{ student.lastName }}
                        </h3>
                        <span
                          class="mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          :class="getStudentStatus(student) === 'active'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'"
                        >
                          {{ getStudentStatus(student) === 'active' ? $t('studentManagement.active') : $t('studentManagement.inactive') }}
                        </span>
                      </div>
                      <RowActionsMenu
                        :open="activeMenuId === student.id"
                        placement="up"
                        @toggle="toggleMenu(student.id)"
                      >
                        <RowActionsItem icon="view" @click="onViewStudent(student)">
                          {{ $t('studentManagement.studentCardTitle') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canEditStudent"
                          icon="edit"
                          @click="onEditStudent(student)"
                        >
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canEditStudent && (!student.groups || student.groups.length === 0)"
                          icon="group"
                          @click="onAssignToGroup(student)"
                        >
                          {{ $t('studentManagement.assignToGroup') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canEditStudent && (!student.buses || student.buses.length === 0)"
                          icon="bus"
                          @click="onAssignToBus(student)"
                        >
                          {{ $t('studentManagement.assignToBus') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canEditStudent && (!student.parents || student.parents.length === 0)"
                          icon="parent"
                          @click="onCreateParent(student)"
                        >
                          {{ $t('studentManagement.createParent') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </div>
                  </div>
                </div>
                <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('studentManagement.age') }}</dt>
                    <dd class="truncate font-medium text-gray-800">{{ calculateAge(student.dateOfBirth) }} {{ $t('studentManagement.years') }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('studentManagement.group') }}</dt>
                    <dd class="truncate font-medium text-gray-800">{{ getStudentGroup(student) }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('studentManagement.bus') }}</dt>
                    <dd class="truncate font-medium text-gray-800">{{ getStudentBusTitles(student) }}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-gray-400">{{ $t('studentManagement.parent') }}</dt>
                    <dd class="truncate font-medium text-gray-800">{{ getParentName(student) }}</dd>
                  </div>
                </dl>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('studentManagement.studentNameCol') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('studentManagement.age') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('studentManagement.group') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('studentManagement.bus') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('studentManagement.parent') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('studentManagement.statusLabel') }}</th>
                    <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="student in filteredStudents"
                    :key="'list-' + student.id"
                    class="hover:bg-primary-50/20"
                  >
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ student.firstName }} {{ student.lastName }}</div>
                      <div class="mt-0.5 font-mono text-[11px] text-gray-400">{{ student.id.substring(0, 8) }}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-gray-700">
                      {{ calculateAge(student.dateOfBirth) }} {{ $t('studentManagement.years') }}
                    </td>
                    <td class="px-4 py-3 text-gray-700">{{ getStudentGroup(student) }}</td>
                    <td class="px-4 py-3 text-gray-700">{{ getStudentBusTitles(student) }}</td>
                    <td class="px-4 py-3 text-gray-700">{{ getParentName(student) }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        :class="getStudentStatus(student) === 'active'
                          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20'
                          : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/15'"
                      >
                        {{ getStudentStatus(student) === 'active' ? $t('studentManagement.active') : $t('studentManagement.inactive') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === student.id"
                          placement="up"
                          @toggle="toggleMenu(student.id)"
                        >
                          <RowActionsItem icon="view" @click="onViewStudent(student)">
                            {{ $t('studentManagement.studentCardTitle') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="canEditStudent"
                            icon="edit"
                            @click="onEditStudent(student)"
                          >
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="canEditStudent && (!student.groups || student.groups.length === 0)"
                            icon="group"
                            @click="onAssignToGroup(student)"
                          >
                            {{ $t('studentManagement.assignToGroup') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="canEditStudent && (!student.buses || student.buses.length === 0)"
                            icon="bus"
                            @click="onAssignToBus(student)"
                          >
                            {{ $t('studentManagement.assignToBus') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="canEditStudent && (!student.parents || student.parents.length === 0)"
                            icon="parent"
                            @click="onCreateParent(student)"
                          >
                            {{ $t('studentManagement.createParent') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('studentManagement.noStudents') }}</p>
          </div>
        </div>
      </section>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('studentManagement.filtersTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('studentManagement.filtersTitle') }}</h3>
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
            <label class="fk-flabel" for="students-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="students-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('studentManagement.searchPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="students-group"><span>{{ $t('studentManagement.group') }}</span></label>
            <select
              id="students-group"
              v-model="selectedGroup"
              class="fk-field"
            >
              <option value="">{{ $t('studentManagement.allGroups') }}</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="students-bus"><span>{{ $t('studentManagement.bus') }}</span></label>
            <select
              id="students-bus"
              v-model="selectedBusFilter"
              class="fk-field"
            >
              <option value="">{{ $t('studentManagement.allBuses') }}</option>
              <option v-for="bus in buses" :key="bus.id" :value="bus.id">{{ bus.title }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="students-status"><span>{{ $t('studentManagement.statusLabel') }}</span></label>
            <select
              id="students-status"
              v-model="selectedStatus"
              class="fk-field"
            >
              <option value="">{{ $t('studentManagement.allStatuses') }}</option>
              <option value="active">{{ $t('studentManagement.active') }}</option>
              <option value="inactive">{{ $t('studentManagement.inactive') }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="students-age"><span>{{ $t('studentManagement.filterAgeGroup') }}</span></label>
            <select
              id="students-age"
              v-model="selectedAgeGroup"
              class="fk-field"
            >
              <option value="">{{ $t('studentManagement.allAgeGroups') }}</option>
              <option value="toddlers">{{ $t('studentManagement.toddlers') }}</option>
              <option value="preschool">{{ $t('studentManagement.preschool') }}</option>
              <option value="kindergarten">{{ $t('studentManagement.kindergarten') }}</option>
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

      <!-- Student card (view): fills popup; print/close as small icons -->
      <div
        v-if="showModal && modalMode === 'view' && selectedStudent"
        class="fk-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('studentManagement.studentCardTitle')"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="fk-modal__backdrop" @click="closeModal" />
        <div class="relative mx-auto my-6 w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-card bg-white shadow-product sm:my-12">
          <div id="student-view-card">
            <StudentIdCard
              :dir="isRTL ? 'rtl' : 'ltr'"
              :school-name="schoolName"
              :school-logo="schoolLogoSrc"
              :full-name="studentDisplayName(selectedStudent)"
              :photo="selectedStudent.photo"
              :student-id="selectedStudent.studentId"
              :date-of-birth-label="selectedStudent.dateOfBirth ? formatDate(selectedStudent.dateOfBirth) : ''"
              :gender-label="studentGenderLabel(selectedStudent)"
              :group-label="getStudentGroup(selectedStudent)"
              :bus-label="getStudentBusTitles(selectedStudent)"
              :parent-label="getParentName(selectedStudent)"
              :emergency-contact="selectedStudent.emergencyContact"
            />
          </div>
          <div class="flex items-center justify-end gap-1 border-t border-gray-100 px-3 py-2.5">
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary-800 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              :aria-label="$t('studentManagement.printStudentCard')"
              @click="printStudentCard"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              :aria-label="$t('common.close')"
              @click="closeModal"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <FikrDialog
        :show="showModal && modalMode === 'edit'"
        plain-footer
        size="lg"
        :title="$t('studentManagement.editStudent')"
        :subtitle="$t('studentManagement.editStudentDescription')"
        @close="closeModal"
      >
                  <div v-if="selectedStudent" class="space-y-6">
                    <!-- EDIT MODE -->
                    <div class="space-y-4">
                      <!-- Student Photo - Edit Mode -->
                      <div class="text-center">
                        <div class="relative inline-block">
                          <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-lg">
                            <img v-if="studentForm.photo" :src="studentForm.photo" alt="Student Photo" class="w-full h-full object-cover" />
                            <svg v-else class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            @click="$refs.photoInput.click()"
                            class="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-110"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <input
                            ref="photoInput"
                            type="file"
                            accept="image/*"
                            @change="handlePhotoUpload"
                            class="hidden"
                          />
                        </div>
                        <p class="text-xs text-gray-600 mt-2">{{ $t('students.photoDescription') }}</p>
                      </div>

                      <!-- Student Basic Info - Edit Mode -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.firstName') }} *</label>
                          <input
                            v-model="studentForm.firstName"
                            type="text"
                            required
                            class="fk-field"
                          />
                        </div>
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.secondName') }} *</label>
                          <input
                            v-model="studentForm.secondName"
                            type="text"
                            required
                            class="fk-field"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.thirdName') }}</label>
                          <input
                            v-model="studentForm.thirdName"
                            type="text"
                            class="fk-field"
                          />
                        </div>
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.familyName') }} *</label>
                          <input
                            v-model="studentForm.familyName"
                            type="text"
                            required
                            class="fk-field"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.dateOfBirth') }} *</label>
                          <input
                            v-model="studentForm.dateOfBirth"
                            type="date"
                            required
                            class="fk-field"
                          />
                        </div>
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.gender') }} *</label>
                          <select
                            v-model="studentForm.gender"
                            required
                            class="fk-field"
                          >
                            <option value="">{{ $t('students.selectGender') }}</option>
                            <option value="male">{{ $t('students.male') }}</option>
                            <option value="female">{{ $t('students.female') }}</option>
                          </select>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.studentId') }}</label>
                          <input
                            v-model="studentForm.studentId"
                            type="text"
                            class="fk-field"
                          />
                          <p class="text-xs text-gray-500 mt-1">{{ $t('students.studentIdNote') }}</p>
                        </div>
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.nationality') }} *</label>
                          <select
                            v-model="studentForm.nationality"
                            required
                            class="fk-field"
                          >
                            <option value="">{{ $t('students.selectNationality') }}</option>
                            <option value="omani">{{ $t('students.omani') }}</option>
                            <option value="expat">{{ $t('students.expat') }}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.medicalConditions') }}</label>
                        <textarea
                          v-model="studentForm.medicalConditions"
                          rows="3"
                          class="fk-field resize-none"
                          :placeholder="$t('students.medicalConditionsPlaceholder')"
                        ></textarea>
                      </div>

                      <div>
                        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.emergencyContact') }}</label>
                        <input
                          v-model="studentForm.emergencyContact"
                          type="text"
                          class="fk-field"
                        />
                      </div>

                      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.phone') }}</label>
                          <input v-model="studentForm.phone" type="tel" class="fk-field" />
                        </div>
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.email') }}</label>
                          <input v-model="studentForm.email" type="email" class="fk-field" />
                        </div>
                      </div>

                      <div>
                        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.address') }}</label>
                        <input v-model="studentForm.address" type="text" class="fk-field" />
                      </div>

                      <div>
                        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.notes') }}</label>
                        <textarea v-model="studentForm.notes" rows="3" class="fk-field resize-none"></textarea>
                      </div>
                    </div>

                    <template v-if="modalMode === 'edit'">
                    <!-- Enhanced Group Section -->
                    <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h4 class="text-sm font-semibold text-purple-800">{{ $t('studentManagement.groupAssignment') }}</h4>
                      </div>
                      <div class="bg-white rounded-lg p-3 border border-purple-100">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ getStudentGroup(selectedStudent) }}</p>
                            <p class="text-xs text-gray-500 mt-1">{{ $t('studentManagement.currentGroup') }}</p>
                          </div>
                          <div v-if="modalMode === 'edit'" class="flex gap-2">
                            <button
                              @click="assignToGroup(selectedStudent)"
                              class="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors duration-200"
                            >
                              {{ $t('studentManagement.changeGroup') }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Bus (transport) -->
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v7m0 0v4m0-4h8m-8 0H5m3-7h6m-6 0a2 2 0 00-2 2v1h12V9a2 2 0 00-2-2h-1M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1" />
                          </svg>
                        </div>
                        <h4 class="text-sm font-semibold text-amber-900">{{ $t('studentManagement.busAssignment') }}</h4>
                      </div>
                      <div class="bg-white rounded-lg p-3 border border-amber-100">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ getStudentBusTitles(selectedStudent) }}</p>
                            <p class="text-xs text-gray-500 mt-1">{{ $t('studentManagement.currentBus') }}</p>
                          </div>
                          <div v-if="modalMode === 'edit'" class="flex gap-2">
                            <button
                              type="button"
                              @click="assignToBus(selectedStudent)"
                              class="px-3 py-1.5 bg-amber-100 text-amber-900 text-xs rounded-lg hover:bg-amber-200 transition-colors duration-200"
                            >
                              {{ $t('studentManagement.changeBus') }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Enhanced Parent Section -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <h4 class="text-sm font-semibold text-green-800">{{ $t('studentManagement.parentInformation') }}</h4>
                      </div>
                      <div class="bg-white rounded-lg p-3 border border-green-100">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ getParentName(selectedStudent) }}</p>
                            <p class="text-xs text-gray-500 mt-1">{{ $t('studentManagement.guardianContact') }}</p>
                          </div>
                          <div v-if="modalMode === 'edit'" class="flex gap-2">
                            <button
                              @click="manageParents(selectedStudent)"
                              class="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors duration-200"
                            >
                              {{ $t('studentManagement.manageParents') }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    </template>
                  </div>
        <template #footer>
            <button type="button" class="fk-btn fk-btn--pearl" @click="closeModal">
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              @click="saveStudent"
            >
              {{ $t('common.save') }}
            </button>
        </template>
      </FikrDialog>

      <FikrDialog
        :show="showAssignModal"
        plain-footer
        :title="$t('studentManagement.assignToGroup')"
        @close="closeAssignModal"
      >
        <div v-if="assigningStudent" class="space-y-4">
          <p class="text-sm text-fikr-ink-soft">
            {{ $t('studentManagement.assignStudentToGroup', { name: `${assigningStudent.firstName} ${assigningStudent.lastName}` }) }}
          </p>
          <div class="fk-form__row">
            <label class="fk-flabel" for="assign-group"><span>{{ $t('studentManagement.selectGroup') }}</span></label>
            <select
              id="assign-group"
              v-model="selectedGroupForAssign"
              class="fk-field"
            >
              <option value="">{{ $t('studentManagement.selectGroup') }}</option>
              <option v-for="group in groupsForAssignList" :key="group.id" :value="group.id">
                {{ group.name }} ({{ group.capacity }})
              </option>
            </select>
          </div>
          <div v-if="selectedGroupForAssign && paymentLevelsForAssign.length" class="fk-form__row">
            <label class="fk-flabel" for="assign-fee-level"><span>{{ $t('studentManagement.feeLevel') }}</span></label>
            <select
              id="assign-fee-level"
              v-model="selectedPaymentLevelForAssign"
              class="fk-field"
            >
              <option value="">{{ $t('studentManagement.selectFeeLevel') }}</option>
              <option v-for="lv in paymentLevelsForAssign" :key="lv.id" :value="lv.id">
                {{ lv.code }} — {{ lv.name }}
              </option>
            </select>
            <p class="fk-form__hint">{{ $t('studentManagement.groupsFilteredByLevel') }}</p>
          </div>
        </div>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="closeAssignModal">
            {{ $t('common.cancel') }}
          </button>
          <button
            type="button"
            class="fk-btn fk-btn--primary"
            :disabled="!selectedGroupForAssign || (paymentLevelsForAssign.length > 0 && !selectedPaymentLevelForAssign)"
            @click="confirmAssignToGroup"
          >
            {{ $t('studentManagement.assign') }}
          </button>
        </template>
      </FikrDialog>

      <FikrDialog
        :show="showAssignBusModal"
        plain-footer
        :title="$t('studentManagement.assignToBus')"
        @close="closeAssignBusModal"
      >
        <div v-if="assigningStudentForBus" class="space-y-4">
          <p class="text-sm text-fikr-ink-soft">
            {{ $t('studentManagement.assignStudentToBus', { name: `${assigningStudentForBus.firstName} ${assigningStudentForBus.lastName}` }) }}
          </p>
          <div class="fk-form__row">
            <label class="fk-flabel" for="assign-bus"><span>{{ $t('studentManagement.selectBus') }}</span></label>
            <select
              id="assign-bus"
              v-model="selectedBusForAssign"
              class="fk-field"
            >
              <option value="">{{ $t('studentManagement.selectBus') }}</option>
              <option v-for="bus in buses" :key="bus.id" :value="bus.id">
                {{ bus.title }} ({{ busRosterCount(bus) }}/{{ bus.capacity }})
              </option>
            </select>
          </div>
        </div>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="closeAssignBusModal">
            {{ $t('common.cancel') }}
          </button>
          <button
            type="button"
            class="fk-btn fk-btn--primary"
            :disabled="!selectedBusForAssign"
            @click="confirmAssignToBus"
          >
            {{ $t('studentManagement.assign') }}
          </button>
        </template>
      </FikrDialog>

      <FikrDialog
        :show="showParentManagementModal"
        plain-footer
        size="md"
        :title="$t('studentManagement.manageParents')"
        @close="closeParentManagementModal"
      >
              <p v-if="managingParentsFor" class="mb-4 text-sm text-gray-500">
                {{ managingParentsFor.firstName }} {{ managingParentsFor.lastName }}
              </p>

              <div v-if="parentActionError" class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ parentActionError }}
              </div>

              <div class="border-b border-gray-200 mb-6">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    v-if="managingParentsFor"
                    @click="parentModalTab = 'linked'"
                    :class="[
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                      parentModalTab === 'linked'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    {{ $t('studentManagement.linkedParents') }} ({{ linkedParents.length }})
                  </button>
                  <button
                    @click="parentModalTab = 'select'"
                    :class="[
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                      parentModalTab === 'select'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    {{ $t('studentManagement.selectExistingParent') }}
                  </button>
                  <button
                    @click="parentModalTab = 'create'"
                    :class="[
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                      parentModalTab === 'create'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    {{ $t('studentManagement.createNewParent') }}
                  </button>
                </nav>
              </div>

              <!-- Select Existing Parent Tab -->
              <!-- Linked Parents Tab -->
              <div v-if="parentModalTab === 'linked'" class="space-y-4">
                <div v-if="loadingLinkedParents" class="py-6 text-center">
                  <div class="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-primary-600"></div>
                  <p class="mt-2 text-sm text-gray-600">{{ $t('common.loading') }}...</p>
                </div>

                <div v-else-if="linkedParents.length === 0" class="py-8 text-center">
                  <h3 class="text-sm font-medium text-gray-900">{{ $t('studentManagement.noLinkedParents') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ $t('studentManagement.noLinkedParentsDescription') }}</p>
                </div>

                <div v-else class="max-h-64 space-y-2 overflow-y-auto">
                  <div
                    v-for="parent in linkedParents"
                    :key="parent.id"
                    class="rounded-lg border border-gray-200 p-3"
                    :class="{
                      'bg-primary-50 ring-2 ring-primary-500': editingParent?.id === parent.id,
                      'bg-amber-50 ring-2 ring-amber-400': resettingPasswordFor?.id === parent.id,
                    }"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <h4 class="text-sm font-medium text-gray-900">{{ parent.firstName }} {{ parent.lastName }}</h4>
                        <p v-if="parent.email" class="truncate text-sm text-gray-500">{{ parent.email }}</p>
                        <p v-if="parent.phone" class="text-sm text-gray-500">{{ parent.phone }}</p>
                        <p v-if="parent.address" class="truncate text-xs text-gray-400">{{ parent.address }}</p>
                      </div>
                      <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="startEditParent(parent)">
                          {{ $t('common.edit') }}
                        </button>
                        <button
                          v-if="canResetParentPassword && parentHasAccount(parent)"
                          type="button"
                          class="rounded px-2 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100"
                          @click="startResetPassword(parent)"
                        >
                          {{ $t('studentManagement.resetPassword') }}
                        </button>
                        <span
                          v-else-if="canResetParentPassword"
                          class="px-2 py-1 text-xs text-gray-400"
                          :title="$t('studentManagement.noLoginAccountHint')"
                        >
                          {{ $t('studentManagement.noLoginAccount') }}
                        </span>
                        <button
                          type="button"
                          class="rounded px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100"
                          @click="unlinkParent(parent)"
                        >
                          {{ $t('studentManagement.unlinkParent') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="passwordResetSuccess"
                  class="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
                >
                  {{ passwordResetSuccess }}
                </div>

                <!-- Reset a linked parent's login password -->
                <div v-if="resettingPasswordFor" class="space-y-4 border-t border-gray-200 pt-4">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-gray-800">
                      {{ $t('studentManagement.resetPasswordFor', {
                        name: `${resettingPasswordFor.firstName} ${resettingPasswordFor.lastName}`
                      }) }}
                    </h4>
                    <button type="button" class="text-xs text-gray-500 hover:text-gray-700" @click="cancelResetPassword">
                      {{ $t('common.cancel') }}
                    </button>
                  </div>

                  <p class="text-xs text-gray-500">{{ $t('studentManagement.resetPasswordHint') }}</p>

                  <div v-if="passwordResetError" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {{ passwordResetError }}
                  </div>

                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.newPassword') }}</label>
                      <input v-model="passwordForm.newPassword" type="password" autocomplete="new-password" class="fk-field" />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.confirmPassword') }}</label>
                      <input v-model="passwordForm.confirmPassword" type="password" autocomplete="new-password" class="fk-field" />
                    </div>
                  </div>

                  <button
                    type="button"
                    class="fk-btn fk-btn--primary"
                    :disabled="resettingPassword"
                    @click="confirmResetPassword"
                  >
                    {{ $t('studentManagement.resetPassword') }}
                  </button>
                </div>

                <!-- Edit linked parent -->
                <div v-if="editingParent" class="space-y-4 border-t border-gray-200 pt-4">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-gray-800">{{ $t('studentManagement.editParent') }}</h4>
                    <button type="button" class="text-xs text-gray-500 hover:text-gray-700" @click="cancelEditParent">
                      {{ $t('common.cancel') }}
                    </button>
                  </div>
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.firstName') }}</label>
                      <input v-model="parentForm.firstName" type="text" class="fk-field" />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.lastName') }}</label>
                      <input v-model="parentForm.lastName" type="text" class="fk-field" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.email') }}</label>
                      <input v-model="parentForm.email" type="email" class="fk-field" />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.phone') }}</label>
                      <input v-model="parentForm.phone" type="tel" class="fk-field" />
                    </div>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.address') }}</label>
                    <textarea v-model="parentForm.address" rows="2" class="fk-field"></textarea>
                  </div>
                  <button type="button" class="fk-btn fk-btn--primary" @click="confirmParentAction">
                    {{ $t('common.save') }}
                  </button>
                </div>
              </div>

              <div v-if="parentModalTab === 'select'" class="space-y-4">
                <!-- Search Field -->
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="parentSearchQuery"
                    @input="searchParents"
                    type="text"
                    :placeholder="$t('studentManagement.searchParents')"
                    class="fk-field ps-10"
                  />
                </div>

                <!-- Search Results -->
                <div class="max-h-64 overflow-y-auto">
                  <div v-if="searchingParents" class="text-center py-4">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <p class="mt-2 text-gray-600 text-sm">{{ $t('common.loading') }}...</p>
                  </div>

                  <div v-else-if="searchedParents.length === 0 && parentSearchQuery" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('studentManagement.noParentsFound') }}</h3>
                    <p class="mt-1 text-sm text-gray-500">{{ $t('studentManagement.noParentsFoundDescription') }}</p>
                  </div>

                  <div v-else-if="searchedParents.length > 0" class="space-y-2">
                    <div
                      v-for="parent in searchedParents"
                      :key="parent.id"
                      @click="selectParent(parent)"
                      class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      :class="{ 'ring-2 ring-primary-500 bg-primary-50': selectedParent?.id === parent.id }"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h4 class="text-sm font-medium text-gray-900">{{ parent.firstName }} {{ parent.lastName }}</h4>
                          <p v-if="parent.email" class="text-sm text-gray-500">{{ parent.email }}</p>
                          <p v-if="parent.phone" class="text-sm text-gray-500">{{ parent.phone }}</p>
                        </div>
                        <div v-if="selectedParent?.id === parent.id" class="text-primary-600">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('studentManagement.searchParentDatabase') }}</h3>
                    <p class="mt-1 text-sm text-gray-500">{{ $t('studentManagement.searchParents') }}</p>
                  </div>
                </div>
              </div>

              <!-- Create New Parent Tab -->
              <div v-if="parentModalTab === 'create'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.firstName') }}</label>
                    <input
                      v-model="parentForm.firstName"
                      type="text"
                      class="fk-field"
                      :placeholder="$t('studentManagement.firstName')"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.lastName') }}</label>
                    <input
                      v-model="parentForm.lastName"
                      type="text"
                      class="fk-field"
                      :placeholder="$t('studentManagement.lastName')"
                    />
                  </div>
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.email') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <input
                    v-model="parentForm.email"
                    type="email"
                    class="fk-field"
                    :placeholder="$t('studentManagement.email')"
                  />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.phone') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <input
                    v-model="parentForm.phone"
                    type="tel"
                    class="fk-field"
                    :placeholder="$t('studentManagement.phone')"
                  />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('studentManagement.address') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <textarea
                    v-model="parentForm.address"
                    rows="3"
                    class="fk-field"
                    :placeholder="$t('studentManagement.address')"
                  ></textarea>
                </div>
              </div>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="closeParentManagementModal">
            {{ $t('common.close') }}
          </button>
          <button
            v-if="parentModalTab !== 'linked'"
            type="button"
            class="fk-btn fk-btn--primary"
            :disabled="!canConfirmParentAction || loading"
            @click="confirmParentAction"
          >
            {{ parentModalTab === 'select' ? $t('studentManagement.assignParent') : $t('common.create') }}
          </button>
        </template>
      </FikrDialog>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useClaims } from '@/composables/useClaims'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import StudentIdCard from '@/components/StudentIdCard.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useSchoolBrand } from '@/composables/useSchoolBrand'
import { authService } from '@/services'
import { studentService, type Student } from '@/services/student.service'
import { groupService, type Group } from '@/services/group.service'
import { busService, type Bus } from '@/services/bus.service'
import { parentService, type Parent } from '@/services/parent.service'
import paymentConfigService from '@/services/payment-config.service'
import type { SchoolPaymentLevel } from '@/services/payment-config.service'

const { locale, t } = useI18n()
const router = useRouter()
const { hasClaim, loadClaims } = useClaims()
const { viewMode, isCards } = useListViewMode()
const { load: loadSchoolBrand, schoolName, logoSrc: schoolLogoSrc } = useSchoolBrand()
const isRTL = computed(() => locale.value === 'ar')
/** Row / toolbar mutations — hidden when the group lacks students:edit. */
const canEditStudent = computed(() => hasClaim('students', 'edit'))
const canCreateStudent = computed(
  () => hasClaim('student_register', 'create') || hasClaim('students', 'create'),
)
const showFilters = ref(false)
const showExportMenu = ref(false)
const activeMenuId = ref<string | null>(null)

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeFilenameSegment(name: string): string {
  return String(name || 'students')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .trim()
    .slice(0, 80) || 'students'
}

function applyRtlToExcel(wb: XLSX.WorkBook, ws: XLSX.WorkSheet, rtl: boolean) {
  if (!rtl) return
  ;(ws as XLSX.WorkSheet & { '!views'?: { RTL?: boolean }[] })['!views'] = [{ RTL: true }]
}

// Reactive data
const searchQuery = ref('')
const selectedGroup = ref('')
const selectedBusFilter = ref('')
const selectedStatus = ref('')
const selectedAgeGroup = ref('')
const loading = ref(true)
const error = ref('')

// Real data from API
const groups = ref<Group[]>([])
const buses = ref<Bus[]>([])
const students = ref<Student[]>([])

// Modal state
const showModal = ref(false)
const showAssignModal = ref(false)
const showAssignBusModal = ref(false)
const showParentManagementModal = ref(false)
const modalMode = ref<'view' | 'edit'>('view')
const selectedStudent = ref<Student | null>(null)
const assigningStudent = ref<Student | null>(null)
const assigningStudentForBus = ref<Student | null>(null)
const selectedGroupForAssign = ref('')
const selectedBusForAssign = ref('')
const paymentLevelsForAssign = ref<SchoolPaymentLevel[]>([])
const selectedPaymentLevelForAssign = ref('')
const groupsForAssignList = ref<Group[]>([])

// Parent management state
const parentModalTab = ref<'linked' | 'select' | 'create'>('linked')
const managingParentsFor = ref<Student | null>(null)
const linkedParents = ref<Parent[]>([])
const loadingLinkedParents = ref(false)
const editingParent = ref<Parent | null>(null)
const parentActionError = ref('')
const resettingPasswordFor = ref<Parent | null>(null)
const passwordForm = ref({ newPassword: '', confirmPassword: '' })
const passwordResetError = ref('')
const passwordResetSuccess = ref('')
const resettingPassword = ref(false)
const parentSearchQuery = ref('')
const searchingParents = ref(false)
const searchedParents = ref<Parent[]>([])
const selectedParent = ref<Parent | null>(null)

// Form data
const studentForm = ref({
  photo: null,
  firstName: '',
  secondName: '',
  thirdName: '',
  familyName: '',
  dateOfBirth: '',
  gender: 'male' as 'male' | 'female',
  studentId: '',
  nationality: '',
  medicalConditions: '',
  emergencyContact: '',
  address: '',
  phone: '',
  email: '',
  notes: ''
})

const parentForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: ''
})

// Load data from API
const loadStudents = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await studentService.getAll()
    students.value = response || []
  } catch (err: unknown) {
    console.error('Error loading students:', err)
    const ax = err as { code?: string; message?: string; response?: { data?: { message?: string } } }
    const detail =
      ax.response?.data?.message ||
      (ax.code === 'ECONNABORTED' ? t('studentManagement.loadTimeout') : ax.message) ||
      t('studentManagement.loadFailed')
    error.value = detail
    students.value = []
  } finally {
    loading.value = false
  }
}

const loadGroups = async () => {
  try {
    // Load only active groups
    const response = await groupService.getActive(schoolId.value)
    groups.value = response || []
  } catch (err) {
    console.error('Error loading groups:', err)
    groups.value = []
  }
}

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: string } | null
  return Number(u?.school_id ?? 1)
})

watch(selectedGroupForAssign, (groupId) => {
  if (!groupId) {
    selectedPaymentLevelForAssign.value = ''
    return
  }
  const group = groupsForAssignList.value.find((g) => g.id === groupId)
  const groupLevelId = group?.level_id || ''
  if (groupLevelId && paymentLevelsForAssign.value.some((lv) => lv.id === groupLevelId)) {
    selectedPaymentLevelForAssign.value = groupLevelId
    return
  }
  const studentLevelId =
    (assigningStudent.value as Student & { payment_level_id?: string })?.payment_level_id
    || (assigningStudent.value as Student & { paymentLevel?: { id?: string } })?.paymentLevel?.id
    || ''
  selectedPaymentLevelForAssign.value =
    studentLevelId && paymentLevelsForAssign.value.some((lv) => lv.id === studentLevelId)
      ? studentLevelId
      : ''
})

const loadBuses = async () => {
  // Transportation is a separately licensed module; without it the API answers 403.
  if (!hasClaim('transportation')) {
    buses.value = []
    return
  }
  try {
    buses.value = await busService.getAll(schoolId.value)
  } catch (err) {
    console.error('Error loading buses:', err)
    buses.value = []
  }
}

// Computed properties
const calculateAge = (dateOfBirth: Date | string) => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

const getStudentGroup = (student: Student) => {
  if (!student.groups || student.groups.length === 0) {
    return t('studentManagement.noGroup') || 'No Group'
  }
  return student.groups.map(group => group.name).join(', ')
}

const getStudentBusTitles = (student: Student) => {
  if (!student.buses || student.buses.length === 0) {
    return t('studentManagement.noBus')
  }
  return student.buses
    .map((b) => (typeof b === 'object' && b && 'title' in b ? String((b as { title: string }).title) : ''))
    .filter(Boolean)
    .join(', ')
}

const busRosterCount = (bus: Bus) => bus.students?.length ?? 0

const getParentName = (student: Student) => {
  if (!student.parents || student.parents.length === 0) {
    return t('studentManagement.noParent') || 'No Parent'
  }
  return student.parents.map(parent => `${parent.firstName || parent.first_name || ''} ${parent.lastName || parent.last_name || ''}`).join(', ')
}

function studentDisplayName(student: Student) {
  return [student.firstName, student.secondName, student.thirdName, student.lastName]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
}

function studentGenderLabel(student: Student) {
  if (student.gender === 'male') return t('students.male')
  if (student.gender === 'female') return t('students.female')
  return ''
}

async function printStudentCard() {
  const el = document.querySelector('#student-view-card .student-id-card') as HTMLElement | null
  if (!el) return
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const url = canvas.toDataURL('image/png')
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(
    `<!DOCTYPE html><html><head><title>${studentDisplayName(selectedStudent.value!)}</title></head><body style="margin:0;display:flex;justify-content:center;padding:24px;background:#fff"><img src="${url}" alt="" style="max-width:100%;height:auto"></body></html>`,
  )
  win.document.close()
  win.focus()
  win.print()
}

const getStudentStatus = (student: Student): 'active' | 'inactive' => {
  const s = (student as unknown as { status?: string }).status
  if (s === 'inactive') return 'inactive'
  if (s === 'active') return 'active'
  if ((student as unknown as { isActive?: boolean }).isActive === false) return 'inactive'
  return 'active'
}

const studentMatchesAgeGroup = (student: Student, key: string) => {
  const age = calculateAge(student.dateOfBirth)
  if (key === 'toddlers') return age >= 3 && age <= 4
  if (key === 'preschool') return age >= 4 && age <= 5
  if (key === 'kindergarten') return age >= 5 && age <= 6
  return true
}

const filteredStudents = computed(() => {
  let filtered = students.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student =>
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      (student.email && student.email.toLowerCase().includes(query))
    )
  }

  if (selectedGroup.value) {
    filtered = filtered.filter(student =>
      student.groups && student.groups.some(group => group.id === selectedGroup.value)
    )
  }

  if (selectedBusFilter.value) {
    filtered = filtered.filter(student =>
      student.buses && student.buses.some((bus) => bus.id === selectedBusFilter.value)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(student => getStudentStatus(student) === selectedStatus.value)
  }

  if (selectedAgeGroup.value) {
    filtered = filtered.filter(student => studentMatchesAgeGroup(student, selectedAgeGroup.value))
  }

  return filtered
})

const exportFilterLines = computed(() => {
  const lines: { label: string; value: string }[] = []
  const q = searchQuery.value.trim()
  if (q) lines.push({ label: t('studentManagement.filterSearch'), value: q })
  if (selectedGroup.value) {
    const g = groups.value.find((x) => x.id === selectedGroup.value)
    lines.push({ label: t('studentManagement.filterGroup'), value: g?.name ?? String(selectedGroup.value) })
  }
  if (selectedBusFilter.value) {
    const b = buses.value.find((x) => x.id === selectedBusFilter.value)
    lines.push({ label: t('studentManagement.filterBus'), value: b?.title ?? String(selectedBusFilter.value) })
  }
  if (selectedStatus.value) {
    lines.push({
      label: t('studentManagement.filterStatus'),
      value: selectedStatus.value === 'active' ? t('studentManagement.active') : t('studentManagement.inactive'),
    })
  }
  if (selectedAgeGroup.value) {
    const ag = selectedAgeGroup.value as 'toddlers' | 'preschool' | 'kindergarten'
    lines.push({ label: t('studentManagement.filterAgeGroup'), value: t(`studentManagement.${ag}`) })
  }
  return lines
})

// Methods
const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      studentForm.value.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US')
}

const exportStamp = () => {
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return new Date().toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' })
}

const buildStudentExportRows = (): Student[] => filteredStudents.value

const buildExportTableHtml = () => {
  const ta = isRTL.value ? 'right' : 'left'
  const dir = isRTL.value ? 'rtl' : 'ltr'
  const rows = buildStudentExportRows()
    .map((student) => {
      const name = `${student.firstName} ${student.lastName}`
      const age = `${calculateAge(student.dateOfBirth)} ${t('studentManagement.years')}`
      const statusLabel =
        getStudentStatus(student) === 'active' ? t('studentManagement.active') : t('studentManagement.inactive')
      return `<tr>
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(age)}</td>
        <td>${escapeHtml(getStudentGroup(student))}</td>
        <td>${escapeHtml(getStudentBusTitles(student))}</td>
        <td>${escapeHtml(getParentName(student))}</td>
        <td>${escapeHtml(formatDate(student.createdAt))}</td>
        <td>${escapeHtml(statusLabel)}</td>
      </tr>`
    })
    .join('')

  const filterBlock =
    exportFilterLines.value.length === 0
      ? ''
      : `<div class="meta" style="margin-top:8px"><strong>${escapeHtml(t('studentManagement.appliedFilters'))}</strong><br/>${exportFilterLines.value
          .map((l) => `<div><strong>${escapeHtml(l.label)}</strong>: ${escapeHtml(l.value)}</div>`)
          .join('')}</div>`

  return `
    <style>
      * { box-sizing: border-box; }
      .wrap { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #111827; direction: ${dir}; }
      h1 { font-size: 18px; margin: 0 0 8px; font-weight: 700; text-align: ${ta}; }
      h2 { font-size: 14px; margin: 0 0 12px; font-weight: 500; color: #4b5563; text-align: ${ta}; }
      .meta { font-size: 12px; color: #374151; margin-bottom: 12px; line-height: 1.55; text-align: ${ta}; }
      .meta strong { color: #111827; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: ${ta}; }
      th { background: #f3f4f6; font-weight: 600; font-size: 11px; color: #4b5563; }
      tr:nth-child(even) td { background: #fafafa; }
    </style>
    <div class="wrap">
      <h1>${escapeHtml(t('studentManagement.title'))}</h1>
      <h2>${escapeHtml(t('studentManagement.exportReportSubtitle'))}</h2>
      <div class="meta">
        <div><strong>${escapeHtml(t('studentManagement.exportGeneratedAt'))}</strong>: ${escapeHtml(exportStamp())}</div>
      </div>
      ${filterBlock}
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t('studentManagement.exportStudentName'))}</th>
            <th>${escapeHtml(t('studentManagement.age'))}</th>
            <th>${escapeHtml(t('studentManagement.group'))}</th>
            <th>${escapeHtml(t('studentManagement.exportBus'))}</th>
            <th>${escapeHtml(t('studentManagement.parent'))}</th>
            <th>${escapeHtml(t('studentManagement.enrollmentDate'))}</th>
            <th>${escapeHtml(t('studentManagement.exportStatus'))}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}

function buildExcelRows(): (string | number)[][] {
  const rows: (string | number)[][] = []
  rows.push([t('studentManagement.title')])
  rows.push([t('studentManagement.exportReportSubtitle')])
  rows.push([`${t('studentManagement.exportGeneratedAt')}: ${exportStamp()}`])
  rows.push([])
  if (exportFilterLines.value.length) {
    rows.push([t('studentManagement.appliedFilters')])
    for (const line of exportFilterLines.value) {
      rows.push([line.label, line.value])
    }
    rows.push([])
  }
  rows.push([
    t('studentManagement.exportStudentName'),
    t('studentManagement.age'),
    t('studentManagement.group'),
    t('studentManagement.exportBus'),
    t('studentManagement.parent'),
    t('studentManagement.enrollmentDate'),
    t('studentManagement.exportStatus'),
  ])
  for (const student of buildStudentExportRows()) {
    const statusLabel =
      getStudentStatus(student) === 'active' ? t('studentManagement.active') : t('studentManagement.inactive')
    rows.push([
      `${student.firstName} ${student.lastName}`,
      `${calculateAge(student.dateOfBirth)} ${t('studentManagement.years')}`,
      getStudentGroup(student),
      getStudentBusTitles(student),
      getParentName(student),
      formatDate(student.createdAt),
      statusLabel,
    ])
  }
  return rows
}

const runExport = async (format: 'word' | 'pdf' | 'excel') => {
  if (buildStudentExportRows().length === 0) {
    window.alert(t('studentManagement.exportNoStudents'))
    return
  }

  const dateSeg = new Date().toISOString().slice(0, 10)

  if (format === 'excel') {
    const ws = XLSX.utils.aoa_to_sheet(buildExcelRows())
    const wb = XLSX.utils.book_new()
    applyRtlToExcel(wb, ws, isRTL.value)
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    const fname = `students_${sanitizeFilenameSegment(dateSeg)}.xlsx`
    XLSX.writeFile(wb, fname)
    return
  }

  const inner = buildExportTableHtml()

  if (format === 'word') {
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="${locale.value}"><head><meta charset="utf-8"><title>${escapeHtml(t('studentManagement.title'))}</title></head><body>${inner}</body></html>`
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_${sanitizeFilenameSegment(dateSeg)}.doc`
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  const host = document.createElement('div')
  host.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr')
  host.style.cssText =
    'position:fixed;left:-12000px;top:0;width:794px;padding:20px;background:#ffffff;z-index:-1;'
  host.innerHTML = inner
  document.body.appendChild(host)
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  try {
    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width
    let heightLeft = imgH
    let y = 0
    pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
    heightLeft -= pageH
    while (heightLeft > 0) {
      y -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
      heightLeft -= pageH
    }
    pdf.save(`students_${sanitizeFilenameSegment(dateSeg)}.pdf`)
  } catch (e) {
    console.error('Student PDF export failed:', e)
    window.alert(t('studentManagement.exportPdfFailed'))
  } finally {
    host.remove()
  }
}

const hasActiveFilters = computed(() =>
  Boolean(
    searchQuery.value.trim()
    || selectedGroup.value
    || selectedBusFilter.value
    || selectedStatus.value
    || selectedAgeGroup.value,
  ),
)

function clearFilters() {
  searchQuery.value = ''
  selectedGroup.value = ''
  selectedBusFilter.value = ''
  selectedStatus.value = ''
  selectedAgeGroup.value = ''
}

function toggleMenu(id: string) {
  showExportMenu.value = false
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenu() {
  activeMenuId.value = null
}

function toggleExportMenu() {
  closeMenu()
  showExportMenu.value = !showExportMenu.value
}

function onExport(format: 'word' | 'pdf' | 'excel') {
  showExportMenu.value = false
  void runExport(format)
}

function handleClickOutside(event: Event) {
  const target = event.target as Element
  if (activeMenuId.value && !target.closest('.relative')) {
    closeMenu()
  }
  if (showExportMenu.value && !target.closest('[data-export-menu]')) {
    showExportMenu.value = false
  }
}

const viewStudent = (student: Student) => {
  showStudentModal(student, 'view')
}

const editStudent = (student: Student) => {
  void router.push(`/students/${student.id}/edit`)
}

const assignToGroup = (student: Student) => {
  showAssignGroupModal(student)
}

const assignToBus = (student: Student) => {
  assigningStudentForBus.value = student
  selectedBusForAssign.value = ''
  showAssignBusModal.value = true
}

function onViewStudent(student: Student) {
  closeMenu()
  viewStudent(student)
}

function onEditStudent(student: Student) {
  closeMenu()
  editStudent(student)
}

function onAssignToGroup(student: Student) {
  closeMenu()
  assignToGroup(student)
}

function onAssignToBus(student: Student) {
  closeMenu()
  assignToBus(student)
}

function onCreateParent(student: Student) {
  closeMenu()
  createParent(student)
}

// Modal functions
/** Stored nationality is free text in places; the select only knows these two codes. */
const NATIONALITY_ALIASES: Record<string, string> = {
  'عماني': 'omani',
  'عمانية': 'omani',
  omani: 'omani',
  Omani: 'omani',
  'مقيم': 'expat',
  'مقيمة': 'expat',
  'غير عماني': 'expat',
  expat: 'expat',
  Expat: 'expat',
}
const normaliseNationality = (value?: string | null) =>
  value ? NATIONALITY_ALIASES[value.trim()] ?? '' : ''

const showStudentModal = (student: Student, mode: 'view' | 'edit') => {
  selectedStudent.value = student
  modalMode.value = mode

  // Initialize form with student data
  studentForm.value = {
    photo: student.photo || null,
    firstName: student.firstName || '',
    secondName: student.secondName || '',
    thirdName: student.thirdName || '',
    familyName: student.lastName || '',
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
    gender: student.gender || 'male',
    studentId: student.studentId || '',
    nationality: normaliseNationality(student.nationality),
    medicalConditions: student.medicalInfo || '',
    emergencyContact: student.emergencyContact || '',
    address: student.address || '',
    phone: student.phone || '',
    email: student.email || '',
    notes: student.notes || ''
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedStudent.value = null
  studentForm.value = {
    photo: null,
    firstName: '',
    secondName: '',
    thirdName: '',
    familyName: '',
    dateOfBirth: '',
    gender: 'male',
    studentId: '',
    nationality: '',
    medicalConditions: '',
    emergencyContact: '',
    address: '',
    phone: '',
    email: '',
    notes: ''
  }
}

const saveStudent = async () => {
  if (!selectedStudent.value) return

  try {
    loading.value = true

    const updateData = {
      firstName: studentForm.value.firstName,
      secondName: studentForm.value.secondName,
      thirdName: studentForm.value.thirdName,
      lastName: studentForm.value.familyName,
      dateOfBirth: new Date(studentForm.value.dateOfBirth),
      gender: studentForm.value.gender,
      studentId: studentForm.value.studentId,
      nationality: studentForm.value.nationality,
      medicalInfo: studentForm.value.medicalConditions,
      emergencyContact: studentForm.value.emergencyContact,
      photo: studentForm.value.photo,
      address: studentForm.value.address,
      phone: studentForm.value.phone,
      email: studentForm.value.email,
      notes: studentForm.value.notes
    }

    await studentService.update(selectedStudent.value.id, updateData)

    // Refresh students list
    await loadStudents()

    closeModal()
  } catch (err) {
    console.error('Error updating student:', err)
    error.value = 'Failed to update student'
  } finally {
    loading.value = false
  }
}

const showAssignGroupModal = async (student: Student) => {
  assigningStudent.value = student
  selectedGroupForAssign.value = ''
  selectedPaymentLevelForAssign.value = ''
  paymentLevelsForAssign.value = []
  groupsForAssignList.value = groups.value
  try {
    if (authService.getStoredUser()?.role === 'admin') {
      paymentLevelsForAssign.value = await paymentConfigService.listLevels(schoolId.value)
    }
  } catch {
    paymentLevelsForAssign.value = []
  }
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  assigningStudent.value = null
  selectedGroupForAssign.value = ''
  selectedPaymentLevelForAssign.value = ''
  paymentLevelsForAssign.value = []
  groupsForAssignList.value = []
}

const confirmAssignToGroup = async () => {
  if (!assigningStudent.value || !selectedGroupForAssign.value) return
  if (paymentLevelsForAssign.value.length > 0 && !selectedPaymentLevelForAssign.value) {
    error.value = t('studentManagement.selectFeeLevelFirst')
    return
  }

  try {
    loading.value = true

    await studentService.assignToGroup(assigningStudent.value.id, selectedGroupForAssign.value, {
      paymentLevelId: selectedPaymentLevelForAssign.value || undefined,
      replaceExistingGroups: true,
    })

    await loadStudents()

    closeAssignModal()
  } catch (err) {
    console.error('Error assigning student to group:', err)
    error.value = 'Failed to assign student to group'
  } finally {
    loading.value = false
  }
}

const closeAssignBusModal = () => {
  showAssignBusModal.value = false
  assigningStudentForBus.value = null
  selectedBusForAssign.value = ''
}

const confirmAssignToBus = async () => {
  if (!assigningStudentForBus.value || !selectedBusForAssign.value) return

  try {
    loading.value = true
    await studentService.assignToBus(assigningStudentForBus.value.id, selectedBusForAssign.value)
    await Promise.all([loadStudents(), loadBuses()])
    closeAssignBusModal()
  } catch (err: unknown) {
    console.error('Error assigning student to bus:', err)
    const msg = err instanceof Error ? err.message : 'Failed to assign student to bus'
    error.value = msg
    window.alert(msg)
  } finally {
    loading.value = false
  }
}

// Computed properties
const canConfirmParentAction = computed(() => {
  if (parentModalTab.value === 'linked') {
    return editingParent.value !== null && !!parentForm.value.firstName && !!parentForm.value.lastName
  }
  if (parentModalTab.value === 'select') {
    return selectedParent.value !== null
  }
  return !!parentForm.value.firstName && !!parentForm.value.lastName
})

/** Only school admins may reset a parent's login password. */
const canResetParentPassword = computed(() => authService.getStoredUser()?.role === 'admin')

const parentHasAccount = (parent: Parent) => Boolean(parent.user_id || parent.user)

// Parent search and management functions
const searchParents = async () => {
  if (!parentSearchQuery.value.trim()) {
    searchedParents.value = []
    return
  }

  try {
    searchingParents.value = true
    searchedParents.value = await parentService.search(parentSearchQuery.value)
  } catch (err) {
    console.error('Error searching parents:', err)
    searchedParents.value = []
  } finally {
    searchingParents.value = false
  }
}

const selectParent = (parent: Parent) => {
  selectedParent.value = parent
}

const closeParentManagementModal = () => {
  showParentManagementModal.value = false
  parentModalTab.value = 'linked'
  parentSearchQuery.value = ''
  searchedParents.value = []
  selectedParent.value = null
  managingParentsFor.value = null
  linkedParents.value = []
  editingParent.value = null
  parentActionError.value = ''
  passwordResetSuccess.value = ''
  cancelResetPassword()
  parentForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  }
}

const loadLinkedParents = async () => {
  if (!managingParentsFor.value) {
    linkedParents.value = []
    return
  }
  try {
    loadingLinkedParents.value = true
    const fresh = await studentService.getById(managingParentsFor.value.id)
    linkedParents.value = (fresh.parents || []) as Parent[]
  } catch (err) {
    console.error('Error loading linked parents:', err)
    parentActionError.value = t('studentManagement.parentLoadFailed')
    linkedParents.value = []
  } finally {
    loadingLinkedParents.value = false
  }
}

const startEditParent = (parent: Parent) => {
  cancelResetPassword()
  editingParent.value = parent
  parentModalTab.value = 'linked'
  parentForm.value = {
    firstName: parent.firstName || '',
    lastName: parent.lastName || '',
    email: parent.email || '',
    phone: parent.phone || '',
    address: parent.address || ''
  }
}

const cancelEditParent = () => {
  editingParent.value = null
  parentForm.value = { firstName: '', lastName: '', email: '', phone: '', address: '' }
}

const startResetPassword = (parent: Parent) => {
  editingParent.value = null
  resettingPasswordFor.value = parent
  passwordForm.value = { newPassword: '', confirmPassword: '' }
  passwordResetError.value = ''
  passwordResetSuccess.value = ''
}

function cancelResetPassword() {
  resettingPasswordFor.value = null
  passwordForm.value = { newPassword: '', confirmPassword: '' }
  passwordResetError.value = ''
}

const confirmResetPassword = async () => {
  if (!resettingPasswordFor.value) return

  const next = passwordForm.value.newPassword.trim()
  if (next.length < 8) {
    passwordResetError.value = t('studentManagement.passwordTooShort')
    return
  }
  if (next !== passwordForm.value.confirmPassword.trim()) {
    passwordResetError.value = t('studentManagement.passwordMismatch')
    return
  }

  try {
    resettingPassword.value = true
    passwordResetError.value = ''
    const parent = resettingPasswordFor.value
    await parentService.resetPassword(parent.id, next)
    passwordResetSuccess.value = t('studentManagement.resetPasswordDone', {
      name: `${parent.firstName} ${parent.lastName}`,
    })
    cancelResetPassword()
  } catch (err: unknown) {
    console.error('Error resetting parent password:', err)
    passwordResetError.value =
      err instanceof Error ? err.message : t('studentManagement.resetPasswordFailed')
  } finally {
    resettingPassword.value = false
  }
}

const unlinkParent = async (parent: Parent) => {
  if (!managingParentsFor.value) return
  if (!window.confirm(t('studentManagement.confirmUnlinkParent'))) return
  try {
    loading.value = true
    parentActionError.value = ''
    await parentService.unassignFromStudent(parent.id, managingParentsFor.value.id)
    if (editingParent.value?.id === parent.id) cancelEditParent()
    await loadLinkedParents()
    await loadStudents()
  } catch (err: unknown) {
    console.error('Error unlinking parent:', err)
    parentActionError.value =
      err instanceof Error ? err.message : t('studentManagement.parentActionFailed')
  } finally {
    loading.value = false
  }
}

const confirmParentAction = async () => {
  if (!canConfirmParentAction.value) return

  try {
    loading.value = true
    parentActionError.value = ''

    if (parentModalTab.value === 'linked' && editingParent.value) {
      // Save edits to an already-linked parent.
      await parentService.update(editingParent.value.id, {
        firstName: parentForm.value.firstName,
        lastName: parentForm.value.lastName,
        email: parentForm.value.email || undefined,
        phone: parentForm.value.phone || undefined,
        address: parentForm.value.address || undefined,
      })
      cancelEditParent()
      await loadLinkedParents()
      await loadStudents()
      return
    }

    if (parentModalTab.value === 'select' && selectedParent.value) {
      if (!managingParentsFor.value) return
      // Link the chosen parent to the student the modal was opened for.
      await parentService.assignToStudent(selectedParent.value.id, managingParentsFor.value.id)
    } else if (parentModalTab.value === 'create') {
      const created = await parentService.create({
        firstName: parentForm.value.firstName,
        lastName: parentForm.value.lastName,
        email: parentForm.value.email || undefined,
        phone: parentForm.value.phone || undefined,
        address: parentForm.value.address || undefined,
      })
      if (managingParentsFor.value) {
        await parentService.assignToStudent(created.id, managingParentsFor.value.id)
      }
    }

    selectedParent.value = null
    parentSearchQuery.value = ''
    searchedParents.value = []
    parentForm.value = { firstName: '', lastName: '', email: '', phone: '', address: '' }
    parentModalTab.value = managingParentsFor.value ? 'linked' : 'create'
    await loadLinkedParents()
    await loadStudents()
  } catch (err: unknown) {
    console.error('Error with parent action:', err)
    parentActionError.value =
      err instanceof Error ? err.message : t('studentManagement.parentActionFailed')
  } finally {
    loading.value = false
  }
}

/** Per-student "create parent": same manager modal, opened straight on the create form. */
const createParent = async (student: Student) => {
  await manageParents(student)
  parentModalTab.value = 'create'
}

const manageParents = async (student: Student) => {
  managingParentsFor.value = student
  parentModalTab.value = 'linked'
  editingParent.value = null
  parentActionError.value = ''
  passwordResetSuccess.value = ''
  cancelResetPassword()
  parentSearchQuery.value = ''
  searchedParents.value = []
  selectedParent.value = null
  parentForm.value = { firstName: '', lastName: '', email: '', phone: '', address: '' }
  showParentManagementModal.value = true
  await loadLinkedParents()
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  // Claims first: loadBuses() checks them before calling a module the school may not have.
  await loadClaims()
  await Promise.all([loadStudents(), loadGroups(), loadBuses(), loadSchoolBrand()])
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
