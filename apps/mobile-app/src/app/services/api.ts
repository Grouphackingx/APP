
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// In Expo Go, localhost works differently
// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
// Physical Device: Your LAN IP
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  if (Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${host}:3000/api`;
  }
  
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
};

export const API_URL = getBaseUrl();

export const saveToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('auth_token', token);
  } else {
    await SecureStore.setItemAsync('auth_token', token);
  }
};

export const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('auth_token');
  } else {
    return await SecureStore.getItemAsync('auth_token');
  }
};

export const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('auth_token');
  } else {
    await SecureStore.deleteItemAsync('auth_token');
  }
};

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Credenciales inválidas');
    return res.json();
  },

  validateTicket: async (tokenStr) => {
    const authToken = await getToken();
    const res = await fetch(`${API_URL}/tickets/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: tokenStr }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al validar ticket');
    return data;
  }
};
