-- Migration: create testimonials table for marketing reviews/testimonials
-- (The 'reviews' table already exists for product reviews with different schema)
-- Safe: uses IF NOT EXISTS, never drops data

CREATE TABLE IF NOT EXISTS testimonials (
    id          SERIAL PRIMARY KEY,
    author_name VARCHAR(200) NOT NULL,
    author_role VARCHAR(200) NOT NULL DEFAULT 'Cliente',
    rating      INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    content     TEXT NOT NULL,
    avatar_url  VARCHAR(500),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
