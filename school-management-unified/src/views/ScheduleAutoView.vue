<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('scheduleAuto.title')"
        :subtitle="$t('scheduleAuto.subtitle')"
      />

      <section class="mb-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex min-w-0 flex-col items-center">
            <ol class="flex w-full max-w-xl items-center justify-between gap-1" role="tablist">
              <li class="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  role="tab"
                  class="flex w-full flex-col items-center gap-2 text-center focus:outline-none"
                  :aria-selected="activeTab === 'demand'"
                  @click="activeTab = 'demand'"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition"
                    :class="
                      activeTab === 'demand'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-primary-100 text-primary-800'
                    "
                  >
                    <svg
                      v-if="activeTab !== 'demand'"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span v-else>1</span>
                  </span>
                  <span
                    class="hidden text-[11px] font-semibold sm:block"
                    :class="activeTab === 'demand' ? 'text-primary-800' : 'text-gray-500'"
                  >
                    {{ $t('scheduleAuto.tabDemand') }}
                  </span>
                </button>
                <div
                  class="mx-1 h-1 flex-1 rounded-full sm:mx-2"
                  :class="activeTab !== 'demand' ? 'bg-primary-500' : 'bg-gray-200'"
                  aria-hidden="true"
                />
              </li>
              <li class="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  role="tab"
                  class="flex w-full flex-col items-center gap-2 text-center focus:outline-none"
                  :aria-selected="activeTab === 'split'"
                  @click="goToSplit"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition"
                    :class="
                      activeTab === 'split'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : activeTab === 'grid'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-500'
                    "
                  >
                    <svg
                      v-if="activeTab === 'grid'"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span v-else>2</span>
                  </span>
                  <span
                    class="hidden text-[11px] font-semibold sm:block"
                    :class="activeTab === 'split' ? 'text-primary-800' : 'text-gray-500'"
                  >
                    {{ $t('scheduleAuto.tabSplit') }}
                  </span>
                </button>
                <div
                  class="mx-1 h-1 flex-1 rounded-full sm:mx-2"
                  :class="activeTab === 'grid' ? 'bg-primary-500' : 'bg-gray-200'"
                  aria-hidden="true"
                />
              </li>
              <li class="flex min-w-0 flex-1 items-center justify-center">
                <button
                  type="button"
                  role="tab"
                  class="flex w-full flex-col items-center gap-2 text-center focus:outline-none"
                  :aria-selected="activeTab === 'grid'"
                  @click="goToGrid"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition"
                    :class="
                      activeTab === 'grid'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500'
                    "
                  >
                    3
                  </span>
                  <span
                    class="hidden text-[11px] font-semibold sm:block"
                    :class="activeTab === 'grid' ? 'text-primary-800' : 'text-gray-500'"
                  >
                    {{ $t('scheduleAuto.tabGrid') }}
                  </span>
                </button>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <div
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
      >
        <div
          v-if="activeTab === 'demand'"
          class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-3"
        >
          <h2 class="text-sm font-semibold text-gray-900">
            {{ $t('scheduleAuto.tabDemand') }}
            <template v-if="selectedGroup"> — {{ selectedGroup.name }}</template>
            <span class="ms-2 text-xs font-medium text-gray-500">{{ assignedPeriods }} / {{ weeklyRequired }}</span>
          </h2>
          <button
            v-if="canCreate && selectedGroup"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
            @click="addCourse"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('scheduleAuto.addCourse') }}
          </button>
        </div>

        <div v-show="activeTab === 'demand'" class="space-y-6 p-6">
          <div v-if="selectedGroup && courseBlocks.length" class="space-y-3">
            <article
              v-for="(block, index) in courseBlocks"
              :key="block.key"
              class="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
              :class="activeCourseIndex === index ? 'border-primary-200 ring-primary-100' : ''"
            >
              <header
                class="flex cursor-pointer items-start justify-between gap-2 px-4 py-3 hover:bg-gray-50/80"
                :class="activeCourseIndex === index ? 'border-b border-gray-100 bg-primary-50/40' : ''"
                @click="setActiveCourse(index)"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                    {{ index + 1 }}
                  </span>
                  <div class="min-w-0">
                    <h4 class="truncate text-sm font-semibold text-gray-900">
                      {{ courseTitle(block, index) }}
                    </h4>
                    <p
                      v-if="activeCourseIndex !== index"
                      class="mt-0.5 text-[11px] text-gray-500"
                    >
                      {{ block.teachers.length }}
                      {{ $t('scheduleAuto.teachers') }}
                      · {{ block.periods_per_week }}
                    </p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-1" @click.stop>
                  <button
                    v-if="canCreate"
                    type="button"
                    class="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                    :aria-label="$t('scheduleAuto.deleteCourse')"
                    @click="removeCourse(index)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    :aria-expanded="activeCourseIndex === index"
                    :aria-label="
                      activeCourseIndex === index
                        ? $t('scheduleAuto.collapseCourse')
                        : $t('scheduleAuto.expandCourse')
                    "
                    @click="setActiveCourse(index)"
                  >
                    <svg
                      class="h-4 w-4 transition-transform duration-200"
                      :class="activeCourseIndex === index ? 'rotate-180' : ''"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </header>

              <div v-if="activeCourseIndex === index" class="space-y-4 p-4">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="`auto-course-${index}`">
                      {{ $t('scheduleManagement.classModal.subject') }}
                    </label>
                    <select
                      :id="`auto-course-${index}`"
                      v-model="block.course_id"
                      class="fk-field"
                    >
                      <option value="">{{ $t('scheduleManagement.classModal.subjectPlaceholder') }}</option>
                      <option
                        v-for="course in coursesForBlock(block)"
                        :key="course.id"
                        :value="course.id"
                      >
                        {{ course.name }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="`auto-periods-${index}`">
                      {{ $t('scheduleAuto.periodsPerWeek') }}
                    </label>
                    <input
                      :id="`auto-periods-${index}`"
                      v-model.number="block.periods_per_week"
                      type="number"
                      min="1"
                      max="40"
                      class="fk-field"
                      @change="syncCoursePeriods(block)"
                    >
                  </div>
                </div>

                <div class="border-t border-gray-100 pt-4">
                  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h5 class="text-xs font-semibold text-gray-700">
                      {{ $t('scheduleAuto.teachers') }}
                    </h5>
                    <button
                      v-if="canCreate"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-800 hover:bg-primary-100"
                      @click="addTeacher(index)"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {{ $t('scheduleAuto.addTeacher') }}
                    </button>
                  </div>

                  <div v-if="block.teachers.length" class="space-y-2">
                    <div
                      v-for="(row, tIndex) in block.teachers"
                      :key="row.key"
                      class="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      :class="activeTeacherIndex === tIndex ? 'border-primary-200' : ''"
                    >
                      <div
                        class="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50"
                        :class="activeTeacherIndex === tIndex ? 'border-b border-gray-100 bg-primary-50/30' : ''"
                        @click="setActiveTeacher(tIndex)"
                      >
                        <div class="flex min-w-0 items-center gap-2">
                          <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-800">
                            {{ tIndex + 1 }}
                          </span>
                          <span class="truncate text-sm font-medium text-gray-800">
                            {{ teacherTitle(row, tIndex) }}
                          </span>
                        </div>
                        <div class="flex shrink-0 items-center gap-1" @click.stop>
                          <button
                            v-if="canCreate"
                            type="button"
                            class="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                            :aria-label="$t('scheduleAuto.deleteTeacher')"
                            @click="removeTeacher(index, tIndex)"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            class="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            :aria-expanded="activeTeacherIndex === tIndex"
                            :aria-label="
                              activeTeacherIndex === tIndex
                                ? $t('scheduleAuto.collapseTeacher')
                                : $t('scheduleAuto.expandTeacher')
                            "
                            @click="setActiveTeacher(tIndex)"
                          >
                            <svg
                              class="h-4 w-4 transition-transform duration-200"
                              :class="activeTeacherIndex === tIndex ? 'rotate-180' : ''"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div v-if="activeTeacherIndex === tIndex" class="grid grid-cols-1 gap-4 p-3 lg:gap-6">
                        <div>
                          <label
                            class="mb-1.5 block text-xs font-medium text-gray-600"
                            :for="`auto-teacher-${index}-${tIndex}`"
                          >
                            {{ $t('scheduleManagement.classModal.teacher') }}
                          </label>
                          <select
                            :id="`auto-teacher-${index}-${tIndex}`"
                            v-model="row.teacher_id"
                            class="fk-field"
                          >
                            <option value="">{{ $t('scheduleManagement.classModal.teacherPlaceholder') }}</option>
                            <option
                              v-for="teacher in teachersForBlock(block, row)"
                              :key="teacher.id"
                              :value="teacher.id"
                            >
                              {{ teacher.fullName }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <div
            v-else-if="selectedGroup && !courseBlocks.length"
            class="fk-empty"
          >
            <p class="fk-empty__title">{{ $t('scheduleAuto.noCourses') }}</p>
          </div>
        </div>

        <div
          v-if="activeTab === 'split'"
          class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-3"
        >
          <h2 class="text-sm font-semibold text-gray-900">
            {{ $t('scheduleAuto.tabSplit') }}
            <template v-if="selectedGroup"> — {{ selectedGroup.name }}</template>
            <span class="ms-2 text-xs font-medium text-gray-500">{{ splitAssigned }} / {{ weeklyRequired }}</span>
          </h2>
        </div>

        <div v-show="activeTab === 'split'" class="p-6">
          <div class="fk-table-wrap overflow-visible">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-start">{{ $t('scheduleManagement.classModal.subject') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('scheduleManagement.classModal.teacher') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('scheduleAuto.periodsPerWeek') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in splitRows"
                  :key="row.key"
                  class="border-t border-gray-100"
                >
                  <td class="px-4 py-3">{{ row.courseName }}</td>
                  <td class="px-4 py-3">{{ row.teacherName }}</td>
                  <td class="px-4 py-3">
                    <input
                      v-model.number="row.teacher.periods_per_week"
                      type="number"
                      min="1"
                      max="40"
                      class="fk-field max-w-[7rem]"
                      :aria-label="$t('scheduleAuto.periodsPerWeek')"
                      @change="saveSplitCounts"
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="activeTab === 'grid'">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title truncate">
              {{ $t('scheduleManagement.weeklySchedule') }}
              <template v-if="selectedGroup"> — {{ selectedGroup.name }}</template>
              <template v-if="previewActive"> — {{ $t('scheduleAuto.preview') }}</template>
            </h2>
            <div v-if="canCreate && selectedGroup" class="flex shrink-0 flex-nowrap items-center gap-2">
              <button
                type="button"
                class="fk-btn fk-btn--pearl"
                :disabled="generating"
                @click="runGenerate(false)"
              >
                {{ $t('scheduleAuto.generate') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="generating || !previewActive"
                @click="runGenerate(true)"
              >
                {{ $t('scheduleAuto.apply') }}
              </button>
            </div>
          </div>

          <div class="hidden overflow-x-auto lg:block">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="w-20 px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {{ $t('common.time') }}
                  </th>
                  <th
                    v-for="day in weekDays"
                    :key="day.key"
                    class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {{ $t(`scheduleManagement.days.${day.key}`) }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr
                  v-for="timeSlot in timeSlots"
                  :key="timeSlot.time"
                  :class="timeSlot.kind === 'break' ? 'bg-amber-50/40' : ''"
                >
                  <td class="whitespace-nowrap px-4 py-3 text-sm font-semibold tabular-nums text-gray-900">
                    <div>{{ timeSlot.time }}</div>
                    <div class="mt-0.5 text-[11px] font-medium text-gray-500">
                      {{ timeSlot.duration }} {{ $t('common.minutes') }}
                      <span v-if="timeSlot.kind === 'break'"> · {{ timeSlot.name || $t('classSettings.timeSlots.breakKind') }}</span>
                    </div>
                  </td>
                  <td
                    v-for="day in weekDays"
                    :key="`${timeSlot.time}-${day.key}`"
                    class="px-2 py-3 text-center align-top"
                  >
                    <div
                      v-if="timeSlot.kind === 'break'"
                      class="flex h-16 items-center justify-center rounded-xl border border-amber-200/80 bg-amber-50/80 px-2 text-xs font-semibold text-amber-800"
                    >
                      {{ timeSlot.name || $t('classSettings.timeSlots.breakKind') }}
                    </div>
                    <div
                      v-else-if="getClassForTimeAndDay(timeSlot.time, day.key)"
                      class="rounded-xl border border-primary-200 bg-primary-50 p-3 text-start"
                    >
                      <div class="text-sm font-semibold text-primary-900">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.subjectLabel }}
                      </div>
                      <div class="mt-1 text-xs text-primary-700">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.teacherLabel }}
                      </div>
                    </div>
                    <div
                      v-else
                      class="h-16 rounded-xl border border-dashed border-gray-200"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="lg:hidden">
            <div v-for="day in weekDays" :key="day.key" class="border-b border-gray-100 last:border-b-0">
              <div class="bg-gray-50 px-5 py-3">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t(`scheduleManagement.days.${day.key}`) }}</h3>
              </div>
              <div class="space-y-3 p-4">
                <div v-for="timeSlot in timeSlots" :key="timeSlot.time" class="flex items-center gap-3">
                  <div class="w-16 shrink-0 text-sm font-semibold tabular-nums text-gray-500">
                    <div>{{ timeSlot.time }}</div>
                    <div class="text-[10px] font-medium">{{ timeSlot.duration }}′</div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div
                      v-if="timeSlot.kind === 'break'"
                      class="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-3 text-xs font-semibold text-amber-800"
                    >
                      {{ timeSlot.name || $t('classSettings.timeSlots.breakKind') }}
                    </div>
                    <div
                      v-else-if="getClassForTimeAndDay(timeSlot.time, day.key)"
                      class="rounded-xl border border-primary-200 bg-primary-50 px-3 py-3"
                    >
                      <div class="text-sm font-semibold text-primary-900">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.subjectLabel }}
                      </div>
                      <div class="mt-1 text-xs text-primary-700">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.teacherLabel }}
                      </div>
                    </div>
                    <div v-else class="h-12 rounded-xl border border-dashed border-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 px-6 py-5">
          <button
            v-if="activeTab !== 'demand'"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="goPrevious"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('common.previous') }}
          </button>
          <button
            v-if="activeTab === 'demand'"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
            :disabled="savingDemand"
            @click="goToSplit"
          >
            {{ $t('common.next') }}
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            v-if="activeTab === 'split'"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            :disabled="savingDemand"
            @click="goToGrid"
          >
            {{ $t('common.next') }}
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { courseService } from '@/services/course.service'
import userService from '@/services/user.service'
import { groupService } from '@/services/group.service'
import { scheduleService } from '@/services/schedule.service'
import {
  scheduleAutoService,
  type ScheduleAutoPlacement,
  type ScheduleLessonDemand,
} from '@/services/schedule-auto.service'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'
import {
  courseDisplayName,
  courseMatchesGroupLevel,
  normalizeScheduleDayKey,
  teacherDisplayName,
  toScheduleHm,
} from '@/utils/schedule-display'
import { isCourseSchedulable } from '@/utils/course-status'
import { resolveFeeLevelId } from '@/utils/fee-level'
import { useFeedback } from '@/composables/useFeedback'
import { useClaims } from '@/composables/useClaims'
import { useRoute } from 'vue-router'
import { getSelectedScheduleGroupId, setSelectedScheduleGroupId } from '@/utils/selected-schedule-group'

const { locale, t } = useI18n()
const route = useRoute()
const isRTL = computed(() => locale.value === 'ar')
const feedback = useFeedback()
const { hasClaim } = useClaims()

const canCreate = computed(() => hasClaim('schedules', 'create'))

type TimetableSlot = {
  time: string
  duration: number
  kind: 'class' | 'break'
  name?: string
}

type GridClass = {
  id: string
  day: string
  startTime: string
  subjectLabel: string
  teacherLabel: string
}

type TeacherRow = {
  key: string
  teacher_id: string
  periods_per_week: number
}

type CourseBlock = {
  key: string
  course_id: string
  periods_per_week: number
  teachers: TeacherRow[]
}

const activeTab = ref<'demand' | 'split' | 'grid'>('demand')
const lastSplitSignature = ref('')
const activeCourseIndex = ref<number | null>(null)
const activeTeacherIndex = ref<number | null>(null)
const selectedGroupId = ref('')
const groups = ref<any[]>([])
const groupsError = ref('')
const loadingGroups = ref(false)
const teachers = ref<any[]>([])
const courses = ref<any[]>([])
const courseBlocks = ref<CourseBlock[]>([])
const savedClasses = ref<GridClass[]>([])
const previewClasses = ref<GridClass[] | null>(null)
const savingDemand = ref(false)
const generating = ref(false)

const weekDays = [
  { key: 'sunday' },
  { key: 'monday' },
  { key: 'tuesday' },
  { key: 'wednesday' },
  { key: 'thursday' },
]

const defaultTimeSlots: TimetableSlot[] = [
  { time: '08:00', duration: 45, kind: 'class' },
  { time: '08:45', duration: 45, kind: 'class' },
  { time: '09:30', duration: 45, kind: 'class' },
  { time: '10:15', duration: 45, kind: 'class' },
  { time: '11:00', duration: 45, kind: 'class' },
  { time: '11:45', duration: 45, kind: 'class' },
  { time: '12:30', duration: 45, kind: 'class' },
  { time: '13:15', duration: 45, kind: 'class' },
]

const timeSlots = ref<TimetableSlot[]>([...defaultTimeSlots])

const selectedGroup = computed(() => {
  const sid = selectedGroupId.value
  if (!sid) return undefined
  return groups.value.find((group) => String(group.id) === String(sid))
})

const groupCourses = computed(() => {
  const groupLevel = resolveFeeLevelId(selectedGroup.value) || ''
  return courses.value.filter((course) =>
    courseMatchesGroupLevel(course.levelId, groupLevel || null, null, course.id),
  )
})

function isDefaultAutoCourseKind(kind?: string) {
  const value = String(kind || 'milestone').toLowerCase()
  return value === 'milestone' || value === 'graded'
}

const defaultAutoCourses = computed(() =>
  courses.value.filter((course) => isDefaultAutoCourseKind(course.kind)),
)

const classPeriodCount = computed(() => timeSlots.value.filter((slot) => slot.kind !== 'break').length)
const weeklyRequired = computed(() => classPeriodCount.value * weekDays.length)
const assignedPeriods = computed(() =>
  courseBlocks.value.reduce((sum, block) => sum + (Number(block.periods_per_week) || 0), 0),
)
const previewActive = computed(() => previewClasses.value != null)
const currentSchedule = computed(() => previewClasses.value ?? savedClasses.value)
const splitAssigned = computed(() =>
  courseBlocks.value.reduce(
    (sum, block) =>
      sum + block.teachers.reduce((inner, row) => inner + (Number(row.periods_per_week) || 0), 0),
    0,
  ),
)
const splitRows = computed(() =>
  courseBlocks.value.flatMap((block, index) =>
    block.teachers
      .filter((row) => row.teacher_id)
      .map((teacher, tIndex) => ({
        key: `${block.key}-${teacher.key}`,
        courseName: courseTitle(block, index),
        teacherName: teacherTitle(teacher, tIndex),
        teacher,
      })),
  ),
)

function newKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function courseTitle(block: CourseBlock, index: number) {
  const course = courses.value.find((item) => String(item.id) === String(block.course_id))
  return course ? course.name : `${t('scheduleManagement.classModal.subject')} ${index + 1}`
}

function teacherTitle(row: TeacherRow, index: number) {
  const teacher = teachers.value.find((item) => String(item.id) === String(row.teacher_id))
  return teacher?.fullName || `${t('scheduleManagement.classModal.teacher')} ${index + 1}`
}

function coursesForBlock(block: CourseBlock) {
  const used = new Set(
    courseBlocks.value
      .filter((item) => item.key !== block.key && item.course_id)
      .map((item) => String(item.course_id)),
  )
  return courses.value.filter((course) => {
    if (used.has(String(course.id)) && String(course.id) !== String(block.course_id)) return false
    if (isDefaultAutoCourseKind(course.kind)) return true
    return groupCourses.value.some((item) => String(item.id) === String(course.id))
  })
}

function teachersForBlock(block: CourseBlock, row: TeacherRow) {
  const used = new Set(
    block.teachers
      .filter((item) => item.key !== row.key && item.teacher_id)
      .map((item) => String(item.teacher_id)),
  )
  return teachers.value.filter((teacher) => !used.has(String(teacher.id)) || String(teacher.id) === String(row.teacher_id))
}

function setActiveCourse(index: number) {
  activeCourseIndex.value = activeCourseIndex.value === index ? null : index
  activeTeacherIndex.value = 0
}

function setActiveTeacher(index: number) {
  activeTeacherIndex.value = activeTeacherIndex.value === index ? null : index
}

function syncCoursePeriods(block: CourseBlock) {
  const periods = Math.max(1, Number(block.periods_per_week) || 1)
  block.periods_per_week = periods
  if (block.teachers.length === 1) {
    block.teachers[0].periods_per_week = periods
  }
}

function seedMissingDefaultCourses() {
  const have = new Set(
    courseBlocks.value.map((block) => String(block.course_id || '')).filter(Boolean),
  )
  const extras = defaultAutoCourses.value.filter((course) => !have.has(String(course.id)))
  if (!extras.length) return
  courseBlocks.value = [
    ...courseBlocks.value,
    ...extras.map((course) => ({
      key: newKey(),
      course_id: String(course.id),
      periods_per_week: 1,
      teachers: [],
    })),
  ]
}

function addCourse() {
  if (!selectedGroupId.value) return
  courseBlocks.value.push({
    key: newKey(),
    course_id: '',
    periods_per_week: 1,
    teachers: [],
  })
  activeCourseIndex.value = courseBlocks.value.length - 1
  activeTeacherIndex.value = null
  nextTick(() => {
    const el = document.getElementById(`auto-course-${activeCourseIndex.value}`) as HTMLSelectElement | null
    el?.focus()
  })
}

function removeCourse(index: number) {
  courseBlocks.value.splice(index, 1)
  if (activeCourseIndex.value === index) {
    activeCourseIndex.value = null
    activeTeacherIndex.value = null
  } else if (activeCourseIndex.value != null && activeCourseIndex.value > index) {
    activeCourseIndex.value -= 1
  }
}

function addTeacher(courseIndex: number) {
  const block = courseBlocks.value[courseIndex]
  if (!block) return
  const remaining = Math.max(
    1,
    (Number(block.periods_per_week) || 1) -
      block.teachers.reduce((sum, row) => sum + (Number(row.periods_per_week) || 0), 0),
  )
  block.teachers.push({
    key: newKey(),
    teacher_id: '',
    periods_per_week: block.teachers.length === 0 ? Number(block.periods_per_week) || 1 : remaining,
  })
  activeCourseIndex.value = courseIndex
  activeTeacherIndex.value = block.teachers.length - 1
  nextTick(() => {
    const el = document.getElementById(`auto-teacher-${courseIndex}-${activeTeacherIndex.value}`) as HTMLSelectElement | null
    el?.focus()
  })
}

function removeTeacher(courseIndex: number, teacherIndex: number) {
  const block = courseBlocks.value[courseIndex]
  if (!block) return
  block.teachers.splice(teacherIndex, 1)
  if (block.teachers.length === 1) {
    block.teachers[0].periods_per_week = Number(block.periods_per_week) || 1
  }
  if (activeTeacherIndex.value === teacherIndex) {
    activeTeacherIndex.value = block.teachers.length ? 0 : null
  }
}

function loadClassSettings() {
  try {
    const savedSettings = localStorage.getItem('classSettings')
    if (!savedSettings) return
    const settings = JSON.parse(savedSettings)
    if (settings.timeSlots && settings.timeSlots.length > 0) {
      timeSlots.value = settings.timeSlots.map((slot: any) => ({
        time: String(slot.startTime || '').slice(0, 5),
        duration: Number(slot.duration) > 0 ? Number(slot.duration) : 45,
        kind: slot.kind === 'break' ? 'break' : 'class',
        name: slot.name ? String(slot.name) : undefined,
      }))
    }
  } catch {
    // keep defaults
  }
}

function teachingSlots() {
  return timeSlots.value
    .filter((slot) => slot.kind !== 'break')
    .map((slot) => ({ start_time: slot.time, duration_minutes: slot.duration }))
}

function flattenItems() {
  return courseBlocks.value.flatMap((block) =>
    block.teachers
      .filter((row) => row.teacher_id)
      .map((row) => ({
        course_id: block.course_id,
        teacher_id: row.teacher_id,
        periods_per_week: Math.max(1, Number(row.periods_per_week) || 1),
      })),
  )
}

function demandSignature() {
  return courseBlocks.value
    .map(
      (block) =>
        `${block.course_id}|${block.periods_per_week}|${block.teachers.map((row) => row.teacher_id).join(',')}`,
    )
    .join(';')
}

function applyEqualSplit() {
  for (const block of courseBlocks.value) {
    const rows = block.teachers.filter((row) => row.teacher_id)
    const total = Math.max(1, Number(block.periods_per_week) || 1)
    if (!rows.length) continue
    const base = Math.floor(total / rows.length)
    const extra = total % rows.length
    rows.forEach((row, index) => {
      row.periods_per_week = base + (index < extra ? 1 : 0)
    })
  }
}

function demandError(opts?: { requireWeek?: boolean }): string | null {
  if (!selectedGroupId.value) return t('scheduleManagement.noGroupSelected')
  if (!courseBlocks.value.length) return t('scheduleAuto.noDemands')
  for (const block of courseBlocks.value) {
    if (!block.course_id) return t('scheduleManagement.validation.subjectRequired')
    if (!Number.isInteger(Number(block.periods_per_week)) || Number(block.periods_per_week) < 1) {
      return t('scheduleAuto.periodsRequired')
    }
    if (!block.teachers.length) return t('scheduleAuto.teachersRequired')
    for (const row of block.teachers) {
      if (!row.teacher_id) return t('scheduleManagement.validation.teacherRequired')
    }
  }
  if (opts?.requireWeek) {
    if (!weeklyRequired.value) return t('scheduleAuto.noSlots')
    if (assignedPeriods.value !== weeklyRequired.value) {
      return t('scheduleAuto.weeklyMismatch', { required: weeklyRequired.value, assigned: assignedPeriods.value })
    }
  }
  return null
}

function splitError(): string | null {
  const demand = demandError({ requireWeek: true })
  if (demand) return demand
  for (const block of courseBlocks.value) {
    const rows = block.teachers.filter((row) => row.teacher_id)
    const total = Number(block.periods_per_week) || 0
    let sum = 0
    for (const row of rows) {
      const value = Number(row.periods_per_week)
      if (!Number.isInteger(value) || value < 1) return t('scheduleAuto.periodsRequired')
      sum += value
    }
    if (sum !== total) return t('scheduleAuto.teacherSplitMismatch')
  }
  if (splitAssigned.value !== weeklyRequired.value) {
    return t('scheduleAuto.weeklyMismatch', { required: weeklyRequired.value, assigned: splitAssigned.value })
  }
  return null
}

function demandsToBlocks(rows: ScheduleLessonDemand[]): CourseBlock[] {
  const order: string[] = []
  const byCourse = new Map<string, ScheduleLessonDemand[]>()
  for (const row of rows) {
    const courseId = String(row.course_id)
    if (!byCourse.has(courseId)) {
      byCourse.set(courseId, [])
      order.push(courseId)
    }
    byCourse.get(courseId)!.push(row)
  }
  return order.map((courseId) => {
    const list = byCourse.get(courseId) || []
    const periods = list.reduce((sum, row) => sum + (Number(row.periods_per_week) || 0), 0)
    return {
      key: newKey(),
      course_id: courseId,
      periods_per_week: periods || 1,
      teachers: list.map((row) => ({
        key: newKey(),
        teacher_id: String(row.teacher_id),
        periods_per_week: Number(row.periods_per_week) || 1,
      })),
    }
  })
}

const fetchGroups = async () => {
  try {
    loadingGroups.value = true
    groupsError.value = ''
    const groupsData = await groupService.getActive()
    groups.value = (groupsData || []).map((group) => ({
      id: group.id,
      name: group.name,
      ageRangeLabel: formatGroupAgeRangeLabel(
        group.age_range_min,
        group.age_range_max,
        t('groupManagement.years'),
      ),
      level_id: resolveFeeLevelId(group) || null,
      level: group.level || null,
    }))
  } catch {
    groups.value = []
    groupsError.value = t('scheduleManagement.groupsLoadFailed')
    feedback.error(t('scheduleManagement.groupsLoadFailed'))
  } finally {
    loadingGroups.value = false
  }
}

const fetchTeachers = async () => {
  try {
    const allUsers = await userService.getAllUsers()
    teachers.value = allUsers
      .filter((user) => {
        if (user.isActive === false) return false
        const roles = Array.isArray(user.roles)
          ? user.roles
          : typeof user.roles === 'string'
            ? user.roles.split(',').map((r) => r.trim())
            : []
        return user.role === 'teacher' || roles.includes('teacher')
      })
      .map((teacher) => ({
        id: teacher.id,
        fullName: teacher.fullName || teacherDisplayName(teacher, ''),
      }))
  } catch {
    teachers.value = []
  }
}

const fetchCourses = async () => {
  try {
    const coursesData = await courseService.getAllCourses()
    courses.value = (coursesData || [])
      .filter((course) => isCourseSchedulable(course))
      .map((course) => ({
        id: course.id,
        name: courseDisplayName(course, ''),
        levelId: resolveFeeLevelId(course) || null,
        kind: String(course.course_kind || 'milestone').toLowerCase(),
      }))
      .filter((course) => course.id && course.name)
  } catch {
    courses.value = []
  }
}

function mapScheduleRow(row: any): GridClass | null {
  const day = normalizeScheduleDayKey(row.day_of_week || row.day)
  if (!day) return null
  return {
    id: String(row.id || `${day}-${row.start_time || row.startTime}-${row.course_id || ''}`),
    day,
    startTime: toScheduleHm(row.start_time || row.startTime),
    subjectLabel: courseDisplayName(row.course, '—'),
    teacherLabel: teacherDisplayName(row.teacher, '—'),
  }
}

const fetchDemands = async (groupId: string) => {
  try {
    const rows = await scheduleAutoService.getDemands(groupId)
    courseBlocks.value = demandsToBlocks(rows)
    seedMissingDefaultCourses()
    lastSplitSignature.value = demandSignature()
    activeCourseIndex.value = courseBlocks.value.length ? 0 : null
    activeTeacherIndex.value = 0
  } catch {
    courseBlocks.value = []
    feedback.error(t('scheduleAuto.loadFailed'))
  }
}

const fetchSaved = async (groupId: string) => {
  try {
    const rows = await scheduleService.getSchedulesByGroup(groupId)
    savedClasses.value = rows.map(mapScheduleRow).filter((row): row is GridClass => row != null)
  } catch {
    savedClasses.value = []
  }
}

function getClassForTimeAndDay(time: string, day: string) {
  return currentSchedule.value.find((cls) => cls.startTime === time && cls.day === day)
}

function apiPayload(error: unknown): Record<string, any> {
  if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
    const data = error.response.data as Record<string, any>
    if (data.message && typeof data.message === 'object') return data.message
    return data
  }
  return {}
}

function showGenerateError(error: unknown) {
  const payload = apiPayload(error)
  const code = String(payload.message || payload.code || '')
  if (code === 'GROUP_OVERLOAD') {
    feedback.error(t('scheduleAuto.groupOverload', { needed: payload.needed, available: payload.available }))
    return
  }
  if (code === 'TEACHER_OVERLOAD') {
    feedback.error(
      t('scheduleAuto.teacherOverload', {
        name: payload.teacherName || '',
        needed: payload.needed,
        available: payload.available,
      }),
    )
    return
  }
  if (code === 'NO_LESSONS' || code === 'NO_DEMANDS') {
    feedback.error(t('scheduleAuto.noDemands'))
    return
  }
  if (code === 'NO_SLOTS') {
    feedback.error(t('scheduleAuto.noSlots'))
    return
  }
  if (code === 'UNSOLVABLE') {
    feedback.error(t('scheduleAuto.unsolvable'))
    return
  }
  if (code === 'DUPLICATE_DEMAND') {
    feedback.error(t('scheduleAuto.duplicateCourse'))
    return
  }
  feedback.error(t('scheduleAuto.generateFailed'))
}

async function persistDemands(opts?: { silent?: boolean; draft?: boolean }) {
  const error = opts?.draft ? demandError() : splitError()
  if (error) {
    if (!opts?.silent) feedback.error(error)
    return false
  }
  if (!flattenItems().length) {
    if (!opts?.silent) feedback.error(t('scheduleAuto.noDemands'))
    return false
  }
  if (!selectedGroupId.value) return false
  try {
    savingDemand.value = true
    const saved = await scheduleAutoService.replaceDemands(selectedGroupId.value, flattenItems())
    if (!opts?.silent) {
      courseBlocks.value = demandsToBlocks(saved)
    }
    lastSplitSignature.value = demandSignature()
    return true
  } catch (err) {
    const payload = apiPayload(err)
    if (!opts?.silent) {
      const message = payload.message
      if (String(message || '') === 'DUPLICATE_DEMAND') {
        feedback.error(t('scheduleAuto.duplicateCourse'))
      } else if (typeof message === 'string' && message.trim() && message !== 'API request failed') {
        feedback.error(message)
      } else {
        feedback.error(t('scheduleAuto.saveDemandFailed'))
      }
    }
    return false
  } finally {
    savingDemand.value = false
  }
}

async function saveSplitCounts() {
  await persistDemands({ silent: true })
}

async function goToSplit() {
  const error = demandError()
  if (error) {
    feedback.error(error)
    return
  }
  const signature = demandSignature()
  if (signature !== lastSplitSignature.value) {
    applyEqualSplit()
    lastSplitSignature.value = signature
  }
  const ok = await persistDemands({ draft: true })
  if (!ok) return
  activeTab.value = 'split'
}

function goPrevious() {
  if (activeTab.value === 'grid') {
    activeTab.value = 'split'
    return
  }
  activeTab.value = 'demand'
}

async function goToGrid() {
  const error = splitError()
  if (error) {
    feedback.error(error)
    activeTab.value = 'split'
    return
  }
  const ok = await persistDemands()
  if (!ok) {
    activeTab.value = 'split'
    return
  }
  activeTab.value = 'grid'
  if (selectedGroupId.value) {
    await fetchSaved(selectedGroupId.value)
  }
}

async function runGenerate(apply: boolean) {
  if (!(await persistDemands())) {
    activeTab.value = 'split'
    return
  }
  if (apply) {
    const ok = await feedback.confirm({
      title: t('scheduleAuto.apply'),
      message: t('scheduleAuto.applyConfirm'),
      confirmLabel: t('scheduleAuto.apply'),
      danger: true,
    })
    if (!ok) return
  }
  try {
    generating.value = true
    const result = await scheduleAutoService.generate({
      group_id: selectedGroupId.value,
      apply,
      days: weekDays.map((day) => day.key),
      slots: teachingSlots(),
    })
    const mapped = result.placements
      .map((row: ScheduleAutoPlacement) => mapScheduleRow(row))
      .filter((row): row is GridClass => row != null)
    if (apply) {
      previewClasses.value = null
      await fetchSaved(selectedGroupId.value)
      feedback.success(t('scheduleAuto.applySuccess'))
    } else {
      previewClasses.value = mapped
    }
  } catch (error) {
    showGenerateError(error)
  } finally {
    generating.value = false
  }
}

watch(selectedGroupId, async (groupId) => {
  previewClasses.value = null
  courseBlocks.value = []
  savedClasses.value = []
  lastSplitSignature.value = ''
  activeTab.value = 'demand'
  activeCourseIndex.value = null
  if (!groupId) return
  await Promise.all([fetchDemands(groupId), fetchSaved(groupId)])
})

function resolveGroupId(): string {
  const fromQuery = String(route.query.group || '').trim()
  if (fromQuery && groups.value.some((group) => String(group.id) === fromQuery)) return fromQuery
  const stored = getSelectedScheduleGroupId()
  if (stored && groups.value.some((group) => String(group.id) === stored)) return stored
  return groups.value[0] ? String(groups.value[0].id) : ''
}

onMounted(async () => {
  loadClassSettings()
  await Promise.all([fetchGroups(), fetchTeachers(), fetchCourses()])
  selectedGroupId.value = resolveGroupId()
  if (selectedGroupId.value) setSelectedScheduleGroupId(selectedGroupId.value)
})
</script>
