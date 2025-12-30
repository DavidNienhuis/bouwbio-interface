import logo from '@/assets/logo.png';

export const ValidationFooter = () => {
  return (
    <footer className="border-t border-border mt-16 bg-card">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Bouwbioloog logo" 
              className="h-8 w-auto"
            />
            <div className="text-center md:text-left">
              <p className="font-heading font-medium text-sm uppercase text-foreground tracking-wide">
                Bouwbioloog
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                GWK – Gezonde Woningkeur
              </p>
            </div>
          </div>
          
          <nav className="flex items-center gap-6 text-sm">
            <a 
              href="/privacy" 
              className="uppercase font-heading text-muted-foreground hover:text-primary transition-colors tracking-wide"
            >
              Privacy
            </a>
            <span className="text-border">•</span>
            <a 
              href="/voorwaarden" 
              className="uppercase font-heading text-muted-foreground hover:text-primary transition-colors tracking-wide"
            >
              Voorwaarden
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};
