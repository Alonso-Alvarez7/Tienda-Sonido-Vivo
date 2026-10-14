import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.js";
import "./styles.css";

/**
 * BrowserRouter habilita la navegación mediante URLs.
 * AuthProvider comparte la sesión (usuario, login, logout) con toda la app.
 */
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);