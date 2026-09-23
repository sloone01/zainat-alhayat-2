/**
 * Regression test for getSocketBaseUrl() (school-management-unified/src/config/public-config.ts).
 *
 * The SPA container now proxies /api and /socket.io to the backend and advertises
 * API_BASE_URL "/api" (same-origin, no CORS preflight). Stripping the "/api" suffix
 * then leaves "", and socket.io-client's own URL parser turns io("") into the
 * host-less "https://:443", so chat would never connect. The prod-web branch must
 * fall back to the page origin whenever the API base is relative.
 *
 * Run: node test-socket-base-url.js
 */
const path = require('path')
const fs = require('fs')

const UNIFIED = path.join(__dirname, 'school-management-unified')
const SRC = path.join(UNIFIED, 'src', 'config', 'public-config.ts')
const URL_MOD = path.join(UNIFIED, 'node_modules', 'socket.io-client', 'build', 'cjs', 'url.js')

// Mirrors the prod-web branch of getSocketBaseUrl().
const isRelativeApiBase = (u) => !/^[a-z][a-z0-9+.-]*:\/\//i.test(u)
function socketBase(apiBase, origin) {
  if (isRelativeApiBase(apiBase)) return origin
  return apiBase.replace(/\/api\/?$/, '')
}

const ORIGIN = 'https://www.fikr.om'
const LOC = { protocol: 'https:', host: 'www.fikr.om', port: '' }
const CASES = [
  ['/api', ORIGIN], // same-origin nginx proxy
  ['/api/', ORIGIN],
  ['https://api.up.railway.app/api', 'https://api.up.railway.app'], // cross-origin, unchanged
  ['http://127.0.0.1:3002/api', 'http://127.0.0.1:3002'],
]

let failed = 0
const fail = (msg) => {
  failed++
  console.log(`FAIL ${msg}`)
}

// 1) The source really has the relative-base guard (catches a revert).
const src = fs.readFileSync(SRC, 'utf8')
if (!/isRelativeApiBase\(base\)/.test(src)) {
  fail('public-config.ts: getSocketBaseUrl() no longer guards against a relative API base')
} else {
  console.log('PASS public-config.ts guards against a relative API base')
}

// 2) Every base resolves to a host socket.io-client can actually dial.
const { url } = require(URL_MOD)
for (const [apiBase, expected] of CASES) {
  const got = socketBase(apiBase, ORIGIN)
  const parsed = url(got, '/socket.io', LOC)
  if (got !== expected) fail(`api="${apiBase}" -> "${got}" (expected "${expected}")`)
  else if (!parsed.host) fail(`api="${apiBase}" -> socket href ${parsed.href} has no host`)
  else console.log(`PASS api="${apiBase}" -> ${parsed.href}`)
}

// 3) The old behaviour is what it claims to be, so the test stays meaningful.
const old = url('/api'.replace(/\/api\/?$/, ''), '/socket.io', LOC)
if (old.host) fail('expected the pre-fix base "" to produce a host-less socket URL')
else console.log(`PASS pre-fix base "" would have dialled ${old.href} (no host)`)

console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed')
process.exit(failed ? 1 : 0)
