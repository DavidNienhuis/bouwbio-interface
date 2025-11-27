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
import { CASResultsDisplay } from "@/components/CASResultsDisplay";
import { LoadingModal } from "@/components/LoadingModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TestTube } from "lucide-react";

const productTypes = [
  { id: "1", name: "Binnenverf en vernissen", description: "Binnenverf en vernissen" },
  { id: "2", name: "Houtachtige plaatmaterialen", description: "Houtachtige plaatmaterialen, inclusief spaanplaat, houtvezelplaat, MDF, OSB, cementgebonden vezelplaat, triplex, massief houten panelen en akoestische platen. Ook houten vloeren, zoals parket vallen hieronder, alsmede houtconstructies zoals gelamineerd hout." },
  { id: "3", name: "Vloerafwerking", description: "Vloerafwerking, inclusief vinyl, linoleum, kurk, rubber, tapijt en houten laminaatvloeren. Ook gietvloeren." },
  { id: "4", name: "Verlaagde plafonds en tussenwanden", description: "Verlaagde plafonds, tussenwanden plus akoestisch en isolatie technische materialen." },
  { id: "5", name: "Lijmen en kitten", description: "Lijmen en kitten, inclusief vloerlijmen." },
];

const TestPage = () => {
  // Genereer unieke session ID bij component mount
  const [sessionId] = useState(() => {
    return `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  
  const [selectedCertification, setSelectedCertification] = useState<string>("");
  const [selectedProductType, setSelectedProductType] = useState<string>("");
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
      const selectedProduct = productTypes.find(p => p.id === selectedProductType);
      if (!selectedProduct) throw new Error("Product type not found");
      
      const response = await sendTestValidationRequest(sessionId, selectedCertification, selectedProduct, uploadedFiles);
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

  const canShowUpload = selectedCertification === "BREEAM_HEA02" && selectedProductType !== "";

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

        {/* Stap 1: Certificeringssysteem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </span>
              Kies certificeringssysteem
            </CardTitle>
            <CardDescription>
              Selecteer het certificeringssysteem waarmee u wilt valideren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCertification} onValueChange={setSelectedCertification}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer certificeringssysteem..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BREEAM_HEA02">BREEAM HEA02</SelectItem>
                <SelectItem value="EU_TAXONOMY" disabled>
                  EU Taxonomy 🔒 (Binnenkort beschikbaar)
                </SelectItem>
                <SelectItem value="WELL" disabled>
                  WELL 🔒 (Binnenkort beschikbaar)
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stap 2: Productgroep */}
        {selectedCertification === "BREEAM_HEA02" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                Kies productgroep
              </CardTitle>
              <CardDescription>
                Selecteer de productgroep die van toepassing is
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedProductType} onValueChange={setSelectedProductType}>
                <div className="space-y-4">
                  {productTypes.map((product) => (
                    <div key={product.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={product.id} id={product.id} className="mt-1" />
                      <Label htmlFor={product.id} className="flex-1 cursor-pointer">
                        <div className="font-semibold mb-1">{product.id}. {product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Stap 3: Upload PDF */}
        {canShowUpload && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </span>
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
        )}

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
              {validationData.type === 'cas_results' && (
                <CASResultsDisplay data={validationData.data} />
              )}
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
