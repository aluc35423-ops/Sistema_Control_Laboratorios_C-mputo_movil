import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export const SESSION_KEY = 'user_session_token';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN || '';

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const apiFetch = async (endpoint, options = {}) => {
  let userToken = null;

  try {
    const stored = await SecureStore.getItemAsync(SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      userToken = parsed.token || null;
    }
  } catch (error) {
    console.error('Error leyendo sesión en SecureStore:', error);
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-token': APP_TOKEN,
    ...(options.headers || {}),
  };

  if (userToken) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const rawText = await response.text();
  let data = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = { message: rawText };
  }

  if (response.status === 401) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    if (unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new Error(data?.message || 'Sesión expirada o credenciales inválidas (401).');
  }

  if (response.status === 403) {
    Alert.alert(
      'Acceso restringido',
      data?.message || 'No cuentas con permisos suficientes para esta acción (403).'
    );
    throw new Error(data?.message || 'Acceso restringido (403).');
  }

  if (response.status === 404) {
    throw new Error(data?.message || 'Recurso no encontrado (404).');
  }

  if (response.status >= 500) {
    throw new Error(data?.message || 'Error interno del servidor (500). Intenta de nuevo.');
  }

  const serverMessage =
      data?.message ||
      data?.error ||
      data?.detail ||
      (Array.isArray(data?.errors)
        ? data.errors.map((e) => e.msg || e.message || String(e)).join(', ')
        : null);

  if (!response.ok) {
    throw new Error(serverMessage || `Error HTTP ${response.status}`);
  }

  return data;
};