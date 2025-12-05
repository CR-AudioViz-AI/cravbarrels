'use client';

/**
 * BARRELVERSE PRICING PAGE
 * ========================
 * Premium subscription tiers with Stripe checkout
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import React, { useState } from 'react';
import { Check, Sparkles, Crown, Star, Zap } from 'lucide-react';

const TIERS = [
  {
    id: 'free',
    name: 'Collector',
    price: 0,
    period: 'forever',
    description: 'Start your spirits journey',
    features: [
      'Track up to 25 bottles',
      'Basic tasting notes',
      '5 trivia games per day',
      'Museum access',
      'Community forums (read only)',
    ],
    cta: 'Current Plan',
    disabled: true,
    icon: Star,
  },
  {
    id: 'premium_monthly',
    name: 'Connoisseur',
    price: 9.99,
    period: 'month',
    description: 'For the serious collector',
    badge: 'MOST POPULAR',
    features: [
      'Unlimited bottle tracking',
      'Advanced AI-powered tasting assistant',
      'Unlimited trivia & games',
      'Full museum + VR experiences',
      'Marketplace access (10 listings)',
      'Unlimited price alerts',
      'Insurance integration',
      'Shareable digital certifications',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
    icon: Sparkles,
  },
  {
    id: 'premium_annual',
    name: 'Connoisseur Annual',
    price: 89.99,
    period: 'year',
    originalPrice: 119.88,
    description: 'Save 25% with annual billing',
    badge: 'BEST VALUE',
    features: [
      'Everything in Connoisseur',
      '25% savings ($119.88 value)',
      '25 marketplace listings',
      'Early access to new features',
      'Exclusive annual member badge',
      '2,500 $PROOF token bonus',
    ],
    cta: 'Start Free Trial',
    icon: Zap,
  },
  {
    id: 'master',
    name: 'Master Distiller',
    price: 24.99,
    period: 'month',
    description: 'The ultimate collector experience',
    badge: 'ELITE',
    features: [
      'Everything in Connoisseur',
      'Unlimited marketplace listings',
      'Auction hosting (5% fee vs 7%)',
      'Verified collector badge',
      'Featured profile placement',
      'White-glove concierge support',
      'Early release notifications',
      'Private trading network access',
      '5,000 $PROOF welcome + 1,000/month',
    ],
    cta: 'Upgrade Now',
    icon: Crown,
  },
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  async function handleSubscribe(tierId: string) {
    setIsLoading(tierId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-amber-500">Journey</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            Unlock the full BarrelVerse experience with premium features designed for serious collectors
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-6 ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-amber-900/50 to-amber-950/50 border-2 border-amber-500 scale-105'
                    : 'bg-stone-900 border border-stone-700'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tier.badge === 'BEST VALUE' ? 'bg-green-600 text-white' :
                      tier.badge === 'MOST POPULAR' ? 'bg-amber-500 text-black' :
                      'bg-purple-600 text-white'
                    }`}>
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    tier.highlight ? 'bg-amber-500' : 'bg-stone-800'
                  }`}>
                    <Icon className={`w-6 h-6 ${tier.highlight ? 'text-black' : 'text-amber-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <p className="text-sm text-stone-400">{tier.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${tier.price}
                    </span>
                    {tier.period !== 'forever' && (
                      <span className="text-stone-400">/{tier.period}</span>
                    )}
                  </div>
                  {tier.originalPrice && (
                    <p className="text-sm text-stone-500 line-through">
                      ${tier.originalPrice}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        tier.highlight ? 'text-amber-500' : 'text-green-500'
                      }`} />
                      <span className="text-sm text-stone-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !tier.disabled && handleSubscribe(tier.id)}
                  disabled={tier.disabled || isLoading === tier.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    tier.disabled
                      ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                      : tier.highlight
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-stone-700 hover:bg-stone-600 text-white'
                  }`}
                >
                  {isLoading === tier.id ? 'Loading...' : tier.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {[
            { icon: '🔒', text: 'Secure Payments' },
            { icon: '🔄', text: 'Cancel Anytime' },
            { icon: '🎁', text: '7-Day Free Trial' },
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 text-stone-400">
              <span className="text-2xl">{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time. Your access continues until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and Apple Pay through our secure Stripe payment system.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 7-day free trial on all premium plans. If you\'re not satisfied within the first 30 days, contact support for a full refund.',
              },
              {
                q: 'What are $PROOF tokens?',
                a: '$PROOF is our reward currency. Earn it through activities like trivia, achievements, and referrals. Use it for marketplace discounts and premium features.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="bg-stone-900 border border-stone-700 rounded-lg p-4 group">
                <summary className="font-semibold text-white cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <span className="text-amber-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-stone-400 mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-stone-500 mb-4">Trusted by spirits enthusiasts worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 text-stone-400">
            <div><span className="text-2xl font-bold text-white">50,000+</span> Users</div>
            <div><span className="text-2xl font-bold text-white">1.1M+</span> Spirits</div>
            <div><span className="text-2xl font-bold text-white">250K+</span> Bottles Tracked</div>
            <div><span className="text-2xl font-bold text-white">4.9★</span> Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
