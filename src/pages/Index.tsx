import { useState } from "react";
import { ValidationHeader } from "@/components/ValidationHeader";
import { PDFUploadZone } from "@/components/PDFUploadZone";
import { ResultsTable } from "@/components/ResultsTable";
import { MissingEvidence } from "@/components/MissingEvidence";
import { KnowledgeBankStatus } from "@/components/KnowledgeBankStatus";
import { ValidationFooter } from "@/components/ValidationFooter";
import { uploadPDFToWebhook, ValidationResponse } from "@/lib/webhookClient";
import { toast } from "sonner";

const Index = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    toast.info(`Uploading ${files.length} bestand(en)...`);
    
    try {
      const response = await uploadPDFToWebhook(files);
      setValidationData(response);
      toast.success("Validatie voltooid");
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
      background: 'hsl(var(--bg))',
      color: 'hsl(var(--ink))'
    }}>
      <ValidationHeader />
      
      <main className="container mx-auto px-6 py-12" style={{ maxWidth: '1200px' }}>
        {/* Intro Sectie */}
        <section className="intro" style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontFamily: 'IBM Plex Mono',
            fontSize: '1.75rem',
            marginBottom: '1rem',
            color: 'hsl(var(--ink))'
          }}>
            Beperkte Validatie
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'hsl(var(--muted))' }}>
            Upload een SDS- of productblad. Wij schatten de veiligheid en tonen wat we wél en niet kunnen bewijzen.
          </p>
        </section>

        {/* Upload Zone */}
        <PDFUploadZone onUpload={handleUpload} isUploading={isUploading} />

        {/* Resultaten - alleen tonen als data beschikbaar is */}
        {validationData && (
          <>
            <div style={{ marginTop: '3rem' }}>
              <ResultsTable results={validationData.results} />
            </div>
            
            <MissingEvidence missing={validationData.missing} />
            
            <KnowledgeBankStatus />
          </>
        )}
      </main>
      
      <ValidationFooter />
    </div>
  );
};

export default Index;
