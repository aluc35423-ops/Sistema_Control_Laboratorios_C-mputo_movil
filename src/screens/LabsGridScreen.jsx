import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { apiFetch } from '../services/api';

const STATUS_THEMES = {
  DISPONIBLE: {
    cardBg: '#FFFFFF',
    cardBorder: '#D1FAE5',
    iconColor: '#0F766E',
    pillBg: '#ECFDF5',
    pillText: '#047857',
    dotColor: '#10B981',
  },
  OCUPADA: {
    cardBg: '#FDECEC',
    cardBorder: '#FBCACA',
    iconColor: '#64748B',
    pillBg: '#FFF5F5',
    pillText: '#B91C1C',
    dotColor: '#DC2626',
  },
  MANTENIMIENTO: {
    cardBg: '#FEF6A8',
    cardBorder: '#FDE047',
    iconColor: '#B45309',
    pillBg: '#FFFBEB',
    pillText: '#92400E',
    dotColor: '#B45309',
  },
};

const padTwo = (num) => String(num).padStart(2, '0');

const LabsGridScreen = ({ navigation, route }) => {
  const [computers, setComputers] = useState([]);
  const [labs, setLabs] = useState(['Todos']);
  const [selectedLab, setSelectedLab] = useState('Todos');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route?.params?.openSearch) {
      setSearchVisible(true);
      navigation.setParams({ openSearch: false });
    }
  }, [route?.params?.openSearch, navigation]);

  const fetchComputers = async (labFilter = 'Todos') => {
    setLoading(true);
    try {
      const query =
        labFilter !== 'Todos' ? `?laboratorio=${encodeURIComponent(labFilter)}` : '';
      const data = await apiFetch(`/api/labs/computers${query}`);
      const list = Array.isArray(data) ? data : data?.computers || data?.data || [];
      setComputers(list);

      if (labFilter === 'Todos') {
        const uniqueLabs = [...new Set(list.map((pc) => pc.laboratorio).filter(Boolean))];
        setLabs(['Todos', ...uniqueLabs]);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComputers(selectedLab);
    }, [selectedLab])
  );

  const handleToggleSearch = () => {
    setSearchVisible((prev) => {
      if (prev) setSearchQuery('');
      return !prev;
    });
  };

  const handleSelectLab = (lab) => {
    setSelectedLab(lab);
    fetchComputers(lab);
  };

  const handleSelect = (computer) => {
    if (computer.estatus !== 'DISPONIBLE') {
      Alert.alert(
        'Estación no disponible',
        `Esta PC se encuentra actualmente en estatus: ${computer.estatus}.`
      );
      return;
    }
    navigation.navigate('Assign', { computer });
  };

  const computersWithLabel = computers.map((pc, idx) => ({
    ...pc,
    _pcLabel: `PC-${padTwo(idx + 1)}`,
  }));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredComputers = normalizedQuery
    ? computersWithLabel.filter((pc) => {
        const inventario = (pc.numeroInventario || pc.numerolnventario || '').toLowerCase();
        const lab = (pc.laboratorio || '').toLowerCase();
        const specs = (pc.especificaciones || '').toLowerCase();
        const estatus = (pc.estatus || '').toLowerCase();
        const label = pc._pcLabel.toLowerCase();
        return (
          inventario.includes(normalizedQuery) ||
          lab.includes(normalizedQuery) ||
          specs.includes(normalizedQuery) ||
          estatus.includes(normalizedQuery) ||
          label.includes(normalizedQuery)
        );
      })
    : computersWithLabel;

  const disponiblesCount = filteredComputers.filter((c) => c.estatus === 'DISPONIBLE').length;
  const ocupadasCount = filteredComputers.filter((c) => c.estatus === 'OCUPADA').length;
  const manttoCount = filteredComputers.filter((c) => c.estatus === 'MANTENIMIENTO').length;

  const renderHeader = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.labFilterRow}
      >
        {labs.map((lab) => {
          const active = selectedLab === lab;
          return (
            <TouchableOpacity
              key={lab}
              style={[styles.labChip, active && styles.labChipActive]}
              onPress={() => handleSelectLab(lab)}
            >
              <Text style={[styles.labChipText, active && styles.labChipTextActive]}>
                {lab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNumber, { color: '#047857' }]}>
            {padTwo(disponiblesCount)}
          </Text>
          <Text style={styles.kpiLabel}>Disponibles</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNumber, { color: '#B91C1C' }]}>
            {padTwo(ocupadasCount)}
          </Text>
          <Text style={styles.kpiLabel}>Ocupadas</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNumber, { color: '#B45309' }]}>
            {padTwo(manttoCount)}
          </Text>
          <Text style={styles.kpiLabel}>Mantenimiento</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const theme = STATUS_THEMES[item.estatus] || STATUS_THEMES.MANTENIMIENTO;
    const inventario = item.numeroInventario || item.numerolnventario || `INV-${item.id}`;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <Ionicons name="desktop-outline" size={20} color={theme.iconColor} />
          <Text style={styles.pcTitle}>{item._pcLabel}</Text>
        </View>

        <Text style={styles.invText} numberOfLines={1}>
          INV · {inventario}
        </Text>
        <Text style={styles.labSmall} numberOfLines={1}>
          {item.laboratorio}
        </Text>
        <Text style={styles.specsText} numberOfLines={2}>
          {item.especificaciones || 'Sin especificaciones'}
        </Text>

        <View style={[styles.statusPill, { backgroundColor: theme.pillBg }]}>
          <View style={[styles.statusDot, { backgroundColor: theme.dotColor }]} />
          <Text style={[styles.statusText, { color: theme.pillText }]}>
            {item.estatus}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <TopHeader
        onSearchPress={handleToggleSearch}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {searchVisible ? (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar PC, inventario, lab o specs..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity onPress={handleToggleSearch} style={styles.cancelSearchBtn}>
            <Text style={styles.cancelSearchText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E10600" />
          <Text style={styles.loadingText}>Cargando equipos de laboratorio...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComputers}
          keyExtractor={(item) => String(item.id || item._id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {normalizedQuery
                ? `No hay resultados para "${searchQuery}".`
                : 'No se encontraron equipos registrados.'}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F8' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  cancelSearchBtn: { paddingVertical: 4 },
  cancelSearchText: { fontSize: 13, fontWeight: '700', color: '#E10600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B', fontSize: 14 },
  listContent: { paddingHorizontal: 14, paddingBottom: 24 },
  labFilterRow: { paddingTop: 14, paddingBottom: 6, gap: 8 },
  labChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
  },
  labChipActive: {
    backgroundColor: '#E10600',
    borderColor: '#E10600',
  },
  labChipText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  labChipTextActive: { color: '#FFFFFF' },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 16,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FDE8E8',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FAD2D2',
  },
  kpiNumber: { fontSize: 26, fontWeight: '800', marginBottom: 2 },
  kpiLabel: { fontSize: 11, color: '#475569', fontWeight: '600' },
  gridRow: { justifyContent: 'space-between' },
  card: {
    width: '48.5%',
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pcTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  invText: { fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 2 },
  labSmall: { fontSize: 11, fontWeight: '700', color: '#0F766E', marginBottom: 4 },
  specsText: { fontSize: 11, color: '#334155', lineHeight: 15, marginBottom: 10 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#64748B' },
});

export default LabsGridScreen;