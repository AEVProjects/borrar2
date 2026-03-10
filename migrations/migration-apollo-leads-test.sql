-- ============================================================
-- Apollo Leads TEST Table  
-- Tabla de prueba con 3 registros para validar el flujo
-- Solo contiene el correo artki_64@hotmail.com
-- Run this in Supabase SQL Editor
-- ============================================================

DROP TABLE IF EXISTS public.apollo_leads_test;

CREATE TABLE public.apollo_leads_test (
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
  created_at timestamp with time zone DEFAULT now(),
  -- Columnas de outbound qualifier (migration-outbound-qualifier.sql)
  call_intention text,
  call_budget text,
  call_urgency text,
  call_motivation text,
  call_status text DEFAULT 'pending',
  call_service_interest text,
  call_right_person boolean,
  call_past_experience text,
  call_summary text,
  call_transcript text,
  call_date timestamp with time zone,
  vapi_call_id text,
  call_ended_reason text,
  call_duration_seconds integer,
  call_attempts integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  -- Columnas de email sequence (migration-email-sequence.sql)
  email_outreach_status text DEFAULT 'pending',
  email_attempts integer DEFAULT 0,
  email_outreach_date timestamp with time zone,
  email_subject text,
  email_body_sent text,
  email_personalization_notes text,
  email_suggested_service text,
  apollo_sequence_id text,
  apollo_sequence_status text,
  apollo_sequence_added_at timestamp with time zone,
  company_description text
);

-- Indexes
CREATE INDEX idx_apollo_leads_test_email ON public.apollo_leads_test(email);
CREATE INDEX idx_apollo_leads_test_industry ON public.apollo_leads_test(industry);
CREATE INDEX idx_apollo_leads_test_call_status ON public.apollo_leads_test(call_status);
CREATE INDEX idx_apollo_leads_test_email_outreach ON public.apollo_leads_test(email_outreach_status);

-- RLS
ALTER TABLE public.apollo_leads_test ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to apollo_leads_test" ON public.apollo_leads_test FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- INSERT 3 registros de prueba con datos reales de distintas industrias
-- Todos con email: artki_64@hotmail.com
-- ============================================================

INSERT INTO public.apollo_leads_test (
  first_name, last_name, title, company_name, company_name_for_emails,
  email, email_status, seniority, departments, contact_owner,
  corporate_phone, stage, account_owner, num_employees, industry,
  keywords, website, company_linkedin_url, city, state, country,
  company_city, company_state, company_country, technologies
) VALUES
-- Registro 1: CONSTRUCTION → Sector: Real Estate/Construction
(
  'Arturo', 'Kinetik', 'Sr. Director of IT Operations, CISO',
  'Swinerton', 'Swinerton',
  'artki_64@hotmail.com', 'Verified', 'Director', 'C-Suite, Information Technology, Operations',
  'david.osorio@msiamericas.com',
  '+1 415-421-2980', 'Cold', 'david.osorio@msiamericas.com',
  '4400', 'construction',
  'leed, designbuild, bim, general contractor, tenant improvements, renewable energy, commercial construction',
  'https://swinerton.com', 'http://www.linkedin.com/company/swinerton',
  'Roseville', 'California', 'United States',
  'Concord', 'California', 'United States',
  'Microsoft Office 365, Workday, Slack, Procore, Salesforce CRM Analytics'
),
-- Registro 2: HEALTHCARE → Sector: Healthcare
(
  'Arturo', 'Kinetik', 'Chief Information Officer',
  'HCA Healthcare', 'HCA Healthcare',
  'artki_64@hotmail.com', 'Verified', 'VP', 'C-Suite, Information Technology',
  'david.osorio@msiamericas.com',
  '+1 615-344-9551', 'Cold', 'david.osorio@msiamericas.com',
  '275000', 'healthcare',
  'hospital, health care, medical devices, patient care, clinical systems, electronic health records, telemedicine',
  'https://hcahealthcare.com', 'http://www.linkedin.com/company/hca-healthcare',
  'Nashville', 'Tennessee', 'United States',
  'Nashville', 'Tennessee', 'United States',
  'Microsoft Office 365, Epic Systems, Cerner, Salesforce, AWS, Tableau, ServiceNow'
),
-- Registro 3: TECHNOLOGY/SOFTWARE → Sector: Technology
(
  'Arturo', 'Kinetik', 'VP of Engineering',
  'Northrop Grumman', 'Northrop Grumman',
  'artki_64@hotmail.com', 'Verified', 'Director', 'C-Suite, Information Technology',
  'david.osorio@msiamericas.com',
  '+1 703-280-2900', 'Cold', 'david.osorio@msiamericas.com',
  '97000', 'information technology',
  'software engineering, cybersecurity, artificial intelligence, machine learning, cloud computing, data analytics, digital transformation',
  'https://northropgrumman.com', 'http://www.linkedin.com/company/northrop-grumman-corporation',
  'Chantilly', 'Virginia', 'United States',
  'Falls Church', 'Virginia', 'United States',
  'Microsoft Office 365, AWS, Azure, Kubernetes, Docker, Python, TensorFlow, Salesforce'
);

-- ============================================================
-- Vista rápida: qué sector le toca a cada registro
-- ============================================================
-- Para verificar la clasificación, ejecuta:
-- SELECT id, first_name, last_name, email, company_name, industry,
--   CASE
--     WHEN industry ILIKE '%construction%' OR industry ILIKE '%real estate%' OR industry ILIKE '%property%' THEN 'REAL_ESTATE / CONSTRUCTION'
--     WHEN industry ILIKE '%healthcare%' OR industry ILIKE '%medical%' OR industry ILIKE '%pharma%' OR industry ILIKE '%hospital%' THEN 'HEALTHCARE'
--     WHEN industry ILIKE '%technology%' OR industry ILIKE '%software%' OR industry ILIKE '%saas%' OR industry ILIKE '%information technology%' THEN 'TECHNOLOGY'
--     WHEN industry ILIKE '%financial%' OR industry ILIKE '%banking%' OR industry ILIKE '%insurance%' THEN 'FINANCIAL'
--     WHEN industry ILIKE '%retail%' OR industry ILIKE '%ecommerce%' THEN 'RETAIL'
--     WHEN industry ILIKE '%manufacturing%' OR industry ILIKE '%industrial%' THEN 'MANUFACTURING'
--     WHEN industry ILIKE '%energy%' OR industry ILIKE '%utilities%' THEN 'ENERGY'
--     WHEN industry ILIKE '%education%' OR industry ILIKE '%university%' THEN 'EDUCATION'
--     WHEN industry ILIKE '%legal%' OR industry ILIKE '%law%' THEN 'LEGAL'
--     WHEN industry ILIKE '%logistics%' OR industry ILIKE '%transportation%' THEN 'LOGISTICS'
--     WHEN industry ILIKE '%telecom%' THEN 'TELECOM'
--     ELSE 'GENERAL'
--   END AS sector_clasificado
-- FROM apollo_leads_test;
