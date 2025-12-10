-- Add source_files column to validations table for storing PDF file metadata
ALTER TABLE public.validations 
ADD COLUMN IF NOT EXISTS source_files jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.validations.source_files IS 'Stores metadata for uploaded PDF files: [{original_name, storage_path, storage_url, size_bytes, uploaded_at}]';

-- Create RLS policy for Bronnen bucket to allow users to upload/view their own files
CREATE POLICY "Users can upload to own folder in Bronnen"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Bronnen' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own files in Bronnen"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'Bronnen' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own files in Bronnen"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Bronnen' AND
  (storage.foldername(name))[1] = auth.uid()::text
);