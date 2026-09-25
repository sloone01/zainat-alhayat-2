<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('absenceExcuses.title')" :subtitle="$t('absenceExcuses.staffSubtitle')" />

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('absenceExcuses.listHeading') }}</h2>
            <p class="fk-card__meta">{{ $t('absenceExcuses.count', { count: items.length }) }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton :expanded="showFilters" :count="status !== 'all' ? 1 : 0" @click="showFilters = true" />
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading && !routePageLoading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
            <FikrLoader />
          </div>
          <div v-else-if="!items.length" class="fk-empty">
            <p class="fk-empty__title">{{ $t('absenceExcuses.empty') }}</p>
          </div>

          <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KanbanCard
              v-for="item in items"
              :key="item.id"
              :title="childName(item.student)"
              :description="item.explanation"
            >
              <template #tags>
                <KanbanTag :dot="statusDot(item.status)">{{ $t(`absenceExcuses.${item.status}`) }}</KanbanTag>
              </template>
              <template #actions>
                <RowActionsMenu :open="activeMenuId === item.id" placement="down" @toggle="toggleMenu(item.id)">
                  <RowActionsItem icon="view" @click="openView(item)">{{ $t('absenceExcuses.view') }}</RowActionsItem>
                </RowActionsMenu>
              </template>
              <template #meta>
                <KanbanMeta icon="calendar">{{ formatDate(item.absence_date) }}</KanbanMeta>
                <KanbanMeta v-if="item.submitted_by_name" icon="users">{{ item.submitted_by_name }}</KanbanMeta>
              </template>
            </KanbanCard>
          </div>

          <div v-else class="fk-table-wrap">
            <table class="fk-table">
              <thead>
                <tr>
                  <th>{{ $t('absenceExcuses.student') }}</th>
                  <th>{{ $t('absenceExcuses.date') }}</th>
                  <th>{{ $t('absenceExcuses.explanation') }}</th>
                  <th>{{ $t('absenceExcuses.status') }}</th>
                  <th class="!text-end">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="'row-' + item.id">
                  <td>
                    <div class="font-medium text-fikr-ink">{{ childName(item.student) }}</div>
                    <div v-if="item.submitted_by_name" class="mt-0.5 text-xs text-fikr-ink-soft">{{ item.submitted_by_name }}</div>
                  </td>
                  <td>{{ formatDate(item.absence_date) }}</td>
                  <td class="max-w-xs"><p class="line-clamp-2 text-fikr-ink">{{ item.explanation }}</p></td>
                  <td><KanbanTag :dot="statusDot(item.status)">{{ $t(`absenceExcuses.${item.status}`) }}</KanbanTag></td>
                  <td>
                    <div class="flex justify-end">
                      <RowActionsMenu :open="activeMenuId === 'row-' + item.id" placement="down" @toggle="toggleMenu('row-' + item.id)">
                        <RowActionsItem icon="view" @click="openView(item)">{{ $t('absenceExcuses.view') }}</RowActionsItem>
                      </RowActionsMenu>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FikrFilterDrawer :show="showFilters" :title="$t('common.filter')" @close="showFilters = false" @clear="clearFilters">
        <div class="fk-form__row">
          <label class="fk-flabel" for="excuse-status"><span>{{ $t('absenceExcuses.status') }}</span></label>
          <select id="excuse-status" v-model="status" class="fk-field" @change="load">
            <option value="all">{{ $t('absenceExcuses.all') }}</option>
            <option value="pending">{{ $t('absenceExcuses.pending') }}</option>
            <option value="approved">{{ $t('absenceExcuses.approved') }}</option>
            <option value="rejected">{{ $t('absenceExcuses.rejected') }}</option>
          </select>
        </div>
      </FikrFilterDrawer>

      <FikrDialog :show="!!viewing" :title="$t('absenceExcuses.view')" plain-footer @close="closeView">
        <div v-if="viewing" class="space-y-4 text-sm">
          <dl class="divide-y divide-fikr-hairline overflow-hidden rounded-xl border border-fikr-hairline bg-white">
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.student') }}</dt>
              <dd class="font-medium text-fikr-ink">{{ childName(viewing.student) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.date') }}</dt>
              <dd class="font-medium text-fikr-ink">{{ formatDate(viewing.absence_date) }}</dd>
            </div>
            <div v-if="viewing.submitted_by_name" class="flex items-center justify-between gap-4 px-4 py-3">
              <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.submittedBy') }}</dt>
              <dd class="font-medium text-fikr-ink">{{ viewing.submitted_by_name }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <dt class="text-fikr-ink-muted">{{ $t('absenceExcuses.status') }}</dt>
              <dd><KanbanTag :dot="statusDot(viewing.status)">{{ $t(`absenceExcuses.${viewing.status}`) }}</KanbanTag></dd>
            </div>
          </dl>

          <div>
            <p class="mb-1 text-xs font-medium text-fikr-ink-muted">{{ $t('absenceExcuses.explanation') }}</p>
            <p class="whitespace-pre-line text-fikr-ink">{{ viewing.explanation }}</p>
          </div>

          <p v-if="viewing.status === 'rejected' && viewing.rejection_reason" class="text-red-700">
            {{ viewing.rejection_reason }}
          </p>

          <button v-if="viewing.has_file" type="button" class="fk-btn fk-btn--pearl" @click="download(viewing)">
            {{ viewing.original_filename || $t('absenceExcuses.download') }}
          </button>

          <div v-if="rejectMode">
            <label class="fk-label" for="reject-reason">{{ $t('absenceExcuses.rejectionReason') }}</label>
            <textarea id="reject-reason" v-model="rejectReason" rows="3" class="fk-field" />
          </div>
        </div>

        <template #footer>
          <template v-if="canReviewViewing && rejectMode">
            <button type="button" class="fk-btn fk-btn--pearl" @click="rejectMode = false">{{ $t('common.cancel') }}</button>
            <button type="button" class="fk-btn fk-btn--danger" :disabled="saving" @click="confirmReject">
              {{ $t('absenceExcuses.reject') }}
            </button>
          </template>
          <template v-else-if="canReviewViewing">
            <button type="button" class="fk-btn fk-btn--danger" :disabled="saving" @click="startReject">
              {{ $t('absenceExcuses.reject') }}
            </button>
            <button type="button" class="fk-btn fk-btn--primary" :disabled="saving" @click="approve">
              {{ $t('absenceExcuses.approve') }}
            </button>
          </template>
          <button v-else type="button" class="fk-btn fk-btn--pearl" @click="closeView">{{ $t('common.close') }}</button>
        </template>
      </FikrDialog>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import FikrFilterDrawer from '@/components/FikrFilterDrawer.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useFeedback } from '@/composables/useFeedback'
import { useClaims } from '@/composables/useClaims'
import { routePageLoading } from '@/router/route-loading'
import {
  absenceExcuseService,
  type AbsenceExcuse,
  type AbsenceExcuseChild,
} from '@/services/absence-excuse.service'

const { locale, t } = useI18n()
const feedback = useFeedback()
const { hasClaim } = useClaims()
const { viewMode, isCards } = useListViewMode()
const isRTL = computed(() => locale.value === 'ar')
const canReview = computed(() => hasClaim('absence_excuses', 'approve'))

const loading = ref(true)
const saving = ref(false)
const status = ref('all')
const items = ref<AbsenceExcuse[]>([])
const showFilters = ref(false)
const activeMenuId = ref<string | null>(null)
const viewing = ref<AbsenceExcuse | null>(null)
const rejectMode = ref(false)
const rejectReason = ref('')

// Approve / reject live in the view dialog only, and only for pending excuses.
const canReviewViewing = computed(() => canReview.value && viewing.value?.status === 'pending')

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenus() {
  activeMenuId.value = null
}

function openView(item: AbsenceExcuse) {
  closeMenus()
  viewing.value = item
  rejectMode.value = false
  rejectReason.value = ''
}

function closeView() {
  viewing.value = null
  rejectMode.value = false
  rejectReason.value = ''
}

function startReject() {
  rejectMode.value = true
}

function clearFilters() {
  status.value = 'all'
  void load()
}

function childName(child: AbsenceExcuseChild | null) {
  if (!child) return '—'
  if (locale.value === 'ar') {
    const ar = `${child.first_name_ar || ''} ${child.last_name_ar || ''}`.trim()
    if (ar) return ar
  }
  return `${child.first_name_en || child.firstName || ''} ${child.last_name_en || child.lastName || ''}`.trim() || '—'
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar' : 'en')
}

function statusDot(value: string) {
  if (value === 'approved') return 'emerald'
  if (value === 'rejected') return 'red'
  return 'amber'
}

async function load() {
  try {
    loading.value = true
    items.value = await absenceExcuseService.list(status.value)
  } catch {
    items.value = []
    feedback.error(t('absenceExcuses.loadFailed'))
  } finally {
    loading.value = false
  }
}

async function approve() {
  const item = viewing.value
  if (!item) return
  try {
    saving.value = true
    await absenceExcuseService.approve(item.id)
    closeView()
    feedback.saved(t('absenceExcuses.approvedOk'))
    await load()
  } catch {
    feedback.error(t('absenceExcuses.reviewFailed'))
  } finally {
    saving.value = false
  }
}

async function confirmReject() {
  const item = viewing.value
  if (!item) return
  if (!rejectReason.value.trim()) {
    feedback.error(t('absenceExcuses.reasonRequired'))
    return
  }
  try {
    saving.value = true
    await absenceExcuseService.reject(item.id, rejectReason.value.trim())
    closeView()
    feedback.saved(t('absenceExcuses.rejectedOk'))
    await load()
  } catch {
    feedback.error(t('absenceExcuses.reviewFailed'))
  } finally {
    saving.value = false
  }
}

async function download(item: AbsenceExcuse) {
  try {
    const blob = await absenceExcuseService.download(item.id)
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
