import mammoth from 'mammoth'
import DOMPurify from 'dompurify'

const DOCX_MIME = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

export function isDocxFile(file: File): boolean {
  const name = file.name.toLowerCase()
  if (name.endsWith('.docx')) return true
  // Legacy .doc is not supported by mammoth
  if (name.endsWith('.doc')) return false
  return DOCX_MIME.includes(file.type)
}

/**
 * Convert a .docx file to a sanitized HTML fragment (no full document wrapper).
 */
export async function docxFileToHtmlFragment(file: File): Promise<{ html: string; messages: string[] }> {
  if (!isDocxFile(file)) {
    throw new Error('DOCX_ONLY')
  }
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.imgElement((image) =>
        image.read('base64').then((imageBuffer) => ({
          src: `data:${image.contentType};base64,${imageBuffer}`,
        })),
      ),
    },
  )
  const html = DOMPurify.sanitize(result.value || '', {
    ADD_ATTR: ['style', 'target', 'width', 'height', 'align', 'border', 'cellpadding', 'cellspacing'],
    ALLOW_DATA_ATTR: false,
  }).trim()
  const messages = (result.messages || [])
    .filter((m) => m.type === 'warning' || m.type === 'error')
    .map((m) => m.message)
  return { html, messages }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Wrap a Word-derived HTML fragment as an email layout shell with {{content}}.
 * If the fragment already contains {{content}}, it is left as-is (still wrapped).
 */
export function wrapDocxHtmlAsLayout(fragment: string, locale: 'en' | 'ar'): string {
  const isAr = locale === 'ar'
  const lang = isAr ? 'ar' : 'en'
  const dir = isAr ? ' dir="rtl"' : ''
  const inner = (fragment || '').trim() || '<p></p>'
  const hasContent = /\{\{\s*content\s*\}\}/i.test(inner)
  const body = hasContent
    ? inner
    : `${inner}
    <div class="nt-email-body" style="padding:16px 20px;font-size:15px;line-height:1.55;color:#111827;border-top:1px solid #e5e7eb;">
      {{content}}
    </div>`

  const shell =
    'margin:0;padding:12px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Tahoma,sans-serif;color:#111827;'
  const card =
    'max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);'

  return `<!DOCTYPE html>
<html lang="${lang}"${dir}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(isAr ? 'تصميم من Word' : 'Word layout')}</title>
</head>
<body style="${shell}">
  <div class="nt-email-card" style="${card}">
    ${body}
  </div>
</body>
</html>`
}

export async function docxFileToLayoutHtml(
  file: File,
  locale: 'en' | 'ar' = 'en',
): Promise<{ html: string; messages: string[] }> {
  const { html: fragment, messages } = await docxFileToHtmlFragment(file)
  return { html: wrapDocxHtmlAsLayout(fragment, locale), messages }
}
