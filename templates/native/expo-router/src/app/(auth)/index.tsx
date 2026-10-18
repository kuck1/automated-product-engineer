import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useSession } from "../../auth/session-provider";

export default function SignInScreen() {
  const { signInWithGoogle } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function signIn() {
    setPending(true); setError(null);
    try { await signInWithGoogle(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign in failed."); }
    finally { setPending(false); }
  }
  return <SafeAreaView style={{ flex: 1 }}><View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}>
    <Text accessibilityRole="header" style={{ fontSize: 34, fontWeight: "700" }}>Continue your work</Text>
    <Text style={{ fontSize: 17, lineHeight: 24 }}>Your session, workspace, and pending changes follow you across devices.</Text>
    <Pressable accessibilityRole="button" disabled={pending} onPress={signIn} style={{ minHeight: 52, borderRadius: 14, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "white", fontSize: 17, fontWeight: "650" }}>{pending ? "Opening Google…" : "Continue with Google"}</Text>
    </Pressable>
    {error ? <Text accessibilityRole="alert" style={{ color: "#B42318" }}>{error}</Text> : null}
  </View></SafeAreaView>;
}
