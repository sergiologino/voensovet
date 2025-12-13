import './index.css';
import React from "react";
import { render } from "react-dom";
import { App } from "./App";
import { initIframeResizer } from "./utils/iframeResize";

// Инициализируем автоматическую подстройку высоты для iframe
initIframeResizer();

render(<App />, document.getElementById("root"));