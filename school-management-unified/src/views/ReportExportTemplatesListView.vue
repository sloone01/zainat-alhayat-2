<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('reports.exportTemplatesTitle')">
        <template #leading>
          <router-link
            to="/reports/exports"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('reports.backToExports')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('reports.exportTemplatesTitle') }}</h2>
            <p class="fk-card__meta">{{ items.length }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <router-link
              to="/reports/export-templates/new"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('reports.exportTemplateAdd')"
            >
              <IconPlus />
            </router-link>
          </div>
        </header>

        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
          <FikrLoader />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>

        <div v-else-if="!items.length" class="px-6 py-16 text-center text-sm text-fikr-ink-muted">
          {{ $t('reports.exportTemplatesEmpty') }}
        </div>

        <div v-else class="overflow-visible">
          <table class="fk-feetable min-w-full">
            <thead>
              <tr>
                <th>{{ $t('reports.exportTemplateName') }}</th>
                <th>{{ $t('reports.exportTemplateDefault') }}</th>
                <th class="!text-end">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in items" :key="row.id">
                <td class="font-medium">{{ templateLabel(row) }}</td>
                <td>
                  <span v-if="row.is_default" class="fk-pill fk-pill--teal">{{ $t('notificationLayouts.badgeDefault') }}</span>
                  <span v-else class="text-fikr-ink-muted">—</span>
                </td>
                <td>
                  <div class="flex justify-end">
                    <RowActionsMenu
                      :open="activeMenuId === row.id"
                      placement="up"
                      @toggle="toggleMenu(row.id)"
                    >
                      <RowActionsItem icon="edit" @click="onEdit(row.id)">
                        {{ $t('common.edit') }}
                      </RowActionsItem>
                      <RowActionsItem icon="delete" danger @click="onDelete(row)">
                        {{ $t('common.delete') }}
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
import IconPlus from '@/components/icons/IconPlus.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useFeedback } from '@/composables/useFeedback'
import reportExportService, { type ReportExportTemplate } from '@/services/report-export.service'

const { t, locale } = useI18n()
const router = useRouter()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const items = ref<ReportExportTemplate[]>([])
const activeMenuId = ref<string | null>(null)

function templateLabel(row: ReportExportTemplate) {
  return isRTL.value && row.name_ar?.trim() ? row.name_ar : row.name
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function onEdit(id: string) {
  activeMenuId.value = null
  void router.push(`/reports/export-templates/${encodeURIComponent(id)}`)
}

async function onDelete(row: ReportExportTemplate) {
  activeMenuId.value = null
  const ok = await feedback.confirm({
    title: t('common.delete'),
    message: t('reports.exportTemplateConfirmDelete', { name: templateLabel(row) }),
    confirmLabel: t('common.delete'),
    danger: true,
  })
  if (!ok) return
  try {
    await reportExportService.removeTemplate(row.id)
    feedback.success(t('reports.exportTemplateDeleted'), t('common.success'))
    await load()
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: string }).message || '')
        : ''
    feedback.error(message || t('reports.exportTemplateDeleteFailed'), t('common.error'))
  }
}

function onDocClick(ev: Event) {
  const target = ev.target as Element
  if (activeMenuId.value && !target.closest('.relative')) activeMenuId.value = null
}

async function load() {
  loading.value = true
  try {
    items.value = await reportExportService.listTemplates()
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: string }).message || '')
        : ''
    feedback.error(message || t('reports.exportTemplatesLoadFailed'), t('common.error'))
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
