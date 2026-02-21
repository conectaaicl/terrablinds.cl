-- Migration: Add 'contacted' to enum_quotes_status
-- Run ONCE on production PostgreSQL before deploying the updated code.
-- Safe: ADD VALUE is idempotent-friendly (fails gracefully if value already exists).
--
-- Usage:
--   docker exec -i terrablinds_db psql -U terrablinds -d terrablinds_db < migrate_quote_status.sql

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'contacted'
          AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'enum_quotes_status'
          )
    ) THEN
        ALTER TYPE "enum_quotes_status" ADD VALUE 'contacted' AFTER 'pending';
        RAISE NOTICE 'Added contacted to enum_quotes_status';
    ELSE
        RAISE NOTICE 'contacted already exists in enum_quotes_status, skipping';
    END IF;
END$$;
