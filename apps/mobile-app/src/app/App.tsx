import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from './screens/Login';
import ScannerScreen from './screens/Scanner';
import { getToken } from './services/api';

export default function App() {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then((token) => {
      if (token) setSession(token);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: '#0B0B12',
        }}
      >
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return session ? (
    <ScannerScreen onLogout={() => setSession(null)} />
  ) : (
    <LoginScreen onLogin={(token) => setSession(token)} />
  );
}
