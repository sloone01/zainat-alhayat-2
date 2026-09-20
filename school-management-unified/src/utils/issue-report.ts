import { ref } from 'vue'

/**
 * "Report issue" support: keeps a small buffer of recent console errors and captures the
 * current screen + page context, then hands it to the support form via a pending draft.
 */

const MAX_ERRORS = 20
const MAX_ERROR_LENGTH = 1500
const MAX_SCREENSHOT_BYTES = 4.5 * 1024 * 1024

const recentErrors: string[] = []
let installed = false

function stringifyArg(arg: unknown): string {
  if (arg instanceof Error) return arg.stack || `${arg.name}: ${arg.message}`
  if (typeof arg === 'string') return arg
  try {
    return JSON.stringify(arg)
  } catch {
    return String(arg)
  }
}

function remember(message: string) {
  const time = new Date().toISOString().slice(11, 19)
  recentErrors.push(`[${time}] ${message}`.slice(0, MAX_ERROR_LENGTH))
  if (recentErrors.length > MAX_ERRORS) recentErrors.splice(0, recentErrors.length - MAX_ERRORS)
}

/** Call once at startup, before anything else logs. */
export function installConsoleErrorCapture() {
  if (installed || typeof window === 'undefined') return
  installed = true
  const original = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    try {
      remember(args.map(stringifyArg).join(' '))
    } catch {
      /* never break logging */
    }
    original(...args)
  }
  window.addEventListener('error', (event) => {
    if (event.error) remember(stringifyArg(event.error))
    else if (event.message) remember(event.message)
  })
  window.addEventListener('unhandledrejection', (event) => {
    remember(`Unhandled rejection: ${stringifyArg(event.reason)}`)
  })
}

export function getRecentConsoleErrors(): string[] {
  return [...recentErrors]
}

export interface IssueReportContext {
  page_url: string
  user_agent: string
  viewport: string
  language: string
  captured_at: string
  console_errors: string[]
}

export interface IssueReportDraft {
  context: IssueReportContext
  screenshot: File | null
  /** Shown on the form only; the server takes the submitter from the login token. */
  user: { name: string; email: string | null } | null
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

/** Screenshot of what is currently on screen, as a JPEG under the 5 MB upload limit. */
async function captureScreenshot(): Promise<File | null> {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(document.body, {
    x: window.scrollX,
    y: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
    scale: Math.min(window.devicePixelRatio || 1, 1.5),
    useCORS: true,
    logging: false,
    ignoreElements: (el) => el instanceof HTMLElement && el.dataset.issueReportIgnore !== undefined,
  })
  for (const quality of [0.85, 0.6, 0.4]) {
    const blob = await canvasToBlob(canvas, quality)
    if (blob && blob.size <= MAX_SCREENSHOT_BYTES) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      return new File([blob], `screenshot-${stamp}.jpg`, { type: 'image/jpeg' })
    }
  }
  return null
}

export async function captureIssueReport(user: IssueReportDraft['user']): Promise<IssueReportDraft> {
  const context: IssueReportContext = {
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio || 1}x`,
    language: document.documentElement.lang || navigator.language,
    captured_at: new Date().toISOString(),
    console_errors: getRecentConsoleErrors(),
  }
  let screenshot: File | null = null
  try {
    screenshot = await captureScreenshot()
  } catch (err) {
    // Still open the form with the text context if the screenshot fails.
    console.warn('Issue report screenshot failed', err)
  }
  return { context, screenshot, user }
}

/** Draft waiting for the support page to pick up. */
const pendingDraft = ref<IssueReportDraft | null>(null)

export function setPendingIssueReport(draft: IssueReportDraft) {
  pendingDraft.value = draft
}

export function takePendingIssueReport(): IssueReportDraft | null {
  const draft = pendingDraft.value
  pendingDraft.value = null
  return draft
}

export const hasPendingIssueReport = pendingDraft
