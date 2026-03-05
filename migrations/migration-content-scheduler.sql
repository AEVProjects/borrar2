-- ============================================================
-- Migration: Content Scheduler (Weekly Content Programming)
-- Allows scheduling content generation for Mon-Fri with 
-- different content types and their specific configurations
-- ============================================================

-- Drop existing content_calendar if it exists (we're replacing it with a better version)
DROP TABLE IF EXISTS public.content_calendar CASCADE;

-- ============================================================
-- CONTENT SCHEDULE TABLE
-- Stores scheduled content generation tasks with all
-- parameters needed to call the appropriate webhook
-- ============================================================
CREATE TABLE public.content_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Scheduling
  scheduled_date date NOT NULL,
  scheduled_time time DEFAULT '08:00:00',
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
  week_label text, -- e.g., "2026-W08" for grouping
  
  -- Content type determines which webhook to call
  content_type text NOT NULL CHECK (content_type IN (
    'generate',       -- Standard AI content generation
    'carousel',       -- Instagram carousel (slides with headlines)
    'educative',      -- Educative carousel
    'video',          -- AI Video (Veo 3.1)
    'voice_video',    -- Voice Video (16s continuous)
    'trends'          -- Trends-based content
  )),
  
  -- Label/title for the schedule item (user-friendly)
  title text NOT NULL,
  
  -- All webhook parameters stored as JSON
  -- Structure varies by content_type:
  --
  -- generate: { topic, headline, post_type, visual_style, data_points, context, orientation, use_custom_colors, color_primary, color_secondary, color_accent, color_dark }
  -- carousel: { topic, visual_style, context, color_palette: {primary, secondary, accent, dark}, slides: [{slide_number, headline, subtext}] }
  -- educative: { topic, pillar, theme, context }
  -- video: { prompt, service, duration, topic, start_image_url, second_image_url }
  -- voice_video: { prompt, service, topic, start_image_url }
  -- trends: { trigger: "scheduled" }
  webhook_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Linked post (once generated)
  generated_post_id uuid,
  
  -- Status tracking
  status text DEFAULT 'scheduled' NOT NULL CHECK (status IN (
    'scheduled',    -- Waiting for scheduled date/time
    'generating',   -- Currently being generated
    'generated',    -- Successfully generated
    'failed',       -- Generation failed
    'cancelled'     -- Manually cancelled
  )),
  error_message text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  generated_at timestamp with time zone,
  
  CONSTRAINT content_schedule_pkey PRIMARY KEY (id),
  CONSTRAINT content_schedule_post_fkey FOREIGN KEY (generated_post_id) REFERENCES public.social_posts(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_content_schedule_date ON public.content_schedule(scheduled_date);
CREATE INDEX idx_content_schedule_status ON public.content_schedule(status);
CREATE INDEX idx_content_schedule_week ON public.content_schedule(week_label);
CREATE INDEX idx_content_schedule_type ON public.content_schedule(content_type);
CREATE INDEX idx_content_schedule_pending ON public.content_schedule(scheduled_date, status) 
  WHERE status = 'scheduled';

-- Auto-update trigger
CREATE TRIGGER update_content_schedule_updated_at
    BEFORE UPDATE ON public.content_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.content_schedule IS 'Weekly content scheduler - stores pre-configured generation tasks for Mon-Fri';
COMMENT ON COLUMN public.content_schedule.content_type IS 'Type of content: generate, carousel, educative, video, voice_video, trends';
COMMENT ON COLUMN public.content_schedule.webhook_data IS 'JSON payload to send to the content generation webhook';
COMMENT ON COLUMN public.content_schedule.week_label IS 'ISO week label for grouping (e.g., 2026-W08)';

-- Enable RLS (Row Level Security) - allow all for anon key
ALTER TABLE public.content_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" ON public.content_schedule
  FOR ALL USING (true) WITH CHECK (true);
