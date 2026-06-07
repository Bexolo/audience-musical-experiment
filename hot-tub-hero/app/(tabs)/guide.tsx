import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { openProduct } from "@/affiliate/openProduct";
import { CHEMICALS } from "@/data/chemicals";
import { TOOLS } from "@/data/tools";
import type { ChemicalItem, ToolItem } from "@/data/catalogue";
import { AFFILIATE_DISCLOSURE } from "@/domain/affiliate";

type Section = "chemicals" | "tools";

export default function Guide() {
  const [section, setSection] = useState<Section>("chemicals");

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-4 flex-row rounded-2xl bg-gray-200 p-1">
        <Toggle label="Chemicals" active={section === "chemicals"} onPress={() => setSection("chemicals")} />
        <Toggle label="Tools" active={section === "tools"} onPress={() => setSection("tools")} />
      </View>

      {section === "chemicals" && (
        <>
          <Text className="mb-2 text-sm font-semibold text-gray-500">
            ⭐ Starter kit essentials are marked.
          </Text>
          {CHEMICALS.map((c) => (
            <ChemicalCard key={c.id} item={c} />
          ))}
        </>
      )}

      {section === "tools" && TOOLS.map((t) => <ToolCard key={t.id} item={t} />)}

      <Text className="mt-4 text-center text-xs text-gray-400">{AFFILIATE_DISCLOSURE}</Text>
    </ScrollView>
  );
}

function Toggle({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-xl py-2 ${active ? "bg-white" : ""}`}
    >
      <Text className={`text-center font-semibold ${active ? "text-brand-dark" : "text-gray-500"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function BuyButton({ asin }: { asin: string }) {
  return (
    <Pressable
      onPress={() => openProduct(asin)}
      className="mt-3 self-start rounded-full bg-accent px-4 py-2 active:opacity-80"
    >
      <Text className="font-bold text-white">View on Amazon ↗</Text>
    </Pressable>
  );
}

function ChemicalCard({ item }: { item: ChemicalItem }) {
  return (
    <View className="mb-3 rounded-2xl bg-white p-4">
      <View className="flex-row items-center">
        <Text className="flex-1 text-lg font-bold text-gray-800">{item.name}</Text>
        {item.essential && <Text className="text-xs font-bold text-accent">⭐ ESSENTIAL</Text>}
      </View>
      <Text className="mt-1 text-sm text-gray-600">{item.blurb}</Text>
      <Text className="mt-2 text-sm text-gray-700">
        <Text className="font-semibold">When: </Text>
        {item.whenToUse}
      </Text>
      <Text className="mt-1 text-xs text-bad">⚠️ {item.safety}</Text>
      <BuyButton asin={item.asin} />
    </View>
  );
}

function ToolCard({ item }: { item: ToolItem }) {
  return (
    <View className="mb-3 rounded-2xl bg-white p-4">
      <View className="flex-row items-center">
        <Text className="flex-1 text-lg font-bold text-gray-800">{item.name}</Text>
        {item.essential && <Text className="text-xs font-bold text-accent">⭐ ESSENTIAL</Text>}
      </View>
      <Text className="mt-1 text-sm text-gray-600">{item.blurb}</Text>
      <BuyButton asin={item.asin} />
    </View>
  );
}
