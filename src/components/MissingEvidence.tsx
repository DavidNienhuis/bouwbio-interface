import { AlertTriangle } from "lucide-react";

interface MissingEvidenceProps {
  missing: string[];
}

export const MissingEvidence = ({ missing }: MissingEvidenceProps) => {
  if (missing.length === 0) return null;

  return (
    <section 
      className="missing rounded-lg overflow-hidden" 
      style={{ 
        marginTop: '2rem',
        background: 'linear-gradient(135deg, hsla(var(--panel), 0.7), hsla(var(--panel), 0.9))',
        border: '1px solid hsla(var(--warning), 0.3)',
        borderLeft: '4px solid hsl(var(--warning))',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3), 0 0 30px hsla(var(--warning), 0.1)'
      }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'hsla(var(--line), 0.5)' }}>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsla(var(--warning), 0.25), hsla(var(--warning), 0.15))',
              border: '1px solid hsla(var(--warning), 0.4)',
              boxShadow: '0 0 20px hsla(var(--warning), 0.2)'
            }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: 'hsl(var(--warning))' }} />
          </div>
          <div>
            <h3 
              className="text-xl"
              style={{ 
                fontFamily: 'IBM Plex Mono', 
                color: 'hsl(var(--warning))',
                letterSpacing: '-0.01em',
                fontWeight: 600
              }}
            >
              Ontbrekende gegevens
            </h3>
            <p className="mono text-sm mt-1" style={{ color: 'hsl(var(--muted))' }}>
              {missing.length} {missing.length === 1 ? 'item' : 'items'} vereist aanvullende verificatie
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {missing.map((item, idx) => (
            <li 
              key={idx} 
              className="flex items-start gap-3 p-4 rounded-md transition-all duration-200"
              style={{ 
                fontFamily: 'IBM Plex Mono',
                fontSize: '0.9rem',
                color: 'hsl(var(--ink))',
                background: 'hsla(var(--warning), 0.08)',
                border: '1px solid hsla(var(--warning), 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'hsla(var(--warning), 0.12)';
                e.currentTarget.style.borderColor = 'hsl(var(--warning))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'hsla(var(--warning), 0.08)';
                e.currentTarget.style.borderColor = 'hsla(var(--warning), 0.2)';
              }}
            >
              <span 
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ 
                  width: '24px',
                  height: '24px',
                  color: 'hsl(var(--warning))',
                  background: 'hsla(var(--warning), 0.15)',
                  border: '1px solid hsla(var(--warning), 0.3)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                !
              </span>
              <span style={{ lineHeight: '1.6', flex: 1 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
