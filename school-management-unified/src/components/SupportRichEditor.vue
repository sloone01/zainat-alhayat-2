<template>
  <div class="support-editor overflow-hidden rounded-xl border border-gray-200 bg-white" :dir="rtl ? 'rtl' : 'ltr'">
    <template v-if="editor">
      <div
        :key="toolbarTick"
        class="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-2"
        role="toolbar"
        :aria-label="$t('support.editorToolbar')"
      >
        <button
          type="button"
          class="se-btn font-bold"
          :class="{ 'se-btn--active': editor.isActive('bold') }"
          :disabled="disabled"
          :title="$t('support.bold')"
          @mousedown.prevent
          @click="editor.chain().focus().toggleBold().run()"
        >
          B
        </button>
        <button
          type="button"
          class="se-btn italic"
          :class="{ 'se-btn--active': editor.isActive('italic') }"
          :disabled="disabled"
          :title="$t('support.italic')"
          @mousedown.prevent
          @click="editor.chain().focus().toggleItalic().run()"
        >
          I
        </button>
        <button
          type="button"
          class="se-btn underline"
          :class="{ 'se-btn--active': editor.isActive('underline') }"
          :disabled="disabled"
          :title="$t('support.underline')"
          @mousedown.prevent
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          U
        </button>
        <span class="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        <button
          type="button"
          class="se-btn"
          :class="{ 'se-btn--active': editor.isActive('heading', { level: 2 }) }"
          :disabled="disabled"
          title="H2"
          @mousedown.prevent
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </button>
        <button
          type="button"
          class="se-btn"
          :class="{ 'se-btn--active': editor.isActive('bulletList') }"
          :disabled="disabled"
          :title="$t('support.bulletList')"
          @mousedown.prevent
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          •
        </button>
        <button
          type="button"
          class="se-btn text-xs"
          :class="{ 'se-btn--active': editor.isActive('orderedList') }"
          :disabled="disabled"
          :title="$t('support.numberedList')"
          @mousedown.prevent
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          1.
        </button>
        <span class="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        <button
          type="button"
          class="se-btn text-xs"
          :disabled="disabled || uploading"
          :title="$t('support.addImage')"
          @mousedown.prevent
          @click="fileInput?.click()"
        >
          🖼 {{ uploading ? $t('support.uploadingImage') : $t('support.addImage') }}
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          class="hidden"
          @change="onFilesPicked"
        />
      </div>
      <EditorContent :editor="editor" />
      <p v-if="uploadError" class="border-t border-gray-100 px-3 py-2 text-sm text-red-600">{{ uploadError }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { useI18n } from 'vue-i18n'
import supportService from '@/services/support.service'
import { fetchAuthenticatedMediaObjectUrl } from '@/utils/authenticated-media'

const props = withDefaults(defineProps<{ disabled?: boolean; rtl?: boolean }>(), {
  disabled: false,
  rtl: false,
})
const emit = defineEmits<{ (e: 'change'): void }>()

const { t } = useI18n()
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPE = /^image\/(png|jpe?g|gif|webp)$/i

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const toolbarTick = ref(0)
const objectUrls: string[] = []

/**
 * Uploaded images live behind the authenticated /api/files route, so the editor shows an
 * object URL and keeps the real path in data-src. getStorableHtml() swaps them back.
 */
const SupportImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dataSrc: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-src'),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.dataSrc ? { 'data-src': String(attrs.dataSrc) } : {},
      },
    }
  },
})

/** TipTap `useEditor` is async — wait so auto-inserted report screenshots are not dropped. */
async function waitForEditor(timeoutMs = 4000): Promise<boolean> {
  if (editor.value) return true
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 40))
    if (editor.value) return true
  }
  return !!editor.value
}

/** Uploads and inserts images; resolves to the `/api/files/support/...` URL of each one inserted. */
async function insertImages(files: File[]): Promise<string[]> {
  const inserted: string[] = []
  const images = files.filter((f) => IMAGE_TYPE.test(f.type))
  if (!images.length) return inserted
  if (!(await waitForEditor())) return inserted
  uploadError.value = ''
  uploading.value = true
  try {
    for (const file of images) {
      if (file.size > MAX_IMAGE_BYTES) {
        uploadError.value = t('support.imageTooLarge')
        continue
      }
      const url = await supportService.uploadImage(file)
      const objectUrl = await fetchAuthenticatedMediaObjectUrl(url)
      objectUrls.push(objectUrl)
      editor.value
        ?.chain()
        .focus()
        .insertContent({ type: 'image', attrs: { src: objectUrl, alt: file.name, dataSrc: url } })
        .run()
      inserted.push(url)
    }
  } catch (err) {
    // Show what the server actually rejected (axios only says "status code 400").
    const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
    const serverMessage = Array.isArray(data?.message) ? data?.message.join(', ') : data?.message
    console.error('Support image upload failed', err)
    uploadError.value =
      serverMessage || (err instanceof Error && err.message ? err.message : t('support.imageUploadFailed'))
  } finally {
    uploading.value = false
  }
  return inserted
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: { openOnClick: false },
    }),
    SupportImage.configure({ inline: false, allowBase64: false }),
  ],
  content: '',
  editable: !props.disabled,
  editorProps: {
    attributes: {
      class: 'support-editor__content min-h-[14rem] px-4 py-3 focus:outline-none',
      dir: props.rtl ? 'rtl' : 'ltr',
    },
    handlePaste(_view, event) {
      const files = Array.from(event.clipboardData?.files ?? []).filter((f) => IMAGE_TYPE.test(f.type))
      if (!files.length) return false
      void insertImages(files)
      return true
    },
    handleDrop(_view, event) {
      const files = Array.from((event as DragEvent).dataTransfer?.files ?? []).filter((f) =>
        IMAGE_TYPE.test(f.type),
      )
      if (!files.length) return false
      event.preventDefault()
      void insertImages(files)
      return true
    },
  },
  onUpdate() {
    emit('change')
  },
  onTransaction() {
    toolbarTick.value++
  },
})

function onFilesPicked(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  void insertImages(files)
}

/** HTML to send to the API: images point at their `/api/files/support/...` path. */
function getStorableHtml(): string {
  const html = editor.value?.getHTML() ?? ''
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement
  for (const img of Array.from(root.querySelectorAll('img'))) {
    const real = img.getAttribute('data-src')
    if (real) {
      img.setAttribute('src', real)
      img.removeAttribute('data-src')
    } else {
      img.remove()
    }
  }
  return root.innerHTML
}

function isEmpty(): boolean {
  const ed = editor.value
  if (!ed) return true
  return ed.isEmpty || (!ed.getText().trim() && !ed.getHTML().includes('<img'))
}

function clear() {
  editor.value?.commands.clearContent(true)
  uploadError.value = ''
}

defineExpose({ getStorableHtml, isEmpty, clear, uploading, insertImages, waitForEditor })

onBeforeUnmount(() => {
  for (const url of objectUrls) URL.revokeObjectURL(url)
  editor.value?.destroy()
})
</script>

<style scoped>
.se-btn {
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border-radius: 0.375rem;
  color: #374151;
}
.se-btn:hover:not(:disabled) {
  background: #e5e7eb;
}
.se-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.se-btn--active {
  background: #dbeafe;
  color: #1d4ed8;
}
.support-editor :deep(.ProseMirror) {
  min-height: 14rem;
}
.support-editor :deep(.ProseMirror img) {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: min(70vh, 36rem);
  height: auto !important;
  object-fit: contain;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}
.support-editor :deep(.ProseMirror img.ProseMirror-selectednode) {
  outline: 2px solid #3b82f6;
}
.support-editor :deep(.ProseMirror ul) {
  list-style: disc;
  padding-inline-start: 1.5rem;
}
.support-editor :deep(.ProseMirror ol) {
  list-style: decimal;
  padding-inline-start: 1.5rem;
}
.support-editor :deep(.ProseMirror h2) {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
