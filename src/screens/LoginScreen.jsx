import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import PasswordInput from '../components/PasswordInput';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { saveSession } = useAuth();
  const scrollRef = useRef(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      Alert.alert('Campos obligatorios', 'Ingresa tu correo institucional y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      await saveSession({
        token: data.token,
        user: data.user,
      });
    } catch (error) {
      Alert.alert('Error de inicio de sesión', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopHeader simple />

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>BIENVENIDO DE NUEVO</Text>
          <Text style={styles.title}>Inicia sesión</Text>
          <Text style={styles.subtitle}>
            Ingresa con tu correo institucional para continuar.
          </Text>

          <Text style={styles.label}>Correo institucional *</Text>
          <TextInput
            style={styles.input}
            placeholder="id@utr.edu.mx"
            placeholderTextColor="#94A3B8"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña *</Text>
          <PasswordInput
            placeholder="Ingresa tu contraseña"
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            onFocus={scrollToBottom}
          />

          <Text style={styles.helperText}>Todos los campos son obligatorios.</Text>

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={isSubmitting}
            >
              <Text style={styles.footerLink}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 140,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E10600',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 22,
  },
  primaryButton: {
    backgroundColor: '#E10600',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E10600',
  },
});

export default LoginScreen;