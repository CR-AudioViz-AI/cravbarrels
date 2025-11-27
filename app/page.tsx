'use client'

import Link from 'next/link'
import { useState } from 'react'

// Category data
const CATEGORIES = [
  { id: 'bourbon', name: 'Bourbon', icon: '🥃', color: 'bg-amber-500', count: '150+ games' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'bg-amber-700', count: '150+ games' },
  { id: 'irish', name: 'Irish', icon: '☘️', color: 'bg-green-600', count: '100+ games' },
  { id: 'japanese', name: 'Japanese', icon: '🇯🇵', color: 'bg-red-500', count: '80+ games' },
  { id: 'wine', name: 'Wine', icon: '🍷', color: 'bg-purple-600', count: '150+ games' },
  { id: 'beer', name: 'Beer', icon: '🍺', color: 'bg-yellow-500', count: '150+ games' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', color: 'bg-lime-600', count: '100+ games' },
  { id: 'rum', name: 'Rum', icon: '🏝️', color: 'bg-orange-500', count: '100+ games' },
  { id: 'gin', name: 'Gin', icon: '🫒', color: 'bg-teal-500', count: '100+ games' },
  { id: 'vodka', name: 'Vodka', icon: '🧊', color: 'bg-blue-400', count: '80+ games' },
  { id: 'cognac', name: 'Cognac', icon: '🍇', color: 'bg-indigo-600', count: '100+ games' },
  { id: 'sake', name: 'Sake', icon: '🍶', color: 'bg-pink-400', count: '80+ games' },
  { id: 'liqueurs', name: 'Liqueurs', icon: '🧪', color: 'bg-fuchsia-500', count: '80+ games' },
]

const FEATURES = [
  {
    icon: '🎮',
    title: '100+ Interactive Games',
    description: 'Trivia, blind tastings, region matching, and more across all 13 categories',
    link: '/games',
  },
  {
    icon: '📱',
    title: 'Collection Tracking',
    description: 'Scan barcodes, track your bottles, manage wishlists, and get valuations',
    link: '/collection',
  },
  {
    icon: '🏆',
    title: '$PROOF Rewards',
    description: 'Earn tokens for playing, reviewing, and contributing. Redeem for real rewards',
    link: '/rewards',
  },
  {
    icon: '📚',
    title: 'Spirits Academy',
    description: 'Courses from beginner to expert. Earn certifications recognized by the community',
    link: '/academy',
  },
  {
    icon: '👥',
    title: 'Community',
    description: 'Connect with enthusiasts, join clubs, share reviews, and attend virtual tastings',
    link: '/community',
  },
  {
    icon: '🛒',
    title: 'Marketplace',
    description: 'Buy, sell, and trade bottles with verified collectors. Price tracking included',
    link: '/marketplace',
  },
]

const STATS = [
  { value: '100+', label: 'Games' },
  { value: '1,000+', label: 'Trivia Questions' },
  { value: '13', label: 'Categories' },
  { value: '50', label: 'US States Covered' },
]

export default function HomePage() {
  const [ageVerified, setAgeVerified] = useState(false)

  // Age verification modal
  if (!ageVerified) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-fadeIn">
          <span className="text-6xl mb-4 block">🥃</span>
          <h1 className="text-2xl font-bold mb-2">Welcome to BarrelVerse</h1>
          <p className="text-gray-600 mb-6">
            You must be of legal drinking age to access this site.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setAgeVerified(true)}
              className="w-full py-3 bg-barrel-500 text-white rounded-lg font-semibold hover:bg-barrel-600 transition-colors"
            >
              I am 21 or older - Enter
            </button>
            <button
              onClick={() => window.location.href = 'https://google.com'}
              className="w-full py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              I am under 21 - Exit
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            By entering, you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-barrel-900 via-barrel-800 to-barrel-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Ultimate<br/>
              <span className="text-whiskey-400">Spirits Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Learn through games. Track your collection. Connect with enthusiasts.
              Master the world of spirits with BarrelVerse.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 mb-10">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-whiskey-400">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/games"
                className="px-8 py-4 bg-whiskey-400 text-black font-bold rounded-lg hover:bg-whiskey-500 transition-colors text-lg"
              >
                🎮 Play Games
              </Link>
              <Link
                href="/collection"
                className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-lg border border-white/20"
              >
                📱 Start Collection
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              Powered by <span className="text-whiskey-400 font-semibold">Javari AI</span> • A CR AudioViz AI Production
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">13 Spirit Categories</h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Every category gets equal attention. From bourbon to sake, we've got you covered.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/explore/${cat.id}`}
              className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-barrel-200"
            >
              <div className="text-4xl mb-2">{cat.icon}</div>
              <h3 className="font-semibold text-gray-900">{cat.name}</h3>
              <p className="text-xs text-gray-500">{cat.count}</p>
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${cat.color}`} />
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            One platform for learning, collecting, and connecting.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Link
                key={feature.title}
                href={feature.link}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
              >
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">
                  {feature.icon}
                </span>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-barrel-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Javari AI Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-barrel-600 to-barrel-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-3xl font-bold mb-4">Powered by Javari AI</h2>
          <p className="text-xl text-barrel-100 mb-8">
            Our AI assistant knows everything about spirits. Ask questions, get recommendations,
            learn the history, and discover new favorites.
          </p>
          <Link
            href="/javari"
            className="inline-block px-8 py-4 bg-white text-barrel-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Chat with Javari
          </Link>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">📖 Documentation</h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Everything you need to know about BarrelVerse, from getting started to API integration.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/docs" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100">
            <h3 className="text-xl font-semibold mb-2">Getting Started</h3>
            <p className="text-gray-600 text-sm">Learn how to use BarrelVerse and make the most of all features.</p>
          </Link>
          <Link href="/docs/games" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100">
            <h3 className="text-xl font-semibold mb-2">Games Guide</h3>
            <p className="text-gray-600 text-sm">100+ games explained with tips, strategies, and category breakdowns.</p>
          </Link>
          <Link href="/docs/api" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100">
            <h3 className="text-xl font-semibold mb-2">API Reference</h3>
            <p className="text-gray-600 text-sm">Integrate BarrelVerse data into your own applications.</p>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of spirits enthusiasts. Free forever, premium features available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-barrel-500 text-white font-bold rounded-lg hover:bg-barrel-600 transition-colors text-lg">
              Create Free Account
            </button>
            <Link
              href="/pricing"
              className="px-8 py-4 border border-gray-600 rounded-lg font-bold hover:bg-gray-800 transition-colors text-lg"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
