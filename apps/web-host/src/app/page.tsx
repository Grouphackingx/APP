'use client';

import { AuthProvider, useAuth } from '../lib/AuthContext';
import LoginPage from './login/LoginPage';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

export default function HomePage() {
  return (
    <AuthProvider>
      <AuthGate>
        <DashboardRedirect />
      </AuthGate>
    </AuthProvider>
  );
}

function DashboardRedirect() {
  // Use dynamic import to avoid SSR issues
  const Dashboard = require('./dashboard/DashboardPage').default;
  return <Dashboard />;
}
