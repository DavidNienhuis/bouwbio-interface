const WEBHOOK_URL = 'https://n8n-zztf.onrender.com/webhook/2ac96ace-b5fc-4633-91d9-368f5f0d3023';
const SEND_WEBHOOK_URL = 'https://n8n-zztf.onrender.com/webhook/f4baeea1-2ab9-4141-bfdf-791b6b5877b7';

export interface ValidationResponse {
  criteria: Array<{
    criterium: string;
    status: string;
    evidence: string;
    norm: string;
    waarde: string | null;
  }>;
}

// Helper functie om criteria uit verschillende response formaten te halen
const extractCriteria = (data: any): ValidationResponse => {
  let workingData = data;
  
  // Als het een array is, pak het eerste element
  if (Array.isArray(workingData)) {
    console.log('Response is array, taking first element');
    workingData = workingData[0];
  }
  
  // Als er een "output" key is, pak die
  if (workingData?.output) {
    console.log('Found "output" key, extracting');
    workingData = workingData.output;
  }
  
  // Check of er een criteria array is
  if (workingData?.criteria && Array.isArray(workingData.criteria)) {
    console.log('Found criteria array with', workingData.criteria.length, 'items');
    return { criteria: workingData.criteria };
  }
  
  // Als we hier komen, is het formaat onbekend
  console.error('Could not extract criteria from response:', data);
  throw new Error('Invalid response format: no criteria array found');
};

export const uploadPDFToWebhook = async (files: File[], sessionId: string): Promise<ValidationResponse> => {
  const formData = new FormData();
  
  // Voeg session ID toe als tekst veld
  formData.append('sessionId', sessionId);
  
  // Use 'file' as field name for each file (n8n webhook expects this)
  files.forEach((file) => {
    formData.append('file', file);
    console.log('Appending file:', file.name, 'Size:', file.size, 'Type:', file.type);
  });
  
  console.log('Session ID:', sessionId);
  console.log('Sending request to:', WEBHOOK_URL);
  console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
    key,
    valueType: value instanceof File ? 'File' : typeof value,
    fileName: value instanceof File ? value.name : undefined,
    fileSize: value instanceof File ? value.size : undefined,
    value: typeof value === 'string' ? value : undefined
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

export const sendValidationRequest = async (sessionId: string): Promise<ValidationResponse> => {
  console.log('Sending validation request with session ID:', sessionId);
  console.log('Sending request to:', SEND_WEBHOOK_URL);
  
  const response = await fetch(SEND_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });
  
  console.log('Send response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Send failed:', errorText);
    throw new Error(`Send failed: ${response.statusText}`);
  }
  
  const rawResult = await response.json();
  console.log('Raw validation response:', rawResult);
  
  // Gebruik de helper functie om criteria te extraheren
  const result = extractCriteria(rawResult);
  console.log('Extracted criteria:', result);
  
  return result;
};
