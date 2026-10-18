import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AppProviders } from "../providers/app-providers";
import { useSession } from "../auth/session-provider";

function RootNavigator() {
  const { session, loading } = useSession();
  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator accessibilityLabel="Restoring session" /></View>;
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Protected guard={!session}><Stack.Screen name="(auth)" /></Stack.Protected>
    <Stack.Protected guard={Boolean(session)}><Stack.Screen name="(app)" /></Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  return <AppProviders><RootNavigator /></AppProviders>;
}
