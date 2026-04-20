-- ============================================================
-- MSI Cold Calling (Bland.ai) — v2 Migration (Incremental)
-- Run AFTER migration-bland-calls.sql
-- Adds missing columns for full logging
-- ============================================================

-- 1. Add missing columns to bland_leads
ALTER TABLE public.bland_leads
  ADD COLUMN IF NOT EXISTS meeting_date  date,
  ADD COLUMN IF NOT EXISTS meeting_time  text,
  ADD COLUMN IF NOT EXISTS callback_date date,
  ADD COLUMN IF NOT EXISTS callback_time text,
  ADD COLUMN IF NOT EXISTS email_collected text,
  ADD COLUMN IF NOT EXISTS disposition   text;

COMMENT ON COLUMN public.bland_leads.meeting_date IS 'Date of scheduled meeting (from call)';
COMMENT ON COLUMN public.bland_leads.meeting_time IS 'Time of scheduled meeting (from call)';
COMMENT ON COLUMN public.bland_leads.callback_date IS 'Requested callback date';
COMMENT ON COLUMN public.bland_leads.callback_time IS 'Requested callback time';
COMMENT ON COLUMN public.bland_leads.email_collected IS 'Email confirmed during the call (may differ from original)';
COMMENT ON COLUMN public.bland_leads.disposition IS 'Bland.ai disposition: meeting_scheduled, send_email, callback, not_interested, wrong_number, gatekeeper';

-- 2. Add missing columns to bland_call_logs
ALTER TABLE public.bland_call_logs
  ADD COLUMN IF NOT EXISTS disposition     text,
  ADD COLUMN IF NOT EXISTS pain_points     text,
  ADD COLUMN IF NOT EXISTS email_collected text,
  ADD COLUMN IF NOT EXISTS meeting_date   date,
  ADD COLUMN IF NOT EXISTS meeting_time   text,
  ADD COLUMN IF NOT EXISTS callback_date  date,
  ADD COLUMN IF NOT EXISTS callback_time  text;

COMMENT ON COLUMN public.bland_call_logs.disposition IS 'Bland.ai auto-classification of call outcome';
COMMENT ON COLUMN public.bland_call_logs.pain_points IS 'Pain points detected during call';
COMMENT ON COLUMN public.bland_call_logs.email_collected IS 'Email confirmed during the call';
COMMENT ON COLUMN public.bland_call_logs.meeting_date IS 'Scheduled meeting date';
COMMENT ON COLUMN public.bland_call_logs.meeting_time IS 'Scheduled meeting time';

-- 3. Add busy to daily stats
ALTER TABLE public.bland_daily_stats
  ADD COLUMN IF NOT EXISTS busy integer DEFAULT 0;

-- 4. Add index on disposition for analytics
CREATE INDEX IF NOT EXISTS idx_bland_leads_disposition ON public.bland_leads(disposition);
CREATE INDEX IF NOT EXISTS idx_bland_call_logs_disposition ON public.bland_call_logs(disposition);

-- 5. Update the CHECK constraint on status to include new states
-- (Drop old one first if exists, then recreate)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'bland_leads_status_check'
  ) THEN
    ALTER TABLE public.bland_leads DROP CONSTRAINT bland_leads_status_check;
  END IF;

  ALTER TABLE public.bland_leads
    ADD CONSTRAINT bland_leads_status_check
    CHECK (status IN ('PENDING','IN_PROGRESS','CONTACTED','SCHEDULED','NOT_INTERESTED','FOLLOW_UP','NO_ANSWER','CALLBACK','WRONG_NUMBER'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

SELECT 'bland_calls v2 migration completed ✓' AS result;
