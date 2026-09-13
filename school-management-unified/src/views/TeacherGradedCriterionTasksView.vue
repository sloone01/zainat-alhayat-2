<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('gradedCriterionTasks.title')"
        :subtitle="$t('gradedCriterionTasks.subtitle')"
      />

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('gradedCriterionTasks.selectCourse') }}</h2>
            <p v-if="eligibleCourses.length" class="fk-card__meta">
              {{ $t('courseManagement.coursesCount', { count: eligibleCourses.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.refresh')"
              :disabled="loading"
              @click="refreshAll"
            >
              <svg
                class="h-4 w-4"
                :class="{ 'animate-spin': loading }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </header>

        <div class="p-5 sm:p-6">
          <div v-if="loading && !selectedCourseId" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="eligibleCourses.length === 0"
            class="py-16 text-center"
          >
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('gradedCriterionTasks.noEligibleCourses') }}</h3>
          </div>

          <template v-else>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">
              {{ $t('gradedCriterionTasks.selectCourse') }}
            </label>
            <select
              v-model="selectedCourseId"
              class="fk-field max-w-xl"
              @change="onCourseChange"
            >
              <option value="">{{ $t('gradedCriterionTasks.selectPlaceholder') }}</option>
              <option v-for="c in eligibleCourses" :key="c.course_id" :value="c.course_id">
                {{ c.course_name }}
              </option>
            </select>
          </template>
        </div>
      </section>

      <div v-if="selectedCourseId && loading" class="fk-card">
        <div class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
          <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        {{ error }}
      </div>

      <div
        v-else-if="selectedCourseId && !loading && !error && !summary.length"
        class="fk-card"
      >
        <div class="px-6 py-16 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-gray-800">{{ $t('gradedCriterionTasks.noCriteriaConfigured') }}</h3>
        </div>
      </div>

      <div v-else-if="selectedCourseId && summary.length" class="space-y-6">
        <section
          v-for="block in summary"
          :key="block.criterion_id"
          class="fk-card overflow-visible"
        >
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ block.label }}</h2>
              <p class="fk-card__meta">
                {{ $t('gradedCriterionTasks.semester') }} {{ block.semester_index + 1 }}
                <span v-if="block.semester_title">— {{ block.semester_title }}</span>
              </p>
            </div>
            <button
              type="button"
              class="fk-btn fk-btn--pearl text-sm"
              @click="openSyncModal(block)"
            >
              {{ $t('gradedCriterionTasks.syncBreakdown') }}
            </button>
          </header>

          <div class="divide-y divide-gray-100">
            <div v-for="g in block.groups" :key="g.group_id" class="space-y-4 px-5 py-5 sm:px-6">
              <h3 class="text-base font-semibold text-gray-900">{{ g.group_name }}</h3>
              <ul class="space-y-3">
                <li
                  v-for="task in g.tasks"
                  :key="task.id"
                  class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100/80 sm:flex-row sm:items-center"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900">
                      {{ task.description || $t('gradedCriterionTasks.defaultTaskLabel') }}
                    </p>
                    <p class="mt-1 text-xs text-gray-500">
                      <span v-if="task.due_date">{{ $t('gradedCriterionTasks.due') }}: {{ task.due_date }}</span>
                      <span v-else>{{ $t('gradedCriterionTasks.noDueDate') }}</span>
                      <span v-if="task.is_system_default" class="ms-2 text-amber-700">
                        ({{ $t('gradedCriterionTasks.systemDefault') }})
                      </span>
                    </p>
                  </div>
                  <div class="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      class="fk-btn fk-btn--pearl text-xs"
                      @click="openEdit(task)"
                    >
                      {{ $t('common.edit') }}
                    </button>
                    <button
                      type="button"
                      class="fk-btn fk-btn--pearl text-xs text-red-700 hover:border-red-200 hover:bg-red-50"
                      @click="removeTask(task.id)"
                    >
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </li>
              </ul>
              <button
                type="button"
                class="fk-btn fk-btn--pearl border-dashed text-sm text-primary-700"
                @click="openAppend(block.criterion_id, g.group_id)"
              >
                + {{ $t('gradedCriterionTasks.addTask') }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <FikrDialog
        :show="formModal.open"
        plain-footer
        :title="formModal.title"
        @close="formModal.open = false"
      >
        <div class="fk-form">
          <div class="fk-form__row">
            <label class="fk-flabel"><span>{{ $t('gradedCriterionTasks.description') }}</span></label>
            <textarea
              v-model="formModal.description"
              rows="3"
              class="fk-field"
            />
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel"><span>{{ $t('gradedCriterionTasks.dueDate') }}</span></label>
            <input
              v-model="formModal.dueDate"
              type="date"
              class="fk-field"
            />
          </div>
        </div>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="formModal.open = false">
            {{ $t('common.cancel') }}
          </button>
          <button type="button" class="fk-btn fk-btn--primary" @click="submitFormModal">
            {{ $t('common.save') }}
          </button>
        </template>
      </FikrDialog>

      <FikrDialog
        :show="syncModal.open"
        plain-footer
        size="md"
        :title="$t('gradedCriterionTasks.syncTitle')"
        :subtitle="syncModal.criterionLabel"
        @close="syncModal.open = false"
      >
        <div class="space-y-4">
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="syncModal.applyAll" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            {{ $t('gradedCriterionTasks.applyAllClasses') }}
          </label>
          <div v-if="!syncModal.applyAll" class="space-y-2">
            <p class="text-xs font-medium text-gray-600">{{ $t('gradedCriterionTasks.pickClasses') }}</p>
            <label v-for="g in syncModal.groups" :key="g.id" class="flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="syncModal.selectedGroupIds"
                type="checkbox"
                :value="g.id"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {{ g.name }}
            </label>
          </div>
          <p class="text-xs text-gray-500">{{ $t('gradedCriterionTasks.syncHint') }}</p>
          <div v-for="(line, idx) in syncModal.lines" :key="idx" class="flex flex-wrap items-start gap-2 sm:flex-nowrap">
            <input
              v-model="line.description"
              type="text"
              class="fk-field min-w-0 flex-1"
              :placeholder="$t('gradedCriterionTasks.lineDescription')"
            />
            <input
              v-model="line.due_date"
              type="date"
              class="fk-field w-full sm:w-40"
            />
            <button type="button" class="px-2 text-sm font-medium text-red-600 hover:text-red-800" @click="syncModal.lines.splice(idx, 1)">
              ×
            </button>
          </div>
          <button
            type="button"
            class="text-sm font-medium text-primary-600 hover:text-primary-800"
            @click="syncModal.lines.push({ description: '', due_date: '' })"
          >
            + {{ $t('gradedCriterionTasks.addLine') }}
          </button>
        </div>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="syncModal.open = false">
            {{ $t('common.cancel') }}
          </button>
          <button type="button" class="fk-btn fk-btn--primary" @click="submitSync">
            {{ $t('gradedCriterionTasks.applySync') }}
          </button>
        </template>
      </FikrDialog>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import authService from '@/services/auth.service'
import gradedCriterionTaskService from '@/services/graded-criterion-task.service'
import type { CriterionTaskSummary, EligibleGradedCourse, GradedCriterionTaskRow } from '@/services/graded-criterion-task.service'

const { t, locale } = useI18n()
const route = useRoute()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => Number(authService.getStoredUser()?.school_id ?? 1))

const loading = ref(false)
const error = ref('')
const eligibleCourses = ref<EligibleGradedCourse[]>([])
const selectedCourseId = ref('')
const summary = ref<CriterionTaskSummary[]>([])

const formModal = ref({
  open: false,
  title: '',
  mode: 'append' as 'append' | 'edit',
  taskId: '' as string,
  criterionId: '',
  groupId: '',
  description: '',
  dueDate: '',
})

const syncModal = ref({
  open: false,
  criterionId: '',
  criterionLabel: '',
  applyAll: true,
  groups: [] as { id: string; name: string }[],
  selectedGroupIds: [] as string[],
  lines: [] as { description: string; due_date: string }[],
})

async function loadEligible() {
  loading.value = true
  error.value = ''
  try {
    eligibleCourses.value = await gradedCriterionTaskService.getEligibleCourses(schoolId.value)
  } catch (e: any) {
    error.value = e?.message || t('gradedCriterionTasks.loadFailed')
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  if (!selectedCourseId.value) {
    summary.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    summary.value = await gradedCriterionTaskService.getSummary(selectedCourseId.value, schoolId.value)
  } catch (e: any) {
    error.value = e?.message || t('gradedCriterionTasks.loadFailed')
    summary.value = []
  } finally {
    loading.value = false
  }
}

async function refreshAll() {
  await loadEligible()
  if (selectedCourseId.value && eligibleCourses.value.some((c) => c.course_id === selectedCourseId.value)) {
    await loadSummary()
  } else if (selectedCourseId.value) {
    selectedCourseId.value = ''
    summary.value = []
  }
}

function onCourseChange() {
  loadSummary()
}

function openAppend(criterionId: string, groupId: string) {
  formModal.value = {
    open: true,
    title: t('gradedCriterionTasks.addTask'),
    mode: 'append',
    taskId: '',
    criterionId,
    groupId,
    description: '',
    dueDate: '',
  }
}

function openEdit(task: GradedCriterionTaskRow) {
  formModal.value = {
    open: true,
    title: t('gradedCriterionTasks.editTask'),
    mode: 'edit',
    taskId: task.id,
    criterionId: '',
    groupId: '',
    description: task.description || '',
    dueDate: task.due_date || '',
  }
}

async function submitFormModal() {
  try {
    if (formModal.value.mode === 'append') {
      await gradedCriterionTaskService.appendTask({
        graded_criterion_id: formModal.value.criterionId,
        group_id: formModal.value.groupId,
        description: formModal.value.description || undefined,
        due_date: formModal.value.dueDate || null,
      })
    } else {
      await gradedCriterionTaskService.patchTask(formModal.value.taskId, {
        description: formModal.value.description || null,
        due_date: formModal.value.dueDate || null,
      })
    }
    formModal.value.open = false
    await loadSummary()
  } catch (e: any) {
    error.value = e?.message || t('gradedCriterionTasks.saveFailed')
  }
}

async function removeTask(id: string) {
  if (!confirm(t('gradedCriterionTasks.confirmDelete'))) return
  try {
    await gradedCriterionTaskService.deleteTask(id)
    await loadSummary()
  } catch (e: any) {
    error.value = e?.message || t('gradedCriterionTasks.saveFailed')
  }
}

function openSyncModal(block: CriterionTaskSummary) {
  const course = eligibleCourses.value.find((c) => c.course_id === selectedCourseId.value)
  syncModal.value = {
    open: true,
    criterionId: block.criterion_id,
    criterionLabel: block.label,
    applyAll: true,
    groups: course?.groups ? [...course.groups] : [],
    selectedGroupIds: course?.groups?.map((g) => g.id) ?? [],
    lines: [{ description: '', due_date: '' }],
  }
}

async function submitSync() {
  if (!syncModal.value.applyAll && !syncModal.value.selectedGroupIds.length) {
    error.value = t('gradedCriterionTasks.pickAtLeastOneClass')
    return
  }
  const tasksPayload = syncModal.value.lines
    .filter((l) => (l.description || '').trim() || l.due_date)
    .map((l) => ({
      description: l.description?.trim() || undefined,
      due_date: l.due_date || null,
    }))

  try {
    await gradedCriterionTaskService.syncTasks({
      graded_criterion_id: syncModal.value.criterionId,
      apply_to_all_classes: syncModal.value.applyAll,
      group_ids: syncModal.value.applyAll ? undefined : [...syncModal.value.selectedGroupIds],
      tasks: tasksPayload,
    })
    syncModal.value.open = false
    await loadSummary()
  } catch (e: any) {
    error.value = e?.message || t('gradedCriterionTasks.saveFailed')
  }
}

onMounted(async () => {
  await loadEligible()
  const cid = typeof route.query.course_id === 'string' ? route.query.course_id : ''
  if (cid && eligibleCourses.value.some((c) => c.course_id === cid)) {
    selectedCourseId.value = cid
    await loadSummary()
  }
})
</script>
