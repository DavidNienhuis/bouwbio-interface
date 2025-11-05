interface MissingEvidenceProps {
  missing: string[];
}

export const MissingEvidence = ({ missing }: MissingEvidenceProps) => {
  if (missing.length === 0) return null;

  return (
    <section className="missing" style={{ 
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'hsl(var(--panel))',
      borderLeft: '4px solid hsl(var(--warning))',
      borderRadius: 'var(--radius)'
    }}>
      <h3 style={{ 
        fontFamily: 'IBM Plex Mono', 
        marginBottom: '1rem', 
        color: 'hsl(var(--warning))' 
      }}>
        Waar bewijs ontbreekt
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {missing.map((item, idx) => (
          <li key={idx} style={{ 
            padding: '0.5rem 0',
            borderBottom: idx < missing.length - 1 ? `1px solid hsl(var(--line))` : 'none',
            fontFamily: 'IBM Plex Mono',
            fontSize: '0.9rem',
            color: 'hsl(var(--muted))'
          }}>
            ⚠️ {item}
          </li>
        ))}
      </ul>
    </section>
  );
};
