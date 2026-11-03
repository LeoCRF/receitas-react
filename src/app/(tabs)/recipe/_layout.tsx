import { Stack } from 'expo-router';

export default function RecipeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 320,
        gestureEnabled: true,
      }}
    />
  );
}
