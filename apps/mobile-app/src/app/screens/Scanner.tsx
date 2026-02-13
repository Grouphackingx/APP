import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { api, removeToken } from '../services/api';

export default function ScannerScreen({ onLogout }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null); // { valid, message, ticket }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    // Validate token
    try {
      const validRes = await api.validateTicket(data);
      setResult(validRes); // { valid: true, ticket: ... }
    } catch (err: any) {
      setResult({ valid: false, message: err.message || 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setResult(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Sin acceso a la cámara</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay UI */}
      <View style={styles.overlayTop}>
        <Text style={styles.overlayText}>Escanear código QR</Text>
        <Text style={styles.overlaySub}>Alinea el código dentro del marco</Text>
      </View>

      <View style={styles.scanFrame} />

      <View style={styles.overlayBottom}>
        <TouchableOpacity
          onPress={async () => {
            await removeToken();
            onLogout();
          }}
          style={styles.logoutBtn}
        >
          <Text style={{ color: '#fff' }}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Result Modal */}
      <Modal visible={!!result} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              result?.valid ? styles.modalSuccess : styles.modalError,
            ]}
          >
            <Text style={styles.modalIcon}>{result?.valid ? '✅' : '❌'}</Text>
            <Text style={styles.modalTitle}>
              {result?.valid ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
            </Text>

            <Text style={styles.modalMsg}>{result?.message}</Text>

            {result?.ticket && (
              <View style={styles.ticketDetails}>
                <Text style={styles.detailText}>
                  👤 {result.ticket.holderName}
                </Text>
                <Text style={styles.detailText}>
                  🏟️ {result.ticket.eventName}
                </Text>
                <Text style={styles.detailText}>
                  🪑 {result.ticket.zone} - {result.ticket.seat}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={resetScan}>
              <Text style={styles.closeBtnText}>Escanear Otro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loaderOverlay}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Validando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  text: { color: '#fff' },
  overlayTop: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  overlaySub: { color: '#aaa', fontSize: 14 },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: '80%',
    height: 300,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    opacity: 0.5,
  },
  overlayBottom: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalSuccess: { borderLeftWidth: 10, borderLeftColor: '#10B981' },
  modalError: { borderLeftWidth: 10, borderLeftColor: '#EF4444' },
  modalIcon: { fontSize: 60, marginBottom: 10 },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMsg: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  ticketDetails: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailText: { fontSize: 16, marginBottom: 5, color: '#333' },
  closeBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
