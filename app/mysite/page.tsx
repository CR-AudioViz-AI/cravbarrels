'use client'

import { useState } from 'react'
import Link from 'next/link'

interface GuestbookEntry {
  id: string
  visitor: {
    name: string
    username?: string
    avatar: string
    isVerified: boolean
    location?: string
  }
  message: string
  timestamp: string
  reaction?: string
}

interface VisitorLog {
  id: string
  visitor: {
    name: string
    username?: string
    avatar: string
  }
  action: 'viewed_collection' | 'viewed_barrel' | 'viewed_profile' | 'signed_guestbook' | 'followed'
  details?: string
  timestamp: string
}

interface CollectorSite {
  owner: {
    username: string
    displayName: string
    avatar: string
    bio: string
    location: string
    isPremium: boolean
    isVerified: boolean
    joinedDate: string
    stats: {
      spiritsTried: number
      collectionValue: number
      barrelsOwned: number
      followers: number
      following: number
    }
  }
  theme: 'bourbon' | 'wine' | 'beer' | 'scotch' | 'japanese' | 'custom'
  customColors?: {
    primary: string
    secondary: string
    accent: string
  }
  featuredSpirits: Array<{ id: string; name: string; rating: number }>
  featuredBarrels: Array<{ id: string; name: string; age: string }>
  guestbook: GuestbookEntry[]
  visitorLog: VisitorLog[]
  privacySettings: {
    showCollection: 'public' | 'followers' | 'private'
    showBarrels: 'public' | 'followers' | 'private'
    showValue: boolean
    allowGuestbook: boolean
    showVisitorLog: boolean
  }
}

const sampleSite: CollectorSite = {
  owner: {
    username: 'whiskey_wanderer',
    displayName: 'James Mitchell',
    avatar: '🥃',
    bio: 'Bourbon enthusiast with a passion for barrel-aged spirits. Collector since 2015. Always hunting for the next great pour.',
    location: 'Louisville, KY',
    isPremium: true,
    isVerified: true,
    joinedDate: '2022-03-15',
    stats: {
      spiritsTried: 487,
      collectionValue: 45000,
      barrelsOwned: 3,
      followers: 1247,
      following: 89,
    },
  },
  theme: 'bourbon',
  featuredSpirits: [
    { id: '1', name: 'Pappy Van Winkle 15', rating: 98 },
    { id: '2', name: 'George T. Stagg 2023', rating: 96 },
    { id: '3', name: 'William Larue Weller', rating: 95 },
    { id: '4', name: 'Blanton\'s Gold', rating: 94 },
  ],
  featuredBarrels: [
    { id: '1', name: 'Henderson Family Reserve #1', age: '4 years, 6 months' },
    { id: '2', name: 'Four Roses Single Barrel #42', age: '7 years, 9 months' },
  ],
  guestbook: [
    {
      id: '1',
      visitor: { name: 'Mike Reynolds', username: 'bourbon_hunter', avatar: '🤠', isVerified: true, location: 'Nashville, TN' },
      message: 'Incredible collection! That Pappy 15 is a dream bottle. Thanks for sharing your tasting notes—they helped me finally pull the trigger on an ECBP. Cheers! 🥃',
      timestamp: '2024-12-02T14:30:00Z',
      reaction: '🔥',
    },
    {
      id: '2',
      visitor: { name: 'Sarah Kim', username: 'oak_aged', avatar: '🌳', isVerified: false, location: 'Austin, TX' },
      message: 'Found your site through the community forum. Your barrel tracking is inspiring—seriously considering getting my own pick after seeing your journey with the Buffalo Trace barrel!',
      timestamp: '2024-12-01T09:15:00Z',
      reaction: '❤️',
    },
    {
      id: '3',
      visitor: { name: 'Tom Bradley', username: 'spirit_seeker', avatar: '🔍', isVerified: true, location: 'Denver, CO' },
      message: 'Met James at WhiskyFest last year. Great guy with even better taste. If he recommends something, buy it!',
      timestamp: '2024-11-28T18:45:00Z',
      reaction: '👑',
    },
    {
      id: '4',
      visitor: { name: 'Emma Wilson', avatar: '👩‍🌾', isVerified: true, location: 'Lexington, KY' },
      message: 'Just stopped by to say your collection organization is goals. How do you keep track of everything so well?',
      timestamp: '2024-11-25T11:20:00Z',
    },
  ],
  visitorLog: [
    { id: '1', visitor: { name: 'Anonymous', avatar: '👤' }, action: 'viewed_collection', timestamp: '2024-12-03T10:15:00Z' },
    { id: '2', visitor: { name: 'Mike R.', username: 'bourbon_hunter', avatar: '🤠' }, action: 'signed_guestbook', timestamp: '2024-12-02T14:30:00Z' },
    { id: '3', visitor: { name: 'Sarah K.', username: 'oak_aged', avatar: '🌳' }, action: 'viewed_barrel', details: 'Henderson Family Reserve #1', timestamp: '2024-12-01T09:10:00Z' },
    { id: '4', visitor: { name: 'Anonymous', avatar: '👤' }, action: 'viewed_profile', timestamp: '2024-12-01T08:45:00Z' },
    { id: '5', visitor: { name: 'New Collector', avatar: '🆕' }, action: 'followed', timestamp: '2024-11-30T16:20:00Z' },
  ],
  privacySettings: {
    showCollection: 'public',
    showBarrels: 'followers',
    showValue: true,
    allowGuestbook: true,
    showVisitorLog: true,
  },
}

const themeStyles = {
  bourbon: {
    bg: 'from-amber-950 via-amber-900/50 to-stone-900',
    card: 'bg-gradient-to-br from-amber-900/40 to-stone-800/40',
    accent: 'amber',
    headerBg: 'bg-[url("/textures/wood-dark.jpg")] bg-cover',
  },
  wine: {
    bg: 'from-rose-950 via-burgundy-900/50 to-stone-900',
    card: 'bg-gradient-to-br from-rose-900/40 to-stone-800/40',
    accent: 'rose',
    headerBg: 'bg-gradient-to-r from-rose-900 to-purple-900',
  },
  beer: {
    bg: 'from-yellow-900 via-amber-800/50 to-stone-900',
    card: 'bg-gradient-to-br from-yellow-900/40 to-stone-800/40',
    accent: 'yellow',
    headerBg: 'bg-gradient-to-r from-yellow-800 to-amber-900',
  },
  scotch: {
    bg: 'from-slate-900 via-stone-800/50 to-slate-900',
    card: 'bg-gradient-to-br from-slate-800/40 to-stone-800/40',
    accent: 'slate',
    headerBg: 'bg-gradient-to-r from-slate-800 to-stone-900',
  },
  japanese: {
    bg: 'from-stone-900 via-neutral-800/50 to-stone-900',
    card: 'bg-gradient-to-br from-neutral-800/40 to-stone-800/40',
    accent: 'neutral',
    headerBg: 'bg-gradient-to-r from-stone-800 to-neutral-900',
  },
  custom: {
    bg: 'from-stone-900 via-stone-800/50 to-stone-900',
    card: 'bg-gradient-to-br from-stone-800/40 to-stone-800/40',
    accent: 'stone',
    headerBg: 'bg-gradient-to-r from-stone-800 to-stone-900',
  },
}

export default function CollectorSitePage() {
  const [site] = useState<CollectorSite>(sampleSite)
  const [activeTab, setActiveTab] = useState<'collection' | 'barrels' | 'guestbook' | 'activity'>('collection')
  const [newGuestbookEntry, setNewGuestbookEntry] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const theme = themeStyles[site.theme]

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const actionLabels = {
    viewed_collection: '👀 Viewed collection',
    viewed_barrel: '🛢️ Viewed barrel',
    viewed_profile: '👤 Viewed profile',
    signed_guestbook: '📝 Signed guestbook',
    followed: '➕ Started following',
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg} text-white`}>
      {/* Site Header - Wood texture for bourbon theme */}
      <div className={`${theme.headerBg} border-b border-amber-900/30`}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-6xl ring-4 ring-amber-500/50 shadow-2xl">
                {site.owner.avatar}
              </div>
              {site.owner.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl shadow-lg">
                  ✓
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-bold">{site.owner.displayName}</h1>
                {site.owner.isPremium && (
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    ⭐ PRO
                  </span>
                )}
              </div>
              <p className="text-amber-400 mb-3">@{site.owner.username} • {site.owner.location}</p>
              <p className="text-gray-300 max-w-xl mb-4">{site.owner.bio}</p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div>
                  <span className="font-bold text-amber-400">{site.owner.stats.spiritsTried}</span>
                  <span className="text-gray-400 ml-1">spirits</span>
                </div>
                <div>
                  <span className="font-bold text-green-400">${(site.owner.stats.collectionValue / 1000).toFixed(0)}k</span>
                  <span className="text-gray-400 ml-1">collection</span>
                </div>
                <div>
                  <span className="font-bold text-purple-400">{site.owner.stats.barrelsOwned}</span>
                  <span className="text-gray-400 ml-1">barrels</span>
                </div>
                <div>
                  <span className="font-bold text-white">{site.owner.stats.followers.toLocaleString()}</span>
                  <span className="text-gray-400 ml-1">followers</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isFollowing ? 'bg-stone-700 hover:bg-stone-600' : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {isFollowing ? '✓ Following' : '+ Follow'}
              </button>
              <button className="bg-stone-700/50 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                💬 Message
              </button>
              <button className="bg-stone-700/50 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                📤 Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-amber-900/30 pb-4">
          {[
            { id: 'collection', label: '🥃 Collection', count: site.owner.stats.spiritsTried },
            { id: 'barrels', label: '🛢️ Barrels', count: site.owner.stats.barrelsOwned },
            { id: 'guestbook', label: '📖 Guestbook', count: site.guestbook.length },
            { id: 'activity', label: '📊 Visitors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-amber-600 text-white' : 'bg-stone-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Featured Spirits</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {site.featuredSpirits.map((spirit, i) => (
                <div key={spirit.id} className={`${theme.card} rounded-xl p-4 border border-amber-900/20 flex items-center gap-4`}>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center text-3xl">
                    {i === 0 ? '🏆' : i === 1 ? '⭐' : i === 2 ? '🥇' : '🥃'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{spirit.name}</h3>
                    <div className="text-sm text-gray-400">Top {i + 1} rated</div>
                  </div>
                  <div className="text-2xl font-bold text-amber-400">{spirit.rating}</div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/collection" className="bg-stone-700/50 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold inline-block transition-colors">
                View Full Collection →
              </Link>
            </div>
          </div>
        )}

        {/* Barrels Tab */}
        {activeTab === 'barrels' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Active Barrels</h2>
            <div className="space-y-4">
              {site.featuredBarrels.map((barrel) => (
                <div key={barrel.id} className={`${theme.card} rounded-xl p-6 border border-amber-900/20`}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl flex items-center justify-center text-4xl">
                      🛢️
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{barrel.name}</h3>
                      <p className="text-amber-400">Age: {barrel.age}</p>
                    </div>
                    <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold transition-colors">
                      View Journey
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guestbook Tab */}
        {activeTab === 'guestbook' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">📖 Guestbook</h2>
              <span className="text-gray-400">{site.guestbook.length} entries</span>
            </div>

            {/* Sign Guestbook */}
            <div className={`${theme.card} rounded-xl p-6 border border-amber-900/20 mb-8`}>
              <h3 className="font-bold mb-4">✍️ Leave a Message</h3>
              <textarea
                value={newGuestbookEntry}
                onChange={(e) => setNewGuestbookEntry(e.target.value)}
                placeholder="Share your thoughts, say hi, or leave a recommendation..."
                rows={3}
                className="w-full bg-stone-800/50 border border-amber-900/30 rounded-lg p-3 resize-none focus:outline-none focus:border-amber-500 mb-4"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Your name and timestamp will be recorded
                </p>
                <button className="bg-amber-600 hover:bg-amber-500 px-6 py-2 rounded-lg font-semibold transition-colors">
                  Sign Guestbook
                </button>
              </div>
            </div>

            {/* Entries */}
            <div className="space-y-4">
              {site.guestbook.map((entry) => (
                <div key={entry.id} className={`${theme.card} rounded-xl p-6 border border-amber-900/20`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl flex-shrink-0">
                      {entry.visitor.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{entry.visitor.name}</span>
                        {entry.visitor.username && (
                          <span className="text-gray-500">@{entry.visitor.username}</span>
                        )}
                        {entry.visitor.isVerified && (
                          <span className="text-blue-400 text-sm">✓</span>
                        )}
                        {entry.visitor.location && (
                          <span className="text-gray-500 text-sm">• {entry.visitor.location}</span>
                        )}
                      </div>
                      <p className="text-gray-300 mb-2">{entry.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatTimestamp(entry.timestamp)}</span>
                        {entry.reaction && (
                          <span className="bg-stone-700/50 px-2 py-0.5 rounded">{entry.reaction}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visitor Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">📊 Recent Visitors</h2>
              <span className="text-gray-400">Last 7 days</span>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Views', value: '1,247', icon: '👀' },
                { label: 'Profile Views', value: '342', icon: '👤' },
                { label: 'Collection Views', value: '856', icon: '🥃' },
                { label: 'New Followers', value: '+23', icon: '➕' },
              ].map((stat, i) => (
                <div key={i} className={`${theme.card} rounded-xl p-4 text-center border border-amber-900/20`}>
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Activity Log */}
            <div className={`${theme.card} rounded-xl border border-amber-900/20 overflow-hidden`}>
              <div className="p-4 border-b border-amber-900/30">
                <h3 className="font-bold">Activity Log</h3>
              </div>
              <div className="divide-y divide-amber-900/20">
                {site.visitorLog.map((log) => (
                  <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-stone-800/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-xl">
                      {log.visitor.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{log.visitor.name}</span>
                        {log.visitor.username && (
                          <span className="text-gray-500 text-sm">@{log.visitor.username}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {actionLabels[log.action]}
                        {log.details && <span className="text-amber-400"> • {log.details}</span>}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-900/30 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Powered by <Link href="/" className="text-amber-400 hover:text-amber-300">🥃 BarrelVerse</Link>
          </p>
          <p className="text-gray-600 text-xs mt-1">
            whiskey_wanderer.barrelverse.com
          </p>
        </div>
      </footer>
    </div>
  )
}
