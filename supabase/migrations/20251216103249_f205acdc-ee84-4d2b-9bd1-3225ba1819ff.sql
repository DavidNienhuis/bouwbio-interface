-- Storage policies for Knowledge Bank uploads

-- Allow authenticated users to upload to the knowledge_bank folder
CREATE POLICY "Users can upload to knowledge_bank folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Bronnen' 
  AND (storage.foldername(name))[1] = 'knowledge_bank'
);

-- Allow all authenticated users to read files from the knowledge_bank folder
CREATE POLICY "Users can view knowledge_bank files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'Bronnen' 
  AND (storage.foldername(name))[1] = 'knowledge_bank'
);