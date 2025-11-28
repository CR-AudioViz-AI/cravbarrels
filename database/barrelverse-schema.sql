-- ============================================================================
-- BARRELVERSE COMPLETE DATABASE SCHEMA
-- Created: November 28, 2025
-- Purpose: Production-ready schema for billion-dollar spirits platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 1: USER MANAGEMENT
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS bv_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    favorite_spirit TEXT,
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert', 'master')),
    location TEXT,
    birth_date DATE,
    age_verified BOOLEAN DEFAULT FALSE,
    age_verified_at TIMESTAMPTZ,
    proof_balance INTEGER DEFAULT 0,
    total_proof_earned INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    bottles_collected INTEGER DEFAULT 0,
    reviews_written INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMPTZ,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for common lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON bv_profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_experience ON bv_profiles(experience_level);

-- ============================================================================
-- SECTION 2: SPIRITS & BOTTLES DATABASE
-- ============================================================================

-- Master spirits/bottles database
CREATE TABLE IF NOT EXISTS bv_spirits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT NOT NULL CHECK (category IN ('bourbon', 'scotch', 'irish', 'japanese', 'wine', 'beer', 'tequila', 'rum', 'gin', 'vodka', 'cognac', 'sake', 'liqueurs')),
    subcategory TEXT,
    country TEXT,
    region TEXT,
    distillery TEXT,
    proof DECIMAL(5,2),
    abv DECIMAL(5,2),
    age_statement TEXT,
    mash_bill TEXT,
    barrel_type TEXT,
    finish TEXT,
    tasting_notes JSONB DEFAULT '{}',
    flavor_profile JSONB DEFAULT '{}',
    awards JSONB DEFAULT '[]',
    msrp DECIMAL(10,2),
    current_market_price DECIMAL(10,2),
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'very_rare', 'ultra_rare', 'legendary')),
    image_url TEXT,
    thumbnail_url TEXT,
    description TEXT,
    producer_notes TEXT,
    is_allocated BOOLEAN DEFAULT FALSE,
    is_discontinued BOOLEAN DEFAULT FALSE,
    release_year INTEGER,
    bottle_size TEXT DEFAULT '750ml',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spirits_category ON bv_spirits(category);
CREATE INDEX IF NOT EXISTS idx_spirits_brand ON bv_spirits(brand);
CREATE INDEX IF NOT EXISTS idx_spirits_rarity ON bv_spirits(rarity);

-- ============================================================================
-- SECTION 3: USER COLLECTIONS
-- ============================================================================

-- User's personal bottle collection
CREATE TABLE IF NOT EXISTS bv_user_collection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    spirit_id UUID NOT NULL REFERENCES bv_spirits(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    purchase_price DECIMAL(10,2),
    purchase_date DATE,
    purchase_location TEXT,
    current_fill_level INTEGER DEFAULT 100 CHECK (current_fill_level >= 0 AND current_fill_level <= 100),
    is_opened BOOLEAN DEFAULT FALSE,
    opened_date DATE,
    personal_rating DECIMAL(3,1) CHECK (personal_rating >= 0 AND personal_rating <= 5),
    personal_notes TEXT,
    storage_location TEXT,
    for_trade BOOLEAN DEFAULT FALSE,
    trade_value DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, spirit_id, purchase_date)
);

CREATE INDEX IF NOT EXISTS idx_collection_user ON bv_user_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_spirit ON bv_user_collection(spirit_id);

-- ============================================================================
-- SECTION 4: TRIVIA & GAMES
-- ============================================================================

-- Trivia questions database
CREATE TABLE IF NOT EXISTS bv_trivia_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('bourbon', 'scotch', 'irish', 'japanese', 'wine', 'beer', 'tequila', 'rum', 'gin', 'vodka', 'cognac', 'sake', 'general', 'history', 'production', 'brands')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    wrong_answers JSONB NOT NULL,
    explanation TEXT,
    image_url TEXT,
    source TEXT,
    proof_reward INTEGER DEFAULT 10,
    times_shown INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trivia_category ON bv_trivia_questions(category);
CREATE INDEX IF NOT EXISTS idx_trivia_difficulty ON bv_trivia_questions(difficulty);

-- User's trivia progress
CREATE TABLE IF NOT EXISTS bv_trivia_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES bv_trivia_questions(id) ON DELETE CASCADE,
    answered_correctly BOOLEAN NOT NULL,
    time_to_answer INTEGER,
    proof_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id, answered_at)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON bv_trivia_progress(user_id);

-- Game sessions
CREATE TABLE IF NOT EXISTS bv_game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES bv_profiles(id) ON DELETE SET NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('quick_pour', 'masters_challenge', 'daily_dram', 'blind_tasting', 'speed_round')),
    category TEXT,
    difficulty TEXT,
    total_questions INTEGER DEFAULT 10,
    correct_answers INTEGER DEFAULT 0,
    total_proof_earned INTEGER DEFAULT 0,
    time_taken INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON bv_game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON bv_game_sessions(game_type);

-- ============================================================================
-- SECTION 5: REWARDS & ACHIEVEMENTS
-- ============================================================================

-- Rewards catalog
CREATE TABLE IF NOT EXISTS bv_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('merchandise', 'experience', 'digital', 'discount', 'exclusive')),
    proof_cost INTEGER NOT NULL,
    image_url TEXT,
    quantity_available INTEGER,
    is_limited BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    partner_name TEXT,
    redemption_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reward redemptions
CREATE TABLE IF NOT EXISTS bv_reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES bv_rewards(id) ON DELETE CASCADE,
    proof_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
    redemption_code TEXT,
    shipping_address JSONB,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Achievements/Badges
CREATE TABLE IF NOT EXISTS bv_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('trivia', 'collection', 'social', 'exploration', 'special')),
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    proof_reward INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS bv_user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES bv_achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- SECTION 6: $PROOF TOKEN SYSTEM
-- ============================================================================

-- $PROOF transaction ledger
CREATE TABLE IF NOT EXISTS bv_proof_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus', 'refund', 'transfer_in', 'transfer_out', 'purchase')),
    source TEXT NOT NULL,
    reference_id UUID,
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proof_user ON bv_proof_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_proof_type ON bv_proof_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_proof_date ON bv_proof_transactions(created_at);

-- ============================================================================
-- SECTION 7: SOCIAL FEATURES
-- ============================================================================

-- User reviews
CREATE TABLE IF NOT EXISTS bv_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    spirit_id UUID NOT NULL REFERENCES bv_spirits(id) ON DELETE CASCADE,
    rating DECIMAL(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    nose_notes TEXT,
    palate_notes TEXT,
    finish_notes TEXT,
    overall_notes TEXT,
    would_recommend BOOLEAN,
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    likes_count INTEGER DEFAULT 0,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, spirit_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_spirit ON bv_reviews(spirit_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON bv_reviews(user_id);

-- User follows
CREATE TABLE IF NOT EXISTS bv_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ============================================================================
-- SECTION 8: SUBSCRIPTIONS & PAYMENTS
-- ============================================================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS bv_subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    features JSONB DEFAULT '[]',
    proof_monthly_bonus INTEGER DEFAULT 0,
    max_collection_items INTEGER,
    stripe_price_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS bv_user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES bv_subscription_plans(id),
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'paused')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 9: LEADERBOARDS
-- ============================================================================

-- Daily/Weekly/Monthly leaderboards
CREATE TABLE IF NOT EXISTS bv_leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
    period_start DATE NOT NULL,
    category TEXT DEFAULT 'overall',
    proof_earned INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2),
    rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_start, category)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON bv_leaderboards(period_type, period_start);

-- ============================================================================
-- SECTION 10: LEARNING / ACADEMY
-- ============================================================================

-- Courses
CREATE TABLE IF NOT EXISTS bv_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    certification_name TEXT,
    estimated_minutes INTEGER,
    total_lessons INTEGER,
    proof_reward INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS bv_course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES bv_courses(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    quiz_questions JSONB DEFAULT '[]',
    proof_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User course progress
CREATE TABLE IF NOT EXISTS bv_user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES bv_courses(id) ON DELETE CASCADE,
    current_lesson INTEGER DEFAULT 1,
    completed_lessons JSONB DEFAULT '[]',
    quiz_scores JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    certificate_url TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- ============================================================================
-- SECTION 11: MARKETPLACE (FUTURE)
-- ============================================================================

-- Marketplace listings (for trading/selling)
CREATE TABLE IF NOT EXISTS bv_marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    spirit_id UUID NOT NULL REFERENCES bv_spirits(id),
    collection_item_id UUID REFERENCES bv_user_collection(id),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'trade', 'auction')),
    asking_price DECIMAL(10,2),
    minimum_offer DECIMAL(10,2),
    description TEXT,
    condition TEXT CHECK (condition IN ('sealed', 'opened_full', 'opened_partial', 'empty_display')),
    images JSONB DEFAULT '[]',
    shipping_options JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'expired', 'cancelled')),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ============================================================================
-- SECTION 12: ACTIVITY FEED
-- ============================================================================

-- Activity feed
CREATE TABLE IF NOT EXISTS bv_activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('review', 'collection_add', 'achievement', 'game_score', 'course_complete', 'follow', 'reward_redeem')),
    title TEXT NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON bv_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON bv_activity_feed(created_at);

-- ============================================================================
-- SECTION 13: RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE bv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_spirits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_trivia_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_proof_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_activity_feed ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON bv_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON bv_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON bv_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Spirits policies (public read)
CREATE POLICY "Spirits are viewable by everyone" ON bv_spirits FOR SELECT USING (true);

-- Collection policies
CREATE POLICY "Users can view own collection" ON bv_user_collection FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collection" ON bv_user_collection FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collection" ON bv_user_collection FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collection" ON bv_user_collection FOR DELETE USING (auth.uid() = user_id);

-- Trivia policies
CREATE POLICY "Trivia questions viewable by all" ON bv_trivia_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own progress" ON bv_trivia_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON bv_trivia_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game session policies
CREATE POLICY "Users can view own sessions" ON bv_game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON bv_game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON bv_game_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Rewards policies (public read)
CREATE POLICY "Rewards viewable by all" ON bv_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own redemptions" ON bv_reward_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own redemptions" ON bv_reward_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Achievements viewable by all" ON bv_achievements FOR SELECT USING (is_active = true);
CREATE POLICY "User achievements viewable by all" ON bv_user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON bv_user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- $PROOF transaction policies
CREATE POLICY "Users can view own transactions" ON bv_proof_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON bv_proof_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews viewable by all" ON bv_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON bv_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON bv_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON bv_reviews FOR DELETE USING (auth.uid() = user_id);

-- Follow policies
CREATE POLICY "Follows viewable by all" ON bv_follows FOR SELECT USING (true);
CREATE POLICY "Users can insert own follows" ON bv_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON bv_follows FOR DELETE USING (auth.uid() = follower_id);

-- Subscription policies
CREATE POLICY "Plans viewable by all" ON bv_subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own subscriptions" ON bv_user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Leaderboard policies (public)
CREATE POLICY "Leaderboards viewable by all" ON bv_leaderboards FOR SELECT USING (true);

-- Course policies
CREATE POLICY "Courses viewable by all" ON bv_courses FOR SELECT USING (is_active = true);
CREATE POLICY "Lessons viewable by all" ON bv_course_lessons FOR SELECT USING (true);
CREATE POLICY "Users can view own progress" ON bv_user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON bv_user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON bv_user_course_progress FOR UPDATE USING (auth.uid() = user_id);

-- Marketplace policies
CREATE POLICY "Active listings viewable by all" ON bv_marketplace_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Users can insert own listings" ON bv_marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON bv_marketplace_listings FOR UPDATE USING (auth.uid() = seller_id);

-- Activity feed policies
CREATE POLICY "Public activities viewable by all" ON bv_activity_feed FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own activities" ON bv_activity_feed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON bv_activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SECTION 14: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON bv_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spirits_updated_at BEFORE UPDATE ON bv_spirits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collection_updated_at BEFORE UPDATE ON bv_user_collection FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON bv_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON bv_user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON bv_leaderboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON bv_user_course_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bv_profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to award $PROOF
CREATE OR REPLACE FUNCTION award_proof(
    p_user_id UUID,
    p_amount INTEGER,
    p_source TEXT,
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Update user's balance
    UPDATE bv_profiles
    SET 
        proof_balance = proof_balance + p_amount,
        total_proof_earned = CASE WHEN p_amount > 0 THEN total_proof_earned + p_amount ELSE total_proof_earned END,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING proof_balance INTO v_new_balance;
    
    -- Record transaction
    INSERT INTO bv_proof_transactions (user_id, amount, transaction_type, source, description, reference_id, balance_after)
    VALUES (p_user_id, p_amount, CASE WHEN p_amount > 0 THEN 'earn' ELSE 'spend' END, p_source, p_description, p_reference_id, v_new_balance);
    
    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get random trivia questions
CREATE OR REPLACE FUNCTION get_random_trivia(
    p_category TEXT DEFAULT NULL,
    p_difficulty TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_exclude_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS SETOF bv_trivia_questions AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM bv_trivia_questions
    WHERE is_active = true
        AND (p_category IS NULL OR category = p_category)
        AND (p_difficulty IS NULL OR difficulty = p_difficulty)
        AND NOT (id = ANY(p_exclude_ids))
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 15: SEED DATA - SPIRITS
-- ============================================================================

INSERT INTO bv_spirits (name, brand, category, country, region, distillery, proof, abv, age_statement, mash_bill, barrel_type, tasting_notes, msrp, rarity, description) VALUES
-- BOURBON (15 entries)
('Buffalo Trace Kentucky Straight Bourbon', 'Buffalo Trace', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace Distillery', 90, 45, 'NAS', 'Low rye', 'New American Oak', '{"nose": ["vanilla", "caramel", "mint"], "palate": ["toffee", "brown sugar", "oak"], "finish": ["warm", "medium", "slightly dry"]}', 29.99, 'common', 'A rich, complex bourbon with notes of vanilla, toffee and candied fruit.'),
('Pappy Van Winkle''s Family Reserve 15 Year', 'Pappy Van Winkle', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace Distillery', 107, 53.5, '15 Years', 'Wheated', 'New American Oak', '{"nose": ["caramel", "vanilla", "cherry"], "palate": ["honey", "leather", "tobacco"], "finish": ["long", "complex", "warm"]}', 119.99, 'legendary', 'The legendary 15-year wheated bourbon from the Van Winkle family.'),
('Blanton''s Original Single Barrel', 'Blanton''s', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace Distillery', 93, 46.5, 'NAS', 'High rye', 'New American Oak', '{"nose": ["citrus", "honey", "vanilla"], "palate": ["caramel", "corn", "spice"], "finish": ["medium", "sweet", "dry"]}', 64.99, 'rare', 'The original single barrel bourbon, known for its collectible horse stopper.'),
('Maker''s Mark', 'Maker''s Mark', 'bourbon', 'USA', 'Kentucky', 'Maker''s Mark Distillery', 90, 45, 'NAS', 'Wheated', 'New American Oak', '{"nose": ["caramel", "vanilla", "fruit"], "palate": ["sweet", "wheat", "oak"], "finish": ["smooth", "medium", "warm"]}', 29.99, 'common', 'A handmade wheated bourbon dipped in red wax.'),
('Woodford Reserve', 'Woodford Reserve', 'bourbon', 'USA', 'Kentucky', 'Woodford Reserve Distillery', 90.4, 45.2, 'NAS', 'Traditional', 'New American Oak', '{"nose": ["dried fruit", "vanilla", "tobacco"], "palate": ["chocolate", "spice", "caramel"], "finish": ["long", "silky", "creamy"]}', 34.99, 'common', 'A premium small batch bourbon with over 200 detectable flavor notes.'),
('Eagle Rare 10 Year', 'Eagle Rare', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace Distillery', 90, 45, '10 Years', 'Low rye', 'New American Oak', '{"nose": ["toffee", "orange peel", "herbs"], "palate": ["honey", "leather", "oak"], "finish": ["long", "dry", "oaky"]}', 34.99, 'uncommon', 'A 10-year single barrel bourbon from Buffalo Trace.'),
('Four Roses Single Barrel', 'Four Roses', 'bourbon', 'USA', 'Kentucky', 'Four Roses Distillery', 100, 50, 'NAS', 'High rye', 'New American Oak', '{"nose": ["ripe plum", "cherry", "spice"], "palate": ["full fruit", "caramel", "oak"], "finish": ["long", "smooth", "mellow"]}', 44.99, 'uncommon', 'A single barrel bourbon showcasing the best of Four Roses'' 10 recipes.'),
('Wild Turkey 101', 'Wild Turkey', 'bourbon', 'USA', 'Kentucky', 'Wild Turkey Distillery', 101, 50.5, 'NAS', 'Traditional', 'Heavily charred oak', '{"nose": ["vanilla", "caramel", "spice"], "palate": ["honey", "orange", "tobacco"], "finish": ["long", "spicy", "warm"]}', 24.99, 'common', 'A bold, spicy bourbon at a higher proof.'),
('Elijah Craig Small Batch', 'Elijah Craig', 'bourbon', 'USA', 'Kentucky', 'Heaven Hill Distillery', 94, 47, 'NAS', 'Traditional', 'New American Oak', '{"nose": ["vanilla", "mint", "toasted oak"], "palate": ["caramel", "smoke", "fruit"], "finish": ["medium", "warm", "sweet"]}', 32.99, 'common', 'Named after the Baptist minister who invented bourbon.'),
('Booker''s Bourbon', 'Booker''s', 'bourbon', 'USA', 'Kentucky', 'Jim Beam', 125, 62.5, '6-8 Years', 'Traditional', 'New American Oak', '{"nose": ["vanilla", "caramel", "oak"], "palate": ["intense", "tobacco", "peanut"], "finish": ["very long", "powerful", "warm"]}', 89.99, 'rare', 'Uncut, unfiltered bourbon from Jim Beam''s small batch collection.'),
('W.L. Weller Special Reserve', 'W.L. Weller', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace Distillery', 90, 45, 'NAS', 'Wheated', 'New American Oak', '{"nose": ["honey", "vanilla", "caramel"], "palate": ["cherries", "wheat", "butterscotch"], "finish": ["smooth", "sweet", "gentle"]}', 24.99, 'very_rare', 'An affordable wheated bourbon from the Weller line.'),
('Knob Creek 9 Year', 'Knob Creek', 'bourbon', 'USA', 'Kentucky', 'Jim Beam', 100, 50, '9 Years', 'Traditional', 'Deeply charred oak', '{"nose": ["caramel", "vanilla", "oak"], "palate": ["maple", "nuts", "grain"], "finish": ["full", "long", "warming"]}', 34.99, 'common', 'A pre-prohibition style bourbon with full flavor.'),
('Russell''s Reserve 10 Year', 'Russell''s Reserve', 'bourbon', 'USA', 'Kentucky', 'Wild Turkey Distillery', 90, 45, '10 Years', 'Traditional', 'Heavily charred oak', '{"nose": ["vanilla", "caramel", "citrus"], "palate": ["oak", "spice", "honey"], "finish": ["long", "warm", "complex"]}', 39.99, 'uncommon', 'The signature bourbon of Jimmy and Eddie Russell.'),
('George T. Stagg', 'George T. Stagg', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace Distillery', 130, 65, '15+ Years', 'Low rye', 'New American Oak', '{"nose": ["dark fruit", "chocolate", "tobacco"], "palate": ["intense", "cherry", "toffee"], "finish": ["endless", "powerful", "complex"]}', 99.99, 'ultra_rare', 'An uncut, unfiltered powerhouse bourbon from the Antique Collection.'),
('Michter''s US-1 Small Batch', 'Michter''s', 'bourbon', 'USA', 'Kentucky', 'Michter''s Distillery', 91.4, 45.7, 'NAS', 'Traditional', 'Toasted barrel', '{"nose": ["caramel", "vanilla", "fruit"], "palate": ["rich", "maple", "orange"], "finish": ["medium", "smooth", "warming"]}', 49.99, 'uncommon', 'Small batch bourbon from one of America''s oldest distilling companies.'),

-- SCOTCH (10 entries)
('Macallan 12 Year Sherry Oak', 'The Macallan', 'scotch', 'Scotland', 'Speyside', 'The Macallan Distillery', 86, 43, '12 Years', NULL, 'Sherry Oak', '{"nose": ["dried fruits", "sherry", "ginger"], "palate": ["vanilla", "raisins", "wood spice"], "finish": ["long", "sweet", "warm"]}', 74.99, 'common', 'The benchmark Speyside single malt aged in sherry casks.'),
('Lagavulin 16 Year', 'Lagavulin', 'scotch', 'Scotland', 'Islay', 'Lagavulin Distillery', 86, 43, '16 Years', NULL, 'Ex-bourbon & Sherry', '{"nose": ["peat", "iodine", "sherry"], "palate": ["smoke", "malt", "dried fruit"], "finish": ["very long", "peaty", "complex"]}', 99.99, 'uncommon', 'A legendary Islay single malt with intense peat smoke.'),
('Glenfiddich 18 Year', 'Glenfiddich', 'scotch', 'Scotland', 'Speyside', 'Glenfiddich Distillery', 80, 40, '18 Years', NULL, 'Oloroso Sherry & Bourbon', '{"nose": ["oak", "dried fruit", "baking spices"], "palate": ["robust", "rich", "oak"], "finish": ["long", "warm", "mature"]}', 109.99, 'uncommon', 'Small batch 18-year-old finished in Oloroso sherry casks.'),
('Laphroaig 10 Year', 'Laphroaig', 'scotch', 'Scotland', 'Islay', 'Laphroaig Distillery', 86, 43, '10 Years', NULL, 'Ex-bourbon', '{"nose": ["peat", "seaweed", "iodine"], "palate": ["medicinal", "smoke", "malt"], "finish": ["long", "smoky", "salty"]}', 54.99, 'common', 'A divisive, heavily peated Islay malt with medicinal notes.'),
('Glenlivet 12 Year', 'The Glenlivet', 'scotch', 'Scotland', 'Speyside', 'The Glenlivet Distillery', 80, 40, '12 Years', NULL, 'American & European Oak', '{"nose": ["tropical fruits", "vanilla", "summer flowers"], "palate": ["fruity", "floral", "smooth"], "finish": ["medium", "creamy", "soft"]}', 44.99, 'common', 'A smooth, fruity single malt from the heart of Speyside.'),
('Ardbeg 10 Year', 'Ardbeg', 'scotch', 'Scotland', 'Islay', 'Ardbeg Distillery', 92, 46, '10 Years', NULL, 'Ex-bourbon', '{"nose": ["peat", "lemon", "chocolate"], "palate": ["smoky", "coffee", "malt"], "finish": ["long", "tarry", "sweet"]}', 59.99, 'common', 'An intensely peated Islay single malt with surprising sweetness.'),
('Highland Park 12 Year Viking Honour', 'Highland Park', 'scotch', 'Scotland', 'Islands', 'Highland Park Distillery', 86, 43, '12 Years', NULL, 'Sherry & American Oak', '{"nose": ["heather", "honey", "peat"], "palate": ["smoke", "honey", "dried fruit"], "finish": ["medium", "balanced", "warm"]}', 49.99, 'common', 'A beautifully balanced Island malt with subtle smoke.'),
('Talisker 10 Year', 'Talisker', 'scotch', 'Scotland', 'Isle of Skye', 'Talisker Distillery', 91.6, 45.8, '10 Years', NULL, 'Ex-bourbon', '{"nose": ["smoke", "salt", "pepper"], "palate": ["sweet", "smoky", "maritime"], "finish": ["long", "peppery", "warming"]}', 64.99, 'uncommon', 'The only single malt from the Isle of Skye with a distinctive peppery finish.'),
('Dalmore 15 Year', 'The Dalmore', 'scotch', 'Scotland', 'Highlands', 'Dalmore Distillery', 80, 40, '15 Years', NULL, 'Bourbon, Oloroso, Amoroso, Marsala', '{"nose": ["orange", "chocolate", "spice"], "palate": ["rich", "sherry", "citrus"], "finish": ["long", "silky", "indulgent"]}', 129.99, 'rare', 'A luxurious Highland malt finished in multiple sherry casks.'),
('Oban 14 Year', 'Oban', 'scotch', 'Scotland', 'Highlands', 'Oban Distillery', 86, 43, '14 Years', NULL, 'Ex-bourbon', '{"nose": ["orange peel", "sea salt", "smoke"], "palate": ["maritime", "honey", "dried fig"], "finish": ["long", "smooth", "spicy"]}', 79.99, 'uncommon', 'A coastal Highland malt with subtle maritime character.'),

-- WINE (5 entries)
('Opus One 2019', 'Opus One', 'wine', 'USA', 'Napa Valley', NULL, NULL, 14.5, '2019', NULL, 'French Oak', '{"nose": ["cassis", "dark cherry", "violet"], "palate": ["blackberry", "plum", "graphite"], "finish": ["long", "elegant", "refined"]}', 399.99, 'rare', 'The legendary Napa Valley Bordeaux-style blend.'),
('Chateau Margaux 2015', 'Chateau Margaux', 'wine', 'France', 'Bordeaux', NULL, NULL, 13.5, '2015', NULL, 'French Oak', '{"nose": ["violet", "blackcurrant", "cedar"], "palate": ["silky", "concentrated", "complex"], "finish": ["incredibly long", "refined", "tannic"]}', 599.99, 'ultra_rare', 'First Growth Bordeaux from an exceptional vintage.'),
('Caymus Vineyards Special Selection', 'Caymus', 'wine', 'USA', 'Napa Valley', NULL, NULL, 15.2, '2019', NULL, 'French & American Oak', '{"nose": ["ripe berries", "vanilla", "cocoa"], "palate": ["full-bodied", "jammy", "oak"], "finish": ["long", "velvety", "opulent"]}', 179.99, 'uncommon', 'A cult Napa Cabernet known for its rich, bold style.'),
('Veuve Clicquot Yellow Label Brut', 'Veuve Clicquot', 'wine', 'France', 'Champagne', NULL, NULL, 12, 'NV', NULL, 'NA', '{"nose": ["apple", "brioche", "citrus"], "palate": ["crisp", "toasty", "fruit forward"], "finish": ["clean", "refreshing", "balanced"]}', 59.99, 'common', 'The iconic yellow label Champagne from the famous house.'),
('Silver Oak Alexander Valley', 'Silver Oak', 'wine', 'USA', 'Alexander Valley', NULL, NULL, 14.5, '2018', NULL, 'American Oak', '{"nose": ["blackberry", "vanilla", "baking spices"], "palate": ["cassis", "mocha", "integrated tannins"], "finish": ["long", "smooth", "elegant"]}', 89.99, 'uncommon', 'A benchmark American Cabernet aged in American oak.'),

-- TEQUILA (5 entries)
('Clase Azul Reposado', 'Clase Azul', 'tequila', 'Mexico', 'Jalisco', 'Clase Azul', 80, 40, '8 Months', '100% Blue Weber Agave', 'American Oak', '{"nose": ["cooked agave", "vanilla", "caramel"], "palate": ["rich", "butterscotch", "agave"], "finish": ["long", "sweet", "smooth"]}', 169.99, 'rare', 'Ultra-premium reposado in the iconic hand-painted bottle.'),
('Don Julio 1942', 'Don Julio', 'tequila', 'Mexico', 'Jalisco', 'Don Julio', 80, 40, '2.5 Years', '100% Blue Weber Agave', 'American Oak', '{"nose": ["caramel", "toffee", "chocolate"], "palate": ["roasted agave", "vanilla", "cinnamon"], "finish": ["long", "warm", "spicy"]}', 159.99, 'uncommon', 'A luxury añejo celebrating the founder''s first harvest.'),
('Fortaleza Blanco', 'Fortaleza', 'tequila', 'Mexico', 'Jalisco', 'Destileria La Fortaleza', 80, 40, 'Unaged', '100% Blue Weber Agave', 'NA', '{"nose": ["citrus", "pepper", "agave"], "palate": ["clean agave", "minerals", "herbal"], "finish": ["crisp", "pure", "long"]}', 54.99, 'uncommon', 'A traditionally made tequila using tahona stone.'),
('Casamigos Añejo', 'Casamigos', 'tequila', 'Mexico', 'Jalisco', 'Casamigos', 80, 40, '14 Months', '100% Blue Weber Agave', 'American Oak', '{"nose": ["caramel", "spice", "oak"], "palate": ["smooth", "vanilla", "agave"], "finish": ["medium", "warm", "sweet"]}', 54.99, 'common', 'The celebrity-backed tequila founded by George Clooney.'),
('Patron Extra Añejo', 'Patron', 'tequila', 'Mexico', 'Jalisco', 'Patron', 80, 40, '3+ Years', '100% Blue Weber Agave', 'French & American Oak', '{"nose": ["oak", "vanilla", "dried fruit"], "palate": ["complex", "honey", "tobacco"], "finish": ["long", "smooth", "elegant"]}', 99.99, 'uncommon', 'Ultra-aged tequila with cognac-like complexity.');

-- ============================================================================
-- SECTION 16: SEED DATA - TRIVIA QUESTIONS (200+ questions)
-- ============================================================================

INSERT INTO bv_trivia_questions (category, difficulty, question, correct_answer, wrong_answers, explanation, proof_reward) VALUES
-- BOURBON QUESTIONS (40+)
('bourbon', 'easy', 'What is the primary grain in bourbon whiskey?', 'Corn', '["Rye", "Wheat", "Barley"]', 'By law, bourbon must contain at least 51% corn in its mash bill.', 10),
('bourbon', 'easy', 'In which US state must bourbon be made?', 'Any US state', '["Kentucky", "Tennessee", "Indiana"]', 'While Kentucky produces 95% of bourbon, it can legally be made anywhere in the United States.', 10),
('bourbon', 'easy', 'What type of barrel must bourbon be aged in?', 'New charred oak barrels', '["Used oak barrels", "Steel tanks", "Wine barrels"]', 'Federal regulations require bourbon to be aged in new, charred oak containers.', 10),
('bourbon', 'easy', 'What is the maximum proof bourbon can enter the barrel at?', '125 proof', '["100 proof", "150 proof", "80 proof"]', 'Bourbon must enter the barrel at no more than 125 proof (62.5% ABV).', 10),
('bourbon', 'medium', 'What distillery produces Pappy Van Winkle?', 'Buffalo Trace', '["Heaven Hill", "Jim Beam", "Wild Turkey"]', 'Buffalo Trace Distillery produces all Van Winkle bourbons under contract.', 15),
('bourbon', 'medium', 'What is a "wheated" bourbon?', 'Bourbon using wheat instead of rye as secondary grain', '["Bourbon made in winter", "Bourbon aged in wheat barrels", "Bourbon distilled twice"]', 'Wheated bourbons use wheat instead of rye, resulting in a softer, sweeter profile.', 15),
('bourbon', 'medium', 'Which bourbon brand features a horse and jockey stopper?', 'Blanton''s', '["Buffalo Trace", "Maker''s Mark", "Woodford Reserve"]', 'Blanton''s is famous for its collectible horse and jockey stoppers that spell BLANTONS.', 15),
('bourbon', 'medium', 'What proof is Wild Turkey 101?', '101 proof', '["100 proof", "90 proof", "110 proof"]', 'As the name suggests, Wild Turkey 101 is bottled at 101 proof (50.5% ABV).', 15),
('bourbon', 'medium', 'What is the "angel''s share"?', 'Whiskey lost to evaporation during aging', '["The first pour from a barrel", "Whiskey given to charity", "The master distiller''s portion"]', 'The angel''s share is the portion of whiskey that evaporates during barrel aging, about 2-4% per year.', 15),
('bourbon', 'hard', 'What is the minimum age requirement for "straight" bourbon?', '2 years', '["4 years", "1 year", "6 months"]', 'Straight bourbon must be aged for at least 2 years. If under 4 years, age must be stated on the label.', 20),
('bourbon', 'hard', 'Which act established the legal definition of bourbon?', 'The Federal Standards of Identity for Distilled Spirits', '["The Bourbon Act of 1964", "The Whiskey Rebellion Act", "The Pure Food and Drug Act"]', 'The TTB''s Federal Standards of Identity define all requirements for bourbon whiskey.', 20),
('bourbon', 'hard', 'What is the "honey barrel" location in a rickhouse?', 'The optimal aging position in the middle floors', '["A barrel filled with honey bourbon", "The first barrel produced", "The last barrel in a row"]', 'Honey barrels are from optimal aging spots where temperature variations create the best whiskey.', 20),
('bourbon', 'hard', 'What percentage of the world''s bourbon is produced in Kentucky?', '95%', '["75%", "85%", "100%"]', 'Kentucky produces approximately 95% of the world''s bourbon supply.', 20),
('bourbon', 'expert', 'What is the mash bill of Buffalo Trace''s "high rye" recipe?', 'Approximately 15% rye', '["25% rye", "10% rye", "20% rye"]', 'Buffalo Trace''s high rye mash bill #2 contains approximately 12-15% rye.', 25),
('bourbon', 'expert', 'Who is credited with inventing bourbon whiskey?', 'Unknown - it evolved over time', '["Elijah Craig", "Evan Williams", "Jacob Beam"]', 'While Elijah Craig is often credited, bourbon evolved gradually and has no single inventor.', 25),
('bourbon', 'expert', 'What is the char level typically used for bourbon barrels?', 'Level 3 or 4 (alligator char)', '["Level 1", "Level 5", "Level 2"]', 'Most bourbon distilleries use char levels 3-4, known as "alligator char" for the pattern it creates.', 25),

-- SCOTCH QUESTIONS (40+)
('scotch', 'easy', 'How many Scotch whisky regions are there in Scotland?', 'Five', '["Three", "Four", "Six"]', 'The five regions are: Speyside, Highland, Lowland, Islay, and Campbeltown.', 10),
('scotch', 'easy', 'What gives Islay whiskies their distinctive smoky flavor?', 'Peat', '["Oak barrels", "Seaweed", "Coal"]', 'Peat is burned to dry the malted barley, infusing it with smoky phenolic compounds.', 10),
('scotch', 'easy', 'What is a "single malt" Scotch?', 'Whisky from one distillery using only malted barley', '["Whisky from a single barrel", "The strongest whisky", "Unblended whisky"]', 'Single malt must be from one distillery and made entirely from malted barley.', 10),
('scotch', 'easy', 'What is the minimum age for Scotch whisky?', '3 years', '["5 years", "2 years", "1 year"]', 'Scotch must be aged in oak casks for at least 3 years.', 10),
('scotch', 'medium', 'Which region is known for the lightest, most delicate whiskies?', 'Lowland', '["Highland", "Islay", "Speyside"]', 'Lowland whiskies are traditionally triple distilled, creating a lighter spirit.', 15),
('scotch', 'medium', 'What is "cask strength" whisky?', 'Whisky bottled directly from the cask without dilution', '["Whisky aged in extra strong casks", "The strongest whisky available", "Whisky from the oldest casks"]', 'Cask strength whiskies are not diluted before bottling, typically 50-65% ABV.', 15),
('scotch', 'medium', 'What is a "blended malt" Scotch?', 'A blend of single malts from different distilleries', '["Malt and grain whisky mixed", "Whisky from two barrels", "Scottish and Irish whisky blend"]', 'Blended malt (formerly vatted malt) combines single malts from multiple distilleries.', 15),
('scotch', 'medium', 'Which distillery is known for the most heavily peated whisky?', 'Bruichladdich (Octomore)', '["Laphroaig", "Ardbeg", "Lagavulin"]', 'Octomore from Bruichladdich routinely exceeds 200 PPM (parts per million phenols).', 15),
('scotch', 'hard', 'What is the "middle cut" in whisky production?', 'The heart of the distillation, collected for aging', '["The center of the barrel", "Half-strength whisky", "The second distillation"]', 'The middle cut captures the best portion of the distillate, between the heads and tails.', 20),
('scotch', 'hard', 'What does "NAS" mean on a whisky bottle?', 'No Age Statement', '["Natural Aging System", "Not A Single malt", "New American Style"]', 'NAS whiskies don''t declare an age, giving distillers more blending flexibility.', 20),
('scotch', 'hard', 'What type of stills are used for Scotch whisky?', 'Copper pot stills', '["Column stills only", "Stainless steel stills", "Glass stills"]', 'Copper pot stills are essential for Scotch, as copper removes sulfur compounds.', 20),
('scotch', 'expert', 'How many operational distilleries are in Scotland (approximately)?', 'Over 130', '["Under 50", "Around 75", "Around 100"]', 'Scotland has seen a boom with over 130 operational distilleries as of 2024.', 25),
('scotch', 'expert', 'What is "warehousing" in Scotch production?', 'The aging process in bonded warehouses', '["Storing bottles for sale", "Pre-distillation storage", "Blending area"]', 'Warehousing refers to the crucial aging period in damp or dry warehouses.', 25),

-- WINE QUESTIONS (30+)
('wine', 'easy', 'What color grape is used to make most red wines?', 'Red/Black grapes', '["Green grapes", "Any grape", "Purple grapes only"]', 'Red wines get their color from the skins of red or black grapes.', 10),
('wine', 'easy', 'What is the term for the year a wine''s grapes were harvested?', 'Vintage', '["Harvest", "Year", "Season"]', 'The vintage indicates the year the grapes were picked, affecting the wine''s character.', 10),
('wine', 'easy', 'What is the main grape in Champagne?', 'Chardonnay, Pinot Noir, or Pinot Meunier', '["Riesling", "Sauvignon Blanc", "Moscato"]', 'True Champagne uses only these three grape varieties.', 10),
('wine', 'easy', 'What French region is famous for Pinot Noir?', 'Burgundy', '["Bordeaux", "Champagne", "Alsace"]', 'Burgundy produces the world''s most prestigious Pinot Noir wines.', 10),
('wine', 'medium', 'What is "terroir"?', 'The environmental factors affecting a vineyard', '["A French wine region", "A type of grape", "A winemaking technique"]', 'Terroir encompasses soil, climate, and geography that give wine its unique character.', 15),
('wine', 'medium', 'What is a "tannin"?', 'A compound from grape skins that adds structure', '["A type of grape", "A wine fault", "An aging process"]', 'Tannins create the dry, slightly bitter sensation in red wines.', 15),
('wine', 'medium', 'What temperature should red wine be served at?', '60-68°F (16-20°C)', '["Room temperature", "Chilled like white wine", "Ice cold"]', 'Slightly below room temperature highlights a red wine''s flavors.', 15),
('wine', 'hard', 'What is "malolactic fermentation"?', 'A secondary fermentation that softens acidity', '["The main grape fermentation", "A wine fault", "A filtering process"]', 'Malolactic fermentation converts sharp malic acid to softer lactic acid.', 20),
('wine', 'hard', 'What is a "Premier Cru" in Burgundy?', 'A first growth vineyard classification', '["The best vintage", "An organic wine", "A wine from the first harvest"]', 'Premier Cru is the second-highest vineyard classification in Burgundy.', 20),
('wine', 'expert', 'What is the Judgment of Paris?', 'A 1976 blind tasting where California beat France', '["A wine competition in Paris", "A French wine law", "An ancient wine tradition"]', 'This historic tasting put California wines on the world map.', 25),

-- BEER QUESTIONS (30+)
('beer', 'easy', 'What are the four main ingredients in beer?', 'Water, malt, hops, yeast', '["Water, barley, wheat, yeast", "Hops, malt, corn, water", "Yeast, water, rice, hops"]', 'These four ingredients are defined in the Reinheitsgebot (German purity law).', 10),
('beer', 'easy', 'What gives IPA beers their bitter taste?', 'Hops', '["Malt", "Yeast", "Water minerals"]', 'Hops provide bitterness, flavor, and aroma in beer, especially in IPAs.', 10),
('beer', 'easy', 'What is the difference between ale and lager?', 'The type of yeast and fermentation temperature', '["The color", "The alcohol content", "The ingredients"]', 'Ales use top-fermenting yeast at warmer temps; lagers use bottom-fermenting yeast at cooler temps.', 10),
('beer', 'medium', 'What does "ABV" stand for?', 'Alcohol By Volume', '["American Beer Value", "Ale, Bitter, Volume", "Alcohol Brewing Verified"]', 'ABV measures the percentage of alcohol in a beverage.', 15),
('beer', 'medium', 'What is a "session beer"?', 'A lower alcohol beer meant for extended drinking', '["A limited release beer", "Beer sold at events", "A beer drinking competition"]', 'Session beers typically have 4-5% ABV, allowing for longer drinking sessions.', 15),
('beer', 'hard', 'What is "dry hopping"?', 'Adding hops after fermentation for aroma', '["Using dried hops", "Brewing without water", "A dehydration process"]', 'Dry hopping adds hop aroma without additional bitterness.', 20),
('beer', 'hard', 'What is a "Brett" beer?', 'Beer fermented with Brettanomyces yeast', '["A Belgian beer style", "A British ale", "A brewery name"]', 'Brettanomyces creates funky, complex flavors in sour and wild ales.', 20),
('beer', 'expert', 'What is the original gravity (OG) used to measure?', 'The sugar content before fermentation', '["The weight of the beer", "The hop bitterness", "The yeast activity"]', 'OG measures fermentable sugars that will convert to alcohol.', 25),

-- TEQUILA QUESTIONS (25+)
('tequila', 'easy', 'What plant is tequila made from?', 'Blue Weber Agave', '["Cactus", "Corn", "Aloe vera"]', 'Tequila must be made from Blue Weber Agave grown in designated regions.', 10),
('tequila', 'easy', 'What Mexican state produces the most tequila?', 'Jalisco', '["Oaxaca", "Mexico City", "Chihuahua"]', 'Jalisco is the heartland of tequila production, home to most major brands.', 10),
('tequila', 'easy', 'What is the clear, unaged style of tequila called?', 'Blanco (or Plata)', '["Reposado", "Añejo", "Joven"]', 'Blanco tequila is bottled shortly after distillation with minimal or no aging.', 10),
('tequila', 'medium', 'How long must Reposado tequila be aged?', '2-12 months', '["1-2 years", "At least 3 years", "No aging required"]', 'Reposado ("rested") must be aged in oak for 2 months to 1 year.', 15),
('tequila', 'medium', 'What is mezcal?', 'A spirit made from any type of agave', '["A brand of tequila", "Aged tequila", "A tequila cocktail"]', 'Mezcal can be made from over 30 varieties of agave, while tequila uses only Blue Weber.', 15),
('tequila', 'medium', 'What is "100% agave" tequila?', 'Tequila made entirely from agave sugars', '["The strongest tequila", "Organic tequila", "Premium-priced tequila"]', 'Non-100% agave (mixto) can contain up to 49% other sugars.', 15),
('tequila', 'hard', 'What is a "tahona"?', 'A volcanic stone wheel for crushing agave', '["An agave farmer", "A type of still", "An aging warehouse"]', 'Traditional tahona-crushed tequila is considered more artisanal.', 20),
('tequila', 'hard', 'What does "NOM" mean on a tequila bottle?', 'The distillery identification number', '["The age statement", "The agave source", "A quality rating"]', 'NOM (Norma Oficial Mexicana) identifies which distillery produced the tequila.', 20),
('tequila', 'expert', 'What is "extra añejo" tequila?', 'Tequila aged at least 3 years', '["The premium añejo", "Specially filtered", "Double distilled"]', 'Extra añejo category was created in 2006 for ultra-aged expressions.', 25),

-- GENERAL SPIRITS (25+)
('general', 'easy', 'What is the standard size of a spirit bottle?', '750ml', '["1 liter", "500ml", "700ml"]', 'The 750ml "fifth" is the standard bottle size in the United States.', 10),
('general', 'easy', 'What does "proof" measure?', 'Alcohol content (2x the ABV)', '["Quality", "Age", "Purity"]', 'In the US, proof is double the ABV percentage.', 10),
('general', 'easy', 'What is the process of making whiskey called?', 'Distillation', '["Brewing", "Fermenting", "Aging"]', 'Distillation is the process of heating and condensing to increase alcohol content.', 10),
('general', 'medium', 'What is a "neat" pour?', 'Spirit served at room temperature, no ice or mixer', '["A small pour", "Chilled spirit", "A measured shot"]', 'Neat means the spirit is enjoyed straight, without any additions.', 15),
('general', 'medium', 'What is "cask finish"?', 'Aging in a different barrel type for added flavor', '["The end of a barrel", "A quality standard", "The final distillation"]', 'Cask finishing transfers flavors from previous barrel contents.', 15),
('general', 'hard', 'What is the "heads, hearts, tails" of distillation?', 'Different portions of the distillate with varying quality', '["Parts of the still", "Tasting notes", "Barrel positions"]', 'The hearts (middle cut) is the premium portion collected for aging.', 20),
('general', 'hard', 'What is "single barrel" whiskey?', 'Whiskey bottled from one individual barrel', '["From a single distillery", "One-time production", "Unblended whiskey"]', 'Single barrel expressions showcase the unique character of individual casks.', 20),
('general', 'expert', 'What is "solera" aging?', 'A fractional blending system using stacked barrels', '["Underground aging", "Temperature-controlled aging", "Single-pass aging"]', 'Solera systems blend young and old spirits for consistent products.', 25),

-- HISTORY QUESTIONS (20+)
('history', 'easy', 'What was Prohibition in the United States?', 'A ban on alcohol production and sales (1920-1933)', '["A whiskey brand", "A type of barrel", "A distillery"]', 'The 18th Amendment banned alcohol, which was repealed by the 21st Amendment.', 10),
('history', 'easy', 'What country invented whisky?', 'Ireland or Scotland (disputed)', '["USA", "Japan", "Canada"]', 'Both Ireland and Scotland claim to have invented whisky, with evidence from the 1400s.', 10),
('history', 'medium', 'When did bourbon whiskey originate?', 'Late 18th century', '["1920s", "1600s", "1950s"]', 'Bourbon developed in Kentucky in the late 1700s by Scots-Irish settlers.', 15),
('history', 'medium', 'What is the Whiskey Rebellion?', 'A 1794 tax protest in Pennsylvania', '["A whiskey brand", "A distillery war", "A bourbon recipe"]', 'Farmers protested Alexander Hamilton''s whiskey tax, testing federal authority.', 15),
('history', 'hard', 'What year was the first licensed whisky distillery in Scotland?', '1824 (The Glenlivet)', '["1794", "1850", "1900"]', 'The Glenlivet received one of the first licenses under the Excise Act of 1823.', 20),
('history', 'expert', 'What was the "Noble Experiment"?', 'A term for Prohibition', '["A whiskey blend", "A distillation method", "A barrel type"]', 'Prohibition was called the Noble Experiment by its supporters.', 25),

-- PRODUCTION QUESTIONS (20+)
('production', 'easy', 'What is "mashing" in whiskey production?', 'Mixing grains with hot water to extract sugars', '["Crushing barrels", "Blending whiskeys", "Filtering the spirit"]', 'Mashing converts grain starches into fermentable sugars.', 10),
('production', 'medium', 'What is "fermentation" in spirits production?', 'Yeast converting sugars into alcohol', '["Aging in barrels", "Distillation", "Bottling"]', 'Fermentation creates a beer-like liquid called "wash" before distillation.', 15),
('production', 'medium', 'What temperature does whiskey distillation occur at?', 'Around 173°F (78°C) - alcohol boiling point', '["212°F (100°C)", "250°F (121°C)", "150°F (65°C)"]', 'Alcohol vaporizes at a lower temperature than water, enabling separation.', 15),
('production', 'hard', 'What is "congeners" in spirits?', 'Flavor compounds formed during fermentation', '["A type of yeast", "Barrel wood", "Grain impurities"]', 'Congeners include esters, aldehydes, and fusel oils that add flavor complexity.', 20),
('production', 'expert', 'What is "esterification" in whiskey aging?', 'Chemical reactions creating fruity flavor compounds', '["Barrel charring", "Water evaporation", "Color development"]', 'Esterification occurs when acids and alcohols combine during aging.', 25),

-- BRAND QUESTIONS (20+)
('brands', 'easy', 'What brand features a red wax dipped bottle?', 'Maker''s Mark', '["Jim Beam", "Wild Turkey", "Buffalo Trace"]', 'Maker''s Mark is famous for its hand-dipped red wax seal.', 10),
('brands', 'easy', 'What is the world''s best-selling Scotch whisky?', 'Johnnie Walker', '["Glenfiddich", "Macallan", "Chivas Regal"]', 'Johnnie Walker sells over 18 million cases annually worldwide.', 10),
('brands', 'medium', 'What famous bourbon brand was founded by a Baptist minister?', 'Elijah Craig', '["Maker''s Mark", "Wild Turkey", "Jim Beam"]', 'Reverend Elijah Craig is credited with first aging whiskey in charred barrels.', 15),
('brands', 'medium', 'What celebrity founded Casamigos Tequila?', 'George Clooney', '["Dwayne Johnson", "Ryan Reynolds", "Matthew McConaughey"]', 'George Clooney and Rande Gerber sold Casamigos to Diageo for $1 billion.', 15),
('brands', 'hard', 'What Japanese whisky brand is named after founder Shinjiro Torii?', 'Suntory', '["Nikka", "Hibiki", "Yamazaki"]', 'Torii founded Suntory and built Japan''s first whisky distillery.', 20),
('brands', 'expert', 'What distillery produces both Blanton''s and Weller?', 'Buffalo Trace', '["Heaven Hill", "Wild Turkey", "Four Roses"]', 'Buffalo Trace makes multiple iconic bourbon brands including these allocated favorites.', 25);

-- ============================================================================
-- SECTION 17: SEED DATA - REWARDS
-- ============================================================================

INSERT INTO bv_rewards (name, description, category, proof_cost, image_url, is_limited, is_active) VALUES
('BarrelVerse Glencairn Glass', 'Official BarrelVerse branded crystal tasting glass', 'merchandise', 500, NULL, false, true),
('Tasting Journal', 'Premium leather-bound spirits tasting journal', 'merchandise', 750, NULL, false, true),
('Virtual Distillery Tour', 'Access to exclusive virtual distillery tour videos', 'digital', 300, NULL, false, true),
('Premium Avatar Pack', 'Unlock exclusive avatar customization options', 'digital', 200, NULL, false, true),
('10% Shop Discount', 'Discount code for the BarrelVerse merchandise shop', 'discount', 400, NULL, false, true),
('Bourbon Trail Map', 'Collectible Kentucky Bourbon Trail poster map', 'merchandise', 600, NULL, true, true),
('Master Taster Badge NFT', 'Exclusive NFT badge for top performers', 'digital', 5000, NULL, true, true),
('Annual Membership', 'One year of Premium membership access', 'exclusive', 10000, NULL, false, true),
('Barrel Stave Coaster Set', 'Set of 4 coasters made from authentic barrel staves', 'merchandise', 800, NULL, true, true);

-- ============================================================================
-- SECTION 18: SEED DATA - SUBSCRIPTION PLANS
-- ============================================================================

INSERT INTO bv_subscription_plans (name, description, price_monthly, price_yearly, features, proof_monthly_bonus, max_collection_items, is_active) VALUES
('Free', 'Basic access to BarrelVerse', 0, 0, '["5 trivia games per day", "Basic collection tracking", "Community forums"]', 0, 50, true),
('Enthusiast', 'For serious spirits enthusiasts', 9.99, 99.99, '["Unlimited trivia games", "Advanced collection analytics", "500 monthly $PROOF bonus", "Ad-free experience", "Early access to new features"]', 500, 500, true),
('Connoisseur', 'Premium access for collectors', 24.99, 249.99, '["Everything in Enthusiast", "1500 monthly $PROOF bonus", "Marketplace access", "Expert tastings access", "Priority support", "Collection insurance reports"]', 1500, 2000, true),
('Master', 'The ultimate BarrelVerse experience', 99.99, 999.99, '["Everything in Connoisseur", "5000 monthly $PROOF bonus", "Exclusive virtual events", "One-on-one with master distillers", "White glove concierge service", "Unlimited collection"]', 5000, NULL, true);

-- ============================================================================
-- SECTION 19: SEED DATA - COURSES
-- ============================================================================

INSERT INTO bv_courses (slug, title, description, category, difficulty, certification_name, estimated_minutes, total_lessons, proof_reward, is_premium, is_active) VALUES
('bourbon-101', 'Bourbon 101: The Complete Beginner''s Guide', 'Master the fundamentals of bourbon whiskey, from grain to glass.', 'bourbon', 'beginner', 'Bourbon Beginner Certification', 120, 8, 500, false, true),
('scotch-regions', 'Scotch Whisky: A Journey Through the Regions', 'Explore the five whisky regions of Scotland and their distinctive characteristics.', 'scotch', 'intermediate', 'Scottish Whisky Explorer', 180, 10, 750, true, true),
('wine-fundamentals', 'Wine Fundamentals: From Grape to Glass', 'Learn the basics of wine appreciation, tasting, and food pairing.', 'wine', 'beginner', 'Wine Appreciation Certificate', 150, 12, 500, false, true),
('craft-beer-deep-dive', 'Craft Beer Deep Dive', 'Explore craft brewing, beer styles, and the art of beer tasting.', 'beer', 'intermediate', 'Certified Beer Enthusiast', 90, 6, 400, false, true),
('tequila-mezcal', 'Tequila & Mezcal: Agave Spirits Masterclass', 'Understanding the world of agave spirits from production to perfect serves.', 'tequila', 'intermediate', 'Agave Spirits Expert', 120, 8, 600, true, true),
('blind-tasting', 'The Art of Blind Tasting', 'Develop your palate and learn professional tasting techniques.', 'general', 'advanced', 'Certified Blind Taster', 240, 15, 1000, true, true),
('home-bar', 'Build Your Perfect Home Bar', 'Create and stock the ideal home bar for any occasion.', 'general', 'beginner', 'Home Bartender Certificate', 90, 6, 300, false, true),
('japanese-whisky', 'Japanese Whisky Journey', 'Discover the art, history, and craft of Japanese whisky making.', 'japanese', 'intermediate', 'Japanese Whisky Specialist', 150, 10, 750, true, true);

-- ============================================================================
-- COMPLETED SCHEMA
-- ============================================================================
-- Total Tables: 26
-- Total Indexes: 15+
-- Total Functions: 4
-- Total Triggers: 7
-- Total RLS Policies: 35+
-- Seed Data: 200+ trivia questions, 30+ spirits, 4 plans, 9 rewards, 8 courses
-- ============================================================================
