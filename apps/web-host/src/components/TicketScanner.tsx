'use client';

import { useState, useEffect, useRef } from 'react';
import { validateTicket, validateTicketById } from '../lib/api';

type ScanResult = {
  type: 'success' | 'used' | 'error';
  holderName?: string;
  zone?: string;
  seat?: string | number | null;
  message: string;
};

interface TicketScannerProps {
  token: string;
}

// Cache jsQR para no importarlo en cada frame
let jsQRFn: ((d: Uint8ClampedArray, w: number, h: number, o?: { inversionAttempts?: string }) => { data: string } | null) | null = null;
async function getJsQR() {
  if (!jsQRFn) {
    const mod = await import('jsqr');
    jsQRFn = mod.default as typeof jsQRFn;
  }
  return jsQRFn;
}

function cameraErrorMessage(err: unknown): string {
  const e = err as DOMException;
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'Tu navegador no soporta acceso a la cámara. Usa Chrome o Edge actualizados sobre localhost.';
  }
  switch (e?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Permiso de cámara denegado.\n\nPara permitirlo: haz clic en el ícono 🔒 o 📷 en la barra de direcciones del navegador → Permisos del sitio → Cámara → Permitir. Luego recarga la página.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No se encontró ninguna cámara en este dispositivo.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.';
    case 'OverconstrainedError':
      return 'La cámara no soporta la resolución solicitada. Intenta de nuevo.';
    case 'SecurityError':
      return 'Acceso a cámara bloqueado por política de seguridad. Asegúrate de usar http://localhost (no una IP de red).';
    default:
      return `Error de cámara: ${e?.name ?? 'desconocido'} — ${e?.message ?? String(err)}`;
  }
}

export function TicketScanner({ token }: TicketScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const processingRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);
  const scanPausedRef = useRef(true); // empieza pausado

  const [tab, setTab] = useState<'camera' | 'search' | 'manual'>('camera');
  const [camState, setCamState] = useState<'loading' | 'active' | 'error'>('loading');
  const [camError, setCamError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [scanning, setScanning] = useState(false); // estado UI del botón
  const [manualInput, setManualInput] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // ── Manejo de resultados ──────────────────────────────────────────────────
  function showResult(res: ScanResult) {
    setResult(res);
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      setResult(null);
      lastTokenRef.current = null;
    }, res.type === 'success' ? 3500 : 5500);
  }

  async function runValidation(apiFn: () => Promise<{ valid: boolean; message: string; ticket: { holderName: string; zone: string; seat: string | number | null } }>) {
    setValidating(true);
    try {
      const data = await apiFn();
      showResult({ type: 'success', holderName: data.ticket.holderName, zone: data.ticket.zone, seat: data.ticket.seat, message: data.message });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Error desconocido';
      const isUsed = msg.toLowerCase().includes('usado') || msg.toLowerCase().includes('used');
      showResult({ type: isUsed ? 'used' : 'error', message: msg });
      if (!isUsed) lastTokenRef.current = null;
    } finally {
      processingRef.current = false;
      setValidating(false);
    }
  }

  // ── Loop de escaneo ───────────────────────────────────────────────────────
  async function scanFrame() {
    if (!activeRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === 4 && !processingRef.current && !scanPausedRef.current) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const jsQR = await getJsQR();
        if (jsQR) {
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
          if (code?.data && code.data !== lastTokenRef.current) {
            processingRef.current = true;
            lastTokenRef.current = code.data;
            runValidation(() => validateTicket(code.data, token));
          }
        }
      }
    }

    loopTimerRef.current = setTimeout(scanFrame, 300);
  }

  // ── Control de cámara ─────────────────────────────────────────────────────
  function stopCamera() {
    activeRef.current = false;
    scanPausedRef.current = true;
    setScanning(false);
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function toggleScan() {
    const next = !scanning;
    scanPausedRef.current = !next;
    setScanning(next);
    if (next) lastTokenRef.current = null; // permite re-escanear el mismo QR
  }

  async function startCamera() {
    stopCamera();
    setCamState('loading');
    setCamError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamState('error');
      setCamError(cameraErrorMessage(null));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach((t) => t.stop()); return; }

      video.srcObject = stream;
      video.onloadedmetadata = async () => {
        try {
          await video.play();
          setCamState('active');
          activeRef.current = true;
          scanFrame();
        } catch (playErr) {
          setCamState('error');
          setCamError(cameraErrorMessage(playErr));
        }
      };
    } catch (err) {
      setCamState('error');
      setCamError(cameraErrorMessage(err));
    }
  }

  // ── Efectos ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    return () => {
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    };
  }, []);

  // ── Handlers formularios ──────────────────────────────────────────────────
  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = manualInput.trim();
    if (!t || processingRef.current) return;
    processingRef.current = true;
    lastTokenRef.current = t;
    await runValidation(() => validateTicket(t, token));
    setManualInput('');
  }

  async function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = searchInput.trim();
    if (!id || processingRef.current) return;
    processingRef.current = true;
    await runValidation(() => validateTicketById(id, token));
    setSearchInput('');
  }

  function switchTab(t: 'camera' | 'search' | 'manual') {
    setResult(null);
    lastTokenRef.current = null;
    setTab(t);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['camera', 'search', 'manual'] as const).map((t) => (
          <button
            key={t}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => switchTab(t)}
          >
            {t === 'camera' ? '📷 Cámara' : t === 'search' ? '🔍 Buscar por ID' : '⌨️ Token manual'}
          </button>
        ))}
      </div>

      {/* Resultado */}
      {result && (
        <div style={{
          marginBottom: '1.5rem', padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          border: `2px solid ${result.type === 'success' ? '#6AC44D' : result.type === 'used' ? '#f59e0b' : '#ef4444'}`,
          background: result.type === 'success' ? 'rgba(106,196,77,0.08)' : result.type === 'used' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', lineHeight: 1 }}>
            {result.type === 'success' ? '✅' : result.type === 'used' ? '⚠️' : '❌'}
          </div>
          <div style={{
            fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem',
            color: result.type === 'success' ? '#6AC44D' : result.type === 'used' ? '#f59e0b' : '#ef4444',
          }}>
            {result.type === 'success' ? 'ACCESO PERMITIDO' : result.type === 'used' ? 'TICKET YA UTILIZADO' : 'TICKET INVÁLIDO'}
          </div>
          {result.type === 'success' ? (
            <div style={{ display: 'grid', gap: '0.3rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-primary)' }}>Titular:</strong> {result.holderName}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Zona:</strong> {result.zone}</div>
              {result.seat != null && result.seat !== '-' && (
                <div><strong style={{ color: 'var(--text-primary)' }}>Asiento:</strong> {result.seat}</div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{result.message}</div>
          )}
        </div>
      )}

      {/* ── Tab Cámara ── */}
      {tab === 'camera' && (
        <div className="table-container" style={{ padding: '1.5rem' }}>
          {camState === 'error' ? (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7, whiteSpace: 'pre-line', textAlign: 'left' }}>
                {camError}
              </p>
              <button className="btn btn-primary" onClick={startCamera}>🔄 Reintentar</button>
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', minHeight: 300 }}>
              {camState === 'loading' && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 3,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                }}>
                  <div className="spinner" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Iniciando cámara...</span>
                </div>
              )}

              <video
                ref={videoRef}
                muted
                playsInline
                style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'cover', opacity: camState === 'active' ? 1 : 0 }}
              />

              {/* Marco de escaneo */}
              {camState === 'active' && !validating && scanning && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: 230, height: 230 }}>
                    <div style={{ position: 'absolute', inset: 0, boxShadow: '0 0 0 2000px rgba(0,0,0,0.5)' }} />
                    {[
                      { top: 0, left: 0, borderTop: '3px solid #6AC44D', borderLeft: '3px solid #6AC44D' },
                      { top: 0, right: 0, borderTop: '3px solid #6AC44D', borderRight: '3px solid #6AC44D' },
                      { bottom: 0, left: 0, borderBottom: '3px solid #6AC44D', borderLeft: '3px solid #6AC44D' },
                      { bottom: 0, right: 0, borderBottom: '3px solid #6AC44D', borderRight: '3px solid #6AC44D' },
                    ].map((s, i) => (
                      <div key={i} style={{ position: 'absolute', width: 28, height: 28, zIndex: 1, ...s }} />
                    ))}
                    <div style={{
                      position: 'absolute', left: 4, right: 4, height: 2, zIndex: 1,
                      background: 'linear-gradient(90deg, transparent, #6AC44D 30%, #6AC44D 70%, transparent)',
                      animation: 'scanline 2s ease-in-out infinite',
                    }} />
                  </div>
                </div>
              )}

              {/* Overlay pausado */}
              {camState === 'active' && !scanning && !validating && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)', zIndex: 4,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                }}>
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>⏸</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', textAlign: 'center', lineHeight: 1.6 }}>
                    Escaneo pausado<br />
                    <span style={{ fontWeight: 400, fontSize: '0.85rem', opacity: 0.75 }}>Pulsa &quot;Escanear&quot; para iniciar</span>
                  </div>
                </div>
              )}

              {/* Overlay validando */}
              {validating && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 4,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                }}>
                  <div className="spinner" />
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>Validando ticket...</span>
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {camState === 'active' && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button
                className={`btn ${scanning ? 'btn-danger' : 'btn-primary'}`}
                onClick={toggleScan}
                style={{ minWidth: 160 }}
              >
                {scanning ? '⏹ Detener' : '▶ Escanear'}
              </button>
            </div>
          )}

          {camState === 'active' && scanning && (
            <p style={{ textAlign: 'center', marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Centra el código QR dentro del marco. La validación es automática.
            </p>
          )}
        </div>
      )}

      {/* ── Tab Buscar por ID ── */}
      {tab === 'search' && (
        <div className="table-container" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Escribe el ID corto que aparece debajo del QR en la tarjeta del cliente, por ejemplo{' '}
            <code style={{ background: 'var(--bg-primary)', padding: '0.15rem 0.4rem', borderRadius: 4, fontFamily: 'monospace' }}>#c288f2ae</code>.
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            El # es opcional. Con 4 o más caracteres es suficiente.
          </p>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID del ticket</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="c288f2ae"
                autoFocus
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.06em',
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={validating || searchInput.trim().replace(/^#/, '').length < 4}
              style={{ whiteSpace: 'nowrap' }}
            >
              {validating ? '⏳ Buscando...' : '🔍 Validar'}
            </button>
          </form>
        </div>
      )}

      {/* ── Tab Token manual ── */}
      {tab === 'manual' && (
        <div className="table-container" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Pega el token JWT completo del ticket (el texto codificado dentro del QR).
          </p>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              rows={5}
              style={{
                width: '100%', padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical',
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={validating || !manualInput.trim()}>
              {validating ? '⏳ Validando...' : '✅ Validar Ticket'}
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes scanline {
          0%   { top: 6%;  opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { top: 94%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
