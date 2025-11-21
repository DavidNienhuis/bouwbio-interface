import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { DetailedProductAnalysis as ProductAnalysisType } from "@/lib/webhookClient";

interface DetailedProductAnalysisProps {
  data: ProductAnalysisType;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'voldoet':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'voldoet_niet':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'onduidelijk':
      return <HelpCircle className="h-5 w-5 text-yellow-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'voldoet':
      return 'bg-green-50 border-green-200';
    case 'voldoet_niet':
      return 'bg-red-50 border-red-200';
    case 'onduidelijk':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const DetailedProductAnalysis = ({ data }: DetailedProductAnalysisProps) => {
  const inhoudsstoffen = data.product.inhoudsstoffen || [];
  const claims = data.product.claims || [];
  const certificaten = data.product.certificaten || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Card */}
      <Card className={`border-2 ${getStatusColor(data.beoordeling.compliance_status)}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl">{data.productnaam}</CardTitle>
              <CardDescription className="text-base">
                {data.productgroep} • {data.fabrikant}
              </CardDescription>
            </div>
            {getStatusIcon(data.beoordeling.compliance_status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Norm</div>
              <Badge variant="outline" className="text-base">{data.norm}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Beoordeling</div>
              <Alert>
                <AlertDescription className="text-base">
                  <strong>Status:</strong> {data.beoordeling.compliance_status}
                  <br />
                  <strong>Route:</strong> {data.beoordeling.route}
                  <br />
                  <strong>Reden:</strong> {data.beoordeling.reden}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accordion Sections */}
      <Accordion type="multiple" className="space-y-4" defaultValue={["inhoudsstoffen", "vos"]}>
        {/* Inhoudsstoffen */}
        <AccordionItem value="inhoudsstoffen" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">Inhoudsstoffen</span>
              <Badge variant="secondary">{inhoudsstoffen.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {inhoudsstoffen.map((stof, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-base">{stof.naam}</CardTitle>
                    <CardDescription>
                      CAS: {stof.cas_nummer} • Concentratie: {stof.concentratie}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">CLP Classificatie:</span>
                        <p className="text-sm text-muted-foreground">{stof.clp_classificatie}</p>
                      </div>
                      {stof.h_zinnen.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">H-zinnen:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {stof.h_zinnen.map((h, i) => (
                              <Badge key={i} variant="outline">{h}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* VOC Gehalte */}
        {data.product.vos_gehalte && (
          <AccordionItem value="vos" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">VOC Gehalte</span>
                {data.product.vos_gehalte.voldoet ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{data.product.vos_gehalte.waarde}</div>
                      <div className="text-sm text-muted-foreground">{data.product.vos_gehalte.eenheid}</div>
                      <div className="text-xs text-muted-foreground mt-1">Gemeten</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{data.product.vos_gehalte.grenswaarde}</div>
                      <div className="text-sm text-muted-foreground">{data.product.vos_gehalte.eenheid}</div>
                      <div className="text-xs text-muted-foreground mt-1">Grenswaarde</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {data.product.vos_gehalte.voldoet ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {data.product.vos_gehalte.voldoet ? 'Voldoet' : 'Voldoet niet'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Certificaten */}
        {certificaten.length > 0 && (
          <AccordionItem value="certificaten" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Certificaten</span>
                <Badge variant="secondary">{certificaten.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-4">
                {certificaten.map((cert, idx) => (
                  <Badge key={idx} variant="outline" className="mr-2">
                    {cert}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Claims */}
        {claims.length > 0 && (
          <AccordionItem value="claims" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Product Claims</span>
                <Badge variant="secondary">{claims.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-4">
                {claims.map((claim, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{claim}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Emissies */}
        <AccordionItem value="emissies" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">Emissies</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="mt-4">
              <CardContent className="pt-6 space-y-2">
                <div>
                  <span className="text-sm font-medium">Methode:</span>
                  <span className="text-sm text-muted-foreground ml-2">{data.emissies.methode}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Testrapport aanwezig:</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {data.emissies.testrapport_aanwezig ? 'Ja' : 'Nee'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* LightRAG Vragen */}
        {data.lightrag_vragen && (
          <AccordionItem value="lightrag" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Aanbevolen Verificatie Vragen</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {data.lightrag_vragen.emissienormen.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Emissienormen:</div>
                    <div className="space-y-2">
                      {data.lightrag_vragen.emissienormen.map((vraag, idx) => (
                        <Alert key={idx}>
                          <AlertDescription className="text-sm">{vraag}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
