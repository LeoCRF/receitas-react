
import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const [user, setUser] = useState<any>(undefined);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (user === undefined) {
    return null;
  }

  const isLoggedIn = user !== null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#B85C38',
        tabBarInactiveTintColor: '#8B8179',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8DCCF',
          height: 65 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
          tabBarItemStyle: { flex: 1 },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              color={typeof color === 'number' || color === null ? undefined : color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarLabel: 'Favoritos',
          tabBarButton: isLoggedIn ? undefined : () => null,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              color={typeof color === 'number' || color === null ? undefined : color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="new_recipe"
        options={{
          title: 'Nova receita',
          tabBarLabel: 'Adicionar',
          tabBarButton: isLoggedIn ? undefined : () => null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="add-circle-outline"
              color={typeof color === 'number' || color === null ? undefined : color}
              size={size + 5}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: isLoggedIn ? 'Perfil' : 'Entrar',
          tabBarLabel: isLoggedIn ? 'Perfil' : 'Entrar',
          tabBarItemStyle: { flex: 1 },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={typeof color === 'number' || color === null ? undefined : color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="recipe"
        options={{
          tabBarButton: () => null,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
