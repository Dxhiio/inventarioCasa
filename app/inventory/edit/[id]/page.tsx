'use client'

import { useEffect, useState } from 'react'
import { AddItemForm } from "@/components/inventory/AddItemForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export default function EditItemPage() {
  const params = useParams()
  const { id } = params
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setItem(data)
      } else {
        console.error("Error fetching item:", error)
      }
      setLoading(false)
    }

    fetchItem()
  }, [id])

  if (loading) {
    return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!item) {
    return (
        <div className="h-screen flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-bold mb-4">Producto no encontrado</h2>
            <Link href="/">
                <Button>Volver al Inicio</Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="space-y-6 container mx-auto p-4 max-w-lg">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>
      
      <AddItemForm initialData={item} />
    </div>
  )
}
