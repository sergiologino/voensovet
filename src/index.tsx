import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initIframeResizer } from "./utils/iframeResize";
import { PageTracker } from "./components/PageTracker";

// Инициализируем автоматическую подстройку высоты для iframe
initIframeResizer();

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
      <PageTracker />
    </React.StrictMode>
  );
}