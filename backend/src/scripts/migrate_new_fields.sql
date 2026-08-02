-- Migración: Campos nuevos en tabla products
-- Ejecutar una sola vez en la base de datos de producción

-- Nuevos campos en products
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_width DECIMAL(8,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_width DECIMAL(8,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_height DECIMAL(8,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_height DECIMAL(8,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS lead_time_days INTEGER;

-- Nuevos configs (hero, redes sociales, email admin, contador visitas)
INSERT INTO configs (key, value, type, created_at, updated_at)
VALUES
  ('hero_title',              'Elegancia y Control para tus Espacios',                     'string', NOW(), NOW()),
  ('hero_subtitle',           'Cortinas roller, persianas y toldos a medida. Calidad premium con instalación experta.', 'string', NOW(), NOW()),
  ('hero_cta_primary',        'Ver Catálogo',                                              'string', NOW(), NOW()),
  ('hero_cta_secondary',      'Cotizar Ahora',                                             'string', NOW(), NOW()),
  ('hero_bg_image',           '',                                                           'string', NOW(), NOW()),
  ('social_facebook',         '',                                                           'string', NOW(), NOW()),
  ('social_instagram',        '',                                                           'string', NOW(), NOW()),
  ('social_tiktok',           '',                                                           'string', NOW(), NOW()),
  ('social_youtube',          '',                                                           'string', NOW(), NOW()),
  ('admin_notification_email','',                                                           'string', NOW(), NOW()),
  ('mercadopago_access_token','',                                                           'string', NOW(), NOW()),
  ('mercadopago_public_key',  '',                                                           'string', NOW(), NOW()),
  ('visit_count',             '0',                                                          'number', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
