'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useRef } from 'react';

function SearchBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get('q') || '';
      if (query !== currentQ) {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set('q', query);
        } else {
          params.delete('q');
        }
        router.push(`/?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginRight: '0.5rem' }}>
      <button 
        onClick={() => setIsExpanded(true)}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          opacity: isExpanded ? 0 : 1,
          position: isExpanded ? 'absolute' : 'relative',
          pointerEvents: isExpanded ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
          zIndex: 1,
        }}
        title="Buscar eventos"
      >
        🔍
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-full)',
        padding: isExpanded ? '0.4rem 1rem' : '0',
        width: isExpanded ? '250px' : '0px',
        opacity: isExpanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        pointerEvents: isExpanded ? 'auto' : 'none',
      }}>
        <span style={{ marginRight: '0.5rem', opacity: 0.6, fontSize: '1rem' }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar eventos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => {
            if (!query) setIsExpanded(false);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            outline: 'none',
            width: '100%',
            fontSize: '0.9rem',
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0 0.2rem',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={<div style={{ width: 32, height: 32, marginRight: '0.5rem' }} />}>
      <SearchBarContent />
    </Suspense>
  );
}
