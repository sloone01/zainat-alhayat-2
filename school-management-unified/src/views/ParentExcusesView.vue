<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('absenceExcuses.parentNav')" :subtitle="$t('absenceExcuses.pageSubtitle')" />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="!children.length" class="fk-elev">
        <div class="fk-empty-panel">
          <p>{{ $t('parent.noChildren') }}</p>
        </div>
      </div>

      <section v-else class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('absenceExcuses.listHeading') }}</h2>
            <p class="fk-card__meta">{{ $t('absenceExcuses.count', { count: cases.length }) }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <template v-if="children.length > 1">
            <button
              v-for="child in children"
              :key="child.id"
              type="button"
              class="fk-fchip"
              :class="selectedId === child.id ? 'fk-fchip--active' : ''"
              :aria-pressed="selectedId === child.id"
              @click="selectedId = child.id"
            >
              {{ childName(child) }}
            </button>
            </template>
            <FikrFilterButton :expanded="showFilters" :count="statusFilter !== 'all' ? 1 : 0" @click="showFilters = true" />
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="!cases.length" class="fk-empty">
            <p class="fk-empty__title">{{ $t('absenceExcuses.noAbsences') }}</p>
          </div>

          <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KanbanCard
              v-for="c in cases"
              :key="c.key"
              :title="formatDate(c.date)"
              :description="childName(selectedChild)"
            >
              <template #tags>
                <KanbanTag :dot="c.excuse ? statusDot(c.excuse.status) : 'gray'">
                  {{ c.excuse ? $t(`absenceExcuses.${c.excuse.status}`) : $t('absenceExcuses.noExcuse') }}
                </KanbanTag>
              </template>
              <template #actions>
                <RowActionsMenu :open="activeMenuId === c.key" placement="down" @toggle="toggleMenu(c.key)">
                  <RowActionsItem icon="view" @click="openDetails(c)">{{ $t('absenceExcuses.details') }}</RowActionsItem>
                  <RowActionsItem v-if="c.excuse" icon="clone" @click="viewing = c.excuse">
                    {{ $t('absenceExcuses.view') }}
                  </RowActionsItem>
                  <RowActionsItem v-if="!c.excuse || c.excuse.status === 'rejected'" icon="edit" @click="openForm(c.date)">
                    {{ $t('absenceExcuses.submitExcuse') }}
                  </RowActionsItem>
                </RowActionsMenu>
              </template>
              <p v-if="c.excuse?.status === 'rejected' && c.excuse.rejection_reason" class="mt-2 text-sm text-red-700">
                {{ c.excuse.rejection_reason }}
              </p>
              <template #meta>
                <KanbanMeta v-if="c.absence?.recorded_by_name" icon="users">{{ c.absence.recorded_by_name }}</KanbanMeta>
                <KanbanMeta v-if="c.absence?.recorded_at" icon="calendar">{{ formatTime(c.absence.recorded_at) }}</KanbanMeta>
              </template>
            </KanbanCard>
          </div>

          <div v-else class="fk-table-wrap">
            <table class="fk-table">
              <thead>
                <tr>
                  <th>{{ $t('absenceExcuses.date') }}</th>
                  <th>{{ $t('absenceExcuses.status') }}</th>
                  <th>{{ $t('absenceExcuses.recordedBy') }}</th>
                  <th>{{ $t('absenceExcuses.recordedAt') }}</th>
                  <th class="!text-end">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in cases" :key="'row-' + c.key">
                  <td class="font-medium">{{ formatDate(c.date) }}</td>
                  <td>
                    <KanbanTag :dot="c.excuse ? statusDot(c.excuse.status) : 'gray'">
                      {{ c.excuse ? $t(`absenceExcuses.${c.excuse.status}`) : $t('absenceExcuses.noExcuse') }}
                    </KanbanTag>
                  </td>
                  <td>{{ c.absence?.recorded_by_name || '—' }}</td>
                  <td class="whitespace-nowrap tabular-nums">{{ c.absence?.recorded_at ? formatTime(c.absence.recorded_at) : '—' }}</td>
                  <td>
                    <div class="flex justify-end">
                      <RowActionsMenu :open="activeMenuId === 'row-' + c.key" placement="down" @toggle="toggleMenu('row-' + c.key)">
                        <RowActionsItem icon="view" @click="openDetails(c)">{{ $t('absenceExcuses.details') }}</RowActionsItem>
                        <RowActionsItem v-if="c.excuse" icon="clone" @click="viewing = c.excuse">
                          {{ $t('absenceExcuses.view') }}
                        </RowActionsItem>
                        <RowActionsItem v-if="!c.excuse || c.excuse.status === 'rejected'" icon="edit" @click="openForm(c.date)">
                          {{ $t('absenceExcuses.submitExcuse') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FikrFilterDrawer :show="showFilters" :title="$t('common.filter')" @close="showFilters = false" @clear="statusFilter = 'all'">
        <div class="fk-form__row">
          <label class="fk-flabel" for="excuse-status"><span>{{ $t('absenceExcuses.status') }}</span></label>
          <select id="excuse-status" v-model="statusFilter" class="fk-field">
            <option value="all">{{ $t('absenceExcuses.all') }}</option>
            <option value="none">{{ $t('absenceExcuses.noExcuse') }}</option>
            <option value="pending">{{ $t('absenceExcuses.pending') }}</option>
            <option value="approved">{{ $t('absenceExcuses.approved') }}</option>
            <option value="rejected">{{ $t('absenceExcuses.rejected') }}</option>
          </select>
        </div>
      </FikrFilterDrawer>

      <FikrDialog
        :show="!!details"
        :title="$t('absenceExcuses.details')"
        plain-footer
        @close="details = null"
      >
        <dl v-if="details" class="divide-y divide-fikr-hairline overflow-hidden rounded-xl border border-fikr-hairline bg-white text-sm">
          <div class="flex items-center justify-between gap-4 px-4 py-3">
            <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.date') }}</dt>
            <dd class="font-medium text-fikr-ink">{{ formatDate(details.date) }}</dd>
          </div>
          <div v-if="details.absence?.group_name" class="flex items-center justify-between gap-4 px-4 py-3">
            <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.group') }}</dt>
            <dd class="font-medium text-fikr-ink">{{ details.absence.group_name }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 px-4 py-3">
            <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.recordedBy') }}</dt>
            <dd class="font-medium text-fikr-ink">{{ details.absence?.recorded_by_name || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 px-4 py-3">
            <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.recordedAt') }}</dt>
            <dd class="font-medium tabular-nums text-fikr-ink">
              {{ details.absence?.recorded_at ? formatTime(details.absence.recorded_at) : '—' }}
            </dd>
          </div>
          <div v-if="details.absence?.notes" class="flex items-start justify-between gap-4 px-4 py-3">
            <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.notes') }}</dt>
            <dd class="text-end text-fikr-ink">{{ details.absence.notes }}</dd>
          </div>
        </dl>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="details = null">{{ $t('common.close') }}</button>
        </template>
      </FikrDialog>

      <FikrDialog
        :show="!!viewing"
        :title="$t('absenceExcuses.view')"
        plain-footer
        @close="viewing = null"
      >
        <div v-if="viewing" class="space-y-3 text-sm">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-semibold text-fikr-ink">{{ formatDate(viewing.absence_date) }}</p>
            <KanbanTag :dot="statusDot(viewing.status)">{{ $t(`absenceExcuses.${viewing.status}`) }}</KanbanTag>
          </div>
          <p class="text-fikr-ink">{{ viewing.explanation }}</p>
          <p v-if="viewing.status === 'rejected' && viewing.rejection_reason" class="text-red-700">
            {{ viewing.rejection_reason }}
          </p>
          <button v-if="viewing.has_file" type="button" class="fk-btn fk-btn--pearl" @click="download(viewing)">
            {{ viewing.original_filename || $t('absenceExcuses.download') }}
          </button>
        </div>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="viewing = null">{{ $t('common.close') }}</button>
        </template>
      </FikrDialog>

      <FikrDialog
        :show="showForm"
        :title="$t('absenceExcuses.submitExcuse')"
        plain-footer
        @close="closeForm"
      >
        <form id="excuse-form" class="space-y-4" @submit.prevent="submit">
          <div>
            <label class="fk-label" for="excuse-date">{{ $t('absenceExcuses.date') }}</label>
            <input id="excuse-date" v-model="form.date" type="date" class="fk-field cursor-not-allowed bg-fikr-mist" disabled required>
          </div>
          <div>
            <label class="fk-label" for="excuse-file">{{ $t('absenceExcuses.file') }}</label>
            <input id="excuse-file" type="file" class="fk-field" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.heic,.doc,.docx" @change="onFile">
          </div>
          <div>
            <label class="fk-label" for="excuse-text">{{ $t('absenceExcuses.explanation') }}</label>
            <textarea id="excuse-text" v-model="form.explanation" rows="4" class="fk-field" required />
          </div>
        </form>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="closeForm">{{ $t('common.cancel') }}</button>
          <button type="submit" form="excuse-form" class="fk-btn fk-btn--primary" :disabled="saving">
            {{ $t('absenceExcuses.submit') }}
          </button>
        </template>
      </FikrDialog>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import FikrFilterDrawer from '@/components/FikrFilterDrawer.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useFeedback } from '@/composables/useFeedback'
import {
  absenceExcuseService,
  type AbsenceExcuse,
  type AbsenceExcuseChild,
  type AbsenceRecord,
} from '@/services/absence-excuse.service'

const { locale, t } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const showFilters = ref(false)
const statusFilter = ref('all')
const { viewMode, isCards } = useListViewMode()
const children = ref<AbsenceExcuseChild[]>([])
const items = ref<AbsenceExcuse[]>([])
const absences = ref<AbsenceRecord[]>([])
const viewing = ref<AbsenceExcuse | null>(null)
const details = ref<{ date: string; absence: AbsenceRecord | null } | null>(null)
const activeMenuId = ref<string | null>(null)
const selectedId = ref('')
const file = ref<File | null>(null)
const form = reactive({ date: '', explanation: '' })

const selectedChild = computed(
  () => children.value.find((child) => child.id === selectedId.value) || children.value[0],
)

// One card per absent day of the selected child, joined with any excuse already sent for that day.
const cases = computed(() => {
  const dates = new Set<string>()
  const absenceFor = new Map<string, AbsenceRecord>()
  for (const a of absences.value) {
    if (a.student_id !== selectedId.value) continue
    const day = a.absence_date.slice(0, 10)
    dates.add(day)
    if (!absenceFor.has(day)) absenceFor.set(day, a)
  }
  const excuseFor = new Map<string, AbsenceExcuse>()
  for (const item of items.value) {
    if (item.student_id !== selectedId.value) continue
    const day = item.absence_date.slice(0, 10)
    dates.add(day)
    const current = excuseFor.get(day)
    if (!current || item.created_at > current.created_at) excuseFor.set(day, item)
  }
  return [...dates]
    .sort((x, y) => (x < y ? 1 : -1))
    .map((date) => ({ key: date, date, excuse: excuseFor.get(date) || null, absence: absenceFor.get(date) || null }))
    .filter((c) => {
      if (statusFilter.value === 'all') return true
      if (statusFilter.value === 'none') return !c.excuse
      return c.excuse?.status === statusFilter.value
    })
})

function childName(child: AbsenceExcuseChild) {
  if (locale.value === 'ar') {
    const ar = `${child.first_name_ar || ''} ${child.last_name_ar || ''}`.trim()
    if (ar) return ar
  }
  const en = `${child.first_name_en || child.firstName || ''} ${child.last_name_en || child.lastName || ''}`.trim()
  return en || `${child.firstName || ''} ${child.lastName || ''}`.trim()
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar' : 'en')
}

function statusDot(status: string) {
  if (status === 'approved') return 'emerald'
  if (status === 'rejected') return 'red'
  return 'amber'
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenus() {
  activeMenuId.value = null
}

function openDetails(c: { date: string; absence: AbsenceRecord | null }) {
  closeMenus()
  details.value = { date: c.date, absence: c.absence }
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale.value === 'ar' ? 'ar' : 'en', {
    hour: 'numeric',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  })
}

function openForm(date = '') {
  closeMenus()
  form.date = date
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] || null
}

async function load() {
  try {
    loading.value = true
    const data = await absenceExcuseService.parentList()
    children.value = data.children || []
    items.value = data.items || []
    absences.value = data.absences || []
    if (!selectedId.value && children.value[0]) selectedId.value = children.value[0].id
  } catch {
    feedback.error(t('absenceExcuses.loadFailed'))
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!selectedId.value) return
  if (!form.date) {
    feedback.error(t('absenceExcuses.dateRequired'))
    return
  }
  if (!file.value) {
    feedback.error(t('absenceExcuses.fileRequired'))
    return
  }
  if (!form.explanation.trim()) {
    feedback.error(t('absenceExcuses.explanationRequired'))
    return
  }
  try {
    saving.value = true
    await absenceExcuseService.parentCreate({
      student_id: selectedId.value,
      absence_date: form.date,
      explanation: form.explanation.trim(),
      file: file.value,
    })
    form.date = ''
    form.explanation = ''
    file.value = null
    const input = document.getElementById('excuse-file') as HTMLInputElement | null
    if (input) input.value = ''
    closeForm()
    feedback.saved(t('absenceExcuses.submitted'))
    await load()
  } catch {
    feedback.error(t('absenceExcuses.submitFailed'))
  } finally {
    saving.value = false
  }
}

async function download(item: AbsenceExcuse) {
  try {
    const blob = await absenceExcuseService.download(item.id, true)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = item.original_filename || 'excuse'
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    feedback.error(t('absenceExcuses.loadFailed'))
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
  void load()
})

onBeforeUnmount(() => document.removeEventListener('click', closeMenus))
</script>
