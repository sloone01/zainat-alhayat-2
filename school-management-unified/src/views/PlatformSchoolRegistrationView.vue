<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('platformSchools.detailsTitle')"
        :subtitle="school?.name || $t('platformSchools.detailsSubtitle')"
      >
        <template #leading>
          <router-link
            to="/platform/schools"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('platformSchools.backToList')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="flashOk" class="fk-alert fk-alert--ok mb-4">{{ flashOk }}</div>
      <div v-if="flashError" class="fk-alert fk-alert--error mb-4">{{ flashError }}</div>

      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <div
        v-else-if="!school"
        class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
      >
        <h3 class="text-base font-semibold text-gray-900">{{ $t('platformSchools.notFound') }}</h3>
        <p class="mt-2 max-w-sm text-sm text-gray-500">{{ $t('platformSchools.openFromListHint') }}</p>
        <router-link to="/platform/schools" class="fk-btn fk-btn--primary fk-btn--sm mt-5">
          {{ $t('platformSchools.backToList') }}
        </router-link>
      </div>

      <template v-else>
        <!-- Pending decision only — status lives in summary; edit lives on school card -->
        <section
          v-if="school.status === 'pending' && canManage"
          class="fk-card mb-3 overflow-hidden rounded-lg"
        >
          <div class="flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-amber-950">{{ $t('platformSchools.decisionHeading') }}</p>
              <p class="mt-0.5 text-xs text-amber-900/80">{{ $t('platformSchools.decisionHint') }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                :disabled="decisionBusy"
                @click="openRejectDialog"
              >
                {{ $t('platformSchools.reject') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--primary fk-btn--sm"
                :disabled="decisionBusy"
                @click="openApproveDialog"
              >
                {{ $t('platformSchools.approve') }}
              </button>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-start">
          <div class="space-y-3 lg:col-span-8">
            <section class="fk-card rounded-lg">
              <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
                <h2 class="fk-card__title">{{ $t('platformSchools.sectionSchool') }}</h2>
                <div class="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    v-if="!editing"
                    type="button"
                    class="fk-btn fk-btn--pearl fk-btn--sm"
                    :disabled="!canManage"
                    @click="startEditing"
                  >
                    {{ $t('platformSchools.edit') }}
                  </button>
                  <template v-else>
                    <button
                      type="button"
                      class="fk-btn fk-btn--primary fk-btn--sm"
                      :disabled="saving"
                      @click="saveDetails"
                    >
                      {{ saving ? $t('platformSchools.saving') : $t('platformSchools.save') }}
                    </button>
                    <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="editing = false">
                      {{ $t('platformSchools.cancelEdit') }}
                    </button>
                  </template>
                </div>
              </header>
              <div class="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2 sm:p-6">
                <div
                  v-for="field in schoolFields"
                  :key="field.key"
                  :class="field.span2 ? 'sm:col-span-2' : ''"
                >
                  <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t(field.label) }}</label>
                  <textarea
                    v-if="editing && field.multiline"
                    v-model="editForm[field.key]"
                    rows="3"
                    class="fk-field"
                    :dir="field.dir"
                  />
                  <input
                    v-else-if="editing"
                    v-model="editForm[field.key]"
                    type="text"
                    class="fk-field"
                    :dir="field.dir"
                  >
                  <p
                    v-else
                    class="min-h-[1.25rem] text-sm text-gray-800"
                    :class="!fieldValue(field.key) ? 'text-gray-400' : ''"
                  >
                    {{ fieldValue(field.key) || $t('platformSchools.notProvided') }}
                  </p>
                </div>
              </div>
            </section>

            <section class="fk-card rounded-lg">
              <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
                <h2 class="fk-card__title">{{ $t('platformSchools.sectionAccount') }}</h2>
              </header>
              <div v-if="school.owner" class="p-5 sm:p-6">
                <div class="flex items-center gap-3 border-b border-fikr-hairline pb-4">
                  <span class="fk-monogram fk-monogram--navy flex h-11 w-11 shrink-0 items-center justify-center text-sm">
                    {{ (school.owner.firstName || school.owner.email || '?').charAt(0) }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-gray-900">
                      {{ school.owner.firstName }} {{ school.owner.lastName }}
                    </p>
                    <span
                      class="mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1"
                      :class="
                        school.owner.isActive
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                          : 'bg-gray-100 text-gray-600 ring-gray-200'
                      "
                    >
                      {{
                        school.owner.isActive
                          ? $t('platformSchools.ownerAccountActive')
                          : $t('platformSchools.ownerAccountInactive')
                      }}
                    </span>
                  </div>
                </div>
                <dl class="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('platformSchools.fieldOwnerFirstName') }}</dt>
                    <dd class="text-sm text-gray-800">{{ school.owner.firstName || '—' }}</dd>
                  </div>
                  <div>
                    <dt class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('platformSchools.fieldOwnerLastName') }}</dt>
                    <dd class="text-sm text-gray-800">{{ school.owner.lastName || '—' }}</dd>
                  </div>
                  <div>
                    <dt class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('platformSchools.fieldOwnerEmail') }}</dt>
                    <dd class="truncate text-sm text-gray-800" dir="ltr">{{ school.owner.email }}</dd>
                  </div>
                  <div>
                    <dt class="mb-1.5 text-xs font-medium text-gray-600">{{ $t('platformSchools.fieldOwnerPhone') }}</dt>
                    <dd class="text-sm text-gray-800" dir="ltr">{{ school.owner.phone || $t('platformSchools.notProvided') }}</dd>
                  </div>
                </dl>
              </div>
              <p v-else class="p-5 text-sm text-gray-400 sm:p-6">{{ $t('platformSchools.noOwner') }}</p>
            </section>
          </div>

          <aside class="space-y-3 lg:col-span-4 lg:sticky lg:top-20">
            <section class="fk-card rounded-lg">
              <header class="flex flex-wrap items-center justify-between gap-2 border-b border-fikr-hairline px-5 py-4 sm:px-6">
                <h2 class="fk-card__title">{{ $t('platformSchools.sectionSummary') }}</h2>
                <span class="fk-chip" :class="statusChipClass(school.status)">
                  {{ statusLabel(school.status) }}
                </span>
              </header>
              <dl class="grid grid-cols-1 gap-3 p-5 text-sm sm:p-6">
                <div class="flex items-baseline justify-between gap-3 border-b border-fikr-hairline/70 pb-2">
                  <dt class="text-xs text-gray-500">{{ $t('platformBilling.colPlan') }}</dt>
                  <dd class="font-semibold text-gray-900">{{ school.planCode || '—' }}</dd>
                </div>
                <div class="flex items-baseline justify-between gap-3 border-b border-fikr-hairline/70 pb-2">
                  <dt class="text-xs text-gray-500">{{ $t('platformBilling.colSubStatus') }}</dt>
                  <dd class="font-semibold text-gray-900">{{ school.subscriptionStatus || '—' }}</dd>
                </div>
                <div class="flex items-baseline justify-between gap-3 border-b border-fikr-hairline/70 pb-2">
                  <dt class="text-xs text-gray-500">{{ $t('platformSchools.colStudents') }}</dt>
                  <dd class="font-semibold tabular-nums text-gray-900">{{ school.studentCount }}</dd>
                </div>
                <div class="flex items-baseline justify-between gap-3 border-b border-fikr-hairline/70 pb-2">
                  <dt class="text-xs text-gray-500">{{ $t('platformSchools.registeredOn') }}</dt>
                  <dd class="text-gray-800">{{ formatDate(school.created_at) }}</dd>
                </div>
                <div class="flex items-baseline justify-between gap-3">
                  <dt class="text-xs text-gray-500">{{ $t('platformSchools.lastUpdated') }}</dt>
                  <dd class="text-gray-800">{{ formatDate(school.updated_at) }}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h2 class="mb-2 text-sm font-semibold text-gray-900">{{ $t('platformSchools.sectionDocs') }}</h2>
              <div class="grid grid-cols-1 gap-3">
                <div
                  v-for="doc in documentFields"
                  :key="doc.key"
                  class="flex items-center gap-3 rounded-lg border border-fikr-hairline bg-white px-4 py-3.5 shadow-sm"
                >
                  <span
                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700"
                    aria-hidden="true"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-gray-900">{{ $t(doc.label) }}</p>
                    <p class="mt-0.5 text-xs text-gray-500">
                      {{ school[doc.key] ? $t('platformSchools.docReady') : $t('platformSchools.noDocument') }}
                    </p>
                  </div>
                  <button
                    v-if="school[doc.key]"
                    type="button"
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200/80 bg-primary-50 text-primary-700 hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:opacity-50"
                    :aria-label="$t('platformSchools.openDocument')"
                    :disabled="openingDoc === doc.key"
                    @click="openDocument(doc.key, school[doc.key] as string)"
                  >
                    <svg
                      v-if="openingDoc !== doc.key"
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span
                      v-else
                      class="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
                      aria-hidden="true"
                    />
                  </button>
                  <span
                    v-else
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-300"
                    aria-hidden="true"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </template>
    </div>

    <FikrDialog
      :show="approveDialogOpen"
      :title="$t('platformSchools.approveDialogTitle')"
      :subtitle="$t('platformSchools.approveConfirm', { name: school?.name || '' })"
      plain-footer
      @close="approveDialogOpen = false"
    >
      <p class="text-sm text-fikr-ink-soft">{{ $t('platformSchools.approveDialogBody') }}</p>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" :disabled="decisionBusy" @click="approveDialogOpen = false">
          {{ $t('common.cancel') }}
        </button>
        <button type="button" class="fk-btn fk-btn--primary" :disabled="decisionBusy" @click="confirmApprove">
          {{ decisionBusy ? $t('platformSchools.approving') : $t('platformSchools.confirmApprove') }}
        </button>
      </template>
    </FikrDialog>

    <FikrDialog
      :show="rejectDialogOpen"
      :title="$t('platformSchools.rejectDialogTitle')"
      :subtitle="$t('platformSchools.rejectConfirm', { name: school?.name || '' })"
      plain-footer
      @close="rejectDialogOpen = false"
    >
      <label class="mb-1.5 block text-xs font-medium text-gray-600" for="reject-notes">
        {{ $t('platformSchools.rejectNotes') }}
      </label>
      <textarea
        id="reject-notes"
        v-model="rejectNotes"
        rows="3"
        class="fk-field"
        :placeholder="$t('platformSchools.rejectNotesPlaceholder')"
      />
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" :disabled="decisionBusy" @click="rejectDialogOpen = false">
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          class="fk-btn fk-btn--sm rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          :disabled="decisionBusy"
          @click="confirmReject"
        >
          {{ decisionBusy ? $t('platformSchools.rejecting') : $t('platformSchools.confirmReject') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import { useClaims } from '@/composables/useClaims'
import { resolveSelectedPlatformSchoolId } from '@/composables/usePlatformSchoolSelection'
import {
  platformSchoolService,
  type RegisteredSchool,
} from '@/services/platform-school.service'

const { locale, t, te } = useI18n()
const { hasClaim } = useClaims()

const isRTL = computed(() => locale.value === 'ar')
const canManage = computed(() => hasClaim('platform_schools', 'manage'))

const loading = ref(true)
const saving = ref(false)
const decisionBusy = ref(false)
const school = ref<RegisteredSchool | null>(null)
const flashError = ref('')
const flashOk = ref('')
const editing = ref(false)
const openingDoc = ref<string | null>(null)
const approveDialogOpen = ref(false)
const rejectDialogOpen = ref(false)
const rejectNotes = ref('')

type EditableField =
  | 'name'
  | 'name_ar'
  | 'name_en'
  | 'email'
  | 'phone'
  | 'address'
  | 'website'
  | 'description'
  | 'owner_legal_name'

const schoolFields: { key: EditableField; label: string; multiline?: boolean; span2?: boolean; dir?: 'rtl' | 'ltr' }[] = [
  { key: 'name_ar', label: 'platformSchools.fieldNameAr', dir: 'rtl' },
  { key: 'name_en', label: 'platformSchools.fieldNameEn', dir: 'ltr' },
  { key: 'owner_legal_name', label: 'platformSchools.fieldOwnerLegalName' },
  { key: 'email', label: 'platformSchools.fieldEmail' },
  { key: 'phone', label: 'platformSchools.fieldPhone' },
  { key: 'website', label: 'platformSchools.fieldWebsite' },
  { key: 'address', label: 'platformSchools.fieldAddress', multiline: true, span2: true },
  { key: 'description', label: 'platformSchools.fieldDescription', multiline: true, span2: true },
]

const documentFields = [
  { key: 'cr_document_url' as const, label: 'platformSchools.crDocument' },
  { key: 'owner_id_document_url' as const, label: 'platformSchools.ownerIdDocument' },
]

const editForm = reactive<Record<EditableField, string>>({
  name: '',
  name_ar: '',
  name_en: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  description: '',
  owner_legal_name: '',
})

function fieldValue(key: EditableField): string {
  const row = school.value as unknown as Record<string, unknown> | null
  const raw = row?.[key]
  return typeof raw === 'string' ? raw : ''
}

function statusLabel(status: string) {
  const key = `platformSchools.status.${status || 'active'}`
  return te(key) ? t(key) : status
}

function statusChipClass(status: string) {
  switch (status) {
    case 'active':
      return 'fk-chip--green'
    case 'pending':
    case 'pending_payment':
      return 'fk-chip--amber'
    case 'suspended':
      return 'fk-chip--navy'
    case 'rejected':
      return 'fk-chip--red'
    default:
      return 'fk-chip--neutral'
  }
}

function formatDate(value: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-GB')
  } catch {
    return value
  }
}

async function openDocument(key: string, path: string) {
  flashError.value = ''
  if (/^https?:\/\//i.test(path)) {
    window.open(path, '_blank', 'noopener')
    return
  }
  openingDoc.value = key
  try {
    const url = await platformSchoolService.fetchDocument(path)
    const opened = window.open(url, '_blank', 'noopener')
    if (!opened) flashError.value = t('platformSchools.popupBlocked')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch {
    flashError.value = t('platformSchools.documentOpenFailed')
  } finally {
    openingDoc.value = null
  }
}

function startEditing() {
  flashError.value = ''
  flashOk.value = ''
  for (const field of schoolFields) editForm[field.key] = fieldValue(field.key)
  editForm.name = fieldValue('name') || editForm.name_ar || editForm.name_en
  if (!editForm.name_ar && editForm.name) editForm.name_ar = editForm.name
  editing.value = true
}

async function saveDetails() {
  if (!school.value) return
  if (!editForm.name_ar.trim() && !editForm.name_en.trim()) {
    flashError.value = t('platformSchools.nameRequired')
    return
  }
  saving.value = true
  flashError.value = ''
  try {
    const displayName =
      editForm.name_ar.trim() || editForm.name_en.trim() || editForm.name.trim()
    const updated = await platformSchoolService.update(school.value.id, {
      name: displayName,
      name_ar: editForm.name_ar.trim() || null,
      name_en: editForm.name_en.trim() || null,
      email: editForm.email.trim() || null,
      phone: editForm.phone.trim() || null,
      address: editForm.address.trim() || null,
      website: editForm.website.trim() || null,
      description: editForm.description.trim() || null,
      owner_legal_name: editForm.owner_legal_name.trim() || null,
    })
    school.value = updated
    editing.value = false
    flashOk.value = t('platformSchools.saved')
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('platformSchools.saveError')
  } finally {
    saving.value = false
  }
}

function openApproveDialog() {
  flashError.value = ''
  approveDialogOpen.value = true
}

function openRejectDialog() {
  flashError.value = ''
  rejectNotes.value = ''
  rejectDialogOpen.value = true
}

async function confirmApprove() {
  if (!school.value) return
  decisionBusy.value = true
  flashError.value = ''
  try {
    const res = await platformSchoolService.approve(school.value.id)
    school.value = res.school
    approveDialogOpen.value = false
    flashOk.value = res.email_sent === false
      ? t('platformSchools.approveSuccessNoEmail')
      : t('platformSchools.approveSuccess')
  } catch (e: unknown) {
    approveDialogOpen.value = false
    const err = e as { message?: string; code?: string; response?: unknown }
    // Timeout/network: interceptor opens /error — do not leave a stuck confirm dialog.
    if (!err?.response || err.code === 'ECONNABORTED') return
    flashError.value = err?.message || t('platformSchools.approveError')
  } finally {
    decisionBusy.value = false
  }
}

async function confirmReject() {
  if (!school.value) return
  decisionBusy.value = true
  flashError.value = ''
  try {
    school.value = await platformSchoolService.reject(school.value.id, rejectNotes.value.trim())
    rejectDialogOpen.value = false
    flashOk.value = t('platformSchools.rejectSuccess')
  } catch (e: unknown) {
    rejectDialogOpen.value = false
    const err = e as { message?: string; code?: string; response?: unknown }
    if (!err?.response || err.code === 'ECONNABORTED') return
    flashError.value = err?.message || t('platformSchools.rejectError')
  } finally {
    decisionBusy.value = false
  }
}

async function load() {
  const id = resolveSelectedPlatformSchoolId(window.history.state)
  if (!id) {
    school.value = null
    loading.value = false
    return
  }
  loading.value = true
  flashError.value = ''
  try {
    school.value = await platformSchoolService.getOne(id)
  } catch (e: unknown) {
    school.value = null
    flashError.value = (e as Error)?.message || t('platformSchools.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
/* Page-only: tighter corners than default fk-card radius */
.fk-card {
  border-radius: 0.5rem;
}
</style>
