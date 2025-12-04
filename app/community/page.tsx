'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock feed data
const FEED_POSTS = [
  {
    id: 1,
    type: 'tasting',
    user: { name: 'BourbonHunter', avatar: '👨', level: 42, badge: '🏆' },
    timestamp: '2 hours ago',
    spirit: { name: 'George T. Stagg 2023', rating: 96 },
    content: 'Finally got my hands on this year\'s Stagg! The proof is lower at 137.7 but the flavor is absolutely incredible. Rich dark fruit, tobacco, and that classic Buffalo Trace DNA.',
    tastingNotes: {
      nose: ['Cherry', 'Tobacco', 'Leather', 'Dark Chocolate'],
      palate: ['Caramel', 'Oak', 'Baking Spice', 'Dried Fruit'],
      finish: ['Long', 'Warm', 'Cinnamon', 'Coffee']
    },
    likes: 234,
    comments: 45,
    shares: 12,
    liked: false
  },
  {
    id: 2,
    type: 'achievement',
    user: { name: 'WhiskeyWanderer', avatar: '👩', level: 28, badge: '⭐' },
    timestamp: '4 hours ago',
    achievement: { name: 'Century Club', icon: '💯', description: 'Logged 100 different spirits' },
    content: 'Just hit 100 spirits in my collection! This journey has been incredible. Started with Buffalo Trace and now I\'m exploring Japanese whisky. What should be #101?',
    likes: 156,
    comments: 67,
    shares: 8,
    liked: true
  },
  {
    id: 3,
    type: 'photo',
    user: { name: 'SingleBarrelSam', avatar: '🧔', level: 35, badge: '📸' },
    timestamp: '6 hours ago',
    content: 'Sunset tasting at my new whiskey corner. Finally got the lighting right! 🌅',
    images: ['📷', '📷', '📷'],
    spirits: ['Blanton\'s', 'Weller 12', 'E.H. Taylor'],
    likes: 312,
    comments: 28,
    shares: 15,
    liked: false
  },
  {
    id: 4,
    type: 'question',
    user: { name: 'NewToNeat', avatar: '🙋', level: 5, badge: '🌱' },
    timestamp: '8 hours ago',
    content: 'Just starting my bourbon journey. I love Buffalo Trace - what should I try next? Budget is around $40-50.',
    likes: 45,
    comments: 89,
    shares: 3,
    liked: false,
    answers: [
      { user: 'BourbonHunter', answer: 'Eagle Rare if you can find it! Same distillery, 10 year age statement.' },
      { user: 'WhiskeyWanderer', answer: 'Try Evan Williams Single Barrel - great value and widely available.' }
    ]
  },
  {
    id: 5,
    type: 'collection_add',
    user: { name: 'PappyChaser', avatar: '🎩', level: 55, badge: '👑' },
    timestamp: '12 hours ago',
    content: 'Added to the vault today. 2019 Lot B found at retail! Only took 3 years of relationship building with my local store.',
    spirit: { name: 'Old Rip Van Winkle 10 Year (Lot B)', price: 80, msrp: 80 },
    likes: 567,
    comments: 112,
    shares: 45,
    liked: true
  },
  {
    id: 6,
    type: 'barrel_update',
    user: { name: 'BarrelMaster', avatar: '🛢️', level: 48, badge: '🥃' },
    timestamp: '1 day ago',
    content: 'Month 18 sample from my private barrel at Wilderness Trail. Getting close! Notes of honey, vanilla, and toasted oak coming through beautifully.',
    barrel: { name: 'Wilderness Trail Barrel #4521', age: '18 months', targetAge: '24 months' },
    likes: 189,
    comments: 34,
    shares: 6,
    liked: false
  }
]

const TRENDING_TOPICS = [
  { tag: '#BTAC2024', posts: 1250 },
  { tag: '#PappyHunting', posts: 890 },
  { tag: '#WhiskeyWednesday', posts: 756 },
  { tag: '#BarrelPick', posts: 543 },
  { tag: '#CraftBourbon', posts: 421 }
]

const SUGGESTED_USERS = [
  { name: 'MasterDistiller', avatar: '👨‍🔬', followers: '12.5k', specialty: 'Distillery Tours' },
  { name: 'RyeGuy', avatar: '🌾', followers: '8.2k', specialty: 'Rye Whiskey' },
  { name: 'PeatFreak', avatar: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', followers: '6.8k', specialty: 'Islay Scotch' }
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending'>('all')
  const [posts, setPosts] = useState(FEED_POSTS)
  const [newPost, setNewPost] = useState('')
  const [showComposer, setShowComposer] = useState(false)

  const toggleLike = (postId: number) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'tasting': return '🥃'
      case 'achievement': return '🏆'
      case 'photo': return '📸'
      case 'question': return '❓'
      case 'collection_add': return '📦'
      case 'barrel_update': return '🛢️'
      default: return '💬'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <button className="relative">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
            </button>
            <Link href="/profile" className="flex items-center gap-2 bg-stone-800 px-3 py-1 rounded-full">
              <span>👤</span>
              <span className="text-sm font-medium">Level 25</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { id: 'all', name: 'All Posts', icon: '🌐' },
                { id: 'following', name: 'Following', icon: '👥' },
                { id: 'trending', name: 'Trending', icon: '🔥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'all' | 'following' | 'trending')}
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                    activeTab === tab.id ? 'bg-amber-600' : 'bg-stone-800 hover:bg-stone-700'
                  }`}
                >
                  <span>{tab.icon}</span> {tab.name}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div className="bg-stone-800/50 rounded-xl p-4 mb-6 border border-stone-700/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share your latest tasting, ask a question, or show off your collection..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full bg-stone-700/50 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-amber-400 p-2 rounded-lg hover:bg-stone-700/50">
                        🥃 Add Spirit
                      </button>
                      <button className="text-gray-400 hover:text-amber-400 p-2 rounded-lg hover:bg-stone-700/50">
                        📷 Photo
                      </button>
                      <button className="text-gray-400 hover:text-amber-400 p-2 rounded-lg hover:bg-stone-700/50">
                        📊 Rating
                      </button>
                    </div>
                    <button
                      disabled={!newPost.trim()}
                      className={`px-6 py-2 rounded-lg font-semibold ${
                        newPost.trim()
                          ? 'bg-amber-600 hover:bg-amber-500'
                          : 'bg-stone-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-stone-800/50 rounded-xl border border-stone-700/50 overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center text-2xl">
                          {post.user.avatar}
                        </div>
                        <span className="absolute -bottom-1 -right-1 text-sm">{post.user.badge}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{post.user.name}</span>
                          <span className="text-xs bg-amber-900/50 px-2 py-0.5 rounded-full text-amber-400">
                            Lvl {post.user.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{post.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl" title={post.type}>{getPostIcon(post.type)}</span>
                      <button className="text-gray-500 hover:text-white">•••</button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-4">
                    <p className="text-gray-300 mb-4">{post.content}</p>

                    {/* Tasting Notes */}
                    {post.type === 'tasting' && post.tastingNotes && (
                      <div className="bg-black/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold">{post.spirit?.name}</h4>
                          <span className="bg-amber-600 px-3 py-1 rounded-full text-sm font-bold">
                            {post.spirit?.rating}/100
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-amber-400 font-semibold mb-1">Nose</p>
                            <p className="text-gray-400">{post.tastingNotes.nose.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-amber-400 font-semibold mb-1">Palate</p>
                            <p className="text-gray-400">{post.tastingNotes.palate.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-amber-400 font-semibold mb-1">Finish</p>
                            <p className="text-gray-400">{post.tastingNotes.finish.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Achievement */}
                    {post.type === 'achievement' && post.achievement && (
                      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 mb-4 border border-purple-500/30 text-center">
                        <div className="text-5xl mb-2">{post.achievement.icon}</div>
                        <h4 className="font-bold text-xl text-purple-400">{post.achievement.name}</h4>
                        <p className="text-gray-400">{post.achievement.description}</p>
                      </div>
                    )}

                    {/* Photos */}
                    {post.type === 'photo' && post.images && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {post.images.map((_, i) => (
                          <div key={i} className="aspect-square bg-gradient-to-br from-amber-900/50 to-stone-800 rounded-lg flex items-center justify-center text-4xl">
                            📷
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Collection Add */}
                    {post.type === 'collection_add' && post.spirit && (
                      <div className="bg-green-900/30 rounded-xl p-4 mb-4 border border-green-500/30 flex items-center gap-4">
                        <div className="text-4xl">🥃</div>
                        <div className="flex-1">
                          <h4 className="font-bold">{post.spirit.name}</h4>
                          <p className="text-green-400 text-sm">Purchased at ${post.spirit.price} (MSRP: ${post.spirit.msrp})</p>
                        </div>
                        <span className="text-3xl">✨</span>
                      </div>
                    )}

                    {/* Question Answers */}
                    {post.type === 'question' && post.answers && (
                      <div className="bg-black/30 rounded-xl p-4 mb-4">
                        <h4 className="font-bold text-sm text-gray-400 mb-3">Top Answers</h4>
                        {post.answers.map((ans, i) => (
                          <div key={i} className="flex items-start gap-2 mb-2">
                            <span className="text-amber-400">@{ans.user}:</span>
                            <span className="text-gray-300">{ans.answer}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-stone-700/50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <span>{post.liked ? '❤️' : '🤍'}</span>
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400">
                        <span>💬</span>
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-green-400">
                        <span>🔄</span>
                        <span>{post.shares}</span>
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-amber-400">
                      🔖
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-3xl">
                  👤
                </div>
                <div>
                  <h3 className="font-bold text-lg">Your Profile</h3>
                  <p className="text-gray-400">Level 25 • 2,450 XP</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-amber-400">47</p>
                  <p className="text-xs text-gray-500">Spirits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">156</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">89</p>
                  <p className="text-xs text-gray-500">Following</p>
                </div>
              </div>
            </div>

            {/* Trending */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>🔥</span> Trending
              </h3>
              <div className="space-y-3">
                {TRENDING_TOPICS.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-amber-400 hover:underline cursor-pointer">{topic.tag}</span>
                    <span className="text-xs text-gray-500">{topic.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>👥</span> Suggested
              </h3>
              <div className="space-y-4">
                {SUGGESTED_USERS.map((user, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.specialty}</p>
                      </div>
                    </div>
                    <button className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-full text-xs font-semibold">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Challenge */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>🎯</span> Daily Challenge
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Post a tasting note with at least 3 flavor descriptors to earn 50 XP!
              </p>
              <div className="w-full bg-stone-700 rounded-full h-2 mb-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }} />
              </div>
              <p className="text-xs text-gray-500">0/1 completed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
