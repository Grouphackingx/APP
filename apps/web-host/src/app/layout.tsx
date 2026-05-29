'use client';

import './global.css';
import { AuthProvider } from '../lib/AuthContext';
import { ImpersonationBanner } from '../components/ImpersonationBanner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ImpersonationBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
