import { useState, useEffect } from "react";

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
};

const vscode = typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : null;

interface FileStat {
  fileExtension: string;
  count: number;
}

export const App = () => {
  const [stats, setStats] = useState<FileStat[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      if (message.type === "UPDATE_STATS") {
        setStats(message.stats);
      }
    };

    window.addEventListener("message", handleMessage);

    vscode?.postMessage({ type: "READY" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div>
      <h1>Code Grind Stats</h1>

      {stats.length === 0 ? (
        <p>Start typind is some file...</p>
      ) : (
        <div>
          {stats.map((statItem) => (
            <div>
              <span>{statItem.fileExtension}</span>
              <span>{statItem.count} symbols</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
