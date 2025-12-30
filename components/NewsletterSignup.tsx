'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'footer' | 'popup' | 'hero';
  title?: string;
  subtitle?: string;
  source?: string;
  onSuccess?: () => void;
  className?: string;
}

// ============================================
// NEWSLETTER SIGNUP COMPONENT
// ============================================

export default function NewsletterSignup({
  variant = 'inline',
  title = 'Stay in the Spirit',
  subtitle = 'Get exclusive deals, new releases, and tasting tips delivered weekly.',
  source = 'website',
  onSuccess,
  className = '',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Thanks for subscribing!');
        setEmail('');
        onSuccess?.();
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Connection error. Please try again.');
    }
  };

  // ============================================
  // INLINE VARIANT
  // ============================================
  if (variant === 'inline') {
    return (
      <div className={`${className}`}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-600"
            >
              <span className="text-2xl">🎉</span>
              <span className="font-medium">{message}</span>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Joining...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-red-600"
          >
            {message}
          </motion.p>
        )}
      </div>
    );
  }

  // ============================================
  // CARD VARIANT (For homepage sections)
  // ============================================
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 ${className}`}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl">📧</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1">{subtitle}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
            >
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-semibold text-green-800">{message}</p>
              <p className="text-sm text-green-600 mt-1">Check your inbox for a welcome gift!</p>
            </motion.div>
          ) : (
            <motion.form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-600/25 hover:shadow-amber-600/40"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Join Free'}
                </button>
              </div>
              {status === 'error' && (
                <p className="text-sm text-red-600">{message}</p>
              )}
              <p className="text-xs text-gray-500 text-center">
                🔒 No spam ever. Unsubscribe anytime. We respect your privacy.
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Benefits */}
        <div className="mt-6 pt-6 border-t border-amber-200 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-amber-600">✓</span>
            <span>Weekly picks</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-amber-600">✓</span>
            <span>Exclusive deals</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-amber-600">✓</span>
            <span>Tasting guides</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-amber-600">✓</span>
            <span>New releases</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ============================================
  // FOOTER VARIANT
  // ============================================
  if (variant === 'footer') {
    return (
      <div className={`${className}`}>
        <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
        <p className="text-gray-400 text-sm mb-4">{subtitle}</p>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-green-400"
            >
              <span>✓</span>
              <span>{message}</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
              {status === 'error' && (
                <p className="text-sm text-red-400">{message}</p>
              )}
            </form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ============================================
  // HERO VARIANT (Full-width banner)
  // ============================================
  if (variant === 'hero') {
    return (
      <div className={`bg-gradient-to-r from-amber-600 to-orange-600 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
            <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">{subtitle}</p>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 inline-block"
                >
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-xl font-bold text-white">{message}</p>
                  <p className="text-amber-100 mt-2">Your first tasting guide is on its way!</p>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/30 outline-none text-lg"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all text-lg whitespace-nowrap"
                  >
                    {status === 'loading' ? 'Joining...' : 'Join Free →'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {status === 'error' && (
              <p className="mt-4 text-red-200">{message}</p>
            )}

            <p className="mt-6 text-amber-200 text-sm">
              Join 10,000+ spirit enthusiasts • No spam • Unsubscribe anytime
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // POPUP VARIANT
  // ============================================
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto ${className}`}
    >
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">🥃</div>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-2">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-lg font-semibold text-green-600">{message}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-lg"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-all text-lg"
            >
              {status === 'loading' ? 'Subscribing...' : 'Get My Free Guide'}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-600 text-center">{message}</p>
            )}
          </form>
        )}
      </AnimatePresence>

      <p className="mt-4 text-xs text-gray-500 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </motion.div>
  );
}

// ============================================
// EXIT INTENT POPUP WRAPPER
// ============================================

export function NewsletterPopup({
  trigger = 'exit',
  delay = 5000,
}: {
  trigger?: 'exit' | 'scroll' | 'timer';
  delay?: number;
}) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if already subscribed or dismissed
  useState(() => {
    const hasSubscribed = localStorage.getItem('newsletter_subscribed');
    const hasDismissed = localStorage.getItem('newsletter_dismissed');
    if (hasSubscribed || hasDismissed) {
      setDismissed(true);
    }
  });

  // Exit intent detection
  useState(() => {
    if (trigger !== 'exit' || dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !show && !dismissed) {
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  });

  // Timer trigger
  useState(() => {
    if (trigger !== 'timer' || dismissed) return;

    const timer = setTimeout(() => {
      if (!dismissed) setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  });

  // Scroll trigger
  useState(() => {
    if (trigger !== 'scroll' || dismissed) return;

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !show && !dismissed) {
        setShow(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('newsletter_dismissed', 'true');
  };

  const handleSuccess = () => {
    localStorage.setItem('newsletter_subscribed', 'true');
    setTimeout(() => {
      setShow(false);
      setDismissed(true);
    }, 2000);
  };

  if (!show || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative"
        >
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-10"
          >
            ✕
          </button>
          <NewsletterSignup
            variant="popup"
            title="Don't Miss Out!"
            subtitle="Get exclusive tasting guides, deals, and new releases."
            source="popup"
            onSuccess={handleSuccess}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
