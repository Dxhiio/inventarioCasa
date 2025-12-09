-- ⚠️ ADVERTENCIA: ESTO BORRARÁ TODOS TUS DATOS DE INVENTARIO ⚠️
-- Ejecuta este script en el Editor SQL de Supabase para limpiar la base de datos.

-- 1. Borrar todos los items del inventario
DELETE FROM public.inventory_items;

-- 2. Borrar listas de compras y tareas comunales
DELETE FROM public.shopping_lists;
DELETE FROM public.communal_tasks;

-- 3. (Opcional) Borrar Categorías y Ubicaciones personalizadas
-- Descomenta las siguientes líneas si también quieres borrar esto:
-- DELETE FROM public.categories;
-- DELETE FROM public.locations;

-- 4. Resetear secuencias (Opcional, para que los IDs empiecen desde 1 otra vez)
-- ALTER SEQUENCE public.inventory_items_id_seq RESTART WITH 1;
