-- ============================================================
-- MSI Cold Calling (Bland.ai) — v3 Migration (Incremental)
-- Run AFTER migration-bland-calls.sql AND migration-bland-calls-v2.sql
-- Adds columns required by the v9 Orchestrator + Webhook Handler
-- ============================================================

-- 1. active_call_id: tracks the current in-flight Bland call_id
--    Allows the recovery mechanism (Resetear Atascados) to identify
--    which call was lost if the webhook never fires.
ALTER TABLE public.bland_leads
  ADD COLUMN IF NOT EXISTS active_call_id text;

COMMENT ON COLUMN public.bland_leads.active_call_id IS
  'Bland.ai call_id of the current in-flight call. Cleared to NULL on completion or recovery reset.';

-- 2. Compound index for the lead selection query in the Orchestrator.
--    Covers: status IN(...), attempts < 3, last_call_date < today, callback_date <= today
CREATE INDEX IF NOT EXISTS idx_bland_leads_selection
  ON public.bland_leads (status, attempts, last_call_date, callback_date)
  WHERE status IN ('PENDING', 'CALLBACK');

-- 3. Index on active_call_id for fast webhook lookup (call_id → lead)
CREATE INDEX IF NOT EXISTS idx_bland_leads_active_call_id
  ON public.bland_leads (active_call_id)
  WHERE active_call_id IS NOT NULL;

-- 4. Index on call_id in call_logs for fast deduplication lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_bland_call_logs_call_id_unique
  ON public.bland_call_logs (call_id)
  WHERE call_id IS NOT NULL;

-- 5. Ensure bland_daily_stats.busy column exists (added in v2, repeated safely)
ALTER TABLE public.bland_daily_stats
  ADD COLUMN IF NOT EXISTS busy integer DEFAULT 0;

-- 6. Helper view: leads ready to be called right now (EST business hours check
--    is done in n8n, but this view is useful for manual inspection in Supabase)
CREATE OR REPLACE VIEW public.bland_leads_callable AS
SELECT
  id, lead_name, phone, company, title, email,
  industry, lead_type, intent_topic,
  status, attempts, last_call_date, callback_date,
  created_at
FROM public.bland_leads
WHERE status IN ('PENDING', 'CALLBACK')
  AND attempts < 3
  AND (last_call_date IS NULL OR last_call_date < CURRENT_DATE)
  AND (status != 'CALLBACK' OR callback_date IS NULL OR callback_date <= CURRENT_DATE)
ORDER BY
  CASE WHEN status = 'CALLBACK' THEN 0 ELSE 1 END,
  created_at ASC;

-- 7. Helper view: today's call summary
CREATE OR REPLACE VIEW public.bland_today_summary AS
SELECT
  COALESCE(s.total_calls, 0)        AS total_calls,
  COALESCE(s.answered, 0)           AS answered,
  COALESCE(s.voicemail, 0)          AS voicemail,
  COALESCE(s.no_answer, 0)          AS no_answer,
  COALESCE(s.meetings_scheduled, 0) AS meetings_scheduled,
  COALESCE(s.interested, 0)         AS interested,
  COALESCE(s.not_interested, 0)     AS not_interested,
  (SELECT COUNT(*) FROM public.bland_leads WHERE status = 'IN_PROGRESS') AS in_progress_now,
  (SELECT COUNT(*) FROM public.bland_leads WHERE status IN ('PENDING','CALLBACK') AND attempts < 3) AS leads_remaining
FROM public.bland_daily_stats s
WHERE s.date = CURRENT_DATE;

SELECT 'bland_calls v3 migration completed ✓' AS result;
