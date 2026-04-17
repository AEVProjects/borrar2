-- ============================================================
-- MSI Cold Calling (Bland.ai) — Supabase Tables
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. LEADS TABLE (replaces Google Sheets "Leads" tab)
CREATE TABLE IF NOT EXISTS public.bland_leads (
    id                  serial PRIMARY KEY,
    lead_name           text NOT NULL,
    phone               text NOT NULL,
    company             text,
    title               text,
    email               text,
    industry            text,
    lead_type           text DEFAULT 'STAFFING',   -- STAFFING | AI_SOLUTIONS | CLOUD | CYBERSECURITY
    intent_topic        text,
    status              text DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','IN_PROGRESS','CONTACTED','SCHEDULED','NOT_INTERESTED','FOLLOW_UP','NO_ANSWER')),
    attempts            integer DEFAULT 0,
    last_call_date      date,
    last_call_time      text,
    call_result         text,  -- answered | voicemail | no_answer | busy
    interest_level      text,  -- high | medium | low | none
    pain_points         text,
    next_step           text,  -- meeting_scheduled | send_email | callback | not_interested
    notes               text,
    calendly_link       text,
    created_at          timestamptz DEFAULT NOW(),
    updated_at          timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bland_leads_status       ON public.bland_leads(status);
CREATE INDEX IF NOT EXISTS idx_bland_leads_phone        ON public.bland_leads(phone);
CREATE INDEX IF NOT EXISTS idx_bland_leads_last_call    ON public.bland_leads(last_call_date);

ALTER TABLE public.bland_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on bland_leads" ON public.bland_leads FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------

-- 2. CALL LOGS TABLE (replaces Google Sheets "Call_Log" tab)
CREATE TABLE IF NOT EXISTS public.bland_call_logs (
    id                  serial PRIMARY KEY,
    call_id             text,                        -- Bland.ai call_id
    lead_id             integer REFERENCES public.bland_leads(id) ON DELETE SET NULL,
    lead_name           text,
    phone               text,
    call_date           date,
    call_time           text,
    duration_seconds    integer DEFAULT 0,
    call_result         text,    -- answered | voicemail | no_answer | busy
    interest_level      text,
    next_step           text,
    transcript          text,
    recording_url       text,
    summary             text,
    created_at          timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bland_call_logs_lead_id    ON public.bland_call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_bland_call_logs_call_date  ON public.bland_call_logs(call_date DESC);
CREATE INDEX IF NOT EXISTS idx_bland_call_logs_call_id    ON public.bland_call_logs(call_id);

ALTER TABLE public.bland_call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on bland_call_logs" ON public.bland_call_logs FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------

-- 3. DAILY STATS TABLE (replaces Google Sheets "Daily_Stats" tab)
CREATE TABLE IF NOT EXISTS public.bland_daily_stats (
    id                  serial PRIMARY KEY,
    date                date UNIQUE NOT NULL,
    total_calls         integer DEFAULT 0,
    answered            integer DEFAULT 0,
    voicemail           integer DEFAULT 0,
    no_answer           integer DEFAULT 0,
    meetings_scheduled  integer DEFAULT 0,
    interested          integer DEFAULT 0,
    not_interested      integer DEFAULT 0,
    created_at          timestamptz DEFAULT NOW(),
    updated_at          timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bland_daily_stats_date ON public.bland_daily_stats(date DESC);

ALTER TABLE public.bland_daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on bland_daily_stats" ON public.bland_daily_stats FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------
-- Sample lead for testing (optional — remove before production)
-- INSERT INTO public.bland_leads (lead_name, phone, company, title, email, industry, lead_type)
-- VALUES ('John Smith', '+15551234567', 'Acme Corp', 'CTO', 'jsmith@acme.com', 'Technology', 'STAFFING');
-- ----------------------------------------------------------------

SELECT 'bland_calls migration completed ✓' AS result;
