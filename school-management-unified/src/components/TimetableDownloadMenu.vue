<template>
  <div ref="root" class="relative">
    <button
      ref="trigger"
      type="button"
      class="fk-tt-icon border border-gray-200 bg-white text-navy-800 shadow-sm"
      :aria-label="label"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="toggle"
    >
      <IconDownload />
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="menu"
        role="menu"
        class="fixed z-50 w-40 rounded-xl border border-fikr-hairline bg-white py-1 text-start shadow-product"
        :style="menuStyle"
      >
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist"
          @click="choose('word')"
        >
          <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-fikr-mist text-[10px] font-bold text-navy-800">W</span>
          {{ wordLabel }}
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist"
          @click="choose('pdf')"
        >
          <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-navy-800 text-[10px] font-bold text-white">PDF</span>
          {{ pdfLabel }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import IconDownload from '@/components/icons/IconDownload.vue'

defineProps<{
  label: string
  wordLabel: string
  pdfLabel: string
}>()

const emit = defineEmits<{ download: [format: 'pdf' | 'word'] }>()

const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const open = ref(false)
const menuStyle = ref<Record<string, string>>({})

function place() {
  const button = trigger.value
  if (!button) return
  const rect = button.getBoundingClientRect()
  const rtl = root.value?.closest('[dir]')?.getAttribute('dir') === 'rtl'
  const width = 160
  const left = rtl ? rect.left : Math.max(8, rect.right - width)
  menuStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${left}px`,
  }
}

function onDocClick(event: Event) {
  if (!open.value) return
  const target = event.target as Node
  if (root.value?.contains(target) || menu.value?.contains(target)) return
  open.value = false
}

function onReflow() {
  if (open.value) place()
}

function toggle() {
  if (open.value) {
    open.value = false
    return
  }
  place()
  open.value = true
}

function choose(format: 'pdf' | 'word') {
  open.value = false
  emit('download', format)
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('resize', onReflow)
  window.addEventListener('scroll', onReflow, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('resize', onReflow)
  window.removeEventListener('scroll', onReflow, true)
})
</script>
