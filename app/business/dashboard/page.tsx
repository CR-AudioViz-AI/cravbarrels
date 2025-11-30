'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

type Business = {
  id: string
  name: string
  business_type: string
  city: string
  state: string
  total_spirits: number
  total_views: number
  subscription_tier: string
  is_verified: boolean
}

type InventoryItem = {
  id: string
  spirit_id: string
  spirit_name: string
  spirit_brand: string
  spirit_category: string
  price: number
  is_in_stock: boolean
  is_on_sale: boolean
  sale_price: number | null
}

type Spirit = {
  id: string
  name: string
  brand: string
  category: string
  msrp: number
}

export default function BusinessDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [spiritSearch, setSpiritSearch] = useState('')
  const [spiritResults, setSpirits] = useState<Spirit[]>([])
  const [addingSpirit, setAddingSpirit] = useState<Spirit | null>(null)
  const [newPrice, setNewPrice] = useState('')

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/business/dashboard')
      return
    }

    if (user) {
      fetchBusiness()
    }
  }, [user, authLoading])

  const fetchBusiness = async () => {
    const supabase = createClient()
    
    // Get user's business
    const { data: bizData, error: bizError } = await supabase
      .from('bv_businesses')
      .select('*')
      .eq('owner_id', user?.id)
      .single()

    if (bizError || !bizData) {
      router.push('/business/register')
      return
    }

    setBusiness(bizData)

    // Get inventory with spirit details
    const { data: invData } = await supabase
      .from('bv_business_inventory')
      .select(`
        id,
        spirit_id,
        price,
        is_in_stock,
        is_on_sale,
        sale_price,
        bv_spirits (name, brand, category)
      `)
      .eq('business_id', bizData.id)

    if (invData) {
      setInventory(invData.map((item: any) => ({
        id: item.id,
        spirit_id: item.spirit_id,
        spirit_name: item.bv_spirits?.name || 'Unknown',
        spirit_brand: item.bv_spirits?.brand || '',
        spirit_category: item.bv_spirits?.category || '',
        price: item.price,
        is_in_stock: item.is_in_stock,
        is_on_sale: item.is_on_sale,
        sale_price: item.sale_price,
      })))
    }

    setLoading(false)
  }

  // Search spirits to add
  useEffect(() => {
    if (spiritSearch.length < 2) {
      setSpirits([])
      return
    }

    const search = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, msrp')
        .or(`name.ilike.%${spiritSearch}%,brand.ilike.%${spiritSearch}%`)
        .limit(10)

      if (data) setSpirits(data)
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [spiritSearch])

  const addToInventory = async () => {
    if (!addingSpirit || !business) return

    const supabase = createClient()
    const { error } = await supabase
      .from('bv_business_inventory')
      .insert({
        business_id: business.id,
        spirit_id: addingSpirit.id,
        price: newPrice ? parseFloat(newPrice) : null,
        is_in_stock: true,
      })

    if (!error) {
      setShowAddModal(false)
      setAddingSpirit(null)
      setNewPrice('')
      setSpiritSearch('')
      fetchBusiness()
    }
  }

  const toggleStock = async (itemId: string, currentStatus: boolean) => {
    const supabase = createClient()
    await supabase
      .from('bv_business_inventory')
      .update({ is_in_stock: !currentStatus })
      .eq('id', itemId)
    
    fetchBusiness()
  }

  const removeFromInventory = async (itemId: string) => {
    if (!confirm('Remove this spirit from your inventory?')) return
    
    const supabase = createClient()
    await supabase
      .from('bv_business_inventory')
      .delete()
      .eq('id', itemId)
    
    fetchBusiness()
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-center">
        <div className="animate-spin text-5xl">🏪</div>
      </div>
    )
  }

  if (!business) return null

  const tierLimits: Record<string, number> = {
    free: 10,
    basic: 100,
    pro: 500,
    enterprise: 10000,
  }
  const inventoryLimit = tierLimits[business.subscription_tier] || 10
  const canAddMore = inventory.length < inventoryLimit

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Modal */}
        {showWelcome && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-800 border border-amber-600/30 rounded-xl max-w-md w-full p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to BarrelVerse!</h2>
              <p className="text-stone-300 mb-6">
                Your business is now listed. Start adding your inventory so customers can find you.
              </p>
              <button
                onClick={() => {
                  setShowWelcome(false)
                  setShowAddModal(true)
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold"
              >
                Add Your First Spirit
              </button>
            </div>
          </div>
        )}

        {/* Add Spirit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-800 border border-amber-600/30 rounded-xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add Spirit to Inventory</h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    setAddingSpirit(null)
                    setSpiritSearch('')
                  }}
                  className="text-stone-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {!addingSpirit ? (
                <>
                  <input
                    type="text"
                    value={spiritSearch}
                    onChange={(e) => setSpiritSearch(e.target.value)}
                    placeholder="Search for a spirit..."
                    className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none mb-4"
                    autoFocus
                  />
                  {spiritResults.length > 0 && (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {spiritResults.map((spirit) => (
                        <button
                          key={spirit.id}
                          onClick={() => {
                            setAddingSpirit(spirit)
                            setNewPrice(spirit.msrp?.toString() || '')
                          }}
                          className="w-full p-3 bg-stone-900 hover:bg-stone-700 rounded-lg text-left"
                        >
                          <p className="font-semibold">{spirit.name}</p>
                          <p className="text-sm text-stone-400">{spirit.brand} • {spirit.category}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-stone-900 rounded-lg p-4 mb-4">
                    <p className="font-semibold">{addingSpirit.name}</p>
                    <p className="text-sm text-stone-400">{addingSpirit.brand} • {addingSpirit.category}</p>
                    {addingSpirit.msrp && (
                      <p className="text-sm text-amber-400 mt-1">MSRP: ${addingSpirit.msrp}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-stone-400 mb-1">Your Price (optional)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Enter your price"
                      className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAddingSpirit(null)}
                      className="flex-1 py-3 border border-stone-600 hover:bg-stone-700 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      onClick={addToInventory}
                      className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold"
                    >
                      Add to Inventory
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="text-amber-300 hover:text-amber-200 text-sm">
              ← Back to BarrelVerse
            </Link>
            <h1 className="text-2xl font-bold mt-2">{business.name}</h1>
            <p className="text-stone-400">{business.city}, {business.state} • {business.business_type.replace('_', ' ')}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/store/${business.id}`}
              className="px-4 py-2 border border-stone-600 hover:bg-stone-800 rounded-lg"
            >
              View Public Page
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!canAddMore}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 rounded-lg font-semibold"
            >
              + Add Spirit
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-4">
            <p className="text-stone-400 text-sm">Spirits Listed</p>
            <p className="text-2xl font-bold">{inventory.length} / {inventoryLimit}</p>
          </div>
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-4">
            <p className="text-stone-400 text-sm">In Stock</p>
            <p className="text-2xl font-bold text-green-400">{inventory.filter(i => i.is_in_stock).length}</p>
          </div>
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-4">
            <p className="text-stone-400 text-sm">Profile Views</p>
            <p className="text-2xl font-bold">{business.total_views}</p>
          </div>
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-4">
            <p className="text-stone-400 text-sm">Plan</p>
            <p className="text-2xl font-bold capitalize">{business.subscription_tier}</p>
          </div>
        </div>

        {/* Upgrade Banner */}
        {business.subscription_tier === 'free' && (
          <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 border border-amber-600/30 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div>
              <p className="font-semibold">Upgrade to list unlimited spirits</p>
              <p className="text-sm text-stone-300">Plus featured placement, analytics, and more</p>
            </div>
            <Link href="/business/pricing" className="bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded-lg">
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Inventory List */}
        <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-amber-600/30">
            <h2 className="text-lg font-bold">Your Inventory</h2>
          </div>
          
          {inventory.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-xl mb-2">No spirits listed yet</p>
              <p className="text-stone-400 mb-6">Add your inventory so customers can find you</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-lg font-semibold"
              >
                Add Your First Spirit
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-700/50">
              {inventory.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-stone-800/50">
                  <div>
                    <p className="font-semibold">{item.spirit_name}</p>
                    <p className="text-sm text-stone-400">{item.spirit_brand} • {item.spirit_category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.price && (
                      <span className="text-amber-400 font-bold">${item.price}</span>
                    )}
                    <button
                      onClick={() => toggleStock(item.id, item.is_in_stock)}
                      className={`px-3 py-1 rounded text-sm ${
                        item.is_in_stock 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {item.is_in_stock ? 'In Stock' : 'Out'}
                    </button>
                    <button
                      onClick={() => removeFromInventory(item.id)}
                      className="text-stone-400 hover:text-red-400"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
