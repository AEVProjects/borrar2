-- ============================================================
-- Migration: Lead Batches + AI Personalized Messages
-- Adds batch tracking and AI message columns to apollo_leads
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
CREATE POLICY "Allow all access to lead_batches" ON public.lead_batches FOR ALL USING (true) WITH CHECK (true);

-- 2. Add batch + AI message columns to apollo_leads
DO $$
BEGIN
    -- Batch tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='batch_id') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN batch_id bigint REFERENCES public.lead_batches(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='batch_name') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN batch_name text;
    END IF;

    -- AI-generated personalized messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='personalized_message') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN personalized_message text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='personalized_followup') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN personalized_followup text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='ai_message_status') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN ai_message_status text DEFAULT 'pending'
            CHECK (ai_message_status IN ('pending', 'generating', 'generated', 'error'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='ai_message_generated_at') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN ai_message_generated_at timestamp with time zone;
    END IF;

    -- Also add to test table if it exists
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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='ai_message_status') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN ai_message_status text DEFAULT 'pending';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads_test' AND column_name='ai_message_generated_at') THEN
            ALTER TABLE public.apollo_leads_test ADD COLUMN ai_message_generated_at timestamp with time zone;
        END IF;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_apollo_leads_batch_id ON public.apollo_leads(batch_id);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_batch_name ON public.apollo_leads(batch_name);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_ai_message_status ON public.apollo_leads(ai_message_status);
