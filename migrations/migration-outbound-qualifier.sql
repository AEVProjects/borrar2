-- ============================================================
-- Migration: Outbound Lead Qualifier Columns
-- Adds call qualification fields to apollo_leads table
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
BEGIN
    -- Call qualification results from VAPI
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_intention') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_intention text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_budget') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_budget text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_urgency') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_urgency text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_motivation') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_motivation text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_status') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_status text DEFAULT 'pending'
            CHECK (call_status IN ('pending', 'calling', 'completed', 'voicemail', 'no_answer', 'incorrect_phone', 'callback', 'failed'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_service_interest') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_service_interest text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_right_person') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_right_person boolean;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_past_experience') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_past_experience text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_summary') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_summary text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_transcript') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_transcript text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_date') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_date timestamp with time zone;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='vapi_call_id') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN vapi_call_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_ended_reason') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_ended_reason text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_duration_seconds') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_duration_seconds integer;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='call_attempts') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN call_attempts integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='apollo_leads' AND column_name='updated_at') THEN
        ALTER TABLE public.apollo_leads ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Indexes for call qualification queries
CREATE INDEX IF NOT EXISTS idx_apollo_leads_call_status ON public.apollo_leads(call_status);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_call_date ON public.apollo_leads(call_date DESC);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_call_intention ON public.apollo_leads(call_intention);
CREATE INDEX IF NOT EXISTS idx_apollo_leads_call_service_interest ON public.apollo_leads(call_service_interest);

-- Comments
COMMENT ON COLUMN public.apollo_leads.call_intention IS 'Intención de compra detectada por VAPI (high/medium/low/none)';
COMMENT ON COLUMN public.apollo_leads.call_budget IS 'Presupuesto mencionado o rango estimado';
COMMENT ON COLUMN public.apollo_leads.call_urgency IS 'Nivel de urgencia (immediate/short-term/long-term/none)';
COMMENT ON COLUMN public.apollo_leads.call_motivation IS 'Motivación principal del lead para buscar el servicio';
COMMENT ON COLUMN public.apollo_leads.call_status IS 'Estado de la llamada: pending, calling, completed, voicemail, no_answer, incorrect_phone, callback, failed';
COMMENT ON COLUMN public.apollo_leads.call_service_interest IS 'Servicio específico de MSI en el que mostró interés';
COMMENT ON COLUMN public.apollo_leads.call_right_person IS 'Si contestó la persona indicada (decision maker)';
COMMENT ON COLUMN public.apollo_leads.call_past_experience IS 'Experiencia previa con servicios similares';
COMMENT ON COLUMN public.apollo_leads.call_summary IS 'Resumen generado por IA de la conversación';
COMMENT ON COLUMN public.apollo_leads.call_transcript IS 'Transcripción completa de la llamada';
COMMENT ON COLUMN public.apollo_leads.vapi_call_id IS 'ID de la llamada en VAPI para referencia';
COMMENT ON COLUMN public.apollo_leads.call_ended_reason IS 'Razón por la que terminó la llamada (VAPI endedReason)';
COMMENT ON COLUMN public.apollo_leads.call_duration_seconds IS 'Duración total de la llamada en segundos';
COMMENT ON COLUMN public.apollo_leads.call_attempts IS 'Número de intentos de llamada realizados';
