import type { ActivityLevel } from "./types";

export const getActivityLevel = (
  symbolsCount: number,
): ActivityLevel => {
  if (symbolsCount === 0) return 0;
  if (symbolsCount < 500) return 1;
  if (symbolsCount < 1000) return 2;
  if (symbolsCount < 2500) return 3;
  return 4;
};
