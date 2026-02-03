-- Add 'generating' status to social_posts_status_check constraint
ALTER TABLE social_posts DROP CONSTRAINT social_posts_status_check;

ALTER TABLE social_posts 
ADD CONSTRAINT social_posts_status_check 
CHECK (status IN ('pending', 'strategy_completed', 'copy_completed', 'prompt_completed', 'image_generated', 'completed', 'failed', 'editing_started', 'generating_edit', 'scheduled', 'publishing', 'generating'));
