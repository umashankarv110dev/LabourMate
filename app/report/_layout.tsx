import { Stack } from "expo-router";

export default function ReportLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="attendance-detail" />
      <Stack.Screen name="worker" />
      <Stack.Screen name="worker-detail" />
      <Stack.Screen name="advance" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="site-cost" />
      <Stack.Screen name="site-cost-detail" />
    </Stack>
  );
}