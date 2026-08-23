-- TerraBlinds Growth Engine — Phase 1: Existing Table Extensions
-- Run AFTER migrate_growth_engine.sql (depends on contacts + opportunities tables).
-- Safe to execute multiple times (IF NOT EXISTS / idempotent ALTERs).
--
-- Usage:
--   docker exec -i terrablinds_db psql -U terrablinds -d terrablinds_db \
--     < src/scripts/migrate_quotes_leads_ext.sql

BEGIN;

-- ─── quotes ───────────────────────────────────────────────────────────────────
-- Nullable FK: existing quotes remain valid (NULL = not linked to an opportunity).
ALTER TABLE quotes
    ADD COLUMN IF NOT EXISTS opportunity_id INTEGER REFERENCES opportunities(id);

-- Default 1 for all existing rows; future revisions increment per opportunity.
ALTER TABLE quotes
    ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_quotes_opp_id ON quotes(opportunity_id);

-- ─── leads ────────────────────────────────────────────────────────────────────
-- Populated by the Growth Engine after processing a lead into Contact + Opportunity.
-- Nullable: legacy leads without engine processing remain valid.
ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS contact_id INTEGER REFERENCES contacts(id);

ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS opportunity_id INTEGER REFERENCES opportunities(id);

CREATE INDEX IF NOT EXISTS idx_leads_contact_id     ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_opportunity_id ON leads(opportunity_id);

COMMIT;
