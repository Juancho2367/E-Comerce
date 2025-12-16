-- Insert categories
INSERT INTO categories (name, slug) VALUES
  ('Mujer', 'mujer'),
  ('Gym', 'gym')
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE
  mujer_id UUID;
  gym_id UUID;
BEGIN
  SELECT id INTO mujer_id FROM categories WHERE slug = 'mujer';
  SELECT id INTO gym_id FROM categories WHERE slug = 'gym';

  -- Insert subcategories for Mujer
  INSERT INTO categories (name, slug, parent_id) VALUES
    ('Leggings', 'leggings', mujer_id),
    ('Tops Deportivos', 'tops-deportivos', mujer_id),
    ('Shorts', 'shorts', mujer_id),
    ('Conjuntos', 'conjuntos', mujer_id),
    ('Calzado', 'calzado', mujer_id),
    ('Accesorios Gym', 'accesorios-gym', mujer_id)
  ON CONFLICT (slug) DO NOTHING;

  -- Insert products for Mujer category
  INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, badge, stock) VALUES
    (
      'Jean Clásico Azul',
      'jean-clasico-azul',
      'Jean de corte clásico en tono azul premium. Confeccionado en denim de alta calidad con acabados impecables.',
      1299,
      NULL,
      '/images/screenshot-202025-12-16-20012128.png',
      mujer_id,
      'Nuevo',
      50
    ),
    (
      'Jean Denim Premium',
      'jean-denim-premium',
      'Jean premium en denim lavado con diseño contemporáneo. Perfecto para cualquier ocasión.',
      1499,
      NULL,
      '/images/screenshot-202025-12-16-20012128.png',
      mujer_id,
      'Edición Limitada',
      30
    ),
    (
      'Jean Skinny Azul',
      'jean-skinny-azul',
      'Jean de corte skinny que realza tu figura. Diseño moderno y cómodo para uso diario.',
      1399,
      NULL,
      '/images/screenshot-202025-12-16-20012128.png',
      mujer_id,
      NULL,
      40
    ),
    (
      'Jean Recto Claro',
      'jean-recto-claro',
      'Jean de corte recto en tono claro. Estilo versátil para combinar con todo tu guardarropa.',
      1199,
      NULL,
      '/images/screenshot-202025-12-16-20012128.png',
      mujer_id,
      'Nuevo',
      60
    )
  ON CONFLICT (slug) DO NOTHING;

  -- Insert products for Gym category
  INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, badge, stock) VALUES
    (
      'Conjunto Deportivo Mint',
      'conjunto-deportivo-mint',
      'Conjunto deportivo de alto rendimiento en tono mint. Incluye top y leggings de compresión.',
      899,
      NULL,
      '/images/screenshot-202025-12-16-20012128.png',
      gym_id,
      'Edición Limitada',
      25
    ),
    (
      'Top Deportivo Negro',
      'top-deportivo-negro',
      'Top deportivo de compresión media. Ideal para entrenamientos intensos con máxima comodidad.',
      499,
      NULL,
      '/images/screenshot-202025-12-16-20012128.png',
      gym_id,
      'Nuevo',
      80
    ),
    (
      'Leggings Deportivos Grises',
      'leggings-deportivos-grises',
      'Leggings de alta compresión con tecnología anti-sudor. Perfectos para yoga y fitness.',
      699,
      NULL,
      '/images/screenshot-202025-12-16-20012128.png',
      gym_id,
      NULL,
      70
    ),
    (
      'Conjunto Training Pro',
      'conjunto-training-pro',
      'Conjunto profesional de entrenamiento. Diseño ergonómico con máxima libertad de movimiento.',
      1199,
      1499,
      '/images/screenshot-202025-12-16-20012128.png',
      gym_id,
      'Edición Limitada',
      20
    )
  ON CONFLICT (slug) DO NOTHING;
END $$;
