<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('platformSettings.title')" :subtitle="$t('platformSettings.subtitle')" />

      <section class="fk-elev p-0">
        <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <h2 class="fk-card__title">{{ $t('platformSettings.paymentsHeading') }}</h2>
        </header>

        <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
          <FikrLoader />
        </div>

        <div v-else-if="setting" class="space-y-5 p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-fikr-ink">{{ $t('platformSettings.thawaniTitle') }}</h3>
              <p class="mt-1 text-sm text-fikr-ink-muted">{{ $t('platformSettings.thawaniHint') }}</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="setting.enabled"
              :aria-label="$t('platformSettings.thawaniTitle')"
              :disabled="saving"
              class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:opacity-60"
              :class="setting.enabled ? 'bg-primary-600' : 'bg-gray-300'"
              @click="toggle"
            >
              <span
                class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                :class="setting.enabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'"
              />
            </button>
          </div>

          <dl class="divide-y divide-fikr-hairline overflow-hidden rounded-xl border border-fikr-hairline bg-white text-sm">
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <dt class="text-fikr-ink-muted">{{ $t('platformSettings.status') }}</dt>
              <dd>
                <KanbanTag :dot="setting.enabled ? 'emerald' : 'gray'">
                  {{ setting.enabled ? $t('platformSettings.enabled') : $t('platformSettings.disabled') }}
                </KanbanTag>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <dt class="text-fikr-ink-muted">{{ $t('platformSettings.keys') }}</dt>
              <dd>
                <KanbanTag :dot="setting.configured ? 'emerald' : 'amber'">
                  {{ setting.configured ? $t('platformSettings.keysSet') : $t('platformSettings.keysMissing') }}
                </KanbanTag>
              </dd>
            </div>
          </dl>

          <p v-if="setting.enabled && !setting.configured" class="fk-alert fk-alert--error">
            {{ $t('platformSettings.keysMissingHint') }}
          </p>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import { useFeedback } from '@/composables/useFeedback'
import { platformSettingsService, type ThawaniSetting } from '@/services/platform-settings.service'

const { locale, t } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const saving = ref(false)
const setting = ref<ThawaniSetting | null>(null)

async function load() {
  try {
    loading.value = true
    setting.value = await platformSettingsService.getThawani()
  } catch {
    feedback.error(t('platformSettings.loadFailed'))
  } finally {
    loading.value = false
  }
}

async function toggle() {
  if (!setting.value || saving.value) return
  try {
    saving.value = true
    setting.value = await platformSettingsService.setThawani(!setting.value.enabled)
    feedback.saved(
      setting.value.enabled ? t('platformSettings.nowEnabled') : t('platformSettings.nowDisabled'),
    )
  } catch {
    feedback.error(t('platformSettings.saveFailed'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
