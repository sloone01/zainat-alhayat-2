/**
 * Split a full HTML email document into a fixed wrapper + editable inner region,
 * so a WYSIWYG editor can work on the inner HTML only while preserving layout shell.
 */
export function splitHtmlDocument(html: string): { open: string; inner: string; close: string } | null {
  const trimmed = html.trim()
  const head = trimmed.slice(0, 800).toLowerCase()
  if (!head.includes('<html') || !head.includes('<body')) return null
  const re = /^([\s\S]*?<body[^>]*>)([\s\S]*)(<\/body>\s*<\/html>[\s]*)$/i
  const m = trimmed.match(re)
  if (!m) return null
  return { open: m[1], inner: m[2], close: m[3] }
}
