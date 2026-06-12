'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// ── Helpers ────────────────────────────────────────────────────────────────────

const ZONE_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  '#84CC16', '#A855F7', '#0EA5E9', '#EAB308', '#F43F5E',
  '#22C55E', '#64748B', '#D946EF', '#0F766E', '#B45309',
];

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return ZONE_COLORS[Math.abs(hash) % ZONE_COLORS.length];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

// Convierte una URL/embed de video a su src embebible. Devuelve null si no se puede embeber.
function getVideoEmbed(url: string): { src: string; vertical: boolean } | null {
  if (!url) return null;
  const iframeSrc = url.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const raw = (iframeSrc ? iframeSrc[1] : url).trim();

  const yt = raw.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt?.[1]) return { src: `https://www.youtube.com/embed/${yt[1]}`, vertical: /\/shorts\//i.test(raw) };

  const vm = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm?.[1]) return { src: `https://player.vimeo.com/video/${vm[1]}`, vertical: false };

  const ig = raw.match(/instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/i);
  if (ig) {
    const kind = ig[1].toLowerCase() === 'reels' ? 'reel' : ig[1].toLowerCase();
    return { src: `https://www.instagram.com/${kind}/${ig[2]}/embed`, vertical: true };
  }

  const tt = raw.match(/tiktok\.com\/(?:@[\w.]+\/video\/|v\/|embed\/v2\/|player\/v1\/)(\d+)/i);
  if (tt?.[1]) return { src: `https://www.tiktok.com/player/v1/${tt[1]}`, vertical: true };

  if (/facebook\.com|fb\.watch/i.test(raw)) {
    if (/plugins\/video\.php/i.test(raw)) return { src: raw, vertical: /reel/i.test(raw) };
    const vertical = /facebook\.com\/reel\//i.test(raw);
    return { src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(raw)}&show_text=false`, vertical };
  }

  if (/\/embed|player\./i.test(raw)) return { src: raw, vertical: false };
  if (/youtube\.com|youtu\.be|instagram\.com|tiktok\.com|facebook\.com|fb\.watch/i.test(raw)) return null;
  return { src: raw, vertical: false };
}

// ── Gallery sub-component ──────────────────────────────────────────────────────

function Gallery({ urls }: { urls: string[] }) {
  const [active, setActive] = useState(0);
  if (urls.length === 1) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <h3 style={sectionTitle}>Galería</h3>
        <img src={urls[0]} alt="Galería" style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>
    );
  }
  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={sectionTitle}>Galería</h3>
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
        <img key={active} src={urls[active]} alt={`Imagen ${active + 1}`} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
        <button onClick={() => setActive(i => (i - 1 + urls.length) % urls.length)} style={galleryArrow('left')}>‹</button>
        <button onClick={() => setActive(i => (i + 1) % urls.length)} style={galleryArrow('right')}>›</button>
        <div style={{ position: 'absolute', bottom: 8, right: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4 }}>
          {active + 1} / {urls.length}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {urls.map((url, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ padding: 0, border: `2px solid ${i === active ? '#6ac44d' : 'rgba(255,255,255,0.15)'}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: 'none', width: 64, height: 48 }}>
            <img src={url} alt={`thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Style tokens ───────────────────────────────────────────────────────────────

const sectionTitle: React.CSSProperties = { fontSize: '1.4rem', marginBottom: '1rem', color: '#fff' };

function galleryArrow(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', [side]: 12, transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%',
    width: 36, height: 36, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  event: any;
  onClose: () => void;
}

export function EventPreviewModal({ event, onClose }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const allZonesFree = event.zones?.length > 0 && event.zones.every((z: any) => Number(z.price) === 0 || z.sellOnSite);

  const content = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ── Preview Banner ── */}
      <div style={{
        background: 'linear-gradient(90deg, #b45309 0%, #d97706 100%)',
        color: '#fff', padding: '0.6rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, zIndex: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem' }}>👁️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              MODO PREVISUALIZACIÓN
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              Así verán los asistentes este evento en el Portal de Clientes — los botones de compra están desactivados
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          title="Cerrar previsualización"
          style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff', borderRadius: 8, padding: '0.4rem 0.9rem', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          <span>✕</span> Cerrar
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ overflowY: 'auto', flex: 1, background: '#0d0d0d' }}>

        {/* Hero */}
        <div style={{ width: '100%', maxHeight: 420, overflow: 'hidden', position: 'relative' }}>
          <img
            src={event.bannerImageUrl || event.imageUrl || '/default-banner.jpg'}
            alt={event.title}
            style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(13,13,13,0.9) 100%)' }} />
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

          {/* Status badge */}
          {event.status !== 'PUBLISHED' && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: event.status === 'DRAFT' ? 'rgba(148,163,184,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${event.status === 'DRAFT' ? 'rgba(148,163,184,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: event.status === 'DRAFT' ? '#94a3b8' : '#f87171',
              borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
              marginBottom: '1rem',
            }}>
              {event.status === 'DRAFT' ? '📝 Borrador — no publicado aún' : '🔴 Inactivo'}
            </div>
          )}

          {/* Two-column grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: '2rem',
            alignItems: 'start',
          }}>

            {/* ── Left Column ── */}
            <div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                {event.title}
              </h1>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
                <InfoItem icon="📅" label="Fecha y hora" value={`${formatDate(event.date)}, ${formatTime(event.date)}`} />
                <InfoItem icon="📍" label="Lugar" value={event.location} />
                {(event.province || event.city) && (
                  <InfoItem icon="🌍" label="Provincia / Ciudad" value={`${event.province || ''}${event.province && event.city ? ' - ' : ''}${event.city || ''}`} />
                )}
                <InfoItem icon="🎭" label="Categoría" value={event.category || 'General'} />
                <InfoItem
                  icon={
                    event.organizer?.organizerProfile?.organizationLogo
                      ? <img src={event.organizer.organizerProfile.organizationLogo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                          {(event.organizer?.organizerProfile?.organizationName || event.organizer?.name || '?').charAt(0).toUpperCase()}
                        </div>
                  }
                  label="Publicado por"
                  value={event.organizer?.organizerProfile?.organizationName || event.organizer?.name || 'Desconocido'}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={sectionTitle}>Descripción</h3>
                <p style={{ color: '#a0a0a0', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {event.description || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Map */}
              {event.mapUrl && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={sectionTitle}>Ubicación</h3>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '21/9' }}>
                    <iframe src={event.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Mapa" />
                  </div>
                </div>
              )}

              {/* Video */}
              {(() => {
                const video = event.videoUrl ? getVideoEmbed(event.videoUrl) : null;
                if (!video) return null;
                return (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={sectionTitle}>Video</h3>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: video.vertical ? '9/16' : '16/9', maxWidth: video.vertical ? 360 : undefined, margin: video.vertical ? '0 auto' : undefined }}>
                    <iframe src={video.src} width="100%" height="100%" style={{ border: 0 }} allow="autoplay; encrypted-media; picture-in-picture; web-share; fullscreen" allowFullScreen loading="lazy" title="Video" />
                  </div>
                </div>
                );
              })()}

              {/* Gallery */}
              {event.galleryUrls?.length > 0 && <Gallery urls={event.galleryUrls} />}
            </div>

            {/* ── Right Column: Ticket Sidebar ── */}
            <div style={{ position: 'sticky', top: '1rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '1rem 1.25rem',
                  fontSize: '1rem', fontWeight: 700, color: '#fff',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  Localidades
                </div>

                {/* Seating map */}
                {event.seatingMapImageUrl && (
                  <div style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <img src={event.seatingMapImageUrl} alt="Mapa de Localidades" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                )}

                {/* Zones list */}
                <div style={{ padding: '0.5rem 1.25rem 1.25rem' }}>
                  {(!event.zones || event.zones.length === 0) ? (
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>Sin zonas configuradas</p>
                  ) : (
                    event.zones.map((zone: any) => {
                      const totalCapacity = zone.seats?.length || zone.capacity || 0;
                      const soldCount = zone.seats?.filter((s: any) => s.isSold)?.length || 0;
                      const available = totalCapacity - soldCount;
                      const isSoldOut = totalCapacity > 0 && available <= 0;
                      const color = stringToColor(zone.name);

                      return (
                        <div key={zone.id} style={{
                          marginBottom: '0.75rem', paddingBottom: '0.75rem',
                          borderBottom: '1px dashed rgba(255,255,255,0.08)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                              <span style={{ fontWeight: 600, color: isSoldOut ? '#6b7280' : '#fff', fontSize: '0.9rem' }}>
                                {zone.name}
                              </span>
                              {isSoldOut && (
                                <span style={{ fontSize: '0.6rem', background: '#EF4444', color: '#fff', padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 700 }}>Agotado</span>
                              )}
                            </div>
                            <span style={{ fontWeight: 700, color: isSoldOut ? '#6b7280' : '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                              {zone.sellOnSite ? 'En taquilla' : Number(zone.price) === 0 ? 'GRATIS' : `$${Number(zone.price).toFixed(2)}`}
                            </span>
                          </div>

                          {zone.description && (
                            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 0.35rem 1.25rem', lineHeight: 1.4 }}>{zone.description}</p>
                          )}

                          {zone.sellOnSite ? (
                            <div style={{ fontSize: '0.78rem', color: '#6ac44d', background: 'rgba(106,196,77,0.08)', border: '1px solid rgba(106,196,77,0.2)', borderRadius: 6, padding: '0.35rem 0.6rem', marginLeft: '1.25rem' }}>
                              🎟️ Venta solo en el lugar del evento
                            </div>
                          ) : totalCapacity > 0 && (
                            <div style={{ fontSize: '0.78rem', color: isSoldOut ? '#ef4444' : '#9ca3af', marginLeft: '1.25rem' }}>
                              {isSoldOut ? '¡Sin entradas disponibles!' : `${available} de ${totalCapacity} disponibles`}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Preview note + disabled CTA */}
                <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {!allZonesFree && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Total</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6ac44d' }}>$0.00</span>
                    </div>
                  )}
                  <button
                    disabled
                    style={{
                      width: '100%', padding: '0.9rem', borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#6b7280', fontWeight: 600, fontSize: '0.9rem', cursor: 'not-allowed',
                    }}
                  >
                    {allZonesFree ? '🎟️ Obtener Entrada (solo en Portal)' : '🛒 Comprar Entradas (solo en Portal)'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#4b5563', marginTop: '0.5rem' }}>
                    La compra estará disponible para asistentes en el Portal de Clientes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ── InfoItem helper ────────────────────────────────────────────────────────────

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, padding: '0.75rem',
    }}>
      <div style={{ fontSize: '1.3rem', lineHeight: 1, flexShrink: 0 }}>
        {typeof icon === 'string' ? <span>{icon}</span> : icon}
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: 500, lineHeight: 1.4 }}>{value}</div>
      </div>
    </div>
  );
}
