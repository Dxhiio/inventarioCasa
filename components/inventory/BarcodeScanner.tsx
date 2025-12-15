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
  const uniqueId = useRef(`reader-${Math.random().toString(36).slice(2)}`).current
  
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
      addLog("Start initiated (" + uniqueId + ")...")
      
      try {
        const formattedId = uniqueId
        
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

  // Visual / OCR Search
  const [isProcessingImg, setIsProcessingImg] = useState(false)

  const handleVisualScan = async () => {
     if (!scannerRef.current) return
     try {
       setIsProcessingImg(true)
       // Capture frame
       // getHtml5QrCode is private in library usually, but we can try capturing from video element if needed
       // Easier: use input capture if possible or the library's getState?
       // Currently, html5-qrcode doesn't expose easy snapshot unless strictly scanning.
       
       // Alternative: Stop scanner and let user take a photo with standard input or keep scanner distinct?
       // Let's use the 'onCapture' behavior pattern but implementing a manual snapshot from the active video stream.
       const video = document.querySelector("#" + uniqueId + " video") as HTMLVideoElement
       if (video) {
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(video, 0, 0)
          
          addLog("Capturing frame for OCR...")
          
          canvas.toBlob(async (blob) => {
             if (!blob) {
                 setIsProcessingImg(false)
                 return
             }
             
             // Dynamic import to avoid SSR issues with Tesseract
             const { OCRService } = await import('@/lib/ocrService')
             const { ProductService } = await import('@/lib/productService')
             
             addLog("Reading text...")
             const text = await OCRService.recognizeText(blob)
             
             if (text) {
                 addLog("Found: " + text.substring(0, 20) + "...")
                 // Optional: Ask user to confirm or just search?
                 // Let's search directly
                 const results = await ProductService.searchProductByName(text)
                 if (results && results.length > 0) {
                      addLog("Product found via OCR!")
                      // Use the first result's name to "scan"
                      // Simulate a scan success
                      onScan(results[0].name) // Passing name as code is tricky for the listener?
                      // The listener expects a barcode usually.
                      // But in app/scan/page.tsx, we do: router.push(...?barcode=code)
                      // If we pass a name, valid? 
                      // AddItemForm logic: if (initialBarcode) -> searchProductByBarcode(initialBarcode)
                      // If 'initialBarcode' is not a barcode, searchProductByBarcode returns null (usually).
                      
                      // CRITICAL: We need a way to pass "Found Product Data" directly or pass the Name as a search term.
                      // Hack: Pass a special prefix "name:QUERY"
                      onScan("name:" + results[0].name)
                 } else {
                      addLog("Text found but no product match.")
                      // If no product match, we can still pass the text to fill the name!
                      onScan("text:" + text)
                 }
             } else {
                 addLog("No readable text found.")
             }
             setIsProcessingImg(false)
          }, 'image/jpeg', 0.8)
       }
     } catch (e) {
        console.error(e)
        addLog("Error visual scan: " + e)
        setIsProcessingImg(false)
     }
  }

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
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
       <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
         <div id={uniqueId} className="w-full h-full max-w-lg mx-auto bg-black"></div>
         
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
                <div className="flex flex-col gap-4">
                    <Button variant="ghost" size="icon" className="text-white bg-black/50 rounded-full h-12 w-12" onClick={toggleTorch}>
                        {torchOn ? <Zap className="h-6 w-6 text-yellow-500" /> : <ZapOff className="h-6 w-6" />}
                    </Button>
                </div>
            )}
         </div>
         
         {/* Visual Scan Button (Bottom Center) */}
         {isScanning && (
            <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center">
                 <Button 
                   onClick={handleVisualScan} 
                   disabled={isProcessingImg}
                   className="rounded-full h-16 w-16 bg-white border-4 border-stone-300 shadow-xl flex items-center justify-center hover:bg-gray-100"
                 >
                    {isProcessingImg ? <div className="animate-spin text-black">⌛</div> : <Camera className="h-8 w-8 text-black" />}
                 </Button>
                 <p className="absolute -bottom-6 text-xs text-white/80 font-medium drop-shadow-md">
                    {isProcessingImg ? "Analizando..." : "Foto / OCR"}
                 </p>
            </div>
         )}
       </div>
       
       <div className="p-6 bg-stone-900 text-white pb-10">
          <p className="text-center text-sm text-stone-400">Escanea un código o toma foto al texto</p>
       </div>
    </div>
  )
}
