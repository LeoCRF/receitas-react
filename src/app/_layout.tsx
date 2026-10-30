import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#B85C38',
        tabBarInactiveTintColor: '#8B8179',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8DCCF',
          height: 63,
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
        options={{ title: 'Início', tabBarLabel: 'Início' }}
      />


      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favoritos', tabBarLabel: 'Favoritos' }}
      />


      <Tabs.Screen
        name="new-recipe"
        options={{ title: 'Nova receita', tabBarLabel: 'Nova receita' }}
      />


      <Tabs.Screen
        name="recipe/[id]"
        options={{
          href: null,
          title: 'Detalhes da receita',
        }}
      />
    </Tabs>
  );
}