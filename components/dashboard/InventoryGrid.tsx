'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Database } from "@/types/supabase"
import { InventoryItemCard } from "./InventoryItemCard"
import { ActionModal } from "./ActionModal"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface InventoryGridProps {
  inventory: InventoryItem[]
  loading: boolean
  hasMore: boolean
  fetchNextPage: () => void
}

export function InventoryGrid({ inventory, loading, hasMore, fetchNextPage }: InventoryGridProps) {
  const observerTarget = useRef(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    if (!selectedItem) return
    
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', selectedItem.id)
    
    if (error) {
      alert("Error eliminando: " + error.message)
    } else {
      setSelectedItem(null)
      // UI update is handled by Realtime subscription in hook
    }
  }

  const handleEdit = () => {
    if (!selectedItem) return
    router.push(`/inventory/edit/${selectedItem.id}`)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
           fetchNextPage()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }
    
    return () => {
        if (observerTarget.current) {
            observer.unobserve(observerTarget.current)
        }
    }
  }, [observerTarget, hasMore, fetchNextPage])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  return (
    <>
      <ActionModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

    <div 
        className="flex-1 overflow-y-auto px-5 pt-4 pb-32 no-scrollbar"
        style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)'
        }}
    >
        <div className="max-w-[1800px] mx-auto w-full">
            <div className="flex items-center gap-2 mb-3 px-1">
            <div className={`h-1.5 w-1.5 rounded-full ${inventory.length > 0 ? 'bg-primary' : 'bg-muted'} animate-pulse`} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Inventario</h2>
            </div>

            <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
            >
            {inventory.map((item, idx) => (
                <InventoryItemCard 
                   key={`${item.id}-${idx}`} 
                   item={item} 
                   idx={idx} 
                   onSelect={setSelectedItem}
                />
            ))}
            </motion.div>

            {hasMore && (
            <div ref={observerTarget} className="flex justify-center p-6 text-muted-foreground">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando más...
                </div>
            </div>
            )}
            
            {!hasMore && inventory.length > 0 && (
            <div className="text-center p-6 text-xs text-muted-foreground/50 uppercase tracking-widest">
                • Fin del Inventario •
            </div>
            )}
            
        </div>
    </div>
    </>
  )
}
