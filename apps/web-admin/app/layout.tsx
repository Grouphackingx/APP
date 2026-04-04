import './global.css';
import { AuthProvider } from '../lib/AuthContext';

export const metadata = {
  title: 'Global Admin Dashboard | OpenTicket',
  description: 'Administración de Organizadores y Eventos',
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
