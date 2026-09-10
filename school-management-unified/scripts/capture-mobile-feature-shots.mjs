/**
 * Captures parent mobile feature phone frames for the platform gallery hero:
 * - attendance-phone.png
 * - fees-phone.png
 * Uses native-shell override so the bottom tab bar is visible.
 * Fees shot mocks a healthy charge sheet (no DB mutation) and refuses to save on error UI.
 */
import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5173'
const API = process.env.SCREENSHOT_API_URL || 'http://localhost:3002/api'
const outDir = path.join(root, 'public/landing/features')

const parentCandidates = [
  { email: 'parent_95064063@zinat.local', password: 'DemoPass123!' },
  { email: 'parent_95064063@zinat.local', password: 'Screenshot123!' },
  { email: 'parent.test@zinat.local', password: 'DemoPass123!' },
]

const candidates = [
  path.join(
    process.env.HOME,
    'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  ),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

const executablePath = candidates.find((p) => fs.existsSync(p))
if (!executablePath) {
  console.error('No Chrome executable found')
  process.exit(1)
}

async function loginParent() {
  for (const cred of parentCandidates) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cred),
    })
    const json = await res.json()
    const token = json?.data?.access_token
    const user = json?.data?.user
    if (token && user) {
      console.log('logged in as', cred.email)
      return { token, user }
    }
    console.warn('login failed for', cred.email, json?.message || res.status)
  }
  throw new Error('Parent login failed for all candidates')
}

const { token, user } = await loginParent()

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {})
  await page.waitForTimeout(1200)
  await page.addStyleTag({
    content: `
      [class*="vue-devtools"], [id*="vue-devtools"],
      #vite-plugin-checker-error-overlay,
      iframe[src*="devtools"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `,
  }).catch(() => {})
  await page.evaluate(() => {
    for (const sel of [
      '#__vue-devtools-container__',
      '.__vue-devtools-container__',
      '#vue-devtools-container',
      '[class*="vue-devtools"]',
      '[id*="vue-devtools"]',
    ]) {
      document.querySelectorAll(sel).forEach((el) => {
        try {
          el.remove()
        } catch {
          /* ignore */
        }
      })
    }
  }).catch(() => {})
}

const DEMO_CHILD_ID = '11111111-1111-4111-8111-111111111111'

const demoDashboard = {
  children: [
    {
      id: DEMO_CHILD_ID,
      firstName: 'صالح',
      lastName: 'المسكري',
      groupNames: 'الزهراء',
      payment_level_id: 'level-demo',
    },
  ],
  groups: [],
  schedules: [],
  weeklyPlans: [],
  progress: [],
  summary: {},
}

const demoChargeSheet = {
  id: 'demo-sheet',
  list_total: '450.500',
  discount_total: '50.000',
  due_total: '400.500',
  student: {
    id: DEMO_CHILD_ID,
    paymentLevel: { id: 'level-demo', name: 'المستوى الأول' },
  },
  discountLines: [
    {
      id: 'd1',
      discount_type_id: 'demo',
      amount: '50.000',
      discountType: { label: 'خصم أخوة' },
    },
  ],
  lines: [
    {
      id: 'l1',
      charge_label: 'الرسوم السنوية',
      due_amount: '350.500',
      paid_amount: '0',
      status: 'pending',
      payment_timing: 'upfront',
    },
    {
      id: 'l2',
      charge_label: 'النقل',
      due_amount: '50.000',
      paid_amount: '0',
      status: 'pending',
      payment_timing: 'with_installments',
    },
  ],
  installments: [
    {
      id: 'i1',
      sequence: 1,
      label: 'القسط الأول',
      due_date: '2026-10-01',
      amount_due: '200.250',
      amount_paid: '0',
      status: 'pending',
    },
    {
      id: 'i2',
      sequence: 2,
      label: 'القسط الثاني',
      due_date: '2027-01-01',
      amount_due: '200.250',
      amount_paid: '0',
      status: 'pending',
    },
  ],
}

const shots = [
  { out: 'attendance-phone.png', route: '/parent/attendance' },
  { out: 'fees-phone.png', route: '/parent/fees', mockFees: true },
]

{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'ar',
  })

  await context.addInitScript(
    ([accessToken, storedUser]) => {
      localStorage.setItem('auth_token', accessToken)
      localStorage.setItem('user_data', JSON.stringify(storedUser))
      localStorage.setItem('language', 'ar')
      localStorage.setItem('fikr_native_shell', '1')
    },
    [token, user],
  )

  const page = await context.newPage()
  page.setDefaultTimeout(60000)

  for (const shot of shots) {
    await page.unroute('**/*').catch(() => {})

    if (shot.mockFees) {
      await page.route('**/parents/dashboard/my-data**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: demoDashboard }),
        })
      })
      await page.route('**/fees/v2/students/**/charge-sheet**', async (route) => {
        if (route.request().method() !== 'GET') return route.continue()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: demoChargeSheet }),
        })
      })
      await page.route('**/fees/v2/students/**/payments**', async (route) => {
        if (route.request().method() !== 'GET') return route.continue()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        })
      })
    }

    await page.goto(`${BASE}${shot.route}`, { waitUntil: 'domcontentloaded' })
    await settle(page)
    if (page.url().includes('/login')) {
      console.error('Still on login for', shot.route)
      process.exit(1)
    }

    if (shot.mockFees) {
      // Hard fail if the grade/fee error alert is still on screen
      const errVisible = await page.locator('.fk-alert--error').isVisible().catch(() => false)
      const bodyText = await page.locator('body').innerText()
      if (
        errVisible ||
        /must be assigned to a grade|قبل.*الرسوم|إعادة المحاولة/i.test(bodyText)
      ) {
        await page.screenshot({
          path: path.join(outDir, 'fees-phone-FAILED.png'),
          type: 'png',
          fullPage: false,
        })
        console.error('Fees page still shows error UI — aborting save')
        process.exit(1)
      }
      await page.getByText('الزهراء').first().waitFor({ state: 'visible', timeout: 10000 })
      await page.getByText(/ادفع الآن|Pay now/i).first().waitFor({ state: 'visible', timeout: 10000 })
      // Keep header + summary + pay CTA + bottom nav in frame
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(400)
    }

    const navVisible = await page.locator('.mobile-bottom-nav').isVisible().catch(() => false)
    console.log(shot.out, 'bottomNav=', navVisible, 'url=', page.url())
    const out = path.join(outDir, shot.out)
    await page.screenshot({ path: out, type: 'png', fullPage: false })
    console.log(shot.out, fs.statSync(out).size, 'bytes')
  }

  await context.close()
}

await browser.close()
console.log('done')
