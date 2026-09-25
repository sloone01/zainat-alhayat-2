<template>
  <div
    class="html-code-editor overflow-hidden rounded-b-xl border-0 bg-[#f8fafc]"
    dir="ltr"
  >
    <Codemirror
      ref="cmRef"
      :model-value="modelValue"
      :extensions="extensions"
      :disabled="disabled"
      :autofocus="false"
      :indent-with-tab="true"
      :tab-size="2"
      :style="{ height }"
      class="text-[13px] leading-relaxed"
      @update:model-value="onUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from 'codemirror'
import { html } from '@codemirror/lang-html'
import { EditorView } from '@codemirror/view'
import { html as beautifyHtml } from 'js-beautify'

const props = withDefaults(
  defineProps<{
    modelValue: string
    disabled?: boolean
    height?: string
  }>(),
  {
    disabled: false,
    height: '22rem',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const cmRef = ref<InstanceType<typeof Codemirror> | null>(null)

/** Code is always LTR / left-aligned, even inside an Arabic (RTL) page. */
const extensions = computed(() => [
  basicSetup,
  html(),
  EditorView.lineWrapping,
  EditorView.theme({
    '&': {
      fontSize: '13px',
      backgroundColor: '#f8fafc',
      direction: 'ltr',
      textAlign: 'left',
    },
    '.cm-scroller': {
      direction: 'ltr',
    },
    '.cm-content': {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      direction: 'ltr',
      textAlign: 'left',
      caretColor: '#0f766e',
      padding: '10px 0',
    },
    '.cm-gutters': {
      backgroundColor: '#f1f5f9',
      color: '#94a3b8',
      border: 'none',
      borderRight: '1px solid #e2e8f0',
      borderLeft: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#e2e8f0',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(13, 148, 136, 0.06)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(13, 148, 136, 0.18)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeft: '1.2px solid #0f766e',
      borderRight: 'none',
    },
  }),
])

function onUpdate(value: string) {
  emit('update:modelValue', value)
}

function view(): EditorView | null {
  const inst = cmRef.value as unknown as { view?: EditorView } | null
  return inst?.view ?? null
}

/** Pretty-print HTML (preserves {{placeholders}}). */
function formatDocument(): string {
  const source = view()?.state.doc.toString() ?? props.modelValue ?? ''
  const formatted = beautifyHtml(source, {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 2,
    preserve_newlines: true,
    end_with_newline: true,
    wrap_line_length: 0,
    indent_inner_html: true,
    extra_liners: [],
    unformatted: [],
    content_unformatted: ['pre', 'textarea', 'script'],
  })
  const v = view()
  if (v) {
    v.dispatch({
      changes: { from: 0, to: v.state.doc.length, insert: formatted },
    })
  }
  emit('update:modelValue', formatted)
  return formatted
}

function insertAtCursor(token: string): { next: string; caret: number } {
  const v = view()
  const current = v?.state.doc.toString() ?? props.modelValue ?? ''
  if (!v) {
    const next = current + token
    emit('update:modelValue', next)
    return { next, caret: next.length }
  }
  const { from, to } = v.state.selection.main
  const caret = from + token.length
  v.dispatch({
    changes: { from, to, insert: token },
    selection: { anchor: caret, head: caret },
    scrollIntoView: true,
  })
  v.focus()
  const next = v.state.doc.toString()
  emit('update:modelValue', next)
  return { next, caret }
}

function focus() {
  view()?.focus()
}

defineExpose({ formatDocument, insertAtCursor, focus })
</script>

<style scoped>
.html-code-editor,
.html-code-editor :deep(.cm-editor),
.html-code-editor :deep(.cm-scroller),
.html-code-editor :deep(.cm-content) {
  direction: ltr !important;
  text-align: left !important;
  unicode-bidi: isolate;
}
.html-code-editor :deep(.cm-editor) {
  height: 100%;
  outline: none;
}
.html-code-editor :deep(.cm-editor.cm-focused) {
  outline: none;
}
.html-code-editor :deep(.cm-scroller) {
  overflow: auto;
  font-family: inherit;
}
.html-code-editor :deep(.cm-gutters) {
  border-inline-end: 1px solid #e2e8f0;
  border-inline-start: none;
}
</style>
