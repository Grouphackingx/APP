'use client';

import { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  ticketStatus?: string;
  ticketId?: string;
}

export default function QRCode({
  value,
  size = 180,
  ticketStatus = 'VALID',
  ticketId,
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const isUsed = ticketStatus === 'USED';

    QRCodeLib.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: isUsed ? '#64748b' : '#000000',
          light: '#00000000', // transparent background
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) {
          console.error('QR generation error:', err);
          setError(true);
        }
      },
    );
  }, [value, size, ticketStatus]);

  if (error || !value) {
    return (
      <div className="qr-code-error">
        <span className="qr-error-icon">⚠️</span>
        <span>QR no disponible</span>
      </div>
    );
  }

  return (
    <div
      className={`qr-code-wrapper ${ticketStatus === 'USED' ? 'qr-used' : 'qr-valid'}`}
    >
      <div className="qr-code-inner">
        <canvas ref={canvasRef} className="qr-canvas" />
      </div>
      <div className="qr-code-label">
        <span className="qr-label-text">
          {ticketStatus === 'VALID'
            ? '📱 Presenta este QR en la entrada'
            : '✔️ Ticket ya utilizado'}
        </span>
        {ticketId && (
          <span className="qr-ticket-id">#{ticketId.slice(0, 8)}</span>
        )}
      </div>
    </div>
  );
}
