<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ isEditing ? $t('courseManagement.editCourse') : $t('courseManagement.addCourse') }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ $t('courseManagement.description') }}</p>
        </div>
        <button @click="goBack" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          {{ $t('common.back') }}
        </button>
      </div>

      <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div class="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-5">
          <h2 class="text-xl font-semibold text-gray-900">{{ isEditing ? $t('courseManagement.editCourse') : $t('courseManagement.addCourse') }}</h2>
        </div>

        <form @submit.prevent="submitCourse" class="space-y-6 p-6">
          <div class="rounded-xl border border-gray-200 bg-gray-50/70 p-5">
            <h4 class="mb-4 text-base font-semibold text-gray-900">{{ $t('courseManagement.courseInfo') }}</h4>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ $t('courseManagement.courseTitle') }} *</label>
                <input v-model="formData.title" required :placeholder="$t('courseManagement.courseTitlePlaceholder')" class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ $t('courseManagement.category') }} *</label>
                <div class="relative">
                  <select v-model="formData.category" required class="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500">
                    <option value="">{{ $t('courseManagement.selectCategory') }}</option>
                    <option value="language">{{ $t('courseManagement.language') }}</option>
                    <option value="mathematics">{{ $t('courseManagement.mathematics') }}</option>
                    <option value="science">{{ $t('courseManagement.science') }}</option>
                    <option value="art">{{ $t('courseManagement.art') }}</option>
                    <option value="music">{{ $t('courseManagement.music') }}</option>
                    <option value="physicalEducation">{{ $t('courseManagement.physicalEducation') }}</option>
                    <option value="socialStudies">{{ $t('courseManagement.socialStudies') }}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 end-3 flex items-center"><svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg></div>
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ $t('courseManagement.status') }} *</label>
                <div class="relative">
                  <select v-model="formData.status" required class="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500">
                    <option value="draft">{{ $t('courseManagement.draft') }}</option>
                    <option value="active">{{ $t('courseManagement.active') }}</option>
                    <option value="published">{{ $t('courseManagement.published') }}</option>
                    <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 end-3 flex items-center"><svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg></div>
                </div>
              </div>
              <div class="md:col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ $t('courseManagement.courseDescription') }}</label>
                <textarea v-model="formData.description" rows="3" :placeholder="$t('courseManagement.courseDescriptionPlaceholder')" class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3"><p class="text-xs font-medium text-purple-700">{{ $t('courseManagement.phases') }}</p><p class="mt-1 text-xl font-semibold text-purple-900">{{ formData.phases.length }}</p></div>
            <div class="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3"><p class="text-xs font-medium text-blue-700">{{ $t('courseManagement.totalDuration') }}</p><p class="mt-1 text-xl font-semibold text-blue-900">{{ totalDuration }} {{ $t('courseManagement.weeks') }}</p></div>
            <div class="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3"><p class="text-xs font-medium text-emerald-700">{{ $t('courseManagement.status') }}</p><p class="mt-1 text-xl font-semibold text-emerald-900">{{ $t(`courseManagement.${formData.status}`) }}</p></div>
          </div>

          <div class="rounded-xl border border-gray-200 bg-white p-5">
            <div class="mb-4 flex items-center justify-between">
              <h4 class="text-base font-semibold text-gray-900">{{ $t('courseManagement.phases') }}</h4>
              <button type="button" @click="addPhase" class="inline-flex items-center rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200">{{ $t('courseManagement.addPhase') }}</button>
            </div>
            <div v-if="formData.phases.length > 0" class="space-y-3">
              <div v-for="(phase, index) in formData.phases" :key="phase.id || index" class="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <div class="mb-3 flex items-start justify-between">
                  <h5 class="text-sm font-medium text-gray-900">{{ phase.title || `${$t('courseManagement.phase')} ${index + 1}` }}</h5>
                  <div class="flex items-center gap-1">
                    <button v-if="index > 0" type="button" @click="movePhaseUp(index)" class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">↑</button>
                    <button v-if="index < formData.phases.length - 1" type="button" @click="movePhaseDown(index)" class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">↓</button>
                    <button type="button" @click="removePhase(index)" class="rounded-md p-1 text-red-400 hover:bg-red-50 hover:text-red-600">✕</button>
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div class="md:col-span-2"><input v-model="phase.title" required :placeholder="$t('courseManagement.phaseTitlePlaceholder')" class="block w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500" /></div>
                  <div><input v-model.number="phase.duration" type="number" min="1" max="52" required class="block w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500" /></div>
                  <div class="md:col-span-3"><textarea v-model="phase.description" rows="2" :placeholder="$t('courseManagement.phaseDescriptionPlaceholder')" class="block w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500" /></div>
                </div>
              </div>
            </div>
            <div v-else class="py-6 text-center text-sm text-gray-500">{{ $t('courseManagement.noPhasesDescription') }}</div>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
            <button type="button" @click="goBack" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">{{ $t('common.cancel') }}</button>
            <button type="submit" :disabled="saving" class="rounded-lg border border-transparent bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:opacity-60">
              {{ saving ? $t('common.saving') : (isEditing ? $t('common.update') : $t('common.create')) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import courseService from '@/services/course.service'
import type { CourseFormData } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const courseId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!courseId.value)
const saving = ref(false)

const formData = ref<CourseFormData>({
  title: '',
  description: '',
  category: '',
  status: 'draft',
  milestones: [],
  phases: []
})

const totalDuration = computed(() => formData.value.phases.reduce((total, phase) => total + (phase.duration || 0), 0))

const goBack = () => router.push('/courses')

const addPhase = () => {
  formData.value.phases.push({ id: Date.now(), title: '', description: '', duration: 1, milestones: [] })
}

const removePhase = (index: number) => formData.value.phases.splice(index, 1)

const movePhaseUp = (index: number) => {
  const phase = formData.value.phases.splice(index, 1)[0]
  formData.value.phases.splice(index - 1, 0, phase)
}

const movePhaseDown = (index: number) => {
  const phase = formData.value.phases.splice(index, 1)[0]
  formData.value.phases.splice(index + 1, 0, phase)
}

const loadCourse = async () => {
  if (!courseId.value) return
  const course = await courseService.getCourseById(courseId.value)
  const phases = await courseService.getPhasesByCourse(courseId.value)
  formData.value = {
    title: course.name || course.title || '',
    description: course.description || '',
    category: course.category || 'general',
    status: course.is_active ? 'active' : 'inactive',
    milestones: [],
    phases: phases.map((phase) => ({
      id: phase.id as any,
      title: phase.name || '',
      description: phase.description || '',
      duration: phase.duration_weeks || 1,
      milestones: phase.milestones || []
    }))
  }
}

const submitCourse = async () => {
  saving.value = true
  try {
    const coursePayload = {
      name: formData.value.title,
      description: formData.value.description,
      is_active: formData.value.status === 'active',
      school_id: 1
    }

    if (isEditing.value && courseId.value) {
      await courseService.updateCourse(courseId.value, coursePayload)
      const existingPhases = await courseService.getPhasesByCourse(courseId.value)
      const existingIds = new Set(existingPhases.map((p) => p.id))
      const formIds = new Set(formData.value.phases.filter((p) => typeof p.id === 'string').map((p) => p.id as any))

      for (let i = 0; i < formData.value.phases.length; i++) {
        const phase = formData.value.phases[i]
        const payload = { name: phase.title, description: phase.description, order: i + 1, courseId: courseId.value }
        if (typeof phase.id === 'string' && existingIds.has(phase.id)) await courseService.updatePhase(phase.id, payload)
        else await courseService.createPhase(payload)
      }

      for (const phase of existingPhases) {
        if (!formIds.has(phase.id)) await courseService.deletePhase(phase.id)
      }
    } else {
      const newCourse = await courseService.createCourse(coursePayload)
      for (let i = 0; i < formData.value.phases.length; i++) {
        const phase = formData.value.phases[i]
        await courseService.createPhase({ name: phase.title, description: phase.description, order: i + 1, courseId: newCourse.id })
      }
    }

    router.push('/courses')
  } catch (error: any) {
    alert(error?.message || 'Failed to save course')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isEditing.value) await loadCourse()
})
</script>
