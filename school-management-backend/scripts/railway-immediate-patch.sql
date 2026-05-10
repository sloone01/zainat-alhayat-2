-- =============================================================================
-- Immediate schema patch (PostgreSQL / Railway)
-- Safe to run more than once (idempotent where supported).
-- =============================================================================
-- 1) Optional: users.roles (TypeORM migration AddRolesColumnToUser1757691788565)
-- 2) group chat: group_chat_messages + FKs + index
-- 3) Optional: record rows in "migrations" so `npm run migration:run` won't redo them
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- users.roles (if your DB never got this column)
-- ---------------------------------------------------------------------------
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roles" text;

-- ---------------------------------------------------------------------------
-- group_chat_messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "group_chat_messages" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "group_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "body" text NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_group_chat_messages" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_group_chat_messages_group_created"
  ON "group_chat_messages" ("group_id", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FK_group_chat_messages_group'
  ) THEN
    ALTER TABLE "group_chat_messages"
      ADD CONSTRAINT "FK_group_chat_messages_group"
      FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FK_group_chat_messages_user'
  ) THEN
    ALTER TABLE "group_chat_messages"
      ADD CONSTRAINT "FK_group_chat_messages_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

COMMIT;

-- =============================================================================
-- OPTIONAL: record these in TypeORM's "migrations" table (only if it exists).
-- Prevents `npm run migration:run` from failing later on duplicate objects.
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'migrations'
  ) THEN
    INSERT INTO migrations ("timestamp", "name")
    SELECT 1757691788565, 'AddRolesColumnToUser1757691788565'
    WHERE NOT EXISTS (SELECT 1 FROM migrations WHERE name = 'AddRolesColumnToUser1757691788565');

    INSERT INTO migrations ("timestamp", "name")
    SELECT 1780100000000, 'CreateGroupChatMessages1780100000000'
    WHERE NOT EXISTS (SELECT 1 FROM migrations WHERE name = 'CreateGroupChatMessages1780100000000');
  END IF;
END $$;
