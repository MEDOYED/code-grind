import type { ExtensionContext } from "vscode";

import { migrations } from "./index";

const STORAGE_VERSION_KEY = "codeGrindStorageVersion";

export const runMigrations = async (
  context: ExtensionContext,
): Promise<void> => {
  const currentVersion = context.globalState.get<number>(
    STORAGE_VERSION_KEY,
    0,
  );

  const pendingMigration = migrations
    .filter(m => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pendingMigration) {
    console.log(
      `Running migration ${migration.version}: ${migration.name}`,
    );
    await migration.up(context);
    await context.globalState.update(
      STORAGE_VERSION_KEY,
      migration.version,
    );
  }
};
