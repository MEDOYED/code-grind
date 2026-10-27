export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export type HeatmapDay = {
  date: string;
  symbolsCount: number;
  activityLevel: ActivityLevel;
  isToday: boolean;
};
