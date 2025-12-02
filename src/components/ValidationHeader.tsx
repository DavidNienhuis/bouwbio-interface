export const ValidationHeader = () => {
  return (
    <header 
      className="border-b sticky top-0 z-50" 
      style={{ 
        borderColor: 'hsl(186 100% 10%)', 
        background: 'hsl(186 100% 10%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="container mx-auto px-6 py-6 flex items-start justify-between max-w-7xl">
        {/* Logo */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 flex items-center justify-center"
              style={{
                background: 'hsl(142 64% 62%)',
                boxShadow: '0 0 20px hsla(142 64% 62% / 0.4)'
              }}
            >
              <span className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'hsl(186 100% 10%)' }}>BB</span>
            </div>
            <h1 
              className="text-3xl font-bold tracking-wide uppercase font-heading" 
              style={{ 
                color: '#FFFFFF',
                letterSpacing: '0.02em'
              }}
            >
              Bouwbioloog
            </h1>
          </div>
          <p className="text-xs uppercase ml-[52px]" style={{ color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.1em', fontFamily: 'Montserrat' }}>
            AI-Validatie · BREEAM · GN22
          </p>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ 
                  background: 'hsl(142 64% 62%)',
                  boxShadow: '0 0 8px hsl(142 64% 62%)'
                }}
              />
              <span 
                className="text-xs font-medium px-3 py-1 uppercase font-heading"
                style={{ 
                  color: '#FFFFFF',
                  background: 'hsla(142 64% 62% / 0.15)',
                  border: '1px solid hsla(142 64% 62% / 0.4)',
                  letterSpacing: '0.05em'
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
