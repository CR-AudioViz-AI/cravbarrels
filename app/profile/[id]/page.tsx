'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  member_since: string;
  total_xp: number;
  level: number;
  spirits_owned: number;
  spirits_tried: number;
  tastings_completed: number;
  reviews_written: number;
  badges_earned: number;
  favorite_categories: string[];
  is_verified: boolean;
  is_public: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  xp_awarded: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface CollectionSpirit {
  id: string;
  spirit_id: string;
  spirit_name: string;
  spirit_image?: string;
  spirit_category?: string;
  status: 'owned' | 'wishlist' | 'tried';
  rating?: number;
  added_at: string;
}

interface Activity {
  id: string;
  type: 'tasting' | 'review' | 'achievement' | 'collection' | 'level_up';
  title: string;
  description?: string;
  timestamp: string;
  xp_earned?: number;
  spirit_name?: string;
  spirit_image?: string;
}

// ============================================
// LEVEL CALCULATION
// ============================================

function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
  // XP thresholds for each level (exponential growth)
  const baseXp = 100;
  const multiplier = 1.5;
  
  let level = 1;
  let totalXpForLevel = 0;
  let xpForNextLevel = baseXp;
  
  while (totalXpForLevel + xpForNextLevel <= xp) {
    totalXpForLevel += xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(baseXp * Math.pow(multiplier, level - 1));
  }
  
  const currentXp = xp - totalXpForLevel;
  const progress = (currentXp / xpForNextLevel) * 100;
  
  return { level, currentXp, nextLevelXp: xpForNextLevel, progress };
}

function getLevelTitle(level: number): string {
  if (level >= 50) return 'Grandmaster';
  if (level >= 40) return 'Master Distiller';
  if (level >= 30) return 'Expert';
  if (level >= 20) return 'Connoisseur';
  if (level >= 10) return 'Enthusiast';
  if (level >= 5) return 'Explorer';
  return 'Newcomer';
}

// ============================================
// SAMPLE DATA
// ============================================

const SAMPLE_PROFILE: UserProfile = {
  id: '1',
  display_name: 'WhiskeyExplorer',
  avatar_url: 'https://i.pravatar.cc/200?img=8',
  bio: 'Bourbon enthusiast exploring the world of whiskey one dram at a time. Always looking for hidden gems and sharing honest reviews.',
  location: 'Louisville, KY',
  member_since: '2024-03-15T00:00:00Z',
  total_xp: 4750,
  level: 12,
  spirits_owned: 47,
  spirits_tried: 156,
  tastings_completed: 89,
  reviews_written: 34,
  badges_earned: 12,
  favorite_categories: ['bourbon', 'rye', 'scotch'],
  is_verified: true,
  is_public: true,
};

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name: 'First Sip',
    description: 'Complete your first tasting',
    icon: '🥃',
    earned_at: '2024-03-16T10:30:00Z',
    xp_awarded: 50,
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Bourbon Lover',
    description: 'Try 25 different bourbons',
    icon: '🌽',
    earned_at: '2024-06-20T15:45:00Z',
    xp_awarded: 200,
    rarity: 'rare',
  },
  {
    id: '3',
    name: 'Collector',
    description: 'Add 25 spirits to your collection',
    icon: '📦',
    earned_at: '2024-08-05T09:00:00Z',
    xp_awarded: 150,
    rarity: 'rare',
  },
  {
    id: '4',
    name: 'Master Critic',
    description: 'Write 25 detailed reviews',
    icon: '✍️',
    earned_at: '2024-10-12T14:20:00Z',
    xp_awarded: 300,
    rarity: 'epic',
  },
  {
    id: '5',
    name: 'World Traveler',
    description: 'Try spirits from 10 different countries',
    icon: '🌍',
    earned_at: '2024-11-28T11:00:00Z',
    xp_awarded: 250,
    rarity: 'epic',
  },
];

const SAMPLE_COLLECTION: CollectionSpirit[] = [
  {
    id: '1',
    spirit_id: 's1',
    spirit_name: 'Buffalo Trace Bourbon',
    spirit_image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200',
    spirit_category: 'bourbon',
    status: 'owned',
    rating: 4.5,
    added_at: '2024-12-20T00:00:00Z',
  },
  {
    id: '2',
    spirit_id: 's2',
    spirit_name: 'Blanton\'s Single Barrel',
    spirit_image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200',
    spirit_category: 'bourbon',
    status: 'wishlist',
    added_at: '2024-12-15T00:00:00Z',
  },
  {
    id: '3',
    spirit_id: 's3',
    spirit_name: 'Woodford Reserve',
    spirit_image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200',
    spirit_category: 'bourbon',
    status: 'tried',
    rating: 4,
    added_at: '2024-12-10T00:00:00Z',
  },
];

const SAMPLE_ACTIVITY: Activity[] = [
  {
    id: '1',
    type: 'tasting',
    title: 'Completed a tasting',
    description: 'Tasted Buffalo Trace Bourbon',
    timestamp: '2024-12-28T14:30:00Z',
    xp_earned: 75,
    spirit_name: 'Buffalo Trace Bourbon',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    description: 'Earned "World Traveler" badge',
    timestamp: '2024-12-27T11:00:00Z',
    xp_earned: 250,
  },
  {
    id: '3',
    type: 'review',
    title: 'Wrote a review',
    description: 'Reviewed Eagle Rare 10 Year',
    timestamp: '2024-12-26T16:45:00Z',
    xp_earned: 50,
    spirit_name: 'Eagle Rare 10 Year',
  },
  {
    id: '4',
    type: 'level_up',
    title: 'Level Up!',
    description: 'Reached Level 12',
    timestamp: '2024-12-25T09:00:00Z',
    xp_earned: 0,
  },
  {
    id: '5',
    type: 'collection',
    title: 'Added to collection',
    description: 'Added Blanton\'s to wishlist',
    timestamp: '2024-12-24T20:15:00Z',
    spirit_name: 'Blanton\'s Single Barrel',
  },
];

// ============================================
// COMPONENTS
// ============================================

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <span className="text-2xl mb-2 block">{icon}</span>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-orange-500',
  };
  
  const rarityBorders = {
    common: 'border-gray-300',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-amber-400',
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-white rounded-xl border-2 ${rarityBorders[achievement.rarity]} p-4 text-center`}
    >
      <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center text-2xl mb-2`}>
        {achievement.icon}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm">{achievement.name}</h4>
      <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
      <p className="text-xs text-amber-600 mt-2">+{achievement.xp_awarded} XP</p>
    </motion.div>
  );
}

function CollectionItem({ item }: { item: CollectionSpirit }) {
  const statusColors = {
    owned: 'bg-green-100 text-green-700',
    wishlist: 'bg-amber-100 text-amber-700',
    tried: 'bg-blue-100 text-blue-700',
  };
  
  return (
    <Link href={`/spirits/${item.spirit_id}`}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-square bg-gray-100">
          {item.spirit_image ? (
            <img src={item.spirit_image} alt={item.spirit_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🥃</div>
          )}
        </div>
        <div className="p-3">
          <h4 className="font-medium text-gray-900 text-sm truncate">{item.spirit_name}</h4>
          <div className="flex items-center justify-between mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
              {item.status}
            </span>
            {item.rating && (
              <span className="text-sm text-amber-500">★ {item.rating}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const typeIcons = {
    tasting: '🥃',
    review: '✍️',
    achievement: '🏆',
    collection: '📦',
    level_up: '⬆️',
  };
  
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">
        {typeIcons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{activity.title}</p>
        {activity.description && (
          <p className="text-sm text-gray-500">{activity.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {new Date(activity.timestamp).toLocaleDateString()}
          {activity.xp_earned ? ` • +${activity.xp_earned} XP` : ''}
        </p>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(SAMPLE_PROFILE);
  const [achievements, setAchievements] = useState<Achievement[]>(SAMPLE_ACHIEVEMENTS);
  const [collection, setCollection] = useState<CollectionSpirit[]>(SAMPLE_COLLECTION);
  const [activity, setActivity] = useState<Activity[]>(SAMPLE_ACTIVITY);
  const [activeTab, setActiveTab] = useState<'overview' | 'collection' | 'achievements' | 'activity'>('overview');
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'owned' | 'wishlist' | 'tried'>('all');
  const [loading, setLoading] = useState(false);
  
  const levelInfo = profile ? calculateLevel(profile.total_xp) : null;
  const levelTitle = levelInfo ? getLevelTitle(levelInfo.level) : '';
  
  const filteredCollection = collectionFilter === 'all' 
    ? collection 
    : collection.filter(c => c.status === collectionFilter);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-pulse mb-4">👤</div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-500">This user doesn't exist or their profile is private.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-orange-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/20 overflow-hidden border-4 border-white/30">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
                )}
              </div>
              {profile.is_verified && (
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  ✓
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-1">{profile.display_name}</h1>
              <p className="text-white/80 mb-2">
                {levelTitle} • Level {levelInfo?.level}
              </p>
              {profile.location && (
                <p className="text-white/70 text-sm mb-3">📍 {profile.location}</p>
              )}
              {profile.bio && (
                <p className="text-white/90 max-w-lg">{profile.bio}</p>
              )}
              <p className="text-white/60 text-sm mt-3">
                Member since {new Date(profile.member_since).toLocaleDateString()}
              </p>
            </div>
            
            {/* XP Progress */}
            <div className="bg-white/10 rounded-xl p-4 w-full md:w-auto md:min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-sm">Level {levelInfo?.level}</span>
                <span className="text-white/70 text-sm">Level {(levelInfo?.level || 0) + 1}</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo?.progress || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"
                />
              </div>
              <p className="text-center text-sm">
                <span className="text-white font-semibold">{levelInfo?.currentXp.toLocaleString()}</span>
                <span className="text-white/60"> / {levelInfo?.nextLevelXp.toLocaleString()} XP</span>
              </p>
              <p className="text-center text-white/70 text-xs mt-1">
                Total: {profile.total_xp.toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Spirits Owned" value={profile.spirits_owned} icon="📦" />
            <StatCard label="Spirits Tried" value={profile.spirits_tried} icon="🥃" />
            <StatCard label="Tastings" value={profile.tastings_completed} icon="👅" />
            <StatCard label="Reviews" value={profile.reviews_written} icon="✍️" />
            <StatCard label="Badges" value={profile.badges_earned} icon="🏆" />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'collection', label: 'Collection', icon: '📦' },
              { id: 'achievements', label: 'Achievements', icon: '🏆' },
              { id: 'activity', label: 'Activity', icon: '📜' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Achievements</h3>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  View all →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {achievements.slice(0, 3).map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  View all →
                </button>
              </div>
              <div>
                {activity.slice(0, 4).map(item => (
                  <ActivityItem key={item.id} activity={item} />
                ))}
              </div>
            </div>
            
            {/* Favorite Categories */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Favorite Categories</h3>
              <div className="flex flex-wrap gap-2">
                {profile.favorite_categories.map(cat => (
                  <Link
                    key={cat}
                    href={`/explore?category=${cat}`}
                    className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-medium capitalize hover:bg-amber-200"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Collection Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Collection</h3>
                <button
                  onClick={() => setActiveTab('collection')}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  View all →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {collection.slice(0, 3).map(item => (
                  <CollectionItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Collection</h2>
              <div className="flex gap-2">
                {['all', 'owned', 'wishlist', 'tried'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setCollectionFilter(filter as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      collectionFilter === filter
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCollection.map(item => (
                <CollectionItem key={item.id} item={item} />
              ))}
            </div>
            
            {filteredCollection.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-gray-500">No spirits in this category yet</p>
              </div>
            )}
          </div>
        )}
        
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Achievements ({achievements.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {achievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}
        
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Feed</h2>
            <div>
              {activity.map(item => (
                <ActivityItem key={item.id} activity={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
