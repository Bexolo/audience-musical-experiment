import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { getTargets } from "@/data/targets";
import { dosingAdvice, LABEL_DISCLAIMER } from "@/domain/dosing";
import { AFFILIATE_DISCLOSURE } from "@/domain/affiliate";
import { useAppStore } from "@/store/useAppStore";

export default function Settings() {
  const waterBody = useAppStore((s) => s.waterBody);
  const addTest = useAppStore((s) => s.addTest);

  const [sanitiserPpm, setSanitiser] = useState("");
  const [ph, setPh] = useState("");
  const [alkalinity, setAlkalinity] = useState("");

  if (!waterBody) return null;

  async function saveTest() {
    const test = {
      takenAt: new Date().toISOString(),
      sanitiserPpm: parseFloat(sanitiserPpm) || 0,
      ph: parseFloat(ph) || 0,
      alkalinityPpm: parseFloat(alkalinity) || 0,
    };
    await addTest(test);

    const targets = getTargets(waterBody!.type, waterBody!.sanitiser);
    const advice = dosingAdvice(
      { ...test, waterBodyId: waterBody!.id },
      targets,
      waterBody!.volumeLitres,
      waterBody!.sanitiser
    );
    const lines = advice
      .map((a) => (a.grams > 0 ? `${a.label}: add ~${a.grams} g — ${a.message}` : `${a.label}: ${a.message}`))
      .join("\n\n");
    Alert.alert("Test saved 💧", `${lines}\n\n${LABEL_DISCLAIMER}`);
    setSanitiser("");
    setPh("");
    setAlkalinity("");
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Tub summary */}
      <View className="rounded-2xl bg-white p-4">
        <Text className="text-lg font-bold text-gray-800">{waterBody.name}</Text>
        <Text className="mt-1 text-sm text-gray-600">
          {waterBody.volumeLitres} L · {waterBody.sanitiser} · {waterBody.dailyBathers} bathers/day
        </Text>
      </View>

      {/* Log a water test */}
      <Text className="mb-2 mt-6 text-lg font-bold text-gray-800">Log a water test</Text>
      <View className="rounded-2xl bg-white p-4">
        <NumberField label={`${waterBody.sanitiser} (ppm)`} value={sanitiserPpm} onChange={setSanitiser} />
        <NumberField label="pH" value={ph} onChange={setPh} />
        <NumberField label="Total alkalinity (ppm)" value={alkalinity} onChange={setAlkalinity} />
        <Pressable onPress={saveTest} className="mt-2 rounded-xl bg-brand py-3 active:opacity-80">
          <Text className="text-center font-bold text-white">Save & get advice</Text>
        </Pressable>
      </View>

      {/* Disclaimers */}
      <View className="mt-6 rounded-2xl bg-amber-50 p-4">
        <Text className="text-sm font-semibold text-amber-900">Safety first</Text>
        <Text className="mt-1 text-xs text-amber-800">
          Hot Tub Hero gives general guidance only — it isn't professional advice. Always read and
          follow your chemical product labels, never mix chemicals, and keep them away from children.
        </Text>
      </View>

      <Text className="mt-4 text-center text-xs text-gray-400">{AFFILIATE_DISCLOSURE}</Text>
      <Text className="mt-2 text-center text-xs text-gray-300">Hot Tub Hero v0.1.0</Text>
    </ScrollView>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium capitalize text-gray-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        className="rounded-xl border border-gray-300 px-4 py-3 text-base"
        placeholder="0"
      />
    </View>
  );
}
