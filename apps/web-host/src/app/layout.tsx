import './global.css';
import type { Metadata } from 'next';
import { Providers } from '../components/Providers';

const hostUrl = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:4201';

export const metadata: Metadata = {
  metadataBase: new URL(hostUrl),
  title: 'Panel de Organizadores — AfroEventos',
  description:
    'Publica tus eventos, vende entradas y gestiona a tus asistentes desde el panel de organizadores de AfroEventos.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '1080x1080' },
    ],
    shortcut: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '1080x1080', type: 'image/png' }],
  },
  // El panel es una aplicación privada: por defecto no se indexa.
  // Las páginas públicas de captación (/register, /login) lo sobrescriben.
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
