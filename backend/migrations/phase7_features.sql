-- Phase 7: focal points, product SEO fields, product_categories
-- Run: docker exec -i terrablinds_db psql -U terrablinds -d terrablinds_db < migrations/phase7_features.sql

-- Products: SEO fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description VARCHAR(200);

-- Products: focal points (JSONB array of {x, y} objects indexed by image position)
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_focal_points JSONB DEFAULT '[]'::jsonb;

-- Projects: focal points
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_focal_x INTEGER NOT NULL DEFAULT 50;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_focal_y INTEGER NOT NULL DEFAULT 50;

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO product_categories (name, slug, sort_order) VALUES
    ('Roller Blackout',        'roller-blackout',        1),
    ('Roller Sunscreen',       'roller-sunscreen',       2),
    ('Roller Duo Blackout',    'roller-duo-blackout',    3),
    ('Domótica / Hub',         'domotica-hub',           4),
    ('Domotica Motor Roller',  'domotica-motor-roller',  5),
    ('Persianas Exterior',     'persianas-exterior',     6),
    ('Persianas Interior',     'persianas-interior',     7),
    ('Toldos',                 'toldos',                 8),
    ('Accesorios',             'accesorios',             9),
    ('Servicio Técnico',       'servicio-tecnico',       10)
ON CONFLICT (slug) DO NOTHING;
