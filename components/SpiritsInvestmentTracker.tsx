'use client'

import { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart,
  Wine, Star, Clock, AlertCircle, ArrowUpRight, ArrowDownRight,
  Plus, Search, Filter, Download, Bell, Target, Sparkles
} from 'lucide-react'

interface BottleInvestment {
  id: string
  name: string
  distillery: string
  type: string
  vintage?: number
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  change: number
  changePercent: number
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare' | 'legendary'
  condition: 'sealed' | 'opened' | 'partial'
  location: string
  image: string
}

interface MarketTrend {
  category: string
  trend: 'up' | 'down' | 'stable'
  change: number
  volume: number
  topPerformer: string
}

const PORTFOLIO: BottleInvestment[] = [
  {
    id: '1', name: 'Pappy Van Winkle 23 Year', distillery: 'Old Rip Van Winkle', type: 'Bourbon',
    vintage: 2019, purchaseDate: '2022-03-15', purchasePrice: 2800, currentValue: 4500,
    change: 1700, changePercent: 60.7, rarity: 'legendary', condition: 'sealed',
    location: 'Climate Storage A', image: '🥃'
  },
  {
    id: '2', name: 'Macallan 25 Sherry Oak', distillery: 'Macallan', type: 'Single Malt Scotch',
    purchaseDate: '2021-08-20', purchasePrice: 1800, currentValue: 2200,
    change: 400, changePercent: 22.2, rarity: 'ultra-rare', condition: 'sealed',
    location: 'Home Collection', image: '🥃'
  },
  {
    id: '3', name: 'Yamazaki 18', distillery: 'Yamazaki', type: 'Japanese Whisky',
    purchaseDate: '2023-01-10', purchasePrice: 450, currentValue: 520,
    change: 70, changePercent: 15.6, rarity: 'rare', condition: 'sealed',
    location: 'Home Collection', image: '🥃'
  },
  {
    id: '4', name: 'Buffalo Trace Antique Collection', distillery: 'Buffalo Trace', type: 'Bourbon',
    vintage: 2023, purchaseDate: '2023-11-01', purchasePrice: 800, currentValue: 750,
    change: -50, changePercent: -6.25, rarity: 'rare', condition: 'sealed',
    location: 'Climate Storage A', image: '🥃'
  },
  {
    id: '5', name: 'Hibiki 21', distillery: 'Suntory', type: 'Japanese Whisky',
    purchaseDate: '2022-06-15', purchasePrice: 600, currentValue: 950,
    change: 350, changePercent: 58.3, rarity: 'ultra-rare', condition: 'sealed',
    location: 'Home Collection', image: '🥃'
  },
]

const MARKET_TRENDS: MarketTrend[] = [
  { category: 'Japanese Whisky', trend: 'up', change: 18.5, volume: 2450, topPerformer: 'Yamazaki 25' },
  { category: 'Bourbon (Allocated)', trend: 'up', change: 12.3, volume: 8900, topPerformer: 'Pappy 15' },
  { category: 'Scotch Single Malt', trend: 'stable', change: 2.1, volume: 5600, topPerformer: 'Macallan 30' },
  { category: 'Rye Whiskey', trend: 'up', change: 8.7, volume: 1800, topPerformer: 'Thomas Handy' },
  { category: 'Irish Whiskey', trend: 'down', change: -3.2, volume: 980, topPerformer: 'Midleton VR' },
]

export default function SpiritsInvestmentTracker() {
  const [view, setView] = useState<'portfolio' | 'market' | 'alerts' | 'analytics'>('portfolio')
  const [sortBy, setSortBy] = useState<'value' | 'gain' | 'date'>('value')

  const totalValue = PORTFOLIO.reduce((sum, b) => sum + b.currentValue, 0)
  const totalCost = PORTFOLIO.reduce((sum, b) => sum + b.purchasePrice, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = (totalGain / totalCost) * 100

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-400'
      case 'uncommon': return 'bg-green-500/20 text-green-400'
      case 'rare': return 'bg-blue-500/20 text-blue-400'
      case 'ultra-rare': return 'bg-purple-500/20 text-purple-400'
      case 'legendary': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const sortedPortfolio = [...PORTFOLIO].sort((a, b) => {
    if (sortBy === 'value') return b.currentValue - a.currentValue
    if (sortBy === 'gain') return b.changePercent - a.changePercent
    return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-yellow-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Investment Tracker</h1>
              <p className="text-amber-200">Track your spirits portfolio value</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg">
            <Plus className="w-4 h-4" /> Add Bottle
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">Portfolio Value</p>
            <p className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">Total Gain</p>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">ROI</p>
            <p className={`text-2xl font-bold ${totalGainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-amber-200 text-sm mb-1">Bottles</p>
            <p className="text-2xl font-bold text-white">{PORTFOLIO.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'portfolio', label: 'Portfolio', icon: Wine },
          { id: 'market', label: 'Market Trends', icon: BarChart3 },
          { id: 'alerts', label: 'Price Alerts', icon: Bell },
          { id: 'analytics', label: 'Analytics', icon: PieChart },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              view === tab.id ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Portfolio View */}
      {view === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('value')}
                className={`px-3 py-1.5 rounded text-sm ${sortBy === 'value' ? 'bg-amber-600' : 'bg-gray-800'}`}
              >
                By Value
              </button>
              <button
                onClick={() => setSortBy('gain')}
                className={`px-3 py-1.5 rounded text-sm ${sortBy === 'gain' ? 'bg-amber-600' : 'bg-gray-800'}`}
              >
                By Gain
              </button>
              <button
                onClick={() => setSortBy('date')}
                className={`px-3 py-1.5 rounded text-sm ${sortBy === 'date' ? 'bg-amber-600' : 'bg-gray-800'}`}
              >
                By Date
              </button>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>

          <div className="space-y-3">
            {sortedPortfolio.map(bottle => (
              <div key={bottle.id} className="bg-gray-900 rounded-xl border border-gray-700 p-4 hover:border-amber-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center text-3xl">
                    {bottle.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{bottle.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded capitalize ${getRarityColor(bottle.rarity)}`}>
                        {bottle.rarity.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{bottle.distillery} • {bottle.type}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Purchased: {bottle.purchaseDate}</span>
                      <span>📍 {bottle.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${bottle.currentValue.toLocaleString()}</p>
                    <p className={`text-sm flex items-center justify-end gap-1 ${bottle.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bottle.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {bottle.change >= 0 ? '+' : ''}${bottle.change.toLocaleString()} ({bottle.changePercent.toFixed(1)}%)
                    </p>
                    <p className="text-xs text-gray-500">Cost: ${bottle.purchasePrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Trends View */}
      {view === 'market' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" /> Market Overview (30 Day)
            </h3>
            <div className="space-y-3">
              {MARKET_TRENDS.map(trend => (
                <div key={trend.category} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{trend.category}</p>
                    <p className="text-xs text-gray-400">Top: {trend.topPerformer}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{trend.volume.toLocaleString()} sales</p>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded ${
                      trend.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                      trend.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {trend.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {trend.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                      {trend.change >= 0 ? '+' : ''}{trend.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-300">AI Market Insight</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Japanese whisky continues its strong performance with Yamazaki and Hibiki leading gains.
                  Consider acquiring allocated bourbon releases before the holiday auction season.
                  Scotch single malts showing stability - good for long-term holds.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts View */}
      {view === 'alerts' && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Price Alerts</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm">
              <Plus className="w-4 h-4" /> New Alert
            </button>
          </div>
          <div className="space-y-3">
            {[
              { bottle: 'Pappy Van Winkle 15', target: 2000, current: 1850, type: 'above' },
              { bottle: 'Buffalo Trace', target: 25, current: 32, type: 'below' },
              { bottle: 'Yamazaki 12', target: 200, current: 175, type: 'above' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">{alert.bottle}</p>
                  <p className="text-sm text-gray-400">Alert when {alert.type} ${alert.target}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${alert.current}</p>
                  <p className="text-xs text-gray-400">Current</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
