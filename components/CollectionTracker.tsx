'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Wine, Plus, Search, Filter, Grid, List,
  Star, DollarSign, TrendingUp, Trash2, Edit2,
  BarChart3, PieChart, Eye, Heart, Share2
} from 'lucide-react'

interface CollectionBottle {
  id: string
  name: string
  distillery: string
  type: string
  age?: number
  proof: number
  purchasePrice: number
  currentValue: number
  msrp: number
  rating: number
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare' | 'allocated'
  dateAdded: string
  datePurchased?: string
  notes: string
  status: 'sealed' | 'opened' | 'finished' | 'wishlist'
  imageUrl?: string
  location?: string
  quantity: number
}

interface CollectionStats {
  totalBottles: number
  totalValue: number
  totalInvested: number
  profit: number
  averageRating: number
  byType: Record<string, number>
  byRarity: Record<string, number>
}

interface CollectionTrackerProps {
  initialCollection?: CollectionBottle[]
  onCollectionChange?: (collection: CollectionBottle[]) => void
}

export default function CollectionTracker({ initialCollection = [], onCollectionChange }: CollectionTrackerProps) {
  const [collection, setCollection] = useState<CollectionBottle[]>(initialCollection)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'rating' | 'dateAdded'>('dateAdded')
  const [selectedBottle, setSelectedBottle] = useState<CollectionBottle | null>(null)
  const [showStats, setShowStats] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spiritsCollection')
    if (saved) {
      setCollection(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('spiritsCollection', JSON.stringify(collection))
    onCollectionChange?.(collection)
  }, [collection, onCollectionChange])

  // Calculate stats
  const stats = useMemo((): CollectionStats => {
    const bottles = collection.filter(b => b.status !== 'wishlist')
    return {
      totalBottles: bottles.reduce((sum, b) => sum + b.quantity, 0),
      totalValue: bottles.reduce((sum, b) => sum + (b.currentValue * b.quantity), 0),
      totalInvested: bottles.reduce((sum, b) => sum + (b.purchasePrice * b.quantity), 0),
      profit: bottles.reduce((sum, b) => sum + ((b.currentValue - b.purchasePrice) * b.quantity), 0),
      averageRating: bottles.length > 0 
        ? bottles.reduce((sum, b) => sum + b.rating, 0) / bottles.length 
        : 0,
      byType: bottles.reduce((acc, b) => {
        acc[b.type] = (acc[b.type] || 0) + b.quantity
        return acc
      }, {} as Record<string, number>),
      byRarity: bottles.reduce((acc, b) => {
        acc[b.rarity] = (acc[b.rarity] || 0) + b.quantity
        return acc
      }, {} as Record<string, number>)
    }
  }, [collection])

  // Filter and sort collection
  const filteredCollection = useMemo(() => {
    let result = [...collection]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.distillery.toLowerCase().includes(query)
      )
    }
    
    if (filterType) {
      result = result.filter(b => b.type === filterType)
    }
    
    if (filterStatus) {
      result = result.filter(b => b.status === filterStatus)
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'value': return b.currentValue - a.currentValue
        case 'rating': return b.rating - a.rating
        case 'dateAdded': return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        default: return 0
      }
    })
    
    return result
  }, [collection, searchQuery, filterType, filterStatus, sortBy])

  const addBottle = (bottle: Partial<CollectionBottle>) => {
    const newBottle: CollectionBottle = {
      id: Date.now().toString(),
      name: bottle.name || 'Unknown',
      distillery: bottle.distillery || 'Unknown',
      type: bottle.type || 'bourbon',
      proof: bottle.proof || 80,
      purchasePrice: bottle.purchasePrice || 0,
      currentValue: bottle.currentValue || bottle.purchasePrice || 0,
      msrp: bottle.msrp || 0,
      rating: bottle.rating || 0,
      rarity: bottle.rarity || 'common',
      dateAdded: new Date().toISOString(),
      notes: bottle.notes || '',
      status: bottle.status || 'sealed',
      quantity: bottle.quantity || 1,
      ...bottle
    }
    setCollection(prev => [newBottle, ...prev])
  }

  const updateBottle = (id: string, updates: Partial<CollectionBottle>) => {
    setCollection(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const deleteBottle = (id: string) => {
    if (confirm('Remove this bottle from your collection?')) {
      setCollection(prev => prev.filter(b => b.id !== id))
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'common': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'uncommon': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'rare': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'ultra-rare': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'allocated': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
    return colors[rarity] || colors.common
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'sealed': 'text-green-600',
      'opened': 'text-amber-600',
      'finished': 'text-gray-400',
      'wishlist': 'text-pink-500',
    }
    return colors[status] || 'text-gray-500'
  }

  const types = [...new Set(collection.map(b => b.type))]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wine className="w-6 h-6" />
            <div>
              <h2 className="font-semibold text-lg">My Collection</h2>
              <p className="text-white/80 text-sm">{stats.totalBottles} bottles • ${stats.totalValue.toLocaleString()} value</p>
            </div>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.totalBottles}</p>
              <p className="text-xs text-gray-500">Total Bottles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">${stats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Collection Value</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profit >= 0 ? '+' : ''}${stats.profit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Profit/Loss</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                <Star className="w-5 h-5 inline -mt-1 fill-amber-400" /> {stats.averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collection..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
          
          <select
            value={filterType || ''}
            onChange={(e) => setFilterType(e.target.value || null)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="sealed">Sealed</option>
            <option value="opened">Opened</option>
            <option value="finished">Finished</option>
            <option value="wishlist">Wishlist</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="dateAdded">Recently Added</option>
            <option value="name">Name</option>
            <option value="value">Value</option>
            <option value="rating">Rating</option>
          </select>
          
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collection Grid/List */}
        {filteredCollection.length === 0 ? (
          <div className="text-center py-12">
            <Wine className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery || filterType || filterStatus 
                ? 'No bottles match your filters' 
                : 'Your collection is empty'}
            </p>
            <button className="text-amber-600 hover:text-amber-700 font-medium">
              Start adding bottles
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCollection.map(bottle => (
              <div
                key={bottle.id}
                onClick={() => setSelectedBottle(bottle)}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg mb-2 flex items-center justify-center">
                  <Wine className="w-12 h-12 text-amber-600/50" />
                </div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{bottle.name}</h3>
                <p className="text-xs text-gray-500 truncate">{bottle.distillery}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-amber-600">${bottle.currentValue}</span>
                  <span className={`text-xs ${getStatusColor(bottle.status)} capitalize`}>{bottle.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCollection.map(bottle => (
              <div
                key={bottle.id}
                onClick={() => setSelectedBottle(bottle)}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-12 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wine className="w-6 h-6 text-amber-600/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{bottle.name}</h3>
                  <p className="text-sm text-gray-500">{bottle.distillery}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityColor(bottle.rarity)}`}>
                      {bottle.rarity}
                    </span>
                    <span className="text-xs text-gray-500">{bottle.proof}°</span>
                    {bottle.age && <span className="text-xs text-gray-500">{bottle.age}yr</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600">${bottle.currentValue}</p>
                  <p className={`text-xs ${getStatusColor(bottle.status)} capitalize`}>{bottle.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottle Detail Modal */}
      {selectedBottle && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBottle(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">{selectedBottle.name}</h3>
                  <p className="text-gray-500">{selectedBottle.distillery}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(selectedBottle.rarity)}`}>
                  {selectedBottle.rarity}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Current Value</p>
                  <p className="text-xl font-bold text-amber-600">${selectedBottle.currentValue}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Purchase Price</p>
                  <p className="text-xl font-bold">${selectedBottle.purchasePrice}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => { deleteBottle(selectedBottle.id); setSelectedBottle(null) }}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg font-medium"
                >
                  Remove
                </button>
                <button
                  onClick={() => setSelectedBottle(null)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
