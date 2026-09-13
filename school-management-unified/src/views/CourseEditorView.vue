<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="
          isEditing
            ? $t('courseManagement.editCourse')
            : courseKind === 'standalone'
              ? $t('standaloneCourses.create')
              : $t('courseManagement.addCourse')
        "
        :subtitle="
          courseKind === 'standalone'
            ? $t('standaloneCourses.editorHint')
            : $t('courseManagement.editorHint')
        "
      />

      <!-- Stepper (same chrome as /students/register) -->
      <section class="mb-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex min-w-0 flex-col items-center">
            <ol class="flex w-full max-w-md items-center justify-between gap-1" role="tablist">
              <li class="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  role="tab"
                  class="flex w-full flex-col items-center gap-2 text-center focus:outline-none"
                  :aria-selected="activeTab === 'info'"
                  @click="activeTab = 'info'"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition"
                    :class="
                      activeTab === 'info'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : activeTab === 'phases'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-500'
                    "
                  >
                    <svg
                      v-if="activeTab === 'phases'"
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
                    :class="activeTab === 'info' ? 'text-primary-800' : 'text-gray-500'"
                  >
                    {{ $t('courseManagement.courseInfo') }}
                  </span>
                </button>
                <div
                  class="mx-1 h-1 flex-1 rounded-full sm:mx-2"
                  :class="activeTab === 'phases' ? 'bg-primary-500' : 'bg-gray-200'"
                  aria-hidden="true"
                />
              </li>
              <li class="flex min-w-0 flex-1 items-center justify-center">
                <button
                  type="button"
                  role="tab"
                  class="flex w-full flex-col items-center gap-2 text-center focus:outline-none"
                  :aria-selected="activeTab === 'phases'"
                  @click="activeTab = 'phases'"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition"
                    :class="
                      activeTab === 'phases'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500'
                    "
                  >
                    2
                  </span>
                  <span
                    class="hidden text-[11px] font-semibold sm:block"
                    :class="activeTab === 'phases' ? 'text-primary-800' : 'text-gray-500'"
                  >
                    {{ $t('courseManagement.phasesSection') }}
                  </span>
                </button>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <form
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
        @submit.prevent
      >
        <div
          v-if="activeTab === 'phases'"
          class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-3"
        >
          <h2 class="text-sm font-semibold text-gray-900">
            {{ $t('courseManagement.phasesSection') }}
          </h2>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
            @click="addPhase"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('courseManagement.addPhase') }}
          </button>
        </div>

        <!-- Tab: course info -->
        <div v-show="activeTab === 'info'" class="space-y-6 p-6 lg:space-y-8">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            <div class="space-y-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-title">
                <span class="text-red-500">*</span>
                {{ $t('courseManagement.courseTitle') }}
              </label>
              <input
                id="course-title"
                v-model="formData.title"
                :required="activeTab === 'info'"
                class="fk-field"
              >
            </div>
            <div class="space-y-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-level">
                <span class="text-red-500">*</span>
                {{ $t('courseManagement.courseLevel') }}
              </label>
              <select
                id="course-level"
                v-model="formData.level_id"
                class="fk-field"
              >
                <option disabled value="">{{ $t('courseManagement.selectCourseLevel') }}</option>
                <option v-for="lv in levels" :key="lv.id" :value="String(lv.id)">
                  {{ lv.code }} — {{ lv.name }}
                </option>
              </select>
              <p v-if="!levels.length" class="mt-1 text-xs text-amber-800">
                {{ $t('courseManagement.noCourseLevels') }}
              </p>
            </div>
            <div class="space-y-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-category">
                <span class="text-red-500">*</span>
                {{ $t('courseManagement.category') }}
              </label>
              <select
                id="course-category"
                v-model="formData.category"
                :required="activeTab === 'info'"
                class="fk-field"
              >
                <option value="">{{ $t('courseManagement.selectCategory') }}</option>
                <option value="language">{{ $t('courseManagement.language') }}</option>
                <option value="mathematics">{{ $t('courseManagement.mathematics') }}</option>
                <option value="science">{{ $t('courseManagement.science') }}</option>
                <option value="art">{{ $t('courseManagement.art') }}</option>
                <option value="music">{{ $t('courseManagement.music') }}</option>
                <option value="physicalEducation">{{ $t('courseManagement.physicalEducation') }}</option>
                <option value="socialStudies">{{ $t('courseManagement.socialStudies') }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-status">
                {{ $t('courseManagement.status') }}
              </label>
              <select
                id="course-status"
                v-model="formData.activity"
                class="fk-field"
              >
                <option value="active">{{ $t('courseManagement.active') }}</option>
                <option value="inactive">{{ $t('courseManagement.notActive') }}</option>
              </select>
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-description">
                {{ $t('courseManagement.courseDescription') }}
              </label>
              <textarea
                id="course-description"
                v-model="formData.description"
                rows="3"
                :placeholder="$t('courseManagement.courseDescriptionPlaceholder')"
                class="fk-field resize-none"
              />
            </div>
          </div>
        </div>

        <!-- Tab: learning phases + milestones (accordion; all may be collapsed) -->
        <div v-show="activeTab === 'phases'" class="space-y-6 p-6">
          <div v-if="formData.phases.length > 0" class="space-y-3">
            <article
              v-for="(phase, index) in formData.phases"
              :key="phaseKey(phase, index)"
              class="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
              :class="activePhaseIndex === index ? 'border-primary-200 ring-primary-100' : ''"
            >
              <header
                class="flex cursor-pointer items-start justify-between gap-2 px-4 py-3 hover:bg-gray-50/80"
                :class="activePhaseIndex === index ? 'border-b border-gray-100 bg-primary-50/40' : ''"
                @click="setActivePhase(index)"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                    {{ index + 1 }}
                  </span>
                  <div class="min-w-0">
                    <h4 class="truncate text-sm font-semibold text-gray-900">
                      {{ phase.title || `${$t('courseManagement.phase')} ${index + 1}` }}
                    </h4>
                    <p
                      v-if="activePhaseIndex !== index"
                      class="mt-0.5 text-[11px] text-gray-500"
                    >
                      {{ phase.milestones.length }}
                      {{ $t('courseManagement.milestones') }}
                    </p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-1" @click.stop>
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                    :aria-label="$t('courseManagement.deletePhase')"
                    @click="removePhase(index)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    :aria-expanded="activePhaseIndex === index"
                    :aria-label="
                      activePhaseIndex === index
                        ? $t('courseManagement.collapsePhase')
                        : $t('courseManagement.expandPhase')
                    "
                    @click="setActivePhase(index)"
                  >
                    <svg
                      class="h-4 w-4 transition-transform duration-200"
                      :class="activePhaseIndex === index ? 'rotate-180' : ''"
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

              <div v-if="activePhaseIndex === index" class="space-y-4 p-4">
                <div class="grid grid-cols-1 gap-4 lg:gap-6">
                  <div class="space-y-2">
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="`course-phase-title-${index}`">
                      {{ $t('courseManagement.phaseTitle') }}
                    </label>
                    <input
                      :id="`course-phase-title-${index}`"
                      v-model="phase.title"
                      :required="activeTab === 'phases'"
                      :placeholder="$t('courseManagement.phaseTitlePlaceholder')"
                      class="fk-field"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('courseManagement.phaseDescription') }}</label>
                    <textarea
                      v-model="phase.description"
                      rows="2"
                      :placeholder="$t('courseManagement.phaseDescriptionPlaceholder')"
                      class="fk-field resize-none"
                    />
                  </div>
                </div>

                <div class="border-t border-gray-100 pt-4">
                  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 class="text-xs font-semibold text-gray-700">
                        {{ $t('courseManagement.milestones') }}
                      </h5>
                      <p class="mt-0.5 text-[11px] text-gray-500">{{ $t('courseManagement.milestonesSectionHint') }}</p>
                    </div>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-800 hover:bg-primary-100"
                      @click="addMilestone(index)"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {{ $t('courseManagement.addMilestone') }}
                    </button>
                  </div>

                  <div v-if="phase.milestones.length" class="space-y-2">
                    <div
                      v-for="(milestone, mIndex) in phase.milestones"
                      :key="milestoneKey(milestone, mIndex)"
                      class="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      :class="activeMilestoneIndex === mIndex ? 'border-primary-200' : ''"
                    >
                      <div
                        class="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50"
                        :class="activeMilestoneIndex === mIndex ? 'border-b border-gray-100 bg-primary-50/30' : ''"
                        @click="setActiveMilestone(mIndex)"
                      >
                        <div class="flex min-w-0 items-center gap-2">
                          <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-800">
                            {{ mIndex + 1 }}
                          </span>
                          <span class="truncate text-sm font-medium text-gray-800">
                            {{ milestone.title || `${$t('courseManagement.milestone')} ${mIndex + 1}` }}
                          </span>
                        </div>
                        <div class="flex shrink-0 items-center gap-1" @click.stop>
                          <button
                            type="button"
                            class="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                            :aria-label="$t('courseManagement.deleteMilestone')"
                            @click="removeMilestone(index, mIndex)"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            class="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            :aria-expanded="activeMilestoneIndex === mIndex"
                            :aria-label="
                              activeMilestoneIndex === mIndex
                                ? $t('courseManagement.collapseMilestone')
                                : $t('courseManagement.expandMilestone')
                            "
                            @click="setActiveMilestone(mIndex)"
                          >
                            <svg
                              class="h-4 w-4 transition-transform duration-200"
                              :class="activeMilestoneIndex === mIndex ? 'rotate-180' : ''"
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

                      <div v-if="activeMilestoneIndex === mIndex" class="grid grid-cols-1 gap-4 p-3 lg:gap-6">
                        <div class="space-y-2">
                          <label
                            class="mb-1.5 block text-xs font-medium text-gray-600"
                            :for="`course-milestone-title-${index}-${mIndex}`"
                          >
                            <span class="text-red-500">*</span>
                            {{ $t('courseManagement.milestoneTitle') }}
                          </label>
                          <input
                            :id="`course-milestone-title-${index}-${mIndex}`"
                            v-model="milestone.title"
                            :required="activeTab === 'phases'"
                            :placeholder="$t('courseManagement.milestoneTitlePlaceholder')"
                            class="fk-field"
                          >
                        </div>
                        <div class="space-y-2">
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">
                            {{ $t('courseManagement.milestoneDescription') }}
                          </label>
                          <textarea
                            v-model="milestone.description"
                            rows="2"
                            :placeholder="$t('courseManagement.milestoneDescriptionPlaceholder')"
                            class="fk-field resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else
                    class="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center"
                  >
                    <p class="text-xs font-medium text-gray-700">{{ $t('courseManagement.noMilestones') }}</p>
                    <p class="mt-1 text-[11px] text-gray-500">{{ $t('courseManagement.noMilestonesDescription') }}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="fk-empty min-h-[16rem]">
            <div class="fk-empty__icon">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="fk-empty__title">{{ $t('courseManagement.noPhases') }}</h3>
            <p class="fk-empty__desc">{{ $t('courseManagement.noPhasesDescription') }}</p>
            <button
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm mt-4"
              @click="addPhase"
            >
              {{ $t('courseManagement.createFirstPhase') }}
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-5">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="goBack"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('common.cancel') }}
          </button>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-if="activeTab === 'phases'"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              @click="activeTab = 'info'"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ $t('common.previous') }}
            </button>
            <button
              v-if="isDraftLifecycle"
              type="button"
              :disabled="saving"
              class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              @click="saveCourse(true)"
            >
              <svg v-if="saving && savingAsDraft" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{
                saving && savingAsDraft
                  ? $t('courseManagement.savingDraft')
                  : $t('courseManagement.saveDraft')
              }}
            </button>
            <button
              v-if="activeTab === 'info'"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition"
              :class="
                isDraftLifecycle
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              "
              @click="activeTab = 'phases'"
            >
              {{ $t('common.next') }}
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              v-if="activeTab === 'phases' && isDraftLifecycle"
              type="button"
              :disabled="saving || !canSubmit"
              class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              :title="!canSubmit ? $t('courseManagement.submitBlockedHint') : undefined"
              @click="saveCourse(false)"
            >
              <svg v-if="saving && !savingAsDraft" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{
                saving && !savingAsDraft
                  ? $t('courseManagement.submitting')
                  : $t('courseManagement.submitCourse')
              }}
            </button>
            <button
              v-if="!isDraftLifecycle"
              type="button"
              :disabled="saving"
              class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              @click="saveCourse(false)"
            >
              <svg v-if="saving && !savingAsDraft" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ saving && !savingAsDraft ? $t('common.saving') : $t('common.update') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import courseService from '@/services/course.service'
import { paymentConfigService, type SchoolPaymentLevel } from '@/services/payment-config.service'
import { getStoredSchoolId } from '@/utils/auth-token'
import { useFeedback } from '@/composables/useFeedback'
import { getErrorMessage } from '@/utils/error-reporting'
import {
  courseActivity,
  courseLifecycleStatus,
  nextCourseLifecycleStatus,
} from '@/utils/course-status'
import { resolveFeeLevelId } from '@/utils/fee-level'

type EditorMilestone = {
  id?: string | number
  title: string
  description: string
  targetWeek: number
  isRequired: boolean
}

type EditorPhase = {
  id?: string | number
  title: string
  description: string
  duration: number
  milestones: EditorMilestone[]
}

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const courseKind = computed<'milestone' | 'standalone'>(() =>
  route.meta.courseKind === 'standalone' ? 'standalone' : 'milestone',
)
const coursesBasePath = computed(() =>
  courseKind.value === 'standalone' ? '/standalone-courses' : '/courses',
)
const schoolId = computed(() => getStoredSchoolId() || '')
const levels = ref<SchoolPaymentLevel[]>([])

const courseId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!courseId.value)
const saving = ref(false)
const savingAsDraft = ref(false)
const activeTab = ref<'info' | 'phases'>('info')
/** Accordion: only one phase body open at a time. */
const activePhaseIndex = ref<number | null>(null)
/** Accordion within the open phase: only one milestone body open. */
const activeMilestoneIndex = ref<number | null>(null)

const formData = ref({
  title: '',
  description: '',
  category: '',
  level_id: '',
  status: 'draft',
  activity: 'active' as 'active' | 'inactive',
  phases: [] as EditorPhase[],
})

/** Draft lifecycle: Save as draft + Submit. After submit, Save only. Active/Not active is always on the details step. */
const isDraftLifecycle = computed(() => !isEditing.value || formData.value.status === 'draft')

/** Submit needs title, level, category, and at least one phase with a titled milestone (learning goal). */
const canSubmit = computed(() => {
  if (!formData.value.title.trim() || !formData.value.category || !formData.value.level_id) return false
  if (formData.value.phases.length === 0) return false
  return formData.value.phases.every(
    (phase) =>
      phase.title.trim() &&
      phase.milestones.length > 0 &&
      phase.milestones.every((m) => m.title.trim()),
  )
})

const phaseKey = (phase: EditorPhase, index: number) => String(phase.id ?? `new-phase-${index}`)
const milestoneKey = (milestone: EditorMilestone, index: number) =>
  String(milestone.id ?? `new-ms-${index}`)

const loadedSnapshot = ref('')

function formSnapshot() {
  return JSON.stringify({
    title: formData.value.title,
    description: formData.value.description,
    category: formData.value.category,
    level_id: formData.value.level_id,
    status: formData.value.status,
    activity: formData.value.activity,
    phases: formData.value.phases,
  })
}

const isDirty = computed(() => formSnapshot() !== loadedSnapshot.value)

const goBack = async () => {
  if (isDirty.value) {
    const ok = await feedback.confirm({
      title: t('courseManagement.discardTitle'),
      message: t('courseManagement.discardMessage'),
      confirmLabel: t('courseManagement.discardConfirm'),
      danger: true,
    })
    if (!ok) return
  }
  router.push(coursesBasePath.value)
}

const emptyMilestone = (): EditorMilestone => ({
  id: Date.now() + Math.random(),
  title: '',
  description: '',
  targetWeek: 1,
  isRequired: true,
})

function focusPhaseTitle(index: number) {
  nextTick(() => {
    const el = document.getElementById(`course-phase-title-${index}`) as HTMLInputElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.focus()
  })
}

function focusMilestoneTitle(phaseIndex: number, mIndex: number) {
  nextTick(() => {
    const el = document.getElementById(
      `course-milestone-title-${phaseIndex}-${mIndex}`,
    ) as HTMLInputElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.focus()
  })
}

function setActivePhase(index: number) {
  if (activePhaseIndex.value === index) {
    activePhaseIndex.value = null
    activeMilestoneIndex.value = null
    return
  }
  activePhaseIndex.value = index
  const milestones = formData.value.phases[index]?.milestones ?? []
  activeMilestoneIndex.value = milestones.length ? 0 : null
}

function setActiveMilestone(mIndex: number) {
  if (activeMilestoneIndex.value === mIndex) {
    activeMilestoneIndex.value = null
    return
  }
  activeMilestoneIndex.value = mIndex
}

const addPhase = () => {
  formData.value.phases.push({
    id: Date.now(),
    title: '',
    description: '',
    duration: 1,
    milestones: [],
  })
  activeTab.value = 'phases'
  const idx = formData.value.phases.length - 1
  activePhaseIndex.value = idx
  activeMilestoneIndex.value = null
  focusPhaseTitle(idx)
}

const removePhase = (index: number) => {
  formData.value.phases.splice(index, 1)
  if (!formData.value.phases.length) {
    activePhaseIndex.value = null
    activeMilestoneIndex.value = null
    return
  }
  if (activePhaseIndex.value == null) return
  if (activePhaseIndex.value === index) {
    const next = Math.min(index, formData.value.phases.length - 1)
    activePhaseIndex.value = next
    activeMilestoneIndex.value = formData.value.phases[next].milestones.length ? 0 : null
  } else if (activePhaseIndex.value > index) {
    activePhaseIndex.value -= 1
  }
}

const addMilestone = (phaseIndex: number) => {
  formData.value.phases[phaseIndex].milestones.push(emptyMilestone())
  activePhaseIndex.value = phaseIndex
  const mIndex = formData.value.phases[phaseIndex].milestones.length - 1
  activeMilestoneIndex.value = mIndex
  focusMilestoneTitle(phaseIndex, mIndex)
}

const removeMilestone = (phaseIndex: number, milestoneIndex: number) => {
  formData.value.phases[phaseIndex].milestones.splice(milestoneIndex, 1)
  if (activePhaseIndex.value !== phaseIndex) return
  const remaining = formData.value.phases[phaseIndex].milestones.length
  if (!remaining) {
    activeMilestoneIndex.value = null
    return
  }
  if (activeMilestoneIndex.value == null) return
  if (activeMilestoneIndex.value === milestoneIndex) {
    activeMilestoneIndex.value = Math.min(milestoneIndex, remaining - 1)
  } else if (activeMilestoneIndex.value > milestoneIndex) {
    activeMilestoneIndex.value -= 1
  }
}

function mapApiMilestone(m: any): EditorMilestone {
  return {
    id: m.id,
    title: m.name || m.title || '',
    description: m.description || '',
    targetWeek: Number(m.target_week ?? m.targetWeek ?? 1) || 1,
    isRequired: m.isRequired !== false,
  }
}

const loadCourse = async () => {
  if (!courseId.value) return
  const course = await courseService.getCourseById(courseId.value)
  const phases = await courseService.getPhasesByCourse(courseId.value)
  formData.value = {
    title: course.name || course.title || '',
    description: course.description || '',
    category: course.category || 'general',
    level_id: resolveFeeLevelId(course),
    status: courseLifecycleStatus(course),
    activity: courseActivity(course),
    phases: phases.map((phase) => ({
      id: phase.id,
      title: phase.name || '',
      description: phase.description || '',
      duration: phase.duration_weeks || 1,
      milestones: (phase.milestones || []).map(mapApiMilestone),
    })),
  }
  if (formData.value.phases.length) {
    activePhaseIndex.value = 0
    activeMilestoneIndex.value = formData.value.phases[0].milestones.length ? 0 : null
  } else {
    activePhaseIndex.value = null
    activeMilestoneIndex.value = null
  }
}

async function syncMilestonesForPhase(phaseId: string, milestones: EditorMilestone[]) {
  const existing = await courseService.getMilestonesByPhase(phaseId)
  const existingIds = new Set(existing.map((m) => m.id))
  const formIds = new Set(
    milestones.filter((m) => typeof m.id === 'string').map((m) => m.id as string),
  )

  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i]
    const payload = {
      name: m.title,
      description: m.description,
      order: i + 1,
      phaseId,
      isRequired: m.isRequired !== false,
      target_week: m.targetWeek,
      targetWeek: m.targetWeek,
    }
    if (typeof m.id === 'string' && existingIds.has(m.id)) {
      await courseService.updateMilestone(m.id, payload)
    } else {
      await courseService.createMilestone(payload)
    }
  }

  for (const m of existing) {
    if (!formIds.has(m.id)) await courseService.deleteMilestone(m.id)
  }
}

const saveCourse = async (asDraft: boolean) => {
  if (!formData.value.title.trim()) {
    activeTab.value = 'info'
    feedback.error(t('courseManagement.saveError'), t('common.error'))
    return
  }

    if (asDraft === false && isDraftLifecycle.value && !canSubmit.value) {
      const missingInfo =
        !formData.value.title.trim() || !formData.value.category || !formData.value.level_id
      activeTab.value = missingInfo ? 'info' : 'phases'
      feedback.error(t('courseManagement.submitBlockedHint'), t('common.error'))
      return
    }

    const nextStatus = nextCourseLifecycleStatus({
      asDraft,
      current: formData.value.status,
    })

    saving.value = true
    savingAsDraft.value = asDraft
    try {
    const coursePayload = {
      name: formData.value.title,
      title: formData.value.title,
      description: formData.value.description,
      is_active: formData.value.activity !== 'inactive',
      status: nextStatus,
      category:
        formData.value.category ||
        (courseKind.value === 'standalone' ? 'standalone' : 'general'),
      level_id: formData.value.level_id ? String(formData.value.level_id) : null,
      school_id: schoolId.value,
      course_kind: courseKind.value,
      estimated_duration_weeks: formData.value.phases.reduce(
        (sum, p) => sum + (Number(p.duration) || 0),
        0,
      ),
    }

    let createdId: string | undefined
    if (isEditing.value && courseId.value) {
      await courseService.updateCourse(courseId.value, coursePayload)
      const existingPhases = await courseService.getPhasesByCourse(courseId.value)
      const existingIds = new Set(existingPhases.map((p) => p.id))
      const formIds = new Set(
        formData.value.phases.filter((p) => typeof p.id === 'string').map((p) => p.id as string),
      )

      for (let i = 0; i < formData.value.phases.length; i++) {
        const phase = formData.value.phases[i]
        const payload = {
          name: phase.title,
          description: phase.description,
          order: i + 1,
          courseId: courseId.value,
          duration_weeks: Number(phase.duration) || 1,
        }

        let savedPhaseId: string
        if (typeof phase.id === 'string' && existingIds.has(phase.id)) {
          await courseService.updatePhase(phase.id, payload)
          savedPhaseId = phase.id
        } else {
          const created = await courseService.createPhase(payload)
          savedPhaseId = created.id
          phase.id = created.id
        }
        await syncMilestonesForPhase(savedPhaseId, phase.milestones)
      }

      for (const phase of existingPhases) {
        if (!formIds.has(phase.id)) {
          const orphans = phase.milestones || []
          for (const m of orphans) {
            if (m?.id) await courseService.deleteMilestone(m.id)
          }
          await courseService.deletePhase(phase.id)
        }
      }
    } else {
      const newCourse = await courseService.createCourse(coursePayload)
      createdId = newCourse.id
      for (let i = 0; i < formData.value.phases.length; i++) {
        const phase = formData.value.phases[i]
        const created = await courseService.createPhase({
          name: phase.title,
          description: phase.description,
          order: i + 1,
          courseId: newCourse.id,
          duration_weeks: Number(phase.duration) || 1,
        } as any)
        await syncMilestonesForPhase(created.id, phase.milestones)
      }
    }

    const submittedFromDraft = isDraftLifecycle.value
    formData.value.status = nextStatus
    loadedSnapshot.value = formSnapshot()
    feedback.success(
      asDraft
        ? t('courseManagement.draftSaved')
        : submittedFromDraft
          ? t('courseManagement.submittedOk')
          : t('common.savedSuccessfully'),
      t('common.success'),
    )
    if (asDraft) {
      if (createdId) {
        await router.replace(`${coursesBasePath.value}/${createdId}/edit`)
      }
    } else {
      await router.push(coursesBasePath.value)
    }
  } catch (error: unknown) {
    feedback.error(getErrorMessage(error, t('courseManagement.saveError')), t('common.error'))
  } finally {
    saving.value = false
    savingAsDraft.value = false
  }
}

const loadLevels = async () => {
  const sid = schoolId.value
  if (!sid) return
  try {
    levels.value = (await paymentConfigService.listLevels(sid)).filter((lv) => lv.is_active !== false)
  } catch {
    levels.value = []
  }
}

onMounted(async () => {
  await Promise.all([loadLevels(), isEditing.value ? loadCourse() : Promise.resolve()])
  loadedSnapshot.value = formSnapshot()
})
</script>
