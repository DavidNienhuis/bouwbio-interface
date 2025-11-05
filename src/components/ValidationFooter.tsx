export const ValidationFooter = () => {
  return (
    <footer 
      className="border-t mt-16"
      style={{ 
        borderColor: 'hsl(var(--line))',
        background: 'linear-gradient(to top, hsla(var(--panel), 0.3), transparent)'
      }}
    >
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p 
              className="mono font-medium text-sm" 
              style={{ color: 'hsl(var(--ink))' }}
            >
              Bouwbioloog
            </p>
            <p 
              className="mono text-xs mt-1" 
              style={{ color: 'hsl(var(--muted))' }}
            >
              GWK – Gezonde Woningkeur
            </p>
          </div>
          
          <nav className="flex items-center gap-6 text-sm">
            <a 
              href="#" 
              className="mono transition-colors"
              style={{ color: 'hsl(var(--muted))' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--accent))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted))'}
            >
              Privacy
            </a>
            <span style={{ color: 'hsl(var(--line))' }}>•</span>
            <a 
              href="#" 
              className="mono transition-colors"
              style={{ color: 'hsl(var(--muted))' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--accent))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted))'}
            >
              Gebruiksvoorwaarden
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};
