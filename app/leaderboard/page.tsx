'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  spirits_tried: number;
  quizzes_completed: number;
  achievements: number;
  streak_days: number;
  badge: string;
}

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'WhiskeyMaster', level: 42, xp: 125000, spirits_tried: 458, quizzes_completed: 89, achievements: 45, streak_days: 128, badge: '👑' },
  { rank: 2, username: 'BourbonBaron', level: 38, xp: 98500, spirits_tried: 392, quizzes_completed: 76, achievements: 38, streak_days: 95, badge: '🥈' },
  { rank: 3, username: 'SingleMaltSam', level: 35, xp: 87200, spirits_tried: 345, quizzes_completed: 68, achievements: 32, streak_days: 67, badge: '🥉' },
  { rank: 4, username: 'RyeRider', level: 33, xp: 76800, spirits_tried: 298, quizzes_completed: 62, achievements: 28, streak_days: 45, badge: '⭐' },
  { rank: 5, username: 'PeatPrincess', level: 31, xp: 68500, spirits_tried: 267, quizzes_completed: 58, achievements: 26, streak_days: 38, badge: '⭐' },
  { rank: 6, username: 'BarrelBuddy', level: 29, xp: 58200, spirits_tried: 234, quizzes_completed: 52, achievements: 23, streak_days: 32, badge: '⭐' },
  { rank: 7, username: 'CaskChaser', level: 27, xp: 49800, spirits_tried: 198, quizzes_completed: 45, achievements: 20, streak_days: 28, badge: '🔥' },
  { rank: 8, username: 'HighlandHero', level: 25, xp: 42500, spirits_tried: 176, quizzes_completed: 41, achievements: 18, streak_days: 21, badge: '🔥' },
  { rank: 9, username: 'ProofPro', level: 23, xp: 36800, spirits_tried: 156, quizzes_completed: 38, achievements: 16, streak_days: 18, badge: '🔥' },
  { rank: 10, username: 'MashBillMike', level: 21, xp: 31200, spirits_tried: 134, quizzes_completed: 32, achievements: 14, streak_days: 14, badge: '🔥' },
  { rank: 11, username: 'DistilleryDan', level: 19, xp: 26500, spirits_tried: 118, quizzes_completed: 28, achievements: 12, streak_days: 12, badge: '' },
  { rank: 12, username: 'NoseNinja', level: 17, xp: 22800, spirits_tried: 98, quizzes_completed: 24, achievements: 10, streak_days: 10, badge: '' },
  { rank: 13, username: 'PalatePatrol', level: 15, xp: 19200, spirits_tried: 82, quizzes_completed: 21, achievements: 9, streak_days: 8, badge: '' },
  { rank: 14, username: 'FinishFirst', level: 14, xp: 16800, spirits_tried: 72, quizzes_completed: 18, achievements: 8, streak_days: 7, badge: '' },
  { rank: 15, username: 'SippingSage', level: 12, xp: 14200, spirits_tried: 58, quizzes_completed: 15, achievements: 7, streak_days: 5, badge: '' },
];

type SortKey = 'xp' | 'spirits_tried' | 'quizzes_completed' | 'achievements' | 'streak_days';

export default function LeaderboardPage() {
  const [leaderboard] = useState<LeaderboardEntry[]>(SAMPLE_LEADERBOARD);
  const [sortBy, setSortBy] = useState<SortKey>('xp');
  const [timeframe, setTimeframe] = useState('all-time');

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b[sortBy] - a[sortBy]).map((entry, i) => ({ ...entry, rank: i + 1 }));

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border-yellow-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/40';
      case 3: return 'bg-gradient-to-r from-orange-700/20 to-orange-600/20 border-orange-600/40';
      default: return 'bg-gray-800/50 border-amber-500/10';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950/20 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/40 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 mb-4 inline-flex items-center gap-2">
            ← Back to BarrelVerse
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-100 mt-4">
            🏆 Hall of Fame
          </h1>
          <p className="text-amber-200/70 text-lg mt-2">
            Top whiskey connoisseurs in the BarrelVerse
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {/* Second Place */}
          <div className="mt-8">
            <div className="bg-gradient-to-b from-gray-400/20 to-gray-500/10 rounded-xl p-6 text-center border border-gray-400/30">
              <div className="text-4xl mb-2">🥈</div>
              <div className="w-16 h-16 mx-auto bg-gray-600 rounded-full mb-2 flex items-center justify-center text-2xl">
                {sortedLeaderboard[1]?.username[0]}
              </div>
              <h3 className="text-lg font-bold text-gray-200">{sortedLeaderboard[1]?.username}</h3>
              <p className="text-gray-400 text-sm">Level {sortedLeaderboard[1]?.level}</p>
              <p className="text-amber-400 font-bold mt-2">{formatNumber(sortedLeaderboard[1]?.[sortBy] || 0)}</p>
            </div>
          </div>
          
          {/* First Place */}
          <div>
            <div className="bg-gradient-to-b from-yellow-500/30 to-amber-600/20 rounded-xl p-6 text-center border border-yellow-500/50 transform scale-105">
              <div className="text-5xl mb-2">👑</div>
              <div className="w-20 h-20 mx-auto bg-amber-600 rounded-full mb-2 flex items-center justify-center text-3xl">
                {sortedLeaderboard[0]?.username[0]}
              </div>
              <h3 className="text-xl font-bold text-amber-100">{sortedLeaderboard[0]?.username}</h3>
              <p className="text-amber-300 text-sm">Level {sortedLeaderboard[0]?.level}</p>
              <p className="text-yellow-400 font-bold text-xl mt-2">{formatNumber(sortedLeaderboard[0]?.[sortBy] || 0)}</p>
            </div>
          </div>
          
          {/* Third Place */}
          <div className="mt-8">
            <div className="bg-gradient-to-b from-orange-700/20 to-orange-800/10 rounded-xl p-6 text-center border border-orange-600/30">
              <div className="text-4xl mb-2">🥉</div>
              <div className="w-16 h-16 mx-auto bg-orange-700 rounded-full mb-2 flex items-center justify-center text-2xl">
                {sortedLeaderboard[2]?.username[0]}
              </div>
              <h3 className="text-lg font-bold text-orange-200">{sortedLeaderboard[2]?.username}</h3>
              <p className="text-orange-400 text-sm">Level {sortedLeaderboard[2]?.level}</p>
              <p className="text-amber-400 font-bold mt-2">{formatNumber(sortedLeaderboard[2]?.[sortBy] || 0)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10 mb-8">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('xp')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${sortBy === 'xp' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-amber-200/60 hover:text-amber-200'}`}
              >
                XP
              </button>
              <button
                onClick={() => setSortBy('spirits_tried')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${sortBy === 'spirits_tried' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-amber-200/60 hover:text-amber-200'}`}
              >
                Spirits
              </button>
              <button
                onClick={() => setSortBy('quizzes_completed')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${sortBy === 'quizzes_completed' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-amber-200/60 hover:text-amber-200'}`}
              >
                Quizzes
              </button>
              <button
                onClick={() => setSortBy('achievements')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${sortBy === 'achievements' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-amber-200/60 hover:text-amber-200'}`}
              >
                Achievements
              </button>
              <button
                onClick={() => setSortBy('streak_days')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${sortBy === 'streak_days' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-amber-200/60 hover:text-amber-200'}`}
              >
                🔥 Streak
              </button>
            </div>
            
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="all-time">All Time</option>
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-3">
          {sortedLeaderboard.map((entry) => (
            <div
              key={entry.username}
              className={`rounded-xl p-4 border ${getRankStyle(entry.rank)} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 text-center">
                  <span className="text-2xl font-bold text-amber-100">
                    {entry.rank <= 3 ? entry.badge : `#${entry.rank}`}
                  </span>
                </div>
                
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl">
                  {entry.username[0]}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-amber-100 flex items-center gap-2">
                    {entry.username}
                    {entry.badge && entry.rank > 3 && <span>{entry.badge}</span>}
                  </h3>
                  <p className="text-amber-200/60 text-sm">Level {entry.level}</p>
                </div>
                
                <div className="grid grid-cols-5 gap-6 text-center">
                  <div>
                    <p className={`font-bold ${sortBy === 'xp' ? 'text-amber-400' : 'text-amber-100'}`}>{formatNumber(entry.xp)}</p>
                    <p className="text-amber-200/40 text-xs">XP</p>
                  </div>
                  <div>
                    <p className={`font-bold ${sortBy === 'spirits_tried' ? 'text-amber-400' : 'text-amber-100'}`}>{entry.spirits_tried}</p>
                    <p className="text-amber-200/40 text-xs">Spirits</p>
                  </div>
                  <div>
                    <p className={`font-bold ${sortBy === 'quizzes_completed' ? 'text-amber-400' : 'text-amber-100'}`}>{entry.quizzes_completed}</p>
                    <p className="text-amber-200/40 text-xs">Quizzes</p>
                  </div>
                  <div>
                    <p className={`font-bold ${sortBy === 'achievements' ? 'text-amber-400' : 'text-amber-100'}`}>{entry.achievements}</p>
                    <p className="text-amber-200/40 text-xs">🏅</p>
                  </div>
                  <div>
                    <p className={`font-bold ${sortBy === 'streak_days' ? 'text-amber-400' : 'text-amber-100'}`}>{entry.streak_days}🔥</p>
                    <p className="text-amber-200/40 text-xs">Streak</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Position */}
        <div className="mt-8 bg-gradient-to-r from-amber-600/20 to-amber-500/10 rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-2xl">
                Y
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-100">Your Position</h3>
                <p className="text-amber-200/60">Sign in to see your ranking</p>
              </div>
            </div>
            <Link
              href="/auth"
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Sign In to Compete
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
