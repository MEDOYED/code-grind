import * as path from "path";

import type { FileStat } from "@core/types";

import type { Migration } from "./types";

const STATS_STORAGE_KEY = "codeGrindStats";

export const migration0001: Migration = {
  version: 1,
  name: "0001_v0.2.1_normalize_file_extensions",
  up: async context => {
    const oldStats = context.globalState.get<
      Record<string, FileStat>
    >(STATS_STORAGE_KEY, {});
    const newStats: Record<string, FileStat> = {};

    for (const [key, stat] of Object.entries(oldStats)) {
      const normalizedExtension = path.extname(`file${key}`);

      if (!normalizedExtension) continue;

      if (!newStats[normalizedExtension]) {
        newStats[normalizedExtension] = {
          fileExtension: normalizedExtension,
          characters: 0,
          xp: 0,
        };
      }

      newStats[normalizedExtension].characters += stat.characters;
      newStats[normalizedExtension].xp += stat.xp;
    }

    await context.globalState.update(STATS_STORAGE_KEY, newStats);
  },
};
