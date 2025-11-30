'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

const BUSINESS_TYPES = [
  { id: 'liquor_store', label: 'Liquor Store', icon: '🏪' },
  { id: 'bar', label: 'Bar', icon: '🍸' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'hotel_bar', label: 'Hotel Bar', icon: '🏨' },
  { id: 'distillery', label: 'Distillery', icon: '🏭' },
  { id: 'wine_shop', label: 'Wine & Spirits Shop', icon: '🍷' },
  { id: 'grocery', label: 'Grocery Store', icon: '🛒' },
  { id: 'club', label: 'Club/Lounge', icon: '🎵' },
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

export default function BusinessRegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    business_type: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    description: '',
    has_tastings: false,
    has_delivery: false,
    has_curbside: false,
  })

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/business/register')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      // Create slug from business name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error: insertError } = await supabase
        .from('bv_businesses')
        .insert({
          owner_id: user.id,
          ...formData,
          slug,
          subscription_tier: 'free',
          is_active: true,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Redirect to dashboard
      router.push(`/business/dashboard?welcome=true`)
    } catch (err: any) {
      console.error('Error creating business:', err)
      setError(err.message || 'Failed to create business. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Link href="/find" className="inline-flex items-center text-amber-300 hover:text-amber-200 mb-8">
          ← Back to Find Spirits
        </Link>

        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">List Your Business</h1>
            <p className="text-amber-200">
              Reach thousands of spirits enthusiasts searching for bottles near them
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-amber-600' : 'bg-stone-700'
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-6 md:p-8">
            
            {/* Step 1: Business Type */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-6">What type of business do you have?</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => updateForm('business_type', type.id)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        formData.business_type === type.id
                          ? 'border-amber-500 bg-amber-600/20'
                          : 'border-stone-600 hover:border-amber-600/50'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{type.icon}</span>
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.business_type}
                  className="w-full mt-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-6">Tell us about your business</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-stone-400 mb-1">Business Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="e.g., Downtown Spirits"
                      className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        placeholder="contact@business.com"
                        className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-stone-400 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateForm('website', e.target.value)}
                      placeholder="https://www.yourbusiness.com"
                      className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-stone-400 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      placeholder="Tell customers about your business..."
                      rows={3}
                      className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-stone-600 hover:bg-stone-800 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.name || !formData.email}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold mb-6">Where are you located?</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-stone-400 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={formData.address_line1}
                      onChange={(e) => updateForm('address_line1', e.target.value)}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-stone-400 mb-1">Suite/Unit (optional)</label>
                    <input
                      type="text"
                      value={formData.address_line2}
                      onChange={(e) => updateForm('address_line2', e.target.value)}
                      placeholder="Suite 100"
                      className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateForm('city', e.target.value)}
                        placeholder="Louisville"
                        className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">State *</label>
                      <select
                        value={formData.state}
                        onChange={(e) => updateForm('state', e.target.value)}
                        className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                      >
                        <option value="">Select state</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-stone-400 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => updateForm('postal_code', e.target.value)}
                      placeholder="40202"
                      className="w-full px-4 py-3 bg-stone-900 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Features */}
                  <div className="pt-4 border-t border-stone-700">
                    <label className="block text-sm text-stone-400 mb-3">Features (optional)</label>
                    <div className="space-y-2">
                      {[
                        { key: 'has_tastings', label: 'Offers tastings', icon: '🥃' },
                        { key: 'has_delivery', label: 'Delivery available', icon: '🚗' },
                        { key: 'has_curbside', label: 'Curbside pickup', icon: '🅿️' },
                      ].map(({ key, label, icon }) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData[key as keyof typeof formData] as boolean}
                            onChange={(e) => updateForm(key, e.target.checked)}
                            className="w-5 h-5 rounded border-stone-600 bg-stone-900 text-amber-600 focus:ring-amber-500"
                          />
                          <span>{icon} {label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-stone-600 hover:bg-stone-800 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.address_line1 || !formData.city || !formData.state || !formData.postal_code || loading}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    {loading ? 'Creating...' : 'Create Business'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-stone-800/30 rounded-lg p-4">
              <div className="text-2xl mb-2">🆓</div>
              <p className="font-semibold">Free to Start</p>
              <p className="text-sm text-stone-400">List up to 10 spirits free</p>
            </div>
            <div className="bg-stone-800/30 rounded-lg p-4">
              <div className="text-2xl mb-2">👀</div>
              <p className="font-semibold">Get Discovered</p>
              <p className="text-sm text-stone-400">Reach active spirits buyers</p>
            </div>
            <div className="bg-stone-800/30 rounded-lg p-4">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-semibold">Track Analytics</p>
              <p className="text-sm text-stone-400">See what people search for</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
