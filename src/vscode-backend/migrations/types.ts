import type { ExtensionContext } from "vscode";

export interface Migration {
  version: number;
  name: string;
  up: (context: ExtensionContext) => Promise<void>;
}
