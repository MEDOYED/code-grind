export interface FileStat {
  fileExtension: string;
  characters: number;
  xp: number;
}

// for future feature
// interface PlayerProfile {
//   totalXp: number; // sum all files extensions characters + streakXp + achievementXp
//   streakDays: number;
//   lastActiveDate: string;
// }

export type DailyStats = Record<string, number>;

export type ExtensionToWebviewMessage = {
  type: "UPDATE_STATS";
  stats: FileStat[];
  dailyStats: DailyStats;
};

export type WebviewToExtensionMessage = {
  type: "READY";
};
