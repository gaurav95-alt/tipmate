import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { styles as b, COLORS } from '../theme';
import { login, register } from '../services/api';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return Alert.alert('Missing details', 'Please enter your email and password.');
    if (mode === 'register' && !name.trim()) return Alert.alert('Missing details', 'Please enter your name.');
    if (password.length < 8) return Alert.alert('Password too short', 'Password must be at least 8 characters.');
    setBusy(true);
    try {
      const data = mode === 'login' ? await login(email, password) : await register({ name, email, password });
      if (mode === 'register') Alert.alert('Welcome to JustSPAI', 'Your 7-day free trial has started.');
      navigation.replace('HomeScreen', { user: data.user });
    } catch (error) {
      Alert.alert(mode === 'login' ? 'Sign in failed' : 'Registration failed', error.message);
    } finally { setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={[b.content, { flexGrow: 1, justifyContent: 'center' }]}>
      <Text style={s.logo}>JUSTSPAI</Text>
      <Text style={b.title}>Travel safe. Travel smart.</Text>
      <Text style={b.subtitle}>Find verified travel companions who match your plans, interests and budget.</Text>
      {mode === 'register' && <TextInput style={b.input} placeholder="Full name" value={name} onChangeText={setName} />}
      <TextInput style={b.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={b.input} placeholder="Password (8+ characters)" secureTextEntry value={password} onChangeText={setPassword} />
      <Pressable style={[b.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}><Text style={b.buttonText}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</Text></Pressable>
      <Pressable style={s.secondary} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}><Text style={s.secondaryText}>{mode === 'login' ? 'New to JustSPAI? Create an account' : 'Already have an account? Sign in'}</Text></Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({ logo: { fontSize: 15, fontWeight: '900', letterSpacing: 3, color: COLORS.navy, marginBottom: 20 }, secondary: { padding: 15, alignItems: 'center' }, secondaryText: { color: COLORS.navy, fontWeight: '700', textAlign: 'center' } });
