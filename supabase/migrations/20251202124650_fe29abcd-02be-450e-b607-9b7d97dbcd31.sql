-- Validations tabel voor opslaan van resultaten
CREATE TABLE public.validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  certification TEXT NOT NULL,
  product_type JSONB NOT NULL,
  file_names TEXT[] DEFAULT '{}',
  result JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own validations" 
ON public.validations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own validations" 
ON public.validations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own validations" 
ON public.validations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own validations" 
ON public.validations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Index voor snellere queries
CREATE INDEX idx_validations_user_id ON public.validations(user_id);
CREATE INDEX idx_validations_created_at ON public.validations(created_at DESC);