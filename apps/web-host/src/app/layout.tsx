import './global.css';

export const metadata = {
  title: 'OpenTicket Host — Panel de Organizador',
  description:
    'Crea y gestiona tus eventos con OpenTicket. Panel de administración para organizadores.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
