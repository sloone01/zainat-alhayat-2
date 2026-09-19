<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <template v-else>
        <div class="mx-auto w-full max-w-3xl space-y-6">
          <header class="space-y-4">
            <h1 class="fk-display text-[2rem] font-bold leading-tight text-navy-800 sm:text-4xl">
              {{ $t('absenceExcuses.parentNav') }}
            </h1>
            <div v-if="children.length > 1" class="flex flex-wrap gap-3">
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
            </div>
          </header>

          <div v-if="!children.length" class="fk-elev">
            <div class="fk-empty-panel">
              <p>{{ $t('parent.noChildren') }}</p>
            </div>
          </div>

          <template v-else>
            <form class="fk-elev space-y-4 p-5 sm:p-6" @submit.prevent="submit">
              <div>
                <label class="fk-label" for="excuse-date">{{ $t('absenceExcuses.date') }}</label>
                <input id="excuse-date" v-model="form.date" type="date" class="fk-field" :max="today" required>
              </div>
              <div>
                <label class="fk-label" for="excuse-file">{{ $t('absenceExcuses.file') }}</label>
                <input id="excuse-file" type="file" class="fk-field" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.heic,.doc,.docx" @change="onFile">
              </div>
              <div>
                <label class="fk-label" for="excuse-text">{{ $t('absenceExcuses.explanation') }}</label>
                <textarea id="excuse-text" v-model="form.explanation" rows="4" class="fk-field" required />
              </div>
              <div class="flex justify-end">
                <button type="submit" class="fk-btn fk-btn--primary" :disabled="saving">
                  {{ $t('absenceExcuses.submit') }}
                </button>
              </div>
            </form>

            <section class="fk-elev p-0">
              <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
                <h2 class="fk-card__title">{{ $t('absenceExcuses.listHeading') }}</h2>
                <p class="fk-card__meta">{{ $t('absenceExcuses.count', { count: visibleItems.length }) }}</p>
              </header>
              <div v-if="!visibleItems.length" class="fk-empty">
                <p class="fk-empty__title">{{ $t('absenceExcuses.empty') }}</p>
              </div>
              <ul v-else class="divide-y divide-fikr-hairline">
                <li v-for="item in visibleItems" :key="item.id" class="space-y-2 px-5 py-4 sm:px-6">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="text-sm font-semibold text-fikr-ink">{{ formatDate(item.absence_date) }}</p>
                    <span class="fk-pill" :class="statusClass(item.status)">{{ $t(`absenceExcuses.${item.status}`) }}</span>
                  </div>
                  <p class="text-sm text-fikr-ink">{{ item.explanation }}</p>
                  <p v-if="item.status === 'rejected' && item.rejection_reason" class="text-sm text-red-700">
                    {{ item.rejection_reason }}
                  </p>
                  <button
                    v-if="item.has_file"
                    type="button"
                    class="text-sm font-medium text-primary-700 hover:text-primary-800"
                    @click="download(item)"
                  >
                    {{ item.original_filename || $t('absenceExcuses.download') }}
                  </button>
                </li>
              </ul>
            </section>
          </template>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { useFeedback } from '@/composables/useFeedback'
import {
  absenceExcuseService,
  type AbsenceExcuse,
  type AbsenceExcuseChild,
} from '@/services/absence-excuse.service'

const { locale, t } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const saving = ref(false)
const children = ref<AbsenceExcuseChild[]>([])
const items = ref<AbsenceExcuse[]>([])
const selectedId = ref('')
const file = ref<File | null>(null)
const form = reactive({ date: '', explanation: '' })

const today = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

const visibleItems = computed(() =>
  items.value.filter((item) => !selectedId.value || item.student_id === selectedId.value),
)

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

function statusClass(status: string) {
  if (status === 'approved') return 'fk-pill--teal'
  if (status === 'rejected') return 'fk-pill--navy'
  return 'fk-pill--mist'
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
    feedback.success(t('absenceExcuses.submitted'))
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

onMounted(load)
</script>
