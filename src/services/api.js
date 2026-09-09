import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'justspai_auth_token';

export const setAuthToken = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getAuthToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const clearAuthToken = () => AsyncStorage.removeItem(TOKEN_KEY);

export async function apiRequest(path, options = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await setAuthToken(data.token);
  return data;
}

export async function register(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await setAuthToken(data.token);
  return data;
}

export const getSubscription = () => apiRequest('/subscription');
export const getSubscriptionAccess = () => apiRequest('/subscription/access');

export const createSubscriptionCheckout = (billingCycle) =>
  apiRequest('/subscription/checkout', {
    method: 'POST',
    body: JSON.stringify({ gateway: 'razorpay', billingCycle }),
  });
