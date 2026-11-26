import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LabsGridScreen from '../screens/LabsGridScreen';
import AssignScreen from '../screens/AssignScreen';
import ActiveSessionScreen from '../screens/ActiveSessionScreen';
import ProfileScreen from '../screens/ProfileScreen';

const RootStack = createStackNavigator();
const AuthStackNav = createStackNavigator();
const AppStackNav = createStackNavigator();
const LabsStackNav = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder temporal para la pestaña C4 (Hito 3: Jue 26 - Lun 30 Nov)
const AdminPlaceholderScreen = () => (
  <View style={styles.center}>
    <Ionicons name="options-outline" size={44} color="#E10600" />
    <Text style={styles.placeholderTitle}>Panel Administración TI (C4)</Text>
    <Text style={styles.placeholderSub}>Disponible solo para rol ADMIN.</Text>
  </View>
);

const AuthStack = () => (
  <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
    <AuthStackNav.Screen name="Login" component={LoginScreen} />
    <AuthStackNav.Screen name="Register" component={RegisterScreen} />
  </AuthStackNav.Navigator>
);

const LabsStack = () => (
  <LabsStackNav.Navigator screenOptions={{ headerShown: false }}>
    <LabsStackNav.Screen name="LabsGrid" component={LabsGridScreen} />
    <LabsStackNav.Screen name="Assign" component={AssignScreen} />
  </LabsStackNav.Navigator>
);

const MainTabs = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E10600',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FDE8E8',
          borderTopColor: '#FAD2D2',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'grid-outline';
          if (route.name === 'Laboratorios') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Mi sesión') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Administración') {
            iconName = focused ? 'options' : 'options-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Laboratorios" component={LabsStack} />
      <Tab.Screen name="Mi sesión" component={ActiveSessionScreen} />
      {isAdmin ? (
        <Tab.Screen name="Administración" component={AdminPlaceholderScreen} />
      ) : null}
    </Tab.Navigator>
  );
};

const AuthenticatedStack = () => (
  <AppStackNav.Navigator>
    <AppStackNav.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <AppStackNav.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Mi Perfil',
        headerStyle: { backgroundColor: '#FDE8E8' },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </AppStackNav.Navigator>
);

const AppNavigator = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E10600" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {token == null ? (
        <RootStack.Screen name="Auth" component={AuthStack} />
      ) : (
        <RootStack.Screen name="App" component={AuthenticatedStack} />
      )}
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 10,
  },
  placeholderSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});

export default AppNavigator;