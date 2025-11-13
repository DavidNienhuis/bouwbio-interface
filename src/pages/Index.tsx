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
  const [errorData, setErrorData] = useState<{ message: string; rawResponse?: any } | null>(null);

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
    setErrorData(null); // Reset error state
    toast.info("Validatie verzenden...");
    
    try {
      const response = await sendValidationRequest(sessionId);
      setValidationData(response);
      setErrorData(null);
      toast.success("Validatie ontvangen!");
    } catch (error) {
      console.error("❌ [UI] Send error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      setErrorData({
        message: errorMessage,
        rawResponse: (error as any).rawResponse
      });
      toast.error("Verzenden mislukt - check console voor details");
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

      {errorData && (
        <div style={{ 
          maxWidth: '1400px', 
          margin: '2rem auto',
          padding: '1.5rem',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          backgroundColor: '#fef2f2'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            ❌ Fout bij validatie
          </h3>
          <p style={{ color: '#991b1b', marginBottom: '1rem' }}>
            <strong>Error:</strong> {errorData.message}
          </p>
          <details style={{ marginTop: '1rem' }}>
            <summary style={{ 
              cursor: 'pointer', 
              color: '#991b1b', 
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              🔍 Raw Response Data (klik om te bekijken)
            </summary>
            <pre style={{ 
              backgroundColor: '#fff',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.875rem',
              border: '1px solid #fecaca'
            }}>
              {errorData.rawResponse ? JSON.stringify(errorData.rawResponse, null, 2) : 'Geen raw response beschikbaar'}
            </pre>
          </details>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#991b1b' }}>
            💡 <strong>Tip:</strong> Open de browser console (F12) voor gedetailleerde debugging logs
          </p>
        </div>
      )}

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
