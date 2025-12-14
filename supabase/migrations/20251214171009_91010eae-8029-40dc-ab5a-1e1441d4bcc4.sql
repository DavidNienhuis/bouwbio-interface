-- Fix 1: Enable RLS on documents table and add policies
-- The documents table stores RAG embeddings - we'll restrict to authenticated users only
-- since there's no user_id column and session_id is in metadata (complex to extract)

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all documents (shared knowledge base pattern)
CREATE POLICY "Authenticated users can read documents" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to insert documents
CREATE POLICY "Authenticated users can insert documents" 
ON public.documents 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Fix 2: Update update_knowledge_bank function to require valid user authentication
-- Add check that caller has authenticated and has performed validations
CREATE OR REPLACE FUNCTION public.update_knowledge_bank(
  p_ean_code text, 
  p_product_name text, 
  p_certification text, 
  p_product_type jsonb, 
  p_result jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_advies_niveau TEXT;
  v_advies_kleur TEXT;
  v_advies_label TEXT;
  v_emissie_score INTEGER;
  v_toxicologie_score INTEGER;
  v_certificaten_score INTEGER;
  v_emissie_status TEXT;
  v_tox_status TEXT;
  v_cert_status TEXT;
  v_caller_id UUID;
BEGIN
  -- Authorization check: ensure caller is authenticated
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: authentication required';
  END IF;

  -- Verify caller has performed at least one validation (prevents arbitrary data injection)
  IF NOT EXISTS (
    SELECT 1 FROM public.validations 
    WHERE user_id = v_caller_id
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Unauthorized: must have validation history';
  END IF;

  -- Extract advies values from result JSONB
  v_advies_niveau := p_result->'advies'->>'niveau';
  v_advies_kleur := p_result->'advies'->>'kleur';
  v_advies_label := p_result->'advies'->>'label';
  
  -- Extract status strings
  v_emissie_status := LOWER(COALESCE(p_result->'scores'->'emissies'->>'status', ''));
  v_tox_status := LOWER(COALESCE(p_result->'scores'->'toxicologie'->>'tox_status', ''));
  v_cert_status := LOWER(COALESCE(p_result->'scores'->'certificaten'->>'status', ''));
  
  -- Derive emissie_score from status (0-100)
  v_emissie_score := CASE 
    WHEN v_emissie_status IN ('voldoet', 'ok', 'conform') THEN 100
    WHEN v_emissie_status IN ('risico', 'warning', 'waarschuwing') THEN 50
    WHEN v_emissie_status IN ('voldoet_niet', 'niet_conform', 'fail') THEN 0
    WHEN v_emissie_status IN ('missende_informatie', 'onbekend', 'unknown') THEN 25
    ELSE NULL
  END;
  
  -- Derive toxicologie_score from tox_status (0-100)
  v_toxicologie_score := CASE 
    WHEN v_tox_status IN ('clean', 'ok', 'veilig') THEN 100
    WHEN v_tox_status IN ('watch', 'waarschuwing') THEN 50
    WHEN v_tox_status IN ('priority', 'prioriteit') THEN 25
    WHEN v_tox_status IN ('banned', 'verboden', 'redlist') THEN 0
    WHEN v_tox_status IN ('onbekend', 'unknown') THEN 50
    ELSE NULL
  END;
  
  -- Derive certificaten_score from status (0-100)
  v_certificaten_score := CASE 
    WHEN v_cert_status IN ('erkend', 'conform', 'valid', 'geldig') THEN 100
    WHEN v_cert_status IN ('niet_erkend', 'niet_conform', 'invalid', 'ongeldig') THEN 0
    WHEN v_cert_status IN ('geen_certificaten', 'geen', 'none') THEN 25
    WHEN v_cert_status IN ('onvoldoende_data', 'onbekend', 'unknown') THEN 25
    ELSE NULL
  END;

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
    product_type = COALESCE(EXCLUDED.product_type, knowledge_bank.product_type),
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
$function$;