'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import EmbeddingService from '@/utils/embedding'
import { Loader2, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function SearchIndexer() {
  const [indexing, setIndexing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    checkAndIndex()
  }, [])

  const checkAndIndex = async () => {
    // 1. Check if there are items without embeddings
    const { count, error } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .is('embedding', null)

    if (error || !count || count === 0) return

    // Limit auto-indexing to avoid freezing browser too long on first load
    // We can do it in batches of 50
    setTotal(count)
    setIndexing(true)

    try {
      // 2. Fetch a batch of items
      const { data: items } = await supabase
        .from('inventory_items')
        .select('id, name, description, category_id, location_id')
        .is('embedding', null)
        .limit(20) as any

      if (!items) return

      let processed = 0

      // 3. Process each item serially
      for (const item of items) {
        try {
          // Construct rich text for embedding
          // We don't have category/location names here easily without joins, 
          // but Name + Description is a good start.
          const textToEmbed = `${item.name} ${item.description || ''}`
          
          const embedding = await EmbeddingService.generateEmbedding(textToEmbed)
          
          await (supabase
            .from('inventory_items') as any)
            .update({ embedding: embedding })
            .eq('id', item.id)

          processed++
          setCurrent(prev => prev + 1)
          setProgress((processed / items.length) * 100)

        } catch (e) {
          console.error(`Failed to index item ${item.id}`, e)
        }
      }

    } finally {
      setIndexing(false)
    }
  }

  if (!indexing) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-md border border-border p-4 rounded-lg shadow-lg flex flex-col gap-2 w-80 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span>Optimizando Búsqueda Inteligente...</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground text-right">
        Procesando {current} items...
      </p>
    </div>
  )
}
