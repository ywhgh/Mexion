import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { App } from "./App";
import { LangProvider } from "./lib/i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>,
);
