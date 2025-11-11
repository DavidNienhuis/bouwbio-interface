import { useState } from "react";
import { PDFUploadZone } from "@/components/PDFUploadZone";
import { uploadPDFToWebhook, sendValidationRequest, ValidationResponse } from "@/lib/webhookClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResultsTable } from "@/components/ResultsTable";
import { ClassificationResults } from "@/components/ClassificationResults";
import { LoadingModal } from "@/components/LoadingModal";

const Index = () => {
  // Genereer unieke session ID bij component mount (nieuwe ID bij elke refresh)
  const [sessionId] = useState(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    toast.info(`${files.length} bestand${files.length > 1 ? 'en' : ''} uploaden...`);
    
    try {
      await uploadPDFToWebhook(files, sessionId);
      setUploadedFiles(files.map(f => f.name));
      toast.success("Upload gelukt!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload mislukt");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    toast.info("Validatie verzenden...");
    
    try {
      const response = await sendValidationRequest(sessionId);
      setValidationData(response);
      toast.success("Validatie ontvangen!");
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Verzenden mislukt");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <LoadingModal 
        isOpen={isSending} 
        message="Validatie uitvoeren..."
        estimatedTime={15}
      />
      
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <PDFUploadZone onUpload={handleUpload} isUploading={isUploading} />
          
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>Geüpload:</p>
                {uploadedFiles.map((filename, idx) => (
                  <div key={idx} style={{ padding: '0.25rem 0' }}>✓ {filename}</div>
                ))}
              </div>
              
              <Button 
                onClick={handleSend} 
                disabled={isSending || isUploading}
                style={{ width: '100%' }}
              >
                {isSending ? "Verzenden..." : "Send"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {validationData && (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {validationData.type === 'table' ? (
            <ResultsTable criteria={validationData.criteria} />
          ) : (
            <ClassificationResults data={validationData.data} />
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
