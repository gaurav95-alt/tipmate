import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { styles as b, COLORS } from '../theme';
import PremiumGate from '../components/PremiumGate';

function ChatContent({ navigation, name }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ from: 'them', text: 'Hey! Excited to plan this trip together.' }, { from: 'me', text: 'Same here! Let’s compare our itinerary.' }]);
  const send = () => { if (!message.trim()) return; setMessages((current) => [...current, { from: 'me', text: message.trim() }]); setMessage(''); };
  return (
    <KeyboardAvoidingView style={b.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={b.content}>{messages.map((m, i) => <View key={i} style={[s.bubble, m.from === 'me' ? s.mine : s.theirs]}><Text style={m.from === 'me' ? s.mineText : s.theirsText}>{m.text}</Text></View>)}
        <Pressable style={b.card} onPress={() => navigation.navigate('TripPlanningScreen')}><Text style={s.planTitle}>🗺 Trip Planning</Text><Text style={b.subtitle}>Collaboratively plan stops, dates, notes and shared expenses.</Text></Pressable>
      </ScrollView>
      <View style={s.composer}><TextInput style={s.input} placeholder={'Message ' + name} value={message} onChangeText={setMessage} /><Pressable style={s.send} onPress={send}><Text style={{ color: '#fff', fontWeight: '800' }}>Send</Text></Pressable></View>
    </KeyboardAvoidingView>
  );
}

export default function ChatScreen({ navigation, route }) {
  const name = route?.params?.name || 'Travel Buddy';
  return <PremiumGate navigation={navigation} feature="Unlimited chats"><ChatContent navigation={navigation} name={name} /></PremiumGate>;
}

const s = StyleSheet.create({ bubble: { maxWidth: '82%', padding: 13, borderRadius: 16, marginBottom: 10 }, mine: { alignSelf: 'flex-end', backgroundColor: COLORS.navy }, theirs: { alignSelf: 'flex-start', backgroundColor: '#EEF3F7' }, mineText: { color: '#fff' }, theirsText: { color: COLORS.text }, planTitle: { fontSize: 17, fontWeight: '800', color: COLORS.navy, marginBottom: 5 }, composer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' }, input: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 13 }, send: { backgroundColor: COLORS.navy, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', marginLeft: 7 } });
