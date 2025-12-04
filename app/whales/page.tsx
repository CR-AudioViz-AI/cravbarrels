'use client'

import { useState } from 'react'
import Link from 'next/link'

// Community's most hunted bottles
const COMMUNITY_WHALES = [
  {
    id: 1,
    name: 'Pappy Van Winkle 23 Year',
    hunters: 12450,
    foundThisWeek: 3,
    avgHuntTime: '4.2 years',
    msrp: 299,
    marketPrice: 5500,
    difficulty: 'Legendary',
    image: '🐋',
    tips: ['Call distillery gift shop in October', 'Build relationships with local stores', 'Consider Kentucky lottery']
  },
  {
    id: 2,
    name: 'George T. Stagg',
    hunters: 9870,
    foundThisWeek: 12,
    avgHuntTime: '2.1 years',
    msrp: 99,
    marketPrice: 650,
    difficulty: 'Very Hard',
    image: '🦈',
    tips: ['BTAC releases October-November', 'Follow store social media', 'Join local bourbon groups']
  },
  {
    id: 3,
    name: 'Blanton\'s Straight From The Barrel',
    hunters: 8450,
    foundThisWeek: 8,
    avgHuntTime: '1.8 years',
    msrp: 150,
    marketPrice: 450,
    difficulty: 'Very Hard',
    image: '🐬',
    tips: ['Duty Free shops sometimes have it', 'European allocation is higher', 'Buffalo Trace gift shop gets some']
  },
  {
    id: 4,
    name: 'William Larue Weller',
    hunters: 7230,
    foundThisWeek: 5,
    avgHuntTime: '2.5 years',
    msrp: 99,
    marketPrice: 950,
    difficulty: 'Very Hard',
    image: '🦑',
    tips: ['Part of BTAC collection', 'Kentucky residents have lottery access', 'Total Wine sometimes gets allocation']
  },
  {
    id: 5,
    name: 'Old Rip Van Winkle 10 (Lot B)',
    hunters: 6540,
    foundThisWeek: 18,
    avgHuntTime: '1.2 years',
    msrp: 80,
    marketPrice: 650,
    difficulty: 'Hard',
    image: '🐠',
    tips: ['More available than 15/20/23', 'Released same time as others', 'Check Total Wine and Costco']
  },
  {
    id: 6,
    name: 'Weller 12 Year',
    hunters: 5890,
    foundThisWeek: 45,
    avgHuntTime: '8 months',
    msrp: 40,
    marketPrice: 120,
    difficulty: 'Hard',
    image: '🐟',
    tips: ['Ohio state stores get regular allocation', 'Tuesday delivery days are best', 'Keep checking back frequently']
  },
  {
    id: 7,
    name: 'Eagle Rare 17 Year',
    hunters: 4560,
    foundThisWeek: 2,
    avgHuntTime: '3.5 years',
    msrp: 99,
    marketPrice: 600,
    difficulty: 'Very Hard',
    image: '🦅',
    tips: ['Part of BTAC', 'Extremely limited production', 'Consider secondary market']
  },
  {
    id: 8,
    name: 'Blanton\'s Gold',
    hunters: 4120,
    foundThisWeek: 15,
    avgHuntTime: '10 months',
    msrp: 120,
    marketPrice: 280,
    difficulty: 'Hard',
    image: '🌟',
    tips: ['International release gets more', 'Travel retail sometimes has stock', 'Check Costco regularly']
  }
]

// User's personal hunt list
const MY_HUNTS = [
  { bottle: 'Pappy Van Winkle 15 Year', addedDate: '2023-06-15', status: 'hunting', checkIns: 45 },
  { bottle: 'Blanton\'s Original', addedDate: '2024-01-20', status: 'found', foundDate: '2024-03-15' },
  { bottle: 'Weller Full Proof', addedDate: '2024-02-01', status: 'hunting', checkIns: 23 }
]

const RECENT_FINDS = [
  { user: 'BourbonHunter', bottle: 'Pappy 15', location: 'Louisville, KY', price: 120, time: '2 hours ago' },
  { user: 'WhiskeyWanderer', bottle: 'Blanton\'s', location: 'Nashville, TN', price: 65, time: '5 hours ago' },
  { user: 'SingleBarrelSam', bottle: 'ECBP', location: 'Chicago, IL', price: 70, time: '8 hours ago' },
  { user: 'AllocatedAndy', bottle: 'Weller 12', location: 'Columbus, OH', price: 40, time: '1 day ago' }
]

export default function WhiteWhalePage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedWhale, setSelectedWhale] = useState<typeof COMMUNITY_WHALES[0] | null>(null)
  const [view, setView] = useState<'community' | 'mine'>('community')

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-cyan-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-cyan-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/prices" className="hover:text-amber-400 transition-colors">Prices</Link>
            <Link href="/collection" className="hover:text-amber-400 transition-colors">Collection</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-cyan-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
            🐋 WHITE WHALE TRACKER
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Hunt Your <span className="text-cyan-400">Grail Bottles</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Track the bottles you're hunting. Get alerts when they're spotted. 
            Learn from the community's wisdom.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setView('community')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'community' ? 'bg-cyan-600' : 'bg-stone-800 hover:bg-stone-700'
            }`}
          >
            🌊 Community Hunts
          </button>
          <button
            onClick={() => setView('mine')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'mine' ? 'bg-cyan-600' : 'bg-stone-800 hover:bg-stone-700'
            }`}
          >
            🎯 My Hunt List
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {view === 'community' && (
              <>
                <h2 className="text-2xl font-bold mb-6">🏆 Most Hunted Bottles</h2>
                <div className="space-y-4">
                  {COMMUNITY_WHALES.map((whale, i) => (
                    <div
                      key={whale.id}
                      onClick={() => setSelectedWhale(whale)}
                      className="bg-stone-800/50 rounded-xl border border-stone-700/50 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="w-12 text-center">
                            <span className={`text-2xl font-bold ${
                              i === 0 ? 'text-yellow-400' :
                              i === 1 ? 'text-gray-300' :
                              i === 2 ? 'text-amber-600' : 'text-gray-500'
                            }`}>
                              #{i + 1}
                            </span>
                          </div>
                          
                          {/* Icon */}
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-900/50 to-stone-800 rounded-lg flex items-center justify-center text-4xl">
                            {whale.image}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{whale.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                whale.difficulty === 'Legendary' ? 'bg-purple-600' :
                                whale.difficulty === 'Very Hard' ? 'bg-red-600' :
                                whale.difficulty === 'Hard' ? 'bg-orange-600' : 'bg-yellow-600'
                              }`}>
                                {whale.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {whale.hunters.toLocaleString()} hunters • 
                              {whale.foundThisWeek} found this week
                            </p>
                            <p className="text-xs text-gray-500">
                              Avg hunt time: {whale.avgHuntTime}
                            </p>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="text-xs text-gray-500 line-through">MSRP ${whale.msrp}</p>
                            <p className="text-xl font-bold text-cyan-400">${whale.marketPrice}</p>
                            <p className="text-xs text-red-400">
                              +{Math.round(((whale.marketPrice - whale.msrp) / whale.msrp) * 100)}% markup
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {view === 'mine' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">🎯 My Hunt List</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg font-semibold"
                  >
                    + Add Bottle
                  </button>
                </div>
                
                <div className="space-y-4">
                  {MY_HUNTS.map((hunt, i) => (
                    <div
                      key={i}
                      className={`bg-stone-800/50 rounded-xl p-5 border transition-all ${
                        hunt.status === 'found'
                          ? 'border-green-500/50 bg-green-900/20'
                          : 'border-stone-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-amber-900/50 to-stone-800 rounded-lg flex items-center justify-center text-3xl">
                            🥃
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{hunt.bottle}</h3>
                            <p className="text-sm text-gray-400">
                              Added: {new Date(hunt.addedDate).toLocaleDateString()}
                            </p>
                            {hunt.status === 'hunting' && (
                              <p className="text-xs text-cyan-400">{hunt.checkIns} store check-ins</p>
                            )}
                            {hunt.status === 'found' && (
                              <p className="text-xs text-green-400">
                                Found on {new Date(hunt.foundDate!).toLocaleDateString()}! 🎉
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {hunt.status === 'hunting' && (
                            <>
                              <button className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-semibold">
                                ✓ Found It!
                              </button>
                              <button className="bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-lg text-sm font-semibold">
                                📍 Check-In
                              </button>
                            </>
                          )}
                          {hunt.status === 'found' && (
                            <span className="text-3xl">🏆</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {MY_HUNTS.length === 0 && (
                  <div className="text-center py-16 bg-stone-800/30 rounded-xl">
                    <span className="text-6xl">🎯</span>
                    <h3 className="text-xl font-bold mt-4">Start Your Hunt</h3>
                    <p className="text-gray-400 mt-2">Add bottles to your hunt list to track your search</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-6 bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded-lg font-semibold"
                    >
                      + Add Your First Whale
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Finds */}
            <div className="bg-gradient-to-br from-green-900/30 to-stone-800/30 rounded-xl p-6 border border-green-500/30">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="animate-pulse">🎉</span> Recent Finds
              </h3>
              <div className="space-y-3">
                {RECENT_FINDS.map((find, i) => (
                  <div key={i} className="bg-black/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{find.bottle}</p>
                      <span className="text-green-400 text-sm">${find.price}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      @{find.user} • {find.location} • {find.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hunting Tips */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Pro Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Build relationships with store managers - they remember loyal customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Check stores on delivery days, usually Tuesday or Wednesday</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Follow stores on social media for drop announcements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Join local bourbon groups on Facebook for real-time alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Consider control states - their lotteries can be your friend</span>
                </li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">📊 Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-cyan-400">3</p>
                  <p className="text-xs text-gray-500">Bottles Hunting</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">1</p>
                  <p className="text-xs text-gray-500">Whales Found</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">68</p>
                  <p className="text-xs text-gray-500">Store Check-Ins</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">142</p>
                  <p className="text-xs text-gray-500">Days Hunting</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-gradient-to-br from-purple-900/30 to-stone-800/30 rounded-xl p-6 border border-purple-500/30 text-center">
              <p className="text-3xl mb-2">🐋</p>
              <h3 className="font-bold mb-2">Share Your Hunt</h3>
              <p className="text-sm text-gray-400 mb-4">
                Let friends know what you're hunting!
              </p>
              <button className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                📤 Create Hunt Card
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Whale Detail Modal */}
      {selectedWhale && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="aspect-video bg-gradient-to-br from-cyan-900/50 to-stone-800 flex items-center justify-center relative">
              <span className="text-9xl">{selectedWhale.image}</span>
              <button
                onClick={() => setSelectedWhale(null)}
                className="absolute top-4 right-4 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded text-sm ${
                  selectedWhale.difficulty === 'Legendary' ? 'bg-purple-600' :
                  selectedWhale.difficulty === 'Very Hard' ? 'bg-red-600' :
                  selectedWhale.difficulty === 'Hard' ? 'bg-orange-600' : 'bg-yellow-600'
                }`}>
                  {selectedWhale.difficulty}
                </span>
                <span className="text-gray-500">{selectedWhale.hunters.toLocaleString()} hunters</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-6">{selectedWhale.name}</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-stone-800/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{selectedWhale.avgHuntTime}</p>
                  <p className="text-xs text-gray-500">Avg Hunt Time</p>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{selectedWhale.foundThisWeek}</p>
                  <p className="text-xs text-gray-500">Found This Week</p>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-amber-400">${selectedWhale.marketPrice}</p>
                  <p className="text-xs text-gray-500">Market Price</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-bold mb-4">💡 Hunter Tips</h3>
                <ul className="space-y-2">
                  {selectedWhale.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 bg-stone-800/50 rounded-lg p-3">
                      <span className="text-cyan-400">•</span>
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-xl font-bold text-lg transition-colors">
                🎯 Add to My Hunt List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-6">🎯 Add to Hunt List</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Search for a bottle</label>
                <input
                  type="text"
                  placeholder="e.g., Pappy Van Winkle 15..."
                  className="w-full bg-stone-800 rounded-lg px-4 py-3"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {COMMUNITY_WHALES.slice(0, 5).map(whale => (
                  <button
                    key={whale.id}
                    className="w-full flex items-center gap-3 bg-stone-800/50 hover:bg-stone-700/50 rounded-lg p-3 text-left"
                  >
                    <span className="text-2xl">{whale.image}</span>
                    <div>
                      <p className="font-medium">{whale.name}</p>
                      <p className="text-xs text-gray-500">{whale.hunters.toLocaleString()} hunting</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-semibold"
              >
                Add to List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
