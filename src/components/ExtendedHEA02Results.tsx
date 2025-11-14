import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldX, 
  ShieldQuestion,
  TestTube,
  FileText,
  Beaker,
  Award
} from "lucide-react";
import { ExtendedHEA02VerdictData } from "@/lib/webhookClient";

interface ExtendedHEA02ResultsProps {
  data: ExtendedHEA02VerdictData;
}

export const ExtendedHEA02Results = ({ data }: ExtendedHEA02ResultsProps) => {
  const { product, verificatie_audit } = data;
  const isVoldoet = verificatie_audit.status.toLowerCase() === "voldoet";

  // Group inhoudstoffen by type
  const stoffenByType = product.inhoudstoffen_cas.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof product.inhoudstoffen_cas>);

  // Group bedrijfsclaims by type
  const claimsByType = product.bedrijfsclaims.reduce((acc, item) => {
    if (!acc[item.claim_type]) acc[item.claim_type] = [];
    acc[item.claim_type].push(item);
    return acc;
  }, {} as Record<string, typeof product.bedrijfsclaims>);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Award className="h-6 w-6 text-primary" />
          Uitgebreide BREEAM HEA 02 Audit Resultaten
        </CardTitle>
        <CardDescription>
          Volledige validatie analyse met certificaten, emissies en bedrijfsclaims
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Hero Status Section */}
        <div className="mb-6">
          <Card className={`border-2 ${isVoldoet ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {isVoldoet ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 shrink-0" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">
                    Status: {verificatie_audit.status}
                  </h3>
                  <p className="text-muted-foreground">
                    {verificatie_audit.reden}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="audit" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="stoffen" className="gap-2">
              <Beaker className="h-4 w-4" />
              <span className="hidden sm:inline">Stoffen</span>
            </TabsTrigger>
            <TabsTrigger value="certificaten" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Certificaten</span>
            </TabsTrigger>
            <TabsTrigger value="emissies" className="gap-2">
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline">Emissies</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Claims</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Audit Verificatie */}
          <TabsContent value="audit" className="space-y-4 mt-4">
            {verificatie_audit.advies_opmerkingen && verificatie_audit.advies_opmerkingen.length > 0 && (
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="h-5 w-5" />
                    Advies & Opmerkingen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {verificatie_audit.advies_opmerkingen.map((advies, idx) => (
                    <div key={idx} className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-600 dark:text-orange-400 shrink-0" />
                      <p className="text-sm">{advies}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Audit Bewijsvoering
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verificatie_audit.audit_proof.map((proof, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      <p className="text-sm flex-1">{proof}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Inhoudstoffen & CAS */}
          <TabsContent value="stoffen" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-primary" />
                  Inhoudstoffen & CAS Nummers
                  <Badge variant="secondary">{product.inhoudstoffen_cas.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(stoffenByType).map(([type, items]) => (
                    <AccordionItem key={type} value={type}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{type}</Badge>
                          <span className="text-muted-foreground text-sm">({items.length})</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {items.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-muted/30 space-y-1">
                              <p className="font-medium">{item.waarde}</p>
                              <p className="text-xs text-muted-foreground">Bron: {item.bron}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Certificaten */}
          <TabsContent value="certificaten" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {product.certificaten.map((cert, idx) => {
                const isErkend = cert.erkend_door_lightrag.toLowerCase() === "ja";
                const isNietErkend = cert.erkend_door_lightrag.toLowerCase() === "nee";
                const borderColor = isErkend 
                  ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/20" 
                  : isNietErkend 
                    ? "border-red-500/50 bg-red-50/30 dark:bg-red-950/20"
                    : "border-orange-500/50 bg-orange-50/30 dark:bg-orange-950/20";
                
                const Icon = isErkend ? ShieldCheck : isNietErkend ? ShieldX : ShieldQuestion;
                const iconColor = isErkend 
                  ? "text-green-600 dark:text-green-400" 
                  : isNietErkend 
                    ? "text-red-600 dark:text-red-400"
                    : "text-orange-600 dark:text-orange-400";

                return (
                  <Card key={idx} className={`border-2 hover-scale ${borderColor} transition-all`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-3">
                        <Icon className={`h-8 w-8 ${iconColor} shrink-0`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{cert.waarde}</h3>
                          <Badge variant={isErkend ? "default" : "secondary"} className="mb-2">
                            {cert.niveau}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">LightRAG Erkenning:</span>
                          <Badge variant={isErkend ? "default" : isNietErkend ? "destructive" : "secondary"}>
                            {cert.erkend_door_lightrag}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Bron: {cert.bron}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab 4: Emissiewaarden */}
          <TabsContent value="emissies" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-primary" />
                  Emissiewaarden
                  <Badge variant="secondary">{product.emissiewaardes.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.emissiewaardes.map((emissie, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{emissie.type}</h4>
                          <p className="text-sm text-muted-foreground">{emissie.waarde}</p>
                        </div>
                      </div>
                      {emissie.testmethode && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground transition-colors">
                            Testmethode
                          </summary>
                          <p className="mt-1 pl-4">{emissie.testmethode}</p>
                        </details>
                      )}
                      <p className="text-xs text-muted-foreground">Bron: {emissie.bron}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Bedrijfsclaims */}
          <TabsContent value="claims" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Bedrijfsclaims
                  <Badge variant="secondary">{product.bedrijfsclaims.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(claimsByType).map(([claimType, items]) => (
                    <AccordionItem key={claimType} value={claimType}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>{claimType}</span>
                          <Badge variant="secondary">{items.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {items.map((claim, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-muted/30 space-y-1">
                              <p className="text-sm">{claim.waarde}</p>
                              <p className="text-xs text-muted-foreground">Bron: {claim.bron}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
