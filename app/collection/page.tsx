'use client'

import { useState } from 'react'

// Sample collection data
const SAMPLE_COLLECTION = [
  { id: 1, name: "Buffalo Trace", category: "bourbon", proof: 90, status: "sealed", value: 28, acquired: "2024-01-15" },
  { id: 2, name: "Blanton's Single Barrel", category: "bourbon", proof: 93, status: "sealed", value: 150, acquired: "2024-02-20" },
  { id: 3, name: "Eagle Rare 10 Year", category: "bourbon", proof: 90, status: "open", value: 45, acquired: "2024-03-10" },
  { id: 4, name: "Lagavulin 16", category: "scotch", proof: 86, status: "open", value: 95, acquired: "2024-01-05" },
  { id: 5, name: "Yamazaki 12", category: "japanese", proof: 86, status: "sealed", value: 180, acquired: "2024-04-01" },
]

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🍾' },
  { id: 'bourbon', name: 'Bourbon', icon: '🥃' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'japanese', name: 'Japanese', icon: '🇯🇵' },
  { id: 'wine', name: 'Wine', icon: '🍷' },
  { id: 'beer', name: 'Beer', icon: '🍺' },
]

export default function CollectionPage() {
  const [collection] = useState(SAMPLE_COLLECTION)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  
  const filteredCollection = filter === 'all' 
    ? collection 
    : collection.filter(b => b.category === filter)
  
  const totalValue = collection.reduce((sum, b) => sum + b.value, 0)
  const totalBottles = collection.length
  const sealedCount = collection.filter(b => b.status === 'sealed').length
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">🗄️ My Collection</h1>
          <p className="text-gray-600">Track, value, and manage your spirits collection</p>
        </div>
        <button className="mt-4 md:mt-0 px-6 py-3 bg-barrel-500 text-white rounded-lg font-semibold hover:bg-barrel-600 flex items-center gap-2">
          <span>📷</span> Scan Bottle
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Bottles</p>
          <p className="text-3xl font-bold">{totalBottles}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Collection Value</p>
          <p className="text-3xl font-bold text-green-600">${totalValue}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Sealed</p>
          <p className="text-3xl font-bold text-blue-600">{sealedCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-3xl font-bold text-amber-600">{totalBottles - sealedCount}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat.id
                  ? 'bg-barrel-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded ${view === 'grid' ? 'bg-barrel-100 text-barrel-600' : 'bg-gray-100'}`}
          >
            ▦
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded ${view === 'list' ? 'bg-barrel-100 text-barrel-600' : 'bg-gray-100'}`}
          >
            ☰
          </button>
        </div>
      </div>
      
      {/* Collection Grid */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCollection.map((bottle) => (
            <div key={bottle.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-6xl">🥃</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{bottle.name}</h3>
              <p className="text-sm text-gray-500 capitalize mb-2">{bottle.category} • {bottle.proof} proof</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">${bottle.value}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bottle.status === 'sealed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {bottle.status}
                </span>
              </div>
            </div>
          ))}
          
          {/* Add Bottle Card */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[300px] hover:border-barrel-400 hover:bg-barrel-50 transition-colors cursor-pointer">
            <span className="text-4xl mb-2">➕</span>
            <span className="font-medium text-gray-600">Add Bottle</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Proof</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCollection.map((bottle) => (
                <tr key={bottle.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{bottle.name}</td>
                  <td className="px-4 py-3 capitalize">{bottle.category}</td>
                  <td className="px-4 py-3">{bottle.proof}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bottle.status === 'sealed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {bottle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">${bottle.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Features Banner */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
          <span className="text-3xl mb-3 block">📱</span>
          <h3 className="text-xl font-bold mb-2">Barcode Scanning</h3>
          <p className="opacity-80 text-sm">Scan any bottle to instantly add it to your collection with full details.</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
          <span className="text-3xl mb-3 block">💰</span>
          <h3 className="text-xl font-bold mb-2">Price Tracking</h3>
          <p className="opacity-80 text-sm">Track market values and get alerts when prices change on your bottles.</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
          <span className="text-3xl mb-3 block">📊</span>
          <h3 className="text-xl font-bold mb-2">Analytics</h3>
          <p className="opacity-80 text-sm">View your collection's performance, value history, and insights.</p>
        </div>
      </div>
    </div>
  )
}
