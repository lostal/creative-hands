import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { CartProvider } from "./context/CartContext.jsx";

// Registrar el service worker
let updateSW: ((reloadPage?: boolean | undefined) => Promise<void>) | undefined;
registerSW({
  onNeedRefresh() {
    if (confirm("Nueva versión disponible. ¿Actualizar ahora?")) {
      updateSW?.(true);
    }
  },
  onOfflineReady() {
    if (import.meta.env.DEV) {
      console.log("App lista para trabajar sin conexión");
    }
  },
  onRegistered(registration) {
    updateSW = registration?.update?.bind(registration);
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
);
