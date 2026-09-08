<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('notificationLayouts.title')"
        :subtitle="isPlatform ? $t('notificationLayouts.platformSubtitle') : $t('notificationLayouts.subtitle')"
      />

      <p class="text-sm text-fikr-ink-soft">
        {{ isPlatform ? $t('notificationLayouts.platformHint') : $t('notificationLayouts.hint') }}
        <span v-pre class="font-mono text-xs text-primary-800">{{content}}</span>
        <template v-if="!isPlatform">
          <span class="mx-1 text-gray-300">·</span>
          <router-link class="font-medium text-primary-700 hover:text-primary-900" to="/settings/notification-templates">
            {{ $t('notificationTemplates.title') }}
          </router-link>
        </template>
        <template v-else>
          <span class="mx-1 text-gray-300">·</span>
          <router-link class="font-medium text-primary-700 hover:text-primary-900" to="/platform/notification-templates">
            {{ $t('notificationTemplates.title') }}
          </router-link>
        </template>
      </p>

      <div v-if="flashError" class="fk-alert fk-alert--error">{{ flashError }}</div>
      <div v-if="flashOk" class="fk-alert fk-alert--ok">{{ flashOk }}</div>

      <div v-if="loading" class="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
        <div class="inline-block h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <p class="mt-4 text-sm text-gray-600">{{ $t('common.loading') }}…</p>
      </div>

      <template v-else>
        <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <div class="flex flex-nowrap items-end gap-2">
            <div class="min-w-0 flex-1">
              <label class="mb-1 block text-[11px] font-medium text-gray-600" for="nl-layout-select">{{
                $t('notificationLayouts.selectLayout')
              }}</label>
              <select
                id="nl-layout-select"
                class="fk-field fk-field--sm w-full"
                :value="selectedId"
                :disabled="!layouts.length"
                @change="onLayoutDropdownChange"
              >
                <option v-if="!layouts.length" value="">{{ $t('notificationLayouts.emptyList') }}</option>
                <option v-for="row in layouts" :key="row.id" :value="row.id">
                  {{ layoutLabel(row) }}{{ row.is_default ? ` (${$t('notificationLayouts.badgeDefault')})` : '' }}
                </option>
              </select>
            </div>
            <button
              type="button"
              class="fk-btn fk-btn--pearl fk-btn--sm shrink-0"
              :disabled="saving"
              @click="startCreate"
            >
              {{ $t('notificationLayouts.addLayout') }}
            </button>
          </div>
        </div>

        <div v-if="editing" class="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <div class="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
            <div class="space-y-4">
              <div class="flex flex-wrap items-end gap-3">
                <div class="min-w-0">
                  <p class="mb-1.5 text-xs font-medium text-gray-600">
                    {{ $t('notificationTemplates.languageGroupLabel') }}
                  </p>
                  <div
                    class="inline-flex rounded-xl border border-teal-100/90 bg-teal-50/50 p-1 shadow-sm"
                    role="tablist"
                  >
                    <button
                      type="button"
                      role="tab"
                      class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                      :class="
                        langTab === 'en'
                          ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                          : 'text-gray-600 hover:text-gray-900'
                      "
                      :aria-selected="langTab === 'en'"
                      @click="langTab = 'en'"
                    >
                      {{ $t('notificationTemplates.langEn') }}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                      :class="
                        langTab === 'ar'
                          ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                          : 'text-gray-600 hover:text-gray-900'
                      "
                      :aria-selected="langTab === 'ar'"
                      @click="langTab = 'ar'"
                    >
                      {{ $t('notificationTemplates.langAr') }}
                    </button>
                  </div>
                </div>
                <div class="min-w-[8rem] flex-1">
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-name">{{
                    $t('notificationLayouts.nameEn')
                  }}</label>
                  <input id="nl-name" v-model="form.name" type="text" class="fk-field" />
                </div>
                <div class="min-w-[8rem] flex-1">
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-name-ar">{{
                    $t('notificationLayouts.nameAr')
                  }}</label>
                  <input id="nl-name-ar" v-model="form.name_ar" type="text" class="fk-field" dir="rtl" />
                </div>
                <label
                  class="mb-2 flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-gray-700"
                  :title="$t('notificationLayouts.setDefault')"
                >
                  <input v-model="form.is_default" type="checkbox" class="rounded border-gray-300 text-primary-600" />
                  {{ $t('notificationLayouts.badgeDefault') }}
                </label>
              </div>

              <div>
                <label class="mb-1 flex items-baseline justify-between gap-2 text-[11px] font-medium text-gray-600" for="nl-html">
                  <span>{{ langTab === 'ar' ? $t('notificationLayouts.htmlAr') : $t('notificationLayouts.htmlEn') }}</span>
                  <span class="font-normal text-gray-400">{{ $t('notificationLayouts.htmlHint') }}</span>
                </label>
                <textarea
                  id="nl-html"
                  v-model="activeHtml"
                  rows="18"
                  spellcheck="false"
                  class="fk-field min-h-[22rem] resize-y font-mono text-xs leading-relaxed"
                  :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                />
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2 border-t border-fikr-hairline pt-6">
                <button
                  v-if="selectedId"
                  type="button"
                  class="fk-btn fk-btn--pearl text-red-700"
                  :disabled="saving || layouts.length <= 1"
                  @click="removeSelected"
                >
                  {{ $t('common.delete') }}
                </button>
                <button type="button" class="fk-btn fk-btn--primary" :disabled="saving" @click="save">
                  {{ saving ? $t('common.loading') : $t('common.save') }}
                </button>
              </div>
            </div>
          </div>

          <div class="min-w-0 space-y-3 lg:sticky lg:top-24">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {{ $t('notificationTemplates.previewHeading') }}
            </p>
            <div class="relative min-h-[280px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div
                v-if="previewLoading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/80"
              >
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              </div>
              <iframe
                title="layout-preview"
                class="block w-full border-0 bg-white"
                style="min-height: 420px"
                sandbox="allow-same-origin"
                :srcdoc="previewHtml"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { authService } from '@/services'
import notificationLayoutService, {
  type NotificationLayout,
} from '@/services/notification-layout.service'

const { locale, t } = useI18n()
const route = useRoute()
const isRTL = computed(() => locale.value === 'ar')
const isPlatform = computed(() => route.path.startsWith('/platform/'))

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const apiOpts = computed(() =>
  isPlatform.value ? { platform: true as const } : { platform: false as const, schoolId: schoolId.value },
)

const loading = ref(true)
const saving = ref(false)
const previewLoading = ref(false)
const flashError = ref('')
const flashOk = ref('')
const layouts = ref<NotificationLayout[]>([])
const selectedId = ref('')
const editing = ref(false)
const langTab = ref<'en' | 'ar'>('en')
const previewHtml = ref('')

const form = reactive({
  name: '',
  name_ar: '',
  html_en: '',
  html_ar: '',
  is_default: false,
})

const activeHtml = computed({
  get: () => (langTab.value === 'ar' ? form.html_ar : form.html_en),
  set: (v: string) => {
    if (langTab.value === 'ar') form.html_ar = v
    else form.html_en = v
  },
})

function layoutLabel(row: NotificationLayout) {
  if (locale.value === 'ar' && row.name_ar?.trim()) return row.name_ar
  return row.name
}

function applyForm(row: NotificationLayout) {
  form.name = row.name
  form.name_ar = row.name_ar ?? ''
  form.html_en = row.html_en
  form.html_ar = row.html_ar ?? row.html_en
  form.is_default = row.is_default
  editing.value = true
}

function startCreate() {
  selectedId.value = ''
  form.name = t('notificationLayouts.newName')
  form.name_ar = ''
  form.html_en =
    layouts.value[0]?.html_en ||
    `<!DOCTYPE html><html><body><div>{{schoolLogoHtml}}<strong>{{schoolName}}</strong></div><div>{{content}}</div><div>{{footerText}}</div></body></html>`
  form.html_ar = layouts.value[0]?.html_ar || form.html_en
  form.is_default = layouts.value.length === 0
  editing.value = true
  langTab.value = locale.value === 'ar' ? 'ar' : 'en'
  void runPreview()
}

function selectLayout(id: string) {
  selectedId.value = id
  const row = layouts.value.find((x) => x.id === id)
  if (row) applyForm(row)
  void runPreview()
}

function onLayoutDropdownChange(ev: Event) {
  const id = (ev.target as HTMLSelectElement).value
  if (id) selectLayout(id)
}

const runPreview = useDebounceFn(async () => {
  const html = (activeHtml.value || '').trim()
  if (!html) {
    previewHtml.value = ''
    return
  }
  previewLoading.value = true
  try {
    const res = await notificationLayoutService.preview(isPlatform.value, {
      locale: langTab.value,
      html,
      ...(isPlatform.value ? {} : { school_id: schoolId.value }),
    })
    previewHtml.value = res.html || ''
  } catch {
    previewHtml.value = html
  } finally {
    previewLoading.value = false
  }
}, 400)

watch([activeHtml, langTab], () => {
  void runPreview()
})

async function loadAll() {
  loading.value = true
  flashError.value = ''
  try {
    const list = await notificationLayoutService.list(apiOpts.value)
    layouts.value = list
    if (!selectedId.value && list.length) {
      selectedId.value = list.find((x) => x.is_default)?.id || list[0].id
    }
    const row = list.find((x) => x.id === selectedId.value)
    if (row) applyForm(row)
    else if (list.length) selectLayout(list[0].id)
    else startCreate()
    langTab.value = locale.value === 'ar' ? 'ar' : 'en'
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationLayouts.loadError')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  flashOk.value = ''
  flashError.value = ''
  try {
    if (!form.name.trim()) throw new Error(t('notificationLayouts.nameRequired'))
    if (!/\{\{\s*content\s*\}\}/i.test(form.html_en)) {
      throw new Error(t('notificationLayouts.contentRequired'))
    }
    const payload = {
      name: form.name.trim(),
      name_ar: form.name_ar.trim() || null,
      html_en: form.html_en,
      html_ar: form.html_ar.trim() || null,
      is_default: form.is_default,
    }
    const saved = selectedId.value
      ? await notificationLayoutService.update(apiOpts.value, selectedId.value, payload)
      : await notificationLayoutService.create(apiOpts.value, payload)
    const idx = layouts.value.findIndex((x) => x.id === saved.id)
    if (idx >= 0) layouts.value[idx] = saved
    else layouts.value = [...layouts.value, saved]
    if (saved.is_default) {
      layouts.value = layouts.value.map((x) =>
        x.id === saved.id ? saved : { ...x, is_default: false },
      )
    }
    selectedId.value = saved.id
    applyForm(saved)
    flashOk.value = t('notificationLayouts.saved')
    setTimeout(() => {
      flashOk.value = ''
    }, 3000)
    await runPreview()
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationLayouts.saveError')
  } finally {
    saving.value = false
  }
}

async function removeSelected() {
  if (!selectedId.value || layouts.value.length <= 1) return
  if (!confirm(t('notificationLayouts.deleteConfirm'))) return
  saving.value = true
  flashError.value = ''
  try {
    await notificationLayoutService.remove(apiOpts.value, selectedId.value)
    layouts.value = layouts.value.filter((x) => x.id !== selectedId.value)
    selectedId.value = layouts.value.find((x) => x.is_default)?.id || layouts.value[0]?.id || ''
    if (selectedId.value) selectLayout(selectedId.value)
    else startCreate()
    flashOk.value = t('notificationLayouts.deleted')
    setTimeout(() => {
      flashOk.value = ''
    }, 3000)
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationLayouts.saveError')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadAll()
  await runPreview()
})
</script>
