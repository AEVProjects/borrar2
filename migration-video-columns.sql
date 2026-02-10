-- Migration: Add video columns to social_posts table
-- Run this migration in Supabase SQL Editor
-- IMPORTANT: Run this BEFORE generating videos so video data can be saved

-- Step 1: Add video URI columns for GCS storage
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS video_part1_uri text,
ADD COLUMN IF NOT EXISTS video_part2_uri text;

-- Step 2: Add signed URL columns for browser-accessible video links
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS video1_signed_url text,
ADD COLUMN IF NOT EXISTS video2_signed_url text;

-- Step 3: Update status CHECK constraint to include 'video_completed'
-- First drop existing constraint (safe if it doesn't exist)
ALTER TABLE public.social_posts 
DROP CONSTRAINT IF EXISTS social_posts_status_check;

-- Re-create with all statuses including video_completed
ALTER TABLE public.social_posts 
ADD CONSTRAINT social_posts_status_check 
CHECK (status IN (
  'pending', 
  'strategy_completed', 
  'copy_completed', 
  'prompt_completed', 
  'image_generated', 
  'completed', 
  'failed', 
  'editing_started', 
  'generating_edit', 
  'generating',
  'scheduled', 
  'publishing',
  'video_completed'
));

-- Step 4: Create index for video posts lookup
CREATE INDEX IF NOT EXISTS idx_social_posts_video 
ON public.social_posts(status) 
WHERE status = 'video_completed';

-- Verify: Run this to confirm columns were added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name LIKE 'video%';