'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface Listing {
  id: string;
  seller_id: string;
  seller_username: string;
  seller_avatar?: string;
  seller_rating: number;
  seller_trades: number;
  spirit_id?: string;
  spirit_name: string;
  spirit_brand: string;
  spirit_category: string;
  spirit_image?: string;
  listing_type: 'sale' | 'trade' | 'auction';
  price?: number;
  trade_for?: string;
  auction_end?: string;
  current_bid?: number;
  bid_count?: number;
  condition: 'sealed' | 'opened' | 'partial';
  fill_level?: number;
  description?: string;
  shipping_options: string[];
  location: string;
  created_at: string;
  views: number;
  saves: number;
  is_featured?: boolean;
  is_verified?: boolean;
}

interface FilterState {
  type: 'all' | 'sale' | 'trade' | 'auction';
  category: string;
  priceMin: number;
  priceMax: number;
  condition: string;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'ending_soon' | 'most_viewed';
  search: string;
}

// ============================================
// CONSTANTS
// ============================================

const CATEGORIES = [
  'All Categories',
  'Bourbon',
  'Scotch',
  'Rye',
  'Japanese Whisky',
  'Irish Whiskey',
  'Tequila',
  'Mezcal',
  'Rum',
  'Gin',
  'Vodka',
  'Cognac',
  'Brandy',
  'Wine',
  'Other',
];

const CONDITIONS = [
  { value: 'all', label: 'Any Condition' },
  { value: 'sealed', label: 'Sealed' },
  { value: 'opened', label: 'Opened (Full)' },
  { value: 'partial', label: 'Partial' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'most_viewed', label: 'Most Viewed' },
];

// ============================================
// SAMPLE DATA (until real data is connected)
// ============================================

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: '1',
    seller_id: 'u1',
    seller_username: 'BourbonBaron',
    seller_rating: 4.9,
    seller_trades: 47,
    spirit_name: "Pappy Van Winkle's Family Reserve 15 Year",
    spirit_brand: 'Pappy Van Winkle',
    spirit_category: 'Bourbon',
    spirit_image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
    listing_type: 'auction',
    auction_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    current_bid: 1850,
    bid_count: 23,
    condition: 'sealed',
    description: 'Acquired from Kentucky lottery 2024. Pristine condition, stored properly.',
    shipping_options: ['USPS Priority', 'FedEx'],
    location: 'Louisville, KY',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    views: 1247,
    saves: 89,
    is_featured: true,
    is_verified: true,
  },
  {
    id: '2',
    seller_id: 'u2',
    seller_username: 'WhiskeyWanderer',
    seller_rating: 4.7,
    seller_trades: 23,
    spirit_name: 'Buffalo Trace Antique Collection - George T. Stagg 2023',
    spirit_brand: 'Buffalo Trace',
    spirit_category: 'Bourbon',
    spirit_image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
    listing_type: 'sale',
    price: 899,
    condition: 'sealed',
    description: 'BTAC 2023 release. Will ship with proper packaging and insurance.',
    shipping_options: ['FedEx Ground', 'FedEx Express'],
    location: 'Dallas, TX',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    views: 456,
    saves: 34,
    is_verified: true,
  },
  {
    id: '3',
    seller_id: 'u3',
    seller_username: 'SingleMaltSam',
    seller_rating: 5.0,
    seller_trades: 156,
    spirit_name: 'Macallan 18 Year Sherry Oak',
    spirit_brand: 'Macallan',
    spirit_category: 'Scotch',
    spirit_image: 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=400',
    listing_type: 'trade',
    trade_for: 'Looking for Japanese whisky (Yamazaki, Hibiki) or other Macallan expressions',
    condition: 'sealed',
    description: '2022 bottling. Perfect for collectors or as a trade.',
    shipping_options: ['Local pickup', 'USPS Priority'],
    location: 'San Francisco, CA',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    views: 289,
    saves: 45,
  },
  {
    id: '4',
    seller_id: 'u4',
    seller_username: 'RyeRider',
    seller_rating: 4.8,
    seller_trades: 67,
    spirit_name: "Blanton's Gold",
    spirit_brand: "Blanton's",
    spirit_category: 'Bourbon',
    spirit_image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
    listing_type: 'sale',
    price: 189,
    condition: 'sealed',
    description: 'Duty free purchase from Japan. Horse stopper letter "N".',
    shipping_options: ['USPS Priority', 'UPS Ground'],
    location: 'Chicago, IL',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 567,
    saves: 78,
  },
  {
    id: '5',
    seller_id: 'u5',
    seller_username: 'TequilaTime',
    seller_rating: 4.6,
    seller_trades: 12,
    spirit_name: 'Fortaleza Añejo - Winter Blend 2023',
    spirit_brand: 'Fortaleza',
    spirit_category: 'Tequila',
    spirit_image: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400',
    listing_type: 'auction',
    auction_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    current_bid: 245,
    bid_count: 8,
    condition: 'sealed',
    description: 'Limited release Winter Blend. One of only 2000 bottles.',
    shipping_options: ['FedEx Ground'],
    location: 'Phoenix, AZ',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    views: 198,
    saves: 23,
  },
  {
    id: '6',
    seller_id: 'u6',
    seller_username: 'CaskCollector',
    seller_rating: 4.9,
    seller_trades: 89,
    spirit_name: 'Yamazaki 18 Year',
    spirit_brand: 'Yamazaki',
    spirit_category: 'Japanese Whisky',
    spirit_image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
    listing_type: 'sale',
    price: 650,
    condition: 'sealed',
    description: 'Purchased directly from Suntory distillery tour. With original box.',
    shipping_options: ['FedEx Express', 'UPS Next Day'],
    location: 'Seattle, WA',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    views: 723,
    saves: 112,
    is_featured: true,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatTimeRemaining(endDate: string): string {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ============================================
// COMPONENTS
// ============================================

function ListingCard({ listing, onSave }: { listing: Listing; onSave: (id: string) => void }) {
  const [isSaved, setIsSaved] = useState(false);
  
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave(listing.id);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {listing.spirit_image ? (
          <img
            src={listing.spirit_image}
            alt={listing.spirit_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🥃</div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {listing.is_featured && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
              ⭐ Featured
            </span>
          )}
          {listing.is_verified && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              ✓ Verified
            </span>
          )}
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            listing.listing_type === 'auction' ? 'bg-purple-500 text-white' :
            listing.listing_type === 'trade' ? 'bg-blue-500 text-white' :
            'bg-green-600 text-white'
          }`}>
            {listing.listing_type === 'auction' ? '🔨 Auction' :
             listing.listing_type === 'trade' ? '🔄 Trade' : '💰 For Sale'}
          </span>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isSaved ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          {isSaved ? '❤️' : '🤍'}
        </button>
        
        {/* Auction Timer */}
        {listing.listing_type === 'auction' && listing.auction_end && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center justify-between">
              <span className="text-xs">⏱️ Ends in</span>
              <span className="font-bold text-amber-400">{formatTimeRemaining(listing.auction_end)}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Category & Condition */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-amber-600 font-medium">{listing.spirit_category}</span>
          <span className="text-gray-300">•</span>
          <span className={`text-xs font-medium ${
            listing.condition === 'sealed' ? 'text-green-600' :
            listing.condition === 'opened' ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-amber-600 transition-colors">
          {listing.spirit_name}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{listing.spirit_brand}</p>
        
        {/* Price / Bid / Trade */}
        <div className="mb-3">
          {listing.listing_type === 'sale' && listing.price && (
            <p className="text-2xl font-bold text-gray-900">{formatPrice(listing.price)}</p>
          )}
          {listing.listing_type === 'auction' && (
            <div>
              <p className="text-xs text-gray-500">Current Bid ({listing.bid_count} bids)</p>
              <p className="text-2xl font-bold text-purple-600">{formatPrice(listing.current_bid || 0)}</p>
            </div>
          )}
          {listing.listing_type === 'trade' && (
            <p className="text-sm text-blue-600 line-clamp-2">🔄 {listing.trade_for}</p>
          )}
        </div>
        
        {/* Seller Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {listing.seller_username.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{listing.seller_username}</p>
              <p className="text-xs text-gray-500">
                ⭐ {listing.seller_rating} • {listing.seller_trades} trades
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{listing.location}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreateListingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState<'sale' | 'trade' | 'auction'>('sale');
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Step 1: Listing Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">What type of listing?</h3>
              
              <button
                onClick={() => { setListingType('sale'); setStep(2); }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  listingType === 'sale' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💰</span>
                  <div>
                    <p className="font-semibold text-gray-900">Sell</p>
                    <p className="text-sm text-gray-500">Set a fixed price for your bottle</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => { setListingType('trade'); setStep(2); }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  listingType === 'trade' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔄</span>
                  <div>
                    <p className="font-semibold text-gray-900">Trade</p>
                    <p className="text-sm text-gray-500">Swap for other bottles</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => { setListingType('auction'); setStep(2); }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  listingType === 'auction' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔨</span>
                  <div>
                    <p className="font-semibold text-gray-900">Auction</p>
                    <p className="text-sm text-gray-500">Let buyers bid on your bottle</p>
                  </div>
                </div>
              </button>
            </div>
          )}
          
          {/* Step 2: Bottle Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600">
                  ← Back
                </button>
                <h3 className="font-semibold text-gray-900">Bottle Details</h3>
              </div>
              
              {/* Photo Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="text-4xl mb-2">📷</div>
                <p className="font-medium text-gray-900">Add Photos</p>
                <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                <input type="file" className="hidden" accept="image/*" multiple />
              </div>
              
              {/* Search from collection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select from your collection
                </label>
                <input
                  type="text"
                  placeholder="Search your bottles..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              {/* Or manual entry */}
              <div className="text-center text-gray-400 text-sm">— or enter manually —</div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spirit Name</label>
                <input
                  type="text"
                  placeholder="e.g., Pappy Van Winkle 15 Year"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    {CATEGORIES.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option value="sealed">Sealed</option>
                    <option value="opened">Opened (Full)</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={() => setStep(3)}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
          
          {/* Step 3: Pricing / Trade Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-600">
                  ← Back
                </button>
                <h3 className="font-semibold text-gray-900">
                  {listingType === 'sale' ? 'Set Your Price' :
                   listingType === 'trade' ? 'Trade Preferences' : 'Auction Settings'}
                </h3>
              </div>
              
              {listingType === 'sale' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Platform fee: 5% • You'll receive 95% of sale price
                  </p>
                </div>
              )}
              
              {listingType === 'auction' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Starting Bid</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reserve Price (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        placeholder="Minimum acceptable price"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auction Duration</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="3">3 Days</option>
                      <option value="5">5 Days</option>
                      <option value="7" selected>7 Days</option>
                      <option value="14">14 Days</option>
                    </select>
                  </div>
                </>
              )}
              
              {listingType === 'trade' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What are you looking for?</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what bottles you'd trade for..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Add details about your bottle..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Options</label>
                <div className="space-y-2">
                  {['USPS Priority', 'FedEx Ground', 'FedEx Express', 'UPS Ground', 'Local Pickup Only'].map(option => (
                    <label key={option} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-amber-500 focus:ring-amber-500" />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                🎉 Publish Listing
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function FilterSidebar({ filters, setFilters }: { filters: FilterState; setFilters: (f: FilterState) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4">
      <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
      
      {/* Listing Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'sale', label: '💰 Sale' },
            { value: 'trade', label: '🔄 Trade' },
            { value: 'auction', label: '🔨 Auction' },
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setFilters({ ...filters, type: type.value as FilterState['type'] })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filters.type === type.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={e => setFilters({ ...filters, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={e => setFilters({ ...filters, priceMin: parseInt(e.target.value) || 0 })}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={e => setFilters({ ...filters, priceMax: parseInt(e.target.value) || 0 })}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Condition */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
        <select
          value={filters.condition}
          onChange={e => setFilters({ ...filters, condition: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          {CONDITIONS.map(cond => (
            <option key={cond.value} value={cond.value}>{cond.label}</option>
          ))}
        </select>
      </div>
      
      {/* Clear Filters */}
      <button
        onClick={() => setFilters({
          type: 'all',
          category: '',
          priceMin: 0,
          priceMax: 0,
          condition: 'all',
          sortBy: 'newest',
          search: '',
        })}
        className="w-full py-2 text-amber-600 font-medium hover:underline"
      >
        Clear All Filters
      </button>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function MarketplacePage() {
  const [supabase] = useState(() => createClient());
  const [listings, setListings] = useState<Listing[]>(SAMPLE_LISTINGS);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    category: '',
    priceMin: 0,
    priceMax: 0,
    condition: 'all',
    sortBy: 'newest',
    search: '',
  });
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());

  // Filter listings
  const filteredListings = listings.filter(listing => {
    if (filters.type !== 'all' && listing.listing_type !== filters.type) return false;
    if (filters.category && listing.spirit_category !== filters.category) return false;
    if (filters.condition !== 'all' && listing.condition !== filters.condition) return false;
    if (filters.priceMin && (listing.price || listing.current_bid || 0) < filters.priceMin) return false;
    if (filters.priceMax && (listing.price || listing.current_bid || 0) > filters.priceMax) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        listing.spirit_name.toLowerCase().includes(search) ||
        listing.spirit_brand.toLowerCase().includes(search) ||
        listing.seller_username.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_low':
        return (a.price || a.current_bid || 0) - (b.price || b.current_bid || 0);
      case 'price_high':
        return (b.price || b.current_bid || 0) - (a.price || a.current_bid || 0);
      case 'ending_soon':
        if (!a.auction_end) return 1;
        if (!b.auction_end) return -1;
        return new Date(a.auction_end).getTime() - new Date(b.auction_end).getTime();
      case 'most_viewed':
        return b.views - a.views;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleSave = (id: string) => {
    const newSaved = new Set(savedListings);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedListings(newSaved);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Spirits Marketplace</h1>
              <p className="text-amber-100 mt-1">Buy, sell, and trade rare bottles with fellow collectors</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                ← Dashboard
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-white text-amber-600 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                + Create Listing
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Search bottles, brands, or sellers..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-amber-100 text-sm">Active Listings</p>
              <p className="text-2xl font-bold">{listings.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-amber-100 text-sm">Live Auctions</p>
              <p className="text-2xl font-bold">{listings.filter(l => l.listing_type === 'auction').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-amber-100 text-sm">Trades Available</p>
              <p className="text-2xl font-bold">{listings.filter(l => l.listing_type === 'trade').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-amber-100 text-sm">Verified Sellers</p>
              <p className="text-2xl font-bold">{listings.filter(l => l.is_verified).length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>
          
          {/* Listings */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{sortedListings.length}</span> listings
              </p>
              <select
                value={filters.sortBy}
                onChange={e => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {/* Grid */}
            {sortedListings.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {sortedListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onSave={handleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => setFilters({
                    type: 'all',
                    category: '',
                    priceMin: 0,
                    priceMax: 0,
                    condition: 'all',
                    sortBy: 'newest',
                    search: '',
                  })}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Listing Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateListingModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Filter Button */}
      <button
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>
    </div>
  );
}
