'use client'

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Database } from "@/types/supabase"
import { Edit, Trash2, X, MapPin, Tag, Calendar, Package, Lock, Globe } from "lucide-react"
import { useInventory } from "@/hooks/useInventory"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  item: InventoryItem | null
}

export function ActionModal({ isOpen, onClose, onEdit, onDelete, item }: ActionModalProps) {
  const { categories, locations } = useInventory()

  if (!item) return null

  const categoryName = categories.find(c => c.id === item.category_id)?.name || "Sin Categoría"
  const locationName = locations.find(l => l.id === item.location_id)?.name || "Sin Ubicación"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          
          {/* Modal */}
          <motion.div
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
             <div className="bg-card/95 backdrop-blur-xl border border-border rounded-3xl w-full max-w-md shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[85vh]">
               
               {/* Hero Image Section */}
               <div className="h-48 w-full bg-secondary relative shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/30">
                       <Package className="h-16 w-16" />
                    </div>
                  )}
                  
                  {/* Privacy Badge */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                     {item.is_private ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                     {item.is_private ? "Privado" : "Público"}
                  </div>
                  
                  {/* Close Button on Image */}
                  <button 
                    onClick={onClose}
                    className="absolute top-4 left-4 h-8 w-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
               </div>

               {/* Content Section */}
               <div className="p-6 flex flex-col flex-1 overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-start mb-2">
                     <h2 className="text-2xl font-bold text-foreground leading-tight">{item.name}</h2>
                     <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                        {item.quantity} {item.unit || 'pz'}
                     </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {item.description || "Sin descripción."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                     <div className="bg-secondary/50 rounded-xl p-3 flex flex-col gap-1.5 border border-border/50">
                        <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                           <Tag className="h-3 w-3" /> Categoría
                        </span>
                        <span className="text-sm font-medium truncate">{categoryName}</span>
                     </div>
                     <div className="bg-secondary/50 rounded-xl p-3 flex flex-col gap-1.5 border border-border/50">
                        <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                           <MapPin className="h-3 w-3" /> Ubicación
                        </span>
                        <span className="text-sm font-medium truncate">{locationName}</span>
                     </div>
                     {item.expiry_date && (
                        <div className="col-span-2 bg-red-500/10 rounded-xl p-3 flex flex-col gap-1.5 border border-red-500/20">
                           <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Vencimiento
                           </span>
                           <span className="text-sm font-medium text-red-700 dark:text-red-300">
                             {new Date(item.expiry_date).toLocaleDateString()} 
                             <span className="opacity-70 font-normal ml-1">
                               ({formatDistanceToNow(new Date(item.expiry_date), { locale: es, addSuffix: true })})
                             </span>
                           </span>
                        </div>
                     )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-3 pt-2">
                     <div className="grid grid-cols-2 gap-3">
                         <Button 
                           onClick={onEdit} 
                           className="h-12 text-lg font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl shadow-none border border-border"
                         >
                           <Edit className="mr-2 h-5 w-5 opacity-70" /> Editar
                         </Button>
                         <Button 
                           onClick={onDelete} 
                           className="h-12 text-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-xl shadow-none border border-red-200 dark:border-red-900/50"
                         >
                           <Trash2 className="mr-2 h-5 w-5 opacity-70" /> Eliminar
                         </Button>
                     </div>
                     <Button 
                       onClick={onClose} 
                       variant="ghost"
                       className="w-full text-muted-foreground hover:text-foreground h-10 rounded-xl"
                     >
                       Cerrar
                     </Button>
                  </div>

               </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
