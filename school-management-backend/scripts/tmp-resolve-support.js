const { Client } = require('pg')

const ids = [
  'd879a9a0-e91f-433b-83e1-a9323dce65d2',
  'ef6a61a4-9e98-43c1-a59c-e18101e7f313',
  '82f58939-6c0d-4da2-85ea-8c71e86bf4cc',
  '221d9d9c-ad20-4b0a-8c65-92dc77c20efd',
  '78fc6254-5a5d-4195-8184-4cc27360f71b',
]

async function main() {
  const url = process.env.DATABASE_PUBLIC_URL
  if (!url) throw new Error('DATABASE_PUBLIC_URL missing')
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  const res = await client.query(
    `UPDATE support_requests
     SET status = 'resolved', fixed = true, fixed_at = NOW(), updated_at = NOW()
     WHERE id = ANY($1::uuid[]) AND status IN ('open', 'in_progress')
     RETURNING id, status, fixed`,
    [ids],
  )
  console.log(JSON.stringify(res.rows))
  await client.end()
}

main().catch((err) => {
  const msg = String(err && err.message ? err.message : err)
  console.error(msg.split('postgres')[0])
  process.exit(1)
})
