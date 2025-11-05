export const ValidationHeader = () => {
  return (
    <header 
      className="border-b backdrop-blur-sm sticky top-0 z-50" 
      style={{ 
        borderColor: 'hsl(var(--line))', 
        background: 'hsla(var(--panel), 0.92)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 0 40px hsla(var(--accent), 0.08)'
      }}
    >
      <div className="container mx-auto px-6 py-6 flex items-start justify-between max-w-7xl">
        {/* Logo - AI Tech Branding */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--secondary)))',
                boxShadow: '0 0 20px hsla(var(--accent), 0.3)'
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'hsl(var(--bg))' }}>BB</span>
            </div>
            <h1 
              className="text-3xl font-bold tracking-tight" 
              style={{ 
                fontFamily: 'IBM Plex Mono', 
                color: 'hsl(var(--ink))',
                letterSpacing: '-0.02em'
              }}
            >
              Bouwbioloog
            </h1>
          </div>
          <p className="text-xs mono ml-[52px]" style={{ color: 'hsl(var(--muted))', letterSpacing: '0.05em' }}>
            AI-Validatie · BREEAM · GN22
          </p>
        </div>
        
        {/* Status Indicators - Tech Style */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ 
                  background: 'hsl(var(--accent))',
                  boxShadow: '0 0 8px hsl(var(--accent))'
                }}
              />
              <span 
                className="mono text-xs font-medium px-3 py-1 rounded"
                style={{ 
                  color: 'hsl(var(--accent))',
                  background: 'hsla(var(--accent), 0.12)',
                  border: '1px solid hsla(var(--accent), 0.3)'
                }}
              >
                SYSTEEM ACTIEF
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
