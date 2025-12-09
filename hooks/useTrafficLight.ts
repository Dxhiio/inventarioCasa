import { isPast, addDays, isBefore } from "date-fns"
import { Database } from "@/types/supabase"

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export function useTrafficLight() {
  const getTrafficLight = (item: InventoryItem) => {
    if (item.quantity === 0 || (item.expiry_date && isPast(new Date(item.expiry_date)))) {
      return { color: "bg-soft-red", status: "Crítico" }
    }
    if (item.quantity === 1 || (item.expiry_date && isBefore(new Date(item.expiry_date), addDays(new Date(), 3)))) {
      return { color: "bg-soft-yellow", status: "Atención" }
    }
    return { color: "bg-soft-green", status: "Bien" }
  }

  const firstExpiryColor = (dateString: string) => {
    if (isPast(new Date(dateString))) return "text-destructive font-bold"
    if (isBefore(new Date(dateString), addDays(new Date(), 3))) return "text-amber-500 font-bold"
    return ""
  }

  return { getTrafficLight, firstExpiryColor }
}
