import { useState } from "react";
import { PDFUploadZone } from "@/components/PDFUploadZone";
import { uploadPDFToWebhook, ValidationResponse } from "@/lib/webhookClient";
import { toast } from "sonner";

const Index = () => {
  // Genereer unieke session ID bij component mount (nieuwe ID bij elke refresh)
  const [sessionId] = useState(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    toast.info(`${files.length} bestand${files.length > 1 ? 'en' : ''} uploaden...`);
    
    try {
      const response = await uploadPDFToWebhook(files, sessionId);
      setValidationData(response);
      setUploadedFiles(files.map(f => f.name));
      toast.success("Upload gelukt!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload mislukt");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
        <PDFUploadZone onUpload={handleUpload} isUploading={isUploading} />
        
        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: '1rem', fontSize: '14px', color: '#666' }}>
            <p style={{ marginBottom: '0.5rem' }}>Geüpload:</p>
            {uploadedFiles.map((filename, idx) => (
              <div key={idx} style={{ padding: '0.25rem 0' }}>✓ {filename}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
