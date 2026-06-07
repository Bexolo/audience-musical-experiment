/**
 * Local notification scheduling.
 *
 * v1 uses only on-device scheduled notifications (no push server). We derive
 * fire times from the schedule engine: whenever completions change we cancel
 * everything and re-schedule the next occurrence of each pending task at its
 * due date + preferred time of day.
 */
import * as Notifications from "expo-notifications";
import { getScheduleTemplate } from "@/data/schedule-templates";
import { generateScheduledTasks } from "@/domain/schedule-engine";
import type { TaskCompletion, WaterBody } from "@/domain/types";

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Combines a due date (ISO date) with an "HH:mm" preferred time → Date. */
function fireTime(dueDateIso: string, preferredTime = "09:00"): Date {
  const d = new Date(dueDateIso);
  const [h, m] = preferredTime.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Cancels and rebuilds all scheduled notifications for the active water body.
 * Call after any completion, water test, or schedule-affecting change.
 */
export async function rescheduleAll(
  waterBody: WaterBody,
  completions: TaskCompletion[],
  now: Date = new Date()
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!waterBody.inSeason) return;

  const template = getScheduleTemplate(waterBody.type);
  const tasks = generateScheduledTasks(waterBody, completions, now);

  for (const task of tasks) {
    if (task.status === "done") continue;
    const def = template?.tasks.find((t) => t.key === task.templateKey);
    let when = fireTime(task.dueDate, def?.preferredTime);

    // Overdue or already-past time → nudge a minute out so it still fires.
    if (when.getTime() <= now.getTime()) {
      when = new Date(now.getTime() + 60_000);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🛁 ${task.title}`,
        body: def?.why ?? "Time for some hot tub care.",
        data: { templateKey: task.templateKey, waterBodyId: waterBody.id },
      },
      trigger: { date: when },
    });
  }
}
