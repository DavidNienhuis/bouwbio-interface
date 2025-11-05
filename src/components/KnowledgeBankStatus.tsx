import { Database, CheckCircle } from "lucide-react";

export const KnowledgeBankStatus = () => {
  return (
    <section 
      className="knowledge rounded-lg overflow-hidden" 
      style={{ 
        marginTop: '2rem',
        background: 'linear-gradient(135deg, hsla(var(--success), 0.08), hsla(var(--accent), 0.08))',
        border: '1px solid hsla(var(--success), 0.3)',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.2), 0 0 30px hsla(var(--success), 0.1)'
      }}
    >
      <div className="p-6 flex items-start gap-4">
        <div 
          className="flex items-center justify-center rounded-lg flex-shrink-0 relative"
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, hsla(var(--success), 0.25), hsla(var(--accent), 0.2))',
            border: '2px solid hsla(var(--success), 0.4)',
            boxShadow: '0 0 30px hsla(var(--success), 0.25)'
          }}
        >
          <Database className="h-6 w-6" style={{ color: 'hsl(var(--success))' }} />
          <CheckCircle 
            className="h-4 w-4 absolute -top-1 -right-1" 
            style={{ 
              color: 'hsl(var(--success))',
              background: 'hsl(var(--bg))',
              borderRadius: '50%'
            }} 
          />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <p 
              className="mono font-semibold text-lg flex items-center gap-2" 
              style={{ color: 'hsl(var(--success))' }}
            >
              DATA TOEGEVOEGD AAN KENNISBANK
            </p>
            <p className="mono text-xs mt-1" style={{ color: 'hsl(var(--accent))' }}>
              AI-MODEL TRAINING DATASET UPDATED
            </p>
          </div>
          <p 
            style={{ 
              fontSize: '0.95rem', 
              color: 'hsl(var(--ink))', 
              lineHeight: '1.7',
              maxWidth: '70ch'
            }}
          >
            Elk nieuw document versterkt onze AI-dataset en verbetert de nauwkeurigheid van toekomstige validaties. Samen bouwen we aan transparantie over bouwmaterialen en hun impact op gezondheid en milieu.
          </p>
        </div>
      </div>
    </section>
  );
};
