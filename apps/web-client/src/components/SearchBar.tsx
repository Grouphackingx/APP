'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition, Suspense, useRef } from 'react';

function SearchBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isExpanded, setIsExpanded] = useState(!!searchParams.get('q'));
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPushedRef = useRef(searchParams.get('q') || '');

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Debounced navigation — only depends on query, not searchParams
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query === lastPushedRef.current) return;
      lastPushedRef.current = query;

      const params = new URLSearchParams(window.location.search);
      if (query) {
        params.set('q', query);
        params.delete('category'); // reset category on new search
      } else {
        params.delete('q');
      }

      startTransition(() => {
        router.push(`/?${params.toString()}`, { scroll: false });
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [query, router]);

  const handleClear = () => {
    setQuery('');
    lastPushedRef.current = '';
    startTransition(() => {
      router.push('/', { scroll: false });
    });
    inputRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginRight: '0.5rem' }}>
      {!isExpanded && (
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
            transition: 'opacity 0.2s ease',
          }}
          title="Buscar eventos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      )}

      <div style={{
        display: isExpanded ? 'flex' : 'none',
        alignItems: 'center',
        background: 'var(--bg-card)',
        border: `1px solid ${isPending ? 'rgba(106,196,77,0.6)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-full)',
        padding: '0.4rem 1rem',
        width: '250px',
        transition: 'border-color 0.2s ease',
      }}>
        <span style={{ marginRight: '0.5rem', opacity: isPending ? 1 : 0.5, display: 'flex', color: isPending ? '#6AC44D' : 'currentColor', transition: 'color 0.2s, opacity 0.2s' }}>
          {isPending ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.7s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar eventos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { handleClear(); setIsExpanded(false); } }}
          onBlur={() => { if (!query) setIsExpanded(false); }}
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
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0 0.2rem',
              fontSize: '1rem',
              lineHeight: 1,
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
