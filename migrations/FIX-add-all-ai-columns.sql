-- ============================================================
-- FIX: Add ALL missing AI message columns to apollo_leads
-- Combines migration-lead-batches.sql + migration-ai-messages-4steps.sql
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Batches tracking table
CREATE TABLE IF NOT EXISTS public.lead_batches (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_name text NOT NULL,
  description text,
  lead_count integer DEFAULT 0,
  messages_generated integer DEFAULT 0,
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'generating', 'ready', 'exported', 'archived')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_batches_status ON public.lead_batches(status);
CREATE INDEX IF NOT EXISTS idx_lead_batches_created ON public.lead_batches(created_at DESC);

ALTER TABLE public.lead_batches ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_batches' AND policyname = 'Allow all access to lead_batches') THEN
    CREATE POLICY "Allow all access to lead_batches" ON public.lead_batches FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 2. Add ALL missing columns to apollo_leads
DO $$
BEGIN
    -- Batch tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='batch_id') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN batch_id bigint;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='batch_name') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN batch_name text;
    END IF;

    -- AI Email 1 (Introduction - Day 1)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='personalized_message') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN personalized_message text;
    END IF;

    -- AI Email 2 (Case Study - Day 4)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='personalized_followup') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN personalized_followup text;
    END IF;

    -- AI Email 3 (Soft Close - Day 8)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='personalized_email3') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN personalized_email3 text;
    END IF;

    -- Subject lines for all 3 emails
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='personalized_subject1') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN personalized_subject1 text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='personalized_subject2') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN personalized_subject2 text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='personalized_subject3') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN personalized_subject3 text;
    END IF;

    -- AI generation status + timestamp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='ai_message_status') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN ai_message_status text DEFAULT 'pending'
            CHECK (ai_message_status IN ('pending', 'generating', 'generated', 'error'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='ai_message_generated_at') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN ai_message_generated_at timestamp with time zone;
    END IF;
END $$;

-- 3. Same columns for apollo_leads_test
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='apollo_leads_test') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='batch_id') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN batch_id bigint;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='batch_name') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN batch_name text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='personalized_message') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN personalized_message text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='personalized_followup') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN personalized_followup text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='personalized_email3') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN personalized_email3 text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='personalized_subject1') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN personalized_subject1 text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='personalized_subject2') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN personalized_subject2 text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='personalized_subject3') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN personalized_subject3 text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='ai_message_status') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN ai_message_status text DEFAULT 'pending';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='ai_message_generated_at') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN ai_message_generated_at timestamp with time zone;
        END IF;
    END IF;
END $$;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_apollo_leads_batch_id ON public.apollo_leads(batch_id);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_batch_name ON public.apollo_leads(batch_name);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_ai_message_status ON public.apollo_leads(ai_message_status);
