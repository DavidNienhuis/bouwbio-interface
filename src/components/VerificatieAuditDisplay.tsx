import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, AlertTriangle, Info, Shield, FlaskConical, FileText, Award } from "lucide-react";
import { SourceLink } from "@/components/SourceLink";
import { useSourceFiles } from "@/components/SourceFilesContext";
import { VerificatieAuditData } from "@/lib/webhookClient";

interface VerificatieAuditDisplayProps {
  data: VerificatieAuditData;
}

const getStatusConfig = (status: string) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "conform" || statusLower.includes("goedgekeurd")) {
    return {
      icon: CheckCircle2,
      variant: "default" as const,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      textColor: "text-emerald-700 dark:text-emerald-300"
    };
  }
  
  if (statusLower === "niet_conform" || statusLower.includes("fail") || statusLower.includes("afgekeurd")) {
    return {
      icon: XCircle,
      variant: "destructive" as const,
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-700 dark:text-red-300"
    };
  }
  
  if (statusLower === "waarschuwing") {
    return {
      icon: AlertTriangle,
      variant: "secondary" as const,
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-700 dark:text-yellow-300"
    };
  }
  
  return {
    icon: AlertTriangle,
    variant: "secondary" as const,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-700 dark:text-amber-300"
  };
};

const getRedListBadgeConfig = (check: string) => {
  switch (check) {
    case 'clean':
      return { variant: "default" as const, className: "bg-green-500/10 text-green-700 border-green-500/20" };
    case 'hit_banned':
      return { variant: "destructive" as const, className: "bg-red-600 text-white" };
    case 'hit_priority':
      return { variant: "destructive" as const, className: "" };
    case 'hit_watch':
      return { variant: "secondary" as const, className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" };
    default:
      return { variant: "outline" as const, className: "" };
  }
};

export const VerificatieAuditDisplay = ({ data }: VerificatieAuditDisplayProps) => {
  const { sourceFiles } = useSourceFiles();
  
  const statusConfig = getStatusConfig(data.verificatie_audit.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Status Card */}
      <Card className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${statusConfig.bgColor}`}>
              <StatusIcon className={`h-8 w-8 ${statusConfig.textColor}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">
                {data.product.identificatie.naam}
              </CardTitle>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{data.product.identificatie.productgroep}</Badge>
                  <Badge variant="outline">{data.product.identificatie.norm}</Badge>
                  <Badge variant={statusConfig.variant}>
                    Status: {data.verificatie_audit.status}
                  </Badge>
                  <Badge variant="secondary">Route: {data.verificatie_audit.route}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className={statusConfig.borderColor}>
            <AlertDescription className="text-sm leading-relaxed">
              <strong>Reden:</strong> {data.verificatie_audit.reden}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Detailed Information Accordion */}
      <Accordion type="multiple" className="space-y-4">
        {/* Inhoudsstoffen (CAS) */}
        {data.product.inhoudstoffen_cas && data.product.inhoudstoffen_cas.length > 0 && (
          <AccordionItem value="inhoudsstoffen" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <span className="font-semibold">Inhoudsstoffen & Red List Check</span>
                <Badge variant="outline">{data.product.inhoudstoffen_cas.length} stoffen</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {data.product.inhoudstoffen_cas.map((stof, idx) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium">{stof.stofnaam || stof.naam}</h4>
                            <p className="text-sm text-muted-foreground">CAS: {stof.waarde}</p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge 
                              variant={getRedListBadgeConfig(stof.red_list_check).variant}
                              className={getRedListBadgeConfig(stof.red_list_check).className}
                            >
                              {stof.red_list_check === 'clean' ? 'Clean' :
                               stof.red_list_check === 'hit_banned' ? 'Banned' :
                               stof.red_list_check === 'hit_priority' ? 'Priority' :
                               stof.red_list_check === 'hit_watch' ? 'Watch' :
                               stof.red_list_check}
                            </Badge>
                            {stof.red_list_groep && (
                              <Badge variant="destructive" className="text-xs">
                                {stof.red_list_groep}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {stof.concentratie && (
                            <div>
                              <span className="text-muted-foreground">Concentratie:</span>
                              <span className="ml-2 font-medium">{stof.concentratie}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 font-medium">{stof.type}</span>
                          </div>
                        </div>
                        <div className="pt-1">
                          <SourceLink bron={stof.bron} sourceFiles={sourceFiles} />
                        </div>
                        {stof.opmerking && (
                          <Alert 
                            variant={stof.red_list_check === 'clean' ? 'default' : 'destructive'} 
                            className="mt-3"
                          >
                            <AlertDescription className="text-sm">
                              {stof.opmerking}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Certificaten - ALTIJD TONEN */}
        <AccordionItem value="certificaten" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-semibold">Certificaten</span>
              <Badge variant={data.product.certificaten.length > 0 ? "outline" : "secondary"}>
                {data.product.certificaten.length > 0 
                  ? `${data.product.certificaten.length} certificaten` 
                  : 'Geen data'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {data.product.certificaten.length > 0 ? (
              <div className="space-y-3 pt-2">
                {data.product.certificaten.map((cert, idx) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{cert.naam}</h4>
                          <div className="mt-1">
                            <SourceLink bron={cert.bron} sourceFiles={sourceFiles} />
                          </div>
                        </div>
                        <Badge variant={cert.status === 'erkend' ? 'default' : 'secondary'}>
                          {cert.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert variant="default" className="bg-muted/30">
                <AlertDescription>
                  <Info className="inline h-4 w-4 mr-2" />
                  Geen certificaten gevonden in de documentatie
                </AlertDescription>
              </Alert>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Emissiewaardes - ALTIJD TONEN */}
        <AccordionItem value="emissies" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Emissiewaardes</span>
              <Badge variant={data.product.emissiewaardes.length > 0 ? "outline" : "secondary"}>
                {data.product.emissiewaardes.length > 0 
                  ? `${data.product.emissiewaardes.length} componenten` 
                  : 'Geen data'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {data.product.emissiewaardes.length > 0 ? (
              <div className="space-y-3 pt-2">
                {data.product.emissiewaardes.map((emissie, idx) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{emissie.component}</h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            {emissie.waarde !== null ? (
                              <>
                                <span className="text-2xl font-bold">{emissie.waarde}</span>
                                <span className="text-sm text-muted-foreground">{emissie.eenheid}</span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">Niet gemeten</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            <SourceLink bron={emissie.bron} sourceFiles={sourceFiles} />
                          </p>
                        </div>
                        <Badge variant={emissie.status === "gevonden" ? "default" : "secondary"}>
                          {emissie.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert variant="default" className="bg-muted/30">
                <AlertDescription>
                  <Info className="inline h-4 w-4 mr-2" />
                  Geen emissiewaarden gevonden
                </AlertDescription>
              </Alert>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Normatieve Grenswaarden - ALTIJD TONEN */}
        <AccordionItem value="grenswaarden" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">Normatieve Grenswaarden</span>
              <Badge variant={data.product.normatieve_grenswaarden.length > 0 ? "outline" : "secondary"}>
                {data.product.normatieve_grenswaarden.length > 0 
                  ? `${data.product.normatieve_grenswaarden.length} limieten` 
                  : 'Geen data'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {data.product.normatieve_grenswaarden.length > 0 ? (
              <div className="space-y-3 pt-2">
                {data.product.normatieve_grenswaarden.map((grens, idx) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{grens.component}</h4>
                          {grens.norm && <Badge variant="outline">{grens.norm}</Badge>}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-muted-foreground">Limiet:</span>
                          <span className="text-xl font-bold">{grens.waarde || grens.limiet}</span>
                          <span className="text-sm text-muted-foreground">{grens.eenheid}</span>
                        </div>
                        <div className="mt-1">
                          <SourceLink bron={grens.bron} sourceFiles={sourceFiles} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert variant="default" className="bg-muted/30">
                <AlertDescription>
                  <Info className="inline h-4 w-4 mr-2" />
                  Geen normatieve grenswaarden gevonden
                </AlertDescription>
              </Alert>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Advies & Opmerkingen */}
        {data.verificatie_audit.advies_opmerkingen && data.verificatie_audit.advies_opmerkingen.length > 0 && (
          <AccordionItem value="advies" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-semibold">Advies & Aanbevelingen</span>
                <Badge variant="outline">{data.verificatie_audit.advies_opmerkingen.length} punten</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {data.verificatie_audit.advies_opmerkingen.map((advies, idx) => (
                  <Alert key={idx} className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <AlertDescription className="text-sm leading-relaxed">
                      {advies}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Audit Proof */}
        {data.verificatie_audit.audit_proof && data.verificatie_audit.audit_proof.length > 0 && (
          <AccordionItem value="audit" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold">Audit Bewijs</span>
                <Badge variant="outline">{data.verificatie_audit.audit_proof.length} items</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {data.verificatie_audit.audit_proof.map((proof, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-md">
                    <p className="text-sm font-mono">{proof}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
