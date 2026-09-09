import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { styles as b, COLORS } from '../theme';
import PremiumGate from '../components/PremiumGate';

const matches = [{ name: 'Aarav Sharma', place: 'Jaipur → Goa', match: 94, interests: 'Adventure • Food', verified: true }, { name: 'Meera Singh', place: 'Delhi → Manali', match: 89, interests: 'Nature • Photography', verified: true }, { name: 'Kabir Verma', place: 'Mumbai → Kerala', match: 82, interests: 'Culture • Backpacking', verified: false }];

function Results({ navigation }) {
  return <ScrollView contentContainerStyle={b.content}><Text style={b.title}>Your matches</Text><Text style={b.subtitle}>Compatibility is based on shared travel preferences and interests.</Text>{matches.map((m) => <View style={b.card} key={m.name}><View style={s.row}><View style={s.avatar}><Text style={s.avatarText}>{m.name[0]}</Text></View><View style={{ flex: 1 }}><Text style={s.name}>{m.name} {m.verified ? '✓' : ''}</Text><Text style={b.subtitle}>{m.place}</Text></View><Text style={s.score}>{m.match}%</Text></View><Text style={s.interests}>{m.interests}</Text><Pressable style={b.button} onPress={() => navigation.navigate('ChatScreen', { name: m.name })}><Text style={b.buttonText}>Connect / Chat</Text></Pressable></View>)}</ScrollView>;
}

export default function MatchResultsScreen({ navigation }) { return <PremiumGate navigation={navigation} feature="Verified partner matches"><Results navigation={navigation} /></PremiumGate>; }

const s = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' }, name: { fontSize: 17, fontWeight: '800', color: COLORS.navy }, score: { fontSize: 20, fontWeight: '900', color: COLORS.green }, interests: { marginVertical: 14, color: COLORS.muted } });
