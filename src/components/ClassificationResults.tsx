import { ClassificationData } from "@/lib/webhookClient";
import { Badge } from "@/components/ui/badge";

interface ClassificationResultsProps {
  data: ClassificationData;
}

const glassmorphism = {
  background: 'hsla(var(--panel), 0.85)',
  backdropFilter: 'blur(20px)',
  border: '1px solid hsla(var(--line), 0.3)',
  boxShadow: 'var(--shadow)'
};

export const ClassificationResults = ({ data }: ClassificationResultsProps) => {
  const confidenceColor = data.confidence >= 0.8 
    ? 'hsl(var(--success))' 
    : data.confidence >= 0.5 
    ? 'hsl(var(--warning))' 
    : 'hsl(var(--error))';

  return (
    <section 
      className="rounded-lg overflow-hidden"
      style={glassmorphism}
    >
      {/* Header met classification + confidence */}
      <div 
        className="p-6"
        style={{ 
          borderBottom: '1px solid hsla(var(--line), 0.3)',
          background: 'hsla(var(--accent), 0.05)'
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 
              className="text-xl font-semibold mb-1"
              style={{ color: 'hsl(var(--ink))' }}
            >
              Classificatie
            </h3>
            <Badge 
              variant="secondary"
              style={{ 
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
                textTransform: 'capitalize'
              }}
            >
              {data.classification}
            </Badge>
          </div>
          
          <div className="text-right">
            <div 
              className="text-sm mono mb-1"
              style={{ color: 'hsla(var(--ink), 0.65)' }}
            >
              Betrouwbaarheid
            </div>
            <div 
              className="text-2xl font-bold mono"
              style={{ color: confidenceColor }}
            >
              {(data.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Reasoning sectie */}
      <div 
        className="p-6"
        style={{ borderBottom: '1px solid hsla(var(--line), 0.3)' }}
      >
        <h4 
          className="text-lg font-semibold mb-3"
          style={{ color: 'hsl(var(--ink))' }}
        >
          Analyse
        </h4>
        <p 
          className="leading-relaxed"
          style={{ 
            color: 'hsla(var(--ink), 0.85)',
            fontSize: '0.95rem'
          }}
        >
          {data.reasoning}
        </p>
      </div>
      
      {/* Evidence quotes als lijst */}
      {data.evidence_quotes.length > 0 && (
        <div 
          className="p-6"
          style={{ borderBottom: '1px solid hsla(var(--line), 0.3)' }}
        >
          <h4 
            className="text-lg font-semibold mb-3"
            style={{ color: 'hsl(var(--ink))' }}
          >
            Bewijs citaten
          </h4>
          <ul className="space-y-3">
            {data.evidence_quotes.map((quote, i) => (
              <li 
                key={i}
                className="mono"
                style={{ 
                  fontSize: '0.875rem',
                  color: 'hsla(var(--ink), 0.75)',
                  paddingLeft: '1.5rem',
                  position: 'relative',
                  lineHeight: '1.6'
                }}
              >
                <span 
                  style={{ 
                    position: 'absolute',
                    left: '0',
                    color: 'hsl(var(--accent))' 
                  }}
                >
                  "
                </span>
                {quote}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Recommended action */}
      {data.recommended_action && (
        <div 
          className="p-6"
          style={{ 
            background: 'hsla(var(--accent), 0.05)'
          }}
        >
          <h4 
            className="text-lg font-semibold mb-3"
            style={{ color: 'hsl(var(--ink))' }}
          >
            Aanbevolen actie
          </h4>
          <p 
            className="leading-relaxed"
            style={{ 
              color: 'hsla(var(--ink), 0.85)',
              fontSize: '0.95rem'
            }}
          >
            {data.recommended_action}
          </p>
        </div>
      )}
    </section>
  );
};
