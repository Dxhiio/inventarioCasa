'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { X, Camera, Zap, ZapOff } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
  onCapture?: (imageBlob: Blob) => void // Kept for interface compatibility but not implemented
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  
  // State
  const [isScanning, setIsScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initStatus, setInitStatus] = useState("Iniciando cámara...")
  
  // Debug logs
  const [logs, setLogs] = useState<string[]>([])
  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), msg])

  const startScanner = async () => {
      if (isScanning) return
      setInitStatus("Iniciando...")
      setError(null)
      addLog("Start initiated...")
      
      try {
        const formattedId = "reader"
        
        // 1. Initialize
        addLog("Creating instance...")
        if (scannerRef.current) {
             try { await scannerRef.current.stop() } catch (e) {}
             scannerRef.current = null
        }
        const html5QrCode = new Html5Qrcode(formattedId)
        scannerRef.current = html5QrCode

        // 2. Start directly (skip getCameras to avoid permission race conditions/bugs)
        addLog("Calling start() with native constraints...")
        
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
            (err) => { 
                // ignore parse errors, too noisy
            }
        )
        
        addLog("Camera started successfully!")
        setIsScanning(true)
        setInitStatus("")

      } catch (err: any) {
        const msg = err?.message || JSON.stringify(err)
        addLog("Error: " + msg)
        console.error("Camera start error:", err)
        setError(msg)
        setInitStatus("")
        setIsScanning(false)
      }
  }

  // Auto-start effort on mount
  useEffect(() => {
     let mounted = true
     addLog("Component mounted")
     
     const timer = setTimeout(() => {
        if (mounted) {
            addLog("Auto-starting...")
            startScanner()
        }
     }, 500)
     
     return () => {
         mounted = false
         clearTimeout(timer)
         if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(console.error)
         }
     }
  }, []) // eslint-disable-line

  const toggleTorch = async () => {
     if (!scannerRef.current) return
     try {
        // @ts-ignore
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn } as any]
        });
        setTorchOn(!torchOn)
     } catch (err) {
        addLog("Torch error: " + err)
     }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
       <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
         <div id="reader" className="w-full h-full max-w-lg mx-auto bg-black"></div>
         
         {/* Debug Overlay (Tiny) */}
         <div className="absolute bottom-20 left-4 right-4 pointer-events-none z-40 opacity-70">
            {logs.map((l, i) => <p key={i} className="text-[10px] text-green-400 font-mono bg-black/50 p-1 mb-1">{l}</p>)}
         </div>

         {/* Start Button / Status Overlay */}
         {!isScanning && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 text-white p-6 text-center">
                 {error ? (
                    <>
                        <p className="text-red-400 font-bold mb-2">Error</p>
                        <p className="text-sm mb-6 max-w-xs">{error}</p>
                        <div className="flex gap-4">
                            <Button onClick={startScanner} variant="outline" className="text-black bg-white hover:bg-white/90">Reintentar</Button>
                            <Button onClick={onClose} variant="ghost" className="text-white">Cerrar</Button>
                        </div>
                    </>
                 ) : (
                    <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto mb-4 text-stone-400" />
                        <p className="mb-4 text-stone-300">{initStatus}</p>
                        <Button onClick={startScanner} className="mt-4 bg-primary text-primary-foreground">
                           Activar Cámara
                        </Button>
                    </div>
                 )}
             </div>
         )}
         
         {/* Controls (Close / Flash) */}
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
          <p className="text-center text-sm text-stone-400">Apunta el código de barras</p>
       </div>
    </div>
  )
}
