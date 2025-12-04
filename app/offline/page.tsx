'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white flex items-center justify-center">
      <div className="text-center px-4 max-w-md">
        <div className="text-8xl mb-6">📡</div>
        <h1 className="text-4xl font-bold mb-4">You're Offline</h1>
        <p className="text-gray-400 mb-8">
          It looks like you've lost your internet connection. Don't worry - your collection data is saved locally and will sync when you're back online.
        </p>
        
        <div className="space-y-4">
          <div className="bg-stone-800/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">📦 What you can still do:</h3>
            <ul className="text-sm text-gray-400 text-left space-y-1">
              <li>• View your cached collection</li>
              <li>• Add tasting notes (will sync later)</li>
              <li>• Browse recently viewed spirits</li>
              <li>• Update bottle levels</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded-lg font-semibold transition-colors"
          >
            🔄 Try Again
          </button>

          <Link
            href="/collection"
            className="block w-full bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            📦 View Offline Collection
          </Link>
        </div>

        <p className="text-xs text-gray-600 mt-8">
          BarrelVerse works best with an internet connection
        </p>
      </div>
    </div>
  )
}
