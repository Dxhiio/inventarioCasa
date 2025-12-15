'use client'

import { useState, useRef, useEffect } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Camera, Upload, Lock, Globe, Calendar, MapPin, Tag, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import EmbeddingService from '@/utils/embedding' // [NEW]
import { BarcodeScanner } from './BarcodeScanner'
import { ProductService } from '@/lib/productService'
import { Scan, Camera as CameraIcon } from 'lucide-react'

import { Database } from '@/types/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface AddItemFormProps {
  initialData?: InventoryItem
}

export function AddItemForm({ initialData }: AddItemFormProps) {
  const { addItem, updateInventoryItem, categories, locations } = useInventory()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [quantity, setQuantity] = useState(initialData?.quantity || 1)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null)
  
  // Enhanced Fields
  const [isPrivate, setIsPrivate] = useState(initialData?.is_private || false)
  const [expiryDate, setExpiryDate] = useState(initialData?.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : '')
  
  // Selectors State
  const [categoryId, setCategoryId] = useState<number | 'new' | null>(initialData?.category_id || null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [locationId, setLocationId] = useState<number | 'new' | null>(initialData?.location_id || null)

  const [newLocationName, setNewLocationName] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const initialBarcode = searchParams.get('barcode')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Auto-scan from URL
  useEffect(() => {
    if (initialBarcode) {
      handleScan(initialBarcode)
    }
  }, [initialBarcode])
  const supabase = createClient()

  // ... (handleImageChange and handleCreateAuxiliaryData remain same)

  const handleScan = async (code: string) => {
    setShowScanner(false)
    setLoading(true)
    try {
      // Lens Scan / Text Logic
      if (code.startsWith('name:')) {
          const nameQuery = code.substring(5)
          console.log("Lens Scan Name:", nameQuery)
          setName(nameQuery)
          
          // Check for passed image
          const cachedImg = sessionStorage.getItem('scanned_image_temp')
          if (cachedImg) {
             setPreviewUrl(cachedImg)
             // Convert base64 to File for upload
             try {
                const res = await fetch(cachedImg)
                const blob = await res.blob()
                const file = new File([blob], "lens_capture.jpg", { type: "image/jpeg" })
                setImageFile(file)
             } catch (e) { console.error("Error converting cached img", e) }
             sessionStorage.removeItem('scanned_image_temp') // Cleanup
          }

      } else if (code.startsWith('text:')) {
          const rawText = code.substring(5)
          console.log("Lens Scan Text:", rawText)
          setName(rawText)
          
           // Check for passed image
          const cachedImg = sessionStorage.getItem('scanned_image_temp')
          if (cachedImg) {
             setPreviewUrl(cachedImg)
             try {
                const res = await fetch(cachedImg)
                const blob = await res.blob()
                const file = new File([blob], "lens_capture.jpg", { type: "image/jpeg" })
                setImageFile(file)
             } catch (e) { console.error("Error converting cached img", e) }
             sessionStorage.removeItem('scanned_image_temp')
          }
      } else {
          // Barcode Logic
          // If code is numeric and short/long, treat as barcode.
          // If it's just arbitrary, maybe fallback to name?
          if (/^\d+$/.test(code) && code.length > 3) {
             const product = await ProductService.searchProductByBarcode(code)
             if (product) {
               setName(product.name)
               if (product.image_url) setPreviewUrl(product.image_url)
             } else {
               alert(`Producto no encontrado (Barcode: ${code})`)
             }
          } else {
             // Fallback for weird codes -> Treat as name
             setName(code)
          }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      try {
        const options = {
          maxSizeMB: 0.5, // 500KB Max for lightweight speed
          maxWidthOrHeight: 1280, // 720p/HD suffices for thumbnails/previews
          useWebWorker: true,
          fileType: 'image/webp'
        }
        const compressedFile = await imageCompression(file, options)
        setImageFile(compressedFile)
        setPreviewUrl(URL.createObjectURL(compressedFile))
      } catch (error) {
        console.error('Error compressing image:', error)
      }
    }
  }

  const handleCreateAuxiliaryData = async (userId: string) => {
    let finalCategoryId = typeof categoryId === 'number' ? categoryId : null
    let finalLocationId = typeof locationId === 'number' ? locationId : null

    // Create Category if new
    if (categoryId === 'new' && newCategoryName.trim()) {
      const normalizedName = newCategoryName.trim()
      
      // Check existing
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', normalizedName)
        .maybeSingle() as any
      
      // .single() throws error if no rows found usually unless .maybeSingle() is used.
      // Let's use .maybeSingle() if available or catch error.
      // Standard supabase-js: .maybeSingle() returns data | null
      
      if (existing) {
         finalCategoryId = existing.id
      } else {
         // Insert
         const { data, error } = await (supabase
            .from('categories') as any)
            .insert([{ name: normalizedName, user_id: userId }])
            .select()
            .single()
         if (!error && data) finalCategoryId = data.id
      }
    }

    // Create Location if new
    if (locationId === 'new' && newLocationName.trim()) {
       const normalizedName = newLocationName.trim()

       const { data: existing } = await supabase
        .from('locations')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', normalizedName)
        .maybeSingle() as any
      
       if (existing) {
         finalLocationId = existing.id
       } else {
         const { data, error } = await (supabase
          .from('locations') as any)
          .insert([{ name: normalizedName, user_id: userId }])
          .select()
          .single()
         if (!error && data) finalLocationId = data.id
       }
    }

    return { finalCategoryId, finalLocationId }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No authenticated user")

      // 1. Upload Image
      let imageUrl = previewUrl
      if (imageFile) {
        const fileName = `${uuidv4()}.webp`
        const { error: uploadError } = await supabase.storage
          .from('inventory_images')
          .upload(fileName, imageFile)

        if (uploadError) {
          console.error("Image Upload Failed:", uploadError)
          throw new Error(`Error subiendo imagen: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('inventory_images')
          .getPublicUrl(fileName)
        imageUrl = publicUrl
      }

      // 2. Handle New Categories/Locations
      const { finalCategoryId, finalLocationId } = await handleCreateAuxiliaryData(user.id)

      // [NEW] 3. Generate Embedding (Client-Side)
      let embedding = null
      try {
        const textToEmbed = `${name} ${finalCategoryId ? 'Categoría ID ' + finalCategoryId : ''} ${finalLocationId ? 'Ubicación ID ' + finalLocationId : ''}`
        embedding = await EmbeddingService.generateEmbedding(textToEmbed)
      } catch (embError) {
        console.error("Embedding generation failed (skipping):", embError)
      }

      const basePayload = {
        name,
        quantity,
        image_url: imageUrl,
        description: name, // Using name as description for now
        category_id: finalCategoryId,
        location_id: finalLocationId,
        unit: 'pz',
        expiry_date: expiryDate || null,
        is_consumed: false,
        is_private: isPrivate,
        embedding: embedding
      }

      console.log("Submitting Payload:", basePayload)
      
      if (initialData) {
         // Update
         const { error } = await (supabase
            .from('inventory_items') as any)
            .update({ ...basePayload, user_id: user.id })
            .eq('id', initialData.id)
            
         if (error) throw error
         
         // Update local store immediately
         // @ts-ignore
         updateInventoryItem(initialData.id, { ...initialData, ...basePayload, user_id: user.id })
      } else {
         // Create
         await addItem(basePayload)
      }

      router.push('/')
    } catch (error: any) {
      console.error('Error saving item raw:', error)
      console.error('Error saving item json:', JSON.stringify(error, null, 2))
      alert(`Error guardando: ${error.message || JSON.stringify(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* Image Preview */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-56 bg-secondary/30 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-all relative overflow-hidden group"
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white h-8 w-8" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-secondary rounded-full">
               <Camera className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Toca para foto</span>
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        
        <div className="absolute top-2 right-2">
           <Button 
             type="button" 
             variant="secondary" 
             size="sm" 
             className="shadow-sm opacity-90 hover:opacity-100"
             onClick={(e) => {
               e.stopPropagation()
               setShowScanner(true)
             }}
           >
             <Scan className="h-4 w-4 mr-2" /> Escanear
           </Button>
        </div>
      </div>
      
      {showScanner && (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Producto</label>
          <Input 
            required 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ej: Leche deslactosada" 
            className="h-12 text-lg"
          />
        </div>

        {/* Quantity & Privacy Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Cantidad</label>
            <div className="flex items-center h-12 border border-input rounded-md bg-background overflow-hidden relative">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full hover:bg-secondary flex items-center justify-center text-lg active:bg-secondary/80">-</button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="flex-1 text-center font-bold text-lg border-none focus-visible:ring-0 bg-transparent h-full"
              />
              <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-full hover:bg-secondary flex items-center justify-center text-lg active:bg-secondary/80">+</button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Visibilidad</label>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={cn(
                "w-full h-12 rounded-md border flex items-center justify-center gap-2 font-medium transition-all active:scale-95",
                isPrivate 
                  ? "bg-stone-800 text-stone-50 border-stone-900" 
                  : "bg-background text-foreground border-input hover:bg-secondary"
              )}
            >
              {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {isPrivate ? "Privado" : "Público"}
            </button>
          </div>
        </div>

        {/* Categories Select */}
        <div className="space-y-1">
           <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-1">
             <Tag className="h-3 w-3" /> Categoría
           </label>
           <select 
             className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
             value={categoryId === 'new' ? 'new' : categoryId || ''}
             onChange={(e) => {
               const val = e.target.value
               setCategoryId(val === 'new' ? 'new' : val ? parseInt(val) : null)
             }}
           >
             <option value="">Sin Categoría</option>
             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             <option value="new">+ Crear nueva...</option>
           </select>
           
           <AnimatePresence>
             {categoryId === 'new' && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                 <Input 
                   placeholder="Nombre de nueva categoría..." 
                   className="mt-2" 
                   value={newCategoryName}
                   onChange={e => setNewCategoryName(e.target.value)}
                   autoFocus
                 />
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Location Select */}
        <div className="space-y-1">
           <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-1">
             <MapPin className="h-3 w-3" /> Ubicación
           </label>
           <select 
             className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
             value={locationId === 'new' ? 'new' : locationId || ''}
             onChange={(e) => {
               const val = e.target.value
               setLocationId(val === 'new' ? 'new' : val ? parseInt(val) : null)
             }}
           >
             <option value="">Sin Ubicación</option>
             {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
             <option value="new">+ Crear nueva...</option>
           </select>

           <AnimatePresence>
             {locationId === 'new' && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                 <Input 
                   placeholder="Nombre de nueva ubicación..." 
                   className="mt-2" 
                   value={newLocationName}
                   onChange={e => setNewLocationName(e.target.value)}
                   autoFocus
                 />
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Expiry Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-1">
             <Calendar className="h-3 w-3" /> Vencimiento (Opcional)
           </label>
          <Input 
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            className="h-12"
          />
        </div>

      </div>

      <Button type="submit" className="w-full h-14 text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
        Guardar Producto
      </Button>
    </form>
  )
}
