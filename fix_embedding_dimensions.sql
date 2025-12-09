-- 🔧 FIX: Ajustar dimensiones de vectores para modelo local (Transformers.js)
-- El modelo 'all-MiniLM-L6-v2' usa 384 dimensiones. OpenAI usa 1536.
-- Ejecuta esto en Supabase -> SQL Editor para corregir el error de inserción.

BEGIN;

-- 1. Eliminar índice vector existente (si existe) para evitar conflictos al alterar tipo
DROP INDEX IF EXISTS inventory_embedding_idx;

-- 2. Alterar la columna de la tabla para aceptar 384 dimensiones
-- Usamos USING para convertir los datos, aunque si está vacía no importa.
-- Si hay datos inválidos, esto los truncaría o fallaría, pero asumimos limpieza reciente.
ALTER TABLE public.inventory_items 
ALTER COLUMN embedding TYPE vector(384);

-- 3. Actualizar la función de búsqueda (RPC) para aceptar 384 dimensiones
CREATE OR REPLACE FUNCTION match_inventory (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  name text,
  description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    inventory_items.id,
    inventory_items.name,
    inventory_items.description,
    1 - (inventory_items.embedding <=> query_embedding) as similarity
  FROM inventory_items
  WHERE 1 - (inventory_items.embedding <=> query_embedding) > match_threshold
  ORDER BY inventory_items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMIT;
