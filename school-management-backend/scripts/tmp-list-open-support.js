const { Client } = require('pg')

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL
if (!url) {
  console.error('NO_DATABASE_URL')
  process.exit(2)
}

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

async function main() {
  await client.connect()
  const result = await client.query(`
    SELECT id, title, status, fixed, created_at,
           left(regexp_replace(description_html, '<[^>]+>', '', 'g'), 240) AS summary,
           context->>'page_url' AS page_url
    FROM support_requests
    WHERE status NOT IN ('resolved', 'closed')
    ORDER BY created_at ASC
  `)
  console.log(JSON.stringify(result.rows, null, 2))
  console.error('COUNT', result.rowCount)
  await client.end()
}

main().catch((error) => {
  const message = String(error && error.message ? error.message : error)
  console.error('QUERY_FAILED', message.split('postgres')[0])
  process.exit(1)
})
