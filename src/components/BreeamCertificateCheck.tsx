import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle2, Loader2, ChevronDown, XCircle, AlertCircle, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BreeamCheckResult {
  product: string;
  productgroep: string;
  certificaat: string;
  result?: string;
  status: "idle" | "loading" | "success" | "error";
  timestamp?: Date;
}

const parseResult = (resultText: string) => {
  const sections = {
    status: "",
    niveaus: { general: "", exemplary: "" },
    reden: "",
    bewijs: "",
    beperkingen: "",
    waarschuwingVereist: false,
    waarschuwingsdetail: ""
  };

  // Extract hoofdstatus
  const resultMatch = resultText.match(/Resultaat:\s*([^\n]+)/i);
  if (resultMatch) sections.status = resultMatch[1].trim();

  // Extract niveaus
  const generalMatch = resultText.match(/General:\s*([^\n]+)/i);
  const exemplaryMatch = resultText.match(/Exemplary:\s*([^\n]+)/i);
  if (generalMatch) sections.niveaus.general = generalMatch[1].trim();
  if (exemplaryMatch) sections.niveaus.exemplary = exemplaryMatch[1].trim();

  // Extract waarschuwing vereist
  const waarschuwingMatch = resultText.match(/Waarschuwing_Vereist:\s*(WAAR|ONWAAR)/i);
  if (waarschuwingMatch) {
    sections.waarschuwingVereist = waarschuwingMatch[1].toUpperCase() === 'WAAR';
  }

  // Extract waarschuwingsdetail
  const waarschuwingDetailMatch = resultText.match(/Waarschuwingsdetail:\s*([^]*?)(?=Reden:|Bewijs:|Beperkingen:|$)/i);
  if (waarschuwingDetailMatch) {
    sections.waarschuwingsdetail = waarschuwingDetailMatch[1].trim();
  }

  // Extract reden (tekst tussen "Reden:" en "Bewijs:")
  const redenMatch = resultText.match(/Reden:\s*([^]*?)(?=Bewijs:|Beperkingen:|Waarschuwingsdetail:|$)/i);
  if (redenMatch) sections.reden = redenMatch[1].trim();

  // Extract bewijs (tekst tussen "Bewijs:" en "Beperkingen:")
  const bewijsMatch = resultText.match(/Bewijs:\s*([^]*?)(?=Beperkingen:|Waarschuwingsdetail:|$)/i);
  if (bewijsMatch) sections.bewijs = bewijsMatch[1].trim();

  // Extract beperkingen
  const beperkingenMatch = resultText.match(/Beperkingen:\s*([^]*?)$/i);
  if (beperkingenMatch) sections.beperkingen = beperkingenMatch[1].trim();

  return sections;
};

export const BreeamCertificateCheck = () => {
  const [formData, setFormData] = useState({
    product: "",
    productgroep: "",
    certificaat: "",
  });
  const [result, setResult] = useState<BreeamCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product || !formData.productgroep || !formData.certificaat) {
      toast.error("Vul alle velden in");
      return;
    }

    setIsLoading(true);
    setResult({
      ...formData,
      status: "loading",
      timestamp: new Date(),
    });

    try {
      const webhookUrl = "https://n8n-zztf.onrender.com/webhook/2e502b8f-1030-4aaf-92c7-a85ee6e01e9f";
      
      // Generate a unique session ID for each request
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId,
          product: formData.product,
          productgroep: formData.productgroep,
          certificaat: formData.certificaat,
        }),
      });

      if (!response.ok) {
        throw new Error("Webhook call failed");
      }

      const data = await response.json();

      // Parse response - handle array responses
      let resultText = "";
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        resultText = firstItem.result || firstItem.output || firstItem.formatted_text || "";
      } else {
        resultText = data.result || data.output || data.formatted_text || "";
      }

      // Fallback to stringified JSON if no result found
      if (!resultText) {
        resultText = JSON.stringify(data);
      }

      setResult({
        ...formData,
        result: resultText,
        status: "success",
        timestamp: new Date(),
      });

      toast.success("BREEAM certificaat check voltooid");
    } catch (error) {
      console.error("BREEAM check error:", error);
      
      setResult({
        ...formData,
        result: "Er is een fout opgetreden bij het verbinden met de validatieservice.",
        status: "error",
        timestamp: new Date(),
      });

      toast.error("Check mislukt");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-md">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            BREEAM Certificaat Check
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Valideer producten volgens BREEAM criteria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Input
              id="product"
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              placeholder="Bijv. Parketlak ProBudget Satin"
              disabled={isLoading}
              className="bg-card border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productgroep">Productgroep</Label>
            <Select
              value={formData.productgroep}
              onValueChange={(value) => setFormData({ ...formData, productgroep: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Selecteer een productgroep" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="Binnenverf en vernissen">
                  Binnenverf en vernissen
                </SelectItem>
                <SelectItem value="Houtachtige plaatmaterialen">
                  Houtachtige plaatmaterialen
                </SelectItem>
                <SelectItem value="Vloerafwerkingen">
                  Vloerafwerkingen
                </SelectItem>
                <SelectItem value="Plafonds, wanden en isolatiematerialen">
                  Plafonds, wanden en isolatiematerialen
                </SelectItem>
                <SelectItem value="Lijmen en kitten">
                  Lijmen en kitten
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificaat">Certificaat</Label>
            <Input
              id="certificaat"
              type="text"
              value={formData.certificaat}
              onChange={(e) => setFormData({ ...formData, certificaat: e.target.value })}
              placeholder="Bijv. EMICODE EC2"
              disabled={isLoading}
              className="bg-card border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aan het valideren...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Valideer Certificaat
              </>
            )}
          </Button>
        </form>

        {result && result.status !== "idle" && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Status:</span>
              {result.status === "loading" && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Aan het verwerken...
                </span>
              )}
              {result.status === "success" && (
                <span className="text-sm text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Voltooid
                </span>
              )}
              {result.status === "error" && (
                <span className="text-sm text-destructive">Mislukt</span>
              )}
            </div>

            {result.timestamp && (
              <div className="text-xs text-muted-foreground">
                {result.timestamp.toLocaleString('nl-NL')}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-foreground">Product:</span>{" "}
                <span className="text-muted-foreground">{result.product}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Productgroep:</span>{" "}
                <span className="text-muted-foreground">{result.productgroep}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Certificaat:</span>{" "}
                <span className="text-muted-foreground">{result.certificaat}</span>
              </div>
            </div>

            {result.result && result.status === "success" && (() => {
              const parsed = parseResult(result.result);
              const isSuccess = parsed.status.toLowerCase().includes("voldoet") && 
                                !parsed.status.toLowerCase().includes("niet");
              const isFailure = parsed.status.toLowerCase().includes("niet");
              
              return (
                <div className="mt-4 space-y-4">
                  {/* HOOFDRESULTAAT CARD */}
                  <Card className={`p-6 ${
                    isSuccess && parsed.waarschuwingVereist 
                      ? 'bg-green-50 border-2 border-orange-400 dark:bg-green-950/20 dark:border-orange-600' 
                      : isSuccess 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                      : isFailure 
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
                      : 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                  }`}>
                    <div className="flex items-center gap-4">
                      {isSuccess && <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 flex-shrink-0" />}
                      {isFailure && <XCircle className="h-10 w-10 text-red-600 dark:text-red-400 flex-shrink-0" />}
                      {!isSuccess && !isFailure && <AlertCircle className="h-10 w-10 text-orange-600 dark:text-orange-400 flex-shrink-0" />}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xl font-bold ${
                            isSuccess ? 'text-green-700 dark:text-green-300' :
                            isFailure ? 'text-red-700 dark:text-red-300' :
                            'text-orange-700 dark:text-orange-300'
                          }`}>
                            {parsed.status}
                          </h4>
                          
                          {/* Waarschuwing Indicator */}
                          {parsed.waarschuwingVereist && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button 
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                                  aria-label="Let op: extra verificatie vereist"
                                >
                                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                                    Let op!
                                  </span>
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    Extra Verificatie Vereist
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-left space-y-3 pt-4">
                                    <p className="font-medium text-foreground">
                                      Dit product voldoet aan de basiscriteria, maar er zijn aanvullende eisen die u zelf moet verifiëren:
                                    </p>
                                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                                      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                        {parsed.waarschuwingsdetail}
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">
                                      Raadpleeg de officiële BREEAM-documentatie of neem contact op met de fabrikant om deze waarden te verifiëren.
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogAction className="bg-primary">
                                    Begrepen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          BREEAM certificaat validatie resultaat
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* NIVEAUS - TWEE KOLOMMEN */}
                  {(parsed.niveaus.general || parsed.niveaus.exemplary) && (
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-4 bg-muted/50">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          General Level
                        </div>
                        <div className={`text-base font-semibold ${
                          parsed.niveaus.general.toLowerCase() === 'ja' ? 'text-green-600 dark:text-green-400' : 
                          parsed.niveaus.general.toLowerCase() === 'nee' ? 'text-red-600 dark:text-red-400' : 
                          'text-muted-foreground'
                        }`}>
                          {parsed.niveaus.general.toLowerCase() === 'ja' ? '✓ Ja' : 
                           parsed.niveaus.general.toLowerCase() === 'nee' ? '✗ Nee' : 
                           parsed.niveaus.general}
                        </div>
                      </Card>

                      <Card className="p-4 bg-muted/50">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          Exemplary Level
                        </div>
                        <div className={`text-base font-semibold ${
                          parsed.niveaus.exemplary.toLowerCase() === 'ja' ? 'text-green-600 dark:text-green-400' : 
                          parsed.niveaus.exemplary.toLowerCase() === 'nee' ? 'text-red-600 dark:text-red-400' : 
                          'text-muted-foreground'
                        }`}>
                          {parsed.niveaus.exemplary.toLowerCase() === 'ja' ? '✓ Ja' : 
                           parsed.niveaus.exemplary.toLowerCase() === 'nee' ? '✗ Nee' : 
                           parsed.niveaus.exemplary}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* REDEN - EXPANDABLE */}
                  {parsed.reden && (
                    <Collapsible defaultOpen>
                      <Card className="overflow-hidden">
                        <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-sm text-foreground">Reden</h5>
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 text-sm border-t border-border pt-3">
                            <div className="prose prose-sm max-w-none prose-p:text-muted-foreground">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {parsed.reden}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )}

                  {/* BEWIJS - EXPANDABLE */}
                  {parsed.bewijs && (
                    <Collapsible>
                      <Card className="overflow-hidden">
                        <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-sm text-foreground">Bewijs</h5>
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 text-sm border-t border-border pt-3">
                            <div className="prose prose-sm max-w-none prose-p:text-muted-foreground">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {parsed.bewijs}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )}

                  {/* BEPERKINGEN */}
                  {parsed.beperkingen && (
                    <Card className="p-4 bg-muted/30">
                      <h5 className="font-semibold text-sm mb-2 text-foreground">Beperkingen</h5>
                      <p className="text-sm text-muted-foreground">
                        {parsed.beperkingen}
                      </p>
                    </Card>
                  )}

                  {/* BRONVERMELDING */}
                  <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                          Bronvermelding
                        </h5>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                          Deze validatie is gebaseerd op officiële BREEAM documentatie:
                        </p>
                        <a 
                          href="https://pmlnrlyptayhohmnuxte.supabase.co/storage/v1/object/sign/Bronnen/GN22-BREEAM-and-HQM-recognised-schemes-for-emissions-from-construction-products%20(1).pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZTg0ODcxMC01OTZmLTQxOGYtOTdmNS1lZTI5MTliZWUwNGEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJCcm9ubmVuL0dOMjItQlJFRUFNLWFuZC1IUU0tcmVjb2duaXNlZC1zY2hlbWVzLWZvci1lbWlzc2lvbnMtZnJvbS1jb25zdHJ1Y3Rpb24tcHJvZHVjdHMgKDEpLnBkZiIsImlhdCI6MTc2MTAzOTE0NCwiZXhwIjoxNzYxNjQzOTQ0fQ.7X7SQb333bAFe0NIVqw9uM17QTyME0V96-JPqNCvX7Q"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                        >
                          <span>GN22 - BREEAM and HQM recognised schemes for emissions from construction products</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          (PDF - Jan 2025 v3.0)
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })()}

            {result.status === "error" && result.result && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{result.result}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
