import { migration0001 } from "./0001_v0.2.1_normalize_file_extensions";

import type { Migration } from "./types";

export const migrations: Migration[] = [migration0001];

export { runMigrations } from "./runner";
