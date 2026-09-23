/* Dry run of the parked identity/legacy-column migrations. Always rolls back. See README.md. */
require('dotenv').config();
const { Client } = require('pg');
const M1 = require('../_mig_tmp/db-pending/1792560000000-ParentIdentitySingleSource.js');
const M2 = require('../_mig_tmp/db-pending/1792570000000-DropLegacyDuplicateColumns.js');

(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  await c.connect();
  const qr = { query: (sql, p) => c.query(sql, p).then((r) => r.rows) };
  const one = async (label, sql) => console.log(label + ':', JSON.stringify((await c.query(sql)).rows[0]));
  await c.query('BEGIN');
  try {
    await one('BEFORE', "select (select count(*) from parents) parents, (select count(*) from users where user_type='parent') parent_users");
    await new (Object.values(M1)[0])().up(qr);
    await new (Object.values(M2)[0])().up(qr);
    await one('AFTER ', "select (select count(*) from parents) parents, (select count(*) from users where user_type='parent') parent_users");
    await one('parent logins without profile', "select count(*) n from users u where user_type='parent' and not exists (select 1 from parents p where p.user_id=u.id)");
    await one('linked mismatches left', "select count(*) n from parents p join users u on u.id=p.user_id where lower(coalesce(p.email,''))<>lower(coalesce(u.email,'')) or coalesce(p.phone,'')<>coalesce(u.phone,'')");
    await one('conflicts logged', "select count(*) n, string_agg(distinct field, ',') fields from parent_identity_conflicts");
    await one('unique indexes', "select string_agg(indexname, ',') i from pg_indexes where indexname in ('uq_parents_user_id','uq_users_parent_civil_id')");
    await one('dropped columns still present', "select count(*) n from information_schema.columns where (table_name='students' and column_name in ('first_name','family_name','date_of_birth','medical_conditions','allergies','emergency_contact')) or (table_name='parents' and column_name='school_id')");
    await one('backup rows', "select (select count(*) from bak_20260921_parents) parents, (select count(*) from bak_20260921_students) students, (select count(*) from bak_20260921_parent_users) parent_users");
    const u = (await c.query("select u.id from users u join parents p on p.user_id=u.id where u.user_type='parent' limit 1")).rows[0];
    await c.query("update users set phone='99999999' where id=$1", [u.id]);
    await one('trigger: parent phone follows login', "select p.phone from parents p where p.user_id='" + u.id + "'");
  } catch (e) {
    console.error('FAILED:', e.message);
    process.exitCode = 1;
  } finally {
    await c.query('ROLLBACK');
    console.log('ROLLED BACK - nothing was changed');
    await c.end();
  }
})();
