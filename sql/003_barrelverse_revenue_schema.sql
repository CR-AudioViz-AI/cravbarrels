-- =====================================================
-- BARRELVERSE COMPLETE DATABASE SCHEMA
-- =====================================================
-- Revenue Features: Subscriptions, Marketplace, Auctions
-- Gamification: Achievements, Certifications, XP
-- Social: Trading, Chat, Sharing
--
-- Execute in Supabase SQL Editor
-- 
-- Built by Claude + Roy Henderson
-- CR AudioViz AI, LLC - BarrelVerse
-- 2025-12-04
-- =====================================================

-- =====================================================
-- USER EXTENSIONS
-- =====================================================

-- Add premium fields to users table
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS subscription_canceled_at TIMESTAMPTZ;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS default_payment_method TEXT;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS proof_balance INTEGER DEFAULT 0;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS xp_total INTEGER DEFAULT 0;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS xp_level INTEGER DEFAULT 1;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE bv_users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES bv_users(id);

-- =====================================================
-- SUBSCRIPTION EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bv_users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    tier_id TEXT,
    stripe_subscription_id TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON bv_subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON bv_subscription_events(event_type);

-- =====================================================
-- USER STATS (for achievement tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES bv_users(id) ON DELETE CASCADE,
    
    -- Collection stats
    total_bottles INTEGER DEFAULT 0,
    bourbon_count INTEGER DEFAULT 0,
    scotch_count INTEGER DEFAULT 0,
    rum_count INTEGER DEFAULT 0,
    tequila_count INTEGER DEFAULT 0,
    vodka_count INTEGER DEFAULT 0,
    gin_count INTEGER DEFAULT 0,
    wine_count INTEGER DEFAULT 0,
    other_count INTEGER DEFAULT 0,
    collection_value DECIMAL(12,2) DEFAULT 0,
    
    -- Tasting stats
    tasting_notes_count INTEGER DEFAULT 0,
    unique_flavors_identified INTEGER DEFAULT 0,
    blind_tastings_completed INTEGER DEFAULT 0,
    
    -- Trivia stats
    trivia_played INTEGER DEFAULT 0,
    trivia_correct INTEGER DEFAULT 0,
    trivia_perfect_rounds INTEGER DEFAULT 0,
    current_trivia_streak INTEGER DEFAULT 0,
    best_trivia_streak INTEGER DEFAULT 0,
    
    -- Social stats
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    review_upvotes_received INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    referrals_count INTEGER DEFAULT 0,
    
    -- Trading stats
    trades_completed INTEGER DEFAULT 0,
    auctions_won INTEGER DEFAULT 0,
    auctions_created INTEGER DEFAULT 0,
    marketplace_sales INTEGER DEFAULT 0,
    marketplace_purchases INTEGER DEFAULT 0,
    
    -- Exploration stats
    distillery_visits INTEGER DEFAULT 0,
    museum_wings_visited INTEGER DEFAULT 0,
    countries_collected INTEGER DEFAULT 0,
    bourbon_trail_complete BOOLEAN DEFAULT FALSE,
    
    -- Engagement stats
    daily_logins INTEGER DEFAULT 0,
    days_active INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACHIEVEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    xp_reward INTEGER DEFAULT 0,
    proof_reward INTEGER DEFAULT 0,
    requirement JSONB NOT NULL,
    share_text TEXT,
    is_secret BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bv_user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bv_users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES bv_achievements(id),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    shared BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON bv_user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON bv_user_achievements(achievement_id);

-- =====================================================
-- CERTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_certifications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT,
    levels JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bv_user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bv_users(id) ON DELETE CASCADE,
    certification_id TEXT NOT NULL REFERENCES bv_certifications(id),
    current_level INTEGER DEFAULT 0,
    progress JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    level_1_earned_at TIMESTAMPTZ,
    level_2_earned_at TIMESTAMPTZ,
    level_3_earned_at TIMESTAMPTZ,
    level_4_earned_at TIMESTAMPTZ,
    UNIQUE(user_id, certification_id)
);

-- =====================================================
-- MARKETPLACE LISTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES bv_users(id) ON DELETE CASCADE,
    spirit_id UUID REFERENCES bv_spirits(id),
    collection_item_id UUID,
    
    -- Listing details
    title TEXT NOT NULL,
    description TEXT,
    condition TEXT CHECK (condition IN ('sealed', 'opened', 'partial')),
    fill_level INTEGER CHECK (fill_level >= 0 AND fill_level <= 100),
    photos TEXT[] DEFAULT '{}',
    
    -- Pricing
    listing_type TEXT NOT NULL CHECK (listing_type IN ('fixed_price', 'auction', 'trade_only')),
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    accepts_offers BOOLEAN DEFAULT FALSE,
    min_offer DECIMAL(10,2),
    
    -- Shipping
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    ships_to TEXT[] DEFAULT ARRAY['US'],
    local_pickup BOOLEAN DEFAULT FALSE,
    pickup_location TEXT,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'canceled')),
    views INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON bv_marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON bv_marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_type ON bv_marketplace_listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_spirit ON bv_marketplace_listings(spirit_id);

-- =====================================================
-- AUCTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES bv_marketplace_listings(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES bv_users(id),
    
    -- Auction settings
    starting_price DECIMAL(10,2) NOT NULL,
    reserve_price DECIMAL(10,2),
    buy_now_price DECIMAL(10,2),
    bid_increment DECIMAL(10,2) DEFAULT 5.00,
    
    -- Current state
    current_bid DECIMAL(10,2),
    current_bidder_id UUID REFERENCES bv_users(id),
    bid_count INTEGER DEFAULT 0,
    watchers INTEGER DEFAULT 0,
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    extended_until TIMESTAMPTZ,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'sold', 'paid', 'shipped', 'canceled')),
    winner_id UUID REFERENCES bv_users(id),
    winning_bid DECIMAL(10,2),
    payment_intent_id TEXT,
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auctions_status ON bv_auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON bv_auctions(end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON bv_auctions(seller_id);

-- =====================================================
-- AUCTION BIDS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES bv_auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES bv_users(id),
    amount DECIMAL(10,2) NOT NULL,
    max_bid DECIMAL(10,2),
    is_winning BOOLEAN DEFAULT FALSE,
    outbid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bids_auction ON bv_auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bv_auction_bids(bidder_id);

-- =====================================================
-- TRADES
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_id UUID NOT NULL REFERENCES bv_users(id),
    recipient_id UUID NOT NULL REFERENCES bv_users(id),
    
    -- Trade contents
    initiator_items JSONB NOT NULL DEFAULT '[]',
    recipient_items JSONB NOT NULL DEFAULT '[]',
    initiator_cash DECIMAL(10,2) DEFAULT 0,
    recipient_cash DECIMAL(10,2) DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'countered', 'accepted', 'declined', 'completed', 'canceled')),
    initiator_confirmed BOOLEAN DEFAULT FALSE,
    recipient_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Messages
    message TEXT,
    counter_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_initiator ON bv_trades(initiator_id);
CREATE INDEX IF NOT EXISTS idx_trades_recipient ON bv_trades(recipient_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON bv_trades(status);

-- =====================================================
-- INSURANCE REFERRALS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_insurance_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bv_users(id),
    partner_id TEXT NOT NULL,
    collection_value DECIMAL(12,2),
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'clicked' CHECK (status IN ('clicked', 'quoted', 'purchased')),
    commission_earned DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AFFILIATE CLICKS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES bv_users(id),
    retailer_id TEXT NOT NULL,
    spirit_id UUID REFERENCES bv_spirits(id),
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    converted BOOLEAN DEFAULT FALSE,
    conversion_amount DECIMAL(10,2),
    commission_earned DECIMAL(10,2)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_retailer ON bv_affiliate_clicks(retailer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_user ON bv_affiliate_clicks(user_id);

-- =====================================================
-- ACTIVITY LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES bv_users(id),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON bv_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON bv_activity_log(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON bv_activity_log(created_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Add XP to user
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT)
RETURNS void AS $$
DECLARE
    v_new_total INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Update XP
    UPDATE bv_users 
    SET xp_total = xp_total + p_amount
    WHERE id = p_user_id
    RETURNING xp_total INTO v_new_total;
    
    -- Calculate new level (100 XP per level, increasing)
    v_new_level := FLOOR(SQRT(v_new_total / 50)) + 1;
    
    -- Update level if changed
    UPDATE bv_users
    SET xp_level = v_new_level
    WHERE id = p_user_id AND xp_level < v_new_level;
    
    -- Log the event
    INSERT INTO bv_activity_log (user_id, event_type, event_data)
    VALUES (p_user_id, 'xp_earned', jsonb_build_object('amount', p_amount, 'reason', p_reason, 'new_total', v_new_total));
END;
$$ LANGUAGE plpgsql;

-- Add PROOF tokens to user
CREATE OR REPLACE FUNCTION add_proof_tokens(p_user_id UUID, p_amount INTEGER, p_reason TEXT)
RETURNS void AS $$
BEGIN
    UPDATE bv_users 
    SET proof_balance = proof_balance + p_amount
    WHERE id = p_user_id;
    
    INSERT INTO bv_activity_log (user_id, event_type, event_data)
    VALUES (p_user_id, 'proof_earned', jsonb_build_object('amount', p_amount, 'reason', p_reason));
END;
$$ LANGUAGE plpgsql;

-- Update user stats when bottle added
CREATE OR REPLACE FUNCTION update_collection_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment total bottles
    UPDATE bv_user_stats 
    SET total_bottles = total_bottles + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Update category count based on spirit type
    -- This would need to join with bv_spirits to get category
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE bv_subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_insurance_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Users can read their own stats
CREATE POLICY user_stats_select ON bv_user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_stats_all ON bv_user_stats FOR ALL USING (true); -- Service role

-- Anyone can view achievements
CREATE POLICY achievements_select ON bv_achievements FOR SELECT USING (true);

-- Users can view their own achievements
CREATE POLICY user_achievements_select ON bv_user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view active marketplace listings
CREATE POLICY marketplace_select ON bv_marketplace_listings FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Anyone can view active auctions
CREATE POLICY auctions_select ON bv_auctions FOR SELECT USING (status IN ('active', 'ended', 'sold') OR seller_id = auth.uid());

-- Users can view their own trades
CREATE POLICY trades_select ON bv_trades FOR SELECT USING (initiator_id = auth.uid() OR recipient_id = auth.uid());

-- Service role full access
CREATE POLICY service_all_stats ON bv_user_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_achievements ON bv_user_achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_marketplace ON bv_marketplace_listings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_auctions ON bv_auctions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_bids ON bv_auction_bids FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_trades ON bv_trades FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'bv_subscription_events' as table_name, COUNT(*) as rows FROM bv_subscription_events
UNION ALL SELECT 'bv_user_stats', COUNT(*) FROM bv_user_stats
UNION ALL SELECT 'bv_achievements', COUNT(*) FROM bv_achievements
UNION ALL SELECT 'bv_user_achievements', COUNT(*) FROM bv_user_achievements
UNION ALL SELECT 'bv_marketplace_listings', COUNT(*) FROM bv_marketplace_listings
UNION ALL SELECT 'bv_auctions', COUNT(*) FROM bv_auctions
UNION ALL SELECT 'bv_trades', COUNT(*) FROM bv_trades;

SELECT '✅ BARRELVERSE REVENUE TABLES CREATED!' as status;
SELECT '💰 Marketplace, Auctions, Achievements READY!' as message;
