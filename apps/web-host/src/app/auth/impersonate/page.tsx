'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';

export default function ImpersonatePage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) { router.replace('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.impersonatedBy) { router.replace('/login'); return; }
      loginUser(token, {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        role: payload.role,
        organizerProfileId: payload.organizerProfileId ?? null,
        organizerProfile: { status: 'APPROVED', id: payload.organizerProfileId },
        impersonatedBy: payload.impersonatedBy,
      });
      router.replace('/dashboard?view=dashboard');
    } catch {
      router.replace('/login');
    }
  }, [loginUser, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '2rem' }}>👁</div>
      <p>Iniciando modo vista de administrador...</p>
    </div>
  );
}
