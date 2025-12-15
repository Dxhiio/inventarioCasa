'use client'

import { AddItemForm } from "@/components/inventory/AddItemForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

export default function AddItemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      </div>
      
      <Suspense fallback={<div className="flex justify-center p-8"><span className="animate-spin">⌛</span></div>}>
        <AddItemForm />
      </Suspense>
    </div>
  )
}
