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

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success': return 'hsla(var(--success), 0.1)';
      case 'warning': return 'hsla(var(--warning), 0.1)';
      case 'error': return 'hsla(var(--error), 0.1)';
      default: return 'transparent';
    }
  };

  return (
    <section 
      className="results rounded-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsla(var(--panel), 0.5), hsla(var(--panel), 0.7))',
        border: '1px solid hsl(var(--line))',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--line))' }}>
        <h3 
          className="text-2xl"
          style={{ 
            fontFamily: 'IBM Plex Mono', 
            color: 'hsl(var(--ink))',
            letterSpacing: '-0.01em'
          }}
        >
          Resultaten
        </h3>
        <p className="mono text-sm mt-2" style={{ color: 'hsl(var(--muted))' }}>
          Validatiestatus per claim
        </p>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'hsla(var(--bg), 0.5)' }}>
              <th style={{ 
                borderBottom: `1px solid hsl(var(--line))`, 
                padding: '1rem 1.5rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: 'hsl(var(--muted))',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Claim
              </th>
              <th style={{ 
                borderBottom: `1px solid hsl(var(--line))`, 
                padding: '1rem 1.5rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: 'hsl(var(--muted))',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Bewijsmateriaal
              </th>
              <th style={{ 
                borderBottom: `1px solid hsl(var(--line))`, 
                padding: '1rem 1.5rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: 'hsl(var(--muted))',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Conclusie
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr 
                key={idx} 
                style={{ 
                  background: idx % 2 === 1 ? 'hsla(var(--bg), 0.3)' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(var(--accent), 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 1 ? 'hsla(var(--bg), 0.3)' : 'transparent'}
              >
                <td style={{ 
                  borderBottom: `1px solid hsl(var(--line))`, 
                  padding: '1.25rem 1.5rem', 
                  color: 'hsl(var(--ink))',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  {result.claim}
                </td>
                <td style={{ 
                  borderBottom: `1px solid hsl(var(--line))`, 
                  padding: '1.25rem 1.5rem', 
                  color: 'hsl(var(--muted))', 
                  fontFamily: 'IBM Plex Mono', 
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  {result.evidence}
                </td>
                <td style={{ 
                  borderBottom: `1px solid hsl(var(--line))`, 
                  padding: '1.25rem 1.5rem' 
                }}>
                  <span 
                    className="inline-block px-3 py-1 rounded-md"
                    style={{ 
                      color: getStatusColor(result.status),
                      background: getStatusBg(result.status),
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      border: `1px solid ${getStatusColor(result.status)}33`
                    }}
                  >
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
