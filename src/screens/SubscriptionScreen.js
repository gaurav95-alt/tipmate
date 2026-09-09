import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';
import { createSubscriptionCheckout, getSubscription } from '../services/api';
import RazorpayCheckout from 'react-native-razorpay';

const PLANS = {
  monthly: { amount: 99, label: 'Monthly', detail: '₹99 / month' },
  yearly: { amount: 649, label: 'Yearly', detail: '₹649 / year', badge: 'BEST VALUE' },
};

const formatRemaining = (end) => {
  if (!end) return 'Trial status unavailable';
  const ms = new Date(end).getTime() - Date.now();
  if (ms <= 0) return 'Trial expired';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return `${days}d ${hours}h remaining`;
};

export default function SubscriptionScreen({ navigation }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [now, setNow] = useState(Date.now());

  const load = async () => {
    try {
      const data = await getSubscription();
      setSubscription(data.subscription);
    } catch (error) {
      Alert.alert('Unable to load subscription', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);

  const trialText = useMemo(() => {
    if (!subscription) return '';
    if (subscription.status === 'trialing') return formatRemaining(subscription.trialEndsAt);
    if (subscription.status === 'active') return `Premium active${subscription.currentPeriodEnd ? ` • renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : ''}`;
    return 'Your free trial has ended';
  }, [subscription, now]);

  const checkout = async (billingCycle) => {
    setProcessing(billingCycle);
    try {
      const data = await createSubscriptionCheckout(billingCycle);
      const payment = data.payment || {};
      const razorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        Alert.alert('Payment setup required', 'Add EXPO_PUBLIC_RAZORPAY_KEY_ID to the Expo environment before enabling Razorpay checkout.');
        return;
      }

      const options = {
        key: razorpayKey,
        amount: payment.amount * 100,
        currency: payment.currency || 'INR',
        name: 'JustSPAI',
        description: `${PLANS[billingCycle].label} subscription`,
        prefill: {},
        theme: { color: COLORS.navy },
      };

      // A verified server-side webhook is still required to activate premium access.
      if (payment.orderId) options.order_id = payment.orderId;
      if (payment.subscriptionId) options.subscription_id = payment.subscriptionId;

      const result = await RazorpayCheckout.open(options);
      Alert.alert('Payment submitted', 'Your payment was submitted. Premium access will activate after the backend verifies the payment.');
      await load();
      return result;
    } catch (error) {
      if (error?.description !== 'Payment cancelled by user') {
        Alert.alert('Payment not completed', error?.description || error?.message || 'Please try again.');
      }
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Loading your plan…</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>JUSTSPAI PREMIUM</Text>
      <Text style={styles.title}>Travel more. Match smarter.</Text>
      <Text style={styles.subtitle}>Unlock advanced discovery, unlimited chats and verified partner matches.</Text>

      <View style={styles.trialCard}>
        <Text style={styles.trialTitle}>{subscription?.status === 'trialing' ? '🎉 7-day free trial' : subscription?.status === 'active' ? '✨ Premium active' : 'Your trial has ended'}</Text>
        <Text style={styles.trialText}>{trialText}</Text>
        {subscription?.status === 'trialing' && <Text style={styles.small}>No paid access is granted after expiry without a verified subscription.</Text>}
      </View>

      {Object.entries(PLANS).map(([cycle, plan]) => (
        <View key={cycle} style={[styles.plan, cycle === 'yearly' && styles.featured]}>
          {plan.badge && <Text style={styles.badge}>{plan.badge}</Text>}
          <Text style={styles.planName}>{plan.label}</Text>
          <Text style={styles.price}>{plan.detail}</Text>
          <Text style={styles.planText}>{cycle === 'monthly' ? 'Flexible monthly billing.' : 'Best value for a full year of premium access.'}</Text>
          <Pressable style={styles.button} disabled={!!processing} onPress={() => checkout(cycle)}>
            {processing === cycle ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Choose {plan.label}</Text>}
          </Pressable>
        </View>
      ))}

      <Text style={styles.security}>🔐 Payments are initiated by the app, while subscription activation is trusted only after backend verification.</Text>
      <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>Back</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, backgroundColor: '#fff', flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  eyebrow: { color: COLORS.muted, fontWeight: '900', letterSpacing: 2, fontSize: 12 },
  title: { color: COLORS.navy, fontSize: 28, fontWeight: '900', marginTop: 8 },
  subtitle: { color: COLORS.muted, lineHeight: 21, marginTop: 8 },
  trialCard: { backgroundColor: '#EAF8F1', borderRadius: 18, padding: 18, marginTop: 22, marginBottom: 18, borderWidth: 1, borderColor: '#B7E5CD' },
  trialTitle: { color: COLORS.navy, fontSize: 18, fontWeight: '900' },
  trialText: { color: COLORS.green, fontSize: 16, fontWeight: '800', marginTop: 5 },
  small: { color: COLORS.muted, fontSize: 12, marginTop: 7, lineHeight: 17 },
  plan: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 20, marginBottom: 14, backgroundColor: '#fff' },
  featured: { borderColor: COLORS.navy, borderWidth: 2 },
  badge: { alignSelf: 'flex-start', backgroundColor: COLORS.navy, color: '#fff', fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, marginBottom: 10 },
  planName: { color: COLORS.navy, fontSize: 19, fontWeight: '900' },
  price: { color: COLORS.text, fontSize: 25, fontWeight: '900', marginTop: 5 },
  planText: { color: COLORS.muted, marginTop: 5, marginBottom: 16 },
  button: { backgroundColor: COLORS.navy, borderRadius: 12, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '900' },
  security: { color: COLORS.muted, textAlign: 'center', lineHeight: 18, fontSize: 12, marginVertical: 12 },
  back: { color: COLORS.navy, fontWeight: '800', textAlign: 'center', padding: 14 },
  muted: { color: COLORS.muted },
});
