'use client';

import { useState, useEffect, useRef } from 'react';
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
  image_url?: string;
  abv?: number;
  proof?: number;
  description?: string;
  tasting_notes?: {
    nose?: string[];
    palate?: string[];
    finish?: string[];
  };
  flavor_profile?: string[];
}

interface TastingNote {
  category: 'nose' | 'palate' | 'finish';
  note: string;
  intensity: number; // 1-5
  timestamp: Date;
}

interface TastingSession {
  id: string;
  spirit: Spirit;
  notes: TastingNote[];
  overall_rating: number;
  would_buy_again: boolean;
  price_paid?: number;
  location?: string;
  companions?: string;
  personal_notes?: string;
  started_at: Date;
  completed_at?: Date;
}

// ============================================
// FLAVOR WHEEL DATA
// ============================================

const FLAVOR_WHEEL = {
  sweet: {
    label: 'Sweet',
    color: '#F59E0B',
    notes: ['vanilla', 'caramel', 'honey', 'maple', 'butterscotch', 'toffee', 'brown sugar', 'molasses', 'chocolate', 'cotton candy'],
  },
  fruity: {
    label: 'Fruity',
    color: '#EF4444',
    notes: ['apple', 'pear', 'cherry', 'plum', 'peach', 'apricot', 'orange', 'lemon', 'dried fruit', 'raisin', 'fig', 'banana', 'tropical'],
  },
  spicy: {
    label: 'Spicy',
    color: '#DC2626',
    notes: ['cinnamon', 'pepper', 'clove', 'ginger', 'nutmeg', 'allspice', 'anise', 'cardamom', 'white pepper', 'black pepper'],
  },
  woody: {
    label: 'Woody',
    color: '#92400E',
    notes: ['oak', 'cedar', 'pine', 'sandalwood', 'sawdust', 'barrel', 'charred wood', 'toasted wood', 'new oak', 'old oak'],
  },
  smoky: {
    label: 'Smoky',
    color: '#6B7280',
    notes: ['smoke', 'peat', 'campfire', 'ash', 'tobacco', 'leather', 'charcoal', 'burnt', 'bbq', 'bonfire'],
  },
  floral: {
    label: 'Floral',
    color: '#EC4899',
    notes: ['rose', 'lavender', 'violet', 'jasmine', 'honeysuckle', 'heather', 'elderflower', 'orange blossom', 'chamomile'],
  },
  herbal: {
    label: 'Herbal',
    color: '#10B981',
    notes: ['mint', 'eucalyptus', 'thyme', 'sage', 'rosemary', 'basil', 'grass', 'hay', 'tea', 'herbs'],
  },
  nutty: {
    label: 'Nutty',
    color: '#B45309',
    notes: ['almond', 'walnut', 'hazelnut', 'pecan', 'peanut', 'marzipan', 'coconut', 'chestnut', 'macadamia'],
  },
  grain: {
    label: 'Grain',
    color: '#D97706',
    notes: ['corn', 'wheat', 'barley', 'rye', 'oat', 'bread', 'biscuit', 'cereal', 'malt', 'toast'],
  },
  mineral: {
    label: 'Mineral',
    color: '#64748B',
    notes: ['salt', 'brine', 'iodine', 'chalk', 'flint', 'wet stone', 'earth', 'clay', 'metallic'],
  },
};

// ============================================
// COMPONENTS
// ============================================

function FlavorWheel({
  selectedNotes,
  onNoteSelect,
  activeCategory,
  onCategorySelect,
}: {
  selectedNotes: Map<string, number>;
  onNoteSelect: (note: string, category: string) => void;
  activeCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}) {
  const categories = Object.entries(FLAVOR_WHEEL);
  const angleStep = 360 / categories.length;
  
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Center Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center z-10 shadow-lg">
        <span className="text-white font-bold text-center text-sm">
          {selectedNotes.size}<br/>notes
        </span>
      </div>
      
      {/* Category Segments */}
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {categories.map(([key, data], index) => {
          const startAngle = index * angleStep - 90;
          const endAngle = startAngle + angleStep;
          const isActive = activeCategory === key;
          
          // Calculate arc path
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const innerRadius = 60;
          const outerRadius = isActive ? 190 : 180;
          
          const x1 = 200 + innerRadius * Math.cos(startRad);
          const y1 = 200 + innerRadius * Math.sin(startRad);
          const x2 = 200 + outerRadius * Math.cos(startRad);
          const y2 = 200 + outerRadius * Math.sin(startRad);
          const x3 = 200 + outerRadius * Math.cos(endRad);
          const y3 = 200 + outerRadius * Math.sin(endRad);
          const x4 = 200 + innerRadius * Math.cos(endRad);
          const y4 = 200 + innerRadius * Math.sin(endRad);
          
          const largeArc = angleStep > 180 ? 1 : 0;
          
          const pathD = `
            M ${x1} ${y1}
            L ${x2} ${y2}
            A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}
            L ${x4} ${y4}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}
            Z
          `;
          
          // Label position
          const labelAngle = startAngle + angleStep / 2;
          const labelRad = (labelAngle * Math.PI) / 180;
          const labelRadius = 130;
          const labelX = 200 + labelRadius * Math.cos(labelRad);
          const labelY = 200 + labelRadius * Math.sin(labelRad);
          
          return (
            <g key={key}>
              <path
                d={pathD}
                fill={data.color}
                opacity={isActive ? 1 : 0.7}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:opacity-100"
                onClick={() => onCategorySelect(isActive ? null : key)}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-semibold text-sm pointer-events-none"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {data.label}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Expanded Notes Panel */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" style={{ color: FLAVOR_WHEEL[activeCategory as keyof typeof FLAVOR_WHEEL].color }}>
                  {FLAVOR_WHEEL[activeCategory as keyof typeof FLAVOR_WHEEL].label} Notes
                </h3>
                <button
                  onClick={() => onCategorySelect(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {FLAVOR_WHEEL[activeCategory as keyof typeof FLAVOR_WHEEL].notes.map(note => {
                  const isSelected = selectedNotes.has(note);
                  const intensity = selectedNotes.get(note) || 0;
                  
                  return (
                    <button
                      key={note}
                      onClick={() => onNoteSelect(note, activeCategory)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? FLAVOR_WHEEL[activeCategory as keyof typeof FLAVOR_WHEEL].color
                          : undefined,
                      }}
                    >
                      {note}
                      {isSelected && intensity > 1 && (
                        <span className="ml-1 opacity-80">×{intensity}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TastingPhase({
  phase,
  spirit,
  onComplete,
}: {
  phase: 'nose' | 'palate' | 'finish';
  spirit: Spirit;
  onComplete: (notes: TastingNote[]) => void;
}) {
  const [selectedNotes, setSelectedNotes] = useState<Map<string, number>>(new Map());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const phaseConfig = {
    nose: {
      title: '👃 Nose',
      description: 'Gently swirl the glass and bring it to your nose. What aromas do you detect?',
      tip: 'Take your time. Let the spirit open up. Notice how the aromas change.',
    },
    palate: {
      title: '👅 Palate',
      description: 'Take a small sip and let it coat your tongue. What flavors stand out?',
      tip: 'Let it sit on your palate for a moment before swallowing.',
    },
    finish: {
      title: '✨ Finish',
      description: 'After swallowing, notice the lingering flavors. How long does it last?',
      tip: 'The finish tells you a lot about the quality of the spirit.',
    },
  };
  
  const config = phaseConfig[phase];
  
  const handleNoteSelect = (note: string, category: string) => {
    const newNotes = new Map(selectedNotes);
    if (newNotes.has(note)) {
      const current = newNotes.get(note)!;
      if (current >= 3) {
        newNotes.delete(note);
      } else {
        newNotes.set(note, current + 1);
      }
    } else {
      newNotes.set(note, 1);
    }
    setSelectedNotes(newNotes);
  };
  
  const handleComplete = () => {
    const notes: TastingNote[] = [];
    selectedNotes.forEach((intensity, note) => {
      notes.push({
        category: phase,
        note,
        intensity,
        timestamp: new Date(),
      });
    });
    onComplete(notes);
  };
  
  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h2>
        <p className="text-gray-600 mb-2">{config.description}</p>
        <p className="text-sm text-amber-600 italic">💡 {config.tip}</p>
      </div>
      
      {/* Spirit Image */}
      <div className="flex justify-center">
        <div className="w-32 h-48 rounded-lg overflow-hidden bg-gray-100 shadow-lg">
          {spirit.image_url ? (
            <img
              src={spirit.image_url}
              alt={spirit.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🥃</div>
          )}
        </div>
      </div>
      
      {/* Flavor Wheel */}
      <FlavorWheel
        selectedNotes={selectedNotes}
        onNoteSelect={handleNoteSelect}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />
      
      {/* Selected Notes Summary */}
      {selectedNotes.size > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your {phase} notes:</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedNotes.entries()).map(([note, intensity]) => (
              <span
                key={note}
                className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
              >
                {note} {intensity > 1 && `(${intensity})`}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Continue Button */}
      <button
        onClick={handleComplete}
        disabled={selectedNotes.size === 0}
        className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${
          selectedNotes.size > 0
            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {phase === 'finish' ? 'Complete Tasting' : 'Continue →'}
      </button>
    </div>
  );
}

function RatingScreen({
  spirit,
  notes,
  onComplete,
}: {
  spirit: Spirit;
  notes: TastingNote[];
  onComplete: (data: { rating: number; wouldBuyAgain: boolean; personalNotes: string }) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wouldBuyAgain, setWouldBuyAgain] = useState<boolean | null>(null);
  const [personalNotes, setPersonalNotes] = useState('');
  
  const displayRating = hoverRating || rating;
  
  // Group notes by category
  const noseNotes = notes.filter(n => n.category === 'nose');
  const palateNotes = notes.filter(n => n.category === 'palate');
  const finishNotes = notes.filter(n => n.category === 'finish');
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate Your Experience</h2>
        <p className="text-gray-600">How would you rate {spirit.name}?</p>
      </div>
      
      {/* Tasting Summary */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Tasting Notes</h3>
        <div className="space-y-3">
          {noseNotes.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-500">Nose: </span>
              <span className="text-gray-700">{noseNotes.map(n => n.note).join(', ')}</span>
            </div>
          )}
          {palateNotes.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-500">Palate: </span>
              <span className="text-gray-700">{palateNotes.map(n => n.note).join(', ')}</span>
            </div>
          )}
          {finishNotes.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-500">Finish: </span>
              <span className="text-gray-700">{finishNotes.map(n => n.note).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Star Rating */}
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="text-4xl transition-transform hover:scale-110"
            >
              {star <= displayRating ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <p className="text-gray-500">
          {displayRating === 0 && 'Tap to rate'}
          {displayRating === 1 && 'Not for me'}
          {displayRating === 2 && 'Below average'}
          {displayRating === 3 && 'Good'}
          {displayRating === 4 && 'Very good'}
          {displayRating === 5 && 'Exceptional!'}
        </p>
      </div>
      
      {/* Would Buy Again */}
      <div>
        <p className="text-gray-700 font-medium mb-3 text-center">Would you buy this again?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setWouldBuyAgain(true)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              wouldBuyAgain === true
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👍 Yes
          </button>
          <button
            onClick={() => setWouldBuyAgain(false)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              wouldBuyAgain === false
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👎 No
          </button>
        </div>
      </div>
      
      {/* Personal Notes */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Personal Notes (optional)</label>
        <textarea
          value={personalNotes}
          onChange={e => setPersonalNotes(e.target.value)}
          placeholder="Any additional thoughts about this spirit..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>
      
      {/* Submit */}
      <button
        onClick={() => onComplete({ rating, wouldBuyAgain: wouldBuyAgain === true, personalNotes })}
        disabled={rating === 0 || wouldBuyAgain === null}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
          rating > 0 && wouldBuyAgain !== null
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Save Tasting Notes 🥃
      </button>
    </div>
  );
}

function SpiritSelector({
  onSelect,
}: {
  onSelect: (spirit: Spirit) => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Spirit[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  
  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }
    
    const searchSpirits = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, image_url, abv, proof, description, tasting_notes, flavor_profile')
        .or(`name.ilike.%${search}%,brand.ilike.%${search}%`)
        .limit(10);
      
      setResults(data || []);
      setLoading(false);
    };
    
    const debounce = setTimeout(searchSpirits, 300);
    return () => clearTimeout(debounce);
  }, [search]);
  
  // Featured spirits for quick selection
  const featured = [
    { id: 'featured-1', name: "Buffalo Trace", brand: "Buffalo Trace", category: "bourbon", image_url: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200" },
    { id: 'featured-2', name: "Maker's Mark", brand: "Maker's Mark", category: "bourbon", image_url: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200" },
    { id: 'featured-3', name: "Woodford Reserve", brand: "Woodford Reserve", category: "bourbon", image_url: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200" },
  ];
  
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a spirit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>
      
      {/* Search Results */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl">🥃</div>
          <p className="text-gray-500 mt-2">Searching...</p>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map(spirit => (
            <button
              key={spirit.id}
              onClick={() => onSelect(spirit)}
              className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all text-left"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {spirit.image_url ? (
                  <img src={spirit.image_url} alt={spirit.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🥃</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{spirit.name}</h3>
                <p className="text-sm text-gray-500">{spirit.brand} • {spirit.category}</p>
                {spirit.abv && <p className="text-xs text-amber-600">{spirit.abv}% ABV</p>}
              </div>
              <span className="text-amber-500">→</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Featured Spirits */}
      {results.length === 0 && !loading && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Spirits</h3>
          <div className="grid grid-cols-3 gap-3">
            {featured.map(spirit => (
              <button
                key={spirit.id}
                onClick={() => onSelect(spirit as Spirit)}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all text-center"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                  {spirit.image_url ? (
                    <img src={spirit.image_url} alt={spirit.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🥃</div>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 text-sm truncate">{spirit.name}</h4>
                <p className="text-xs text-gray-500">{spirit.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function VirtualTastingRoomPage() {
  const [step, setStep] = useState<'select' | 'nose' | 'palate' | 'finish' | 'rating' | 'complete'>('select');
  const [selectedSpirit, setSelectedSpirit] = useState<Spirit | null>(null);
  const [allNotes, setAllNotes] = useState<TastingNote[]>([]);
  const [session, setSession] = useState<TastingSession | null>(null);
  
  const handleSpiritSelect = (spirit: Spirit) => {
    setSelectedSpirit(spirit);
    setStep('nose');
    setAllNotes([]);
  };
  
  const handlePhaseComplete = (notes: TastingNote[]) => {
    setAllNotes(prev => [...prev, ...notes]);
    
    if (step === 'nose') setStep('palate');
    else if (step === 'palate') setStep('finish');
    else if (step === 'finish') setStep('rating');
  };
  
  const handleRatingComplete = async (data: { rating: number; wouldBuyAgain: boolean; personalNotes: string }) => {
    // Save to database
    const supabase = createClient();
    
    const sessionData = {
      spirit_id: selectedSpirit?.id,
      spirit_name: selectedSpirit?.name,
      notes: allNotes,
      overall_rating: data.rating,
      would_buy_again: data.wouldBuyAgain,
      personal_notes: data.personalNotes,
      completed_at: new Date().toISOString(),
    };
    
    // Save tasting session
    await supabase.from('bv_tasting_sessions').insert(sessionData);
    
    setSession({
      id: 'temp',
      spirit: selectedSpirit!,
      notes: allNotes,
      overall_rating: data.rating,
      would_buy_again: data.wouldBuyAgain,
      personal_notes: data.personalNotes,
      started_at: new Date(),
      completed_at: new Date(),
    });
    
    setStep('complete');
  };
  
  const resetTasting = () => {
    setStep('select');
    setSelectedSpirit(null);
    setAllNotes([]);
    setSession(null);
  };
  
  // Progress indicator
  const steps = ['select', 'nose', 'palate', 'finish', 'rating', 'complete'];
  const currentStepIndex = steps.indexOf(step);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>🥃</span>
                Virtual Tasting Room
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {step === 'select' && 'Select a spirit to begin'}
                {step === 'nose' && 'Step 1: Explore the aroma'}
                {step === 'palate' && 'Step 2: Taste the spirit'}
                {step === 'finish' && 'Step 3: Savor the finish'}
                {step === 'rating' && 'Final: Rate your experience'}
                {step === 'complete' && 'Tasting complete!'}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
            >
              ← Back
            </Link>
          </div>
          
          {/* Progress Bar */}
          {step !== 'select' && (
            <div className="mt-4 flex gap-1">
              {['nose', 'palate', 'finish', 'rating'].map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    steps.indexOf(s) <= currentStepIndex
                      ? 'bg-white'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Spirit</h2>
                <SpiritSelector onSelect={handleSpiritSelect} />
              </div>
            </motion.div>
          )}
          
          {(step === 'nose' || step === 'palate' || step === 'finish') && selectedSpirit && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <TastingPhase
                  phase={step as 'nose' | 'palate' | 'finish'}
                  spirit={selectedSpirit}
                  onComplete={handlePhaseComplete}
                />
              </div>
            </motion.div>
          )}
          
          {step === 'rating' && selectedSpirit && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <RatingScreen
                  spirit={selectedSpirit}
                  notes={allNotes}
                  onComplete={handleRatingComplete}
                />
              </div>
            </motion.div>
          )}
          
          {step === 'complete' && session && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tasting Complete!</h2>
                <p className="text-gray-600 mb-6">
                  Your tasting notes for {session.spirit.name} have been saved.
                </p>
                
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-6 text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100">
                      {session.spirit.image_url ? (
                        <img src={session.spirit.image_url} alt={session.spirit.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🥃</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{session.spirit.name}</h3>
                      <p className="text-sm text-gray-500">{session.spirit.brand}</p>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className="text-lg">
                            {star <= session.overall_rating ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Nose:</strong> {session.notes.filter(n => n.category === 'nose').map(n => n.note).join(', ') || 'None recorded'}
                    </p>
                    <p>
                      <strong>Palate:</strong> {session.notes.filter(n => n.category === 'palate').map(n => n.note).join(', ') || 'None recorded'}
                    </p>
                    <p>
                      <strong>Finish:</strong> {session.notes.filter(n => n.category === 'finish').map(n => n.note).join(', ') || 'None recorded'}
                    </p>
                    <p>
                      <strong>Would buy again:</strong> {session.would_buy_again ? '👍 Yes' : '👎 No'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={resetTasting}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Start New Tasting
                  </button>
                  <Link
                    href="/collection"
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
