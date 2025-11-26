import { useState } from "react";
import { PDFUploadZone } from "@/components/PDFUploadZone";
import { sendTestValidationRequest, ValidationResponse } from "@/lib/webhookClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResultsTable } from "@/components/ResultsTable";
import { ClassificationResults } from "@/components/ClassificationResults";
import { HEA02VerdictResults } from "@/components/HEA02VerdictResults";
import { ExtendedHEA02Results } from "@/components/ExtendedHEA02Results";
import { Hea02ResultDisplay } from "@/components/Hea02ResultDisplay";
import { DetailedProductAnalysis } from "@/components/DetailedProductAnalysis";
import { VerificatieAuditDisplay } from "@/components/VerificatieAuditDisplay";
import { BouwbiologischAdviesDisplay } from "@/components/BouwbiologischAdviesDisplay";
import { LoadingModal } from "@/components/LoadingModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube } from "lucide-react";

const TestPage = () => {
  // Genereer unieke session ID bij component mount
  const [sessionId] = useState(() => {
    return `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [errorData, setErrorData] = useState<{ message: string; rawResponse?: any } | null>(null);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    toast.info(`${files.length} bestand${files.length > 1 ? 'en' : ''} uploaden...`);
    
    try {
      setUploadedFiles(prev => [...prev, ...files]);
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
    setErrorData(null);
    toast.info("Validatie verzenden naar test webhook...");
    
    try {
      const response = await sendTestValidationRequest(sessionId, uploadedFiles);
      setValidationData(response);
      setErrorData(null);
      toast.success("Validatie ontvangen!");
    } catch (error) {
      console.error("❌ [TEST UI] Send error:", error);
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

  const handleReset = () => {
    setUploadedFiles([]);
    setValidationData(null);
    setErrorData(null);
    toast.info("Sessie gereset");
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <LoadingModal 
        isOpen={isSending} 
        message="Test validatie uitvoeren..."
        estimatedTime={60}
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TestTube className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Test Validatie</h1>
              <p className="text-sm text-muted-foreground">Test omgeving voor PDF validatie</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/">← Terug naar hoofdpagina</a>
          </Button>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Upload PDF
            </CardTitle>
            <CardDescription>
              Upload PDF bestanden voor test validatie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PDFUploadZone onUpload={handleUpload} isUploading={isUploading} />
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-semibold mb-2">Geüploade bestanden ({uploadedFiles.length}):</p>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1 text-muted-foreground">
                      <span className="text-green-600">✓</span>
                      {file.name}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSend} 
                    className="flex-1"
                    disabled={isSending}
                  >
                    Verstuur naar test validatie
                  </Button>
                  <Button 
                    onClick={handleReset} 
                    variant="outline"
                    disabled={isSending || isUploading}
                  >
                    Opnieuw beginnen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error display */}
        {errorData && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">❌ Fout bij validatie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                <strong>Error:</strong> {errorData.message}
              </p>
              <details>
                <summary className="cursor-pointer font-semibold text-sm hover:underline">
                  🔍 Raw Response Data
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
                  {errorData.rawResponse ? JSON.stringify(errorData.rawResponse, null, 2) : 'Geen raw response beschikbaar'}
                </pre>
              </details>
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Open de browser console (F12) voor gedetailleerde debugging logs
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results display */}
        {validationData && (
          <Card>
            <CardHeader>
              <CardTitle>Validatie resultaten</CardTitle>
            </CardHeader>
            <CardContent>
              {validationData.type === 'bouwbiologisch_advies' && (
                <BouwbiologischAdviesDisplay data={validationData.data} />
              )}
              {validationData.type === 'verificatie_audit' && (
                <VerificatieAuditDisplay data={validationData.data} />
              )}
              {validationData.type === 'table' && (
                <ResultsTable criteria={validationData.criteria} />
              )}
              {validationData.type === 'hea02_result' && (
                <Hea02ResultDisplay data={validationData.data} />
              )}
              {validationData.type === 'detailed_product_analysis' && (
                <DetailedProductAnalysis data={validationData.data} />
              )}
              {validationData.type === 'extended_hea02_verdict' && (
                <ExtendedHEA02Results data={validationData.data} />
              )}
              {validationData.type === 'hea02_verdict' && (
                <HEA02VerdictResults data={validationData.data} />
              )}
              {validationData.type === 'classification' && (
                <ClassificationResults data={validationData.data} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestPage;
