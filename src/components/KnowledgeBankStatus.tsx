export const KnowledgeBankStatus = () => {
  return (
    <section 
      className="knowledge rounded-lg overflow-hidden" 
      style={{ 
        marginTop: '2rem',
        background: 'linear-gradient(135deg, hsla(var(--accent), 0.05), hsla(var(--accent), 0.02))',
        border: '1px solid hsla(var(--accent), 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="p-6 flex items-start gap-4">
        <div 
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, hsla(var(--accent), 0.2), hsla(var(--accent), 0.1))',
            border: '2px solid hsla(var(--accent), 0.3)'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>✅</span>
        </div>
        
        <div className="flex-1 space-y-2">
          <p 
            className="mono font-medium text-base" 
            style={{ color: 'hsl(var(--accent))' }}
          >
            Advies toegevoegd aan kennisbank
          </p>
          <p 
            style={{ 
              fontSize: '0.95rem', 
              color: 'hsl(var(--muted))', 
              lineHeight: '1.7',
              maxWidth: '65ch'
            }}
          >
            Elk nieuw document versterkt onze dataset. Samen lossen we het informatiegat op door transparantie te creëren over bouwmaterialen en hun impact op gezondheid en milieu.
          </p>
        </div>
      </div>
    </section>
  );
};
