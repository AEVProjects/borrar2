-- Email Outreach Log Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.email_outreach_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_id bigint REFERENCES public.apollo_leads(id),
  to_email text NOT NULL,
  to_name text,
  company text,
  service text,
  subject text,
  body text,
  status text DEFAULT 'sent',
  sent_at timestamp with time zone DEFAULT now(),
  opened_at timestamp with time zone,
  replied_at timestamp with time zone
);

CREATE INDEX idx_email_outreach_lead ON public.email_outreach_log(lead_id);
CREATE INDEX idx_email_outreach_status ON public.email_outreach_log(status);
CREATE INDEX idx_email_outreach_sent ON public.email_outreach_log(sent_at DESC);

ALTER TABLE public.email_outreach_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to email_outreach_log" ON public.email_outreach_log FOR ALL USING (true) WITH CHECK (true);
