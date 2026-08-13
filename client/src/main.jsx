// src/main.jsx
// This file was missing from the uploaded project — it's the actual entry
// point Vite loads (see index.html: <script src="/src/main.jsx">).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* AuthProvider must wrap everything — it decides if you're logged in
          and also applies the saved dark/light theme on first load. */}
      <AuthProvider>
        <App />
        <Toaster position="top-center" reverseOrder={false} />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
