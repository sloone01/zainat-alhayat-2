<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('enrollmentResponsibilities.pageTitle')" />

      <div class="space-y-6">
        <section
          v-for="section in sections"
          :key="section.party"
          class="fk-card"
        >
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ section.title }}</h2>
              <p class="fk-card__meta">{{ section.rows.length }}</p>
            </div>
            <div class="flex shrink-0 flex-nowrap items-center gap-2">
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="$t('enrollmentResponsibilities.addItem')"
                @click="openCreate(section.party)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </header>

          <div class="p-6">
            <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
              <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
              <span class="text-sm">{{ $t('common.loading') }}</span>
            </div>

            <div v-else-if="section.rows.length === 0" class="flex min-h-[8rem] flex-col items-center justify-center text-center">
              <p class="text-sm font-medium text-gray-600">{{ $t('enrollmentResponsibilities.empty') }}</p>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start w-12">#</th>
                    <th class="px-4 py-3 text-start">{{ $t('enrollmentResponsibilities.textAr') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('enrollmentResponsibilities.textEn') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="(row, idx) in section.rows"
                    :key="row.id"
                    class="hover:bg-primary-50/20"
                    :class="!row.is_active ? 'opacity-70' : ''"
                  >
                    <td class="px-4 py-3 text-gray-500">{{ idx + 1 }}</td>
                    <td class="px-4 py-3 text-gray-900">{{ row.text_ar }}</td>
                    <td class="px-4 py-3 text-gray-700">{{ row.text_en }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        :class="row.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'"
                      >
                        {{ row.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === row.id"
                          placement="up"
                          @toggle="toggleMenu(row.id)"
                        >
                          <RowActionsItem icon="edit" @click="openEdit(row)">
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem
                            :icon="row.is_active ? 'archive' : 'activate'"
                            @click="onSetActive(row, !row.is_active)"
                          >
                            {{ row.is_active ? $t('paymentSettings.markInactive') : $t('paymentSettings.markActive') }}
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
          </div>
        </section>
      </div>
    </div>

    <FikrDialog
      :show="showForm"
      plain-footer
      :title="editingRow ? $t('enrollmentResponsibilities.editItem') : $t('enrollmentResponsibilities.addItem')"
      @close="closeForm"
    >
      <form id="enrollment-resp-form" class="fk-form" @submit.prevent="saveForm">
        <div class="fk-form__section space-y-4">
          <div class="fk-form__row">
            <label class="fk-flabel" for="resp-party"><span>{{ $t('enrollmentResponsibilities.party') }}</span></label>
            <select id="resp-party" v-model="form.party" required class="fk-field" :disabled="!!editingRow">
              <option value="school">{{ $t('enrollment.schoolResponsibilities') }}</option>
              <option value="parent">{{ $t('enrollment.parentResponsibilities') }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="resp-ar"><span>{{ $t('enrollmentResponsibilities.textAr') }}</span></label>
            <textarea id="resp-ar" v-model="form.text_ar" required rows="3" class="fk-field" dir="rtl" />
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="resp-en"><span>{{ $t('enrollmentResponsibilities.textEn') }}</span></label>
            <textarea id="resp-en" v-model="form.text_en" required rows="3" class="fk-field" dir="ltr" />
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="closeForm">{{ $t('common.cancel') }}</button>
        <button type="submit" form="enrollment-resp-form" class="fk-btn fk-btn--primary" :disabled="saving">
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useFeedback } from '@/composables/useFeedback'
import {
  enrollmentResponsibilityService,
  type EnrollmentResponsibilityItem,
  type EnrollmentResponsibilityParty,
} from '@/services/enrollment-responsibility.service'

const { t, locale } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const saving = ref(false)
const rows = ref<EnrollmentResponsibilityItem[]>([])
const activeMenuId = ref<string | null>(null)
const showForm = ref(false)
const editingRow = ref<EnrollmentResponsibilityItem | null>(null)
const form = ref({
  party: 'school' as EnrollmentResponsibilityParty,
  text_ar: '',
  text_en: '',
})

const sections = computed(() => [
  {
    party: 'school' as const,
    title: t('enrollment.schoolResponsibilities'),
    rows: rows.value.filter((r) => r.party === 'school'),
  },
  {
    party: 'parent' as const,
    title: t('enrollment.parentResponsibilities'),
    rows: rows.value.filter((r) => r.party === 'parent'),
  },
])

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenus() {
  activeMenuId.value = null
}

async function load() {
  loading.value = true
  try {
    rows.value = await enrollmentResponsibilityService.list()
  } catch (e) {
    console.error(e)
    feedback.error(t('enrollmentResponsibilities.loadError'))
  } finally {
    loading.value = false
  }
}

function openCreate(party: EnrollmentResponsibilityParty) {
  closeMenus()
  editingRow.value = null
  form.value = { party, text_ar: '', text_en: '' }
  showForm.value = true
}

function openEdit(row: EnrollmentResponsibilityItem) {
  closeMenus()
  editingRow.value = row
  form.value = {
    party: row.party,
    text_ar: row.text_ar,
    text_en: row.text_en,
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingRow.value = null
}

async function saveForm() {
  const textAr = form.value.text_ar.trim()
  const textEn = form.value.text_en.trim()
  if (!textAr || !textEn) {
    feedback.error(t('enrollmentResponsibilities.requiredTexts'))
    return
  }
  saving.value = true
  try {
    if (editingRow.value) {
      await enrollmentResponsibilityService.update(editingRow.value.id, {
        text_ar: textAr,
        text_en: textEn,
      })
      feedback.success(t('enrollmentResponsibilities.saved'))
    } else {
      await enrollmentResponsibilityService.create({
        party: form.value.party,
        text_ar: textAr,
        text_en: textEn,
      })
      feedback.success(t('enrollmentResponsibilities.created'))
    }
    closeForm()
    await load()
  } catch (e) {
    console.error(e)
    feedback.error(t('enrollmentResponsibilities.saveError'))
  } finally {
    saving.value = false
  }
}

async function onSetActive(row: EnrollmentResponsibilityItem, isActive: boolean) {
  closeMenus()
  try {
    await enrollmentResponsibilityService.update(row.id, { is_active: isActive })
    await load()
  } catch (e) {
    console.error(e)
    feedback.error(t('enrollmentResponsibilities.saveError'))
  }
}

async function onDelete(row: EnrollmentResponsibilityItem) {
  closeMenus()
  const ok = await feedback.confirm({
    message: t('enrollmentResponsibilities.deleteConfirm'),
    danger: true,
    confirmLabel: t('common.delete'),
  })
  if (!ok) return
  try {
    await enrollmentResponsibilityService.remove(row.id)
    feedback.success(t('enrollmentResponsibilities.deleted'))
    await load()
  } catch (e) {
    console.error(e)
    feedback.error(t('enrollmentResponsibilities.saveError'))
  }
}

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (target?.closest?.('[data-row-actions]')) return
  closeMenus()
}

onMounted(() => {
  void load()
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>
