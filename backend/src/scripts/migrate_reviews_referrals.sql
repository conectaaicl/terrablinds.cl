-- Migration: create reviews and referrals tables
-- Safe: uses IF NOT EXISTS, never drops data

CREATE TABLE IF NOT EXISTS reviews (
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

CREATE TABLE IF NOT EXISTS referrals (
    id             SERIAL PRIMARY KEY,
    referrer_name  VARCHAR(200) NOT NULL,
    referrer_email VARCHAR(200),
    referrer_phone VARCHAR(30),
    referred_name  VARCHAR(200),
    referred_email VARCHAR(200),
    referred_phone VARCHAR(30),
    status         VARCHAR(20) NOT NULL DEFAULT 'pending',
    reward_amount  INTEGER NOT NULL DEFAULT 0,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
