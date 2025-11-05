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
      case 'success': return 'hsla(var(--success), 0.12)';
      case 'warning': return 'hsla(var(--warning), 0.12)';
      case 'error': return 'hsla(var(--error), 0.12)';
      default: return 'transparent';
    }
  };

  return (
    <section 
      className="results rounded-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsla(var(--panel), 0.7), hsla(var(--panel), 0.9))',
        border: '1px solid hsla(var(--accent), 0.2)',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3), 0 0 40px hsla(var(--accent), 0.08)'
      }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'hsla(var(--line), 0.5)' }}>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsla(var(--accent), 0.2), hsla(var(--secondary), 0.2))',
              border: '1px solid hsla(var(--accent), 0.3)'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📊</span>
          </div>
          <div>
            <h3 
              className="text-2xl"
              style={{ 
                fontFamily: 'IBM Plex Mono', 
                color: 'hsl(var(--ink))',
                letterSpacing: '-0.01em'
              }}
            >
              Validatieresultaten
            </h3>
            <p className="mono text-sm mt-1" style={{ color: 'hsl(var(--muted))' }}>
              AI-analyse per claim
            </p>
          </div>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'hsla(var(--bg), 0.6)' }}>
              <th style={{ 
                borderBottom: `1px solid hsla(var(--accent), 0.15)`, 
                padding: '1rem 1.5rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: 'hsl(var(--accent))',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                CLAIM
              </th>
              <th style={{ 
                borderBottom: `1px solid hsla(var(--accent), 0.15)`, 
                padding: '1rem 1.5rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: 'hsl(var(--accent))',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                BEWIJSMATERIAAL
              </th>
              <th style={{ 
                borderBottom: `1px solid hsla(var(--accent), 0.15)`, 
                padding: '1rem 1.5rem', 
                textAlign: 'left', 
                fontFamily: 'IBM Plex Mono', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: 'hsl(var(--accent))',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr 
                key={idx} 
                style={{ 
                  background: idx % 2 === 1 ? 'hsla(var(--bg), 0.4)' : 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsla(var(--accent), 0.08)';
                  e.currentTarget.style.borderLeft = '3px solid hsl(var(--accent))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = idx % 2 === 1 ? 'hsla(var(--bg), 0.4)' : 'transparent';
                  e.currentTarget.style.borderLeft = 'none';
                }}
              >
                <td style={{ 
                  borderBottom: `1px solid hsla(var(--line), 0.3)`, 
                  padding: '1.25rem 1.5rem', 
                  color: 'hsl(var(--ink))',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  lineHeight: '1.5'
                }}>
                  {result.claim}
                </td>
                <td style={{ 
                  borderBottom: `1px solid hsla(var(--line), 0.3)`, 
                  padding: '1.25rem 1.5rem', 
                  color: 'hsl(var(--muted))', 
                  fontFamily: 'IBM Plex Mono', 
                  fontSize: '0.875rem',
                  lineHeight: '1.6'
                }}>
                  {result.evidence}
                </td>
                <td style={{ 
                  borderBottom: `1px solid hsla(var(--line), 0.3)`, 
                  padding: '1.25rem 1.5rem' 
                }}>
                  <span 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md"
                    style={{ 
                      color: getStatusColor(result.status),
                      background: getStatusBg(result.status),
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      border: `1px solid ${getStatusColor(result.status)}40`,
                      boxShadow: `0 0 10px ${getStatusColor(result.status)}20`
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: getStatusColor(result.status) }} />
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
