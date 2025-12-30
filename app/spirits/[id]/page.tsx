'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface Spirit {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  type?: string;
  image_url?: string;
  abv?: number;
  proof?: number;
  age_statement?: string;
  country?: string;
  region?: string;
  distillery?: string;
  description?: string;
  tasting_notes?: {
    nose?: string[];
    palate?: string[];
    finish?: string[];
    overall?: string;
  };
  flavor_profile?: string[];
  awards?: { name: string; year: number }[];
  price_range?: string;
  msrp?: number;
  community_rating?: number;
  rating_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  nose_notes?: string[];
  palate_notes?: string[];
  finish_notes?: string[];
  content: string;
  would_buy_again: boolean;
  created_at: string;
  helpful_count: number;
}

interface AffiliateLink {
  retailer: string;
  url: string;
  price?: number;
  in_stock: boolean;
  logo_url?: string;
}

// ============================================
// FLAVOR WHEEL COLORS
// ============================================

const FLAVOR_COLORS: Record<string, string> = {
  sweet: '#F59E0B',
  fruity: '#EF4444',
  spicy: '#DC2626',
  woody: '#92400E',
  smoky: '#6B7280',
  floral: '#EC4899',
  herbal: '#10B981',
  nutty: '#B45309',
  grain: '#D97706',
  mineral: '#64748B',
  vanilla: '#F59E0B',
  caramel: '#D97706',
  honey: '#FCD34D',
  oak: '#92400E',
  smoke: '#6B7280',
  peat: '#4B5563',
  citrus: '#F97316',
  apple: '#84CC16',
  cherry: '#DC2626',
  chocolate: '#78350F',
  coffee: '#451A03',
  leather: '#78350F',
  tobacco: '#6B7280',
  pepper: '#DC2626',
  cinnamon: '#B45309',
  default: '#9CA3AF',
};

function getFlavorColor(flavor: string): string {
  const lowerFlavor = flavor.toLowerCase();
  for (const [key, color] of Object.entries(FLAVOR_COLORS)) {
    if (lowerFlavor.includes(key)) return color;
  }
  return FLAVOR_COLORS.default;
}

// ============================================
// COMPONENTS
// ============================================

function FlavorTag({ flavor }: { flavor: string }) {
  const color = getFlavorColor(flavor);
  return (
    <span
      className="px-3 py-1 rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {flavor}
    </span>
  );
}

function TastingNotesSection({ notes }: { notes: Spirit['tasting_notes'] }) {
  if (!notes) return null;
  
  const sections = [
    { key: 'nose', label: 'Nose', icon: '👃', description: 'Aromas detected before tasting' },
    { key: 'palate', label: 'Palate', icon: '👅', description: 'Flavors experienced while tasting' },
    { key: 'finish', label: 'Finish', icon: '✨', description: 'Lingering flavors after swallowing' },
  ];
  
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>🥃</span> Tasting Notes
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {sections.map(section => {
          const sectionNotes = notes[section.key as keyof typeof notes];
          if (!sectionNotes || (Array.isArray(sectionNotes) && sectionNotes.length === 0)) return null;
          
          return (
            <div key={section.key} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{section.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{section.label}</h3>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(sectionNotes) ? (
                  sectionNotes.map((note, idx) => (
                    <FlavorTag key={idx} flavor={note} />
                  ))
                ) : (
                  <p className="text-gray-700">{sectionNotes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {notes.overall && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Overall Impression</h3>
          <p className="text-gray-700 leading-relaxed">{notes.overall}</p>
        </div>
      )}
    </div>
  );
}

function FlavorProfileChart({ flavors }: { flavors: string[] }) {
  if (!flavors || flavors.length === 0) return null;
  
  // Group flavors by category
  const categories: Record<string, number> = {};
  
  for (const flavor of flavors) {
    const lower = flavor.toLowerCase();
    if (lower.includes('vanilla') || lower.includes('caramel') || lower.includes('honey') || lower.includes('sweet')) {
      categories['Sweet'] = (categories['Sweet'] || 0) + 1;
    } else if (lower.includes('oak') || lower.includes('wood') || lower.includes('barrel')) {
      categories['Woody'] = (categories['Woody'] || 0) + 1;
    } else if (lower.includes('smoke') || lower.includes('peat') || lower.includes('char')) {
      categories['Smoky'] = (categories['Smoky'] || 0) + 1;
    } else if (lower.includes('fruit') || lower.includes('apple') || lower.includes('cherry') || lower.includes('citrus')) {
      categories['Fruity'] = (categories['Fruity'] || 0) + 1;
    } else if (lower.includes('spice') || lower.includes('pepper') || lower.includes('cinnamon')) {
      categories['Spicy'] = (categories['Spicy'] || 0) + 1;
    } else {
      categories['Other'] = (categories['Other'] || 0) + 1;
    }
  }
  
  const maxCount = Math.max(...Object.values(categories));
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Flavor Profile</h3>
      <div className="space-y-3">
        {Object.entries(categories).map(([category, count]) => (
          <div key={category} className="flex items-center gap-3">
            <span className="w-16 text-sm text-gray-600">{category}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: FLAVOR_COLORS[category.toLowerCase()] || FLAVOR_COLORS.default }}
              />
            </div>
            <span className="text-sm text-gray-500 w-8">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' };
  
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= Math.round(rating) ? 'text-amber-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 overflow-hidden flex-shrink-0">
          {review.user_avatar ? (
            <img src={review.user_avatar} alt={review.user_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-900">{review.user_name}</span>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <p className="text-gray-700 mb-3">{review.content}</p>
          
          {/* Tasting Notes Preview */}
          {(review.nose_notes?.length || review.palate_notes?.length || review.finish_notes?.length) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {review.nose_notes?.slice(0, 2).map((note, i) => (
                <span key={`nose-${i}`} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                  👃 {note}
                </span>
              ))}
              {review.palate_notes?.slice(0, 2).map((note, i) => (
                <span key={`palate-${i}`} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                  👅 {note}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-500">
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              {review.would_buy_again && (
                <span className="text-green-600 font-medium">👍 Would buy again</span>
              )}
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              👍 Helpful ({review.helpful_count})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AffiliateLinkCard({ link }: { link: AffiliateLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        {link.logo_url ? (
          <img src={link.logo_url} alt={link.retailer} className="w-10 h-10 object-contain" />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">🛒</div>
        )}
        <div>
          <p className="font-medium text-gray-900">{link.retailer}</p>
          <p className={`text-sm ${link.in_stock ? 'text-green-600' : 'text-red-500'}`}>
            {link.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
          </p>
        </div>
      </div>
      <div className="text-right">
        {link.price && (
          <p className="font-bold text-lg text-gray-900">${link.price.toFixed(2)}</p>
        )}
        <span className="text-amber-600 group-hover:text-amber-700 text-sm font-medium">
          Shop Now →
        </span>
      </div>
    </a>
  );
}

function AddToCollectionButton({ spiritId, spiritName }: { spiritId: string; spiritName: string }) {
  const [added, setAdded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const handleAdd = async (status: string) => {
    // Would save to database
    console.log('Add to collection:', spiritId, status);
    setAdded(true);
    setShowOptions(false);
  };
  
  if (added) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
        <span>✓</span>
        <span>Added to Collection</span>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
      >
        <span>+</span>
        <span>Add to Collection</span>
      </button>
      
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10"
          >
            {['owned', 'wishlist', 'tried', 'want_to_try'].map(status => (
              <button
                key={status}
                onClick={() => handleAdd(status)}
                className="w-full px-4 py-2 text-left hover:bg-amber-50 text-gray-700 capitalize"
              >
                {status === 'owned' && '🥃 I Own This'}
                {status === 'wishlist' && '⭐ Wishlist'}
                {status === 'tried' && '✓ I\'ve Tried This'}
                {status === 'want_to_try' && '🎯 Want to Try'}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// SAMPLE DATA (for demo)
// ============================================

const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    user_id: 'u1',
    user_name: 'BourbonHunter',
    user_avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 5,
    nose_notes: ['vanilla', 'caramel', 'oak'],
    palate_notes: ['honey', 'spice', 'dark fruit'],
    finish_notes: ['long', 'warm', 'oaky'],
    content: 'Absolutely phenomenal bourbon. The complexity here is remarkable - layers of flavor that keep revealing themselves. Worth every penny.',
    would_buy_again: true,
    created_at: '2025-12-20T14:30:00Z',
    helpful_count: 24,
  },
  {
    id: '2',
    user_id: 'u2',
    user_name: 'WhiskeyLover42',
    rating: 4,
    nose_notes: ['butterscotch', 'cinnamon'],
    palate_notes: ['vanilla', 'toffee'],
    finish_notes: ['medium', 'sweet'],
    content: 'Great sipper with nice balance. Not the most complex but very approachable and enjoyable. Would recommend for beginners and enthusiasts alike.',
    would_buy_again: true,
    created_at: '2025-12-15T09:15:00Z',
    helpful_count: 12,
  },
];

// Affiliate links are now fetched from /api/affiliates

// ============================================
// MAIN PAGE
// ============================================

export default function SpiritDetailPage() {
  const params = useParams();
  const spiritId = params?.id as string;
  
  const [spirit, setSpirit] = useState<Spirit | null>(null);
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'buy'>('overview');
  
  const supabase = createClient();
  
  useEffect(() => {
    async function loadSpirit() {
      if (!spiritId) return;
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bv_spirits')
        .select('*')
        .eq('id', spiritId)
        .single();
      
      if (error) {
        console.error('Error loading spirit:', error);
        // Use sample data for demo
        setSpirit({
          id: spiritId,
          name: 'Buffalo Trace Kentucky Straight Bourbon',
          brand: 'Buffalo Trace',
          category: 'bourbon',
          subcategory: 'Kentucky Straight',
          image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600',
          abv: 45,
          proof: 90,
          age_statement: 'NAS (estimated 8-10 years)',
          country: 'USA',
          region: 'Kentucky',
          distillery: 'Buffalo Trace Distillery',
          description: 'Buffalo Trace Kentucky Straight Bourbon Whiskey is made from the finest corn, rye, and barley malt. This deep amber whiskey has a complex aroma of vanilla, mint, and molasses. The taste is sweet with notes of brown sugar, spice, and toffee. The finish is long and smooth with serious depth.',
          tasting_notes: {
            nose: ['vanilla', 'caramel', 'mint', 'molasses', 'toffee'],
            palate: ['brown sugar', 'spice', 'oak', 'dark fruit', 'honey'],
            finish: ['long', 'smooth', 'vanilla', 'gentle spice'],
            overall: 'A beautifully balanced bourbon with exceptional depth and character. The interplay between sweet caramel notes and subtle spice creates a harmonious experience that appeals to both newcomers and seasoned whiskey enthusiasts.',
          },
          flavor_profile: ['sweet', 'vanilla', 'caramel', 'oak', 'spice', 'fruity', 'smooth'],
          awards: [
            { name: 'Double Gold - San Francisco World Spirits Competition', year: 2024 },
            { name: 'Gold - International Whisky Competition', year: 2023 },
          ],
          price_range: '$25-35',
          msrp: 29.99,
          community_rating: 4.5,
          rating_count: 1247,
        });
      } else {
        setSpirit(data);
      }
      
      setLoading(false);
      
      // Fetch affiliate links after spirit is loaded
      if (data?.name || !error) {
        fetchAffiliateLinks(data?.name || 'Buffalo Trace', data?.category || 'bourbon');
      }
    }
    
    async function fetchAffiliateLinks(spiritName: string, category: string) {
      setAffiliateLoading(true);
      try {
        const params = new URLSearchParams({
          spirit_name: spiritName,
          category: category,
        });
        
        const response = await fetch(`/api/affiliates?${params}`);
        const data = await response.json();
        
        if (data.success && data.affiliateLinks) {
          // Transform API response to match component interface
          const links = data.affiliateLinks.map((link: any) => ({
            retailer: link.retailer.name,
            url: link.url,
            price: data.priceComparison?.find((p: any) => p.retailerId === link.retailer.id)?.price,
            in_stock: data.priceComparison?.find((p: any) => p.retailerId === link.retailer.id)?.inStock ?? true,
            logo_url: link.retailer.logo,
          }));
          setAffiliateLinks(links);
        }
      } catch (error) {
        console.error('Error fetching affiliate links:', error);
        // Fallback to sample links if API fails
        setAffiliateLinks([
          { retailer: 'Total Wine', url: '#', price: 54.99, in_stock: true },
          { retailer: 'Drizly', url: '#', price: 59.99, in_stock: true },
        ]);
      } finally {
        setAffiliateLoading(false);
      }
    }
    
    loadSpirit();
  }, [spiritId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-pulse mb-4">🥃</div>
          <p className="text-gray-500">Loading spirit details...</p>
        </div>
      </div>
    );
  }
  
  if (!spirit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Spirit Not Found</h1>
          <p className="text-gray-500 mb-4">We couldn't find this spirit in our database.</p>
          <Link href="/explore" className="text-amber-600 hover:text-amber-700 font-medium">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-800 via-amber-700 to-orange-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-6">
            <Link href="/explore" className="hover:text-white">Explore</Link>
            <span>/</span>
            <Link href={`/explore?category=${spirit.category}`} className="hover:text-white capitalize">
              {spirit.category}
            </Link>
            <span>/</span>
            <span className="text-white">{spirit.name}</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image */}
            <div className="md:w-1/3">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/10 shadow-2xl">
                {spirit.image_url ? (
                  <img
                    src={spirit.image_url}
                    alt={spirit.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">🥃</div>
                )}
              </div>
            </div>
            
            {/* Info */}
            <div className="md:w-2/3 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium capitalize">
                  {spirit.category}
                </span>
                {spirit.subcategory && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                    {spirit.subcategory}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{spirit.name}</h1>
              
              {spirit.brand && (
                <p className="text-xl text-white/80 mb-4">by {spirit.brand}</p>
              )}
              
              {/* Rating */}
              {spirit.community_rating && (
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={spirit.community_rating} size="lg" />
                  <span className="text-2xl font-bold">{spirit.community_rating.toFixed(1)}</span>
                  <span className="text-white/70">({spirit.rating_count?.toLocaleString()} reviews)</span>
                </div>
              )}
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mb-6">
                {spirit.abv && (
                  <div className="px-4 py-2 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">ABV</span>
                    <p className="font-bold">{spirit.abv}%</p>
                  </div>
                )}
                {spirit.proof && (
                  <div className="px-4 py-2 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">Proof</span>
                    <p className="font-bold">{spirit.proof}</p>
                  </div>
                )}
                {spirit.age_statement && (
                  <div className="px-4 py-2 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">Age</span>
                    <p className="font-bold">{spirit.age_statement}</p>
                  </div>
                )}
                {spirit.country && (
                  <div className="px-4 py-2 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">Origin</span>
                    <p className="font-bold">{spirit.region || spirit.country}</p>
                  </div>
                )}
                {spirit.msrp && (
                  <div className="px-4 py-2 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">MSRP</span>
                    <p className="font-bold">${spirit.msrp}</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <AddToCollectionButton spiritId={spirit.id} spiritName={spirit.name} />
                <Link
                  href={`/tasting?spirit=${spirit.id}`}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                  🥃 Start Tasting
                </Link>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  📤 Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'reviews', label: `Reviews (${reviews.length})`, icon: '⭐' },
              { id: 'buy', label: 'Where to Buy', icon: '🛒' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
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
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Description */}
            {spirit.description && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Spirit</h2>
                <p className="text-gray-700 leading-relaxed">{spirit.description}</p>
                
                {spirit.distillery && (
                  <p className="mt-4 text-gray-600">
                    <span className="font-medium">Distillery:</span> {spirit.distillery}
                  </p>
                )}
              </div>
            )}
            
            {/* Tasting Notes */}
            <TastingNotesSection notes={spirit.tasting_notes} />
            
            {/* Flavor Profile & Awards */}
            <div className="grid md:grid-cols-2 gap-6">
              {spirit.flavor_profile && spirit.flavor_profile.length > 0 && (
                <FlavorProfileChart flavors={spirit.flavor_profile} />
              )}
              
              {spirit.awards && spirit.awards.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏆</span> Awards & Recognition
                  </h3>
                  <div className="space-y-3">
                    {spirit.awards.map((award, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <span className="text-2xl">🥇</span>
                        <div>
                          <p className="font-medium text-gray-900">{award.name}</p>
                          <p className="text-sm text-gray-500">{award.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Community Reviews</h2>
              <Link
                href={`/tasting?spirit=${spirit.id}`}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
              >
                Write a Review
              </Link>
            </div>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500 mb-4">Be the first to share your thoughts!</p>
                <Link
                  href={`/tasting?spirit=${spirit.id}`}
                  className="inline-block px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
                >
                  Write the First Review
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Buy Tab */}
        {activeTab === 'buy' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Where to Buy</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Prices and availability from our retail partners
                </p>
              </div>
              <span className="text-xs text-gray-400">
                Affiliate links - we may earn a commission
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {affiliateLinks.map((link, idx) => (
                <AffiliateLinkCard key={idx} link={link} />
              ))}
            </div>
            
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-amber-800 text-sm">
                💡 Prices may vary. Always verify with the retailer before purchasing.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Related Spirits */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-square rounded-lg bg-gray-200 mb-3 flex items-center justify-center text-4xl">
                  🥃
                </div>
                <h3 className="font-medium text-gray-900 text-sm truncate">Similar Bourbon #{i}</h3>
                <p className="text-xs text-gray-500">$45.99 • 4.3 ⭐</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
