-- ============================================================
-- Migration: Email Outreach + Apollo Sequence Columns
-- Adds email qualification and Apollo sequence tracking to apollo_leads
-- Run this in Supabase SQL Editor AFTER the base migrations
-- ============================================================

DO $$
BEGIN
    -- Email outreach status tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='email_outreach_status') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN email_outreach_status text DEFAULT 'pending'
            CHECK (email_outreach_status IN ('pending', 'no_email', 'sending', 'sent', 'opened', 'replied', 'bounced', 'sequence_active', 'sequence_completed', 'converted'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='email_attempts') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN email_attempts integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='email_outreach_date') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN email_outreach_date timestamp with time zone;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='email_subject') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN email_subject text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='email_body_sent') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN email_body_sent text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='email_personalization_notes') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN email_personalization_notes text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='email_suggested_service') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN email_suggested_service text;
    END IF;

    -- Apollo sequence tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='apollo_sequence_id') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN apollo_sequence_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='apollo_sequence_status') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN apollo_sequence_status text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='apollo_sequence_added_at') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN apollo_sequence_added_at timestamp with time zone;
    END IF;

END $$;

-- Indexes for email outreach queries
CREATE INDEX IF NOT EXISTS idx_apollo_leads_email_outreach_status ON public.apollo_leads(email_outreach_status);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_email_outreach_date ON public.apollo_leads(email_outreach_date DESC);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_apollo_sequence_status ON public.apollo_leads(apollo_sequence_status);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_email_suggested_service ON public.apollo_leads(email_suggested_service);
