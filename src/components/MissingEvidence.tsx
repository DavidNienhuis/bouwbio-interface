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
        background: 'linear-gradient(135deg, hsla(var(--panel), 0.5), hsla(var(--panel), 0.7))',
        border: '1px solid hsl(var(--line))',
        borderLeft: '4px solid hsl(var(--warning))',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--line))' }}>
        <h3 
          className="text-xl flex items-center gap-3"
          style={{ 
            fontFamily: 'IBM Plex Mono', 
            color: 'hsl(var(--warning))',
            letterSpacing: '-0.01em'
          }}
        >
          <span 
            className="flex items-center justify-center rounded-md"
            style={{
              width: '32px',
              height: '32px',
              background: 'hsla(var(--warning), 0.15)',
              border: '1px solid hsla(var(--warning), 0.3)'
            }}
          >
            ⚠️
          </span>
          Waar bewijs ontbreekt
        </h3>
        <p className="mono text-sm mt-2" style={{ color: 'hsl(var(--muted))' }}>
          Ontbrekende gegevens voor volledige validatie
        </p>
      </div>
      
      <div className="p-6">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {missing.map((item, idx) => (
            <li 
              key={idx} 
              className="flex items-start gap-3 p-3 rounded-md"
              style={{ 
                fontFamily: 'IBM Plex Mono',
                fontSize: '0.9rem',
                color: 'hsl(var(--muted))',
                background: 'hsla(var(--warning), 0.05)',
                border: '1px solid hsla(var(--warning), 0.15)'
              }}
            >
              <span style={{ color: 'hsl(var(--warning))', flexShrink: 0 }}>•</span>
              <span style={{ lineHeight: '1.6' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
