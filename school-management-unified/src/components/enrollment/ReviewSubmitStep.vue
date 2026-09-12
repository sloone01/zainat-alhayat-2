<template>
  <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
    <div v-if="!compact" class="mx-auto max-w-2xl text-center">
      <h2 class="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">{{ $t('enrollment.steps.review') }}</h2>
      <p class="text-lg leading-relaxed text-gray-600">{{ $t('enrollment.reviewDescription') }}</p>
    </div>

    <div class="space-y-5">
      <section
        v-for="block in summaryBlocks"
        :key="block.key"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <header class="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
          <h3 class="text-sm font-semibold text-gray-900">{{ block.title }}</h3>
        </header>
        <dl class="divide-y divide-gray-100">
          <div
            v-for="row in block.rows"
            :key="row.label"
            class="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[minmax(8rem,40%)_1fr] sm:gap-4"
          >
            <dt class="text-xs font-medium text-gray-500">{{ row.label }}</dt>
            <dd class="text-sm font-medium text-gray-900 sm:text-end">{{ row.value }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="!isEditing" class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <header class="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
          <h3 class="text-sm font-semibold text-gray-900">{{ $t('enrollment.termsAndResponsibilities') }}</h3>
        </header>

        <div class="space-y-5 p-4">
          <div v-if="loadingResponsibilities" class="py-6 text-center text-sm text-gray-500">
            {{ $t('common.loading') }}
          </div>

          <template v-else>
            <div v-if="schoolItems.length" class="space-y-2">
              <h4 class="text-xs font-medium text-gray-600">{{ $t('enrollment.schoolResponsibilities') }}</h4>
              <ol class="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-sm text-gray-800">
                <li
                  v-for="(item, idx) in schoolItems"
                  :key="item.id"
                  class="flex gap-2"
                >
                  <span class="shrink-0 tabular-nums text-primary-700">{{ idx + 1 }}.</span>
                  <span>{{ displayText(item) }}</span>
                </li>
              </ol>
            </div>

            <div v-if="parentItems.length" class="space-y-2">
              <h4 class="text-xs font-medium text-gray-600">{{ $t('enrollment.parentResponsibilities') }}</h4>
              <ol class="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-sm text-gray-800">
                <li
                  v-for="(item, idx) in parentItems"
                  :key="item.id"
                  class="flex gap-2"
                >
                  <span class="shrink-0 tabular-nums text-primary-700">{{ idx + 1 }}.</span>
                  <span>{{ displayText(item) }}</span>
                </li>
              </ol>
            </div>
          </template>

          <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-primary-200 bg-primary-50/40 px-3 py-3">
            <input
              v-model="acceptTerms"
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            >
            <span class="text-sm font-medium leading-relaxed text-gray-900">
              {{ $t('enrollment.acceptTerms') }}
            </span>
          </label>
        </div>
      </section>
    </div>

    <WizardStepNav
      v-if="compact"
      :disabled="!canSubmit"
      :next-label="submitLabel"
      hide-next-chevron
      @next="handleSubmit"
      @back="$emit('back')"
    >
      <template #icon>
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </template>
    </WizardStepNav>

    <div v-else class="flex flex-col justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
      <button
        type="button"
        class="order-2 rounded-xl bg-gray-200 px-6 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-300 sm:order-1"
        @click="$emit('back')"
      >
        {{ $t('common.back') }}
      </button>
      <button
        type="button"
        :disabled="!canSubmit"
        class="order-1 rounded-xl bg-primary-600 px-8 py-3 text-lg font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2"
        @click="handleSubmit"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import WizardStepNav from '@/components/enrollment/WizardStepNav.vue'
import {
  enrollmentResponsibilityService,
  responsibilityDisplayText,
  type EnrollmentResponsibilityItem,
} from '@/services/enrollment-responsibility.service'

const props = withDefaults(
  defineProps<{
    formData: any
    compact?: boolean
    isEditing?: boolean
    schoolId?: string
  }>(),
  { compact: false, isEditing: false, schoolId: '' },
)

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'back'): void
}>()

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const acceptTerms = ref(false)
const loadingResponsibilities = ref(false)
const schoolItems = ref<EnrollmentResponsibilityItem[]>([])
const parentItems = ref<EnrollmentResponsibilityItem[]>([])

const canSubmit = computed(() => props.isEditing || acceptTerms.value)
const submitLabel = computed(() =>
  props.isEditing ? t('enrollment.updateApplication') : t('enrollment.submitApplication'),
)

const blank = (v: unknown) => {
  if (v == null || v === '') return t('common.notSpecified')
  return String(v)
}

const yesNo = (v: boolean) => (v ? t('common.yes') : t('common.no'))

type SummaryRow = { label: string; value: string }
type SummaryBlock = { key: string; title: string; rows: SummaryRow[] }

const summaryBlocks = computed((): SummaryBlock[] => {
  const f = props.formData
  const studentRows: SummaryRow[] = [
    { label: t('students.firstNameAr'), value: blank(f.student?.first_name_ar) },
    { label: t('students.firstNameEn'), value: blank(f.student?.first_name_en) },
    { label: t('students.lastNameAr'), value: blank(f.student?.last_name_ar) },
    { label: t('students.lastNameEn'), value: blank(f.student?.last_name_en) },
    { label: t('enrollment.tribe'), value: blank(f.student?.tribe) },
    { label: t('enrollment.idNumber'), value: blank(f.student?.idNumber) },
    {
      label: t('enrollment.gender'),
      value: f.student?.gender ? t(`enrollment.${f.student.gender}`) : t('common.notSpecified'),
    },
    { label: t('enrollment.nationality'), value: blank(f.student?.nationality) },
    { label: t('enrollment.religion'), value: blank(f.student?.religion) },
    { label: t('enrollment.dateOfBirth'), value: blank(f.student?.dateOfBirth) },
    { label: t('enrollment.hasSiblings'), value: yesNo(!!f.student?.hasSiblings) },
  ]

  const academicRows: SummaryRow[] = [
    {
      label: t('enrollment.enrollmentStatus'),
      value: f.academic?.enrollmentStatus
        ? t(`enrollment.${f.academic.enrollmentStatus}Student`)
        : t('common.notSpecified'),
    },
    {
      label: t('enrollment.gradeLevel'),
      value: f.academic?.gradeLevel
        ? t(`enrollment.${f.academic.gradeLevel}`)
        : t('common.notSpecified'),
    },
  ]
  if (f.academic?.enrollmentStatus === 'transfer') {
    academicRows.push({
      label: t('enrollment.previousSchool'),
      value: blank(f.academic?.previousSchool),
    })
  }

  const healthRows: SummaryRow[] = [
    { label: t('enrollment.allergies'), value: yesNo(!!f.health?.allergies) },
    { label: t('enrollment.seizures'), value: yesNo(!!f.health?.seizures) },
    { label: t('enrollment.surgeries'), value: yesNo(!!f.health?.surgeries) },
    { label: t('enrollment.chronicDiseases'), value: yesNo(!!f.health?.chronicDiseases) },
  ]
  if (f.health?.medicalReports?.length > 0) {
    healthRows.push({
      label: t('enrollment.medicalReports'),
      value: `${f.health.medicalReports.length} ${t('enrollment.uploadedFiles')}`,
    })
  }

  const guardianRows: SummaryRow[] = [
    {
      label: t('enrollment.guardianType'),
      value: f.guardian?.type ? t(`enrollment.${f.guardian.type}`) : t('common.notSpecified'),
    },
  ]
  if (f.guardian?.type === 'father') {
    guardianRows.push(
      { label: t('students.firstNameAr'), value: blank(f.guardian.fatherInfo?.first_name_ar) },
      { label: t('students.firstNameEn'), value: blank(f.guardian.fatherInfo?.first_name_en) },
      { label: t('enrollment.mobile'), value: blank(f.guardian.fatherInfo?.mobile) },
      { label: t('enrollment.email'), value: blank(f.guardian.fatherInfo?.email) },
    )
  } else if (f.guardian?.type === 'mother') {
    guardianRows.push(
      { label: t('students.firstNameAr'), value: blank(f.guardian.motherInfo?.first_name_ar) },
      { label: t('students.firstNameEn'), value: blank(f.guardian.motherInfo?.first_name_en) },
      { label: t('enrollment.mobile'), value: blank(f.guardian.motherInfo?.mobile) },
      { label: t('enrollment.email'), value: blank(f.guardian.motherInfo?.email) },
    )
  } else if (f.guardian?.type === 'other') {
    guardianRows.push(
      { label: t('enrollment.organizationName'), value: blank(f.guardian.otherInfo?.organizationName) },
      { label: t('enrollment.responsiblePerson'), value: blank(f.guardian.otherInfo?.responsiblePerson) },
    )
  }
  guardianRows.push(
    { label: t('enrollment.emergencyContactName'), value: blank(f.guardian?.emergencyContact?.fullName) },
    { label: t('enrollment.relationship'), value: blank(f.guardian?.emergencyContact?.relationship) },
    { label: t('enrollment.mobile'), value: blank(f.guardian?.emergencyContact?.mobile) },
  )

  const addressRows: SummaryRow[] = [
    { label: t('enrollment.area'), value: blank(f.address?.area) },
    { label: t('enrollment.village'), value: blank(f.address?.village) },
    { label: t('enrollment.landmark'), value: blank(f.address?.landmark) },
    {
      label: t('enrollment.housingType'),
      value: f.address?.housingType
        ? t(`enrollment.${f.address.housingType}`)
        : t('common.notSpecified'),
    },
    { label: t('enrollment.streetNumber'), value: blank(f.address?.streetNumber) },
    { label: t('enrollment.alleyNumber'), value: blank(f.address?.alleyNumber) },
  ]

  return [
    { key: 'student', title: t('enrollment.steps.student'), rows: studentRows },
    { key: 'academic', title: t('enrollment.steps.academic'), rows: academicRows },
    { key: 'health', title: t('enrollment.steps.health'), rows: healthRows },
    { key: 'guardian', title: t('enrollment.steps.guardian'), rows: guardianRows },
    { key: 'address', title: t('enrollment.steps.address'), rows: addressRows },
  ]
})

function displayText(item: EnrollmentResponsibilityItem) {
  return responsibilityDisplayText(item, locale.value)
}

async function loadResponsibilities(schoolId: string) {
  if (!schoolId || props.isEditing) {
    schoolItems.value = []
    parentItems.value = []
    return
  }
  loadingResponsibilities.value = true
  try {
    const data = await enrollmentResponsibilityService.listPublic(schoolId)
    schoolItems.value = data.school ?? []
    parentItems.value = data.parent ?? []
  } catch (e) {
    console.error(e)
    schoolItems.value = []
    parentItems.value = []
  } finally {
    loadingResponsibilities.value = false
  }
}

watch(
  () => props.schoolId,
  (id) => {
    void loadResponsibilities(id || '')
  },
  { immediate: true },
)

const handleSubmit = () => {
  if (canSubmit.value) {
    emit('submit')
  }
}
</script>
