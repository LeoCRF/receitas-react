
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#B85C38',
        tabBarInactiveTintColor: '#8B8179',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8DCCF',
          height: 65,
          paddingTop: 6,
          paddingBottom: 6,
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
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              color={typeof color === 'number' ? '#000000' : color ?? '#000000'}
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
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              color={typeof color === 'number' ? '#000000' : color ?? '#000000'}
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="add-circle-outline"
              color={typeof color === 'number' ? '#000000' : color ?? '#000000'}
              size={size + 5}
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
