-- ============================================================
-- Migration: Profile Interactions Scraper
-- Stores people who interact with your LinkedIn profile/posts
-- ============================================================

-- =============================================
-- SCRAPED PROFILES TABLE
-- Stores unique profiles of people who interact
-- =============================================
CREATE TABLE IF NOT EXISTS public.scraped_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Profile identification
  linkedin_url text UNIQUE,               -- LinkedIn profile URL (canonical)
  linkedin_id text UNIQUE,                -- LinkedIn member ID (if available)
  
  -- Profile info
  full_name text NOT NULL,
  first_name text,
  last_name text,
  headline text,                          -- Job title / headline
  company text,                           -- Current company
  location text,
  avatar_url text,                        -- Profile picture URL
  
  -- Classification
  connection_degree integer,              -- 1st, 2nd, 3rd degree
  is_following boolean DEFAULT false,
  is_potential_lead boolean DEFAULT false, -- Marked as potential lead
  lead_score integer DEFAULT 0,           -- 0-100 score based on engagement
  tags text[] DEFAULT '{}',               -- Custom tags: ['lead', 'competitor', 'partner']
  
  -- Engagement summary (aggregated)
  total_interactions integer DEFAULT 0,
  total_likes integer DEFAULT 0,
  total_comments integer DEFAULT 0,
  total_shares integer DEFAULT 0,
  first_seen_at timestamp with time zone DEFAULT now(),
  last_interaction_at timestamp with time zone DEFAULT now(),
  
  -- Notes
  notes text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT scraped_profiles_pkey PRIMARY KEY (id)
);

-- Indexes for scraped_profiles
CREATE INDEX IF NOT EXISTS idx_scraped_profiles_linkedin_url ON public.scraped_profiles(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_scraped_profiles_company ON public.scraped_profiles(company);
CREATE INDEX IF NOT EXISTS idx_scraped_profiles_lead_score ON public.scraped_profiles(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_profiles_last_interaction ON public.scraped_profiles(last_interaction_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_profiles_is_lead ON public.scraped_profiles(is_potential_lead) WHERE is_potential_lead = true;
CREATE INDEX IF NOT EXISTS idx_scraped_profiles_tags ON public.scraped_profiles USING GIN(tags);

-- Trigger for updated_at
CREATE TRIGGER update_scraped_profiles_updated_at
    BEFORE UPDATE ON public.scraped_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROFILE INTERACTIONS TABLE
-- Stores each individual interaction event
-- =============================================
CREATE TABLE IF NOT EXISTS public.profile_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Who interacted
  profile_id uuid NOT NULL,
  
  -- Interaction details
  interaction_type text NOT NULL 
    CHECK (interaction_type IN ('like', 'comment', 'share', 'follow', 'visit', 'mention', 'reaction')),
  reaction_type text,                     -- 'LIKE', 'CELEBRATE', 'SUPPORT', 'LOVE', 'INSIGHTFUL', 'FUNNY'
  
  -- What they interacted with
  post_id uuid,                           -- Link to social_posts if applicable
  post_url text,                          -- LinkedIn post URL
  post_content_preview text,              -- First 200 chars of the post
  
  -- Comment content (if interaction_type = 'comment')
  comment_text text,
  comment_url text,
  
  -- Scrape metadata
  scraped_from text DEFAULT 'linkedin'    -- Source: 'linkedin', 'phantombuster', 'apify', etc.
    CHECK (scraped_from IN ('linkedin', 'phantombuster', 'apify', 'rapidapi', 'manual')),
  scrape_run_id text,                     -- ID of the scraping run for dedup
  
  -- When the interaction happened
  interaction_date timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT profile_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT profile_interactions_profile_fkey FOREIGN KEY (profile_id) 
    REFERENCES public.scraped_profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_interactions_post_fkey FOREIGN KEY (post_id) 
    REFERENCES public.social_posts(id) ON DELETE SET NULL
);

-- Indexes for profile_interactions
CREATE INDEX IF NOT EXISTS idx_profile_interactions_profile_id ON public.profile_interactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interactions_type ON public.profile_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_profile_interactions_post_id ON public.profile_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_profile_interactions_date ON public.profile_interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_profile_interactions_scrape_run ON public.profile_interactions(scrape_run_id);

-- Unique constraint to prevent duplicate interactions per scrape run
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_interactions_unique 
  ON public.profile_interactions(profile_id, interaction_type, post_url, scrape_run_id)
  WHERE post_url IS NOT NULL;

-- =============================================
-- SCRAPE RUNS LOG TABLE
-- Tracks each scraping execution
-- =============================================
CREATE TABLE IF NOT EXISTS public.scrape_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Run info
  run_id text NOT NULL UNIQUE,            -- Unique run identifier
  trigger_type text DEFAULT 'scheduled' 
    CHECK (trigger_type IN ('scheduled', 'manual', 'webhook')),
  scrape_source text DEFAULT 'linkedin',
  
  -- Results
  profiles_found integer DEFAULT 0,
  new_profiles integer DEFAULT 0,
  interactions_saved integer DEFAULT 0,
  
  -- Status
  status text DEFAULT 'running' 
    CHECK (status IN ('running', 'completed', 'partial', 'failed')),
  error_message text,
  
  -- Timing
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  duration_seconds integer,
  
  CONSTRAINT scrape_runs_pkey PRIMARY KEY (id)
);

-- Indexes for scrape_runs
CREATE INDEX IF NOT EXISTS idx_scrape_runs_date ON public.scrape_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_status ON public.scrape_runs(status);

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.scraped_profiles IS 'Unique profiles of people who interact with our LinkedIn content';
COMMENT ON TABLE public.profile_interactions IS 'Individual interaction events (likes, comments, shares, etc.)';
COMMENT ON TABLE public.scrape_runs IS 'Log of each scraping execution run';
COMMENT ON COLUMN public.scraped_profiles.lead_score IS 'Engagement score 0-100, auto-calculated based on interaction frequency and type';
COMMENT ON COLUMN public.scraped_profiles.tags IS 'Custom tags for classification: lead, competitor, partner, etc.';
COMMENT ON COLUMN public.profile_interactions.scrape_run_id IS 'Links interaction to specific scrape run for deduplication';

-- =============================================
-- HELPER FUNCTION: Update lead score
-- Recalculates lead_score based on interactions
-- =============================================
CREATE OR REPLACE FUNCTION update_lead_score(p_profile_id uuid)
RETURNS void AS $$
DECLARE
  v_likes integer;
  v_comments integer;
  v_shares integer;
  v_total integer;
  v_score integer;
  v_days_since_last integer;
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN interaction_type IN ('like', 'reaction') THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN interaction_type = 'comment' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN interaction_type = 'share' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO v_likes, v_comments, v_shares, v_total
  FROM public.profile_interactions 
  WHERE profile_id = p_profile_id;
  
  -- Score formula: comments worth 3x, shares 5x, likes 1x
  -- Max from interactions: 70 points
  v_score := LEAST(70, (v_likes * 1) + (v_comments * 3) + (v_shares * 5));
  
  -- Recency bonus: up to 30 points if interacted in last 7 days
  SELECT EXTRACT(DAY FROM (now() - MAX(interaction_date)))::integer
  INTO v_days_since_last
  FROM public.profile_interactions 
  WHERE profile_id = p_profile_id;
  
  IF v_days_since_last IS NOT NULL AND v_days_since_last <= 7 THEN
    v_score := v_score + (30 - (v_days_since_last * 4));
  END IF;
  
  v_score := GREATEST(0, LEAST(100, v_score));
  
  UPDATE public.scraped_profiles 
  SET 
    lead_score = v_score,
    total_interactions = v_total,
    total_likes = v_likes,
    total_comments = v_comments,
    total_shares = v_shares,
    is_potential_lead = (v_score >= 40),
    updated_at = now()
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: Auto-update lead score on new interaction
-- =============================================
CREATE OR REPLACE FUNCTION trigger_update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_lead_score(NEW.profile_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_lead_score
    AFTER INSERT ON public.profile_interactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_lead_score();

-- =============================================
-- VIEW: Top engaged profiles (convenience)
-- =============================================
CREATE OR REPLACE VIEW public.top_engaged_profiles AS
SELECT 
  sp.id,
  sp.full_name,
  sp.headline,
  sp.company,
  sp.linkedin_url,
  sp.avatar_url,
  sp.lead_score,
  sp.total_interactions,
  sp.total_likes,
  sp.total_comments,
  sp.total_shares,
  sp.is_potential_lead,
  sp.tags,
  sp.first_seen_at,
  sp.last_interaction_at,
  sp.connection_degree,
  (SELECT COUNT(*) FROM profile_interactions pi WHERE pi.profile_id = sp.id AND pi.interaction_date >= now() - interval '7 days') as interactions_last_7_days,
  (SELECT COUNT(*) FROM profile_interactions pi WHERE pi.profile_id = sp.id AND pi.interaction_date >= now() - interval '30 days') as interactions_last_30_days
FROM public.scraped_profiles sp
ORDER BY sp.lead_score DESC, sp.last_interaction_at DESC;

COMMENT ON VIEW public.top_engaged_profiles IS 'Convenience view showing most engaged profiles with recent activity stats';
