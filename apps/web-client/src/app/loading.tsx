export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(106,196,77,0.2)',
        borderTop: '3px solid #6AC44D',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Buscando eventos...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
