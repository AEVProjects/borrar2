-- MSI Content Generator Database Schema
-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.generated_images CASCADE;
DROP TABLE IF EXISTS public.post_versions CASCADE;
DROP TABLE IF EXISTS public.social_posts CASCADE;

-- Main social posts table
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
  
  -- Agent outputs (PLAIN TEXT)
  strategy_analysis text,      -- Full output from Agent 1
  post_copy text,              -- Plain text from Agent 2
  image_prompt text,           -- Plain text from Agent 3
  
  -- Generated content
  image_url text,
  
  -- Publishing platforms
  publish_linkedin text DEFAULT 'No',
  publish_facebook text DEFAULT 'No',
  publish_instagram text DEFAULT 'No',
  
  -- Metadata
  status text DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'strategy_completed', 'copy_completed', 'prompt_completed', 'image_generated', 'completed', 'failed')),
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT social_posts_pkey PRIMARY KEY (id)
);

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