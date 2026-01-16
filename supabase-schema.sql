-- MSI Content Generator Database Schema
-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.trend_news CASCADE;
DROP TABLE IF EXISTS public.generated_images CASCADE;
DROP TABLE IF EXISTS public.post_versions CASCADE;
DROP TABLE IF EXISTS public.social_posts CASCADE;

-- =============================================
-- TREND NEWS TABLE
-- Stores scraped news from Google Trends
-- =============================================
CREATE TABLE public.trend_news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Trend data
  trend_query text NOT NULL,
  search_query text,
  
  -- News article data
  title text NOT NULL,
  link text,
  source text,
  news_date text,
  snippet text,
  
  -- Usage tracking
  used_for_post_id uuid,
  is_used boolean DEFAULT false,
  
  -- Timestamps
  scraped_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT trend_news_pkey PRIMARY KEY (id)
);

-- Index for faster queries
CREATE INDEX idx_trend_news_scraped ON public.trend_news(scraped_at DESC);
CREATE INDEX idx_trend_news_used ON public.trend_news(is_used);

-- =============================================
-- MAIN SOCIAL POSTS TABLE
-- =============================================
CREATE TABLE public.social_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Form inputs
  topic text NOT NULL,
  post_type text NOT NULL,
  visual_style text NOT NULL,
  orientation text NOT NULL,
  headline text NOT NULL,
  data_points text,
  context text,
  
  -- Trend source (for posts generated from trends)
  trend_source text,
  
  -- Agent outputs (PLAIN TEXT)
  strategy_analysis text,      -- Full output from Agent 1
  post_copy text,              -- Plain text from Agent 2
  image_prompt text,           -- Plain text from Agent 3
  
  -- Generated content
  image_url text,
  youtube_url text,            -- YouTube video URL (from Veo 3.1)
  
  -- Publishing platforms
  publish_linkedin text DEFAULT 'No',
  publish_facebook text DEFAULT 'No',
  publish_instagram text DEFAULT 'No',
  
  -- Scheduled publishing
  scheduled_publish_at timestamp with time zone,
  
  -- Metadata
  status text DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'strategy_completed', 'copy_completed', 'prompt_completed', 'image_generated', 'completed', 'failed', 'editing_started', 'generating_edit', 'scheduled', 'publishing')),
  -- Status flow: pending → copy_completed → prompt_completed → image_generated → completed
  -- Edit flow: editing_started → generating_edit → completed
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT social_posts_pkey PRIMARY KEY (id)
);

-- Add foreign key for trend_news
ALTER TABLE public.trend_news 
ADD CONSTRAINT trend_news_post_fkey 
FOREIGN KEY (used_for_post_id) REFERENCES public.social_posts(id) ON DELETE SET NULL;

-- Generated images table (for tracking multiple image generations)
CREATE TABLE public.generated_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  
  -- Image details
  image_url text NOT NULL,
  image_prompt text NOT NULL,
  dimensions character varying NOT NULL CHECK (dimensions::text ~ '^\d+x\d+$'::text),
  
  -- Generation metadata
  generation_service character varying DEFAULT 'gemini' NOT NULL,
  generation_time_seconds numeric,
  file_size_kb integer,
  
  -- Flags
  is_primary boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT generated_images_pkey PRIMARY KEY (id),
  CONSTRAINT generated_images_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE
);

-- Post versions table (for tracking edits and iterations)
CREATE TABLE public.post_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  version_number integer NOT NULL,
  
  -- Version content
  post_copy text NOT NULL,
  image_prompt text,
  strategy_analysis text,
  
  -- Version metadata
  change_description text,
  created_by character varying,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT post_versions_pkey PRIMARY KEY (id),
  CONSTRAINT post_versions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE,
  CONSTRAINT post_versions_post_id_version_unique UNIQUE (post_id, version_number)
);

-- Indexes for better query performance
CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX idx_social_posts_post_type ON public.social_posts(post_type);
CREATE INDEX idx_generated_images_post_id ON public.generated_images(post_id);
CREATE INDEX idx_post_versions_post_id ON public.post_versions(post_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_social_posts_updated_at
    BEFORE UPDATE ON public.social_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.social_posts IS 'Main table for LinkedIn content generation tracking';
COMMENT ON TABLE public.generated_images IS 'Tracks all generated images including regenerations';
COMMENT ON TABLE public.post_versions IS 'Version history for content iterations';
COMMENT ON COLUMN public.social_posts.strategy_analysis IS 'Plain text output from Agent 1: Strategy Analyzer';
COMMENT ON COLUMN public.social_posts.post_copy IS 'Plain text output from Agent 2: Copy Writer';
COMMENT ON COLUMN public.social_posts.image_prompt IS 'Plain text output from Agent 3: Image Prompt Engineer';

-- Migration: Add publishing platform columns (if table already exists)
-- Run these ALTER TABLE commands on existing databases:
DO $$ 
BEGIN
    -- Add publish_linkedin column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_posts' 
        AND column_name = 'publish_linkedin'
    ) THEN
        ALTER TABLE public.social_posts ADD COLUMN publish_linkedin text DEFAULT 'No';
    END IF;

    -- Add publish_facebook column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_posts' 
        AND column_name = 'publish_facebook'
    ) THEN
        ALTER TABLE public.social_posts ADD COLUMN publish_facebook text DEFAULT 'No';
    END IF;

    -- Add publish_instagram column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_posts' 
        AND column_name = 'publish_instagram'
    ) THEN
        ALTER TABLE public.social_posts ADD COLUMN publish_instagram text DEFAULT 'No';
    END IF;
END $$;

-- ============================================================
-- Content Calendar Table (for scheduling and auto-generation)
-- ============================================================

DROP TABLE IF EXISTS public.content_calendar CASCADE;

CREATE TABLE public.content_calendar (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Scheduling
  scheduled_date date NOT NULL,
  scheduled_time time DEFAULT '09:00:00',
  day_of_week character varying(10),
  
  -- Content configuration
  topic_suggestion text,
  post_type text DEFAULT 'Educational',
  visual_style text DEFAULT 'Infographic',
  custom_headline text,
  custom_context text,
  
  -- AI generation settings
  auto_generate boolean DEFAULT true,
  use_trending_topics boolean DEFAULT true,
  
  -- Linked post (once generated)
  generated_post_id uuid,
  
  -- Status
  status text DEFAULT 'scheduled' NOT NULL 
    CHECK (status IN ('scheduled', 'generating', 'generated', 'published', 'failed', 'cancelled')),
  
  -- Publishing configuration
  publish_linkedin boolean DEFAULT true,
  publish_facebook boolean DEFAULT false,
  publish_instagram boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT content_calendar_pkey PRIMARY KEY (id),
  CONSTRAINT content_calendar_post_fkey FOREIGN KEY (generated_post_id) REFERENCES public.social_posts(id) ON DELETE SET NULL
);

-- Indexes for content calendar
CREATE INDEX idx_content_calendar_date ON public.content_calendar(scheduled_date);
CREATE INDEX idx_content_calendar_status ON public.content_calendar(status);
CREATE INDEX idx_content_calendar_auto_generate ON public.content_calendar(auto_generate) WHERE auto_generate = true;

-- Trigger for content calendar updated_at
CREATE TRIGGER update_content_calendar_updated_at
    BEFORE UPDATE ON public.content_calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.content_calendar IS 'Content calendar for scheduling and auto-generating posts';
COMMENT ON COLUMN public.content_calendar.scheduled_date IS 'Date when content should be generated/published';
COMMENT ON COLUMN public.content_calendar.auto_generate IS 'If true, AI will generate topic automatically';
COMMENT ON COLUMN public.content_calendar.generated_post_id IS 'Links to the generated post in social_posts table';

-- ============================================================
-- Daily Generation Log (tracks auto-generation runs)
-- ============================================================

DROP TABLE IF EXISTS public.generation_log CASCADE;

CREATE TABLE public.generation_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Run information
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  run_time timestamp with time zone DEFAULT now(),
  trigger_type text DEFAULT 'scheduled' CHECK (trigger_type IN ('scheduled', 'manual', 'api')),
  
  -- Generation details
  posts_requested integer DEFAULT 1,
  posts_generated integer DEFAULT 0,
  posts_failed integer DEFAULT 0,
  
  -- Linked posts (JSON array of post IDs)
  generated_post_ids jsonb DEFAULT '[]'::jsonb,
  
  -- AI context used
  daily_theme text,
  special_event text,
  trending_topics jsonb,
  
  -- Status and errors
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'partial', 'failed')),
  error_message text,
  
  -- Timing
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  duration_seconds integer,
  
  CONSTRAINT generation_log_pkey PRIMARY KEY (id)
);

-- Indexes for generation log
CREATE INDEX idx_generation_log_date ON public.generation_log(run_date DESC);
CREATE INDEX idx_generation_log_status ON public.generation_log(status);

-- Comments
COMMENT ON TABLE public.generation_log IS 'Tracks all auto-generation runs and their results';
COMMENT ON COLUMN public.generation_log.trigger_type IS 'How the generation was triggered: scheduled, manual, or API';

-- ============================================================
-- Migration: Update status constraint for image edit flow
-- Run these commands ONE BY ONE in Supabase SQL Editor:
-- ============================================================

-- Step 1: Drop the existing constraint
-- ALTER TABLE social_posts DROP CONSTRAINT social_posts_status_check;

-- Step 2: Update any rows with invalid status values to 'completed'
-- UPDATE social_posts 
-- SET status = 'completed' 
-- WHERE status NOT IN ('pending', 'strategy_completed', 'copy_completed', 'prompt_completed', 'image_generated', 'completed', 'failed', 'editing_started', 'generating_edit');

-- Step 3: Add the new constraint with edit statuses
-- ALTER TABLE social_posts 
-- ADD CONSTRAINT social_posts_status_check 
-- CHECK (status IN ('pending', 'strategy_completed', 'copy_completed', 'prompt_completed', 'image_generated', 'completed', 'failed', 'editing_started', 'generating_edit'));