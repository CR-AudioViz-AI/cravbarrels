'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';

// ============================================
// TYPES
// ============================================

interface Spirit {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  image_url?: string;
  abv?: number;
  msrp?: number;
  country?: string;
  region?: string;
  community_rating?: number;
  rating_count?: number;
  description?: string;
}

interface Facets {
  categories: { value: string; count: number }[];
  countries: { value: string; count: number }[];
  priceRanges: { label: string; min: number; max: number; count: number }[];
  ratingRanges: { label: string; min: number; count: number }[];
}

interface SearchResult {
  spirits: Spirit[];
  facets: Facets;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface Filters {
  q: string;
  category: string;
  country: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sort: string;
}

// ============================================
// COMPONENTS
// ============================================

function SearchBar({ value, onChange, onSearch }: { 
  value: string; 
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions(null);
        return;
      }
      
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 8 }),
        });
        const data = await res.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Autocomplete error:', error);
      }
    }, 300),
    []
  );
  
  useEffect(() => {
    fetchSuggestions(value);
  }, [value, fetchSuggestions]);
  
  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search spirits, brands, distilleries..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
        </div>
        <button
          onClick={onSearch}
          className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-medium"
        >
          Search
        </button>
      </div>
      
      {/* Autocomplete Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden"
          >
            {/* Spirit Suggestions */}
            {suggestions.spirits?.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">Spirits</p>
                {suggestions.spirits.slice(0, 5).map((spirit: any) => (
                  <Link
                    key={spirit.id}
                    href={`/spirits/${spirit.id}`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-amber-50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {spirit.image_url ? (
                        <img src={spirit.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">🥃</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{spirit.name}</p>
                      <p className="text-sm text-gray-500 truncate">{spirit.brand} • {spirit.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Brand Suggestions */}
            {suggestions.brands?.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">Brands</p>
                {suggestions.brands.map((brand: any) => (
                  <button
                    key={brand.name}
                    onClick={() => {
                      onChange(brand.name);
                      onSearch();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-amber-50 rounded-lg text-gray-700"
                  >
                    🏷️ {brand.name}
                  </button>
                ))}
              </div>
            )}
            
            {/* Category Suggestions */}
            {suggestions.categories?.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">Categories</p>
                {suggestions.categories.map((cat: any) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      onChange('');
                      // Would set category filter
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-amber-50 rounded-lg text-gray-700 capitalize"
                  >
                    📂 {cat.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSidebar({ 
  facets, 
  filters, 
  onFilterChange,
  onClearFilters,
}: { 
  facets: Facets | null;
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
}) {
  const hasActiveFilters = filters.category || filters.country || filters.minPrice || filters.maxPrice || filters.minRating;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-amber-600 hover:text-amber-700"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
        >
          <option value="relevance">Most Relevant</option>
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name A-Z</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      
      {/* Categories */}
      {facets?.categories && facets.categories.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <button
              onClick={() => onFilterChange('category', '')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                !filters.category ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              All Categories
            </button>
            {facets.categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onFilterChange('category', cat.value)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center justify-between ${
                  filters.category === cat.value ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="capitalize">{cat.value}</span>
                <span className="text-xs text-gray-400">{cat.count.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Countries */}
      {facets?.countries && facets.countries.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <select
            value={filters.country}
            onChange={(e) => onFilterChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Countries</option>
            {facets.countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.value} ({country.count.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        {facets?.priceRanges && (
          <div className="mt-2 flex flex-wrap gap-1">
            {facets.priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  onFilterChange('minPrice', range.min.toString());
                  onFilterChange('maxPrice', range.max === 999999 ? '' : range.max.toString());
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-amber-100 rounded-full text-gray-600 hover:text-amber-700"
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
        <div className="flex gap-2">
          {['', '3', '4', '4.5'].map((rating) => (
            <button
              key={rating}
              onClick={() => onFilterChange('minRating', rating)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                filters.minRating === rating
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {rating ? `${rating}+` : 'Any'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpiritCard({ spirit }: { spirit: Spirit }) {
  return (
    <Link href={`/spirits/${spirit.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      >
        {/* Image */}
        <div className="aspect-square bg-gray-100 relative">
          {spirit.image_url ? (
            <img
              src={spirit.image_url}
              alt={spirit.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
              🥃
            </div>
          )}
          {spirit.community_rating && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white rounded-lg text-sm font-medium flex items-center gap-1">
              <span className="text-amber-400">★</span>
              {spirit.community_rating.toFixed(1)}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <p className="text-xs text-amber-600 font-medium uppercase mb-1">
              {spirit.category}
              {spirit.subcategory && ` • ${spirit.subcategory}`}
            </p>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{spirit.name}</h3>
            {spirit.brand && (
              <p className="text-sm text-gray-500">{spirit.brand}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {spirit.abv && <span>{spirit.abv}%</span>}
              {spirit.country && <span>• {spirit.country}</span>}
            </div>
            {spirit.msrp && (
              <span className="font-semibold text-gray-900">${spirit.msrp}</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function Pagination({ 
  pagination, 
  onPageChange 
}: { 
  pagination: SearchResult['pagination'];
  onPageChange: (page: number) => void;
}) {
  const { currentPage, totalPages, total } = pagination;
  
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Showing {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, total)} of {total.toLocaleString()} spirits
      </p>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ←
        </button>
        
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              1
            </button>
            {start > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-lg ${
              page === currentPage
                ? 'bg-amber-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<Filters>({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    country: searchParams.get('country') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'relevance',
  });
  
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const fetchResults = async (page = 1) => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    if (filters.country) params.set('country', filters.country);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (filters.sort) params.set('sort', filters.sort);
    params.set('limit', '24');
    params.set('offset', ((page - 1) * 24).toString());
    
    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchResults();
  }, []);
  
  const handleSearch = () => {
    // Update URL with filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/explore?${params.toString()}`);
    fetchResults();
  };
  
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleClearFilters = () => {
    setFilters({
      q: '',
      category: '',
      country: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: 'relevance',
    });
  };
  
  const handlePageChange = (page: number) => {
    fetchResults(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Explore Spirits</h1>
          <p className="text-white/80 mb-6">
            Discover from our collection of {results?.pagination.total.toLocaleString() || '37,000+'} spirits
          </p>
          
          <SearchBar
            value={filters.q}
            onChange={(v) => handleFilterChange('q', v)}
            onSearch={handleSearch}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              facets={results?.facets || null}
              filters={filters}
              onFilterChange={(key, value) => {
                handleFilterChange(key, value);
                setTimeout(() => fetchResults(), 100);
              }}
              onClearFilters={() => {
                handleClearFilters();
                setTimeout(() => fetchResults(), 100);
              }}
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
              >
                <span>🎛️</span>
                <span>Filters</span>
              </button>
              
              <select
                value={filters.sort}
                onChange={(e) => {
                  handleFilterChange('sort', e.target.value);
                  setTimeout(() => fetchResults(), 100);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="relevance">Most Relevant</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            
            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results?.spirits.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No spirits found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    handleClearFilters();
                    setTimeout(() => fetchResults(), 100);
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results?.spirits.map((spirit) => (
                    <SpiritCard key={spirit.id} spirit={spirit} />
                  ))}
                </div>
                
                {/* Pagination */}
                {results && results.pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      pagination={results.pagination}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-lg">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar
                  facets={results?.facets || null}
                  filters={filters}
                  onFilterChange={(key, value) => {
                    handleFilterChange(key, value);
                  }}
                  onClearFilters={handleClearFilters}
                />
                <button
                  onClick={() => {
                    setShowMobileFilters(false);
                    fetchResults();
                  }}
                  className="w-full mt-4 px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
