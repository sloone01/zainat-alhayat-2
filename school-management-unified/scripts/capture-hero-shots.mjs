import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5173'
const email = 'admin@zinatalhaykindergarten.com'
const password = 'Admin123!'
const outDir = path.join(root, 'public/landing/shots')

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

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function login(context) {
  const page = await context.newPage()
  page.setDefaultTimeout(60000)
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  await page.locator('input[type="email"], input[name="email"]').first().fill(email)
  await page.locator('input[type="password"]').first().fill(password)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL(/dashboard|mobile|home|\//, { timeout: 45000 }).catch(() => {})
  await page.waitForTimeout(1500)
  return page
}

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(1500)
  await page.addStyleTag({
    content: `
      [data-v-inspector],
      .vue-devtools,
      .vue-devtools-frame,
      .vue-devtools-container,
      #vue-devtools-container,
      #__vue-devtools-container__,
      .__vue-devtools-container__,
      [class*="vue-devtools"],
      [id*="vue-devtools"],
      [class*="VueDevTools"],
      #vite-plugin-checker-error-overlay,
      iframe[src*="devtools"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
  }).catch(() => {})
  await page.evaluate(() => {
    const kill = (el) => {
      try { el.remove() } catch { /* ignore */ }
    }
    for (const sel of [
      '#__vue-devtools-container__',
      '.__vue-devtools-container__',
      '#vue-devtools-container',
      '[class*="vue-devtools"]',
      '[id*="vue-devtools"]',
    ]) {
      document.querySelectorAll(sel).forEach(kill)
    }
    // Floating pill near bottom (devtools launcher)
    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const s = getComputedStyle(el)
      if (s.position !== 'fixed') continue
      const r = el.getBoundingClientRect()
      const nearBottom = r.bottom > innerHeight - 100 && r.top > innerHeight - 120
      const smallPill = r.width > 24 && r.width < 160 && r.height > 16 && r.height < 56
      const centered = Math.abs(r.left + r.width / 2 - innerWidth / 2) < innerWidth * 0.25
      if (nearBottom && smallPill && centered) kill(el)
    }
  }).catch(() => {})
  await page.waitForTimeout(200)
}

{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'ar',
  })
  const page = await login(context)
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' })
  await settle(page)
  const out = path.join(outDir, 'hero-web.png')
  const dashboardOut = path.join(outDir, 'dashboard.png')
  await page.screenshot({ path: out, type: 'png', fullPage: false })
  await page.screenshot({ path: dashboardOut, type: 'png', fullPage: false })
  await page.screenshot({
    path: path.join(root, 'design-screenshots/admin/dashboard__base.png'),
    type: 'png',
    fullPage: false,
  })
  console.log('hero-web', fs.statSync(out).size)
  console.log('dashboard', fs.statSync(dashboardOut).size)
  await context.close()
}

const mobileShots = [
  { out: 'hero-mobile-1.png', route: '/mobile-dashboard' },
  { out: 'hero-mobile-2.png', route: '/students' },
]

{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'ar',
  })
  const page = await login(context)
  for (const shot of mobileShots) {
    await page.goto(`${BASE}${shot.route}`, { waitUntil: 'domcontentloaded' })
    await settle(page)
    const out = path.join(outDir, shot.out)
    await page.screenshot({ path: out, type: 'png', fullPage: false })
    console.log(shot.out, fs.statSync(out).size)
  }
  await context.close()
}

await browser.close()
console.log('done')
