import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const BASE = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5173'
const API = process.env.SCREENSHOT_API_URL || 'http://localhost:3002/api'
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

const loginRes = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const loginJson = await loginRes.json()
const token = loginJson?.data?.access_token
const user = loginJson?.data?.user
if (!token) {
  console.error('Login failed', loginJson)
  process.exit(1)
}

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'ar',
})

await context.addInitScript(
  ([accessToken, storedUser]) => {
    localStorage.setItem('auth_token', accessToken)
    localStorage.setItem('user_data', JSON.stringify(storedUser))
  },
  [token, user],
)

const page = await context.newPage()
page.setDefaultTimeout(60000)
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

// Hide overlays
await page.addStyleTag({
  content: `
    [class*="vue-devtools"], [id*="vue-devtools"],
    #vite-plugin-checker-error-overlay { display: none !important; }
  `,
}).catch(() => {})

const url = page.url()
console.log('page url', url)
if (url.includes('/login')) {
  console.error('Still on login — auth injection failed')
  process.exit(1)
}

const dashboardOut = path.join(outDir, 'dashboard.png')
const heroOut = path.join(outDir, 'hero-web.png')
await page.screenshot({ path: dashboardOut, type: 'png', fullPage: false })
await page.screenshot({ path: heroOut, type: 'png', fullPage: false })
await page.screenshot({
  path: path.join(root, 'design-screenshots/admin/dashboard__base.png'),
  type: 'png',
  fullPage: false,
})
console.log('dashboard', fs.statSync(dashboardOut).size, 'bytes')
await browser.close()
console.log('done')
