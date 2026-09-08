<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('students.editStudentTitle')"
        :subtitle="headerSubtitle"
      >
        <template #leading>
          <router-link
            to="/students"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('students.backToStudentManagement')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="pageError" class="fk-alert fk-alert--error" role="alert">{{ pageError }}</div>

      <div
        v-if="pageLoading"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200/80 bg-white py-16 text-gray-500 shadow-sm"
      >
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <section
        v-else
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
      >
        <header class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/40 px-5 py-4 sm:px-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-gray-900">{{ currentTabMeta.title }}</h2>
              <p class="mt-0.5 text-sm text-gray-500">{{ currentTabMeta.description }}</p>
            </div>
            <div
              class="inline-flex max-w-full flex-wrap rounded-lg border border-gray-200 bg-white/80 p-0.5 shadow-sm"
              role="tablist"
              :aria-label="$t('students.formTabsLabel')"
            >
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                role="tab"
                class="rounded-md px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                :class="activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                :aria-selected="activeTab === tab.id"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
        </header>

        <!-- Student -->
        <form v-show="activeTab === 'student'" class="space-y-6 p-6" @submit.prevent="saveStudent">
          <div class="text-center">
            <div class="relative inline-block">
              <div class="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-primary-50 to-teal-50 shadow-sm ring-1 ring-primary-100">
                <img v-if="studentForm.photo" :src="studentForm.photo" alt="" class="h-full w-full object-cover">
                <svg v-else class="h-12 w-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <button
                type="button"
                class="absolute -bottom-1 -end-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition hover:bg-primary-700"
                :aria-label="$t('students.photoDescription')"
                @click="triggerPhotoPick"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref="photoInput" type="file" accept="image/*" class="hidden" @change="handlePhotoUpload">
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-first-name">{{ $t('students.firstName') }} *</label>
              <input id="edit-first-name" v-model="studentForm.firstName" type="text" required class="fk-field">
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-second-name">{{ $t('students.secondName') }} *</label>
              <input id="edit-second-name" v-model="studentForm.secondName" type="text" required class="fk-field">
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-third-name">{{ $t('students.thirdName') }}</label>
              <input id="edit-third-name" v-model="studentForm.thirdName" type="text" class="fk-field">
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-family-name">{{ $t('students.familyName') }} *</label>
              <input id="edit-family-name" v-model="studentForm.familyName" type="text" required class="fk-field">
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-dob">{{ $t('students.dateOfBirth') }} *</label>
              <input id="edit-dob" v-model="studentForm.dateOfBirth" type="date" required class="fk-field">
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-gender">{{ $t('students.gender') }} *</label>
              <select id="edit-gender" v-model="studentForm.gender" required class="fk-field">
                <option value="male">{{ $t('students.male') }}</option>
                <option value="female">{{ $t('students.female') }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-student-id">{{ $t('students.studentId') }}</label>
              <input id="edit-student-id" v-model="studentForm.studentId" type="text" class="fk-field">
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-nationality">{{ $t('students.nationality') }}</label>
              <select id="edit-nationality" v-model="studentForm.nationality" class="fk-field">
                <option value="">{{ $t('students.selectNationality') }}</option>
                <option value="omani">{{ $t('students.omani') }}</option>
                <option value="expat">{{ $t('students.expat') }}</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-emergency">{{ $t('studentManagement.emergencyContact') }}</label>
              <input id="edit-emergency" v-model="studentForm.emergencyContact" type="text" class="fk-field">
            </div>
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-medical">{{ $t('students.medicalConditions') }}</label>
              <textarea id="edit-medical" v-model="studentForm.medicalConditions" rows="3" class="fk-field resize-none" />
            </div>
          </div>

          <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button type="submit" class="fk-btn fk-btn--primary" :disabled="saving">
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>

        <!-- Parents -->
        <div v-show="activeTab === 'parents'" class="space-y-5 p-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('students.linkedParentsHeading') }}</h3>
              <p class="mt-0.5 text-xs text-gray-500">{{ $t('students.parentsGridHint') }}</p>
            </div>
            <button type="button" class="fk-btn fk-btn--primary" @click="openAddParent">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('studentManagement.addParent') }}
            </button>
          </div>

          <div
            v-if="!linkedParents.length"
            class="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-10 text-center text-sm text-gray-500"
          >
            {{ $t('students.noParentsYet') }}
          </div>

          <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="parent in linkedParents"
              :key="parent.id"
              class="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.02]"
            >
              <div
                class="flex items-center justify-between gap-2 border-b px-4 py-3"
                :class="relationshipBannerClass(parent.relationship)"
              >
                <span class="text-xs font-bold uppercase tracking-wide">
                  {{ relationshipLabel(parent.relationship) }}
                </span>
                <button
                  type="button"
                  class="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-white/70"
                  :disabled="saving"
                  @click="unlinkParent(parent)"
                >
                  {{ $t('students.unlinkParent') }}
                </button>
              </div>
              <div class="space-y-2 px-4 py-4">
                <p class="text-sm font-semibold text-gray-900">
                  {{ parentDisplayName(parent) }}
                </p>
                <p v-if="parent.phone || parent.responsiblePhone" class="text-xs text-gray-600">
                  {{ parent.phone || parent.responsiblePhone }}
                </p>
                <p v-if="parent.email" class="text-xs text-gray-500">{{ parent.email }}</p>
                <p v-if="parent.workplace" class="text-xs text-gray-500">{{ parent.workplace }}</p>
                <p v-if="parent.organizationName" class="text-xs text-gray-500">{{ parent.organizationName }}</p>
              </div>
            </article>
          </div>
        </div>

        <!-- Class -->
        <form v-show="activeTab === 'class'" class="space-y-5 p-6" @submit.prevent="saveClass">
          <p class="text-sm text-gray-500">{{ $t('students.classTabHint') }}</p>
          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-group">{{ $t('studentManagement.selectGroup') }}</label>
              <select id="edit-group" v-model="selectedGroupId" class="fk-field" @change="onGroupChange">
                <option value="">{{ $t('studentManagement.noGroup') }}</option>
                <option v-for="g in groups" :key="g.id" :value="g.id">
                  {{ g.name }}{{ g.level?.name ? ` · ${g.level.name}` : '' }}
                </option>
              </select>
            </div>
            <div v-if="paymentLevels.length">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-level">{{ $t('groupManagement.paymentLevel') }}</label>
              <select id="edit-level" v-model="selectedPaymentLevelId" class="fk-field">
                <option value="">{{ $t('groupManagement.paymentLevelNone') }}</option>
                <option v-for="lv in paymentLevels" :key="lv.id" :value="lv.id">{{ lv.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button type="submit" class="fk-btn fk-btn--primary" :disabled="saving || !selectedGroupId">
              {{ saving ? $t('common.saving') : $t('students.saveGroup') }}
            </button>
          </div>
        </form>

        <!-- Bus -->
        <form v-show="activeTab === 'bus'" class="space-y-5 p-6" @submit.prevent="saveBus">
          <p class="text-sm text-gray-500">{{ $t('students.busAssignmentDescription') }}</p>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="edit-bus">{{ $t('studentManagement.selectBus') }}</label>
            <select id="edit-bus" v-model="selectedBusId" class="fk-field max-w-lg">
              <option value="">{{ $t('students.noBusOptional') }}</option>
              <option v-for="b in buses" :key="b.id" :value="b.id">{{ b.title }}</option>
            </select>
          </div>
          <div class="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              v-if="currentBusId"
              type="button"
              class="fk-btn fk-btn--pearl"
              :disabled="saving"
              @click="clearBus"
            >
              {{ $t('students.removeBus') }}
            </button>
            <button type="submit" class="fk-btn fk-btn--primary" :disabled="saving">
              {{ saving ? $t('common.saving') : $t('students.saveBus') }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- Add parent dialog -->
    <FikrDialog
      :show="showAddParent"
      plain-footer
      size="lg"
      :title="$t('studentManagement.addParent')"
      :subtitle="$t('students.addParentSubtitle')"
      @close="closeAddParent"
    >
      <div class="space-y-5">
        <div>
          <p class="mb-2 text-xs font-medium text-gray-600">{{ $t('students.parentType') }} *</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              v-for="type in relationshipTypes"
              :key="type.id"
              type="button"
              class="rounded-xl border-2 p-3 text-center transition"
              :class="addForm.relationship === type.id
                ? type.activeClass
                : 'border-gray-200 bg-white hover:border-gray-300'"
              @click="addForm.relationship = type.id"
            >
              <span class="block text-sm font-semibold text-gray-900">{{ type.label }}</span>
            </button>
          </div>
        </div>

        <div>
          <p class="mb-2 text-xs font-medium text-gray-600">{{ $t('students.addParentMode') }}</p>
          <div class="inline-flex rounded-lg border border-gray-200 bg-gray-100/80 p-0.5">
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-sm font-semibold"
              :class="addForm.mode === 'existing' ? 'bg-white text-primary-800 shadow-sm' : 'text-gray-600'"
              @click="addForm.mode = 'existing'"
            >
              {{ $t('students.existingParent') }}
            </button>
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-sm font-semibold"
              :class="addForm.mode === 'create' ? 'bg-white text-primary-800 shadow-sm' : 'text-gray-600'"
              @click="addForm.mode = 'create'"
            >
              {{ $t('students.newParent') }}
            </button>
          </div>
        </div>

        <div v-if="addForm.mode === 'existing'" class="space-y-3">
          <div class="flex flex-wrap items-end gap-2">
            <div class="min-w-[12rem] flex-1">
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.searchParent') }}</label>
              <input
                v-model="parentSearchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('students.searchParent')"
                @input="scheduleParentSearch"
              >
            </div>
            <button type="button" class="fk-btn fk-btn--pearl" @click="showParentSearchModal = true">
              {{ $t('students.searchInParentDatabase') }}
            </button>
          </div>
          <div v-if="parentSearchLoading" class="py-6 text-center text-sm text-gray-500">{{ $t('common.loading') }}</div>
          <div v-else-if="parentSearchResults.length" class="max-h-56 space-y-2 overflow-y-auto">
            <button
              v-for="p in parentSearchResults"
              :key="p.id"
              type="button"
              class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-start text-sm transition"
              :class="selectedExistingParentId === p.id
                ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                : 'border-gray-200 hover:border-gray-300'"
              @click="selectedExistingParentId = p.id"
            >
              <span>
                <span class="font-semibold text-gray-900">{{ p.firstName }} {{ p.lastName }}</span>
                <span v-if="p.phone" class="mt-0.5 block text-xs text-gray-500">{{ p.phone }}</span>
              </span>
            </button>
          </div>
          <p v-else-if="parentSearchQuery.trim()" class="text-sm text-gray-500">{{ $t('students.noParentMatches') }}</p>
        </div>

        <!-- Create: father / mother -->
        <div
          v-else-if="addForm.relationship === 'father' || addForm.relationship === 'mother'"
          class="grid grid-cols-1 gap-4 rounded-xl border p-4 sm:grid-cols-2"
          :class="addForm.relationship === 'father' ? 'border-blue-100 bg-blue-50/40' : 'border-pink-100 bg-pink-50/40'"
        >
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.parentFullName') }} *</label>
            <input v-model="createForm.fullName" type="text" required class="fk-field" :placeholder="addForm.relationship === 'father' ? $t('enrollment.fatherNamePlaceholder') : $t('enrollment.motherNamePlaceholder')">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.tribe') }}</label>
            <input v-model="createForm.tribe" type="text" class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.workplace') }}</label>
            <input v-model="createForm.workplace" type="text" class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.workPhone') }}</label>
            <input v-model="createForm.workPhone" type="tel" class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.mobile') }} *</label>
            <input v-model="createForm.mobile" type="tel" required class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.email') }}</label>
            <input v-model="createForm.email" type="email" class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.maritalStatus') }}</label>
            <select v-model="createForm.maritalStatus" class="fk-field">
              <option value="">{{ $t('enrollment.selectMaritalStatus') }}</option>
              <option value="married">{{ $t('enrollment.married') }}</option>
              <option value="divorced">{{ $t('enrollment.divorced') }}</option>
              <option value="widowed">{{ $t('enrollment.widowed') }}</option>
            </select>
          </div>
        </div>

        <!-- Create: guardian -->
        <div
          v-else
          class="grid grid-cols-1 gap-4 rounded-xl border border-teal-100 bg-teal-50/40 p-4 sm:grid-cols-2"
        >
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.organizationName') }} *</label>
            <input v-model="createForm.organizationName" type="text" required class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.phone') }} *</label>
            <input v-model="createForm.orgPhone" type="tel" required class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.responsiblePerson') }} *</label>
            <input v-model="createForm.responsiblePerson" type="text" required class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.responsiblePhone') }} *</label>
            <input v-model="createForm.responsiblePhone" type="tel" required class="fk-field">
          </div>
        </div>

        <p v-if="addError" class="text-sm text-red-600">{{ addError }}</p>
      </div>

      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="closeAddParent">{{ $t('common.cancel') }}</button>
        <button type="button" class="fk-btn fk-btn--primary" :disabled="saving || !canSubmitAdd" @click="submitAddParent">
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </FikrDialog>

    <ParentSearchModal
      :show="showParentSearchModal"
      @close="showParentSearchModal = false"
      @select="onParentPickedFromModal"
    />

    <SuccessFlashDialog
      :open="successOpen"
      :title="successTitle"
      :message="successMessage"
      :duration-ms="successDurationMs"
      @finished="onSuccessFinished"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ParentSearchModal from '@/components/ParentSearchModal.vue'
import SuccessFlashDialog from '@/components/SuccessFlashDialog.vue'
import { useSuccessFlash } from '@/composables/useSuccessFlash'
import { authService } from '@/services'
import { studentService, type Student } from '@/services/student.service'
import {
  parentService,
  type Parent,
  type ParentRelationship,
} from '@/services/parent.service'
import { groupService, type Group } from '@/services/group.service'
import { busService, type Bus } from '@/services/bus.service'
import paymentConfigService, { type SchoolPaymentLevel } from '@/services/payment-config.service'

type TabId = 'student' | 'parents' | 'class' | 'bus'

const route = useRoute()
const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const studentId = computed(() => String(route.params.id || ''))
const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: number } | null
  return Number(u?.school_id ?? 1)
})

const {
  open: successOpen,
  title: successTitle,
  message: successMessage,
  durationMs: successDurationMs,
  show: showSuccessFlash,
  onFinished: onSuccessFinished,
} = useSuccessFlash()

const pageLoading = ref(true)
const pageError = ref('')
const saving = ref(false)
const activeTab = ref<TabId>('student')
const student = ref<Student | null>(null)
const linkedParents = ref<Parent[]>([])
const groups = ref<Group[]>([])
const buses = ref<Bus[]>([])
const paymentLevels = ref<SchoolPaymentLevel[]>([])
const selectedGroupId = ref('')
const selectedPaymentLevelId = ref('')
const selectedBusId = ref('')
const currentBusId = ref('')
const photoInput = ref<HTMLInputElement | null>(null)

const studentForm = reactive({
  photo: '' as string,
  firstName: '',
  secondName: '',
  thirdName: '',
  familyName: '',
  dateOfBirth: '',
  gender: 'male' as 'male' | 'female',
  studentId: '',
  nationality: '',
  emergencyContact: '',
  medicalConditions: '',
})

const showAddParent = ref(false)
const showParentSearchModal = ref(false)
const addError = ref('')
const parentSearchQuery = ref('')
const parentSearchResults = ref<Parent[]>([])
const parentSearchLoading = ref(false)
const selectedExistingParentId = ref<number | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const addForm = reactive<{
  relationship: ParentRelationship
  mode: 'existing' | 'create'
}>({
  relationship: 'father',
  mode: 'existing',
})

const createForm = reactive({
  fullName: '',
  tribe: '',
  workplace: '',
  workPhone: '',
  mobile: '',
  email: '',
  maritalStatus: '',
  organizationName: '',
  orgPhone: '',
  responsiblePerson: '',
  responsiblePhone: '',
})

const tabs = computed(() => [
  { id: 'student' as const, label: t('students.tabStudent') },
  { id: 'parents' as const, label: t('students.tabParents') },
  { id: 'class' as const, label: t('students.tabClass') },
  { id: 'bus' as const, label: t('students.tabBus') },
])

const currentTabMeta = computed(() => {
  const map: Record<TabId, { title: string; description: string }> = {
    student: { title: t('students.stepStudentTitle'), description: t('students.editStudentSubtitle') },
    parents: { title: t('students.linkedParentsHeading'), description: t('students.parentsGridHint') },
    class: { title: t('studentManagement.groupAssignment'), description: t('students.classTabHint') },
    bus: { title: t('students.busAssignment'), description: t('students.busAssignmentDescription') },
  }
  return map[activeTab.value]
})

const headerSubtitle = computed(() => {
  if (!student.value) return t('students.editStudentSubtitle')
  const name = [student.value.firstName, student.value.lastName].filter(Boolean).join(' ')
  return name || t('students.editStudentSubtitle')
})

const relationshipTypes = computed(() => [
  {
    id: 'father' as const,
    label: t('students.relationshipFather'),
    activeClass: 'border-blue-500 bg-blue-50 ring-1 ring-blue-200',
  },
  {
    id: 'mother' as const,
    label: t('students.relationshipMother'),
    activeClass: 'border-pink-500 bg-pink-50 ring-1 ring-pink-200',
  },
  {
    id: 'guardian' as const,
    label: t('students.relationshipGuardian'),
    activeClass: 'border-teal-500 bg-teal-50 ring-1 ring-teal-200',
  },
])

const canSubmitAdd = computed(() => {
  if (addForm.mode === 'existing') return selectedExistingParentId.value != null
  if (addForm.relationship === 'guardian') {
    return !!(
      createForm.organizationName.trim()
      && createForm.orgPhone.trim()
      && createForm.responsiblePerson.trim()
      && createForm.responsiblePhone.trim()
    )
  }
  return !!(createForm.fullName.trim() && createForm.mobile.trim())
})

function relationshipLabel(rel?: string) {
  if (rel === 'father') return t('students.relationshipFather')
  if (rel === 'mother') return t('students.relationshipMother')
  return t('students.relationshipGuardian')
}

function relationshipBannerClass(rel?: string) {
  if (rel === 'father') return 'border-blue-100 bg-blue-50 text-blue-800'
  if (rel === 'mother') return 'border-pink-100 bg-pink-50 text-pink-800'
  return 'border-teal-100 bg-teal-50 text-teal-800'
}

function parentDisplayName(parent: Parent) {
  if (parent.relationship === 'guardian' && (parent.responsiblePerson || parent.organizationName)) {
    return parent.responsiblePerson || parent.organizationName || ''
  }
  return `${parent.firstName || ''} ${parent.lastName || ''}`.trim()
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return { firstName: '-', lastName: '-' }
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function triggerPhotoPick() {
  photoInput.value?.click()
}

async function handlePhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !studentId.value) return
  try {
    const uploaded = await studentService.uploadPhoto(studentId.value, file)
    const url = uploaded?.photo || uploaded?.url || uploaded?.data?.photo
    if (url) studentForm.photo = url
  } catch (e) {
    console.error(e)
    pageError.value = t('students.saveFailedMessage')
  }
}

function applyStudent(s: Student) {
  student.value = s
  linkedParents.value = (s.parents || []) as Parent[]
  studentForm.photo = s.photo || ''
  studentForm.firstName = s.firstName || ''
  studentForm.secondName = s.secondName || ''
  studentForm.thirdName = s.thirdName || ''
  studentForm.familyName = s.lastName || ''
  studentForm.dateOfBirth = s.dateOfBirth
    ? new Date(s.dateOfBirth).toISOString().slice(0, 10)
    : ''
  studentForm.gender = s.gender || 'male'
  studentForm.studentId = s.studentId || ''
  studentForm.nationality = s.nationality || ''
  studentForm.emergencyContact = s.emergencyContact || ''
  studentForm.medicalConditions = s.medicalInfo || ''
  selectedGroupId.value = s.groups?.[0]?.id || ''
  selectedPaymentLevelId.value = s.payment_level_id || s.paymentLevel?.id || ''
  currentBusId.value = s.buses?.[0]?.id || ''
  selectedBusId.value = currentBusId.value
}

async function loadPage() {
  pageLoading.value = true
  pageError.value = ''
  try {
    const [s, g, b, levels] = await Promise.all([
      studentService.getById(studentId.value),
      groupService.getActive(schoolId.value),
      busService.getAll(schoolId.value),
      paymentConfigService.listLevels(schoolId.value).catch(() => [] as SchoolPaymentLevel[]),
    ])
    groups.value = g || []
    buses.value = b || []
    paymentLevels.value = levels || []
    applyStudent(s)
  } catch (e) {
    console.error(e)
    pageError.value = t('students.saveFailedMessage')
  } finally {
    pageLoading.value = false
  }
}

async function saveStudent() {
  if (!studentId.value) return
  saving.value = true
  pageError.value = ''
  try {
    const updated = await studentService.update(studentId.value, {
      firstName: studentForm.firstName,
      secondName: studentForm.secondName,
      thirdName: studentForm.thirdName,
      lastName: studentForm.familyName,
      dateOfBirth: studentForm.dateOfBirth as any,
      gender: studentForm.gender,
      studentId: studentForm.studentId || undefined,
      nationality: studentForm.nationality || undefined,
      emergencyContact: studentForm.emergencyContact,
      medicalInfo: studentForm.medicalConditions,
      photo: studentForm.photo || undefined,
      address: student.value?.address || '',
    })
    applyStudent(updated)
    showSuccessFlash({
      title: t('students.saveSuccessTitle'),
      message: t('students.saveStudentSuccess'),
    })
  } catch (e) {
    console.error(e)
    pageError.value = t('students.saveFailedMessage')
  } finally {
    saving.value = false
  }
}

function onGroupChange() {
  const group = groups.value.find((g) => g.id === selectedGroupId.value)
  const levelId = (group as any)?.level_id || group?.level?.id
  if (levelId && paymentLevels.value.some((lv) => lv.id === levelId)) {
    selectedPaymentLevelId.value = levelId
  }
}

async function saveClass() {
  if (!studentId.value || !selectedGroupId.value) return
  saving.value = true
  try {
    const updated = await studentService.assignToGroup(studentId.value, selectedGroupId.value, {
      paymentLevelId: selectedPaymentLevelId.value || undefined,
      replaceExistingGroups: true,
    })
    applyStudent(updated)
    showSuccessFlash({
      title: t('students.saveSuccessTitle'),
      message: t('students.saveGroupSuccess'),
    })
  } catch (e) {
    console.error(e)
    pageError.value = t('students.saveFailedMessage')
  } finally {
    saving.value = false
  }
}

async function saveBus() {
  if (!studentId.value) return
  saving.value = true
  try {
    let updated: Student
    if (!selectedBusId.value) {
      if (currentBusId.value) {
        updated = await studentService.removeFromBus(studentId.value, currentBusId.value)
      } else {
        updated = await studentService.getById(studentId.value)
      }
    } else {
      updated = await studentService.assignToBus(studentId.value, selectedBusId.value)
    }
    applyStudent(updated)
    showSuccessFlash({
      title: t('students.saveSuccessTitle'),
      message: t('students.saveBusSuccess'),
    })
  } catch (e) {
    console.error(e)
    pageError.value = t('students.saveFailedMessage')
  } finally {
    saving.value = false
  }
}

async function clearBus() {
  selectedBusId.value = ''
  await saveBus()
}

function resetCreateForm() {
  createForm.fullName = ''
  createForm.tribe = ''
  createForm.workplace = ''
  createForm.workPhone = ''
  createForm.mobile = ''
  createForm.email = ''
  createForm.maritalStatus = ''
  createForm.organizationName = ''
  createForm.orgPhone = ''
  createForm.responsiblePerson = ''
  createForm.responsiblePhone = ''
}

function openAddParent() {
  addError.value = ''
  addForm.relationship = 'father'
  addForm.mode = 'existing'
  selectedExistingParentId.value = null
  parentSearchQuery.value = ''
  parentSearchResults.value = []
  resetCreateForm()
  showAddParent.value = true
}

function closeAddParent() {
  showAddParent.value = false
  addError.value = ''
}

function scheduleParentSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(runParentSearch, 300)
}

async function runParentSearch() {
  const q = parentSearchQuery.value.trim()
  if (!q) {
    parentSearchResults.value = []
    return
  }
  parentSearchLoading.value = true
  try {
    parentSearchResults.value = await parentService.search(q)
  } catch (e) {
    console.error(e)
    parentSearchResults.value = []
  } finally {
    parentSearchLoading.value = false
  }
}

function onParentPickedFromModal(parent: Parent) {
  selectedExistingParentId.value = parent.id
  showParentSearchModal.value = false
  addForm.mode = 'existing'
  if (!parentSearchResults.value.some((p) => p.id === parent.id)) {
    parentSearchResults.value = [parent, ...parentSearchResults.value]
  }
}

async function submitAddParent() {
  if (!studentId.value || !canSubmitAdd.value) return
  saving.value = true
  addError.value = ''
  try {
    if (addForm.mode === 'existing' && selectedExistingParentId.value != null) {
      await parentService.assignToStudent(
        selectedExistingParentId.value,
        studentId.value,
        addForm.relationship,
      )
    } else if (addForm.relationship === 'guardian') {
      const nameParts = splitFullName(createForm.responsiblePerson)
      await parentService.create({
        firstName: nameParts.firstName,
        lastName: createForm.organizationName.trim() || nameParts.lastName,
        phone: createForm.orgPhone.trim(),
        organizationName: createForm.organizationName.trim(),
        responsiblePerson: createForm.responsiblePerson.trim(),
        responsiblePhone: createForm.responsiblePhone.trim(),
        studentIds: [studentId.value],
        relationship: 'guardian',
      })
    } else {
      const nameParts = splitFullName(createForm.fullName)
      await parentService.create({
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        phone: createForm.mobile.trim(),
        email: createForm.email.trim() || undefined,
        tribe: createForm.tribe.trim() || undefined,
        workplace: createForm.workplace.trim() || undefined,
        workPhone: createForm.workPhone.trim() || undefined,
        maritalStatus: createForm.maritalStatus || undefined,
        studentIds: [studentId.value],
        relationship: addForm.relationship,
      })
    }
    const refreshed = await studentService.getById(studentId.value)
    applyStudent(refreshed)
    closeAddParent()
    showSuccessFlash({
      title: t('students.saveSuccessTitle'),
      message: t('students.saveParentsSuccess'),
    })
  } catch (e) {
    console.error(e)
    addError.value = t('students.saveFailedMessage')
  } finally {
    saving.value = false
  }
}

async function unlinkParent(parent: Parent) {
  if (!studentId.value) return
  saving.value = true
  try {
    await parentService.unassignFromStudent(parent.id, studentId.value)
    const refreshed = await studentService.getById(studentId.value)
    applyStudent(refreshed)
  } catch (e) {
    console.error(e)
    pageError.value = t('students.saveFailedMessage')
  } finally {
    saving.value = false
  }
}

onMounted(loadPage)
</script>
