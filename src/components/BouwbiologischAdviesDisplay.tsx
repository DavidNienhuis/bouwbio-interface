import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, AlertTriangle, Info, Leaf, FlaskConical, Award, Database } from "lucide-react";
import type { BouwbiologischAdviesData } from "@/lib/webhookClient";

interface BouwbiologischAdviesDisplayProps {
  data: BouwbiologischAdviesData;
}

const getAdviesColor = (kleur: string) => {
  switch (kleur) {
    case 'groen':
      return 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800';
    case 'geel':
      return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800';
    case 'oranje':
      return 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800';
    case 'rood':
      return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800';
    default:
      return 'bg-muted/30 border-border';
  }
};

const getAdviesIcon = (kleur: string) => {
  switch (kleur) {
    case 'groen':
      return <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />;
    case 'geel':
      return <Info className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />;
    case 'oranje':
      return <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />;
    case 'rood':
      return <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />;
    default:
      return <Info className="h-8 w-8 text-muted-foreground" />;
  }
};

const getToxStatusBadge = (status: string) => {
  switch (status) {
    case 'clean':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">Clean</Badge>;
    case 'watch':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">Watch</Badge>;
    case 'priority':
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200">Priority</Badge>;
    case 'banned':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">Banned</Badge>;
    default:
      return <Badge variant="secondary">Onbekend</Badge>;
  }
};

const getEmissieStatusBadge = (status: string) => {
  switch (status) {
    case 'voldoet':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">Voldoet</Badge>;
    case 'voldoet_niet':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">Voldoet niet</Badge>;
    case 'risico':
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200">Risico</Badge>;
    case 'risico_bij_grote_hoeveelheden':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">Risico bij grote hoeveelheden</Badge>;
    case 'missende_informatie':
      return <Badge variant="secondary">Missende informatie</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getCertificaatStatusBadge = (status: string) => {
  switch (status) {
    case 'erkend':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">Erkend</Badge>;
    case 'niet_erkend':
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200">Niet erkend</Badge>;
    case 'geen_certificaten':
      return <Badge variant="secondary">Geen certificaten</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const BouwbiologischAdviesDisplay = ({ data }: BouwbiologischAdviesDisplayProps) => {
  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Product Identificatie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Product Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-semibold">Product: </span>
            <span>{data.product.identificatie.naam}</span>
          </div>
          <div>
            <span className="font-semibold">Productgroep: </span>
            <span>{data.product.identificatie.productgroep}</span>
          </div>
          <div>
            <span className="font-semibold">Norm: </span>
            <Badge variant="outline">{data.product.identificatie.norm}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bouwbiologisch Advies - Prominent */}
      <Card className={`border-2 ${getAdviesColor(data.advies.kleur)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getAdviesIcon(data.advies.kleur)}
            <div>
              <div className="text-xl">Bouwbiologisch Advies</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Niveau {data.advies.niveau} • Route: {data.advies.route}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="outline" className="text-base px-4 py-1">
              {data.advies.label}
            </Badge>
          </div>
          <Alert className="bg-background/50">
            <AlertDescription className="text-base leading-relaxed">
              {data.advies.bouwbioloog_toelichting}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Scores Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Gedetailleerde Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-4">
            {/* Emissies */}
            <AccordionItem value="emissies" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Emissies</span>
                  {getEmissieStatusBadge(data.scores.emissies.status)}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {data.scores.emissies.details && data.scores.emissies.details.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {data.scores.emissies.details.map((detail, idx) => (
                      <Card key={idx} className="bg-muted/30">
                        <CardContent className="p-3">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(detail, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert className="bg-muted/30">
                    <AlertDescription>
                      <Info className="inline h-4 w-4 mr-2" />
                      Geen gedetailleerde emissie-informatie beschikbaar
                    </AlertDescription>
                  </Alert>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Toxicologie */}
            <AccordionItem value="toxicologie" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Toxicologie</span>
                  {getToxStatusBadge(data.scores.toxicologie.tox_status)}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  {data.scores.toxicologie.samenvatting ? (
                    <Alert>
                      <AlertDescription className="whitespace-pre-wrap">
                        {data.scores.toxicologie.samenvatting}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-muted/30">
                      <AlertDescription>
                        <Info className="inline h-4 w-4 mr-2" />
                        Geen toxicologische samenvatting beschikbaar
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Certificaten */}
            <AccordionItem value="certificaten" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Certificaten</span>
                  {getCertificaatStatusBadge(data.scores.certificaten.status)}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {data.scores.certificaten.gevonden_certificaten && data.scores.certificaten.gevonden_certificaten.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {data.scores.certificaten.gevonden_certificaten.map((cert, idx) => (
                      <Card key={idx} className="bg-muted/30">
                        <CardContent className="p-3">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(cert, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert className="bg-muted/30">
                    <AlertDescription>
                      <Info className="inline h-4 w-4 mr-2" />
                      Geen certificaten gevonden
                    </AlertDescription>
                  </Alert>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Informatie Dekking */}
            <AccordionItem value="informatie" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Informatie Dekking</span>
                  <Badge variant={data.scores.informatie_dekking === 'voldoende' ? 'default' : 'secondary'}>
                    {data.scores.informatie_dekking === 'voldoende' ? 'Voldoende' : 'Onvoldoende'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Alert variant={data.scores.informatie_dekking === 'voldoende' ? 'default' : 'destructive'}>
                  <AlertDescription>
                    {data.scores.informatie_dekking === 'voldoende' 
                      ? 'De beschikbare documentatie biedt voldoende informatie voor een betrouwbare beoordeling.'
                      : 'De beschikbare documentatie is onvoldoende voor een volledige beoordeling. Aanvullende informatie is vereist.'}
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
