import './global.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/AuthContext';

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:4202';

export const metadata: Metadata = {
  metadataBase: new URL(adminUrl),
  title: 'Global Admin Dashboard | AfroEventos',
  description: 'Administración de Organizadores y Eventos',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  // Panel de administración 100% privado: nunca debe indexarse.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
