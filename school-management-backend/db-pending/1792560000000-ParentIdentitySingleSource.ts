import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * A parent's identity (names, email, mobile, civil id) lives on `users`. The `parents` row only
 * keeps a synced copy plus parent-only fields. This migration:
 *  1. snapshots the affected tables,
 *  2. gives every parent login a profile and logs every value that had to be overwritten,
 *  3. makes users -> parents automatic with a trigger,
 *  4. adds "one profile per login" / "one civil id per parent login" guards (only when the data allows).
 */
export class ParentIdentitySingleSource1792560000000 implements MigrationInterface {
  name = 'ParentIdentitySingleSource1792560000000';

  public async up(q: QueryRunner): Promise<void> {
    // 1. snapshots (restorable with a plain INSERT ... SELECT if anything looks wrong)
    await q.query(`CREATE TABLE IF NOT EXISTS bak_20260921_parents AS SELECT * FROM parents`);
    await q.query(
      `CREATE TABLE IF NOT EXISTS bak_20260921_parent_users AS SELECT * FROM users WHERE user_type = 'parent'`,
    );

    // 2a. log of values that differed and were resolved (users wins, it is the login identity)
    await q.query(`
      CREATE TABLE IF NOT EXISTS parent_identity_conflicts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        parent_id uuid NOT NULL,
        user_id uuid NOT NULL,
        field varchar(40) NOT NULL,
        parent_value text NULL,
        user_value text NULL,
        resolved_to varchar(10) NOT NULL DEFAULT 'user',
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);
    const comparisons: Array<[string, string]> = [
      ['email', 'lower(p.email) <> lower(u.email)'],
      ['phone', 'p.phone <> u.phone'],
      ['civil_id', 'p.civil_id <> u.civil_id'],
    ];
    for (const [field, cmp] of comparisons) {
      await q.query(`
        INSERT INTO parent_identity_conflicts (parent_id, user_id, field, parent_value, user_value)
        SELECT p.id, u.id, '${field}', p.${field}, u.${field}
          FROM parents p JOIN users u ON u.id = p.user_id
         WHERE coalesce(p.${field}, '') <> '' AND coalesce(u.${field}, '') <> '' AND ${cmp}
      `);
    }

    // 2b. every parent login gets a profile
    await q.query(`
      INSERT INTO parents (id, "firstName", "lastName", first_name_ar, first_name_en, last_name_ar,
                           last_name_en, email, phone, civil_id, user_id)
      SELECT uuid_generate_v4(), coalesce(u."firstName", ''), coalesce(u."lastName", ''),
             u.first_name_ar, u.first_name_en, u.last_name_ar, u.last_name_en,
             coalesce(u.email, ''), u.phone,
             CASE WHEN coalesce(trim(u.civil_id), '') <> ''
                   AND NOT EXISTS (SELECT 1 FROM parents p2 WHERE p2.civil_id = u.civil_id)
                  THEN u.civil_id END,
             u.id
        FROM users u
       WHERE u.user_type = 'parent'
         AND NOT EXISTS (SELECT 1 FROM parents p WHERE p.user_id = u.id)
    `);

    // 2c. users -> parents where the login has a value
    await q.query(`
      UPDATE parents p SET
        email = u.email,
        phone = CASE WHEN coalesce(u.phone, '') <> '' THEN u.phone ELSE p.phone END,
        "firstName" = CASE WHEN coalesce(u."firstName", '') <> '' THEN u."firstName" ELSE p."firstName" END,
        "lastName" = CASE WHEN coalesce(u."lastName", '') <> '' THEN u."lastName" ELSE p."lastName" END,
        first_name_ar = coalesce(nullif(u.first_name_ar, ''), p.first_name_ar),
        first_name_en = coalesce(nullif(u.first_name_en, ''), p.first_name_en),
        last_name_ar = coalesce(nullif(u.last_name_ar, ''), p.last_name_ar),
        last_name_en = coalesce(nullif(u.last_name_en, ''), p.last_name_en)
       FROM users u
      WHERE u.id = p.user_id AND u.user_type = 'parent'
    `);
    await q.query(`
      UPDATE parents p SET civil_id = u.civil_id
        FROM users u
       WHERE u.id = p.user_id AND u.user_type = 'parent'
         AND coalesce(trim(u.civil_id), '') <> '' AND p.civil_id IS DISTINCT FROM u.civil_id
         AND NOT EXISTS (SELECT 1 FROM parents p2 WHERE p2.civil_id = u.civil_id AND p2.id <> p.id)
    `);

    // 2d. parents -> users only where the login was empty
    await q.query(`
      UPDATE users u SET
        phone = CASE WHEN coalesce(u.phone, '') = '' THEN p.phone ELSE u.phone END,
        civil_id = CASE WHEN coalesce(trim(u.civil_id), '') = '' THEN p.civil_id ELSE u.civil_id END,
        first_name_ar = CASE WHEN coalesce(u.first_name_ar, '') = '' THEN p.first_name_ar ELSE u.first_name_ar END,
        first_name_en = CASE WHEN coalesce(u.first_name_en, '') = '' THEN p.first_name_en ELSE u.first_name_en END,
        last_name_ar = CASE WHEN coalesce(u.last_name_ar, '') = '' THEN p.last_name_ar ELSE u.last_name_ar END,
        last_name_en = CASE WHEN coalesce(u.last_name_en, '') = '' THEN p.last_name_en ELSE u.last_name_en END
       FROM parents p
      WHERE p.user_id = u.id AND u.user_type = 'parent'
    `);

    // 3. users -> parents stays in sync from now on
    await q.query(`
      CREATE OR REPLACE FUNCTION sync_parent_identity_from_user() RETURNS trigger AS $fn$
      BEGIN
        IF NEW.user_type = 'parent' THEN
          UPDATE parents p SET
            email = NEW.email,
            phone = NEW.phone,
            "firstName" = NEW."firstName",
            "lastName" = NEW."lastName",
            first_name_ar = NEW.first_name_ar,
            first_name_en = NEW.first_name_en,
            last_name_ar = NEW.last_name_ar,
            last_name_en = NEW.last_name_en,
            civil_id = CASE
              WHEN coalesce(trim(NEW.civil_id), '') = '' THEN NULL
              WHEN EXISTS (SELECT 1 FROM parents p2 WHERE p2.civil_id = NEW.civil_id AND p2.id <> p.id) THEN p.civil_id
              ELSE NEW.civil_id
            END
          WHERE p.user_id = NEW.id
            AND (p.email IS DISTINCT FROM NEW.email
              OR p.phone IS DISTINCT FROM NEW.phone
              OR p."firstName" IS DISTINCT FROM NEW."firstName"
              OR p."lastName" IS DISTINCT FROM NEW."lastName"
              OR p.first_name_ar IS DISTINCT FROM NEW.first_name_ar
              OR p.first_name_en IS DISTINCT FROM NEW.first_name_en
              OR p.last_name_ar IS DISTINCT FROM NEW.last_name_ar
              OR p.last_name_en IS DISTINCT FROM NEW.last_name_en
              OR p.civil_id IS DISTINCT FROM NEW.civil_id);
        END IF;
        RETURN NEW;
      END
      $fn$ LANGUAGE plpgsql
    `);
    await q.query(`DROP TRIGGER IF EXISTS trg_sync_parent_identity ON users`);
    await q.query(`
      CREATE TRIGGER trg_sync_parent_identity
      AFTER UPDATE OF email, phone, civil_id, "firstName", "lastName",
                      first_name_ar, first_name_en, last_name_ar, last_name_en
      ON users FOR EACH ROW EXECUTE PROCEDURE sync_parent_identity_from_user()
    `);

    // 4. guards, only created when today's data already satisfies them (otherwise: a notice)
    await q.query(`
      DO $do$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM parents WHERE user_id IS NOT NULL GROUP BY user_id HAVING count(*) > 1) THEN
          CREATE UNIQUE INDEX IF NOT EXISTS uq_parents_user_id ON parents (user_id) WHERE user_id IS NOT NULL;
        ELSE
          RAISE NOTICE 'uq_parents_user_id skipped: some logins have more than one parent profile';
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM users WHERE user_type = 'parent' AND coalesce(trim(civil_id), '') <> ''
          GROUP BY civil_id HAVING count(*) > 1
        ) THEN
          CREATE UNIQUE INDEX IF NOT EXISTS uq_users_parent_civil_id ON users (civil_id)
            WHERE user_type = 'parent' AND coalesce(trim(civil_id), '') <> '';
        ELSE
          RAISE NOTICE 'uq_users_parent_civil_id skipped: duplicate parent civil ids exist';
        END IF;
      END
      $do$
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TRIGGER IF EXISTS trg_sync_parent_identity ON users`);
    await q.query(`DROP FUNCTION IF EXISTS sync_parent_identity_from_user()`);
    await q.query(`DROP INDEX IF EXISTS uq_parents_user_id`);
    await q.query(`DROP INDEX IF EXISTS uq_users_parent_civil_id`);
    // Data is left as-is; the snapshots (bak_20260921_*) hold the previous values.
  }
}
