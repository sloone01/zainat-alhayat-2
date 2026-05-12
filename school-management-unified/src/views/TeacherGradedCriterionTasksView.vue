<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header (matches TeacherWeeklySessionsView) -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('gradedCriterionTasks.title') }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              {{ $t('gradedCriterionTasks.subtitle') }}
            </p>
          </div>
          <div class="flex shrink-0">
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              :disabled="loading"
              @click="refreshAll"
            >
              <svg
                class="w-4 h-4 me-2"
                :class="{ 'animate-spin': loading }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ loading ? $t('common.loading') : $t('common.refresh') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading && !selectedCourseId" class="bg-white shadow rounded-lg p-12 flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>

      <div
        v-else-if="eligibleCourses.length === 0"
        class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 shadow-sm"
      >
        {{ $t('gradedCriterionTasks.noEligibleCourses') }}
      </div>

      <template v-else>
        <!-- Course filter -->
        <div class="bg-white shadow rounded-lg p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('gradedCriterionTasks.selectCourse') }}
          </label>
          <select
            v-model="selectedCourseId"
            class="block w-full max-w-xl border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            @change="onCourseChange"
          >
            <option value="">{{ $t('gradedCriterionTasks.selectPlaceholder') }}</option>
            <option v-for="c in eligibleCourses" :key="c.course_id" :value="c.course_id">
              {{ c.course_name }}
            </option>
          </select>
        </div>

        <div v-if="selectedCourseId && loading" class="bg-white shadow rounded-lg p-12 flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>

        <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
          {{ error }}
        </div>

        <div
          v-else-if="selectedCourseId && !loading && !error && !summary.length"
          class="bg-white shadow rounded-lg p-8 text-center text-sm text-gray-600 border border-gray-200"
        >
          {{ $t('gradedCriterionTasks.noCriteriaConfigured') }}
        </div>

        <div v-else-if="selectedCourseId && summary.length" class="space-y-6">
          <section
            v-for="block in summary"
            :key="block.criterion_id"
            class="bg-white shadow rounded-lg overflow-hidden border border-gray-200"
          >
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ block.label }}</h2>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ $t('gradedCriterionTasks.semester') }} {{ block.semester_index + 1 }}
                  <span v-if="block.semester_title">— {{ block.semester_title }}</span>
                </p>
              </div>
              <button
                type="button"
                class="text-sm font-medium text-primary-600 hover:text-primary-800 focus:outline-none focus:underline"
                @click="openSyncModal(block)"
              >
                {{ $t('gradedCriterionTasks.syncBreakdown') }}
              </button>
            </div>

            <div class="divide-y divide-gray-200">
              <div v-for="g in block.groups" :key="g.group_id" class="px-6 py-5 space-y-4">
                <h3 class="text-base font-semibold text-gray-900">{{ g.group_name }}</h3>
                <ul class="space-y-3">
                  <li
                    v-for="task in g.tasks"
                    :key="task.id"
                    class="flex flex-col sm:flex-row sm:items-center gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100/80 transition-colors"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900">
                        {{ task.description || $t('gradedCriterionTasks.defaultTaskLabel') }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        <span v-if="task.due_date">{{ $t('gradedCriterionTasks.due') }}: {{ task.due_date }}</span>
                        <span v-else>{{ $t('gradedCriterionTasks.noDueDate') }}</span>
                        <span v-if="task.is_system_default" class="ms-2 text-amber-700">
                          ({{ $t('gradedCriterionTasks.systemDefault') }})
                        </span>
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        @click="openEdit(task)"
                      >
                        {{ $t('common.edit') }}
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        @click="removeTask(task.id)"
                      >
                        {{ $t('common.delete') }}
                      </button>
                    </div>
                  </li>
                </ul>
                <button
                  type="button"
                  class="inline-flex items-center px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  @click="openAppend(block.criterion_id, g.group_id)"
                >
                  + {{ $t('gradedCriterionTasks.addTask') }}
                </button>
              </div>
            </div>
          </section>
        </div>
      </template>

      <!-- Append / edit modal -->
      <div
        v-if="formModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50 overflow-y-auto p-4"
        @click.self="formModal.open = false"
      >
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200"
          @click.stop
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ formModal.title }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('gradedCriterionTasks.description') }}
              </label>
              <textarea
                v-model="formModal.description"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('gradedCriterionTasks.dueDate') }}
              </label>
              <input
                v-model="formModal.dueDate"
                type="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              @click="formModal.open = false"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              @click="submitFormModal"
            >
              {{ $t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Sync breakdown modal -->
      <div
        v-if="syncModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50 overflow-y-auto p-4"
        @click.self="syncModal.open = false"
      >
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-gray-200 max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('gradedCriterionTasks.syncTitle') }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ syncModal.criterionLabel }}</p>
          <div class="mt-4 space-y-4">
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
            <div v-for="(line, idx) in syncModal.lines" :key="idx" class="flex gap-2 items-start flex-wrap sm:flex-nowrap">
              <input
                v-model="line.description"
                type="text"
                class="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                :placeholder="$t('gradedCriterionTasks.lineDescription')"
              />
              <input
                v-model="line.due_date"
                type="date"
                class="w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button type="button" class="text-red-600 hover:text-red-800 text-sm font-medium px-2" @click="syncModal.lines.splice(idx, 1)">
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
          <div class="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              @click="syncModal.open = false"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              @click="submitSync"
            >
              {{ $t('gradedCriterionTasks.applySync') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
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
