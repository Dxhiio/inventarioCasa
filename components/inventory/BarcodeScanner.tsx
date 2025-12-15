'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { X, Camera, Zap, ZapOff } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
  onCapture?: (imageBlob: Blob) => void
}

export function BarcodeScanner({ onScan, onClose, onCapture }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  // const [cameras, setCameras] = useState<any[]>([])

  useEffect(() => {
    const startScanner = async () => {
      try {
        // Use a slight delay to ensure container is ready
        setTimeout(async () => {
          const formattedId = "reader"
          
          // Cleanup existing if any (react strict mode double mount)
          if (scannerRef.current) {
             try { await scannerRef.current.stop() } catch (e) {}
             scannerRef.current = null
          }

          const html5QrCode = new Html5Qrcode(formattedId)
          scannerRef.current = html5QrCode

          const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [ 
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.QR_CODE 
            ]
          }

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
               // Success
               onScan(decodedText)
               // Stop scanning on first success? Or let parent decide. 
               // usually better to wait for parent to close or pause.
            },
            (errorMessage) => {
              // Parse error, ignore common ones
            }
          )
          
          setIsScanning(true)
        }, 100)

      } catch (err) {
        console.error("Error starting scanner", err)
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [onScan])

  const toggleTorch = async () => {
     if (!scannerRef.current) return
     try {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn } as any]
        });
        setTorchOn(!torchOn)
     } catch (err) {
        console.error("Torch not supported", err)
     }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
       <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
         <div id="reader" className="w-full h-full max-w-lg mx-auto"></div>
         
         {/* Overlay Guide or Controls */}
         <div className="absolute top-4 right-4 flex flex-col gap-4">
            <Button variant="ghost" size="icon" className="text-white bg-black/50 rounded-full h-12 w-12" onClick={onClose}>
               <X className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/50 rounded-full h-12 w-12" onClick={toggleTorch}>
               {torchOn ? <Zap className="h-6 w-6 text-yellow-500" /> : <ZapOff className="h-6 w-6" />}
            </Button>
         </div>
       </div>
       
       <div className="p-6 bg-stone-900 text-white pb-10">
          <p className="text-center text-sm text-stone-400 mb-4">Apunta el código de barras a la cámara</p>
          {/* Fallback Manual Capture if scanner fails or user just wants a photo */}
          {/* Note: Html5Qrcode doesn't easily export the frame blob without canvas manip. 
              For now, we just rely on scanning. 
          */}
       </div>
    </div>
  )
}
