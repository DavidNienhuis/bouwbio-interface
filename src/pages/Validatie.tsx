import { useState, useRef } from "react";
import { PDFUploadZone } from "@/components/PDFUploadZone";
import { ValidationResponse } from "@/lib/webhookClient";
import { StoredFile } from "@/lib/storageClient";
import { SourceFilesProvider } from "@/components/SourceFilesContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { StepIndicator } from "@/components/StepIndicator";
import { CreateAccountModal } from "@/components/CreateAccountModal";
import { NoCreditsModal } from "@/components/NoCreditsModal";
import { CreditsIndicator } from "@/components/CreditsIndicator";
import { FeatureInfoBar } from "@/components/FeatureInfoBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2, Download } from "lucide-react";
import { exportToPDF, generateFilename } from "@/lib/pdfExport";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startValidationAuto, checkValidationStatus } from "@/lib/validation/validationOrchestrator";
import { ProductType, ValidationError } from "@/lib/validation/types";

const productTypes: ProductType[] = [
  { id: "1", name: "Binnenverf en vernissen", description: "Binnenverf en vernissen" },
  { id: "2", name: "Houtachtige plaatmaterialen", description: "Houtachtige plaatmaterialen, inclusief spaanplaat, houtvezelplaat, MDF, OSB, cementgebonden vezelplaat, triplex, massief houten panelen en akoestische platen. Ook houten vloeren, zoals parket vallen hieronder, alsmede houtconstructies zoals gelamineerd hout." },
  { id: "3", name: "Vloerafwerking", description: "Vloerafwerking, inclusief vinyl, linoleum, kurk, rubber, tapijt en houten laminaatvloeren. Ook gietvloeren." },
  { id: "4", name: "Verlaagde plafonds en tussenwanden", description: "Verlaagde plafonds, tussenwanden plus akoestisch en isolatie technische materialen." },
  { id: "5", name: "Lijmen en kitten", description: "Lijmen en kitten, inclusief vloerlijmen." },
];

const steps = [
  { id: 1, label: "Certificering" },
  { id: 2, label: "Productgroep" },
  { id: 3, label: "Product" },
  { id: 4, label: "Upload" },
  { id: 5, label: "Resultaten" },
];

export default function Validatie() {
  const navigate = useNavigate();
  const { user, credits, deductCredit, refetchCredits } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Guest session for non-authenticated users
  const [guestSessionId] = useState(() => `guest_${Date.now()}`);
  const sessionId = user?.id ? `user_${user.id}` : guestSessionId;
  
  // Product info
  const [productName, setProductName] = useState("");
  const [eanCode, setEanCode] = useState("");
  
  const [selectedCertification, setSelectedCertification] = useState<string>("BREEAM_HEA02");
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [errorData, setErrorData] = useState<ValidationError | null>(null);

  // Queue state
  const [queueId, setQueueId] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<string | null>(null);
  const [queueAttempts, setQueueAttempts] = useState<number>(0);
  const [queueMaxAttempts, setQueueMaxAttempts] = useState<number>(3);

  // Modal states
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  
  // Store pending validation data for after account creation
  const [pendingValidation, setPendingValidation] = useState(false);

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

  const createDefaultProjectAndProduct = async (userId: string) => {
    // Create default project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: 'Mijn Eerste Project',
        description: 'Automatisch aangemaakt bij je eerste validatie'
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create product under the project
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        project_id: project.id,
        name: productName,
        ean_code: eanCode || null
      })
      .select()
      .single();

    if (productError) throw productError;

    return { project, product };
  };

  const executeValidation = async (userId: string, productId: string) => {
    setIsSending(true);
    setErrorData(null);
    setQueueStatus(null);

    try {
      const selectedProduct = productTypes.find(p => p.id === selectedProductType);
      if (!selectedProduct) throw new Error("Product type not found");

      // Start validation (auto-chooses queue or direct mode)
      const result = await startValidationAuto({
        userId,
        sessionId,
        productId,
        productName,
        eanCode: eanCode || null,
        selectedCertification,
        selectedProductType: selectedProduct,
        uploadedFiles,
        deductCredit,
      });

      if (result.mode === 'queue' && result.queueId) {
        // Queue mode - start polling for status
        setQueueId(result.queueId);
        setQueueStatus('pending');
        setCurrentStep(5);
        setIsSending(false);

        // Start polling
        pollQueueStatus(result.queueId);
      } else if (result.mode === 'direct' && result.result) {
        // Direct mode - show results immediately
        setValidationData(result.result.validationData);
        setStoredFiles(result.result.storedFiles);
        setErrorData(null);
        setCurrentStep(5);
        setIsSending(false);
      }
    } catch (error) {
      console.error("❌ [UI] Send error:", error);
      const validationError = error as ValidationError;
      setErrorData({
        message: validationError.message,
        rawResponse: validationError.rawResponse
      });
      toast.error("Verzenden mislukt - check console voor details");
      setCurrentStep(5);
      setIsSending(false);
    }
  };

  // Poll queue status until completion
  const pollQueueStatus = async (qId: string) => {
    const pollInterval = 2000; // Poll every 2 seconds
    const maxPolls = 180; // 6 minutes max
    let pollCount = 0;

    const poll = async () => {
      try {
        const status = await checkValidationStatus(qId);

        setQueueStatus(status.status);
        setQueueAttempts(status.attempts || 0);
        setQueueMaxAttempts(status.maxAttempts || 3);

        if (status.status === 'completed' && status.validationId) {
          // Fetch the completed validation
          const { data: validation } = await supabase
            .from('validations')
            .select('*, source_files')
            .eq('id', status.validationId)
            .single();

          if (validation) {
            setValidationData(validation.result as any);
            setStoredFiles(validation.source_files as any);
            toast.success('Validatie succesvol afgerond!');
          }
        } else if (status.status === 'failed') {
          setErrorData({
            message: status.errorLog || 'Validatie mislukt na meerdere pogingen',
          });
          toast.error('Validatie mislukt');
        } else if (status.status === 'processing' || status.status === 'pending') {
          // Continue polling
          pollCount++;
          if (pollCount < maxPolls) {
            setTimeout(poll, pollInterval);
          } else {
            toast.error('Validatie timeout - neem contact op met support');
          }
        }
      } catch (error) {
        console.error('Queue polling error:', error);
        toast.error('Fout bij ophalen status');
      }
    };

    poll();
  };

  const handleStartAnalysis = async () => {
    // Not logged in? Show account modal
    if (!user) {
      setPendingValidation(true);
      setShowCreateAccountModal(true);
      return;
    }

    // Logged in? Check credits
    if (credits <= 0) {
      setShowNoCreditsModal(true);
      return;
    }

    // Check if user has a project, if not create one
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    let projectId: string;
    let productId: string;

    if (!projects || projects.length === 0) {
      // Create default project and product
      const { project, product } = await createDefaultProjectAndProduct(user.id);
      projectId = project.id;
      productId = product.id;
    } else {
      // Create product under existing project
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          project_id: projects[0].id,
          name: productName,
          ean_code: eanCode || null
        })
        .select()
        .single();

      if (error) throw error;
      projectId = projects[0].id;
      productId = product.id;
    }

    // Execute validation
    await executeValidation(user.id, productId);
  };

  const handleAccountCreated = async () => {
    setShowCreateAccountModal(false);
    
    // Wait for auth state to update
    await refetchCredits();
    
    // Get the new user
    const { data: { user: newUser } } = await supabase.auth.getUser();
    
    if (newUser && pendingValidation) {
      toast.success("Account aangemaakt! Validatie wordt gestart...");
      
      try {
        // Create project and product for new user
        const { project, product } = await createDefaultProjectAndProduct(newUser.id);
        
        // Execute the validation
        await executeValidation(newUser.id, product.id);
      } catch (error) {
        console.error("Error after account creation:", error);
        toast.error("Er ging iets mis bij het starten van de validatie");
      }
    }
    
    setPendingValidation(false);
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setStoredFiles([]);
    setValidationData(null);
    setErrorData(null);
    setQueueId(null);
    setQueueStatus(null);
    setQueueAttempts(0);
    setProductName("");
    setEanCode("");
    setSelectedCertification("BREEAM_HEA02");
    setSelectedProductType("");
    setCurrentStep(1);
    toast.info("Sessie gereset");
  };

  const canGoToStep2 = selectedCertification !== "";
  const canGoToStep3 = canGoToStep2 && selectedProductType !== "";
  const canGoToStep4 = canGoToStep3 && productName.trim() !== "";
  const canSend = canGoToStep4 && uploadedFiles.length > 0;

  const handleNextStep = () => {
    if (currentStep === 1 && canGoToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canGoToStep3) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canGoToStep4) {
      setCurrentStep(4);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep && currentStep !== 5) {
      setCurrentStep(step);
    }
  };

  // Results View (Step 5)
  if (currentStep === 5) {
    return (
      <Layout>
        <CreditsIndicator />
        <div className="flex-1 py-12 px-6" style={{ background: 'white' }}>
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

            {user && (
              <div className="mb-6">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/projecten')}
                  className="gap-2"
                >
                  Bekijk je projecten
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Queue status display */}
            {queueStatus && queueStatus !== 'completed' && !validationData && (
              <Card style={{ border: '2px solid hsl(142 64% 62%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    {queueStatus === 'pending' && '⏳ Validatie in wachtrij'}
                    {queueStatus === 'processing' && '⚙️ Validatie wordt uitgevoerd'}
                    {queueStatus === 'failed' && '❌ Validatie mislukt'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Status:</strong> {queueStatus === 'pending' ? 'Wachten op verwerking' : queueStatus === 'processing' ? 'Wordt verwerkt' : 'Mislukt'}
                    </p>
                    {queueAttempts > 0 && (
                      <p className="text-sm">
                        <strong>Poging:</strong> {queueAttempts} van {queueMaxAttempts}
                      </p>
                    )}
                    <div className="mt-4">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: queueStatus === 'processing' ? '50%' : '10%',
                            background: 'hsl(142 64% 62%)'
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      De validatie wordt op de achtergrond verwerkt. Dit kan enkele minuten duren.
                      {queueAttempts > 1 && ' Er wordt automatisch opnieuw geprobeerd bij fouten.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Wizard View (Steps 1-4)
  return (
    <Layout>
      <CreditsIndicator />
      <CreateAccountModal
        isOpen={showCreateAccountModal}
        onClose={() => {
          setShowCreateAccountModal(false);
          setPendingValidation(false);
        }}
        onAccountCreated={handleAccountCreated}
      />
      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
      />
      <LoadingModal 
        isOpen={isSending} 
        message="Validatie uitvoeren..."
        estimatedTime={60}
      />
      
      {/* Top Navigation Bar - Only for non-logged-in users */}
      {!user && <FeatureInfoBar />}

      <div className="flex-1 py-12 px-6" style={{ background: 'white' }}>
        <div className="container mx-auto max-w-4xl">
          {/* Hero Header */}
          <div className="mb-8 text-center">
            <div className="mb-4">
              <h1 className="font-heading font-medium text-4xl" style={{ color: 'hsl(190 16% 12%)' }}>
                Product Analyse Tool
              </h1>
            </div>
            <p className="text-lg" style={{ color: 'hsl(218 19% 27%)' }}>
              Analyseer je bouwproducten op BREEAM HEA02 compliance met AI
            </p>
            <p className="text-sm mt-2" style={{ color: 'hsl(218 19% 27% / 0.7)' }}>
              Powered by Bouwbioloog Zwolle
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={handleStepClick}
          />

          {/* Step 1: Certification */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading">Kies certificeringssysteem</CardTitle>
                  <CardDescription>
                    Selecteer het certificeringssysteem waarmee je wilt valideren
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
                        EU Taxonomy (Binnenkort beschikbaar)
                      </SelectItem>
                      <SelectItem value="WELL" disabled>
                        WELL (Binnenkort beschikbaar)
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
                          className="flex items-start space-x-3 p-4 rounded-lg transition-colors cursor-pointer"
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

          {/* Step 3: Product Name */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading">Product informatie</CardTitle>
                  <CardDescription>
                    Voer de naam van je product in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Productnaam *</Label>
                    <Input
                      id="productName"
                      placeholder="Bijv. Sigma Siloxan Primer"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eanCode">EAN Code (optioneel)</Label>
                    <Input
                      id="eanCode"
                      placeholder="Bijv. 8711401234567"
                      value={eanCode}
                      onChange={(e) => setEanCode(e.target.value)}
                    />
                    <p className="text-xs" style={{ color: 'hsl(218 19% 27% / 0.7)' }}>
                      Met een EAN code kunnen resultaten worden opgezocht in de kennisbank
                    </p>
                  </div>
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
                  disabled={!canGoToStep4}
                  className="gap-2"
                  style={{ background: canGoToStep4 ? 'hsl(142 64% 62%)' : undefined, color: canGoToStep4 ? 'hsl(186 100% 10%)' : undefined }}
                >
                  Volgende
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Upload */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading">Upload PDF bestanden</CardTitle>
                  <CardDescription>
                    Upload de productdocumentatie voor analyse
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
                  onClick={handleStartAnalysis}
                  disabled={!canSend || isSending}
                  className="gap-2"
                  style={{ background: canSend ? 'hsl(142 64% 62%)' : undefined, color: canSend ? 'hsl(186 100% 10%)' : undefined }}
                >
                  Start Analyse
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
