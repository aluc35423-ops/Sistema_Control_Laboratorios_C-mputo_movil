import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TopHeader = ({ simple = false, onSearchPress, onProfilePress }) => {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.header, simple && styles.headerCentered]}>
        {/* Reemplaza este View por <Image source={require('../../assets/utr-logo.png')} style={styles.logoImg} /> cuando agregues el PNG */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>UTR</Text>
        </View>

        {!simple ? (
          <>
            <TouchableOpacity
              onPress={onSearchPress}
              disabled={!onSearchPress}
              style={styles.iconButton}
            >
              <Ionicons name="search-outline" size={24} color="#1E293B" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onProfilePress}
              disabled={!onProfilePress}
              style={styles.iconButton}
            >
              <Ionicons name="person-circle-outline" size={32} color="#E10600" />
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FDE8E8',
  },
  header: {
    height: 60,
    backgroundColor: '#FDE8E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#FAD2D2',
  },
  headerCentered: {
    justifyContent: 'center',
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#B91C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconButton: {
    padding: 4,
  },
});

export default TopHeader;