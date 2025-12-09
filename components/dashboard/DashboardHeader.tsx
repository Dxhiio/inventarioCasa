'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function DashboardHeader() {
  return (
    <header className="flex justify-between items-end mb-4 lg:mb-8">
      <div>
        <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Mi Casa
        </h1>
        <p className="text-muted-foreground mt-0.5 text-xs lg:text-base font-semibold uppercase tracking-wide">
          {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date())}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle />
        <Link href="/inventory/add">
           <Button className="rounded-full h-11 w-11 lg:h-14 lg:w-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform active:scale-95">
            <Plus className="h-5 w-5 lg:h-7 lg:w-7" />
           </Button>
        </Link>
      </div>
    </header>
  )
}
