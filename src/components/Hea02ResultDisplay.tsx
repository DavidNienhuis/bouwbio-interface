import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldX,
  TestTube,
  Beaker,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import type { Hea02Result } from "@/lib/webhookClient";

interface Hea02ResultDisplayProps {
  data: Hea02Result;
}

export function Hea02ResultDisplay({ data }: Hea02ResultDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCert, setSelectedCert] = useState<{
    feit: Hea02Result['certificaten']['feiten'][0];
    norm?: Hea02Result['certificaten']['normatief'][0];
  } | null>(null);
  const [selectedEmissie, setSelectedEmissie] = useState<{
    feit: Hea02Result['emissies']['feiten'][0];
    norm?: Hea02Result['emissies']['normatief'][0];
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusConfig = (status: Hea02Result['samenvatting']['status']) => {
    switch (status) {
      case 'voldoet':
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600',
          bgClass: 'bg-green-50 border-green-500'
        };
      case 'voldoet_niet':
        return {
          icon: <XCircle className="w-5 h-5" />,
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600',
          bgClass: 'bg-red-50 border-red-500'
        };
      case 'onduidelijk':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          variant: 'secondary' as const,
          className: 'bg-orange-500 hover:bg-orange-600 text-white',
          bgClass: 'bg-orange-50 border-orange-500'
        };
      case 'risico_bij_hoeveelheid':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          variant: 'secondary' as const,
          className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          bgClass: 'bg-yellow-50 border-yellow-500'
        };
    }
  };

  const statusConfig = getStatusConfig(data.samenvatting.status);

  return (
    <div className="space-y-6">
      {/* Summary Card (Hero Section) */}
      <Card className={`border-2 ${statusConfig.bgClass}`}>
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Badge className={statusConfig.className}>
              {statusConfig.icon}
              <span className="ml-2">{data.samenvatting.status.replace(/_/g, ' ').toUpperCase()}</span>
            </Badge>
          </div>
          <CardTitle className="text-2xl">{data.samenvatting.korte_toelichting}</CardTitle>
        </CardHeader>
        
        {data.samenvatting.belangrijkste_risicos.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Belangrijkste Risico's:
              </h4>
              <ul className="space-y-2">
                {data.samenvatting.belangrijkste_risicos.map((risico, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{risico}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              onClick={() => setShowDetails(!showDetails)}
              className="mt-6 w-full"
              variant="outline"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Details verbergen
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Details tonen
                </>
              )}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Certificates Panel */}
      <Collapsible open={showDetails}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                Certificaten
              </CardTitle>
              <CardDescription>
                {data.certificaten.feiten.length} certificaten gevonden
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Waarde</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.certificaten.feiten.map((feit, idx) => {
                    const norm = data.certificaten.normatief.find(n => 
                      n.schema.toLowerCase().includes(feit.waarde.toLowerCase()) ||
                      feit.waarde.toLowerCase().includes(n.schema.toLowerCase())
                    );
                    
                    return (
                      <TableRow 
                        key={idx} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCert({ feit, norm })}
                      >
                        <TableCell className="font-medium">{feit.type}</TableCell>
                        <TableCell>{feit.waarde}</TableCell>
                        <TableCell>
                          {norm?.erkend ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Erkend via LightRAG
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <ShieldX className="w-3 h-3 mr-1" />
                              Niet erkend
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {data.certificaten.claims.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    💬 Bedrijfsclaims
                  </h4>
                  <div className="space-y-2">
                    {data.certificaten.claims.map((claim, idx) => (
                      <Card key={idx} className="p-3 bg-muted/30">
                        <p className="text-sm">{claim.waarde}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bron: {claim.bron_bestand}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Emissions Panel */}
      <Collapsible open={showDetails}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-6 h-6" />
                Emissiewaarden
              </CardTitle>
              <CardDescription>
                Vergelijking tussen meetwaarden en grenswaarden
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Waarde (product)</TableHead>
                    <TableHead>Grenswaarde (norm)</TableHead>
                    <TableHead>Resultaat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.emissies.feiten.map((feit, idx) => {
                    const norm = data.emissies.normatief.find(n => 
                      n.parameter === feit.parameter
                    );
                    
                    const withinLimit = norm && feit.waarde.includes('≤');
                    
                    return (
                      <TableRow 
                        key={idx}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedEmissie({ feit, norm })}
                      >
                        <TableCell className="font-medium">{feit.parameter}</TableCell>
                        <TableCell>
                          <div>
                            {feit.waarde}
                            <p className="text-xs text-muted-foreground">
                              {feit.tijdstip}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {norm ? norm.grenswaarde : '-'}
                        </TableCell>
                        <TableCell>
                          {withinLimit ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              OK
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Check
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {selectedEmissie && (
                <Card className="mt-4 p-4 bg-muted/30">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">📄 Productcitaat</h4>
                      <blockquote className="text-sm italic border-l-4 border-blue-500 pl-3 py-2">
                        "{selectedEmissie.feit.bron_citaat}"
                      </blockquote>
                      <p className="text-xs text-muted-foreground mt-2">
                        Testmethode: {selectedEmissie.feit.testmethode}
                      </p>
                    </div>
                    {selectedEmissie.norm && (
                      <div>
                        <h4 className="font-semibold mb-2">📋 Normcitaat</h4>
                        <blockquote className="text-sm italic border-l-4 border-green-500 pl-3 py-2">
                          "{selectedEmissie.norm.source_citaat}"
                        </blockquote>
                      </div>
                    )}
                  </div>
                </Card>
              )}
              
              {data.emissies.claims.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    💬 Emissie Claims
                  </h4>
                  <div className="space-y-2">
                    {data.emissies.claims.map((claim, idx) => (
                      <Card key={idx} className="p-3 bg-muted/30">
                        <p className="text-sm">{claim.waarde}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bron: {claim.bron_bestand}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Substances Panel */}
      <Collapsible open={showDetails}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-6 h-6" />
                Stoffen
              </CardTitle>
              <CardDescription>
                {data.stoffen.inhoudstoffen_cas.length} stoffen geïdentificeerd
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <Input 
                  placeholder="🔍 Zoek op stofnaam of CAS nummer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                {data.stoffen.inhoudstoffen_cas
                  .filter(stof => 
                    stof.stof.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stof.cas.includes(searchTerm)
                  )
                  .map((stof, idx) => (
                    <Card 
                      key={idx} 
                      className={`p-4 transition-all hover:shadow-md ${
                        stof.gevaren.length > 0 
                          ? 'border-l-4 border-l-orange-500' 
                          : 'border-l-4 border-l-green-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {stof.cas} – {stof.stof}
                          </h4>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            Rol: {stof.rol}
                          </p>
                          
                          {stof.gevaren.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {stof.gevaren.map((gevaar, gIdx) => (
                                <Badge 
                                  key={gIdx} 
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {gevaar}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <Button 
                            variant="link" 
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() => window.open(stof.bron_bestand, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Bron: {stof.bron_bestand.split('/').pop()}
                          </Button>
                          
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                              Citaat tonen
                            </summary>
                            <blockquote className="mt-2 text-sm italic border-l-4 border-muted-foreground pl-3 py-1">
                              "{stof.bron_citaat}"
                            </blockquote>
                          </details>
                        </div>
                        
                        <div>
                          {stof.gevaren.length > 0 ? (
                            <AlertTriangle className="w-8 h-8 text-orange-500" />
                          ) : (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Certificate Detail Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedCert && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  📄 Productinformatie
                </h3>
                <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="mb-2">
                    <Badge variant="outline">{selectedCert.feit.type}</Badge>
                  </div>
                  <p className="font-semibold mb-2">{selectedCert.feit.waarde}</p>
                  <blockquote className="text-sm italic border-l-4 border-blue-500 pl-3 py-2">
                    "{selectedCert.feit.bron_citaat}"
                  </blockquote>
                  <Button 
                    variant="link" 
                    className="mt-3 p-0"
                    onClick={() => window.open(selectedCert.feit.bron_bestand, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open bronbestand
                  </Button>
                </Card>
              </div>
              
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  📋 BREEAM Norm
                </h3>
                {selectedCert.norm ? (
                  <Card className="p-4 bg-green-50/50 dark:bg-green-950/20">
                    <div className="flex gap-2 mb-3">
                      <Badge>{selectedCert.norm.schema}</Badge>
                      <Badge variant="outline">{selectedCert.norm.credit}</Badge>
                      <Badge variant="outline">{selectedCert.norm.niveau}</Badge>
                    </div>
                    {selectedCert.norm.erkend && (
                      <Badge className="bg-green-500 hover:bg-green-600 mb-3">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Erkend via LightRAG
                      </Badge>
                    )}
                    <p className="text-sm font-medium mb-2">{selectedCert.norm.reden}</p>
                    <blockquote className="text-sm italic border-l-4 border-green-500 pl-3 py-2">
                      "{selectedCert.norm.source_citaat}"
                    </blockquote>
                    <Button 
                      variant="link"
                      className="mt-3 p-0"
                      onClick={() => window.open(selectedCert.norm!.source_pdf, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open normdocument ({selectedCert.norm.source_locatie})
                    </Button>
                  </Card>
                ) : (
                  <p className="text-muted-foreground">Geen normatieve referentie gevonden</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
