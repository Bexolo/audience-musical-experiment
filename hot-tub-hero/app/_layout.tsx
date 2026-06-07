import "../global.css";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initDatabase } from "@/db/client";
import { configureNotifications } from "@/notifications";
import { useAppStore } from "@/store/useAppStore";

configureNotifications();

export default function RootLayout() {
  const ready = useAppStore((s) => s.ready);
  const waterBody = useAppStore((s) => s.waterBody);
  const load = useAppStore((s) => s.load);
  const router = useRouter();
  const segments = useSegments();

  // One-time bootstrap: create tables, then hydrate the store from SQLite.
  useEffect(() => {
    initDatabase();
    load();
  }, [load]);

  // Onboarding guard — no tub yet ⇒ force the setup wizard.
  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === "(onboarding)";
    if (!waterBody && !inOnboarding) {
      router.replace("/(onboarding)");
    } else if (waterBody && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [ready, waterBody, segments, router]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Slot />
    </SafeAreaProvider>
  );
}
