import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Convert remaining integer PKs/FKs to UUID.
 *
 * Scope:
 * - schools.id + every school_id / schoolId column
 * - parents, staff, rooms (+ room_id / parent_id FKs)
 * - attendances, student_progress, session_media, reminders
 * - school_landing_pages, activity_logs, error_tickets
 * - platform billing int graph (plans, modules, addons, subscriptions, invoices, …)
 *
 * Left as int (seed catalogs / tooling): rbac_pages, rbac_actions, migrations,
 * legacy activities_* backup table.
 */
export class ConvertRemainingIntIdsToUuid1790700000000 implements MigrationInterface {
  name = 'ConvertRemainingIntIdsToUuid1790700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // PG13+ provides gen_random_uuid() without needing CREATE EXTENSION (school_admin may lack that privilege).
    // uuid-ossp is already present on this database for older migrations.

    // ------------------------------------------------------------------
    // 1) Schools: add UUID, remap all tenant FKs, swap PK
    // ------------------------------------------------------------------
    await queryRunner.query(`
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS id_uuid uuid;
      UPDATE schools SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;
      ALTER TABLE schools ALTER COLUMN id_uuid SET NOT NULL;
      ALTER TABLE schools ALTER COLUMN id_uuid SET DEFAULT gen_random_uuid();
      CREATE UNIQUE INDEX IF NOT EXISTS uq_schools_id_uuid ON schools (id_uuid);
    `);

    await queryRunner.query(`
      DO $migrate$
      DECLARE
        r RECORD;
        fk RECORD;
        new_col text;
        nullable boolean;
        fk_name text;
      BEGIN
        FOR r IN
          SELECT c.table_name::text AS table_name, c.column_name::text AS column_name, c.is_nullable = 'YES' AS is_nullable
          FROM information_schema.columns c
          WHERE c.table_schema = 'public'
            AND c.column_name IN ('school_id', 'schoolId')
            AND c.data_type = 'integer'
            AND c.table_name <> 'schools'
        LOOP
          new_col := r.column_name || '_uuid';

          FOR fk IN
            SELECT con.conname::text AS conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
            WHERE con.contype = 'f'
              AND nsp.nspname = 'public'
              AND rel.relname = r.table_name
              AND att.attname = r.column_name
          LOOP
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.table_name, fk.conname);
          END LOOP;

          EXECUTE format('ALTER TABLE %I ADD COLUMN %I uuid', r.table_name, new_col);
          EXECUTE format(
            'UPDATE %I t SET %I = s.id_uuid FROM schools s WHERE t.%I IS NOT NULL AND t.%I = s.id',
            r.table_name, new_col, r.column_name, r.column_name
          );

          IF NOT r.is_nullable THEN
            EXECUTE format(
              'UPDATE %I SET %I = (SELECT id_uuid FROM schools ORDER BY id LIMIT 1) WHERE %I IS NULL',
              r.table_name, new_col, new_col
            );
            EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', r.table_name, new_col);
          END IF;

          EXECUTE format('ALTER TABLE %I DROP COLUMN %I', r.table_name, r.column_name);
          EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', r.table_name, new_col, r.column_name);
          EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON %I (%I)',
            'idx_' || r.table_name || '_' || lower(r.column_name),
            r.table_name,
            r.column_name
          );

          fk_name := 'FK_' || r.table_name || '_' || lower(r.column_name) || '_schools';
          BEGIN
            EXECUTE format(
              'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES schools(id_uuid) ON DELETE %s',
              r.table_name,
              fk_name,
              r.column_name,
              CASE WHEN r.is_nullable THEN 'SET NULL' ELSE 'RESTRICT' END
            );
          EXCEPTION WHEN duplicate_object THEN
            NULL;
          END;
        END LOOP;
      END
      $migrate$;
    `);

    await queryRunner.query(`
      DO $pk$
      DECLARE
        pkname text;
      BEGIN
        SELECT conname INTO pkname
        FROM pg_constraint
        WHERE conrelid = 'schools'::regclass AND contype = 'p';
        IF pkname IS NOT NULL THEN
          EXECUTE format('ALTER TABLE schools DROP CONSTRAINT %I', pkname);
        END IF;
      END
      $pk$;
      ALTER TABLE schools DROP COLUMN id;
      ALTER TABLE schools RENAME COLUMN id_uuid TO id;
      ALTER TABLE schools ADD PRIMARY KEY (id);
    `);

    // ------------------------------------------------------------------
    // 2) Helper: convert a simple serial PK table (+ optional inbound FKs)
    // ------------------------------------------------------------------
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION tmp_int_pk_to_uuid(
        p_table text,
        p_pk text DEFAULT 'id'
      ) RETURNS void
      LANGUAGE plpgsql AS $fn$
      DECLARE
        fk RECORD;
        map_table text := 'tmp_uuid_map_' || p_table;
        new_pk text := p_pk || '_uuid';
        pkname text;
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = p_table AND column_name = p_pk
            AND data_type IN ('integer', 'bigint')
        ) THEN
          RETURN;
        END IF;

        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I uuid', p_table, new_pk);
        EXECUTE format(
          'UPDATE %I SET %I = gen_random_uuid() WHERE %I IS NULL',
          p_table, new_pk, new_pk
        );
        EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', p_table, new_pk);
        EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT gen_random_uuid()', p_table, new_pk);
        EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS %I ON %I (%I)', 'uq_' || p_table || '_' || new_pk, p_table, new_pk);

        EXECUTE format('DROP TABLE IF EXISTS %I', map_table);
        EXECUTE format(
          'CREATE TEMP TABLE %I AS SELECT %I AS old_id, %I AS new_id FROM %I',
          map_table, p_pk, new_pk, p_table
        );

        -- Drop outbound FKs that reference this table's int PK; remap child columns later via dedicated steps.
        FOR fk IN
          SELECT con.conname::text AS conname, rel.relname::text AS child_table
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          WHERE con.contype = 'f' AND con.confrelid = to_regclass(p_table)
        LOOP
          EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', fk.child_table, fk.conname);
        END LOOP;

        SELECT conname INTO pkname
        FROM pg_constraint
        WHERE conrelid = to_regclass(p_table) AND contype = 'p';
        IF pkname IS NOT NULL THEN
          EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', p_table, pkname);
        END IF;

        EXECUTE format('ALTER TABLE %I DROP COLUMN %I', p_table, p_pk);
        EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', p_table, new_pk, p_pk);
        EXECUTE format('ALTER TABLE %I ADD PRIMARY KEY (%I)', p_table, p_pk);
      END
      $fn$;
    `);

    // Parents (+ student_parents.parent_id)
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('parents')`);
    await queryRunner.query(`
      DO $$
      DECLARE
        pkname text;
        fk RECORD;
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'student_parents' AND column_name = 'parent_id' AND data_type = 'integer'
        ) THEN
          FOR fk IN
            SELECT con.conname::text AS conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
            WHERE con.contype = 'f' AND rel.relname = 'student_parents' AND att.attname = 'parent_id'
          LOOP
            EXECUTE format('ALTER TABLE student_parents DROP CONSTRAINT %I', fk.conname);
          END LOOP;

          SELECT conname INTO pkname
          FROM pg_constraint
          WHERE conrelid = 'student_parents'::regclass AND contype = 'p';
          IF pkname IS NOT NULL THEN
            EXECUTE format('ALTER TABLE student_parents DROP CONSTRAINT %I', pkname);
          END IF;

          ALTER TABLE student_parents ADD COLUMN parent_id_uuid uuid;
          UPDATE student_parents sp
          SET parent_id_uuid = m.new_id
          FROM tmp_uuid_map_parents m
          WHERE sp.parent_id = m.old_id;
          ALTER TABLE student_parents DROP COLUMN parent_id;
          ALTER TABLE student_parents RENAME COLUMN parent_id_uuid TO parent_id;
          ALTER TABLE student_parents ALTER COLUMN parent_id SET NOT NULL;
          ALTER TABLE student_parents
            ADD CONSTRAINT "PK_student_parents" PRIMARY KEY (student_id, parent_id);
          ALTER TABLE student_parents
            ADD CONSTRAINT "FK_student_parents_parent"
            FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE;
          CREATE INDEX IF NOT EXISTS idx_student_parents_parent_id ON student_parents (parent_id);
        END IF;
      END $$;
    `);

    // Staff (+ attendances.recorded_by, student_progress.updated_by)
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('staff')`);
    await queryRunner.query(`
      DO $$
      DECLARE
        fk RECORD;
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'attendances' AND column_name = 'recorded_by' AND data_type = 'integer'
        ) THEN
          FOR fk IN
            SELECT con.conname::text AS conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
            WHERE con.contype = 'f' AND rel.relname = 'attendances' AND att.attname = 'recorded_by'
          LOOP
            EXECUTE format('ALTER TABLE attendances DROP CONSTRAINT %I', fk.conname);
          END LOOP;
          ALTER TABLE attendances ADD COLUMN recorded_by_uuid uuid;
          UPDATE attendances a SET recorded_by_uuid = m.new_id FROM tmp_uuid_map_staff m WHERE a.recorded_by = m.old_id;
          ALTER TABLE attendances DROP COLUMN recorded_by;
          ALTER TABLE attendances RENAME COLUMN recorded_by_uuid TO recorded_by;
          ALTER TABLE attendances
            ADD CONSTRAINT "FK_attendances_recorded_by_staff"
            FOREIGN KEY (recorded_by) REFERENCES staff(id) ON DELETE SET NULL;
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'student_progress' AND column_name = 'updated_by' AND data_type = 'integer'
        ) THEN
          FOR fk IN
            SELECT con.conname::text AS conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
            WHERE con.contype = 'f' AND rel.relname = 'student_progress' AND att.attname = 'updated_by'
          LOOP
            EXECUTE format('ALTER TABLE student_progress DROP CONSTRAINT %I', fk.conname);
          END LOOP;
          ALTER TABLE student_progress ADD COLUMN updated_by_uuid uuid;
          UPDATE student_progress sp SET updated_by_uuid = m.new_id FROM tmp_uuid_map_staff m WHERE sp.updated_by = m.old_id;
          ALTER TABLE student_progress DROP COLUMN updated_by;
          ALTER TABLE student_progress RENAME COLUMN updated_by_uuid TO updated_by;
          ALTER TABLE student_progress
            ADD CONSTRAINT "FK_student_progress_updated_by_staff"
            FOREIGN KEY (updated_by) REFERENCES staff(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Rooms (+ room_id on students, groups, schedules)
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('rooms')`);
    await queryRunner.query(`
      DO $$
      DECLARE
        t text;
        fk RECORD;
      BEGIN
        FOREACH t IN ARRAY ARRAY['students', 'groups', 'schedules']
        LOOP
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = t AND column_name = 'room_id' AND data_type = 'integer'
          ) THEN
            FOR fk IN
              SELECT con.conname::text AS conname
              FROM pg_constraint con
              JOIN pg_class rel ON rel.oid = con.conrelid
              JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
              WHERE con.contype = 'f' AND rel.relname = t AND att.attname = 'room_id'
            LOOP
              EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', t, fk.conname);
            END LOOP;
            EXECUTE format('ALTER TABLE %I ADD COLUMN room_id_uuid uuid', t);
            EXECUTE format(
              'UPDATE %I x SET room_id_uuid = m.new_id FROM tmp_uuid_map_rooms m WHERE x.room_id = m.old_id',
              t
            );
            EXECUTE format('ALTER TABLE %I DROP COLUMN room_id', t);
            EXECUTE format('ALTER TABLE %I RENAME COLUMN room_id_uuid TO room_id', t);
            EXECUTE format(
              'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL',
              t,
              'FK_' || t || '_room'
            );
            EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (room_id)', 'idx_' || t || '_room_id', t);
          END IF;
        END LOOP;
      END $$;
    `);

    // Simple leftover row tables (no inbound FKs or already remapped)
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('attendances')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('student_progress')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('session_media')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('reminders')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('school_landing_pages')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('activity_logs')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('error_tickets')`);

    // ------------------------------------------------------------------
    // 3) Platform billing graph (leaf → root order for remap)
    // ------------------------------------------------------------------
    // Convert plans first, remap plan_id children before converting those children PKs.
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('platform_plans')`);
    await queryRunner.query(`
      DO $$
      DECLARE
        t text;
        fk RECORD;
      BEGIN
        FOREACH t IN ARRAY ARRAY[
          'platform_plan_prices',
          'platform_plan_features',
          'platform_plan_modules',
          'school_platform_subscriptions'
        ]
        LOOP
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = t AND column_name = 'plan_id' AND data_type = 'integer'
          ) THEN
            FOR fk IN
              SELECT con.conname::text AS conname
              FROM pg_constraint con
              JOIN pg_class rel ON rel.oid = con.conrelid
              JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
              WHERE con.contype = 'f' AND rel.relname = t AND att.attname = 'plan_id'
            LOOP
              EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', t, fk.conname);
            END LOOP;
            EXECUTE format('ALTER TABLE %I ADD COLUMN plan_id_uuid uuid', t);
            EXECUTE format(
              'UPDATE %I x SET plan_id_uuid = m.new_id FROM tmp_uuid_map_platform_plans m WHERE x.plan_id = m.old_id',
              t
            );
            EXECUTE format('ALTER TABLE %I DROP COLUMN plan_id', t);
            EXECUTE format('ALTER TABLE %I RENAME COLUMN plan_id_uuid TO plan_id', t);
            EXECUTE format('ALTER TABLE %I ALTER COLUMN plan_id SET NOT NULL', t);
            EXECUTE format(
              'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (plan_id) REFERENCES platform_plans(id) ON DELETE CASCADE',
              t,
              'FK_' || t || '_plan'
            );
          END IF;
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('platform_modules')`);
    await queryRunner.query(`
      DO $$
      DECLARE
        t text;
        fk RECORD;
      BEGIN
        FOREACH t IN ARRAY ARRAY['platform_plan_modules', 'school_modules']
        LOOP
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = t AND column_name = 'module_id' AND data_type = 'integer'
          ) THEN
            FOR fk IN
              SELECT con.conname::text AS conname
              FROM pg_constraint con
              JOIN pg_class rel ON rel.oid = con.conrelid
              JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
              WHERE con.contype = 'f' AND rel.relname = t AND att.attname = 'module_id'
            LOOP
              EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', t, fk.conname);
            END LOOP;
            EXECUTE format('ALTER TABLE %I ADD COLUMN module_id_uuid uuid', t);
            EXECUTE format(
              'UPDATE %I x SET module_id_uuid = m.new_id FROM tmp_uuid_map_platform_modules m WHERE x.module_id = m.old_id',
              t
            );
            EXECUTE format('ALTER TABLE %I DROP COLUMN module_id', t);
            EXECUTE format('ALTER TABLE %I RENAME COLUMN module_id_uuid TO module_id', t);
            EXECUTE format('ALTER TABLE %I ALTER COLUMN module_id SET NOT NULL', t);
            EXECUTE format(
              'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (module_id) REFERENCES platform_modules(id) ON DELETE CASCADE',
              t,
              'FK_' || t || '_module'
            );
          END IF;
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('platform_addons')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('platform_plan_prices')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('platform_plan_features')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('platform_plan_modules')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('school_modules')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('school_platform_subscriptions')`);

    await queryRunner.query(`
      DO $$
      DECLARE
        fk RECORD;
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'platform_invoices' AND column_name = 'subscription_id' AND data_type = 'integer'
        ) THEN
          FOR fk IN
            SELECT con.conname::text AS conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
            WHERE con.contype = 'f' AND rel.relname = 'platform_invoices' AND att.attname = 'subscription_id'
          LOOP
            EXECUTE format('ALTER TABLE platform_invoices DROP CONSTRAINT %I', fk.conname);
          END LOOP;
          ALTER TABLE platform_invoices ADD COLUMN subscription_id_uuid uuid;
          UPDATE platform_invoices x
          SET subscription_id_uuid = m.new_id
          FROM tmp_uuid_map_school_platform_subscriptions m
          WHERE x.subscription_id = m.old_id;
          ALTER TABLE platform_invoices DROP COLUMN subscription_id;
          ALTER TABLE platform_invoices RENAME COLUMN subscription_id_uuid TO subscription_id;
          ALTER TABLE platform_invoices
            ADD CONSTRAINT "FK_platform_invoices_subscription"
            FOREIGN KEY (subscription_id) REFERENCES school_platform_subscriptions(id) ON DELETE SET NULL;
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'school_platform_subscription_addons'
            AND column_name = 'subscription_id' AND data_type = 'integer'
        ) THEN
          FOR fk IN
            SELECT con.conname::text AS conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
            WHERE con.contype = 'f' AND rel.relname = 'school_platform_subscription_addons' AND att.attname = 'subscription_id'
          LOOP
            EXECUTE format('ALTER TABLE school_platform_subscription_addons DROP CONSTRAINT %I', fk.conname);
          END LOOP;
          ALTER TABLE school_platform_subscription_addons ADD COLUMN subscription_id_uuid uuid;
          UPDATE school_platform_subscription_addons x
          SET subscription_id_uuid = m.new_id
          FROM tmp_uuid_map_school_platform_subscriptions m
          WHERE x.subscription_id = m.old_id;
          ALTER TABLE school_platform_subscription_addons DROP COLUMN subscription_id;
          ALTER TABLE school_platform_subscription_addons RENAME COLUMN subscription_id_uuid TO subscription_id;
          ALTER TABLE school_platform_subscription_addons ALTER COLUMN subscription_id SET NOT NULL;
          ALTER TABLE school_platform_subscription_addons
            ADD CONSTRAINT "FK_spsa_subscription"
            FOREIGN KEY (subscription_id) REFERENCES school_platform_subscriptions(id) ON DELETE CASCADE;
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'school_platform_subscription_addons'
            AND column_name = 'addon_id' AND data_type = 'integer'
        ) THEN
          FOR fk IN
            SELECT con.conname::text AS conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
            WHERE con.contype = 'f' AND rel.relname = 'school_platform_subscription_addons' AND att.attname = 'addon_id'
          LOOP
            EXECUTE format('ALTER TABLE school_platform_subscription_addons DROP CONSTRAINT %I', fk.conname);
          END LOOP;
          ALTER TABLE school_platform_subscription_addons ADD COLUMN addon_id_uuid uuid;
          UPDATE school_platform_subscription_addons x
          SET addon_id_uuid = m.new_id
          FROM tmp_uuid_map_platform_addons m
          WHERE x.addon_id = m.old_id;
          ALTER TABLE school_platform_subscription_addons DROP COLUMN addon_id;
          ALTER TABLE school_platform_subscription_addons RENAME COLUMN addon_id_uuid TO addon_id;
          ALTER TABLE school_platform_subscription_addons ALTER COLUMN addon_id SET NOT NULL;
          ALTER TABLE school_platform_subscription_addons
            ADD CONSTRAINT "FK_spsa_addon"
            FOREIGN KEY (addon_id) REFERENCES platform_addons(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('platform_invoices')`);
    await queryRunner.query(`SELECT tmp_int_pk_to_uuid('school_platform_subscription_addons')`);

    await queryRunner.query(`DROP FUNCTION IF EXISTS tmp_int_pk_to_uuid(text, text)`);
  }

  public async down(): Promise<void> {
    // Irreversible data-shape migration (UUID ↔ serial cannot be losslessly restored).
    throw new Error('ConvertRemainingIntIdsToUuid1790700000000 cannot be reverted');
  }
}
