<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('studentManagement.title') }}</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('studentManagement.description') }}</p>
            <div
              v-if="exportFilterLines.length"
              class="mt-3 flex flex-wrap items-center gap-2"
            >
              <span class="text-xs font-semibold text-white/70">{{ $t('studentManagement.appliedFilters') }}:</span>
              <span
                v-for="(row, idx) in exportFilterLines"
                :key="idx"
                class="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white ring-1 ring-white/25"
              >
                <span class="font-medium">{{ row.label }}:</span>
                <span class="ms-0.5 max-w-[220px] truncate" :title="row.value">{{ row.value }}</span>
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
              @click="runExport('word')"
            >
              {{ $t('studentManagement.exportAsWord') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
              @click="runExport('pdf')"
            >
              {{ $t('studentManagement.exportAsPdf') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
              @click="runExport('excel')"
            >
              {{ $t('studentManagement.exportAsExcel') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
              @click="showParentManagementModal = true"
            >
              {{ $t('studentManagement.addParent') }}
            </button>
            <router-link
              to="/students/register"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-800 shadow-sm hover:bg-primary-50"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('studentManagement.addStudent') }}
            </router-link>
          </div>
        </div>
      </section>

      <div
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm"
        role="alert"
      >
        {{ error }}
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('studentManagement.listHeading') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('studentManagement.studentsCount', { count: filteredStudents.length }) }}
              </p>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div class="relative min-w-[11rem] flex-1 sm:max-w-xs">
                <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="$t('studentManagement.searchPlaceholder')"
                  class="block w-full rounded-lg border border-gray-300 py-2 ps-9 pe-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <select
                v-model="selectedGroup"
                class="block min-w-[8.5rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="">{{ $t('studentManagement.allGroups') }}</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
              </select>
              <select
                v-model="selectedBusFilter"
                class="block min-w-[8.5rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="">{{ $t('studentManagement.allBuses') }}</option>
                <option v-for="bus in buses" :key="bus.id" :value="bus.id">{{ bus.title }}</option>
              </select>
              <select
                v-model="selectedStatus"
                class="block min-w-[8rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="">{{ $t('studentManagement.allStatuses') }}</option>
                <option value="active">{{ $t('studentManagement.active') }}</option>
                <option value="inactive">{{ $t('studentManagement.inactive') }}</option>
              </select>
              <select
                v-model="selectedAgeGroup"
                class="block min-w-[8.5rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="">{{ $t('studentManagement.allAgeGroups') }}</option>
                <option value="toddlers">{{ $t('studentManagement.toddlers') }}</option>
                <option value="preschool">{{ $t('studentManagement.preschool') }}</option>
                <option value="kindergarten">{{ $t('studentManagement.kindergarten') }}</option>
              </select>
              <ListViewModeToggle v-model="viewMode" />
            </div>
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ students.length }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('studentManagement.statTotal') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ activeStudentCount }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('studentManagement.active') }}</div>
          </div>
          <div class="rounded-xl bg-slate-50/80 px-3 py-3 text-center ring-1 ring-slate-200/80">
            <div class="text-xl font-bold tabular-nums text-slate-700">{{ inactiveStudentCount }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('studentManagement.inactive') }}</div>
          </div>
          <div class="rounded-xl bg-sky-50/70 px-3 py-3 text-center ring-1 ring-sky-100">
            <div class="text-xl font-bold tabular-nums text-sky-700">{{ assignedGroupCount }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('studentManagement.statInGroups') }}</div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="filteredStudents.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="student in filteredStudents"
                :key="student.id"
                class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 opacity-80"
                  :class="getStudentStatus(student) === 'active' ? 'bg-gradient-to-r from-primary-500 to-teal-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'"
                  aria-hidden="true"
                />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-800">
                      {{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <h3 class="truncate font-semibold text-gray-900">
                            {{ student.firstName }} {{ student.lastName }}
                          </h3>
                          <p class="mt-0.5 font-mono text-[11px] text-gray-400">{{ student.id.substring(0, 8) }}</p>
                        </div>
                        <span
                          class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          :class="getStudentStatus(student) === 'active'
                            ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20'
                            : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/15'"
                        >
                          {{ getStudentStatus(student) === 'active' ? $t('studentManagement.active') : $t('studentManagement.inactive') }}
                        </span>
                      </div>
                      <dl class="mt-3 space-y-1.5 text-xs text-gray-600">
                        <div class="flex justify-between gap-2">
                          <dt class="text-gray-400">{{ $t('studentManagement.age') }}</dt>
                          <dd class="font-medium text-gray-800">{{ calculateAge(student.dateOfBirth) }} {{ $t('studentManagement.years') }}</dd>
                        </div>
                        <div class="flex justify-between gap-2">
                          <dt class="text-gray-400">{{ $t('studentManagement.group') }}</dt>
                          <dd class="truncate font-medium text-gray-800">{{ getStudentGroup(student) }}</dd>
                        </div>
                        <div class="flex justify-between gap-2">
                          <dt class="text-gray-400">{{ $t('studentManagement.bus') }}</dt>
                          <dd class="truncate font-medium text-gray-800">{{ getStudentBusTitles(student) }}</dd>
                        </div>
                        <div class="flex justify-between gap-2">
                          <dt class="text-gray-400">{{ $t('studentManagement.parent') }}</dt>
                          <dd class="truncate font-medium text-gray-800">{{ getParentName(student) }}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/60 px-4 py-3">
                  <button
                    type="button"
                    class="rounded-md bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                    @click="viewStudent(student)"
                  >
                    {{ $t('common.view') }}
                  </button>
                  <button
                    type="button"
                    class="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                    @click="editStudent(student)"
                  >
                    {{ $t('common.edit') }}
                  </button>
                  <button
                    v-if="!student.groups || student.groups.length === 0"
                    type="button"
                    class="rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                    @click="assignToGroup(student)"
                  >
                    {{ $t('studentManagement.assignToGroup') }}
                  </button>
                  <button
                    v-if="!student.buses || student.buses.length === 0"
                    type="button"
                    class="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                    @click="assignToBus(student)"
                  >
                    {{ $t('studentManagement.assignToBus') }}
                  </button>
                  <button
                    v-if="!student.parents || student.parents.length === 0"
                    type="button"
                    class="rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100"
                    @click="createParent(student)"
                  >
                    {{ $t('studentManagement.createParent') }}
                  </button>
                </div>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
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
                      <div class="flex flex-wrap justify-end gap-2">
                        <button type="button" class="text-sm font-semibold text-primary-700 hover:text-primary-900" @click="viewStudent(student)">
                          {{ $t('common.view') }}
                        </button>
                        <button type="button" class="text-sm font-semibold text-primary-700 hover:text-primary-900" @click="editStudent(student)">
                          {{ $t('common.edit') }}
                        </button>
                        <button
                          v-if="!student.groups || student.groups.length === 0"
                          type="button"
                          class="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                          @click="assignToGroup(student)"
                        >
                          {{ $t('studentManagement.assignToGroup') }}
                        </button>
                        <button
                          v-if="!student.buses || student.buses.length === 0"
                          type="button"
                          class="text-sm font-semibold text-amber-800 hover:text-amber-950"
                          @click="assignToBus(student)"
                        >
                          {{ $t('studentManagement.assignToBus') }}
                        </button>
                        <button
                          v-if="!student.parents || student.parents.length === 0"
                          type="button"
                          class="text-sm font-semibold text-sky-700 hover:text-sky-900"
                          @click="createParent(student)"
                        >
                          {{ $t('studentManagement.createParent') }}
                        </button>
                      </div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('studentManagement.noStudents') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('studentManagement.noStudentsDescription') }}</p>
                <router-link
                  to="/students/register"
                  class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                >
                  {{ $t('studentManagement.registerFirstStudent') }}
                </router-link>
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
      </div>

      <!-- Student Detail Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" :dir="isRTL ? 'rtl' : 'ltr'">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <div class="flex items-center gap-3 text-white">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold">
                    {{ modalMode === 'view' ? $t('studentManagement.viewStudent') : $t('studentManagement.editStudent') }}
                  </h3>
                  <p class="text-blue-100 text-sm">
                    {{ modalMode === 'view' ? $t('studentManagement.viewStudentDescription') : $t('studentManagement.editStudentDescription') }}
                  </p>
                </div>
              </div>
            </div>
            <div class="bg-white px-6 py-6">
              <div class="w-full">

                  <div v-if="selectedStudent" class="space-y-6">
                    <!-- VIEW MODE -->
                    <div v-if="modalMode === 'view'" class="space-y-6">
                      <!-- Student Photo - View Mode -->
                      <div class="text-center">
                        <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-lg">
                          <img v-if="selectedStudent.photo" :src="selectedStudent.photo" alt="Student Photo" class="w-full h-full object-cover" />
                          <svg v-else class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 class="mt-3 text-xl font-bold text-gray-900">{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</h3>
                        <p class="text-sm text-gray-500">{{ $t('studentManagement.studentId') }}: {{ selectedStudent.id.substring(0, 8) }}</p>
                      </div>

                      <!-- Student Info Cards - View Mode -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Personal Information -->
                        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <h4 class="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {{ $t('studentManagement.personalInformation') }}
                          </h4>
                          <div class="space-y-3">
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.firstName') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.firstName || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.secondName') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.secondName || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.thirdName') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.thirdName || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.familyName') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.lastName || '-' }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Birth & Identity -->
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <h4 class="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0V7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2V7" />
                            </svg>
                            {{ $t('studentManagement.birthAndIdentity') }}
                          </h4>
                          <div class="space-y-3">
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.dateOfBirth') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ formatDate(selectedStudent.dateOfBirth) }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('studentManagement.age') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ calculateAge(selectedStudent.dateOfBirth) }} {{ $t('studentManagement.years') }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.gender') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.gender === 'male' ? $t('students.male') : $t('students.female') }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.nationality') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.nationality === 'omani' ? $t('students.omani') : selectedStudent.nationality === 'expat' ? $t('students.expat') : '-' }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Student ID & Contact -->
                        <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                          <h4 class="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M9 4h6m-6 0v1a1 1 0 001 1h4a1 1 0 001-1V4m-6 0a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1z" />
                            </svg>
                            {{ $t('studentManagement.contactInformation') }}
                          </h4>
                          <div class="space-y-3">
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('students.studentId') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.studentId || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-xs text-gray-500">{{ $t('studentManagement.emergencyContact') }}:</span>
                              <span class="text-sm font-medium text-gray-900">{{ selectedStudent.emergencyContact || '-' }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Medical Information -->
                        <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                          <h4 class="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {{ $t('students.medicalConditions') }}
                          </h4>
                          <div class="bg-white rounded-lg p-3 border border-red-100">
                            <p class="text-sm text-gray-900">{{ selectedStudent.medicalInfo || $t('studentManagement.noMedicalConditions') }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- EDIT MODE -->
                    <div v-else class="space-y-4">
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
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.firstName') }} *</label>
                          <input
                            v-model="studentForm.firstName"
                            type="text"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.secondName') }} *</label>
                          <input
                            v-model="studentForm.secondName"
                            type="text"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.thirdName') }}</label>
                          <input
                            v-model="studentForm.thirdName"
                            type="text"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.familyName') }} *</label>
                          <input
                            v-model="studentForm.familyName"
                            type="text"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.dateOfBirth') }} *</label>
                          <input
                            v-model="studentForm.dateOfBirth"
                            type="date"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.gender') }} *</label>
                          <select
                            v-model="studentForm.gender"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            <option value="">{{ $t('students.selectGender') }}</option>
                            <option value="male">{{ $t('students.male') }}</option>
                            <option value="female">{{ $t('students.female') }}</option>
                          </select>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.studentId') }}</label>
                          <input
                            v-model="studentForm.studentId"
                            type="text"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                          <p class="text-xs text-gray-500 mt-1">{{ $t('students.studentIdNote') }}</p>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">{{ $t('students.nationality') }} *</label>
                          <select
                            v-model="studentForm.nationality"
                            required
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            <option value="">{{ $t('students.selectNationality') }}</option>
                            <option value="omani">{{ $t('students.omani') }}</option>
                            <option value="expat">{{ $t('students.expat') }}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700">{{ $t('students.medicalConditions') }}</label>
                        <textarea
                          v-model="studentForm.medicalConditions"
                          rows="3"
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                          :placeholder="$t('students.medicalConditionsPlaceholder')"
                        ></textarea>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.emergencyContact') }}</label>
                        <input
                          v-model="studentForm.emergencyContact"
                          type="text"
                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

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
                              v-if="!selectedStudent.parents || selectedStudent.parents.length === 0"
                              @click="createParent(selectedStudent)"
                              class="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors duration-200"
                            >
                              {{ $t('studentManagement.addParent') }}
                            </button>
                            <button
                              v-else
                              @click="manageParents(selectedStudent)"
                              class="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors duration-200"
                            >
                              {{ $t('studentManagement.manageParents') }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                v-if="modalMode === 'edit'"
                @click="saveStudent"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.save') }}
              </button>
              <button
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assign to Group Modal -->
      <div v-if="showAssignModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeAssignModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ $t('studentManagement.assignToGroup') }}
              </h3>

              <div v-if="assigningStudent">
                <p class="text-sm text-gray-600 mb-4">
                  {{ $t('studentManagement.assignStudentToGroup', { name: `${assigningStudent.firstName} ${assigningStudent.lastName}` }) }}
                </p>

                <div v-if="paymentLevelsForAssign.length" class="mb-3">
                  <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('studentManagement.feeLevel') }}</label>
                  <select
                    v-model="selectedPaymentLevelForAssign"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">{{ $t('studentManagement.selectFeeLevel') }}</option>
                    <option v-for="lv in paymentLevelsForAssign" :key="lv.id" :value="lv.id">
                      {{ lv.code }} — {{ lv.name }}
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">{{ $t('studentManagement.groupsFilteredByLevel') }}</p>
                </div>

                <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('studentManagement.selectGroup') }}</label>
                <select
                  v-model="selectedGroupForAssign"
                  :disabled="paymentLevelsForAssign.length > 0 && !selectedPaymentLevelForAssign"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
                >
                  <option value="">{{ $t('studentManagement.selectGroup') }}</option>
                  <option v-for="group in groupsForAssignList" :key="group.id" :value="group.id">
                    {{ group.name }} ({{ group.capacity }})
                  </option>
                </select>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmAssignToGroup"
                :disabled="!selectedGroupForAssign || (paymentLevelsForAssign.length > 0 && !selectedPaymentLevelForAssign)"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ $t('studentManagement.assign') }}
              </button>
              <button
                @click="closeAssignModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assign to Bus Modal -->
      <div v-if="showAssignBusModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeAssignBusModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ $t('studentManagement.assignToBus') }}
              </h3>

              <div v-if="assigningStudentForBus">
                <p class="text-sm text-gray-600 mb-4">
                  {{ $t('studentManagement.assignStudentToBus', { name: `${assigningStudentForBus.firstName} ${assigningStudentForBus.lastName}` }) }}
                </p>

                <select
                  v-model="selectedBusForAssign"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">{{ $t('studentManagement.selectBus') }}</option>
                  <option v-for="bus in buses" :key="bus.id" :value="bus.id">
                    {{ bus.title }} ({{ busRosterCount(bus) }}/{{ bus.capacity }})
                  </option>
                </select>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmAssignToBus"
                :disabled="!selectedBusForAssign"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ $t('studentManagement.assign') }}
              </button>
              <button
                @click="closeAssignBusModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Parent Management Modal -->
      <div v-if="showParentManagementModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeParentManagementModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ $t('studentManagement.addParent') }}
              </h3>

              <!-- Tab Navigation -->
              <div class="border-b border-gray-200 mb-6">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
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
              <div v-if="parentModalTab === 'select'" class="space-y-4">
                <!-- Search Field -->
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="parentSearchQuery"
                    @input="searchParents"
                    type="text"
                    :placeholder="$t('studentManagement.searchParents')"
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.firstName') }}</label>
                    <input
                      v-model="parentForm.firstName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.firstName')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.lastName') }}</label>
                    <input
                      v-model="parentForm.lastName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.lastName')"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.email') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <input
                    v-model="parentForm.email"
                    type="email"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :placeholder="$t('studentManagement.email')"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.phone') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <input
                    v-model="parentForm.phone"
                    type="tel"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :placeholder="$t('studentManagement.phone')"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.address') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                  <textarea
                    v-model="parentForm.address"
                    rows="3"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :placeholder="$t('studentManagement.address')"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmParentAction"
                :disabled="!canConfirmParentAction"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ parentModalTab === 'select' ? $t('studentManagement.assignParent') : $t('common.create') }}
              </button>
              <button
                @click="closeParentManagementModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Parent for Specific Student Modal -->
      <div v-if="showCreateParentModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeCreateParentModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ $t('studentManagement.createParent') }}
              </h3>

              <div v-if="creatingParentFor">
                <p class="text-sm text-gray-600 mb-4">
                  {{ $t('studentManagement.assignParentToStudent', { name: `${creatingParentFor.firstName} ${creatingParentFor.lastName}` }) }}
                </p>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.firstName') }}</label>
                    <input
                      v-model="parentForm.firstName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.firstName')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.lastName') }}</label>
                    <input
                      v-model="parentForm.lastName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.lastName')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.email') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                    <input
                      v-model="parentForm.email"
                      type="email"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.email')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ $t('studentManagement.phone') }} <span class="text-gray-500">({{ $t('studentManagement.optional') }})</span></label>
                    <input
                      v-model="parentForm.phone"
                      type="tel"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :placeholder="$t('studentManagement.phone')"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmCreateParent"
                :disabled="!parentForm.firstName || !parentForm.lastName"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ $t('common.create') }}
              </button>
              <button
                @click="closeCreateParentModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { authService } from '@/services'
import { studentService, type Student } from '@/services/student.service'
import { groupService, type Group } from '@/services/group.service'
import { busService, type Bus } from '@/services/bus.service'
import { parentService, type Parent } from '@/services/parent.service'
import paymentConfigService from '@/services/payment-config.service'
import type { SchoolPaymentLevel } from '@/services/payment-config.service'

const { locale, t } = useI18n()
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

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
const showCreateParentModal = ref(false)
const showParentManagementModal = ref(false)
const modalMode = ref<'view' | 'edit'>('view')
const selectedStudent = ref<Student | null>(null)
const assigningStudent = ref<Student | null>(null)
const assigningStudentForBus = ref<Student | null>(null)
const creatingParentFor = ref<Student | null>(null)
const selectedGroupForAssign = ref('')
const selectedBusForAssign = ref('')
const paymentLevelsForAssign = ref<SchoolPaymentLevel[]>([])
const selectedPaymentLevelForAssign = ref('')
const groupsForAssignList = ref<Group[]>([])

// Parent management state
const parentModalTab = ref<'select' | 'create'>('select')
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
  emergencyContact: ''
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
  } catch (err) {
    console.error('Error loading students:', err)
    error.value = 'Failed to load students'
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
  const u = authService.getStoredUser() as { school_id?: number } | null
  return Number(u?.school_id ?? 1)
})

watch(selectedPaymentLevelForAssign, async (lv) => {
  if (!paymentLevelsForAssign.value.length) {
    groupsForAssignList.value = groups.value
    return
  }
  if (!lv) {
    groupsForAssignList.value = []
    return
  }
  try {
    groupsForAssignList.value = await groupService.getActive(schoolId.value, lv)
  } catch {
    groupsForAssignList.value = []
  }
})

const loadBuses = async () => {
  try {
    buses.value = await busService.getAll(schoolId.value)
  } catch (err) {
    console.error('Error loading buses:', err)
    buses.value = []
  }
}

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

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

const activeStudentCount = computed(
  () => students.value.filter((s) => getStudentStatus(s) === 'active').length,
)
const inactiveStudentCount = computed(
  () => students.value.filter((s) => getStudentStatus(s) === 'inactive').length,
)
const assignedGroupCount = computed(
  () => students.value.filter((s) => s.groups && s.groups.length > 0).length,
)

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

const viewStudent = (student: Student) => {
  // Create a detailed modal or navigate to student detail page
  showStudentModal(student, 'view')
}

const editStudent = (student: Student) => {
  // Create an edit modal or navigate to edit page
  showStudentModal(student, 'edit')
}

const assignToGroup = (student: Student) => {
  // Show assign to group modal
  showAssignGroupModal(student)
}

const assignToBus = (student: Student) => {
  assigningStudentForBus.value = student
  selectedBusForAssign.value = ''
  showAssignBusModal.value = true
}

// Modal functions
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
    nationality: student.nationality || '',
    medicalConditions: student.medicalInfo || '',
    emergencyContact: student.emergencyContact || ''
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
    emergencyContact: ''
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
      photo: studentForm.value.photo
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
  selectedPaymentLevelForAssign.value =
    (student as any).payment_level_id || (student as any).paymentLevel?.id || ''
  paymentLevelsForAssign.value = []
  try {
    if (authService.getStoredUser()?.role === 'admin') {
      paymentLevelsForAssign.value = await paymentConfigService.listLevels(schoolId.value)
    }
  } catch {
    paymentLevelsForAssign.value = []
  }
  if (!paymentLevelsForAssign.value.length) {
    groupsForAssignList.value = groups.value
  } else if (selectedPaymentLevelForAssign.value) {
    try {
      groupsForAssignList.value = await groupService.getActive(
        schoolId.value,
        selectedPaymentLevelForAssign.value,
      )
    } catch {
      groupsForAssignList.value = []
    }
  } else {
    groupsForAssignList.value = []
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
  if (parentModalTab.value === 'select') {
    return selectedParent.value !== null
  } else {
    return parentForm.value.firstName && parentForm.value.lastName
  }
})

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
  parentModalTab.value = 'select'
  parentSearchQuery.value = ''
  searchedParents.value = []
  selectedParent.value = null
  parentForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  }
}

const confirmParentAction = async () => {
  if (!canConfirmParentAction.value) return

  try {
    loading.value = true

    if (parentModalTab.value === 'select' && selectedParent.value) {
      // If just creating a parent without assigning to specific student
      console.log('Selected parent:', selectedParent.value)
      // You could add logic here to do something with the selected parent
    } else if (parentModalTab.value === 'create') {
      // Create new parent
      await parentService.create({
        firstName: parentForm.value.firstName,
        lastName: parentForm.value.lastName,
        email: parentForm.value.email || undefined,
        phone: parentForm.value.phone || undefined,
        address: parentForm.value.address || undefined,
      })
    }

    closeParentManagementModal()
  } catch (err) {
    console.error('Error with parent action:', err)
    error.value = 'Failed to process parent action'
  } finally {
    loading.value = false
  }
}

// Parent creation functions
const createParent = (student: Student) => {
  creatingParentFor.value = student
  parentForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  }
  showCreateParentModal.value = true
}

const manageParents = (student: Student) => {
  // Open parent management modal for existing parents
  showParentManagementModal.value = true
}

const closeCreateParentModal = () => {
  showCreateParentModal.value = false
  creatingParentFor.value = null
  parentForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  }
}

const confirmCreateParent = async () => {
  if (!creatingParentFor.value || !parentForm.value.firstName || !parentForm.value.lastName) return

  try {
    loading.value = true

    // Create the parent
    const newParent = await parentService.create({
      firstName: parentForm.value.firstName,
      lastName: parentForm.value.lastName,
      email: parentForm.value.email || undefined,
      phone: parentForm.value.phone || undefined,
    })

    // Assign the parent to the student
    await parentService.assignToStudent(newParent.id, creatingParentFor.value.id)

    // Refresh students list to show updated parent assignment
    await loadStudents()

    closeCreateParentModal()
  } catch (err) {
    console.error('Error creating parent:', err)
    error.value = 'Failed to create parent'
  } finally {
    loading.value = false
  }
}

// Initialize data
onMounted(async () => {
  await Promise.all([loadStudents(), loadGroups(), loadBuses()])
})
</script>
