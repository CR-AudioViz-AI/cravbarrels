'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

type LeaderboardEntry = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  total_proof_earned: number
  games_played: number
  correct_answers: number
}

type TimeFrame = 'all_time' | 'monthly' | 'weekly'

export default function LeaderboardPage() {
  const { user, profile } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all_time')
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [timeFrame])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Get top players by total_proof_earned
      const { data, error } = await supabase
        .from('bv_profiles')
        .select('id, username, display_name, avatar_url, total_proof_earned, games_played, correct_answers')
        .gt('total_proof_earned', 0)
        .order('total_proof_earned', { ascending: false })
        .limit(100)

      if (error) throw error
      setEntries(data || [])

      // Find user's rank
      if (user && data) {
        const rank = data.findIndex(e => e.id === user.id)
        setUserRank(rank >= 0 ? rank + 1 : null)
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRankDisplay = (index: number) => {
    if (index === 0) return { icon: '🥇', color: 'text-yellow-400' }
    if (index === 1) return { icon: '🥈', color: 'text-gray-300' }
    if (index === 2) return { icon: '🥉', color: 'text-amber-600' }
    return { icon: `#${index + 1}`, color: 'text-stone-400' }
  }

  const getAccuracy = (correct: number, played: number) => {
    if (played === 0) return '0%'
    // Assuming ~10 questions per game average
    const totalQuestions = played * 10
    return `${Math.round((correct / totalQuestions) * 100)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🏆</div>
          <p className="text-xl">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Link href="/" className="inline-flex items-center text-amber-300 hover:text-amber-200 mb-8">
          ← Back to Home
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-amber-200">Top $PROOF earners in BarrelVerse</p>
        </div>

        {/* Time Frame Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { key: 'all_time', label: 'All Time' },
            { key: 'monthly', label: 'This Month' },
            { key: 'weekly', label: 'This Week' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeFrame(key as TimeFrame)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                timeFrame === key
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* User's Rank Card */}
        {user && profile && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 border border-amber-500/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {profile.display_name?.[0] || profile.username?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-bold">{profile.display_name || profile.username || 'You'}</p>
                    <p className="text-amber-300 text-sm">Your Position</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-400">
                    {userRank ? `#${userRank}` : 'Unranked'}
                  </p>
                  <p className="text-stone-400 text-sm">
                    {profile.total_proof_earned?.toLocaleString() || 0} $PROOF
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-stone-900/50 border-b border-amber-600/30 text-sm font-semibold text-stone-400">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-right">$PROOF</div>
              <div className="col-span-2 text-right">Games</div>
              <div className="col-span-2 text-right">Accuracy</div>
            </div>

            {/* Entries */}
            {entries.length === 0 ? (
              <div className="px-6 py-12 text-center text-stone-400">
                <div className="text-4xl mb-4">🎮</div>
                <p>No players yet! Be the first to earn $PROOF.</p>
                <Link 
                  href="/games" 
                  className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded-lg"
                >
                  Start Playing
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-stone-700/50">
                {entries.map((entry, index) => {
                  const rank = getRankDisplay(index)
                  const isCurrentUser = user?.id === entry.id
                  
                  return (
                    <div 
                      key={entry.id}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-stone-800/50 transition-colors ${
                        isCurrentUser ? 'bg-amber-900/20' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className={`col-span-1 font-bold ${rank.color}`}>
                        {index < 3 ? (
                          <span className="text-2xl">{rank.icon}</span>
                        ) : (
                          rank.icon
                        )}
                      </div>
                      
                      {/* Player */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-700 rounded-full flex items-center justify-center">
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-lg">
                              {entry.display_name?.[0] || entry.username?.[0] || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {entry.display_name || entry.username || 'Anonymous'}
                            {isCurrentUser && <span className="text-amber-400 ml-2">(You)</span>}
                          </p>
                        </div>
                      </div>
                      
                      {/* $PROOF */}
                      <div className="col-span-2 text-right font-bold text-amber-400">
                        {entry.total_proof_earned.toLocaleString()}
                      </div>
                      
                      {/* Games */}
                      <div className="col-span-2 text-right text-stone-300">
                        {entry.games_played}
                      </div>
                      
                      {/* Accuracy */}
                      <div className="col-span-2 text-right text-stone-300">
                        {getAccuracy(entry.correct_answers, entry.games_played)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-stone-400 mb-4">Want to climb the leaderboard?</p>
          <Link 
            href="/games"
            className="inline-block bg-amber-600 hover:bg-amber-700 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Play Trivia Now
          </Link>
        </div>
      </div>
    </div>
  )
}
