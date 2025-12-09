'use client'

import { Clock, TrendingUp, Package } from "lucide-react"
import { FilterType } from "@/hooks/useInventory"
import { cn } from "@/lib/utils"

interface StatsProps {
  stats: {
    total: number
    lowStock: number
    expired: number
  }
  currentFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

export function StatsOverview({ stats, currentFilter, onFilterChange }: StatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-2 lg:gap-6">
      <div 
        onClick={() => onFilterChange('expired')}
        className={cn(
          "flex flex-col p-3 lg:p-5 rounded-xl border shadow-sm transition-all hover:scale-105 cursor-pointer relative overflow-hidden",
          currentFilter === 'expired' 
            ? "bg-soft-red/20 border-soft-red ring-2 ring-soft-red/50" 
            : "bg-soft-red/10 border-soft-red/20 hover:bg-soft-red/15"
        )}
      >
        <Clock className="w-4 h-4 lg:w-8 lg:h-8 mb-2 text-soft-red" />
        <span className="text-2xl lg:text-4xl font-bold tracking-tight text-soft-red">{stats?.expired || 0}</span>
        <span className="text-[10px] lg:text-sm font-bold uppercase text-soft-red/70">Vencidos</span>
      </div>

      <div 
        onClick={() => onFilterChange('lowStock')}
        className={cn(
            "flex flex-col p-3 lg:p-5 rounded-xl border shadow-sm transition-all hover:scale-105 cursor-pointer relative overflow-hidden",
            currentFilter === 'lowStock' 
              ? "bg-soft-yellow/20 border-soft-yellow ring-2 ring-soft-yellow/50" 
              : "bg-soft-yellow/10 border-soft-yellow/20 hover:bg-soft-yellow/15"
          )}
      >
        <TrendingUp className="w-4 h-4 lg:w-8 lg:h-8 mb-2 text-soft-yellow" />
        <span className="text-2xl lg:text-4xl font-bold tracking-tight text-soft-yellow">{stats?.lowStock || 0}</span>
        <span className="text-[10px] lg:text-sm font-bold uppercase text-soft-yellow/70">Bajo Stock</span>
      </div>

      <div 
        onClick={() => onFilterChange('all')}
        className={cn(
            "flex flex-col p-3 lg:p-5 rounded-xl border shadow-sm transition-all hover:scale-105 cursor-pointer relative overflow-hidden",
            currentFilter === 'all' 
              ? "bg-soft-green/20 border-soft-green ring-2 ring-soft-green/50" 
              : "bg-soft-green/10 border-soft-green/20 hover:bg-soft-green/15"
          )}
      >
        <Package className="w-4 h-4 lg:w-8 lg:h-8 mb-2 text-soft-green" />
        <span className="text-2xl lg:text-4xl font-bold tracking-tight text-soft-green">{stats?.total || 0}</span>
        <span className="text-[10px] lg:text-sm font-bold uppercase text-soft-green/70">Total</span>
      </div>
    </div>
  )
}
