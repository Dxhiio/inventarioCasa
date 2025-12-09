import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useStore } from '@/store/useStore'
import { Database } from '@/types/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export type FilterType = 'all' | 'expired' | 'lowStock'

export function useInventory() {
  const supabase = createClient()
  const { 
    inventory, setInventory, addInventoryItem, updateInventoryItem, removeInventoryItem, appendInventoryItems,
    locations, setLocations, addLocation,
    categories, setCategories
  } = useStore()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination State
  const ITEMS_PER_PAGE = 12
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Filter State
  const [filterType, setFilterTypeState] = useState<FilterType>('all')

  // Stats State (Server-Side)
  const [stats, setStats] = useState({ total: 0, lowStock: 0, expired: 0 })

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Total Items
    const { count: total } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
    
    // Low Stock (quantity <= 1)
    const { count: lowStock } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .lte('quantity', 1)

    // Expired (expiry_date < now)
    const { count: expired } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .not('expiry_date', 'is', null) // filter out nulls first
      .lt('expiry_date', new Date().toISOString())

    setStats({
      total: total || 0,
      lowStock: lowStock || 0,
      expired: expired || 0
    })
  }

  useEffect(() => {
    // Initial fetch
    fetchInventory(0, true)
    fetchStats()

    // Realtime subscription
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload) => {
           // On any change, re-fetch stats to be safe
           fetchStats()

           if (payload.eventType === 'INSERT') {
             // Only add if it matches current filter? 
             // For simplicity, we might just re-fetch or let specific logic handle it.
             // But simplest is push to store if 'all'.
             if (filterType === 'all') addInventoryItem(payload.new as InventoryItem)
           } else if (payload.eventType === 'UPDATE') {
             updateInventoryItem(payload.new.id, payload.new as InventoryItem)
           } else if (payload.eventType === 'DELETE') {
             removeInventoryItem(payload.old.id as number)
           }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filterType]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInventory = async (pageIndex = 0, reset = false) => {
    try {
      if (reset) setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user && !reset) return

      let query = supabase
        .from('inventory_items')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
      
      // Apply Filters
      if (filterType === 'expired') {
        query = query
          .not('expiry_date', 'is', null)
          .lt('expiry_date', new Date().toISOString())
      } else if (filterType === 'lowStock') {
        query = query.lte('quantity', 1)
      }

      // Apply Pagination
      const { data: itemsData, error: itemsError, count } = await query
        .range(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE - 1)

      if (itemsError) throw itemsError

      if (reset) {
         setInventory(itemsData || [])
         setPage(1)
         // fetchStats() // Ensure stats are fresh on manual refresh/reset
      } else {
         if (itemsData && itemsData.length > 0) {
            appendInventoryItems(itemsData)
            setPage(prev => prev + 1)
         }
      }

      // Check if we reached the end
      if (itemsData && itemsData.length < ITEMS_PER_PAGE) {
          setHasMore(false)
      } else {
          setHasMore(true)
      }

      // Fetch Aux Data only on initial load
      if (reset) {
          const { data: locs } = await supabase.from('locations').select('*').order('name')
          if (locs) setLocations(locs)
          
          const { data: cats } = await supabase.from('categories').select('*').order('name')
          if (cats) setCategories(cats)
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Unknown error")
      }
    } finally {
      if (reset) setLoading(false)
    }
  }

  const fetchNextPage = () => {
      if (!loading && hasMore) {
          fetchInventory(page, false)
      }
  }

  const setFilterType = (type: FilterType) => {
    setFilterTypeState(type)
    // Effect will trigger fetch due to dependency change? 
    // Actually no, better to trigger it manually or add to dependency array of a generic fetch effect.
    // Given current structure, we need to manually trigger reset.
    // But setting state is async. So useEffect [filterType] is better pattern for the reset.
  }
  
  // Effect to refetch when filter changes
  useEffect(() => {
    fetchInventory(0, true)
  }, [filterType])

  const addItem = async (newItem: Omit<InventoryItem, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No authenticated user")
      
      const { data, error } = await supabase
        .from('inventory_items')
        // @ts-ignore
        .insert([{ ...newItem, user_id: user.id }])
        .select()
        .single()
      
      if (!error) fetchStats()
      
      if (error) {
        console.error("Supabase Insert Error:", error)
        console.error("Error Code:", error.code)
        console.error("Error Message:", error.message)
        console.error("Error Details:", error.details)
        throw error
      }
      return data
  }

  return {
    inventory,
    loading,
    error,
    addItem,
    refresh: () => fetchInventory(0, true),
    locations,
    addLocation,
    categories,
    // Pagination Exports
    fetchNextPage,
    hasMore,
    totalItems: stats.total, // Map legacy totalItems to new real total
    stats, // Export stats
    updateInventoryItem, // Export store action
    filterType,
    setFilterType
  }
}
