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
  const [error, setError] = useState<string | null>(null)
  const [initStatus, setInitStatus] = useState("Iniciando cámara...")

  useEffect(() => {
    const startScanner = async () => {
      try {
        await new Promise(r => setTimeout(r, 100))
        
        const formattedId = "reader"
        if (scannerRef.current) {
            try { await scannerRef.current.stop() } catch (e) {}
        }

        const html5QrCode = new Html5Qrcode(formattedId)
        scannerRef.current = html5QrCode

        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                   onScan(decodedText)
                },
                (errorMessage) => {
                  // ignore frame parse errors
                }
            )
            setInitStatus("")
            setIsScanning(true)
        } catch (startError: any) {
            console.error("Start failed", startError)
            setError(startError?.message || "No se pudo iniciar la cámara. Verifica permisos.")
            setInitStatus("")
        }

      } catch (err: any) {
        console.error("Error setting up scanner", err)
        setError("Error inicializando el escáner.")
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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
       <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
         <div id="reader" className="w-full h-full max-w-lg mx-auto"></div>
         
         {/* Status / Error Overlay */}
         {!isScanning && !error && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 text-white">
                 <p>{initStatus}</p>
             </div>
         )}
         
         {error && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 text-white p-6 text-center">
                 <p className="text-red-400 font-bold mb-2">Error</p>
                 <p className="text-sm mb-6">{error}</p>
                 <Button onClick={onClose} variant="secondary">Cerrar</Button>
             </div>
         )}
         
         {/* Overlay Guide or Controls */}
         <div className="absolute top-4 right-4 flex flex-col gap-4 z-30">
            <Button variant="ghost" size="icon" className="text-white bg-black/50 rounded-full h-12 w-12" onClick={onClose}>
               <X className="h-6 w-6" />
            </Button>
            {isScanning && (
                <Button variant="ghost" size="icon" className="text-white bg-black/50 rounded-full h-12 w-12" onClick={toggleTorch}>
                {torchOn ? <Zap className="h-6 w-6 text-yellow-500" /> : <ZapOff className="h-6 w-6" />}
                </Button>
            )}
         </div>
       </div>
       
       <div className="p-6 bg-stone-900 text-white pb-10">
          <p className="text-center text-sm text-stone-400 mb-4">Apunta el código de barras a la cámara</p>
       </div>
    </div>
  )
}
