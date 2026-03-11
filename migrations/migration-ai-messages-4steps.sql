-- ============================================================
-- Migration: Expand AI messages from 2 to 3 steps
-- Adds email3 column + subject lines for all 3
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
BEGIN
    -- Email 3 (Day 8 - Soft Close + Value Add)
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

    -- Also update test table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='apollo_leads_test') THEN
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
    END IF;
END $$;
