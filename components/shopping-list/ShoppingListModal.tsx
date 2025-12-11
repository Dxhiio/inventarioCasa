import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, ExternalLink, Loader2, RefreshCw, Plus, Minus, Trash2, Edit2, Check, ArrowUpCircle, Share2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { ShoppingListItem, getShoppingCandidates, fetchProductPrices } from "@/app/actions/shopping-list"
import { cn } from "@/lib/utils"
// @ts-ignore
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { createPortal } from "react-dom"

interface ShoppingListModalProps {
  isOpen: boolean
  onClose: () => void
}

type Provider = 'ml' | 'sams'

export function ShoppingListModal({ isOpen, onClose }: ShoppingListModalProps) {
  const [activeTab, setActiveTab] = useState<Provider>('ml')
  const [items, setItems] = useState<ShoppingListItem[]>([]) // Main List
  const [recommendedItems, setRecommendedItems] = useState<ShoppingListItem[]>([]) // Recommended List
  
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pricesRestored, setPricesRestored] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)
  
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initial Data Fetch
  useEffect(() => {
      if (isOpen) {
          setLoading(true)
          setPricesRestored(false)
          
          getShoppingCandidates()
            .then(data => {
                setItems(data.main)
                setRecommendedItems(data.recommended)
                setLoading(false)
                // Trigger live prices after list is loaded
                triggerPriceUpdates([...data.main, ...data.recommended])
            })
            .catch(err => {
                console.error("Failed to load list", err)
                setLoading(false)
            })
      }
  }, [isOpen])

  // Progressive Price Updater
  const triggerPriceUpdates = async (allCandidates: ShoppingListItem[]) => {
      // Process chunks to avoid overwhelming server/network, but parallel enough to be fast
      const CONCURRENCY = 3 
      
      const updateItemPrice = (id: number, prices: any) => {
          setItems(prev => prev.map(i => i.id === id ? { ...i, prices } : i))
          setRecommendedItems(prev => prev.map(i => i.id === id ? { ...i, prices } : i))
      }

      const infoMap = allCandidates.map(i => ({ id: i.id, name: i.name }))
      
      for (let i = 0; i < infoMap.length; i += CONCURRENCY) {
          const batch = infoMap.slice(i, i + CONCURRENCY)
          await Promise.all(batch.map(async (p) => {
              try {
                  const prices = await fetchProductPrices(p.name)
                  updateItemPrice(p.id, prices)
              } catch (e) {
                  console.warn("Price fetch failed for", p.name)
              }
          }))
      }
      setPricesRestored(true)
  }

  // Focus input when editing starts
  useEffect(() => {
      if (editingId && inputRef.current) {
          inputRef.current.focus()
      }
  }, [editingId])

  // Calculate Total dynamically
  const total = items.reduce((acc, item) => {
      const price = item.prices[activeTab].price
      return acc + (price * item.suggested_quantity)
  }, 0)

  const handleUpdateQuantity = (id: number, delta: number) => {
      setItems(prev => prev.map(item => {
          if (item.id === id) {
              const newQty = Math.max(1, item.suggested_quantity + delta)
              return { ...item, suggested_quantity: newQty }
          }
          return item
      }))
  }

  const handleRemoveItem = (id: number) => {
      setItems(prev => prev.filter(item => item.id !== id))
  }
  
  const handlePromoteItem = (id: number) => {
      const itemToPromote = recommendedItems.find(i => i.id === id)
      if (itemToPromote) {
          setRecommendedItems(prev => prev.filter(i => i.id !== id))
          setItems(prev => [...prev, itemToPromote])
      }
  }

  const handleStartEdit = (id: number, currentPrice: number) => {
      setEditingId(id)
      setEditValue(currentPrice.toString())
  }

  const handleSaveEdit = (id: number) => {
      const newPrice = parseFloat(editValue)
      if (!isNaN(newPrice) && newPrice >= 0) {
          const updateList = (list: ShoppingListItem[]) => list.map(item => {
              if (item.id === id) {
                  return {
                      ...item,
                      prices: {
                          ...item.prices,
                          [activeTab]: {
                              ...item.prices[activeTab],
                              price: newPrice,
                              isRealPrice: true 
                          }
                      }
                  }
              }
              return item
          })
          
          setItems(prev => updateList(prev))
          setRecommendedItems(prev => updateList(prev))
      }
      setEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
      if (e.key === 'Enter') handleSaveEdit(id)
      if (e.key === 'Escape') setEditingId(null)
  }

  const handleShare = async () => {
    const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
    const textItems = items.map(i => `[ ] ${i.name} (${i.suggested_quantity})`).join('\n')
    const title = `🛒 Lista de Compras - ${activeTab === 'ml' ? 'Mercado Libre' : 'Sams Club'} (${date})`
    const fullText = `${title}\nTotal Est: $${total.toLocaleString('es-MX')}\n\n${textItems}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text: fullText })
      } catch (err) { 
       // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      window.open('https://keep.google.com', '_blank')
    }
 }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Container - Flexbox for robust centering */}
          <motion.div 
            className="fixed inset-0 z-[9999] flex items-end lg:items-center justify-center sm:px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop Layer */}
            <div 
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
          
            {/* Modal Content */}
            <motion.div
                initial={isDesktop ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
                animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
                exit={isDesktop ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                    "relative w-full bg-card border border-border/50 shadow-2xl flex flex-col overflow-hidden z-10",
                    // Mobile Styles
                    "rounded-t-3xl border-t max-h-[85vh]",
                    // Desktop Styles
                    "lg:rounded-2xl lg:max-w-2xl lg:max-h-[85vh]"
                )}
            >
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-border/40 flex flex-col gap-4 bg-secondary/10 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                        <h2 className="text-xl font-bold">Lista de Compras</h2>
                        <p className="text-xs text-muted-foreground">
                            {items.length} items • {activeTab === 'ml' ? 'Mercado Libre' : 'Sams Club'}
                        </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="grid grid-cols-2 p-1 bg-secondary/50 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('ml')}
                        className={cn(
                            "py-2 text-sm font-bold rounded-lg transition-all",
                            activeTab === 'ml' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Mercado Libre
                    </button>
                    <button 
                        onClick={() => setActiveTab('sams')}
                        className={cn(
                            "py-2 text-sm font-bold rounded-lg transition-all",
                            activeTab === 'sams' ? "bg-background text-blue-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Sams Club
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-12 space-y-4 h-full">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Analizando consumibles y precios...</p>
                 </div>
               ) : (items.length === 0 && recommendedItems.length === 0) ? (
                 <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                   <p className="text-muted-foreground mb-4">¡Todo parece estar en orden esta semana!</p>
                   <button onClick={onClose} className="text-primary font-medium hover:underline">
                     Volver al inventario
                   </button>
                 </div>
               ) : (
                 <>
                  {/* MAIN LIST */}
                  <div className="space-y-3">
                    {items.map((item) => {
                        const priceData = item.prices[activeTab]
                        const price = priceData.price * item.suggested_quantity
                        
                        return (
                         <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all group">
                           {/* Quantity Controls */}
                           <div className="flex flex-col items-center gap-1 bg-secondary/30 rounded-lg p-1">
                             <button onClick={() => handleUpdateQuantity(item.id, 1)} className="p-1 hover:bg-background rounded-md"><Plus className="h-3 w-3" /></button>
                             <span className="text-xs font-bold w-4 text-center">{item.suggested_quantity}</span>
                             <button onClick={() => handleUpdateQuantity(item.id, -1)} className="p-1 hover:bg-background rounded-md"><Minus className="h-3 w-3" /></button>
                           </div>
                           
                           {/* Info */}
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{item.name}</span>
                                {item.reason === 'expiring' && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold">CADUCA</span>
                                )}
                             </div>
                             
                             {/* Price Display */}
                             <div className="flex items-center gap-2 mt-1">
                                {priceData.price === 0 ? (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Buscando...
                                    </span>
                                ) : (
                                    activeTab === 'sams' && editingId === item.id ? (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">$</span>
                                            <input 
                                                ref={inputRef}
                                                type="number" 
                                                className="w-20 text-sm font-bold bg-background border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, item.id)}
                                                onBlur={() => handleSaveEdit(item.id)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group-hover:gap-3 transition-all">
                                            <p className={cn("text-sm font-bold", priceData.isRealPrice ? "text-green-500" : "text-muted-foreground")}>
                                                ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                {priceData.isRealPrice && <span className="text-[10px] ml-1 bg-green-500/10 px-1 rounded">LIVE</span>}
                                            </p>
                                            
                                            {/* Edit Button (Sams Only) */}
                                            {activeTab === 'sams' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleStartEdit(item.id, priceData.price); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded-full transition-opacity"
                                                    title="Editar precio manualmente"
                                                >
                                                    <Edit2 className="h-3 w-3 text-muted-foreground" />
                                                </button>
                                            )}
                                        </div>
                                    )
                                )}
                             </div>
                           </div>

                           {/* Actions */}
                           <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                             <Trash2 className="h-4 w-4" />
                           </button>
                         </div>
                        )
                    })}
                  </div>

                  {/* RECOMMENDED LIST */}
                  {recommendedItems.length > 0 && (
                      <div className="pt-4 border-t border-dashed border-border/50">
                          <h3 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                             💡 Sugerencias (Baja Rotación)
                          </h3>
                          <div className="space-y-2 opacity-80">
                            {recommendedItems.map((item) => {
                                const priceData = item.prices[activeTab]
                                return (
                                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/50">
                                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                            {priceData.price === 0 ? <RefreshCw className="h-3 w-3 animate-spin opacity-50"/> : <span className="text-[10px] font-bold">${Math.round(priceData.price)}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                        </div>
                                        <button 
                                            onClick={() => handlePromoteItem(item.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold transition-all"
                                        >
                                            <ArrowUpCircle className="h-3 w-3" />
                                            Agregar
                                        </button>
                                    </div>
                                )
                            })}
                          </div>
                      </div>
                  )}
                 </>
               )}
            </div>

            {/* Footer */}
            <div className="p-4 lg:p-6 border-t border-border/40 bg-background shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm">Total Estimado</span>
                    <div className="text-right">
                        <span className="text-2xl font-black text-foreground block">
                            ${total.toLocaleString('es-MX')}
                        </span>
                        {!pricesRestored && items.length > 0 && (
                            <span className="text-[10px] text-orange-500 animate-pulse flex justify-end items-center gap-1">
                                <RefreshCw className="h-3 w-3 animate-spin"/> Actualizando precios live...
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleShare}
                        className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition-colors flex items-center justify-center gap-2"
                        title="Exportar a Google Keep / Whatsapp"
                    >
                        {copied ? <Check className="h-5 w-5 text-green-600" /> : <Share2 className="h-5 w-5" />}
                        {isDesktop && <span className="text-sm font-bold">{copied ? 'Copiado' : 'Exportar'}</span>}
                    </button>
                    <button 
                        disabled={loading || items.length === 0}
                        className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Check className="h-5 w-5" />}
                        Confirmar Compra
                    </button>
                </div>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
