import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SanitiserType } from "@/domain/types";
import { requestNotificationPermission } from "@/notifications";
import { useAppStore } from "@/store/useAppStore";

/**
 * Tub setup wizard. v1 only ships blow-up spas, so the type is fixed here, but
 * the field exists so adding pools later is a one-line change.
 */
export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const createTub = useAppStore((s) => s.createTub);

  const [name, setName] = useState("My Hot Tub");
  const [volume, setVolume] = useState("900");
  const [bathers, setBathers] = useState("2");
  const [sanitiser, setSanitiser] = useState<SanitiserType>("chlorine");

  async function finish() {
    await createTub({
      id: `tub_${Date.now()}`,
      name: name.trim() || "My Hot Tub",
      type: "blowup_spa",
      volumeLitres: Math.max(100, parseInt(volume, 10) || 900),
      sanitiser,
      dailyBathers: Math.max(1, parseInt(bathers, 10) || 2),
      inSeason: true,
      createdAt: new Date().toISOString(),
    });
    await requestNotificationPermission();
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24 }}
    >
      <Text className="text-3xl font-extrabold text-brand-dark">
        Welcome to Hot Tub Hero 🛁
      </Text>
      <Text className="mt-2 text-base text-gray-600">
        A few quick details and we'll build your personal care plan.
      </Text>

      <Field label="What's your tub called?">
        <TextInput
          value={name}
          onChangeText={setName}
          className="rounded-xl border border-gray-300 px-4 py-3 text-base"
          placeholder="My Hot Tub"
        />
      </Field>

      <Field label="Water volume (litres)">
        <TextInput
          value={volume}
          onChangeText={setVolume}
          keyboardType="number-pad"
          className="rounded-xl border border-gray-300 px-4 py-3 text-base"
          placeholder="900"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Check your tub's manual — most blow-up spas hold 600–1,000 L.
        </Text>
      </Field>

      <Field label="People using it per day">
        <TextInput
          value={bathers}
          onChangeText={setBathers}
          keyboardType="number-pad"
          className="rounded-xl border border-gray-300 px-4 py-3 text-base"
          placeholder="2"
        />
      </Field>

      <Field label="Which sanitiser will you use?">
        <View className="flex-row gap-3">
          {(["chlorine", "bromine"] as SanitiserType[]).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSanitiser(s)}
              className={`flex-1 rounded-xl border px-4 py-3 ${
                sanitiser === s
                  ? "border-brand bg-brand/10"
                  : "border-gray-300 bg-white"
              }`}
            >
              <Text
                className={`text-center text-base font-semibold capitalize ${
                  sanitiser === s ? "text-brand-dark" : "text-gray-700"
                }`}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
      </Field>

      <Pressable
        onPress={finish}
        className="mt-8 rounded-2xl bg-brand py-4 active:opacity-80"
      >
        <Text className="text-center text-lg font-bold text-white">
          Build my plan
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6">
      <Text className="mb-2 text-sm font-semibold text-gray-800">{label}</Text>
      {children}
    </View>
  );
}
