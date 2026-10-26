import * as vscode from "vscode";

import type {
  FileStat,
  DailyStats,
  ExtensionToWebviewMessage,
  WebviewToExtensionMessage,
} from "@core/types";

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "codegrind.sidebarView";
  private _view?: vscode.WebviewView;

  private static readonly STORAGE_KEY = "codeGrindStats";

  constructor(private readonly _context: vscode.ExtensionContext) {
    // listen text changes
    vscode.workspace.onDidChangeTextDocument(event => {
      this._handleDocumentChange(event);
    });

    vscode.window.onDidChangeWindowState(windowState => {
      if (windowState.focused) {
        this._sendStatsToWebview();
      }
    });
  }

  private _handleDocumentChange(
    event: vscode.TextDocumentChangeEvent,
  ) {
    if (event.document.uri.scheme !== "file") {
      return;
    }

    if (event.document.fileName.includes("/.git/")) {
      return;
    }

    const fullPath = event.document.fileName;
    const fullPathArr = fullPath.split("/");
    const fileName = fullPathArr[fullPathArr.length - 1];
    const fileNameSplitOnEachDot = fileName.split(".");
    const fileExtensionsArr = fileNameSplitOnEachDot.slice(1);

    if (fileExtensionsArr.length === 0) {
      return;
    }

    const fileExtension = `.${fileExtensionsArr.join(".")}`;

    const firstChange = event.contentChanges[0];
    if (!firstChange) {
      return;
    }

    // ignore Backspace, Delete, Cut
    if (firstChange.text === "") {
      return;
    }

    // ignore Ctrl + Z, Ctrl + Y
    if (event.reason) {
      return;
    }

    const isEnter =
      firstChange.text.startsWith("\n") ||
      firstChange.text.startsWith("\r\n");
    if (firstChange.text.length > 2 && !isEnter) {
      return;
    }

    const stats = this._context.globalState.get<
      Record<string, FileStat>
    >(SidebarProvider.STORAGE_KEY, {});

    if (!stats[fileExtension]) {
      stats[fileExtension] = {
        fileExtension: fileExtension,
        characters: 0,
        xp: 0,
      };
    }

    stats[fileExtension].characters += 1;
    stats[fileExtension].xp += 1;

    // save to disk forever
    this._context.globalState.update(
      SidebarProvider.STORAGE_KEY,
      stats,
    );

    this._trackDailyCharacter();

    // send to React for UI updating;
    this._sendStatsToWebview();
  }

  private static readonly DAILY_STORAGE_KEY = "codeGrindDailyStats";

  private _trackDailyCharacter() {
    const today = getLocalDate();

    const dailyStats = this._context.globalState.get<DailyStats>(
      SidebarProvider.DAILY_STORAGE_KEY,
      {},
    );

    if (!dailyStats[today]) {
      dailyStats[today] = 0;
    }

    dailyStats[today] = dailyStats[today] + 1;

    this._context.globalState.update(
      SidebarProvider.DAILY_STORAGE_KEY,
      dailyStats,
    );
  }

  private _sendStatsToWebview() {
    if (this._view) {
      const stats = this._context.globalState.get<
        Record<string, FileStat>
      >(SidebarProvider.STORAGE_KEY, {});
      const dailyStats = this._context.globalState.get<DailyStats>(
        SidebarProvider.DAILY_STORAGE_KEY,
        {},
      );

      const message: ExtensionToWebviewMessage = {
        type: "UPDATE_STATS",
        stats: Object.values(stats),
        dailyStats,
      };

      this._view.webview.postMessage(message);
    }
  }

  // this method automaticly calls by vs code when sidebar revealing
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): Thenable<void> | void {
    this._view = webviewView;

    // confirm js scripts executing and give access only to dist folder;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._context.extensionUri, "dist"),
      ],
    };

    // set HTML-markup for webview
    // webviewView.webview.html = this._get
    webviewView.webview.html = this._getHtmlForWebview(
      webviewView.webview,
    );

    webviewView.webview.onDidReceiveMessage(
      (message: WebviewToExtensionMessage) => {
        if (message.type === "READY") {
          this._sendStatsToWebview();
        }
      },
    );
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Безпечне посилання на зібраний скрипт dist/webview.js
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._context.extensionUri,
        "dist",
        "webview.js",
      ),
    );

    // Безпечне посилання на зібрані стилі dist/webview.css (esbuild генерує їх з SCSS)
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._context.extensionUri,
        "dist",
        "webview.css",
      ),
    );

    // Невеликий випадковий рядок для Content Security Policy (захист від XSS)
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Політика безпеки: дозволяємо виконувати тільки наш скрипт зі згенерованим nonce -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <link href="${styleUri}" rel="stylesheet">
        <title>CodeGrind XP</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

// Функція для створення унікального токена nonce
function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(
      Math.floor(Math.random() * possible.length),
    );
  }
  return text;
}

function getLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
