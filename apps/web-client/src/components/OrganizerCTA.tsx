const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL ?? 'http://localhost:4201';

export function OrganizerCTA() {
  return (
    <section className="octa-section" aria-label="Publica tu evento">
      <div className="octa-inner">

        {/* ── PARTE SUPERIOR: split texto / mockup ── */}
        <div className="octa-split">

          {/* Izquierda: copy + CTA */}
          <div className="octa-left">
            <span className="hero-split-eyebrow animate-fade-in-up stagger-1">
              Para Organizadores de Eventos
            </span>

            <h2 className="octa-headline animate-fade-in-up stagger-2">
              ¿Organizas eventos?<br />
              <span className="octa-accent">Publica gratis.</span>
            </h2>

            <p className="octa-sub animate-fade-in-up stagger-3">
              Haz que más personas descubran tu música, tu fiesta y cultura. Creamos una plataforma
              profesional para ayudar a organizadores a promocionar sus eventos de manera fácil y moderna.
            </p>

            <a
              href={`${HOST_URL}/register`}
              className="hero-split-cta animate-fade-in-up stagger-4"
              rel="noopener noreferrer"
            >
              Publicar ahora →
            </a>
          </div>

          {/* Derecha: mockup del panel de organizador */}
          <div className="octa-mock-wrap animate-fade-in-up stagger-3">
            <div className="octa-mock">
              {/* Barra de título estilo app */}
              <div className="octa-mock-header">
                <div className="octa-mock-dots">
                  <span className="octa-mock-dot octa-mock-dot--red" />
                  <span className="octa-mock-dot octa-mock-dot--yellow" />
                  <span className="octa-mock-dot octa-mock-dot--green" />
                </div>
                <span className="octa-mock-title">Panel Organizador — AfroEventos</span>
              </div>

              <div className="octa-mock-body">
                {/* Stats row */}
                <div className="octa-mock-stats">
                  <div className="octa-mock-stat">
                    <div className="octa-mock-stat-val">3</div>
                    <div className="octa-mock-stat-label">Eventos activos</div>
                  </div>
                  <div className="octa-mock-stat">
                    <div className="octa-mock-stat-val">847</div>
                    <div className="octa-mock-stat-label">Entradas vendidas</div>
                  </div>
                  <div className="octa-mock-stat octa-mock-stat--accent">
                    <div className="octa-mock-stat-val">$2,340</div>
                    <div className="octa-mock-stat-label">Ingresos totales</div>
                  </div>
                </div>

                <div className="octa-mock-divider" />

                {/* Evento reciente */}
                <div className="octa-mock-event">
                  <div className="octa-mock-event-pulse" />
                  <div className="octa-mock-event-info">
                    <div className="octa-mock-event-name">Noche de Salsa, Bomba y Son</div>
                    <div className="octa-mock-event-meta">Sáb 14 Jun · 120 entradas</div>
                  </div>
                  <span className="octa-mock-badge">EN VIVO</span>
                </div>

                {/* Barra de progreso */}
                <div className="octa-mock-progress">
                  <div className="octa-mock-progress-header">
                    <span className="octa-mock-progress-label">Entradas vendidas este mes</span>
                    <span className="octa-mock-progress-pct">78%</span>
                  </div>
                  <div className="octa-mock-progress-track">
                    <div className="octa-mock-progress-fill" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
