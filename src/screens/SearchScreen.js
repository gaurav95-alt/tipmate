import React, { useState } from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { styles as b, COLORS } from '../theme';
import PremiumGate from '../components/PremiumGate';

const opts = { Destination: ['Jaipur', 'Goa', 'Manali', 'Kerala'], Budget: ['Budget', 'Comfort', 'Premium'], Interests: ['Adventure', 'Food', 'Nature', 'Culture'], Language: ['English', 'Hindi', 'Hinglish'] };

function SearchContent({ navigation }) {
  const [selected, setSelected] = useState({});
  const choose = (key, value) => setSelected((current) => ({ ...current, [key]: value }));
  return (
    <ScrollView contentContainerStyle={b.content}>
      <Text style={b.title}>Find your match</Text>
      <Text style={b.subtitle}>Set your trip preferences and discover compatible companions.</Text>
      {Object.entries(opts).map(([key, options]) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.group} key={key}>
          {options.map((value) => <Pressable key={value} style={[s.chip, selected[key] === value && s.selected]} onPress={() => choose(key, value)}><Text style={selected[key] === value ? s.selectedText : null}>{value}</Text></Pressable>)}
        </ScrollView>
      ))}
      <Text style={s.label}>Travel dates</Text>
      <Text style={b.card}>Flexible dates • Choose your preferred range</Text>
      <Pressable style={b.button} onPress={() => navigation.navigate('MatchResultsScreen')}><Text style={b.buttonText}>Search Matches</Text></Pressable>
    </ScrollView>
  );
}

export default function SearchScreen({ navigation }) {
  return <PremiumGate navigation={navigation} feature="Advanced travel matching"><SearchContent navigation={navigation} /></PremiumGate>;
}

const s = StyleSheet.create({ group: { marginTop: 18 }, label: { fontWeight: '800', color: COLORS.text, marginTop: 22, marginBottom: 9 }, chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 }, selected: { backgroundColor: COLORS.navy }, selectedText: { color: '#fff', fontWeight: '700' } });
