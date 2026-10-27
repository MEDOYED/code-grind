import "@shared/styles/colors/_dark.scss";
import "@shared/styles/colors/_light.scss";

import { App } from "./app/app";

import { createRoot } from "react-dom/client";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
