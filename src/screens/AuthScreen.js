import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { styles as base, COLORS } from '../theme';
export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  return <ScrollView contentContainerStyle={[base.content, { flexGrow: 1, justifyContent: 'center' }]}>
    <Text style={s.logo}>JUSTSPAI</Text><Text style={base.title}>Travel safe. Travel smart.</Text>
    <Text style={base.subtitle}>Find verified travel companions who match your plans, interests and budget.</Text>
    <TextInput style={base.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
    <TextInput style={base.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
    <Pressable style={base.button} onPress={() => navigation.navigate('ProfileScreen')}><Text style={base.buttonText}>Continue</Text></Pressable>
    <Pressable style={s.secondary} onPress={() => Alert.alert('JustSPAI', 'Authentication will be connected to the backend in the next phase.')}><Text style={s.secondaryText}>Create an account</Text></Pressable>
  </ScrollView>;
}
const s = StyleSheet.create({ logo:{fontSize:15,fontWeight:'900',letterSpacing:3,color:COLORS.navy,marginBottom:20},secondary:{padding:15,alignItems:'center'},secondaryText:{color:COLORS.navy,fontWeight:'700'}});
