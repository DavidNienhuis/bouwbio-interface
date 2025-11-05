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
    toast.info(`${files.length} bestand${files.length > 1 ? 'en' : ''} uploaden...`);
    
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
      display: 'flex',
      flexDirection: 'column'
    }}>
      <ValidationHeader />
      
      <main className="flex-1">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Intro Sectie */}
          <section className="intro mb-12 max-w-3xl">
            <h2 
              className="text-3xl md:text-4xl mb-4"
              style={{ 
                fontFamily: 'IBM Plex Mono',
                color: 'hsl(var(--ink))',
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}
            >
              Beperkte Validatie
            </h2>
            <p 
              className="text-lg"
              style={{ 
                lineHeight: '1.75', 
                color: 'hsl(var(--muted))',
                maxWidth: '60ch'
              }}
            >
              Upload een SDS- of productblad. Wij schatten de veiligheid en tonen wat we wél en niet kunnen bewijzen op basis van beschikbare gegevens.
            </p>
          </section>

          {/* Upload Zone */}
          <PDFUploadZone onUpload={handleUpload} isUploading={isUploading} />

          {/* Resultaten - alleen tonen als data beschikbaar is */}
          {validationData && (
            <div className="animate-fade-in" style={{ marginTop: '4rem' }}>
              <ResultsTable results={validationData.results} />
              <MissingEvidence missing={validationData.missing} />
              <KnowledgeBankStatus />
            </div>
          )}
        </div>
      </main>
      
      <ValidationFooter />
    </div>
  );
};

export default Index;
