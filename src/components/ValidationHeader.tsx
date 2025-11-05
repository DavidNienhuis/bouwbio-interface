export const ValidationHeader = () => {
  return (
    <header className="border-b" style={{ borderColor: 'hsl(var(--line))', background: 'hsl(var(--panel))' }}>
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo - Asymmetrisch geplaatst */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'IBM Plex Mono', color: 'hsl(var(--ink))' }}>
            Bouwbioloog
          </h1>
          <p className="text-xs mono" style={{ color: 'hsl(var(--muted))' }}>
            Validatie van bouwmaterialen
          </p>
        </div>
        
        {/* Status Indicator - Geen grote knoppen */}
        <div className="flex items-center gap-4">
          <span className="mono text-sm" style={{ color: 'hsl(var(--muted))' }}>
            BREEAM HEA 02 • GN22
          </span>
        </div>
      </div>
    </header>
  );
};
