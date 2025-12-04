'use client'

import { useState } from 'react'
import Link from 'next/link'

// Types
interface UserProfile {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  location: string
  joinedDate: string
  level: number
  xp: number
  xpToNextLevel: number
  rank: string
  badges: Badge[]
  stats: UserStats
  recentActivity: Activity[]
  topSpirits: Spirit[]
  achievements: Achievement[]
  following: number
  followers: number
  isPremium: boolean
}

interface Badge {
  id: string
  name: string
  icon: string
  description: string
  earnedDate: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface UserStats {
  spiritsTried: number
  tastingNotes: number
  reviewsWritten: number
  photosShared: number
  quizzesCompleted: number
  quizAccuracy: number
  coursesCompleted: number
  articlesRead: number
  daysStreak: number
  totalPoints: number
  collectionValue: number
  wishlistItems: number
}

interface Activity {
  id: string
  type: 'tasting' | 'review' | 'quiz' | 'achievement' | 'photo' | 'course'
  title: string
  description: string
  timestamp: string
  xpEarned: number
}

interface Spirit {
  id: string
  name: string
  rating: number
  image: string
}

interface Achievement {
  id: string
  name: string
  icon: string
  progress: number
  total: number
  completed: boolean
}

const sampleUser: UserProfile = {
  id: '1',
  username: 'whiskey_wanderer',
  displayName: 'James Mitchell',
  avatar: '🥃',
  bio: 'Bourbon enthusiast exploring the world one dram at a time. Collector of rare finds and stories behind every bottle.',
  location: 'Louisville, KY',
  joinedDate: '2024-03-15',
  level: 28,
  xp: 14250,
  xpToNextLevel: 15000,
  rank: 'Master Taster',
  isPremium: true,
  following: 156,
  followers: 892,
  badges: [
    { id: '1', name: 'Bourbon Baron', icon: '👑', description: 'Tried 100+ bourbons', earnedDate: '2024-08-20', rarity: 'legendary' },
    { id: '2', name: 'Kentucky Explorer', icon: '🗺️', description: 'Visited 10 KY distilleries', earnedDate: '2024-07-15', rarity: 'epic' },
    { id: '3', name: 'Note Master', icon: '📝', description: 'Written 50 tasting notes', earnedDate: '2024-06-10', rarity: 'rare' },
    { id: '4', name: 'Quiz Whiz', icon: '🧠', description: '90%+ quiz accuracy', earnedDate: '2024-05-22', rarity: 'rare' },
    { id: '5', name: 'Early Adopter', icon: '🌟', description: 'Joined in first month', earnedDate: '2024-03-15', rarity: 'epic' },
    { id: '6', name: 'Streak Master', icon: '🔥', description: '30-day activity streak', earnedDate: '2024-09-01', rarity: 'rare' },
  ],
  stats: {
    spiritsTried: 247,
    tastingNotes: 189,
    reviewsWritten: 67,
    photosShared: 94,
    quizzesCompleted: 156,
    quizAccuracy: 87,
    coursesCompleted: 12,
    articlesRead: 89,
    daysStreak: 45,
    totalPoints: 14250,
    collectionValue: 8750,
    wishlistItems: 23,
  },
  recentActivity: [
    { id: '1', type: 'tasting', title: 'Tasted Blanton\'s Original', description: 'Added detailed tasting notes', timestamp: '2 hours ago', xpEarned: 50 },
    { id: '2', type: 'quiz', title: 'Completed Bourbon Basics Quiz', description: 'Scored 95%', timestamp: '5 hours ago', xpEarned: 75 },
    { id: '3', type: 'achievement', title: 'Unlocked Bourbon Baron', description: 'Reached 100 bourbon tastings', timestamp: '1 day ago', xpEarned: 500 },
    { id: '4', type: 'photo', title: 'Shared Collection Photo', description: 'Buffalo Trace lineup', timestamp: '2 days ago', xpEarned: 25 },
    { id: '5', type: 'course', title: 'Completed Barrel Science', description: 'Learned about char levels', timestamp: '3 days ago', xpEarned: 200 },
  ],
  topSpirits: [
    { id: '1', name: 'Pappy Van Winkle 15', rating: 98, image: '🏆' },
    { id: '2', name: 'George T. Stagg', rating: 96, image: '⭐' },
    { id: '3', name: 'William Larue Weller', rating: 95, image: '🥇' },
    { id: '4', name: 'Blantons Gold', rating: 94, image: '🎖️' },
    { id: '5', name: 'Eagle Rare 17', rating: 93, image: '🦅' },
  ],
  achievements: [
    { id: '1', name: 'Spirit Explorer', icon: '🗺️', progress: 247, total: 500, completed: false },
    { id: '2', name: 'Note Taker', icon: '📝', progress: 189, total: 200, completed: false },
    { id: '3', name: 'Quiz Champion', icon: '🏆', progress: 156, total: 150, completed: true },
    { id: '4', name: 'Social Butterfly', icon: '🦋', progress: 892, total: 1000, completed: false },
    { id: '5', name: 'Course Graduate', icon: '🎓', progress: 12, total: 20, completed: false },
  ],
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-amber-500',
}

const activityIcons = {
  tasting: '🥃',
  review: '✍️',
  quiz: '🧠',
  achievement: '🏆',
  photo: '📸',
  course: '📚',
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'badges' | 'achievements'>('overview')
  const user = sampleUser
  const xpPercentage = (user.xp / user.xpToNextLevel) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white">
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-6">
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
            <Link href="/collection" className="hover:text-amber-400 transition-colors">Collection</Link>
            <Link href="/community" className="hover:text-amber-400 transition-colors">Community</Link>
            <Link href="/journal" className="hover:text-amber-400 transition-colors">Journal</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-amber-900/30 to-stone-800/30 rounded-2xl p-8 mb-8 border border-amber-900/20">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-6xl mb-4 ring-4 ring-amber-500/50">
                {user.avatar}
              </div>
              {user.isPremium && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  ⭐ PREMIUM
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold">{user.displayName}</h1>
                <span className="text-amber-400">@{user.username}</span>
                <span className="bg-amber-900/50 px-3 py-1 rounded-full text-sm">{user.rank}</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-2xl">{user.bio}</p>
              <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-4">
                <span>📍 {user.location}</span>
                <span>📅 Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <span className="text-amber-400 font-semibold">{user.following} Following</span>
                <span className="text-amber-400 font-semibold">{user.followers} Followers</span>
              </div>

              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Level {user.level}</span>
                  <span className="text-sm text-gray-400">{user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP</span>
                </div>
                <div className="h-3 bg-stone-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${xpPercentage}%` }} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors">✏️ Edit Profile</button>
              <button className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold transition-colors">📤 Share Profile</button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Spirits Tried', value: user.stats.spiritsTried, icon: '🥃' },
            { label: 'Tasting Notes', value: user.stats.tastingNotes, icon: '📝' },
            { label: 'Reviews', value: user.stats.reviewsWritten, icon: '✍️' },
            { label: 'Quiz Accuracy', value: `${user.stats.quizAccuracy}%`, icon: '🎯' },
            { label: 'Day Streak', value: user.stats.daysStreak, icon: '🔥' },
            { label: 'Collection Value', value: `$${user.stats.collectionValue.toLocaleString()}`, icon: '💰' },
          ].map((stat, i) => (
            <div key={i} className="bg-stone-800/50 rounded-xl p-4 text-center border border-amber-900/20 hover:border-amber-600/40 transition-colors">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-amber-900/30 pb-4">
          {(['overview', 'activity', 'badges', 'achievements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors capitalize ${
                activeTab === tab ? 'bg-amber-600 text-white' : 'bg-stone-800/50 text-gray-400 hover:text-white hover:bg-stone-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
              <h3 className="text-xl font-bold mb-4">🏆 Top Rated Spirits</h3>
              <div className="space-y-3">
                {user.topSpirits.map((spirit, i) => (
                  <div key={spirit.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                    <span className="text-2xl">{spirit.image}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{spirit.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-stone-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${spirit.rating}%` }} />
                        </div>
                        <span className="text-sm text-amber-400">{spirit.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
              <h3 className="text-xl font-bold mb-4">📊 Recent Activity</h3>
              <div className="space-y-3">
                {user.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-black/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{activityIcons[activity.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                      <span className="text-xs text-amber-400">+{activity.xpEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
              <h3 className="text-xl font-bold mb-4">🎯 Achievement Progress</h3>
              <div className="space-y-4">
                {user.achievements.map((achievement) => (
                  <div key={achievement.id} className="p-3 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{achievement.icon}</span>
                      <span className="font-semibold flex-1">{achievement.name}</span>
                      {achievement.completed && <span className="text-green-400">✓</span>}
                    </div>
                    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${achievement.completed ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (achievement.progress / achievement.total) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{achievement.progress} / {achievement.total}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
            <h3 className="text-xl font-bold mb-6">Activity Feed</h3>
            <div className="space-y-4">
              {user.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 p-4 bg-black/30 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-amber-900/50 flex items-center justify-center text-2xl">
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{activity.title}</h4>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                  <span className="bg-amber-900/50 px-3 py-1 rounded-full text-sm text-amber-400 h-fit">+{activity.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
            <h3 className="text-xl font-bold mb-6">Badges Collection ({user.badges.length})</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.badges.map((badge) => (
                <div key={badge.id} className="p-4 bg-black/30 rounded-lg border border-amber-900/20">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-3xl">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{badge.name}</h4>
                        <span className={`w-2 h-2 rounded-full ${rarityColors[badge.rarity]}`} />
                      </div>
                      <p className="text-sm text-gray-400">{badge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
            <h3 className="text-xl font-bold mb-6">Achievements</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {user.achievements.map((achievement) => (
                <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.completed ? 'bg-green-900/20 border-green-600/40' : 'bg-black/30 border-amber-900/20'}`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${achievement.completed ? 'bg-green-600' : 'bg-amber-900/50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">{achievement.progress} / {achievement.total}</p>
                    </div>
                    {achievement.completed && <span className="text-green-400 text-2xl">✓</span>}
                  </div>
                  <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${achievement.completed ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (achievement.progress / achievement.total) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Link href="/journal" className="bg-gradient-to-r from-amber-700 to-amber-600 p-6 rounded-xl text-center hover:from-amber-600 hover:to-amber-500 transition-all">
            <span className="text-3xl mb-2 block">📝</span>
            <span className="font-bold">New Tasting Note</span>
          </Link>
          <Link href="/collection" className="bg-gradient-to-r from-stone-700 to-stone-600 p-6 rounded-xl text-center hover:from-stone-600 hover:to-stone-500 transition-all">
            <span className="text-3xl mb-2 block">📦</span>
            <span className="font-bold">Add to Collection</span>
          </Link>
          <Link href="/trivia" className="bg-gradient-to-r from-stone-700 to-stone-600 p-6 rounded-xl text-center hover:from-stone-600 hover:to-stone-500 transition-all">
            <span className="text-3xl mb-2 block">🧠</span>
            <span className="font-bold">Take a Quiz</span>
          </Link>
          <Link href="/community" className="bg-gradient-to-r from-stone-700 to-stone-600 p-6 rounded-xl text-center hover:from-stone-600 hover:to-stone-500 transition-all">
            <span className="text-3xl mb-2 block">👥</span>
            <span className="font-bold">Community</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
