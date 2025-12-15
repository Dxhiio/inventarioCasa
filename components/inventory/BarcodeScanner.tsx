'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { X, Camera, Zap, ZapOff } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (decodedText: string, imageData?: string) => void
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
      // WaitForElement helper
      const waitForElement = (id: string, retries = 10, delay = 300): Promise<HTMLElement | null> => {
          return new Promise((resolve) => {
              const check = (count: number) => {
                  const el = document.getElementById(id)
                  if (el) return resolve(el)
                  if (count <= 0) return resolve(null)
                  setTimeout(() => check(count - 1), delay)
              }
              check(retries)
          })
      }

      if (isScanning) return
      setInitStatus("Buscando cámara...")
      setError(null)
      
      try {
        const formattedId = uniqueId
        
        // 1. Wait for DOM (Critical for Modals)
        const container = await waitForElement(formattedId)
        if (!container) {
             throw new Error("No se pudo iniciar la cámara (DOM Error). Intenta abrirlo de nuevo.")
        }
        
        // 2. Initialize
        addLog("Iniciando motor...")
        if (scannerRef.current) {
             try { await scannerRef.current.stop() } catch (e) {}
             scannerRef.current = null
        }
        
        // Double check container is empty/clean to avoid "Element already contains..."
        // html5-qrcode demands exact handling, but usually overwrites if new instance?
        // Actually it throws if element is not empty usually? No, but good practice to allow library to handle it.
        
        const html5QrCode = new Html5Qrcode(formattedId)
        scannerRef.current = html5QrCode

        // 3. Start
        await html5QrCode.start(
            { facingMode: "environment" },
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            (decodedText) => onScan(decodedText),
            (err) => { /* ignore */ }
        )
        
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
     // Small delay to allow react render, then trigger start logic which has its own polling
     const timer = setTimeout(() => {
        if (mounted) startScanner()
     }, 100)
     
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
       
       // Robust Video Selector
       // html5-qrcode typically appends a <video> element inside the container ID
       let video = document.getElementById(uniqueId)?.querySelector("video") as HTMLVideoElement
       
       // Fallback: If not found immediately inside, try looking for any video in standard html5-qrcode classes?
       if (!video) {
           // Maybe the library wraps it in other divs
           const container = document.getElementById(uniqueId)
           if (container) {
               const videos = container.getElementsByTagName("video")
               if (videos.length > 0) video = videos[0]
           }
       }

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
             
             // Convert blob to base64 for passing
             const reader = new FileReader();
             reader.readAsDataURL(blob);
             reader.onloadend = async () => {
                 const base64data = reader.result as string;
                 
                 // Dynamic import
                 const { OCRService } = await import('@/lib/ocrService')
                 const { ProductService } = await import('@/lib/productService')
                 
                 addLog("Reading text...")
                 const text = await OCRService.recognizeText(blob)
                 
                 if (text) {
                     addLog("Found: " + text.substring(0, 20) + "...")
                     const results = await ProductService.searchProductByName(text)
                     
                     if (results && results.length > 0) {
                          addLog("Product found via OCR!")
                          // Pass result with image
                          onScan("name:" + results[0].name, base64data)
                     } else {
                          addLog("Text found but no product match.")
                          // Pass text with captured image
                          onScan("text:" + text, base64data)
                     }
                 } else {
                     addLog("No readable text found.")
                     // Still pass image? Maybe useful?
                     // onScan("image_only", base64data) 
                 }
                 setIsProcessingImg(false)
             }
          }, 'image/jpeg', 0.8)
       }
      } catch (e: any) {
        console.error(e)
        addLog("Error visual scan: " + (e?.message || e))
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
                    {isProcessingImg ? "Analizando..." : "Lens Scan"}
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
