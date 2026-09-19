<template>
  <iframe
    ref="iframeRef"
    :title="title"
    class="block w-full border-0 bg-transparent"
    style="min-height: 160px"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
    sandbox="allow-same-origin"
    scrolling="no"
    :srcdoc="srcdoc"
    @load="onFrameLoad"
  />
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

export type LetterCardApproval = 'none' | 'actions' | 'status' | 'awaiting'

const props = withDefaults(
  defineProps<{
    srcdoc: string
    locale?: 'en' | 'ar'
    title?: string
    approval?: LetterCardApproval
    approveLabel?: string
    rejectLabel?: string
    statusLabel?: string
    awaitingLabel?: string
    statusKind?: 'approved' | 'rejected' | ''
    busy?: boolean
  }>(),
  {
    approval: 'none',
    approveLabel: '',
    rejectLabel: '',
    statusLabel: '',
    awaitingLabel: '',
    statusKind: '',
    busy: false,
  },
)

const emit = defineEmits<{
  approve: []
  reject: []
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const imageCleanups: Array<() => void> = []
const actionCleanups: Array<() => void> = []

function clearImageListeners() {
  while (imageCleanups.length) imageCleanups.pop()?.()
}

function clearActionListeners() {
  while (actionCleanups.length) actionCleanups.pop()?.()
}

function applyButtonStyle(btn: HTMLButtonElement, kind: 'approve' | 'reject') {
  btn.type = 'button'
  btn.style.cursor = props.busy ? 'not-allowed' : 'pointer'
  btn.style.flex = '1 1 6rem'
  btn.style.minWidth = '6rem'
  btn.style.padding = '10px 12px'
  btn.style.borderRadius = '8px'
  btn.style.fontSize = '13px'
  btn.style.fontWeight = '600'
  btn.style.transition = 'background-color 200ms, opacity 200ms'
  btn.disabled = props.busy
  btn.style.opacity = props.busy ? '0.5' : '1'
  if (kind === 'approve') {
    btn.style.background = '#00847f'
    btn.style.color = '#ffffff'
    btn.style.border = '0'
  } else {
    btn.style.background = '#ffffff'
    btn.style.color = '#b91c1c'
    btn.style.border = '1px solid #fca5a5'
  }
}

function mountApprovalFooter() {
  const iframe = iframeRef.value
  const doc = iframe?.contentDocument
  if (!doc) return
  const card = doc.querySelector('.nt-email-card') || doc.body
  let footer = doc.getElementById('fikr-chat-letter-actions')
  clearActionListeners()
  if (props.approval === 'none') {
    footer?.remove()
    return
  }
  if (!footer) {
    footer = doc.createElement('div')
    footer.id = 'fikr-chat-letter-actions'
    card.appendChild(footer)
  }
  footer.style.cssText =
    'padding:16px 20px 20px;border-top:1px solid #e0e0e0;background:#ffffff;'
  footer.replaceChildren()

  if (props.approval === 'actions') {
    const row = doc.createElement('div')
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;'
    const approve = doc.createElement('button')
    approve.textContent = props.approveLabel
    applyButtonStyle(approve, 'approve')
    const onApprove = () => {
      if (!props.busy) emit('approve')
    }
    approve.addEventListener('click', onApprove)
    actionCleanups.push(() => approve.removeEventListener('click', onApprove))
    const reject = doc.createElement('button')
    reject.textContent = props.rejectLabel
    applyButtonStyle(reject, 'reject')
    const onReject = () => {
      if (!props.busy) emit('reject')
    }
    reject.addEventListener('click', onReject)
    actionCleanups.push(() => reject.removeEventListener('click', onReject))
    row.append(approve, reject)
    footer.append(row)
    return
  }

  const note = doc.createElement('p')
  note.style.cssText = 'margin:0;font-size:12px;font-weight:600;'
  if (props.approval === 'awaiting') {
    note.style.color = '#727784'
    note.textContent = props.awaitingLabel
  } else {
    note.style.display = 'inline-flex'
    note.style.borderRadius = '999px'
    note.style.padding = '4px 10px'
    note.textContent = props.statusLabel
    if (props.statusKind === 'rejected') {
      note.style.background = '#fee2e2'
      note.style.color = '#7f1d1d'
    } else {
      note.style.background = '#d1fae5'
      note.style.color = '#064e3b'
    }
  }
  footer.append(note)
}

function syncHeight() {
  const iframe = iframeRef.value
  if (!iframe) return
  requestAnimationFrame(() => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      mountApprovalFooter()
      const height = Math.max(doc.documentElement?.scrollHeight ?? 0, doc.body?.scrollHeight ?? 0, 160)
      iframe.style.height = `${height + 8}px`
      clearImageListeners()
      for (const img of Array.from(doc.images)) {
        if (img.complete) continue
        const onLoad = () => syncHeight()
        img.addEventListener('load', onLoad)
        imageCleanups.push(() => img.removeEventListener('load', onLoad))
      }
    } catch {
      iframe.style.height = '240px'
    }
  })
}

function onFrameLoad() {
  syncHeight()
}

watch(
  () =>
    [
      props.srcdoc,
      props.approval,
      props.approveLabel,
      props.rejectLabel,
      props.statusLabel,
      props.awaitingLabel,
      props.statusKind,
      props.busy,
    ] as const,
  () => {
    void nextTick(() => syncHeight())
  },
)

onBeforeUnmount(() => {
  clearImageListeners()
  clearActionListeners()
})
</script>
