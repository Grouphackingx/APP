'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  useEffect(() => {
    if (token && user) {
      if (user.role === 'ADMIN') {
        router.replace('/dashboard');
      } else {
        // Kick non-admins out securely
        logout();
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [user, token, router, logout]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium tracking-wide">Autenticando Global Admin...</p>
      </div>
    </div>
  );
}
