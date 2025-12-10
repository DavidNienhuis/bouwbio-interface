import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, AlertTriangle, Info, Leaf, FlaskConical, Award, Database, FileText, Shield, Quote } from "lucide-react";
import { SourceLink } from "@/components/SourceLink";
import { useSourceFiles } from "@/components/SourceFilesContext";
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

const getStofLijstBadge = (lijst: string) => {
  switch (lijst.toLowerCase()) {
    case 'clean':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">Clean</Badge>;
    case 'watch':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">Watch</Badge>;
    case 'priority':
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200">Priority</Badge>;
    case 'banned':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">Banned</Badge>;
    default:
      return <Badge variant="outline">{lijst}</Badge>;
  }
};

const getStofStatusBadge = (status: string) => {
  if (status === 'HIT') {
    return <Badge variant="destructive" className="ml-2">🚨 HIT</Badge>;
  } else if (status === 'OK' || status === 'NO_HIT') {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 ml-2">✓ {status === 'NO_HIT' ? 'Geen hit' : 'OK'}</Badge>;
  }
  return <Badge variant="outline" className="ml-2">{status}</Badge>;
};

export const BouwbiologischAdviesDisplay = ({ data }: BouwbiologischAdviesDisplayProps) => {
  const { sourceFiles } = useSourceFiles();
  
  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Hero Advies Card */}
      <Card className={`border-2 ${getAdviesColor(data.advies.kleur)} shadow-lg`}>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                {getAdviesIcon(data.advies.kleur)}
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-background border-2 border-current flex items-center justify-center text-xs font-bold">
                  {data.advies.niveau}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{data.advies.label}</h2>
                <Badge variant="outline" className="text-sm">
                  Route: {data.advies.route}
                </Badge>
              </div>
              <p className="text-lg leading-relaxed">
                {data.advies.bouwbioloog_toelichting}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <FlaskConical className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-semibold mb-1">Emissies</div>
            {getEmissieStatusBadge(data.scores.emissies.status)}
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-semibold mb-1">Toxicologie</div>
            {getToxStatusBadge(data.scores.toxicologie.tox_status)}
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-semibold mb-1">Certificaten</div>
            {getCertificaatStatusBadge(data.scores.certificaten.status)}
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-semibold mb-1">Info Dekking</div>
            <Badge variant={data.scores.informatie_dekking === 'voldoende' ? 'default' : 'secondary'}>
              {data.scores.informatie_dekking === 'voldoende' ? 'Voldoende' : 'Onvoldoende'}
            </Badge>
          </CardContent>
        </Card>
      </div>

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
            <span>{data.product.identificatie.naam || 'Niet gespecificeerd'}</span>
          </div>
          <div>
            <span className="font-semibold">Productgroep: </span>
            <span>{data.product.identificatie.productgroep || 'Niet gespecificeerd'}</span>
          </div>
          {data.product.identificatie.norm && (
            <div>
              <span className="font-semibold">Norm: </span>
              <Badge variant="outline">{data.product.identificatie.norm}</Badge>
            </div>
          )}
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
                <div className="space-y-4 pt-2">
                  {Array.isArray(data.scores.emissies.details) ? (
                    // Array formaat (nieuw format met stof, gemeten_waarde, oordeel)
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Emissiewaarden:</h4>
                      <div className="space-y-2">
                        {data.scores.emissies.details.map((item, idx) => (
                          <Card key={idx} className="bg-muted/30">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{item.stof}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">{item.gemeten_waarde}</span>
                                  <Badge variant="outline">{item.oordeel}</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Object formaat (origineel format)
                    <>
                      {/* Conclusie Badge */}
                      {data.scores.emissies.details.conclusie && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Conclusie:</span>
                          <Badge variant="outline">{data.scores.emissies.details.conclusie}</Badge>
                        </div>
                      )}
                      
                      {/* Toelichting */}
                      {data.scores.emissies.details.toelichting && (
                        <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <AlertDescription className="text-sm">
                            {data.scores.emissies.details.toelichting}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Gevonden Waarnemingen/Waarden */}
                      {((data.scores.emissies.details.gevonden_waarnemingen && data.scores.emissies.details.gevonden_waarnemingen.length > 0) ||
                        (data.scores.emissies.details.gevonden_waarden && data.scores.emissies.details.gevonden_waarden.length > 0)) ? (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Gevonden Emissiewaarden:</h4>
                          <div className="space-y-2">
                            {(data.scores.emissies.details.gevonden_waarnemingen || data.scores.emissies.details.gevonden_waarden || []).map((waarde, idx) => (
                              <Card key={idx} className="bg-muted/30">
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{waarde.component || 'Onbekend'}</span>
                                    <span className="font-mono text-sm">
                                      {waarde.waarde !== undefined ? `${waarde.waarde} ${waarde.eenheid || ''}` : 'Geen waarde'}
                                    </span>
                                  </div>
                                  {waarde.bron && (
                                    <div className="mt-1">
                                      <SourceLink bron={waarde.bron} sourceFiles={sourceFiles} />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Alert className="bg-muted/30">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Geen emissiewaarden gevonden
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Toxicologie */}
            <AccordionItem value="toxicologie" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Toxicologie</span>
                  {getToxStatusBadge(data.scores.toxicologie.tox_status)}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 space-y-4">
                  {/* Conclusie */}
                  {data.scores.toxicologie.conclusie && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Conclusie:</span>
                      <Badge variant="outline">{data.scores.toxicologie.conclusie}</Badge>
                    </div>
                  )}
                  
                  {data.scores.toxicologie.samenvatting && (
                    <Alert>
                      <AlertDescription className="whitespace-pre-wrap">
                        {data.scores.toxicologie.samenvatting}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {data.scores.toxicologie.gecheckte_stoffen && data.scores.toxicologie.gecheckte_stoffen.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Gecontroleerde Stoffen ({data.scores.toxicologie.gecheckte_stoffen.length})
                      </h4>
                      <div className="space-y-2">
                        {data.scores.toxicologie.gecheckte_stoffen.map((stof, idx) => (
                          <Card 
                            key={idx} 
                            className={`${
                              stof.status === 'HIT' 
                                ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' 
                                : 'bg-muted/30'
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                  <div className="font-medium">{stof.naam || `CAS: ${stof.cas}`}</div>
                                  {stof.naam && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      CAS: {stof.cas}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {stof.lijst ? getStofLijstBadge(stof.lijst) : <Badge variant="outline">Geen match</Badge>}
                                  {getStofStatusBadge(stof.status)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    !data.scores.toxicologie.samenvatting && !data.scores.toxicologie.conclusie && (
                      <Alert className="bg-muted/30">
                        <AlertDescription>
                          <Info className="inline h-4 w-4 mr-2" />
                          Geen toxicologische informatie beschikbaar
                        </AlertDescription>
                      </Alert>
                    )
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
                <div className="space-y-4 pt-2">
                  {/* Conclusie */}
                  {data.scores.certificaten.conclusie && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Conclusie:</span>
                      <Badge variant="outline">{data.scores.certificaten.conclusie}</Badge>
                    </div>
                  )}
                  
                  {data.scores.certificaten.gevonden_certificaten && data.scores.certificaten.gevonden_certificaten.length > 0 ? (
                    <div className="space-y-3">
                      {data.scores.certificaten.gevonden_certificaten.map((cert, idx) => (
                        <Card key={idx} className="border-2 bg-gradient-to-br from-background to-muted/30">
                          <CardContent className="p-4 space-y-3">
                            {/* Certificaat Header */}
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-start gap-2">
                                <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <h4 className="font-semibold text-lg">{cert.naam}</h4>
                              </div>
                              {cert.status_gn22_general && (
                                <Badge 
                                  variant={cert.status_gn22_general === 'Ja' ? 'default' : 'secondary'}
                                  className={cert.status_gn22_general === 'Ja' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' 
                                    : ''}
                                >
                                  GN22: {cert.status_gn22_general}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Bewijs uit PDF */}
                            {cert.bewijs_uit_pdf && (
                              <div className="pl-7">
                                <div className="flex items-start gap-2 text-sm text-muted-foreground italic border-l-2 border-muted-foreground/20 pl-3 py-1">
                                  <Quote className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                  <span>"{cert.bewijs_uit_pdf}"</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Toelichting Norm */}
                            {cert.toelichting_norm && (
                              <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertDescription className="text-sm">
                                  {cert.toelichting_norm}
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert className="bg-muted/30">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Geen certificaten gevonden
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
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
