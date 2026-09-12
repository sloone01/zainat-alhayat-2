<template>
  <div class="aa" :dir="isRTL ? 'rtl' : 'ltr'">
    <PlatformMarketingNav />

    <div class="docs-shell">
      <button type="button" class="docs-topics-btn" @click="sidebarOpen = true">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 6h16M4 12h10M4 18h16" />
        </svg>
        {{ $t('demo.topics') }}
      </button>

      <div v-if="sidebarOpen" class="docs-backdrop" @click="sidebarOpen = false" />

      <aside class="docs-sidebar" :class="{ 'docs-sidebar--open': sidebarOpen }" :aria-label="$t('demo.topics')">
        <div class="docs-sidebar__head">
          <p class="docs-kicker">{{ $t('demo.title') }}</p>
          <button type="button" class="docs-sidebar__close" :aria-label="$t('docs.closeTopics')" @click="sidebarOpen = false">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="audiences.length > 1" class="docs-pills" role="tablist">
          <router-link
            v-for="item in audiences"
            :key="item"
            :to="demoPath(firstDemoSlug(item) || DEFAULT_DEMO_SLUG)"
            class="docs-pill"
            :class="{ 'docs-pill--on': audience === item }"
          >
            {{ $t(item === 'parents' ? 'docs.parents' : 'docs.staff') }}
          </router-link>
        </div>

        <nav class="docs-tree">
          <div v-for="groupKey in groupKeys" :key="groupKey" class="docs-group">
            <p class="docs-group__title">{{ $t(`docs.groups.${groupKey}`) }}</p>
            <router-link
              v-for="topic in topicsInGroup(groupKey)"
              :key="topic.slug"
              :to="demoPath(topic.slug)"
              class="docs-link"
              :class="{ 'docs-link--on': topic.slug === slug }"
              @click="sidebarOpen = false"
            >
              {{ articleTitle(topic.slug) }}
            </router-link>
          </div>
        </nav>
      </aside>

      <main class="docs-main demo-main">
        <p class="docs-kicker">{{ groupLabel }}</p>
        <template v-if="topic">
          <h1>{{ articleTitle(topic.slug) }}</h1>
          <DemoPlayer :topic="topic" />
        </template>
        <p v-else class="docs-intro">{{ $t('docs.notFound') }}</p>
      </main>
    </div>

    <PlatformMarketingFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import PlatformMarketingNav from '@/components/PlatformMarketingNav.vue'
import PlatformMarketingFooter from '@/components/PlatformMarketingFooter.vue'
import DemoPlayer from '@/components/DemoPlayer.vue'
import {
  DEFAULT_DEMO_SLUG,
  demoAudiences,
  demoPath,
  demoTopicsForAudience,
  firstDemoSlug,
  getDemoTopic,
  groupKeysForAudience,
} from '@/demo/catalog'
import { getDocsArticle } from '@/docs/content'
import type { DemoAudience, DemoTopic } from '@/demo/types'

const { locale, t } = useI18n()
const route = useRoute()
const sidebarOpen = ref(false)

const isRTL = computed(() => locale.value === 'ar')
const slug = computed(() => String(route.params.slug || DEFAULT_DEMO_SLUG))
const topic = computed(() => getDemoTopic(slug.value))
const audience = computed<DemoAudience>(() => topic.value?.audience || 'staff')
const audiences = computed(() => demoAudiences())
const groupKeys = computed(() => groupKeysForAudience(audience.value))

const groupLabel = computed(() => {
  const key = topic.value?.groupKey
  return key ? t(`docs.groups.${key}`) : t('demo.title')
})

function topicsInGroup(groupKey: string): DemoTopic[] {
  return demoTopicsForAudience(audience.value).filter((item) => item.groupKey === groupKey)
}

function articleTitle(s: string): string {
  return getDocsArticle(locale.value, s)?.title || s
}

const pageTitle = computed(() => {
  const title = articleTitle(slug.value)
  return isRTL.value ? `${title} — فكر` : `${title} — FIKR`
})

function applyTitle() {
  document.title = pageTitle.value
}

watch([() => route.fullPath, locale], async () => {
  applyTitle()
  sidebarOpen.value = false
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'auto' })
})

onMounted(() => {
  applyTitle()
})

onUnmounted(() => {
  document.title = isRTL.value ? 'فكر — منصة المدارس الذكية' : 'FIKR — Smart School Platform'
})
</script>

<style scoped>
.aa {
  --aa-teal: #00a19b;
  --aa-navy: #0a2147;
  --docs-ink: #243044;
  --docs-muted: #66758a;
  --docs-line: #e6ebee;
  --docs-side: #f7f9f9;
  --docs-hover: #eef2f2;
  min-height: 100vh;
  background: #fff;
  color: var(--docs-ink);
  font-family: Inter, 'Be Vietnam Pro', 'Noto Sans Arabic', system-ui, sans-serif;
}

.docs-shell {
  display: grid;
  grid-template-columns: 1fr;
  min-height: calc(100vh - 72px);
}

.docs-topics-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.85rem 1.25rem 0;
  min-height: 34px;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--docs-line);
  background: #fff;
  color: var(--docs-ink);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.docs-topics-btn:hover {
  background: var(--docs-side);
}

.docs-backdrop {
  position: fixed;
  inset: 0;
  z-index: 45;
  background: rgba(10, 33, 71, 0.28);
}

.docs-sidebar {
  display: none;
  flex-direction: column;
  background: var(--docs-side);
  border-inline-end: 1px solid var(--docs-line);
}

.docs-sidebar--open {
  display: flex;
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  z-index: 50;
  width: min(18.5rem, 92vw);
  overflow: auto;
  box-shadow: 8px 0 24px rgba(10, 33, 71, 0.08);
}

.docs-sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.1rem 1.15rem 0.25rem;
}

.docs-sidebar__close {
  display: inline-flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--docs-muted);
  cursor: pointer;
}

.docs-kicker {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--docs-ink);
}

.docs-pills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: 0.65rem 1rem 0.35rem;
  padding: 3px;
  border-radius: 8px;
  background: #eef1f1;
}

.docs-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  border: 0;
  background: transparent;
  color: var(--docs-muted);
  font-size: 0.78rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.docs-pill--on {
  background: #fff;
  color: var(--docs-ink);
  box-shadow: 0 1px 2px rgba(10, 33, 71, 0.06);
}

.docs-tree {
  padding: 0.2rem 0.7rem 1.75rem;
}

.docs-group {
  margin-top: 1.15rem;
}

.docs-group__title {
  margin: 0.15rem 0.55rem 0.35rem;
  font-size: 0.92rem;
  font-weight: 650;
  line-height: 1.35;
  color: var(--aa-navy);
}

.docs-link {
  display: block;
  padding: 0.32rem 0.55rem;
  border-radius: 5px;
  color: var(--docs-muted);
  font-size: 0.82rem;
  font-weight: 400;
  line-height: 1.45;
  text-decoration: none;
}

.docs-link:hover {
  background: var(--docs-hover);
  color: var(--docs-ink);
}

.docs-link--on {
  background: #fff;
  color: var(--docs-ink);
  font-weight: 500;
}

.docs-main {
  padding: 1.35rem 1.25rem 3.75rem;
}

.demo-main {
  max-width: 72rem;
}

.docs-main .docs-kicker {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.docs-main h1 {
  margin: 0 0 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--docs-line);
  font-size: 1.55rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--aa-navy);
}

.docs-intro {
  margin: 0 0 1.75rem;
  font-size: 1rem;
  line-height: 1.75;
  color: var(--docs-muted);
}

@media (min-width: 900px) {
  .docs-topics-btn,
  .docs-backdrop,
  .docs-sidebar__close {
    display: none;
  }
  .docs-shell {
    grid-template-columns: 16.75rem minmax(0, 1fr);
  }
  .docs-sidebar {
    display: flex;
    position: sticky;
    top: 72px;
    height: calc(100vh - 72px);
    overflow: auto;
  }
  .docs-main {
    padding: 2.75rem 2.75rem 5rem;
  }
}
</style>
