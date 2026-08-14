function ContactoRow({ nombre, telefono, email }: { nombre: string; telefono: string; email: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, padding: '3px 0' }}>
      <span style={{ color: 'var(--text-bright)', fontSize: 13, fontWeight: 600 }}>{nombre}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{telefono}</span>
      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>·</span>
      <span style={{ color: 'var(--accent)', fontSize: 13 }}>{email}</span>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{
      flexShrink: 0,
      borderTop: '1px solid var(--border-strong)',
      background: 'var(--bg-elevated)',
      padding: '0.75rem 1.5rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4,
        }}>
          Información de contacto
        </div>
        <ContactoRow nombre="Comercial CMH" telefono="964 188 142" email="comercial@cmhautomacion.com" />
        <ContactoRow nombre="Ana Aceitón Peris" telefono="+34 717 12 96 99" email="ana.peris@cmhautomacion.com" />
      </div>
    </footer>
  );
}