'use client'

import { useState } from 'react'
import { useSemanticSearch } from '@/hooks/useSemanticSearch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { InventoryGrid } from '@/components/dashboard/InventoryGrid'
import { SearchIndexer } from '@/components/search/SearchIndexer'

export default function SearchPage() {
  const { search, results, loading, error } = useSemanticSearch()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    search(query)
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="shrink-0 space-y-4">
        <h1 className="text-2xl font-bold">Búsqueda Inteligente</h1>
        <p className="text-sm text-muted-foreground">
            Encuentra items por descripción, categoría o contexto ("algo para limpiar").
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ej: Ingredientes para pastel" 
            />
            <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
        </form>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex-1 min-h-0">
        {results.length > 0 ? (
            // @ts-ignore - InventoryGrid expects exact type but our result has extra similarity field, which is fine
            <InventoryGrid 
                inventory={results} 
                loading={loading} 
                hasMore={false} 
                fetchNextPage={() => {}} 
            />
        ) : (
            !loading && query && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No se encontraron resultados para "{query}"</p>
                    <p className="text-xs mt-2 opacity-50">Prueba con palabras clave más generales.</p>
                </div>
            )
        )}
      </div>
      <SearchIndexer />
    </div>
  )
}
