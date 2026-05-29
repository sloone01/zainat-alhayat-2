/**
 * Split `<body>` inner HTML so only the letter content is edited in visual mode.
 * Prefers `.nt-email-body`; falls back to legacy payment-receipt table layout.
 */
const SPLIT_MARKER = '\u2060_NT_BODY_SPLIT_\u2060'

export function splitNotificationBodyEditableRegion(innerHtml: string): {
  prefix: string
  middle: string
  suffix: string
  kind: 'div' | 'table'
} | null {
  const raw = innerHtml.trim()
  if (!raw) return null

  const doc = new DOMParser().parseFromString(`<div id="__nt_parse_root">${raw}</div>`, 'text/html')
  const root = doc.getElementById('__nt_parse_root')
  if (!root) return null

  const bodyEl = root.querySelector('.nt-email-body')
  if (bodyEl) {
    const split = splitAtElement(root, bodyEl)
    return split ? { ...split, kind: 'div' as const } : null
  }

  const table = root.querySelector('table[role="presentation"]')
  if (!table) return null

  const tbody = table.querySelector('tbody')
  const rowEls = tbody
    ? [...tbody.children].filter((n) => n.nodeName === 'TR')
    : [...table.children].filter((n) => n.nodeName === 'TR')
  if (rowEls.length < 2) return null

  const cells = [...rowEls[1].children].filter((n) => n.nodeName === 'TD' || n.nodeName === 'TH')
  const td = cells[0] as HTMLTableCellElement | undefined
  if (!td) return null

  const split = splitAtElement(root, td)
  return split ? { ...split, kind: 'table' as const } : null
}

function splitAtElement(root: HTMLElement, el: Element): { prefix: string; middle: string; suffix: string } | null {
  const middle = el.innerHTML
  if (middle.includes(SPLIT_MARKER)) return null

  el.innerHTML = SPLIT_MARKER
  const marked = root.innerHTML
  const parts = marked.split(SPLIT_MARKER)
  el.innerHTML = middle

  if (parts.length !== 2) return null
  return { prefix: parts[0], middle, suffix: parts[1] }
}

/** Separate fixed card chrome from the opening `.nt-email-body` tag (for editor layout). */
export function splitPrefixBeforeEmailBody(prefix: string): { chromeHtml: string; bodyOpenTag: string } {
  const re = /<div\b[^>]*\bnt-email-body\b[^>]*>/gi
  let m: RegExpExecArray | null
  let last: RegExpExecArray | null = null
  while ((m = re.exec(prefix)) !== null) last = m
  if (!last) return { chromeHtml: prefix, bodyOpenTag: '' }
  return { chromeHtml: prefix.slice(0, last.index), bodyOpenTag: last[0] }
}

export function inlineStyleFromTag(openTag: string): string {
  const m = openTag.match(/\bstyle="([^"]*)"/i)
  return m?.[1]?.trim() ?? ''
}
