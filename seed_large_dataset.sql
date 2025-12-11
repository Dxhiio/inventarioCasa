-- Script to seed 80+ items for robust testing
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  target_user_id uuid;
  
  -- Category IDs to be fetched or created
  c_alimentos bigint;
  c_bebidas bigint;
  c_limpieza bigint;
  c_tecnologia bigint;
  c_herramientas bigint;
  c_ropa bigint;
  c_muebles bigint;
  c_papeleria bigint;
  c_salud bigint;
  c_mascotas bigint;
  c_jardin bigint;
  c_automotriz bigint;

  -- Location IDs
  l_cocina bigint;
  l_despensa bigint;
  l_bano bigint;
  l_sala bigint;
  l_oficina bigint;
  l_cochera bigint;
  l_dormitorio bigint;
  l_patio bigint;

BEGIN
  -- 1. Get User
  SELECT id INTO target_user_id FROM auth.users LIMIT 1;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- 2. Ensure Categories Exist (Insert if not exists logic is hard in blocks without functions, simpler to just insert ignore or fetch)
  -- For this script, we'll just insert and rely on names unique constraint or just create new ones. 
  -- Assuming simple "insert if not exists" via helper is not available, we will try to select first, if null insert.
  
  -- Simplified: Check and Insert Categories
  SELECT id INTO c_jardin FROM public.categories WHERE name = 'Jardín' AND user_id = target_user_id;
  IF c_jardin IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Jardín', target_user_id) RETURNING id INTO c_jardin; END IF;
  
  SELECT id INTO c_automotriz FROM public.categories WHERE name = 'Automotriz' AND user_id = target_user_id;
  IF c_automotriz IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Automotriz', target_user_id) RETURNING id INTO c_automotriz; END IF;

  -- Re-fetch existing ones if run after previous seed
  SELECT id INTO c_alimentos FROM public.categories WHERE name = 'Alimentos' AND user_id = target_user_id;
  IF c_alimentos IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Alimentos', target_user_id) RETURNING id INTO c_alimentos; END IF;
  
  -- ... (Fetching others assuming they exist from previous seed or created now)
  SELECT id INTO c_bebidas FROM public.categories WHERE name = 'Bebidas' AND user_id = target_user_id;
  IF c_bebidas IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Bebidas', target_user_id) RETURNING id INTO c_bebidas; END IF;
  
  SELECT id INTO c_limpieza FROM public.categories WHERE name = 'Limpieza' AND user_id = target_user_id;
  IF c_limpieza IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Limpieza', target_user_id) RETURNING id INTO c_limpieza; END IF;
  
  SELECT id INTO c_tecnologia FROM public.categories WHERE name = 'Tecnología' AND user_id = target_user_id;
  IF c_tecnologia IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Tecnología', target_user_id) RETURNING id INTO c_tecnologia; END IF;
  
  SELECT id INTO c_herramientas FROM public.categories WHERE name = 'Herramientas' AND user_id = target_user_id;
  IF c_herramientas IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Herramientas', target_user_id) RETURNING id INTO c_herramientas; END IF;
  
  SELECT id INTO c_salud FROM public.categories WHERE name = 'Salud' AND user_id = target_user_id;
  IF c_salud IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Salud', target_user_id) RETURNING id INTO c_salud; END IF;
  
  SELECT id INTO c_papeleria FROM public.categories WHERE name = 'Papelería' AND user_id = target_user_id;
  IF c_papeleria IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Papelería', target_user_id) RETURNING id INTO c_papeleria; END IF;
  
  SELECT id INTO c_mascotas FROM public.categories WHERE name = 'Mascotas' AND user_id = target_user_id;
  IF c_mascotas IS NULL THEN INSERT INTO public.categories (name, user_id) VALUES ('Mascotas', target_user_id) RETURNING id INTO c_mascotas; END IF;

  -- Get Locations
  SELECT id INTO l_cocina FROM public.locations WHERE name = 'Cocina' AND user_id = target_user_id;
  IF l_cocina IS NULL THEN INSERT INTO public.locations (name, user_id) VALUES ('Cocina', target_user_id) RETURNING id INTO l_cocina; END IF;
  
  SELECT id INTO l_despensa FROM public.locations WHERE name = 'Despensa' AND user_id = target_user_id;
  IF l_despensa IS NULL THEN INSERT INTO public.locations (name, user_id) VALUES ('Despensa', target_user_id) RETURNING id INTO l_despensa; END IF;

  SELECT id INTO l_bano FROM public.locations WHERE name = 'Baño Principal' AND user_id = target_user_id;
  IF l_bano IS NULL THEN INSERT INTO public.locations (name, user_id) VALUES ('Baño Principal', target_user_id) RETURNING id INTO l_bano; END IF;
  
  SELECT id INTO l_cochera FROM public.locations WHERE name = 'Cochera' AND user_id = target_user_id;
  IF l_cochera IS NULL THEN INSERT INTO public.locations (name, user_id) VALUES ('Cochera', target_user_id) RETURNING id INTO l_cochera; END IF;
  
  SELECT id INTO l_sala FROM public.locations WHERE name = 'Sala de Estar' AND user_id = target_user_id;
  IF l_sala IS NULL THEN INSERT INTO public.locations (name, user_id) VALUES ('Sala de Estar', target_user_id) RETURNING id INTO l_sala; END IF;
  
  SELECT id INTO l_oficina FROM public.locations WHERE name = 'Oficina' AND user_id = target_user_id;
  IF l_oficina IS NULL THEN INSERT INTO public.locations (name, user_id) VALUES ('Oficina', target_user_id) RETURNING id INTO l_oficina; END IF;


  -- 3. INSERT 80 ITEMS
  INSERT INTO public.inventory_items (name, quantity, user_id, category_id, location_id, is_private, is_consumed, unit, expiry_date) VALUES
  
  -- LOW STOCK & EXPIRING TEST ITEMS --
  ('Leche Deslactosada', 0, target_user_id, c_alimentos, l_cocina, false, true, 'litros', (now() + interval '5 days')), -- Low Stock
  ('Huevos Orgánicos', 1, target_user_id, c_alimentos, l_cocina, false, true, 'docena', (now() + interval '2 days')), -- Low + Expiring Soon
  ('Yogurt Griego', 1, target_user_id, c_alimentos, l_cocina, false, true, 'bote', (now() - interval '1 days')), -- Expired!
  ('Pan Integral', 2, target_user_id, c_alimentos, l_despensa, false, true, 'barra', (now() + interval '2 days')), -- Expiring Soon
  ('Jamon de Pavo', 1, target_user_id, c_alimentos, l_cocina, false, true, 'kg', (now() + interval '4 days')), -- Low Stock
  
  -- Normal Stock Items --
  ('Galletas María', 5, target_user_id, c_alimentos, l_despensa, false, true, 'paquetes', (now() + interval '6 months')),
  ('Sal de Grano', 2, target_user_id, c_alimentos, l_despensa, false, true, 'bolsa', null),
  ('Pimienta Negra', 1, target_user_id, c_alimentos, l_despensa, false, true, 'frasco', null),
  ('Vainilla', 1, target_user_id, c_alimentos, l_despensa, false, true, 'botella', (now() + interval '1 year')),
  ('Levadura', 10, target_user_id, c_alimentos, l_despensa, false, true, 'sobres', (now() + interval '6 months')),
  ('Harina de Trigo', 3, target_user_id, c_alimentos, l_despensa, false, true, 'kilos', (now() + interval '8 months')),
  ('Azúcar Mascabada', 2, target_user_id, c_alimentos, l_despensa, false, true, 'kilos', null),
  ('Cereal Avena', 2, target_user_id, c_alimentos, l_despensa, false, true, 'caja', (now() + interval '3 months')),
  ('Granola', 1, target_user_id, c_alimentos, l_despensa, false, true, 'bolsa', (now() + interval '2 months')),
  ('Barras de Proteína', 6, target_user_id, c_alimentos, l_despensa, false, true, 'piezas', (now() + interval '4 months')),
  ('Mantequilla de Maní', 1, target_user_id, c_alimentos, l_despensa, false, true, 'bote', (now() + interval '5 months')),
  ('Mermelada de Fresa', 2, target_user_id, c_alimentos, l_despensa, false, true, 'frasco', (now() + interval '1 year')),
  ('Miel de Abeja', 1, target_user_id, c_alimentos, l_despensa, false, true, 'botella', null),
  ('Chiles Jalapeños', 3, target_user_id, c_alimentos, l_despensa, false, true, 'latas', (now() + interval '2 years')),
  ('Elote Dorado', 4, target_user_id, c_alimentos, l_despensa, false, true, 'latas', (now() + interval '2 years')),
  ('Chícharos', 2, target_user_id, c_alimentos, l_despensa, false, true, 'latas', (now() + interval '2 years')),
  ('Aceitunas', 1, target_user_id, c_alimentos, l_despensa, false, true, 'frasco', (now() + interval '1 year')),
  ('Mayonesa', 0, target_user_id, c_alimentos, l_cocina, false, true, 'frasco', (now() + interval '3 months')), -- Low Stock
  ('Ketchup', 1, target_user_id, c_alimentos, l_cocina, false, true, 'botella', (now() + interval '6 months')),
  ('Mostaza', 1, target_user_id, c_alimentos, l_cocina, false, true, 'botella', (now() + interval '8 months')),
  ('Salsa Soja', 1, target_user_id, c_alimentos, l_despensa, false, true, 'botella', (now() + interval '1 year')),
  ('Vinagre Blanco', 1, target_user_id, c_limpieza, l_cocina, false, true, 'galón', null),
  ('Bicarbonato', 2, target_user_id, c_limpieza, l_cocina, false, true, 'caja', null),
  ('Servilletas', 4, target_user_id, c_limpieza, l_cocina, false, true, 'paquetes', null),
  ('Papel Aluminio', 1, target_user_id, c_alimentos, l_cocina, false, true, 'rollo', null),
  ('Papel Film', 0, target_user_id, c_alimentos, l_cocina, false, true, 'rollo', null), -- Low Stock
  
  -- BEBIDAS
  ('Refresco Cola', 6, target_user_id, c_bebidas, l_despensa, false, true, 'latas', (now() + interval '6 months')),
  ('Jugo de Naranja', 1, target_user_id, c_bebidas, l_cocina, false, true, 'litro', (now() + interval '10 days')),
  ('Cerveza Clara', 6, target_user_id, c_bebidas, l_cocina, false, true, 'botellas', (now() + interval '3 months')),
  ('Vino Tinto', 3, target_user_id, c_bebidas, l_sala, false, true, 'botellas', null),
  ('Té Verde', 1, target_user_id, c_bebidas, l_despensa, false, true, 'caja', (now() + interval '1 year')),
  ('Té de Manzanilla', 1, target_user_id, c_bebidas, l_despensa, false, true, 'caja', (now() + interval '1 year')),
  ('Café Soluble', 0, target_user_id, c_bebidas, l_cocina, false, true, 'frasco', (now() + interval '1 year')), -- Low Stock
  
  -- LIMPIEZA
  ('Cloro', 1, target_user_id, c_limpieza, l_bano, false, true, 'galón', null),
  ('Desinfectante Spray', 2, target_user_id, c_limpieza, l_bano, false, true, 'botellas', null),
  ('Limpiador de Vidrios', 0, target_user_id, c_limpieza, l_bano, false, true, 'botella', null), -- Low Stock
  ('Pastillas WC', 4, target_user_id, c_limpieza, l_bano, false, true, 'piezas', null),
  ('Bolsas Basura G', 1, target_user_id, c_limpieza, l_cocina, false, true, 'caja', null),
  ('Bolsas Basura M', 20, target_user_id, c_limpieza, l_cocina, false, true, 'piezas', null),
  ('Trapeador', 1, target_user_id, c_limpieza, l_cochera, false, false, 'unidad', null),
  ('Escoba', 1, target_user_id, c_limpieza, l_cochera, false, false, 'unidad', null),
  ('Recogedor', 1, target_user_id, c_limpieza, l_cochera, false, false, 'unidad', null),
  
  -- SALUD
  ('Paracetamol', 2, target_user_id, c_salud, l_bano, false, true, 'cajas', (now() + interval '1 year')),
  ('Aspirina', 1, target_user_id, c_salud, l_bano, false, true, 'frasco', (now() + interval '6 months')),
  ('Jarabe para Tos', 0, target_user_id, c_salud, l_bano, false, true, 'botella', (now() + interval '3 months')), -- Low Stock
  ('Alcohol Etílico', 1, target_user_id, c_salud, l_bano, false, true, 'botella', (now() + interval '2 years')),
  ('Agua Oxigenada', 1, target_user_id, c_salud, l_bano, false, true, 'botella', (now() + interval '2 years')),
  ('Vendas', 3, target_user_id, c_salud, l_bano, false, true, 'rollos', null),
  ('Termómetro', 1, target_user_id, c_salud, l_bano, false, false, 'unidad', null),
  ('Mascarillas', 10, target_user_id, c_salud, l_oficina, false, true, 'piezas', null),
  
  -- TECNOLOGIA
  ('Cable HDMI', 2, target_user_id, c_tecnologia, l_sala, false, false, 'piezas', null),
  ('Pilas AAA', 4, target_user_id, c_tecnologia, l_sala, false, true, 'piezas', null),
  ('Pilas 9V', 1, target_user_id, c_tecnologia, l_sala, false, true, 'pieza', null),
  ('Extensión Eléctrica', 2, target_user_id, c_tecnologia, l_oficina, false, false, 'unidad', null),
  ('Regulador Voltaje', 1, target_user_id, c_tecnologia, l_oficina, false, false, 'unidad', null),
  ('Mouse Inalámbrico', 1, target_user_id, c_tecnologia, l_oficina, false, false, 'unidad', null),
  ('Alfombrilla Mouse', 1, target_user_id, c_tecnologia, l_oficina, false, false, 'unidad', null),
  
  -- JARDIN Y AUTO
  ('Fertilizante', 1, target_user_id, c_jardin, l_cochera, false, true, 'bolsa', null),
  ('Tierra para Macetas', 0, target_user_id, c_jardin, l_patio, false, true, 'bolsa', null), -- Low Stock
  ('Pala de Jardín', 1, target_user_id, c_jardin, l_cochera, false, false, 'unidad', null),
  ('Rastrillo', 1, target_user_id, c_jardin, l_cochera, false, false, 'unidad', null),
  ('Aceite Motor 5W30', 1, target_user_id, c_automotriz, l_cochera, false, true, 'litro', null),
  ('Líquido Limpiaparabrisas', 0, target_user_id, c_automotriz, l_cochera, false, true, 'galón', null), -- Low Stock
  ('Cera para Auto', 1, target_user_id, c_automotriz, l_cochera, false, true, 'bote', null),
  ('Esponja Auto', 2, target_user_id, c_automotriz, l_cochera, false, true, 'piezas', null),
  
  -- OTROS
  ('Libro de Cocina', 1, target_user_id, c_papeleria, l_cocina, false, false, 'unidad', null),
  ('Velas Aromáticas', 3, target_user_id, c_muebles, l_sala, false, true, 'piezas', null),
  ('Focos LED', 0, target_user_id, c_tecnologia, l_despensa, false, true, 'caja', null), -- Low Stock
  ('Cinta Adhesiva', 2, target_user_id, c_papeleria, l_oficina, false, true, 'rollos', null),
  ('Pegamento Blanco', 1, target_user_id, c_papeleria, l_oficina, false, true, 'botella', null),
  ('Tijeras', 2, target_user_id, c_papeleria, l_oficina, false, false, 'unidad', null);

END $$;
