-- TerraBlinds Growth Engine — Phase 1: New Tables
-- Run FIRST, before migrate_quotes_leads_ext.sql
-- Safe to execute multiple times (fully idempotent).
--
-- Usage:
--   docker exec -i terrablinds_db psql -U terrablinds -d terrablinds_db \
--     < src/scripts/migrate_growth_engine.sql

BEGIN;

-- ─── Opportunity status ENUM ──────────────────────────────────────────────────
-- Named after Sequelize's convention (enum_{table}_{field}) so sync() stays safe.
DO $$ BEGIN
    CREATE TYPE "enum_opportunities_status" AS ENUM (
        'new',
        'contacted',
        'qualified',
        'quoted',
        'won',
        'lost',
        'spam',
        'duplicate',
        'out_of_coverage'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── contacts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(200),
    email            VARCHAR(200),
    phone            VARCHAR(50),
    phone_normalized VARCHAR(20),   -- canonical +569XXXXXXXX
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique indexes: NULL is not considered a duplicate.
-- Two contacts can both have email=NULL; only non-NULL values must be unique.
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email_uniq
    ON contacts(email)
    WHERE email IS NOT NULL;

-- phone_normalized: regular index only — a phone can be shared (family, business, admin).
-- Deduplication by phone is a hint; the service layer decides whether to merge.
CREATE INDEX IF NOT EXISTS idx_contacts_phone_norm
    ON contacts(phone_normalized)
    WHERE phone_normalized IS NOT NULL;

-- ─── opportunities ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunities (
    id               SERIAL PRIMARY KEY,
    contact_id       INTEGER NOT NULL REFERENCES contacts(id),
    product_interest VARCHAR(200),
    status           "enum_opportunities_status" NOT NULL DEFAULT 'new',
    lost_reason      TEXT,
    notes            TEXT,
    won_amount       NUMERIC(12, 2),
    won_at           TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opp_contact    ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opp_status     ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opp_created_at ON opportunities(created_at);

-- ─── touchpoints ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS touchpoints (
    id             SERIAL PRIMARY KEY,
    opportunity_id INTEGER REFERENCES opportunities(id),  -- nullable: opp may not exist yet
    source         VARCHAR(50) NOT NULL,
    external_ref   VARCHAR(200),
    channel_detail VARCHAR(200),
    metadata       JSONB NOT NULL DEFAULT '{}',
    occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency guard: same source cannot register the same external_ref twice.
-- Composite + partial (WHERE NOT NULL) prevents cross-source false matches.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tp_source_ext_ref_uniq
    ON touchpoints(source, external_ref)
    WHERE external_ref IS NOT NULL;

-- Covering index for first/last touch derivation (no stored FK columns needed).
CREATE INDEX IF NOT EXISTS idx_tp_opp_occurred
    ON touchpoints(opportunity_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_tp_source ON touchpoints(source);

-- ─── opportunity_events ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunity_events (
    id             SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
    from_status    VARCHAR(30),        -- NULL on first event
    to_status      VARCHAR(30) NOT NULL,
    actor          VARCHAR(200),       -- admin email or 'system'
    note           TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opp_evt_opp ON opportunity_events(opportunity_id);

-- ─── api_keys ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
    id           SERIAL PRIMARY KEY,
    key_hash     CHAR(64) NOT NULL UNIQUE,   -- SHA-256 hex; never store raw key
    label        VARCHAR(100) NOT NULL,
    scopes       TEXT[] NOT NULL DEFAULT '{ingest}',
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
