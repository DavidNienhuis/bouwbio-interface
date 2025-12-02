import logo from '@/assets/logo.jpeg';

export const ValidationFooter = () => {
  return (
    <footer 
      className="border-t mt-16"
      style={{ 
        borderColor: 'hsl(186 100% 10%)',
        background: 'hsl(186 100% 10%)'
      }}
    >
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Bouwbioloog logo" 
              className="h-8 w-auto"
            />
            <div className="text-center md:text-left">
              <p 
                className="font-heading font-medium text-sm uppercase" 
                style={{ color: '#FFFFFF', letterSpacing: '0.05em' }}
              >
                Bouwbioloog
              </p>
              <p 
                className="text-xs mt-1" 
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                GWK – Gezonde Woningkeur
              </p>
            </div>
          </div>
          
          <nav className="flex items-center gap-6 text-sm">
            <a 
              href="/privacy" 
              className="uppercase font-heading transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.05em' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(142 64% 62%)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              Privacy
            </a>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
            <a 
              href="/voorwaarden" 
              className="uppercase font-heading transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.05em' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(142 64% 62%)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              Voorwaarden
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};
