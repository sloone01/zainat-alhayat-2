<template>
  <div class="demo-player">
    <header class="demo-chrome" dir="ltr">
      <span class="demo-dots" aria-hidden="true">
        <i /><i /><i />
      </span>
      <p class="demo-address">{{ topic.addressBar }}</p>
    </header>
    <div ref="stageEl" class="demo-stage" dir="ltr" :style="{ height: `${stageHeight}px` }">
      <iframe
        ref="frameEl"
        class="demo-frame"
        :src="frameSrc"
        :title="topic.addressBar"
        :style="frameStyle"
      />
      <div
        class="demo-cursor"
        :class="{ 'demo-cursor--on': cursorOn }"
        :style="cursorStyle"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.5 3.2v17.2l4.3-4.2 2.4 5.7 2.6-1.1-2.4-5.6h6.3L5.5 3.2z" />
        </svg>
      </div>
      <div v-if="!playing && !played" class="demo-overlay">
        <button type="button" class="fk-btn fk-btn--primary" @click="play">
          {{ $t('demo.play') }}
        </button>
      </div>
      <div v-else-if="!playing && played" class="demo-overlay demo-overlay--end">
        <button type="button" class="fk-btn fk-btn--primary" @click="play">
          {{ $t('demo.replay') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { DemoTopic } from '@/demo/types'

const FRAME_W = 1280
const FRAME_H = 800

const props = defineProps<{
  topic: DemoTopic
}>()

const stageEl = ref<HTMLElement | null>(null)
const frameEl = ref<HTMLIFrameElement | null>(null)
const scale = ref(1)
const frameSrc = ref('')
const playing = ref(false)
const played = ref(false)
const cursorOn = ref(false)
const cursorX = ref(24)
const cursorY = ref(24)
let run = 0
let resizeObserver: ResizeObserver | null = null

const frameStyle = computed(() => ({
  width: `${FRAME_W}px`,
  height: `${FRAME_H}px`,
  transform: `scale(${scale.value})`,
}))

const stageHeight = computed(() => Math.max(280, Math.round(FRAME_H * scale.value)))

const cursorStyle = computed(() => ({
  transform: `translate(${cursorX.value}px, ${cursorY.value}px)`,
}))

watch(
  () => props.topic.slug,
  () => {
    stop()
    played.value = false
    frameSrc.value = ''
  },
)

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && stageEl.value) {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(stageEl.value)
  }
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  window.removeEventListener('resize', measure)
})

function withCacheBust(src: string) {
  const url = new URL(src, window.location.origin)
  const bust = String(Date.now())
  url.searchParams.set('_r', bust)
  return { href: `${url.pathname}${url.search}`, bust }
}

function measure() {
  const width = stageEl.value?.clientWidth || FRAME_W
  scale.value = Math.min(1, width / FRAME_W)
}

function frameSearch(): string {
  try {
    return iframeWin()?.location?.search || ''
  } catch {
    return ''
  }
}

function stop() {
  run += 1
  playing.value = false
  cursorOn.value = false
}

function iframeWin(): Window | null {
  return frameEl.value?.contentWindow ?? null
}

function iframeDoc(): Document | null {
  return frameEl.value?.contentDocument ?? null
}

function targetEl(selector: string): HTMLElement | null {
  return iframeDoc()?.querySelector(selector) as HTMLElement | null
}

function pointFor(selector: string): { x: number; y: number } | null {
  const el = targetEl(selector)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return {
    x: (rect.left + rect.width / 2) * scale.value,
    y: (rect.top + rect.height / 2) * scale.value,
  }
}

function sleep(ms: number, token: number) {
  return new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      if (token !== run) reject(new Error('aborted'))
      else resolve()
    }, ms)
  })
}

function moveCursor(x: number, y: number, ms: number, token: number) {
  return new Promise<void>((resolve, reject) => {
    const fromX = cursorX.value
    const fromY = cursorY.value
    const started = Date.now()
    let done = false
    const finish = (ok: boolean) => {
      if (done) return
      done = true
      cursorX.value = x
      cursorY.value = y
      if (ok) resolve()
      else reject(new Error('aborted'))
    }
    const tick = () => {
      if (token !== run) {
        finish(false)
        return
      }
      const t = Math.min(1, (Date.now() - started) / Math.max(1, ms))
      const ease = 1 - (1 - t) ** 3
      cursorX.value = fromX + (x - fromX) * ease
      cursorY.value = fromY + (y - fromY) * ease
      if (t < 1) requestAnimationFrame(tick)
      else finish(true)
    }
    window.setTimeout(() => {
      if (token !== run) finish(false)
      else finish(true)
    }, ms + 400)
    requestAnimationFrame(tick)
  })
}

function firstTarget(): string | null {
  const step = props.topic.steps.find((item) => item.action !== 'wait')
  return step && 'target' in step ? step.target : null
}

function fillField(selector: string, value: string) {
  const field = selector.includes('password') ? 'password' : 'email'
  iframeWin()?.postMessage({ type: 'fikr-demo', field, value }, window.location.origin)
}

async function play() {
  if (playing.value) return
  stop()
  const token = run
  playing.value = true
  cursorOn.value = true
  cursorX.value = 28
  cursorY.value = 28
  const { href, bust } = withCacheBust(props.topic.src)
  frameSrc.value = href
  await nextTick()
  const started = Date.now()
  const waitFor = firstTarget()
  while (!frameSearch().includes(`_r=${bust}`) || (waitFor && !targetEl(waitFor))) {
    if (token !== run) return
    if (Date.now() - started > 10000) {
      playing.value = false
      played.value = true
      return
    }
    try {
      await sleep(80, token)
    } catch {
      return
    }
  }
  try {
    for (const step of props.topic.steps) {
      if (token !== run) return
      if (step.action === 'wait') {
        await sleep(step.ms, token)
        continue
      }
      const point = pointFor(step.target)
      if (point) await moveCursor(point.x, point.y, 520, token)
      if (step.action === 'move') continue
      const el = targetEl(step.target)
      if (step.action === 'click') {
        el?.click()
        await sleep(160, token)
        continue
      }
      if (step.action === 'type') {
        let typed = ''
        for (const ch of step.text) {
          if (token !== run) return
          typed += ch
          fillField(step.target, typed)
          await sleep(48, token)
        }
      }
    }
  } catch {
    if (token === run) {
      playing.value = false
      played.value = true
    }
    return
  }
  if (token !== run) return
  playing.value = false
  played.value = true
}
</script>

<style scoped>
.demo-player {
  overflow: hidden;
  border: 1px solid #d5e0e0;
  border-radius: 16px;
  background: #0a2147;
}

.demo-chrome {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
  background: #0a2147;
}

.demo-dots {
  display: inline-flex;
  gap: 0.35rem;
}

.demo-dots i {
  display: block;
  height: 8px;
  width: 8px;
  border-radius: 9999px;
  background: #3d4f6b;
}

.demo-dots i:nth-child(1) {
  background: #f2b8b5;
}
.demo-dots i:nth-child(2) {
  background: #f6d58b;
}
.demo-dots i:nth-child(3) {
  background: #8fd0c4;
}

.demo-address {
  flex: 1;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  background: #132a4f;
  padding: 0.28rem 0.75rem;
  color: #d7e0ea;
  font-size: 0.72rem;
  font-weight: 500;
}

.demo-stage {
  position: relative;
  overflow: hidden;
  background: #fff;
}

.demo-frame {
  position: absolute;
  top: 0;
  left: 0;
  border: 0;
  pointer-events: none;
  transform-origin: top left;
  background: #fff;
}

.demo-cursor {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 22px;
  height: 22px;
  color: #0a2147;
  filter: drop-shadow(0 1px 1px rgba(10, 33, 71, 0.35));
  opacity: 0;
  pointer-events: none;
  will-change: transform;
}

.demo-cursor--on {
  opacity: 1;
}

.demo-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 33, 71, 0.28);
}

.demo-overlay--end {
  background: rgba(10, 33, 71, 0.12);
}
</style>
