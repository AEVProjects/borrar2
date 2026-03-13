-- Apollo Leads Table
-- Run this in Supabase SQL Editor FIRST, then run: node upload-apollo-leads.js

DROP TABLE IF EXISTS public.apollo_leads_fintech;

CREATE TABLE public.apollo_leads_fintech (
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
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_apollo_leads_fintech_email ON public.apollo_leads_fintech(email);
CREATE INDEX idx_apollo_leads_fintech_company ON public.apollo_leads_fintech(company_name);
CREATE INDEX idx_apollo_leads_fintech_industry ON public.apollo_leads_fintech(industry);
CREATE INDEX idx_apollo_leads_fintech_stage ON public.apollo_leads_fintech(stage);

-- Allow public access (adjust RLS as needed)
ALTER TABLE public.apollo_leads_fintech ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to apollo_leads_fintech" ON public.apollo_leads_fintech FOR ALL USING (true) WITH CHECK (true);
