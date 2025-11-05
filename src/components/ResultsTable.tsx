interface ValidationResult {
  claim: string;
  evidence: string;
  conclusion: string;
  status: 'success' | 'warning' | 'error';
}

interface ResultsTableProps {
  results: ValidationResult[];
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  if (results.length === 0) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'hsl(var(--success))';
      case 'warning': return 'hsl(var(--warning))';
      case 'error': return 'hsl(var(--error))';
      default: return 'hsl(var(--muted))';
    }
  };

  return (
    <section className="results">
      <h3 style={{ fontFamily: 'IBM Plex Mono', marginBottom: '1rem' }}>Resultaten</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ 
                borderBottom: `1px solid hsl(var(--line))`, 
                padding: '0.75rem 1rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.85rem', 
                color: 'hsl(var(--muted))' 
              }}>
                CLAIM
              </th>
              <th style={{ 
                borderBottom: `1px solid hsl(var(--line))`, 
                padding: '0.75rem 1rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.85rem', 
                color: 'hsl(var(--muted))' 
              }}>
                BEWIJSMATERIAAL
              </th>
              <th style={{ 
                borderBottom: `1px solid hsl(var(--line))`, 
                padding: '0.75rem 1rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.85rem', 
                color: 'hsl(var(--muted))' 
              }}>
                CONCLUSIE
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 1 ? '#111519' : 'transparent' }}>
                <td style={{ 
                  borderBottom: `1px solid hsl(var(--line))`, 
                  padding: '0.75rem 1rem', 
                  color: 'hsl(var(--ink))' 
                }}>
                  {result.claim}
                </td>
                <td style={{ 
                  borderBottom: `1px solid hsl(var(--line))`, 
                  padding: '0.75rem 1rem', 
                  color: 'hsl(var(--muted))', 
                  fontFamily: 'IBM Plex Mono', 
                  fontSize: '0.9rem' 
                }}>
                  {result.evidence}
                </td>
                <td style={{ 
                  borderBottom: `1px solid hsl(var(--line))`, 
                  padding: '0.75rem 1rem' 
                }}>
                  <span style={{ 
                    color: getStatusColor(result.status),
                    fontFamily: 'IBM Plex Mono',
                    fontSize: '0.9rem'
                  }}>
                    {result.conclusion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
