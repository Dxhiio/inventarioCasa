'use client'

import { BarcodeScanner } from "@/components/inventory/BarcodeScanner"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const router = useRouter()

  const handleScan = (code: string) => {
    // Redirect to add item page with the scanned barcode
    router.push(`/inventory/add?barcode=${encodeURIComponent(code)}`)
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
       <BarcodeScanner 
         onScan={handleScan} 
         onClose={handleClose} 
       />
    </div>
  )
}
