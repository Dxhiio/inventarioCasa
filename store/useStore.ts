import { create } from 'zustand'
import { Database } from '@/types/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Location = Database['public']['Tables']['locations']['Row']

interface StoreState {
  inventory: InventoryItem[]
  categories: Category[]
  locations: Location[]
  setInventory: (items: InventoryItem[]) => void
  setCategories: (categories: Category[]) => void
  setLocations: (locations: Location[]) => void
  addInventoryItem: (item: InventoryItem) => void
  updateInventoryItem: (id: number, updates: Partial<InventoryItem>) => void
  removeInventoryItem: (id: number) => void
  addLocation: (location: Location) => void
  appendInventoryItems: (items: InventoryItem[]) => void
}

export const useStore = create<StoreState>((set) => ({
  inventory: [],
  categories: [],
  setInventory: (items) => set({ inventory: items }),
  setCategories: (categories) => set({ categories }),
  addInventoryItem: (item) => set((state) => ({ inventory: [item, ...state.inventory] })),
  updateInventoryItem: (id, updates) =>
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeInventoryItem: (id) =>
    set((state) => ({
      inventory: state.inventory.filter((item) => item.id !== id),
    })),
  locations: [],
  rooms: [], // Legacy/Placeholder if needed or just remove
  setLocations: (locations) => set({ locations }),
  addLocation: (location) => set((state) => ({ locations: [...state.locations, location] })),
  appendInventoryItems: (newItems) => set((state) => {
    // Prevent duplicates just in case
    const existingIds = new Set(state.inventory.map(i => i.id))
    const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id))
    return { inventory: [...state.inventory, ...uniqueNewItems] }
  }),
}))
