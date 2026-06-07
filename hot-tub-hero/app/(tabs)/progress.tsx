import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { ACHIEVEMENTS } from "@/data/achievements";
import { buildDashboard } from "@/store/selectors";
import { useAppStore } from "@/store/useAppStore";

export default function Progress() {
  const waterBody = useAppStore((s) => s.waterBody);
  const completions = useAppStore((s) => s.completions);
  const waterTests = useAppStore((s) => s.waterTests);
  const unlocked = useAppStore((s) => s.unlockedAchievements);

  const dashboard = useMemo(
    () => buildDashboard({ waterBody, completions, waterTests }),
    [waterBody, completions, waterTests]
  );

  if (!dashboard) return null;
  const { streak, level, xp } = dashboard;
  const unlockedSet = new Set(unlocked);

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Level / XP */}
      <View className="rounded-3xl bg-white p-6">
        <Text className="text-sm font-semibold uppercase text-gray-400">Level {level.level}</Text>
        <Text className="mt-1 text-3xl font-extrabold text-brand-dark">{xp} XP</Text>
        <View className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-3 rounded-full bg-brand"
            style={{ width: `${Math.round(level.progress * 100)}%` }}
          />
        </View>
        <Text className="mt-1 text-xs text-gray-500">
          {level.xpIntoLevel} / {level.xpForNextLevel} XP to level {level.level + 1}
        </Text>
      </View>

      {/* Streaks */}
      <View className="mt-4 flex-row gap-4">
        <View className="flex-1 rounded-2xl bg-white p-4">
          <Text className="text-2xl">🔥</Text>
          <Text className="mt-1 text-2xl font-bold text-gray-800">{streak.current}</Text>
          <Text className="text-xs text-gray-500">current streak</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white p-4">
          <Text className="text-2xl">🏅</Text>
          <Text className="mt-1 text-2xl font-bold text-gray-800">{streak.longest}</Text>
          <Text className="text-xs text-gray-500">longest streak</Text>
        </View>
      </View>

      {/* Achievements */}
      <Text className="mb-2 mt-6 text-lg font-bold text-gray-800">
        Achievements ({unlockedSet.size}/{ACHIEVEMENTS.length})
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {ACHIEVEMENTS.map((a) => {
          const earned = unlockedSet.has(a.key);
          return (
            <View
              key={a.key}
              className={`mb-3 w-[48%] rounded-2xl p-4 ${earned ? "bg-white" : "bg-gray-100"}`}
            >
              <Text className="text-3xl" style={{ opacity: earned ? 1 : 0.3 }}>
                {a.emoji}
              </Text>
              <Text
                className={`mt-2 font-bold ${earned ? "text-gray-800" : "text-gray-400"}`}
              >
                {a.title}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">{a.description}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
