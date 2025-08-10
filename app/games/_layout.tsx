import { Stack } from 'expo-router';

export default function GamesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="blackjack" />
      <Stack.Screen name="roulette" />
      <Stack.Screen name="baccarat" />
    </Stack>
  );
}