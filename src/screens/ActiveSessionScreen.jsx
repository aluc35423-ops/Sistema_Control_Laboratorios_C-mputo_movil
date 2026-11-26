import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatTimer = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = String(Math.floor(safe / 3600)).padStart(2, '0');
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, '0');
  const s = String(safe % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const ActiveSessionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReleasing, setIsReleasing] = useState(false);
  const [reporteFalla, setReporteFalla] = useState(false);
  const [descripcionFalla, setDescripcionFalla] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const fetchActiveSession = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/labs/assignments');
      const list = Array.isArray(data) ? data : data?.assignments || data?.data || [];
      const current = list.find((a) => a.estatus === 'ASIGNADA') || null;
      setActiveAssignment(current);

      if (current?.inicio) {
        const startMs = new Date(current.inicio).getTime();
        if (!Number.isNaN(startMs)) {
          setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
        }
      } else {
        setElapsedSeconds(0);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveSession();
    }, [])
  );

  useEffect(() => {
    if (!activeAssignment) return undefined;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeAssignment]);

  const handleRelease = async () => {
    if (!activeAssignment) return;

    if (reporteFalla && !descripcionFalla.trim()) {
      Alert.alert('Campo obligatorio', 'Describe la falla encontrada en el equipo.');
      return;
    }

    const assignmentId = activeAssignment.assignmentId || activeAssignment.id;
    setIsReleasing(true);

    try {
      await apiFetch(`/api/labs/assignments/${assignmentId}/release`, {
        method: 'PATCH',
        body: JSON.stringify({
          reporteFalla,
          descripcionFalla: reporteFalla ? descripcionFalla.trim() : '',
        }),
      });

      Alert.alert(
        'Equipo liberado',
        reporteFalla
          ? 'La estación se liberó y pasó a mantenimiento con tu reporte.'
          : 'Tu sesión finalizó correctamente.'
      );
      setReporteFalla(false);
      setDescripcionFalla('');
      fetchActiveSession();
    } catch (error) {
      Alert.alert('Error al liberar', error.message);
    } finally {
      setIsReleasing(false);
    }
  };

  const totalHours = Number(activeAssignment?.horasUso) || 2;
  const totalDurationSec = totalHours * 3600;
  const progressPct = Math.min(100, (elapsedSeconds / totalDurationSec) * 100);
  const remainingSec = Math.max(0, totalDurationSec - elapsedSeconds);
  const remH = Math.floor(remainingSec / 3600);
  const remM = Math.floor((remainingSec % 3600) / 60);

  return (
    <View style={styles.screen}>
      <TopHeader
        onSearchPress={() =>
          navigation.navigate('Laboratorios', {
            screen: 'LabsGrid',
            params: { openSearch: true },
          })
        }
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E10600" />
          <Text style={styles.loadingText}>Consultando tu sesión activa...</Text>
        </View>
      ) : !activeAssignment ? (
        <View style={styles.center}>
          <Ionicons name="desktop-outline" size={54} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Sin sesión activa</Text>
          <Text style={styles.emptySubtitle}>
            Ve a Laboratorios y elige una computadora disponible para iniciar tu sesión.
          </Text>
          <TouchableOpacity
            style={styles.goLabsButton}
            onPress={() => navigation.navigate('Laboratorios')}
          >
            <Text style={styles.goLabsText}>Explorar laboratorios</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>TU ESPACIO DE TRABAJO</Text>

          <View style={styles.activeBanner}>
            <View style={styles.bannerTitleRow}>
              <View style={styles.greenDot} />
              <Text style={styles.bannerTitle}>Tu sesión está en curso</Text>
            </View>
            <Text style={styles.bannerSub}>
              {activeAssignment.inicio
                ? `Inicio: ${new Date(activeAssignment.inicio).toLocaleString()}`
                : 'Sesión activa registrada'}
            </Text>
          </View>

          {/* Tarjeta 1: Estación y cronómetro */}
          <View style={styles.card}>
            <View style={styles.pcHeaderRow}>
              <View>
                <Text style={styles.pcTitle}>
                  {activeAssignment.pc || 'PC Asignada'}
                </Text>
                <Text style={styles.pcSub}>{activeAssignment.laboratorio}</Text>
              </View>
              <View style={styles.occupiedPill}>
                <View style={styles.redDot} />
                <Text style={styles.occupiedText}>OCUPADA</Text>
              </View>
            </View>

            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>TIEMPO TRANSCURRIDO</Text>
              <Text style={styles.timerValue}>{formatTimer(elapsedSeconds)}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
              <Text style={styles.timerFoot}>
                Te quedan {remH} h {remM} min de {totalHours} {totalHours === 1 ? 'hora' : 'horas'} asignadas
              </Text>
            </View>

            <Text style={styles.detailLabel}>Materia</Text>
            <Text style={styles.detailVal}>
              {activeAssignment.materia || 'Práctica de laboratorio'}
            </Text>

            <Text style={styles.detailLabel}>Duración asignada</Text>
            <Text style={styles.detailVal}>
              {totalHours} {totalHours === 1 ? 'hora' : 'horas'}
            </Text>

            <Text style={styles.detailLabel}>Usuario</Text>
            <Text style={styles.detailVal}>
              {activeAssignment.usuario || user?.nombre || 'Estudiante'}
            </Text>
          </View>

          {/* Tarjeta 2: Liberar equipo */}
          <View style={styles.card}>
            <Text style={styles.finishTitle}>¿Terminaste por hoy?</Text>
            <Text style={styles.finishSub}>
              Guarda tus archivos y cierra tus cuentas antes de liberar la estación.
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setReporteFalla((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkboxBox, reporteFalla && styles.checkboxChecked]}>
                {reporteFalla ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>Reportar una falla del equipo</Text>
            </TouchableOpacity>

            {reporteFalla ? (
              <View>
                <Text style={styles.fieldLabel}>Descripción de la falla *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Ej. El puerto USB frontal no reconoce mi memoria..."
                  placeholderTextColor="#94A3B8"
                  value={descripcionFalla}
                  onChangeText={setDescripcionFalla}
                  multiline
                  numberOfLines={4}
                />
                <Text style={styles.helperText}>
                  Visible al activar «Reportar una falla».
                </Text>

                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>
                    El equipo pasará a mantenimiento
                  </Text>
                  <Text style={styles.warningDesc}>
                    TI recibirá tu reporte al liberar la estación. No estará disponible hasta su revisión.
                  </Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.releaseButton, isReleasing && styles.buttonDisabled]}
              onPress={handleRelease}
              disabled={isReleasing}
            >
              {isReleasing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.releaseButtonText}>Liberar Equipo</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  loadingText: { marginTop: 10, color: '#64748B' },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 12 },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  goLabsButton: {
    backgroundColor: '#E10600',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goLabsText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  content: { padding: 16, paddingBottom: 32 },
  eyebrow: { fontSize: 11, fontWeight: '800', color: '#0F766E', marginBottom: 10 },
  activeBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  bannerTitle: { fontSize: 13, fontWeight: '800', color: '#047857' },
  bannerSub: { fontSize: 12, color: '#475569', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pcHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pcTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  pcSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  occupiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626' },
  occupiedText: { fontSize: 10, fontWeight: '800', color: '#B91C1C' },
  timerBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timerLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  timerValue: { fontSize: 34, fontWeight: '800', color: '#1E293B', marginVertical: 6 },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: '#0F766E', borderRadius: 4 },
  timerFoot: { fontSize: 11, color: '#64748B' },
  detailLabel: { fontSize: 11, color: '#64748B', marginTop: 10 },
  detailVal: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  finishTitle: { fontSize: 19, fontWeight: '800', color: '#1E293B' },
  finishSub: { fontSize: 12, color: '#64748B', marginTop: 4, marginBottom: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: { backgroundColor: '#E10600', borderColor: '#E10600' },
  checkboxLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    minHeight: 86,
    textAlignVertical: 'top',
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  helperText: { fontSize: 11, color: '#64748B', marginTop: 6, marginBottom: 12 },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: { fontSize: 12, fontWeight: '800', color: '#92400E', marginBottom: 3 },
  warningDesc: { fontSize: 11, color: '#92400E', lineHeight: 16 },
  releaseButton: {
    backgroundColor: '#E10600',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  releaseButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default ActiveSessionScreen;