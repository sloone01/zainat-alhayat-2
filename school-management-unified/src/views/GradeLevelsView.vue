<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('systemSettings.gradesManagement')"
        :subtitle="$t('systemSettings.gradesPageIntro')"
      />

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('systemSettings.gradesListHeading') }}</h2>
            <p class="fk-card__meta">{{ $t('systemSettings.gradesCount', { count: filteredGrades.length }) }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrToolbarSearch
              v-model="searchQuery"
              id="grades-search-inline"
              :placeholder="$t('systemSettings.searchGradesPlaceholder')"
              :aria-label="$t('common.search')"
            />
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <ListViewModeToggle v-model="viewMode" />
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('systemSettings.addGrade')"
              @click="openAddModal"
            >
              <IconPlus />
            </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="grades.length && !filteredGrades.length" class="fk-empty text-sm text-fikr-ink-soft">
            {{ $t('systemSettings.noGradeFilterResults') }}
          </div>

          <template v-else-if="filteredGrades.length">
            <div v-if="isCards" class="fk-grid">
              <KanbanCard
                v-for="grade in paginatedGrades"
                :key="'card-' + grade.id"
                :title="isRTL ? grade.nameAr : grade.nameEn"
                :description="isRTL ? grade.nameEn : grade.nameAr"
              >
                <template #tags>
                  <KanbanTag :dot="grade.isActive ? 'emerald' : 'gray'">
                    {{ grade.isActive ? $t('settings.active') : $t('settings.inactive') }}
                  </KanbanTag>
                  <KanbanTag dot="navy">{{ grade.code }}</KanbanTag>
                </template>
                <template #actions>
                  <RowActionsMenu
                    :open="activeMenuId === grade.id"
                    placement="up"
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
                </template>
              </KanbanCard>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('common.name') }}</th>
                    <th>{{ $t('systemSettings.gradeCode') }}</th>
                    <th>{{ $t('systemSettings.description') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th class="!text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="grade in paginatedGrades" :key="grade.id">
                    <td>
                      <div class="flex items-center gap-3">
                        <span class="fk-monogram fk-monogram--navy text-xs">{{ (grade.code || '?').slice(0, 3) }}</span>
                        <div class="min-w-0">
                          <div class="font-medium text-fikr-ink">{{ isRTL ? grade.nameAr : grade.nameEn }}</div>
                          <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ isRTL ? grade.nameEn : grade.nameAr }}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="fk-chip fk-chip--outline font-mono" dir="ltr">{{ grade.code }}</span></td>
                    <td class="text-fikr-ink-muted">{{ grade.description || '—' }}</td>
                    <td>
                      <span
                        class="fk-pill"
                        :class="grade.isActive ? 'fk-pill--teal' : 'fk-pill--mist'"
                      >
                        {{ grade.isActive ? $t('settings.active') : $t('settings.inactive') }}
                      </span>
                    </td>
                    <td>
                      <div class="flex justify-end">
                      <RowActionsMenu
                        :open="activeMenuId === grade.id"
                        placement="up"
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
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredGrades.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="fk-empty">
            <div class="fk-empty__icon">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 class="fk-empty__title">{{ $t('systemSettings.noGradesFound') }}</h3>
            <p class="fk-empty__desc">{{ $t('systemSettings.noGradesDescription') }}</p>
            <button type="button" class="fk-btn fk-btn--primary mt-5" @click="openAddModal">
              {{ $t('systemSettings.createFirstGrade') }}
            </button>
          </div>
        </div>
      </section>

      <div
        v-if="showFilters"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('systemSettings.gradesFiltersTitle')"
      >
        <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
        <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
          <div class="fk-drawer__header items-start">
            <div>
              <h3 class="fk-form__title">{{ $t('systemSettings.gradesFiltersTitle') }}</h3>
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
              <label class="fk-flabel" for="grades-search"><span>{{ $t('common.search') }}</span></label>
              <input
                id="grades-search"
                v-model="searchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('systemSettings.searchGradesPlaceholder')"
              >
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="grades-status"><span>{{ $t('common.status') }}</span></label>
              <select id="grades-status" v-model="statusFilter" class="fk-field">
                <option value="all">{{ $t('settings.allStatuses') }}</option>
                <option value="active">{{ $t('settings.active') }}</option>
                <option value="inactive">{{ $t('settings.inactive') }}</option>
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import GradeModal from '@/components/GradeModal.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import FikrToolbarSearch from '@/components/FikrToolbarSearch.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { gradeService, type CreateGradeData, type Grade } from '@/services/grade.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const grades = ref<Grade[]>([])
const showGradeModal = ref(false)
const editingGrade = ref<Grade | null>(null)
const activeMenuId = ref<string | null>(null)
const showFilters = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const hasActiveFilters = computed(() =>
  searchQuery.value.trim().length > 0 || statusFilter.value !== 'all',
)

const filteredGrades = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return grades.value.filter((grade) => {
    if (statusFilter.value === 'active' && !grade.isActive) return false
    if (statusFilter.value === 'inactive' && grade.isActive) return false
    if (!q) return true
    return [grade.nameAr, grade.nameEn, grade.code, grade.description]
      .some((value) => (value || '').toLowerCase().includes(q))
  })
})

const {
  currentPage,
  paginatedItems: paginatedGrades,
  totalPages,
  goToPage,
} = useClientPagination(filteredGrades)

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

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
