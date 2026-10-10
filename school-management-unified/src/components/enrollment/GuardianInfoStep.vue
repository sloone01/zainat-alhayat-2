<template>
  <div class="space-y-6">
    <!-- Section Header (full wizard only) -->
    <div v-if="!compact" class="text-center max-w-2xl mx-auto">
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $t('enrollment.steps.guardian') }}</h2>
      <p class="text-gray-600 text-lg leading-relaxed">{{ $t('enrollment.guardianDescription') }}</p>
    </div>

    <div class="mx-auto max-w-4xl space-y-6">
      <div class="rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-sm text-gray-700">
        {{ $t('enrollment.bothParentsRequired') }}
      </div>

      <!-- Parents grid — same card pattern as the student edit page's parents tab
           (article + colored banner header), so this looks like the rest of the app. -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          v-for="role in (['father', 'mother'] as const)"
          :key="role"
          class="overflow-hidden rounded-xl border bg-white shadow-sm ring-1 ring-black/[0.02] transition-colors"
          :class="localData.type === role ? 'border-primary-300 ring-2 ring-primary-500/40' : 'border-gray-200/90'"
        >
          <div
            class="flex items-center justify-between gap-2 border-b px-4 py-3"
            :class="role === 'father' ? 'border-blue-100 bg-blue-50 text-blue-800' : 'border-pink-100 bg-pink-50 text-pink-800'"
          >
            <span class="text-xs font-bold uppercase tracking-wide">
              {{ role === 'father' ? $t('enrollment.father') : $t('enrollment.mother') }}
            </span>
            <span
              v-if="localData.type === role"
              class="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-primary-700"
            >
              {{ $t('enrollment.guardianBadge') }}
            </span>
          </div>

          <div v-if="parentFilled(role)" class="space-y-2 px-4 py-4">
            <p class="text-sm font-semibold text-gray-900">{{ parentName(role) }}</p>
            <p v-if="info(role).mobile" class="text-xs text-gray-600">{{ info(role).mobile }}</p>
            <p v-if="info(role).email" class="text-xs text-gray-500">{{ info(role).email }}</p>
            <p v-if="info(role).civil_id" class="text-xs text-gray-500">{{ $t('students.civilId') }}: {{ info(role).civil_id }}</p>
            <div class="flex items-center gap-2 pt-1">
              <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="openEdit(role)">
                {{ $t('common.edit') }}
              </button>
              <button
                v-if="localData.type !== role"
                type="button"
                class="rounded-lg border border-primary-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                @click="localData.type = role"
              >
                {{ $t('enrollment.setAsGuardian') }}
              </button>
            </div>
          </div>

          <button
            v-else
            type="button"
            class="flex w-full flex-col items-center justify-center gap-2 px-4 py-10 text-center text-gray-500 transition-colors hover:bg-primary-50/40"
            @click="openEdit(role)"
          >
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
            <span class="text-sm font-semibold text-primary-700">{{ $t('common.add') }}</span>
          </button>
        </article>
      </div>

      <!-- Emergency Contact -->
      <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <h3 class="text-sm font-semibold text-gray-900">{{ $t('enrollment.emergencyContact') }}</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.emergencyContactName') }} <span v-if="!editMode" class="text-red-500">*</span></label>
            <input v-model="localData.emergencyContact.fullName" type="text" :required="!editMode" class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.mobile') }} <span v-if="!editMode" class="text-red-500">*</span></label>
            <input v-model="localData.emergencyContact.mobile" type="tel" :required="!editMode" class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.relationship') }} <span v-if="!editMode" class="text-red-500">*</span></label>
            <input v-model="localData.emergencyContact.relationship" type="text" :required="!editMode" class="fk-field">
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.workplace') }}</label>
            <input v-model="localData.emergencyContact.workplace" type="text" class="fk-field">
          </div>
        </div>
      </div>
    </div>

    <WizardStepNav
      v-if="compact"
      :disabled="!isValid"
      @next="handleNext"
      @back="$emit('back')"
    />
    <div v-else class="flex justify-between gap-4 border-t border-gray-200 pt-6">
      <button type="button" class="fk-btn fk-btn--pearl" @click="$emit('back')">{{ $t('common.back') }}</button>
      <button type="button" class="fk-btn fk-btn--primary" :disabled="!isValid" @click="handleNext">{{ $t('common.next') }}</button>
    </div>

    <!-- Add / edit parent pop-up -->
    <FikrDialog
      :show="editing !== null"
      :title="editing === 'mother' ? $t('enrollment.motherInfo') : $t('enrollment.fatherInfo')"
      plain-footer
      @close="cancelEdit"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.civilId') }} <span class="text-red-500">*</span></label>
          <input
            v-model="draft.civil_id"
            type="text"
            required
            dir="ltr"
            class="fk-field"
            :class="[
              isRTL ? 'text-end' : '',
              draftCivilConflict ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : '',
            ]"
            :placeholder="$t('students.civilId')"
            @input="scheduleCivilLookup"
          >
          <p v-if="draftCivilConflict" class="mt-1 text-xs font-medium text-red-600" role="alert">{{ draftCivilConflict }}</p>
          <p v-else-if="civilLoading" class="mt-1 text-xs text-gray-500">{{ $t('common.loading') }}</p>
          <p v-else-if="civilNote" class="mt-1 text-xs text-primary-700">{{ civilNote }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.firstNameAr') }} <span class="text-red-500">*</span></label>
          <input v-model="draft.first_name_ar" type="text" required dir="rtl" lang="ar" class="fk-field">
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.firstNameEn') }} <span class="text-red-500">*</span></label>
          <input v-model="draft.first_name_en" type="text" required dir="ltr" lang="en" class="fk-field">
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.lastNameAr') }} <span class="text-red-500">*</span></label>
          <input v-model="draft.last_name_ar" type="text" required dir="rtl" lang="ar" class="fk-field">
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('students.lastNameEn') }} <span class="text-red-500">*</span></label>
          <input v-model="draft.last_name_en" type="text" required dir="ltr" lang="en" class="fk-field">
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.mobile') }} <span class="text-red-500">*</span></label>
          <input v-model="draft.mobile" @blur="validateDraftMobile" @input="draftMobileError = ''" type="tel" required class="fk-field" :class="draftMobileError ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : ''">
          <p v-if="draftMobileError" class="mt-1 text-xs text-red-600">{{ draftMobileError }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.email') }} <span class="text-red-500">*</span></label>
          <input v-model="draft.email" @blur="validateDraftEmail" @input="draftEmailError = ''" type="email" required dir="ltr" class="fk-field" :class="draftEmailError ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : ''">
          <p v-if="draftEmailError" class="mt-1 text-xs text-red-600">{{ draftEmailError }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.tribe') }}</label>
          <input v-model="draft.tribe" type="text" class="fk-field">
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.workplace') }}</label>
          <input v-model="draft.workplace" type="text" class="fk-field">
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('enrollment.maritalStatus') }}</label>
          <select v-model="draft.maritalStatus" class="fk-field">
            <option value="">{{ $t('enrollment.selectMaritalStatus') }}</option>
            <option value="married">{{ $t('enrollment.married') }}</option>
            <option value="divorced">{{ $t('enrollment.divorced') }}</option>
            <option value="widowed">{{ $t('enrollment.widowed') }}</option>
          </select>
        </div>
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input v-model="draft.isGuardian" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500/40">
          {{ $t('enrollment.setAsGuardian') }}
        </label>
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input v-model="draft.createLogin" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500/40">
          {{ $t('students.createLoginAccount') }}
        </label>
      </div>

      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="cancelEdit">{{ $t('common.cancel') }}</button>
        <button type="button" class="fk-btn fk-btn--primary" :disabled="!draftValid" @click="saveEdit">{{ $t('common.save') }}</button>
      </template>
    </FikrDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { emailError, phoneError, isValidPhone } from '@/utils/validation'
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import { userService } from '@/services/user.service'

type ParentInfo = {
  fullName: string
  first_name_ar: string
  first_name_en: string
  last_name_ar: string
  last_name_en: string
  civil_id: string
  tribe: string
  workplace: string
  workPhone: string
  mobile: string
  email: string
  maritalStatus: string
}

const props = withDefaults(
  defineProps<{
    compact?: boolean
    /** Editing an existing record: a parent that was empty when loaded stays optional. */
    editMode?: boolean
    /** Student civil ID — parents must not reuse it. */
    studentCivilId?: string
    modelValue: {
      type: string
      fatherInfo: ParentInfo
      motherInfo: ParentInfo
      otherInfo: {
        organizationName: string
        phone: string
        responsiblePerson: string
        responsiblePhone: string
      }
      emergencyContact: {
        fullName: string
        tribe: string
        workplace: string
        workPhone: string
        mobile: string
        relationship: string
      }
    }
  }>(),
  { compact: false, editMode: false, studentCivilId: '' },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'next'): void
  (e: 'back'): void
}>()

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const localData = ref({ ...props.modelValue })

watch(localData, (v) => emit('update:modelValue', { ...v }), { deep: true })

/** Match backend normalizeCivilId — one person, one civil ID. */
function normalizeCivil(value?: string | null): string {
  return (value ?? '').replace(/\s+/g, '').trim()
}

const studentCivil = computed(() => normalizeCivil(props.studentCivilId))

const info = (role: 'father' | 'mother') => (role === 'father' ? localData.value.fatherInfo : localData.value.motherInfo)
const parentName = (role: 'father' | 'mother') => {
  const p = info(role)
  return `${p.first_name_ar} ${p.last_name_ar}`.trim() || `${p.first_name_en} ${p.last_name_en}`.trim() || '—'
}
const parentFilled = (role: 'father' | 'mother') => {
  const p = info(role)
  return !!(p.first_name_ar?.trim() || p.first_name_en?.trim())
}

function civilConflictMessage(civil: string, otherParentCivil?: string): string {
  const c = normalizeCivil(civil)
  if (!c) return ''
  if (studentCivil.value && c === studentCivil.value) {
    return t('enrollment.civilIdMatchesStudent')
  }
  const other = normalizeCivil(otherParentCivil)
  if (other && c === other) {
    return t('enrollment.civilIdMatchesOtherParent')
  }
  return ''
}

const parentsCivilConflict = computed(() => {
  const father = normalizeCivil(localData.value.fatherInfo.civil_id)
  const mother = normalizeCivil(localData.value.motherInfo.civil_id)
  if (father && civilConflictMessage(father, mother)) return true
  if (mother && civilConflictMessage(mother, father)) return true
  return false
})

const parentComplete = (p: ParentInfo, role: 'father' | 'mother') => {
  const otherCivil =
    role === 'father' ? localData.value.motherInfo.civil_id : localData.value.fatherInfo.civil_id
  return !!(
    p.civil_id?.trim() &&
    !civilConflictMessage(p.civil_id, otherCivil) &&
    p.first_name_ar?.trim() &&
    p.first_name_en?.trim() &&
    p.last_name_ar?.trim() &&
    p.last_name_en?.trim() &&
    p.mobile && isValidPhone(p.mobile) &&
    p.email && !emailError(p.email)
  )
}

/**
 * Edit mode grandfathers the loaded record: a field left exactly as it was loaded
 * (including empty) never blocks the step — legacy rows predate today's required
 * fields and format rules, and were otherwise impossible to edit. Anything the
 * user CHANGES must satisfy the current rules. New registrations are unaffected.
 */
const PARENT_FIELDS = ['civil_id', 'first_name_ar', 'first_name_en', 'last_name_ar', 'last_name_en', 'mobile', 'email'] as const
type ParentField = (typeof PARENT_FIELDS)[number]
const snapshotParent = (p: ParentInfo | undefined | null): Record<ParentField, string> => {
  const out = {} as Record<ParentField, string>
  for (const f of PARENT_FIELDS) out[f] = (p?.[f] || '').trim()
  return out
}
const initialParent = {
  father: snapshotParent(props.modelValue.fatherInfo),
  mother: snapshotParent(props.modelValue.motherInfo),
}
const parentCompleteEdit = (p: ParentInfo, role: 'father' | 'mother') => {
  const init = initialParent[role]
  const otherCivil =
    role === 'father' ? localData.value.motherInfo.civil_id : localData.value.fatherInfo.civil_id
  const fieldOk = (field: ParentField, validator?: (v: string) => boolean) => {
    const v = (p[field] || '').trim()
    if (v === init[field]) return true // unchanged from the saved record (even empty)
    if (!v) return false // cleared a value that used to exist
    return validator ? validator(v) : true
  }
  // Always block reused civil IDs (student / other parent), even on legacy rows.
  if (normalizeCivil(p.civil_id) && civilConflictMessage(p.civil_id, otherCivil)) return false
  return (
    fieldOk('civil_id') &&
    fieldOk('first_name_ar') &&
    fieldOk('first_name_en') &&
    fieldOk('last_name_ar') &&
    fieldOk('last_name_en') &&
    fieldOk('mobile', (v) => isValidPhone(v)) &&
    fieldOk('email', (v) => !emailError(v))
  )
}
const parentOk = (role: 'father' | 'mother') => {
  const p = role === 'father' ? localData.value.fatherInfo : localData.value.motherInfo
  return props.editMode ? parentCompleteEdit(p, role) : parentComplete(p, role)
}

const isValid = computed(() => {
  if (localData.value.type !== 'father' && localData.value.type !== 'mother') return false
  if (parentsCivilConflict.value) return false
  if (!parentOk('father') || !parentOk('mother')) return false
  if (props.editMode) return true
  return !!(
    localData.value.emergencyContact.fullName &&
    localData.value.emergencyContact.mobile &&
    localData.value.emergencyContact.relationship
  )
})

const handleNext = () => {
  if (isValid.value) emit('next')
}

/* ---- Add / edit parent modal ---- */
const editing = ref<'father' | 'mother' | null>(null)
const draftEmailError = ref('')
const draftMobileError = ref('')
const civilLoading = ref(false)
const civilNote = ref('')
let civilTimer: ReturnType<typeof setTimeout> | null = null

const emptyDraft = () => ({
  first_name_ar: '', first_name_en: '', last_name_ar: '', last_name_en: '',
  civil_id: '', tribe: '', workplace: '', workPhone: '', mobile: '', email: '',
  maritalStatus: '', isGuardian: false, createLogin: true,
})
const draft = reactive(emptyDraft())

function openEdit(role: 'father' | 'mother') {
  const src = info(role)
  Object.assign(draft, emptyDraft(), {
    first_name_ar: src.first_name_ar, first_name_en: src.first_name_en,
    last_name_ar: src.last_name_ar, last_name_en: src.last_name_en,
    civil_id: src.civil_id, tribe: src.tribe, workplace: src.workplace,
    workPhone: src.workPhone, mobile: src.mobile, email: src.email,
    maritalStatus: src.maritalStatus, isGuardian: localData.value.type === role,
  })
  draftEmailError.value = ''
  draftMobileError.value = ''
  civilNote.value = ''
  editing.value = role
}

function cancelEdit() {
  editing.value = null
}

function validateDraftEmail() {
  const err = emailError(draft.email)
  draftEmailError.value = err ? t(err) : ''
}

function validateDraftMobile() {
  const err = phoneError(draft.mobile)
  draftMobileError.value = err ? t(err) : ''
}

const draftOtherParentCivil = computed(() => {
  if (editing.value === 'father') return localData.value.motherInfo.civil_id
  if (editing.value === 'mother') return localData.value.fatherInfo.civil_id
  return ''
})

const draftCivilConflict = computed(() =>
  civilConflictMessage(draft.civil_id, draftOtherParentCivil.value),
)

const draftValid = computed(() => !!(
  draft.civil_id.trim() &&
  !draftCivilConflict.value &&
  draft.first_name_ar.trim() && draft.first_name_en.trim() &&
  draft.last_name_ar.trim() && draft.last_name_en.trim() &&
  draft.mobile.trim() && isValidPhone(draft.mobile) &&
  draft.email.trim() && !emailError(draft.email)
))

function saveEdit() {
  if (!editing.value || !draftValid.value) {
    // Surface exactly what's blocking Save instead of leaving it silently disabled.
    validateDraftMobile()
    validateDraftEmail()
    return
  }
  const role = editing.value
  const target: ParentInfo = {
    fullName: `${draft.first_name_ar} ${draft.last_name_ar}`.trim() || `${draft.first_name_en} ${draft.last_name_en}`.trim(),
    first_name_ar: draft.first_name_ar, first_name_en: draft.first_name_en,
    last_name_ar: draft.last_name_ar, last_name_en: draft.last_name_en,
    civil_id: draft.civil_id, tribe: draft.tribe, workplace: draft.workplace,
    workPhone: draft.workPhone, mobile: draft.mobile, email: draft.email,
    maritalStatus: draft.maritalStatus,
  }
  if (role === 'father') localData.value.fatherInfo = target
  else localData.value.motherInfo = target
  if (draft.isGuardian) localData.value.type = role
  editing.value = null
}

// Civil ID first — look up an existing parent and load their details.
function scheduleCivilLookup() {
  civilNote.value = ''
  if (civilTimer) clearTimeout(civilTimer)
  civilTimer = setTimeout(runCivilLookup, 400)
}
async function runCivilLookup() {
  const civil = draft.civil_id.trim()
  if (civil.length < 4) return
  if (civilConflictMessage(civil, draftOtherParentCivil.value)) {
    civilNote.value = ''
    return
  }
  civilLoading.value = true
  try {
    const res = await userService.lookupParent({ civil_id: civil })
    if (res.exists) {
      draft.first_name_ar = res.first_name_ar || draft.first_name_ar
      draft.first_name_en = res.first_name_en || draft.first_name_en
      draft.last_name_ar = res.last_name_ar || draft.last_name_ar
      draft.last_name_en = res.last_name_en || draft.last_name_en
      draft.email = res.email || draft.email
      draft.mobile = res.phone || draft.mobile
      civilNote.value = t('students.existingParentLoaded')
    }
  } catch (e) {
    console.error(e)
  } finally {
    civilLoading.value = false
  }
}
</script>
