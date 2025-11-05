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
  
  files.forEach((file, index) => {
    formData.append(`pdf_${index}`, file);
  });
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  
  return await response.json();
};
