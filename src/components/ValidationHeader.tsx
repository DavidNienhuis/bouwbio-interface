export const ValidationHeader = () => {
  return (
    <header 
      className="border-b backdrop-blur-sm sticky top-0 z-50" 
      style={{ 
        borderColor: 'hsl(var(--line))', 
        background: 'hsla(var(--panel), 0.85)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="container mx-auto px-6 py-6 flex items-start justify-between max-w-7xl">
        {/* Logo - Asymmetrisch geplaatst */}
        <div className="space-y-1">
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
          <p className="text-xs mono" style={{ color: 'hsl(var(--muted))', letterSpacing: '0.05em' }}>
            Validatie van bouwmaterialen
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex flex-col items-end gap-1">
            <span 
              className="mono text-xs font-medium px-3 py-1 rounded-md" 
              style={{ 
                color: 'hsl(var(--accent))',
                background: 'hsla(var(--accent), 0.1)',
                border: '1px solid hsla(var(--accent), 0.2)'
              }}
            >
              BREEAM HEA 02
            </span>
            <span 
              className="mono text-xs font-medium px-3 py-1 rounded-md" 
              style={{ 
                color: 'hsl(var(--muted))',
                background: 'hsla(var(--muted), 0.08)',
                border: '1px solid hsla(var(--line), 0.5)'
              }}
            >
              GN22
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
