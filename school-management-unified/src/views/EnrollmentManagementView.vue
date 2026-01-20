<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('enrollmentManagement.title') }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ $t('enrollmentManagement.description') }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search -->
            <div>
              <label for="search" class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.search') }}</label>
              <input
                v-model="filters.search"
                type="text"
                id="search"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                :placeholder="$t('enrollmentManagement.searchPlaceholder')"
              />
            </div>

            <!-- Status Filter -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">{{ $t('enrollmentManagement.status') }}</label>
              <select
                v-model="filters.status"
                id="status"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">{{ $t('common.all') }}</option>
                <option value="pending">{{ $t('enrollmentManagement.pending') }}</option>
                <option value="approved">{{ $t('enrollmentManagement.approved') }}</option>
                <option value="rejected">{{ $t('enrollmentManagement.rejected') }}</option>
                <option value="enrolled">{{ $t('enrollmentManagement.enrolled') }}</option>
              </select>
            </div>

            <!-- Grade Filter -->
            <div>
              <label for="grade" class="block text-sm font-medium text-gray-700 mb-1">{{ $t('enrollmentManagement.gradeLevel') }}</label>
              <select
                v-model="filters.grade"
                id="grade"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">{{ $t('common.all') }}</option>
                <option value="Nursery">Nursery</option>
                <option value="KG1">KG1</option>
                <option value="KG2">KG2</option>
              </select>
            </div>

            <!-- Refresh Button -->
            <div class="flex items-end">
              <button
                @click="loadEnrollments"
                :disabled="loading"
                class="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? $t('common.loading') : $t('common.refresh') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Enrollments Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            {{ $t('enrollmentManagement.applications') }}
            <span class="text-sm font-normal text-gray-500">({{ filteredEnrollments.length }})</span>
          </h2>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-500">{{ $t('common.loading') }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredEnrollments.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('enrollmentManagement.noApplications') }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ $t('enrollmentManagement.noApplicationsDescription') }}</p>
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('enrollmentManagement.student') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('enrollmentManagement.guardian') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('enrollmentManagement.gradeLevel') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('enrollmentManagement.status') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('enrollmentManagement.submittedOn') }}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('common.actions') }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="enrollment in filteredEnrollments" :key="enrollment.id" class="hover:bg-gray-50">
                  <!-- Student Info -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ enrollment.fullName }}</div>
                      <div class="text-sm text-gray-500">
                        {{ $t(`enrollmentManagement.${enrollment.gender}`) }}, {{ enrollment.age }} {{ $t('enrollmentManagement.age') }}
                      </div>
                      <div v-if="enrollment.area" class="text-sm text-gray-500">{{ enrollment.area }}</div>
                    </div>
                  </td>

                  <!-- Guardian Info -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ enrollment.guardianType === 'father' ? enrollment.fatherFullName : enrollment.motherFullName }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ enrollment.guardianType === 'father' ? enrollment.fatherMobile : enrollment.motherMobile }}
                      </div>
                    </div>
                  </td>

                  <!-- Grade Level -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ enrollment.gradeLevel || '-' }}</div>
                    <div class="text-sm text-gray-500">{{ $t(`enrollmentManagement.${enrollment.enrollmentStatus}`) }}</div>
                  </td>

                  <!-- Status -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(enrollment.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ $t(`enrollmentManagement.${enrollment.status}`) }}
                    </span>
                  </td>

                  <!-- Submitted Date -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(enrollment.createdAt) }}
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <!-- View Details -->
                      <button
                        @click="viewEnrollment(enrollment)"
                        class="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                        :title="$t('enrollmentManagement.viewDetails')"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <!-- Edit -->
                      <button
                        @click="editEnrollment(enrollment)"
                        class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        :title="$t('enrollmentManagement.edit')"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <!-- Download Word Document -->
                      <button
                        @click="downloadWordDocument(enrollment)"
                        :disabled="downloadingDoc[enrollment.id]"
                        class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 disabled:opacity-50"
                        :title="$t('enrollmentManagement.downloadWord')"
                      >
                        <svg v-if="downloadingDoc[enrollment.id]" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals will be added here later -->
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { enrollmentService } from '@/services/enrollment.service'
import type { Enrollment } from '@/services/enrollment.service'

const { locale, t } = useI18n()
const router = useRouter()

// Reactive data
const enrollments = ref<Enrollment[]>([])
const loading = ref(false)
const downloadingDoc = ref<Record<string, boolean>>({})
const filters = ref({
  search: '',
  status: '',
  grade: ''
})

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const filteredEnrollments = computed(() => {
  let result = enrollments.value

  // Filter by search term
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(enrollment =>
      enrollment.fullName?.toLowerCase().includes(searchTerm) ||
      enrollment.fatherFullName?.toLowerCase().includes(searchTerm) ||
      enrollment.motherFullName?.toLowerCase().includes(searchTerm) ||
      enrollment.area?.toLowerCase().includes(searchTerm)
    )
  }

  // Filter by status
  if (filters.value.status) {
    result = result.filter(enrollment => enrollment.status === filters.value.status)
  }

  // Filter by grade
  if (filters.value.grade) {
    result = result.filter(enrollment => enrollment.gradeLevel === filters.value.grade)
  }

  return result
})

// Methods
const loadEnrollments = async () => {
  try {
    loading.value = true
    enrollments.value = await enrollmentService.getEnrollments()
  } catch (error) {
    console.error('Failed to load enrollments:', error)
    // Show error notification
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'enrolled':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-AE' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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

    // Create a blob from the response
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enrollment-form-${enrollment.id}.docx`
    document.body.appendChild(a)
    a.click()

    // Cleanup
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

  } catch (error) {
    console.error('Failed to download document:', error)
    // Show error notification
  } finally {
    downloadingDoc.value[enrollment.id] = false
  }
}

// Lifecycle
onMounted(() => {
  loadEnrollments()
})
</script>