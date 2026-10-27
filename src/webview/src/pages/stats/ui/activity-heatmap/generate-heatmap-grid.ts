import type { DailyStats } from "@core/types";
import { getLocalDate } from "@core/lib/date";

import type { HeatmapDay } from "./types";
import { getActivityLevel } from "./get-activity-level";

export const generateHeatmapGrid = (
  dailyStats: DailyStats,
): HeatmapDay[][] => {
  const weeksCount = 52;

  const result: HeatmapDay[][] = [];

  const now = new Date();

  const todayKey = getLocalDate();

  const currentDayOfWeek = now.getDay();
  const daysUntilSunday =
    currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;

  const endOfCurrentWeek = new Date();
  endOfCurrentWeek.setDate(now.getDate() + daysUntilSunday); // if today 2026-10-26 (monday) then endOfThisWeek (sunday) is 2026-11-01

  // calculate 52 weeks to back
  const currentDate = new Date(endOfCurrentWeek);
  currentDate.setDate(
    endOfCurrentWeek.getDate() - weeksCount * 7 + 1,
  ); // 52 weeks in 1 year, 7 days per week

  for (let w = 0; w < weeksCount; w++) {
    const week: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dateKey = getLocalDate(currentDate);
      const count = dailyStats[dateKey] || 0;

      week.push({
        date: dateKey,
        symbolsCount: count,
        activityLevel: getActivityLevel(count),
        isToday: dateKey === todayKey,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    result.push(week);
  }

  return result;
};
