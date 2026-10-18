import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useSession } from "../../auth/session-provider";

export default function HomeScreen() {
  const { session, signOut } = useSession();
  return <SafeAreaView style={{ flex: 1 }}><View style={{ flex: 1, padding: 24, gap: 16 }}>
    <Text accessibilityRole="header" style={{ fontSize: 30, fontWeight: "700" }}>Native product shell</Text>
    <Text>Signed in as {session?.user.email ?? "member"}</Text>
    <Pressable accessibilityRole="button" onPress={signOut}><Text style={{ color: "#4338CA", fontWeight: "650" }}>Sign out</Text></Pressable>
  </View></SafeAreaView>;
}
