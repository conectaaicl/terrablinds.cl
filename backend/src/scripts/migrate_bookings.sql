-- Migration: add bookings and blocked_days tables
-- Run on production: psql -U terrablinds -d terrablinds_db -f migrate_bookings.sql

CREATE TABLE IF NOT EXISTS bookings (
    id              SERIAL PRIMARY KEY,
    service_type    VARCHAR(30) NOT NULL CHECK (service_type IN ('visita_medidas','tecnico_persianas','tecnico_roller','tecnico_otros')),
    date            DATE NOT NULL,
    time_slot       VARCHAR(10) NOT NULL,
    client_name     VARCHAR(200) NOT NULL,
    client_email    VARCHAR(200) NOT NULL,
    client_phone    VARCHAR(50),
    client_address  VARCHAR(500),
    notes           TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending_payment'
                        CHECK (status IN ('pending_payment','confirmed','completed','cancelled')),
    amount          INTEGER DEFAULT 15000,
    flow_commerce_order VARCHAR(100),
    flow_token      VARCHAR(200),
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_days (
    id          SERIAL PRIMARY KEY,
    date        DATE NOT NULL UNIQUE,
    reason      VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_flow_token ON bookings(flow_token);
