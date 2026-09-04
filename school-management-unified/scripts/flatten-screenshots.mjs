#!/usr/bin/env node
/**
 * Flattens nested design-screenshots role subfolders into flat role folders.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'design-screenshots')
const ROLES = ['public', 'admin', 'teacher', 'parent']

async function walkPngs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walkPngs(full)))
    else if (entry.name.endsWith('.png')) files.push(full)
  }
  return files
}

async function removeEmptyDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const full = path.join(dir, entry.name)
    await removeEmptyDirs(full)
    const left = await fs.readdir(full)
    if (left.length === 0) await fs.rm(full, { recursive: true })
  }
}

async function generateIndex(items) {
  const byRole = {}
  for (const item of items) {
    byRole[item.role] ??= []
    byRole[item.role].push(item)
  }

  const roleSections = ROLES.filter((r) => byRole[r]?.length)
    .map((role) => {
      const cards = byRole[role]
        .sort((a, b) => a.file.localeCompare(b.file))
        .map(
          (item) => `
        <a class="card" href="${item.file}">
          <img src="${item.file}" alt="${item.file}" loading="lazy" />
          <div class="meta">
            <strong>${item.file.split('/').pop()}</strong>
            <code>${item.path}</code>
            <span>${item.label}</span>
          </div>
        </a>`,
        )
        .join('')
      return `<section><h2>${role} <span class="count">${byRole[role].length}</span></h2><div class="grid">${cards}</div></section>`
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
    .meta span { font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <h1>Zinat Al-Haya Kindergarten — UI Screenshot Catalog</h1>
  <p class="sub">Flattened layout · ${items.length} screenshots · admin / teacher / parent / public</p>
  ${roleSections}
</body>
</html>`

  await fs.writeFile(path.join(OUT, 'index.html'), html, 'utf8')
}

async function main() {
  let manifest = { items: [] }
  try {
    manifest = JSON.parse(await fs.readFile(path.join(OUT, 'manifest.json'), 'utf8'))
  } catch {
    /* fresh flatten */
  }

  const manifestByOldPath = new Map(manifest.items.map((i) => [i.file, i]))
  const newItems = []

  for (const role of ROLES) {
    const roleDir = path.join(OUT, role)
    try {
      await fs.access(roleDir)
    } catch {
      continue
    }

    const pngs = await walkPngs(roleDir)
    for (const src of pngs) {
      const base = path.basename(src)
      const dest = path.join(roleDir, base)
      if (src !== dest) {
        await fs.rename(src, dest)
        console.log(`  ${path.relative(OUT, src)} → ${role}/${base}`)
      }
      const oldRel = path.relative(OUT, src).replace(/\\/g, '/')
      const newRel = `${role}/${base}`
      const meta = manifestByOldPath.get(oldRel)
      newItems.push(
        meta
          ? { ...meta, file: newRel }
          : {
              role,
              slug: base.replace(/__.*\.png$/, ''),
              variant: base.includes('__') ? base.split('__').slice(1).join('__').replace('.png', '') : 'base',
              label: base.replace('.png', '').replace(/__/g, ' — '),
              file: newRel,
              path: '',
            },
      )
    }

    await removeEmptyDirs(roleDir)
  }

  await fs.writeFile(
    path.join(OUT, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), count: newItems.length, items: newItems }, null, 2),
    'utf8',
  )
  await generateIndex(newItems)
  console.log(`\n✅ Flattened ${newItems.length} screenshots into ${ROLES.join(', ')}/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
