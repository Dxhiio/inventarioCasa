'use client'

import { BarcodeScanner } from "@/components/inventory/BarcodeScanner"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const router = useRouter()

  const handleScan = (code: string, imageData?: string) => {
    // If we have an image (Visual Scan), save it temporarily
    if (imageData) {
       sessionStorage.setItem('scanned_image_temp', imageData)
    }
    // Redirect to add item page with the scanned barcode/code
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
