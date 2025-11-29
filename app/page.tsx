'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

// Real category data
const CATEGORIES = [
  { id: 'bourbon', name: 'Bourbon', icon: '🥃', color: 'bg-amber-600' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'bg-amber-700' },
  { id: 'irish', name: 'Irish', icon: '☘️', color: 'bg-green-600' },
  { id: 'japanese', name: 'Japanese', icon: '🇯🇵', color: 'bg-red-500' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', color: 'bg-lime-600' },
  { id: 'rum', name: 'Rum', icon: '🏝️', color: 'bg-orange-500' },
  { id: 'gin', name: 'Gin', icon: '🫒', color: 'bg-teal-500' },
  { id: 'cognac', name: 'Cognac', icon: '🍇', color: 'bg-indigo-600' },
]

// Only features that actually work
const FEATURES = [
  {
    icon: '🎮',
    title: 'Trivia Games',
    description: 'Test your spirits knowledge with 4 game modes and 46 real trivia questions',
    link: '/games',
    ready: true,
  },
  {
    icon: '📱',
    title: 'Spirit Collection',
    description: 'Browse 28 premium spirits with detailed tasting notes and pricing',
    link: '/collection',
    ready: true,
  },
  {
    icon: '🏆',
    title: '$PROOF Rewards',
    description: 'Earn tokens for playing games. Redeem for real rewards (coming soon)',
    link: '/games',
    ready: true,
  },
  {
    icon: '📚',
    title: 'Spirits Academy',
    description: '3 educational courses from beginner to advanced (coming soon)',
    link: '#',
    ready: false,
  },
]

// Real stats from database
const STATS = [
  { value: '28', label: 'Premium Spirits' },
  { value: '46', label: 'Trivia Questions' },
  { value: '4', label: 'Game Modes' },
  { value: '8', label: 'Categories' },
]

export default function HomePage() {
  const [ageVerified, setAgeVerified] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if already verified in this session
    if (typeof window !== 'undefined') {
      const verified = sessionStorage.getItem('ageVerified')
      if (verified === 'true') {
        setAgeVerified(true)
      }
    }
  }, [])

  const handleAgeVerification = (verified: boolean) => {
    if (verified) {
      setAgeVerified(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ageVerified', 'true')
      }
    } else {
      window.location.href = 'https://google.com'
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  // Age verification modal
  if (!ageVerified) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-stone-900 border border-amber-600/30 rounded-2xl max-w-md w-full p-8 text-center">
          <span className="text-6xl mb-4 block">🥃</span>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to BarrelVerse</h1>
          <p className="text-stone-300 mb-6">
            You must be of legal drinking age to access this site.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleAgeVerification(true)}
              className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              I am 21 or older - Enter
            </button>
            <button
              onClick={() => handleAgeVerification(false)}
              className="w-full py-3 border border-stone-600 text-stone-300 rounded-lg font-semibold hover:bg-stone-800 transition-colors"
            >
              I am under 21 - Exit
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-4">
            By entering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900">
      {/* Header */}
      <header className="border-b border-amber-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍾</span>
              <span className="text-xl md:text-2xl font-bold text-white">BarrelVerse</span>
            </div>
            <nav className="flex items-center gap-2 md:gap-4">
              <Link href="/games" className="text-amber-300 hover:text-amber-200 text-sm md:text-base px-2 md:px-3 py-2">
                Games
              </Link>
              <Link href="/collection" className="text-amber-300 hover:text-amber-200 text-sm md:text-base px-2 md:px-3 py-2">
                Collection
              </Link>
              <Link href="/auth/login" className="bg-amber-600 hover:bg-amber-700 text-white text-sm md:text-base px-3 md:px-4 py-2 rounded-lg transition-colors">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Master the World of<br />
            <span className="text-amber-400">Premium Spirits</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-300 mb-8 max-w-2xl mx-auto px-4">
            Play trivia, build your collection, earn $PROOF rewards, and become a spirits connoisseur.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link
              href="/games"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl text-base md:text-lg transition-colors"
            >
              🎮 Play Trivia Now
            </Link>
            <Link
              href="/collection"
              className="border border-amber-600 text-amber-400 hover:bg-amber-600/10 font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl text-base md:text-lg transition-colors"
            >
              📱 Browse Spirits
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 border-y border-amber-900/30 bg-stone-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-stone-400 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Explore Spirit Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/collection?category=${category.id}`}
                className="bg-stone-800/50 border border-amber-900/30 rounded-xl p-4 text-center hover:border-amber-600/50 hover:bg-stone-800 transition-all group"
              >
                <span className="text-3xl md:text-4xl block mb-2">{category.icon}</span>
                <span className="text-white text-sm md:text-base font-medium group-hover:text-amber-300 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4 bg-stone-900/50">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            What You Can Do
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`bg-stone-800/50 border border-amber-900/30 rounded-xl p-6 ${feature.ready ? 'hover:border-amber-600/50' : 'opacity-75'} transition-all`}
              >
                <span className="text-4xl block mb-4">{feature.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-stone-400 text-sm mb-4">{feature.description}</p>
                {feature.ready ? (
                  <Link
                    href={feature.link}
                    className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                  >
                    Get Started →
                  </Link>
                ) : (
                  <span className="text-stone-500 text-sm">Coming Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 border border-amber-600/30 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-stone-300 mb-6 max-w-xl mx-auto">
              Start playing trivia now and earn $PROOF tokens. No account required to play!
            </p>
            <Link
              href="/games"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors"
            >
              Start Playing Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-900/30 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍾</span>
              <span className="text-white font-bold">BarrelVerse</span>
            </div>
            <div className="flex gap-6 text-stone-400 text-sm">
              <Link href="/games" className="hover:text-amber-300">Games</Link>
              <Link href="/collection" className="hover:text-amber-300">Collection</Link>
              <Link href="/auth/login" className="hover:text-amber-300">Sign In</Link>
            </div>
            <p className="text-stone-500 text-sm">
              © 2025 CR AudioViz AI, LLC
            </p>
          </div>
          <p className="text-center text-stone-600 text-xs mt-4">
            Please drink responsibly. Must be 21+ to use this site.
          </p>
        </div>
      </footer>
    </div>
  )
}
