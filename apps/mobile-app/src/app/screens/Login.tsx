import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api, saveToken } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert('Ingresa credenciales');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.access_token) {
        await saveToken(res.access_token);
        onLogin(res.access_token);
      }
    } catch (err: any) {
      alert(err.message || 'Error login');
    } finally {
      setLoading(false);
    }
  };

  const alert = (msg) => Alert.alert('Error', msg);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎫 OpenTicket Validator</Text>
      <Text style={styles.subtitle}>Staff Access Only</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B12',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    backgroundColor: '#0F0F18',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  btn: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
