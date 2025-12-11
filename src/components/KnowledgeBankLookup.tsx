import { KnowledgeBankEntry } from "@/hooks/useKnowledgeBank";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Clock, CheckCircle, AlertTriangle, Eye, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface KnowledgeBankLookupProps {
  entry: KnowledgeBankEntry | null;
  isLoading: boolean;
  onUseExisting: () => void;
  onNewValidation: () => void;
}

export function KnowledgeBankLookup({ 
  entry, 
  isLoading, 
  onUseExisting, 
  onNewValidation 
}: KnowledgeBankLookupProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse" style={{ 
        border: '1px solid hsla(var(--accent), 0.3)',
        background: 'linear-gradient(135deg, hsla(var(--accent), 0.05), hsla(var(--accent), 0.02))'
      }}>
        <CardContent className="p-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(var(--accent))' }} />
          <span style={{ color: 'hsl(var(--ink))' }}>Kennisbank doorzoeken...</span>
        </CardContent>
      </Card>
    );
  }

  if (!entry) return null;

  const getAdviesColor = (kleur: string | null) => {
    switch (kleur) {
      case 'groen': return 'hsl(var(--success))';
      case 'oranje': return 'hsl(45 93% 47%)';
      case 'rood': return 'hsl(0 84% 60%)';
      default: return 'hsl(var(--ink))';
    }
  };

  const getAdviesIcon = (kleur: string | null) => {
    switch (kleur) {
      case 'groen': return <CheckCircle className="w-5 h-5" />;
      case 'rood': return <AlertTriangle className="w-5 h-5" />;
      default: return <Eye className="w-5 h-5" />;
    }
  };

  return (
    <Card style={{ 
      border: '2px solid hsla(var(--success), 0.4)',
      background: 'linear-gradient(135deg, hsla(var(--success), 0.08), hsla(var(--accent), 0.05))',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), 0 0 20px hsla(var(--success), 0.1)'
    }}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading flex items-center gap-3 text-lg">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              background: 'linear-gradient(135deg, hsla(var(--success), 0.2), hsla(var(--accent), 0.15))',
              border: '1px solid hsla(var(--success), 0.3)'
            }}
          >
            <Database className="w-5 h-5" style={{ color: 'hsl(var(--success))' }} />
          </div>
          <span style={{ color: 'hsl(var(--success))' }}>KENNISBANK DATA GEVONDEN</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p style={{ color: 'hsl(var(--ink))', fontSize: '0.95rem' }}>
          Dit product <strong>(EAN: {entry.ean_code})</strong> is{' '}
          <strong>{entry.validation_count}x</strong> eerder gevalideerd.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--accent))' }}>
              Laatste validatie
            </p>
            <p className="flex items-center gap-2" style={{ color: 'hsl(var(--ink))' }}>
              <Clock className="w-4 h-4" style={{ color: 'hsl(var(--accent))' }} />
              {format(new Date(entry.last_validated_at), 'd MMMM yyyy', { locale: nl })}
            </p>
          </div>

          {entry.advies_niveau && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--accent))' }}>
                Resultaat
              </p>
              <p className="flex items-center gap-2" style={{ color: getAdviesColor(entry.advies_kleur) }}>
                {getAdviesIcon(entry.advies_kleur)}
                Niveau {entry.advies_niveau} - {entry.advies_label || 'Zie details'}
              </p>
            </div>
          )}
        </div>

        {/* Scores */}
        {(entry.emissie_score !== null || entry.toxicologie_score !== null || entry.certificaten_score !== null) && (
          <div className="flex gap-4 pt-2">
            {entry.emissie_score !== null && (
              <div className="text-center px-4 py-2 rounded-lg" style={{ background: 'hsla(var(--bg), 0.5)' }}>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--ink))' }}>{entry.emissie_score}</p>
                <p className="text-xs" style={{ color: 'hsl(var(--accent))' }}>Emissies</p>
              </div>
            )}
            {entry.toxicologie_score !== null && (
              <div className="text-center px-4 py-2 rounded-lg" style={{ background: 'hsla(var(--bg), 0.5)' }}>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--ink))' }}>{entry.toxicologie_score}</p>
                <p className="text-xs" style={{ color: 'hsl(var(--accent))' }}>Toxicologie</p>
              </div>
            )}
            {entry.certificaten_score !== null && (
              <div className="text-center px-4 py-2 rounded-lg" style={{ background: 'hsla(var(--bg), 0.5)' }}>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--ink))' }}>{entry.certificaten_score}</p>
                <p className="text-xs" style={{ color: 'hsl(var(--accent))' }}>Certificaten</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={onUseExisting}
            className="flex-1 gap-2"
            style={{ 
              background: 'hsl(var(--success))', 
              color: 'hsl(var(--bg))',
              border: 'none'
            }}
          >
            <Eye className="w-4 h-4" />
            Bekijk bestaande data
          </Button>
          <Button 
            onClick={onNewValidation}
            variant="outline"
            className="flex-1 gap-2"
            style={{ 
              borderColor: 'hsla(var(--ink), 0.3)',
              color: 'hsl(var(--ink))'
            }}
          >
            Nieuwe validatie
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
