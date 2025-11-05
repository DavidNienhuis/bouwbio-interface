import { useState } from "react";
import { PDFUploadZone } from "@/components/PDFUploadZone";
import { ResultsTable } from "@/components/ResultsTable";
import { MissingEvidence } from "@/components/MissingEvidence";
import { uploadPDFToWebhook, ValidationResponse } from "@/lib/webhookClient";
import { toast } from "sonner";

const Index = () => {
  // Genereer unieke session ID bij component mount (nieuwe ID bij elke refresh)
  const [sessionId] = useState(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    toast.info(`${files.length} bestand${files.length > 1 ? 'en' : ''} uploaden...`);
    
    try {
      const response = await uploadPDFToWebhook(files, sessionId);
      setValidationData(response);
      toast.success("AI-validatie voltooid");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload mislukt. Probeer opnieuw.");
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
        
        {validationData && (
          <div style={{ marginTop: '2rem' }}>
            <ResultsTable results={validationData.results} />
            <MissingEvidence missing={validationData.missing} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
