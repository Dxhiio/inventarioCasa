'use client'

import { Package, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Database } from "@/types/supabase"
import { useTrafficLight } from "@/hooks/useTrafficLight"

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface InventoryItemCardProps {
  item: InventoryItem
  idx: number
  onSelect: (item: InventoryItem) => void
}

export function InventoryItemCard({ item, idx, onSelect }: InventoryItemCardProps) {
  const { getTrafficLight, firstExpiryColor } = useTrafficLight()
  const status = getTrafficLight(item)

  return (
    <motion.div 
       key={`${item.id}-${idx}`}
       onClick={() => onSelect(item)}
       className="flex items-center gap-4 lg:gap-6 p-4 lg:p-6 rounded-2xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
        <div className="h-12 w-12 lg:h-24 lg:w-24 shrink-0 rounded-xl overflow-hidden bg-secondary relative shadow-sm">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/30">
              <Package className="h-6 w-6 lg:h-10 lg:w-10" />
            </div>
          )}
          {item.is_private && (
             <div className="absolute top-0 right-0 p-0.5 lg:p-1 bg-black/40 rounded-bl-md backdrop-blur-[2px]">
               <Lock className="h-2.5 w-2.5 lg:h-4 lg:w-4 text-white" />
             </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
             <h3 className="font-bold text-sm lg:text-xl truncate pr-2 text-foreground/90 group-hover:text-primary transition-colors">{item.name}</h3>
             <div className={`h-2 w-2 lg:h-3 lg:w-3 rounded-full shrink-0 ${status.color} shadow-sm`} />
          </div>
          <div className="text-xs lg:text-sm text-muted-foreground flex flex-wrap items-center gap-2 lg:gap-3">
             <span className="font-medium bg-secondary px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-md text-foreground/80">{item.quantity} {item.unit || 'pz'}</span>
             {item.expiry_date && (
               <span className={`${firstExpiryColor(item.expiry_date)} bg-background/50 px-1 rounded`}>
                 {formatDistanceToNow(new Date(item.expiry_date), { locale: es, addSuffix: true })}
               </span>
             )}
          </div>
        </div>
    </motion.div>
  )
}
