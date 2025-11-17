import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
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
  ChevronUp
} from "lucide-react";
import type { Hea02Result } from "@/lib/webhookClient";

interface Hea02ResultDisplayProps {
  data: Hea02Result;
}

export function Hea02ResultDisplay({ data }: Hea02ResultDisplayProps) {
  // Defensive defaults
  const certificaten = data.certificaten || [];
  const emissies = data.emissies || [];
  const stoffen = data.stoffen || [];
  const opmerkingen = data.samenvatting.opmerkingen || [];
  
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCert, setSelectedCert] = useState<typeof certificaten[0] | null>(null);
  const [selectedEmissie, setSelectedEmissie] = useState<typeof emissies[0] | null>(null);
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
          <CardTitle className="text-2xl">{data.samenvatting.reden}</CardTitle>
        </CardHeader>
        
        {opmerkingen.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Opmerkingen:
              </h4>
              <ul className="space-y-2">
                {opmerkingen.map((opmerking, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{opmerking}</span>
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
                {certificaten.length} certificaten gevonden
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schema</TableHead>
                    <TableHead>Bewijs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bron</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificaten.map((cert, idx) => {
                    const isErkend = cert.status.toLowerCase().includes('ja');
                    
                    return (
                      <TableRow 
                        key={idx} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCert(cert)}
                      >
                        <TableCell className="font-medium">{cert.schema}</TableCell>
                        <TableCell>{cert.bewijs}</TableCell>
                        <TableCell>
                          {isErkend ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Erkend
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <ShieldX className="w-3 h-3 mr-1" />
                              {cert.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {cert.bron}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                    <TableHead>Component</TableHead>
                    <TableHead>Waarde</TableHead>
                    <TableHead>Grenswaarde</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emissies.map((emissie, idx) => {
                    const isNvt = emissie.status.toLowerCase() === 'nvt';
                    const isOk = emissie.waarde !== null && emissie.waarde <= emissie.grens;
                    
                    return (
                      <TableRow 
                        key={idx}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedEmissie(emissie)}
                      >
                        <TableCell className="font-medium">{emissie.component}</TableCell>
                        <TableCell>
                          {emissie.waarde !== null ? emissie.waarde : '-'}
                        </TableCell>
                        <TableCell>
                          ≤ {emissie.grens}
                        </TableCell>
                        <TableCell>
                          {isNvt ? (
                            <Badge variant="outline">
                              N.v.t.
                            </Badge>
                          ) : isOk ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
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
                  <div className="space-y-2">
                    <h4 className="font-semibold">📋 Details</h4>
                    <p className="text-sm">
                      <span className="font-medium">Component:</span> {selectedEmissie.component}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {selectedEmissie.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Bron:</span> {selectedEmissie.bron}
                    </p>
                  </div>
                </Card>
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
                {stoffen.length} stoffen geïdentificeerd
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
                {stoffen
                  .filter(stof =>
                    stof.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stof.cas.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((stof, idx) => (
                    <Card 
                      key={idx} 
                      className="p-4 transition-all hover:shadow-md border-l-4 border-l-blue-500"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {stof.naam}
                          </h4>
                          
                          {stof.cas && (
                            <p className="text-sm text-muted-foreground">
                              CAS: {stof.cas}
                            </p>
                          )}
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            Functie: {stof.functie}
                          </p>
                          
                          <p className="text-xs text-muted-foreground">
                            Bron: {stof.bron}
                          </p>
                        </div>
                        
                        <div>
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCert && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Certificaat Details
                </h3>
                <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Schema</p>
                      <p className="font-semibold">{selectedCert.schema}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant={selectedCert.status.toLowerCase().includes('ja') ? 'default' : 'secondary'}>
                        {selectedCert.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bewijs</p>
                      <p className="text-sm">{selectedCert.bewijs}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bron</p>
                      <p className="text-sm">{selectedCert.bron}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
