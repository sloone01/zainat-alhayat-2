<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative max-w-2xl">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('systemSettings.gradesManagement') }}</h1>
          <p class="mt-2 text-sm text-slate-200/95">{{ $t('systemSettings.gradesPageIntro') }}</p>
        </div>
      </section>

      <div class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.02]">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ $t('systemSettings.gradesManagement') }}</h2>
          </div>
          <button
            type="button"
            class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            @click="openAddModal"
          >
            {{ $t('systemSettings.addGrade') }}
          </button>
        </div>

        <div v-if="grades.length" class="overflow-visible rounded-md border border-gray-200">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-xs font-medium text-gray-500">
              <tr>
                <th class="px-4 py-2.5 text-start">{{ $t('common.name') }}</th>
                <th class="px-4 py-2.5 text-start">{{ $t('systemSettings.gradeCode') }}</th>
                <th class="px-4 py-2.5 text-start">{{ $t('systemSettings.description') }}</th>
                <th class="px-4 py-2.5 text-start">{{ $t('common.status') }}</th>
                <th class="px-4 py-2.5 text-end">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="grade in grades" :key="grade.id" class="bg-white">
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">{{ isRTL ? grade.nameAr : grade.nameEn }}</div>
                  <div class="mt-0.5 text-xs text-gray-500">{{ isRTL ? grade.nameEn : grade.nameAr }}</div>
                </td>
                <td class="px-4 py-3 font-mono text-gray-700">{{ grade.code }}</td>
                <td class="px-4 py-3 text-gray-600">{{ grade.description || '—' }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded px-1.5 py-0.5 text-xs font-medium ring-1"
                    :class="grade.isActive
                      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                      : 'bg-slate-50 text-slate-700 ring-slate-200'"
                  >
                    {{ grade.isActive ? $t('settings.active') : $t('settings.inactive') }}
                  </span>
                </td>
                <td class="px-4 py-3 text-end">
                  <RowActionsMenu
                    :open="activeMenuId === grade.id"
                    @toggle="toggleMenu(grade.id)"
                  >
                    <RowActionsItem icon="edit" @click="openEditModal(grade)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem
                      :icon="grade.isActive ? 'archive' : 'activate'"
                      @click="toggleGradeStatus(grade)"
                    >
                      {{ grade.isActive ? $t('groupManagement.deactivate') : $t('groupManagement.activate') }}
                    </RowActionsItem>
                    <RowActionsItem icon="delete" danger @click="deleteGrade(grade)">
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <h3 class="text-sm font-medium text-gray-900">{{ $t('systemSettings.noGradesFound') }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ $t('systemSettings.noGradesDescription') }}</p>
          <button
            type="button"
            class="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            @click="openAddModal"
          >
            {{ $t('systemSettings.createFirstGrade') }}
          </button>
        </div>
      </div>

      <GradeModal
        :show="showGradeModal"
        :grade="editingGrade"
        @close="closeGradeModal"
        @save="saveGrade"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import GradeModal from '@/components/GradeModal.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { gradeService, type CreateGradeData, type Grade } from '@/services/grade.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const grades = ref<Grade[]>([])
const showGradeModal = ref(false)
const editingGrade = ref<Grade | null>(null)
const activeMenuId = ref<string | null>(null)

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function handleClickOutside() {
  activeMenuId.value = null
}

function openAddModal() {
  editingGrade.value = null
  showGradeModal.value = true
}

function openEditModal(grade: Grade) {
  activeMenuId.value = null
  editingGrade.value = { ...grade }
  showGradeModal.value = true
}

function closeGradeModal() {
  showGradeModal.value = false
  editingGrade.value = null
}

async function loadGrades() {
  try {
    grades.value = await gradeService.getAll()
  } catch (error) {
    console.error('Error loading grades:', error)
  }
}

async function saveGrade(data: CreateGradeData) {
  try {
    if (editingGrade.value) {
      await gradeService.update(editingGrade.value.id, {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        code: data.code,
        description: data.description,
      })
    } else {
      const maxOrder = grades.value.length > 0
        ? Math.max(...grades.value.map((g) => g.displayOrder))
        : 0
      await gradeService.create({
        ...data,
        displayOrder: maxOrder + 1,
      })
    }
    closeGradeModal()
    await loadGrades()
  } catch (error) {
    console.error('Error saving grade:', error)
    alert(t('systemSettings.gradeSaveError'))
  }
}

async function toggleGradeStatus(grade: Grade) {
  activeMenuId.value = null
  try {
    await gradeService.update(grade.id, { isActive: !grade.isActive })
    await loadGrades()
  } catch (error) {
    console.error('Error toggling grade status:', error)
    alert(t('systemSettings.gradeSaveError'))
  }
}

async function deleteGrade(grade: Grade) {
  activeMenuId.value = null
  const name = isRTL.value ? grade.nameAr : grade.nameEn
  if (!confirm(t('systemSettings.confirmDeleteGrade', { name }))) return
  try {
    await gradeService.remove(grade.id)
    await loadGrades()
  } catch (error) {
    console.error('Error deleting grade:', error)
    alert(t('systemSettings.gradeSaveError'))
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void loadGrades()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
