<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-elev">
        <div class="fk-empty-panel">
          <p>{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="loadProgressData">
            {{ $t('common.retry') }}
          </button>
        </div>
      </div>

      <template v-else>
        <div class="mx-auto w-full max-w-3xl space-y-8">
          <header class="space-y-4">
            <h1 class="fk-display text-[2rem] font-bold leading-tight text-navy-800 sm:text-4xl">
              {{ $t('parent.progress') }}
            </h1>
            <div v-if="progressData.length > 1" class="flex flex-wrap gap-3">
              <button
                v-for="childProgress in progressData"
                :key="childProgress.student.id"
                type="button"
                class="fk-fchip"
                :class="selectedProgressChildId === childProgress.student.id ? 'fk-fchip--active' : ''"
                :aria-pressed="selectedProgressChildId === childProgress.student.id"
                @click="selectChild(childProgress.student.id)"
              >
                {{ childChipLabel(childProgress) }}
              </button>
            </div>
          </header>

          <div v-if="!progressData.length" class="fk-elev">
            <div class="fk-empty-panel">
              <p>{{ $t('parent.noChildren') }}</p>
            </div>
          </div>

          <template v-else>

          <section class="fk-elev flex flex-col gap-2" :aria-label="$t('parent.overallProgress')">
            <div class="fk-tile">
              <span class="fk-tile__label">{{ $t('parent.completed') }}</span>
              <span class="fk-tile__value fk-tile__value--lead" dir="ltr">{{ metricCounts.completed }}</span>
            </div>
            <div class="fk-tile">
              <span class="fk-tile__label">{{ $t('parent.inProgress') }}</span>
              <span class="fk-tile__value" dir="ltr">{{ metricCounts.inProgress }}</span>
            </div>
            <div class="fk-tile">
              <span class="fk-tile__label">{{ $t('parent.notStarted') }}</span>
              <span class="fk-tile__value" dir="ltr">{{ metricCounts.notStarted }}</span>
            </div>
          </section>

          <section :aria-label="$t('parent.milestones')">
            <h2 class="fk-display mb-1 text-xl font-bold leading-7 text-navy-800">
              {{ $t('parent.milestones') }}
            </h2>

            <div v-if="!selectedRows.length" class="fk-elev">
              <div class="fk-empty-panel">
                <p>{{ $t('parent.noProgress') }}</p>
              </div>
            </div>

            <div v-else class="flex flex-col">
              <div
                v-for="row in paginatedItems"
                :key="row.id"
                class="fk-sched__row"
              >
                <span
                  class="fk-sched__dot"
                  :class="statusDotClass(row.status)"
                  aria-hidden="true"
                >
                  {{ statusDotGlyph(row.status) }}
                </span>
                <div class="min-w-0 flex-1">
                  <button
                    v-if="row.detail"
                    type="button"
                    class="w-full text-start"
                    :aria-expanded="expandedRowId === row.id"
                    @click="toggleRow(row.id)"
                  >
                    <p class="fk-sched__title">{{ row.label }}</p>
                    <p class="fk-sched__meta">{{ getStatusText(row.status) }}</p>
                    <p
                      v-if="expandedRowId === row.id"
                      class="mt-1 text-xs leading-5 text-fikr-ink-muted"
                    >
                      {{ row.detail }}
                    </p>
                  </button>
                  <template v-else>
                    <p class="fk-sched__title">{{ row.label }}</p>
                    <p class="fk-sched__meta">{{ getStatusText(row.status) }}</p>
                  </template>
                </div>
              </div>
            </div>

            <FikrPagination
              class="mt-4"
              :page="currentPage"
              :pages="totalPages"
              :show="selectedRows.length > 0"
              @update:page="goToPage"
            />
          </section>
          </template>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { parentService } from '@/services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>({})
const selectedProgressChildId = ref<string | null>(null)
const expandedRowId = ref('')

const progressData = computed(() => dashboardData.value.progress || [])

const selectedChildProgress = computed(() => {
  if (!selectedProgressChildId.value) return progressData.value[0]
  return progressData.value.find((p: any) => p.student.id === selectedProgressChildId.value) || progressData.value[0]
})

function childChipLabel(childProgress: any) {
  const student = childProgress?.student
  if (!student) return t('parent.childName')
  const name = (student.firstName || '').trim() || t('parent.childName')
  const fromGroups = student.groups?.map((g: { name: string }) => g.name).join(', ')
  const group = formatParentGroupNames(fromGroups || student.groupNames, '')
  return group ? `${name} · ${group}` : name
}

const selectedItems = computed(() => selectedChildProgress.value?.progress || [])

const metricCounts = computed(() => {
  const list = selectedItems.value
  return {
    completed: list.filter((p: any) => p.status === 'completed').length,
    inProgress: list.filter((p: any) => p.status === 'in_progress').length,
    notStarted: list.filter((p: any) => p.status === 'not_started' || !p.status).length,
  }
})

const selectedRows = computed(() =>
  selectedItems.value.map((progress: any) => ({
    id: String(progress.id),
    label: progress.milestone?.title || progress.milestone?.name || t('parent.milestones'),
    status: progress.status || 'not_started',
    detail: String(progress.teacher_notes || '').trim() || undefined,
  })),
)

const {
  currentPage,
  paginatedItems,
  totalPages,
  goToPage,
} = useClientPagination(selectedRows)

function selectChild(id: string) {
  selectedProgressChildId.value = id
  expandedRowId.value = ''
  currentPage.value = 1
}

function toggleRow(id: string) {
  expandedRowId.value = expandedRowId.value === id ? '' : id
}

function statusDotClass(status: string) {
  if (status === 'completed') return 'fk-sched__dot--paid'
  if (status === 'in_progress') return 'fk-sched__dot--wait'
  return 'fk-sched__dot--future'
}

function statusDotGlyph(status: string) {
  if (status === 'completed') return '✓'
  if (status === 'in_progress') return '◔'
  return ''
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return t('parent.completed')
    case 'in_progress':
      return t('parent.inProgress')
    case 'not_started':
      return t('parent.notStarted')
    default:
      return t('parent.notStarted')
  }
}

const loadProgressData = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await parentService.getMyDashboardData()
    dashboardData.value = data
    if (data.progress?.length) {
      selectedProgressChildId.value = data.progress[0].student.id
    }
  } catch (err: any) {
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProgressData()
})
</script>
