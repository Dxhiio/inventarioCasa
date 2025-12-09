-- 1. Agregar columna is_private
ALTER TABLE public.inventory_items 
ADD COLUMN is_private boolean DEFAULT false;

-- 2. Actualizar Políticas de Seguridad (RLS)

-- Eliminar política anterior de lectura (que permitía ver todo a todos)
DROP POLICY IF EXISTS "Inventory items are viewable by everyone." ON public.inventory_items;

-- Nueva política de lectura:
-- "Ver items si son públicos (is_private = false) O si soy el dueño"
CREATE POLICY "Public items are viewable by everyone, Private by owner." 
ON public.inventory_items FOR SELECT 
USING ( 
  is_private = false 
  OR 
  auth.uid() = user_id 
);

-- Las políticas de INSERT/UPDATE ya verificaban auth.uid() = user_id, así que siguen siendo seguras para la escritura.
