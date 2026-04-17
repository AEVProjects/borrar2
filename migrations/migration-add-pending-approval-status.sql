-- Add 'pending_approval' status to social_posts_status_check constraint
-- Required for the two-step educative carousel flow (content generated, awaiting image gen approval)

ALTER TABLE public.social_posts DROP CONSTRAINT IF EXISTS social_posts_status_check;

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
  'video_completed',
  'pending_approval'
));
