import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';
import { getSubscriptionAccess } from '../services/api';

export default function PremiumGate({ navigation, children, feature = 'This feature' }) {
  const [allowed, setAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const refreshAccess = async () => {
    try {
      await getSubscriptionAccess();
      setAllowed(true);
    } catch (error) {
      if (error.status === 403) {
        setAllowed(false);
        setShowPaywall(true);
      } else {
        Alert.alert('Connection problem', 'We could not validate your subscription. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshAccess(); }, []);

  if (loading) return <View style={styles.loading}><Text style={styles.muted}>Checking access…</Text></View>;
  if (allowed) return children;

  return (
    <View style={styles.locked}>
      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.title}>{feature} is premium</Text>
      <Text style={styles.text}>Your free trial has ended. Subscribe to continue using premium JustSPAI features.</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('SubscriptionScreen')}>
        <Text style={styles.buttonText}>View plans</Text>
      </Pressable>
      <Modal visible={showPaywall} transparent animationType="fade" onRequestClose={() => setShowPaywall(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.lockIcon}>✨</Text>
            <Text style={styles.title}>Keep exploring with JustSPAI</Text>
            <Text style={styles.text}>Choose ₹99/month or ₹649/year to unlock premium features.</Text>
            <Pressable style={styles.button} onPress={() => { setShowPaywall(false); navigation.navigate('SubscriptionScreen'); }}>
              <Text style={styles.buttonText}>See subscription plans</Text>
            </Pressable>
            <Pressable onPress={() => setShowPaywall(false)}><Text style={styles.cancel}>Not now</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { padding: 24, alignItems: 'center' },
  locked: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 22 },
  modal: { backgroundColor: '#fff', borderRadius: 22, padding: 24, alignItems: 'center' },
  lockIcon: { fontSize: 34, marginBottom: 10 },
  title: { color: COLORS.navy, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  text: { color: COLORS.muted, lineHeight: 21, textAlign: 'center', marginTop: 9, marginBottom: 18 },
  button: { backgroundColor: COLORS.navy, paddingVertical: 13, paddingHorizontal: 20, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '800' },
  cancel: { color: COLORS.muted, fontWeight: '700', marginTop: 15 },
  muted: { color: COLORS.muted },
});
