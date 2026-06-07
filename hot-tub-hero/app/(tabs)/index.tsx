import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { HealthBand } from "@/domain/health-score";
import type { ScheduledTask } from "@/domain/types";
import { buildDashboard } from "@/store/selectors";
import { useAppStore } from "@/store/useAppStore";

const BAND_COLOR: Record<HealthBand, string> = {
  great: "text-good",
  ok: "text-warn",
  attention: "text-bad",
};

const BAND_LABEL: Record<HealthBand, string> = {
  great: "Looking great!",
  ok: "Needs a little love",
  attention: "Needs attention",
};

export default function Today() {
  const waterBody = useAppStore((s) => s.waterBody);
  const completions = useAppStore((s) => s.completions);
  const waterTests = useAppStore((s) => s.waterTests);
  const completeTask = useAppStore((s) => s.completeTask);

  const dashboard = useMemo(
    () => buildDashboard({ waterBody, completions, waterTests }),
    [waterBody, completions, waterTests]
  );

  if (!waterBody || !dashboard) return null;
  const { health, streak, level, tasks } = dashboard;
  const due = tasks.filter((t) => t.status !== "done");

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Water Health Score */}
      <View className="items-center rounded-3xl bg-white p-6 shadow-sm">
        <Text className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Water Health
        </Text>
        <Text className={`mt-1 text-6xl font-extrabold ${BAND_COLOR[health.band]}`}>
          {health.score}
        </Text>
        <Text className={`text-base font-semibold ${BAND_COLOR[health.band]}`}>
          {BAND_LABEL[health.band]}
        </Text>
        {!health.hasTest && (
          <Text className="mt-2 text-center text-xs text-gray-500">
            Log a water test to unlock your true score.
          </Text>
        )}
      </View>

      {/* Streak + level strip */}
      <View className="mt-4 flex-row gap-4">
        <Stat emoji="🔥" value={`${streak.current}`} label="day streak" />
        <Stat emoji="⭐" value={`Lvl ${level.level}`} label={`${level.xpIntoLevel}/${level.xpForNextLevel} XP`} />
      </View>
      {streak.atRisk && (
        <Text className="mt-2 text-center text-sm font-medium text-warn">
          ⚠️ Do a task today to keep your {streak.current}-day streak alive!
        </Text>
      )}

      {/* Today's tasks */}
      <Text className="mb-2 mt-6 text-lg font-bold text-gray-800">
        Today's tasks {due.length > 0 ? `(${due.length})` : ""}
      </Text>
      {due.length === 0 ? (
        <View className="rounded-2xl bg-white p-6">
          <Text className="text-center text-base text-gray-500">
            All caught up! 🎉 Nothing due right now.
          </Text>
        </View>
      ) : (
        due.map((task) => (
          <TaskRow key={task.templateKey} task={task} onComplete={completeTask} />
        ))
      )}
    </ScrollView>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4">
      <Text className="text-2xl">{emoji}</Text>
      <Text className="mt-1 text-xl font-bold text-gray-800">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}

function TaskRow({
  task,
  onComplete,
}: {
  task: ScheduledTask;
  onComplete: (key: string) => void;
}) {
  const overdue = task.status === "overdue";
  return (
    <View
      className={`mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${
        overdue ? "border-bad/40 bg-bad/5" : "border-gray-100 bg-white"
      }`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-base font-semibold text-gray-800">{task.title}</Text>
        <Text className={`text-xs ${overdue ? "text-bad" : "text-gray-400"}`}>
          {overdue ? "Overdue" : "Due today"}
        </Text>
      </View>
      <Pressable
        onPress={() => onComplete(task.templateKey)}
        className="rounded-full bg-brand px-5 py-2 active:opacity-80"
      >
        <Text className="font-bold text-white">Done</Text>
      </Pressable>
    </View>
  );
}
