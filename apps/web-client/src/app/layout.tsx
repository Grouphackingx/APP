import './global.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Providers } from '../components/Providers';

export const metadata = {
  title: 'OpenTicket — Descubre Eventos Increíbles',
  description:
    'Encuentra y compra tickets para los mejores eventos, conciertos y festivales. Selecciona tus asientos y recibe tu entrada digital al instante.',
  keywords: 'eventos, tickets, conciertos, festivales, entradas, boletos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <div className="bg-animated" />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
