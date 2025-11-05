const WEBHOOK_URL = 'https://n8n-zztf.onrender.com/webhook/2ac96ace-b5fc-4633-91d9-368f5f0d3023';

export interface ValidationResponse {
  results: Array<{
    claim: string;
    evidence: string;
    conclusion: string;
    status: 'success' | 'warning' | 'error';
  }>;
  missing: string[];
  metadata: {
    filename: string;
    processed_at: string;
  };
}

export const uploadPDFToWebhook = async (files: File[]): Promise<ValidationResponse> => {
  const formData = new FormData();
  
  // Use 'file' as field name for each file (n8n webhook expects this)
  files.forEach((file) => {
    formData.append('file', file);
    console.log('Appending file:', file.name, 'Size:', file.size, 'Type:', file.type);
  });
  
  console.log('Sending request to:', WEBHOOK_URL);
  console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
    key,
    valueType: value instanceof File ? 'File' : typeof value,
    fileName: value instanceof File ? value.name : undefined,
    fileSize: value instanceof File ? value.size : undefined
  })));
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it automatically with boundary
  });
  
  console.log('Response status:', response.status, response.statusText);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload failed:', errorText);
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('Upload successful, response:', result);
  
  return result;
};
