-- PRO Features Migration (2026-05-12)

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    photo_url VARCHAR(500),
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    owner_name VARCHAR(200) NOT NULL,
    owner_email VARCHAR(200),
    discount_pct INTEGER NOT NULL DEFAULT 10 CHECK (discount_pct >= 1 AND discount_pct <= 50),
    uses_count INTEGER NOT NULL DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed 3 example referrals
INSERT INTO referrals (code, owner_name, owner_email, discount_pct, notes)
VALUES
    ('TERRA10', 'Descuento General', 'admin@terrablinds.cl', 10, 'Código general para campañas'),
    ('AMIGO15', 'Programa Referidos', 'admin@terrablinds.cl', 15, 'Para clientes que refieren amigos'),
    ('VERANO20', 'Promo Verano', 'admin@terrablinds.cl', 20, 'Campaña temporada verano')
ON CONFLICT (code) DO NOTHING;
