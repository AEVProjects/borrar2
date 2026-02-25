-- Migration: Add Part 3 video columns to social_posts
-- Run this in your Supabase SQL editor before using the 3-part video flow

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS video_part3_uri TEXT,
  ADD COLUMN IF NOT EXISTS video3_signed_url TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN social_posts.video_part3_uri IS 'GCS URI for video Part 3 (Call to Action)';
COMMENT ON COLUMN social_posts.video3_signed_url IS 'Signed URL for video Part 3';
