import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import logger from "./utils/logger";

// Registrar el service worker
let updateSW: (() => Promise<void>) | undefined;
registerSW({
  onNeedRefresh() {
    if (confirm("Nueva versión disponible. ¿Actualizar ahora?")) {
      updateSW?.();
    }
  },
  onOfflineReady() {
    logger.pwa("App lista para trabajar sin conexión");
  },
  onRegistered(registration) {
    if (registration?.update) {
      updateSW = async () => {
        await registration.update();
      };
    }
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
