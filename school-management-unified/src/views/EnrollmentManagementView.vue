<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('enrollmentManagement.title')"
        :subtitle="$t('enrollmentManagement.subtitle')"
      />

      <div
        v-if="moduleUnavailable"
        class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        {{ $t('common.moduleNotInPlan') }}
      </div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('enrollmentManagement.listHeading') }}</h2>
            <p class="fk-card__meta">{{ $t('enrollmentManagement.applicationsCount', { count: totalEnrollments }) }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('enrollmentManagement.refresh')"
              :disabled="loading"
              @click="loadEnrollments"
            >
              <svg
                class="h-4 w-4"
                :class="{ 'animate-spin': loading && !routePageLoading }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="px-6 py-5">
          <div v-if="loading && !routePageLoading" class="flex flex-col items-center justify-center py-16 text-gray-500">
            <FikrLoader size="sm" />
            <p class="text-sm font-medium">{{ $t('enrollmentManagement.loading') }}</p>
          </div>

          <div
            v-else-if="enrollments.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900">{{ $t('enrollmentManagement.noApplications') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-gray-500">{{ $t('enrollmentManagement.noApplicationsDescription') }}</p>
          </div>

          <template v-else>
            <!-- Cards -->
            <div v-if="viewMode === 'cards'" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KanbanCard
                v-for="enrollment in enrollments"
                :key="enrollment.id"
                :title="enrollment.fullName"
                :description="[$t(`enrollmentManagement.${enrollment.gender}`), enrollment.age ? `${enrollment.age} ${$t('enrollmentManagement.age')}` : '', enrollment.area].filter(Boolean).join(' · ')"
              >
                <template #tags>
                  <KanbanTag :dot="enrollment.status === 'approved' || enrollment.status === 'enrolled' ? 'emerald' : enrollment.status === 'rejected' ? 'red' : enrollment.status === 'draft' ? 'slate' : 'amber'">
                    {{ enrollment.status === 'draft' ? $t('enrollmentManagement.draftPublic') : $t(`enrollmentManagement.${enrollment.status}`) }}
                  </KanbanTag>
                  <KanbanTag v-if="enrollment.status === 'draft'" dot="navy">{{ $t('enrollmentManagement.sourcePublicForm') }}</KanbanTag>
                  <KanbanTag v-if="enrollment.gradeLevel" dot="navy">{{ enrollment.gradeLevel }}</KanbanTag>
                </template>
                <template #meta>
                  <KanbanMeta icon="users">{{ guardianName(enrollment) }}</KanbanMeta>
                  <KanbanMeta icon="calendar">{{ formatDate(enrollment.createdAt) }}</KanbanMeta>
                </template>
                <template #avatars>
                  <KanbanAvatar :initials="studentInitials(enrollment)" />
                </template>
                <template #actions>
                  <RowActionsMenu
                    :open="activeMenuId === enrollment.id"
                    @toggle="toggleMenu(enrollment.id)"
                  >
                    <RowActionsItem icon="view" @click="viewEnrollment(enrollment)">
                      {{ $t('enrollmentManagement.viewDetails') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="hasClaim('enrollments', 'edit')"
                      icon="edit"
                      @click="editEnrollment(enrollment)"
                    >
                      {{ $t('enrollmentManagement.edit') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="hasClaim('enrollments', 'export')"
                      icon="download"
                      @click="downloadWordDocument(enrollment)"
                    >
                      {{ $t('enrollmentManagement.downloadWord') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </template>
              </KanbanCard>
            </div>

            <!-- List -->
            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('enrollmentManagement.student') }}
                    </th>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('enrollmentManagement.guardian') }}
                    </th>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('enrollmentManagement.gradeLevel') }}
                    </th>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('enrollmentManagement.status') }}
                    </th>
                    <th class="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('enrollmentManagement.submittedOn') }}
                    </th>
                    <th class="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {{ $t('enrollmentManagement.actions') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr
                    v-for="enrollment in enrollments"
                    :key="enrollment.id"
                    class="transition hover:bg-primary-50/40"
                  >
                    <td class="whitespace-nowrap px-4 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-700">
                          {{ studentInitials(enrollment) }}
                        </div>
                        <div>
                          <div class="text-sm font-semibold text-gray-900">{{ enrollment.fullName }}</div>
                          <div class="text-xs text-gray-500">
                            {{ $t(`enrollmentManagement.${enrollment.gender}`) }}
                            <span v-if="enrollment.age"> · {{ enrollment.age }} {{ $t('enrollmentManagement.age') }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5">
                      <div class="text-sm font-medium text-gray-900">{{ guardianName(enrollment) }}</div>
                      <div v-if="guardianMobile(enrollment)" class="text-xs text-gray-500">{{ guardianMobile(enrollment) }}</div>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5">
                      <div class="text-sm text-gray-900">{{ enrollment.gradeLevel || '—' }}</div>
                      <div class="text-xs text-gray-500">{{ $t(`enrollmentManagement.${enrollment.enrollmentStatus}`) }}</div>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        :class="getStatusClass(enrollment.status)"
                      >
                        {{ enrollment.status === 'draft' ? $t('enrollmentManagement.draftPublic') : $t(`enrollmentManagement.${enrollment.status}`) }}
                      </span>
                      <span
                        v-if="enrollment.status === 'draft'"
                        class="ms-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {{ $t('enrollmentManagement.sourcePublicForm') }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5 text-sm text-gray-600">
                      {{ formatDate(enrollment.createdAt) }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5 text-end">
                      <RowActionsMenu
                        :open="activeMenuId === enrollment.id"
                        @toggle="toggleMenu(enrollment.id)"
                      >
                        <RowActionsItem icon="view" @click="viewEnrollment(enrollment)">
                          {{ $t('enrollmentManagement.viewDetails') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="hasClaim('enrollments', 'edit')"
                          icon="edit"
                          @click="editEnrollment(enrollment)"
                        >
                          {{ $t('enrollmentManagement.edit') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="hasClaim('enrollments', 'export')"
                          icon="download"
                          @click="downloadWordDocument(enrollment)"
                        >
                          {{ $t('enrollmentManagement.downloadWord') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="enrollments.length > 0"
              @update:page="goToPage"
            />
          </template>
        </div>
      </section>

      <div
        v-if="showFilters"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('common.filter')"
      >
        <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
        <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
          <div class="fk-drawer__header items-start">
            <div>
              <h3 class="fk-form__title">{{ $t('common.filter') }}</h3>
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
              <label class="fk-flabel" for="enrollment-search"><span>{{ $t('enrollmentManagement.search') }}</span></label>
              <input
                id="enrollment-search"
                v-model="filters.search"
                type="search"
                class="fk-field"
                :placeholder="$t('enrollmentManagement.searchPlaceholder')"
              >
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="enrollment-status"><span>{{ $t('enrollmentManagement.status') }}</span></label>
              <select
                id="enrollment-status"
                v-model="filters.status"
                class="fk-field"
              >
                <option value="">{{ $t('enrollmentManagement.allStatuses') }}</option>
                <option value="draft">{{ $t('enrollmentManagement.draftPublic') }}</option>
                <option value="pending">{{ $t('enrollmentManagement.pending') }}</option>
                <option value="approved">{{ $t('enrollmentManagement.approved') }}</option>
                <option value="rejected">{{ $t('enrollmentManagement.rejected') }}</option>
                <option value="enrolled">{{ $t('enrollmentManagement.enrolled') }}</option>
              </select>
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="enrollment-grade"><span>{{ $t('enrollmentManagement.gradeLevel') }}</span></label>
              <select
                id="enrollment-grade"
                v-model="filters.grade"
                class="fk-field"
              >
                <option value="">{{ $t('enrollmentManagement.allGrades') }}</option>
                <option value="Nursery">Nursery</option>
                <option value="KG1">KG1</option>
                <option value="KG2">KG2</option>
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
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import KanbanAvatar from '@/components/ui/kanban-avatar.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useServerPagination } from '@/composables/useServerPagination'
import { enrollmentService } from '@/services/enrollment.service'
import type { Enrollment, EnrollmentListParams } from '@/services/enrollment.service'
import { useClaims } from '@/composables/useClaims'
import FikrLoader from '@/components/FikrLoader.vue'
import { routePageLoading } from '@/router/route-loading'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'

const { locale } = useI18n()
const { hasClaim, loadClaims } = useClaims()
const moduleUnavailable = ref(false)
const router = useRouter()
const { viewMode } = useListViewMode()

const downloadingDoc = ref<Record<string, boolean>>({})
const activeMenuId = ref<string | null>(null)

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenu() {
  activeMenuId.value = null
}

function handleClickOutside(event: Event) {
  const target = event.target as Element
  if (activeMenuId.value && !target.closest('.relative')) closeMenu()
}
const showFilters = ref(false)
const filters = ref({
  search: '',
  status: '',
  grade: '',
})

const isRTL = computed(() => locale.value === 'ar')

const hasActiveFilters = computed(() =>
  Boolean(filters.value.search.trim() || filters.value.status || filters.value.grade),
)

function clearFilters() {
  filters.value.search = ''
  filters.value.status = ''
  filters.value.grade = ''
}

// Search/status/grade are applied by the API; the browser only holds the current page.
const enrollmentsEnabled = ref(false)
const {
  items: enrollments,
  total: totalEnrollments,
  loading,
  currentPage,
  totalPages,
  goToPage,
} = useServerPagination<Enrollment, EnrollmentListParams>(
  (params) => enrollmentService.listPage(params),
  {
    filters: () => ({
      q: filters.value.search,
      status: filters.value.status as EnrollmentListParams['status'],
      grade: filters.value.grade,
    }),
    debounceKeys: ['q'],
    enabled: enrollmentsEnabled,
    onError: (err) => console.error('Failed to load enrollments:', err),
  },
)

const loadEnrollments = async () => {
  // Enrollments is a separately licensed module; without it the API answers 403.
  if (!hasClaim('enrollments')) {
    moduleUnavailable.value = true
    return
  }
  enrollmentsEnabled.value = true // first page loads once enabled
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-700'
    case 'pending':
      return 'bg-amber-100 text-amber-800'
    case 'approved':
      return 'bg-emerald-100 text-emerald-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'enrolled':
      return 'bg-sky-100 text-sky-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-AE' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const guardianName = (enrollment: Enrollment) => {
  if (enrollment.guardianType === 'father') return enrollment.fatherFullName || '—'
  if (enrollment.guardianType === 'mother') return enrollment.motherFullName || '—'
  return enrollment.responsiblePerson || enrollment.emergencyContactName || '—'
}

const guardianMobile = (enrollment: Enrollment) => {
  if (enrollment.guardianType === 'father') return enrollment.fatherMobile
  if (enrollment.guardianType === 'mother') return enrollment.motherMobile
  return enrollment.responsiblePhone || enrollment.emergencyContactMobile
}

const studentInitials = (enrollment: Enrollment) => {
  const parts = (enrollment.fullName || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

const viewEnrollment = (enrollment: Enrollment) => {
  closeMenu()
  router.push(`/enrollments/${enrollment.id}`)
}

const editEnrollment = (enrollment: Enrollment) => {
  closeMenu()
  router.push(`/enrollments/${enrollment.id}/edit`)
}

const downloadWordDocument = async (enrollment: Enrollment) => {
  try {
    downloadingDoc.value[enrollment.id] = true
    const response = await enrollmentService.downloadDocument(enrollment.id)
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enrollment-form-${enrollment.id}.docx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Failed to download document:', error)
  } finally {
    downloadingDoc.value[enrollment.id] = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  // Claims first: loadEnrollments() checks them before calling a module the school may not have.
  await loadClaims()
  await loadEnrollments()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
