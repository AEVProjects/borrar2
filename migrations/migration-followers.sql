-- ============================================================
-- Migration: LinkedIn Followers Table
-- Stores formatted follower data scraped from LinkedIn
-- ============================================================

-- Create the followers table
CREATE TABLE IF NOT EXISTS public.followers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Follower data
  nombre text NOT NULL,
  grado_conexion text,                -- '1er', '2º', '3er', 'Tú', or NULL
  titular text DEFAULT '',             -- Professional headline / title
  fecha_seguimiento text NOT NULL,     -- Month/year when they started following (e.g. 'febrero de 2026')
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT followers_pkey PRIMARY KEY (id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_followers_nombre ON public.followers(nombre);
CREATE INDEX IF NOT EXISTS idx_followers_grado ON public.followers(grado_conexion);
CREATE INDEX IF NOT EXISTS idx_followers_fecha ON public.followers(fecha_seguimiento);
CREATE INDEX IF NOT EXISTS idx_followers_created ON public.followers(created_at DESC);

-- Comments
COMMENT ON TABLE public.followers IS 'LinkedIn followers data imported from seguidores_formateados.json';
COMMENT ON COLUMN public.followers.nombre IS 'Full name of the follower';
COMMENT ON COLUMN public.followers.grado_conexion IS 'Connection degree: 1er, 2º, 3er, Tú, or null';
COMMENT ON COLUMN public.followers.titular IS 'Professional headline or job title';
COMMENT ON COLUMN public.followers.fecha_seguimiento IS 'Month and year when they started following';
