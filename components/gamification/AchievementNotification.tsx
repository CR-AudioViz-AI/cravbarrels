'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  proof_reward: number;
}

interface Notification {
  id: string;
  type: 'achievement' | 'level_up' | 'streak' | 'reward';
  data: Achievement | LevelUpData | StreakData | RewardData;
  timestamp: number;
}

interface LevelUpData {
  oldLevel: number;
  newLevel: number;
}

interface StreakData {
  days: number;
  bonus: number;
}

interface RewardData {
  type: 'xp' | 'proof' | 'credits';
  amount: number;
  reason: string;
}

// ============================================
// CONTEXT
// ============================================

interface NotificationContextType {
  showAchievement: (achievement: Achievement) => void;
  showLevelUp: (oldLevel: number, newLevel: number) => void;
  showStreak: (days: number, bonus: number) => void;
  showReward: (type: 'xp' | 'proof' | 'credits', amount: number, reason: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// ============================================
// CONSTANTS
// ============================================

const RARITY_GRADIENTS = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-amber-400 via-orange-500 to-red-500',
};

const RARITY_GLOW = {
  common: '',
  rare: 'shadow-blue-500/50',
  epic: 'shadow-purple-500/50',
  legendary: 'shadow-amber-500/50 animate-pulse',
};

// ============================================
// NOTIFICATION COMPONENTS
// ============================================

function AchievementToast({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={`
        relative overflow-hidden rounded-2xl shadow-2xl ${RARITY_GLOW[achievement.rarity]}
        bg-gradient-to-r ${RARITY_GRADIENTS[achievement.rarity]}
        min-w-[320px] max-w-[400px]
      `}
    >
      {/* Sparkle effect for legendary */}
      {achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                x: Math.random() * 400,
                y: Math.random() * 100,
                opacity: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-300 text-lg">🏆</span>
          <span className="text-white/80 text-sm font-medium uppercase tracking-wide">
            Achievement Unlocked!
          </span>
        </div>

        {/* Content */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-inner"
          >
            {achievement.icon}
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg truncate">{achievement.name}</h3>
            <p className="text-white/70 text-sm line-clamp-2">{achievement.description}</p>
            
            {/* Rewards */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-yellow-300 text-sm font-semibold">
                +{achievement.xp_reward} XP
              </span>
              <span className="text-purple-300 text-sm font-semibold">
                +{achievement.proof_reward} $PROOF
              </span>
            </div>
          </div>
        </div>

        {/* Rarity badge */}
        <div className="absolute top-4 right-4">
          <span className={`
            px-2 py-1 rounded-full text-xs font-bold uppercase
            ${achievement.rarity === 'legendary' ? 'bg-white/30 text-white' :
              achievement.rarity === 'epic' ? 'bg-white/20 text-white' :
              achievement.rarity === 'rare' ? 'bg-white/20 text-white' :
              'bg-white/10 text-white/80'}
          `}>
            {achievement.rarity}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/50 hover:text-white p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        className="h-1 bg-white/30 origin-left"
      />
    </motion.div>
  );
}

function LevelUpToast({ data, onClose }: { data: LevelUpData; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl shadow-green-500/30 p-4 min-w-[280px]"
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl"
        >
          ⬆️
        </motion.div>
        <div>
          <p className="text-green-100 text-sm font-medium">LEVEL UP!</p>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xl">{data.oldLevel}</span>
            <span className="text-white text-xl">→</span>
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: [1, 1.3, 1] }}
              className="text-white text-3xl font-bold"
            >
              {data.newLevel}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StreakToast({ data, onClose }: { data: StreakData; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl shadow-orange-500/30 p-4 min-w-[280px]"
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-4xl"
        >
          🔥
        </motion.div>
        <div>
          <p className="text-orange-100 text-sm font-medium">{data.days} DAY STREAK!</p>
          <p className="text-white text-xl font-bold">+{data.bonus} XP Bonus</p>
        </div>
      </div>
    </motion.div>
  );
}

function RewardToast({ data, onClose }: { data: RewardData; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    xp: '⭐',
    proof: '💎',
    credits: '🪙',
  };

  const colors = {
    xp: 'from-yellow-500 to-amber-600',
    proof: 'from-purple-500 to-pink-600',
    credits: 'from-blue-500 to-cyan-600',
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={`bg-gradient-to-r ${colors[data.type]} rounded-xl shadow-lg p-3 min-w-[240px]`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icons[data.type]}</span>
        <div>
          <p className="text-white font-bold">+{data.amount} {data.type.toUpperCase()}</p>
          <p className="text-white/70 text-sm">{data.reason}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// PROVIDER
// ============================================

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], data: Notification['data']) => {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data,
      timestamp: Date.now(),
    };
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showAchievement = (achievement: Achievement) => {
    addNotification('achievement', achievement);
  };

  const showLevelUp = (oldLevel: number, newLevel: number) => {
    addNotification('level_up', { oldLevel, newLevel });
  };

  const showStreak = (days: number, bonus: number) => {
    addNotification('streak', { days, bonus });
  };

  const showReward = (type: 'xp' | 'proof' | 'credits', amount: number, reason: string) => {
    addNotification('reward', { type, amount, reason });
  };

  return (
    <NotificationContext.Provider value={{ showAchievement, showLevelUp, showStreak, showReward }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {notifications.map(notification => {
            switch (notification.type) {
              case 'achievement':
                return (
                  <AchievementToast
                    key={notification.id}
                    achievement={notification.data as Achievement}
                    onClose={() => removeNotification(notification.id)}
                  />
                );
              case 'level_up':
                return (
                  <LevelUpToast
                    key={notification.id}
                    data={notification.data as LevelUpData}
                    onClose={() => removeNotification(notification.id)}
                  />
                );
              case 'streak':
                return (
                  <StreakToast
                    key={notification.id}
                    data={notification.data as StreakData}
                    onClose={() => removeNotification(notification.id)}
                  />
                );
              case 'reward':
                return (
                  <RewardToast
                    key={notification.id}
                    data={notification.data as RewardData}
                    onClose={() => removeNotification(notification.id)}
                  />
                );
              default:
                return null;
            }
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

// ============================================
// DEMO COMPONENT (for testing)
// ============================================

export function AchievementDemo() {
  const { showAchievement, showLevelUp, showStreak, showReward } = useNotifications();

  const demoAchievements: Achievement[] = [
    {
      id: 'first_bottle',
      name: 'First Pour',
      description: 'Add your first spirit to your collection',
      icon: '🥃',
      rarity: 'common',
      xp_reward: 50,
      proof_reward: 25,
    },
    {
      id: 'bourbon_master',
      name: 'Bourbon Master',
      description: 'Collect 50 different bourbon whiskeys',
      icon: '🎖️',
      rarity: 'epic',
      xp_reward: 750,
      proof_reward: 350,
    },
    {
      id: 'pappy_hunter',
      name: 'Pappy Hunter',
      description: 'Add any Pappy Van Winkle to your collection',
      icon: '🦄',
      rarity: 'legendary',
      xp_reward: 2000,
      proof_reward: 1000,
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold">Test Notifications</h3>
      <div className="flex flex-wrap gap-2">
        {demoAchievements.map(achievement => (
          <button
            key={achievement.id}
            onClick={() => showAchievement(achievement)}
            className={`px-3 py-2 rounded-lg text-white text-sm ${
              achievement.rarity === 'legendary' ? 'bg-amber-500' :
              achievement.rarity === 'epic' ? 'bg-purple-500' :
              'bg-gray-500'
            }`}
          >
            {achievement.icon} {achievement.rarity}
          </button>
        ))}
        <button
          onClick={() => showLevelUp(5, 6)}
          className="px-3 py-2 rounded-lg bg-green-500 text-white text-sm"
        >
          Level Up
        </button>
        <button
          onClick={() => showStreak(7, 35)}
          className="px-3 py-2 rounded-lg bg-orange-500 text-white text-sm"
        >
          Streak
        </button>
        <button
          onClick={() => showReward('xp', 100, 'Daily bonus')}
          className="px-3 py-2 rounded-lg bg-yellow-500 text-white text-sm"
        >
          XP Reward
        </button>
      </div>
    </div>
  );
}
