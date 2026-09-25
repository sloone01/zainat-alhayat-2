<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('reports.exportsTitle')" />

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('reports.exportsTitle') }}</h2>
            <p class="fk-card__meta">{{ items.length }}</p>
          </div>
        </header>

        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
          <FikrLoader />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>

        <div v-else-if="!items.length" class="px-6 py-16 text-center text-sm text-fikr-ink-muted">
          {{ $t('reports.exportsEmpty') }}
        </div>

        <div v-else class="overflow-visible">
          <table class="fk-feetable min-w-full">
            <thead>
              <tr>
                <th>{{ $t('reports.exportReportName') }}</th>
                <th>{{ $t('reports.exportSourcePage') }}</th>
                <th class="!text-end">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in items" :key="row.key">
                <td class="font-medium">{{ reportName(row) }}</td>
                <td class="text-fikr-ink-muted">{{ row.source_path }}</td>
                <td>
                  <div class="flex justify-end">
                    <RowActionsMenu
                      :open="activeMenuId === row.key"
                      placement="up"
                      @toggle="toggleMenu(row.key)"
                    >
                      <RowActionsItem icon="edit" @click="onEdit(row.key)">
                        {{ $t('common.edit') }}
                      </RowActionsItem>
                    </RowActionsMenu>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useFeedback } from '@/composables/useFeedback'
import reportExportService, { type ReportExportListItem } from '@/services/report-export.service'

const { t, locale } = useI18n()
const router = useRouter()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const items = ref<ReportExportListItem[]>([])
const activeMenuId = ref<string | null>(null)

function reportName(row: ReportExportListItem) {
  return isRTL.value ? row.name_ar || row.name_en : row.name_en
}

function toggleMenu(key: string) {
  activeMenuId.value = activeMenuId.value === key ? null : key
}

function onEdit(key: string) {
  activeMenuId.value = null
  void router.push(`/reports/exports/${encodeURIComponent(key)}`)
}

function onDocClick(ev: Event) {
  const target = ev.target as Element
  if (activeMenuId.value && !target.closest('.relative')) activeMenuId.value = null
}

async function load() {
  loading.value = true
  try {
    items.value = await reportExportService.listExports()
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: string }).message || '')
        : ''
    feedback.error(message || t('reports.exportsLoadFailed'), t('common.error'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  void load()
})
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
