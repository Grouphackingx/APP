import type { Metadata } from 'next';

const hostUrl = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:4201';

export const metadata: Metadata = {
  title: 'Publica y Vende Entradas para tus Eventos en Ecuador | AfroEventos',
  description:
    'Crea tu cuenta de organizador gratis y empieza a vender entradas online para tus eventos, conciertos y festivales en Ecuador. Gestión de asistentes, validación con QR y cobros — todo en un solo lugar.',
  keywords:
    'publicar eventos ecuador, vender entradas online, vender boletos, plataforma de eventos, organizar eventos, venta de tickets ecuador, gestión de eventos',
  alternates: {
    canonical: `${hostUrl}/register`,
  },
  // Sobrescribe el noindex del layout raíz: esta landing SÍ debe indexarse.
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Publica y Vende Entradas para tus Eventos | AfroEventos',
    description:
      'Crea tu cuenta de organizador gratis y empieza a vender entradas online para tus eventos en Ecuador.',
    url: `${hostUrl}/register`,
    type: 'website',
    siteName: 'AfroEventos',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
