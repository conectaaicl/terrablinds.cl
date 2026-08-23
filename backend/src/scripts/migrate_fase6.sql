-- TerraBlinds Growth Engine — Fase 6 Migrations
-- Applies: opportunity_follow_ups, ge_outbox, booking payment_failed ENUM value
-- Safe to execute: all CREATE TABLE use IF NOT EXISTS; ENUM ALTER uses IF NOT EXISTS.
--
-- Usage:
--   docker exec -i terrablinds_db psql -U terrablinds -d terrablinds_db \
--     < src/scripts/migrate_fase6.sql
--
-- PREREQUISITE: migrate_growth_engine.sql must already have been applied.
-- ROLLBACK: See migration JS files for strategy. Application rollback is preferred.

BEGIN;

-- ─── 1. opportunity_follow_ups ────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE "enum_opportunity_follow_ups_type" AS ENUM (
        'call', 'email', 'visit', 'message', 'other'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_opportunity_follow_ups_status" AS ENUM (
        'pending', 'done', 'cancelled', 'missed'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_opportunity_follow_ups_priority" AS ENUM (
        'low', 'medium', 'high'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS opportunity_follow_ups (
    id             SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    scheduled_at   TIMESTAMPTZ NOT NULL,
    type           "enum_opportunity_follow_ups_type"     NOT NULL DEFAULT 'call',
    status         "enum_opportunity_follow_ups_status"   NOT NULL DEFAULT 'pending',
    priority       "enum_opportunity_follow_ups_priority" NOT NULL DEFAULT 'medium',
    next_action    TEXT,
    responsible    VARCHAR(200),
    note           TEXT,
    completed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_opportunity_id
    ON opportunity_follow_ups(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_follow_ups_status_scheduled
    ON opportunity_follow_ups(status, scheduled_at);

-- ─── 2. ge_outbox ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ge_outbox (
    id           SERIAL PRIMARY KEY,
    type         VARCHAR(80)  NOT NULL,
    payload      JSONB        NOT NULL,
    attempts     INTEGER      NOT NULL DEFAULT 0,
    processed_at TIMESTAMPTZ,
    last_error   TEXT,
    locked_until TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ge_outbox_pending
    ON ge_outbox(processed_at, attempts, locked_until);

-- ─── 3. booking payment_failed ENUM value ─────────────────────────────────────
-- Non-blocking in PostgreSQL: ADD VALUE does not rewrite rows.
-- ROLLBACK: application rollback preferred; see migration JS DOWN comment.

ALTER TYPE "enum_bookings_status" ADD VALUE IF NOT EXISTS 'payment_failed';

COMMIT;

-- ─── Verification queries (run after commit to inspect) ───────────────────────
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema='public' AND table_name IN ('opportunity_follow_ups','ge_outbox');
--
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'opportunity_follow_ups'
--   ORDER BY ordinal_position;
--
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'ge_outbox'
--   ORDER BY ordinal_position;
--
-- SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
--   WHERE t.typname = 'enum_bookings_status';
--
-- SELECT indexname FROM pg_indexes
--   WHERE tablename IN ('opportunity_follow_ups','ge_outbox');
