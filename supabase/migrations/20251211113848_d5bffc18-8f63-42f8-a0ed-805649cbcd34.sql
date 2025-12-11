-- Create knowledge_bank table for shared validation data
CREATE TABLE public.knowledge_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ean_code TEXT NOT NULL,
  product_name TEXT,
  certification TEXT NOT NULL,
  product_type JSONB,
  
  -- Aggregation statistics
  validation_count INTEGER DEFAULT 1,
  last_validated_at TIMESTAMPTZ DEFAULT NOW(),
  first_validated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Extracted results
  advies_niveau TEXT,
  advies_kleur TEXT,
  advies_label TEXT,
  
  -- Scores (0-100)
  emissie_score INTEGER,
  toxicologie_score INTEGER,
  certificaten_score INTEGER,
  overall_score INTEGER,
  
  -- Full result snapshot (most recent)
  latest_result JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique combination of EAN + certification
  UNIQUE(ean_code, certification)
);

-- Enable RLS
ALTER TABLE public.knowledge_bank ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read knowledge bank
CREATE POLICY "Authenticated users can read knowledge bank"
ON public.knowledge_bank
FOR SELECT
TO authenticated
USING (true);

-- Create function to update knowledge bank (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.update_knowledge_bank(
  p_ean_code TEXT,
  p_product_name TEXT,
  p_certification TEXT,
  p_product_type JSONB,
  p_result JSONB
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_advies_niveau TEXT;
  v_advies_kleur TEXT;
  v_advies_label TEXT;
  v_emissie_score INTEGER;
  v_toxicologie_score INTEGER;
  v_certificaten_score INTEGER;
BEGIN
  -- Extract values from result JSONB
  v_advies_niveau := p_result->'advies'->>'niveau';
  v_advies_kleur := p_result->'advies'->>'kleur';
  v_advies_label := p_result->'advies'->>'label';
  v_emissie_score := (p_result->'scores'->>'emissies')::integer;
  v_toxicologie_score := (p_result->'scores'->>'toxicologie')::integer;
  v_certificaten_score := (p_result->'scores'->>'certificaten')::integer;

  INSERT INTO public.knowledge_bank (
    ean_code, product_name, certification, product_type,
    advies_niveau, advies_kleur, advies_label,
    emissie_score, toxicologie_score, certificaten_score,
    latest_result, validation_count
  )
  VALUES (
    p_ean_code,
    p_product_name,
    p_certification,
    p_product_type,
    v_advies_niveau,
    v_advies_kleur,
    v_advies_label,
    v_emissie_score,
    v_toxicologie_score,
    v_certificaten_score,
    p_result,
    1
  )
  ON CONFLICT (ean_code, certification) DO UPDATE
  SET
    product_name = COALESCE(EXCLUDED.product_name, knowledge_bank.product_name),
    latest_result = EXCLUDED.latest_result,
    validation_count = knowledge_bank.validation_count + 1,
    last_validated_at = NOW(),
    updated_at = NOW(),
    advies_niveau = COALESCE(EXCLUDED.advies_niveau, knowledge_bank.advies_niveau),
    advies_kleur = COALESCE(EXCLUDED.advies_kleur, knowledge_bank.advies_kleur),
    advies_label = COALESCE(EXCLUDED.advies_label, knowledge_bank.advies_label),
    emissie_score = COALESCE(EXCLUDED.emissie_score, knowledge_bank.emissie_score),
    toxicologie_score = COALESCE(EXCLUDED.toxicologie_score, knowledge_bank.toxicologie_score),
    certificaten_score = COALESCE(EXCLUDED.certificaten_score, knowledge_bank.certificaten_score);
END;
$$;

-- Create index for faster EAN lookups
CREATE INDEX idx_knowledge_bank_ean ON public.knowledge_bank(ean_code);
CREATE INDEX idx_knowledge_bank_ean_cert ON public.knowledge_bank(ean_code, certification);