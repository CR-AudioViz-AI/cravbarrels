-- ============================================================================
-- BARRELVERSE COMPLETE DATABASE SCHEMA
-- The World's #1 Spirits Collector Platform
-- Created: December 3, 2025
-- ============================================================================

-- ============================================================================
-- SECTION 1: USER SYSTEM
-- ============================================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS bv_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  
  -- Gamification
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  total_xp_earned INTEGER DEFAULT 0,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'enthusiast', 'collector', 'maker')),
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  paypal_subscription_id TEXT,
  
  -- Stats (denormalized for speed)
  spirits_tried INTEGER DEFAULT 0,
  tasting_notes_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  collection_count INTEGER DEFAULT 0,
  collection_value DECIMAL(12,2) DEFAULT 0,
  barrels_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Privacy
  is_public BOOLEAN DEFAULT true,
  show_collection_value BOOLEAN DEFAULT true,
  allow_guestbook BOOLEAN DEFAULT true,
  show_visitor_log BOOLEAN DEFAULT true,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  
  -- Preferences
  preferred_theme TEXT DEFAULT 'bourbon',
  preferred_units TEXT DEFAULT 'imperial',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  
  -- Vanity URL (Pro feature)
  vanity_url TEXT UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges
CREATE TABLE IF NOT EXISTS bv_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER DEFAULT 0,
  category TEXT,
  requirements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Earned Badges
CREATE TABLE IF NOT EXISTS bv_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES bv_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS bv_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  target_value INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES bv_badges(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievement Progress
CREATE TABLE IF NOT EXISTS bv_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES bv_achievements(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- Social: Following
CREATE TABLE IF NOT EXISTS bv_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ============================================================================
-- SECTION 2: SPIRITS DATABASE (EXPANDED)
-- ============================================================================

-- Spirit Categories
CREATE TABLE IF NOT EXISTS bv_spirit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  theme_colors JSONB, -- {primary, secondary, accent, bg}
  parent_id UUID REFERENCES bv_spirit_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert core categories
INSERT INTO bv_spirit_categories (name, slug, icon, color, theme_colors) VALUES
('Bourbon', 'bourbon', '🥃', '#d97706', '{"bg": "from-amber-950 via-amber-900 to-stone-900", "accent": "amber"}'),
('Rye Whiskey', 'rye', '🌾', '#ea580c', '{"bg": "from-orange-950 via-orange-900 to-stone-900", "accent": "orange"}'),
('Scotch Whisky', 'scotch', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '#64748b', '{"bg": "from-slate-900 via-stone-800 to-slate-900", "accent": "slate"}'),
('Irish Whiskey', 'irish', '🍀', '#16a34a', '{"bg": "from-green-950 via-green-900 to-stone-900", "accent": "green"}'),
('Japanese Whisky', 'japanese', '🇯🇵', '#78716c', '{"bg": "from-stone-900 via-neutral-800 to-stone-900", "accent": "neutral"}'),
('Canadian Whisky', 'canadian', '🍁', '#dc2626', '{"bg": "from-red-950 via-red-900 to-stone-900", "accent": "red"}'),
('Tennessee Whiskey', 'tennessee', '🎸', '#b45309', '{"bg": "from-amber-950 via-yellow-900 to-stone-900", "accent": "yellow"}'),
('Single Malt', 'single-malt', '🥇', '#a16207', '{"bg": "from-amber-900 via-stone-800 to-stone-900", "accent": "amber"}'),
('Blended Whisky', 'blended', '🔄', '#737373', '{"bg": "from-stone-900 via-stone-800 to-stone-900", "accent": "stone"}'),
('Rum', 'rum', '🏝️', '#eab308', '{"bg": "from-amber-900 via-yellow-900 to-stone-900", "accent": "yellow"}'),
('Tequila', 'tequila', '🌵', '#84cc16', '{"bg": "from-lime-950 via-green-900 to-stone-900", "accent": "lime"}'),
('Mezcal', 'mezcal', '🔥', '#f97316', '{"bg": "from-orange-950 via-amber-900 to-stone-900", "accent": "orange"}'),
('Vodka', 'vodka', '❄️', '#e2e8f0', '{"bg": "from-slate-900 via-gray-800 to-slate-900", "accent": "slate"}'),
('Gin', 'gin', '🌿', '#22c55e', '{"bg": "from-emerald-950 via-green-900 to-stone-900", "accent": "emerald"}'),
('Brandy', 'brandy', '🍇', '#7c3aed', '{"bg": "from-purple-950 via-purple-900 to-stone-900", "accent": "purple"}'),
('Cognac', 'cognac', '👑', '#a855f7', '{"bg": "from-purple-950 via-violet-900 to-stone-900", "accent": "violet"}'),
('Armagnac', 'armagnac', '🏰', '#8b5cf6', '{"bg": "from-violet-950 via-purple-900 to-stone-900", "accent": "violet"}'),
('Wine', 'wine', '🍷', '#be123c', '{"bg": "from-rose-950 via-red-900 to-stone-900", "accent": "rose"}'),
('Champagne', 'champagne', '🥂', '#fbbf24', '{"bg": "from-amber-900 via-yellow-800 to-stone-900", "accent": "yellow"}'),
('Beer', 'beer', '🍺', '#fcd34d', '{"bg": "from-yellow-900 via-amber-800 to-stone-900", "accent": "yellow"}'),
('Craft Beer', 'craft-beer', '🍻', '#f59e0b', '{"bg": "from-amber-900 via-orange-800 to-stone-900", "accent": "amber"}'),
('Sake', 'sake', '🍶', '#fafafa', '{"bg": "from-stone-900 via-slate-800 to-stone-900", "accent": "slate"}'),
('Liqueurs', 'liqueurs', '🧪', '#ec4899', '{"bg": "from-pink-950 via-rose-900 to-stone-900", "accent": "pink"}'),
('Amaro', 'amaro', '🌿', '#854d0e', '{"bg": "from-yellow-950 via-amber-900 to-stone-900", "accent": "amber"}'),
('Absinthe', 'absinthe', '🧚', '#22c55e', '{"bg": "from-green-950 via-emerald-900 to-stone-900", "accent": "green"}'),
('Soju', 'soju', '🇰🇷', '#60a5fa', '{"bg": "from-blue-950 via-blue-900 to-stone-900", "accent": "blue"}'),
('Baijiu', 'baijiu', '🇨🇳', '#ef4444', '{"bg": "from-red-950 via-red-900 to-stone-900", "accent": "red"}'),
('Pisco', 'pisco', '🇵🇪', '#fbbf24', '{"bg": "from-yellow-950 via-amber-900 to-stone-900", "accent": "yellow"}'),
('Cachaca', 'cachaca', '🇧🇷', '#22c55e', '{"bg": "from-green-950 via-lime-900 to-stone-900", "accent": "lime"}')
ON CONFLICT (slug) DO NOTHING;

-- Brands/Producers
CREATE TABLE IF NOT EXISTS bv_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  website TEXT,
  founded_year INTEGER,
  country TEXT,
  region TEXT,
  parent_company TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  social_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spirits (main product table)
CREATE TABLE IF NOT EXISTS bv_spirits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand_id UUID REFERENCES bv_brands(id),
  category_id UUID REFERENCES bv_spirit_categories(id),
  
  -- Product Details
  description TEXT,
  tasting_notes TEXT,
  nose TEXT,
  palate TEXT,
  finish TEXT,
  
  -- Specs
  abv DECIMAL(5,2),
  proof DECIMAL(5,2),
  age_statement TEXT,
  age_years INTEGER,
  volume_ml INTEGER,
  
  -- Production
  distillery TEXT,
  region TEXT,
  country TEXT,
  mash_bill TEXT,
  barrel_type TEXT,
  cask_finish TEXT,
  bottling_date DATE,
  batch_number TEXT,
  barrel_number TEXT,
  bottle_count INTEGER,
  
  -- Pricing
  msrp DECIMAL(10,2),
  current_market_price DECIMAL(10,2),
  price_trend TEXT CHECK (price_trend IN ('rising', 'stable', 'falling')),
  
  -- Ratings
  avg_rating DECIMAL(3,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  critic_score INTEGER,
  
  -- Popularity
  wishlist_count INTEGER DEFAULT 0,
  collection_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Media
  image_url TEXT,
  thumbnail_url TEXT,
  gallery_urls JSONB,
  video_url TEXT,
  
  -- Availability
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'limited', 'allocated', 'discontinued', 'coming_soon')),
  release_date DATE,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  
  -- Source tracking
  source TEXT,
  source_url TEXT,
  last_scraped_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spirits_category ON bv_spirits(category_id);
CREATE INDEX IF NOT EXISTS idx_spirits_brand ON bv_spirits(brand_id);
CREATE INDEX IF NOT EXISTS idx_spirits_rating ON bv_spirits(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_spirits_search ON bv_spirits USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- SECTION 3: COLLECTIONS & WISHLISTS
-- ============================================================================

-- User Collections
CREATE TABLE IF NOT EXISTS bv_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
  
  -- Acquisition
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  purchase_location TEXT,
  
  -- Current State
  status TEXT DEFAULT 'sealed' CHECK (status IN ('sealed', 'opened', 'finished', 'traded', 'gifted')),
  bottle_level INTEGER DEFAULT 100, -- percentage remaining
  
  -- Value Tracking
  current_value DECIMAL(10,2),
  value_updated_at TIMESTAMPTZ,
  
  -- Storage
  storage_location TEXT,
  
  -- Notes
  personal_notes TEXT,
  
  -- Rating
  personal_rating INTEGER CHECK (personal_rating >= 0 AND personal_rating <= 100),
  
  -- Photos
  photo_urls JSONB,
  
  -- Quantity (for multiples)
  quantity INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, spirit_id, purchase_date)
);

-- Wishlists
CREATE TABLE IF NOT EXISTS bv_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
  
  -- Tracking
  target_price DECIMAL(10,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Alerts
  price_alert_enabled BOOLEAN DEFAULT false,
  price_alert_threshold DECIMAL(10,2),
  availability_alert BOOLEAN DEFAULT false,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, spirit_id)
);

-- Purchase History
CREATE TABLE IF NOT EXISTS bv_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  spirit_id UUID REFERENCES bv_spirits(id),
  collection_id UUID REFERENCES bv_collections(id),
  
  -- Purchase Details
  purchase_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  
  -- Where
  retailer TEXT,
  retailer_type TEXT CHECK (retailer_type IN ('online', 'store', 'auction', 'private', 'distillery', 'gift')),
  location TEXT,
  
  -- Receipt
  receipt_url TEXT,
  order_number TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: TASTING NOTES & REVIEWS
-- ============================================================================

-- Tasting Notes
CREATE TABLE IF NOT EXISTS bv_tasting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
  
  -- Rating
  rating INTEGER CHECK (rating >= 0 AND rating <= 100),
  
  -- Flavor Profile
  nose_notes JSONB, -- array of flavor tags
  palate_notes JSONB,
  finish_notes JSONB,
  
  -- Descriptive
  overall_notes TEXT,
  
  -- Context
  mood TEXT,
  setting TEXT,
  serving_style TEXT, -- neat, rocks, water, cocktail
  glassware TEXT,
  
  -- Experience
  tasting_date DATE DEFAULT CURRENT_DATE,
  bottle_age_when_tasted INTEGER, -- days since opened
  
  -- Media
  photo_urls JSONB,
  
  -- Social
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- AI
  ai_suggestions TEXT,
  ai_similar_spirits JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews (longer-form, structured)
CREATE TABLE IF NOT EXISTS bv_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
  
  -- Scores
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  nose_score INTEGER CHECK (nose_score >= 0 AND nose_score <= 25),
  palate_score INTEGER CHECK (palate_score >= 0 AND palate_score <= 25),
  finish_score INTEGER CHECK (finish_score >= 0 AND finish_score <= 25),
  value_score INTEGER CHECK (value_score >= 0 AND value_score <= 25),
  
  -- Content
  title TEXT,
  summary TEXT,
  full_review TEXT,
  pros TEXT[],
  cons TEXT[],
  
  -- Recommendations
  would_buy_again BOOLEAN,
  would_recommend BOOLEAN,
  best_for TEXT[], -- 'beginners', 'enthusiasts', 'collectors', 'cocktails'
  
  -- Social
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, spirit_id)
);

-- ============================================================================
-- SECTION 5: BARREL TRACKING
-- ============================================================================

-- Barrels
CREATE TABLE IF NOT EXISTS bv_barrels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  barrel_number TEXT,
  
  -- Source
  distillery TEXT,
  distillery_id UUID REFERENCES bv_brands(id),
  spirit_type TEXT,
  
  -- Barrel Specs
  barrel_type TEXT, -- 'new american oak', 'ex-bourbon', 'sherry', etc
  char_level TEXT,
  size_gallons DECIMAL(6,2),
  
  -- Timeline
  fill_date DATE NOT NULL,
  target_date DATE,
  actual_bottle_date DATE,
  
  -- Location
  location TEXT,
  rickhouse TEXT,
  floor_level INTEGER,
  rack_position TEXT,
  
  -- Conditions
  last_temperature DECIMAL(5,2),
  last_humidity DECIMAL(5,2),
  
  -- Status
  status TEXT DEFAULT 'aging' CHECK (status IN ('aging', 'ready', 'bottled', 'sold')),
  
  -- Yield
  angel_share_percent DECIMAL(5,2) DEFAULT 0,
  estimated_yield_bottles INTEGER,
  actual_yield_bottles INTEGER,
  
  -- Value
  purchase_price DECIMAL(12,2),
  estimated_value DECIMAL(12,2),
  
  -- Social
  is_public BOOLEAN DEFAULT true,
  followers_count INTEGER DEFAULT 0,
  
  -- Media
  cover_photo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barrel Updates/Timeline
CREATE TABLE IF NOT EXISTS bv_barrel_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barrel_id UUID REFERENCES bv_barrels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES bv_profiles(id),
  
  -- Update Type
  update_type TEXT NOT NULL CHECK (update_type IN ('check', 'sample', 'photo', 'milestone', 'weather', 'move', 'note')),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  
  -- Data
  data JSONB, -- temperature, humidity, angel_share, color, etc
  
  -- Media
  photo_urls JSONB,
  video_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barrel Tastings
CREATE TABLE IF NOT EXISTS bv_barrel_tastings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barrel_id UUID REFERENCES bv_barrels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES bv_profiles(id),
  
  -- When
  tasting_date DATE DEFAULT CURRENT_DATE,
  age_at_tasting INTEGER, -- days
  
  -- Rating
  rating INTEGER CHECK (rating >= 0 AND rating <= 100),
  
  -- Notes
  nose_notes JSONB,
  palate_notes JSONB,
  finish_notes JSONB,
  overall_notes TEXT,
  
  -- Assessment
  ready_to_bottle BOOLEAN DEFAULT false,
  recommended_additional_time TEXT,
  
  -- Media
  photo_urls JSONB,
  sample_photo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barrel Followers
CREATE TABLE IF NOT EXISTS bv_barrel_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barrel_id UUID REFERENCES bv_barrels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  notify_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barrel_id, user_id)
);

-- ============================================================================
-- SECTION 6: SOCIAL FEATURES
-- ============================================================================

-- Social Posts
CREATE TABLE IF NOT EXISTS bv_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  -- Type
  post_type TEXT NOT NULL CHECK (post_type IN ('tasting', 'photo', 'review', 'achievement', 'question', 'discussion', 'collection_add', 'barrel_update')),
  
  -- Content
  content TEXT,
  
  -- References
  spirit_id UUID REFERENCES bv_spirits(id),
  barrel_id UUID REFERENCES bv_barrels(id),
  tasting_note_id UUID REFERENCES bv_tasting_notes(id),
  review_id UUID REFERENCES bv_reviews(id),
  
  -- Media
  image_urls JSONB,
  video_url TEXT,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS bv_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  -- Parent (polymorphic)
  post_id UUID REFERENCES bv_posts(id) ON DELETE CASCADE,
  tasting_note_id UUID REFERENCES bv_tasting_notes(id) ON DELETE CASCADE,
  review_id UUID REFERENCES bv_reviews(id) ON DELETE CASCADE,
  
  -- Reply
  parent_comment_id UUID REFERENCES bv_comments(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes (polymorphic)
CREATE TABLE IF NOT EXISTS bv_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  -- Target (only one should be set)
  post_id UUID REFERENCES bv_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES bv_comments(id) ON DELETE CASCADE,
  tasting_note_id UUID REFERENCES bv_tasting_notes(id) ON DELETE CASCADE,
  review_id UUID REFERENCES bv_reviews(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint handled by application
  CONSTRAINT one_target CHECK (
    (post_id IS NOT NULL)::int +
    (comment_id IS NOT NULL)::int +
    (tasting_note_id IS NOT NULL)::int +
    (review_id IS NOT NULL)::int = 1
  )
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bv_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES bv_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ============================================================================
-- SECTION 7: GUESTBOOK & VISITOR TRACKING
-- ============================================================================

-- Guestbook Entries
CREATE TABLE IF NOT EXISTS bv_guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE, -- whose guestbook
  visitor_id UUID REFERENCES bv_profiles(id) ON DELETE SET NULL, -- who signed (null = anonymous)
  
  -- Visitor Info (if not logged in)
  visitor_name TEXT,
  visitor_location TEXT,
  
  -- Content
  message TEXT NOT NULL,
  reaction TEXT,
  
  -- Visibility
  is_approved BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor Log
CREATE TABLE IF NOT EXISTS bv_visitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE, -- whose profile was visited
  visitor_id UUID REFERENCES bv_profiles(id) ON DELETE SET NULL,
  
  -- Action
  action TEXT NOT NULL CHECK (action IN ('viewed_profile', 'viewed_collection', 'viewed_barrel', 'signed_guestbook', 'followed')),
  details TEXT,
  
  -- Analytics
  referrer TEXT,
  ip_hash TEXT, -- hashed for privacy
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: MAKER/BRAND PORTAL
-- ============================================================================

-- Maker Profiles
CREATE TABLE IF NOT EXISTS bv_makers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id), -- linked user account
  brand_id UUID REFERENCES bv_brands(id), -- linked brand
  
  -- Type
  maker_type TEXT NOT NULL CHECK (maker_type IN ('distillery', 'brewery', 'winery', 'brand', 'importer', 'retailer')),
  
  -- Profile
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Media
  logo_url TEXT,
  cover_url TEXT,
  gallery_urls JSONB,
  
  -- Details
  location TEXT,
  website TEXT,
  founded_year INTEGER,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  
  -- Stats
  products_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  monthly_views INTEGER DEFAULT 0,
  
  -- Settings
  allow_messages BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maker Announcements
CREATE TABLE IF NOT EXISTS bv_maker_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID REFERENCES bv_makers(id) ON DELETE CASCADE,
  
  -- Type
  announcement_type TEXT NOT NULL CHECK (announcement_type IN ('release', 'event', 'news', 'promotion', 'update')),
  
  -- Content
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  
  -- Scheduling
  publish_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Options
  is_pinned BOOLEAN DEFAULT false,
  notify_followers BOOLEAN DEFAULT true,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maker Events
CREATE TABLE IF NOT EXISTS bv_maker_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID REFERENCES bv_makers(id) ON DELETE CASCADE,
  
  -- Details
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('tasting', 'tour', 'release', 'festival', 'virtual', 'other')),
  
  -- When/Where
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  virtual_url TEXT,
  
  -- Tickets
  ticket_price DECIMAL(10,2),
  capacity INTEGER,
  spots_remaining INTEGER,
  registration_url TEXT,
  
  -- Media
  image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maker Analytics
CREATE TABLE IF NOT EXISTS bv_maker_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID REFERENCES bv_makers(id) ON DELETE CASCADE,
  
  -- Period
  date DATE NOT NULL,
  
  -- Metrics
  profile_views INTEGER DEFAULT 0,
  product_views INTEGER DEFAULT 0,
  wishlist_adds INTEGER DEFAULT 0,
  collection_adds INTEGER DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  
  -- Breakdown
  top_products JSONB,
  top_referrers JSONB,
  geography JSONB,
  
  UNIQUE(maker_id, date)
);

-- ============================================================================
-- SECTION 9: CONTENT & EDUCATION
-- ============================================================================

-- History Articles (enhanced)
CREATE TABLE IF NOT EXISTS bv_history_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  
  -- Categorization
  category TEXT,
  era TEXT,
  region TEXT,
  tags TEXT[],
  
  -- Related
  related_spirits UUID[],
  related_brands UUID[],
  
  -- Media
  cover_image_url TEXT,
  image_urls JSONB,
  video_urls JSONB,
  
  -- Timeline
  timeline_date DATE,
  timeline_era TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Source
  source TEXT,
  source_url TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  
  -- Status
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses (enhanced)
CREATE TABLE IF NOT EXISTS bv_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Course Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Structure
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  duration_minutes INTEGER,
  lessons_count INTEGER DEFAULT 0,
  
  -- Media
  thumbnail_url TEXT,
  cover_url TEXT,
  intro_video_url TEXT,
  
  -- Requirements
  prerequisites TEXT[],
  required_tier TEXT DEFAULT 'free',
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES bv_badges(id),
  certificate_enabled BOOLEAN DEFAULT false,
  
  -- Stats
  enrolled_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  
  -- Status
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Lessons
CREATE TABLE IF NOT EXISTS bv_course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES bv_courses(id) ON DELETE CASCADE,
  
  -- Order
  lesson_number INTEGER NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT,
  
  -- Media
  video_url TEXT,
  image_urls JSONB,
  
  -- Duration
  duration_minutes INTEGER,
  
  -- Quiz
  has_quiz BOOLEAN DEFAULT false,
  quiz_questions JSONB,
  passing_score INTEGER DEFAULT 70,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, lesson_number)
);

-- User Course Progress
CREATE TABLE IF NOT EXISTS bv_user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES bv_courses(id) ON DELETE CASCADE,
  
  -- Progress
  current_lesson INTEGER DEFAULT 1,
  lessons_completed INTEGER[] DEFAULT '{}',
  progress_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  
  -- Dates
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Scores
  quiz_scores JSONB,
  final_score INTEGER,
  
  -- Certificate
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  
  UNIQUE(user_id, course_id)
);

-- Trivia Questions (enhanced)
CREATE TABLE IF NOT EXISTS bv_trivia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Question
  question TEXT NOT NULL,
  
  -- Answers
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  explanation TEXT,
  
  -- Categorization
  category TEXT,
  spirit_type TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  
  -- Points
  points INTEGER DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 30,
  
  -- Media
  image_url TEXT,
  
  -- Stats
  times_asked INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  
  -- Source
  source TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Trivia Stats
CREATE TABLE IF NOT EXISTS bv_user_trivia_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  -- Overall
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  
  -- By Category
  category_stats JSONB,
  
  -- Ranking
  global_rank INTEGER,
  weekly_rank INTEGER,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================================================
-- SECTION 10: COCKTAILS & RECIPES
-- ============================================================================

-- Cocktail Recipes (enhanced)
CREATE TABLE IF NOT EXISTS bv_cocktails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Categorization
  category TEXT, -- 'classic', 'modern', 'tiki', 'seasonal'
  glass_type TEXT,
  method TEXT, -- 'shaken', 'stirred', 'built', 'blended'
  
  -- Recipe
  ingredients JSONB NOT NULL, -- [{name, amount, unit, optional, substitutes}]
  instructions TEXT[] NOT NULL,
  garnish TEXT,
  tips TEXT,
  
  -- Base Spirit
  base_spirit_type TEXT,
  spirit_id UUID REFERENCES bv_spirits(id),
  
  -- Characteristics
  strength TEXT CHECK (strength IN ('light', 'medium', 'strong', 'very_strong')),
  sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 5),
  sourness INTEGER CHECK (sourness >= 1 AND sourness <= 5),
  bitterness INTEGER CHECK (bitterness >= 1 AND bitterness <= 5),
  
  -- Media
  image_url TEXT,
  video_url TEXT,
  
  -- History
  origin TEXT,
  created_by TEXT,
  year_created INTEGER,
  
  -- Stats
  avg_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  -- Source
  source TEXT,
  source_url TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Saved Cocktails
CREATE TABLE IF NOT EXISTS bv_saved_cocktails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  cocktail_id UUID REFERENCES bv_cocktails(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cocktail_id)
);

-- ============================================================================
-- SECTION 11: GAMES & CHALLENGES
-- ============================================================================

-- Games
CREATE TABLE IF NOT EXISTS bv_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Type
  game_type TEXT CHECK (game_type IN ('trivia', 'matching', 'blind_tasting', 'price_guess', 'region_guess', 'timeline', 'puzzle')),
  
  -- Config
  config JSONB,
  
  -- Media
  thumbnail_url TEXT,
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  
  -- Stats
  plays_count INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions
CREATE TABLE IF NOT EXISTS bv_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES bv_games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  -- Results
  score INTEGER,
  max_score INTEGER,
  accuracy DECIMAL(5,2),
  time_seconds INTEGER,
  
  -- Details
  answers JSONB,
  
  -- Rewards
  xp_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges (Weekly/Monthly)
CREATE TABLE IF NOT EXISTS bv_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Type
  challenge_type TEXT CHECK (challenge_type IN ('weekly', 'monthly', 'special', 'sponsored')),
  
  -- Requirements
  requirement_type TEXT, -- 'tastings', 'reviews', 'games', 'collection'
  target_value INTEGER,
  
  -- Period
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES bv_badges(id),
  prize_description TEXT,
  
  -- Stats
  participants_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Challenge Progress
CREATE TABLE IF NOT EXISTS bv_user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES bv_challenges(id) ON DELETE CASCADE,
  
  -- Progress
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id)
);

-- ============================================================================
-- SECTION 12: NOTIFICATIONS & ACTIVITY
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS bv_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  -- Type
  notification_type TEXT NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  message TEXT,
  
  -- Link
  action_url TEXT,
  
  -- Related
  related_user_id UUID REFERENCES bv_profiles(id),
  related_spirit_id UUID REFERENCES bv_spirits(id),
  related_post_id UUID REFERENCES bv_posts(id),
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE IF NOT EXISTS bv_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  -- Activity
  activity_type TEXT NOT NULL,
  description TEXT,
  
  -- XP
  xp_earned INTEGER DEFAULT 0,
  
  -- Related
  related_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 13: CONTENT AUTOMATION
-- ============================================================================

-- Auto Import Queue
CREATE TABLE IF NOT EXISTS bv_auto_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source
  source TEXT NOT NULL,
  source_url TEXT,
  
  -- Type
  import_type TEXT NOT NULL CHECK (import_type IN ('spirit', 'brand', 'history', 'trivia', 'cocktail', 'course', 'distillery')),
  
  -- Data
  raw_data JSONB,
  processed_data JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'duplicate')),
  error_message TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Scraping Jobs
CREATE TABLE IF NOT EXISTS bv_scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target
  target_url TEXT NOT NULL,
  target_type TEXT NOT NULL,
  
  -- Config
  config JSONB,
  
  -- Schedule
  frequency TEXT DEFAULT 'daily',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'active',
  last_status TEXT,
  last_error TEXT,
  
  -- Stats
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  items_found INTEGER DEFAULT 0,
  items_imported INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Generation Log
CREATE TABLE IF NOT EXISTS bv_content_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was generated
  content_type TEXT NOT NULL,
  content_id UUID,
  
  -- How
  model TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  -- Cost
  cost_usd DECIMAL(10,6),
  
  -- Status
  status TEXT DEFAULT 'success',
  error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 14: INDEXES & PERFORMANCE
-- ============================================================================

-- User lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON bv_profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON bv_profiles(subscription_tier);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON bv_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON bv_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON bv_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON bv_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON bv_comments(post_id);

-- Collection indexes
CREATE INDEX IF NOT EXISTS idx_collections_user ON bv_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_spirit ON bv_collections(spirit_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON bv_wishlists(user_id);

-- Tasting indexes
CREATE INDEX IF NOT EXISTS idx_tasting_notes_user ON bv_tasting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_tasting_notes_spirit ON bv_tasting_notes(spirit_id);

-- Barrel indexes
CREATE INDEX IF NOT EXISTS idx_barrels_user ON bv_barrels(user_id);
CREATE INDEX IF NOT EXISTS idx_barrel_updates_barrel ON bv_barrel_updates(barrel_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON bv_notifications(user_id) WHERE is_read = false;

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_history_published ON bv_history_articles(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_trivia_active ON bv_trivia(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cocktails_published ON bv_cocktails(is_published) WHERE is_published = true;

-- ============================================================================
-- SECTION 15: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE bv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_tasting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_barrels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_guestbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, own write
CREATE POLICY "Profiles are viewable by everyone" ON bv_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON bv_profiles FOR UPDATE USING (auth.uid() = id);

-- Collections: Own read/write, public if allowed
CREATE POLICY "Users can manage own collection" ON bv_collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public collections are viewable" ON bv_collections FOR SELECT USING (
  EXISTS (SELECT 1 FROM bv_profiles WHERE id = user_id AND is_public = true)
);

-- Posts: Public read, own write
CREATE POLICY "Public posts are viewable" ON bv_posts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own posts" ON bv_posts FOR ALL USING (auth.uid() = user_id);

-- Notifications: Own only
CREATE POLICY "Users see own notifications" ON bv_notifications FOR ALL USING (auth.uid() = user_id);

-- Service role bypass for automation
CREATE POLICY "Service role full access" ON bv_spirits FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON bv_history_articles FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON bv_trivia FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON bv_cocktails FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON bv_courses FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON bv_auto_imports FOR ALL TO service_role USING (true);

-- ============================================================================
-- SECTION 16: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update profile stats
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counts based on trigger table
  IF TG_TABLE_NAME = 'bv_collections' THEN
    UPDATE bv_profiles SET 
      collection_count = (SELECT COUNT(*) FROM bv_collections WHERE user_id = NEW.user_id),
      collection_value = (SELECT COALESCE(SUM(current_value), 0) FROM bv_collections WHERE user_id = NEW.user_id)
    WHERE id = NEW.user_id;
  ELSIF TG_TABLE_NAME = 'bv_tasting_notes' THEN
    UPDATE bv_profiles SET 
      tasting_notes_count = (SELECT COUNT(*) FROM bv_tasting_notes WHERE user_id = NEW.user_id),
      spirits_tried = (SELECT COUNT(DISTINCT spirit_id) FROM bv_tasting_notes WHERE user_id = NEW.user_id)
    WHERE id = NEW.user_id;
  ELSIF TG_TABLE_NAME = 'bv_follows' THEN
    UPDATE bv_profiles SET followers_count = (SELECT COUNT(*) FROM bv_follows WHERE following_id = NEW.following_id) WHERE id = NEW.following_id;
    UPDATE bv_profiles SET following_count = (SELECT COUNT(*) FROM bv_follows WHERE follower_id = NEW.follower_id) WHERE id = NEW.follower_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for stats
CREATE TRIGGER update_collection_stats AFTER INSERT OR UPDATE OR DELETE ON bv_collections FOR EACH ROW EXECUTE FUNCTION update_profile_stats();
CREATE TRIGGER update_tasting_stats AFTER INSERT OR UPDATE OR DELETE ON bv_tasting_notes FOR EACH ROW EXECUTE FUNCTION update_profile_stats();
CREATE TRIGGER update_follow_stats AFTER INSERT OR DELETE ON bv_follows FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- Function to award XP
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT)
RETURNS void AS $$
DECLARE
  current_level INTEGER;
  new_xp INTEGER;
  xp_needed INTEGER;
BEGIN
  SELECT level, xp, xp_to_next_level INTO current_level, new_xp, xp_needed 
  FROM bv_profiles WHERE id = p_user_id;
  
  new_xp := new_xp + p_amount;
  
  -- Check for level up
  WHILE new_xp >= xp_needed LOOP
    new_xp := new_xp - xp_needed;
    current_level := current_level + 1;
    xp_needed := 100 * current_level; -- Simple scaling
  END LOOP;
  
  UPDATE bv_profiles SET 
    xp = new_xp,
    level = current_level,
    xp_to_next_level = xp_needed,
    total_xp_earned = total_xp_earned + p_amount
  WHERE id = p_user_id;
  
  -- Log activity
  INSERT INTO bv_activity_log (user_id, activity_type, description, xp_earned)
  VALUES (p_user_id, 'xp_earned', p_reason, p_amount);
END;
$$ LANGUAGE plpgsql;

-- Function to update spirit ratings
CREATE OR REPLACE FUNCTION update_spirit_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bv_spirits SET 
    avg_rating = (SELECT AVG(rating) FROM bv_tasting_notes WHERE spirit_id = NEW.spirit_id),
    rating_count = (SELECT COUNT(*) FROM bv_tasting_notes WHERE spirit_id = NEW.spirit_id)
  WHERE id = NEW.spirit_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spirit_rating_trigger AFTER INSERT OR UPDATE ON bv_tasting_notes FOR EACH ROW EXECUTE FUNCTION update_spirit_rating();

-- ============================================================================
-- COMPLETE!
-- ============================================================================
