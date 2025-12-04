'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock store data
const STORES = [
  {
    id: 1,
    name: 'Total Wine & More',
    address: '123 Bourbon Blvd, Louisville, KY 40202',
    distance: '2.3 mi',
    rating: 4.5,
    reviews: 234,
    phone: '(502) 555-0123',
    hours: 'Open until 10pm',
    isOpen: true,
    type: 'Big Box',
    specialty: ['Bourbon', 'Allocated'],
    verified: true,
    recentDrops: ['Blanton\'s', 'Eagle Rare'],
    lat: 38.2527,
    lng: -85.7585,
    image: '🏪'
  },
  {
    id: 2,
    name: 'Liquor Barn',
    address: '456 Whiskey Way, Louisville, KY 40204',
    distance: '3.8 mi',
    rating: 4.8,
    reviews: 567,
    phone: '(502) 555-0456',
    hours: 'Open until 11pm',
    isOpen: true,
    type: 'Regional Chain',
    specialty: ['Bourbon', 'Rare Finds', 'Barrel Picks'],
    verified: true,
    recentDrops: ['Weller SR', 'E.H. Taylor'],
    lat: 38.2600,
    lng: -85.7400,
    image: '🥃'
  },
  {
    id: 3,
    name: 'Westport Whiskey & Wine',
    address: '789 Collector Lane, Louisville, KY 40206',
    distance: '5.1 mi',
    rating: 4.9,
    reviews: 189,
    phone: '(502) 555-0789',
    hours: 'Open until 9pm',
    isOpen: true,
    type: 'Specialty',
    specialty: ['Rare Whiskey', 'Single Barrel', 'Japanese'],
    verified: true,
    recentDrops: ['ORVW 10', 'Stagg Jr'],
    lat: 38.2700,
    lng: -85.7200,
    image: '⭐',
    featured: true
  },
  {
    id: 4,
    name: 'Costco',
    address: '1000 Wholesale Dr, Louisville, KY 40219',
    distance: '8.2 mi',
    rating: 4.2,
    reviews: 890,
    phone: '(502) 555-1000',
    hours: 'Closed',
    isOpen: false,
    type: 'Warehouse',
    specialty: ['Value', 'Kirkland'],
    verified: true,
    recentDrops: ['Buffalo Trace'],
    lat: 38.2100,
    lng: -85.8000,
    image: '🏬'
  },
  {
    id: 5,
    name: 'Party Mart',
    address: '555 Party Place, Lexington, KY 40507',
    distance: '72 mi',
    rating: 4.6,
    reviews: 345,
    phone: '(859) 555-0555',
    hours: 'Open until 12am',
    isOpen: true,
    type: 'Local Favorite',
    specialty: ['Kentucky Selection', 'Craft'],
    verified: false,
    recentDrops: ['Weller FP', 'Blantons'],
    lat: 38.0406,
    lng: -84.5037,
    image: '🎉'
  }
]

const STORE_TYPES = ['All', 'Big Box', 'Regional Chain', 'Specialty', 'Warehouse', 'Local Favorite']

export default function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStore, setSelectedStore] = useState<typeof STORES[0] | null>(null)
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance')
  const [showMap, setShowMap] = useState(true)

  const filteredStores = STORES.filter(store => {
    if (selectedType !== 'All' && store.type !== selectedType) return false
    if (onlyOpen && !store.isOpen) return false
    if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
    return b.rating - a.rating
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-emerald-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-emerald-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/prices" className="hover:text-amber-400 transition-colors">Prices</Link>
            <Link href="/whales" className="hover:text-amber-400 transition-colors">White Whales</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-emerald-600 to-green-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
            📍 STORE LOCATOR
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Find <span className="text-emerald-400">Bottles Near You</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover stores with the best selection, recent drops, and community ratings.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-stone-800/50 rounded-xl p-4 mb-6 border border-stone-700/50">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search stores or enter zip code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-stone-700 rounded-lg px-4 py-3"
            >
              {STORE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
              className="bg-stone-700 rounded-lg px-4 py-3"
            >
              <option value="distance">Nearest</option>
              <option value="rating">Highest Rated</option>
            </select>
            <label className="flex items-center gap-2 bg-stone-700 rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyOpen}
                onChange={(e) => setOnlyOpen(e.target.checked)}
                className="accent-emerald-500"
              />
              Open Now
            </label>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`px-4 py-3 rounded-lg ${showMap ? 'bg-emerald-600' : 'bg-stone-700'}`}
            >
              🗺️ Map
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Store List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{filteredStores.length} stores found</h2>
              <button className="text-emerald-400 text-sm hover:underline">
                📍 Update Location
              </button>
            </div>

            {filteredStores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`bg-stone-800/50 rounded-xl p-4 border transition-all cursor-pointer ${
                  selectedStore?.id === store.id
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-stone-700/50 hover:border-emerald-500/50'
                } ${store.featured ? 'bg-gradient-to-r from-emerald-900/20 to-stone-800/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-900/50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                    {store.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{store.name}</h3>
                      {store.verified && (
                        <span className="text-emerald-400" title="Verified">✓</span>
                      )}
                      {store.featured && (
                        <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{store.address}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-amber-400">⭐ {store.rating}</span>
                      <span className="text-gray-500">({store.reviews})</span>
                      <span className={store.isOpen ? 'text-green-400' : 'text-red-400'}>
                        {store.hours}
                      </span>
                    </div>
                    {store.recentDrops.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Recent:</span>
                        {store.recentDrops.map((drop, i) => (
                          <span key={i} className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded">
                            {drop}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">{store.distance}</p>
                    <p className="text-xs text-gray-500">{store.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map / Store Detail */}
          <div className="lg:sticky lg:top-24 h-fit">
            {showMap && !selectedStore && (
              <div className="bg-stone-800/50 rounded-2xl overflow-hidden border border-stone-700/50 aspect-square">
                <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 to-stone-800 flex flex-col items-center justify-center relative">
                  <span className="text-6xl mb-4">🗺️</span>
                  <p className="text-gray-400">Interactive Map</p>
                  <p className="text-sm text-gray-500">Click a store for details</p>
                  
                  {/* Fake map pins */}
                  <div className="absolute inset-0 pointer-events-none">
                    {filteredStores.slice(0, 5).map((store, i) => (
                      <div
                        key={store.id}
                        className="absolute animate-bounce"
                        style={{
                          top: `${20 + (i * 15)}%`,
                          left: `${25 + (i * 12)}%`
                        }}
                      >
                        <span className="text-2xl">{store.isOpen ? '📍' : '📌'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedStore && (
              <div className="bg-stone-800/50 rounded-2xl overflow-hidden border border-emerald-500/30">
                <div className="aspect-video bg-gradient-to-br from-emerald-900/50 to-stone-800 flex items-center justify-center relative">
                  <span className="text-9xl">{selectedStore.image}</span>
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="absolute top-4 right-4 bg-black/50 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{selectedStore.name}</h2>
                    {selectedStore.verified && (
                      <span className="text-emerald-400" title="Verified">✓</span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 mb-4">{selectedStore.address}</p>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-amber-400 text-lg">⭐ {selectedStore.rating}</span>
                    <span className="text-gray-500">({selectedStore.reviews} reviews)</span>
                    <span className={`font-semibold ${selectedStore.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedStore.hours}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <a
                      href={`tel:${selectedStore.phone}`}
                      className="bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-semibold text-center transition-colors"
                    >
                      📞 Call
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedStore.address)}`}
                      target="_blank"
                      className="bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold text-center transition-colors"
                    >
                      🧭 Directions
                    </a>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold mb-2">Specialty</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStore.specialty.map((spec, i) => (
                        <span key={i} className="bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full text-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold mb-2">🔥 Recent Drops</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStore.recentDrops.map((drop, i) => (
                        <span key={i} className="bg-amber-900/50 text-amber-400 px-3 py-1 rounded-full text-sm">
                          {drop}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold transition-colors">
                      🔔 Notify Me
                    </button>
                    <button className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold transition-colors">
                      ❤️ Save Store
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pro Tips */}
        <div className="mt-12 bg-gradient-to-r from-emerald-900/30 via-stone-800/30 to-emerald-900/30 rounded-2xl p-8 border border-emerald-500/30">
          <h2 className="text-2xl font-bold mb-6 text-center">💡 Hunting Tips from the Community</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-bold mb-2 text-emerald-400">📅 Best Days</h3>
              <p className="text-sm text-gray-400">
                Most stores receive shipments on Tuesday or Wednesday. Call ahead to ask about delivery days.
              </p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-bold mb-2 text-emerald-400">🤝 Build Relationships</h3>
              <p className="text-sm text-gray-400">
                Regular customers who buy more than just allocated bottles often get first dibs on rare finds.
              </p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-bold mb-2 text-emerald-400">📱 Follow Socially</h3>
              <p className="text-sm text-gray-400">
                Many stores announce drops on Instagram or Facebook. Turn on notifications for your favorites.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
