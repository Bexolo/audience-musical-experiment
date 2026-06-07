import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { generateScheduledTasks } from "@/domain/schedule-engine";
import { useAppStore } from "@/store/useAppStore";

/** YYYY-MM-DD key that react-native-calendars expects. */
function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function CalendarScreen() {
  const waterBody = useAppStore((s) => s.waterBody);
  const completions = useAppStore((s) => s.completions);
  const [selected, setSelected] = useState(dayKey(new Date().toISOString()));

  const { marked, tasksByDay } = useMemo(() => {
    const marked: Record<string, { marked: boolean; dotColor: string }> = {};
    const tasksByDay: Record<string, string[]> = {};
    if (!waterBody) return { marked, tasksByDay };
    for (const t of generateScheduledTasks(waterBody, completions)) {
      const key = dayKey(t.dueDate);
      marked[key] = {
        marked: true,
        dotColor: t.status === "overdue" ? "#e2493b" : "#0a7ea4",
      };
      (tasksByDay[key] ??= []).push(t.title);
    }
    return { marked, tasksByDay };
  }, [waterBody, completions]);

  const selectedTasks = tasksByDay[selected] ?? [];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Calendar
        markedDates={{
          ...marked,
          [selected]: { ...(marked[selected] ?? {}), selected: true, selectedColor: "#0a7ea4" },
        }}
        onDayPress={(d) => setSelected(d.dateString)}
        theme={{ todayTextColor: "#0a7ea4", arrowColor: "#0a7ea4" }}
      />
      <View className="p-4">
        <Text className="mb-2 text-lg font-bold text-gray-800">{selected}</Text>
        {selectedTasks.length === 0 ? (
          <Text className="text-gray-500">Nothing scheduled for this day.</Text>
        ) : (
          selectedTasks.map((title, i) => (
            <View key={i} className="mb-2 rounded-xl bg-white p-3">
              <Text className="text-base text-gray-800">• {title}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
