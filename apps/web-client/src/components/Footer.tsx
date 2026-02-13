export function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <div className="footer-brand">🎫 OpenTicket</div>
        <p>
          La plataforma de eventos más moderna. Descubre, compra y disfruta.
        </p>
        <p style={{ marginTop: '1rem', opacity: 0.5 }}>
          © {new Date().getFullYear()} OpenTicket. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
