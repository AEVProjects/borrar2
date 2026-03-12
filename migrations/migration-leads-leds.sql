-- ============================================================
-- Migration: Create apollo_leads_leds table (Workshop LED batch)
-- Separate table for LED stage leads, independent of production & test
-- Run this in Supabase SQL Editor, then run: node scripts/migrate-to-leds-table.js
-- ============================================================

CREATE TABLE IF NOT EXISTS public.apollo_leads_leds (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name text,
  last_name text,
  title text,
  company_name text,
  company_name_for_emails text,
  email text,
  email_status text,
  primary_email_source text,
  primary_email_verification_source text,
  email_confidence text,
  primary_email_catch_all_status text,
  primary_email_last_verified_at text,
  seniority text,
  departments text,
  contact_owner text,
  work_direct_phone text,
  home_phone text,
  mobile_phone text,
  corporate_phone text,
  other_phone text,
  stage text,
  lists text,
  last_contacted text,
  account_owner text,
  num_employees text,
  industry text,
  keywords text,
  person_linkedin_url text,
  website text,
  company_linkedin_url text,
  facebook_url text,
  twitter_url text,
  city text,
  state text,
  country text,
  company_address text,
  company_city text,
  company_state text,
  company_country text,
  company_phone text,
  technologies text,
  annual_revenue text,
  total_funding text,
  latest_funding text,
  latest_funding_amount text,
  last_raised_at text,
  subsidiary_of text,
  email_sent text,
  email_open text,
  email_bounced text,
  replied text,
  demoed text,
  number_of_retail_locations text,
  apollo_contact_id text,
  apollo_account_id text,
  secondary_email text,
  secondary_email_source text,
  secondary_email_status text,
  secondary_email_verification_source text,
  tertiary_email text,
  tertiary_email_source text,
  tertiary_email_status text,
  tertiary_email_verification_source text,
  primary_intent_topic text,
  primary_intent_score text,
  secondary_intent_topic text,
  secondary_intent_score text,
  qualify_contact text,
  -- Batch tracking
  batch_id bigint,
  batch_name text,
  -- AI-generated personalized messages
  personalized_message text,
  personalized_subject1 text,
  personalized_followup text,
  personalized_subject2 text,
  personalized_email3 text,
  personalized_subject3 text,
  ai_message_status text DEFAULT 'pending'
    CHECK (ai_message_status IN ('pending', 'generating', 'generated', 'error')),
  ai_message_generated_at timestamp with time zone,
  -- Apollo sequence tracking
  apollo_sequence_status text,
  email_outreach_status text,
  company_description text,
  company_sector text,
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_apollo_leads_leds_email ON public.apollo_leads_leds(email);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_leds_company ON public.apollo_leads_leds(company_name);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_leds_batch ON public.apollo_leads_leds(batch_name);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_leds_ai_status ON public.apollo_leads_leds(ai_message_status);

-- RLS
ALTER TABLE public.apollo_leads_leds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to apollo_leads_leds" ON public.apollo_leads_leds FOR ALL USING (true) WITH CHECK (true);
