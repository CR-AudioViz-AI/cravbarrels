'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface Distillery {
  id: string;
  name: string;
  location?: string;
  country?: string;
  region?: string;
  logo_url?: string;
  cover_image_url?: string;
  description?: string;
  founded_year?: number;
  website_url?: string;
  social_links?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  is_verified: boolean;
  total_spirits: number;
  total_reviews: number;
  average_rating: number;
  monthly_views: number;
}

interface Spirit {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  image_url?: string;
  abv?: number;
  price_msrp?: number;
  description?: string;
  status: 'active' | 'discontinued' | 'limited' | 'coming_soon';
  release_date?: string;
  total_reviews: number;
  average_rating: number;
  inventory_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface Analytics {
  views_today: number;
  views_week: number;
  views_month: number;
  views_trend: number; // percentage change
  top_spirits: { id: string; name: string; views: number }[];
  review_sentiment: { positive: number; neutral: number; negative: number };
  geographic_breakdown: { country: string; percentage: number }[];
}

interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  spirit_name: string;
  rating: number;
  content: string;
  created_at: string;
  reply?: string;
  replied_at?: string;
}

// ============================================
// SAMPLE DATA
// ============================================

const SAMPLE_DISTILLERY: Distillery = {
  id: '1',
  name: 'Heritage Craft Distillery',
  location: 'Louisville, Kentucky',
  country: 'USA',
  region: 'Kentucky',
  logo_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200',
  cover_image_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200',
  description: 'Family-owned craft distillery producing small-batch bourbon since 1892. Our commitment to tradition and quality has made us a cornerstone of Kentucky whiskey heritage.',
  founded_year: 1892,
  website_url: 'https://heritagecraft.com',
  social_links: {
    instagram: '@heritagecraft',
    facebook: 'HeritageDistillery',
    twitter: '@heritagecraft',
  },
  is_verified: true,
  total_spirits: 12,
  total_reviews: 847,
  average_rating: 4.6,
  monthly_views: 15420,
};

const SAMPLE_SPIRITS: Spirit[] = [
  {
    id: '1',
    name: 'Heritage Reserve 12 Year',
    category: 'bourbon',
    subcategory: 'Kentucky Straight',
    image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
    abv: 47,
    price_msrp: 89.99,
    description: 'Our flagship bourbon, aged 12 years in new charred oak barrels.',
    status: 'active',
    total_reviews: 234,
    average_rating: 4.8,
    inventory_status: 'in_stock',
  },
  {
    id: '2',
    name: 'Small Batch Select',
    category: 'bourbon',
    subcategory: 'Small Batch',
    image_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
    abv: 45,
    price_msrp: 54.99,
    description: 'Hand-selected barrels blended for optimal flavor complexity.',
    status: 'active',
    total_reviews: 189,
    average_rating: 4.5,
    inventory_status: 'in_stock',
  },
  {
    id: '3',
    name: 'Single Barrel Private Selection',
    category: 'bourbon',
    subcategory: 'Single Barrel',
    image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
    abv: 52.5,
    price_msrp: 149.99,
    description: 'Individual barrel picks available for retailers and collectors.',
    status: 'limited',
    release_date: '2024-11-01',
    total_reviews: 67,
    average_rating: 4.9,
    inventory_status: 'low_stock',
  },
  {
    id: '4',
    name: 'Heritage Rye',
    category: 'rye',
    subcategory: 'Kentucky Rye',
    image_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
    abv: 45,
    price_msrp: 49.99,
    description: '95% rye mash bill with bold spice and complexity.',
    status: 'active',
    total_reviews: 156,
    average_rating: 4.4,
    inventory_status: 'in_stock',
  },
  {
    id: '5',
    name: 'Master Distiller Reserve',
    category: 'bourbon',
    subcategory: 'Cask Strength',
    image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
    abv: 62.3,
    price_msrp: 199.99,
    description: 'Annual release of our finest barrels at cask strength.',
    status: 'coming_soon',
    release_date: '2025-03-01',
    total_reviews: 0,
    average_rating: 0,
    inventory_status: 'out_of_stock',
  },
];

const SAMPLE_ANALYTICS: Analytics = {
  views_today: 523,
  views_week: 3847,
  views_month: 15420,
  views_trend: 12.5,
  top_spirits: [
    { id: '1', name: 'Heritage Reserve 12 Year', views: 4521 },
    { id: '3', name: 'Single Barrel Private Selection', views: 3892 },
    { id: '2', name: 'Small Batch Select', views: 2847 },
  ],
  review_sentiment: { positive: 78, neutral: 15, negative: 7 },
  geographic_breakdown: [
    { country: 'United States', percentage: 68 },
    { country: 'United Kingdom', percentage: 12 },
    { country: 'Germany', percentage: 8 },
    { country: 'Japan', percentage: 5 },
    { country: 'Other', percentage: 7 },
  ],
};

const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    user_name: 'BourbonHunter',
    user_avatar: 'https://i.pravatar.cc/100?img=1',
    spirit_name: 'Heritage Reserve 12 Year',
    rating: 5,
    content: 'Absolutely phenomenal bourbon. The 12 years of aging really shows through with incredible depth and complexity. Notes of caramel, vanilla, and toasted oak.',
    created_at: '2025-12-28T14:30:00Z',
    reply: 'Thank you for the kind words! We take great pride in our aging process.',
    replied_at: '2025-12-28T16:00:00Z',
  },
  {
    id: '2',
    user_name: 'WhiskeyLover42',
    spirit_name: 'Small Batch Select',
    rating: 4,
    content: 'Great everyday sipper at a reasonable price. Smooth with nice sweetness. Would love to see a higher proof version.',
    created_at: '2025-12-27T09:15:00Z',
  },
  {
    id: '3',
    user_name: 'CraftSpiritsEnthusiast',
    user_avatar: 'https://i.pravatar.cc/100?img=3',
    spirit_name: 'Heritage Rye',
    rating: 5,
    content: 'This rye punches way above its price point. Spicy, bold, and perfect for cocktails or sipping neat.',
    created_at: '2025-12-26T18:45:00Z',
  },
];

// ============================================
// COMPONENTS
// ============================================

function StatCard({ label, value, change, icon }: { label: string; value: string | number; change?: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function SpiritCard({ spirit, onEdit }: { spirit: Spirit; onEdit: () => void }) {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    discontinued: 'bg-gray-100 text-gray-700',
    limited: 'bg-amber-100 text-amber-700',
    coming_soon: 'bg-blue-100 text-blue-700',
  };
  
  const inventoryColors = {
    in_stock: 'text-green-600',
    low_stock: 'text-amber-600',
    out_of_stock: 'text-red-600',
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* Image */}
        <div className="w-24 h-32 bg-gray-100 flex-shrink-0">
          {spirit.image_url ? (
            <img src={spirit.image_url} alt={spirit.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🥃</div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{spirit.name}</h3>
              <p className="text-sm text-gray-500">{spirit.subcategory || spirit.category}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[spirit.status]}`}>
              {spirit.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-gray-600">{spirit.abv}% ABV</span>
            <span className="text-gray-600">${spirit.price_msrp}</span>
            {spirit.inventory_status && (
              <span className={inventoryColors[spirit.inventory_status]}>
                {spirit.inventory_status.replace('_', ' ')}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <span className="text-amber-500">⭐</span>
              <span className="font-medium">{spirit.average_rating || 'N/A'}</span>
              <span className="text-gray-400 text-sm">({spirit.total_reviews} reviews)</span>
            </div>
            <button
              onClick={onEdit}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Edit →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, onReply }: { review: Review; onReply: (id: string, reply: string) => void }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(review.id, replyText);
      setShowReplyInput(false);
      setReplyText('');
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {review.user_avatar ? (
            <img src={review.user_avatar} alt={review.user_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">{review.user_name}</span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-sm text-gray-500">{review.spirit_name}</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={star <= review.rating ? 'text-amber-500' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-gray-700 mt-2">{review.content}</p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
          
          {/* Reply Section */}
          {review.reply ? (
            <div className="mt-3 pl-4 border-l-2 border-amber-300 bg-amber-50 rounded-r-lg p-3">
              <p className="text-sm font-medium text-amber-800">Your Reply</p>
              <p className="text-sm text-gray-700 mt-1">{review.reply}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(review.replied_at!).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="mt-3">
              {showReplyInput ? (
                <div className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitReply}
                      className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
                    >
                      Send Reply
                    </button>
                    <button
                      onClick={() => setShowReplyInput(false)}
                      className="px-3 py-1.5 text-gray-600 text-sm hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowReplyInput(true)}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  Reply to review
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyticsChart({ data }: { data: Analytics }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Top Performing Spirits</h3>
      <div className="space-y-4">
        {data.top_spirits.map((spirit, idx) => (
          <div key={spirit.id} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
              {idx + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{spirit.name}</span>
                <span className="text-sm text-gray-500">{spirit.views.toLocaleString()} views</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  style={{ width: `${(spirit.views / data.top_spirits[0].views) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Sentiment Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Review Sentiment</h4>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div
            className="bg-green-500"
            style={{ width: `${data.review_sentiment.positive}%` }}
            title={`Positive: ${data.review_sentiment.positive}%`}
          />
          <div
            className="bg-gray-400"
            style={{ width: `${data.review_sentiment.neutral}%` }}
            title={`Neutral: ${data.review_sentiment.neutral}%`}
          />
          <div
            className="bg-red-500"
            style={{ width: `${data.review_sentiment.negative}%` }}
            title={`Negative: ${data.review_sentiment.negative}%`}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>😊 {data.review_sentiment.positive}% Positive</span>
          <span>😐 {data.review_sentiment.neutral}% Neutral</span>
          <span>😞 {data.review_sentiment.negative}% Negative</span>
        </div>
      </div>
      
      {/* Geographic Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Audience by Country</h4>
        <div className="space-y-2">
          {data.geographic_breakdown.map(geo => (
            <div key={geo.country} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-24 truncate">{geo.country}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${geo.percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right">{geo.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function MakerStorefrontPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews' | 'analytics' | 'settings'>('overview');
  const [distillery] = useState<Distillery>(SAMPLE_DISTILLERY);
  const [spirits] = useState<Spirit[]>(SAMPLE_SPIRITS);
  const [analytics] = useState<Analytics>(SAMPLE_ANALYTICS);
  const [reviews] = useState<Review[]>(SAMPLE_REVIEWS);
  
  const handleReplyToReview = (reviewId: string, reply: string) => {
    console.log('Reply to review', reviewId, reply);
    // Would save to database
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '🥃' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image & Header */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-amber-700 to-orange-800">
        {distillery.cover_image_url && (
          <img
            src={distillery.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Logo & Name */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-4 md:pb-6">
          <div className="max-w-7xl mx-auto flex items-end gap-4">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl bg-white shadow-lg overflow-hidden border-4 border-white flex-shrink-0">
              {distillery.logo_url ? (
                <img src={distillery.logo_url} alt={distillery.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-100">🏭</div>
              )}
            </div>
            <div className="flex-1 text-white pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">{distillery.name}</h1>
                {distillery.is_verified && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm md:text-base">{distillery.location}</p>
            </div>
            <Link
              href="/dashboard"
              className="hidden md:block px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Products" value={distillery.total_spirits} icon="🥃" />
              <StatCard label="Total Reviews" value={distillery.total_reviews.toLocaleString()} icon="⭐" />
              <StatCard label="Average Rating" value={distillery.average_rating} icon="📊" />
              <StatCard label="Monthly Views" value={distillery.monthly_views.toLocaleString()} change={analytics.views_trend} icon="👁️" />
            </div>
            
            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Products */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Recent Products</h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {spirits.slice(0, 3).map(spirit => (
                    <div key={spirit.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {spirit.image_url ? (
                          <img src={spirit.image_url} alt={spirit.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">🥃</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{spirit.name}</p>
                        <p className="text-sm text-gray-500">${spirit.price_msrp} • {spirit.average_rating} ⭐</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent Reviews */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-4">
                  {reviews.slice(0, 2).map(review => (
                    <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{review.user_name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={`text-sm ${star <= review.rating ? 'text-amber-500' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{review.spirit_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Analytics Preview */}
            <AnalyticsChart data={analytics} />
          </div>
        )}
        
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
              <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium">
                + Add Product
              </button>
            </div>
            
            <div className="grid gap-4">
              {spirits.map(spirit => (
                <SpiritCard
                  key={spirit.id}
                  spirit={spirit}
                  onEdit={() => console.log('Edit', spirit.id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Products</option>
                  {spirits.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Ratings</option>
                  <option>5 Stars</option>
                  <option>4 Stars</option>
                  <option>3 Stars</option>
                  <option>2 Stars</option>
                  <option>1 Star</option>
                </select>
              </div>
            </div>
            
            {/* Review Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{distillery.average_rating}</p>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= Math.round(distillery.average_rating) ? 'text-amber-500' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{distillery.total_reviews} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const percent = rating === 5 ? 68 : rating === 4 ? 22 : rating === 3 ? 7 : rating === 2 ? 2 : 1;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-3">{rating}</span>
                        <span className="text-amber-500">★</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-sm text-gray-500 w-10">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} onReply={handleReplyToReview} />
              ))}
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
            
            {/* Views Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Views Today" value={analytics.views_today} icon="📅" />
              <StatCard label="Views This Week" value={analytics.views_week.toLocaleString()} icon="📆" />
              <StatCard label="Views This Month" value={analytics.views_month.toLocaleString()} change={analytics.views_trend} icon="📊" />
            </div>
            
            <AnalyticsChart data={analytics} />
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Storefront Settings</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distillery Name</label>
                    <input
                      type="text"
                      defaultValue={distillery.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      defaultValue={distillery.location}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                    <input
                      type="number"
                      defaultValue={distillery.founded_year}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      defaultValue={distillery.website_url}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  defaultValue={distillery.description}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>
              
              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Social Media</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input
                      type="text"
                      defaultValue={distillery.social_links?.instagram}
                      placeholder="@username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input
                      type="text"
                      defaultValue={distillery.social_links?.facebook}
                      placeholder="Page name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter/X</label>
                    <input
                      type="text"
                      defaultValue={distillery.social_links?.twitter}
                      placeholder="@username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
