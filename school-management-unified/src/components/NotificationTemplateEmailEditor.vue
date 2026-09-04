<template>
  <div
    class="notification-email-editor flex flex-col"
    :class="[
      embedded
        ? compact
          ? 'notification-email-editor--compact min-h-0 rounded-none border-0 bg-white shadow-none'
          : 'min-h-[28rem] rounded-none border-0 bg-white shadow-none'
        : 'min-h-[22rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
    ]"
    :dir="rtl ? 'rtl' : 'ltr'"
  >
    <template v-if="editor">
      <!-- Toolbar re-renders when selection changes (isActive) -->
      <div
        :key="toolbarTick"
        class="flex flex-wrap items-center border-b px-2 py-2"
        :class="[
          embedded ? 'border-slate-200/90 bg-slate-50/90' : 'border-gray-200 bg-gray-50',
          compact ? 'gap-0 px-1 py-1' : 'gap-0.5',
        ]"
        role="toolbar"
        :aria-label="$t('notificationTemplates.editorToolbarAria')"
      >
        <button
          type="button"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor.isActive('heading', { level: 1 }) }"
          :disabled="disabled"
          title="H1"
          @mousedown.prevent
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          H1
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor.isActive('heading', { level: 2 }) }"
          :disabled="disabled"
          title="H2"
          @mousedown.prevent
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor.isActive('heading', { level: 3 }) }"
          :disabled="disabled"
          title="H3"
          @mousedown.prevent
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          H3
        </button>
        <span class="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        <button
          type="button"
          class="toolbar-btn font-bold"
          :class="{ 'toolbar-btn--active': editor.isActive('bold') }"
          :disabled="disabled"
          title="Bold"
          @mousedown.prevent
          @click="editor.chain().focus().toggleBold().run()"
        >
          B
        </button>
        <button
          type="button"
          class="toolbar-btn italic"
          :class="{ 'toolbar-btn--active': editor.isActive('italic') }"
          :disabled="disabled"
          title="Italic"
          @mousedown.prevent
          @click="editor.chain().focus().toggleItalic().run()"
        >
          I
        </button>
        <button
          type="button"
          class="toolbar-btn underline"
          :class="{ 'toolbar-btn--active': editor.isActive('underline') }"
          :disabled="disabled"
          title="Underline"
          @mousedown.prevent
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          U
        </button>
        <span class="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        <button
          type="button"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor.isActive('bulletList') }"
          :disabled="disabled"
          title="Bullet list"
          @mousedown.prevent
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          •
        </button>
        <button
          type="button"
          class="toolbar-btn text-xs"
          :class="{ 'toolbar-btn--active': editor.isActive('orderedList') }"
          :disabled="disabled"
          title="Numbered list"
          @mousedown.prevent
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          1.
        </button>
        <span class="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        <button
          type="button"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': editor.isActive('link') }"
          :disabled="disabled"
          title="Link"
          @mousedown.prevent
          @click="onLinkClick"
        >
          Link
        </button>
        <span class="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        <button
          type="button"
          class="toolbar-btn text-xs"
          :class="{ 'toolbar-btn--active': editor.isActive('table') }"
          :disabled="disabled"
          title="Table"
          @mousedown.prevent
          @click="onInsertTable"
        >
          Table
        </button>

        <span class="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />

        <button
          type="button"
          class="toolbar-btn text-xs"
          :class="{ 'toolbar-btn--active': editor.isActive('textStyle', { color: currentTextColor }) }"
          :disabled="disabled"
          title="Text color"
          @mousedown.prevent
          @click="onPickTextColor"
        >
          Color
        </button>

        <button
          type="button"
          class="toolbar-btn text-xs"
          :disabled="disabled"
          title="Clear color"
          @mousedown.prevent
          @click="onClearTextColor"
        >
          ×
        </button>

        <template v-if="editor.isActive('table')">
          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Add row after"
            @mousedown.prevent
            @click="editor.chain().focus().addRowAfter().run()"
          >
            +Row
          </button>
          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Add row before"
            @mousedown.prevent
            @click="editor.chain().focus().addRowBefore().run()"
          >
            +Row↑
          </button>

          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Add column after"
            @mousedown.prevent
            @click="editor.chain().focus().addColumnAfter().run()"
          >
            +Col
          </button>

          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Add column before"
            @mousedown.prevent
            @click="editor.chain().focus().addColumnBefore().run()"
          >
            +Col←
          </button>

          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Delete row"
            @mousedown.prevent
            @click="editor.chain().focus().deleteRow().run()"
          >
            -Row
          </button>

          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Delete column"
            @mousedown.prevent
            @click="editor.chain().focus().deleteColumn().run()"
          >
            -Col
          </button>

          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Toggle header row"
            @mousedown.prevent
            @click="editor.chain().focus().toggleHeaderRow().run()"
          >
            Header
          </button>

          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Merge selected cells"
            @mousedown.prevent
            @click="editor.chain().focus().mergeCells().run()"
          >
            Merge
          </button>

          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Split selected cell"
            @mousedown.prevent
            @click="editor.chain().focus().splitCell().run()"
          >
            Split
          </button>

          <button
            type="button"
            class="toolbar-btn text-xs"
            :disabled="disabled"
            title="Delete whole table"
            @mousedown.prevent
            @click="editor.chain().focus().deleteTable().run()"
          >
            ×Table
          </button>
        </template>
        <span class="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        <button
          type="button"
          class="toolbar-btn"
          :disabled="disabled || !editor.can().undo()"
          title="Undo"
          @mousedown.prevent
          @click="editor.chain().focus().undo().run()"
        >
          ↶
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :disabled="disabled || !editor.can().redo()"
          title="Redo"
          @mousedown.prevent
          @click="editor.chain().focus().redo().run()"
        >
          ↷
        </button>
      </div>
      <div
        class="bg-white"
        :class="embedded ? 'rounded-none' : 'min-h-0 flex-1 overflow-y-auto'"
      >
        <EditorContent :editor="editor" class="notification-email-editor__content" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    modelValue: string
    disabled?: boolean
    remountKey?: string | number
    rtl?: boolean
    /** Strip outer chrome when nested in the template email layout. */
    embedded?: boolean
    /** Editor sits inside `.nt-email-body` padding — reduce duplicate horizontal padding. */
    inCardBody?: boolean
    /** Shorter editor + toolbar (use with `embedded` in nested panels). */
    compact?: boolean
  }>(),
  { disabled: false, remountKey: '', rtl: false, embedded: false, inCardBody: false, compact: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

/** Bumps so toolbar `isActive` states stay in sync with Vue's render cycle */
const toolbarTick = ref(0)
let emitGuard = false

const editorContentClass =
  'tiptap ProseMirror max-w-none min-h-[14rem] text-[0.9375rem] leading-relaxed text-gray-900 focus:outline-none'

function editorPaddingClass(): string {
  if (props.inCardBody) return `${editorContentClass} px-0 py-1`
  return `${editorContentClass} px-4 py-3`
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      gapcursor: true,
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline underline-offset-2',
        },
      },
    }),
    TextStyle.configure({
      types: ['heading', 'paragraph'],
    }),
    Color.configure({ types: ['heading', 'paragraph'] }),
    TableKit.configure({
      table: {
        resizable: false,
        HTMLAttributes: { class: 'nt-editor-table' },
      },
    }),
  ],
  content: normalizeContent(props.modelValue),
  editable: !props.disabled,
  editorProps: {
    attributes: {
      class: editorPaddingClass(),
      dir: props.rtl ? 'rtl' : 'ltr',
      spellcheck: 'false',
    },
  },
  onUpdate({ editor: ed }) {
    emitGuard = true
    emit('update:modelValue', ed.getHTML())
    queueMicrotask(() => {
      emitGuard = false
    })
  },
  onTransaction() {
    toolbarTick.value++
  },
})

function normalizeContent(html: string | undefined): string {
  const h = (html ?? '').trim()
  return h.length ? h : '<p></p>'
}

function onInsertTable() {
  editor.value
    ?.chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run()
}

function onPickTextColor() {
  const ed = editor.value
  if (!ed) return
  const activeColor = ed.getAttributes('textStyle')?.color as string | undefined
  const hex = window.prompt('Text color (hex), e.g. #111827', activeColor ?? '#111827')
  if (!hex) return
  const normalized = hex.trim()
  if (!normalized) return
  ed.chain().focus().setColor(normalized).run()
}

function onClearTextColor() {
  editor.value?.chain().focus().unsetColor().run()
}

const currentTextColor = computed(() => {
  const ed = editor.value
  if (!ed) return undefined
  return (ed.getAttributes('textStyle')?.color as string | undefined) ?? undefined
})

function onLinkClick() {
  const ed = editor.value
  if (!ed) return
  const prev = ed.getAttributes('link').href as string | undefined
  const url = window.prompt(t('notificationTemplates.linkPrompt'), prev || 'https://')
  if (url === null) return
  if (url.trim() === '') {
    ed.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  ed.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
}

watch(
  () => props.modelValue,
  (html) => {
    if (emitGuard) return
    const ed = editor.value
    if (!ed || ed.isDestroyed) return
    const next = normalizeContent(html)
    const cur = ed.getHTML()
    if (next === cur) return
    ed.commands.setContent(next, false)
  },
)

watch(
  () => props.remountKey,
  () => {
    const ed = editor.value
    if (!ed || ed.isDestroyed) return
    ed.commands.setContent(normalizeContent(props.modelValue), false)
  },
)

watch(
  () => props.disabled,
  (d) => {
    editor.value?.setEditable(!d)
  },
)

watch(
  () => [props.rtl, props.inCardBody, props.compact] as const,
  ([rtl]) => {
    const ed = editor.value
    if (!ed || ed.isDestroyed) return
    ed.setOptions({
      editorProps: {
        attributes: {
          class: editorPaddingClass(),
          dir: rtl ? 'rtl' : 'ltr',
          spellcheck: 'false',
        },
      },
    })
  },
)

function insertPlaceholder(token: string) {
  editor.value?.chain().focus().insertContent(token).run()
}

function getModelHtml(): string {
  return editor.value?.getHTML() ?? ''
}

defineExpose({ insertPlaceholder, getModelHtml })
</script>

<style scoped>
.toolbar-btn {
  @apply rounded-md px-2 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200/80 disabled:cursor-not-allowed disabled:opacity-40;
}
.toolbar-btn--active {
  @apply bg-white text-primary-700 shadow-sm ring-1 ring-primary-200;
}

/* ProseMirror root (EditorContent wraps .tiptap) */
.notification-email-editor :deep(.tiptap) {
  min-height: 14rem;
  outline: none;
}

.notification-email-editor--compact :deep(.tiptap) {
  min-height: 7rem;
}

.notification-email-editor--compact .notification-email-editor__content {
  max-height: 12rem;
  overflow-y: auto;
}

.notification-email-editor--compact .toolbar-btn {
  @apply px-1.5 py-0.5 text-[10px];
}

.notification-email-editor :deep(.tiptap p) {
  margin: 0.4em 0;
}

.notification-email-editor :deep(.tiptap h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5em 0 0.35em;
  line-height: 1.25;
}

.notification-email-editor :deep(.tiptap h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.5em 0 0.35em;
  line-height: 1.3;
}

.notification-email-editor :deep(.tiptap h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.45em 0 0.3em;
  line-height: 1.35;
}

.notification-email-editor :deep(.tiptap ul),
.notification-email-editor :deep(.tiptap ol) {
  margin: 0.35em 0;
  padding-inline-start: 1.35rem;
}

.notification-email-editor :deep(.tiptap a) {
  cursor: pointer;
}

.notification-email-editor :deep(.tiptap table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5em 0;
}

.notification-email-editor :deep(.tiptap th),
.notification-email-editor :deep(.tiptap td) {
  border: 1px solid #e5e7eb;
  padding: 0.45rem 0.6rem;
  vertical-align: top;
}

.notification-email-editor :deep(.tiptap th) {
  background: #f9fafb;
  font-weight: 600;
}
</style>
