'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface ScanResult {
  type: 'barcode' | 'label' | 'manual'
  value: string
  spirit?: {
    id: string
    name: string
    brand: string
    category: string
    image: string
    rating: number
    msrp: number
  }
  confidence?: number
}

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [scanMode, setScanMode] = useState<'barcode' | 'label'>('barcode')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flashOn, setFlashOn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentScans, setRecentScans] = useState<ScanResult[]>([])
  const [showAddOptions, setShowAddOptions] = useState(false)

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
        setError(null)
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.')
      console.error('Camera error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }, [])

  // Toggle flash
  const toggleFlash = async () => {
    if (videoRef.current?.srcObject) {
      const track = (videoRef.current.srcObject as MediaStream).getVideoTracks()[0]
      const capabilities = track.getCapabilities() as any
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn } as any]
        })
        setFlashOn(!flashOn)
      }
    }
  }

  // Simulate scan (in production, this would use a barcode library like zxing or AI vision)
  const performScan = async () => {
    setIsScanning(true)
    
    // Simulate processing
    await new Promise(r => setTimeout(r, 1500))
    
    // Simulate finding a spirit
    const mockResults: ScanResult[] = [
      {
        type: 'barcode',
        value: '080686001010',
        confidence: 0.95,
        spirit: {
          id: '1',
          name: 'Buffalo Trace Kentucky Straight Bourbon',
          brand: 'Buffalo Trace',
          category: 'Bourbon',
          image: '',
          rating: 88,
          msrp: 30
        }
      },
      {
        type: 'barcode',
        value: '080432400432',
        confidence: 0.92,
        spirit: {
          id: '2',
          name: 'Maker\'s Mark',
          brand: 'Maker\'s Mark',
          category: 'Bourbon',
          image: '',
          rating: 85,
          msrp: 28
        }
      },
      {
        type: 'barcode',
        value: '088076181113',
        confidence: 0.88,
        spirit: {
          id: '3',
          name: 'Blanton\'s Original Single Barrel',
          brand: 'Blanton\'s',
          category: 'Bourbon',
          image: '',
          rating: 92,
          msrp: 65
        }
      }
    ]
    
    const found = mockResults[Math.floor(Math.random() * mockResults.length)]
    setResult(found)
    setRecentScans(prev => [found, ...prev.slice(0, 4)])
    setIsScanning(false)
    setShowAddOptions(true)
  }

  // Manual search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsScanning(true)
    await new Promise(r => setTimeout(r, 800))
    
    // Mock search result
    setResult({
      type: 'manual',
      value: searchQuery,
      spirit: {
        id: '4',
        name: searchQuery,
        brand: 'Search Result',
        category: 'Bourbon',
        image: '',
        rating: 0,
        msrp: 0
      }
    })
    setIsScanning(false)
    setShowAddOptions(true)
  }

  // Add to collection/wishlist
  const addToCollection = () => {
    alert(`Added ${result?.spirit?.name} to your collection!`)
    setShowAddOptions(false)
    setResult(null)
  }

  const addToWishlist = () => {
    alert(`Added ${result?.spirit?.name} to your wishlist!`)
    setShowAddOptions(false)
    setResult(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/collection" className="hover:text-amber-400 transition-colors">Collection</Link>
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">📸 Bottle Scanner</h1>
          <p className="text-gray-400">Scan a barcode or label to instantly add to your collection</p>
        </div>

        {/* Scan Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setScanMode('barcode')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              scanMode === 'barcode' ? 'bg-amber-600' : 'bg-stone-800 text-gray-400'
            }`}
          >
            📊 Barcode
          </button>
          <button
            onClick={() => setScanMode('label')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              scanMode === 'label' ? 'bg-amber-600' : 'bg-stone-800 text-gray-400'
            }`}
          >
            🏷️ Label
          </button>
        </div>

        {/* Camera View */}
        <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden mb-6">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-64 h-64 border-2 ${isScanning ? 'border-amber-400 animate-pulse' : 'border-white/50'} rounded-lg`}>
                  {/* Corner markers */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />
                </div>
                {isScanning && (
                  <div className="absolute w-64 h-1 bg-amber-500 animate-scan" />
                )}
              </div>
              {/* Camera controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={toggleFlash}
                  className={`w-12 h-12 rounded-full ${flashOn ? 'bg-amber-500' : 'bg-white/20'} flex items-center justify-center backdrop-blur-sm`}
                >
                  ⚡
                </button>
                <button
                  onClick={performScan}
                  disabled={isScanning}
                  className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-2xl disabled:opacity-50"
                >
                  {isScanning ? '⏳' : '📸'}
                </button>
                <button
                  onClick={stopCamera}
                  className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center backdrop-blur-sm"
                >
                  ✕
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-400 mb-4">Camera not active</p>
              <button
                onClick={startCamera}
                className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Camera
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Manual Search */}
        <div className="bg-stone-800/50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-3">🔍 Or Search Manually</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter spirit name or UPC..."
              className="flex-1 bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-amber-600 hover:bg-amber-500 px-4 rounded-lg font-semibold transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Scan Result */}
        {result && showAddOptions && (
          <div className="bg-gradient-to-br from-amber-900/40 to-stone-800/40 rounded-xl p-6 mb-6 border border-amber-500/50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center text-4xl">
                🥃
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{result.spirit?.name}</h3>
                <p className="text-gray-400">{result.spirit?.brand} • {result.spirit?.category}</p>
                <div className="flex items-center gap-3 mt-2">
                  {result.spirit?.rating ? (
                    <span className="text-amber-400">⭐ {result.spirit.rating}</span>
                  ) : null}
                  {result.spirit?.msrp ? (
                    <span className="text-green-400">${result.spirit.msrp}</span>
                  ) : null}
                </div>
                {result.confidence && (
                  <p className="text-xs text-gray-500 mt-1">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={addToCollection}
                className="bg-amber-600 hover:bg-amber-500 py-3 rounded-lg font-semibold transition-colors"
              >
                📦 Add to Collection
              </button>
              <button
                onClick={addToWishlist}
                className="bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold transition-colors"
              >
                ⭐ Add to Wishlist
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button className="bg-stone-700/50 hover:bg-stone-600 py-2 rounded-lg text-sm transition-colors">
                📝 Add Note
              </button>
              <button className="bg-stone-700/50 hover:bg-stone-600 py-2 rounded-lg text-sm transition-colors">
                👀 View Details
              </button>
              <button
                onClick={() => {
                  setShowAddOptions(false)
                  setResult(null)
                }}
                className="bg-stone-700/50 hover:bg-stone-600 py-2 rounded-lg text-sm transition-colors"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">📋 Recent Scans</h3>
            <div className="space-y-2">
              {recentScans.map((scan, i) => (
                <div
                  key={i}
                  className="bg-stone-800/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-stone-700/50 transition-colors"
                  onClick={() => {
                    setResult(scan)
                    setShowAddOptions(true)
                  }}
                >
                  <div className="w-10 h-10 bg-amber-900/50 rounded flex items-center justify-center">🥃</div>
                  <div className="flex-1">
                    <p className="font-medium">{scan.spirit?.name}</p>
                    <p className="text-sm text-gray-400">{scan.spirit?.brand}</p>
                  </div>
                  <span className="text-amber-400">→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-stone-800/30 rounded-xl p-4">
          <h3 className="font-semibold mb-2">💡 Scanning Tips</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Hold the bottle 6-12 inches from the camera</li>
            <li>• Ensure good lighting (use flash if needed)</li>
            <li>• For labels, capture the full front label</li>
            <li>• Barcodes work best when parallel to camera</li>
            <li>• If scanning fails, try manual search</li>
          </ul>
        </div>
      </main>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100px); }
        }
        .animate-scan {
          animation: scan 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
