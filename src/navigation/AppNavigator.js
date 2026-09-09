import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import MatchResultsScreen from '../screens/MatchResultsScreen';
import ChatScreen from '../screens/ChatScreen';
import TripPlanningScreen from '../screens/TripPlanningScreen';
import SafetyScreen from '../screens/SafetyScreen';

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  return <NavigationContainer>
    <Stack.Navigator initialRouteName="AuthScreen" screenOptions={{ headerStyle: { backgroundColor: '#0A2540' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="AuthScreen" component={AuthScreen} options={{ title: 'JustSPAI' }} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ title: 'Find Travel Buddies' }} />
      <Stack.Screen name="MatchResultsScreen" component={MatchResultsScreen} options={{ title: 'Your Matches' }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="TripPlanningScreen" component={TripPlanningScreen} options={{ title: 'Trip Planner' }} />
      <Stack.Screen name="SafetyScreen" component={SafetyScreen} options={{ title: 'Safety & SOS' }} />
    </Stack.Navigator>
  </NavigationContainer>;
}
