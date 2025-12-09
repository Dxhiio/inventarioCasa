-- Script para poblar la base de datos con 40 items de prueba
-- Ejecuta esto en el Editor SQL de Supabase

DO $$
DECLARE
  target_user_id uuid;
  
  -- Categorías IDs
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

  -- Ubicaciones IDs
  l_cocina bigint;
  l_despensa bigint;
  l_bano bigint;
  l_sala bigint;
  l_oficina bigint;
  l_cochera bigint;
  l_dormitorio bigint;
  l_patio bigint;

BEGIN
  -- 1. Obtener el primer usuario disponible (generalmente será tu usuario si eres el único)
  SELECT id INTO target_user_id FROM auth.users LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún usuario en auth.users. Asegúrate de haber iniciado sesión al menos una vez.';
  END IF;

  -- 2. Crear Categorías
  INSERT INTO public.categories (name, user_id) VALUES ('Alimentos', target_user_id) RETURNING id INTO c_alimentos;
  INSERT INTO public.categories (name, user_id) VALUES ('Bebidas', target_user_id) RETURNING id INTO c_bebidas;
  INSERT INTO public.categories (name, user_id) VALUES ('Limpieza', target_user_id) RETURNING id INTO c_limpieza;
  INSERT INTO public.categories (name, user_id) VALUES ('Tecnología', target_user_id) RETURNING id INTO c_tecnologia;
  INSERT INTO public.categories (name, user_id) VALUES ('Herramientas', target_user_id) RETURNING id INTO c_herramientas;
  INSERT INTO public.categories (name, user_id) VALUES ('Ropa', target_user_id) RETURNING id INTO c_ropa;
  INSERT INTO public.categories (name, user_id) VALUES ('Muebles', target_user_id) RETURNING id INTO c_muebles;
  INSERT INTO public.categories (name, user_id) VALUES ('Papelería', target_user_id) RETURNING id INTO c_papeleria;
  INSERT INTO public.categories (name, user_id) VALUES ('Salud', target_user_id) RETURNING id INTO c_salud;
  INSERT INTO public.categories (name, user_id) VALUES ('Mascotas', target_user_id) RETURNING id INTO c_mascotas;

  -- 3. Crear Ubicaciones
  INSERT INTO public.locations (name, user_id) VALUES ('Cocina', target_user_id) RETURNING id INTO l_cocina;
  INSERT INTO public.locations (name, user_id) VALUES ('Despensa', target_user_id) RETURNING id INTO l_despensa;
  INSERT INTO public.locations (name, user_id) VALUES ('Baño Principal', target_user_id) RETURNING id INTO l_bano;
  INSERT INTO public.locations (name, user_id) VALUES ('Sala de Estar', target_user_id) RETURNING id INTO l_sala;
  INSERT INTO public.locations (name, user_id) VALUES ('Oficina', target_user_id) RETURNING id INTO l_oficina;
  INSERT INTO public.locations (name, user_id) VALUES ('Cochera', target_user_id) RETURNING id INTO l_cochera;
  INSERT INTO public.locations (name, user_id) VALUES ('Dormitorio', target_user_id) RETURNING id INTO l_dormitorio;
  INSERT INTO public.locations (name, user_id) VALUES ('Patio Trasero', target_user_id) RETURNING id INTO l_patio;

  -- 4. Insertar 40 Items Variados
  INSERT INTO public.inventory_items (name, quantity, user_id, category_id, location_id, is_private, is_consumed, unit, expiry_date) VALUES
  
  -- Cocina / Despensa (Alimentos & Bebidas)
  ('Leche Entera', 2, target_user_id, c_alimentos, l_cocina, false, true, 'litros', (now() + interval '7 days')),
  ('Arroz', 5, target_user_id, c_alimentos, l_despensa, false, true, 'kg', (now() + interval '365 days')),
  ('Frijoles', 3, target_user_id, c_alimentos, l_despensa, false, true, 'kg', (now() + interval '180 days')),
  ('Aceite de Oliva', 1, target_user_id, c_alimentos, l_cocina, false, true, 'botella', (now() + interval '90 days')),
  ('Cereal', 2, target_user_id, c_alimentos, l_despensa, false, true, 'cajas', (now() + interval '30 days')),
  ('Café Molido', 1, target_user_id, c_bebidas, l_cocina, false, true, 'kg', (now() + interval '60 days')),
  ('Agua Mineral', 6, target_user_id, c_bebidas, l_despensa, false, true, 'botellas', (now() + interval '365 days')),
  ('Spaghetti', 4, target_user_id, c_alimentos, l_despensa, false, true, 'paquetes', (now() + interval '365 days')),
  ('Salsa de Tomate', 3, target_user_id, c_alimentos, l_despensa, false, true, 'latas', (now() + interval '365 days')),
  ('Atún', 10, target_user_id, c_alimentos, l_despensa, false, true, 'latas', (now() + interval '730 days')),

  -- Limpieza (Baño / Cocina)
  ('Detergente Ropa', 1, target_user_id, c_limpieza, l_bano, false, true, 'botella', null),
  ('Suavizante', 1, target_user_id, c_limpieza, l_bano, false, true, 'botella', null),
  ('Jabón de Manos', 3, target_user_id, c_limpieza, l_bano, false, true, 'piezas', null),
  ('Papel Higiénico', 12, target_user_id, c_limpieza, l_bano, false, true, 'rollos', null),
  ('Limpiador Multiusos', 2, target_user_id, c_limpieza, l_cocina, false, true, 'botella', null),
  ('Esponjas', 5, target_user_id, c_limpieza, l_cocina, false, true, 'piezas', null),

  -- Tecnología (Oficina / Sala)
  ('Laptop Reserva', 1, target_user_id, c_tecnologia, l_oficina, true, false, 'unidad', null), -- PRIVADO
  ('Cargadores USB-C', 4, target_user_id, c_tecnologia, l_oficina, false, false, 'unidad', null),
  ('Teclado Mecánico', 1, target_user_id, c_tecnologia, l_oficina, false, false, 'unidad', null),
  ('Monitor Antiguo', 1, target_user_id, c_tecnologia, l_cochera, false, false, 'unidad', null),
  ('Baterías AA', 20, target_user_id, c_tecnologia, l_sala, false, true, 'unidad', null),
  ('Control Remoto TV', 1, target_user_id, c_tecnologia, l_sala, false, false, 'unidad', null),

  -- Herramientas (Cochera)
  ('Taladro', 1, target_user_id, c_herramientas, l_cochera, true, false, 'unidad', null), -- PRIVADO
  ('Juego de Destornilladores', 1, target_user_id, c_herramientas, l_cochera, false, false, 'set', null),
  ('Martillo', 1, target_user_id, c_herramientas, l_cochera, false, false, 'unidad', null),
  ('Cinta Métrica', 2, target_user_id, c_herramientas, l_cochera, false, false, 'unidad', null),
  ('Caja de Tornillos', 1, target_user_id, c_herramientas, l_cochera, false, false, 'caja', null),

  -- Salud (Baño / Dormitorio)
  ('Ibuprofeno', 1, target_user_id, c_salud, l_bano, true, true, 'caja', (now() + interval '180 days')), -- PRIVADO
  ('Curitas', 1, target_user_id, c_salud, l_bano, false, true, 'caja', null),
  ('Vitaminas', 2, target_user_id, c_salud, l_cocina, true, true, 'frascos', (now() + interval '90 days')), -- PRIVADO

  -- Ropa / Varios (Dormitorio / Sala)
  ('Abrigos de Invierno', 3, target_user_id, c_ropa, l_dormitorio, false, false, 'piezas', null),
  ('Zapatos de Vestir', 2, target_user_id, c_ropa, l_dormitorio, false, false, 'pares', null),
  ('Sábanas Extra', 2, target_user_id, c_muebles, l_dormitorio, false, false, 'juegos', null),
  ('Toallas', 6, target_user_id, c_muebles, l_bano, false, false, 'piezas', null),
  ('Libretas', 5, target_user_id, c_papeleria, l_oficina, false, true, 'piezas', null),
  ('Bolígrafos', 10, target_user_id, c_papeleria, l_oficina, false, true, 'piezas', null),
  ('Comida de Perro', 1, target_user_id, c_mascotas, l_patio, false, true, 'bulto', (now() + interval '45 days')),
  ('Juguetes de Perro', 3, target_user_id, c_mascotas, l_patio, false, false, 'piezas', null),
  ('Manguera', 1, target_user_id, c_herramientas, l_patio, false, false, 'unidad', null),
  ('Sillas Plegables', 4, target_user_id, c_muebles, l_cochera, false, false, 'piezas', null);

END $$;
