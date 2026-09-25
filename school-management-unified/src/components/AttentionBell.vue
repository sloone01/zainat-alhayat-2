<template>
  <NotificationsFilter
    :items="rows"
    :count="total"
    :loading="loading"
    :label="buttonLabel"
    align="end"
    @open="load(true)"
    @select="openItem"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import NotificationsFilter from '@/components/ui/notifications-filter.vue'

type NotificationCategory = 'updates' | 'alerts' | 'reminders'
type NotificationFilterItem = {
  id: string
  category: NotificationCategory
  title: string
  description: string
  time: string
  href: string
}
import { attentionService, type AttentionItem } from '@/services/attention.service'
import { authService } from '@/services/auth.service'
import { getSessionPersona } from '@/utils/auth-token'

const UPDATE_KINDS = new Set(['enrollment', 'school_registration', 'custom_plan', 'support'])
const REMINDER_KINDS = new Set(['school_billing'])

const { t, locale } = useI18n()
const router = useRouter()

const loading = ref(false)
const items = ref<AttentionItem[]>([])
const total = ref(0)

const buttonLabel = computed(() =>
  total.value > 0 ? t('attention.openCount', { n: total.value }) : t('attention.open'),
)

const rows = computed<NotificationFilterItem[]>(() =>
  items.value.map((item) => {
    const kind = kindLabel(item.kind)
    const subject = (item.title || '').trim()
    return {
      id: item.id,
      category: categoryOf(item.kind),
      title: kind || subject,
      description: subject && subject !== kind ? subject : '',
      time: whenLabel(item.created_at),
      href: item.href,
    }
  }),
)

function categoryOf(kind: string): NotificationCategory {
  if (UPDATE_KINDS.has(kind)) return 'updates'
  if (REMINDER_KINDS.has(kind)) return 'reminders'
  return 'alerts'
}

function kindLabel(kind: string): string {
  const key = `attention.kinds.${kind}`
  const label = t(key)
  return label === key ? '' : label
}

function whenLabel(iso: string): string {
  const at = new Date(iso).getTime()
  if (!Number.isFinite(at) || at <= 0) return ''
  const minutes = Math.round((Date.now() - at) / 60000)
  if (minutes < 1) return t('attention.justNow')
  if (minutes < 60) return t('attention.minutesAgo', { n: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return t('attention.hoursAgo', { n: hours })
  const days = Math.round(hours / 24)
  return t('attention.daysAgo', { n: days })
}

function shouldFetch(): boolean {
  if (!authService.getStoredToken()) return false
  if (getSessionPersona() === 'student') return false
  const user = authService.getStoredUser()
  if (user?.role === 'student' || user?.user_type === 'student') return false
  return true
}

async function load(force = false) {
  if (!shouldFetch()) {
    items.value = []
    total.value = 0
    return
  }
  loading.value = items.value.length === 0
  try {
    const loc = locale.value === 'en' ? 'en' : 'ar'
    const feed = await attentionService.feed(loc, force)
    items.value = feed.items
    total.value = feed.total
  } catch {
    if (!items.value.length) {
      items.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

function openItem(href: string) {
  void router.push(href)
}

watch(locale, () => {
  void load(true)
})

let pollTimer = 0

onMounted(() => {
  void load(false)
  pollTimer = window.setInterval(() => {
    void load(true)
  }, 60_000)
})

onUnmounted(() => {
  window.clearInterval(pollTimer)
})
</script>
