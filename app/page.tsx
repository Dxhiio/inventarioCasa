'use client'

import { useInventory } from "@/hooks/useInventory"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { InventoryGrid } from "@/components/dashboard/InventoryGrid"

export default function Home() {
  const { inventory, loading, fetchNextPage, hasMore, stats, filterType, setFilterType } = useInventory()

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* --- FIXED SECTION --- */}
      <div className="flex-none z-10 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="px-5 pt-6 pb-2 max-w-[1800px] mx-auto w-full lg:px-12 lg:pt-10">
           <DashboardHeader />
           <StatsOverview 
             stats={stats} 
             currentFilter={filterType}
             onFilterChange={setFilterType}
           />
        </div>
      </div>

      {/* --- SCROLLABLE GRID --- */}
      <InventoryGrid 
        inventory={inventory} 
        loading={loading} 
        hasMore={hasMore} 
        fetchNextPage={fetchNextPage} 
      />
      
      {/* Functional Links (Bottom Overlay or Sticky) */}
    </div>
  )
}
