// src/App.jsx
import React from "react";
import HomePage from "./pages/HomePage";
import Header from "./components/Header"; // Importa el Header
import { ThemeProvider } from "./context/ThemeContext"; // Importa el Provider

export const App = () => {
  return (
    // Envuelve todo con ThemeProvider
    <ThemeProvider>
      {/* Asegura que el fondo base respete el tema */}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Header /> {/* Añade el Header aquí */}
        <main>
          <HomePage />
        </main>
        {/* Podrías añadir un Footer aquí */}
      </div>
    </ThemeProvider>
  );
};
