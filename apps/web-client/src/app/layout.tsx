import './global.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Providers } from '../components/Providers';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4200'),
  title: 'AfroEventos — El punto de encuentro de nuestra gente',
  description:
    'El punto de encuentro de nuestra gente. Descubre eventos, fiestas, festivales, conciertos y experiencias culturales en una sola plataforma.',
  keywords: 'eventos, tickets, conciertos, festivales, entradas, boletos, afro, cultura',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    siteName: 'AfroEventos',
    type: 'website',
    title: 'AfroEventos — El punto de encuentro de nuestra gente',
    description:
      'El punto de encuentro de nuestra gente. Descubre eventos, fiestas, festivales, conciertos y experiencias culturales en una sola plataforma.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AfroEventos',
  url: 'https://afroeventos.com',
  logo: 'https://afroeventos.com/favicon.svg',
  description:
    'El punto de encuentro de nuestra gente. Descubre eventos, fiestas, festivales, conciertos y experiencias culturales en una sola plataforma.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
