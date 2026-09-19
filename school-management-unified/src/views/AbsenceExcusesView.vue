<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('absenceExcuses.title')" />

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('absenceExcuses.listHeading') }}</h2>
            <p class="fk-card__meta">{{ $t('absenceExcuses.count', { count: items.length }) }}</p>
          </div>
          <select v-model="status" class="fk-field w-auto min-w-[9rem]" :aria-label="$t('absenceExcuses.status')" @change="load">
            <option value="pending">{{ $t('absenceExcuses.pending') }}</option>
            <option value="approved">{{ $t('absenceExcuses.approved') }}</option>
            <option value="rejected">{{ $t('absenceExcuses.rejected') }}</option>
            <option value="all">{{ $t('absenceExcuses.all') }}</option>
          </select>
        </header>

        <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
          <FikrLoader />
        </div>
        <div v-else-if="!items.length" class="fk-empty">
          <p class="fk-empty__title">{{ $t('absenceExcuses.empty') }}</p>
        </div>
        <div v-else class="overflow-visible">
          <table class="fk-feetable min-w-full">
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
              <tr v-for="item in items" :key="item.id">
                <td>
                  <div class="font-medium text-fikr-ink">{{ childName(item.student) }}</div>
                  <div v-if="item.submitted_by_name" class="mt-0.5 text-xs text-fikr-ink-soft">{{ item.submitted_by_name }}</div>
                </td>
                <td>{{ formatDate(item.absence_date) }}</td>
                <td class="max-w-xs">
                  <p class="line-clamp-2 text-fikr-ink">{{ item.explanation }}</p>
                  <p v-if="item.status === 'rejected' && item.rejection_reason" class="mt-1 text-xs text-red-700">
                    {{ item.rejection_reason }}
                  </p>
                </td>
                <td>
                  <span class="fk-pill" :class="statusClass(item.status)">{{ $t(`absenceExcuses.${item.status}`) }}</span>
                </td>
                <td>
                  <div class="flex justify-end">
                    <RowActionsMenu :open="activeMenuId === item.id" placement="up" @toggle="toggleMenu(item.id)">
                      <RowActionsItem v-if="item.has_file" icon="view" @click="download(item)">
                        {{ $t('absenceExcuses.download') }}
                      </RowActionsItem>
                      <RowActionsItem
                        v-if="canReview && item.status === 'pending'"
                        icon="activate"
                        @click="approve(item)"
                      >
                        {{ $t('absenceExcuses.approve') }}
                      </RowActionsItem>
                      <RowActionsItem
                        v-if="canReview && item.status === 'pending'"
                        icon="archive"
                        danger
                        @click="openReject(item)"
                      >
                        {{ $t('absenceExcuses.reject') }}
                      </RowActionsItem>
                    </RowActionsMenu>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div
        v-if="rejecting"
        class="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4"
        @click.self="rejecting = null"
      >
        <form class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" @submit.prevent="confirmReject">
          <h3 class="text-base font-semibold text-fikr-ink">{{ $t('absenceExcuses.rejectTitle') }}</h3>
          <label class="fk-label mt-4" for="reject-reason">{{ $t('absenceExcuses.rejectionReason') }}</label>
          <textarea id="reject-reason" v-model="rejectReason" rows="4" class="fk-field" required />
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" @click="rejecting = null">{{ $t('common.cancel') }}</button>
            <button type="submit" class="fk-btn fk-btn--danger" :disabled="saving">{{ $t('absenceExcuses.reject') }}</button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useFeedback } from '@/composables/useFeedback'
import { useClaims } from '@/composables/useClaims'
import {
  absenceExcuseService,
  type AbsenceExcuse,
  type AbsenceExcuseChild,
} from '@/services/absence-excuse.service'

const { locale, t } = useI18n()
const feedback = useFeedback()
const { hasClaim } = useClaims()
const isRTL = computed(() => locale.value === 'ar')
const canReview = computed(() => hasClaim('absence_excuses', 'approve'))

const loading = ref(true)
const saving = ref(false)
const status = ref('pending')
const items = ref<AbsenceExcuse[]>([])
const activeMenuId = ref<string | null>(null)
const rejecting = ref<AbsenceExcuse | null>(null)
const rejectReason = ref('')

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
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

function statusClass(value: string) {
  if (value === 'approved') return 'fk-pill--teal'
  if (value === 'rejected') return 'fk-pill--navy'
  return 'fk-pill--mist'
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

async function approve(item: AbsenceExcuse) {
  activeMenuId.value = null
  try {
    saving.value = true
    await absenceExcuseService.approve(item.id)
    feedback.success(t('absenceExcuses.approvedOk'))
    await load()
  } catch {
    feedback.error(t('absenceExcuses.reviewFailed'))
  } finally {
    saving.value = false
  }
}

function openReject(item: AbsenceExcuse) {
  activeMenuId.value = null
  rejecting.value = item
  rejectReason.value = ''
}

async function confirmReject() {
  if (!rejecting.value) return
  if (!rejectReason.value.trim()) {
    feedback.error(t('absenceExcuses.reasonRequired'))
    return
  }
  try {
    saving.value = true
    await absenceExcuseService.reject(rejecting.value.id, rejectReason.value.trim())
    rejecting.value = null
    feedback.success(t('absenceExcuses.rejectedOk'))
    await load()
  } catch {
    feedback.error(t('absenceExcuses.reviewFailed'))
  } finally {
    saving.value = false
  }
}

async function download(item: AbsenceExcuse) {
  activeMenuId.value = null
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

onMounted(load)
</script>
