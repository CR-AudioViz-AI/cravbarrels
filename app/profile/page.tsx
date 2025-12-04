'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  total_xp: number;
  spirits_tried: number;
  quizzes_completed: number;
  courses_completed: number;
  achievements_earned: number;
  tasting_notes_count: number;
  favorite_category?: string;
  streak_days: number;
  member_since: string;
  badges: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
  progress?: number;
  max_progress?: number;
}

interface RecentActivity {
  id: string;
  type: 'spirit_tried' | 'quiz_completed' | 'course_started' | 'achievement' | 'tasting_note';
  title: string;
  description: string;
  xp_earned: number;
  timestamp: string;
}

// Sample data for demo
const SAMPLE_PROFILE: UserProfile = {
  id: '1',
  username: 'WhiskeyExplorer',
  email: 'demo@barrelverse.com',
  total_xp: 12450,
  spirits_tried: 87,
  quizzes_completed: 23,
  courses_completed: 5,
  achievements_earned: 18,
  tasting_notes_count: 42,
  favorite_category: 'bourbon',
  streak_days: 12,
  member_since: '2024-06-15',
  badges: ['🥃', '📚', '🏆', '🔥']
};

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'First Sip', description: 'Try your first spirit', icon: '🥃', earned_at: '2024-06-15' },
  { id: '2', name: 'Bourbon Beginner', description: 'Try 10 bourbons', icon: '🌽', earned_at: '2024-07-20', progress: 10, max_progress: 10 },
  { id: '3', name: 'Quiz Master', description: 'Complete 20 quizzes', icon: '🧠', earned_at: '2024-09-10', progress: 23, max_progress: 20 },
  { id: '4', name: 'Note Taker', description: 'Write 25 tasting notes', icon: '📝', earned_at: '2024-10-05', progress: 42, max_progress: 25 },
  { id: '5', name: 'Streak Starter', description: 'Maintain a 7-day streak', icon: '🔥', earned_at: '2024-11-01' },
  { id: '6', name: 'Scotch Explorer', description: 'Try 25 scotch whiskies', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', progress: 18, max_progress: 25 },
  { id: '7', name: 'Course Graduate', description: 'Complete 5 courses', icon: '🎓', earned_at: '2024-11-15', progress: 5, max_progress: 5 },
  { id: '8', name: 'Century Club', description: 'Try 100 spirits', icon: '💯', progress: 87, max_progress: 100 },
];

const SAMPLE_ACTIVITIES: RecentActivity[] = [
  { id: '1', type: 'spirit_tried', title: 'Tried Buffalo Trace', description: 'Added to your collection', xp_earned: 50, timestamp: '2024-12-03T10:30:00Z' },
  { id: '2', type: 'tasting_note', title: 'Tasting Note Added', description: 'For Woodford Reserve Double Oaked', xp_earned: 25, timestamp: '2024-12-03T09:15:00Z' },
  { id: '3', type: 'quiz_completed', title: 'Bourbon Basics Quiz', description: 'Score: 9/10', xp_earned: 100, timestamp: '2024-12-02T20:00:00Z' },
  { id: '4', type: 'achievement', title: 'Achievement Unlocked!', description: 'Course Graduate 🎓', xp_earned: 500, timestamp: '2024-12-02T18:30:00Z' },
  { id: '5', type: 'course_started', title: 'Started New Course', description: 'The Art of Scotch Whisky', xp_earned: 10, timestamp: '2024-12-01T14:00:00Z' },
];

const calculateLevel = (xp: number): { level: number; progress: number; xpToNext: number } => {
  const baseXP = 1000;
  const multiplier = 1.5;
  let level = 1;
  let totalXPForLevel = baseXP;
  let accumulatedXP = 0;
  
  while (accumulatedXP + totalXPForLevel <= xp) {
    accumulatedXP += totalXPForLevel;
    level++;
    totalXPForLevel = Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }
  
  const xpInCurrentLevel = xp - accumulatedXP;
  const progress = (xpInCurrentLevel / totalXPForLevel) * 100;
  
  return { level, progress, xpToNext: totalXPForLevel - xpInCurrentLevel };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function ProfilePage() {
  const [profile] = useState<UserProfile>(SAMPLE_PROFILE);
  const [achievements] = useState<Achievement[]>(SAMPLE_ACHIEVEMENTS);
  const [activities] = useState<RecentActivity[]>(SAMPLE_ACTIVITIES);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity' | 'stats'>('overview');
  
  const levelInfo = calculateLevel(profile.total_xp);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'spirit_tried': return '🥃';
      case 'quiz_completed': return '✅';
      case 'course_started': return '📚';
      case 'achievement': return '🏆';
      case 'tasting_note': return '📝';
      default: return '⭐';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950/20 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/40 border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 mb-4 inline-flex items-center gap-2">
            ← Back to BarrelVerse
          </Link>
          
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mt-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {profile.username[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                Lvl {levelInfo.level}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-amber-100 flex items-center justify-center md:justify-start gap-2">
                {profile.username}
                {profile.badges.map((badge, i) => (
                  <span key={i} className="text-2xl">{badge}</span>
                ))}
              </h1>
              <p className="text-amber-200/60 mt-1">Member since {formatDate(profile.member_since)}</p>
              
              {/* XP Bar */}
              <div className="mt-4 max-w-md">
                <div className="flex justify-between text-sm text-amber-200/60 mb-1">
                  <span>{profile.total_xp.toLocaleString()} XP</span>
                  <span>{levelInfo.xpToNext.toLocaleString()} XP to Level {levelInfo.level + 1}</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                    style={{ width: `${levelInfo.progress}%` }}
                  />
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  <span className="text-amber-400 font-bold">{profile.spirits_tried}</span>
                  <span className="text-amber-200/60 ml-1">spirits</span>
                </div>
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  <span className="text-amber-400 font-bold">{profile.tasting_notes_count}</span>
                  <span className="text-amber-200/60 ml-1">notes</span>
                </div>
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  <span className="text-amber-400 font-bold">{profile.streak_days}🔥</span>
                  <span className="text-amber-200/60 ml-1">streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 border-b border-amber-500/20">
          {(['overview', 'achievements', 'activity', 'stats'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'text-amber-400 border-b-2 border-amber-400' 
                  : 'text-amber-200/60 hover:text-amber-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 text-center">
                <div className="text-3xl mb-1">🥃</div>
                <div className="text-2xl font-bold text-amber-100">{profile.spirits_tried}</div>
                <div className="text-amber-200/50 text-sm">Spirits Tried</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 text-center">
                <div className="text-3xl mb-1">✅</div>
                <div className="text-2xl font-bold text-amber-100">{profile.quizzes_completed}</div>
                <div className="text-amber-200/50 text-sm">Quizzes Done</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 text-center">
                <div className="text-3xl mb-1">📚</div>
                <div className="text-2xl font-bold text-amber-100">{profile.courses_completed}</div>
                <div className="text-amber-200/50 text-sm">Courses</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 text-center">
                <div className="text-3xl mb-1">🏆</div>
                <div className="text-2xl font-bold text-amber-100">{profile.achievements_earned}</div>
                <div className="text-amber-200/50 text-sm">Achievements</div>
              </div>
            </div>
            
            {/* Recent Achievements */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
              <h3 className="text-lg font-semibold text-amber-100 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {achievements.filter(a => a.earned_at).slice(0, 4).map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="text-amber-100 font-medium">{achievement.name}</p>
                      <p className="text-amber-200/50 text-xs">{formatDate(achievement.earned_at!)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="#" onClick={() => setActiveTab('achievements')} className="text-amber-400 text-sm mt-4 inline-block hover:underline">
                View all →
              </Link>
            </div>
            
            {/* Activity Feed */}
            <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
              <h3 className="text-lg font-semibold text-amber-100 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-amber-500/10 last:border-0">
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <p className="text-amber-100 font-medium">{activity.title}</p>
                      <p className="text-amber-200/50 text-sm">{activity.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 text-sm">+{activity.xp_earned} XP</span>
                      <p className="text-amber-200/40 text-xs">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Favorite Category */}
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-xl p-6 border border-amber-500/20">
              <h3 className="text-lg font-semibold text-amber-100 mb-4">Your Specialty</h3>
              <div className="text-center">
                <div className="text-5xl mb-2">🥃</div>
                <p className="text-2xl font-bold text-amber-400 capitalize">{profile.favorite_category}</p>
                <p className="text-amber-200/60 mt-2">You've explored more bourbon than any other category!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`rounded-xl p-4 border transition-all ${
                  achievement.earned_at 
                    ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-500/30' 
                    : 'bg-gray-800/30 border-gray-700/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-3xl ${!achievement.earned_at && 'grayscale'}`}>{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-100">{achievement.name}</h4>
                    <p className="text-amber-200/60 text-sm">{achievement.description}</p>
                    {achievement.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-amber-200/50 mb-1">
                          <span>{achievement.progress}/{achievement.max_progress}</span>
                          {achievement.earned_at && <span className="text-green-400">Complete!</span>}
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${achievement.earned_at ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${(achievement.progress / (achievement.max_progress || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {achievement.earned_at && (
                      <p className="text-green-400 text-xs mt-2">Earned {formatDate(achievement.earned_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-900/30 rounded-lg">
                  <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <p className="text-amber-100 font-medium">{activity.title}</p>
                    <p className="text-amber-200/60">{activity.description}</p>
                    <p className="text-amber-200/40 text-sm mt-1">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                  <span className="text-green-400 font-semibold">+{activity.xp_earned} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
              <h3 className="text-lg font-semibold text-amber-100 mb-4">Spirits by Category</h3>
              <div className="space-y-3">
                {[
                  { category: 'Bourbon', count: 45, color: 'bg-amber-500' },
                  { category: 'Scotch', count: 22, color: 'bg-amber-600' },
                  { category: 'Rye', count: 12, color: 'bg-amber-700' },
                  { category: 'Irish', count: 5, color: 'bg-green-600' },
                  { category: 'Japanese', count: 3, color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-amber-200/80">{item.category}</span>
                      <span className="text-amber-100">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / 45) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10">
              <h3 className="text-lg font-semibold text-amber-100 mb-4">All-Time Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-900/30 rounded-lg">
                  <p className="text-3xl font-bold text-amber-400">{profile.total_xp.toLocaleString()}</p>
                  <p className="text-amber-200/50 text-sm">Total XP</p>
                </div>
                <div className="text-center p-4 bg-gray-900/30 rounded-lg">
                  <p className="text-3xl font-bold text-amber-400">{levelInfo.level}</p>
                  <p className="text-amber-200/50 text-sm">Current Level</p>
                </div>
                <div className="text-center p-4 bg-gray-900/30 rounded-lg">
                  <p className="text-3xl font-bold text-amber-400">{profile.streak_days}</p>
                  <p className="text-amber-200/50 text-sm">Day Streak</p>
                </div>
                <div className="text-center p-4 bg-gray-900/30 rounded-lg">
                  <p className="text-3xl font-bold text-amber-400">#{42}</p>
                  <p className="text-amber-200/50 text-sm">Global Rank</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
