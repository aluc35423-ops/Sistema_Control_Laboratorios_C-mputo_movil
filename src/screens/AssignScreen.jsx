import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MATERIAS_SUGERIDAS = [
  'Desarrollo Web Integral',
  'Desarrollo para Dispositivos Inteligentes',
  'Arquitectura de Computadoras',
  'Bases de Datos',
  'Redes y Seguridad',
  'Otra materia...',
];

const formatHour = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const formatDateShort = (date) => {
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return `HOY · ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const getUserIdFromToken = (token) => {
  try {
    if (!token || typeof global.atob !== 'function') return null;
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    if (!base64) return null;
    const payload = JSON.parse(global.atob(base64));
    return payload.id ?? payload._id ?? payload.userId ?? payload.sub ?? null;
  } catch {
    return null;
  }
};

const AssignScreen = ({ route, navigation }) => {
  const computer = route?.params?.computer;
  const { user, token } = useAuth();

  const [selectedMateria, setSelectedMateria] = useState('Desarrollo Web Integral');
  const [customMateria, setCustomMateria] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [horasUso, setHorasUso] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!computer) {
    return (
      <View style={styles.screen}>
        <TopHeader
          onSearchPress={() => navigation.navigate('LabsGrid', { openSearch: true })}
          onProfilePress={() => navigation.navigate('Profile')}
        />
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyText}>No se recibieron datos de la computadora.</Text>
          <TouchableOpacity style={styles.confirmButton} onPress={() => navigation.goBack()}>
            <Text style={styles.confirmButtonText}>Volver a laboratorios</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const inventario =
    computer.numeroInventario || computer.numerolnventario || `CMP-${computer.id}`;
  const perifericos = Array.isArray(computer.perifericosIncluidos)
    ? computer.perifericosIncluidos.join(', ')
    : 'Monitor, teclado y mouse';

  const now = new Date();
  const estimatedEnd = new Date(now.getTime() + horasUso * 60 * 60 * 1000);

  const handleSubmit = async () => {
    const materiaFinal =
      selectedMateria === 'Otra materia...' ? customMateria.trim() : selectedMateria;

    if (!materiaFinal) {
      Alert.alert('Campo obligatorio', 'Selecciona o escribe la materia.');
      return;
    }

    const computerId = computer.id ?? computer._id ?? computer.computerId;
    const userId = user?.id ?? user?._id ?? user?.userId ?? getUserIdFromToken(token);

    if (computerId == null) {
      Alert.alert('Error de equipo', 'No se encontró el identificador de esta computadora.');
      return;
    }

    const payload = {
      computerId,
      materia: materiaFinal,
      horasUso: Number(horasUso),
    };

    if (userId != null) {
      payload.userId = userId;
    }

    setIsSubmitting(true);
    try {
      console.log('[AssignScreen] Enviando payload:', payload);
      await apiFetch('/api/labs/assignments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      Alert.alert(
        'Asignación confirmada',
        `La estación ${inventario} está lista para tu sesión.`,
        [
          {
            text: 'Ver mi sesión',
            onPress: () => {
              navigation.goBack();
              navigation.getParent()?.navigate('Mi sesión');
            },
          },
        ]
      );
    } catch (error) {
      console.error('[AssignScreen] Error al asignar:', error);
      Alert.alert('No se pudo asignar', error.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopHeader
        onSearchPress={() => navigation.navigate('LabsGrid', { openSearch: true })}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={16} color="#0F766E" />
            <Text style={styles.backLinkText}>Volver a laboratorios</Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>ASIGNACIÓN DE EQUIPO</Text>
          <Text style={styles.title}>Prepara tu próxima sesión</Text>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.smallLabel}>TU ESTACIÓN</Text>
              <View style={styles.availableBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.availableText}>DISPONIBLE</Text>
              </View>
            </View>

            <View style={styles.stationBanner}>
              <Ionicons name="desktop-outline" size={38} color="#1E293B" />
              <View style={styles.stationBannerText}>
                <Text style={styles.stationCode}>{computer._pcLabel || inventario}</Text>
                <Text style={styles.stationSub}>Inventario {inventario}</Text>
              </View>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specKey}>Laboratorio</Text>
              <Text style={styles.specVal}>{computer.laboratorio}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Especificaciones</Text>
              <Text style={styles.specVal} numberOfLines={2}>
                {computer.especificaciones || 'Estándar UTR'}
              </Text>
            </View>
            <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.specKey}>Periféricos</Text>
              <Text style={styles.specVal}>{perifericos}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Datos de tu sesión</Text>
            <Text style={styles.sectionSub}>Los campos marcados con * son obligatorios.</Text>

            <Text style={styles.fieldLabel}>Materia *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.dropdownText}>{selectedMateria}</Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>

            {selectedMateria === 'Otra materia...' ? (
              <TextInput
                style={styles.input}
                placeholder="Escribe el nombre de la materia"
                placeholderTextColor="#94A3B8"
                value={customMateria}
                onChangeText={setCustomMateria}
              />
            ) : null}

            <Text style={styles.fieldLabel}>Horas de uso *</Text>
            <View style={styles.hoursRow}>
              {[1, 2, 3].map((h) => {
                const active = horasUso === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.hourButton, active && styles.hourButtonActive]}
                    onPress={() => setHorasUso(h)}
                  >
                    <Text style={[styles.hourText, active && styles.hourTextActive]}>
                      {h} {h === 1 ? 'hora' : 'horas'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.timeBox}>
              <Text style={styles.dateCaption}>{formatDateShort(now)}</Text>
              <View style={styles.timeRow}>
                <View>
                  <Text style={styles.timeLabel}>Inicio</Text>
                  <Text style={styles.timeValue}>{formatHour(now)}</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#64748B" />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.timeLabel}>Fin estimado</Text>
                  <Text style={styles.timeValue}>{formatHour(estimatedEnd)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.ruleTitle}>Una estación, una sesión a la vez.</Text>
            <Text style={styles.ruleDesc}>
              Al confirmar, la PC quedará ocupada a tu nombre. Libera el equipo al terminar y
              reporta cualquier falla.
            </Text>

            <TouchableOpacity
              style={[styles.confirmButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.confirmButtonText}>Confirmar asignación</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.footerInfo}>
              Asignación para {user?.nombre || 'Estudiante'} · Matrícula {user?.matricula || '---'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecciona tu materia</Text>
            {MATERIAS_SUGERIDAS.map((mat) => (
              <TouchableOpacity
                key={mat}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedMateria(mat);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedMateria === mat && { color: '#E10600', fontWeight: '700' },
                  ]}
                >
                  {mat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F8' },
  flex: { flex: 1 },
  emptyCenter: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  emptyText: { textAlign: 'center', fontSize: 15, color: '#475569' },
  content: { padding: 16, paddingBottom: 120 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  backLinkText: { color: '#0F766E', fontSize: 13, fontWeight: '700' },
  eyebrow: { fontSize: 11, fontWeight: '800', color: '#0F766E', letterSpacing: 0.6 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginTop: 4, marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  availableText: { fontSize: 11, fontWeight: '800', color: '#047857' },
  stationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    marginBottom: 14,
  },
  stationBannerText: { flex: 1 },
  stationCode: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  stationSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  specKey: { fontSize: 12, color: '#64748B' },
  specVal: { fontSize: 12, fontWeight: '700', color: '#1E293B', flex: 1, textAlign: 'right' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  sectionSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 8 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
    color: '#0F172A',
  },
  hoursRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  hourButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  hourButtonActive: {
    borderColor: '#0F766E',
    backgroundColor: '#ECFDF5',
  },
  hourText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  hourTextActive: { color: '#0F766E', fontWeight: '800' },
  timeBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  dateCaption: { fontSize: 10, fontWeight: '800', color: '#64748B', marginBottom: 8 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeLabel: { fontSize: 11, color: '#64748B' },
  timeValue: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  ruleTitle: { fontSize: 12, fontWeight: '800', color: '#1E293B', marginBottom: 3 },
  ruleDesc: { fontSize: 12, color: '#64748B', lineHeight: 17, marginBottom: 16 },
  confirmButton: {
    backgroundColor: '#E10600',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footerInfo: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, zIndex: 2 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionText: { fontSize: 14, color: '#334155' },
});

export default AssignScreen;