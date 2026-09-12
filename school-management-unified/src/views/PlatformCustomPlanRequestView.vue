<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="pageTitle">
        <template #leading>
          <router-link
            to="/platform/custom-plan-requests"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('platformCustomRequests.backToList')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <div v-if="loading" class="fk-card flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <template v-else-if="row">
        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ schoolTitle }}</h2>
              <p v-if="schoolSubtitle" class="fk-card__meta" dir="ltr" lang="en">{{ schoolSubtitle }}</p>
            </div>
            <span
              class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="statusClass(row.status)"
            >
              {{ $t(`platformCustomRequests.status_${row.status}`) }}
            </span>
          </header>

          <div class="space-y-5 p-6">
            <div class="flex flex-wrap items-center gap-2">
              <a
                v-if="telHref"
                class="fk-btn fk-btn--primary"
                :href="telHref"
              >{{ $t('platformCustomRequests.call') }}</a>
              <a
                v-if="row.email"
                class="fk-btn fk-btn--pearl"
                :href="`mailto:${row.email}`"
              >{{ $t('platformCustomRequests.emailAction') }}</a>
              <button
                v-if="canEdit && row.status === 'new'"
                type="button"
                class="fk-btn fk-btn--pearl"
                :disabled="saving"
                @click="setStatus('contacted')"
              >
                {{ $t('platformCustomRequests.markContacted') }}
              </button>
              <button
                v-if="canEdit && row.status !== 'closed'"
                type="button"
                class="fk-btn fk-btn--pearl"
                :disabled="saving"
                @click="setStatus('closed')"
              >
                {{ $t('platformCustomRequests.closeRequest') }}
              </button>
            </div>

            <dl class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('platformCustomRequests.colPhone') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800" dir="ltr">
                  <a v-if="telHref" class="text-primary-700 hover:underline" :href="telHref">{{ row.phone }}</a>
                  <span v-else>{{ row.phone || '—' }}</span>
                </dd>
              </div>
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('platformCustomRequests.colEmail') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800" dir="ltr">
                  <a v-if="row.email" class="text-primary-700 hover:underline" :href="`mailto:${row.email}`">{{ row.email }}</a>
                  <span v-else>—</span>
                </dd>
              </div>
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('platformCustomRequests.colScope') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800">{{ scopeLabel(row.scope) }}</dd>
              </div>
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('platformCustomRequests.colDate') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800">{{ formatDate(row.created_at) }}</dd>
              </div>
              <div class="rounded-lg bg-gray-50 px-3 py-2 sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('platformCustomRequests.colModules') }}</dt>
                <dd class="mt-1">
                  <span v-if="!row.module_labels?.length" class="text-sm text-gray-500">
                    {{ $t('platformCustomRequests.noModules') }}
                  </span>
                  <ul v-else class="flex flex-wrap gap-1">
                    <li
                      v-for="m in row.module_labels"
                      :key="m.code"
                      class="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-800"
                    >
                      {{ isRTL ? m.name_ar : m.name_en }}
                    </li>
                  </ul>
                </dd>
              </div>
              <div v-if="row.notes" class="rounded-lg bg-gray-50 px-3 py-2 sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('platformCustomRequests.colNotes') }}</dt>
                <dd class="mt-0.5 whitespace-pre-wrap text-sm text-gray-800">{{ row.notes }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { useClaims } from '@/composables/useClaims'
import {
  schoolSubscriptionService,
  type CustomPlanRequest,
  type CustomPlanRequestStatus,
} from '@/services/school-subscription.service'

const { locale, t } = useI18n()
const route = useRoute()
const { hasClaim } = useClaims()
const isRTL = computed(() => locale.value === 'ar')
const canEdit = computed(() => hasClaim('platform_schools', 'edit'))

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const row = ref<CustomPlanRequest | null>(null)

const schoolTitle = computed(
  () => row.value?.school_name_ar || row.value?.school_name || t('platformCustomRequests.viewTitle'),
)
const schoolSubtitle = computed(() => {
  const en = row.value?.school_name_en?.trim()
  if (!en) return ''
  if (en === schoolTitle.value) return ''
  return en
})
const pageTitle = computed(() => schoolTitle.value)

const telHref = computed(() => {
  const cleaned = (row.value?.phone || '').replace(/[^\d+]/g, '')
  return cleaned ? `tel:${cleaned}` : ''
})

function scopeLabel(scope: CustomPlanRequest['scope']) {
  if (scope === 'mid') return t('forSchools.gallery.scopeMid')
  if (scope === 'large') return t('forSchools.gallery.scopeLarge')
  return t('forSchools.gallery.scopeSmall')
}

function statusClass(status: CustomPlanRequestStatus) {
  if (status === 'new') return 'bg-amber-100 text-amber-800'
  if (status === 'contacted') return 'bg-sky-100 text-sky-800'
  return 'bg-gray-100 text-gray-700'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

async function load() {
  const id = String(route.params.id || '')
  loading.value = true
  error.value = ''
  row.value = null
  try {
    row.value = await schoolSubscriptionService.getCustomPlanRequest(id)
  } catch (e: unknown) {
    error.value = (e as { message?: string })?.message || t('platformCustomRequests.notFound')
  } finally {
    loading.value = false
  }
}

async function setStatus(status: CustomPlanRequestStatus) {
  if (!row.value || row.value.status === status) return
  saving.value = true
  error.value = ''
  try {
    row.value = await schoolSubscriptionService.updateCustomPlanRequest(row.value.id, { status })
  } catch (e: unknown) {
    error.value = (e as { message?: string })?.message || t('platformCustomRequests.saveError')
  } finally {
    saving.value = false
  }
}

watch(() => route.params.id, load)
onMounted(load)
</script>
