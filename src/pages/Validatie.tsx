import { useState, useRef } from "react";
import { PDFUploadZone } from "@/components/PDFUploadZone";
import { sendValidationRequest, ValidationResponse } from "@/lib/webhookClient";
import { uploadPDFsToStorage, uploadPDFsToKnowledgeBank, StoredFile } from "@/lib/storageClient";
import { SourceFilesProvider } from "@/components/SourceFilesContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResultsTable } from "@/components/ResultsTable";
import { ClassificationResults } from "@/components/ClassificationResults";
import { HEA02VerdictResults } from "@/components/HEA02VerdictResults";
import { ExtendedHEA02Results } from "@/components/ExtendedHEA02Results";
import { Hea02ResultDisplay } from "@/components/Hea02ResultDisplay";
import { DetailedProductAnalysis } from "@/components/DetailedProductAnalysis";
import { VerificatieAuditDisplay } from "@/components/VerificatieAuditDisplay";
import { ValidationReport } from "@/components/ValidationReport";
import { CASResultsDisplay } from "@/components/CASResultsDisplay";
import { LoadingModal } from "@/components/LoadingModal";
import { ProductSelector } from "@/components/ProductSelector";
import { StepIndicator } from "@/components/StepIndicator";
import { KnowledgeBankLookup } from "@/components/KnowledgeBankLookup";
import { KnowledgeBankStatus } from "@/components/KnowledgeBankStatus";
import { CreateAccountModal } from "@/components/CreateAccountModal";
import { NoCreditsModal } from "@/components/NoCreditsModal";
import { CreditsIndicator } from "@/components/CreditsIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2, Download } from "lucide-react";
import { exportToPDF, generateFilename } from "@/lib/pdfExport";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useKnowledgeBank, updateKnowledgeBank, checkKnowledgeBankExists } from "@/hooks/useKnowledgeBank";

const productTypes = [
  { id: "1", name: "Binnenverf en vernissen", description: "Binnenverf en vernissen" },
  { id: "2", name: "Houtachtige plaatmaterialen", description: "Houtachtige plaatmaterialen, inclusief spaanplaat, houtvezelplaat, MDF, OSB, cementgebonden vezelplaat, triplex, massief houten panelen en akoestische platen. Ook houten vloeren, zoals parket vallen hieronder, alsmede houtconstructies zoals gelamineerd hout." },
  { id: "3", name: "Vloerafwerking", description: "Vloerafwerking, inclusief vinyl, linoleum, kurk, rubber, tapijt en houten laminaatvloeren. Ook gietvloeren." },
  { id: "4", name: "Verlaagde plafonds en tussenwanden", description: "Verlaagde plafonds, tussenwanden plus akoestisch en isolatie technische materialen." },
  { id: "5", name: "Lijmen en kitten", description: "Lijmen en kitten, inclusief vloerlijmen." },
];

const steps = [
  { id: 1, label: "Setup" },
  { id: 2, label: "Productgroep" },
  { id: 3, label: "Upload" },
  { id: 4, label: "Resultaten" },
];

export default function Validatie() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, credits, deductCredit, refetchCredits } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Guest session for non-authenticated users
  const [guestSessionId] = useState(() => `guest_${Date.now()}`);
  const sessionId = user?.id ? `user_${user.id}` : guestSessionId;
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(searchParams.get('projectId'));
  const [selectedProductId, setSelectedProductId] = useState<string | null>(searchParams.get('productId'));
  const [selectedEanCode, setSelectedEanCode] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [usedKnowledgeBank, setUsedKnowledgeBank] = useState(false);
  
  const [selectedCertification, setSelectedCertification] = useState<string>("");
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [errorData, setErrorData] = useState<{ message: string; rawResponse?: any } | null>(null);

  // Modal states for guest flow
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [pendingGuestValidation, setPendingGuestValidation] = useState<{
    result: ValidationResponse | null;
    storedFiles: StoredFile[];
  } | null>(null);

  // Knowledge bank lookup
  const { entry: knowledgeBankEntry, isLoading: isLoadingKnowledgeBank } = useKnowledgeBank(
    selectedEanCode,
    selectedCertification
  );

  const handleProductChange = (productId: string | null, eanCode: string | null, productName: string | null) => {
    setSelectedProductId(productId);
    setSelectedEanCode(eanCode);
    setSelectedProductName(productName);
  };

  const handleExportPDF = async () => {
    if (!resultsRef.current) return;
    
    setIsExporting(true);
    toast.info("PDF wordt gegenereerd...");
    
    try {
      const selectedProduct = productTypes.find(p => p.id === selectedProductType);
      const filename = generateFilename(selectedProduct?.name);
      await exportToPDF(resultsRef.current, filename);
      toast.success("PDF succesvol gedownload!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("PDF export mislukt");
    } finally {
      setIsExporting(false);
    }
  };

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

  const saveValidation = async (result: ValidationResponse | null, status: string, savedStoredFiles: StoredFile[]) => {
    if (!user) return;

    const selectedProduct = productTypes.find(p => p.id === selectedProductType);
    
    try {
      await supabase
        .from('validations')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          certification: selectedCertification,
          product_type: selectedProduct as any,
          file_names: uploadedFiles.map(f => f.name),
          source_files: savedStoredFiles as any,
          result: result as any,
          status: status,
          product_id: selectedProductId,
        });
    } catch (error) {
      console.error('Error saving validation:', error);
    }
  };

  const handleSend = async () => {
    // Check credits for logged-in users
    if (user && credits <= 0) {
      setShowNoCreditsModal(true);
      return;
    }
    
    setIsSending(true);
    setErrorData(null);
    
    let savedStoredFiles: StoredFile[] = [];
    let kbSourceFiles: StoredFile[] | null = null;
    
    try {
      const selectedProduct = productTypes.find(p => p.id === selectedProductType);
      if (!selectedProduct) throw new Error("Product type not found");
      
      // For logged-in users: upload to storage
      if (user) {
        toast.info("PDF bestanden opslaan...");
        savedStoredFiles = await uploadPDFsToStorage(uploadedFiles, user.id, sessionId);
        setStoredFiles(savedStoredFiles);
        console.log("✅ PDFs opgeslagen:", savedStoredFiles);
        
        // Check knowledge bank for first validation
        if (selectedEanCode && selectedCertification) {
          const kbExists = await checkKnowledgeBankExists(selectedEanCode, selectedCertification);
          
          if (!kbExists) {
            toast.info("Eerste validatie voor dit product - opslaan in kennisbank...");
            kbSourceFiles = await uploadPDFsToKnowledgeBank(
              uploadedFiles, 
              selectedEanCode, 
              selectedCertification
            );
            console.log("✅ PDFs opgeslagen in Knowledge Bank:", kbSourceFiles);
          }
        }
      }
      
      // Execute validation
      toast.info("Validatie uitvoeren...");
      const response = await sendValidationRequest(
        sessionId, 
        selectedCertification, 
        selectedProduct, 
        uploadedFiles,
        selectedEanCode,
        selectedProductName
      );
      setValidationData(response);
      setErrorData(null);
      toast.success("Validatie ontvangen!");
      setCurrentStep(4);
      
      // For logged-in users: deduct credit and save
      if (user) {
        await deductCredit();
        await saveValidation(response, 'completed', savedStoredFiles);
        
        // Update knowledge bank if we have an EAN code
        if (selectedEanCode && selectedCertification) {
          const resultData = 'data' in response ? response.data : response;
          await updateKnowledgeBank(
            selectedEanCode,
            selectedProductName,
            selectedCertification,
            selectedProduct,
            resultData,
            kbSourceFiles
          );
        }
      } else {
        // Guest user: show account creation modal
        setPendingGuestValidation({ result: response, storedFiles: savedStoredFiles });
        setShowCreateAccountModal(true);
      }
    } catch (error) {
      console.error("❌ [UI] Send error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      setErrorData({
        message: errorMessage,
        rawResponse: (error as any).rawResponse
      });
      toast.error("Verzenden mislukt - check console voor details");
      setCurrentStep(4);
      
      if (user) {
        await saveValidation(null, 'failed', savedStoredFiles);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleAccountCreated = async () => {
    setShowCreateAccountModal(false);
    
    // After account creation, refetch credits and save the pending validation
    await refetchCredits();
    
    if (pendingGuestValidation) {
      toast.success("Account aangemaakt! Je validatie wordt opgeslagen...");
      setPendingGuestValidation(null);
    }
  };

  const handleSkipAccountCreation = () => {
    setShowCreateAccountModal(false);
    setPendingGuestValidation(null);
    toast.info("Resultaten worden niet opgeslagen. Maak een account aan om volgende keer te bewaren.");
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setStoredFiles([]);
    setValidationData(null);
    setErrorData(null);
    setSelectedProjectId(null);
    setSelectedProductId(null);
    setSelectedEanCode(null);
    setSelectedProductName(null);
    setSelectedCertification("");
    setSelectedProductType("");
    setUsedKnowledgeBank(false);
    setCurrentStep(1);
    toast.info("Sessie gereset");
  };

  const handleUseKnowledgeBank = () => {
    if (knowledgeBankEntry?.latest_result) {
      setValidationData({
        type: 'bouwbiologisch_advies',
        data: knowledgeBankEntry.latest_result
      });
      // Use KB source files if available
      if (knowledgeBankEntry.source_files) {
        setStoredFiles(knowledgeBankEntry.source_files);
      }
      setUsedKnowledgeBank(true);
      setCurrentStep(4);
      toast.success("Kennisbank data geladen!");
    }
  };

  const canGoToStep2 = selectedCertification === "BREEAM_HEA02";
  const canGoToStep3 = canGoToStep2 && selectedProductType !== "";
  const canSend = canGoToStep3 && uploadedFiles.length > 0;

  const handleNextStep = () => {
    if (currentStep === 1 && canGoToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canGoToStep3) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep && currentStep !== 4) {
      setCurrentStep(step);
    }
  };

  // Results View (Step 4)
  if (currentStep === 4) {
    return (
      <Layout>
        <CreditsIndicator />
        <CreateAccountModal
          isOpen={showCreateAccountModal}
          onClose={() => setShowCreateAccountModal(false)}
          onAccountCreated={handleAccountCreated}
          onSkip={handleSkipAccountCreation}
        />
        <NoCreditsModal
          isOpen={showNoCreditsModal}
          onClose={() => setShowNoCreditsModal(false)}
        />
        <div className="flex-1 py-12 px-6" style={{ background: 'hsl(var(--muted))' }}>
        
        <div className="flex-1 py-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="font-heading font-medium text-4xl" style={{ color: 'hsl(190 16% 12%)' }}>
                  {validationData ? "Validatie Resultaten" : "Validatie Mislukt"}
                </h1>
                <p className="text-lg mt-2" style={{ color: 'hsl(218 19% 27%)' }}>
                  {validationData ? "Bekijk hieronder de resultaten van uw validatie" : "Er is een fout opgetreden"}
                </p>
              </div>
              <div className="flex gap-2">
                {validationData && (
                  <Button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isExporting ? "Exporteren..." : "Exporteer PDF"}
                  </Button>
                )}
                <Button 
                  onClick={handleReset}
                  className="gap-2"
                  style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Nieuwe validatie
                </Button>
              </div>
            </div>

            {/* Error display */}
            {errorData && (
              <Card style={{ border: '2px solid hsl(0 84% 60%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading" style={{ color: 'hsl(0 84% 60%)' }}>❌ Fout bij validatie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    <strong>Error:</strong> {errorData.message}
                  </p>
                  <details>
                    <summary className="cursor-pointer font-semibold text-sm hover:underline">
                      🔍 Raw Response Data
                    </summary>
                    <pre className="mt-2 p-4 rounded-md overflow-auto text-xs" style={{ background: 'hsl(218 14% 95%)' }}>
                      {errorData.rawResponse ? JSON.stringify(errorData.rawResponse, null, 2) : 'Geen raw response beschikbaar'}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            )}

            {/* Results display */}
            {validationData && (
              <div ref={resultsRef}>
                <SourceFilesProvider sourceFiles={storedFiles}>
                  {validationData.type === 'bouwbiologisch_advies' ? (
                    <ValidationReport ref={resultsRef} data={validationData.data} />
                  ) : (
                    <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
                      <CardHeader>
                        <CardTitle className="font-heading flex items-center gap-2">
                          <CheckCircle2 className="w-6 h-6" style={{ color: 'hsl(142 64% 62%)' }} />
                          Validatie Resultaten
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {validationData.type === 'cas_results' && (
                          <CASResultsDisplay data={validationData.data} />
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
                </SourceFilesProvider>

                {/* Knowledge Bank Status - show when data was added */}
                {selectedEanCode && !usedKnowledgeBank && (
                  <KnowledgeBankStatus />
                )}
                {usedKnowledgeBank && (
                  <KnowledgeBankStatus 
                    usedExisting={true} 
                    validationCount={knowledgeBankEntry?.validation_count} 
                  />
                )}
              </div>
            )}
          </div>
        </div>

        </div>
      </Layout>
    );
  }

  // Wizard View (Steps 1-3)
  return (
    <Layout>
      <CreditsIndicator />
      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
      />
      <LoadingModal 
        isOpen={isSending} 
        message="Validatie uitvoeren..."
        estimatedTime={60}
      />
      
      <div className="flex-1 py-12 px-6" style={{ background: 'hsl(var(--muted))' }}>
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Dashboard
            </Button>
            <h1 className="font-heading font-medium text-4xl" style={{ color: 'hsl(190 16% 12%)' }}>
              Validatie Tool
            </h1>
            <p className="text-lg mt-2" style={{ color: 'hsl(218 19% 27%)' }}>
              BREEAM HEA02 Validatie met PDF Upload
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={handleStepClick}
          />

          {/* Step 1: Setup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <ProductSelector
                selectedProjectId={selectedProjectId}
                selectedProductId={selectedProductId}
                onProjectChange={setSelectedProjectId}
                onProductChange={handleProductChange}
              />

              {/* Knowledge Bank Lookup */}
              {selectedEanCode && selectedCertification && (
                <KnowledgeBankLookup
                  entry={knowledgeBankEntry}
                  isLoading={isLoadingKnowledgeBank}
                  onUseExisting={handleUseKnowledgeBank}
                  onNewValidation={() => setCurrentStep(2)}
                />
              )}

              <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading">Kies certificeringssysteem</CardTitle>
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

              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep}
                  disabled={!canGoToStep2}
                  className="gap-2"
                  style={{ background: canGoToStep2 ? 'hsl(142 64% 62%)' : undefined, color: canGoToStep2 ? 'hsl(186 100% 10%)' : undefined }}
                >
                  Volgende
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Product Type */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading">Kies productgroep</CardTitle>
                  <CardDescription>
                    Selecteer de productgroep die van toepassing is
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedProductType} onValueChange={setSelectedProductType}>
                    <div className="space-y-4">
                      {productTypes.map((product) => (
                        <div 
                          key={product.id} 
                          className="flex items-start space-x-3 p-4 transition-colors cursor-pointer"
                          style={{ border: '1px solid hsl(218 14% 85%)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(142 64% 62% / 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <RadioGroupItem value={product.id} id={product.id} className="mt-1" />
                          <Label htmlFor={product.id} className="flex-1 cursor-pointer">
                            <div className="font-semibold mb-1 font-heading">{product.id}. {product.name}</div>
                            <div className="text-sm" style={{ color: 'hsl(218 19% 27%)' }}>{product.description}</div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Vorige
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!canGoToStep3}
                  className="gap-2"
                  style={{ background: canGoToStep3 ? 'hsl(142 64% 62%)' : undefined, color: canGoToStep3 ? 'hsl(186 100% 10%)' : undefined }}
                >
                  Volgende
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading">Upload PDF</CardTitle>
                  <CardDescription>
                    Upload PDF bestanden voor validatie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PDFUploadZone onUpload={handleUpload} isUploading={isUploading} />
                  
                  {uploadedFiles.length > 0 && (
                    <div className="text-sm">
                      <p className="font-semibold mb-2">Geüploade bestanden ({uploadedFiles.length}):</p>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1" style={{ color: 'hsl(218 19% 27%)' }}>
                          <span style={{ color: 'hsl(142 64% 62%)' }}>✓</span>
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Vorige
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={!canSend || isSending}
                  className="gap-2"
                  style={{ background: canSend ? 'hsl(142 64% 62%)' : undefined, color: canSend ? 'hsl(186 100% 10%)' : undefined }}
                >
                  Verstuur validatie
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
