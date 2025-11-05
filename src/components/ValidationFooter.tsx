export const ValidationFooter = () => {
  return (
    <footer style={{ 
      borderTop: `1px solid hsl(var(--line))`,
      padding: '2rem 0',
      marginTop: '4rem',
      textAlign: 'center'
    }}>
      <p className="mono" style={{ color: 'hsl(var(--muted))', marginBottom: '0.5rem' }}>
        Bouwbioloog • GWK – Gezonde Woningkeur
      </p>
      <nav style={{ fontSize: '0.85rem' }}>
        <a href="#" style={{ color: 'hsl(var(--muted))', textDecoration: 'none', margin: '0 0.5rem' }}>
          Privacy
        </a>
        <span style={{ color: 'hsl(var(--line))' }}>•</span>
        <a href="#" style={{ color: 'hsl(var(--muted))', textDecoration: 'none', margin: '0 0.5rem' }}>
          Gebruiksvoorwaarden
        </a>
      </nav>
    </footer>
  );
};
