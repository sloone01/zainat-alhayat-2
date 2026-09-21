<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="pageTitle"
        :subtitle="$t('userManagement.addUserPageSubtitle')"
      >
        <template #leading>
          <router-link
            :to="backTo"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('userManagement.backToUsers')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="saveError" class="fk-alert fk-alert--error">{{ saveError }}</div>

      <form
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
        @submit.prevent="submit"
      >
        <header class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/40 px-5 py-4 sm:px-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-gray-900">{{ $t('userManagement.accountInfo') }}</h2>
              <p class="mt-0.5 text-sm text-gray-500">{{ $t('userManagement.addUserDetailsHint') }}</p>
            </div>
          </div>
        </header>

        <div class="space-y-5 p-6">
        <div class="space-y-5">
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-first-name-ar">
                {{ $t('students.firstNameAr') }} *
              </label>
              <input
                id="user-first-name-ar"
                @blur="touched.first_name_ar = true"
                v-model="form.first_name_ar"
                type="text"
                required
                dir="rtl"
                lang="ar"
                class="fk-field"
              >
              <p v-if="errors.first_name_ar" class="mt-1 text-xs text-red-600">{{ $t(errors.first_name_ar) }}</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-first-name-en">
                {{ $t('students.firstNameEn') }} *
              </label>
              <input
                id="user-first-name-en"
                @blur="touched.first_name_en = true"
                v-model="form.first_name_en"
                type="text"
                required
                dir="ltr"
                lang="en"
                class="fk-field"
              >
              <p v-if="errors.first_name_en" class="mt-1 text-xs text-red-600">{{ $t(errors.first_name_en) }}</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-last-name-ar">
                {{ $t('students.lastNameAr') }} *
              </label>
              <input
                id="user-last-name-ar"
                @blur="touched.last_name_ar = true"
                v-model="form.last_name_ar"
                type="text"
                required
                dir="rtl"
                lang="ar"
                class="fk-field"
              >
              <p v-if="errors.last_name_ar" class="mt-1 text-xs text-red-600">{{ $t(errors.last_name_ar) }}</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-last-name-en">
                {{ $t('students.lastNameEn') }} *
              </label>
              <input
                id="user-last-name-en"
                @blur="touched.last_name_en = true"
                v-model="form.last_name_en"
                type="text"
                required
                dir="ltr"
                lang="en"
                class="fk-field"
              >
              <p v-if="errors.last_name_en" class="mt-1 text-xs text-red-600">{{ $t(errors.last_name_en) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-email">
                {{ $t('userManagement.email') }} *
              </label>
              <input
                id="user-email"
                @blur="touched.email = true"
                v-model="form.email"
                type="email"
                required
                dir="ltr"
                class="fk-field"
                :placeholder="$t('userManagement.emailPlaceholder')"
              >
              <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ $t(errors.email) }}</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-mobile">
                {{ $t('userManagement.mobile') }} *
              </label>
              <input
                id="user-mobile"
                @blur="touched.mobile = true"
                v-model="form.mobile"
                type="tel"
                required
                dir="ltr"
                class="fk-field"
                :placeholder="$t('userManagement.mobilePlaceholder')"
              >
              <p v-if="errors.mobile" class="mt-1 text-xs text-red-600">{{ $t(errors.mobile) }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-civil-id">
                {{ $t('students.civilId') }}
              </label>
              <input
                id="user-civil-id"
                v-model="form.civil_id"
                type="text"
                dir="ltr"
                class="fk-field"
              >
              <p v-if="errors.civil_id" class="mt-1 text-xs text-red-600">{{ $t(errors.civil_id) }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-preferred-language">
                {{ $t('userManagement.preferredLanguage') }}
              </label>
              <select id="user-preferred-language" v-model="form.preferred_language" class="fk-field">
                <option value="ar">{{ $t('userManagement.languageAr') }}</option>
                <option value="en">{{ $t('userManagement.languageEn') }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-link-student">
                {{ studentFieldLabel }} *
              </label>
              <button
                id="user-link-student"
                type="button"
                class="fk-field flex w-full items-center justify-between gap-2 text-start"
                :disabled="studentsLoading"
                @click="openStudentPicker"
              >
                <span :class="selectedStudent ? 'text-fikr-ink' : 'text-gray-400'" class="truncate">
                  {{
                    studentsLoading
                      ? $t('common.loading')
                      : selectedStudent
                        ? studentLabel(selectedStudent)
                        : $t('userManagement.selectStudent')
                  }}
                </span>
                <svg class="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p class="mt-1 text-xs text-gray-500">
                {{ studentHintText }}
              </p>
            </div>
            <div v-if="userType === 'parent'">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-relationship">
                {{ $t('userManagement.relationship') }}
              </label>
              <select id="user-relationship" v-model="form.relationship" class="fk-field">
                <option value="father">{{ $t('students.relationshipFather') }}</option>
                <option value="mother">{{ $t('students.relationshipMother') }}</option>
                <option value="guardian">{{ $t('students.relationshipGuardian') }}</option>
              </select>
            </div>
          </div>
          <div class="fk-note max-w-3xl">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="font-semibold text-fikr-ink">{{ $t('userManagement.passwordInfo') }}</p>
              <p class="mt-0.5">
                {{ userType === 'student' ? $t('userManagement.studentPasswordDetails') : $t('userManagement.passwordDetails') }}
              </p>
            </div>
          </div>
        </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:px-6">
          <router-link :to="backTo" class="fk-btn fk-btn--pearl">
            {{ $t('common.cancel') }}
          </router-link>
          <button
            type="submit"
            class="fk-btn fk-btn--primary"
            :disabled="!isValid || saving"
          >
            {{ saving ? $t('common.saving') : submitLabel }}
          </button>
        </div>
      </form>
    </div>

    <FikrDialog
      :show="studentPickerOpen"
      :title="studentFieldLabel"
      size="md"
      plain-footer
      @close="studentPickerOpen = false"
    >
      <input
        v-model="studentQuery"
        type="search"
        class="fk-field mb-3"
        :placeholder="$t('userManagement.searchStudent')"
        autofocus
      >
      <p v-if="!studentsLoading && !filteredStudents.length" class="py-6 text-center text-sm text-fikr-ink-muted">
        {{ $t('userManagement.noStudentsToLink') }}
      </p>
      <ul v-else class="max-h-80 divide-y divide-fikr-hairline overflow-y-auto rounded-xl border border-fikr-hairline">
        <li v-for="s in filteredStudents" :key="s.id">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :class="s.id === form.studentId ? 'font-semibold text-primary-800' : 'text-fikr-ink'"
            :disabled="userType === 'student' && studentHasAccount(s)"
            @click="pickStudent(s)"
          >
            <span class="truncate">{{ studentLabel(s) }}</span>
            <span
              v-if="userType === 'student' && studentHasAccount(s)"
              class="shrink-0 text-xs text-gray-500"
            >
              {{ $t('userManagement.studentAlreadyHasAccount') }}
            </span>
            <svg
              v-else-if="s.id === form.studentId"
              class="h-4 w-4 shrink-0 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </li>
      </ul>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="studentPickerOpen = false">
          {{ $t('common.close') }}
        </button>
      </template>
    </FikrDialog>

    <ProgressDialog
      :show="showSuccess"
      state="success"
      :success-title="$t('userManagement.userCreatedSuccess')"
      :success-message="$t('userManagement.userCreatedMessage')"
      :auto-close="true"
      :auto-close-delay="2500"
      @close="onSuccessClose"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { userService, studentService, translateUserApiError } from '@/services'
import type { Student } from '@/services'
import { personFullName } from '@/utils/person-name'
import { emailError, isArabicName, isEnglishName, isIdNumber, isValidPhone, type ValidationKey } from '@/utils/validation'

type AccountKind = 'parent' | 'student'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const userType = ref<AccountKind>(route.query.type === 'student' ? 'student' : 'parent')

const form = ref({
  first_name_ar: '',
  first_name_en: '',
  last_name_ar: '',
  last_name_en: '',
  email: '',
  mobile: '',
  civil_id: '',
  preferred_language: 'ar' as 'ar' | 'en',
  studentId: '',
  relationship: 'guardian' as 'father' | 'mother' | 'guardian',
})

// A parent is only visible to a school through a linked student, and a student login is only
// tied to the school through its student record, so both require a student to link to.
const students = ref<Student[]>([])
const studentsLoading = ref(false)
const studentQuery = ref('')

function studentLabel(s: Student): string {
  return personFullName(s, locale.value) || `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim()
}

const filteredStudents = computed(() => {
  const q = studentQuery.value.trim().toLowerCase()
  const list = q
    ? students.value.filter((s) =>
        [studentLabel(s), s.first_name_ar, s.last_name_ar, s.first_name_en, s.last_name_en, s.firstName, s.lastName]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
    : students.value
  // Keep the current selection visible even when filtered out.
  const selected = students.value.find((s) => s.id === form.value.studentId)
  return selected && !list.includes(selected) ? [selected, ...list] : list
})

function studentHasAccount(s: Student): boolean {
  return Boolean(s.user)
}

const studentPickerOpen = ref(false)
const selectedStudent = computed(() => students.value.find((s) => s.id === form.value.studentId) || null)

function openStudentPicker() {
  if (studentsLoading.value) return
  studentQuery.value = ''
  studentPickerOpen.value = true
}

function pickStudent(s: Student) {
  if (userType.value === 'student' && studentHasAccount(s)) return
  form.value.studentId = s.id
  studentPickerOpen.value = false
}

const studentFieldLabel = computed(() =>
  userType.value === 'student'
    ? t('userManagement.linkedStudentRecord')
    : t('userManagement.linkedStudent'),
)

const studentHintText = computed(() => {
  if (!studentsLoading.value && students.value.length === 0) return t('userManagement.noStudentsToLink')
  return userType.value === 'student'
    ? t('userManagement.linkedStudentAccountHint')
    : t('userManagement.linkedStudentHint')
})

async function loadStudents() {
  if (students.value.length || studentsLoading.value) return
  studentsLoading.value = true
  try {
    students.value = await studentService.getAll()
  } catch (e: unknown) {
    saveError.value = translateUserApiError(e, t)
  } finally {
    studentsLoading.value = false
  }
}

onMounted(loadStudents)
watch(userType, () => {
  // Eligibility differs per account kind (a student may already have a login), so start over.
  form.value.studentId = ''
  void loadStudents()
})

const saving = ref(false)
const saveError = ref('')
const showSuccess = ref(false)

function onSuccessClose() {
  if (!showSuccess.value) return
  showSuccess.value = false
  void router.push(backTo.value)
}

const pageTitle = computed(() =>
  userType.value === 'student' ? t('userManagement.addStudent') : t('userManagement.addParent'),
)

const submitLabel = computed(() =>
  userType.value === 'student' ? t('userManagement.createStudent') : t('userManagement.createParent'),
)

const backTo = computed(() =>
  userType.value === 'student'
    ? { path: '/users/students' }
    : { path: '/users' },
)

const touched = reactive({ email: false, mobile: false, first_name_ar: false, first_name_en: false, last_name_ar: false, last_name_en: false })

// Inline messages: format problems show as soon as there is text; "required" once the field was left.
const errors = computed(() => {
  const f = form.value
  const out: Record<string, ValidationKey | ''> = {}
  out.first_name_ar = f.first_name_ar.trim() && !isArabicName(f.first_name_ar) ? 'validation.arabicOnly' : touched.first_name_ar && !f.first_name_ar.trim() ? 'validation.required' : ''
  out.last_name_ar = f.last_name_ar.trim() && !isArabicName(f.last_name_ar) ? 'validation.arabicOnly' : touched.last_name_ar && !f.last_name_ar.trim() ? 'validation.required' : ''
  out.first_name_en = f.first_name_en.trim() && !isEnglishName(f.first_name_en) ? 'validation.englishOnly' : touched.first_name_en && !f.first_name_en.trim() ? 'validation.required' : ''
  out.last_name_en = f.last_name_en.trim() && !isEnglishName(f.last_name_en) ? 'validation.englishOnly' : touched.last_name_en && !f.last_name_en.trim() ? 'validation.required' : ''
  out.email = f.email.trim() || touched.email ? emailError(f.email) : ''
  out.mobile = f.mobile.trim() ? (isValidPhone(f.mobile) ? '' : 'validation.phoneInvalid') : touched.mobile ? 'validation.required' : ''
  out.civil_id = f.civil_id.trim() && !isIdNumber(f.civil_id) ? 'validation.idInvalid' : ''
  return out
})
const hasErrors = computed(() => Object.values(errors.value).some(Boolean))

const isValid = computed(() =>
  !hasErrors.value &&
  form.value.first_name_ar.trim() !== '' &&
  form.value.first_name_en.trim() !== '' &&
  form.value.last_name_ar.trim() !== '' &&
  form.value.last_name_en.trim() !== '' &&
  emailError(form.value.email) === '' &&
  isValidPhone(form.value.mobile) &&
  form.value.studentId !== '',
)

watch(
  () => route.query.type,
  (type) => {
    userType.value = type === 'student' ? 'student' : 'parent'
  },
)

watch(userType, (kind) => {
  if (route.query.type !== kind) {
    void router.replace({ query: { ...route.query, type: kind } })
  }
}, { immediate: true })

async function submit() {
  if (!isValid.value || saving.value) return
  saving.value = true
  saveError.value = ''
  try {
    const first_name_ar = form.value.first_name_ar.trim()
    const first_name_en = form.value.first_name_en.trim()
    const last_name_ar = form.value.last_name_ar.trim()
    const last_name_en = form.value.last_name_en.trim()
    const username = form.value.email.split('@')[0]
    await userService.createUser({
      username,
      email: form.value.email.trim(),
      firstName: first_name_ar || first_name_en,
      lastName: last_name_ar || last_name_en,
      first_name_ar,
      first_name_en,
      last_name_ar,
      last_name_en,
      civil_id: form.value.civil_id.trim() || undefined,
      preferred_language: form.value.preferred_language,
      role: userType.value,
      phone: form.value.mobile.trim(),
      isActive: true,
      user_type: userType.value,
      studentId: form.value.studentId,
      ...(userType.value === 'parent' ? { relationship: form.value.relationship } : {}),
    })
    showSuccess.value = true
  } catch (e: unknown) {
    saveError.value = translateUserApiError(e, t)
  } finally {
    saving.value = false
  }
}
</script>
