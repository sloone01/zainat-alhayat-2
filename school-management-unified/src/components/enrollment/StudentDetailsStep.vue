<template>
  <div class="space-y-6 lg:space-y-8">
    <div v-if="!compact" class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.student') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.studentDetailsDescription') }}</p>
    </div>

    <div class="mb-6 flex flex-col items-center gap-1.5">
      <div class="relative">
        <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-primary-50 to-teal-50 shadow-sm ring-1 ring-primary-100">
          <img v-if="photoPreview" :src="photoPreview" alt="" class="h-full w-full object-cover">
          <svg v-else class="h-9 w-9 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <label class="absolute -bottom-1 -end-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition hover:bg-primary-700">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input ref="photoInput" type="file" accept="image/*" @change="handlePhotoUpload" class="hidden">
        </label>
        <button v-if="photoPreview" type="button" class="absolute -top-1 -start-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600" @click="removePhoto">×</button>
      </div>
      <p class="text-[11px] text-gray-400">4 × 6</p>
    </div>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div class="md:col-span-2">
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.idNumber') }} <span class="text-red-500">*</span></label>
        <input
          v-model="localData.idNumber"
          type="text"
          required
          dir="ltr"
          class="fk-field"
          :class="[fieldErrors.idNumber ? 'border-red-300' : '', isRTL ? 'text-end' : '']"
          data-demo="id-number"
          :placeholder="$t('enrollment.idNumberPlaceholder')"
          @input="onCivilIdInput"
        >
        <p v-if="fieldErrors.idNumber" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.idNumber) }}</p>
        <p v-else-if="civilLoading" class="mt-1 text-xs text-gray-500">{{ $t('common.loading') }}</p>
        <p v-else-if="civilNote" class="mt-1 text-xs" :class="civilNoteTone === 'error' ? 'text-red-600' : 'text-primary-700'">{{ civilNote }}</p>
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.firstNameAr') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.first_name_ar" type="text" required dir="rtl" lang="ar" class="fk-field" :disabled="fieldsLocked" data-demo="first-name-ar">
        <p v-if="fieldErrors.first_name_ar" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.first_name_ar) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.secondNameAr') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.secondName" type="text" required dir="rtl" lang="ar" class="fk-field" :disabled="fieldsLocked" data-demo="second-name">
        <p v-if="fieldErrors.secondName" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.secondName) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.thirdNameAr') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.thirdName" type="text" required dir="rtl" lang="ar" class="fk-field" :disabled="fieldsLocked" data-demo="third-name">
        <p v-if="fieldErrors.thirdName" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.thirdName) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.lastNameAr') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.last_name_ar" type="text" required dir="rtl" lang="ar" class="fk-field" :disabled="fieldsLocked" data-demo="last-name-ar">
        <p v-if="fieldErrors.last_name_ar" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.last_name_ar) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.firstNameEn') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.first_name_en" type="text" required dir="ltr" lang="en" class="fk-field" :class="fieldErrors.first_name_en ? 'border-red-300' : ''" :disabled="fieldsLocked" data-demo="first-name-en">
        <p v-if="fieldErrors.first_name_en" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.first_name_en) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.secondNameEn') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.secondNameEn" type="text" required dir="ltr" lang="en" class="fk-field" :class="fieldErrors.secondNameEn ? 'border-red-300' : ''" :disabled="fieldsLocked" data-demo="second-name-en">
        <p v-if="fieldErrors.secondNameEn" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.secondNameEn) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.thirdNameEn') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.thirdNameEn" type="text" required dir="ltr" lang="en" class="fk-field" :class="fieldErrors.thirdNameEn ? 'border-red-300' : ''" :disabled="fieldsLocked" data-demo="third-name-en">
        <p v-if="fieldErrors.thirdNameEn" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.thirdNameEn) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.lastNameEn') }} <span class="text-red-500">*</span></label>
        <input v-model="localData.last_name_en" type="text" required dir="ltr" lang="en" class="fk-field" :class="fieldErrors.last_name_en ? 'border-red-300' : ''" :disabled="fieldsLocked" data-demo="last-name-en">
        <p v-if="fieldErrors.last_name_en" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.last_name_en) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.gender') }} <span class="text-red-500">*</span></label>
        <div class="flex h-10 items-center gap-6" :class="{ 'space-x-reverse': isRTL }">
          <label class="flex cursor-pointer items-center gap-2">
            <input v-model="localData.gender" type="radio" value="male" data-demo="gender-male" class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="fieldsLocked">
            <span class="text-sm text-gray-700">{{ $t('enrollment.male') }}</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input v-model="localData.gender" type="radio" value="female" class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" :disabled="fieldsLocked">
            <span class="text-sm text-gray-700">{{ $t('enrollment.female') }}</span>
          </label>
        </div>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.nationality') }} <span class="text-red-500">*</span></label>
        <select v-model="localData.nationality" required class="fk-field" data-demo="nationality" :disabled="fieldsLocked">
          <option value="">{{ $t('enrollment.selectNationality') }}</option>
          <option v-for="n in NATIONALITIES" :key="n.en" :value="n.en">{{ locale === 'ar' ? n.ar : n.en }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.religion') }}</label>
        <input v-model="localData.religion" type="text" class="fk-field" :placeholder="$t('enrollment.religionPlaceholder')" :disabled="fieldsLocked">
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.dateOfBirth') }} <span class="text-red-500">*</span></label>
        <input
          :value="dobInputValue"
          @input="handleDateChange"
          type="date"
          required
          class="fk-field"
          :class="fieldErrors.dateOfBirth ? 'border-red-300' : ''"
          data-demo="dob"
          :max="maxDob"
          :disabled="fieldsLocked"
        >
        <p v-if="fieldErrors.dateOfBirth" class="mt-1 text-xs text-red-600">{{ $t(fieldErrors.dateOfBirth) }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.ageAtStart') }}</label>
        <input :value="localData.age ? `${localData.age} سنوات` : ''" type="text" readonly class="fk-field cursor-not-allowed bg-gray-100 text-gray-600" :placeholder="$t('enrollment.ageCalculated')">
      </div>
    </div>

    <WizardStepNav
      v-if="compact"
      hide-back
      :disabled="!isValid"
      @next="handleNext"
    />

    <div v-else class="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
      <button
        disabled
        class="order-2 sm:order-1 px-6 py-3 text-gray-400 bg-gray-200 rounded-xl cursor-not-allowed font-medium"
      >
        {{ $t('common.back') }}
      </button>
      <button
        @click="handleNext"
        :disabled="!isValid"
        class="order-1 sm:order-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
      >
        {{ $t('common.next') }}
        <svg class="w-5 h-5 inline" :class="{ 'ml-2': !isRTL, 'mr-2': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'
import { NATIONALITIES, normaliseNationality } from '@/utils/nationalities'
import { isArabicName, isEnglishName, isIdNumber, isNotFutureDate, localDateInputValue, toLocalDateInputValue, type ValidationKey } from '@/utils/validation'
import { studentService, type StudentCivilLookupResult } from '@/services/student.service'
import { enrollmentService } from '@/services/enrollment.service'

type StudentModel = {
  fullName: string
  first_name_ar: string
  first_name_en: string
  secondName: string
  thirdName: string
  secondNameEn: string
  thirdNameEn: string
  last_name_ar: string
  last_name_en: string
  tribe: string
  idNumber: string
  gender: string
  nationality: string
  religion: string
  dateOfBirth: Date | string | null
  age: number | null
  hasSiblings: boolean
  photo: File | string | null
}

const props = withDefaults(
  defineProps<{
    compact?: boolean
    /** `public` = outer enrollment; `staff` = in-app register */
    mode?: 'staff' | 'public'
    schoolId?: string
    /** When editing an existing student, skip civil-ID conflict for their current ID. */
    existingStudentId?: string
    modelValue: StudentModel
  }>(),
  { compact: false, mode: 'staff', schoolId: '', existingStudentId: '' },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: StudentModel): void
  (e: 'next'): void
  (e: 'draft-loaded', studentId: string | null): void
  (
    e: 'enrollment-draft-loaded',
    draft: { id: string; payload: Record<string, unknown> | null } | null,
  ): void
}>()

const { locale, t } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
const photoInput = ref<HTMLInputElement>()
const photoPreview = ref<string | null>(null)

const localData = ref<StudentModel>({
  ...props.modelValue,
  secondName: props.modelValue.secondName || '',
  thirdName: props.modelValue.thirdName || '',
  secondNameEn: props.modelValue.secondNameEn || '',
  thirdNameEn: props.modelValue.thirdNameEn || '',
  tribe: props.modelValue.tribe || '',
})
localData.value.nationality = normaliseNationality(localData.value.nationality)

const civilLoading = ref(false)
const civilNote = ref('')
const civilNoteTone = ref<'info' | 'error'>('info')
const alreadyRegistered = ref(false)
const registrationElsewhere = ref(false)
const fieldsLocked = computed(() => alreadyRegistered.value || registrationElsewhere.value)
let civilTimer: ReturnType<typeof setTimeout> | null = null
let lookupSeq = 0

watch(
  () => [
    localData.value.first_name_ar,
    localData.value.secondName,
    localData.value.thirdName,
    localData.value.last_name_ar,
    localData.value.first_name_en,
    localData.value.secondNameEn,
    localData.value.thirdNameEn,
    localData.value.last_name_en,
  ],
  () => {
    const ar = [
      localData.value.first_name_ar,
      localData.value.secondName,
      localData.value.thirdName,
      localData.value.last_name_ar,
    ]
      .map((p) => (p || '').trim())
      .filter(Boolean)
      .join(' ')
    const en = [
      localData.value.first_name_en,
      localData.value.secondNameEn,
      localData.value.thirdNameEn,
      localData.value.last_name_en,
    ]
      .map((p) => (p || '').trim())
      .filter(Boolean)
      .join(' ')
    localData.value.fullName = ar || en
  },
)

watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

const initialValues: Record<string, string> = {
  first_name_ar: (props.modelValue.first_name_ar || '').trim(),
  secondName: (props.modelValue.secondName || '').trim(),
  thirdName: (props.modelValue.thirdName || '').trim(),
  last_name_ar: (props.modelValue.last_name_ar || '').trim(),
  first_name_en: (props.modelValue.first_name_en || '').trim(),
  secondNameEn: (props.modelValue.secondNameEn || '').trim(),
  thirdNameEn: (props.modelValue.thirdNameEn || '').trim(),
  last_name_en: (props.modelValue.last_name_en || '').trim(),
  idNumber: (props.modelValue.idNumber || '').trim(),
}
function isLegacyValue(field: keyof typeof initialValues, value: string | null | undefined): boolean {
  const v = (value || '').trim()
  return v !== '' && v === initialValues[field]
}

const fieldErrors = computed(() => {
  const d = localData.value
  const out: Record<string, ValidationKey | ''> = {}
  out.first_name_ar = d.first_name_ar?.trim() && !isLegacyValue('first_name_ar', d.first_name_ar) && !isArabicName(d.first_name_ar) ? 'validation.arabicOnly' : ''
  out.secondName = d.secondName?.trim() && !isLegacyValue('secondName', d.secondName) && !isArabicName(d.secondName) ? 'validation.arabicOnly' : ''
  out.thirdName = d.thirdName?.trim() && !isLegacyValue('thirdName', d.thirdName) && !isArabicName(d.thirdName) ? 'validation.arabicOnly' : ''
  out.last_name_ar = d.last_name_ar?.trim() && !isLegacyValue('last_name_ar', d.last_name_ar) && !isArabicName(d.last_name_ar) ? 'validation.arabicOnly' : ''
  out.first_name_en = d.first_name_en?.trim() && !isLegacyValue('first_name_en', d.first_name_en) && !isEnglishName(d.first_name_en) ? 'validation.englishOnly' : ''
  out.secondNameEn = d.secondNameEn?.trim() && !isLegacyValue('secondNameEn', d.secondNameEn) && !isEnglishName(d.secondNameEn) ? 'validation.englishOnly' : ''
  out.thirdNameEn = d.thirdNameEn?.trim() && !isLegacyValue('thirdNameEn', d.thirdNameEn) && !isEnglishName(d.thirdNameEn) ? 'validation.englishOnly' : ''
  out.last_name_en = d.last_name_en?.trim() && !isLegacyValue('last_name_en', d.last_name_en) && !isEnglishName(d.last_name_en) ? 'validation.englishOnly' : ''
  out.idNumber = d.idNumber?.trim() && !isLegacyValue('idNumber', d.idNumber) && !isIdNumber(d.idNumber) ? 'validation.idInvalid' : ''
  out.dateOfBirth = d.dateOfBirth && !isNotFutureDate(d.dateOfBirth) ? 'validation.dateOfBirthFuture' : ''
  return out
})
const hasFieldErrors = computed(() => Object.values(fieldErrors.value).some(Boolean))

const maxDob = localDateInputValue()
const dobInputValue = computed(() => toLocalDateInputValue(localData.value.dateOfBirth))

const isValid = computed(() => {
  if (alreadyRegistered.value || registrationElsewhere.value) return false
  if (hasFieldErrors.value) return false
  return !!(
    localData.value.idNumber?.trim() &&
    localData.value.first_name_ar?.trim() &&
    localData.value.secondName?.trim() &&
    localData.value.thirdName?.trim() &&
    localData.value.last_name_ar?.trim() &&
    localData.value.first_name_en?.trim() &&
    localData.value.secondNameEn?.trim() &&
    localData.value.thirdNameEn?.trim() &&
    localData.value.last_name_en?.trim() &&
    localData.value.gender &&
    localData.value.nationality &&
    localData.value.dateOfBirth &&
    isNotFutureDate(localData.value.dateOfBirth)
  )
})

function clearIdentityFields(keepCivil = true) {
  const civil = keepCivil ? localData.value.idNumber : ''
  localData.value.first_name_ar = ''
  localData.value.secondName = ''
  localData.value.thirdName = ''
  localData.value.last_name_ar = ''
  localData.value.first_name_en = ''
  localData.value.secondNameEn = ''
  localData.value.thirdNameEn = ''
  localData.value.last_name_en = ''
  localData.value.tribe = ''
  localData.value.gender = 'male'
  localData.value.nationality = ''
  localData.value.religion = ''
  localData.value.dateOfBirth = null
  localData.value.age = null
  localData.value.photo = null
  localData.value.fullName = ''
  localData.value.idNumber = civil
  photoPreview.value = null
  emit('draft-loaded', null)
}

function applyLookupStudent(row: NonNullable<StudentCivilLookupResult['student']>) {
  localData.value.first_name_ar = row.first_name_ar || ''
  localData.value.first_name_en = row.first_name_en || ''
  localData.value.secondName = row.secondName || ''
  localData.value.thirdName = row.thirdName || ''
  localData.value.secondNameEn = row.secondNameEn || ''
  localData.value.thirdNameEn = row.thirdNameEn || ''
  localData.value.last_name_ar = row.last_name_ar || ''
  localData.value.last_name_en = row.last_name_en || ''
  localData.value.tribe = row.tribe || ''
  localData.value.gender = row.gender || localData.value.gender
  localData.value.nationality = normaliseNationality(row.nationality || '')
  if (row.dateOfBirth) {
    localData.value.dateOfBirth = new Date(row.dateOfBirth)
    calculateAge()
  }
  if (row.photo) {
    localData.value.photo = row.photo
    setPhotoPreview(row.photo)
  }
  if (row.status === 'draft') {
    emit('draft-loaded', row.id)
  } else {
    emit('draft-loaded', null)
  }
}

const initialCivilId = (props.modelValue.idNumber || '').trim()

async function runCivilLookup() {
  const civil = localData.value.idNumber.trim()
  if (civil.length < 4 || (civil && !isIdNumber(civil) && civil.length < 8)) {
    return
  }
  if (props.mode === 'public' && !props.schoolId?.trim()) return

  // Editing this student — unchanged civil ID is fine; do not lock the form.
  if (props.existingStudentId && civil === initialCivilId) {
    alreadyRegistered.value = false
    registrationElsewhere.value = false
    civilNote.value = ''
    return
  }

  const seq = ++lookupSeq
  civilLoading.value = true
  civilNote.value = ''
  civilNoteTone.value = 'info'
  alreadyRegistered.value = false
  registrationElsewhere.value = false

  try {
    if (props.mode === 'public') {
      const data = await studentService.lookupByCivilIdPublic(civil, props.schoolId)
      if (seq !== lookupSeq) return

      if (data.already_registered) {
        alreadyRegistered.value = true
        clearIdentityFields(true)
        civilNote.value = t('enrollment.civilIdAlreadyRegistered')
        civilNoteTone.value = 'error'
        emit('enrollment-draft-loaded', null)
        return
      }

      // Outer form: only resume public enrollment drafts — never staff student drafts.
      const enr = await enrollmentService.lookupPublicDraft(civil, props.schoolId)
      if (seq !== lookupSeq) return

      if (enr.already_registered) {
        alreadyRegistered.value = true
        clearIdentityFields(true)
        civilNote.value = t('enrollment.civilIdAlreadyRegistered')
        civilNoteTone.value = 'error'
        emit('enrollment-draft-loaded', null)
        return
      }

      if (enr.enrollment_draft?.id) {
        const payload = enr.enrollment_draft.payload || {}
        const student = (payload.student && typeof payload.student === 'object'
          ? payload.student
          : {}) as Record<string, unknown>
        if (student.first_name_ar || student.first_name_en || student.dateOfBirth) {
          localData.value.first_name_ar = String(student.first_name_ar || '')
          localData.value.first_name_en = String(student.first_name_en || '')
          localData.value.secondName = String(student.secondName || '')
          localData.value.thirdName = String(student.thirdName || '')
          localData.value.secondNameEn = String(student.secondNameEn || '')
          localData.value.thirdNameEn = String(student.thirdNameEn || '')
          localData.value.last_name_ar = String(student.last_name_ar || '')
          localData.value.last_name_en = String(student.last_name_en || '')
          localData.value.tribe = String(student.tribe || '')
          localData.value.gender = student.gender === 'female' ? 'female' : 'male'
          localData.value.nationality = normaliseNationality(String(student.nationality || ''))
          if (student.dateOfBirth) {
            localData.value.dateOfBirth = new Date(String(student.dateOfBirth))
            calculateAge()
          }
          if (typeof student.photo === 'string' && student.photo) {
            localData.value.photo = student.photo
            setPhotoPreview(student.photo)
          }
          if (typeof student.religion === 'string') {
            localData.value.religion = student.religion
          }
          if (typeof student.hasSiblings === 'boolean') {
            localData.value.hasSiblings = student.hasSiblings
          }
        }
        civilNote.value = t('enrollment.civilIdPublicDraftLoaded')
        civilNoteTone.value = 'info'
        emit('enrollment-draft-loaded', {
          id: enr.enrollment_draft.id,
          payload: enr.enrollment_draft.payload,
        })
        emit('draft-loaded', null)
        return
      }

      if (data.allow_new && data.exists && !data.same_school) {
        clearIdentityFields(true)
        civilNote.value = t('enrollment.civilIdOtherSchool')
        civilNoteTone.value = 'info'
        emit('enrollment-draft-loaded', null)
        return
      }

      civilNote.value = ''
      emit('enrollment-draft-loaded', null)
      emit('draft-loaded', null)
      return
    }

    const data = await studentService.lookupByCivilId(civil)
    if (seq !== lookupSeq) return

    if (!data.exists) {
      civilNote.value = ''
      emit('draft-loaded', null)
      return
    }

    // Same student being edited (civil changed then changed back, or API returned them).
    if (
      props.existingStudentId &&
      data.student?.id &&
      String(data.student.id) === String(props.existingStudentId)
    ) {
      alreadyRegistered.value = false
      registrationElsewhere.value = false
      civilNote.value = ''
      return
    }

    if (data.already_registered) {
      alreadyRegistered.value = true
      clearIdentityFields(true)
      civilNote.value = t('enrollment.civilIdAlreadyRegistered')
      civilNoteTone.value = 'error'
      return
    }

    // Staff: draft at another school — note only; do not load details.
    if (
      data.registration_in_progress_elsewhere ||
      (data.status === 'draft' && !data.same_school)
    ) {
      registrationElsewhere.value = true
      clearIdentityFields(true)
      civilNote.value = t('enrollment.civilIdDraftElsewhere')
      civilNoteTone.value = 'error'
      emit('draft-loaded', null)
      return
    }

    // Only load details for students that belong to this school (staff register drafts).
    if (data.student && data.same_school) {
      applyLookupStudent(data.student)
      civilNote.value =
        data.status === 'draft'
          ? t('enrollment.civilIdDraftLoaded')
          : t('enrollment.civilIdDetailsLoaded')
      civilNoteTone.value = 'info'
      return
    }
  } catch {
    if (seq !== lookupSeq) return
    civilNote.value = ''
  } finally {
    if (seq === lookupSeq) civilLoading.value = false
  }
}

function onCivilIdInput() {
  alreadyRegistered.value = false
  registrationElsewhere.value = false
  civilNote.value = ''
  if (civilTimer) clearTimeout(civilTimer)
  civilTimer = setTimeout(runCivilLookup, 450)
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    localData.value.photo = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const setPhotoPreview = (photo: File | string | null) => {
  if (!photo) {
    photoPreview.value = null
    return
  }
  if (typeof photo === 'string') {
    photoPreview.value = photo
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(photo)
}

const removePhoto = () => {
  localData.value.photo = null
  photoPreview.value = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const handleDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const dateString = target.value
  if (dateString) {
    // Parse as local calendar date (avoid UTC shift from `new Date('YYYY-MM-DD')`).
    const [y, m, d] = dateString.split('-').map(Number)
    localData.value.dateOfBirth = new Date(y, m - 1, d)
    calculateAge()
  } else {
    localData.value.dateOfBirth = null
    localData.value.age = null
  }
}

const calculateAge = () => {
  if (localData.value.dateOfBirth) {
    const birthDate = new Date(localData.value.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    let actualAge = age
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge = age - 1
    }

    localData.value.age = actualAge
  }
}

const handleNext = () => {
  if (isValid.value) {
    emit('next')
  }
}

setPhotoPreview(props.modelValue.photo)

if (props.modelValue.dateOfBirth) {
  calculateAge()
}

if (props.modelValue.idNumber?.trim() && !props.existingStudentId) {
  void runCivilLookup()
}
</script>
