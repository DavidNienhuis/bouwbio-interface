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
      flexDirection: 'column'
    }}>
      <ValidationHeader />
      
      <main className="flex-1">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Intro Sectie - AI Tool Focus */}
          <section className="intro mb-12 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--secondary)))',
                  boxShadow: '0 0 30px hsla(var(--accent), 0.4)'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🧬</span>
              </div>
              <div>
                <h2 
                  className="text-4xl md:text-5xl"
                  style={{ 
                    fontFamily: 'IBM Plex Mono',
                    color: 'hsl(var(--ink))',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1',
                    fontWeight: 700
                  }}
                >
                  AI-Validatiesysteem
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ 
                      background: 'hsl(var(--accent))',
                      boxShadow: '0 0 8px hsl(var(--accent))'
                    }}
                  />
                  <span className="mono text-xs" style={{ color: 'hsl(var(--accent))' }}>
                    BREEAM HEA 02 · GN22 COMPLIANCE
                  </span>
                </div>
              </div>
            </div>
            <p 
              className="text-lg mt-6"
              style={{ 
                lineHeight: '1.75', 
                color: 'hsl(var(--muted))',
                maxWidth: '65ch'
              }}
            >
              Upload SDS- of productbladen voor geautomatiseerde AI-analyse. Het systeem evalueert veiligheid, toont beschikbaar bewijsmateriaal en identificeert ontbrekende data voor volledige compliance-verificatie.
            </p>
          </section>

          {/* Upload Zone */}
          <PDFUploadZone onUpload={handleUpload} isUploading={isUploading} />

          {/* Resultaten */}
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
