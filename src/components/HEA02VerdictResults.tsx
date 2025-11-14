import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export interface HEA02ProductData {
  inhoudstoffen: Array<{
    type: string;
    waarde: string;
    bron: string;
  }>;
  certificaten: Array<{
    type: string;
    waarde: string;
    bron: string;
  }>;
  emissiewaardes: Array<{
    type: string;
    waarde: string;
    bron: string;
  }>;
}

export interface HEA02VerdictData {
  product: HEA02ProductData;
  hea02_verdict: {
    status: string;
    reden: string;
    audit_proof: Array<{
      type: string;
      waarde: string;
      bron: string;
    }>;
  };
}

interface HEA02VerdictResultsProps {
  data: HEA02VerdictData;
}

const glassmorphism = {
  background: 'hsla(var(--panel), 0.85)',
  backdropFilter: 'blur(20px)',
  border: '1px solid hsla(var(--line), 0.3)',
  boxShadow: 'var(--shadow)'
};

export const HEA02VerdictResults = ({ data }: HEA02VerdictResultsProps) => {
  const voldoet = data.hea02_verdict.status.toLowerCase() === 'voldoet';

  return (
    <div className="space-y-6">
      {/* Verdict Status Card */}
      <Card style={glassmorphism}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {voldoet ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span style={{ color: 'hsl(var(--success))' }}>Product Voldoet</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600" />
                <span style={{ color: 'hsl(var(--error))' }}>Product Voldoet Niet</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'hsl(var(--ink))' }}>
                Reden
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'hsla(var(--ink), 0.85)' }}>
                {data.hea02_verdict.reden}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Proof Card */}
      {data.hea02_verdict.audit_proof && data.hea02_verdict.audit_proof.length > 0 && (
        <Card style={glassmorphism}>
          <CardHeader>
            <CardTitle style={{ color: 'hsl(var(--ink))' }}>Audit Bewijs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.hea02_verdict.audit_proof.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-lg"
                  style={{ 
                    background: 'hsla(var(--accent), 0.05)',
                    border: '1px solid hsla(var(--line), 0.2)'
                  }}
                >
                  <Badge variant="outline" className="mb-2">
                    {item.type}
                  </Badge>
                  <p className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--ink))' }}>
                    {item.waarde}
                  </p>
                  <p className="text-xs" style={{ color: 'hsla(var(--ink), 0.6)' }}>
                    Bron: {item.bron}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Details */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Certificaten */}
        {data.product.certificaten && data.product.certificaten.length > 0 && (
          <Card style={glassmorphism}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: 'hsl(var(--ink))' }}>
                Certificaten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.product.certificaten.map((cert, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium" style={{ color: 'hsl(var(--ink))' }}>
                      {cert.waarde}
                    </p>
                    <p className="text-xs" style={{ color: 'hsla(var(--ink), 0.6)' }}>
                      {cert.bron}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emissiewaarden */}
        {data.product.emissiewaardes && data.product.emissiewaardes.length > 0 && (
          <Card style={glassmorphism}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: 'hsl(var(--ink))' }}>
                Emissiewaarden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.product.emissiewaardes.map((emissie, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium mono" style={{ color: 'hsl(var(--ink))' }}>
                      {emissie.waarde}
                    </p>
                    <p className="text-xs" style={{ color: 'hsla(var(--ink), 0.6)' }}>
                      {emissie.bron}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inhoudstoffen */}
        {data.product.inhoudstoffen && data.product.inhoudstoffen.length > 0 && (
          <Card style={glassmorphism}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: 'hsl(var(--ink))' }}>
                Inhoudstoffen ({data.product.inhoudstoffen.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.product.inhoudstoffen.map((stof, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-medium" style={{ color: 'hsl(var(--ink))' }}>
                      {stof.waarde}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
