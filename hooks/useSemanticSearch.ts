import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import EmbeddingService from '@/utils/embedding'
import { Database } from '@/types/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export type SearchResultItem = InventoryItem & {
  similarity?: number
}

export function useSemanticSearch() {
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const search = async (query: string) => {
    try {
      setLoading(true)
      setError(null)

      let vectorIds = new Map<number, number>() // id -> similarity
      
      try {
        // 1. Generate text embedding
        console.log("Generating embedding for:", query)
        const embedding = await EmbeddingService.generateEmbedding(query)
        
        // 2. Search in Supabase using pgvector RPC
        // @ts-ignore
        const { data, error: rpcError } = await supabase.rpc('match_inventory', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 20
        }) as { data: { id: number, similarity: number }[], error: any }

        if (rpcError) throw rpcError
        if (data) {
            data.forEach(item => vectorIds.set(item.id, item.similarity))
        }
      } catch (vectorError) {
        console.warn("Vector search failed, using text only:", vectorError)
      }

      // 3. Fallback/Hybrid: Text Search
      // We perform this to ensure we catch items by exact name even if vector search fails or is weak
      const { data: textData, error: textError } = await supabase
        .from('inventory_items')
        .select('id')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20)

      if (textError) console.error("Text search error:", textError)
      
      if (textData) {
        textData.forEach((item) => {
          // @ts-ignore
          if (!vectorIds.has(item.id)) {
             // @ts-ignore
             vectorIds.set(item.id, 1.0)
          }
        })
      }

      // 4. Fetch FULL Details for all found IDs
      const allIds = Array.from(vectorIds.keys())
      
      if (allIds.length === 0) {
        setResults([])
        return
      }

      const { data: fullItems, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .in('id', allIds)
        .returns<InventoryItem[]>()

      if (fetchError) throw fetchError

      // 5. Merge and Sort
      const finalResults = (fullItems || []).map(item => {
          const sim = vectorIds.get(item.id) || 0
          return {
             ...item,
             similarity: sim
          }
      }).sort((a, b) => (b.similarity || 0) - (a.similarity || 0))

      setResults(finalResults)

    } catch (err: any) {
      console.error("Search error:", err)
      setError(err.message || 'Error searching')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, error, search }
}
