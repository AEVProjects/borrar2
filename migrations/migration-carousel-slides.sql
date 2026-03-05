-- ===========================================
-- MIGRATION: Add carousel_slides table
-- Execute this script in Supabase SQL Editor
-- ===========================================

-- Create carousel_slides table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.carousel_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Link to parent carousel/post
  carousel_id uuid NOT NULL,
  
  -- Slide position and content
  slide_number integer NOT NULL CHECK (slide_number > 0),
  headline text NOT NULL,
  subtext text,
  body_text text,
  
  -- Image data
  image_url text,
  image_prompt text,
  
  -- Visual consistency parameters (MSI Brand)
  visual_style jsonb DEFAULT '{
    "font_headline": "ITC Avant Garde Bold",
    "font_headline_size": "48-56pt",
    "font_subtext": "Poppins SemiBold", 
    "font_subtext_size": "24-32pt",
    "font_body": "Quicksand Medium",
    "font_body_size": "16-20pt",
    "primary_color": "#207CE5",
    "secondary_color": "#004AAD",
    "accent_color": "#FFFDF1",
    "dark_color": "#2B2B2B",
    "logo_position": "bottom-right",
    "background_style": "gradient"
  }'::jsonb,
  
  -- Generation metadata
  generation_service character varying DEFAULT 'gemini',
  generation_time_seconds numeric,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT carousel_slides_pkey PRIMARY KEY (id),
  CONSTRAINT carousel_slides_carousel_fkey FOREIGN KEY (carousel_id) REFERENCES public.social_posts(id) ON DELETE CASCADE,
  CONSTRAINT carousel_slides_unique_position UNIQUE (carousel_id, slide_number)
);

-- Create indexes if they don't exist
DO $$
BEGIN
  -- Index for carousel_id lookups
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'carousel_slides' 
    AND indexname = 'idx_carousel_slides_carousel_id'
  ) THEN
    CREATE INDEX idx_carousel_slides_carousel_id ON public.carousel_slides(carousel_id);
  END IF;

  -- Index for slide number queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'carousel_slides' 
    AND indexname = 'idx_carousel_slides_slide_number'
  ) THEN
    CREATE INDEX idx_carousel_slides_slide_number ON public.carousel_slides(slide_number);
  END IF;
END $$;

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  -- Check if trigger already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_carousel_slides_updated_at'
  ) THEN
    CREATE TRIGGER update_carousel_slides_updated_at
      BEFORE UPDATE ON public.carousel_slides
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE public.carousel_slides IS 'Individual slides for Instagram/LinkedIn carousel posts';
COMMENT ON COLUMN public.carousel_slides.visual_style IS 'JSON containing MSI brand visual parameters for consistency';
COMMENT ON COLUMN public.carousel_slides.slide_number IS 'Position of slide in carousel (1-indexed)';

-- Verify the table was created successfully
SELECT 
  'carousel_slides table created successfully' as status,
  COUNT(*) as current_records
FROM public.carousel_slides;

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'carousel_slides'
ORDER BY ordinal_position;