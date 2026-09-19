/**
 * Refreshes every screenshot used by the brochure landing (ForSchoolsBrochureLanding.vue)
 * in one run. Requires the frontend + backend running locally (or point at production with
 * SCREENSHOT_BASE_URL / SCREENSHOT_API_URL).
 *
 *   npm run screenshots:brochure
 *
 * Desktop shots (1440×900 @2x, admin)         → public/landing/shots/
 * Phone shots   (390×844 @3x, native shell)   → public/landing/shots/ + public/landing/features/
 *
 * The parent fee shot depends on a student with a fee package; if the page shows an error
 * state the old file is kept (see capture-mobile-feature-shots.mjs for the mocked variant).
 * After capturing, bump the `?v=` cache key in ForSchoolsBrochureLanding.vue.
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CREDENTIALS, BASE_URL, API_URL } from './screenshot-manifest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const SHOTS = path.join(root, 'public/landing/shots')
const FEATURES = path.join(root, 'public/landing/features')

const chromeCandidates = [
  path.join(
    process.env.HOME || '',
    'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  ),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]
const executablePath = chromeCandidates.find((p) => fs.existsSync(p))

/** @type {{ role: keyof typeof CREDENTIALS, route: string, out: string, kind: 'desktop' | 'phone' }[]} */
const SHOT_LIST = [
  { role: 'admin', route: '/users', out: path.join(SHOTS, 'feature-users.png'), kind: 'desktop' },
  { role: 'admin', route: '/attendance', out: path.join(SHOTS, 'attendance.png'), kind: 'desktop' },
  { role: 'admin', route: '/messages', out: path.join(SHOTS, 'messages.png'), kind: 'desktop' },
  { role: 'admin', route: '/settings', out: path.join(SHOTS, 'feature-settings.png'), kind: 'desktop' },
  { role: 'parent', route: '/parent/attendance', out: path.join(FEATURES, 'attendance-phone.png'), kind: 'phone' },
  { role: 'parent', route: '/parent/fees', out: path.join(FEATURES, 'fees-phone.png'), kind: 'phone', guard: /إعادة المحاولة|must be assigned/i },
  { role: 'admin', route: '/reports/academic', out: path.join(FEATURES, 'reports-phone.png'), kind: 'phone' },
  { role: 'admin', route: '/settings', out: path.join(SHOTS, 'settings.png'), kind: 'phone' },
]

async function login(role) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS[role]),
  })
  const json = await res.json().catch(() => ({}))
  const data = json?.data || json
  if (!data?.access_token) throw new Error(`Login failed for ${role}: ${json?.message || res.status}`)
  return { token: data.access_token, user: data.user }
}

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {})
  await page.waitForTimeout(1200)
  await page
    .addStyleTag({
      content: `[class*="vue-devtools"], [id*="vue-devtools"], #vite-plugin-checker-error-overlay, iframe[src*="devtools"] { display: none !important; }`,
    })
    .catch(() => {})
  await page.evaluate(() => window.scrollTo(0, 0))
}

const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const sessions = {}
const loginCreds = {
  ...CREDENTIALS,
  parent: { email: 'parent.s3@fikr-demo.com', password: 'DemoPass123!' },
}
for (const role of new Set(SHOT_LIST.map((s) => s.role))) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginCreds[role]),
  })
  const json = await res.json().catch(() => ({}))
  const data = json?.data || json
  if (!data?.access_token) throw new Error(`Login failed for ${role}: ${json?.message || res.status}`)
  sessions[role] = { token: data.access_token, user: data.user }
}

for (const shot of SHOT_LIST) {
  const { token, user } = sessions[shot.role]
  const phone = shot.kind === 'phone'
  const context = await browser.newContext(
    phone
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'ar' }
      : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'ar' },
  )
  await context.addInitScript(
    ([t, u, isPhone]) => {
      localStorage.setItem('auth_token', t)
      localStorage.setItem('user_data', JSON.stringify(u))
      localStorage.setItem('language', 'ar')
      if (isPhone) localStorage.setItem('fikr_native_shell', '1')
    },
    [token, user, phone],
  )
  const page = await context.newPage()
  page.setDefaultTimeout(60000)
  await page.goto(`${BASE_URL}${shot.route}`, { waitUntil: 'domcontentloaded' })
  await settle(page)

  const url = page.url()
  const body = await page.locator('body').innerText().catch(() => '')
  if (url.includes('/login') || (shot.guard && shot.guard.test(body))) {
    console.warn(`skip ${path.relative(root, shot.out)} — ${url.includes('/login') ? 'redirected to login' : 'error state on page'}`)
    await context.close()
    continue
  }

  fs.mkdirSync(path.dirname(shot.out), { recursive: true })
  await page.screenshot({ path: shot.out, type: 'png', fullPage: false })
  console.log(`✓ ${path.relative(root, shot.out)}  (${(fs.statSync(shot.out).size / 1024).toFixed(0)} KB)`)
  await context.close()
}

await browser.close()
console.log('done — bump ?v= in ForSchoolsBrochureLanding.vue to bust the cache')
