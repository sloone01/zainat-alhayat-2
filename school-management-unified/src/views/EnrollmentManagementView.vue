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
            <p class="fk-card__meta">{{ $t('enrollmentManagement.applicationsCount', { count: filteredEnrollments.length }) }}</p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('enrollmentManagement.refresh')"
              :disabled="loading"
              @click="loadEnrollments"
            >
              <svg
                class="h-4 w-4"
                :class="{ 'animate-spin': loading }"
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

        <div class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ enrollments.length }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('enrollmentManagement.stats.total') }}</div>
          </div>
          <div class="rounded-xl bg-amber-50/70 px-3 py-3 text-center ring-1 ring-amber-100">
            <div class="text-xl font-bold tabular-nums text-amber-700">{{ statusCounts.pending }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('enrollmentManagement.stats.pending') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ statusCounts.approved }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('enrollmentManagement.stats.approved') }}</div>
          </div>
          <div class="rounded-xl bg-sky-50/70 px-3 py-3 text-center ring-1 ring-sky-100">
            <div class="text-xl font-bold tabular-nums text-sky-700">{{ statusCounts.enrolled }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('enrollmentManagement.stats.enrolled') }}</div>
          </div>
        </div>

        <div class="px-6 py-5">
          <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
            <svg class="mb-3 h-8 w-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p class="text-sm font-medium">{{ $t('enrollmentManagement.loading') }}</p>
          </div>

          <div
            v-else-if="filteredEnrollments.length === 0"
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
              <article
                v-for="enrollment in filteredEnrollments"
                :key="enrollment.id"
                class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md"
              >
                <div class="flex items-start gap-3 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white px-4 py-4">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-700">
                    {{ studentInitials(enrollment) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate text-sm font-semibold text-gray-900">{{ enrollment.fullName }}</h3>
                    <p class="mt-0.5 truncate text-xs text-gray-500">
                      {{ $t(`enrollmentManagement.${enrollment.gender}`) }}
                      <span v-if="enrollment.age"> · {{ enrollment.age }} {{ $t('enrollmentManagement.age') }}</span>
                      <span v-if="enrollment.area"> · {{ enrollment.area }}</span>
                    </p>
                  </div>
                  <span
                    class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="getStatusClass(enrollment.status)"
                  >
                    {{ $t(`enrollmentManagement.${enrollment.status}`) }}
                  </span>
                </div>
                <div class="flex flex-1 flex-col gap-3 px-4 py-4">
                  <dl class="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt class="font-medium uppercase tracking-wide text-gray-400">{{ $t('enrollmentManagement.guardian') }}</dt>
                      <dd class="mt-0.5 font-semibold text-gray-800">{{ guardianName(enrollment) }}</dd>
                      <dd v-if="guardianMobile(enrollment)" class="mt-0.5 text-gray-500">{{ guardianMobile(enrollment) }}</dd>
                    </div>
                    <div>
                      <dt class="font-medium uppercase tracking-wide text-gray-400">{{ $t('enrollmentManagement.gradeLevel') }}</dt>
                      <dd class="mt-0.5 font-semibold text-gray-800">{{ enrollment.gradeLevel || '—' }}</dd>
                      <dd class="mt-0.5 text-gray-500">{{ $t(`enrollmentManagement.${enrollment.enrollmentStatus}`) }}</dd>
                    </div>
                    <div class="col-span-2">
                      <dt class="font-medium uppercase tracking-wide text-gray-400">{{ $t('enrollmentManagement.submittedOn') }}</dt>
                      <dd class="mt-0.5 font-semibold text-gray-800">{{ formatDate(enrollment.createdAt) }}</dd>
                    </div>
                  </dl>
                  <div class="mt-auto flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
                      @click="viewEnrollment(enrollment)"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {{ $t('enrollmentManagement.viewDetails') }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
                      @click="editEnrollment(enrollment)"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {{ $t('enrollmentManagement.edit') }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-primary-700 transition hover:bg-primary-100 disabled:opacity-50"
                      :disabled="downloadingDoc[enrollment.id]"
                      :title="$t('enrollmentManagement.downloadWord')"
                      :aria-label="$t('enrollmentManagement.downloadWord')"
                      @click="downloadWordDocument(enrollment)"
                    >
                      <svg
                        v-if="downloadingDoc[enrollment.id]"
                        class="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
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
                    v-for="enrollment in filteredEnrollments"
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
                        {{ $t(`enrollmentManagement.${enrollment.status}`) }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5 text-sm text-gray-600">
                      {{ formatDate(enrollment.createdAt) }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3.5 text-end">
                      <div class="inline-flex items-center gap-1">
                        <button
                          type="button"
                          class="rounded-lg p-2 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
                          :title="$t('enrollmentManagement.viewDetails')"
                          :aria-label="$t('enrollmentManagement.viewDetails')"
                          @click="viewEnrollment(enrollment)"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
                          :title="$t('enrollmentManagement.edit')"
                          :aria-label="$t('enrollmentManagement.edit')"
                          @click="editEnrollment(enrollment)"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-primary-600 transition hover:bg-primary-50 hover:text-primary-800 disabled:opacity-50"
                          :disabled="downloadingDoc[enrollment.id]"
                          :title="$t('enrollmentManagement.downloadWord')"
                          :aria-label="$t('enrollmentManagement.downloadWord')"
                          @click="downloadWordDocument(enrollment)"
                        >
                          <svg
                            v-if="downloadingDoc[enrollment.id]"
                            class="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { enrollmentService } from '@/services/enrollment.service'
import type { Enrollment } from '@/services/enrollment.service'
import { useClaims } from '@/composables/useClaims'

const { locale } = useI18n()
const { hasClaim, loadClaims } = useClaims()
const moduleUnavailable = ref(false)
const router = useRouter()
const { viewMode } = useListViewMode()

const enrollments = ref<Enrollment[]>([])
const loading = ref(false)
const downloadingDoc = ref<Record<string, boolean>>({})
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

const statusCounts = computed(() => {
  const counts = { pending: 0, approved: 0, rejected: 0, enrolled: 0 }
  for (const e of enrollments.value) {
    const key = e.status as keyof typeof counts
    if (key in counts) counts[key] += 1
  }
  return counts
})

const filteredEnrollments = computed(() => {
  let result = enrollments.value

  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(
      (enrollment) =>
        enrollment.fullName?.toLowerCase().includes(searchTerm) ||
        enrollment.fatherFullName?.toLowerCase().includes(searchTerm) ||
        enrollment.motherFullName?.toLowerCase().includes(searchTerm) ||
        enrollment.area?.toLowerCase().includes(searchTerm),
    )
  }

  if (filters.value.status) {
    result = result.filter((enrollment) => enrollment.status === filters.value.status)
  }

  if (filters.value.grade) {
    result = result.filter((enrollment) => enrollment.gradeLevel === filters.value.grade)
  }

  return result
})

const loadEnrollments = async () => {
  // Enrollments is a separately licensed module; without it the API answers 403.
  if (!hasClaim('enrollments')) {
    enrollments.value = []
    moduleUnavailable.value = true
    return
  }
  try {
    loading.value = true
    enrollments.value = await enrollmentService.getEnrollments()
  } catch (error) {
    console.error('Failed to load enrollments:', error)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
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
  router.push(`/enrollments/${enrollment.id}`)
}

const editEnrollment = (enrollment: Enrollment) => {
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
  // Claims first: loadEnrollments() checks them before calling a module the school may not have.
  await loadClaims()
  await loadEnrollments()
})
</script>
