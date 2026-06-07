import { Text } from "react-native";
import { Tabs } from "expo-router";

/** Emoji tab icons keep v1 dependency-light; swap for a vector icon set later. */
function icon(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0a7ea4" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800" },
        tabBarActiveTintColor: "#0a7ea4",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Today", tabBarIcon: icon("🛁") }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: "Calendar", tabBarIcon: icon("📅") }}
      />
      <Tabs.Screen
        name="guide"
        options={{ title: "Guide", tabBarIcon: icon("🧪") }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: "Progress", tabBarIcon: icon("🏆") }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarIcon: icon("⚙️") }}
      />
    </Tabs>
  );
}
