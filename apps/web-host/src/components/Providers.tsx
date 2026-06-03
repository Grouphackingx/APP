'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../lib/AuthContext';
import { ImpersonationBanner } from './ImpersonationBanner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ImpersonationBanner />
      {children}
    </AuthProvider>
  );
}
