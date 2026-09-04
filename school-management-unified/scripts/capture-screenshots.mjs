#!/usr/bin/env node
/**
 * Captures labeled screenshots of all app pages, tabs, and modals for designer handoff.
 * Usage: npm run screenshots
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PAGES, CREDENTIALS, BASE_URL, API_URL, OUT_DIR } from './screenshot-manifest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, OUT_DIR)

/** @type {{ role: string, slug: string, variant: string, label: string, file: string, path: string }[]} */
const index = []

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'untitled'
}

async function apiLogin(role) {
  const cred = CREDENTIALS[role]
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cred),
  })
  const json = await res.json()
  if (!json.success && !json.data?.access_token) {
    throw new Error(`Login failed for ${role}: ${json.message || JSON.stringify(json)}`)
  }
  const data = json.data || json
  return { token: data.access_token, user: data.user }
}

async function fetchEntityIds(token) {
  const headers = { Authorization: `Bearer ${token}` }
  const get = async (url) => {
    try {
      const res = await fetch(url, { headers })
      if (!res.ok) return null
      const json = await res.json()
      return json.data ?? json
    } catch {
      return null
    }
  }
  const firstId = (data) => {
    if (!data) return null
    if (Array.isArray(data) && data.length) return String(data[0].id)
    if (typeof data === 'object' && data.id) return String(data.id)
    return null
  }

  const schoolId = 1
  const [courses, groups, enrollments, packages, levels, letters] = await Promise.all([
    get(`${API_URL}/courses?limit=5`),
    get(`${API_URL}/groups?limit=5`),
    get(`${API_URL}/enrollments?limit=5`),
    get(`${API_URL}/fee-packages?school_id=${schoolId}`),
    get(`${API_URL}/payment-config/levels?school_id=${schoolId}`),
    get(`${API_URL}/message-letters?school_id=${schoolId}`),
  ])

  return {
    courseId: firstId(courses),
    groupId: firstId(groups),
    enrollmentId: firstId(enrollments),
    packageId: firstId(packages),
    levelId: firstId(levels),
    letterId: firstId(letters),
  }
}

function resolvePath(template, ids) {
  return template.replace(/\{(\w+)\}/g, (_, key) => ids[key] ?? `{${key}}`)
}

async function injectAuth(page, token, user) {
  await page.goto(`${BASE_URL}/login`)
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))
      localStorage.setItem('language', 'ar')
    },
    { token, user },
  )
}

async function addLabel(page, text) {
  await page.evaluate((labelText) => {
    const existing = document.getElementById('__screenshot-label')
    if (existing) existing.remove()
    const el = document.createElement('div')
    el.id = '__screenshot-label'
    el.textContent = labelText
    el.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'right:0',
      'z-index:2147483647',
      'background:#0f766e',
      'color:#fff',
      'padding:10px 16px',
      'font:600 13px/1.4 system-ui,-apple-system,sans-serif',
      'box-shadow:0 2px 8px rgba(0,0,0,.2)',
      'pointer-events:none',
    ].join(';')
    document.body.prepend(el)
  }, text)
}

async function removeLabel(page) {
  await page.evaluate(() => document.getElementById('__screenshot-label')?.remove())
}

async function waitForPageReady(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(800)
}

async function shot(page, { role, pageSlug, variant, label, routePath }) {
  const labelText = `[${role.toUpperCase()}] ${label} — ${routePath} — ${variant}`
  await addLabel(page, labelText)
  const dir = path.join(OUTPUT, role)
  await fs.mkdir(dir, { recursive: true })
  const fileName = `${pageSlug}__${slugify(variant)}.png`
  const filePath = path.join(dir, fileName)
  await page.screenshot({ path: filePath, fullPage: true })
  await removeLabel(page)
  index.push({
    role,
    slug: pageSlug,
    variant,
    label: labelText,
    file: path.relative(OUTPUT, filePath),
    path: routePath,
  })
  console.log(`  ✓ ${role}/${fileName}`)
}

async function closeOverlay(page) {
  const closeBtn = page.getByRole('button', { name: /close|إغلاق|cancel|إلغاء/i }).first()
  if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeBtn.click().catch(() => {})
    await page.waitForTimeout(400)
    return
  }
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(300)
}

async function captureTabs(page, ctx) {
  const { role, pageSlug, label, routePath } = ctx

  // ARIA tabs
  const ariaTabs = page.locator('[role="tab"]')
  const ariaCount = await ariaTabs.count()
  for (let i = 0; i < ariaCount; i++) {
    const tab = ariaTabs.nth(i)
    if (!(await tab.isVisible().catch(() => false))) continue
    const tabName = (await tab.innerText().catch(() => `tab-${i + 1}`)).trim()
    await tab.click().catch(() => {})
    await page.waitForTimeout(600)
    await shot(page, {
      role,
      pageSlug,
      variant: `tab-${tabName}`,
      label,
      routePath,
    })
  }

  // Pill-style segment tabs (no ARIA role)
  const pillTabs = page.locator('.bg-gray-100.rounded-lg.p-1 button, .flex.space-x-1.bg-gray-100 button')
  const pillCount = await pillTabs.count()
  const seen = new Set()
  for (let i = 0; i < pillCount; i++) {
    const tab = pillTabs.nth(i)
    if (!(await tab.isVisible().catch(() => false))) continue
    const tabName = (await tab.innerText().catch(() => `pill-${i + 1}`)).trim()
    if (!tabName || seen.has(tabName)) continue
    seen.add(tabName)
    await tab.click().catch(() => {})
    await page.waitForTimeout(600)
    await shot(page, {
      role,
      pageSlug,
      variant: `segment-${tabName}`,
      label,
      routePath,
    })
  }

  // Underline nav tabs (StudentManagement parent modal style)
  const navTabs = page.locator('nav[aria-label="Tabs"] button, nav[aria-label="Tabs"] a')
  const navCount = await navTabs.count()
  for (let i = 0; i < navCount; i++) {
    const tab = navTabs.nth(i)
    if (!(await tab.isVisible().catch(() => false))) continue
    const tabName = (await tab.innerText().catch(() => `nav-${i + 1}`)).trim()
    if (!tabName || seen.has(`nav-${tabName}`)) continue
    seen.add(`nav-${tabName}`)
    await tab.click().catch(() => {})
    await page.waitForTimeout(600)
    await shot(page, {
      role,
      pageSlug,
      variant: `nav-tab-${tabName}`,
      label,
      routePath,
    })
  }
}

async function clickModalTrigger(page, patterns, opts = {}) {
  const { dropdown, looseText } = opts

  if (dropdown) {
    const dots = page.locator('button.p-2.text-gray-400.rounded-lg, button:has(svg path[d="M12 5v.01M12 12v.01M12 19v.01"])').first()
    if (await dots.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dots.click()
      await page.waitForTimeout(500)
    }
  }

  for (const pattern of patterns) {
    const looseBtn = page.locator('button').filter({ hasText: pattern }).first()
    if (await looseBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await looseBtn.click()
      await page.waitForTimeout(700)
      return true
    }
    const btn = page.getByRole('button', { name: pattern }).first()
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(700)
      return true
    }
    if (looseText) {
      const loose = page.locator('button').filter({ hasText: pattern }).first()
      if (await loose.isVisible({ timeout: 1000 }).catch(() => false)) {
        await loose.click()
        await page.waitForTimeout(700)
        return true
      }
    }
    const link = page.getByRole('link', { name: pattern }).first()
    if (await link.isVisible({ timeout: 500 }).catch(() => false)) {
      await link.click()
      await page.waitForTimeout(700)
      return true
    }
  }
  return false
}

async function captureModals(page, ctx, modals) {
  if (!modals?.length) return
  for (const modal of modals) {
    const opened = await clickModalTrigger(page, modal.patterns, {
      dropdown: modal.dropdown,
      looseText: modal.looseText,
    })
    if (!opened) {
      console.log(`  ⚠ modal not found: ${modal.id}`)
      continue
    }
    await page
      .waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 3000 })
      .catch(() => {})
    await page.waitForTimeout(500)
    await shot(page, {
      ...ctx,
      variant: `modal-${modal.id}`,
    })
    // Tabs inside modal
    await captureTabs(page, { ...ctx, pageSlug: `${ctx.pageSlug}--${modal.id}` })
    await closeOverlay(page)
  }
}

async function captureRowAction(page, ctx, action) {
  const patterns =
    action === 'row-view'
      ? [/view/i, /عرض/, /common\.view/i]
      : [/edit/i, /تعديل/]
  for (const pattern of patterns) {
    const btn = page.getByRole('button', { name: pattern }).first()
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(700)
      await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 3000 }).catch(() => {})
      await shot(page, {
        ...ctx,
        variant: `row-${action}`,
      })
      await captureTabs(page, { ...ctx, pageSlug: `${ctx.pageSlug}--row-${action}` })
      await closeOverlay(page)
      return
    }
  }
}

async function capturePage(browser, role, pageDef, ids, auth) {
  const routePath = resolvePath(pageDef.path, ids)
  if (routePath.includes('{')) {
    console.log(`  ⊘ skip ${pageDef.slug} — missing id in ${routePath}`)
    return
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ar',
  })
  const page = await context.newPage()

  try {
    if (role === 'public') {
      await page.goto(`${BASE_URL}${routePath}`)
    } else {
      await injectAuth(page, auth.token, auth.user)
      await page.goto(`${BASE_URL}${routePath}`)
    }

    await waitForPageReady(page)

    // Skip if redirected to login
    if (page.url().includes('/login') && routePath !== '/login') {
      console.log(`  ⊘ skip ${pageDef.slug} — redirected to login`)
      return
    }

    const ctx = { role, pageSlug: pageDef.slug, label: pageDef.label, routePath }

    await shot(page, { ...ctx, variant: 'base' })

    if (!pageDef.skipTabs) {
      await captureTabs(page, ctx)
    }

    await captureModals(page, ctx, pageDef.modals)
    if (pageDef.rowAction) {
      await captureRowAction(page, ctx, pageDef.rowAction)
    }
  } catch (err) {
    console.log(`  ✗ error on ${pageDef.slug}: ${err.message}`)
  } finally {
    await context.close()
  }
}

async function generateIndexHtml() {
  const byRole = {}
  for (const item of index) {
    byRole[item.role] ??= []
    byRole[item.role].push(item)
  }

  const roleSections = Object.entries(byRole)
    .map(([role, items]) => {
      const cards = items
        .map(
          (item) => `
        <a class="card" href="${item.file}">
          <img src="${item.file}" alt="${item.variant}" loading="lazy" />
          <div class="meta">
            <strong>${item.slug}</strong>
            <span>${item.variant}</span>
            <code>${item.path}</code>
          </div>
        </a>`,
        )
        .join('')
      return `<section><h2>${role} <span class="count">${items.length}</span></h2><div class="grid">${cards}</div></section>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Zinat Al-Haya — UI Screenshots</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
    h1 { margin: 0 0 8px; }
    .sub { color: #64748b; margin-bottom: 32px; }
    section { margin-bottom: 48px; }
    h2 { text-transform: capitalize; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
    .count { background: #0f766e; color: #fff; font-size: 14px; padding: 2px 10px; border-radius: 999px; margin-left: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-top: 16px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
    .card img { width: 100%; display: block; border-bottom: 1px solid #e2e8f0; }
    .meta { padding: 12px; display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
    .meta code { font-size: 11px; color: #64748b; word-break: break-all; }
  </style>
</head>
<body>
  <h1>Zinat Al-Haya Kindergarten — UI Screenshot Catalog</h1>
  <p class="sub">Generated ${new Date().toISOString()} · ${index.length} screenshots · Desktop 1440×900 · Locale AR</p>
  ${roleSections}
</body>
</html>`

  await fs.writeFile(path.join(OUTPUT, 'index.html'), html, 'utf8')

  await fs.writeFile(
    path.join(OUTPUT, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), count: index.length, items: index }, null, 2),
    'utf8',
  )
}

async function main() {
  console.log('Screenshot capture starting…')
  console.log(`  Base URL: ${BASE_URL}`)
  console.log(`  Output:   ${OUTPUT}`)

  await fs.mkdir(OUTPUT, { recursive: true })

  const adminAuth = await apiLogin('admin')
  const ids = await fetchEntityIds(adminAuth.token)
  console.log('  Entity IDs:', ids)

  const browser = await chromium.launch({ headless: true })

  const roles = ['public', 'admin', 'teacher', 'parent']
  const auths = {
    admin: adminAuth,
    teacher: await apiLogin('teacher'),
    parent: await apiLogin('parent'),
  }

  for (const role of roles) {
    const pages = PAGES.filter((p) => p.roles.includes(role))
    console.log(`\n── ${role.toUpperCase()} (${pages.length} pages) ──`)
    const auth = role === 'public' ? null : auths[role]
    for (const pageDef of pages) {
      console.log(`\n→ ${pageDef.label} (${pageDef.path})`)
      await capturePage(browser, role, pageDef, ids, auth)
    }
  }

  await browser.close()
  await generateIndexHtml()

  console.log(`\n✅ Done — ${index.length} screenshots in ${OUTPUT}`)
  console.log(`   Open: ${path.join(OUTPUT, 'index.html')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
