<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('enrollmentManagement.enrollmentDetails')"
        :subtitle="enrollment ? `${$t('enrollmentManagement.submittedOn')}: ${formatDate(enrollment.createdAt)}` : $t('enrollmentManagement.description')"
      >
        <template #actions>
          <button
            type="button"
            class="fk-btn fk-btn--pearl"
            :disabled="printingDoc"
            @click="printWordDocument"
          >
            {{ printingDoc ? $t('common.printing') : $t('enrollmentManagement.print') }}
          </button>
          <button
            type="button"
            class="fk-btn fk-btn--primary"
            @click="editEnrollment"
          >
            {{ $t('enrollmentManagement.edit') }}
          </button>
        </template>
      </FikrPageHeader>

      <!-- Loading State -->
      <div v-if="loading" class="fk-card">
        <header class="flex items-center gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <router-link
            to="/enrollments"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('common.back')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </header>
        <div class="flex flex-col items-center justify-center py-8 text-center">
          <FikrLoader size="sm" />
          <p class="mt-2 text-sm text-gray-500">{{ $t('common.loading') }}</p>
        </div>
      </div>

      <!-- Enrollment Details -->
      <div v-else-if="enrollment" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Student Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="mb-4 flex items-center gap-3">
                <router-link
                  to="/enrollments"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
                  :aria-label="$t('common.back')"
                >
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </router-link>
                <h3 class="text-lg font-medium text-gray-900">{{ $t('enrollmentManagement.studentInformation') }}</h3>
              </div>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.fullName') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fullName }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.gender') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.gender}`) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.age') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.age || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.tribe') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.tribe || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.nationality') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.nationality || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.religion') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.religion || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.dateOfBirth') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.dateOfBirth ? formatDate(enrollment.dateOfBirth) : '-' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.hasSiblings') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.hasSiblings ? 'yes' : 'no'}`) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.academicInformation') }}</h3>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.enrollmentType') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.enrollmentStatus}`) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.gradeLevel') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.gradeLevel || '-' }}</dd>
                </div>
                <div v-if="enrollment.previousSchool" class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.previousSchool') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.previousSchool }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Health Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.healthInformation') }}</h3>
              <div class="space-y-4">
                <div v-if="enrollment.allergies" class="p-3 bg-yellow-50 rounded-md">
                  <h4 class="text-sm font-medium text-yellow-800">{{ $t('enrollmentManagement.allergies') }}</h4>
                  <p class="mt-1 text-sm text-yellow-700">{{ enrollment.allergiesDetails || $t('enrollmentManagement.yes') }}</p>
                </div>

                <div v-if="enrollment.chronicDiseases" class="p-3 bg-red-50 rounded-md">
                  <h4 class="text-sm font-medium text-red-800">{{ $t('enrollmentManagement.chronicDiseases') }}</h4>
                  <p class="mt-1 text-sm text-red-700">{{ enrollment.chronicDiseasesDetails || $t('enrollmentManagement.yes') }}</p>
                </div>

                <div v-if="enrollment.surgeries" class="p-3 bg-orange-50 rounded-md">
                  <h4 class="text-sm font-medium text-orange-800">{{ $t('enrollmentManagement.surgeries') }}</h4>
                  <p class="mt-1 text-sm text-orange-700">{{ enrollment.surgeriesDetails || $t('enrollmentManagement.yes') }}</p>
                </div>

                <div v-if="enrollment.seizures" class="p-3 bg-purple-50 rounded-md">
                  <h4 class="text-sm font-medium text-purple-800">{{ $t('enrollmentManagement.seizures') }}</h4>
                  <p class="mt-1 text-sm text-purple-700">{{ enrollment.seizuresDetails || $t('enrollmentManagement.yes') }}</p>
                </div>

                <div v-if="enrollment.otherHealthInfo" class="p-3 bg-blue-50 rounded-md">
                  <h4 class="text-sm font-medium text-blue-800">{{ $t('enrollmentManagement.otherHealthInfo') }}</h4>
                  <p class="mt-1 text-sm text-blue-700">{{ enrollment.otherHealthInfo }}</p>
                </div>

                <div v-if="!enrollment.allergies && !enrollment.chronicDiseases && !enrollment.surgeries && !enrollment.seizures && !enrollment.otherHealthInfo" class="p-3 bg-green-50 rounded-md">
                  <p class="text-sm text-green-700">لا توجد مشاكل صحية مسجلة</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Guardian Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.guardianInformation') }}</h3>

              <!-- Guardian Type -->
              <div class="mb-6">
                <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.guardianType') }}</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.guardianType}`) }}</dd>
              </div>

              <!-- Father Information -->
              <div v-if="enrollment.fatherFullName" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('enrollmentManagement.fatherInfo') }}</h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.fullName') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherFullName }}</dd>
                  </div>
                  <div v-if="enrollment.fatherTribe">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.tribe') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherTribe }}</dd>
                  </div>
                  <div v-if="enrollment.fatherMobile">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.mobile') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherMobile }}</dd>
                  </div>
                  <div v-if="enrollment.fatherEmail">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.email') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherEmail }}</dd>
                  </div>
                  <div v-if="enrollment.fatherWorkplace" class="sm:col-span-2">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.workplace') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.fatherWorkplace }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Mother Information -->
              <div v-if="enrollment.motherFullName" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('enrollmentManagement.motherInfo') }}</h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.fullName') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherFullName }}</dd>
                  </div>
                  <div v-if="enrollment.motherTribe">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.tribe') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherTribe }}</dd>
                  </div>
                  <div v-if="enrollment.motherMobile">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.mobile') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherMobile }}</dd>
                  </div>
                  <div v-if="enrollment.motherEmail">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.email') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherEmail }}</dd>
                  </div>
                  <div v-if="enrollment.motherWorkplace" class="sm:col-span-2">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.workplace') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.motherWorkplace }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Emergency Contact -->
              <div v-if="enrollment.emergencyContactName">
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('enrollmentManagement.emergencyContact') }}</h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.fullName') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.emergencyContactName }}</dd>
                  </div>
                  <div v-if="enrollment.emergencyContactRelationship">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.relationship') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.emergencyContactRelationship }}</dd>
                  </div>
                  <div v-if="enrollment.emergencyContactMobile">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.mobile') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.emergencyContactMobile }}</dd>
                  </div>
                  <div v-if="enrollment.emergencyContactWorkplace">
                    <dt class="text-xs font-medium text-gray-500">{{ $t('enrollmentManagement.workplace') }}</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ enrollment.emergencyContactWorkplace }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.addressInformation') }}</h3>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div v-if="enrollment.area">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.area') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.area }}</dd>
                </div>
                <div v-if="enrollment.village">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.village') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.village }}</dd>
                </div>
                <div v-if="enrollment.landmark" class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.landmark') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.landmark }}</dd>
                </div>
                <div v-if="enrollment.streetNumber">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.streetNumber') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ enrollment.streetNumber }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.housingType') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ $t(`enrollmentManagement.${enrollment.housingType}`) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Identity documents -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.documents') }}</h3>
              <div class="space-y-5">
                <div>
                  <h4 class="text-sm font-medium text-gray-700 mb-2">{{ $t('enrollment.parentIdDocuments') }}</h4>
                  <ul v-if="enrollment.parentIdDocuments?.length" class="space-y-2">
                    <li
                      v-for="(doc, index) in enrollment.parentIdDocuments"
                      :key="`parent-doc-${index}`"
                      class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <span class="text-sm text-gray-800">{{ attachmentLabel(doc, index + 1) }}</span>
                      <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="openAttachment(doc)">
                        {{ $t('enrollmentManagement.viewDocument') }}
                      </button>
                    </li>
                  </ul>
                  <p v-else class="text-sm text-gray-500">{{ $t('common.notSpecified') }}</p>
                </div>
                <div class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <p class="text-sm font-medium text-gray-700">{{ $t('enrollment.birthCertificate') }}</p>
                    <p class="text-xs text-gray-500">{{ enrollment.birthCertificate ? attachmentLabel(enrollment.birthCertificate, 1) : $t('common.notSpecified') }}</p>
                  </div>
                  <button
                    v-if="enrollment.birthCertificate"
                    type="button"
                    class="fk-btn fk-btn--pearl fk-btn--sm"
                    @click="openAttachment(enrollment.birthCertificate)"
                  >
                    {{ $t('enrollmentManagement.viewDocument') }}
                  </button>
                </div>
                <div class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <p class="text-sm font-medium text-gray-700">{{ $t('enrollment.childIdDocument') }}</p>
                    <p class="text-xs text-gray-500">{{ enrollment.childIdDocument ? attachmentLabel(enrollment.childIdDocument, 1) : $t('common.notSpecified') }}</p>
                  </div>
                  <button
                    v-if="enrollment.childIdDocument"
                    type="button"
                    class="fk-btn fk-btn--pearl fk-btn--sm"
                    @click="openAttachment(enrollment.childIdDocument)"
                  >
                    {{ $t('enrollmentManagement.viewDocument') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status Card -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('enrollmentManagement.applicationStatus') }}</h3>

              <div class="space-y-4">
                <!-- Current Status -->
                <div>
                  <span :class="getStatusClass(enrollment.status)" class="inline-flex px-3 py-1 text-sm font-semibold rounded-full">
                    {{ $t(`enrollmentManagement.${enrollment.status}`) }}
                  </span>
                </div>

                <!-- Notes -->
                <div v-if="enrollment.notes">
                  <dt class="text-sm font-medium text-gray-500">{{ $t('enrollmentManagement.notes') }}</dt>
                  <dd class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{ enrollment.notes }}</dd>
                </div>

                <!-- Action Buttons -->
                <div v-if="enrollment.status === 'pending'" class="space-y-2">
                  <button
                    @click="approveEnrollment"
                    class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                  >
                    {{ $t('enrollmentManagement.approve') }}
                  </button>
                  <button
                    type="button"
                    @click="openReject"
                    class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                  >
                    {{ $t('enrollmentManagement.reject') }}
                  </button>
                </div>

              </div>
            </div>
          </div>

          <!-- Quick Info -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">معلومات سريعة</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">تاريخ التقديم</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(enrollment.createdAt) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">آخر تحديث</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(enrollment.updatedAt) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="fk-card">
        <header class="flex items-center gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <router-link
            to="/enrollments"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('common.back')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </header>
        <div class="fk-alert fk-alert--error m-5">
          <p class="font-medium">خطأ في تحميل البيانات</p>
          <p>لم يتم العثور على طلب التسجيل المطلوب</p>
        </div>
      </div>
    </div>

    <FikrDialog
      :show="rejectOpen"
      plain-footer
      :title="$t('enrollmentManagement.rejectApplication')"
      @close="closeReject"
    >
      <form id="enrollment-reject-form" class="fk-form" @submit.prevent="rejectEnrollment">
        <div class="fk-form__section">
          <div class="fk-form__row">
            <label class="fk-flabel" for="enrollment-reject-reason">
              <span>{{ $t('enrollmentManagement.rejectReason') }}</span>
            </label>
            <textarea
              id="enrollment-reject-reason"
              v-model="rejectReason"
              rows="4"
              class="fk-field"
              required
            />
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="closeReject">
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="enrollment-reject-form"
          class="fk-btn fk-btn--danger"
          :disabled="rejecting || !rejectReason.trim()"
        >
          {{ $t('enrollmentManagement.reject') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import { enrollmentService } from '@/services/enrollment.service'
import { useFeedback } from '@/composables/useFeedback'
import type { Enrollment } from '@/services/enrollment.service'
import apiClient from '@/services/api'

const { locale, t } = useI18n()
const feedback = useFeedback()

function apiErrorText(error: unknown): string {
  return error instanceof Error ? error.message : ''
}
const route = useRoute()
const router = useRouter()

// Reactive data
const enrollment = ref<Enrollment | null>(null)
const loading = ref(false)
const error = ref(false)
const printingDoc = ref(false)
const rejectOpen = ref(false)
const rejectReason = ref('')
const rejecting = ref(false)

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

function attachmentLabel(doc: string, index: number): string {
  if (!doc) return `—`
  if (doc.startsWith('/api/attachments/')) {
    return t('enrollment.uploadedAttachment')
  }
  if (doc.startsWith('data:')) {
    const mime = doc.slice(5, doc.indexOf(';')) || ''
    if (mime.includes('pdf')) return `PDF ${index}`
    if (mime.includes('png')) return `PNG ${index}`
    if (mime.includes('jpeg') || mime.includes('jpg')) return `JPG ${index}`
    return `${t('enrollmentManagement.document')} ${index}`
  }
  return doc.split('/').pop() || `${t('enrollmentManagement.document')} ${index}`
}

async function openAttachment(doc: string) {
  if (!doc) return
  if (doc.startsWith('/api/attachments/')) {
    try {
      const path = doc.replace(/^\/api/, '')
      const response = await apiClient.get(path, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(response.data as Blob)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
      console.error(e)
      feedback.error(t('enrollment.uploadFailed'))
    }
    return
  }
  if (doc.startsWith('data:') || doc.startsWith('http') || doc.startsWith('/')) {
    window.open(doc, '_blank', 'noopener,noreferrer')
    return
  }
  window.open(doc, '_blank', 'noopener,noreferrer')
}

// Methods
const loadEnrollment = async () => {
  try {
    loading.value = true
    error.value = false
    const id = route.params.id as string
    enrollment.value = await enrollmentService.getEnrollment(id)
  } catch (err) {
    console.error('Failed to load enrollment:', err)
    error.value = true
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
    month: 'long',
    day: 'numeric'
  })
}

const editEnrollment = () => {
  const id = route.params.id as string
  router.push(`/enrollments/${id}/edit`)
}

const printWordDocument = async () => {
  if (!enrollment.value) return

  try {
    printingDoc.value = true
    const response = await enrollmentService.downloadDocument(enrollment.value.id)

    // Create a blob from the response
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })

    // Create a temporary URL
    const url = window.URL.createObjectURL(blob)

    // Open in new window/tab and trigger print
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
        // Clean up the URL after printing
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          printWindow.close()
        }, 1000)
      }
    } else {
      // Fallback: download the document if popup blocked
      const a = document.createElement('a')
      a.href = url
      a.download = `enrollment-form-${enrollment.value.id}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }

  } catch (error) {
    console.error('Failed to print document:', error)
    feedback.error(t('enrollmentManagement.printFailed'))
  } finally {
    printingDoc.value = false
  }
}

const approveEnrollment = async () => {
  if (!enrollment.value) return

  try {
    await enrollmentService.approveEnrollment(enrollment.value.id)
    await loadEnrollment() // Refresh
    feedback.saved(t('enrollmentManagement.approvedOk'))
  } catch (error) {
    console.error('Failed to approve enrollment:', error)
    feedback.error(apiErrorText(error) || t('enrollmentManagement.approveFailed'))
  }
}

function openReject() {
  rejectReason.value = ''
  rejectOpen.value = true
}

function closeReject() {
  if (rejecting.value) return
  rejectOpen.value = false
  rejectReason.value = ''
}

const rejectEnrollment = async () => {
  if (!enrollment.value) return
  const notes = rejectReason.value.trim()
  if (!notes) {
    feedback.error(t('enrollmentManagement.rejectReasonRequired'))
    return
  }

  try {
    rejecting.value = true
    await enrollmentService.rejectEnrollment(enrollment.value.id, notes)
    rejectOpen.value = false
    rejectReason.value = ''
    await loadEnrollment()
    feedback.saved(t('enrollmentManagement.rejectedOk'))
  } catch (error) {
    console.error('Failed to reject enrollment:', error)
    feedback.error(apiErrorText(error) || t('enrollmentManagement.rejectFailed'))
  } finally {
    rejecting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadEnrollment()
})
</script>