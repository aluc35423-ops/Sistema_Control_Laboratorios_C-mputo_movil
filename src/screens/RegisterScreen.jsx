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

const RegisterScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const [form, setForm] = useState({
    nombre: '',
    matricula: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
    const { nombre, matricula, email, password, confirmPassword } = form;

    if (!nombre.trim() || !matricula.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos obligatorios', 'Completa todos los campos para continuar.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          matricula: matricula.trim(),
          email: email.trim(),
          password,
          rol: 'USER',
        }),
      });

      Alert.alert('Cuenta creada', 'Registro exitoso. Ahora inicia sesión.', [
        { text: 'Ir a iniciar sesión', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error en el registro', error.message);
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
          <Text style={styles.eyebrow}>NUEVA CUENTA</Text>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>
            Completa tus datos para acceder al laboratorio.
          </Text>

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre y apellidos"
            placeholderTextColor="#94A3B8"
            value={form.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
          />

          <Text style={styles.label}>Matrícula *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 20240081"
            placeholderTextColor="#94A3B8"
            value={form.matricula}
            onChangeText={(text) => handleChange('matricula', text)}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Correo institucional *</Text>
          <TextInput
            style={styles.input}
            placeholder="nombre@institucion.edu.mx"
            placeholderTextColor="#94A3B8"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña *</Text>
          <PasswordInput
            placeholder="Crea una contraseña"
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            onFocus={scrollToBottom}
          />

          <Text style={styles.label}>Confirmar contraseña *</Text>
          <PasswordInput
            placeholder="Vuelve a escribir tu contraseña"
            value={form.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            onFocus={scrollToBottom}
          />

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
            >
              <Text style={styles.footerLink}>Iniciar sesión</Text>
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
    paddingTop: 18,
    paddingBottom: 180,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E10600',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#E10600',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    marginTop: 18,
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

export default RegisterScreen;