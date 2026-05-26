'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

export function ConfirmModal({ title, message, variant = 'default', onConfirm, onCancel }: {
  title: string; message: string; variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void; onCancel: () => void;
}) {
  const icon = variant === 'danger' ? '🗑️' : variant === 'warning' ? '⚠️' : '❓';
  const confirmColor = variant === 'danger' ? '#ef4444' : variant === 'warning' ? '#fb923c' : 'var(--color-primary)';
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>{icon}</div>
        <h3 style={{ color: 'var(--text-primary)', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{ padding: '0.6rem 1.4rem', borderRadius: '9px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            style={{ padding: '0.6rem 1.4rem', borderRadius: '9px', border: 'none', background: confirmColor, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ToastStack({ toasts }: { toasts: { id: number; msg: string; type: 'success' | 'error' | 'warning' }[] }) {
  if (!toasts.length) return null;
  return createPortal(
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9100, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.75rem 1.25rem', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: '0.875rem',
          fontWeight: 500, maxWidth: '340px', animation: 'slideInRight 0.25s ease',
          background: t.type === 'success' ? 'rgba(16,185,129,0.15)' : t.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(251,146,60,0.15)',
          border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,0.4)' : t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(251,146,60,0.4)'}`,
          color: t.type === 'success' ? '#6ee7b7' : t.type === 'error' ? '#fca5a5' : '#fb923c',
        }}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '⚠'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}

export function useConfirm() {
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; variant?: 'danger' | 'warning' | 'default'; onConfirm: () => void } | null>(null);
  const showConfirm = (title: string, message: string, onConfirm: () => void, variant?: 'danger' | 'warning' | 'default') =>
    setConfirmModal({ title, message, variant, onConfirm });
  const modalNode = confirmModal ? (
    <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(null)} />
  ) : null;
  return { showConfirm, modalNode };
}

export function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' | 'warning' }[]>([]);
  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  const toastNode = <ToastStack toasts={toasts} />;
  return { showToast, toastNode };
}
