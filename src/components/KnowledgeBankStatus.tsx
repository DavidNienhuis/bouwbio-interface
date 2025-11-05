export const KnowledgeBankStatus = () => {
  return (
    <section className="knowledge" style={{ 
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'transparent',
      border: `1px solid hsl(var(--line))`,
      borderRadius: 'var(--radius)'
    }}>
      <p className="mono" style={{ color: 'hsl(var(--accent))', marginBottom: '0.5rem' }}>
        ✅ Advies toegevoegd aan kennisbank
      </p>
      <p style={{ fontSize: '0.95rem', color: 'hsl(var(--muted))', lineHeight: '1.6' }}>
        Elk nieuw document versterkt onze dataset. Samen lossen we het informatiegat op door transparantie te creëren over bouwmaterialen.
      </p>
    </section>
  );
};
