<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <template v-else-if="!course">
        <FikrPageHeader
          :title="$t('courseManagement.courseNotFound')"
          :subtitle="$t('courseManagement.courseNotFoundDescription')"
        >
          <template #leading>
            <router-link
              :to="coursesBasePath"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              :aria-label="$t('courseManagement.backToCourses')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
          </template>
        </FikrPageHeader>
      </template>

      <template v-else>
        <FikrPageHeader
          :title="course.title"
          :subtitle="categoryLabel"
        >
          <template #leading>
            <router-link
              :to="coursesBasePath"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              :aria-label="$t('courseManagement.backToCourses')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
          </template>
        </FikrPageHeader>

        <!-- Stepper (same chrome as course editor) -->
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

        <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
          <div
            class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-3"
          >
            <div class="flex flex-wrap items-center gap-2">
              <h2
                v-if="activeTab === 'phases'"
                class="text-sm font-semibold text-gray-900"
              >
                {{ $t('courseManagement.phasesSection') }}
              </h2>
              <template v-else>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="getCourseStatusBadge(courseLifecycleStatus(course))"
                >
                  {{ $t(`courseManagement.${courseLifecycleStatus(course)}`) }}
                </span>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="
                    courseActivity(course) === 'inactive'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-emerald-50 text-emerald-800'
                  "
                >
                  {{
                    courseActivity(course) === 'inactive'
                      ? $t('courseManagement.notActive')
                      : $t('courseManagement.active')
                  }}
                </span>
              </template>
            </div>
            <div class="flex shrink-0 flex-nowrap items-center gap-2">
              <router-link
                v-if="courseKind === 'standalone' && course?.id"
                :to="{ path: '/course-materials', query: { course: String(course.id) } }"
                class="fk-btn fk-btn--pearl fk-btn--sm"
              >
                {{ $t('courseMaterials.navTitle') }}
              </router-link>
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm"
                @click="editCourse"
              >
                {{ $t('courseManagement.editCourse') }}
              </button>
            </div>
          </div>

          <!-- Tab: course info (read-only, same grid as editor) -->
          <div v-show="activeTab === 'info'" class="space-y-6 p-6 lg:space-y-8">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
              <div class="space-y-2">
                <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.courseTitle') }}</p>
                <p class="fk-field bg-gray-50 text-gray-900">{{ course.title || '—' }}</p>
              </div>
              <div class="space-y-2">
                <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.courseLevel') }}</p>
                <p class="fk-field bg-gray-50 text-gray-900">{{ levelLabel }}</p>
              </div>
              <div class="space-y-2">
                <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.category') }}</p>
                <p class="fk-field bg-gray-50 text-gray-900">{{ categoryLabel }}</p>
              </div>
              <div class="space-y-2">
                <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.status') }}</p>
                <p class="fk-field bg-gray-50 text-gray-900">
                  {{
                    courseActivity(course) === 'inactive'
                      ? $t('courseManagement.notActive')
                      : $t('courseManagement.active')
                  }}
                </p>
              </div>
              <div class="space-y-2 md:col-span-2">
                <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.courseDescription') }}</p>
                <p class="fk-field min-h-[4.5rem] whitespace-pre-wrap bg-gray-50 text-gray-900">
                  {{ course.description || $t('courseManagement.noDescription') }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-4">
              <div class="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p class="text-[11px] text-gray-500">{{ $t('courseManagement.totalPhases') }}</p>
                <p class="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">{{ course.phases?.length || 0 }}</p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p class="text-[11px] text-gray-500">{{ $t('courseManagement.totalMilestones') }}</p>
                <p class="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">{{ totalMilestones }}</p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p class="text-[11px] text-gray-500">{{ $t('courseManagement.createdDate') }}</p>
                <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ formatDate(course.createdDate) }}</p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p class="text-[11px] text-gray-500">{{ $t('courseManagement.lastModified') }}</p>
                <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ formatDate(course.lastModified) }}</p>
              </div>
            </div>
          </div>

          <!-- Tab: phases + milestones (accordion like editor) -->
          <div v-show="activeTab === 'phases'" class="space-y-6 p-6">
            <div v-if="course.phases?.length" class="space-y-3">
              <article
                v-for="(phase, index) in course.phases"
                :key="phase.id || index"
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
                        {{ phase.milestones?.length || 0 }}
                        {{ $t('courseManagement.milestones') }}
                      </p>
                    </div>
                  </div>
                  <div class="flex shrink-0 items-center gap-1" @click.stop>
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
                      <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.phaseTitle') }}</p>
                      <p class="fk-field bg-gray-50 text-gray-900">
                        {{ phase.title || '—' }}
                      </p>
                    </div>
                    <div class="space-y-2">
                      <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.phaseDescription') }}</p>
                      <p class="fk-field min-h-[2.75rem] whitespace-pre-wrap bg-gray-50 text-gray-900">
                        {{ phase.description || '—' }}
                      </p>
                    </div>
                  </div>

                  <div class="border-t border-gray-100 pt-4">
                    <div class="mb-3">
                      <h5 class="text-xs font-semibold text-gray-700">
                        {{ $t('courseManagement.milestones') }}
                      </h5>
                      <p class="mt-0.5 text-[11px] text-gray-500">{{ $t('courseManagement.milestonesSectionHint') }}</p>
                    </div>

                    <div v-if="phase.milestones?.length" class="space-y-2">
                      <div
                        v-for="(milestone, mIndex) in phase.milestones"
                        :key="milestone.id || mIndex"
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
                            <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.milestoneTitle') }}</p>
                            <p class="fk-field bg-gray-50 text-gray-900">{{ milestone.title || '—' }}</p>
                          </div>
                          <div class="space-y-2">
                            <p class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('courseManagement.milestoneDescription') }}</p>
                            <p class="fk-field min-h-[2.75rem] whitespace-pre-wrap bg-gray-50 text-gray-900">
                              {{ milestone.description || '—' }}
                            </p>
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
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-5">
            <router-link
              :to="coursesBasePath"
              class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ $t('courseManagement.backToCourses') }}
            </router-link>
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
                v-if="activeTab === 'info'"
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                @click="activeTab = 'phases'"
              >
                {{ $t('common.next') }}
                <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import courseService from '@/services/course.service'
import { paymentConfigService, type SchoolPaymentLevel } from '@/services/payment-config.service'
import { getStoredSchoolId } from '@/utils/auth-token'
import { courseActivity, courseLifecycleStatus } from '@/utils/course-status'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const route = useRoute()
const router = useRouter()

const courseKind = computed<'milestone' | 'standalone'>(() =>
  route.meta.courseKind === 'standalone' ? 'standalone' : 'milestone',
)
const coursesBasePath = computed(() =>
  courseKind.value === 'standalone' ? '/standalone-courses' : '/courses',
)

const loading = ref(true)
const course = ref<any>(null)
const levels = ref<SchoolPaymentLevel[]>([])
const activeTab = ref<'info' | 'phases'>('info')
const activePhaseIndex = ref<number | null>(null)
const activeMilestoneIndex = ref<number | null>(null)

const categoryLabel = computed(() => {
  const cat = course.value?.category
  if (!cat) return '—'
  const key = `courseManagement.${cat}`
  const translated = t(key)
  return translated === key ? cat : translated
})

const levelLabel = computed(() => {
  const fromRelation = course.value?.level
  const lv =
    fromRelation?.id || fromRelation?.code || fromRelation?.name
      ? fromRelation
      : levels.value.find((item) => item.id === course.value?.level_id)
  if (!lv) return '—'
  const code = (lv.code || '').trim()
  const name = (lv.name || '').trim()
  if (code && name && code !== name) return `${code} — ${name}`
  return name || code || '—'
})

const totalMilestones = computed(
  () =>
    course.value?.phases?.reduce(
      (sum: number, phase: any) => sum + (phase.milestones?.length || 0),
      0,
    ) || 0,
)

function setActivePhase(index: number) {
  if (activePhaseIndex.value === index) {
    activePhaseIndex.value = null
    activeMilestoneIndex.value = null
    return
  }
  activePhaseIndex.value = index
  const milestones = course.value?.phases?.[index]?.milestones ?? []
  activeMilestoneIndex.value = milestones.length ? 0 : null
}

function setActiveMilestone(mIndex: number) {
  if (activeMilestoneIndex.value === mIndex) {
    activeMilestoneIndex.value = null
    return
  }
  activeMilestoneIndex.value = mIndex
}

const loadCourse = async () => {
  loading.value = true
  try {
    const courseId = route.params.id as string
    const courseData = await courseService.getCourseById(courseId)
    course.value = {
      ...courseData,
      title: courseData.name || courseData.title,
      category: courseData.category || 'general',
      status: courseLifecycleStatus(courseData),
      createdDate: courseData.created_at,
      lastModified: courseData.updated_at,
      totalDuration:
        courseData.estimated_duration_weeks ||
        courseData.phases?.reduce(
          (total: number, phase: any) => total + (phase.duration_weeks || 0),
          0,
        ) ||
        0,
      phases:
        courseData.phases?.map((phase: any) => ({
          ...phase,
          title: phase.name || phase.title,
          duration: phase.duration_weeks || phase.duration,
          milestones:
            phase.milestones?.map((milestone: any) => ({
              ...milestone,
              title: milestone.name || milestone.title,
            })) || [],
        })) || [],
    }
    // Drafts are not viewable — send staff to the editor instead.
    if (courseLifecycleStatus(course.value) === 'draft' && course.value.id) {
      await router.replace(`${coursesBasePath.value}/${course.value.id}/edit`)
      return
    }
    if (course.value.phases?.length) {
      activePhaseIndex.value = 0
      activeMilestoneIndex.value = course.value.phases[0].milestones?.length ? 0 : null
    }
  } catch (error) {
    console.error('Error loading course:', error)
    course.value = null
  } finally {
    loading.value = false
  }
}

const getCourseStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    active: 'bg-primary-100 text-primary-800',
    draft: 'bg-amber-100 text-amber-900',
    published: 'bg-primary-100 text-primary-800',
    archived: 'bg-red-100 text-red-800',
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-GB')
  } catch {
    return dateString
  }
}

const editCourse = () => {
  if (!course.value?.id) return
  router.push(`${coursesBasePath.value}/${course.value.id}/edit`)
}

const loadLevels = async () => {
  const sid = getStoredSchoolId()
  if (!sid) {
    levels.value = []
    return
  }
  try {
    levels.value = await paymentConfigService.listLevels(sid)
  } catch {
    levels.value = []
  }
}

onMounted(() => {
  void Promise.all([loadCourse(), loadLevels()])
})
</script>
