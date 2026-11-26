import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Seguro que deseas salir de la aplicación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={96} color="#E10600" />
        <Text style={styles.name}>{user?.nombre || 'Usuario UTR'}</Text>
        <Text style={styles.email}>{user?.email || '---'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>ROL: {user?.rol || 'USER'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', marginTop: 40 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 10 },
  email: { fontSize: 15, color: '#64748B', marginTop: 4 },
  roleBadge: {
    marginTop: 12,
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { color: '#E10600', fontWeight: 'bold', fontSize: 13 },
  logoutButton: {
    backgroundColor: '#E10600',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;