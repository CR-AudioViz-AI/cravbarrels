'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Download, 
  Twitter, 
  Facebook, 
  Copy, 
  Check,
  Wine,
  Trophy,
  Star,
  Flame,
  Camera
} from 'lucide-react';

// Types
interface CollectionStats {
  totalBottles: number;
  totalValue: number;
  rareBottles: number;
  topCategory: string;
  favoriteDistillery: string;
  avgRating: number;
  joinDate: string;
  achievements: number;
}

interface YearStats {
  year: number;
  bottlesAdded: number;
  bottlesOpened: number;
  totalTasted: number;
  favoriteSpirit: string;
  topDistillery: string;
  totalSpent: number;
  rarestFind: string;
  topRatedBottle: string;
  mostActiveMonth: string;
  triviaScore: number;
  achievements: string[];
}

// Shareable Collection Card Component
function ShareableCollectionCard({ 
  username, 
  avatarUrl, 
  stats, 
  theme = 'amber' 
}: { 
  username: string; 
  avatarUrl?: string; 
  stats: CollectionStats; 
  theme?: 'amber' | 'midnight' | 'vintage';
}) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareUrl = `https://barrelverse.com/u/${username}`;
  const shareText = `Check out my bourbon collection on BarrelVerse! 🥃 ${stats.totalBottles} bottles, $${stats.totalValue.toLocaleString()} total value. #BarrelVerse #BourbonCollection`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      {/* The Shareable Card */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${
          theme === 'amber' ? 'from-amber-900 via-amber-800 to-stone-900' :
          theme === 'midnight' ? 'from-slate-900 via-indigo-900 to-slate-900' :
          'from-stone-800 via-amber-950 to-stone-900'
        } p-8 shadow-2xl`}
        style={{ width: '400px', height: '600px' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-orange-500 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl">🥃</span>
              <span className="text-xl font-bold text-amber-400">BarrelVerse</span>
            </div>
            
            {/* Avatar */}
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full rounded-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white">{username}</h2>
            <p className="text-amber-100/70">Member since {stats.joinDate}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-amber-400/20">
              <Wine className="w-6 h-6 text-amber-400 mb-2" />
              <p className="text-3xl font-bold text-white">{stats.totalBottles}</p>
              <p className="text-sm text-amber-100/70">Bottles</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-amber-400/20">
              <Trophy className="w-6 h-6 text-amber-400 mb-2" />
              <p className="text-3xl font-bold text-white">${stats.totalValue.toLocaleString()}</p>
              <p className="text-sm text-amber-100/70">Collection Value</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-amber-400/20">
              <Star className="w-6 h-6 text-amber-400 mb-2" />
              <p className="text-3xl font-bold text-white">{stats.rareBottles}</p>
              <p className="text-sm text-amber-100/70">Rare Bottles</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-amber-400/20">
              <Flame className="w-6 h-6 text-amber-400 mb-2" />
              <p className="text-3xl font-bold text-white">{stats.achievements}</p>
              <p className="text-sm text-amber-100/70">Achievements</p>
            </div>
          </div>

          {/* Favorite Info */}
          <div className="bg-white/5 rounded-xl p-4 border border-amber-400/20 mb-6">
            <p className="text-sm text-amber-100/70 mb-1">Favorite Category</p>
            <p className="text-lg font-bold text-white capitalize">{stats.topCategory}</p>
            <p className="text-sm text-amber-100/70 mt-2 mb-1">Top Distillery</p>
            <p className="text-lg font-bold text-white">{stats.favoriteDistillery}</p>
          </div>

          {/* Rating */}
          <div className="mt-auto">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.round(stats.avgRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-amber-100/70">
              Average Rating: {stats.avgRating.toFixed(1)}
            </p>
          </div>

          {/* Watermark */}
          <p className="text-center text-amber-100/40 text-xs mt-4">
            barrelverse.com • Your Story. Our Design.
          </p>
        </div>
      </div>

      {/* Share Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTwitterShare}
          className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg font-medium hover:bg-[#1a8cd8] transition-colors"
        >
          <Twitter className="w-4 h-4" />
          Tweet
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFacebookShare}
          className="flex items-center gap-2 px-4 py-2 bg-[#4267B2] text-white rounded-lg font-medium hover:bg-[#365899] transition-colors"
        >
          <Facebook className="w-4 h-4" />
          Share
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg font-medium hover:bg-stone-600 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </motion.button>
      </div>
    </div>
  );
}

// Bourbon Wrapped Component
function BourbonWrapped({ username, stats }: { username: string; stats: YearStats }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      content: (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-8xl mb-6"
          >
            🥃
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Your {stats.year} Bourbon Year
          </h1>
          <p className="text-amber-200 text-xl">
            Let&apos;s see what you sipped...
          </p>
        </div>
      ),
    },
    {
      content: (
        <div className="text-center">
          <p className="text-amber-200 mb-4">You added</p>
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-8xl font-bold text-amber-400 mb-4"
          >
            {stats.bottlesAdded}
          </motion.p>
          <p className="text-amber-200 text-2xl mb-8">bottles to your collection</p>
          <p className="text-amber-200/70">
            And opened {stats.bottlesOpened} to share the experience
          </p>
        </div>
      ),
    },
    {
      content: (
        <div className="text-center">
          <p className="text-amber-200 mb-4">Your spirit of the year was</p>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-white mb-6"
          >
            {stats.favoriteSpirit}
          </motion.p>
          <p className="text-amber-200/70">
            from {stats.topDistillery}
          </p>
        </div>
      ),
    },
    {
      content: (
        <div className="text-center">
          <div className="text-6xl mb-6">💎</div>
          <p className="text-amber-200 mb-4">Your rarest find was</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-amber-400"
          >
            {stats.rarestFind}
          </motion.p>
        </div>
      ),
    },
    {
      content: (
        <div className="text-center">
          <p className="text-amber-200 mb-8">By the numbers</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-5xl font-bold text-amber-400">${stats.totalSpent.toLocaleString()}</p>
              <p className="text-amber-200/70">invested</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-amber-400">{stats.totalTasted}</p>
              <p className="text-amber-200/70">spirits tasted</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-amber-400">{stats.triviaScore}</p>
              <p className="text-amber-200/70">trivia points</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-amber-400">{stats.achievements.length}</p>
              <p className="text-amber-200/70">achievements</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Share Your {stats.year} in Bourbon
          </h2>
          <p className="text-amber-200 mb-8">
            Show the world your journey
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-[#1DA1F2] text-white rounded-xl font-bold">
              Share on Twitter
            </button>
            <button className="px-6 py-3 bg-amber-500 text-black rounded-xl font-bold">
              Download Card
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="bg-stone-800/50 rounded-3xl border border-amber-500/30 p-12 min-h-[500px] flex items-center justify-center max-w-lg w-full"
      >
        {slides[currentSlide].content}
      </motion.div>

      <div className="flex items-center justify-between mt-8 w-full max-w-lg">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="px-6 py-2 text-amber-400 disabled:opacity-30"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-amber-400 w-6' : 'bg-stone-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="px-6 py-2 text-amber-400 disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Main Page Component - ONLY default export
export default function SharePage() {
  const mockStats: CollectionStats = {
    totalBottles: 47,
    totalValue: 8450,
    rareBottles: 12,
    topCategory: 'bourbon',
    favoriteDistillery: 'Buffalo Trace',
    avgRating: 4.2,
    joinDate: 'Jan 2024',
    achievements: 23,
  };

  const mockYearStats: YearStats = {
    year: 2024,
    bottlesAdded: 47,
    bottlesOpened: 18,
    totalTasted: 156,
    favoriteSpirit: "Blanton's Original",
    topDistillery: 'Buffalo Trace Distillery',
    totalSpent: 8450,
    rarestFind: 'Pappy Van Winkle 15 Year',
    topRatedBottle: "George T. Stagg",
    mostActiveMonth: 'October',
    triviaScore: 2450,
    achievements: ['First Bottle', 'Bourbon Baron', 'Trivia Master', 'Social Sipper'],
  };

  const [activeTab, setActiveTab] = useState<'card' | 'wrapped'>('card');
  const [selectedTheme, setSelectedTheme] = useState<'amber' | 'midnight' | 'vintage'>('amber');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
      {/* Header */}
      <header className="border-b border-amber-700/50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-400">🥃 BarrelVerse</span>
          </a>
          <nav className="flex items-center gap-4">
            <a href="/collection" className="text-amber-200 hover:text-amber-100">Collection</a>
            <a href="/games" className="text-amber-200 hover:text-amber-100">Games</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Share Your Collection</h1>
          <p className="text-amber-200 text-lg">Show off your spirits journey to the world</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'card'
                ? 'bg-amber-500 text-black'
                : 'bg-stone-700 text-white hover:bg-stone-600'
            }`}
          >
            <Camera className="w-5 h-5 inline mr-2" />
            Collection Card
          </button>
          <button
            onClick={() => setActiveTab('wrapped')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'wrapped'
                ? 'bg-amber-500 text-black'
                : 'bg-stone-700 text-white hover:bg-stone-600'
            }`}
          >
            <Star className="w-5 h-5 inline mr-2" />
            Year Wrapped
          </button>
        </div>

        {activeTab === 'card' && (
          <div className="flex flex-col items-center">
            {/* Theme Selector */}
            <div className="flex gap-4 mb-8">
              {(['amber', 'midnight', 'vintage'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                    selectedTheme === theme
                      ? 'bg-amber-500 text-black'
                      : 'bg-stone-700 text-white hover:bg-stone-600'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            <ShareableCollectionCard
              username="BourbonMaster"
              stats={mockStats}
              theme={selectedTheme}
            />
          </div>
        )}

        {activeTab === 'wrapped' && (
          <BourbonWrapped username="BourbonMaster" stats={mockYearStats} />
        )}
      </main>
    </div>
  );
}
